// The lesson order. Each round introduces a few letters around a keyword that
// uses only letters known by the end of that round. Notes are extra teaching
// cards shown after the letter cards.
var ROUNDS = [
  {
    keyword: '밥', parts: ['bap'], meaning: 'rice; a meal',
    letters: ['ㅂ', 'ㅏ'],
    notes: [
      { title: 'Syllable blocks', html: 'Korean letters are grouped into <b>blocks</b>, one block per syllable. <span class="ko">밥</span> is one block made of <span class="ko">ㅂ + ㅏ + ㅂ</span>.<br><br>The first consonant sits on the left, the vowel goes next to it, and an optional final consonant sits at the bottom.' },
      { title: 'Sounds at the bottom', html: 'A consonant at the bottom of a block is called a <b>batchim</b> (final consonant). Some consonants sound different there.<br><br>At the bottom of a block, <span class="ko">ㅂ</span> sounds like <b>p</b>: close your lips and stop, without letting the air pop out. So <span class="ko">밥</span> is read <b>bap</b>, never <i>bab</i>.' }
    ]
  },
  {
    keyword: '김치', parts: ['gim', 'chi'], meaning: 'kimchi',
    letters: ['ㄱ', 'ㅣ', 'ㅁ', 'ㅊ']
  },
  {
    keyword: '불고기', parts: ['bul', 'go', 'gi'], meaning: 'marinated grilled beef',
    letters: ['ㅜ', 'ㄹ', 'ㅗ'],
    notes: [
      { title: 'Where vowels go', html: 'Vowels built on a long <b>vertical</b> line (<span class="ko">ㅏ ㅣ</span>) sit to the <b>right</b> of the consonant: <span class="ko">바, 기</span>.<br><br>Vowels built on a long <b>horizontal</b> line (<span class="ko">ㅗ ㅜ</span>) sit <b>below</b> it: <span class="ko">보, 구</span>.' }
    ]
  },
  {
    keyword: '서울', parts: ['seo', 'ul'], meaning: 'Seoul',
    letters: ['ㅅ', 'ㅓ', 'ㅇ'],
    notes: [
      { title: 'ㅇ has two jobs', html: 'A block can’t start with a vowel, so a silent <span class="ko">ㅇ</span> fills the empty spot: <span class="ko">아</span> = <b>a</b>, <span class="ko">오</span> = <b>o</b>.<br><br>At the bottom of a block it sounds like <b>ng</b>: <span class="ko">방</span> = <b>bang</b>.' }
    ]
  },
  {
    keyword: '한글', parts: ['han', 'geul'], meaning: 'the Korean alphabet',
    letters: ['ㅎ', 'ㄴ', 'ㅡ']
  },
  {
    keyword: '제주도', parts: ['je', 'ju', 'do'], meaning: 'Jeju Island',
    letters: ['ㅈ', 'ㅔ', 'ㄷ']
  },
  {
    keyword: '커피', parts: ['keo', 'pi'], meaning: 'coffee',
    letters: ['ㅋ', 'ㅍ', 'ㅌ', 'ㅐ'],
    notes: [
      { title: 'Breathy consonants', html: '<span class="ko">ㅋ ㅌ ㅍ ㅊ</span> are the <b>aspirated</b> consonants. They look like <span class="ko">ㄱ ㄷ ㅂ ㅈ</span> with an extra stroke, and they come with an extra puff of air.<br><br>Hold your hand in front of your mouth: <span class="ko">카</span> should blow air, <span class="ko">가</span> should barely.' }
    ]
  },
  {
    keyword: '우유', parts: ['u', 'yu'], meaning: 'milk',
    letters: ['ㅑ', 'ㅕ', 'ㅛ', 'ㅠ', 'ㅒ', 'ㅖ'],
    notes: [
      { title: 'Adding a y', html: 'One extra short stroke adds a <b>y</b> sound:<br><br><span class="ko">ㅏ → ㅑ</span> ya · <span class="ko">ㅓ → ㅕ</span> yeo · <span class="ko">ㅗ → ㅛ</span> yo<br><span class="ko">ㅜ → ㅠ</span> yu · <span class="ko">ㅐ → ㅒ</span> yae · <span class="ko">ㅔ → ㅖ</span> ye' }
    ]
  },
  {
    keyword: '떡볶이', parts: ['tteok', 'bok', 'ki'], meaning: 'spicy rice cakes',
    letters: ['ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ'],
    notes: [
      { title: 'Tense consonants', html: 'Doubling <span class="ko">ㄱ ㄷ ㅂ ㅅ ㅈ</span> gives the <b>tense</b> consonants <span class="ko">ㄲ ㄸ ㅃ ㅆ ㅉ</span>. Say them with a tight throat and no puff of air.<br><br>Three ways to say a k-like sound:<br><span class="ko">가</span> ga (plain) · <span class="ko">카</span> ka (breathy) · <span class="ko">까</span> kka (tense)' },
      { title: 'Linking', html: 'When a block ends in a consonant and the next block starts with a silent <span class="ko">ㅇ</span>, the consonant slides over: <span class="ko">떡볶이</span> is read <b>tteok-bo-kki</b>.' }
    ]
  },
  {
    keyword: '사과', parts: ['sa', 'gwa'], meaning: 'apple',
    letters: ['ㅘ', 'ㅙ', 'ㅚ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅢ'],
    notes: [
      { title: 'Compound vowels', html: 'Two vowels glided together:<br><br><span class="ko">ㅗ+ㅏ = ㅘ</span> wa · <span class="ko">ㅗ+ㅐ = ㅙ</span> wae · <span class="ko">ㅗ+ㅣ = ㅚ</span> oe<br><span class="ko">ㅜ+ㅓ = ㅝ</span> wo · <span class="ko">ㅜ+ㅔ = ㅞ</span> we · <span class="ko">ㅜ+ㅣ = ㅟ</span> wi<br><span class="ko">ㅡ+ㅣ = ㅢ</span> ui<br><br><span class="ko">ㅙ, ㅚ</span> and <span class="ko">ㅞ</span> all sound almost the same: <b>we</b>.' }
    ]
  },
  {
    keyword: '꽃', parts: ['kkot'], meaning: 'flower',
    letters: [],
    allFinals: true,
    focus: ['꽃', '옷', '밖', '부엌', '낮', '앞', '숲', '닭', '값', '한국어', '음악', '꽃이', '옷이', '이것이', '없다', '직업', '반갑습니다'],
    notes: [
      { title: 'Only 7 sounds at the bottom', html: 'Any consonant can sit at the bottom of a block, but it will make one of only <b>7 sounds</b>:<table class="finals"><tr><td class="ko">ㄱ ㄲ ㅋ</td><td>k</td></tr><tr><td class="ko">ㄴ</td><td>n</td></tr><tr><td class="ko">ㄷ ㅅ ㅆ ㅈ ㅊ ㅌ ㅎ</td><td>t</td></tr><tr><td class="ko">ㄹ</td><td>l</td></tr><tr><td class="ko">ㅁ</td><td>m</td></tr><tr><td class="ko">ㅂ ㅍ</td><td>p</td></tr><tr><td class="ko">ㅇ</td><td>ng</td></tr></table>So <span class="ko">꽃</span> (flower) is <b>kkot</b> and <span class="ko">옷</span> (clothes) is <b>ot</b>.' },
      { title: 'Linking again', html: 'When the next block starts with a silent <span class="ko">ㅇ</span>, the final consonant moves over and keeps its <b>real</b> sound:<br><br><span class="ko">꽃</span> kkot → <span class="ko">꽃이</span> <b>kko-chi</b><br><span class="ko">한국어</span> → <b>han-gu-geo</b>' },
      { title: 'ㄴ and ㅁ change their neighbors', html: 'Before <span class="ko">ㄴ</span> or <span class="ko">ㅁ</span>, a final <b>p</b> sound turns into <b>m</b>, and a final <b>k</b> sound turns into <b>ng</b>:<br><br><span class="ko">반갑습니다</span> → bangap-<b>seum</b>-nida (nice to meet you)<br><span class="ko">합니다</span> → <b>ham</b>-nida<br><br>You’ll hear this in every polite <span class="ko">-습니다</span> ending.' },
      { title: 'Two consonants at the bottom', html: 'Some blocks have two final consonants (a double <b>batchim</b>). Only <b>one</b> is pronounced, and it follows the 7-sound rule. Usually it’s the <b>first</b> one:<table class="finals"><tr><td class="ko">ㄳ</td><td>k</td></tr><tr><td class="ko">ㄵ ㄶ</td><td>n</td></tr><tr><td class="ko">ㄼ ㄽ ㄾ ㅀ</td><td>l</td></tr><tr><td class="ko">ㅄ</td><td>p</td></tr></table>Three of them use the <b>second</b> one instead:<table class="finals"><tr><td class="ko">ㄺ</td><td>k</td></tr><tr><td class="ko">ㄻ</td><td>m</td></tr><tr><td class="ko">ㄿ</td><td>p</td></tr></table><span class="ko">값</span> gap (price) · <span class="ko">없다</span> eop-da (to not have) · <span class="ko">닭</span> dak (chicken)' },
      { title: 'Two consonants, then a vowel', html: 'If the next block starts with a silent <span class="ko">ㅇ</span>, both are heard: the first stays at the bottom and the second slides over.<br><br><span class="ko">값</span> gap → <span class="ko">값이</span> <b>gap-si</b><br><span class="ko">닭</span> dak → <span class="ko">닭이</span> <b>dal-gi</b>' }
    ]
  }
];
