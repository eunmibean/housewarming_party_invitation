/* calendar-ui.js - 도트 달력: availableDates 만 선택 가능, 여러 달이면 ◀ ▶ 이동, 날짜+시간 선택 후 NEXT */
(function (root) {
  'use strict';

  const pad = (n) => String(n).padStart(2, '0');
  const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /**
   * @returns {Promise<{date:string, time:string}>}  NEXT 를 누르면 resolve
   */
  function pick({ container, dates, times, text }) {
    return new Promise((resolve) => {
      const valid = [...new Set(dates)].filter((d) => DATE_RE.test(d)).sort();
      const avail = new Set(valid);
      const monthIdx = (d) => { const m = DATE_RE.exec(d); return +m[1] * 12 + (+m[2] - 1); };
      const minIdx = valid.length ? monthIdx(valid[0]) : new Date().getFullYear() * 12 + new Date().getMonth();
      const maxIdx = valid.length ? monthIdx(valid[valid.length - 1]) : minIdx;
      let cur = minIdx;
      let selDate = null;
      let selTime = null;

      container.replaceChildren();

      /* 머리줄: ◀ OCT 2026 ▶ */
      const prev = el('button', 'btn cal-nav');
      prev.type = 'button';
      prev.setAttribute('aria-label', text.prevMonth);
      prev.append(el('i', 'tri tri-l'));
      const nextM = el('button', 'btn cal-nav');
      nextM.type = 'button';
      nextM.setAttribute('aria-label', text.nextMonth);
      nextM.append(el('i', 'tri tri-r'));
      const title = el('div', 'cal-title');
      title.id = 'cal-title';
      const head = el('div', 'cal-head');
      head.append(prev, title, nextM);

      const week = el('div', 'cal-week');
      text.weekdays.forEach((w) => week.append(el('span', '', w)));
      const grid = el('div', 'cal-grid');
      grid.id = 'cal-grid';

      /* 시간 버튼 */
      const timeRow = el('div', 'cal-times');
      const timeBtns = times.map((t) => {
        const b = el('button', 'btn compact', t);
        b.type = 'button';
        b.dataset.time = t;
        b.disabled = true;
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', () => { selTime = t; refresh(); });
        timeRow.append(b);
        return b;
      });

      const nextBtn = el('button', 'btn compact cal-next', text.next);
      nextBtn.type = 'button';
      nextBtn.id = 'cal-next';
      nextBtn.disabled = true;
      nextBtn.addEventListener('click', () => {
        if (selDate && selTime) resolve({ date: selDate, time: selTime });
      });

      container.append(head, week, grid, timeRow, nextBtn);

      function renderMonth() {
        const y = Math.floor(cur / 12);
        const m = cur % 12;
        title.textContent = text.months[m] + ' ' + y;
        const first = new Date(Date.UTC(y, m, 1)).getUTCDay();
        const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
        grid.replaceChildren();
        for (let i = 0; i < 42; i++) {
          const day = i - first + 1;
          if (day < 1 || day > days) { grid.append(el('span', 'cal-blank')); continue; }
          const iso = y + '-' + pad(m + 1) + '-' + pad(day);
          const ok = avail.has(iso);
          const b = el('button', 'cal-day' + (ok ? ' avail' : ''), String(day));
          b.type = 'button';
          b.dataset.date = iso;
          if (ok) b.addEventListener('click', () => { selDate = iso; refresh(); });
          else { b.disabled = true; b.setAttribute('aria-disabled', 'true'); } // 클릭해도 반응 없음
          grid.append(b);
        }
        const multi = maxIdx > minIdx;
        prev.classList.toggle('gone', !multi);
        nextM.classList.toggle('gone', !multi);
        prev.disabled = cur <= minIdx;
        nextM.disabled = cur >= maxIdx;
        refresh();
      }

      function refresh() {
        grid.querySelectorAll('.cal-day').forEach((b) => {
          const on = b.dataset.date === selDate;
          b.classList.toggle('sel', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        timeBtns.forEach((b) => {
          b.disabled = !selDate;
          const on = b.dataset.time === selTime;
          b.classList.toggle('on', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        nextBtn.disabled = !(selDate && selTime);
      }

      const go = (delta) => { cur = Math.min(maxIdx, Math.max(minIdx, cur + delta)); renderMonth(); };
      prev.addEventListener('click', () => go(-1));
      nextM.addEventListener('click', () => go(1));

      renderMonth();
      const firstAvail = grid.querySelector('.cal-day.avail');
      if (firstAvail) firstAvail.focus({ preventScroll: true });
    });
  }

  root.CalendarUI = { pick };
})(window);
