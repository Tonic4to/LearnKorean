// Splits Korean words into noun + particles, glosses them for the hover
// tooltips, and checks typed sentences against the accepted answers,
// separating grammar mistakes (wrong particle, missing word, word order)
// from small spelling slips.
var Grammar = (function () {
  var lex = {};
  Curriculum.words.forEach(function (w) {
    // Skip the "+ subject marker" linking demos, so 이것이 splits into 이것 + 이.
    if (w.en.indexOf('(+ ') < 0) lex[w.ko] = w.en;
  });
  GRAMMAR_WORDS.forEach(function (w) { lex[w[0]] = w[1]; });

  var GROUPS = [['이', '그', '저'], ['이것', '그것', '저것'], ['있어요', '없어요']];

  function ko(t) { return '<span class="ko">' + t + '</span>'; }
  // Wrap every run of Hangul in the Korean font.
  function koWrap(html) { return html.replace(/[가-힣ㄱ-ㅣ]+/g, ko); }

  function known(stem) { return stem in lex || stem in DETERMINERS; }
  function meaning(stem) { return lex[stem] || DETERMINERS[stem] || null; }

  // Final consonant of the last block, or '' if it ends in a vowel.
  function batchim(word) {
    var last = word.charAt(word.length - 1);
    return Hangul.isSyllable(last) ? Hangul.decompose(last).t : '';
  }

  // Split a suffix into known endings (fewest pieces), or null.
  function endingsOf(s) {
    if (s === '') return [];
    var best = null;
    Object.keys(ENDINGS).forEach(function (e) {
      if (s.slice(0, e.length) !== e) return;
      var rest = endingsOf(s.slice(e.length));
      if (rest && (!best || rest.length + 1 < best.length)) best = [e].concat(rest);
    });
    return best;
  }

  // Longest known stem followed by valid endings: 학생이에요 → 학생 + 이에요.
  function parse(word) {
    for (var k = word.length; k > 0; k--) {
      var stem = word.slice(0, k), ends = endingsOf(word.slice(k));
      if (known(stem) && ends) return { stem: stem, ends: ends };
    }
    return { stem: word, ends: [], unknown: true };
  }

  function allomorphOK(stem, ending) {
    var e = ENDINGS[ending];
    if (!e || e.bad) return false;
    if (!e.after) return true;
    return (e.after === 'c') === !!batchim(stem);
  }
  // The right form of a family for this noun: attach('학생', 'copula') → 이에요.
  function attach(stem, fam) {
    var forms = ENDING_FAMILIES[fam].forms;
    for (var i = 0; i < forms.length; i++) if (allomorphOK(stem, forms[i])) return forms[i];
    return forms[0];
  }

  function reason(stem, ending) {
    var e = ENDINGS[ending];
    if (!e || !e.after) return '';
    var b = batchim(stem);
    return stem + ' ends in a ' + (b ? 'consonant (' + b + ')' : 'vowel') + ', so it takes ' + ending + '.';
  }

  // Why `got` is wrong where `want` belongs, after `stem`.
  function explainEnding(stem, want, got) {
    var W = ENDINGS[want], G = ENDINGS[got];
    if (!got) return stem + ' needs ' + want + ' here: <b>' + stem + want + '</b>' + (W ? ' (' + W.en + ').' : '.');
    if (!want) return stem + ' doesn’t take ' + got + ' here.';
    if (got === '이예요') return 'After a consonant it’s 이에요 (' + stem + '이에요). 이예요 is a common misspelling.';
    if (got === '에요' && want === '예요') return 'After a vowel, write 예요: <b>' + stem + '예요</b>. It sounds like 에요, but it’s spelled with 예.';
    if (want === '도' && got.length > 1 && got.slice(-1) === '도') return '도 replaces 은/는 and 이/가, so don’t stack them: <b>' + stem + '도</b>.';
    if (W && G && W.fam === G.fam) return reason(stem, want) + ' Not ' + got + '.';
    if (W && G) return 'Use ' + want + ' (' + ENDING_FAMILIES[W.fam].label + ') here, not ' + got + ' (' + ENDING_FAMILIES[G.fam].label + ').';
    return 'It should be <b>' + stem + want + '</b>.';
  }

  // ---------- glossing ----------

  function stripPunct(token) {
    var m = token.match(/^([^가-힣ㄱ-ㅣ_]*)(.*?)([^가-힣ㄱ-ㅣ_]*)$/);
    return { pre: m[1], word: m[2], post: m[3] };
  }

  // Romanization and parts of one word. nextWord tells 이/그/저 + noun apart.
  function gloss(word, nextWord) {
    var p = parse(word), parts = [];
    var asDet = !p.ends.length && DETERMINERS[p.stem] && nextWord;
    parts.push({ ko: p.stem, en: asDet ? DETERMINERS[p.stem] : (meaning(p.stem) || '?') });
    p.ends.forEach(function (e) { parts.push({ ko: e, en: ENDINGS[e].en, ending: true }); });
    return { word: word, rom: Romanize.rr(word), parts: parts };
  }

  // ---------- checking typed answers ----------

  function clean(s) {
    return s.normalize('NFC').replace(/[.,!?~…"“”‘’']/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function words(s) {
    return clean(s).split(' ').filter(Boolean).map(function (w) { return CONTRACTIONS[w] || w; });
  }

  function jamoDist(a, b) {
    var x = Hangul.inputSequence(a), y = Hangul.inputSequence(b);
    var prev = [], cur;
    for (var j = 0; j <= y.length; j++) prev[j] = j;
    for (var i = 1; i <= x.length; i++) {
      cur = [i];
      for (j = 1; j <= y.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[y.length];
  }
  function tolerance(stem) { return Math.max(1, Math.floor(Hangul.inputSequence(stem).length / 4)); }

  // Compare a typed word with an answer word. kind: same | grammar | spelling | wrong.
  function compare(u, a) {
    if (u === a) return { cost: 0, kind: 'same' };
    var A = parse(a), want = A.ends.join('');
    var m = GRAMMAR_MISTAKES[u];
    if (m && m.fix === a) return { cost: 1, kind: 'grammar', html: m.note };
    var best = null;
    for (var k = 1; k <= u.length; k++) {
      var stem = u.slice(0, k), ends = endingsOf(u.slice(k));
      if (!ends) continue;
      var got = ends.join(''), d = stem === A.stem ? 0 : jamoDist(stem, A.stem);
      var cost = 1.5 * d + (got === want ? 0 : 1);
      if (!best || cost < best.cost) best = { cost: cost, stem: stem, got: got, d: d };
    }
    if (best && best.d === 0) {
      return { cost: 1, kind: 'grammar', html: explainEnding(A.stem, want, best.got) };
    }
    if (best && best.d <= tolerance(A.stem) && !known(best.stem)) {
      if (best.got === want) return { cost: best.cost, kind: 'spelling' };
      return { cost: best.cost, kind: 'grammar', spelling: true, html: explainEnding(A.stem, want, best.got) };
    }
    return { cost: 3, kind: 'wrong' };
  }

  function describe(word) {
    var p = parse(word), en = meaning(p.stem);
    return en ? ' (' + en + ')' : '';
  }

  // Align typed words to answer words (edit distance over words).
  function align(uw, aw) {
    var n = uw.length, m = aw.length, D = [], B = [];
    for (var i = 0; i <= n; i++) {
      D[i] = []; B[i] = [];
      for (var j = 0; j <= m; j++) {
        if (!i && !j) { D[0][0] = 0; continue; }
        var opts = [];
        if (i) opts.push([D[i - 1][j] + 2, 'extra']);
        if (j) opts.push([D[i][j - 1] + 2, 'missing']);
        if (i && j) { var c = compare(uw[i - 1], aw[j - 1]); opts.push([D[i - 1][j - 1] + c.cost, c]); }
        opts.sort(function (p, q) { return p[0] - q[0]; });
        D[i][j] = opts[0][0]; B[i][j] = opts[0][1];
      }
    }
    var ops = [];
    for (i = n, j = m; i || j;) {
      var b = B[i][j];
      if (b === 'extra') { ops.unshift({ kind: 'extra', u: uw[--i] }); }
      else if (b === 'missing') { ops.unshift({ kind: 'missing', a: aw[--j] }); }
      else { ops.unshift(Object.assign({ u: uw[--i], a: aw[--j] }, b)); }
    }
    return { cost: D[n][m], ops: ops };
  }

  function sorted(a) { return a.slice().sort().join(' '); }

  // Returns { ok, exact, answer, issues: [{ minor, html }] } for the closest answer.
  // Spelling and spacing slips are 'minor': the answer still counts as right.
  function check(input, answers) {
    var uw = words(input);
    var question = /\?\s*$/.test(input.trim());
    var best = null;
    answers.forEach(function (ans) {
      var aw = words(ans), r;
      if (uw.join(' ') === aw.join(' ')) r = { cost: 0, issues: [] };
      else if (uw.join('') === aw.join('')) {
        r = { cost: 0.5, issues: [{ minor: true, html: 'Spacing: write it <b>' + aw.join(' ') + '</b>. Particles and 이에요/예요 attach to the noun with no space; separate words get a space.' }] };
      } else if (sorted(uw) === sorted(aw)) {
        r = { cost: 2, issues: [{ html: 'The right words, but in the wrong order. Korean puts the verb (이에요, 있어요, 아니에요…) at the very end: <b>' + aw.join(' ') + '</b>.' }] };
      } else {
        var al = align(uw, aw);
        r = { cost: al.cost, issues: [] };
        al.ops.forEach(function (op) {
          if (op.kind === 'same') return;
          if (op.kind === 'missing') r.issues.push({ html: 'Missing <b>' + op.a + '</b>' + describe(op.a) + '.' });
          else if (op.kind === 'extra') r.issues.push({ html: '<b>' + op.u + '</b> doesn’t belong here.' });
          else if (op.kind === 'spelling') r.issues.push({ minor: true, html: 'Spelling: <b>' + op.u + '</b> → <b>' + op.a + '</b>' + describe(op.a) + '.' });
          else if (op.kind === 'grammar') r.issues.push({ html: '<b>' + op.u + '</b> → <b>' + op.a + '</b>: ' + op.html + (op.spelling ? ' (Check the spelling too.)' : '') });
          else {
            var p = parse(op.u), q = parse(op.a);
            var sameEnds = p.ends.join('') === q.ends.join('');
            r.issues.push({
              html: known(p.stem) && p.stem !== q.stem
                ? '<b>' + (sameEnds ? p.stem : op.u) + '</b> means “' + meaning(p.stem) + '”. Here you need <b>' + (sameEnds ? q.stem : op.a) + '</b>' + describe(op.a) + '.'
                : '<b>' + op.u + '</b> should be <b>' + op.a + '</b>' + describe(op.a) + '.'
            });
          }
        });
      }
      if (/\?\s*$/.test(ans) && !question && !r.issues.some(function (x) { return !x.minor; })) {
        r.issues.push({ minor: true, html: 'It’s a question, so end it with <b>?</b>' });
      }
      if (!best || r.cost < best.cost) { r.answer = ans; best = r; }
    });
    best.issues.forEach(function (x) { x.html = koWrap(x.html); });
    var ok = !best.issues.some(function (x) { return !x.minor; });
    return { ok: ok, exact: !best.issues.length, answer: best.answer, issues: best.issues };
  }

  // Other words that fit the same slot (for distractors).
  function groupOf(word) {
    for (var i = 0; i < GROUPS.length; i++) if (GROUPS[i].indexOf(word) >= 0) return GROUPS[i];
    return null;
  }

  return {
    parse: parse, gloss: gloss, check: check, words: words, attach: attach, allomorphOK: allomorphOK,
    reason: reason, explainEnding: explainEnding, batchim: batchim, meaning: meaning, known: known,
    stripPunct: stripPunct, groupOf: groupOf, koWrap: koWrap, jamoDist: jamoDist
  };
})();
