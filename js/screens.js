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
  // nav.skip adds a link that marks the lesson done without playing it.
  function navRow(nav, label) {
    return h('div', { class: 'nav' }, [
      nav.back ? backBtn(nav.back) : null,
      nav.skip ? h('button', { class: 'btn link small', onclick: nav.skip }, 'Already done? Mark as done') : null,
      continueBtn(label, nav.next)
    ]);
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

  var TAB_KEY = 'hangul-tab';
  var tab = 'alphabet';
  try { tab = localStorage.getItem(TAB_KEY) || 'alphabet'; } catch (e) { /* ignore */ }

  function home(which) {
    if (which) {
      tab = which;
      try { localStorage.setItem(TAB_KEY, tab); } catch (e) { /* ignore */ }
    }
    var tabs = h('div', { class: 'tabs', role: 'tablist' }, [['alphabet', 'Alphabet'], ['grammar', 'Grammar'], ['words', 'Words']].map(function (t) {
      return h('button', {
        class: 'tab' + (tab === t[0] ? ' on' : ''), role: 'tab', 'aria-selected': tab === t[0] ? 'true' : 'false',
        onclick: function () { home(t[0]); }
      }, t[1]);
    }));
    var body = tab === 'grammar' ? grammarHome() : tab === 'words' ? wordsHome() : alphabetHome();

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

    App.mount(screen('home', [h('div', { class: 'eyebrow' }, 'LEARN KOREAN'), tabs, body, footer]));
    App.onKey(null);
  }

  function action(title, sub, fn, disabled) {
    return h('button', { class: 'action', disabled: !!disabled, onclick: fn }, [h('b', null, title), h('span', null, sub)]);
  }

  function alphabetHome() {
    var level = Progress.level();
    var known = level >= 0 ? Curriculum.knownAt(level).length : 0;

    var rounds = ROUNDS.map(function (r, i) {
      var done = Progress.isComplete(i);
      var open = done || i <= level + 1;
      var state = done ? 'done' : open ? 'current' : 'locked';
      return h('button', {
        class: 'round-card ' + state, title: open ? null : 'Mark the rounds before this as done to jump here',
        onclick: function () {
          if (!open) {
            if (!confirm('Mark rounds 1–' + i + ' as done and jump to round ' + (i + 1) + '?')) return;
            for (var k = 0; k < i; k++) Progress.complete(k);
          }
          playRound(i);
        }
      }, [
        h('span', { class: 'round-num' }, String(i + 1)),
        h('span', { class: 'round-kw ko' }, done ? r.keyword : ''),
        h('span', { class: 'round-rom' }, r.parts.join('')),
        h('span', { class: 'round-sub' }, r.letters.length ? r.letters.length + ' new letters' : 'final consonants')
      ]);
    });

    return [
      h('h1', { class: 'lead' }, known ? ['You know ', h('b', null, String(known)), ' of 40 letters.'] : 'Start with round one — no Korean needed.'),
      h('div', { class: 'rounds' }, rounds),
      h('div', { class: 'actions' }, [
        action('Practice', 'Mixed review of everything you know', function () { practice(); }, level < 0),
        action('Mock quiz', '20 questions, scored', function () { quiz(); }, level < 0),
        action('Letter chart', 'Review any letter you’ve learned', function () { chart({}); })
      ])
    ];
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

  // Marks round i done without playing it and moves on to the next one.
  function skipRound(i) {
    Progress.complete(i);
    if (i + 1 < ROUNDS.length) playRound(i + 1);
    else home('alphabet');
  }

  function roundIntro(i, nav) {
    var r = ROUNDS[i];
    App.mount(screen('intro', [
      homeLink(),
      h('div', { class: 'round-tag' }, ['ROUND', h('span', { class: 'round-badge' }, String(i + 1))]),
      h('div', { class: 'intro-title' }, ['ROUND ' + NUMBERS[i] + ':', h('b', null, r.parts.join('').toUpperCase())]),
      navRow({ next: nav.next, skip: Progress.isComplete(i) ? null : function () { skipRound(i); } })
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
          h('strong', null, fb.title || (ok ? 'Correct!' : 'Not quite.')),
          fb.answerNode ? h('div', { class: 'fb-answer' }, fb.answerNode) : null,
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

  function results(title, res, again, againLabel) {
    if (res.correct === res.total) Sfx.complete();
    var misses = res.misses.map(function (it) {
      if (it.type === 'grammar') return GrammarEx.missLine(it);
      if (it.word) return h('li', { html: '<span class="ko">' + it.word.ko + '</span> · <b>' + it.word.rom + '</b> · ' + it.word.en });
      if (it.block) return h('li', { html: '<span class="ko">' + it.block + '</span> · <b>' + Hangul.romanizeBlock(it.block) + '</b>' });
      return h('li', { html: '<span class="ko ' + kindOf(it.j) + '">' + it.j + '</span> · <b>' + Letters.label(it.j) + '</b>' });
    });
    App.mount(screen('results', [
      homeLink(),
      h('div', { class: 'eyebrow' }, title),
      h('p', { class: 'score' }, [h('b', null, String(res.correct)), ' / ' + res.total]),
      misses.length ? h('div', null, [h('p', { class: 'muted' }, 'Worth another look:'), h('ul', { class: 'misses' }, misses)]) : h('p', { class: 'lead' }, 'Perfect!'),
      h('div', { class: 'nav' }, [h('button', { class: 'btn link', onclick: home }, 'Home'), continueBtn(againLabel || 'Go again', again)])
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

  // ---------- grammar ----------

  function lessonsDone() { return LESSONS.filter(function (l) { return Progress.grammarDone(l.id); }).map(function (l) { return l.id; }); }

  function grammarHome() {
    if (!Progress.alphabetDone()) {
      return [
        h('h1', { class: 'lead' }, 'Grammar starts once you can read.'),
        h('p', { class: 'muted' }, 'Finish all ' + ROUNDS.length + ' alphabet rounds first. If you already read Hangul, use “Unlock all rounds” below.'),
        h('div', { class: 'nav left' }, continueBtn('Go to the alphabet', function () { home('alphabet'); }))
      ];
    }
    var done = lessonsDone();
    var cards = LESSONS.map(function (l, i) {
      var isDone = Progress.grammarDone(l.id);
      var open = isDone || i === 0 || Progress.grammarDone(LESSONS[i - 1].id);
      return h('button', {
        class: 'round-card lesson-card ' + (isDone ? 'done' : open ? 'current' : 'locked'),
        title: open ? null : 'Mark the lessons before this as done to jump here',
        onclick: function () {
          if (!open) {
            if (!confirm('Mark lessons 1–' + i + ' as done and jump to lesson ' + (i + 1) + '?')) return;
            for (var k = 0; k < i; k++) Progress.completeGrammar(LESSONS[k].id);
          }
          playLesson(i);
        }
      }, [
        h('span', { class: 'round-num' }, String(i + 1)),
        h('span', { class: 'lesson-kw ko' }, l.title),
        h('span', { class: 'round-rom' }, l.name),
        h('span', { class: 'round-sub', html: Grammar.koWrap(l.gist) })
      ]);
    });
    return [
      h('h1', { class: 'lead' }, done.length
        ? ['You’ve finished ', h('b', null, String(done.length)), ' of ' + LESSONS.length + ' grammar lessons.']
        : 'Your first sentences: start with lesson one.'),
      h('div', { class: 'rounds lessons' }, cards),
      h('div', { class: 'actions' }, [
        action('Grammar practice', 'Mixed sentences from finished lessons', grammarPractice, !done.length),
        action('Cheat sheet', 'Every rule on one page', cheatSheet)
      ])
    ];
  }

  function playLesson(i) {
    var l = LESSONS[i], steps = [], result = null;
    steps.push(function (nav) { lessonIntro(i, nav); });
    l.cards.forEach(function (c) { steps.push(function (nav) { grammarCard(l, c, nav); }); });
    steps.push(function (nav) {
      exerciseScreen(GrammarEx.lessonSession(l), {
        label: 'LESSON ' + (i + 1), requeue: true,
        onFinish: function (res) { Progress.completeGrammar(l.id); result = res; nav.next(); }
      });
    });
    steps.push(function () { lessonComplete(i, result); });
    runFlow(steps);
  }

  function skipLesson(i) {
    Progress.completeGrammar(LESSONS[i].id);
    if (i + 1 < LESSONS.length) playLesson(i + 1);
    else home('grammar');
  }

  function lessonIntro(i, nav) {
    var l = LESSONS[i];
    App.mount(screen('intro', [
      homeLink(),
      h('div', { class: 'round-tag' }, ['LESSON', h('span', { class: 'round-badge' }, String(i + 1))]),
      h('div', { class: 'intro-title lesson-title' }, [l.name.toUpperCase() + ':', h('b', { class: 'ko' }, l.title)]),
      navRow({ next: nav.next, skip: Progress.grammarDone(l.id) ? null : function () { skipLesson(i); } })
    ], 'center'));
    bindNav({ next: nav.next });
  }

  function grammarCard(l, card, nav) {
    App.mount(screen('note grammar-note', [
      homeLink(),
      h('div', { class: 'eyebrow' }, [h('span', { class: 'ko' }, l.title), ' · ' + l.name.toUpperCase()]),
      h('h2', { html: Grammar.koWrap(card.title) }),
      GrammarEx.cardBody(card),
      navRow(nav)
    ], 'right'));
    bindNav(nav);
  }

  function lessonComplete(i, res) {
    var l = LESSONS[i], last = i + 1 >= LESSONS.length;
    var next = last ? function () { home('grammar'); } : function () { playLesson(i + 1); };
    Sfx.complete();
    App.mount(screen('complete', [
      homeLink(),
      h('div', { class: 'eyebrow' }, 'LESSON COMPLETE!'),
      h('p', { class: 'lead' }, ['You can now use ', h('b', { class: 'ko' }, l.title), ' (' + l.name.toLowerCase() + ').']),
      res ? h('p', { class: 'muted' }, res.correct + ' of ' + res.total + ' right on the first try.') : null,
      GrammarEx.ruleTable(l.rule),
      h('div', { class: 'nav' }, [
        h('button', { class: 'btn link', onclick: function () { home('grammar'); } }, 'Lessons'),
        continueBtn(last ? 'Practice' : 'Next lesson', last ? grammarPractice : next)
      ])
    ]));
    bindNav({ next: last ? grammarPractice : next });
  }

  function grammarPractice() {
    var ids = lessonsDone();
    if (!ids.length) return home('grammar');
    exerciseScreen(GrammarEx.practiceSession(ids, 12), {
      label: 'GRAMMAR', requeue: true,
      onFinish: function (res) { results('GRAMMAR PRACTICE', res, grammarPractice); }
    });
  }

  function cheatSheet() {
    App.mount(screen('cheat', [
      homeLink(),
      h('div', { class: 'eyebrow' }, 'GRAMMAR CHEAT SHEET'),
      h('p', { class: 'lead' }, 'Every pattern so far, with an example.'),
      LESSONS.map(function (l, i) {
        var ex = l.cards[0].examples && l.cards[0].examples[0];
        return h('section', { class: 'cheat-item' }, [
          h('h3', null, [h('span', { class: 'cheat-num' }, String(i + 1)), h('span', { class: 'ko' }, l.title), ' · ' + l.name]),
          GrammarEx.ruleTable(l.rule),
          ex ? h('div', { class: 'g-example' }, [h('div', { class: 'g-ko' }, GrammarEx.line(ex[0])), h('div', { class: 'g-en' }, ex[1])]) : null
        ]);
      }),
      h('div', { class: 'nav' }, continueBtn('Done', function () { home('grammar'); }))
    ]));
    bindNav({ next: function () { home('grammar'); } });
  }

  // ---------- words ----------

  function keysOf(set) { return Curriculum.setWords(set).map(function (w) { return w.key; }); }
  function setOpen(set) {
    var level = Progress.level();
    return Curriculum.setWords(set).every(function (w) { return w.round <= level; });
  }
  // Keys of every word in a learned set.
  function learnedWords() {
    var out = [];
    VOCAB_SETS.forEach(function (s) { if (Progress.vocabDone(s.id)) out = out.concat(keysOf(s)); });
    return out.filter(function (k, i) { return out.indexOf(k) === i; });
  }

  function wordsHome() {
    var learned = learnedWords(), due = Progress.due(learned);
    var cards = VOCAB_SETS.map(function (set, i) {
      var done = Progress.vocabDone(set.id), open = done || setOpen(set);
      var words = Curriculum.setWords(set), d = done ? Progress.due(keysOf(set)).length : 0;
      return h('button', {
        class: 'round-card lesson-card ' + (done ? 'done' : open ? 'current' : 'locked'), disabled: !open,
        onclick: function () { playSet(set); }
      }, [
        h('span', { class: 'round-num' }, String(i + 1)),
        h('span', { class: 'lesson-kw ko' }, open ? words[0].ko : ''),
        h('span', { class: 'round-rom' }, set.title),
        h('span', { class: 'round-sub' }, words.length + (set.numbers ? ' numbers' : ' words') +
          (done ? (d ? ' · ' + d + ' due' : ' · learned') : open ? '' : ' · finish the alphabet'))
      ]);
    });
    var reviewSub = !learned.length ? 'Learn a set first'
      : due.length ? due.length + ' word' + (due.length === 1 ? '' : 's') + ' due now'
        : 'Nothing due · practice your weakest words';
    return [
      h('h1', { class: 'lead' }, learned.length
        ? ['You’ve learned ', h('b', null, String(learned.length)), ' words.', due.length ? [' ', h('b', null, String(due.length)), ' are due for review.'] : '']
        : 'Learn words in small sets, then review them as they come due.'),
      h('div', { class: 'rounds lessons' }, cards),
      h('div', { class: 'actions' }, [
        action('Review words', reviewSub, reviewWords, !learned.length),
        action('Textbook words', 'Yonsei ch. 4–7 · ' + Exercises.vocabWords(Progress.level()).length + ' unlocked', function () { vocabList(); })
      ])
    ];
  }

  // Sets with teaching cards (numbers) start with those instead of the word list.
  // Skipped words still go on the review schedule, so they show up in review.
  function skipSet(set) {
    Progress.completeVocab(set.id, keysOf(set));
    var next = VOCAB_SETS[VOCAB_SETS.indexOf(set) + 1];
    if (next && setOpen(next) && !Progress.vocabDone(next.id)) playSet(next);
    else home('words');
  }

  function playSet(set) {
    var steps = [], result = null, words = Curriculum.setWords(set);
    function withSkip(nav, first) {
      if (!first || Progress.vocabDone(set.id)) return nav;
      return Object.assign({}, nav, { skip: function () { skipSet(set); } });
    }
    if (set.cards) set.cards.forEach(function (c, k) { steps.push(function (nav) { teachCard(set, c, withSkip(nav, k === 0)); }); });
    else steps.push(function (nav) { setIntro(set, withSkip(nav, true)); });
    words.forEach(function (w, k) { steps.push(function (nav) { wordCard(w, k, words.length, nav, set); }); });
    steps.push(function (nav) {
      exerciseScreen(Exercises.wordSetSession(set), {
        label: set.title.toUpperCase(), requeue: true,
        onFinish: function (res) { Progress.completeVocab(set.id, keysOf(set)); result = res; nav.next(); }
      });
    });
    steps.push(function () { results(set.title.toUpperCase() + ' · LEARNED', result, function () { playSet(set); }, 'Learn again'); });
    runFlow(steps);
  }

  function teachCard(set, card, nav) {
    App.mount(screen('note grammar-note', [
      homeLink(),
      h('div', { class: 'eyebrow' }, set.title.toUpperCase()),
      h('h2', { html: Grammar.koWrap(card.title) }),
      GrammarEx.cardBody(card),
      navRow(nav)
    ], 'right'));
    bindNav(nav);
  }

  function setIntro(set, nav) {
    var words = Curriculum.setWords(set);
    App.mount(screen('vocab-page', [
      homeLink(),
      h('div', { class: 'eyebrow' }, 'WORD SET'),
      h('p', { class: 'lead' }, [set.title, ': ', h('b', null, String(words.length)), ' words']),
      h('div', { class: 'vocab-list' }, words.map(function (w) {
        return h('div', { class: 'vocab-row' }, [
          h('span', { class: 'ko vocab-ko' }, w.ko),
          h('span', { class: 'vocab-rom' }, w.rom),
          h('span', { class: 'vocab-en' }, w.en)
        ]);
      })),
      h('p', { class: 'muted' }, 'You’ll see each word on its own card, then practice them both ways. After that they come back for review: in a day, then a few days, then weeks.'),
      navRow(nav, 'Start')
    ]));
    bindNav(nav);
  }

  function wordCard(w, k, n, nav, set) {
    var mr = Romanize.mr(w.say || w.ko), isNum = set && set.numbers;
    App.mount(screen('word-card', [
      homeLink(),
      h('div', { class: 'eyebrow dark' }, (isNum ? 'NUMBER ' : 'WORD ') + (k + 1) + ' OF ' + n),
      isNum ? h('div', { class: 'wc-num' }, w.en) : null,
      h('div', { class: 'wc-row' }, [h('div', { class: 'wc-ko ko' }, w.ko), speakButton(w.ko)]),
      h('div', { class: 'wc-rom' }, [w.rom, mr !== w.rom ? h('span', { class: 'muted' }, ' · ' + mr) : null]),
      isNum ? null : h('p', { class: 'wc-en' }, w.en),
      w.say ? h('p', { class: 'muted', html: 'Said like <span class="ko">' + w.say + '</span>, not the way it’s spelled.' }) : null,
      w.ch ? h('p', { class: 'muted' }, 'From Yonsei Korean, chapter ' + w.ch + '.') : null,
      navRow(nav, k + 1 < n ? 'Next' : 'Practice')
    ], 'left'));
    bindNav(nav);
  }

  function reviewWords() {
    var learned = learnedWords();
    if (!learned.length) return home('words');
    var list = Progress.due(learned);
    if (!list.length) {
      list = U.shuffle(learned).sort(function (a, b) { return Progress.box(a) - Progress.box(b); });
    }
    exerciseScreen(Exercises.reviewSession(list.slice(0, 12)), {
      label: 'REVIEW', requeue: true,
      onFinish: function (res) { results('WORD REVIEW', res, reviewWords); }
    });
  }

  return { home: home, WAVE: WAVE };
})();
