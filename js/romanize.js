// Romanizes words as they are pronounced, in Revised Romanization (RR, the
// official system) and McCune–Reischauer (MR, the older system behind
// spellings like "kimchi" and "Pusan"), and checks typed answers against both.
var Romanize = (function () {
  var NEUTRAL = {
    'ㄱ': 'ㄱ', 'ㄲ': 'ㄱ', 'ㅋ': 'ㄱ', 'ㄳ': 'ㄱ', 'ㄺ': 'ㄱ',
    'ㄴ': 'ㄴ', 'ㄵ': 'ㄴ', 'ㄶ': 'ㄴ',
    'ㄷ': 'ㄷ', 'ㅅ': 'ㄷ', 'ㅆ': 'ㄷ', 'ㅈ': 'ㄷ', 'ㅊ': 'ㄷ', 'ㅌ': 'ㄷ', 'ㅎ': 'ㄷ',
    'ㄹ': 'ㄹ', 'ㄼ': 'ㄹ', 'ㄽ': 'ㄹ', 'ㄾ': 'ㄹ', 'ㅀ': 'ㄹ',
    'ㅁ': 'ㅁ', 'ㄻ': 'ㅁ',
    'ㅂ': 'ㅂ', 'ㅍ': 'ㅂ', 'ㅄ': 'ㅂ', 'ㄿ': 'ㅂ',
    'ㅇ': 'ㅇ'
  };
  var ASPIRATE = { 'ㄱ': 'ㅋ', 'ㄷ': 'ㅌ', 'ㅂ': 'ㅍ', 'ㅈ': 'ㅊ' };
  var NASAL = { 'ㄱ': 'ㅇ', 'ㄷ': 'ㄴ', 'ㅂ': 'ㅁ' };
  var FINAL = { 'ㄱ': 'k', 'ㄴ': 'n', 'ㄷ': 't', 'ㄹ': 'l', 'ㅁ': 'm', 'ㅂ': 'p', 'ㅇ': 'ng' };

  var MR_VOWEL = {
    'ㅏ': 'a', 'ㅐ': 'ae', 'ㅑ': 'ya', 'ㅒ': 'yae', 'ㅓ': 'ŏ', 'ㅔ': 'e', 'ㅕ': 'yŏ', 'ㅖ': 'ye',
    'ㅗ': 'o', 'ㅘ': 'wa', 'ㅙ': 'wae', 'ㅚ': 'oe', 'ㅛ': 'yo', 'ㅜ': 'u', 'ㅝ': 'wŏ', 'ㅞ': 'we',
    'ㅟ': 'wi', 'ㅠ': 'yu', 'ㅡ': 'ŭ', 'ㅢ': 'ŭi', 'ㅣ': 'i'
  };
  var MR_INITIAL = {
    'ㄲ': 'kk', 'ㄴ': 'n', 'ㄸ': 'tt', 'ㅁ': 'm', 'ㅃ': 'pp', 'ㅆ': 'ss', 'ㅇ': '',
    'ㅉ': 'tch', 'ㅊ': 'ch\'', 'ㅋ': 'k\'', 'ㅌ': 't\'', 'ㅍ': 'p\'', 'ㅎ': 'h'
  };
  // Plain consonants are voiced (g, d, b, j) between voiced sounds, else k, t, p, ch.
  var MR_PLAIN = { 'ㄱ': ['k', 'g'], 'ㄷ': ['t', 'd'], 'ㅂ': ['p', 'b'], 'ㅈ': ['ch', 'j'] };
  // How each letter is written in MR, where it differs from RR (for letter cards).
  var MR_LETTER = {
    'ㄱ': 'k / g', 'ㄷ': 't / d', 'ㅂ': 'p / b', 'ㅈ': 'ch / j', 'ㅋ': 'k’', 'ㅌ': 't’', 'ㅍ': 'p’',
    'ㅊ': 'ch’', 'ㅉ': 'tch', 'ㅓ': 'ŏ', 'ㅕ': 'yŏ', 'ㅝ': 'wŏ', 'ㅡ': 'ŭ', 'ㅢ': 'ŭi'
  };

  function ko(t) { return '<span class="ko">' + t + '</span>'; }

  // Apply the common sound-change rules to one word; returns pronounced syllables.
  // If notes is given, a plain-English line is pushed for each rule applied.
  function pronounce(word, notes) {
    var s = Array.from(word).filter(Hangul.isSyllable).map(Hangul.decompose);
    function note(html) { if (notes && notes.indexOf(html) < 0) notes.push(html); }
    for (var i = 0; i < s.length; i++) {
      var cur = s[i], next = s[i + 1];
      if (next && cur.t) {
        var parts = Hangul.splitFinal(cur.t), last = parts[parts.length - 1];
        if (next.l === 'ㅇ' && cur.t !== 'ㅇ') {
          // Linking: the final slides into the empty slot (a final ㅎ goes silent).
          if (last === 'ㅎ') {
            parts.pop();
            note(ko('ㅎ') + ' at the bottom goes silent before a vowel.');
          }
          if (parts.length) {
            next.l = parts.pop();
            note(ko(next.l) + ' slides into the empty ' + ko('ㅇ') + ' spot of the next block and keeps its full sound, <b>' +
              Hangul.INITIAL_ROM[next.l] + '</b>.' + (parts.length ? ' (' + ko(parts[0]) + ' stays behind.)' : ''));
          }
          cur.t = parts[0] || '';
        } else if (last === 'ㅎ' && ASPIRATE[next.l]) {
          note(ko('ㅎ') + ' + ' + ko(next.l) + ' blend into the breathy ' + ko(ASPIRATE[next.l]) + '.');
          next.l = ASPIRATE[next.l];
          parts.pop();
          cur.t = parts[0] || '';
        } else if (next.l === 'ㅎ' && ASPIRATE[NEUTRAL[cur.t]]) {
          note(ko(NEUTRAL[cur.t]) + ' + ' + ko('ㅎ') + ' blend into the breathy ' + ko(ASPIRATE[NEUTRAL[cur.t]]) + '.');
          next.l = ASPIRATE[NEUTRAL[cur.t]];
          cur.t = '';
        }
      }
      var held = cur.t;
      cur.t = cur.t ? NEUTRAL[cur.t] : '';
      var changed = false;
      if (next && cur.t) {
        if (cur.t === 'ㄴ' && next.l === 'ㄹ') {
          cur.t = 'ㄹ'; changed = true;
          note(ko('ㄴ') + ' next to ' + ko('ㄹ') + ' turns into ' + ko('ㄹ') + ': <b>l-l</b>.');
        } else if (cur.t === 'ㄹ' && next.l === 'ㄴ') {
          next.l = 'ㄹ';
          note(ko('ㄴ') + ' after ' + ko('ㄹ') + ' turns into ' + ko('ㄹ') + ': <b>l-l</b>.');
        } else if (cur.t !== 'ㄹ' && next.l === 'ㄹ') {
          next.l = 'ㄴ';
          note(ko('ㄹ') + ' after a consonant other than ' + ko('ㄹ') + ' sounds like <b>n</b>.');
        }
        if ((next.l === 'ㄴ' || next.l === 'ㅁ') && NASAL[cur.t]) {
          note('A final ' + ko(cur.t) + ' before ' + ko(next.l) + ' sounds like <b>' + FINAL[NASAL[cur.t]] + '</b>.');
          cur.t = NASAL[cur.t]; changed = true;
        }
      }
      if (held && notes) {
        var two = Hangul.splitFinal(held);
        if (two.length === 2) {
          var kept = NEUTRAL[two[0]] === NEUTRAL[held] ? two[0] : two[1];
          var silent = kept === two[0] ? two[1] : two[0];
          note(ko(held) + ' is two consonants, but only ' + ko(kept) + ' is pronounced' +
            (changed ? '' : ' (<b>' + FINAL[NEUTRAL[held]] + '</b>)') + '; ' + ko(silent) + ' is silent.');
        } else if (!changed && (held !== cur.t || 'ㄱㄷㅂㄹ'.indexOf(held) >= 0)) {
          note('At the bottom of a block, ' + ko(held) + ' sounds like <b>' + FINAL[cur.t] + '</b>' +
            (held !== cur.t || held === 'ㄹ' ? '' : ', not ' + Hangul.INITIAL_ROM[held]) + '.');
        }
      }
    }
    return s;
  }

  function rrSyllables(word) {
    return pronounce(word).map(function (c, i, s) {
      var prev = s[i - 1];
      var l = c.l === 'ㄹ' && prev && prev.t === 'ㄹ' ? 'l' : Hangul.INITIAL_ROM[c.l];
      return l + Hangul.VOWEL_ROM[c.v] + (c.t ? FINAL[c.t] : '');
    });
  }

  function mrSyllables(word) {
    return pronounce(word).map(function (c, i, s) {
      var prev = s[i - 1];
      var voiced = prev && (!prev.t || 'ㄴㅁㅇㄹ'.indexOf(prev.t) >= 0);
      var l;
      if (MR_PLAIN[c.l]) l = MR_PLAIN[c.l][voiced ? 1 : 0];
      else if (c.l === 'ㄹ') l = prev && prev.t === 'ㄹ' ? 'l' : 'r';
      else if (c.l === 'ㅅ') l = c.v === 'ㅣ' || c.v === 'ㅟ' ? 'sh' : 's';
      else l = MR_INITIAL[c.l];
      return l + MR_VOWEL[c.v] + (c.t ? FINAL[c.t] : '');
    });
  }

  function words(text) { return text.split(' ').filter(Boolean); }

  // Plain-English lines for the final-consonant rules at work in the text.
  function explain(text) {
    var notes = [];
    words(text).forEach(function (w) { pronounce(w, notes); });
    return notes;
  }

  // For a 'close' answer: true if every slip is in a final consonant
  // (e.g. "gab" for 값, where the bottom ㅂ is p).
  function finalSlip(input, text, rrAnswer) {
    var v = norm(input), want = norm(rrAnswer), isFinal = [];
    words(text).forEach(function (w) {
      var p = pronounce(w);
      rrSyllables(w).forEach(function (syl, i) {
        var finalLen = p[i].t ? FINAL[p[i].t].length : 0;
        for (var k = 0; k < syl.length; k++) isFinal.push(k >= syl.length - finalLen);
      });
    });
    if (isFinal.length !== v.length || want.length !== v.length) return false;
    for (var k = 0; k < v.length; k++) if (v[k] !== want[k] && !isFinal[k]) return false;
    return true;
  }
  function rr(text) { return words(text).map(function (w) { return rrSyllables(w).join(''); }).join(' '); }
  function mr(text) { return words(text).map(function (w) { return mrSyllables(w).join(''); }).join(' '); }

  // Lowercase, drop spacing/punctuation/apostrophes and accents (ŏ → o, ŭ → u).
  function norm(s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[\s\-'’`.·]/g, '');
  }

  // Spellings accepted for each syllable: RR, MR with or without marks,
  // and MR with ŏ/ŭ typed as eo/eu. Syllables may mix systems ("kimbap").
  function syllableOptions(text) {
    var out = [];
    words(text).forEach(function (w) {
      var r = rrSyllables(w), m = mrSyllables(w);
      r.forEach(function (rs, i) {
        var opts = [norm(rs), norm(m[i]), norm(m[i].replace(/ŏ/g, 'eo').replace(/ŭ/g, 'eu'))];
        out.push(opts.filter(function (o, k) { return opts.indexOf(o) === k; }));
      });
    });
    return out;
  }

  function matches(input, text) {
    var v = norm(input), opts = syllableOptions(text), memo = {};
    function go(i, pos) {
      if (i === opts.length) return pos === v.length;
      var key = i + ':' + pos;
      if (key in memo) return memo[key];
      memo[key] = opts[i].some(function (o) { return v.substr(pos, o.length) === o && go(i + 1, pos + o.length); });
      return memo[key];
    }
    return go(0, 0);
  }

  function loose(s) { return norm(s).replace(/k/g, 'g').replace(/t/g, 'd').replace(/p/g, 'b').replace(/l/g, 'r'); }

  // 'rr' = Revised Romanization (or a listed alternate); 'mr' = accepted in the
  // older system or a mix; 'close' = only off by g/k, d/t, b/p, r/l; null = wrong.
  function check(input, text, rrAnswer, alts) {
    var v = norm(input);
    if ([rrAnswer].concat(alts || []).some(function (a) { return norm(a) === v; })) return 'rr';
    if (matches(input, text)) return 'mr';
    if (loose(rrAnswer) === loose(input)) return 'close';
    return null;
  }

  return {
    pronounce: pronounce, rr: rr, mr: mr, check: check, matches: matches, norm: norm,
    explain: explain, finalSlip: finalSlip,
    letterMR: function (j) { return MR_LETTER[j] || null; }
  };
})();
