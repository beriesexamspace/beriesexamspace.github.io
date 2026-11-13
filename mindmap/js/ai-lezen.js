(function () {
  'use strict';
  var BM = window.BM = window.BM || {};

  // Bestanden inlezen met AI.
  // Iemand sleept een bestand (pdf, Word, PowerPoint, tekst of foto) op de mindmap of kiest het
  // via de pop-up of het accountmenu. De browser haalt de tekst eruit (Word en PowerPoint) of
  // stuurt het bestand zelf mee (pdf en foto). De AI maakt er een boom van en die komt als
  // nieuwe tak in de mindmap.
  //
  // Twee manieren om de AI te betalen:
  // 1. AI van Berie: de sleutel van Berat via de edge function ai-inlezen. Alleen voor accounts
  //    die Berat aanzet, met een daglimiet (public.ai_toegang).
  // 2. Eigen sleutel: de gebruiker plakt zijn eigen Claude-sleutel. Die blijft alleen in deze
  //    browser (localStorage, per account) en gaat rechtstreeks naar api.anthropic.com.
  // Eerst AI van Berie (als die aan staat en er beurten over zijn), anders de eigen sleutel.

  var MAX_BESTANDEN = 5;
  var MAX_BYTES_TOTAAL = 8 * 1024 * 1024;   // ruwe bytes samen (base64 maakt het ~1,33x groter)
  var MAX_VERZOEK = 11.5 * 1024 * 1024;     // hele aanvraag; de server weigert boven 12 MB
  var MAX_UITGEPAKT = 30 * 1024 * 1024;     // grens voor een uitgepakt onderdeel van docx/pptx
  var MAX_TEKST_TEKENS = 400000;
  var MAX_AFBEELDING_ZIJDE = 1800;
  var SLEUTEL_PREFIX = 'bm-ai-sleutel:';
  var SLEUTEL_PATROON = /^sk-ant-[A-Za-z0-9_-]{20,300}$/;
  var ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
  var TIMEOUT_MS = 180000;

  var FOUTEN = {
    geen_ai: 'AI van Berie staat niet aan voor jouw account.',
    limiet: 'Je hebt vandaag al je AI-beurten gebruikt. Morgen kan het weer, of vul je eigen sleutel in.',
    sleutel: 'Je eigen sleutel werkt niet. Kijk hem na in je accountmenu.',
    tegoed: 'Er staat geen tegoed meer op je eigen Claude-account.',
    druk: 'De AI is even te druk. Probeer het zo opnieuw.',
    bestand: 'De AI kon dit bestand niet lezen. Probeer een kleiner bestand of sla het op als pdf.',
    leeg: 'De AI vond niets om in je mindmap te zetten.',
    te_lang: 'Het bestand was te lang voor een keer. Probeer een deel ervan (bijvoorbeeld een hoofdstuk).',
    te_groot: 'Te groot. Samen mogen de bestanden hooguit 8 MB zijn.',
    te_veel: 'Hooguit ' + MAX_BESTANDEN + ' bestanden tegelijk.',
    netwerk: 'Geen verbinding. Probeer het opnieuw.',
    niet_ingelogd: 'Log opnieuw in en probeer het nog eens.',
    zip: 'Dit Word- of PowerPoint-bestand kon niet gelezen worden. Sla het op als pdf en probeer opnieuw.',
    oud: 'Oude .doc- en .ppt-bestanden lukken niet. Sla het op als .docx, .pptx of .pdf.',
    soort: 'Dit soort bestand lukt niet. Gebruik pdf, Word, PowerPoint, tekst of een foto.',
    leeg_bestand: 'In dit bestand staat geen tekst.',
    geen_project: 'Open eerst een mindmap.',
    bezig: 'Er wordt al een bestand ingelezen.',
    serverfout: 'Er ging iets mis bij de AI. Probeer het later opnieuw.',
    ai_fout: 'Er ging iets mis bij de AI. Probeer het later opnieuw.',
    afgebroken: ''
  };

  var bezig = null;          // { ctrl, ui } tijdens het inlezen
  var popupNodeId = null;    // punt waarvan de pop-up nu open is
  var statusCache = null;    // { tijd, data }
  var STATUS_GELDIG_MS = 30000;

  // ---------- hulpjes ----------

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function toast(text, opts) {
    if (typeof BM.toast === 'function') return BM.toast(text, opts);
    return { close: function () {} };
  }

  function warn(msg, err) {
    try { console.warn('[BM.ai] ' + msg, err || ''); } catch (e) { /* geen console */ }
  }

  function fout(code) {
    var e = new Error(code);
    e.aiCode = code;
    return e;
  }

  function foutTekst(err) {
    var code = err && err.aiCode;
    if (code && Object.prototype.hasOwnProperty.call(FOUTEN, code)) return FOUTEN[code];
    return FOUTEN.ai_fout;
  }

  function reduceMotion() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }

  function client() {
    return (BM.auth && typeof BM.auth.client === 'function') ? BM.auth.client() : null;
  }

  function gebruikerId() {
    var g = (BM.auth && typeof BM.auth.gebruiker === 'function') ? BM.auth.gebruiker() : null;
    return (g && g.id) ? String(g.id) : 'lokaal';
  }

  // ---------- eigen sleutel (alleen in deze browser, per account) ----------

  function sleutelNaam() { return SLEUTEL_PREFIX + gebruikerId(); }

  function leesSleutel() {
    try {
      var s = window.localStorage.getItem(sleutelNaam()) || '';
      return SLEUTEL_PATROON.test(s) ? s : '';
    } catch (e) { return ''; }
  }

  function bewaarSleutel(s) {
    try { window.localStorage.setItem(sleutelNaam(), s); return true; } catch (e) { return false; }
  }

  function wisSleutel() {
    try { window.localStorage.removeItem(sleutelNaam()); } catch (e) { /* niet erg */ }
  }

  function verkortSleutel(s) {
    return s ? s.slice(0, 10) + '...' + s.slice(-4) : '';
  }

  // ---------- AI van Berie: status ----------

  function rpc(naam, args) {
    var c = client();
    if (!c) return Promise.resolve({ fout: fout('niet_ingelogd'), data: null });
    var p;
    try { p = (args === undefined) ? c.rpc(naam) : c.rpc(naam, args); } catch (e) { return Promise.resolve({ fout: e, data: null }); }
    return Promise.resolve(p).then(function (r) {
      return { fout: (r && r.error) ? r.error : null, data: r ? r.data : null };
    }, function (e) { return { fout: e || fout('netwerk'), data: null }; });
  }

  function aiStatus(vers) {
    if (!client()) return Promise.resolve({ aan: false });
    if (!vers && statusCache && Date.now() - statusCache.tijd < STATUS_GELDIG_MS) {
      return Promise.resolve(statusCache.data);
    }
    return rpc('ai_status').then(function (r) {
      var d = (!r.fout && r.data && typeof r.data === 'object') ? r.data : { aan: false };
      statusCache = { tijd: Date.now(), data: d };
      return d;
    });
  }

  // ---------- bestanden lezen ----------

  function extensie(naam) {
    var m = /\.([a-z0-9]+)$/i.exec(String(naam || ''));
    return m ? m[1].toLowerCase() : '';
  }

  function soortVan(file) {
    var ext = extensie(file.name);
    var t = String(file.type || '').toLowerCase();
    if (ext === 'pdf' || t === 'application/pdf') return 'pdf';
    if (/^(png|jpe?g|gif|webp)$/.test(ext) || /^image\/(png|jpeg|gif|webp)$/.test(t)) return 'afbeelding';
    if (/^(heic|heif)$/.test(ext)) return 'soort';
    if (ext === 'docx') return 'docx';
    if (ext === 'pptx') return 'pptx';
    if (ext === 'doc' || ext === 'ppt') return 'oud';
    if (/^(txt|md|markdown|csv|tsv|json|html?|xml|srt|vtt)$/.test(ext) || /^text\//.test(t)) return 'tekst';
    return 'soort';
  }

  function alsBase64(blob) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () {
        var s = String(r.result || '');
        var i = s.indexOf(',');
        resolve(i >= 0 ? s.slice(i + 1) : '');
      };
      r.onerror = function () { reject(fout('bestand')); };
      r.readAsDataURL(blob);
    });
  }

  // Grote foto's kleiner maken (scheelt veel en de AI ziet het toch niet scherper).
  function afbeeldingType(file) {
    var t = String(file.type || '').toLowerCase();
    if (/^image\/(png|jpeg|gif|webp)$/.test(t)) return t;
    var ext = extensie(file.name);
    if (ext === 'png') return 'image/png';
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
    if (ext === 'gif') return 'image/gif';
    if (ext === 'webp') return 'image/webp';
    return '';
  }

  function verkleinAfbeelding(file) {
    var type = afbeeldingType(file);
    if (!type) return Promise.reject(fout('soort'));
    var klein = file.size <= 1.5 * 1024 * 1024 && type !== 'image/gif';
    if (klein || typeof createImageBitmap !== 'function') {
      return Promise.resolve({ blob: file, type: type });
    }
    return createImageBitmap(file).then(function (bmp) {
      var schaal = Math.min(1, MAX_AFBEELDING_ZIJDE / Math.max(bmp.width, bmp.height));
      var w = Math.max(1, Math.round(bmp.width * schaal));
      var h = Math.max(1, Math.round(bmp.height * schaal));
      var c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      var ctx = c.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(bmp, 0, 0, w, h);
      if (bmp.close) bmp.close();
      return new Promise(function (resolve) {
        c.toBlob(function (b) {
          resolve(b ? { blob: b, type: 'image/jpeg' } : { blob: file, type: type });
        }, 'image/jpeg', 0.85);
      });
    }, function () {
      return { blob: file, type: type };
    });
  }

  // Minimale zip-lezer (docx en pptx zijn zip-bestanden). Gebruikt DecompressionStream.
  function leesZip(buf) {
    var dv = new DataView(buf);
    var u8 = new Uint8Array(buf);
    var eocd = -1;
    var ondergrens = Math.max(0, buf.byteLength - 65557);
    for (var i = buf.byteLength - 22; i >= ondergrens; i--) {
      if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw fout('zip');
    var aantal = dv.getUint16(eocd + 10, true);
    var p = dv.getUint32(eocd + 16, true);
    var dec = new TextDecoder();
    var items = Object.create(null);
    for (var k = 0; k < aantal; k++) {
      if (p + 46 > buf.byteLength || dv.getUint32(p, true) !== 0x02014b50) break;
      var methode = dv.getUint16(p + 10, true);
      var grootte = dv.getUint32(p + 20, true);
      var uitgepakt = dv.getUint32(p + 24, true);
      var nlen = dv.getUint16(p + 28, true);
      var elen = dv.getUint16(p + 30, true);
      var clen = dv.getUint16(p + 32, true);
      var off = dv.getUint32(p + 42, true);
      var naam = dec.decode(u8.subarray(p + 46, p + 46 + nlen));
      items[naam] = { methode: methode, grootte: grootte, uitgepakt: uitgepakt, off: off };
      p += 46 + nlen + elen + clen;
    }
    return {
      namen: Object.keys(items),
      lees: function (naam) {
        var it = items[naam];
        if (!it || it.off + 30 > buf.byteLength || dv.getUint32(it.off, true) !== 0x04034b50) {
          return Promise.reject(fout('zip'));
        }
        if (it.uitgepakt > MAX_UITGEPAKT) return Promise.reject(fout('te_groot'));
        var start = it.off + 30 + dv.getUint16(it.off + 26, true) + dv.getUint16(it.off + 28, true);
        var data = u8.subarray(start, start + it.grootte);
        if (it.methode === 0) return Promise.resolve(dec.decode(data));
        if (it.methode !== 8 || typeof DecompressionStream !== 'function') return Promise.reject(fout('zip'));
        // Zelf lezen en tellen: een vals opgegeven grootte (zip-bom) mag het tabblad niet laten vastlopen.
        var lezer = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
        var delen = [];
        var totaal = 0;
        function pomp() {
          return lezer.read().then(function (r) {
            if (r.done) return new Blob(delen).text();
            totaal += r.value.byteLength;
            if (totaal > MAX_UITGEPAKT) {
              try { lezer.cancel(); } catch (e) { /* al klaar */ }
              throw fout('te_groot');
            }
            delen.push(r.value);
            return pomp();
          });
        }
        return pomp();
      }
    };
  }

  function xmlDoc(tekst) {
    var doc = new DOMParser().parseFromString(tekst, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) throw fout('zip');
    return doc;
  }

  // Alle elementen met deze lokale naam (w:p, a:t, ...), los van het voorvoegsel.
  function tags(node, lokaal) {
    return node.getElementsByTagNameNS('*', lokaal);
  }

  function tekstUitWord(xml) {
    var doc = xmlDoc(xml);
    var regels = [];
    var ps = tags(doc, 'p');
    function inFallback(n) {
      for (var a = n.parentNode; a && a.nodeType === 1; a = a.parentNode) if (a.localName === 'Fallback') return true;
      return false;
    }
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i];
      if (inFallback(p)) continue; // Word bewaart tekstvakken twee keer (Choice en Fallback)
      var stukken = [];
      var loop = function (n) {
        for (var c = n.firstChild; c; c = c.nextSibling) {
          if (c.nodeType !== 1) continue;
          var ln = c.localName;
          if (ln === 't') stukken.push(c.textContent || '');
          else if (ln === 'tab') stukken.push('\t');
          else if (ln === 'br' || ln === 'cr') stukken.push('\n');
          else if (ln !== 'p' && ln !== 'pPr' && ln !== 'Fallback') loop(c); // geneste alinea's komen apart aan bod
        }
      };
      loop(p);
      var regel = stukken.join('').trim();
      if (!regel) continue;
      var pPr = null;
      for (var c0 = p.firstChild; c0; c0 = c0.nextSibling) if (c0.nodeType === 1 && c0.localName === 'pPr') { pPr = c0; break; }
      var stijl = pPr ? tags(pPr, 'pStyle')[0] : null;
      var val = stijl ? (stijl.getAttribute('w:val') || stijl.getAttributeNS('*', 'val') || '') : '';
      if (/heading|kop|title|titel|titre|berschrift/i.test(val)) regel = '## ' + regel;
      regels.push(regel);
    }
    return regels.join('\n');
  }

  function tekstUitDia(xml) {
    var doc = xmlDoc(xml);
    var regels = [];
    var ps = tags(doc, 'p');
    for (var i = 0; i < ps.length; i++) {
      var ts = tags(ps[i], 't');
      var r = [];
      for (var j = 0; j < ts.length; j++) r.push(ts[j].textContent || '');
      var regel = r.join('').trim();
      if (regel) regels.push(regel);
    }
    return regels.join('\n');
  }

  function leesDocx(file) {
    return file.arrayBuffer().then(function (buf) {
      var zip = leesZip(buf);
      if (zip.namen.indexOf('word/document.xml') === -1) throw fout('zip');
      return zip.lees('word/document.xml').then(tekstUitWord);
    });
  }

  function leesPptx(file) {
    return file.arrayBuffer().then(function (buf) {
      var zip = leesZip(buf);
      var dias = zip.namen.map(function (n) {
        var m = /^ppt\/slides\/slide(\d+)\.xml$/.exec(n);
        return m ? { naam: n, nr: Number(m[1]) } : null;
      }).filter(Boolean).sort(function (a, b) { return a.nr - b.nr; });
      if (!dias.length) throw fout('zip');
      var uit = [];
      var keten = Promise.resolve();
      dias.forEach(function (d, i) {
        keten = keten.then(function () { return zip.lees(d.naam); }).then(function (xml) {
          var t = tekstUitDia(xml);
          if (t) uit.push('## Dia ' + (i + 1) + '\n' + t);
        });
      });
      return keten.then(function () { return uit.join('\n\n'); });
    });
  }

  // Maakt van de gekozen bestanden de lijst die naar de AI gaat.
  function maakBestanden(files) {
    files = Array.prototype.slice.call(files || []);
    if (!files.length) return Promise.reject(fout('soort'));
    if (files.length > MAX_BESTANDEN) return Promise.reject(fout('te_veel'));
    var totaal = 0;
    for (var i = 0; i < files.length; i++) {
      var s = soortVan(files[i]);
      if (s === 'oud' || s === 'soort') return Promise.reject(fout(s));
      totaal += files[i].size || 0;
    }
    if (totaal > MAX_BYTES_TOTAAL * 3) return Promise.reject(fout('te_groot'));

    var tekstTotaal = 0;
    var bytesTotaal = 0;
    var uit = [];
    var keten = Promise.resolve();
    files.forEach(function (f) {
      var soort = soortVan(f);
      var naam = String(f.name || 'bestand').slice(0, 200);
      keten = keten.then(function () {
        if (soort === 'pdf') {
          bytesTotaal += f.size;
          if (bytesTotaal > MAX_BYTES_TOTAAL) throw fout('te_groot');
          return alsBase64(f).then(function (b) { uit.push({ naam: naam, soort: 'pdf', type: 'application/pdf', data: b }); });
        }
        if (soort === 'afbeelding') {
          return verkleinAfbeelding(f).then(function (r) {
            bytesTotaal += r.blob.size;
            if (bytesTotaal > MAX_BYTES_TOTAAL) throw fout('te_groot');
            return alsBase64(r.blob).then(function (b) { uit.push({ naam: naam, soort: 'afbeelding', type: r.type, data: b }); });
          });
        }
        var lezen = soort === 'docx' ? leesDocx(f) : soort === 'pptx' ? leesPptx(f) : f.text();
        return Promise.resolve(lezen).then(function (t) {
          t = String(t || '').replace(/\r\n?/g, '\n').trim();
          if (!t) throw fout('leeg_bestand');
          if (tekstTotaal + t.length > MAX_TEKST_TEKENS) {
            t = t.slice(0, Math.max(0, MAX_TEKST_TEKENS - tekstTotaal));
            uit.afgekapt = true;
          }
          tekstTotaal += t.length;
          if (t) uit.push({ naam: naam, soort: 'tekst', type: 'text/plain', data: t });
        }, function (e) {
          throw (e && e.aiCode) ? e : fout('zip');
        });
      });
    });
    return keten.then(function () {
      if (!uit.length) throw fout('leeg_bestand');
      // Ongeveer de grootte van de aanvraag (tekst kan meer bytes per teken zijn).
      var schatting = 1024;
      uit.forEach(function (b) { schatting += (b.soort === 'tekst' ? b.data.length * 1.2 : b.data.length) + 200; });
      if (schatting > MAX_VERZOEK) throw fout('te_groot');
      return uit;
    });
  }

  // ---------- AI aanroepen ----------

  function metTimeout(ctrl) {
    var t = setTimeout(function () { try { ctrl.abort(); } catch (e) { /* al klaar */ } }, TIMEOUT_MS);
    return function () { clearTimeout(t); };
  }

  function viaServer(bestanden, ctrl) {
    var c = client();
    var cfg = BM.config || {};
    if (!c || !cfg.supabaseUrl) return Promise.reject(fout('niet_ingelogd'));
    return c.auth.getSession().then(function (r) {
      var tok = r && r.data && r.data.session && r.data.session.access_token;
      if (!tok) throw fout('niet_ingelogd');
      var stop = metTimeout(ctrl);
      return fetch(cfg.supabaseUrl.replace(/\/$/, '') + '/functions/v1/ai-inlezen', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + tok,
          'apikey': cfg.supabaseAnonKey || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bestanden: bestanden }),
        signal: ctrl.signal
      }).then(function (res) {
        stop();
        return res.json().catch(function () { return null; }).then(function (j) {
          if (res.status === 413) throw fout('te_groot');
          statusCache = null;
          if (!j || j.ok !== true) throw fout((j && j.fout) || 'ai_fout');
          var boom = BM.aiPrompt.maakBoomSchoon(j.boom);
          if (!boom) throw fout('leeg');
          return { boom: boom, over: j.over, weg: 'server' };
        });
      }, function (e) {
        stop();
        if (ctrl.signal.aborted) throw fout(bezig && bezig.geannuleerd ? 'afgebroken' : 'druk');
        throw (e && e.aiCode) ? e : fout('netwerk');
      });
    });
  }

  function berichtInhoud(bestanden) {
    var blokken = [];
    bestanden.forEach(function (b) {
      if (b.soort === 'pdf') {
        blokken.push({ type: 'text', text: 'Bestand: ' + b.naam });
        blokken.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: b.data } });
      } else if (b.soort === 'afbeelding') {
        blokken.push({ type: 'text', text: 'Bestand: ' + b.naam });
        blokken.push({ type: 'image', source: { type: 'base64', media_type: b.type, data: b.data } });
      } else {
        blokken.push({ type: 'text', text: 'Bestand: ' + b.naam + '\n<inhoud>\n' + b.data + '\n</inhoud>' });
      }
    });
    blokken.push({ type: 'text', text: 'Maak hier de mindmap van.' });
    return blokken;
  }

  function viaEigenSleutel(bestanden, sleutel, ctrl) {
    var P = BM.aiPrompt;
    var stop = metTimeout(ctrl);
    return fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'x-api-key': sleutel,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: P.MODEL,
        max_tokens: P.MAX_TOKENS,
        system: P.SYSTEEM,
        tools: [P.TOOL],
        tool_choice: { type: 'tool', name: P.TOOL.name },
        messages: [{ role: 'user', content: berichtInhoud(bestanden) }]
      }),
      signal: ctrl.signal
    }).then(function (res) {
      stop();
      return res.json().catch(function () { return null; }).then(function (j) {
        if (!res.ok) {
          var msg = String((j && j.error && j.error.message) || '');
          if (res.status === 401 || res.status === 403) throw fout('sleutel');
          if (/credit|balance|billing/i.test(msg)) throw fout('tegoed');
          if (res.status === 429 || res.status === 529 || res.status >= 500) throw fout('druk');
          if (res.status === 413) throw fout('te_groot');
          if (res.status === 400) throw fout('bestand');
          throw fout('ai_fout');
        }
        if (j && j.stop_reason === 'max_tokens') throw fout('te_lang');
        var blok = null;
        var inhoud = (j && Array.isArray(j.content)) ? j.content : [];
        for (var i = 0; i < inhoud.length; i++) if (inhoud[i] && inhoud[i].type === 'tool_use') { blok = inhoud[i]; break; }
        var boom = blok ? P.maakBoomSchoon(blok.input) : null;
        if (!boom) throw fout('leeg');
        return { boom: boom, weg: 'eigen' };
      });
    }, function (e) {
      stop();
      if (ctrl.signal.aborted) throw fout(bezig && bezig.geannuleerd ? 'afgebroken' : 'druk');
      throw (e && e.aiCode) ? e : fout('netwerk');
    });
  }

  // Welke weg? Eerst AI van Berie (als die aan staat en er beurten over zijn), anders de eigen sleutel.
  // Geeft null als geen van beide kan.
  function kiesWeg() {
    return aiStatus(true).then(function (st) {
      if (st && st.aan && st.over > 0) return { weg: 'server' };
      var s = leesSleutel();
      if (s) return { weg: 'eigen', sleutel: s };
      if (st && st.aan) throw fout('limiet');
      return null;
    });
  }

  // ---------- in de mindmap zetten ----------

  function doelPunt(nodeId) {
    if (nodeId && BM.store.getNode(nodeId)) return nodeId;
    if (popupNodeId && BM.store.getNode(popupNodeId)) return popupNodeId;
    var pid = BM.store.currentId();
    var proj = pid ? BM.store.getProject(pid) : null;
    return proj ? proj.rootId : null;
  }

  // Zet de boom onder ouderId. Takken komen er een voor een bij (korte animatie).
  // Geeft een Promise met {top, aantal}.
  function zetInMap(ouderId, boom, namen) {
    var top = BM.store.addNode(ouderId, boom.titel);
    if (!top) return Promise.reject(fout('geen_project'));
    BM.store.setText(top.id, 'Ingelezen met AI uit: ' + namen.join(', '));

    var lijst = [];
    (function plat(takken, ouderIndex) {
      takken.forEach(function (t) {
        var i = lijst.length;
        lijst.push({ t: t, ouder: ouderIndex });
        plat(t.takken || [], i);
      });
    })(boom.takken, -1);

    var ids = [];
    var stap = reduceMotion() ? 0 : Math.max(12, Math.min(45, Math.round(2400 / Math.max(1, lijst.length))));
    try { if (BM.camera && BM.camera.focusOn) BM.camera.focusOn(top.id); } catch (e) { /* niet erg */ }

    return new Promise(function (resolve) {
      var i = 0;
      function volgende() {
        // Per keer een paar takken als de stap 0 is (geen animatie), anders een per keer.
        var tot = stap ? i + 1 : lijst.length;
        for (; i < tot && i < lijst.length; i++) {
          var item = lijst[i];
          var ouder = item.ouder < 0 ? top.id : ids[item.ouder];
          if (!ouder || !BM.store.getNode(ouder)) { ids[i] = null; continue; }
          var n = BM.store.addNode(ouder, item.t.titel);
          ids[i] = n ? n.id : null;
          if (n && item.t.tekst) BM.store.setText(n.id, item.t.tekst);
        }
        if (i < lijst.length && BM.store.getNode(top.id)) setTimeout(volgende, stap);
        else resolve({ top: top, aantal: ids.filter(Boolean).length });
      }
      volgende();
    });
  }

  // ---------- bezig-kaartje ----------

  function toonBezig(tekst) {
    var kaart = el('div', 'bm-ai-bezig');
    kaart.setAttribute('role', 'status');
    kaart.setAttribute('aria-live', 'polite');
    var bol = el('span', 'bm-ai-bezig__bol');
    bol.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 3; i++) bol.appendChild(el('span'));
    var t = el('span', 'bm-ai-bezig__tekst', tekst);
    var stop = el('button', 'bm-btn bm-btn--small bm-ai-bezig__stop', 'Annuleren');
    stop.type = 'button';
    kaart.appendChild(bol);
    kaart.appendChild(t);
    kaart.appendChild(stop);
    document.body.appendChild(kaart);
    requestAnimationFrame(function () { kaart.classList.add('is-zichtbaar'); });
    return {
      tekst: function (s) { t.textContent = s; },
      stopKnop: stop,
      weg: function () {
        kaart.classList.remove('is-zichtbaar');
        setTimeout(function () { if (kaart.parentNode) kaart.parentNode.removeChild(kaart); }, 260);
      }
    };
  }

  // ---------- hoofdflow ----------

  function inlezen(files, nodeId) {
    if (bezig) { toast(FOUTEN.bezig); return Promise.resolve(false); }
    if (!BM.aiPrompt || !BM.store) return Promise.resolve(false);
    var doel = doelPunt(nodeId);
    if (!doel) { toast(FOUTEN.geen_project, { error: true }); return Promise.resolve(false); }
    files = Array.prototype.slice.call(files || []);
    var namen = files.map(function (f) { return String(f.name || 'bestand'); });

    var ctrl = new AbortController();
    var ui = toShow();
    function toShow() {
      return toonBezig(files.length === 1 ? 'Bestand lezen: ' + namen[0] : files.length + ' bestanden lezen');
    }
    bezig = { ctrl: ctrl, ui: ui, geannuleerd: false };
    ui.stopKnop.addEventListener('click', function () {
      if (!bezig) return;
      bezig.geannuleerd = true;
      try { ctrl.abort(); } catch (e) { /* al klaar */ }
    });

    var gekozen = null;
    var tekstAfgekapt = false;
    return maakBestanden(files).then(function (bestanden) {
      tekstAfgekapt = !!bestanden.afgekapt;
      if (bezig.geannuleerd) throw fout('afgebroken');
      return kiesWeg().then(function (w) {
        if (!w) throw fout('geen_weg');
        gekozen = w;
        ui.tekst('AI maakt er takken van...');
        return w.weg === 'server' ? viaServer(bestanden, ctrl) : viaEigenSleutel(bestanden, w.sleutel, ctrl);
      });
    }).then(function (res) {
      if (bezig.geannuleerd) throw fout('afgebroken');
      ui.tekst('Takken toevoegen...');
      ui.stopKnop.hidden = true; // vanaf hier is het werk gedaan; ongedaan maken kan via de melding
      // Bestaat het doel nog? Anders onder het hoofdpunt van het huidige project.
      var ouder = BM.store.getNode(doel) ? doel : doelPunt(null);
      if (!ouder) throw fout('geen_project');
      return zetInMap(ouder, res.boom, namen).then(function (r) {
        var tekst = r.aantal + ' takken toegevoegd';
        if (res.weg === 'server' && typeof res.over === 'number') tekst += '. Nog ' + res.over + ' AI-beurten vandaag';
        if (tekstAfgekapt) tekst += '. Het materiaal was lang, het laatste deel is niet gelezen';
        toast(tekst, {
          ms: 9000,
          action: 'Ongedaan maken',
          onAction: function () {
            try { BM.store.removeNode(r.top.id); } catch (e) { warn('ongedaan maken mislukt', e); }
          }
        });
        return true;
      });
    }).catch(function (e) {
      var code = e && e.aiCode;
      if (code === 'afgebroken') { toast('Inlezen gestopt'); return false; }
      if (code === 'geen_weg') { toonGeenWeg(); return false; }
      if (!code) warn('inlezen mislukt', e);
      // Eigen sleutel werkt niet: menu openen zodat hij meteen aangepast kan worden.
      var opts = { error: true, ms: 7000 };
      if (code === 'sleutel' || code === 'limiet' || code === 'tegoed') {
        opts.action = 'Accountmenu';
        opts.onAction = openMenuBijSleutel;
      }
      toast(foutTekst(e), opts);
      return false;
    }).then(function (ok) {
      ui.weg();
      bezig = null;
      return ok;
    });
  }

  function toonGeenWeg() {
    toast('Voor AI heb je een eigen Claude-sleutel nodig, of vraag Berat om AI voor je aan te zetten.', {
      ms: 10000,
      action: 'Sleutel invullen',
      onAction: openMenuBijSleutel
    });
  }

  function openMenuBijSleutel() {
    var knop = document.querySelector('#bm-account > button');
    var menu = document.querySelector('#bm-account .bm-account__menu');
    if (!knop) return;
    if (!menu || menu.hidden) knop.click();
    setTimeout(function () {
      var veld = document.querySelector('#bm-account .bm-ai-menu__sleutelveld');
      var deel = document.querySelector('#bm-account .bm-ai-menu');
      if (deel && deel.scrollIntoView) deel.scrollIntoView({ block: 'nearest', behavior: reduceMotion() ? 'auto' : 'smooth' });
      if (veld) veld.focus({ preventScroll: true });
    }, 60);
  }

  // ---------- bestand kiezen ----------

  var kiezer = null;
  var kiesVoor = null;

  function kiesBestand(nodeId) {
    if (bezig) { toast(FOUTEN.bezig); return; }
    if (!kiezer) {
      kiezer = el('input');
      kiezer.type = 'file';
      kiezer.multiple = true;
      kiezer.accept = '.pdf,.docx,.pptx,.txt,.md,.csv,.png,.jpg,.jpeg,.webp,.gif,application/pdf,image/*,text/plain';
      kiezer.hidden = true;
      kiezer.addEventListener('change', function () {
        var files = kiezer.files ? Array.prototype.slice.call(kiezer.files) : [];
        kiezer.value = '';
        if (files.length) inlezen(files, kiesVoor);
      });
      document.body.appendChild(kiezer);
    }
    kiesVoor = nodeId || null;
    kiezer.click();
  }

  // ---------- slepen en loslaten ----------

  var sleepLaag = null;
  var sleepTeller = 0;
  var sleepTimer = 0;

  // Vangnet: komt er een tijdje geen dragover meer, dan is het slepen voorbij (ook als
  // een dragleave verloren ging omdat een element onder de muis verdween).
  function sleepVangnet() {
    clearTimeout(sleepTimer);
    sleepTimer = setTimeout(function () {
      sleepTeller = 0;
      toonSleep(false);
    }, 400);
  }

  function heeftBestanden(e) {
    var dt = e.dataTransfer;
    if (!dt || !dt.types) return false;
    for (var i = 0; i < dt.types.length; i++) if (dt.types[i] === 'Files') return true;
    return false;
  }

  // Alleen op de mindmap zelf: niet tijdens inloggen of welkomstschermen.
  function mapActief() {
    var auth = document.getElementById('bm-auth');
    if (auth && !auth.hidden && auth.offsetParent !== null) return false;
    return !!(BM.store && BM.store.currentId && BM.store.currentId());
  }

  function maakSleepLaag() {
    if (sleepLaag) return sleepLaag;
    sleepLaag = el('div', 'bm-ai-sleep');
    sleepLaag.setAttribute('aria-hidden', 'true');
    var kaart = el('div', 'bm-ai-sleep__kaart');
    var icoon = el('div', 'bm-ai-sleep__icoon');
    icoon.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M7 9l5-5 5 5"/><path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"/></svg>';
    kaart.appendChild(icoon);
    kaart.appendChild(el('div', 'bm-ai-sleep__titel', 'Laat los om in te lezen'));
    sleepLaag._sub = el('div', 'bm-ai-sleep__sub', '');
    kaart.appendChild(sleepLaag._sub);
    sleepLaag.appendChild(kaart);
    document.body.appendChild(sleepLaag);
    return sleepLaag;
  }

  function toonSleep(aan) {
    var l = maakSleepLaag();
    if (aan) {
      var node = popupNodeId && BM.store.getNode(popupNodeId);
      l._sub.textContent = 'De AI maakt er takken van onder "' + (node ? node.title : 'het hoofdpunt') + '". PDF, Word, PowerPoint, tekst of foto.';
    }
    l.classList.toggle('is-zichtbaar', !!aan);
  }

  window.addEventListener('dragenter', function (e) {
    if (!heeftBestanden(e) || !mapActief()) return;
    e.preventDefault();
    sleepTeller++;
    if (sleepTeller === 1) toonSleep(true);
  });
  window.addEventListener('dragover', function (e) {
    if (!heeftBestanden(e)) return;
    // Altijd: anders opent de browser het bestand en is de mindmap weg.
    e.preventDefault();
    var actief = mapActief();
    if (e.dataTransfer) e.dataTransfer.dropEffect = actief ? 'copy' : 'none';
    if (actief) {
      if (!sleepTeller) { sleepTeller = 1; toonSleep(true); }
      sleepVangnet();
    }
  });
  window.addEventListener('dragleave', function (e) {
    if (!heeftBestanden(e)) return;
    sleepTeller = Math.max(0, sleepTeller - 1);
    if (!sleepTeller) toonSleep(false);
  });
  window.addEventListener('drop', function (e) {
    if (!heeftBestanden(e)) return;
    e.preventDefault();
    sleepTeller = 0;
    clearTimeout(sleepTimer);
    toonSleep(false);
    if (!mapActief()) return;
    var files = e.dataTransfer && e.dataTransfer.files ? Array.prototype.slice.call(e.dataTransfer.files) : [];
    if (files.length) inlezen(files, null);
  });

  if (BM.bus) {
    BM.bus.on('ui:popup-opened', function (d) { popupNodeId = d && d.nodeId ? d.nodeId : null; });
    BM.bus.on('ui:popup-closed', function () { popupNodeId = null; });
  }

  // ---------- deel in het accountmenu ----------

  function knop(tekst, cls) {
    var b = el('button', cls || 'bm-account__actie', tekst);
    b.type = 'button';
    return b;
  }

  function veld(cls, type, placeholder, label) {
    var v = el('input', 'bm-account__naamveld ' + (cls || ''));
    v.type = type;
    v.placeholder = placeholder;
    v.setAttribute('aria-label', label);
    v.setAttribute('autocomplete', 'off');
    v.spellcheck = false;
    return v;
  }

  // opts.sluit(): sluit het accountmenu.
  function bouwMenuDeel(opts) {
    opts = opts || {};
    var deel = el('div', 'bm-account__deel bm-ai-menu');
    deel.appendChild(el('div', 'bm-account__kop', 'AI: bestanden inlezen'));
    deel.appendChild(el('div', 'bm-ai-menu__uitleg',
      'Sleep een pdf, Word, PowerPoint of foto op je mindmap. De AI maakt er takken van.'));

    var status = el('div', 'bm-ai-menu__status', 'AI van Berie: even kijken...');
    status.setAttribute('data-staat', 'laden');
    deel.appendChild(status);

    var kies = knop('Bestand kiezen');
    kies.addEventListener('click', function () {
      if (typeof opts.sluit === 'function') opts.sluit();
      kiesBestand(null);
    });
    deel.appendChild(kies);

    // Eigen sleutel
    var sleutelDeel = el('div', 'bm-ai-menu__sleutel');
    deel.appendChild(sleutelDeel);

    function tekenSleutel() {
      while (sleutelDeel.firstChild) sleutelDeel.removeChild(sleutelDeel.firstChild);
      var s = leesSleutel();
      if (s) {
        var rij = el('div', 'bm-ai-menu__rij');
        rij.appendChild(el('span', 'bm-ai-menu__sleuteltekst', 'Eigen sleutel: ' + verkortSleutel(s)));
        var wis = knop('Wissen', 'bm-btn bm-btn--small bm-ai-menu__wis');
        wis.addEventListener('click', function () {
          wisSleutel();
          tekenSleutel();
          toast('Eigen sleutel gewist');
        });
        rij.appendChild(wis);
        sleutelDeel.appendChild(rij);
        return;
      }
      var invul = el('div', 'bm-ai-menu__rij');
      var v = veld('bm-ai-menu__sleutelveld', 'password', 'Eigen Claude-sleutel (sk-ant-...)', 'Eigen Claude-sleutel');
      v.maxLength = 300;
      var ok = knop('Opslaan', 'bm-btn bm-btn--small bm-btn--primary bm-ai-menu__bewaar');
      var foutRegel = el('div', 'bm-ai-menu__fout', '');
      function bewaar() {
        var w = v.value.trim();
        if (!SLEUTEL_PATROON.test(w)) {
          foutRegel.textContent = 'Dit lijkt geen Claude-sleutel. Hij begint met sk-ant-.';
          v.classList.remove('is-schud');
          void v.offsetWidth;
          v.classList.add('is-schud');
          return;
        }
        if (!bewaarSleutel(w)) {
          foutRegel.textContent = 'Opslaan lukt niet in deze browser (privévenster?).';
          return;
        }
        tekenSleutel();
        toast('Eigen sleutel opgeslagen');
      }
      ok.addEventListener('click', bewaar);
      v.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); bewaar(); }
      });
      v.addEventListener('input', function () { foutRegel.textContent = ''; });
      invul.appendChild(v);
      invul.appendChild(ok);
      sleutelDeel.appendChild(invul);
      sleutelDeel.appendChild(foutRegel);
      sleutelDeel.appendChild(el('div', 'bm-ai-menu__hint',
        'Blijft alleen in deze browser en wordt gewist als je uitlogt. De kosten gaan naar jouw eigen Claude-account.'));
    }
    tekenSleutel();

    // Status van AI van Berie (opnieuw opgehaald elke keer dat het menu opengaat)
    function laadStatus() {
      aiStatus(true).then(function (st) {
        if (st && st.aan) {
          status.textContent = 'AI van Berie: nog ' + st.over + ' van ' + st.daglimiet + ' beurten vandaag';
          status.setAttribute('data-staat', st.over > 0 ? 'aan' : 'op');
        } else {
          status.textContent = 'AI van Berie: niet aan voor jouw account';
          status.setAttribute('data-staat', 'uit');
        }
      });
    }

    // Beheer (alleen Berat): AI aan of uit per mailadres
    var beheer = null;
    function laadBeheer() {
      rpc('is_beheerder').then(function (r) {
        var mag = !r.fout && r.data === true;
        if (mag && !beheer) {
          beheer = bouwBeheer();
          deel.appendChild(beheer);
        } else if (mag && beheer && beheer._laadLijst) {
          beheer._laadLijst();
        } else if (!mag && beheer && !r.fout) {
          if (beheer.parentNode) beheer.parentNode.removeChild(beheer);
          beheer = null;
        }
      });
    }

    laadStatus();
    laadBeheer();
    deel.ververs = function () {
      laadStatus();
      laadBeheer();
      // Het sleutelveld niet wegtekenen terwijl iemand erin typt.
      if (!sleutelDeel.contains(document.activeElement)) tekenSleutel();
    };
    return deel;
  }

  function bouwBeheer() {
    var b = el('div', 'bm-ai-beheer');
    b.appendChild(el('div', 'bm-account__kop', 'Beheer: AI van Berie'));
    var mail = veld('bm-ai-beheer__mail', 'email', 'Mailadres', 'Mailadres');
    mail.maxLength = 254;
    var rij = el('div', 'bm-ai-menu__rij');
    var limiet = veld('bm-ai-beheer__limiet', 'number', 'Per dag', 'Beurten per dag');
    limiet.min = '1';
    limiet.max = '500';
    limiet.value = '20';
    var aan = knop('Aanzetten', 'bm-btn bm-btn--small bm-btn--primary');
    var uit = knop('Uitzetten', 'bm-btn bm-btn--small');
    rij.appendChild(limiet);
    rij.appendChild(aan);
    rij.appendChild(uit);
    var melding = el('div', 'bm-ai-menu__fout', '');
    var lijst = el('div', 'bm-ai-beheer__lijst');
    b.appendChild(mail);
    b.appendChild(rij);
    b.appendChild(melding);
    b.appendChild(lijst);

    function laadLijst() {
      rpc('ai_lijst').then(function (r) {
        while (lijst.firstChild) lijst.removeChild(lijst.firstChild);
        var items = Array.isArray(r.data) ? r.data : [];
        if (!items.length) {
          lijst.appendChild(el('div', 'bm-ai-menu__hint', 'Nog niemand heeft AI van Berie.'));
          return;
        }
        items.forEach(function (it) {
          var regel = el('button', 'bm-ai-beheer__regel');
          regel.type = 'button';
          regel.title = 'Invullen om aan te passen';
          regel.appendChild(el('span', 'bm-ai-beheer__regelmail', String(it.email || '')));
          regel.appendChild(el('span', 'bm-ai-beheer__regeltal', (it.vandaag || 0) + ' / ' + (it.daglimiet || 0)));
          regel.addEventListener('click', function () {
            mail.value = String(it.email || '');
            limiet.value = String(it.daglimiet || 20);
            mail.focus({ preventScroll: true });
          });
          lijst.appendChild(regel);
        });
      });
    }

    function zet(daglimiet) {
      var m = mail.value.trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m)) { melding.textContent = 'Vul een geldig mailadres in.'; return; }
      aan.disabled = uit.disabled = true;
      rpc('zet_ai_toegang', { p_email: m, p_daglimiet: daglimiet }).then(function (r) {
        aan.disabled = uit.disabled = false;
        if (r.fout) { melding.textContent = 'Lukt niet. Ben je nog ingelogd als beheerder?'; return; }
        melding.textContent = '';
        toast(daglimiet ? 'AI aan voor ' + m + ' (' + daglimiet + ' per dag)' : 'AI uit voor ' + m);
        statusCache = null;
        laadLijst();
      });
    }

    aan.addEventListener('click', function () {
      var n = Math.round(Number(limiet.value));
      if (!(n >= 1 && n <= 500)) { melding.textContent = 'Kies 1 tot 500 beurten per dag.'; return; }
      zet(n);
    });
    uit.addEventListener('click', function () { zet(0); });
    mail.addEventListener('input', function () { melding.textContent = ''; });
    laadLijst();
    b._laadLijst = laadLijst;
    return b;
  }

  BM.ai = {
    inlezen: inlezen,
    kiesBestand: kiesBestand,
    bouwMenuDeel: bouwMenuDeel,
    // voor tests
    _leesZip: leesZip,
    _tekstUitWord: tekstUitWord,
    _tekstUitDia: tekstUitDia,
    _maakBestanden: maakBestanden
  };
})();
