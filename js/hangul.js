// Hangul syllable building/splitting, romanization of single blocks, and a
// small input automaton that turns a sequence of tapped letters into blocks.
var Hangul = (function () {
  var L = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'.split('');
  var V = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'.split('');
  var T = [''].concat('ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ'.split(''));
  var BASE = 0xac00;

  var DOUBLE_FINAL = {
    'ㄳ': 'ㄱㅅ', 'ㄵ': 'ㄴㅈ', 'ㄶ': 'ㄴㅎ', 'ㄺ': 'ㄹㄱ', 'ㄻ': 'ㄹㅁ', 'ㄼ': 'ㄹㅂ',
    'ㄽ': 'ㄹㅅ', 'ㄾ': 'ㄹㅌ', 'ㄿ': 'ㄹㅍ', 'ㅀ': 'ㄹㅎ', 'ㅄ': 'ㅂㅅ'
  };
  var COMPOUND_VOWEL = {
    'ㅘ': 'ㅗㅏ', 'ㅙ': 'ㅗㅐ', 'ㅚ': 'ㅗㅣ', 'ㅝ': 'ㅜㅓ', 'ㅞ': 'ㅜㅔ', 'ㅟ': 'ㅜㅣ', 'ㅢ': 'ㅡㅣ'
  };

  var INITIAL_ROM = {
    'ㄱ': 'g', 'ㄲ': 'kk', 'ㄴ': 'n', 'ㄷ': 'd', 'ㄸ': 'tt', 'ㄹ': 'r', 'ㅁ': 'm', 'ㅂ': 'b', 'ㅃ': 'pp',
    'ㅅ': 's', 'ㅆ': 'ss', 'ㅇ': '', 'ㅈ': 'j', 'ㅉ': 'jj', 'ㅊ': 'ch', 'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h'
  };
  var VOWEL_ROM = {
    'ㅏ': 'a', 'ㅐ': 'ae', 'ㅑ': 'ya', 'ㅒ': 'yae', 'ㅓ': 'eo', 'ㅔ': 'e', 'ㅕ': 'yeo', 'ㅖ': 'ye',
    'ㅗ': 'o', 'ㅘ': 'wa', 'ㅙ': 'wae', 'ㅚ': 'oe', 'ㅛ': 'yo', 'ㅜ': 'u', 'ㅝ': 'wo', 'ㅞ': 'we',
    'ㅟ': 'wi', 'ㅠ': 'yu', 'ㅡ': 'eu', 'ㅢ': 'ui', 'ㅣ': 'i'
  };
  // The 7 sounds a consonant can make at the bottom of a block.
  var FINAL_ROM = {
    'ㄱ': 'k', 'ㄲ': 'k', 'ㅋ': 'k', 'ㄳ': 'k', 'ㄺ': 'k',
    'ㄴ': 'n', 'ㄵ': 'n', 'ㄶ': 'n',
    'ㄷ': 't', 'ㅅ': 't', 'ㅆ': 't', 'ㅈ': 't', 'ㅊ': 't', 'ㅌ': 't', 'ㅎ': 't',
    'ㄹ': 'l', 'ㄼ': 'l', 'ㄽ': 'l', 'ㄾ': 'l', 'ㅀ': 'l',
    'ㅁ': 'm', 'ㄻ': 'm',
    'ㅂ': 'p', 'ㅍ': 'p', 'ㅄ': 'p', 'ㄿ': 'p',
    'ㅇ': 'ng'
  };

  function code(ch) { return ch ? ch.charCodeAt(0) : 0; }
  function isSyllable(ch) { var c = code(ch); return c >= 0xac00 && c <= 0xd7a3; }
  function isConsonant(j) { var c = code(j); return c >= 0x3131 && c <= 0x314e; }
  function isVowel(j) { var c = code(j); return c >= 0x314f && c <= 0x3163; }
  function canBeFinal(j) { return T.indexOf(j) > 0; }

  function compose(l, v, t) {
    var li = L.indexOf(l), vi = V.indexOf(v), ti = T.indexOf(t || '');
    if (li < 0 || vi < 0 || ti < 0) throw new Error('Cannot compose ' + l + v + (t || ''));
    return String.fromCharCode(BASE + (li * 21 + vi) * 28 + ti);
  }

  function decompose(ch) {
    var c = code(ch) - BASE;
    return { l: L[Math.floor(c / 588)], v: V[Math.floor((c % 588) / 28)], t: T[c % 28] };
  }

  function splitFinal(t) { return t ? (DOUBLE_FINAL[t] || t).split('') : []; }

  // Letters as they are tapped/typed: compound vowels are one letter,
  // double finals (ㄳ, ㄺ …) are two.
  function inputSequence(text) {
    var out = [];
    Array.from(text).forEach(function (ch) {
      if (ch === ' ') out.push(' ');
      else if (isSyllable(ch)) {
        var d = decompose(ch);
        out.push(d.l, d.v);
        out = out.concat(splitFinal(d.t));
      } else if (isConsonant(ch) || isVowel(ch)) out = out.concat(splitFinal(ch).length ? splitFinal(ch) : [ch]);
    });
    return out;
  }

  // Unique set of letters (jamo) used anywhere in a piece of text.
  function letters(text) {
    var seen = [];
    inputSequence(text).forEach(function (j) { if (j !== ' ' && seen.indexOf(j) < 0) seen.push(j); });
    return seen;
  }

  function romanizeBlock(ch) {
    var d = decompose(ch);
    return INITIAL_ROM[d.l] + VOWEL_ROM[d.v] + (d.t ? FINAL_ROM[d.t] : '');
  }

  function combineVowel(a, b) {
    for (var k in COMPOUND_VOWEL) if (COMPOUND_VOWEL[k] === a + b) return k;
    return null;
  }
  function combineFinal(a, b) {
    for (var k in DOUBLE_FINAL) if (DOUBLE_FINAL[k] === a + b) return k;
    return null;
  }

  // Turn a sequence of letters into text, building blocks the way a Korean
  // keyboard does (a final consonant moves to the next block if a vowel follows).
  function assemble(seq) {
    var out = '', cur = null;
    function render(c) { return c.l && c.v ? compose(c.l, c.v, c.t || '') : (c.l || c.v); }
    function flush() { if (cur) out += render(cur); cur = null; }
    seq.forEach(function (j) {
      if (j === ' ') { flush(); out += ' '; return; }
      if (isVowel(j)) {
        if (cur && cur.l && !cur.v) { cur.v = j; return; }
        if (cur && cur.v && !cur.t && combineVowel(cur.v, j)) { cur.v = combineVowel(cur.v, j); return; }
        if (cur && cur.l && cur.v && cur.t) {
          var parts = splitFinal(cur.t);
          var move = parts.pop();
          cur.t = parts.length ? parts[0] : '';
          flush();
          cur = { l: move, v: j };
          return;
        }
        flush();
        cur = { v: j };
        return;
      }
      if (cur && cur.l && cur.v && !cur.t && canBeFinal(j)) { cur.t = j; return; }
      if (cur && cur.t && combineFinal(cur.t, j)) { cur.t = combineFinal(cur.t, j); return; }
      flush();
      cur = { l: j };
    });
    flush();
    return out;
  }

  return {
    INITIALS: L, VOWELS: V, FINALS: T,
    INITIAL_ROM: INITIAL_ROM, VOWEL_ROM: VOWEL_ROM, FINAL_ROM: FINAL_ROM,
    COMPOUND_VOWEL: COMPOUND_VOWEL, splitFinal: splitFinal,
    isSyllable: isSyllable, isConsonant: isConsonant, isVowel: isVowel, canBeFinal: canBeFinal,
    compose: compose, decompose: decompose, inputSequence: inputSequence, letters: letters,
    romanizeBlock: romanizeBlock, assemble: assemble
  };
})();
