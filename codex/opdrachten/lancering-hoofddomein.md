# Opdracht: paden klaarzetten voor de lancering op het hoofddomein

## Doel
Bij de lancering verhuist v2 van `https://beriesexamspace.com/v2/` naar `https://beriesexamspace.com/`. Zet alle absolute paden en adressen nu al om, in één concept-PR die Berat pas op de lanceringsdag samenvoegt. Tot dan blijft main zoals hij is, zodat de site onder `/v2/` blijft werken.

## Bestanden
- alle html-bestanden met `/v2/` (og-tags, `apple-touch-icon`, de link naar het manifest)
- `404.html` (absolute paden)
- `manifest.webmanifest` (`start_url`, `scope`, iconen)
- `supabase/functions/mollie/index.ts` (alleen de standaardwaarde van `SITE_URL`)
- `README.md` en `AGENTS.md` (alleen de vermeldingen van het live-adres en de instructies die `/v2/` noemen)

NIET aanraken: `assets/` (daar staat geen `/v2/`; vind je er toch een, stop dan en vraag het in de PR), `vak/*/data.js`, `supabase/*.sql`, `lancering/maak-doorsturen.js` en de repo van de oude site. Geen cachenummer: er verandert geen gedeeld bestand in `assets/`.

## Gewenst gedrag
1. **Branch en PR.** Werk in de branch `lancering-hoofddomein` vanaf de nieuwste main. Open de PR als concept (draft), met in de titel "NIET SAMENVOEGEN voor de lancering".

2. **Paden.** Vervang `https://beriesexamspace.com/v2/` door `https://beriesexamspace.com/` en absolute paden die met `/v2/` beginnen door `/`. Alleen echte paden en adressen van de site zelf; relatieve links blijven relatief.

3. **Mollie.** In `supabase/functions/mollie/index.ts` wordt de standaard `SITE_URL` `https://beriesexamspace.com/`. Verder niets aan die functie.

4. **README en AGENTS.md.** Werk de instructies bij die nu `/v2/` noemen, zoals de redirect-URL `profiel.html?email=bevestigen`. Laat gedateerde alinea's over wat vroeger veranderd is staan zoals ze zijn. Voeg een korte alinea toe over deze verhuizing.

5. **Lijst voor de lanceringsdag** in de PR-beschrijving. Zoek in de code en de README alles op wat Berat daarbuiten moet aanpassen, met het nieuwe adres erbij. Minstens:
   - Supabase, Authentication, URL Configuration: de Site URL en elke Redirect URL die nu `/v2/` bevat (zoek de doel-URL's van inloggen, Google, wachtwoord herstellen en e-mail bevestigen in `assets/auth.js` en de pagina's, zonder die bestanden te wijzigen);
   - Supabase, Edge Functions, Secrets: `SITE_URL`, als die gezet is;
   - Mollie: het adres van de website in het profiel;
   - Google Cloud (alleen als inloggen met Google aanstaat): de toegestane JavaScript-origins;
   - de functie `mollie` opnieuw plakken in de Supabase-editor.

6. **Controle van het script.** Draai `node lancering/maak-doorsturen.js` en kijk of het zonder fout de doorstuurpagina's maakt. De uitvoer gaat niet in git.

## Klaar als
- `git grep -n "beriesexamspace.com/v2"` en `git grep -n "/v2/"` geven alleen nog gedateerde geschiedenis in de README.
- Lokaal getest met `npx http-server . -p 4477 -c-1` vanuit de hoofdmap: de hub, een vakpagina en `404.html` laden met icoon en manifest, zonder 404-fouten of andere fouten in de console. Licht en donker, desktop en 375 px.
- `node lancering/maak-doorsturen.js` werkt.
- De PR is een concept, niet samengevoegd, en de beschrijving bevat de lijst uit punt 5.
