// Klaar-meter (Pro): hoe klaar ben je voor een vak, van 0 tot 100, met de twee snelste stappen omhoog.
// Geen voorspelling van een examencijfer: alleen hoeveel van de stof je zag, hoe goed het ging en hoe recent.
// Gebruik: BES.klaarMeter(data, rijen, nu) met data = window.BES_VAK van het vak (hoofdstukken en vragen),
// rijen = rijen uit de tabel voortgang voor dit vak op Normaal (hoofdstuk, beantwoord, goed, laatst_goed, laatst_totaal, bijgewerkt).
(() => {
  'use strict';

  const DAG = 86400000;
  const DOEL = { dekking: 1, beheersing: 0.9, versheid: 1 };

  // Versheid: tot 3 dagen geleden telt volledig, daarna zakt het in een maand naar 0,4.
  const versheidVan = (bijgewerkt, nu) => {
    const tijd = Date.parse(bijgewerkt || '');
    if (!Number.isFinite(tijd)) return 0.4;
    const dagen = Math.max(0, (nu - tijd) / DAG);
    return dagen <= 3 ? 1 : Math.max(0.4, 1 - (dagen - 3) / 30);
  };

  // Per hoofdstuk: 30 procent voor gezien hebben, 70 procent voor gezien en goed en recent.
  const waarde = (dekking, beheersing, versheid) => 0.3 * dekking + 0.7 * dekking * beheersing * versheid;

  function klaarMeter(data, rijen, nu = Date.now()) {
    const aantal = new Map();
    (data?.vragen || []).forEach(vraag => aantal.set(vraag.h, (aantal.get(vraag.h) || 0) + 1));
    const perRij = new Map((rijen || []).map(rij => [rij.hoofdstuk, rij]));
    const hoofdstukken = (data?.hoofdstukken || []).filter(h => aantal.get(h.id)).map(h => {
      const n = aantal.get(h.id);
      const rij = perRij.get(h.id);
      const beantwoord = Number(rij?.beantwoord) || 0;
      const laatstTotaal = Number(rij?.laatst_totaal) || 0;
      const dekking = Math.min(1, beantwoord / n);
      const laatst = laatstTotaal > 0 ? (Number(rij.laatst_goed) || 0) / laatstTotaal : 0;
      const totaal = beantwoord > 0 ? Math.min(1, (Number(rij.goed) || 0) / beantwoord) : 0;
      const beheersing = laatstTotaal > 0 ? 0.7 * laatst + 0.3 * totaal : totaal;
      const versheid = beantwoord > 0 ? versheidVan(rij?.bijgewerkt, nu) : 1;
      const dagen = rij?.bijgewerkt ? Math.floor(Math.max(0, nu - Date.parse(rij.bijgewerkt)) / DAG) : null;
      return { id: h.id, naam: h.naam, n, beantwoord, dekking, beheersing, versheid, dagen, waarde: waarde(dekking, beheersing, versheid) };
    });
    const totaalN = hoofdstukken.reduce((som, h) => som + h.n, 0);
    if (!totaalN) return { score: 0, hoofdstukken: [], stappen: [] };
    const score = Math.round(100 * hoofdstukken.reduce((som, h) => som + h.n * h.waarde, 0) / totaalN);
    const doel = waarde(DOEL.dekking, DOEL.beheersing, DOEL.versheid);
    const stappen = hoofdstukken
      .map(h => {
        const winst = Math.round(100 * h.n * Math.max(0, doel - h.waarde) / totaalN);
        const reden = !h.beantwoord ? 'nieuw' : h.versheid < 0.75 ? 'herhalen' : 'oefenen';
        return { hoofdstuk: h.id, naam: h.naam, winst, reden, dagen: h.dagen };
      })
      .filter(stap => stap.winst >= 1)
      .sort((a, b) => b.winst - a.winst)
      .slice(0, 2);
    return { score: Math.max(0, Math.min(100, score)), hoofdstukken, stappen };
  }

  // Korte zin per stap, voor op de vakpagina en in het overzicht. De naam van het hoofdstuk staat vooraan,
  // zodat een naam als "Het skelet" nooit met een hoofdletter midden in een zin staat.
  function stapTekst(stap) {
    if (stap.reden === 'nieuw') return `${stap.naam}: nog niet geoefend`;
    if (stap.reden === 'herhalen') return `${stap.naam}: ${stap.dagen} dagen niet geoefend, herhaal het`;
    return `${stap.naam}: nog eens oefenen`;
  }

  if (typeof window !== 'undefined') {
    window.BES = window.BES || {};
    window.BES.klaarMeter = klaarMeter;
    window.BES.klaarStapTekst = stapTekst;
  }
  if (typeof module !== 'undefined') module.exports = { klaarMeter, stapTekst };
})();
