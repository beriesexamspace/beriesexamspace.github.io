(function(){
  var BM = window.BM = window.BM || {};

  // name -> array van listener-functies
  var listeners = Object.create(null);
  var depth = 0;
  var MAX_DEPTH = 50; // voorkomt oneindige emit-lussen

  function report(name, err) {
    try {
      if (window.console && console.error) {
        console.error('[BM.bus] fout in listener voor "' + name + '":', err);
      }
    } catch (e) { /* console niet beschikbaar: negeren */ }
  }

  function on(name, fn) {
    if (!name || typeof fn !== 'function') return function(){};
    var arr = listeners[name] || (listeners[name] = []);
    arr.push(fn);
    // geef een functie terug waarmee je je listener weer uitschakelt
    return function(){ off(name, fn); };
  }

  function once(name, fn) {
    if (!name || typeof fn !== 'function') return function(){};
    var off1 = on(name, function wrapper(data) {
      off1();
      fn(data);
    });
    return off1;
  }

  function off(name, fn) {
    var arr = listeners[name];
    if (!arr) return;
    if (typeof fn !== 'function') {
      delete listeners[name];
      return;
    }
    for (var i = arr.length - 1; i >= 0; i--) {
      if (arr[i] === fn) arr.splice(i, 1);
    }
    if (!arr.length) delete listeners[name];
  }

  function emit(name, data) {
    var arr = listeners[name];
    if (!arr || !arr.length) return 0;
    if (depth >= MAX_DEPTH) {
      report(name, new Error('Te diepe emit-keten (max ' + MAX_DEPTH + ')'));
      return 0;
    }
    // kopie, zodat on/off binnen een listener de lopende emit niet verstoort
    var copy = arr.slice();
    depth++;
    try {
      for (var i = 0; i < copy.length; i++) {
        try {
          copy[i](data);
        } catch (err) {
          // een kapotte listener breekt de andere niet
          report(name, err);
        }
      }
    } finally {
      depth--;
    }
    return copy.length;
  }

  BM.bus = {
    on: on,
    off: off,
    once: once,
    emit: emit
  };
})();
