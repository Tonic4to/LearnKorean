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
    return { ko: a[0], rom: a[1], en: a[2], ch: extra.ch || null, alt: extra.alt || [], round: round };
  });
  var byKo = {};
  words.forEach(function (w) { byKo[w.ko] = w; });

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
    knownAt: knownAt,
    wordsUpTo: function (i) { return words.filter(function (w) { return w.round <= i; }); },
    wordsAt: function (i) { return words.filter(function (w) { return w.round === i; }); },
    textbook: function () { return words.filter(function (w) { return w.ch; }); }
  };
})();
