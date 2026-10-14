// Tests for the Hangul helpers. Run: node tools/test.js
const assert = require('assert');
const { Hangul, Curriculum, ROUNDS } = require('./load')();
let passed = 0;
function test(name, fn) {
  try { fn(); passed++; } catch (e) { console.log('FAIL ' + name + '\n  ' + e.message); process.exitCode = 1; }
}

test('compose/decompose round-trips every syllable', () => {
  for (let c = 0xac00; c <= 0xd7a3; c++) {
    const ch = String.fromCharCode(c), d = Hangul.decompose(ch);
    assert.strictEqual(Hangul.compose(d.l, d.v, d.t), ch);
  }
});

test('compose basics', () => {
  assert.strictEqual(Hangul.compose('ㅂ', 'ㅏ', 'ㅂ'), '밥');
  assert.strictEqual(Hangul.compose('ㄱ', 'ㅘ'), '과');
  assert.strictEqual(Hangul.compose('ㄷ', 'ㅏ', 'ㄺ'), '닭');
});

test('letters() splits double finals and keeps compound vowels', () => {
  assert.deepStrictEqual(Array.from(Hangul.letters('닭')), ['ㄷ', 'ㅏ', 'ㄹ', 'ㄱ']);
  assert.deepStrictEqual(Array.from(Hangul.letters('사과')), ['ㅅ', 'ㅏ', 'ㄱ', 'ㅘ']);
  assert.deepStrictEqual(Array.from(Hangul.letters('ㅏ와 ㅣ')), ['ㅏ', 'ㅇ', 'ㅘ', 'ㅣ']);
});

test('romanizeBlock', () => {
  const cases = { '밥': 'bap', '김': 'gim', '불': 'bul', '꽃': 'kkot', '옷': 'ot', '앞': 'ap', '닭': 'dak', '의': 'ui', '외': 'oe', '강': 'gang', '라': 'ra' };
  for (const k in cases) assert.strictEqual(Hangul.romanizeBlock(k), cases[k], k);
});

test('assemble rebuilds every word from its tiles', () => {
  Curriculum.words.forEach(w => assert.strictEqual(Hangul.assemble(Hangul.inputSequence(w.ko)), w.ko, w.ko));
  ROUNDS.forEach(r => assert.strictEqual(Hangul.assemble(Hangul.inputSequence(r.keyword)), r.keyword));
});

test('assemble mid-typing states', () => {
  assert.strictEqual(Hangul.assemble(['ㅁ', 'ㅜ', 'ㄹ', 'ㄱ']), '묽');
  assert.strictEqual(Hangul.assemble(['ㅁ', 'ㅜ', 'ㄹ', 'ㄱ', 'ㅗ']), '물고');
  assert.strictEqual(Hangul.assemble(['ㄱ']), 'ㄱ');
  assert.strictEqual(Hangul.assemble(['ㅗ', 'ㅏ']), 'ㅘ');
  assert.strictEqual(Hangul.assemble(['ㅂ', 'ㅂ']), 'ㅂㅂ');
  assert.strictEqual(Hangul.assemble(['ㅂ', 'ㅏ', 'ㅂ', 'ㅏ']), '바바');
  assert.strictEqual(Hangul.assemble(['ㄱ', 'ㅏ', ' ', 'ㄴ', 'ㅏ']), '가 나');
});


const { Romanize } = require('./load')();
test('McCune–Reischauer spellings', () => {
  const cases = { '김치': "kimch'i", '불고기': 'pulgogi', '부산': 'pusan', '한국어': 'han’gugŏ'.replace('’', ''), '학교': 'hakkyo', '시계': 'shigye', '떡볶이': 'ttŏkpokki' };
  for (const k in cases) assert.strictEqual(Romanize.mr(k), cases[k], k);
});
test('answers accepted in either system', () => {
  const ok = [['김치', 'gimchi'], ['김치', 'kimchi'], ['김치', "kimch'i"], ['김밥', 'kimbap'], ['불고기', 'pulgogi'],
    ['서울', 'sŏul'], ['서울', 'soul'], ['떡볶이', 'ttokpokki'], ['안녕히 가세요', 'annyŏnghi kaseyo'], ['거', 'kŏ'], ['거', 'keo']];
  ok.forEach(([ko, input]) => assert.ok(Romanize.matches(input, ko), ko + ' / ' + input));
  const bad = [['거', 'go'], ['김치', 'gimji'], ['서울', 'seoal']];
  bad.forEach(([ko, input]) => assert.ok(!Romanize.matches(input, ko), ko + ' / ' + input));
  assert.strictEqual(Romanize.check('gimchi', '김치', 'gimchi'), 'rr');
  assert.strictEqual(Romanize.check('kimchee', '김치', 'gimchi'), null);
  assert.strictEqual(Romanize.check('pulgogi', '불고기', 'bulgogi'), 'mr');
});
test('explain names the final-consonant rules', () => {
  const plain = ko => Romanize.explain(ko).join(' ').replace(/<[^>]+>/g, '');
  assert.match(plain('값'), /only ㅂ is pronounced \(p\); ㅅ is silent/);
  assert.match(plain('닭'), /only ㄱ is pronounced \(k\); ㄹ is silent/);
  assert.match(plain('밥'), /ㅂ sounds like p, not b/);
  assert.match(plain('꽃'), /ㅊ sounds like t/);
  assert.match(plain('꽃이'), /ㅊ slides into/);
  assert.match(plain('합니다'), /ㅂ before ㄴ sounds like m/);
  assert.deepStrictEqual(Array.from(Romanize.explain('김치')), []);
});
test('finalSlip spots g/d/b typed for a final consonant', () => {
  assert.ok(Romanize.finalSlip('gab', '값', 'gap'));
  assert.ok(Romanize.finalSlip('kkod', '꽃', 'kkot'));
  assert.ok(!Romanize.finalSlip('kab', '값', 'gap'));
});
console.log(`${passed} test(s) passed.`);
