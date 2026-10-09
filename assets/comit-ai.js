// Comit stap 2: vragen die Comit niet zelf herkent, gaan via de Edge Function "comit" naar Gemini.
// Er gaat alleen de vraag mee en een kort overzicht van de scores per vak, nooit een naam of e-mailadres.
window.BES = window.BES || {};

(() => {
  'use strict';

  const BES = window.BES;
  let overzicht = null;

  // Eén keer per bezoek: per geoefend vak de gemiddelde laatste score, zodat Comit weet waar je staat.
  const bouwOverzicht = async (client, user) => {
    if (overzicht !== null) return overzicht;
    overzicht = '';
    try {
      const { data, error } = await client.from('voortgang').select('vak,laatst_goed,laatst_totaal').eq('user_id', user.id);
      if (error) return overzicht;
      const namen = new Map((window.BES_VAKKEN || []).map(vak => [vak.id, vak.naam]));
      const perVak = {};
      for (const rij of data || []) {
        if (rij.vak.endsWith('__hard') || !rij.laatst_totaal || !namen.has(rij.vak)) continue;
        const vak = perVak[rij.vak] = perVak[rij.vak] || { goed: 0, totaal: 0 };
        vak.goed += rij.laatst_goed;
        vak.totaal += rij.laatst_totaal;
      }
      const delen = Object.entries(perVak).slice(0, 8).map(([id, vak]) => `${namen.get(id)} ${Math.round(vak.goed / vak.totaal * 100)} procent`);
      if (delen.length) overzicht = `Geoefende vakken met gemiddelde score: ${delen.join('; ')}.`;
    } catch {}
    return overzicht;
  };

  BES.comitVrij = async (vraag, { client, user }) => {
    if (!client?.functions || !user) return null;
    try {
      const { data } = await client.functions.invoke('comit', { body: { vraag, context: await bouwOverzicht(client, user) } });
      if (data && typeof data.tekst === 'string' && data.tekst.trim()) return { tekst: data.tekst.trim(), knoppen: [] };
    } catch {}
    return { tekst: 'Ik kan nu even niet nadenken. Probeer het zo opnieuw.', knoppen: [] };
  };
})();
