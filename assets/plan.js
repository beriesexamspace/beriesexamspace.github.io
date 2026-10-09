// Plan van het account: Free, Plus of Pro (supabase/abonnementen.sql). Eén keer per pagina opgehaald.
// Gebruik: const p = await BES.plan();  p.plan is 'free', 'plus' of 'pro'. Na een wijziging: BES.plan(true).
// Laden na auth.js. Zonder account of zonder verbinding geldt Free.
// Betalen: await BES.betalen() is true als Mollie aanstaat; BES.mollie({ actie }) roept de Edge Function mollie aan.
window.BES = window.BES || {};

(() => {
  'use strict';

  const BES = window.BES;
  const leeg = { plan: 'free', status: null, geldig_tot: null, proef_plus: false, proef_pro: false, ingelogd: false };
  const rang = { free: 0, plus: 1, pro: 2 };
  let belofte = null;

  BES.plan = (opnieuw) => {
    if (belofte && !opnieuw) return belofte;
    belofte = (async () => {
      const auth = BES.auth;
      if (!auth) return { ...leeg };
      const user = await auth.gebruiker().catch(() => null);
      if (!user || !auth.client) return { ...leeg };
      try {
        const { data, error } = await auth.client.rpc('mijn_abonnement');
        if (error || !data) return { ...leeg, ingelogd: true };
        return { ...leeg, ...data, ingelogd: true };
      } catch {
        return { ...leeg, ingelogd: true };
      }
    })();
    return belofte;
  };

  // Heeft dit account minstens dit plan? BES.heeftPlan('plus') is ook waar bij Pro.
  BES.heeftPlan = async (nodig) => (rang[(await BES.plan()).plan] || 0) >= (rang[nodig] || 0);

  BES.planNaam = (plan) => ({ free: 'Free', plus: 'Plus', pro: 'Pro' })[plan] || 'Free';

  // Betalen met Mollie (supabase/mollie.sql): staat de schakelaar 'betalen' aan? Eén keer per pagina gevraagd.
  // Lukt het niet (functie nog niet uitgevoerd, geen verbinding), dan geldt false en werkt alles zoals vroeger.
  let betalenBelofte = null;
  BES.betalen = () => {
    if (betalenBelofte) return betalenBelofte;
    betalenBelofte = (async () => {
      const client = BES.auth && BES.auth.client;
      if (!client) return false;
      try {
        const { data, error } = await client.rpc('betalen_aan');
        // Een storing (geen verbinding) niet onthouden: de volgende keer opnieuw vragen. Bestaat de functie nog niet, dan wel.
        if (error && error.code !== 'PGRST202') betalenBelofte = null;
        return !error && data === true;
      } catch {
        betalenBelofte = null;
        return false;
      }
    })();
    return betalenBelofte;
  };

  // Aanroep van de Edge Function mollie (supabase/functions/mollie). Geeft het antwoord terug, of gooit een fout
  // met in .fout de Nederlandse melding van de functie (leeg als er geen melding was).
  BES.mollie = async (body) => {
    const client = BES.auth && BES.auth.client;
    const fout = (tekst) => Object.assign(new Error(tekst || 'mollie'), { fout: tekst || '' });
    if (!client) throw fout('');
    let antwoord;
    try {
      antwoord = await client.functions.invoke('mollie', { body });
    } catch {
      throw fout('');
    }
    const { data, error } = antwoord || {};
    if (error) {
      // Bij status 4xx of 5xx zit het antwoord van de functie in error.context (een Response).
      let tekst = '';
      try {
        const inhoud = error.context && typeof error.context.json === 'function' ? await error.context.json() : null;
        if (inhoud && typeof inhoud.fout === 'string') tekst = inhoud.fout;
      } catch {}
      throw fout(tekst);
    }
    if (!data || typeof data !== 'object') throw fout('');
    if (typeof data.fout === 'string') throw fout(data.fout);
    return data;
  };

  // Bedrag als "2,99 euro".
  BES.planBedrag = (getal) => {
    const n = Number(getal) || 0;
    try { return new Intl.NumberFormat('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' euro'; } catch { return n.toFixed(2).replace('.', ',') + ' euro'; }
  };

  BES.planDatum = (iso) => {
    try { return new Intl.DateTimeFormat('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso)); } catch { return ''; }
  };
})();
