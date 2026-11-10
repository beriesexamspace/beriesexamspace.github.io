(function () {
  'use strict';
  var BM = window.BM = window.BM || {};

  // De stappen van de rondleiding. De motor staat in js/uitleg.js (lees daar het contract).
  //
  // Een stap: { titel, tekst, doel, plek, anker, voor, na, wacht, knop }
  //   doel   functie die een schermpunt {x, y}, een DOM-element of null (midden) geeft
  //   voor   loopt vlak voor de stap (bv. de pop-up openen), na loopt bij het verlaten
  //
  // Let op: tijdens de uitleg blokkeert de motor klikken naar de app. Daarom openen de
  // stappen zelf de pop-up of het notitiepaneel (voor), in plaats van dat de gebruiker klikt.
  // Een doel dat nog niet bestaat (bv. geen tak) valt terug op het hoofdpunt.

  var D = BM.uitleg.doelen;
  var A = BM.uitleg.acties;

  function projectVeilig() {
    try {
      return BM.store.getProject(BM.store.currentId()) || null;
    } catch (e) {
      return null;
    }
  }

  // Id van het hoofdpunt, of null.
  function hoofdId() {
    var p = projectVeilig();
    return (p && p.rootId) || null;
  }

  // Id van de eerste tak van het hoofdpunt, of null als er nog geen tak is.
  function eersteTakId() {
    var p = projectVeilig();
    var root = p && p.nodes && p.nodes[p.rootId];
    return (root && root.children && root.children[0]) || null;
  }

  // Het punt waar de pop-up bij hoort: de eerste tak, anders het hoofdpunt.
  function puntId() {
    return eersteTakId() || hoofdId();
  }

  // Opent de pop-up van de eerste tak (of van het hoofdpunt).
  function openTak() {
    var id = puntId();
    try {
      if (id && BM.bus) BM.bus.emit('ui:open-popup', { nodeId: id });
    } catch (e) {}
  }

  // Opent het notitiepaneel van de eerste tak (of van het hoofdpunt).
  function openNotitie() {
    var id = puntId();
    try {
      if (id && BM.bus) BM.bus.emit('ui:open-editor', { nodeId: id });
    } catch (e) {}
  }

  // Doel: het punt op het scherm (eerste tak, anders het hoofdpunt).
  function doelPunt() {
    return D.eersteTak() || D.hoofdpunt();
  }

  BM.uitlegStappen = [
    {
      titel: 'Dit is je hoofdpunt',
      tekst: 'Alles begint bij dit witte puntje in het midden. Hier hangt straks je hele mindmap aan.',
      doel: D.hoofdpunt,
      plek: 'auto',
      voor: A.sluitAlles
    },
    {
      titel: 'Een menu openen',
      tekst: 'Klik op een puntje. Er opent een menu met knoppen.',
      doel: D.el('.bm-popup'),
      plek: 'linksboven',
      anker: 'links',
      voor: openTak
    },
    {
      titel: 'Een tak maken',
      tekst: 'Met Add branch maak je een nieuwe tak. Met de teller ernaast maak je er meteen meerdere.',
      doel: D.el('.bm-popup__btn--add'),
      plek: 'auto',
      anker: 'links'
    },
    {
      titel: 'De naam aanpassen',
      tekst: 'Met Rename verander je de naam van een tak. Enter slaat de naam op.',
      doel: D.el('.bm-popup__btn--rename'),
      plek: 'auto',
      anker: 'links'
    },
    {
      titel: 'Een kleur kiezen',
      tekst: 'Kies een bolletje. De kleur loopt door de hele tak, tot aan de laatste puntjes.',
      doel: D.el('.bm-popup__colors'),
      plek: 'linksboven',
      anker: 'links'
    },
    {
      titel: 'Notities schrijven',
      tekst: 'Dit is het notitiepaneel. Wat je hier typt wordt vanzelf bewaard. Met Bewerken pas je de kleur en de takken aan.',
      doel: D.el('.bm-editor-edit'),
      plek: 'auto',
      anker: 'boven',
      voor: openNotitie
    },
    {
      titel: 'Verslepen',
      tekst: 'Sleep een puntje waar je het wilt, het blijft daar staan. Met Losmaken in het menu schikt het zich weer vanzelf.',
      doel: doelPunt,
      plek: 'auto',
      voor: A.sluitAlles
    },
    {
      titel: 'De afstand',
      tekst: 'Met de knop Afstand bepaal je de ruimte tussen de puntjes. Schuif naar rechts voor meer ruimte.',
      doel: D.el('.bm-view__trigger'),
      plek: 'auto',
      voor: A.sluitAlles
    },
    {
      titel: 'Het accountmenu',
      tekst: 'Achter de knop met je beginletter zit je accountmenu. Daar kies je de themakleur en bekijk je deze uitleg opnieuw.',
      doel: D.el('#bm-account > button'),
      plek: 'auto',
      voor: A.sluitAlles
    },
    {
      titel: 'Veel succes!',
      tekst: 'Je kunt nu beginnen met je eigen mindmap. Deze uitleg vind je altijd terug in het accountmenu.',
      doel: null
    }
  ];
})();
