// Edge Function "mollie-webhook": Mollie meldt hier elke statuswijziging van een betaling (ook maandbetalingen en
// terugbetalingen). Zetten via de Supabase-editor, met JWT-controle UIT (Mollie stuurt geen Supabase-sessie mee).
// SQL: supabase/mollie.sql. Sleutel: MOLLIE_API_KEY bij Edge Functions, Secrets.
//
// Mollie stuurt alleen "id=tr_..." (application/x-www-form-urlencoded). We vertrouwen daar niets van: de betaling wordt
// altijd zelf bij Mollie opgehaald, en alleen die gegevens tellen. Mollie kan dezelfde melding vaker sturen; alles is
// daarom herhaalbaar (mollie_verwerk zet een plan maar één keer aan, een abonnement wordt maar één keer gemaakt, en elke
// POST naar Mollie heeft een Idempotency-Key). Een maandbetaling die niets aanzette (na herroepen of van een oud
// abonnement) gaat helemaal terug; bij een terugboeking via de bank stopt het plan en het Mollie-abonnement.
// Antwoord: altijd 200 met een lege inhoud, ook voor onbekende nummers. Alleen als Mollie zelf of de database niet
// bereikbaar is 503, zodat Mollie het later opnieuw probeert (tot 10 keer in 26 uur).
// Nooit de sleutel of persoonsgegevens loggen, alleen statuscodes.
import { createClient } from 'npm:@supabase/supabase-js@2';

const MOLLIE = 'https://api.mollie.com/v2';
// Prijzen per maand, inclusief btw (gelijk aan de Edge Function mollie).
const PRIJS: Record<string, string> = { plus: '2.99', pro: '9.99' };
const NAAM: Record<string, string> = { plus: 'Plus', pro: 'Pro' };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// deno-lint-ignore no-explicit-any
type Obj = Record<string, any>;

// eenmalig: Idempotency-Key bij een POST. Dezelfde aanvraag met dezelfde sleutel binnen een uur doet Mollie maar één keer
// (twee meldingen tegelijk: de tweede krijgt 409 en Mollie probeert die melding later opnieuw).
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
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return { status: 0, ok: false, data: null };
  }
  let data: Obj | null = null;
  try { data = r.status === 204 ? null : await r.json(); } catch { data = null; }
  return { status: r.status, ok: r.ok, data };
}

// Mollie zelf onbereikbaar, sleutel fout of te druk: later opnieuw laten proberen.
const opnieuw = (status: number) => status === 0 || status === 401 || status === 409 || status === 429 || status >= 500;

// Datum (JJJJ-MM-DD, tijdzone Amsterdam) een maand na het gegeven moment; 31 januari wordt 28 of 29 februari,
// net als "+ interval '1 month'" in Postgres.
function datumPlusMaand(op: Date): string {
  const delen = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(op);
  const deel = (soort: string) => Number(delen.find((d) => d.type === soort)?.value);
  let jaar = deel('year');
  let maand = deel('month') + 1;
  const dag = deel('day');
  if (maand > 12) { maand = 1; jaar += 1; }
  const laatste = new Date(Date.UTC(jaar, maand, 0)).getUTCDate();
  return `${jaar}-${String(maand).padStart(2, '0')}-${String(Math.min(dag, laatste)).padStart(2, '0')}`;
}

// Abonnement bij Mollie stopzetten. Al gestopt of niet (meer) te vinden telt als gelukt.
async function stopAbonnement(klant: string, abonnement: string): Promise<boolean> {
  const pad = `/customers/${encodeURIComponent(klant)}/subscriptions/${encodeURIComponent(abonnement)}`;
  const r = await mollie(pad, 'DELETE');
  if (r.ok || r.status === 404 || r.status === 410) return true;
  if (r.status === 422) {
    const nu = await mollie(pad);
    return nu.status === 404 || ['canceled', 'completed'].includes(String(nu.data?.status));
  }
  return false;
}

Deno.serve(async (req) => {
  const leeg = (status = 200) => new Response(null, { status });
  if (req.method !== 'POST') return leeg();

  let id = '';
  try { id = new URLSearchParams(await req.text()).get('id') ?? ''; } catch { return leeg(); }
  // Alleen betalingen (tr_...). Mollie meldt ook maandbetalingen en terugbetalingen met het nummer van de betaling.
  if (!/^tr_[A-Za-z0-9]+$/.test(id)) return leeg();

  const url = Deno.env.get('SUPABASE_URL');
  const dienstSleutel = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SECRET_KEY');
  if (!url || !dienstSleutel || !Deno.env.get('MOLLIE_API_KEY')) {
    console.error('mollie-webhook: instellingen ontbreken');
    return leeg(503);
  }
  const beheer = createClient(url, dienstSleutel, { auth: { persistSession: false } });

  // De betaling zelf ophalen bij Mollie.
  const r = await mollie(`/payments/${id}`);
  if (opnieuw(r.status)) { console.error('mollie-webhook: Mollie niet bereikbaar', r.status); return leeg(503); }
  if (!r.ok || !r.data) return leeg();
  const p = r.data;

  const soort = p.sequenceType === 'first' ? 'eerste' : p.sequenceType === 'recurring' && p.subscriptionId ? 'maandelijks' : null;
  if (!soort) return leeg();
  const meta: Obj = p.metadata && typeof p.metadata === 'object' ? p.metadata : {};
  const plan = typeof meta.plan === 'string' && meta.plan in PRIJS ? meta.plan : null;
  const gebruiker = typeof meta.user_id === 'string' && UUID.test(meta.user_id) ? meta.user_id : null;
  if (soort === 'eerste' && (!plan || !gebruiker)) return leeg();
  const bedrag = Number(p.amount?.value ?? 0);
  // Proefmaand alleen als dat in de metadata staat EN het bedrag lager is dan de maandprijs.
  const proef = meta.proef === true && plan !== null && bedrag < Number(PRIJS[plan]);
  const status = String(p.status ?? '');

  const { data: v, error } = await beheer.rpc('mollie_verwerk', {
    p_id: id,
    p_user: gebruiker,
    p_plan: plan,
    p_soort: soort,
    p_bedrag: bedrag,
    p_valuta: String(p.amount?.currency ?? 'EUR'),
    p_status: status,
    p_terugbetaald: Number(p.amountRefunded?.value ?? 0),
    // Teruggeboekt via de bank (chargeback): de status blijft 'paid', alleen dit bedrag verandert.
    p_teruggeboekt: Number(p.amountChargedBack?.value ?? 0),
    p_betaald_op: p.paidAt ?? null,
    p_proef: proef,
    p_meteen: meta.meteen === true,
    p_klant: p.customerId ?? null,
    p_mandaat: p.mandateId ?? null,
    p_abonnement: p.subscriptionId ?? null,
  });
  if (error || !v) { console.error('mollie-webhook: verwerken mislukt'); return leeg(503); }

  // Teruggeboekt via de bank: het plan is gestopt (mollie_verwerk), nu ook het Mollie-abonnement stoppen.
  if (v.stop_abonnement === true) {
    const klant = String(p.customerId ?? v.klant_id ?? '');
    for (const sub of new Set([v.abonnement_id, p.subscriptionId].filter((s) => typeof s === 'string' && s))) {
      if (klant && !(await stopAbonnement(klant, sub))) { console.error('mollie-webhook: abonnement na terugboeking niet gestopt'); return leeg(503); }
    }
    return leeg();
  }

  // Maandbetaling die niets aanzette (na herroepen, van een oud abonnement, of zonder account): dat abonnement stoppen
  // en de betaling helemaal terugstorten. Herhaalbaar: wat bij Mollie al terug is, telt niet meer mee (amountRemaining).
  if (soort === 'maandelijks' && status === 'paid' && (v.uitkomst === 'genegeerd' || !v.user_id)) {
    const klant = String(p.customerId ?? '');
    if (klant && p.subscriptionId && !(await stopAbonnement(klant, String(p.subscriptionId)))) {
      console.error('mollie-webhook: los abonnement niet gestopt');
      return leeg(503);
    }
    const rest = Number(p.amountRemaining?.value ?? 0);
    if (rest > 0 && Number(p.amountChargedBack?.value ?? 0) === 0) {
      const terug = await mollie(`/payments/${id}/refunds`, 'POST', {
        amount: { currency: String(p.amountRemaining?.currency ?? 'EUR'), value: rest.toFixed(2) },
        description: "Berie's Exam Space, betaling zonder plan",
      }, `terug-${id}-${rest.toFixed(2)}`);
      if (!terug.ok) { console.error('mollie-webhook: terugstorten mislukt', terug.status); return leeg(opnieuw(terug.status) ? 503 : 200); }
      await beheer.rpc('mollie_terug', { p_id: id, p_bedrag: rest });
    }
    return leeg();
  }

  // Verder heeft alleen een geslaagde eerste betaling nog werk: terugstorten of het maandabonnement maken.
  if (soort !== 'eerste' || status !== 'paid') return leeg();

  // Er liep al zo'n plan (dubbel betaald): het hele bedrag terug, geen abonnement.
  if (v.uitkomst === 'dubbel') {
    const rest = Number(p.amountRemaining?.value ?? 0);
    if (rest > 0) {
      const terug = await mollie(`/payments/${id}/refunds`, 'POST', {
        amount: { currency: String(p.amountRemaining?.currency ?? 'EUR'), value: rest.toFixed(2) },
        description: "Berie's Exam Space, dubbele betaling",
      }, `terug-${id}-${rest.toFixed(2)}`);
      if (!terug.ok) { console.error('mollie-webhook: terugstorten mislukt', terug.status); return leeg(opnieuw(terug.status) ? 503 : 200); }
      await beheer.rpc('mollie_terug', { p_id: id, p_bedrag: rest });
    }
    return leeg();
  }

  // Geen abonnement (meer) als het plan intussen is opgezegd, herroepen of vervangen, of als er al iets terug is.
  if (!v.mag_abonnement || Number(p.amountRefunded?.value ?? 0) > 0 || Number(p.amountChargedBack?.value ?? 0) > 0) return leeg();
  const klant = String(p.customerId ?? v.klant_id ?? '');
  if (!klant || !plan || !gebruiker) return leeg();

  // Bestaat het abonnement voor deze eerste betaling al (eerdere melding)? Dan niet nog eens maken. Komen twee meldingen
  // tegelijk, dan zorgt de Idempotency-Key sub-<betaling> ervoor dat Mollie er toch maar één maakt.
  const lijst = await mollie(`/customers/${encodeURIComponent(klant)}/subscriptions?limit=250`);
  if (!lijst.ok) { console.error('mollie-webhook: abonnementen ophalen mislukt', lijst.status); return leeg(503); }
  const bestaande: Obj[] = Array.isArray(lijst.data?._embedded?.subscriptions) ? lijst.data._embedded.subscriptions : [];
  let sub = bestaande.find((s) => s?.metadata?.eerste === id) ?? null;

  if (!sub) {
    // Een vorig abonnement (ander plan, of opgezegd en opnieuw gestart) eerst stoppen: er loopt er altijd hoogstens één.
    const oud = typeof v.abonnement_id === 'string' && v.abonnement_id ? v.abonnement_id : null;
    if (oud && !(await stopAbonnement(klant, oud))) { console.error('mollie-webhook: oud abonnement niet gestopt'); return leeg(503); }
    // Eerste maandbetaling een maand na deze betaling: na de proefmaand, of na de betaalde eerste maand.
    const start = datumPlusMaand(new Date(p.paidAt ?? Date.now()));
    const nieuw = await mollie(`/customers/${encodeURIComponent(klant)}/subscriptions`, 'POST', {
      amount: { currency: 'EUR', value: PRIJS[plan] },
      interval: '1 month',
      startDate: start,
      description: `Berie's Exam Space ${NAAM[plan]}, per maand vanaf ${start}`,
      ...(p.mandateId ? { mandateId: p.mandateId } : {}),
      webhookUrl: `${url}/functions/v1/mollie-webhook`,
      metadata: { user_id: gebruiker, plan, eerste: id },
    }, `sub-${id}`);
    if (!nieuw.ok || !nieuw.data?.id) { console.error('mollie-webhook: abonnement maken mislukt', nieuw.status); return leeg(503); }
    sub = nieuw.data;
  }

  const { error: kFout } = await beheer.from('mollie_koppeling')
    .update({ abonnement_id: String(sub.id), mandaat_id: p.mandateId ?? undefined, plan, bijgewerkt: new Date().toISOString() })
    .eq('user_id', gebruiker);
  if (kFout) { console.error('mollie-webhook: koppeling niet bijgewerkt'); return leeg(503); }
  return leeg();
});
