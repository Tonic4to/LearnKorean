// Number sets for the Words tab: teaching cards first, then each number is
// memorized like a word. items: [number, Hangul, romanization as said, spoken spelling?]
// The spoken spelling is for numbers whose sound isn't what the letters suggest
// (십육 is said 심뉵); validate.js checks the romanization against it.
var NUMBER_SETS = [
  {
    id: 'sino-1', numbers: 'sino', title: 'Sino-Korean 1–10',
    items: [[1, '일', 'il'], [2, '이', 'i'], [3, '삼', 'sam'], [4, '사', 'sa'], [5, '오', 'o'],
      [6, '육', 'yuk'], [7, '칠', 'chil'], [8, '팔', 'pal'], [9, '구', 'gu'], [10, '십', 'sip']],
    cards: [
      {
        title: 'Two ways to count',
        html: 'Korean has <b>two</b> sets of numbers, and you need both.<br><br>• <b>Sino-Korean</b> (일, 이, 삼…) came from Chinese. Use it for dates, money, minutes, phone numbers, floors and math.<br>• <b>Native Korean</b> (하나, 둘, 셋…) is for counting things and people, for age, and for the hour on a clock.<br><br>This set is Sino-Korean. The native numbers have their own sets.'
      },
      {
        title: 'Sino-Korean 1–10',
        html: 'One block each, so they’re quick to say.',
        rule: [['1', '일', 'il'], ['2', '이', 'i'], ['3', '삼', 'sam'], ['4', '사', 'sa'], ['5', '오', 'o'],
          ['6', '육', 'yuk'], ['7', '칠', 'chil'], ['8', '팔', 'pal'], ['9', '구', 'gu'], ['10', '십', 'sip']],
        foot: 'A few double as words you’ve seen: 이 is also “this” and 팔 is also “arm”. Context tells them apart.'
      }
    ]
  },
  {
    id: 'sino-2', numbers: 'sino', title: 'Sino-Korean 11–20',
    items: [[11, '십일', 'sibil'], [12, '십이', 'sibi'], [13, '십삼', 'sipsam'], [14, '십사', 'sipsa'], [15, '십오', 'sibo'],
      [16, '십육', 'simnyuk', '심뉵'], [17, '십칠', 'sipchil'], [18, '십팔', 'sippal'], [19, '십구', 'sipgu'], [20, '이십', 'isip']],
    cards: [
      {
        title: 'Building 11–20',
        html: 'Sino-Korean numbers work like a calculator: say the tens, then the ones.<br><br><b>11</b> = 10 + 1 = 십 + 일 = <b>십일</b><br><b>15</b> = 10 + 5 = <b>십오</b><br><b>20</b> = 2 × 10 = 이 + 십 = <b>이십</b><br><br>Ten on its own is just 십, never 일십. The same pattern keeps going: 이십일 is 21, 삼십 is 30.'
      },
      {
        title: 'Sino-Korean 11–20',
        html: 'Final consonants link as usual, so 십일 is read <b>si-bil</b>.',
        rule: [['11', '십일', 'sibil'], ['12', '십이', 'sibi'], ['13', '십삼', 'sipsam'], ['14', '십사', 'sipsa'], ['15', '십오', 'sibo'],
          ['16', '십육', 'simnyuk'], ['17', '십칠', 'sipchil'], ['18', '십팔', 'sippal'], ['19', '십구', 'sipgu'], ['20', '이십', 'isip']],
        foot: 'One to learn by ear: 십육 (16) is said <b>simnyuk</b>, not sibyuk.'
      }
    ]
  },
  {
    id: 'native-1', numbers: 'native', title: 'Native Korean 1–10',
    items: [[1, '하나', 'hana'], [2, '둘', 'dul'], [3, '셋', 'set'], [4, '넷', 'net'], [5, '다섯', 'daseot'],
      [6, '여섯', 'yeoseot'], [7, '일곱', 'ilgop'], [8, '여덟', 'yeodeol'], [9, '아홉', 'ahop'], [10, '열', 'yeol']],
    cards: [
      {
        title: 'Native Korean numbers',
        html: 'These are for counting things and people, for age, and for the hour. They’re less regular than Sino-Korean, so they take more practice.',
        rule: [['1', '하나', 'hana'], ['2', '둘', 'dul'], ['3', '셋', 'set'], ['4', '넷', 'net'], ['5', '다섯', 'daseot'],
          ['6', '여섯', 'yeoseot'], ['7', '일곱', 'ilgop'], ['8', '여덟', 'yeodeol'], ['9', '아홉', 'ahop'], ['10', '열', 'yeol']],
        foot: '여덟 has two consonants at the bottom, and only ㄹ is said: <b>yeo-deol</b>.'
      },
      {
        title: 'Shorter before a counter',
        html: 'When you count something, a <b>counter</b> word follows the number: 개 for things, 명 for people. Before a counter, 1–4 get shorter:',
        rule: [['1', '한', '하나 → 한 개 (one thing)'], ['2', '두', '둘 → 두 개 (two things)'], ['3', '세', '셋 → 세 명 (three people)'], ['4', '네', '넷 → 네 명 (four people)']],
        foot: 'From 5 up, nothing changes: 다섯 개, 여섯 명.'
      }
    ]
  },
  {
    id: 'native-2', numbers: 'native', title: 'Native Korean 11–20',
    items: [[11, '열하나', 'yeolhana'], [12, '열둘', 'yeoldul'], [13, '열셋', 'yeolset'], [14, '열넷', 'yeollet'], [15, '열다섯', 'yeoldaseot'],
      [16, '열여섯', 'yeollyeoseot', '열려섯'], [17, '열일곱', 'yeollilgop', '열릴곱'], [18, '열여덟', 'yeollyeodeol', '열려덟'], [19, '열아홉', 'yeorahop'], [20, '스물', 'seumul']],
    cards: [
      {
        title: 'Building 11–20',
        html: 'Put 열 (10) in front of 1–9: <b>열하나</b> (11), <b>열둘</b> (12) … <b>열아홉</b> (19).<br><br>Twenty is a new word: <b>스물</b>.',
        rule: [['11', '열하나', 'yeolhana'], ['12', '열둘', 'yeoldul'], ['13', '열셋', 'yeolset'], ['14', '열넷', 'yeollet'], ['15', '열다섯', 'yeoldaseot'],
          ['16', '열여섯', 'yeollyeoseot'], ['17', '열일곱', 'yeollilgop'], ['18', '열여덟', 'yeollyeodeol'], ['19', '열아홉', 'yeorahop'], ['20', '스물', 'seumul']]
      },
      {
        title: 'How they sound',
        html: 'A few change when you say them, because of the ㄹ in 열:',
        rule: [['14', '열넷', 'yeol-let: ㄴ after ㄹ turns into ㄹ'], ['16 · 17 · 18', '열여섯', 'yeol-lyeo-seot: an extra l sneaks in before 여 and 일'], ['19', '열아홉', 'yeo-ra-hop: the ㄹ slides into the empty ㅇ']],
        foot: 'Before a counter, 열하나–열넷 shorten like 1–4 (열한 개, 열두 명), and 스물 becomes 스무 (스무 개).'
      }
    ]
  }
];
