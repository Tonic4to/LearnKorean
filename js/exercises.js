// Exercise types (item generators + renderers) and the sessions built from them.
// Every item only uses letters from ctx.known.
var Exercises = (function () {
  var h = U.h;
  var SIMPLE_FINALS = ['ㄱ', 'ㄴ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅇ'];

  function kindOf(j) { return Hangul.isVowel(j) ? 'v' : 'c'; }
  function glyph(j) { return h('span', { class: 'ko ' + kindOf(j) }, j); }
  function ko(text) { return '<span class="ko">' + text + '</span>'; }

  function roundContext(i) {
    return {
      known: Curriculum.knownAt(i),
      allFinals: ROUNDS.slice(0, i + 1).some(function (r) { return r.allFinals; }),
      words: Curriculum.wordsUpTo(i)
    };
  }

  // ---------- generators ----------

  // Distractor letters: same kind (vowel/consonant) first, then the rest.
  function otherLetters(j, known, n) {
    var others = known.filter(function (x) { return x !== j; });
    var same = others.filter(function (x) { return kindOf(x) === kindOf(j); });
    var diff = others.filter(function (x) { return kindOf(x) !== kindOf(j); });
    return U.shuffle(same).concat(U.shuffle(diff)).slice(0, n);
  }

  function letterSound(ctx, j) {
    return { type: 'letterSound', j: j, options: U.shuffle([j].concat(otherLetters(j, ctx.known, 3))), keys: ['L:' + j] };
  }
  function soundLetter(ctx, j) {
    return { type: 'soundLetter', j: j, options: U.shuffle([j].concat(otherLetters(j, ctx.known, 3))), keys: ['L:' + j] };
  }

  function randomBlock(ctx, must) {
    var cons = ctx.known.filter(Hangul.isConsonant);
    var vows = ctx.known.filter(Hangul.isVowel);
    var l = U.pick(cons), v = U.pick(vows), t = '';
    if (must) { if (Hangul.isVowel(must)) v = must; else l = must; }
    var finals = cons.filter(function (c) {
      return Hangul.canBeFinal(c) && (ctx.allFinals || SIMPLE_FINALS.indexOf(c) >= 0);
    });
    if (finals.length && Math.random() < (ctx.allFinals ? 0.6 : 0.35)) t = U.pick(finals);
    return Hangul.compose(l, v, t);
  }
  function uniqueBlocks(ctx, mustLetters, n) {
    var out = [];
    for (var k = 0; k < n * 15 && out.length < n; k++) {
      var b = randomBlock(ctx, mustLetters.length ? mustLetters[k % mustLetters.length] : null);
      if (out.indexOf(b) < 0) out.push(b);
    }
    return out;
  }
  function blockKeys(b) { return Hangul.letters(b).map(function (j) { return 'L:' + j; }); }

  function readBlock(ctx, b) {
    return { type: 'readBlock', block: b, text: b, rom: Hangul.romanizeBlock(b), alt: [], keys: blockKeys(b) };
  }
  function listen(ctx, b) {
    var opts = [b];
    for (var k = 0; k < 30 && opts.length < 4; k++) {
      var o = randomBlock(ctx);
      if (opts.indexOf(o) < 0) opts.push(o);
    }
    return { type: 'listen', block: b, options: U.shuffle(opts), keys: blockKeys(b) };
  }
  function readWord(ctx, w) {
    return { type: 'readWord', word: w, text: w.ko, rom: w.rom, alt: w.alt, keys: ['W:' + w.ko] };
  }
  function buildWord(ctx, w, fromMeaning) {
    var seq = Hangul.inputSequence(w.ko);
    var own = seq.filter(function (j, i) { return j !== ' ' && seq.indexOf(j) === i; });
    var decoys = U.sample(ctx.known.filter(function (j) { return own.indexOf(j) < 0; }), Math.min(4, Math.max(2, 9 - own.length)));
    var palette = U.shuffle(own.concat(decoys));
    if (seq.indexOf(' ') >= 0) palette.push(' ');
    return { type: fromMeaning ? 'buildMeaning' : 'buildWord', word: w, palette: palette, keys: ['W:' + w.ko] };
  }
  function meaningWord(ctx, w) {
    var pool = Curriculum.words.filter(function (x) { return x.en !== w.en; });
    var opts = [w.en].concat(U.sample(pool, 3).map(function (x) { return x.en; }));
    return { type: 'meaningWord', word: w, options: U.shuffle(opts), keys: ['W:' + w.ko] };
  }

  // ---------- renderers ----------

  function wordAnswer(w) {
    return ko(w.ko) + ' &nbsp;·&nbsp; <b>' + w.rom + '</b> &nbsp;·&nbsp; ' + w.en;
  }
  function blockAnswer(b) {
    var parts = Hangul.inputSequence(b).map(function (j) { return '<span class="ko ' + kindOf(j) + '">' + j + '</span>'; });
    return ko(b) + ' = ' + parts.join(' + ') + ' &nbsp;→&nbsp; <b>' + Hangul.romanizeBlock(b) + '</b>';
  }
  function letterAnswer(j) {
    return '<span class="ko ' + kindOf(j) + '">' + j + '</span> &nbsp;=&nbsp; <b>' + Letters.label(j) + '</b>';
  }

  // Adds the final-consonant rules that explain how the text is read.
  function withRules(note, text) {
    var rules = Romanize.explain(text);
    if (!rules.length) return note;
    return (note ? note : '') + '<ul class="fb-rules">' + rules.map(function (r) { return '<li>' + r + '</li>'; }).join('') + '</ul>';
  }

  function multipleChoice(question, promptEl, options, isRight, content, api, explain, optClass) {
    var answered = false;
    var buttons = options.map(function (o, i) {
      return h('button', { class: 'opt ' + (optClass || ''), onclick: function () { choose(i); } }, [
        h('span', { class: 'num' }, String(i + 1)), content(o)
      ]);
    });
    function choose(i) {
      if (answered) return;
      answered = true;
      buttons.forEach(function (b, k) { b.disabled = true; if (isRight(options[k])) b.classList.add('correct'); });
      var ok = isRight(options[i]);
      if (!ok) buttons[i].classList.add('wrong');
      api.done(ok, explain());
    }
    api.keys(function (e) {
      var n = parseInt(e.key, 10);
      if (n >= 1 && n <= options.length) choose(n - 1);
    });
    return h('div', { class: 'ex' }, [h('p', { class: 'q' }, question), promptEl, h('div', { class: 'options' }, buttons)]);
  }

  function typeAnswer(question, promptEl, item, api, explain) {
    var answered = false;
    var input = h('input', {
      class: 'answer', type: 'text', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off',
      spellcheck: 'false', placeholder: 'type the romanization', 'data-focus': true
    });
    var check = h('button', { class: 'btn primary', onclick: submit }, 'Check');
    function submit() {
      if (answered) return;
      if (!Romanize.norm(input.value)) { input.focus(); return; }
      answered = true;
      input.disabled = true;
      check.disabled = true;
      var result = Romanize.check(input.value, item.text, item.rom, item.alt);
      var ok = result === 'rr' || result === 'mr';
      var fb = explain();
      if (result === 'mr') {
        fb.note = 'Accepted. Revised Romanization: <b>' + item.rom + '</b> · McCune–Reischauer: <b>' + Romanize.mr(item.text) + '</b>';
      } else if (result === 'close') {
        fb.note = Romanize.finalSlip(input.value, item.text, item.rom)
          ? 'Close! It’s <b>' + item.rom + '</b>. At the bottom of a block, consonants are never said g, d, b or r: only k, t, p, l, n, m or ng.'
          : 'Close! Watch g/k, d/t, b/p and r/l. It’s <b>' + item.rom + '</b> (or <b>' + Romanize.mr(item.text) + '</b> in McCune–Reischauer).';
      }
      if (!ok) fb.note = withRules(fb.note, item.text);
      input.classList.add(ok ? 'correct' : 'wrong');
      api.done(ok, fb);
    }
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); submit(); }
    });
    return h('div', { class: 'ex' }, [h('p', { class: 'q' }, question), promptEl, h('div', { class: 'type-row' }, [input, check])]);
  }

  function buildAnswer(question, promptEl, item, api, explain) {
    var target = item.word.ko, seq = [], answered = false;
    var display = h('div', { class: 'composer ko empty' });
    function refresh() {
      display.textContent = seq.length ? Hangul.assemble(seq) : 'tap the letters below';
      display.classList.toggle('empty', !seq.length);
    }
    function press(j) { if (!answered) { seq.push(j); refresh(); } }
    function pop() { if (!answered) { seq.pop(); refresh(); } }
    function submit() {
      if (answered || !seq.length) return;
      answered = true;
      var ok = Hangul.assemble(seq).trim() === target;
      display.classList.add(ok ? 'correct' : 'wrong');
      var fb = explain();
      if (!ok) fb.note = withRules(fb.note, target);
      api.done(ok, fb);
    }
    var tiles = item.palette.map(function (j) {
      if (j === ' ') return h('button', { class: 'tile space', onclick: function () { press(' '); } }, 'space');
      return h('button', { class: 'tile ko ' + kindOf(j), onclick: function () { press(j); } }, j);
    });
    tiles.push(h('button', { class: 'tile key', title: 'Delete', onclick: pop }, '⌫'));
    api.keys(function (e) {
      if (e.key === 'Backspace') { e.preventDefault(); pop(); }
      else if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') { e.preventDefault(); submit(); }
    });
    refresh();
    return h('div', { class: 'ex' }, [
      h('p', { class: 'q' }, question), promptEl, display,
      h('div', { class: 'tiles' }, tiles),
      h('div', { class: 'type-row' }, h('button', { class: 'btn primary', onclick: submit }, 'Check'))
    ]);
  }

  function speakButton(text) {
    return h('button', { class: 'speak', title: 'Play sound', html: Screens.WAVE, onclick: function () { Speech.say(text); } });
  }

  function render(item, api) {
    switch (item.type) {
      case 'letterSound':
        return multipleChoice('What sound does this letter make?',
          h('div', { class: 'prompt-glyph' }, glyph(item.j)),
          item.options, function (o) { return o === item.j; },
          function (o) { return h('span', null, Letters.label(o)); },
          api, function () { return { answer: letterAnswer(item.j) }; });
      case 'soundLetter':
        return multipleChoice('Which letter makes this sound?',
          h('div', { class: 'prompt-rom' }, Letters.label(item.j)),
          item.options, function (o) { return o === item.j; },
          function (o) { return glyph(o); },
          api, function () { return { answer: letterAnswer(item.j) }; }, 'glyph-opt');
      case 'readBlock':
        return typeAnswer('How do you read this block?',
          h('div', { class: 'prompt-glyph ko' }, item.block),
          item, api, function () { return { answer: blockAnswer(item.block) }; });
      case 'readWord':
        return typeAnswer('How do you read this word?',
          h('div', { class: 'prompt-word ko' }, item.word.ko),
          item, api, function () { return { answer: wordAnswer(item.word) }; });
      case 'buildWord':
        return buildAnswer('Spell this word in Hangul.',
          h('div', { class: 'prompt-rom' }, [item.word.rom, h('div', { class: 'meaning' }, item.word.en)]),
          item, api, function () { return { answer: wordAnswer(item.word) }; });
      case 'buildMeaning': {
        var hint = h('button', { class: 'btn link small' }, 'Show romanization');
        hint.addEventListener('click', function () { hint.replaceWith(h('div', { class: 'meaning' }, item.word.rom)); });
        return buildAnswer('Write this in Korean.',
          h('div', { class: 'prompt-rom' }, [item.word.en, h('div', null, hint)]),
          item, api, function () { return { answer: wordAnswer(item.word) }; });
      }
      case 'meaningWord':
        return multipleChoice('What does this word mean?',
          h('div', { class: 'prompt-word ko' }, item.word.ko),
          item.options, function (o) { return o === item.word.en; },
          function (o) { return h('span', null, o); },
          api, function () { return { answer: wordAnswer(item.word) }; }, 'text-opt');
      case 'listen': {
        setTimeout(function () { Speech.say(item.block); }, 250);
        return multipleChoice('Which block do you hear?',
          h('div', { class: 'prompt-listen' }, speakButton(item.block)),
          item.options, function (o) { return o === item.block; },
          function (o) { return h('span', { class: 'ko' }, o); },
          api, function () { return { answer: blockAnswer(item.block) }; }, 'glyph-opt');
      }
    }
    throw new Error('Unknown exercise type ' + item.type);
  }

  // ---------- sessions ----------

  function roundSession(i) {
    var r = ROUNDS[i], ctx = roundContext(i);
    var intro = [], rest = [];
    r.letters.forEach(function (j) { intro.push(letterSound(ctx, j)); });
    U.shuffle(r.letters).forEach(function (j) { intro.push(soundLetter(ctx, j)); });

    uniqueBlocks(ctx, r.letters, 3).forEach(function (b) { rest.push(readBlock(ctx, b)); });

    var focus = r.focus ? r.focus.map(Curriculum.word) : Curriculum.wordsAt(i);
    if (focus.length < 3) {
      focus = focus.concat(U.sample(ctx.words.filter(function (w) { return focus.indexOf(w) < 0; }), 3 - focus.length));
    }
    var kw = Curriculum.word(r.keyword);
    var reads = U.sample(focus, 3);
    var builds = [kw].concat(U.sample(focus.filter(function (w) { return w !== kw && reads.indexOf(w) < 0; }), 2));
    if (builds.length < 3) {
      builds = builds.concat(U.sample(focus.filter(function (w) { return builds.indexOf(w) < 0; }), 3 - builds.length));
    }
    reads.forEach(function (w) { rest.push(readWord(ctx, w)); });
    builds.forEach(function (w) { rest.push(buildWord(ctx, w)); });

    var older = ctx.known.filter(function (j) { return r.letters.indexOf(j) < 0; });
    U.sample(older, r.letters.length ? 2 : 4).forEach(function (j) {
      rest.push(Math.random() < 0.5 ? letterSound(ctx, j) : soundLetter(ctx, j));
    });
    if (Speech.available()) uniqueBlocks(ctx, r.letters, 2).forEach(function (b) { rest.push(listen(ctx, b)); });

    return intro.concat(U.shuffle(rest));
  }

  function pickWord(ctx, used) {
    var w;
    for (var k = 0; k < 8; k++) {
      w = U.weightedPick(ctx.words, function (x) { return Progress.weight('W:' + x.ko); });
      if (used.indexOf(w) < 0) break;
    }
    used.push(w);
    return w;
  }
  function pickLetter(ctx) {
    return U.weightedPick(ctx.known, function (j) { return Progress.weight('L:' + j); });
  }

  // Mixed practice over everything learned, leaning on what you miss most.
  function practiceSession(level, n) {
    var ctx = roundContext(level), items = [], used = [];
    for (var k = 0; k < n; k++) {
      var r = Math.random();
      if (r < 0.18) items.push(letterSound(ctx, pickLetter(ctx)));
      else if (r < 0.33) items.push(soundLetter(ctx, pickLetter(ctx)));
      else if (r < 0.5) items.push(readBlock(ctx, randomBlock(ctx, pickLetter(ctx))));
      else if (r < 0.75) items.push(readWord(ctx, pickWord(ctx, used)));
      else items.push(buildWord(ctx, pickWord(ctx, used)));
    }
    return items;
  }

  // Fixed-shape mock quiz: no repeats, no retries.
  function quizSession(level) {
    var ctx = roundContext(level), items = [];
    U.sample(ctx.known, 3).forEach(function (j) { items.push(letterSound(ctx, j)); });
    U.sample(ctx.known, 3).forEach(function (j) { items.push(soundLetter(ctx, j)); });
    uniqueBlocks(ctx, U.sample(ctx.known, 4), 4).forEach(function (b) { items.push(readBlock(ctx, b)); });
    var words = U.sample(ctx.words, 10);
    words.slice(0, 5).forEach(function (w) { items.push(readWord(ctx, w)); });
    words.slice(5).forEach(function (w) { items.push(buildWord(ctx, w)); });
    return U.shuffle(items);
  }

  function vocabWords(level) {
    return Curriculum.textbook().filter(function (w) { return w.round <= level; });
  }
  function vocabSession(level) {
    var ctx = roundContext(level);
    return U.sample(vocabWords(level), 12).map(function (w, k) {
      return [meaningWord, function (c, x) { return buildWord(c, x, true); }, readWord][k % 3](ctx, w);
    });
  }

  return {
    render: render, roundSession: roundSession, practiceSession: practiceSession,
    quizSession: quizSession, vocabSession: vocabSession, vocabWords: vocabWords
  };
})();
