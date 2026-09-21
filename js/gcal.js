/* gcal.js - OAuth 없이 Google Calendar "일정 추가" URL 템플릿을 만듭니다. */
(function (root) {
  'use strict';

  const pad = (n) => String(n).padStart(2, '0');

  // Date.UTC 를 "타임존 없는 달력 계산기"로만 사용 → 자정을 넘겨도 날짜가 정확히 넘어감
  function stamp(ms) {
    const d = new Date(ms);
    return (
      d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) +
      'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + '00'
    );
  }

  /**
   * @param {{date:string, time:string, event:object}} p  date "YYYY-MM-DD", time "HH:mm"
   * @returns {string} https://calendar.google.com/calendar/render?... URL
   */
  function buildGoogleCalendarUrl({ date, time, event }) {
    const [y, m, d] = date.split('-').map(Number);
    const [hh, mm] = time.split(':').map(Number);
    const start = Date.UTC(y, m - 1, d, hh, mm);
    const end = start + (Number(event.durationHours) || 2) * 3600 * 1000;

    const details = [event.description, event.mapUrl].filter(Boolean).join('\n');
    const q = (k, v) => k + '=' + encodeURIComponent(v);

    return (
      'https://calendar.google.com/calendar/render?' +
      [
        q('action', 'TEMPLATE'),
        q('text', event.title || ''),
        'dates=' + stamp(start) + '/' + stamp(end), // '/' 는 인코딩하지 않음
        q('ctz', event.timezone || 'Asia/Seoul'),
        q('location', event.location || ''),
        q('details', details),
      ].join('&')
    );
  }

  const api = { buildGoogleCalendarUrl };
  root.GCal = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
