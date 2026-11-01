// Comit stap 2: vragen die Comit niet zelf herkent, gaan via de Edge Function "comit" naar de antwoorddienst.
// Er gaat alleen de vraag mee en een kort overzicht van de scores per vak, nooit een naam of e-mailadres.
window.BES = window.BES || {};

(() => {
  'use strict';

  const BES = window.BES;
  let overzicht = null;

  // Eén keer per bezoek: per geoefend vak de gemiddelde laatste score, zodat Comit weet waar je staat.
  // Lukt het lezen niet, dan blijft overzicht null en probeert de volgende vraag het opnieuw.
  const bouwOverzicht = async (client, user) => {
    if (overzicht !== null) return overzicht;
    overzicht = '';
    try {
      const { data, error } = await client.from('voortgang').select('vak,laatst_goed,laatst_totaal').eq('user_id', user.id);
      if (error) { overzicht = null; return ''; }
      const namen = new Map((window.BES_VAKKEN || []).map(vak => [vak.id, vak.naam]));
      const perVak = {};
      for (const rij of data || []) {
        if (rij.vak.endsWith('__hard') || !rij.laatst_totaal || !namen.has(rij.vak)) continue;
        const vak = perVak[rij.vak] = perVak[rij.vak] || { goed: 0, totaal: 0 };
        vak.goed += rij.laatst_goed;
        vak.totaal += rij.laatst_totaal;
      }
      // Eerst de zwakste vakken, zodat Comit bij meer dan 8 geoefende vakken weet waar je het meeste kan winnen.
      const delen = Object.entries(perVak).sort((a, b) => a[1].goed / a[1].totaal - b[1].goed / b[1].totaal).slice(0, 8).map(([id, vak]) => `${namen.get(id)} ${Math.round(vak.goed / vak.totaal * 100)} procent`);
      if (delen.length) overzicht = `Geoefende vakken met gemiddelde score: ${delen.join('; ')}.`;
    } catch { overzicht = null; return ''; }
    return overzicht;
  };

  BES.comitVrij = async (vraag, { client, user }) => {
    if (!client?.functions || !user) return null;
    let timer;
    try {
      // Geen antwoord binnen 28 seconden: stoppen met wachten, zodat de typbalk niet eindeloos geblokkeerd blijft.
      const aanroep = (async () => client.functions.invoke('comit', { body: { vraag, context: await bouwOverzicht(client, user) } }))();
      aanroep.catch(() => {});
      const { data } = await Promise.race([aanroep, new Promise(klaar => { timer = window.setTimeout(() => klaar({ data: null }), 28000); })]);
      // Daglimiet bereikt: een melding met een knop naar Plus (alleen bij Free), niet bewaard in Geschiedenis.
      if (data && data.limiet === true && typeof data.tekst === 'string' && data.tekst.trim()) {
        return { tekst: data.tekst.trim(), knoppen: data.plan === 'free' ? [{ label: 'Bekijk Plus →', href: 'abonnement.html' }] : [], onbewaard: true };
      }
      if (data && typeof data.tekst === 'string' && data.tekst.trim()) return { tekst: data.tekst.trim(), knoppen: [] };
    } catch {} finally { window.clearTimeout(timer); }
    return { tekst: 'Ik kan nu even niet nadenken. Probeer het zo opnieuw.', knoppen: [], onbewaard: true };
  };
})();
