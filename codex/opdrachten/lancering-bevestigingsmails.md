# Opdracht: bevestigingsmail na betalen, opzeggen en herroepen

## Doel
Na een geslaagde eerste betaling, na opzeggen en na herroepen krijgt de student meteen een mail. De voorwaarden beloven die mail bij herroepen ("Je krijgt meteen per e-mail een bevestiging met datum en tijd"), en wie op afstand een abonnement afsluit, moet een bevestiging krijgen op een duurzame drager. De mails gaan via Resend, vanuit de twee bestaande Edge Functions. Zonder deze mails gaan er geen echte betalingen live.

## Bestanden
- `supabase/functions/mollie-webhook/index.ts` (mail na de eerste betaling)
- `supabase/functions/mollie/index.ts` (mail na opzeggen en na herroepen)
- `README.md` (sectie "Betalen met Mollie (testmodus)": Resend instellen, en "Nog open: een bevestigingsmail" weghalen)

NIET aanraken: `supabase/*.sql` (er is geen nieuwe tabel of functie nodig), html, `assets/`. Berat plakt de functies via de Supabase-editor, dus elk `index.ts` moet op zichzelf werken: geen gedeelde module, zet de mailhulp in beide bestanden.

## Gewenst gedrag
1. **Mailhulp** `stuurMail({ aan, onderwerp, tekst, html, sleutel, bijlagen })` in beide bestanden. `POST https://api.resend.com/emails` met `Authorization: Bearer <RESEND_API_KEY>`, `Idempotency-Key: <sleutel>` en de velden `from` (secret `MAIL_VAN`, bijvoorbeeld `Berie's Exam Space <abonnement@beriesexamspace.com>`), `to`, `reply_to` (secret `MAIL_ANTWOORD`, alleen als die bestaat), `subject`, `text`, `html` en eventueel `attachments`. Time-out 10 seconden. Ontbreekt `RESEND_API_KEY` of `MAIL_VAN`: niets versturen, één logregel "mail: niet ingesteld" en gewoon verder. Een mislukte mail breekt nooit de betaling, het opzeggen of het herroepen: log alleen de statuscode, nooit een e-mailadres, naam of inhoud.

2. **Ontvanger en aanhef.** In `mollie`: het e-mailadres van de ingelogde `user`. In `mollie-webhook`: via `beheer.auth.admin.getUserById(gebruiker)`. Aanhef "Hallo <voornaam>," met `user_metadata.voornaam` als die bestaat, anders "Hallo,". Datums met `Intl.DateTimeFormat('nl-BE', { timeZone: 'Europe/Amsterdam', day: 'numeric', month: 'long', year: 'numeric' })`, bedragen met komma ("2,99 euro").

3. **Mail na de eerste geslaagde betaling** (`mollie-webhook`). Verstuur hem aan het einde van het pad van een geslaagde eerste betaling, nadat het Mollie-abonnement gemaakt of gevonden is en `mollie_koppeling` is bijgewerkt (vlak voor de laatste `return leeg()`), en alleen als `v.uitkomst` `'proef'` of `'actief'` is. Idempotency-Key `mail-eerste-<betaling-id>`, zodat een herhaalde melding van Mollie geen tweede mail geeft. Onderwerp: "Je abonnement op Berie's Exam Space: Plus" (of Pro). Inhoud, kort en in gewone zinnen:
   - het plan en de prijs per maand (uit `PRIJS` en `NAAM`);
   - proefmaand: "Je proefmaand loopt tot <datum>. Daarna betaal je automatisch <prijs> per maand, voor het eerst op <startDate van het abonnement>."; betaalde eerste maand: "Je eerste maand is betaald. Daarna betaal je automatisch <prijs> per maand, voor het eerst op <startDate>.";
   - opzeggen: "Opzeggen kan altijd met één knop op je profiel." met de link `<SITE_URL>profiel.html#abonnement`;
   - bedenktijd: "Je hebt 14 dagen bedenktijd, tot en met <datum>." Reken die datum uit met dezelfde regel als `public.herroep_tot` in `supabase/herroepen.sql` (14 dagen vanaf de dag na de betaling, tijdzone Amsterdam). Daarna hoe je herroept: de knop "Hier de overeenkomst herroepen" op je profiel, of het modelformulier onderaan de mail;
   - onderaan het modelformulier als gewone tekst, letterlijk overgenomen uit `voorwaarden.html`;
   - de laatste regel: "Alle gegevens van Berie's Exam Space en de volledige voorwaarden staan in de bijlage en op <SITE_URL>voorwaarden.html."
   - bijlage `voorwaarden.html`: haal de pagina op van `<SITE_URL>voorwaarden.html` op het moment van versturen (time-out 5 seconden). Lukt dat niet, verstuur dan zonder bijlage.

4. **Mail na opzeggen** (`mollie`, actie `opzeggen`). Alleen als `mollie_zeg_op` nu `ok: true` gaf, niet bij een herhaalde klik. Idempotency-Key `mail-opzeg-<user-id>-<geldig_tot>`. Onderwerp "Je abonnement is opgezegd". Inhoud: het plan, "Je houdt <plan> tot en met <geldig_tot>. Er wordt niets meer afgeschreven."

5. **Mail na herroepen** (`mollie`, actie `herroepen`). Alleen als deze aanroep echt herroepen heeft, niet als het een nieuwe poging is na een eerdere herroeping (`opnieuwProberen`). Idempotency-Key `mail-herroep-<user-id>-<herroepen_op>`. Onderwerp "Bevestiging van je herroeping". Inhoud: "Je hebt de overeenkomst herroepen op <datum> om <tijd>." (tijd in uren en minuten, tijdzone Amsterdam), "Je plan is meteen gestopt.", en "<terug> euro komt binnen 14 dagen terug op de rekening waarmee je betaalde." Bij `onvolledig: true` in plaats van die laatste zin: "Bij de terugbetaling ging iets mis. We kijken het na en laten het je weten."

6. **Privacy blijft zoals nu**: er gaat nog steeds geen naam of e-mailadres naar Mollie. De mails zelf vermelden geen gegevens van andere studenten.

7. **README.** In de sectie over Mollie de stappen voor Berat:
   1. Account maken bij resend.com.
   2. Domains, Add domain: `beriesexamspace.com`, regio Ireland (eu-west-1).
   3. De DNS-records die Resend toont toevoegen waar het domein beheerd wordt, en wachten tot Resend "Verified" toont.
   4. API Keys, Create API key (alleen versturen), en in Supabase bij Edge Functions, Secrets: `RESEND_API_KEY`, `MAIL_VAN` en eventueel `MAIL_ANTWOORD`.
   5. Beide functies opnieuw plakken in de Supabase-editor, met dezelfde JWT-instellingen als nu.
   6. Testen in testmodus: Probeer 1 maand en Paid, daarna opzeggen, daarna herroepen; drie mails komen aan.
   Haal "een bevestigingsmail na betalen, opzeggen en herroepen" weg uit "Nog open".

8. **Vaste regels** (AGENTS.md) gelden ook voor de mailteksten: nergens "gratis", geen gedachtestreepjes, geen namen van derden.

## Klaar als
- Met een nagebootste `fetch` voor Mollie en Resend: een geslaagde eerste betaling geeft precies één aanvraag naar Resend met de juiste datums en de sleutel `mail-eerste-<id>`; een tweede melding voor dezelfde betaling gebruikt dezelfde sleutel; een Resend-fout of time-out laat het antwoord van de webhook en het abonnement ongemoeid; zonder `RESEND_API_KEY` geen fout.
- Opzeggen en herroepen geven elk één mail; een herhaalde klik op opzeggen of een nieuwe poging na herroepen geeft geen tweede mail.
- In geen enkele logregel staat een e-mailadres, naam of mailtekst.
- `deno check` slaagt voor beide bestanden (of, zonder Deno, een gelijkwaardige TypeScript-controle die je in de PR noemt).
- README aangevuld. De PR-beschrijving zegt duidelijk: Berat moet Resend instellen, de secrets zetten en beide functies opnieuw plakken.
