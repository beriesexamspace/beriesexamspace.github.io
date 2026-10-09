# Opdracht: weekoverzicht met grafiek en verbeterpunten

## Doel
De pagina `voortgang.html` wordt het weekoverzicht van de student: een grafiek van de laatste zeven dagen, de cijfers van deze week tegenover vorige week, de drie zwakste hoofdstukken met een oefenknop, en wat goed gaat. De bestaande lijst per vak en per hoofdstuk blijft eronder staan. Geen betaalslot in deze opdracht: de pagina werkt voor iedereen die ingelogd is.

## Bestanden
- `voortgang.html` (nieuwe blokken boven de bestaande lijst; stijl in de `<style>` van die pagina)
- `assets/vak.js` (alleen punt 6: starten via een URL-parameter)
- `assets/inzichten.js` (alleen punt 7: tekst van de link)
- `README.md` (korte alinea onder "Inzichten")
- Alle html-bestanden: cachenummer `?v=39` naar `?v=40` (ook de regel `vak/${id}/data.js?v=39` in `voortgang.html`)

NIET aanraken: `supabase/`, `vak/*/index.html`, `vak/*/data.js`, `assets/style.css`, `hub.html`. Geen nieuwe bibliotheek, geen nieuwe tabel; de tabellen `sessies` (vak, niveau, modus, goed, totaal, gemaakt_op) en `voortgang` (vak, hoofdstuk, laatst_goed, laatst_totaal) bestaan al en zijn per gebruiker leesbaar.

## Gewenst gedrag
1. **Gegevens.** Na `await auth.gereed` en `auth.gebruiker()` één keer ophalen: alle `sessies` van de gebruiker met `gemaakt_op` in de laatste 14 dagen (`.gte('gemaakt_op', ...)`, lokale tijd van de browser, dag loopt van 00:00 tot 24:00) en de bestaande `voortgang`-query. Dagen indelen in "deze week" (vandaag en de zes dagen ervoor) en "vorige week" (de zeven dagen daarvoor). Hard-sessies (`niveau = 'hard'`) tellen mee in de grafiek en de weektegels; rijen uit `voortgang` met een vak dat eindigt op `__hard` blijven buiten de hoofdstukblokken, net als nu.

2. **Grafiek "Laatste zeven dagen"** bovenaan, direct onder de `<h1>`, als `<figure class="vg-week" id="vg-week">` met een inline `<svg>` die je zelf tekent (geen bibliotheek). Zeven staven, links de oudste dag, rechts vandaag. Per dag:
   - hoogte = aantal gemaakte vragen (som van `totaal`), fill `var(--accent-zacht)` met een rand van 1,5 px `var(--accent)`;
   - daarin van onderen een tweede vlak in `var(--teal)` met hoogte = aantal goede antwoorden (som van `goed`);
   - boven de staaf het aantal vragen als getal (`var(--ink-soft)`, 12 px), onder de staaf de dagletters (`ma`, `di`, ... via `Intl.DateTimeFormat('nl-BE', { weekday: 'short' })`), vandaag vet en in `var(--ink)`;
   - een dag zonder sessies: een lijntje van 2 px in `var(--surface)` op de basislijn, geen getal.
   De hoogste dag bepaalt de schaal; bij nul vragen in alle zeven dagen toont de figuur de staven op nul en daaronder de zin "Deze week nog niets geoefend. Kies een vak op de hub." (met link naar `hub.html`). Onder de svg een `<figcaption>` met de legenda: een vierkantje blauw "gemaakt", een vierkantje teal "goed". Voor schermlezers: `role="img"` op de svg met een `aria-label` die de zeven dagen opsomt ("ma 12 vragen, 9 goed; ..."). De staven mogen vanaf nul omhoog animeren (transform, 500 ms, `var(--ease)`); bij `prefers-reduced-motion: reduce` geen animatie.

3. **Tegels "Deze week"** onder de grafiek in dezelfde stijl als de bestaande `.vg-tegel`: sessies (aantal rijen), vragen (som `totaal`), score (som `goed` / som `totaal`, afgerond op hele procenten). Onder de tegels één regel `<p class="vg-verschil">`: verschil in procentpunten met vorige week, bijvoorbeeld "+8 punten tegenover vorige week" (teal, `var(--teal-tekst)`) of "-5 punten tegenover vorige week" (`var(--ink-soft)`, nooit rood); bij nul "Gelijk aan vorige week"; vorige week zonder sessies: "Vorige week nog niets geoefend". Deze week zonder sessies: tegels op 0 en de verschilregel weglaten.

4. **"Verbeterpunten"** als `<section class="vg-blok" id="vg-verbeter">` met `<h2>`: de drie hoofdstukken (over alle vakken) met de laagste `laatst_goed / laatst_totaal`, alleen rijen met `laatst_totaal >= 3` en score onder 80%. Per hoofdstuk een `.kaart` met vaknaam (klein, `var(--ink-soft)`), hoofdstuknaam, score in procenten, en een knop `<a class="knop-secundair">Oefen dit hoofdstuk →</a>` naar `vak/<vakid>/?hoofdstuk=<hoofdstuk-id>`. Hoofdstuknamen komen uit `data.js` van het vak via de bestaande `laadVak`. Zijn er geen zulke hoofdstukken: de sectie verbergen (`hidden`), niet een lege kop tonen.

5. **"Gaat goed"** als `<section class="vg-blok" id="vg-goed">`: hoofdstukken met `laatst_totaal >= 3` en score 80% of hoger, als rij van chips (`<ul class="vg-chips">`, elke chip "Vaknaam · Hoofdstuk · 92%", achtergrond `var(--teal-zacht)`, tekst `var(--teal-tekst)`), gesorteerd op score aflopend, maximaal 6 chips en daarna één chip "en N meer" zonder link. Geen hoofdstukken: sectie verbergen.

6. **Starten via URL** in `assets/vak.js`: staat er `?hoofdstuk=<id>` in de URL van een vakpagina en bestaat dat id in `data.hoofdstukken`, dan start na het laden (en na de inlogcontrole die er al is) meteen een Training op niveau normaal met alle vragen van dat hoofdstuk, precies zoals de Comit-knop "Oefen <hoofdstuk> →" dat doet. Daarna de parameter uit de URL halen met `history.replaceState`, zodat verversen niet opnieuw start. Onbekend id: negeren en het keuzescherm tonen zoals nu.

7. **Link vanaf Profiel**: in `assets/inzichten.js` de bestaande link "Alles per hoofdstuk →" hernoemen naar "Weekoverzicht →" (zelfde href `voortgang.html`). Verder niets aan Profiel veranderen; `voortgang.html` komt niet in de nav en niet op de hub.

8. **Volgorde op de pagina**: h1, grafiek, tegels deze week + verschilregel, Verbeterpunten, Gaat goed, dan de bestaande samenvatting en lijst per vak, dan "Nog niet geoefend". Bestaande blokken en hun id's niet hernoemen. Mobiel (375 px): grafiek vult de breedte, staven minstens 24 px breed, chips wrappen. Licht en donker thema via de bestaande tokens; geen losse kleurcodes in de nieuwe css.

9. **Vaste regels** (zie AGENTS.md): nergens het woord "gratis", geen gedachtestreepjes in zichtbare tekst, geen namen van derden, geen persoonsgegevens of sleutels in de code, knoppen minstens 44 px hoog, alles in hetzelfde tabblad.

## Klaar als
- Ingelogd met een account dat sessies heeft: de grafiek toont zeven dagen met de juiste aantallen (controleer één dag met de hand tegen de tabel `sessies`), de tegels kloppen, en de verschilregel toont de juiste tekst voor de vier gevallen uit punt 3.
- Account zonder sessies: grafiek op nul met de zin uit punt 2, geen consolefouten, Verbeterpunten en Gaat goed verborgen.
- Knop "Oefen dit hoofdstuk →" opent het vak en start meteen een Training met alleen dat hoofdstuk; verversen start niet opnieuw.
- Op Profiel staat "Weekoverzicht →" en die opent `voortgang.html`.
- Cachenummer 40 in alle html-bestanden; README aangevuld; licht en donker en 375 px getest; `node --check assets/vak.js` en `node --check assets/inzichten.js` slagen.
