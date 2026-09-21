/* app.js - 화면 전환, ?to= 처리, 폼, 마무리 화면 */
(function (root) {
  'use strict';

  const CFG = root.CONFIG;
  const T = CFG.text;
  const $ = (s, r = document) => r.querySelector(s);
  const state = { invitedAs: null, name: '', date: null, time: null };

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function button(label, cls) {
    const b = el('button', 'btn ' + (cls || ''), label);
    b.type = 'button';
    return b;
  }

  /* ---- 정수 배 확대 ---- */
  function fit() {
    // 소수 배율 허용: 바깥 테두리(4px씩) 포함 168x152 기준으로 화면에 꽉 차게
    const raw = Math.min(root.innerWidth / 168, root.innerHeight / 152);
    const s = Math.max(1, Math.min(6, Math.floor(raw * 100) / 100));
    document.documentElement.style.setProperty('--s', String(s));
  }

  /* ---- ?to=이름 ---- */
  function readParams() {
    const raw = new URLSearchParams(root.location.search).get('to');
    if (raw !== null && raw.trim() !== '') {
      state.invitedAs = raw.slice(0, 100); // DB 제약(100자)에 맞춤
      state.name = raw.trim().slice(0, 50);
    }
  }

  /* ---- 화면 전환 ---- */
  const OVERLAYS = ['scene-letter', 'scene-calendar', 'scene-form', 'scene-end'];
  function showOverlay(id) {
    OVERLAYS.forEach((o) => { $('#' + o).hidden = o !== id; });
  }

  /* ---- 편지가 우편함에서 튀어나와 화면 중앙으로 확대 ---- */
  async function openLetter() {
    const env = $('#envelope');
    $('#mailbox').classList.add('opened');
    root.Sprites.drawFlag($('#mb-flag'), false); // 깃발 내림
    env.hidden = false;
    const anim = env.animate(
      [
        { transform: 'translateY(2px) scale(0.4)', easing: 'steps(5, end)' },
        { transform: 'translateY(-20px) scale(1)', offset: 0.35, easing: 'steps(10, end)' },
        { transform: 'translateY(5px) scale(4)' },
      ],
      { duration: 1500, fill: 'forwards' }
    );
    try { await anim.finished; } catch (e) { /* 취소되어도 계속 진행 */ }
    env.hidden = true;
    anim.cancel();
  }

  /* ---- 4. 게스트 정보 폼 ---- */
  function runForm() {
    return new Promise((resolve) => {
      const F = T.form;
      const paper = $('#form-paper');
      paper.replaceChildren();
      paper.scrollTop = 0;

      const title = el('h1', 'f-title', F.title);
      const when = el('p', 'f-when', state.date + ' ' + state.time);

      // Name
      const nameLabel = el('label', 'f-label', F.name);
      nameLabel.htmlFor = 'f-name';
      const nameInput = el('input', 'field');
      nameInput.id = 'f-name';
      nameInput.type = 'text';
      nameInput.maxLength = 50;
      nameInput.autocomplete = 'off';
      nameInput.placeholder = F.namePlaceholder;
      nameInput.value = state.name;

      // Guests
      const guestLabel = el('span', 'f-label', F.guests);
      const gRow = el('div', 'f-row');
      const gNo = button(F.no, 'on');
      const gYes = button(F.yes);
      gNo.id = 'f-guest-no';
      gYes.id = 'f-guest-yes';
      gRow.append(gNo, gYes);
      const countLabel = el('span', 'f-label', F.guestCount);
      const countRow = el('div', 'f-count');
      const minus = button('-');
      const plus = button('+');
      const countInput = el('input', 'field');
      countInput.id = 'f-count';
      countInput.type = 'text';
      countInput.inputMode = 'numeric';
      countInput.maxLength = 2;
      countInput.value = '1';
      countInput.setAttribute('aria-label', F.guestCount);
      countRow.append(minus, countInput, plus);
      countLabel.hidden = true;
      countRow.hidden = true;
      let hasGuests = false;
      const max = CFG.guestsMax || 10;
      const clamp = () => {
        const n = parseInt(countInput.value.replace(/\D/g, ''), 10);
        countInput.value = String(Math.min(max, Math.max(1, Number.isNaN(n) ? 1 : n)));
      };
      const setGuests = (yes) => {
        hasGuests = yes;
        gYes.classList.toggle('on', yes);
        gNo.classList.toggle('on', !yes);
        gYes.setAttribute('aria-pressed', String(yes));
        gNo.setAttribute('aria-pressed', String(!yes));
        countLabel.hidden = countRow.hidden = !yes;
      };
      gNo.addEventListener('click', () => setGuests(false));
      gYes.addEventListener('click', () => setGuests(true));
      setGuests(false);
      countInput.addEventListener('input', () => { countInput.value = countInput.value.replace(/\D/g, ''); });
      countInput.addEventListener('blur', clamp);
      minus.addEventListener('click', () => { clamp(); countInput.value = String(Math.max(1, +countInput.value - 1)); });
      plus.addEventListener('click', () => { clamp(); countInput.value = String(Math.min(max, +countInput.value + 1)); });

      // Foods (복수 선택)
      const foodLabel = el('span', 'f-label', F.food);
      const fRow = el('div', 'f-row');
      const picked = new Set();
      CFG.foods.forEach((f) => {
        const b = button(f.label);
        b.dataset.food = f.id;
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', () => {
          if (picked.has(f.id)) picked.delete(f.id); else picked.add(f.id);
          b.classList.toggle('on', picked.has(f.id));
          b.setAttribute('aria-pressed', String(picked.has(f.id)));
        });
        fRow.append(b);
      });

      // Spicy (YES 일 때만 1~5 슬라이더)
      const spicyLabel = el('span', 'f-label', F.spicy);
      const sRow = el('div', 'f-row');
      const sNo = button(F.no, 'on');
      const sYes = button(F.yes);
      sNo.id = 'f-spicy-no';
      sYes.id = 'f-spicy-yes';
      sRow.append(sNo, sYes);
      const levelLabel = el('span', 'f-label', F.spicyLevel);
      const slider = el('input', 'slider');
      slider.id = 'f-spicy-level';
      slider.type = 'range';
      slider.min = '1';
      slider.max = '5';
      slider.step = '1';
      slider.value = '3';
      slider.setAttribute('aria-label', F.spicyLevel);
      const ticks = el('div', 'slider-ticks');
      for (let n = 1; n <= 5; n++) ticks.append(el('span', '', String(n)));
      const levelBox = el('div', 'f-level');
      levelBox.append(levelLabel, slider, ticks);
      levelBox.hidden = true;
      let canSpicy = false;
      const setSpicy = (yes) => {
        canSpicy = yes;
        sYes.classList.toggle('on', yes);
        sNo.classList.toggle('on', !yes);
        sYes.setAttribute('aria-pressed', String(yes));
        sNo.setAttribute('aria-pressed', String(!yes));
        levelBox.hidden = !yes;
      };
      sNo.addEventListener('click', () => setSpicy(false));
      sYes.addEventListener('click', () => setSpicy(true));
      setSpicy(false);

      // Notes
      const notesLabel = el('label', 'f-label', F.foodNotes);
      notesLabel.htmlFor = 'f-notes';
      const notes = el('textarea', 'field');
      notes.id = 'f-notes';
      notes.rows = 3;
      notes.maxLength = 300;
      notes.placeholder = F.foodNotesPlaceholder;

      // Submit
      const submit = button(F.submit, 'f-submit');
      submit.id = 'f-submit';
      const status = el('p', 'f-status');
      status.id = 'f-status';
      status.setAttribute('role', 'status');

      const setStatus = (msg, ok) => { status.textContent = msg; status.classList.toggle('ok', !!ok); };

      async function send() {
        const name = nameInput.value.trim();
        if (!name) {
          setStatus(F.nameRequired);
          root.Dialog.Sound.error();
          nameInput.focus();
          return;
        }
        clamp();
        const row = {
          name,
          invited_as: state.invitedAs,
          attend_date: state.date,
          attend_time: state.time,
          has_guests: hasGuests,
          guest_count: hasGuests ? +countInput.value : 0,
          favorite_foods: CFG.foods.map((f) => f.id).filter((id) => picked.has(id)),
          can_eat_spicy: canSpicy,
          spicy_level: canSpicy ? +slider.value : null,
          food_notes: notes.value.trim() || null,
        };
        state.name = name;
        submit.disabled = true;
        submit.textContent = F.sending;
        setStatus('');
        try {
          await root.SupabaseClient.insertRsvp(row);
          setStatus(F.sent, true);
          root.Dialog.Sound.select();
          setTimeout(resolve, 900); // "SENT!" 을 잠깐 보여준 뒤 다음 화면으로
        } catch (err) {
          console.warn('RSVP submit failed:', err);
          root.Dialog.Sound.error();
          submit.disabled = false;
          submit.textContent = F.retry;
          submit.dataset.state = 'retry';
          setStatus(F.failed);
          status.scrollIntoView({ block: 'nearest' });
        }
      }
      submit.addEventListener('click', send);

      paper.append(
        title, when,
        nameLabel, nameInput,
        guestLabel, gRow, countLabel, countRow,
        foodLabel, fRow,
        spicyLabel, sRow, levelBox,
        notesLabel, notes,
        submit, status
      );
      // 이름이 비어 있으면 이름칸, 채워져 있으면 포커스를 주지 않음(모바일 키보드 자동 팝업 방지)
    });
  }

  /* ---- 5. 마무리 ---- */
  const pad = (n) => String(n).padStart(2, '0');
  function prettyDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    return T.calendar.months[m - 1] + ' ' + pad(d) + ' ' + y + ' (' + T.calendar.weekdaysLong[wd] + ')';
  }

  function renderEnd() {
    const E = T.end;
    const paper = $('#end-paper');
    paper.replaceChildren();
    paper.scrollTop = 0;

    const items = [
      el('h1', 'e-title', E.seeYou),
      el('span', 'e-label', E.when),
      el('p', 'e-value', prettyDate(state.date) + ' ' + state.time),
      el('span', 'e-label', E.where),
      el('p', 'e-value', CFG.event.location),
    ];
    const actions = el('div', 'e-actions');
    if (CFG.event.mapUrl) {
      const map = el('a', 'btn compact', E.map);
      map.id = 'map-link';
      map.href = CFG.event.mapUrl;
      map.target = '_blank';
      map.rel = 'noopener noreferrer';
      actions.append(map);
    }
    const gcal = el('a', 'btn', E.addToCalendar);
    gcal.id = 'gcal-link';
    gcal.href = root.GCal.buildGoogleCalendarUrl({ date: state.date, time: state.time, event: CFG.event });
    gcal.target = '_blank';
    gcal.rel = 'noopener noreferrer';
    actions.append(gcal);
    items.push(actions);

    const card = el('section', 'card');
    card.id = 'notices';
    card.append(el('h2', '', E.notice));
    const ul = el('ul');
    CFG.notices.forEach((n) => ul.append(el('li', '', n)));
    card.append(ul);
    items.push(card);

    paper.append(...items);
    (gcal || paper).focus({ preventScroll: true });
  }

  /* ---- 전체 흐름 ---- */
  async function main() {
    readParams();
    fit();
    root.addEventListener('resize', fit);
    root.addEventListener('orientationchange', fit);
    if (document.fonts && document.fonts.ready) {
      await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);
    }

    const S = root.Sprites;
    S.drawBackground($('#bg'));
    S.drawMailbox($('#mb-body'));
    S.drawFlag($('#mb-flag'), true);
    S.drawEnvelope($('#envelope'));

    const D = root.Dialog;
    const yes = T.yes;

    // 1. 우편함
    await D.say(T.mailPrompt);
    await D.choose([yes, yes]); // 어느 쪽이든 YES
    D.hide();

    // 2. 편지
    await openLetter();
    showOverlay('scene-letter');
    await D.say(T.letter, { target: $('#letter-text') });
    await D.choose([yes, yes], { low: true });
    D.hide();

    // 3. 달력
    showOverlay('scene-calendar');
    const picked = await root.CalendarUI.pick({
      container: $('#calendar-paper'),
      dates: CFG.availableDates,
      times: CFG.availableTimes,
      text: T.calendar,
    });
    state.date = picked.date;
    state.time = picked.time;

    // 4. 폼
    showOverlay('scene-form');
    await runForm();

    // 5. 마무리
    showOverlay(null);
    await D.say(T.end.thanks, { wait: true });
    D.hide();
    showOverlay('scene-end');
    renderEnd();
  }

  main().catch((err) => console.error('App crashed:', err));
})(window);
