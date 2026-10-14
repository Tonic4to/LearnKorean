# Learn Korean (Hangul)

A small, fully offline web app for learning the Korean alphabet one round at a time, modeled on letslearnhangul.com. No account, no server, no build step and no tracking: it's plain HTML, CSS and JavaScript.

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
- **Unlock all rounds** (in the home page footer) lets you skip ahead if you already know the alphabet.

Typed answers can be in Revised Romanization (gimchi, bulgogi) or the older McCune–Reischauer system (kimch'i / kimchi, pulgogi). The ŏ/ŭ marks and apostrophes are optional.

A chime plays on correct answers. You can turn it off on the home page or with the speaker icon during exercises. Pronunciation buttons only show up if your system has a Korean text-to-speech voice installed.

## Your progress

Progress (finished rounds and how often you miss each letter or word) is saved in your browser's `localStorage` and stays on your device. It is never written to the project folder, so it can't end up in a commit. To start over, clear the site data for the page in your browser.

## Editing content

| File | What it holds |
| --- | --- |
| `js/data/rounds.js` | Lesson order, keywords, teaching notes |
| `js/data/words.js` | Word bank (tag textbook words with `{ ch: N }`) |
| `js/data/letters.js` | Letter descriptions and memory hints |

After editing, run the checks (Node.js, no dependencies):

```sh
node tools/validate.js   # checks that no Hangul appears before its letters are taught
node tools/test.js       # tests the Hangul building/splitting logic
```

`validate.js --verbose` prints extra detail.

## Project layout

```
index.html        entry point
css/style.css     styles
js/               app logic (hangul.js, romanize.js, exercises.js, screens.js, …)
js/data/          lesson content
fonts/            Gothic A1 font + license
tools/            validation and tests (Node)
```

## Contributing

Issues and pull requests are welcome, whether that's new words, better hints, or bug fixes. Please run both checks above before opening a PR.

## Credits

Hangul is shown in the bundled [Gothic A1](https://fonts.google.com/specimen/Gothic+A1) font by HanYang I&C, licensed under the SIL Open Font License 1.1 (see `fonts/OFL.txt`). Gothic A1 draws ㅎ and ㅊ with a flat dash on top instead of the vertical tick some fonts use.
