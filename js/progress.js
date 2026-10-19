// Saved progress: finished rounds, grammar lessons and word sets, per-item
// miss rates, and a spaced-review schedule for words.
var Progress = (function () {
  var KEY = 'hangul-progress-v1';
  var DAY = 24 * 60 * 60 * 1000;
  // Days until a word comes back, by how many reviews in a row it has passed.
  var INTERVALS = [0, 1, 2, 4, 7, 15, 30];
  var data = load();

  function blank() { return { done: {}, stats: {}, grammar: {}, vocab: {}, srs: {} }; }
  function load() {
    try {
      var d = JSON.parse(localStorage.getItem(KEY));
      if (d && d.done && d.stats) return Object.assign(blank(), d);
    } catch (e) { /* storage unavailable or corrupt */ }
    return blank();
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }

  // A pass moves a word up a box, but only when it was due, so drilling it
  // five times in one sitting doesn't push it a month out. A miss starts over.
  function review(k, ok) {
    var now = Date.now();
    var s = data.srs[k] || (data.srs[k] = { box: 0, due: now });
    if (!ok) { s.box = 0; s.due = now; }
    else if (now >= s.due || s.box === 0) {
      s.box = Math.min(s.box + 1, INTERVALS.length - 1);
      s.due = now + INTERVALS[s.box] * DAY;
    }
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
    alphabetDone: function () { return this.level() === ROUNDS.length - 1; },
    record: function (keys, ok) {
      (keys || []).forEach(function (k) {
        var s = data.stats[k] || (data.stats[k] = { n: 0, wrong: 0 });
        s.n++;
        if (!ok) s.wrong++;
        if (k.slice(0, 2) === 'W:' || k.slice(0, 2) === 'N:') review(k, ok);
      });
      save();
    },
    // Higher for things you miss often or haven't seen much.
    weight: function (k) {
      var s = data.stats[k];
      if (!s) return 2;
      return 1 + 4 * (s.wrong / s.n) + (s.n < 3 ? 1 : 0);
    },

    grammarDone: function (id) { return !!data.grammar[id]; },
    completeGrammar: function (id) { data.grammar[id] = true; save(); },

    vocabDone: function (id) { return !!data.vocab[id]; },
    completeVocab: function (id, keys) {
      data.vocab[id] = true;
      var now = Date.now();
      keys.forEach(function (k) {
        var s = data.srs[k];
        if (!s || s.box === 0) data.srs[k] = { box: 1, due: now + DAY };
      });
      save();
    },
    // Word keys (W:학생, N:sino:7) from the list that are due now, most overdue first.
    due: function (keys) {
      var now = Date.now();
      return keys.filter(function (k) { var s = data.srs[k]; return s && s.due <= now; })
        .sort(function (a, b) { return data.srs[a].due - data.srs[b].due; });
    },
    // 0 = new or just missed … 6 = well known.
    box: function (k) { var s = data.srs[k]; return s ? s.box : 0; },

    reset: function () { data = blank(); save(); },
    unlockAll: function () { ROUNDS.forEach(function (r, i) { data.done[i] = true; }); save(); }
  };
})();
