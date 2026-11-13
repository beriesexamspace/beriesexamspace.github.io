# Voorstel: Edge Function `comit-nakijken`

Status: **voorstel, niet gedeployd.** Deze map wordt niet door de site geladen. Zonder deze functie werkt de modus Open vragen gewoon: de student ziet dan na het nakijken het modelantwoord met de kernpunten, en er komt niets in de Foutenlijst.

## Waarom een nieuwe functie en niet `comit`
`comit` krijgt `{ vraag, context }` en geeft vrije tekst `{ tekst }` terug, met een instructie voor de chat. Nakijken vraagt vast JSON per kernpunt. Een aparte functie houdt de Comit die nu live staat buiten schot.

## Aanvraag (vanuit `assets/open-vragen.js`)
```js
client.functions.invoke('comit-nakijken', { body: {
  vraag: '...',
  modelantwoord: '...',
  kernpunten: [{ id: 'k1', tekst: '...' }, ...],   // 3 tot 6
  antwoord: '...'                                   // hoogstens 3000 tekens
}})
```
Geen naam, geen e-mailadres, geen user-id en geen vaknaam. De JWT in de header dient alleen om te weten dat er een ingelogd account is.

## Antwoord
```json
{
  "kernpunten": [{ "id": "k1", "status": "aanwezig|gedeeltelijk|ontbreekt", "toelichting": "..." }],
  "goed": ["..."],
  "ontbreekt": ["..."],
  "onjuist": [{ "tekst": "...", "kernpunt": "k2" }],
  "tip": "..."
}
```
Daglimiet bereikt: `{ "limiet": true, "tekst": "..." }`. Elke andere fout (niet 2xx, time-out na 28 seconden, ongeldig JSON) laat de pagina terugvallen op het modelantwoord.

## Foutenlijst
- Status `ontbreekt`, of een kernpunt dat in `onjuist` genoemd wordt: via `fouten_bijwerken` op de lijst, met sleutel `o:<hash vraag>.<hash kernpunt>` en `h` = het hoofdstuk.
- Status `aanwezig`: via `p_goed` van de lijst.
- `gedeeltelijk`: verandert niets.

## Wat er buiten de repo moet gebeuren, voordat dit live kan
1. **Nakijken of `fouten_bijwerken` sleutels met `o:` accepteert.** De SQL staat niet in de repo. Staat er in de functie of in een check op de tabel `fouten` een controle op het formaat (bijvoorbeeld `^[nh]:[0-9a-f]{8}$`), dan moet die `o:[0-9a-f]{8}\.[0-9a-f]{8}` toelaten. Een nieuwe kolom is niet nodig.
2. **De functie aanmaken en deployen** (`supabase functions deploy comit-nakijken`) met JWT-controle aan, en de secret voor de AI-sleutel zetten (of de sleutel van `comit` hergebruiken).
3. **Een daglimiet** per account toevoegen op dezelfde manier als in `comit` (die code staat niet in de repo).
4. **Het model.** De functie gebruikt `claude-sonnet-5-5` met effort `low` (keuze van Berat). Weigert het model een antwoord, dan valt de API vanzelf terug op een ander model. Test eerst op een paar echte antwoorden.

## Kosten per nakijkbeurt (schatting)
Ongeveer 1.500 tokens in (instructie, vraag, modelantwoord, kernpunten en antwoord) en 500 tot 1.500 tokens uit (JSON plus denken).

| Model | Prijs per miljoen tokens (in / uit) | Per beurt | Per 1.000 beurten |
|---|---|---|---|
| Claude Opus 5.5 | $4 / $20 | ongeveer $0,02 tot $0,04 | ongeveer $20 tot $40 |
| **Claude Sonnet 5.5 (gekozen)** | $2 / $10 | ongeveer $0,01 tot $0,02 | ongeveer $10 tot $20 |
| Claude Haiku 5.5 | $0,10 / $0,50 | minder dan $0,001 | ongeveer $1 |
