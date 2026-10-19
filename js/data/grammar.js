// Grammar lessons (Yonsei Korean ch. 4–7). Hangul in any text is wrapped in
// the Korean font automatically, so plain strings are fine here.
//
// Exercise formats:
//   { pick: '저_ 학생이에요.', en: '…', opts: ['은', '는'], ans: '는' }   _ marks the blank
//   { arrange: '저는 학생이에요.', en: '…' }      tap tiles into order; the lesson's
//                                                  focus particles become separate tiles
//   { translate: 'I am a teacher.', ko: [accepted answers] }
//   { write: 'situation to respond to', ko: [accepted answers] }
// Every Korean word must be in words.js or GRAMMAR_WORDS (run tools/validate.js).

// Words that only the grammar lessons need: names, function words, polite verb forms.
var GRAMMAR_WORDS = [
  ['마이클', 'Michael (a name)'],
  ['유리', 'Yuri (a name)'],
  ['제', 'my (polite)'],
  ['있어요', 'there is; (I) have'],
  ['없어요', 'there isn’t; (I) don’t have'],
  ['아니에요', 'is not; am not']
];

// 이 / 그 / 저 standing alone before a noun.
var DETERMINERS = {
  '이': 'this … (near me)',
  '그': 'that … (near you, or just mentioned)',
  '저': 'that … over there'
};

// What can attach to the end of a noun. after: 'c' = only after a consonant,
// 'v' = only after a vowel. bad = a common misspelling, never correct.
var ENDINGS = {
  '은': { fam: 'topic', after: 'c', en: 'topic particle (as for …)' },
  '는': { fam: 'topic', after: 'v', en: 'topic particle (as for …)' },
  '이': { fam: 'subject', after: 'c', en: 'subject particle' },
  '가': { fam: 'subject', after: 'v', en: 'subject particle' },
  '이에요': { fam: 'copula', after: 'c', en: 'is / am / are' },
  '예요': { fam: 'copula', after: 'v', en: 'is / am / are' },
  '에요': { fam: 'copula', bad: true, en: 'is / am / are (misspelled)' },
  '도': { fam: 'also', en: 'also, too' },
  '에': { fam: 'place', en: 'in, at' }
};
var ENDING_FAMILIES = {
  topic: { label: 'topic particle', forms: ['은', '는'] },
  subject: { label: 'subject particle', forms: ['이', '가'] },
  copula: { label: '“is / am”', forms: ['이에요', '예요'] },
  also: { label: '“also / too”', forms: ['도'] },
  place: { label: '“in / at”', forms: ['에'] }
};

// Whole-word mistakes worth a specific explanation.
var GRAMMAR_MISTAKES = {
  '아니예요': { fix: '아니에요', note: 'It’s always <b>아니에요</b>, never 아니예요, even though 아니 ends in a vowel.' }
};

// Spoken short forms, accepted wherever the long form is.
var CONTRACTIONS = {
  '이건': '이것은', '그건': '그것은', '저건': '저것은',
  '이게': '이것이', '그게': '그것이', '저게': '저것이'
};

var LESSONS = [
  {
    id: 'topic', title: '은 / 는', name: 'Topic particle', gist: 'As for X…',
    focus: ['은', '는'],
    rule: [['Ends in a consonant', '은', '이름은'], ['Ends in a vowel', '는', '저는']],
    cards: [
      {
        title: 'What the sentence is about',
        html: '은/는 marks the <b>topic</b>: what you’re talking about. Think of it as “<b>as for</b> X…”.<br><br>저는 학생이에요 is literally “as for me, (am) a student”: <b>I’m a student</b>.<br><br>It attaches straight to the end of the noun, with no space.',
        examples: [['저는 학생이에요.', 'I am a student.'], ['제 이름은 마이클이에요.', 'My name is Michael.']],
        foot: '이에요 / 예요 means “am / is”. That’s the next lesson; hover any word to see what it means.'
      },
      {
        title: '은 or 는?',
        html: 'Look at the <b>last block</b> of the noun.',
        rule: [['Ends in a consonant', '은', '이름은 · 선생님은'], ['Ends in a vowel', '는', '저는 · 의사는']],
        foot: 'The consonant form starts with a silent ㅇ, so the final consonant slides into it: 이름은 is read <b>i-reu-meun</b>.'
      },
      {
        title: 'Introducing people',
        html: 'Use it to introduce yourself or someone else, or to switch to a new topic.',
        examples: [['마이클은 미국 사람이에요.', 'Michael is American.'], ['유리는 한국 사람이에요.', 'Yuri is Korean.']]
      }
    ],
    exercises: [
      { pick: '저_ 학생이에요.', en: 'I am a student.', opts: ['은', '는'], ans: '는' },
      { pick: '제 이름_ 마이클이에요.', en: 'My name is Michael.', opts: ['은', '는'], ans: '은' },
      { pick: '선생님_ 한국 사람이에요.', en: 'The teacher is Korean.', opts: ['은', '는'], ans: '은' },
      { pick: '유리_ 의사예요.', en: 'Yuri is a doctor.', opts: ['은', '는'], ans: '는' },
      { pick: '마이클_ 미국 사람이에요.', en: 'Michael is American.', opts: ['은', '는'], ans: '은' },
      { pick: '친구_ 일본 사람이에요.', en: 'My friend is Japanese.', opts: ['은', '는'], ans: '는' },
      { pick: '제 친구_ 회사원이에요.', en: 'My friend is an office worker.', opts: ['은', '는'], ans: '는' },
      { pick: '집_ 서울이에요.', en: 'My home is in Seoul.', opts: ['은', '는'], ans: '은' },
      { arrange: '저는 학생이에요.', en: 'I am a student.' },
      { arrange: '제 이름은 유리예요.', en: 'My name is Yuri.' },
      { arrange: '선생님은 한국 사람이에요.', en: 'The teacher is Korean.' }
    ]
  },
  {
    id: 'copula', title: '이에요 / 예요', name: 'To be', gist: 'am / is / are',
    focus: ['이에요', '예요'],
    rule: [['Ends in a consonant', '이에요', '학생이에요'], ['Ends in a vowel', '예요', '유리예요']],
    cards: [
      {
        title: 'Saying what something is',
        html: 'To say “X is Y”, put 이에요/예요 right after the noun Y. It comes at the very <b>end</b> of the sentence and attaches with no space.<br><br>Korean often leaves out the subject when it’s obvious, so 학생이에요 alone means “(I’m / he’s / she’s) a student”.',
        examples: [['학생이에요.', '(I am) a student.'], ['유리예요.', '(I am) Yuri.'], ['저는 의사예요.', 'I am a doctor.']]
      },
      {
        title: '이에요 or 예요?',
        html: 'The same check as 은/는: look at the last block.',
        rule: [['Ends in a consonant', '이에요', '학생이에요 · 선생님이에요'], ['Ends in a vowel', '예요', '의사예요 · 유리예요']],
        foot: '예요 is pronounced like 에요 (<b>e-yo</b>), but it’s spelled with 예.'
      },
      {
        title: 'Asking a question',
        html: 'The same ending makes a question; just raise your voice at the end and write a question mark.',
        examples: [['학생이에요?', 'Are you a student?'], ['네, 학생이에요.', 'Yes, I’m a student.']]
      }
    ],
    exercises: [
      { pick: '학생_.', en: 'I’m a student.', opts: ['이에요', '예요'], ans: '이에요' },
      { pick: '저는 의사_.', en: 'I am a doctor.', opts: ['이에요', '예요'], ans: '예요' },
      { pick: '제 이름은 유리_.', en: 'My name is Yuri.', opts: ['이에요', '예요'], ans: '예요' },
      { pick: '마이클은 선생님_.', en: 'Michael is a teacher.', opts: ['이에요', '예요'], ans: '이에요' },
      { pick: '저는 회사원_.', en: 'I am an office worker.', opts: ['이에요', '예요'], ans: '이에요' },
      { pick: '유리는 한국 사람_.', en: 'Yuri is Korean.', opts: ['이에요', '예요'], ans: '이에요' },
      { pick: '저는 경찰_.', en: 'I am a police officer.', opts: ['이에요', '예요'], ans: '이에요' },
      { pick: '친구는 가수_.', en: 'My friend is a singer.', opts: ['이에요', '예요'], ans: '예요' },
      { pick: '선생님은 호주 사람_?', en: 'Is the teacher Australian?', opts: ['이에요', '예요'], ans: '이에요' },
      { arrange: '저는 회사원이에요.', en: 'I am an office worker.' },
      { arrange: '유리는 가수예요.', en: 'Yuri is a singer.' },
      { translate: 'I am a student.', ko: ['저는 학생이에요.', '학생이에요.'] },
      { translate: 'Yuri is a doctor.', ko: ['유리는 의사예요.', '유리 씨는 의사예요.'] },
      { translate: 'Michael is American.', ko: ['마이클은 미국 사람이에요.', '마이클 씨는 미국 사람이에요.'] },
      { write: 'Someone asks who you are. Say that you are Yuri.', ko: ['저는 유리예요.', '유리예요.', '제 이름은 유리예요.'] },
      { write: 'Tell someone that you are an office worker.', ko: ['저는 회사원이에요.', '회사원이에요.'] }
    ]
  },
  {
    id: 'subject', title: '이 / 가', name: 'Subject particle', gist: 'the one that is / has',
    focus: ['이', '가'],
    rule: [['Ends in a consonant', '이', '가방이'], ['Ends in a vowel', '가', '사과가']],
    cards: [
      {
        title: 'Marking the subject',
        html: '이/가 marks the <b>subject</b>: the thing that exists, is had, or does something.<br><br>You’ll use it most with 있어요 (<b>there is / I have</b>) and 없어요 (<b>there isn’t / I don’t have</b>). Those are lesson 7; for now just notice the particle.',
        examples: [['가방이 있어요.', 'There is a bag. / I have a bag.'], ['사과가 있어요.', 'There is an apple.']]
      },
      {
        title: '이 or 가?',
        html: 'Look at the last block again.',
        rule: [['Ends in a consonant', '이', '가방이 · 책이'], ['Ends in a vowel', '가', '사과가 · 의자가']],
        foot: 'A pattern to remember: every consonant form starts with a silent ㅇ (은, 이, 이에요), so the final consonant has somewhere to slide. 책이 is read <b>chae-gi</b>.'
      },
      {
        title: '은/는 or 이/가?',
        html: 'Both can mark the noun before the verb, and the difference takes time to feel. A good start:<br><br>• <b>은/는</b>: the topic, who or what you’re describing (저는 학생이에요).<br>• <b>이/가</b>: the thing that exists or is had (가방이 있어요).<br><br>They often work together: 저는 가방이 있어요 = “as for me, a bag exists”: <b>I have a bag</b>.',
        examples: [['저는 가방이 있어요.', 'I have a bag.'], ['저는 시간이 없어요.', 'I don’t have time.']]
      }
    ],
    exercises: [
      { pick: '가방_ 있어요.', en: 'There is a bag.', opts: ['이', '가'], ans: '이' },
      { pick: '사과_ 있어요.', en: 'There is an apple.', opts: ['이', '가'], ans: '가' },
      { pick: '책_ 있어요.', en: 'There is a book.', opts: ['이', '가'], ans: '이' },
      { pick: '의자_ 있어요.', en: 'There is a chair.', opts: ['이', '가'], ans: '가' },
      { pick: '시계_ 없어요.', en: 'There is no clock.', opts: ['이', '가'], ans: '가' },
      { pick: '시간_ 없어요.', en: 'I don’t have time.', opts: ['이', '가'], ans: '이' },
      { pick: '저는 친구_ 있어요.', en: 'I have a friend.', opts: ['이', '가'], ans: '가' },
      { pick: '교실에 책상_ 있어요.', en: 'There is a desk in the classroom.', opts: ['이', '가'], ans: '이' },
      { pick: '우유_ 없어요.', en: 'There is no milk.', opts: ['이', '가'], ans: '가' },
      { pick: '고양이_ 있어요.', en: 'There is a cat.', opts: ['이', '가'], ans: '가' },
      { pick: '연필_ 없어요.', en: 'There is no pencil.', opts: ['이', '가'], ans: '이' },
      { arrange: '저는 가방이 있어요.', en: 'I have a bag.' },
      { arrange: '의자가 없어요.', en: 'There is no chair.' },
      { translate: 'There is an apple.', ko: ['사과가 있어요.'] },
      { translate: 'I have a cat.', ko: ['저는 고양이가 있어요.', '고양이가 있어요.'] },
      { translate: 'There is a desk.', ko: ['책상이 있어요.'] },
      { write: 'Tell a friend that you have a cell phone.', ko: ['저는 휴대폰이 있어요.', '휴대폰이 있어요.', '저는 핸드폰이 있어요.', '핸드폰이 있어요.'] }
    ]
  },
  {
    id: 'also', title: '도', name: 'Also / too', gist: 'replaces 은/는/이/가',
    focus: ['도'],
    rule: [['Any noun', '도', '저도 · 책도']],
    cards: [
      {
        title: 'Also, too',
        html: '도 means “<b>also</b>” or “<b>too</b>”. It <b>replaces</b> 은/는 or 이/가; it never goes on top of them.<br><br>저는 학생이에요 (I’m a student) → 저도 학생이에요 (<b>I’m</b> a student <b>too</b>).',
        examples: [['저도 학생이에요.', 'I’m a student too.'], ['일본 사람도 있어요.', 'There are Japanese people too.']]
      },
      {
        title: 'One form for every noun',
        html: 'Unlike the other particles, 도 never changes. It’s the same after a consonant or a vowel.',
        rule: [['Ends in a consonant', '도', '책도 · 선생님도'], ['Ends in a vowel', '도', '의자도 · 저도']],
        foot: '✗ 저는도 · ✗ 가방이도 → ✓ 저도 · ✓ 가방도'
      },
      {
        title: 'In a conversation',
        html: 'Someone says something about themselves; you say “me too”.',
        examples: [['저는 한국 사람이에요.', 'I’m Korean.'], ['저도 한국 사람이에요.', 'I’m Korean too.']]
      }
    ],
    exercises: [
      { pick: '유리는 학생이에요. 저_ 학생이에요.', en: 'Yuri is a student. I am a student too.', opts: ['도', '는'], ans: '도' },
      { pick: '가방이 있어요. 책_ 있어요.', en: 'There’s a bag. There’s a book too.', opts: ['도', '이'], ans: '도' },
      { pick: '저는 미국 사람이에요. 마이클_ 미국 사람이에요.', en: 'I’m American. Michael is American too.', opts: ['도', '은'], ans: '도' },
      { pick: '사과가 있어요. 우유_ 있어요.', en: 'There’s an apple. There’s milk too.', opts: ['도', '가'], ans: '도' },
      { pick: '저는 시간이 없어요. 친구_ 시간이 없어요.', en: 'I don’t have time. My friend doesn’t either.', opts: ['도', '는'], ans: '도' },
      { pick: '저는 학생이에요. 친구_ 회사원이에요.', en: 'I’m a student. My friend is an office worker.', opts: ['도', '는'], ans: '는' },
      { pick: '선생님_ 한국 사람이에요.', en: 'The teacher is Korean too.', opts: ['도', '은'], ans: '도' },
      { pick: '책상이 있어요. 의자_ 있어요.', en: 'There’s a desk. There’s a chair too.', opts: ['도', '가'], ans: '도' },
      { arrange: '저도 학생이에요.', en: 'I am a student too.' },
      { arrange: '연필도 있어요.', en: 'There is a pencil too.' },
      { translate: 'I am a doctor too.', ko: ['저도 의사예요.'] },
      { translate: 'There is a pencil too.', ko: ['연필도 있어요.'] },
      { translate: 'Michael is a teacher too.', ko: ['마이클도 선생님이에요.', '마이클 씨도 선생님이에요.'] },
      { write: 'Your friend says: 저는 한국 사람이에요. Say that you are Korean too.', ko: ['저도 한국 사람이에요.'] }
    ]
  },
  {
    id: 'demonstrative', title: '이 / 그 / 저', name: 'This / that', gist: 'before a noun',
    focus: [], focusWords: true,
    rule: [['Near me', '이', '이 사람'], ['Near you', '그', '그 책'], ['Far from both', '저', '저 가방']],
    cards: [
      {
        title: 'This, that, that over there',
        html: '이, 그 and 저 go right <b>before</b> a noun, as a separate word.',
        rule: [['Near me', '이', '이 사람 · this person'], ['Near you, or just mentioned', '그', '그 책 · that book'], ['Far from both of us', '저', '저 가방 · that bag over there']],
        examples: [['이 사람은 제 친구예요.', 'This person is my friend.'], ['저 가방은 제 가방이에요.', 'That bag over there is my bag.']]
      },
      {
        title: 'Same sound, different job',
        html: '이 is also the subject particle, and 저 also means “I”. Tell them apart by where they are:<br><br>• Glued to the end of a noun, 이 is the particle: 책이.<br>• On its own before a noun, 이 means “this”: 이 책.<br>• 저 before a noun is “that … over there”: 저 사람. 저 with a particle is “I”: 저는.',
        examples: [['저는 이 학교 학생이에요.', 'I am a student at this school.'], ['그 책은 한국어 책이에요.', 'That book is a Korean book.']]
      }
    ],
    exercises: [
      { pick: '_ 사람은 선생님이에요.', en: 'This person is a teacher.', opts: ['이', '그', '저'], ans: '이' },
      { pick: '_ 가방은 제 가방이에요.', en: 'That bag over there is my bag.', opts: ['이', '그', '저'], ans: '저' },
      { pick: '_ 책은 마이클 책이에요.', en: 'That book (near you) is Michael’s book.', opts: ['이', '그', '저'], ans: '그' },
      { pick: '_ 의자는 유리 의자예요.', en: 'This chair is Yuri’s chair.', opts: ['이', '그', '저'], ans: '이' },
      { pick: '_ 사람은 일본 사람이에요.', en: 'That person over there is Japanese.', opts: ['이', '그', '저'], ans: '저' },
      { pick: '_ 학생은 제 친구예요.', en: 'That student (near you) is my friend.', opts: ['이', '그', '저'], ans: '그' },
      { pick: '_ 교실에 책상이 있어요.', en: 'There are desks in this classroom.', opts: ['이', '그', '저'], ans: '이' },
      { arrange: '이 사람은 제 친구예요.', en: 'This person is my friend.' },
      { arrange: '저 사람은 의사예요.', en: 'That person over there is a doctor.' },
      { translate: 'This person is a doctor.', ko: ['이 사람은 의사예요.'] },
      { translate: 'That bag over there is my bag.', ko: ['저 가방은 제 가방이에요.'] },
      { translate: 'That person over there is a student.', ko: ['저 사람은 학생이에요.'] },
      { write: 'Point at someone across the room and say they are your friend.', ko: ['저 사람은 제 친구예요.', '저 사람은 친구예요.'] }
    ]
  },
  {
    id: 'pronoun', title: '이것 / 그것 / 저것', name: 'This thing / that thing', gist: 'works like a noun',
    focus: ['은', '이'], focusWords: true,
    rule: [['This (thing)', '이것', '이것은 책이에요'], ['That (near you)', '그것', '그것은 시계예요'], ['That over there', '저것', '저것은 의자예요']],
    cards: [
      {
        title: 'Things without a noun',
        html: 'Add 것 (<b>thing</b>) to 이, 그, 저 and you get words that stand in for a noun.',
        rule: [['Near me', '이것', 'this (thing)'], ['Near you', '그것', 'that (thing)'], ['Far from both', '저것', 'that (thing) over there']],
        examples: [['이것은 책이에요.', 'This is a book.'], ['그것은 시계예요.', 'That is a watch.']]
      },
      {
        title: 'They take particles like nouns',
        html: '것 ends in a consonant (ㅅ), so it takes <b>은</b> and <b>이</b>.',
        rule: [['Topic', '은', '이것은 · i-geo-seun'], ['Subject', '이', '이것이 · i-geo-si']],
        foot: 'In speech these shrink: 이것은 → 이건, 이것이 → 이게. You’ll hear them a lot, and both are accepted here.'
      },
      {
        title: 'What is it?',
        html: '뭐예요? means “<b>what is it?</b>” Answer with the noun + 이에요/예요.',
        examples: [['이것은 뭐예요?', 'What is this?'], ['그것은 공책이에요.', 'That’s a notebook.']]
      }
    ],
    exercises: [
      { pick: '_은 책이에요.', en: 'This is a book.', opts: ['이것', '그것', '저것'], ans: '이것' },
      { pick: '_은 시계예요.', en: 'That (near you) is a watch.', opts: ['이것', '그것', '저것'], ans: '그것' },
      { pick: '_은 의자예요.', en: 'That over there is a chair.', opts: ['이것', '그것', '저것'], ans: '저것' },
      { pick: '_은 뭐예요?', en: 'What is that over there?', opts: ['이것', '그것', '저것'], ans: '저것' },
      { pick: '_은 볼펜이에요.', en: 'This is a pen.', opts: ['이것', '그것', '저것'], ans: '이것' },
      { pick: '_은 가방이에요.', en: 'That (near you) is a bag.', opts: ['이것', '그것', '저것'], ans: '그것' },
      { pick: '이것_ 연필이에요.', en: 'This is a pencil.', opts: ['은', '는'], ans: '은' },
      { pick: '저것_ 뭐예요?', en: 'What is that over there?', opts: ['은', '는'], ans: '은' },
      { arrange: '저것은 책상이에요.', en: 'That over there is a desk.' },
      { arrange: '이것은 뭐예요?', en: 'What is this?' },
      { translate: 'This is a pencil.', ko: ['이것은 연필이에요.', '이것이 연필이에요.'] },
      { translate: 'What is this?', ko: ['이것은 뭐예요?', '이것이 뭐예요?'] },
      { translate: 'That is a notebook.', ko: ['그것은 공책이에요.', '그것이 공책이에요.'] },
      { write: 'Your friend holds something up and asks: 이것은 뭐예요? Tell them it’s a book.', ko: ['그것은 책이에요.', '그것이 책이에요.', '책이에요.'] }
    ]
  },
  {
    id: 'exist', title: '있다 / 없다', name: 'Have / exist', gist: 'there is / there isn’t',
    focus: ['이', '가'], focusWords: true,
    rule: [['There is / I have', '있어요', '시간이 있어요'], ['There isn’t / I don’t have', '없어요', '시간이 없어요']],
    cards: [
      {
        title: 'Have and exist',
        html: '있어요 means “<b>there is</b>” or “<b>(I) have</b>”. 없어요 is the opposite: “<b>there isn’t</b>” or “<b>(I) don’t have</b>”.<br><br>Their dictionary forms are 있다 and 없다. In polite speech you say 있어요 and 없어요.',
        examples: [['시간이 있어요.', 'I have time.'], ['시간이 없어요.', 'I don’t have time.']]
      },
      {
        title: 'The verb goes last',
        html: 'Korean puts the verb at the very <b>end</b>. The thing that exists takes 이/가. To say where it is, add 에 (<b>in / at</b>) to the place:',
        rule: [['Place + 에', '교실에', 'in the classroom'], ['Thing + 이/가', '의자가', 'a chair'], ['Verb', '있어요', 'there is']],
        examples: [['교실에 의자가 있어요.', 'There are chairs in the classroom.'], ['집에 고양이가 있어요.', 'There is a cat at home.']]
      },
      {
        title: 'Asking and answering',
        html: 'Raise your voice to ask. Answer with 네 (yes) or 아니요 (no) and the verb.',
        examples: [['휴대폰이 있어요?', 'Do you have a cell phone?'], ['아니요, 없어요.', 'No, I don’t.'], ['시간이 있어요? 네, 있어요.', 'Do you have time? Yes, I do.']]
      }
    ],
    exercises: [
      { pick: '시간이 _.', en: 'I don’t have time.', opts: ['있어요', '없어요'], ans: '없어요' },
      { pick: '교실에 의자가 _.', en: 'There are chairs in the classroom.', opts: ['있어요', '없어요'], ans: '있어요' },
      { pick: '저는 휴대폰이 _.', en: 'I don’t have a cell phone.', opts: ['있어요', '없어요'], ans: '없어요' },
      { pick: '집에 고양이가 _.', en: 'There is a cat at home.', opts: ['있어요', '없어요'], ans: '있어요' },
      { pick: '시간이 있어요? 네, _.', en: 'Do you have time? Yes, I do.', opts: ['있어요', '없어요'], ans: '있어요' },
      { pick: '돈이 있어요? 아니요, _.', en: 'Do you have money? No, I don’t.', opts: ['있어요', '없어요'], ans: '없어요' },
      { pick: '식당에 사람_ 없어요.', en: 'There are no people in the restaurant.', opts: ['이', '가'], ans: '이' },
      { pick: '학교에 식당_ 있어요.', en: 'There is a cafeteria at school.', opts: ['이', '가'], ans: '이' },
      { arrange: '교실에 책상이 있어요.', en: 'There is a desk in the classroom.' },
      { arrange: '저는 시간이 없어요.', en: 'I don’t have time.' },
      { translate: 'There is a cat.', ko: ['고양이가 있어요.'] },
      { translate: 'I don’t have a bag.', ko: ['저는 가방이 없어요.', '가방이 없어요.'] },
      { translate: 'There is a book in the classroom.', ko: ['교실에 책이 있어요.', '책이 교실에 있어요.'] },
      { translate: 'Do you have time?', ko: ['시간이 있어요?'] },
      { write: 'A friend asks: 우산이 있어요? (Do you have an umbrella?) Say no, you don’t.', ko: ['아니요, 없어요.', '아니요, 우산이 없어요.', '아니요, 저는 우산이 없어요.'] }
    ]
  },
  {
    id: 'negative', title: '아니에요', name: 'Is not', gist: 'noun + 이/가 아니에요',
    focus: ['이', '가'],
    rule: [['Ends in a consonant', '이 아니에요', '책이 아니에요'], ['Ends in a vowel', '가 아니에요', '의사가 아니에요']],
    cards: [
      {
        title: 'Is not',
        html: 'To say X is <b>not</b> Y, use <b>Y + 이/가 + 아니에요</b>.<br><br>아니에요 is its own word, so it comes after a space. The noun before it takes 이/가.',
        examples: [['책이 아니에요.', 'It’s not a book.'], ['의사가 아니에요.', 'I’m not a doctor.']]
      },
      {
        title: '이 or 가 again',
        html: 'The noun picks 이 or 가 the usual way.',
        rule: [['Ends in a consonant', '이 아니에요', '학생이 아니에요'], ['Ends in a vowel', '가 아니에요', '의사가 아니에요']],
        foot: 'It’s always 아니에요, never 아니예요.'
      },
      {
        title: '아니요 vs 아니에요',
        html: '아니요 means “<b>no</b>” and starts an answer. 아니에요 means “<b>is not</b>” and ends a sentence. You often need both:',
        examples: [['학생이에요?', 'Are you a student?'], ['아니요, 학생이 아니에요. 회사원이에요.', 'No, I’m not a student. I’m an office worker.']]
      }
    ],
    exercises: [
      { pick: '책_ 아니에요.', en: 'It’s not a book.', opts: ['이', '가'], ans: '이' },
      { pick: '의사_ 아니에요.', en: 'I’m not a doctor.', opts: ['이', '가'], ans: '가' },
      { pick: '저는 학생_ 아니에요.', en: 'I am not a student.', opts: ['이', '가'], ans: '이' },
      { pick: '이것은 시계_ 아니에요.', en: 'This is not a watch.', opts: ['이', '가'], ans: '가' },
      { pick: '마이클은 한국 사람_ 아니에요.', en: 'Michael is not Korean.', opts: ['이', '가'], ans: '이' },
      { pick: '그것은 의자_ 아니에요.', en: 'That is not a chair.', opts: ['이', '가'], ans: '가' },
      { pick: '저는 학생이 _.', en: 'I’m not a student.', opts: ['아니에요', '아니예요'], ans: '아니에요' },
      { pick: '_, 학생이 아니에요.', en: 'No, I’m not a student.', opts: ['아니요', '아니에요'], ans: '아니요' },
      { arrange: '저는 의사가 아니에요.', en: 'I am not a doctor.' },
      { arrange: '이것은 책이 아니에요.', en: 'This is not a book.' },
      { translate: 'This is not a book.', ko: ['이것은 책이 아니에요.'] },
      { translate: 'I am not American.', ko: ['저는 미국 사람이 아니에요.', '미국 사람이 아니에요.'] },
      { translate: 'Yuri is not a teacher.', ko: ['유리는 선생님이 아니에요.', '유리 씨는 선생님이 아니에요.'] },
      { write: 'Someone asks: 학생이에요? You’re an office worker. Say no and correct them.', ko: ['아니요, 학생이 아니에요. 회사원이에요.', '아니요, 저는 학생이 아니에요. 회사원이에요.', '아니요, 회사원이에요.', '아니요, 저는 회사원이에요.'] }
    ]
  }
];
