// Loads the browser data/logic scripts into a Node sandbox for checking.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const FILES = ['js/util.js', 'js/hangul.js', 'js/romanize.js', 'js/data/letters.js', 'js/data/rounds.js', 'js/data/words.js', 'js/data/grammar.js', 'js/data/numbers.js', 'js/data/vocab.js', 'js/curriculum.js', 'js/grammar.js', 'js/koinput.js'];

module.exports = function load() {
  const ctx = { console };
  ctx.window = ctx;
  vm.createContext(ctx);
  FILES.forEach(f => vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx, { filename: f }));
  return ctx;
};
