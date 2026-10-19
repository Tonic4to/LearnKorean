# Learn Korean

A small, fully offline web app for learning Korean: the alphabet one round at a time (modeled on letslearnhangul.com), then first grammar and vocabulary. No account, no server, no build step and no tracking: it's plain HTML, CSS and JavaScript.

## Getting started

```sh
git clone https://github.com/Tonic4to/LearnKorean.git
cd LearnKorean
```

Then open `index.html` in any modern browser. Double-clicking the file works; nothing needs installing.

If you'd rather serve it (for example, to use it from your phone on the same network):

```sh
python3 -m http.server 8000   # then visit http://localhost:8000
```

## What's inside

- **Rounds 1–11** introduce all 40 letters, each round built around a keyword (밥, 김치, 불고기 …), and finish with the final-consonant (받침) rules.
- **Practice** mixes everything you've learned so far and brings back what you get wrong more often.
- **Mock quiz** gives you 20 scored questions.
- **Textbook words** lists vocabulary from Yonsei Korean ch. 4–7 and drills it once you know the letters.
- **Grammar** (opens after the alphabet) has eight lessons on the patterns from Yonsei ch. 4–7: 은/는, 이에요/예요, 이/가, 도, 이/그/저, 이것/그것/저것, 있다/없다 and 아니에요. Each lesson explains the rule, then drills it four ways: pick the right particle, put a sentence together from pieces, translate from English, and write a sentence for a situation. Typed sentences are checked for grammar (wrong particle form, missing particle, verb not at the end…) with an explanation of what went wrong. Small spelling and spacing slips are pointed out but still count as correct, since the grammar is the focus. Hover over or tap any Korean word to see how it's read and what each part means. There's also a cheat sheet and mixed grammar practice.
- **Numbers 1–20** (in the Words tab) come in both systems: Sino-Korean (일, 이, 삼…) for dates, money and phone numbers, and native Korean (하나, 둘, 셋…) for counting things, age and hours. Each set starts by teaching how the numbers are built and where they change sound (십육 is said *simnyuk*), then drills them like words.
- **Words** teaches vocabulary in themed sets: a card for each word, then practice in both directions. Learned words come back for review on a spaced schedule (1 day, 2, 4, 7, 15, then 30 days); a miss starts the word over.
- **Unlock all rounds** (in the home page footer) lets you skip ahead if you already know the alphabet.
- **Mark as done**: every round, lesson and word set has an "Already done? Mark as done" link on its first screen, and tapping a locked card offers to mark everything before it as done. Skipped content counts as learned, so it shows up in practice and review. This is handy for catching up on a second device, since progress isn't synced.

Korean answers can be typed with a Korean keyboard, or without one: Latin keys are read as the standard 2-set Korean layout (`gkrtod` → 학생), and there's an on-screen keyboard.

Typed romanization answers can be in Revised Romanization (gimchi, bulgogi) or the older McCune–Reischauer system (kimch'i / kimchi, pulgogi). The ŏ/ŭ marks and apostrophes are optional.

A chime plays on correct answers. You can turn it off on the home page or with the speaker icon during exercises. Pronunciation buttons only show up if your system has a Korean text-to-speech voice installed.

## Your progress

Progress (finished rounds and lessons, how often you miss each item, and when each word is due for review) is saved in your browser's `localStorage` and stays on your device. It is never written to the project folder, so it can't end up in a commit. To start over, clear the site data for the page in your browser.

## Editing content

| File | What it holds |
| --- | --- |
| `js/data/rounds.js` | Lesson order, keywords, teaching notes |
| `js/data/words.js` | Word bank (tag textbook words with `{ ch: N }`) |
| `js/data/letters.js` | Letter descriptions and memory hints |
| `js/data/grammar.js` | Grammar lessons, exercises, particles and extra glossary words |
| `js/data/vocab.js` | Word sets for the Words tab |
| `js/data/numbers.js` | Number sets (1–20, both systems) with their teaching cards |

After editing, run the checks (Node.js, no dependencies):

```sh
node tools/validate.js   # checks that no Hangul appears before its letters are taught,
                         # and that every grammar sentence glosses and uses the right particle forms
node tools/test.js       # tests the Hangul building/splitting logic
```

`validate.js --verbose` prints extra detail.

## Project layout

```
index.html        entry point
css/style.css     styles
js/               app logic (hangul.js, romanize.js, grammar.js, exercises.js, screens.js, …)
js/data/          lesson content
fonts/            Gothic A1 font + license
tools/            validation and tests (Node)
```

## Contributing

Issues and pull requests are welcome, whether that's new words, better hints, or bug fixes. Please run both checks above before opening a PR.

## Credits

Hangul is shown in the bundled [Gothic A1](https://fonts.google.com/specimen/Gothic+A1) font by HanYang I&C, licensed under the SIL Open Font License 1.1 (see `fonts/OFL.txt`). Gothic A1 draws ㅎ and ㅊ with a flat dash on top instead of the vertical tick some fonts use.

## License

[MIT](LICENSE). The bundled fonts in `fonts/` keep their own license, the SIL Open Font License 1.1.
