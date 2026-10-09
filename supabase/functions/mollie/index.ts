// Edge Function "mollie": betalen, opzeggen en herroepen via Mollie (eerst in testmodus).
// Zetten via de Supabase-editor, met JWT-controle AAN. SQL: supabase/mollie.sql (na abonnementen.sql en herroepen.sql).
// De sleutel staat alleen in Supabase (Edge Functions, Secrets: MOLLIE_API_KEY, eerst een test_-sleutel).
// Er gaat geen naam of e-mailadres naar Mollie: de klant krijgt alleen het gebruikers-id als metadata.
// Nooit de sleutel of persoonsgegevens loggen, alleen statuscodes.
//
// Aanroepen vanuit de pagina: BES.auth.client.functions.invoke('mollie', { body: { actie, ... } })
//   { actie: 'start', plan: 'plus' | 'pro', meteen: true }  -> { url }  (naar de betaalpagina van Mollie)
//   { actie: 'opzeggen' }                                  -> { ok: true, geldig_tot }
//   { actie: 'herroepen' }                                 -> { ok: true, terug, herroepen_op, plan }  of  { ok: false, reden, fout }
//                                                             onvolledig: true als stoppen of terugbetalen bij Mollie niet helemaal lukte
// Fouten: { fout: 'Nederlandse melding', reden? } met status 4xx of 5xx.
import { createClient } from 'npm:@supabase/supabase-js@2';

const TOEGESTAAN = ['https://beriesexamspace.com', 'http://localhost:4477', 'http://localhost:4491'];
const MOLLIE = 'https://api.mollie.com/v2';
// Prijzen per maand, inclusief btw.
const PRIJS: Record<string, string> = { plus: '2.99', pro: '9.99' };
const NAAM: Record<string, string> = { plus: 'Plus', pro: 'Pro' };
const DAG = 24 * 60 * 60 * 1000;

// deno-lint-ignore no-explicit-any
type Obj = Record<string, any>;

const kop = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin && TOEGESTAAN.includes(origin) ? origin : TOEGESTAAN[0],
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
  Vary: 'Origin',
});

// Eén aanroep naar de Mollie API. status 0 = Mollie niet bereikbaar of geen sleutel.
// eenmalig: Idempotency-Key bij een POST. Dezelfde aanvraag met dezelfde sleutel binnen een uur doet Mollie maar één keer.
async function mollie(pad: string, methode = 'GET', inhoud?: unknown, eenmalig?: string): Promise<{ status: number; ok: boolean; data: Obj | null }> {
  const sleutel = Deno.env.get('MOLLIE_API_KEY');
  if (!sleutel) return { status: 0, ok: false, data: null };
  let r: Response;
  try {
    r = await fetch(MOLLIE + pad, {
      method: methode,
      headers: {
        Authorization: `Bearer ${sleutel}`,
        ...(inhoud ? { 'Content-Type': 'application/json' } : {}),
        ...(eenmalig ? { 'Idempotency-Key': eenmalig } : {}),
      },
      body: inhoud ? JSON.stringify(inhoud) : undefined,
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return { status: 0, ok: false, data: null };
  }
  let data: Obj | null = null;
  try { data = r.status === 204 ? null : await r.json(); } catch { data = null; }
  return { status: r.status, ok: r.ok, data };
}

const euro = (centen: number) => (Math.max(0, Math.round(centen)) / 100).toFixed(2);
const centen = (waarde: unknown) => Math.round(Number(waarde ?? 0) * 100) || 0;

// Abonnement bij Mollie stopzetten. Al gestopt of niet (meer) te vinden telt als gelukt.
async function stopAbonnement(klant: string, abonnement: string): Promise<boolean> {
  const r = await mollie(`/customers/${encodeURIComponent(klant)}/subscriptions/${encodeURIComponent(abonnement)}`, 'DELETE');
  if (r.ok || r.status === 404 || r.status === 410) return true;
  if (r.status === 422) {
    const nu = await mollie(`/customers/${encodeURIComponent(klant)}/subscriptions/${encodeURIComponent(abonnement)}`);
    return nu.status === 404 || ['canceled', 'completed'].includes(String(nu.data?.status));
  }
  console.error('mollie: abonnement stoppen mislukt', r.status);
  return false;
}

Deno.serve(async (req) => {
  const headers = kop(req.headers.get('Origin'));
  const antwoord = (inhoud: unknown, status = 200) => new Response(JSON.stringify(inhoud), { status, headers });
  const fout = (status: number, tekst: string, reden?: string) => antwoord(reden ? { fout: tekst, reden } : { fout: tekst }, status);
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return fout(405, 'Deze methode kan niet.');

  const url = Deno.env.get('SUPABASE_URL');
  const dienstSleutel = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SECRET_KEY');
  const anonSleutel = Deno.env.get('SUPABASE_ANON_KEY');
  const site = (Deno.env.get('SITE_URL') || 'https://beriesexamspace.com/').replace(/\/?$/, '/');
  if (!url || !dienstSleutel || !anonSleutel) return fout(500, 'De betaling is nog niet goed ingesteld.', 'config');
  if (!Deno.env.get('MOLLIE_API_KEY')) return fout(500, 'De betaling is nog niet goed ingesteld.', 'geen-sleutel');

  const beheer = createClient(url, dienstSleutel, { auth: { persistSession: false } });
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: { user } } = await beheer.auth.getUser(token);
  if (!user) return fout(401, 'Log eerst in.', 'niet-ingelogd');
  // Als de student zelf (met zijn eigen sessie), voor mijn_abonnement. Opzeggen en herroepen gaan via mollie_zeg_op en
  // mollie_herroep (service role), want zeg_op en herroep weigeren een account dat via Mollie betaalt.
  const student = createClient(url, anonSleutel, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  let body: Obj = {};
  try { body = await req.json(); } catch { return fout(400, 'Er ging iets mis met je aanvraag.', 'invoer'); }
  const actie = String(body?.actie ?? '');

  // ---- Start: klant bij Mollie, eerste betaling (machtiging), terug naar abonnement.html. ----
  if (actie === 'start') {
    const { data: aan } = await beheer.rpc('betalen_aan');
    if (aan !== true) return fout(403, 'Betalen staat nog niet aan.', 'betalen_uit');
    const plan = String(body?.plan ?? '');
    if (!(plan in PRIJS)) return fout(400, 'Onbekend plan.', 'onbekend_plan');
    if (body?.meteen !== true) return fout(400, 'Zet eerst het vinkje "Laat mijn plan meteen starten" aan.', 'meteen_nodig');

    const { data: mag, error: magFout } = await beheer.rpc('mollie_mag_starten', { p_user: user.id, p_plan: plan });
    if (magFout || !mag) return fout(500, 'Dat lukte niet. Probeer het zo opnieuw.', 'database');
    if (!mag.ok) {
      const tekst = ({
        al_actief: `Je hebt ${NAAM[plan]} al.`,
        al_hoger: 'Je hebt Pro al, en daar zit alles van Plus in.',
      } as Record<string, string>)[mag.reden] ?? 'Dat lukte niet. Probeer het zo opnieuw.';
      return fout(409, tekst, mag.reden);
    }

    // Loopt er voor dit plan nog een abonnement bij Mollie (bijvoorbeeld een maandbetaling die nog onderweg is)?
    let klant: string | null = mag.klant_id ?? null;
    if (klant && mag.abonnement_id && mag.abonnement_plan === plan) {
      const sub = await mollie(`/customers/${encodeURIComponent(klant)}/subscriptions/${encodeURIComponent(mag.abonnement_id)}`);
      if (sub.ok && ['active', 'pending'].includes(String(sub.data?.status))) {
        return fout(409, `Je abonnement op ${NAAM[plan]} loopt nog. Je betaling wordt nog verwerkt; kijk later op je profiel.`, 'loopt_nog');
      }
    }

    // Klant bij Mollie: hergebruiken als hij nog bestaat (een klant uit testmodus bestaat niet bij de echte sleutel).
    if (klant) {
      const bestaand = await mollie(`/customers/${encodeURIComponent(klant)}`);
      if (bestaand.status === 404 || bestaand.status === 410) klant = null;
      else if (!bestaand.ok) return fout(502, 'Mollie is nu niet bereikbaar. Probeer het zo opnieuw.', 'mollie');
    }
    if (!klant) {
      const nieuw = await mollie('/customers', 'POST', { metadata: { user_id: user.id } });
      if (!nieuw.ok || !nieuw.data?.id) {
        console.error('mollie: klant maken mislukt', nieuw.status);
        return fout(502, 'Mollie is nu niet bereikbaar. Probeer het zo opnieuw.', 'mollie');
      }
      klant = String(nieuw.data.id);
      const { error } = await beheer.from('mollie_koppeling').upsert(
        { user_id: user.id, klant_id: klant, mandaat_id: null, abonnement_id: null, bijgewerkt: new Date().toISOString() },
        { onConflict: 'user_id' },
      );
      if (error) return fout(500, 'Dat lukte niet. Probeer het zo opnieuw.', 'database');
    }

    const proef = mag.proef === true;
    // 0,02 euro: het minimum van Bancontact (iDEAL en kaart kunnen al vanaf 0,01). Anders toont Mollie geen Bancontact.
    const bedrag = proef ? '0.02' : PRIJS[plan];
    const betaling = await mollie('/payments', 'POST', {
      amount: { currency: 'EUR', value: bedrag },
      description: proef ? `Berie's Exam Space ${NAAM[plan]}, proefmaand (machtiging)` : `Berie's Exam Space ${NAAM[plan]}, eerste maand`,
      redirectUrl: `${site}abonnement.html?betaling=terug&plan=${plan}`,
      webhookUrl: `${url}/functions/v1/mollie-webhook`,
      sequenceType: 'first',
      customerId: klant,
      locale: 'nl_BE',
      metadata: { user_id: user.id, plan, meteen: true, proef },
    });
    const checkout = betaling.data?._links?.checkout?.href;
    if (!betaling.ok || !betaling.data?.id || !checkout) {
      console.error('mollie: betaling maken mislukt', betaling.status);
      return fout(502, 'De betaling kon niet starten. Probeer het zo opnieuw.', 'mollie');
    }
    const { error: rijFout } = await beheer.from('betalingen').upsert({
      id: String(betaling.data.id), user_id: user.id, plan, soort: 'eerste', bedrag: Number(bedrag), valuta: 'EUR',
      status: String(betaling.data.status ?? 'open'), bijgewerkt: new Date().toISOString(),
    }, { onConflict: 'id' });
    // Niet erg: de webhook schrijft de rij ook.
    if (rijFout) console.error('mollie: rij in betalingen niet bewaard');
    return antwoord({ url: String(checkout) });
  }

  // ---- Opzeggen: eerst het abonnement bij Mollie stoppen, dan opzeggen (mollie_zeg_op). Je houdt je plan tot de einddatum. ----
  if (actie === 'opzeggen') {
    const { data: k } = await beheer.from('mollie_koppeling').select('klant_id, abonnement_id').eq('user_id', user.id).maybeSingle();
    let gestopt = false;
    if (k?.klant_id && k?.abonnement_id) {
      if (!(await stopAbonnement(k.klant_id, k.abonnement_id))) {
        return fout(502, 'Opzeggen bij Mollie lukte niet. Probeer het zo opnieuw.', 'mollie');
      }
      gestopt = true;
    }
    const { data, error } = await beheer.rpc('mollie_zeg_op', { p_user: user.id });
    if (error || !data) return fout(500, 'Opzeggen lukte niet. Probeer het zo opnieuw.', 'database');
    if (data.ok) return antwoord({ ok: true, geldig_tot: data.geldig_tot ?? null });
    if (gestopt) {
      const { data: nu } = await student.rpc('mijn_abonnement');
      return antwoord({ ok: true, geldig_tot: nu?.geldig_tot ?? null });
    }
    return fout(409, 'Je hebt geen abonnement om op te zeggen.', 'niets_op_te_zeggen');
  }

  // ---- Herroepen binnen de bedenktijd: eerst het abonnement bij Mollie stoppen, dan herroepen (plan stopt meteen),
  // dan de rest terugbetalen. Lukt het stoppen niet, dan wordt er niet herroepen en kan de student het opnieuw proberen.
  // Is er al herroepen maar ging bij Mollie iets mis, dan doet een nieuwe aanroep alleen het stoppen en terugbetalen opnieuw. ----
  if (actie === 'herroepen') {
    const { data: info, error: infoFout } = await beheer.rpc('mollie_herroep_info', { p_user: user.id });
    if (infoFout || !info) return fout(500, 'Herroepen lukte niet. Probeer het zo opnieuw.', 'database');
    const weigering = (reden: string) => antwoord({
      ok: false,
      reden,
      // Zelfde vorm als de rpc herroep, zodat de pagina dezelfde meldingen kan tonen.
      fout: reden === 'bedenktijd_voorbij'
        ? 'Je bedenktijd is voorbij. Opzeggen kan nog wel.'
        : 'Er is geen bedenktijd meer voor je abonnement. Opzeggen kan nog wel.',
    });
    const opnieuwProberen = info.kan_herroepen !== true && info.al_herroepen === true;
    if (info.kan_herroepen !== true && !opnieuwProberen) {
      // Vraag de reden op (bedenktijd voorbij of geen bedenktijd); mollie_herroep weigert hier met dezelfde regel.
      const { data: h } = await beheer.rpc('mollie_herroep', { p_user: user.id });
      if (h?.ok) return fout(500, 'Herroepen lukte niet. Probeer het zo opnieuw.', 'database');
      return weigering(String(h?.reden ?? 'geen_bedenktijd'));
    }

    let onvolledig = false;
    if (info.klant_id && info.abonnement_id && !(await stopAbonnement(info.klant_id, info.abonnement_id))) {
      if (!opnieuwProberen) return fout(502, 'Herroepen lukte nu niet, want Mollie reageert niet. Probeer het zo opnieuw.', 'mollie');
      onvolledig = true;
    }

    let herroepenOp: string | null = info.herroepen_op ?? null;
    let plan: string | null = null;
    if (!opnieuwProberen) {
      const { data: h, error } = await beheer.rpc('mollie_herroep', { p_user: user.id });
      if (error || !h) return fout(500, 'Herroepen lukte niet. Probeer het zo opnieuw.', 'database');
      if (!h.ok) {
        // Net te laat (bedenktijd voorbij): het abonnement bij Mollie is al gestopt, dus dan geldt het als opgezegd.
        await beheer.rpc('mollie_zeg_op', { p_user: user.id });
        return weigering(String(h.reden ?? 'geen_bedenktijd'));
      }
      herroepenOp = h.herroepen_op ?? null;
      plan = h.plan ?? null;
    }

    // Terugbetalen: alles van de huidige overeenkomst. Stond het vinkje "meteen starten" aan, dan betaal je de
    // begonnen dagen van een betaalde maand (naar rato). De machtiging van 0,02 euro bij een proefmaand gaat helemaal terug.
    // Wat al terug is, telt bij Mollie (amountRefunded), zodat een nieuwe poging nooit dubbel terugbetaalt.
    const herroepenMs = new Date(herroepenOp ?? Date.now()).getTime();
    let terugCenten = 0;
    for (const b of (Array.isArray(info.betalingen) ? info.betalingen : []) as Obj[]) {
      const bedrag = centen(b.bedrag);
      let aftrek = 0;
      if (info.meteen && b.uitkomst !== 'proef' && b.betaald_op) {
        const begin = new Date(b.betaald_op);
        const eind = new Date(begin.getTime());
        eind.setUTCMonth(eind.getUTCMonth() + 1);
        const totaal = Math.max(1, Math.round((eind.getTime() - begin.getTime()) / DAG));
        const gebruikt = Math.min(totaal, Math.max(0, Math.ceil((herroepenMs - begin.getTime()) / DAG)));
        aftrek = Math.round((bedrag * gebruikt) / totaal);
      }
      if (bedrag - aftrek - centen(b.terugbetaald) <= 0) continue;
      // Mollie is de bron: nooit meer dan wat daar nog terug kan.
      const p = await mollie(`/payments/${encodeURIComponent(b.id)}`);
      if (!p.ok || p.data?.status !== 'paid') { onvolledig = true; continue; }
      const al = Math.max(centen(b.terugbetaald), centen(p.data?.amountRefunded?.value), 0) + centen(p.data?.amountChargedBack?.value);
      let terug = Math.max(0, bedrag - aftrek - al);
      if (p.data?.amountRemaining) terug = Math.min(terug, centen(p.data.amountRemaining.value));
      if (terug <= 0) continue;
      const r = await mollie(`/payments/${encodeURIComponent(b.id)}/refunds`, 'POST', {
        amount: { currency: String(b.valuta || 'EUR'), value: euro(terug) },
        description: "Berie's Exam Space, herroeping",
        metadata: { user_id: user.id, soort: 'herroeping' },
      }, `herroep-${b.id}-${terug}`);
      if (!r.ok) { console.error('mollie: terugbetaling mislukt', r.status); onvolledig = true; continue; }
      await beheer.rpc('mollie_terug', { p_id: b.id, p_bedrag: Number(euro(terug)) });
      terugCenten += terug;
    }
    if (onvolledig) console.error('mollie: herroepen bij Mollie onvolledig');

    return antwoord({
      ok: true,
      terug: Number(euro(terugCenten)),
      herroepen_op: herroepenOp,
      plan,
      ...(onvolledig ? { onvolledig: true } : {}),
    });
  }

  return fout(400, 'Onbekende actie.', 'onbekende_actie');
});
