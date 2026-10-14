// Checks the lesson data. Run: node tools/validate.js [--verbose]
const { Hangul, Romanize, LETTERS, ROUNDS, Curriculum } = require('./load')();
const verbose = process.argv.includes('--verbose');
const errors = [], warnings = [];

// Every letter exists and is introduced exactly once.
const all = Hangul.INITIALS.concat(Hangul.VOWELS);
const defined = LETTERS.map(l => l.j);
all.forEach(j => { if (!defined.includes(j)) errors.push(`Letter ${j} has no entry in letters.js`); });
const introduced = ROUNDS.flatMap(r => r.letters);
all.forEach(j => {
  const n = introduced.filter(x => x === j).length;
  if (n !== 1) errors.push(`Letter ${j} is introduced ${n} times`);
});

// Nothing shows Hangul before its letters are introduced.
function checkText(where, text, round) {
  const late = Hangul.letters(text).filter(j => !(Curriculum.introducedAt[j] <= round));
  if (late.length) errors.push(`${where} uses letters not yet introduced: ${late.join(' ')}`);
}
LETTERS.forEach(l => checkText(`Hint for ${l.j}`, l.hint, Curriculum.introducedAt[l.j]));
ROUNDS.forEach((r, i) => {
  const label = `Round ${i + 1} (${r.keyword})`;
  checkText(`${label} keyword`, r.keyword, i);
  (r.notes || []).forEach(n => checkText(`${label} note "${n.title}"`, n.title + n.html, i));
  (r.focus || []).forEach(ko => {
    if (!Curriculum.word(ko)) errors.push(`${label} focus word ${ko} is not in words.js`);
    else checkText(`${label} focus word`, ko, i);
  });
  const kw = Curriculum.word(r.keyword);
  if (!kw) errors.push(`${label} keyword is not in words.js`);
  else if (r.parts.join('') !== kw.rom) errors.push(`${label} parts "${r.parts.join('')}" != word romanization "${kw.rom}"`);
  if (r.parts.length !== Array.from(r.keyword).length) errors.push(`${label} needs one romanization part per syllable`);
});

// Words are well formed and all reachable.
const seen = new Set();
Curriculum.words.forEach(w => {
  if (seen.has(w.ko)) errors.push(`Duplicate word ${w.ko}`);
  seen.add(w.ko);
  if (!/^[가-힣]+( [가-힣]+)*$/.test(w.ko)) errors.push(`Word "${w.ko}" has non-Hangul characters`);
  if (!/^[a-z]+( [a-z]+)*$/.test(w.rom)) errors.push(`Word ${w.ko} romanization "${w.rom}" should be lowercase a-z`);
  if (!isFinite(w.round)) errors.push(`Word ${w.ko} uses a letter that is never introduced`);
  const generated = Romanize.rr(w.ko);
  if (generated !== w.rom) errors.push(`Word ${w.ko} is spelled "${w.rom}" but the pronunciation rules give "${generated}"`);
  if (verbose) console.log(`  ${w.ko}: ${w.rom} | ${Romanize.mr(w.ko)}`);
});

// Enough practice material per round.
console.log('Round  Keyword   New letters        Words unlocked (total)');
ROUNDS.forEach((r, i) => {
  const now = Curriculum.wordsAt(i).length, total = Curriculum.wordsUpTo(i).length;
  console.log(`${String(i + 1).padEnd(7)}${r.keyword.padEnd(8)}  ${r.letters.join(' ').padEnd(19)}${String(now).padStart(3)} (${total})`);
  if (i > 0 && r.letters.length && now < 3) warnings.push(`Round ${i + 1} only unlocks ${now} new words`);
});
const tb = Curriculum.textbook();
console.log(`\nTextbook words: ${tb.length}`);

warnings.forEach(w => console.log('WARNING: ' + w));
errors.forEach(e => console.log('ERROR: ' + e));
console.log(errors.length ? `\n${errors.length} error(s).` : '\nAll checks passed.');
process.exit(errors.length ? 1 : 0);
