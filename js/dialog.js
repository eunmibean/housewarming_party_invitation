/* dialog.js - 타이핑 대화창, ▶ 커서 메뉴, 방향키 이동, 8비트 효과음 */
(function (root) {
  'use strict';

  const CFG = root.CONFIG;
  const $ = (s, r = document) => r.querySelector(s);
  const screen = $('#screen');
  const dlg = $('#dialog');
  const dlgText = $('#dialog-text');
  const arrow = $('#dialog-arrow');
  const menu = $('#menu');

  /* ---------------- 효과음 (기본 음소거) ---------------- */
  const Sound = {
    ctx: null,
    enabled: false,
    toggle() {
      this.enabled = !this.enabled;
      if (this.enabled) {
        if (!this.ctx) {
          const AC = root.AudioContext || root.webkitAudioContext;
          if (AC) this.ctx = new AC();
        }
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
        this.beep(988, 0.08);
      }
      return this.enabled;
    },
    beep(freq, dur = 0.06, vol = 0.05, delay = 0) {
      if (!this.enabled || !this.ctx) return;
      const t = this.ctx.currentTime + delay;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'square';
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(this.ctx.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    },
    tick() { this.beep(740, 0.025, 0.02); },
    move() { this.beep(520, 0.05); },
    select() { this.beep(880, 0.06); this.beep(1320, 0.09, 0.05, 0.06); },
    error() { this.beep(180, 0.16); },
  };

  const soundBtn = $('#sound-toggle');
  soundBtn.addEventListener('click', () => {
    const on = Sound.toggle();
    soundBtn.setAttribute('aria-pressed', String(on));
    soundBtn.textContent = on ? 'SOUND: ON' : 'SOUND: OFF';
  });

  /* ---------------- 타이핑 대화창 ---------------- */
  let job = null; // 진행 중인 say() 하나

  /**
   * 글자를 한 글자씩 찍는다. 끝나면 ▼ 가 깜빡인다.
   * opts.target: 다른 요소(편지지 등)에 찍고 싶을 때 / opts.wait: true 면 ▼ 에서 입력을 기다렸다가 resolve
   */
  function say(text, opts = {}) {
    const target = opts.target || dlgText;
    const inBox = target === dlgText;
    const speed = opts.speed || CFG.typingSpeedMs || 35;
    if (document.activeElement && screen.contains(document.activeElement)) document.activeElement.blur();
    if (inBox) { dlg.hidden = false; arrow.hidden = true; }

    return new Promise((resolve) => {
      const chars = Array.from(text);
      const shown = document.createElement('span');
      const rest = document.createElement('span'); // 아직 안 찍은 글자: 안 보이지만 자리는 차지 → 줄바꿈이 안 흔들림
      rest.className = 'rest';
      target.replaceChildren(shown, rest);
      let i = 0;
      let timer = null;

      const render = () => {
        shown.textContent = chars.slice(0, i).join('');
        rest.textContent = chars.slice(i).join('');
      };
      const end = () => { job = null; resolve(); };
      const complete = () => {
        clearInterval(timer);
        i = chars.length;
        render();
        if (inBox) arrow.hidden = false; // ▼ 깜빡임
        if (opts.wait) job.phase = 'wait';
        else end();
      };

      job = {
        t0: performance.now(),
        phase: 'type',
        act() {
          if (this.phase === 'type') complete();
          else { if (inBox) arrow.hidden = true; end(); }
        },
      };
      timer = setInterval(() => {
        i++;
        render();
        if (i % 2 === 0 && chars[i - 1] !== ' ') Sound.tick();
        if (i >= chars.length) complete();
      }, speed);
      render();
    });
  }

  function hide() { dlg.hidden = true; arrow.hidden = true; menu.hidden = true; menu.replaceChildren(); }

  /* ---------------- ▶ 커서 메뉴 ---------------- */
  function choose(labels, opts = {}) {
    return new Promise((resolve) => {
      menu.replaceChildren();
      menu.classList.toggle('low', !!opts.low);
      labels.forEach((label, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'menu-item';
        b.setAttribute('role', 'menuitem');
        const cur = document.createElement('i');
        cur.className = 'tri tri-r';
        b.append(cur, label);
        b.addEventListener('mouseenter', () => b.focus({ preventScroll: true }));
        b.addEventListener('click', () => {
          Sound.select();
          menu.hidden = true;
          menu.replaceChildren();
          resolve(i);
        });
        menu.append(b);
      });
      menu.hidden = false;
      menu.firstChild.focus({ preventScroll: true });
    });
  }

  /* ---------------- 입력 처리 ---------------- */
  // 클릭/터치: 타이핑 스킵 또는 ▼ 넘기기 (버튼을 누른 클릭이 다음 대화를 곧장 넘기지 않도록 시각 비교)
  screen.addEventListener('click', (e) => {
    if (job && e.timeStamp >= job.t0) job.act();
  });

  const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href]';
  const visible = (el) => el.offsetParent !== null || el.getClientRects().length > 0;

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (job) { // 대화 진행 중: Enter/Space 로 스킵/넘기기
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!e.repeat) job.act();
      }
      return;
    }

    const dir = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }[e.key];
    if (!dir) return;
    const a = document.activeElement;
    const inScreen = a && screen.contains(a) && a.matches(FOCUSABLE);
    if (inScreen && a.matches('textarea')) return; // 글 쓰는 중엔 방향키는 커서 이동용
    if (inScreen && a.matches('input') && (dir === 'left' || dir === 'right')) return;

    const list = [...screen.querySelectorAll(FOCUSABLE)].filter(visible);
    if (!list.length) return;
    e.preventDefault();

    let next = null;
    if (!inScreen) next = list[0];
    else if (dir === 'left' || dir === 'right') { // 좌우: 화면 순서대로 이전/다음
      const i = list.indexOf(a);
      next = list[i + (dir === 'right' ? 1 : -1)] || null;
    } else { // 상하: 위치 기준으로 가장 가까운 것
      const r0 = a.getBoundingClientRect();
      const cx = r0.left + r0.width / 2;
      const cy = r0.top + r0.height / 2;
      let best = Infinity;
      list.forEach((el) => {
        if (el === a) return;
        const r = el.getBoundingClientRect();
        const dy = r.top + r.height / 2 - cy;
        const dx = r.left + r.width / 2 - cx;
        if (dir === 'down' ? dy <= 1 : dy >= -1) return;
        const score = Math.abs(dy) + Math.abs(dx) * 2;
        if (score < best) { best = score; next = el; }
      });
    }
    if (next) next.focus();
  });

  screen.addEventListener('focusin', (e) => {
    if (e.target.matches && e.target.matches('button, input, textarea')) Sound.move();
  });

  root.Dialog = { say, choose, hide, Sound };
})(window);
