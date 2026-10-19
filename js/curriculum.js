// Works out which letters and words are available at each round, so nothing
// is ever shown before its letters have been introduced.
var Curriculum = (function () {
  var introducedAt = {};
  ROUNDS.forEach(function (r, i) { r.letters.forEach(function (j) { introducedAt[j] = i; }); });

  // The round by which every letter in the text has been introduced.
  function roundOf(text) {
    var max = 0;
    Hangul.letters(text).forEach(function (j) {
      max = Math.max(max, j in introducedAt ? introducedAt[j] : Infinity);
    });
    return max;
  }

  var words = WORDS.map(function (a) {
    var extra = a[3] || {};
    var round = Math.max(roundOf(a[0]), (extra.round || 1) - 1);
    return { key: 'W:' + a[0], ko: a[0], rom: a[1], en: a[2], ch: extra.ch || null, alt: extra.alt || [], round: round };
  });
  var byKo = {}, byKey = {};
  words.forEach(function (w) { byKo[w.ko] = byKey[w.key] = w; });

  // The words a set teaches. Number sets carry their own entries (keyed
  // apart from the word bank, where 구 and 팔 also mean "nine" and "arm").
  var setCache = {};
  function setWords(set) {
    if (setCache[set.id]) return setCache[set.id];
    var list = set.items ? set.items.map(function (it) {
      var w = {
        key: 'N:' + set.numbers + ':' + it[0], ko: it[1], rom: it[2], en: String(it[0]), say: it[3] || null,
        ch: null, alt: [], round: roundOf(it[1]), set: set.id
      };
      byKey[w.key] = w;
      return w;
    }) : set.words.map(function (ko) { return byKo[ko]; });
    return (setCache[set.id] = list);
  }
  VOCAB_SETS.forEach(setWords);

  function knownAt(i) {
    var out = [];
    for (var k = 0; k <= i && k < ROUNDS.length; k++) out = out.concat(ROUNDS[k].letters);
    return out;
  }

  return {
    introducedAt: introducedAt,
    roundOf: roundOf,
    words: words,
    word: function (ko) { return byKo[ko]; },
    wordByKey: function (k) { return byKey[k]; },
    setWords: setWords,
    setById: function (id) { return VOCAB_SETS.filter(function (s) { return s.id === id; })[0]; },
    knownAt: knownAt,
    wordsUpTo: function (i) { return words.filter(function (w) { return w.round <= i; }); },
    wordsAt: function (i) { return words.filter(function (w) { return w.round === i; }); },
    textbook: function () { return words.filter(function (w) { return w.ch; }); }
  };
})();
