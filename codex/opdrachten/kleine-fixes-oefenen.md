# Opdracht: kleine fixes aan het oefenscherm

## Doel
Losse punten die Berat opmerkte nadat `oefenen-stappen.md` live ging. Klein werk, één pull request.

## Bestanden
- `assets/vak.js`
- Cachenummer `?v=` in alle html-bestanden één hoger dan het huidige nummer in `hub.html`
- `README.md` als het gedrag erin beschreven staat

NIET aanraken: `supabase/`, `vak/*/data.js`, `assets/style.css`, en van `hub.html`, `profiel.html`, `voortgang.html`, `account-wissen.html` alleen het cachenummer.

## Gewenst gedrag
1. **Niet meer naar beneden springen bij een hoofdstuk.** In `renderChapters` staat nu `if (aangevinkt) scrollNaar(byId('start-oefening')?.closest('.vak-start') || byId('start-oefening'));`. Haal dat weg: aan- of uitvinken van een hoofdstuk mag de pagina niet verplaatsen. Meeschuiven blijft alleen na het kiezen van modus, niveau en tijd (de bestaande `revealStep`).

## Klaar als
- Een hoofdstuk aan- of uitvinken laat de pagina stilstaan, ook bij het eerste vinkje en bij "Alles" en "Niets".
- Modus, niveau en tijd schuiven nog wel netjes door naar de volgende stap.
- Cachenummer overal verhoogd; `node --check assets/vak.js` slaagt; geen consolefouten; getest in licht en donker en op 375 px.
