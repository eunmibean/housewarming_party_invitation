/* ==========================================================================
   config.js  -  이 파일만 고치면 됩니다.
   (색상은 css/style.css 맨 위 :root 변수에서 바꿉니다.)
   ========================================================================== */
window.CONFIG = {
  /* ---- Supabase ------------------------------------------------------- */
  // Project Settings > API 에서 확인. anonKey 는 공개용(anon/public) 키만 넣으세요.
  // service_role 키는 절대 넣지 마세요!
  // Vercel 환경 변수(SUPABASE_URL, SUPABASE_ANON_KEY)가 있으면 그 값이 우선, 없으면 아래 값을 사용합니다.
  supabase: {
    url: (window.ENV && window.ENV.SUPABASE_URL) || '',
    anonKey: (window.ENV && window.ENV.SUPABASE_ANON_KEY) || '',
    table: 'rsvps',
  },

  /* ---- 행사 정보 -------------------------------------------------------- */
  event: {
    title: 'Housewarming Party',
    description: "Can't wait to see you at my new place!",
    location: '950 Drake St, Vancouver', // 캘린더/마무리 화면에 표시
    mapUrl: 'https://maps.app.goo.gl/zzVRjyT5BMRru11EA', // 지도 링크 (비워두면 버튼 숨김)
    durationHours: 3, // 캘린더 종료 시각 = 시작 + durationHours
    timezone: 'America/Vancouver', // IANA 타임존
  },

  /* ---- 선택 가능한 날짜 / 시간 ---------------------------------------- */
  availableDates: [
    '2026-11-01', '2026-11-08'
  ],
  availableTimes: ['13:00', '17:00'],

  /* ---- 안내 사항 (마무리 화면 카드에 그대로 나옵니다) --------------------- */
  notices: [
    'No parking available',
    'Please take off your shoes',
    'Feel free to bring nothing (or drinks) but yourself!',
  ],

  /* ---- 음식 선택지 ---------------------------------------------------- */
  // id 는 DB 에 저장되는 값, label 은 화면에 보이는 글자
  foods: [
    { id: 'western', label: 'Western' },
    { id: 'korean', label: 'Korean' },
    { id: 'chinese', label: 'Chinese' },
    { id: 'japanese', label: 'Japanese' },
  ],

  /* ---- 기타 ------------------------------------------------------------ */
  guestsMax: 10, // 동반 인원 최대값
  typingSpeedMs: 35, // 대화창 타이핑 속도 (글자당 ms)

  /* ---- 화면에 나오는 문구 (영어) --------------------------------------- */
  text: {
    mailPrompt: 'A new mail has arrived. Would you like to open?',
    yes: 'YES',
    letter: 'I just moved to a new town! Would you like to come over?',
    calendar: {
      months: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
      weekdays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      weekdaysLong: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      prevMonth: 'Previous month',
      nextMonth: 'Next month',
      next: 'NEXT',
    },
    form: {
      title: 'RSVP',
      name: 'Name',
      namePlaceholder: 'Your name',
      guests: 'Coming with someone?',
      no: 'NO',
      yes: 'YES',
      guestCount: 'How many people with you?',
      food: 'Favorite food',
      spicy: 'Can you eat spicy?',
      spicyLevel: 'How spicy? (1-5)',
      foodNotes: "Foods you can't eat / dislike / allergies (optional)",
      foodNotesPlaceholder: 'e.g. peanut allergy, no cilantro',
      submit: 'SUBMIT',
      sending: 'SENDING...',
      retry: 'RETRY',
      sent: 'SENT!',
      nameRequired: 'Please enter your name.',
      failed: 'Failed to send. Please try again.',
    },
    end: {
      thanks: 'Thank you for accepting the invitation!',
      seeYou: 'SEE YOU SOON!',
      when: 'WHEN',
      where: 'WHERE',
      map: 'OPEN MAP',
      addToCalendar: 'Add to Google Calendar',
      notice: 'NOTICE',
    },
  },
};
