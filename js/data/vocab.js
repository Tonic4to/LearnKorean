// Word lessons: themed sets of words from words.js. A set opens once all of
// its letters have been taught; after a set is learned, its words come back
// for review on a spaced schedule (see progress.js).
var VOCAB_SETS = [
  { id: 'hello', title: 'Hello & goodbye', words: ['안녕하세요', '반갑습니다', '안녕히 가세요', '안녕히 계세요', '네', '아니요', '저', '나', '이름', '씨'] },
  { id: 'countries', title: 'Countries', words: ['나라', '사람', '한국', '미국', '일본', '중국', '영국', '호주', '어느'] },
  { id: 'jobs', title: 'Jobs', words: ['직업', '학생', '선생님', '회사원', '의사', '경찰', '가수'] },
  { id: 'classroom', title: 'In the classroom', words: ['책', '공책', '연필', '볼펜', '가방', '책상', '의자', '시계', '휴대폰', '컴퓨터'] },
  { id: 'this', title: 'This, that & questions', words: ['이것', '그것', '저것', '뭐', '누구', '왜', '여기', '거기'] },
  { id: 'places', title: 'People & places', words: ['친구', '남자', '여자', '교실', '학교', '식당', '집', '화장실', '병원'] },
  { id: 'have', title: 'Having things', words: ['있다', '없다', '시간', '돈', '우산', '물', '우유', '사과', '고양이', '개'] },
  { id: 'food', title: 'Food & drink', words: ['밥', '김치', '불고기', '김밥', '떡볶이', '고기', '빵', '커피', '과자', '음식'] },
  { id: 'family', title: 'Family', words: ['어머니', '아버지', '아빠', '오빠', '딸', '아이', '부부', '아저씨'] }
];

// Numbers come right after greetings (see numbers.js).
VOCAB_SETS.splice.apply(VOCAB_SETS, [1, 0].concat(NUMBER_SETS));
