(() => {
  'use strict';

  const BES = window.BES = window.BES || {};
  const gegevens = new Map();
  const cache = new URL(document.currentScript.src).search;
  const procent = (goed, totaal) => totaal ? Math.round(goed / totaal * 100) : 0;
  const naarHub = [{ label: 'Naar de hub →', href: 'hub.html' }];

  // Net als op het weekoverzicht laden we vakken één voor één: elk script zet BES_VAK.
  const laadVak = id => new Promise(resolve => {
    if (gegevens.has(id)) { resolve(gegevens.get(id)); return; }
    const script = document.createElement('script');
    script.src = `vak/${id}/data.js${cache}`;
    script.onload = () => {
      const data = window.BES_VAK?.id === id ? window.BES_VAK : null;
      if (data) gegevens.set(id, data);
      resolve(data);
    };
    script.onerror = () => resolve(null);
    document.head.append(script);
  });

  async function oefenen(client, user) {
    const { data, error } = await client.from('voortgang')
      .select('vak,hoofdstuk,laatst_goed,laatst_totaal').eq('user_id', user.id);
    if (error) throw error;
    const vakken = new Map((window.BES_VAKKEN || []).filter(vak => vak.v2).map(vak => [vak.id, vak]));
    const rijen = (data || []).filter(rij => !rij.vak.endsWith('__hard') && rij.laatst_totaal >= 3 && vakken.has(rij.vak));
    if (!rijen.length) {
      return { tekst: 'Je hebt nog niets geoefend. Kies een vak, dan zie ik daarna waar je kan groeien.', knoppen: naarHub };
    }
    const zwak = rijen.filter(rij => rij.laatst_goed / rij.laatst_totaal < .8)
      .sort((a, b) => a.laatst_goed / a.laatst_totaal - b.laatst_goed / b.laatst_totaal).slice(0, 3);
    if (!zwak.length) {
      return { tekst: 'Alles wat je oefende zit op 80 procent of hoger. Kies een nieuw hoofdstuk of probeer Hard mode.', knoppen: naarHub };
    }
    const regels = ['Deze hoofdstukken hebben nu de meeste aandacht nodig:'];
    const knoppen = [];
    for (const rij of zwak) {
      const vak = vakken.get(rij.vak);
      const vakData = await laadVak(vak.id);
      const naam = vakData?.hoofdstukken.find(hoofdstuk => hoofdstuk.id === rij.hoofdstuk)?.naam || rij.hoofdstuk;
      regels.push(`${vak.naam} · ${naam} · ${procent(rij.laatst_goed, rij.laatst_totaal)} procent goed`);
      knoppen.push({ label: `Oefen ${naam} →`, href: `vak/${vak.id}/?hoofdstuk=${encodeURIComponent(rij.hoofdstuk)}` });
    }
    return { tekst: regels.join('\n'), knoppen };
  }

  async function week(client, user) {
    const vandaag = new Date();
    const dag = offset => new Date(vandaag.getFullYear(), vandaag.getMonth(), vandaag.getDate() + offset);
    const vanaf = dag(-13);
    const dezeWeekVanaf = dag(-6);
    const tot = dag(1);
    const { data, error } = await client.from('sessies').select('goed,totaal,gemaakt_op')
      .eq('user_id', user.id).gte('gemaakt_op', vanaf.toISOString()).lt('gemaakt_op', tot.toISOString());
    if (error) throw error;
    const deze = { sessies: 0, totaal: 0, goed: 0 };
    const vorige = { sessies: 0, totaal: 0, goed: 0 };
    for (const sessie of data || []) {
      const datum = new Date(sessie.gemaakt_op);
      if (!(datum >= vanaf && datum < tot)) continue;
      const groep = datum >= dezeWeekVanaf ? deze : vorige;
      groep.sessies += 1;
      groep.totaal += sessie.totaal;
      groep.goed += sessie.goed;
    }
    const knoppen = [{ label: 'Weekoverzicht →', href: 'voortgang.html' }];
    if (!deze.sessies) {
      return { tekst: 'Deze week heb je nog niet geoefend. Eén korte ronde is al een goed begin.', knoppen };
    }
    const punten = procent(deze.goed, deze.totaal) - procent(vorige.goed, vorige.totaal);
    const verschil = !vorige.sessies ? 'Vorige week had je nog niet geoefend.'
      : !punten ? 'Even goed als vorige week.'
      : `Dat is ${Math.abs(punten)} punten ${punten > 0 ? 'beter' : 'minder'} dan vorige week.`;
    return { tekst: `Deze week: ${deze.sessies} sessies, ${deze.totaal} vragen, ${procent(deze.goed, deze.totaal)} procent goed.\n${verschil}`, knoppen };
  }

  // Alleen duidelijke vragen over de site zelf krijgen een vast antwoord; al het andere gaat naar Comit met AI.
  const lijktOp = (tekst, ...patronen) => patronen.some(patroon => patroon.test(tekst));

  BES.comitAntwoord = async (vraag, { client, user }) => {
    const tekst = vraag.toLowerCase().trim();
    if (lijktOp(tekst, /hard ?mode/)) {
      return { tekst: 'Hard mode is een moeilijker niveau met toepassings- en casusvragen. Je kiest het op de vakpagina bij de stap Niveau. Bij vakken waar nog geen Hard-vragen zijn, zie je die stap niet. Je voortgang op Hard telt apart.', knoppen: [] };
    }
    if (lijktOp(tekst, /tijdklok/, /met tijd oefenen/, /werkt de klok/)) {
      return { tekst: 'Op de vakpagina kies je bij de stap Tijd voor Met tijd en stel je 45 seconden tot 2 minuten per vraag in. Tijdens het oefenen telt de klok af. Bij nul stopt de ronde en tellen onbeantwoorde vragen als fout. Op het eindscherm zie je hoe lang je erover deed.', knoppen: [] };
    }
    try {
      if (lijktOp(tekst, /hoe ging mijn week/, /mijn week/, /deze week (ge)?oefend/)) return await week(client, user);
      if (lijktOp(tekst, /waar moet ik (nog )?op oefenen/, /wat moet ik (nog )?oefenen/, /zwakste/, /mijn zwakke/)) return await oefenen(client, user);
    } catch {
      return { tekst: 'Ik kon je voortgang nu niet ophalen. Probeer het zo opnieuw.', knoppen: [] };
    }
    if (lijktOp(tekst, /wachtwoord/, /e-?mail(adres)? (wijzig|verander|aanpas)/, /naam (wijzig|verander|aanpas)/, /profielfoto/)) {
      return { tekst: 'Je naam, e-mailadres en wachtwoord pas je aan op Profiel, via de knop Bewerken.', knoppen: [{ label: 'Naar Profiel →', href: 'profiel.html' }] };
    }
    if (lijktOp(tekst, /account (wissen|verwijderen)/, /(wis|verwijder) (ik )?mijn account/)) {
      return { tekst: 'Je account wis je via Profiel, onderaan bij Account wissen. Je ziet eerst precies wat er verdwijnt.', knoppen: [{ label: 'Naar Account wissen →', href: 'account-wissen.html' }] };
    }
    if (lijktOp(tekst, /deliberatie/, /tweede zit/, /herexamen/, /herinschrijving/, /inschrijven voor/)) {
      return { tekst: 'Daar staat veel over in Examen-info.', knoppen: [{ label: 'Naar Examen-info →', href: 'examen-info.html' }] };
    }
    return null;
  };
})();
