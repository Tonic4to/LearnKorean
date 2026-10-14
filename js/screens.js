// Every screen in the app. Each function builds DOM and mounts it via App.mount.
var Screens = (function () {
  var h = U.h;
  var NUMBERS = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE'];
  var WAVE = '<svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="currentColor"/><g stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M10 18v4M13.5 15v10M17 12v16M20.5 9v22M24 13v14M27.5 16v8M31 18.5v3"/></g></svg>';
  var ARROW_RIGHT = '<svg viewBox="0 0 70 16" width="58" height="14" aria-hidden="true"><path d="M62 1l7 7-7 7M69 8H1" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  var ARROW_LEFT = '<svg viewBox="0 0 36 16" width="30" height="14" aria-hidden="true"><path d="M8 1L1 8l7 7M1 8h35" fill="none" stroke="currentColor" stroke-width="2"/></svg>';

  // ---------- shared pieces ----------

  function kindOf(j) { return Hangul.isVowel(j) ? 'v' : 'c'; }

  function continueBtn(label, fn) {
    return h('button', { class: 'btn primary', onclick: fn }, [label || 'Continue', h('span', { class: 'arrow', html: ARROW_RIGHT })]);
  }
  function backBtn(fn) {
    return h('button', { class: 'btn link', onclick: fn }, [h('span', { class: 'arrow', html: ARROW_LEFT }), 'Back']);
  }
  function navRow(nav, label) {
    return h('div', { class: 'nav' }, [nav.back ? backBtn(nav.back) : null, continueBtn(label, nav.next)]);
  }
  function bindNav(nav) {
    App.onKey(function (e) {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
      if (e.key === 'Enter' || e.key === 'ArrowRight') { e.preventDefault(); nav.next(); }
      else if (e.key === 'ArrowLeft' && nav.back) { e.preventDefault(); nav.back(); }
    });
  }
  var SPEAKER_ON = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  var SPEAKER_OFF = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  // Sound effects on/off. withText = the labeled version used on the home page.
  function sfxToggle(withText) {
    var btn = h('button', { class: withText ? 'btn link small sfx' : 'sfx-icon', title: 'Sound effects' });
    function paint() {
      btn.innerHTML = (Sfx.isOn() ? SPEAKER_ON : SPEAKER_OFF) + (withText ? ' Sound effects ' + (Sfx.isOn() ? 'on' : 'off') : '');
    }
    btn.addEventListener('click', function () { Sfx.toggle(); paint(); btn.blur(); });
    paint();
    return btn;
  }

  function homeLink() {
    return h('button', { class: 'home-link', onclick: home }, '← Home');
  }
  function screen(cls, children, deco) {
    return h('div', { class: 'screen ' + (cls || '') }, [
      deco ? h('div', { class: 'deco ' + deco }) : null,
      h('div', { class: 'content' }, children)
    ]);
  }
  function speakButton(text, extra) {
    if (!Speech.available()) return null;
    return h('button', {
      class: 'speak ' + (extra || ''), title: 'Play sound', html: WAVE,
      onclick: function () { Speech.say(text); }
    });
  }
  function bubble(j, cls) {
    return h('div', { class: 'bubble ' + (cls || '') }, [
      h('span', { class: 'ko glyph' }, j),
      h('span', { class: 'badge ' + kindOf(j) }, Letters.label(j))
    ]);
  }

  // Run a list of step functions; each receives {next, back}.
  function runFlow(steps) {
    function go(i) {
      steps[i]({
        next: function () { if (i + 1 < steps.length) go(i + 1); },
        back: i > 0 ? function () { go(i - 1); } : null
      });
    }
    go(0);
  }

  // ---------- home ----------

  function home() {
    var level = Progress.level();
    var known = level >= 0 ? Curriculum.knownAt(level).length : 0;

    var rounds = ROUNDS.map(function (r, i) {
      var done = Progress.isComplete(i);
      var open = done || i <= level + 1;
      var state = done ? 'done' : open ? 'current' : 'locked';
      return h('button', {
        class: 'round-card ' + state, disabled: !open,
        onclick: function () { playRound(i); }
      }, [
        h('span', { class: 'round-num' }, String(i + 1)),
        h('span', { class: 'round-kw ko' }, done ? r.keyword : ''),
        h('span', { class: 'round-rom' }, r.parts.join('')),
        h('span', { class: 'round-sub' }, r.letters.length ? r.letters.length + ' new letters' : 'final consonants')
      ]);
    });

    var vocabCount = Exercises.vocabWords(level).length;
    var actions = h('div', { class: 'actions' }, [
      h('button', { class: 'action', disabled: level < 0, onclick: function () { practice(); } }, [h('b', null, 'Practice'), h('span', null, 'Mixed review of everything you know')]),
      h('button', { class: 'action', disabled: level < 0, onclick: function () { quiz(); } }, [h('b', null, 'Mock quiz'), h('span', null, '20 questions, scored')]),
      h('button', { class: 'action', onclick: function () { vocabList(); } }, [h('b', null, 'Textbook words'), h('span', null, 'Yonsei ch. 4–7 · ' + vocabCount + ' unlocked')]),
      h('button', { class: 'action', onclick: function () { chart({}); } }, [h('b', null, 'Letter chart'), h('span', null, 'Review any letter you’ve learned')])
    ]);

    var footer = h('div', { class: 'footer' }, [
      sfxToggle(true),
      h('button', {
        class: 'btn link small', onclick: function () {
          if (confirm('Mark every round as finished? Use this if you already know the alphabet.')) { Progress.unlockAll(); home(); }
        }
      }, 'Unlock all rounds'),
      h('button', {
        class: 'btn link small', onclick: function () {
          if (confirm('Erase all progress?')) { Progress.reset(); home(); }
        }
      }, 'Reset progress')
    ]);

    App.mount(screen('home', [
      h('div', { class: 'eyebrow' }, 'LEARN HANGUL'),
      h('h1', { class: 'lead' }, known ? ['You know ', h('b', null, String(known)), ' of 40 letters.'] : 'Start with round one — no Korean needed.'),
      h('div', { class: 'rounds' }, rounds),
      actions,
      footer
    ]));
    App.onKey(null);
  }

  // ---------- round flow ----------

  function playRound(i) {
    var r = ROUNDS[i], steps = [], result = null;
    steps.push(function (nav) { roundIntro(i, nav); });
    if (r.letters.length) steps.push(function (nav) { newLetters(r.letters, nav); });
    r.letters.forEach(function (j) { steps.push(function (nav) { letterCard(j, nav, true); }); });
    (r.notes || []).forEach(function (n) { steps.push(function (nav) { noteCard(n, nav); }); });
    steps.push(function (nav) { keywordScreen(r, nav); });
    steps.push(function (nav) {
      exerciseScreen(Exercises.roundSession(i), {
        label: 'ROUND ' + (i + 1), requeue: true,
        onFinish: function (res) { Progress.complete(i); result = res; nav.next(); }
      });
    });
    steps.push(function (nav) { roundComplete(i, result, nav); });
    steps.push(function () {
      var last = i + 1 >= ROUNDS.length;
      chart({ highlight: r.letters, label: last ? 'Finish' : 'Next round', next: last ? home : function () { playRound(i + 1); } });
    });
    runFlow(steps);
  }

  function roundIntro(i, nav) {
    var r = ROUNDS[i];
    App.mount(screen('intro', [
      homeLink(),
      h('div', { class: 'round-tag' }, ['ROUND', h('span', { class: 'round-badge' }, String(i + 1))]),
      h('div', { class: 'intro-title' }, ['ROUND ' + NUMBERS[i] + ':', h('b', null, r.parts.join('').toUpperCase())]),
      navRow({ next: nav.next })
    ], 'center'));
    bindNav({ next: nav.next });
  }

  function newLetters(letters, nav) {
    App.mount(screen('letters', [
      homeLink(),
      h('p', { class: 'lead' }, 'New letters for this round…'),
      h('div', { class: 'bubbles' }, letters.map(function (j) { return bubble(j); })),
      navRow(nav)
    ]));
    bindNav(nav);
  }

  function letterCard(j, nav, isNew) {
    var L = Letters.get(j), finalRom = Letters.finalRom(j);
    var text = [
      h('p', { class: 'big', html: 'This letter sounds like <b>' + L.sound + '</b>' + (L.as ? ', as in <i>' + L.as + '</i>.' : '.') }),
      j === 'ㅇ' ? null : h('p', { html: 'Here we’ll write it as <b>' + Letters.label(j) + '</b>.' }),
      h('p', { html: L.hint })
    ];
    if (kindOf(j) === 'c' && j !== 'ㅇ') {
      if (!finalRom) text.push(h('p', { class: 'muted' }, 'It never appears at the bottom of a block.'));
      else if (finalRom !== Letters.rom(j)) text.push(h('p', { class: 'muted', html: 'At the bottom of a block it sounds like <b>' + finalRom + '</b>.' }));
    }
    var mr = Romanize.letterMR(j);
    if (mr) text.push(h('p', { class: 'muted', html: 'In the older McCune–Reischauer system: <b>' + mr + '</b>.' }));
    if (L.name) text.push(h('p', { class: 'muted', html: 'Its name is <i>' + L.name + '</i>.' }));
    var forms = Letters.forms(j);
    if (forms) {
      text.push(h('div', { class: 'forms' }, [
        h('p', { class: 'muted' }, 'Fonts and handwriting draw it a few ways:'),
        h('div', { class: 'forms-row' }, forms.map(function (f) {
          return h('figure', { class: 'form' }, [
            h('div', { class: 'form-glyph', html: '<svg viewBox="0 0 100 100" aria-hidden="true">' + f.svg + '</svg>' }),
            h('figcaption', null, f.label)
          ]);
        }))
      ]));
    }

    App.mount(screen('card', [
      homeLink(),
      h('div', { class: 'card-grid' }, [
        h('div', { class: 'card-left' }, [
          h('div', { class: 'eyebrow dark' }, (isNew ? 'NEW ' : '') + Letters.groupName(j).toUpperCase()),
          h('div', { class: 'card-glyph ko' }, j),
          h('div', { class: 'card-badge' }, [
            h('span', { class: 'badge big ' + kindOf(j) }, Letters.label(j)),
            speakButton(Letters.sayText(j), 'on-badge')
          ])
        ]),
        h('div', { class: 'card-right' }, text.concat([navRow(nav, isNew ? 'Next' : 'Back to chart')]))
      ])
    ], 'card-circle'));
    bindNav(nav);
  }

  function noteCard(n, nav) {
    App.mount(screen('note', [
      homeLink(),
      h('div', { class: 'eyebrow' }, 'GOOD TO KNOW'),
      h('h2', null, n.title),
      h('div', { class: 'note-body', html: n.html }),
      navRow(nav)
    ], 'right'));
    bindNav(nav);
  }

  function keywordScreen(r, nav) {
    var syllables = Array.from(r.keyword).map(function (s, k) {
      return h('div', { class: 'kw-syl' }, [
        h('div', { class: 'kw-block ko' }, s),
        h('div', { class: 'kw-jamo' }, Hangul.inputSequence(s).map(function (j) { return h('span', { class: 'ko ' + kindOf(j) }, j); })),
        h('div', { class: 'kw-rom' }, r.parts[k])
      ]);
    });
    App.mount(screen('keyword', [
      homeLink(),
      h('div', { class: 'eyebrow dark' }, 'ROUND KEYWORD'),
      h('div', { class: 'kw-row' }, [syllables, speakButton(r.keyword)]),
      h('p', { class: 'big', html: 'The keyword for this round is <b>' + r.parts.join('') + '</b>: ' + r.meaning + '.' }),
      navRow(nav)
    ], 'left'));
    bindNav(nav);
  }

  function roundComplete(i, res, nav) {
    var r = ROUNDS[i];
    var line = r.letters.length
      ? ['You’ve learned ', h('b', null, String(r.letters.length)), ' new Hangul letters!']
      : 'You’ve learned how final consonants work!';
    Sfx.complete();
    App.mount(screen('complete', [
      h('div', { class: 'eyebrow' }, 'ROUND COMPLETE!'),
      h('p', { class: 'lead' }, line),
      res ? h('p', { class: 'muted' }, res.correct + ' of ' + res.total + ' right on the first try.') : null,
      h('div', { class: 'bubbles' }, r.letters.map(function (j) { return bubble(j); })),
      navRow({ next: nav.next })
    ]));
    bindNav({ next: nav.next });
  }

  // ---------- letter chart ----------

  function chart(opts) {
    var level = Progress.level();
    var known = level >= 0 ? Curriculum.knownAt(level) : [];
    var hl = opts.highlight || [];
    var next = opts.next || home;

    var rows = CHART_ROWS.map(function (row) {
      return h('div', { class: 'chart-row' }, [
        h('div', { class: 'chart-label' }, row.label),
        h('div', { class: 'chart-cells' }, row.letters.split('').map(function (j) {
          var isKnown = known.indexOf(j) >= 0;
          return h('button', {
            class: 'cell ko ' + kindOf(j) + (isKnown ? ' known' : '') + (hl.indexOf(j) >= 0 ? ' new' : ''),
            disabled: !isKnown,
            title: isKnown ? Letters.label(j) : 'Not learned yet',
            onclick: function () { letterCard(j, { next: function () { chart(opts); } }, false); }
          }, j);
        }))
      ]);
    });

    App.mount(screen('chart', [
      homeLink(),
      hl.length ? h('div', { class: 'eyebrow' }, 'ROUND COMPLETE!') : null,
      h('p', { class: 'lead' }, ['You now know ', h('b', null, String(known.length)), ' Hangul letters!']),
      known.length ? h('p', { class: 'muted' }, 'Tap a letter to review it.') : null,
      h('div', { class: 'chart' }, rows),
      navRow({ next: next }, opts.label || 'Done')
    ]));
    bindNav({ next: next });
  }

  // ---------- exercises ----------

  function exerciseScreen(items, opts) {
    var queue = items.slice(), idx = 0, firstTry = 0, total = items.length, misses = [];
    var fill = h('div', { class: 'bar-fill' });
    var body = h('div', { class: 'ex-body' });
    var foot = h('div', { class: 'ex-foot' });

    App.mount(h('div', { class: 'screen exercise' }, h('div', { class: 'content' }, [
      h('div', { class: 'ex-top' }, [
        h('button', {
          class: 'quit', title: 'Leave', onclick: function () {
            if (confirm('Leave now? This session won’t be saved.')) home();
          }
        }, '✕'),
        h('div', { class: 'bar' }, fill),
        h('span', { class: 'ex-label' }, opts.label || ''),
        sfxToggle()
      ]),
      body, foot
    ])));

    function show() {
      if (idx >= queue.length) {
        fill.style.width = '100%';
        opts.onFinish({ correct: firstTry, total: total, misses: misses });
        return;
      }
      fill.style.width = (100 * idx / queue.length) + '%';
      var item = queue[idx];
      foot.innerHTML = '';
      App.onKey(null);
      body.innerHTML = '';
      body.appendChild(Exercises.render(item, {
        keys: function (fn) { App.onKey(fn); },
        done: function (ok, fb) { answered(item, ok, fb || {}); }
      }));
      var f = body.querySelector('[data-focus]');
      if (f) f.focus();
    }

    function answered(item, ok, fb) {
      Progress.record(item.keys, ok);
      if (ok) Sfx.correct();
      if (!item.retry) {
        if (ok) firstTry++;
        else misses.push(item);
      }
      if (!ok && opts.requeue && (item.retry || 0) < 2) {
        queue.push(Object.assign({}, item, { retry: (item.retry || 0) + 1 }));
      }
      function next() { idx++; show(); }
      foot.appendChild(h('div', { class: 'feedback ' + (ok ? 'ok' : 'bad') }, [
        h('div', { class: 'fb-text' }, [
          h('strong', null, ok ? 'Correct!' : 'Not quite.'),
          fb.answer ? h('div', { class: 'fb-answer', html: fb.answer }) : null,
          fb.note ? h('div', { class: 'fb-note', html: fb.note }) : null
        ]),
        continueBtn('Continue', next)
      ]));
      if (document.activeElement) document.activeElement.blur();
      App.onKey(function (e) {
        if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') { e.preventDefault(); next(); }
      });
    }

    show();
  }

  // ---------- practice, quiz, textbook vocab ----------

  function results(title, res, again) {
    if (res.correct === res.total) Sfx.complete();
    var misses = res.misses.map(function (it) {
      if (it.word) return h('li', { html: '<span class="ko">' + it.word.ko + '</span> · <b>' + it.word.rom + '</b> · ' + it.word.en });
      if (it.block) return h('li', { html: '<span class="ko">' + it.block + '</span> · <b>' + Hangul.romanizeBlock(it.block) + '</b>' });
      return h('li', { html: '<span class="ko ' + kindOf(it.j) + '">' + it.j + '</span> · <b>' + Letters.label(it.j) + '</b>' });
    });
    App.mount(screen('results', [
      homeLink(),
      h('div', { class: 'eyebrow' }, title),
      h('p', { class: 'score' }, [h('b', null, String(res.correct)), ' / ' + res.total]),
      misses.length ? h('div', null, [h('p', { class: 'muted' }, 'Worth another look:'), h('ul', { class: 'misses' }, misses)]) : h('p', { class: 'lead' }, 'Perfect!'),
      h('div', { class: 'nav' }, [h('button', { class: 'btn link', onclick: home }, 'Home'), continueBtn('Go again', again)])
    ]));
    bindNav({ next: again });
  }

  function practice() {
    exerciseScreen(Exercises.practiceSession(Progress.level(), 15), {
      label: 'PRACTICE', requeue: true,
      onFinish: function (res) { results('PRACTICE', res, practice); }
    });
  }
  function quiz() {
    exerciseScreen(Exercises.quizSession(Progress.level()), {
      label: 'MOCK QUIZ', requeue: false,
      onFinish: function (res) { results('MOCK QUIZ', res, quiz); }
    });
  }
  function vocabPractice() {
    exerciseScreen(Exercises.vocabSession(Progress.level()), {
      label: 'TEXTBOOK WORDS', requeue: true,
      onFinish: function (res) { results('TEXTBOOK WORDS', res, vocabPractice); }
    });
  }

  function vocabList() {
    var level = Progress.level();
    var unlocked = Exercises.vocabWords(level);
    var chapters = {};
    Curriculum.textbook().forEach(function (w) { (chapters[w.ch] = chapters[w.ch] || []).push(w); });

    var sections = Object.keys(chapters).map(function (ch) {
      return h('section', { class: 'vocab' }, [
        h('h3', null, 'Chapter ' + ch),
        h('div', { class: 'vocab-list' }, chapters[ch].map(function (w) {
          var open = w.round <= level;
          return h('div', { class: 'vocab-row' + (open ? '' : ' locked') }, [
            h('span', { class: 'ko vocab-ko' }, open ? w.ko : '— after round ' + (w.round + 1) + ' —'),
            h('span', { class: 'vocab-rom' }, [w.rom, h('small', null, Romanize.mr(w.ko))]),
            h('span', { class: 'vocab-en' }, w.en)
          ]);
        }))
      ]);
    });

    App.mount(screen('vocab-page', [
      homeLink(),
      h('div', { class: 'eyebrow' }, 'YONSEI KOREAN · CHAPTERS 4–7'),
      h('p', { class: 'lead' }, unlocked.length + ' of ' + Curriculum.textbook().length + ' words unlocked.'),
      unlocked.length >= 4
        ? h('div', { class: 'nav left' }, continueBtn('Practice these words', vocabPractice))
        : h('p', { class: 'muted' }, 'Finish a few more rounds to practice these. Words appear once you’ve learned all their letters.'),
      sections
    ]));
    if (unlocked.length >= 4) bindNav({ next: vocabPractice });
    else App.onKey(null);
  }

  return { home: home, WAVE: WAVE };
})();
