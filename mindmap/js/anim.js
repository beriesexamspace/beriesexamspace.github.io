(function(){
  var BM = window.BM = window.BM || {};

  // ---------- tijd en frame-helpers ----------
  function now(){
    return (window.performance && typeof window.performance.now === 'function')
      ? window.performance.now()
      : Date.now();
  }

  function frame(fn){
    if (typeof window.requestAnimationFrame === 'function') {
      return window.requestAnimationFrame(fn);
    }
    return setTimeout(function(){ fn(now()); }, 16);
  }

  function reducedMotion(){
    try {
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (e) {
      return false;
    }
  }

  // Bij "minder beweging" worden alle duren 0: effecten zijn dan direct klaar.
  function dur(ms){
    if (reducedMotion()) return 0;
    ms = +ms;
    return ms > 0 ? ms : 0;
  }

  function clamp01(v){
    return v < 0 ? 0 : (v > 1 ? 1 : v);
  }

  // ---------- easing ----------
  var ease = {
    linear: function(t){ return t; },
    easeOutCubic: function(t){
      var u = 1 - t;
      return 1 - u * u * u;
    },
    easeInOutCubic: function(t){
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    },
    // Lichte overshoot: een nieuw puntje "landt" net iets voorbij zijn plek.
    easeOutBack: function(t){
      var c1 = 1.70158, c3 = c1 + 1, u = t - 1;
      return 1 + c3 * u * u * u + c1 * u * u;
    }
  };

  function pickEase(easing, fallback){
    if (typeof easing === 'function') return easing;
    return ease[easing] || fallback;
  }

  // ---------- job-loop: tweens en fades ----------
  // Eén rAF-lus die alleen draait zolang er jobs zijn.
  var jobs = [];
  var pumping = false;

  function pump(){
    if (pumping) return;
    pumping = true;
    frame(step);
  }

  function step(){
    var t = now();
    var pending = jobs;
    jobs = [];
    for (var i = 0; i < pending.length; i++) {
      var j = pending[i];
      if (j.done) continue;
      var p = j.ms > 0 ? (t - j.t0) / j.ms : 1;
      if (p >= 1) {
        j.done = true;
        j.run(1, true);
      } else {
        jobs.push(j);
        j.run(clamp01(p), false);
      }
    }
    if (jobs.length) {
      frame(step);
    } else {
      pumping = false;
    }
  }

  // tween(from, to, ms, cb, easing) -> { cancel() }
  // cb(value, done) wordt elke frame aangeroepen; done is true bij de laatste aanroep.
  function tween(from, to, ms, cb, easing){
    var fn = pickEase(easing, ease.easeOutCubic);
    var d = dur(ms);
    if (d <= 0) {
      if (typeof cb === 'function') cb(to, true);
      return { cancel: function(){} };
    }
    var job = {
      t0: now(),
      ms: d,
      done: false,
      run: function(p, last){
        var v = last ? to : from + (to - from) * fn(p);
        if (typeof cb === 'function') cb(v, last);
      }
    };
    jobs.push(job);
    pump();
    return {
      cancel: function(){ job.done = true; }
    };
  }

  // ---------- per-punt effecten ----------
  // fx[nodeId] = { appearT0, appearMs, glowT0, glowMs, fading, alpha, gen }
  var fx = {};

  function st(id){
    return fx[id] || (fx[id] = {});
  }

  // Ruim een entry op als er niets meer in loopt en er geen alpha is.
  function tidy(id){
    var s = fx[id];
    if (!s) return;
    if (s.appearT0 == null && s.glowT0 == null && s.travelT0 == null && !s.fading && typeof s.alpha !== 'number') {
      delete fx[id];
    }
  }

  // Schiet-effect voor een nieuw puntje.
  // node: het node-object (of alleen een id).
  // opts: { impulse (default 4), dirX, dirY, glowMs (default 1100), appearMs (default 420) }
  // impulse wordt bij vx/vy van het node-object opgeteld (eenheid: layout-stappen).
  // Richting: dirX/dirY, anders de huidige vx/vy, anders willekeurig.
  // Geeft het id terug.
  function shoot(node, opts){
    opts = opts || {};
    var isObj = !!node && typeof node === 'object';
    var id = isObj ? node.id : node;
    if (id == null) return null;

    var s = st(id);
    var t = now();

    // Een eerdere fade of zichtbaarheid van dit id wordt teruggezet (bijv. na ongedaan maken).
    s.gen = (s.gen || 0) + 1;
    s.fading = false;
    delete s.alpha;

    s.appearT0 = t;
    s.appearMs = dur(opts.appearMs != null ? opts.appearMs : 420);
    s.glowT0 = t;
    s.glowMs = dur(opts.glowMs != null ? opts.glowMs : 1100);
    // Het punt vliegt vanuit de ouder naar zijn plek; de lijn groeit mee.
    s.travelT0 = t;
    s.travelMs = dur(opts.travelMs != null ? opts.travelMs : 340);

    var power = reducedMotion() ? 0 : (opts.impulse != null ? opts.impulse : 2.5);
    if (isObj && power > 0) {
      var dx = opts.dirX, dy = opts.dirY;
      if (typeof dx !== 'number' || typeof dy !== 'number') {
        dx = node.vx || 0;
        dy = node.vy || 0;
      }
      var len = Math.sqrt(dx * dx + dy * dy);
      if (len < 1e-6) {
        var a = Math.random() * Math.PI * 2;
        dx = Math.cos(a);
        dy = Math.sin(a);
        len = 1;
      }
      node.vx = (node.vx || 0) + (dx / len) * power;
      node.vy = (node.vy || 0) + (dy / len) * power;
    }
    return id;
  }

  // Schaal van een punt bij het verschijnen: 0 -> 1 met lichte overshoot. Standaard 1.
  function scaleOf(id){
    var s = fx[id];
    if (!s || s.appearT0 == null) return 1;
    var p = s.appearMs > 0 ? (now() - s.appearT0) / s.appearMs : 1;
    if (p >= 1) {
      s.appearT0 = null;
      tidy(id);
      return 1;
    }
    return Math.max(0, ease.easeOutBack(clamp01(p)));
  }

  // Gloed van een nieuw punt: 1 -> 0. Standaard 0.
  function glowOf(id){
    var s = fx[id];
    if (!s || s.glowT0 == null) return 0;
    var p = s.glowMs > 0 ? (now() - s.glowT0) / s.glowMs : 1;
    if (p >= 1) {
      s.glowT0 = null;
      tidy(id);
      return 0;
    }
    return 1 - ease.easeOutCubic(clamp01(p));
  }

  // Hoe ver een nieuw punt al van zijn ouder naar zijn plek is gevlogen: 0 -> 1 (met lichte overshoot).
  function travelOf(id){
    var s = fx[id];
    if (!s || s.travelT0 == null) return 1;
    var p = s.travelMs > 0 ? (now() - s.travelT0) / s.travelMs : 1;
    if (p >= 1) {
      s.travelT0 = null;
      tidy(id);
      return 1;
    }
    return ease.easeOutBack(clamp01(p));
  }

  // Korte gloed om een punt (bijv. als het vanuit het overzicht in beeld komt).
  function pulse(id, ms){
    if (id == null) return;
    var s = st(id);
    s.glowT0 = now();
    s.glowMs = dur(ms != null ? ms : 1400);
  }

  // Doorzichtigheid: 1 normaal, loopt bij verwijderen naar 0. Standaard 1.
  function alphaOf(id){
    var s = fx[id];
    return (s && typeof s.alpha === 'number') ? s.alpha : 1;
  }

  // fadeOut(ids, ms, onDone): laat één id of een array van ids uitfaden.
  // onDone(ids) wordt één keer aangeroepen als alle fades klaar zijn.
  // De aanroeper verwijdert de nodes zelf (store.removeNode) in onDone.
  function fadeOut(ids, ms, onDone){
    var list = Array.isArray(ids) ? ids.slice() : [ids];
    var remaining = list.length;
    var d = dur(ms != null ? ms : 260);
    var fired = false;

    // onDone precies een keer, ook als het vangnet hieronder eerder afgaat.
    function fire(){
      if (fired) return;
      fired = true;
      if (typeof onDone === 'function') onDone(list);
    }

    function finishOne(){
      remaining--;
      if (remaining === 0) fire();
    }

    if (!remaining) {
      fire();
      return;
    }

    // Vangnet: staat requestAnimationFrame stil (tabblad op de achtergrond), dan
    // toch afronden, zodat het verwijderen niet blijft hangen.
    if (d > 0) {
      setTimeout(function(){
        if (fired) return;
        list.forEach(function(id){
          var s = fx[id];
          if (s) { s.alpha = 0; s.fading = false; }
        });
        fire();
      }, d + 120);
    }

    list.forEach(function(id){
      var s = st(id);
      s.gen = (s.gen || 0) + 1;
      var gen = s.gen;
      s.fading = true;

      if (d <= 0) {
        s.alpha = 0;
        s.fading = false;
        finishOne();
        return;
      }

      s.alpha = 1;
      jobs.push({
        t0: now(),
        ms: d,
        done: false,
        run: function(p, last){
          // Overschreven door een nieuwere shoot/fade op hetzelfde id: alleen de telling afronden.
          if (s.gen !== gen) {
            if (last) finishOne();
            return;
          }
          if (last) {
            s.alpha = 0;
            s.fading = false;
            finishOne();
          } else {
            s.alpha = 1 - ease.easeInOutCubic(p);
          }
        }
      });
    });
    pump();
  }

  // Laat alle effecten van een id los (aanroepen bij verwijderen).
  function forget(id){
    delete fx[id];
  }

  // True zolang er iets animeert (jobs of lopende schaal/gloed/fade).
  function isActive(){
    if (jobs.length) return true;
    var t = now();
    for (var k in fx) {
      if (!Object.prototype.hasOwnProperty.call(fx, k)) continue;
      var s = fx[k];
      if (s.fading) return true;
      if (s.appearT0 != null && t - s.appearT0 < s.appearMs) return true;
      if (s.glowT0 != null && t - s.glowT0 < s.glowMs) return true;
      if (s.travelT0 != null && t - s.travelT0 < s.travelMs) return true;
    }
    return false;
  }

  // Ruim effecten op bij verwijderde nodes.
  if (BM.bus && typeof BM.bus.on === 'function') {
    BM.bus.on('node:removed', function(data){
      if (!data || !data.nodeIds) return;
      for (var i = 0; i < data.nodeIds.length; i++) {
        forget(data.nodeIds[i]);
      }
    });
  }

  BM.anim = {
    ease: ease,
    reducedMotion: reducedMotion,
    tween: tween,
    shoot: shoot,
    fadeOut: fadeOut,
    scaleOf: scaleOf,
    glowOf: glowOf,
    travelOf: travelOf,
    pulse: pulse,
    alphaOf: alphaOf,
    forget: forget,
    isActive: isActive
  };
})();
