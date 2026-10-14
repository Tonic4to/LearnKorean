// All 40 letters (jamo). Romanization comes from Hangul's tables; this file
// holds what the letter cards say. Hints may only use Hangul the learner has
// already met by the time the letter is introduced (tools/validate.js checks).
var LETTERS = [
  // Basic consonants
  { j: 'ㄱ', group: 'basic', sound: 'g', as: 'go', name: 'giyeok', hint: 'Looks like a <b>g</b>un pointing down.' },
  { j: 'ㄴ', group: 'basic', sound: 'n', as: 'no', name: 'nieun', hint: 'Looks like a <b>n</b>ose seen from the side.' },
  { j: 'ㄷ', group: 'basic', sound: 'd', as: 'do', name: 'digeut', hint: 'Looks like an open <b>d</b>oor frame.' },
  { j: 'ㄹ', group: 'basic', sound: 'r / l', label: 'r / l', name: 'rieul', hint: 'A winding <b>r</b>oad. At the start of a block it is a light tap of the tongue, between an r and an l. At the bottom of a block it is an <b>l</b>.' },
  { j: 'ㅁ', group: 'basic', sound: 'm', as: 'mom', name: 'mieum', hint: 'A square <b>m</b>outh.' },
  { j: 'ㅂ', group: 'basic', sound: 'b', as: 'boy', name: 'bieup', hint: 'Looks like a <b>b</b>ucket.' },
  { j: 'ㅅ', group: 'basic', sound: 's', as: 'sun', name: 'siot', hint: 'Looks like a <b>s</b>eagull’s wings, or a mountain <b>s</b>ummit.' },
  { j: 'ㅇ', group: 'basic', sound: 'ng', as: 'song', label: 'ng', name: 'ieung', hint: 'A circle with two jobs. At the <b>start</b> of a block it is silent, just holding the place before a vowel. At the <b>bottom</b> of a block it sounds like <b>ng</b>.' },
  { j: 'ㅈ', group: 'basic', sound: 'j', as: 'jam', name: 'jieut', hint: 'Looks like ㅊ without the little hat on top.' },
  { j: 'ㅎ', group: 'basic', sound: 'h', as: 'hat', name: 'hieut', hint: 'A person wearing a <b>h</b>at.' },
  // Aspirated (breathy) consonants
  { j: 'ㅋ', group: 'aspirated', sound: 'k', as: 'kite', name: 'kieuk', hint: 'ㄱ plus an extra line. The extra line means an extra puff of air.' },
  { j: 'ㅌ', group: 'aspirated', sound: 't', as: 'top', name: 'tieut', hint: 'ㄷ plus an extra line: a breathy <b>t</b>.' },
  { j: 'ㅍ', group: 'aspirated', sound: 'p', as: 'pie', name: 'pieup', hint: 'Two <b>p</b>illars with a roof and a floor. A breathy p.' },
  { j: 'ㅊ', group: 'aspirated', sound: 'ch', as: 'church', name: 'chieut', hint: 'A person with a little hat on. Say <b>ch</b> with a puff of air.' },
  // Tense (double) consonants
  { j: 'ㄲ', group: 'tense', sound: 'kk', as: 'skip', name: 'ssang-giyeok', hint: 'Two ㄱ: a tight, sharp k with no puff of air.' },
  { j: 'ㄸ', group: 'tense', sound: 'tt', as: 'stop', name: 'ssang-digeut', hint: 'Two ㄷ: a tight t with no puff of air.' },
  { j: 'ㅃ', group: 'tense', sound: 'pp', as: 'spin', name: 'ssang-bieup', hint: 'Two ㅂ: a tight p with no puff of air.' },
  { j: 'ㅆ', group: 'tense', sound: 'ss', as: 'sea', name: 'ssang-siot', hint: 'Two ㅅ: a stronger, hissing s.' },
  { j: 'ㅉ', group: 'tense', sound: 'jj', as: 'pizza', name: 'ssang-jieut', hint: 'Two ㅈ: a tight j, close to the “zz” in pizza.' },
  // Basic vowels
  { j: 'ㅏ', group: 'basic', sound: 'ah', as: 'father', hint: 'A standing line with a short stroke pointing out to the right.' },
  { j: 'ㅓ', group: 'basic', sound: 'uh', as: 'up', hint: 'The mirror image of ㅏ: the stroke points left.' },
  { j: 'ㅗ', group: 'basic', sound: 'oh', as: 'go', hint: 'The notch is <b>o</b>ver the line.' },
  { j: 'ㅜ', group: 'basic', sound: 'oo', as: 'moon', hint: 'The notch is <b>u</b>nder the line.' },
  { j: 'ㅡ', group: 'basic', sound: 'eu', hint: 'A flat line, so say it with flat lips: like “oo”, but smiling instead of rounding your lips.' },
  { j: 'ㅣ', group: 'basic', sound: 'ee', as: 'see', hint: 'A single standing stick, like the letter <b>i</b>.' },
  { j: 'ㅔ', group: 'basic', sound: 'e', as: 'bed', hint: 'ㅓ plus an extra line.' },
  { j: 'ㅐ', group: 'basic', sound: 'e', as: 'bed', hint: 'ㅏ plus an extra line. It sounds almost the same as ㅔ, and most Koreans don’t distinguish them either.' },
  // Y-vowels
  { j: 'ㅑ', group: 'y', sound: 'yah', as: 'yacht', hint: 'ㅏ with a second stroke. The extra stroke adds a <b>y</b>.' },
  { j: 'ㅕ', group: 'y', sound: 'yuh', as: 'young', hint: 'ㅓ with a second stroke: y + eo.' },
  { j: 'ㅛ', group: 'y', sound: 'yoh', as: 'yoga', hint: 'ㅗ with two notches: y + o.' },
  { j: 'ㅠ', group: 'y', sound: 'you', as: 'you', hint: 'ㅜ with two legs: y + u.' },
  { j: 'ㅒ', group: 'y', sound: 'yeh', as: 'yes', hint: 'ㅐ with a second stroke: y + ae. It is rare.' },
  { j: 'ㅖ', group: 'y', sound: 'yeh', as: 'yes', hint: 'ㅔ with a second stroke: y + e, as in 시계 (clock).' },
  // Compound vowels
  { j: 'ㅘ', group: 'compound', sound: 'wah', as: 'wand', hint: 'ㅗ + ㅏ said quickly: o-a → <b>wa</b>, as in 사과 (apple).' },
  { j: 'ㅙ', group: 'compound', sound: 'weh', as: 'wet', hint: 'ㅗ + ㅐ → <b>wae</b>, as in 왜 (why).' },
  { j: 'ㅚ', group: 'compound', sound: 'weh', as: 'wet', hint: 'ㅗ + ㅣ, but it sounds like <b>we</b>, as in 회사원 (office worker).' },
  { j: 'ㅝ', group: 'compound', sound: 'wuh', as: 'won', hint: 'ㅜ + ㅓ → <b>wo</b>, as in 뭐 (what).' },
  { j: 'ㅞ', group: 'compound', sound: 'weh', as: 'wet', hint: 'ㅜ + ㅔ → <b>we</b>. Rare; sounds the same as ㅙ and ㅚ.' },
  { j: 'ㅟ', group: 'compound', sound: 'wee', as: 'week', hint: 'ㅜ + ㅣ → <b>wi</b>, as in 귀 (ear).' },
  { j: 'ㅢ', group: 'compound', sound: 'eu-ee', hint: 'ㅡ + ㅣ glided together, as in 의사 (doctor).' }
];

var CHART_ROWS = [
  { label: 'Consonants', letters: 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅎ' },
  { label: 'Aspirated', letters: 'ㅋㅌㅍㅊ' },
  { label: 'Tense', letters: 'ㄲㄸㅃㅆㅉ' },
  { label: 'Vowels', letters: 'ㅏㅓㅗㅜㅡㅣㅔㅐ' },
  { label: 'Y-vowels', letters: 'ㅑㅕㅛㅠㅒㅖ' },
  { label: 'Compound vowels', letters: 'ㅘㅙㅚㅝㅞㅟㅢ' }
];

var Letters = (function () {
  var byJamo = {};
  LETTERS.forEach(function (x) { byJamo[x.j] = x; });

  var GROUP_NAMES = {
    c: { basic: 'consonant', aspirated: 'aspirated consonant', tense: 'tense consonant' },
    v: { basic: 'vowel', y: 'y-vowel', compound: 'compound vowel' }
  };

  function kind(j) { return Hangul.isVowel(j) ? 'v' : 'c'; }
  function rom(j) { return kind(j) === 'v' ? Hangul.VOWEL_ROM[j] : Hangul.INITIAL_ROM[j]; }

  return {
    list: LETTERS,
    get: function (j) { return byJamo[j]; },
    kind: kind,
    rom: rom,
    // What we show on badges and multiple-choice buttons.
    label: function (j) { return byJamo[j].label || rom(j); },
    finalRom: function (j) { return Hangul.FINAL_ROM[j] || null; },
    groupName: function (j) { return GROUP_NAMES[kind(j)][byJamo[j].group]; },
    forms: function (j) { return (typeof GLYPH_FORMS !== 'undefined' && GLYPH_FORMS[j]) || null; },
    // A syllable a speech engine can pronounce for this letter.
    sayText: function (j) {
      if (kind(j) === 'v') return Hangul.compose('ㅇ', j);
      return j === 'ㅇ' ? '앙' : Hangul.compose(j, 'ㅏ');
    }
  };
})();

// Letters whose shape changes noticeably between fonts and handwriting.
// Drawn as SVG (100×100) so every form shows up whatever fonts are installed.
var GLYPH_FORMS = (function () {
  var JIEUT_PRINT = '<path d="M22 24H78M50 24L20 84M40 44L82 84"/>';
  var JIEUT_HAND = '<path d="M24 24H74L26 84M50 54L82 84"/>';
  function down(svg, dy) { return '<g transform="translate(0 ' + dy + ')">' + svg + '</g>'; }
  function pair(svg) {
    return '<g stroke-width="14" transform="translate(2 8) scale(.5 .84)">' + svg + '</g><g stroke-width="14" transform="translate(50 8) scale(.5 .84)">' + svg + '</g>';
  }
  var TICK = '<path d="M50 4V18"/>', DASH = '<path d="M38 11H62"/>';
  return {
    'ㅈ': [
      { label: 'Most fonts', svg: JIEUT_PRINT },
      { label: 'Some fonts & handwriting', svg: JIEUT_HAND }
    ],
    'ㅊ': [
      { label: 'Tick on top', svg: TICK + down(JIEUT_PRINT, 6) },
      { label: 'Dash on top', svg: DASH + down(JIEUT_PRINT, 6) },
      { label: 'Handwriting', svg: DASH + down(JIEUT_HAND, 6) }
    ],
    'ㅎ': [
      { label: 'Tick on top', svg: TICK + '<path d="M22 28H78"/><circle cx="50" cy="62" r="20"/>' },
      { label: 'Dash on top', svg: DASH + '<path d="M22 28H78"/><circle cx="50" cy="62" r="20"/>' }
    ],
    'ㅉ': [
      { label: 'Most fonts', svg: pair(JIEUT_PRINT) },
      { label: 'Some fonts & handwriting', svg: pair(JIEUT_HAND) }
    ]
  };
})();
