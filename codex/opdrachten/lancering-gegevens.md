# Opdracht: bedrijfsgegevens, btw-zin en privacy klaar voor de lancering

## Doel
Voor er echt betaald kan worden, moeten de voorwaarden en de privacyverklaring compleet zijn: het adres en het btw-id van de eenmanszaak, de juiste btw-zin bij de prijzen (met of zonder kleineondernemersregeling) en in de privacyverklaring de betaaldienst Mollie en de maildienst Resend.

## Bestanden
- `voorwaarden.html` (adres, btw-id, btw-zin)
- `abonnement.html` (alleen de btw-zin bij de prijzen, punt 3)
- `privacy.html` (Mollie en Resend, punt 4)
- `README.md` (korte alinea)

NIET aanraken: `assets/`, `supabase/`, de Edge Functions en alle andere pagina's. Er verandert geen gedeeld bestand in `assets/`, dus het cachenummer blijft gelijk.

## Gewenst gedrag
1. **Gegevens van Berat.** Berat geeft je in de chat zijn adres (straat, nummer, postcode, plaats), zijn btw-id en of hij de kleineondernemersregeling (KOR) gebruikt. Ontbreekt een van die drie, stop dan en vraag het in de PR. Het adres en het btw-id van een eenmanszaak moeten wettelijk op de site staan; daarom mogen ze in deze twee pagina's, als uitzondering op de regel over persoonsgegevens in AGENTS.md. Zet ze niet in de README, niet in commitberichten en niet in de PR-beschrijving.

2. **`voorwaarden.html`.**
   - Bij Wie we zijn: vervang de zin "Het adres en het btw-nummer komen hier voordat je iets kan betalen." door het adres en het btw-id, in dezelfde stijl als het KvK-nummer en de telefoon. De zin "The Berie Foundation is een projectnaam, geen stichting." blijft staan.
   - In het modelformulier, bij Aan: vervang "Het adres komt hier voordat je iets kan betalen." door het adres.
   - Zoek in de hele pagina naar andere zinnen die zeggen dat het adres of het btw-nummer nog komt, en pas ook die aan.

3. **Btw-zin bij de prijzen.**
   - Gebruikt Berat de KOR niet: niets veranderen, "inclusief btw" blijft staan.
   - Gebruikt Berat de KOR wel: vervang in `voorwaarden.html` en `abonnement.html` elke zin waarin de prijs "inclusief btw" is, ook in teksten die het script van die pagina zelf opbouwt. Nieuwe zin, bijvoorbeeld: "Plus kost 2,99 euro per maand. Er komt geen btw bij, want Berie's Exam Space gebruikt de kleineondernemersregeling." De bedragen blijven gelijk en er staat nergens een btw-bedrag. Het btw-id blijft wel bij Wie we zijn staan.

4. **`privacy.html`.** Voeg in het deel waar Supabase en Google Gemini staan twee diensten toe, in dezelfde opmaak:
   - **Mollie** (betalingen): je betaalt via Mollie. Je rekening- of kaartgegevens vul je bij Mollie in; wij zien ze niet. We sturen alleen een intern nummer van je account mee, geen naam en geen e-mailadres. Per betaling bewaren we het bedrag, de datum en de status, voor je abonnement en voor de boekhouding. Die gegevens moeten we 7 jaar bewaren.
   - **Resend** (e-mails): de bevestigingsmails over je abonnement (na aanmelden, opzeggen en herroepen) gaan via Resend, op servers in de EU (Ierland). Resend krijgt je e-mailadres, je voornaam en de inhoud van de mail.
   Pas ook de bewaartermijnen of de lijst met wat we bewaren aan als die pagina zo'n lijst heeft.

5. **README.md.** Korte alinea met de datum: adres en btw-id staan in de voorwaarden, de btw-zin (met of zonder KOR) en Mollie en Resend in de privacyverklaring. Zonder het adres of het btw-id zelf.

6. **Vaste regels** (AGENTS.md): nergens het woord "gratis", geen gedachtestreepjes in zichtbare tekst, alles in hetzelfde tabblad, licht en donker via de bestaande tokens.

## Klaar als
- In `voorwaarden.html` staat nergens meer "komt hier voordat je iets kan betalen"; het adres en het btw-id staan bij Wie we zijn en het adres staat in het modelformulier.
- Met KOR: `grep -i "inclusief btw" voorwaarden.html abonnement.html` geeft niets. Zonder KOR zijn die zinnen ongewijzigd.
- `privacy.html` noemt Mollie en Resend, met wat elke dienst krijgt.
- Licht en donker, desktop en 375 px bekeken, geen fouten in de console.
- README aangevuld. De PR-beschrijving zegt alleen "adres en btw-id ingevuld", zonder de gegevens zelf.
