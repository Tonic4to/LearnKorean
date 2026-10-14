// Saved progress: finished rounds and per-letter / per-word miss rates.
var Progress = (function () {
  var KEY = 'hangul-progress-v1';
  var data = load();

  function load() {
    try {
      var d = JSON.parse(localStorage.getItem(KEY));
      if (d && d.done && d.stats) return d;
    } catch (e) { /* storage unavailable or corrupt */ }
    return { done: {}, stats: {} };
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }

  return {
    isComplete: function (i) { return !!data.done[i]; },
    complete: function (i) { data.done[i] = true; save(); },
    // Index of the last round in an unbroken run of finished rounds (-1 = none).
    level: function () {
      var i = -1;
      while (i + 1 < ROUNDS.length && data.done[i + 1]) i++;
      return i;
    },
    record: function (keys, ok) {
      (keys || []).forEach(function (k) {
        var s = data.stats[k] || (data.stats[k] = { n: 0, wrong: 0 });
        s.n++;
        if (!ok) s.wrong++;
      });
      save();
    },
    // Higher for things you miss often or haven't seen much.
    weight: function (k) {
      var s = data.stats[k];
      if (!s) return 2;
      return 1 + 4 * (s.wrong / s.n) + (s.n < 3 ? 1 : 0);
    },
    reset: function () { data = { done: {}, stats: {} }; save(); },
    unlockAll: function () { ROUNDS.forEach(function (r, i) { data.done[i] = true; }); save(); }
  };
})();
