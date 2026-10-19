// Grammar lesson pieces: hoverable glossed sentences, the four grammar
// exercise types (pick, arrange, translate, write) and their sessions.
var GrammarEx = (function () {
  var h = U.h;
  var wrap = Grammar.koWrap;

  // ---------- glossed text ----------

  // Keep a tooltip inside the window.
  function placeTip(span) {
    var tip = span.querySelector('.gl-tip');
    if (!tip) return;
    tip.style.marginLeft = '0px';
    var r = tip.getBoundingClientRect(), pad = 8, shift = 0;
    if (r.left < pad) shift = pad - r.left;
    else if (r.right > window.innerWidth - pad) shift = window.innerWidth - pad - r.right;
    tip.style.marginLeft = shift + 'px';
  }

  function tipFor(word, next) {
    var g = Grammar.gloss(word, next);
    return h('span', { class: 'gl-tip', role: 'tooltip' }, [
      h('span', { class: 'gl-head' }, [h('span', { class: 'ko' }, word), h('span', { class: 'gl-rom' }, g.rom)]),
      g.parts.map(function (p, i) {
        return h('span', { class: 'gl-part' }, [
          h('span', { class: 'ko' + (p.ending ? ' gl-end' : '') }, (i ? '+ ' : '') + p.ko), ' ', p.en
        ]);
      })
    ]);
  }

  // One hoverable word. Tapping it (or tabbing to it) shows the tooltip too.
  function word(text, next, content, cls) {
    var span = h('span', { class: 'gl ' + (cls || ''), tabindex: '0' }, [
      h('span', { class: 'gl-text' }, content || text), tipFor(text, next)
    ]);
    span.addEventListener('mouseenter', function () { placeTip(span); });
    span.addEventListener('focus', function () { placeTip(span); });
    return span;
  }

  // A Korean sentence with every word hoverable. blank: { fill, state } for
  // the word containing _ (fill null = still empty).
  function line(text, blank, cls) {
    var tokens = text.split(' ');
    var parts = tokens.map(function (tok) { return Grammar.stripPunct(tok); });
    var out = [];
    parts.forEach(function (p, i) {
      if (i) out.push(' ');
      if (p.pre) out.push(p.pre);
      var next = parts[i + 1] ? parts[i + 1].word.replace('_', blank && blank.fill || '') : null;
      if (p.word.indexOf('_') >= 0) {
        var bits = p.word.split('_');
        if (!blank || blank.fill == null) {
          out.push(h('span', { class: 'gl-blanked' }, [bits[0], h('span', { class: 'blank' }, ' '), bits[1]]));
        } else {
          var full = bits[0] + blank.fill + bits[1];
          out.push(word(full, next, [bits[0], h('span', { class: 'blank filled ' + (blank.state || '') }, blank.fill), bits[1]]));
        }
      } else if (p.word) out.push(word(p.word, next));
      if (p.post) out.push(p.post);
    });
    return h('span', { class: 'gl-line ko ' + (cls || '') }, out);
  }

  // Mixed English/Korean text (exercise tasks): Korean runs become hoverable.
  function mixed(text) {
    return text.split(/([가-힣]+(?:[ ,]+[가-힣]+)*[?.]?)/).map(function (s, i) {
      return i % 2 ? line(s) : s;
    });
  }

  function speak(text) {
    if (!Speech.available()) return null;
    return h('button', {
      class: 'speak small-speak', title: 'Play sound', html: Screens.WAVE,
      onclick: function () { Speech.say(text.replace(/_/g, '')); }
    });
  }

  // ---------- lesson cards ----------

  function ruleTable(rows) {
    return h('table', { class: 'g-rule' }, rows.map(function (r) {
      return h('tr', null, [
        h('td', { class: 'g-when' }, r[0]),
        h('td', { class: 'g-form ko' }, r[1]),
        h('td', { class: 'g-ex', html: wrap(r[2]) })
      ]);
    }));
  }

  function examples(list) {
    return h('div', { class: 'g-examples' }, list.map(function (e) {
      return h('div', { class: 'g-example' }, [
        h('div', { class: 'g-ko' }, [line(e[0]), speak(e[0])]),
        h('div', { class: 'g-en' }, e[1])
      ]);
    }));
  }

  function cardBody(card) {
    return [
      h('div', { class: 'note-body', html: wrap(card.html) }),
      card.rule ? ruleTable(card.rule) : null,
      card.examples ? examples(card.examples) : null,
      card.foot ? h('p', { class: 'g-foot', html: wrap(card.foot) }) : null,
      card.examples ? h('p', { class: 'g-tiphint muted' }, 'Hover or tap any Korean word to see how it’s read and what it means.') : null
    ];
  }

  // ---------- exercises ----------

  function answerOf(ex) {
    if (ex.pick) return ex.pick.replace('_', ex.ans);
    if (ex.arrange) return ex.arrange;
    return ex.ko[0];
  }

  function issuesHtml(issues) {
    if (!issues.length) return '';
    return '<ul class="fb-rules">' + issues.map(function (x) { return '<li>' + x.html + '</li>'; }).join('') + '</ul>';
  }

  function answerNode(ko, en) {
    return h('div', { class: 'fb-sentence' }, [line(ko), en ? h('div', { class: 'fb-en' }, en) : null]);
  }

  function prompt(en, korean, label) {
    return h('div', { class: 'prompt-sentence' }, [
      label ? h('div', { class: 'ps-label' }, label) : null,
      en ? h('div', { class: 'ps-en' }, en) : null,
      korean || null
    ]);
  }

  function pickNote(ex, chosen) {
    var toks = ex.pick.split(' '), at = toks.findIndex(function (t) { return t.indexOf('_') >= 0; });
    var before = Grammar.stripPunct(toks[at]).word.split('_')[0];
    var ok = chosen === ex.ans, notes = [];
    // A lone word before a noun: 저 here is "that … over there", not "I".
    var beforeNoun = toks[at] === '_' && at + 1 < toks.length;
    function mean(w) { return beforeNoun && DETERMINERS[w] || Grammar.meaning(w); }
    if (GRAMMAR_MISTAKES[chosen]) notes.push(GRAMMAR_MISTAKES[chosen].note);
    else if (before && ENDINGS[ex.ans]) {
      notes.push(ok ? (Grammar.reason(before, ex.ans) || ex.ans + ' = ' + ENDINGS[ex.ans].en + '.') : Grammar.explainEnding(before, ex.ans, chosen));
    } else {
      notes.push('<b>' + ex.ans + '</b> = ' + (mean(ex.ans) || ENDINGS[ex.ans] && ENDINGS[ex.ans].en) + '.');
      var m = mean(chosen);
      if (!ok && m) notes.push('<b>' + chosen + '</b> = ' + m + '.');
    }
    if (ex.why) notes.push(ex.why);
    return wrap(notes.join(' '));
  }

  function renderPick(item, api) {
    var ex = item.ex, answered = false;
    var sentence = h('div', { class: 'ps-ko' }, line(ex.pick));
    var buttons = ex.opts.map(function (o, i) {
      return h('button', { class: 'opt ko', onclick: function () { choose(i); } }, [h('span', { class: 'num' }, String(i + 1)), o]);
    });
    function choose(i) {
      if (answered) return;
      answered = true;
      var chosen = ex.opts[i], ok = chosen === ex.ans;
      buttons.forEach(function (b, k) { b.disabled = true; if (ex.opts[k] === ex.ans) b.classList.add('correct'); });
      if (!ok) buttons[i].classList.add('wrong');
      sentence.innerHTML = '';
      sentence.appendChild(line(ex.pick, { fill: chosen, state: ok ? 'ok' : 'bad' }));
      api.done(ok, { answerNode: ok ? null : answerNode(answerOf(ex), ex.en), note: pickNote(ex, chosen) });
    }
    api.keys(function (e) {
      var n = parseInt(e.key, 10);
      if (n >= 1 && n <= ex.opts.length) choose(n - 1);
    });
    return h('div', { class: 'ex' }, [
      h('p', { class: 'q' }, ex.opts.every(function (o) { return ENDINGS[o]; }) ? 'Pick the right ending.' : 'Pick the right word.'),
      prompt(ex.en, sentence),
      h('div', { class: 'options' + (ex.opts.length === 3 ? ' three' : '') }, buttons)
    ]);
  }

  // Split the answer into tiles: the lesson's focus particles become their own
  // tiles, and their other forms (or other words from the same group) join as decoys.
  function arrangeTiles(ex, lesson) {
    var tiles = [], decoys = [];
    function decoy(t) { if (decoys.every(function (d) { return d.text !== t.text; })) decoys.push(t); }
    Grammar.words(ex.arrange).forEach(function (w) {
      var p = Grammar.parse(w), cut = -1;
      p.ends.forEach(function (e, k) { if (cut < 0 && lesson.focus.indexOf(e) >= 0) cut = k; });
      if (cut < 0) {
        tiles.push({ text: w });
        var g = lesson.focusWords && Grammar.groupOf(p.stem);
        if (g && !p.ends.length) U.sample(g.filter(function (x) { return x !== p.stem; }), 1).forEach(function (x) { decoy({ text: x }); });
        else if (g) U.sample(g.filter(function (x) { return x !== p.stem; }), 1).forEach(function (x) { decoy({ text: x + p.ends.join('') }); });
        return;
      }
      tiles.push({ text: p.stem + p.ends.slice(0, cut).join('') });
      var e = p.ends[cut];
      tiles.push({ text: p.ends.slice(cut).join(''), end: true });
      var fam = ENDINGS[e].fam;
      ENDING_FAMILIES[fam].forms.forEach(function (f) { if (f !== e) decoy({ text: f, end: true }); });
      if (fam === 'also') decoy({ text: Grammar.attach(p.stem, 'topic'), end: true });
    });
    var real = tiles.map(function (t) { return t.text; });
    return U.shuffle(tiles.concat(decoys.filter(function (d) { return real.indexOf(d.text) < 0; }).slice(0, 3)));
  }

  function renderArrange(item, api) {
    var ex = item.ex, lesson = item.lesson, answered = false;
    var tiles = arrangeTiles(ex, lesson), placed = [];
    var built = h('div', { class: 'arrange-line ko empty' });
    var bank = h('div', { class: 'tiles arrange-bank' });
    function text() {
      return placed.reduce(function (s, t) { return s + (s && !t.end ? ' ' : '') + t.text; }, '');
    }
    function paint() {
      built.innerHTML = '';
      built.classList.toggle('empty', !placed.length);
      if (!placed.length) built.textContent = 'tap the pieces below in order';
      placed.forEach(function (t, k) {
        if (k && !t.end) built.appendChild(document.createTextNode(' '));
        built.appendChild(h('button', { class: 'piece placed' + (t.end ? ' end' : ''), onclick: function () { remove(k); } }, t.text));
      });
      bank.innerHTML = '';
      tiles.forEach(function (t) {
        bank.appendChild(h('button', {
          // A particle needs a word to attach to.
          class: 'piece ko' + (t.end ? ' end' : ''), disabled: placed.indexOf(t) >= 0 || (t.end && !placed.length),
          onclick: function () { if (!answered) { placed.push(t); paint(); } }
        }, t.end ? '-' + t.text : t.text));
      });
    }
    function remove(k) {
      if (answered) return;
      placed.splice(k, 1);
      while (placed.length && placed[0].end) placed.shift();
      paint();
    }
    function submit() {
      if (answered || !placed.length) return;
      answered = true;
      var typed = text() + (/\?\s*$/.test(ex.arrange) ? '?' : '');
      var r = Grammar.check(typed, [ex.arrange]);
      built.classList.add(r.ok ? 'correct' : 'wrong');
      Array.from(document.querySelectorAll('.piece')).forEach(function (b) { b.disabled = true; });
      api.done(r.ok, { answerNode: answerNode(ex.arrange, ex.en), note: issuesHtml(r.issues) });
    }
    api.keys(function (e) {
      if (e.key === 'Backspace') { e.preventDefault(); if (placed.length) remove(placed.length - 1); }
      else if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') { e.preventDefault(); submit(); }
    });
    paint();
    return h('div', { class: 'ex' }, [
      h('p', { class: 'q' }, 'Put the sentence together.'),
      prompt(ex.en),
      built, bank,
      h('div', { class: 'type-row' }, h('button', { class: 'btn primary', onclick: submit }, 'Check'))
    ]);
  }

  // Base words of the answer, as hoverable chips (spelling help).
  function wordBank(ko) {
    var seen = [];
    Grammar.words(ko).forEach(function (w) {
      var stem = Grammar.parse(w).stem;
      if (seen.indexOf(stem) < 0) seen.push(stem);
    });
    return h('div', { class: 'word-bank' }, [
      h('span', { class: 'wb-label' }, 'Words'),
      U.shuffle(seen).map(function (s) { return word(s, null, null, 'chip ko'); })
    ]);
  }

  function renderWrite(item, api) {
    var ex = item.ex, answered = false, isWrite = !!ex.write;
    var box = KoInput.create({ onEnter: submit });
    var check = h('button', { class: 'btn primary', onclick: submit }, 'Check');
    var bank = wordBank(ex.ko[0]);
    var bankSlot = h('div', { class: 'bank-slot' });
    if (isWrite) {
      var reveal = h('button', { class: 'btn link small' }, 'Show word hints');
      reveal.addEventListener('click', function () { reveal.replaceWith(bank); });
      bankSlot.appendChild(reveal);
    } else bankSlot.appendChild(bank);

    function submit() {
      if (answered) return;
      var v = box.value();
      if (!Grammar.words(v).length) { box.input.focus(); return; }
      answered = true;
      box.disable();
      check.disabled = true;
      var r = Grammar.check(v, ex.ko);
      box.input.classList.add(r.ok ? 'correct' : 'wrong');
      api.done(r.ok, {
        title: r.ok && !r.exact ? 'Grammar’s right!' : null,
        answerNode: r.exact ? null : answerNode(r.answer, isWrite ? null : ex.translate),
        note: (r.ok && !r.exact ? 'Just a small slip:' : '') + issuesHtml(r.issues)
      });
    }
    return h('div', { class: 'ex' }, [
      h('p', { class: 'q' }, isWrite ? 'Write it in Korean.' : 'Translate into Korean.'),
      isWrite ? prompt(null, h('div', { class: 'ps-task' }, mixed(ex.write))) : prompt(null, h('div', { class: 'ps-big' }, ex.translate)),
      bankSlot,
      h('div', { class: 'type-row' }, [box.input, check]),
      box.hint, box.osk
    ]);
  }

  function render(item, api) {
    if (item.ex.pick) return renderPick(item, api);
    if (item.ex.arrange) return renderArrange(item, api);
    return renderWrite(item, api);
  }

  // ---------- sessions ----------

  function lessonById(id) { return LESSONS.filter(function (l) { return l.id === id; })[0]; }

  function itemFor(lesson, ex, idx) {
    return { type: 'grammar', lesson: lesson, ex: ex, keys: ['G:' + lesson.id, 'GI:' + lesson.id + ':' + idx] };
  }

  // Picks first (shuffled), then building sentences, then writing them.
  function lessonSession(lesson) {
    var items = lesson.exercises.map(function (ex, k) { return itemFor(lesson, ex, k); });
    function of(test) { return items.filter(function (it) { return test(it.ex); }); }
    return U.shuffle(of(function (e) { return e.pick; }))
      .concat(of(function (e) { return e.arrange; }))
      .concat(U.shuffle(of(function (e) { return e.translate || e.write; })));
  }

  // Mixed review over finished lessons, leaning on items you've missed.
  function practiceSession(lessonIds, n) {
    var pool = [];
    lessonIds.forEach(function (id) {
      var l = lessonById(id);
      l.exercises.forEach(function (ex, k) { pool.push(itemFor(l, ex, k)); });
    });
    var chosen = [];
    for (var k = 0; k < n && pool.length; k++) {
      var it = U.weightedPick(pool, function (x) { return Progress.weight(x.keys[1]); });
      chosen.push(it);
      pool.splice(pool.indexOf(it), 1);
    }
    return U.shuffle(chosen);
  }

  function missLine(item) {
    return h('li', null, [line(answerOf(item.ex)), item.ex.write ? null : ' · ' + (item.ex.en || item.ex.translate)]);
  }

  return {
    line: line, word: word, cardBody: cardBody, ruleTable: ruleTable, render: render,
    lessonSession: lessonSession, practiceSession: practiceSession, lessonById: lessonById,
    answerOf: answerOf, missLine: missLine
  };
})();
