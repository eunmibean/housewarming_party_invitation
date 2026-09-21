/* sprites.js - 모든 도트 그림을 코드로 직접 그립니다 (오리지널 에셋, 외부 이미지 없음).
   색은 CSS 변수(--c-*)에서 읽어옵니다. */
(function (root) {
  'use strict';

  const css = getComputedStyle(document.documentElement);
  const col = (n) => css.getPropertyValue('--c-' + n).trim() || '#ff00ff';

  function ctxOf(canvas) {
    const g = canvas.getContext('2d');
    g.imageSmoothingEnabled = false;
    const r = (x, y, w, h, c) => { g.fillStyle = col(c); g.fillRect(x, y, w, h); };
    return { g, r, clear: () => g.clearRect(0, 0, canvas.width, canvas.height) };
  }

  // 결정적 난수(항상 같은 풀 무늬)
  function rng(seed) {
    let s = seed >>> 0;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  /* ---------- 작은 소품 (오프스크린 캔버스에 그린 뒤 배경에 찍음) ---------- */
  function cloud(r) {
    r(4, 1, 8, 4, 'cloud'); r(11, 2, 6, 3, 'cloud'); r(1, 4, 24, 5, 'cloud');
    r(1, 9, 24, 1, 'cloud-d'); r(4, 8, 4, 1, 'cloud-d');
  }
  function tree(r) {
    r(7, 16, 4, 10, 'brown'); r(9, 16, 2, 10, 'brown-d');
    r(5, 0, 8, 1, 'grass-d'); r(3, 1, 12, 1, 'grass-d');
    r(1, 2, 16, 10, 'grass-d'); r(3, 12, 12, 1, 'grass-d'); r(5, 13, 8, 1, 'grass-d');
    r(5, 2, 8, 1, 'grass'); r(3, 3, 10, 6, 'grass'); r(4, 4, 4, 2, 'grass-l');
  }
  function house(r) {
    r(25, 1, 5, 9, 'brown-d'); // 굴뚝
    for (let i = 0; i < 12; i++) { // 지붕
      const hw = Math.min(17, 3 + Math.round(i * 1.4));
      r(18 - hw, i, hw * 2, 1, i % 3 === 2 ? 'red' : 'red-d');
    }
    r(3, 12, 30, 20, 'paper'); r(3, 12, 30, 1, 'paper-d'); r(3, 31, 30, 1, 'brown-d');
    r(7, 16, 8, 8, 'ink'); r(8, 17, 6, 6, 'sky'); r(10, 17, 2, 6, 'ink'); r(8, 19, 6, 2, 'ink');
    r(9, 18, 1, 1, 'sky-l');
    r(21, 19, 8, 13, 'brown'); r(22, 20, 6, 11, 'brown-l'); r(26, 25, 1, 2, 'gold');
  }
  function stamp(g, drawFn, w, h, x, y) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    drawFn(ctxOf(c).r);
    g.drawImage(c, x, y);
  }

  /* ---------- 배경: 하늘 + 구름 + 새 마을 ---------------------------------- */
  function drawBackground(canvas) {
    const { g, r } = ctxOf(canvas);
    r(0, 0, 160, 144, 'sky');
    r(0, 46, 160, 30, 'sky-l');
    for (let x = 0; x < 160; x += 2) { r(x, 44, 1, 1, 'sky-l'); r(x + 1, 45, 1, 1, 'sky-l'); } // 디더링
    stamp(g, cloud, 26, 10, 14, 8);
    stamp(g, cloud, 26, 10, 104, 18);
    stamp(g, cloud, 26, 10, 66, 4);

    r(0, 74, 160, 70, 'grass');
    for (let x = 0; x < 160; x += 2) { r(x, 74, 1, 1, 'grass-l'); r(x + 1, 75, 1, 1, 'grass-l'); }
    const rand = rng(7);
    for (let i = 0; i < 90; i++) { // 풀 무늬 + 꽃
      const x = Math.floor(rand() * 156), y = 78 + Math.floor(rand() * 64);
      r(x, y, 1, 2, 'grass-d'); r(x + 2, y + 1, 1, 1, 'grass-d');
      if (i % 9 === 0) { r(x, y - 1, 2, 2, i % 2 ? 'gold-l' : 'white'); r(x, y + 1, 1, 1, 'grass-d'); }
    }
    r(0, 84, 160, 1, 'grass-l');

    stamp(g, house, 36, 32, 6, 48);
    stamp(g, tree, 18, 26, 134, 56);
    stamp(g, tree, 18, 26, 118, 62);
    // 길
    r(50, 88, 60, 4, 'dirt'); r(50, 92, 60, 1, 'dirt-d');
  }

  /* ---------- 우편함 48x56 ------------------------------------------------- */
  function drawMailbox(canvas) {
    const { r, clear } = ctxOf(canvas);
    clear();
    r(11, 53, 18, 3, 'dirt'); r(11, 55, 18, 1, 'dirt-d'); // 흙
    r(17, 32, 6, 22, 'brown'); r(21, 32, 2, 22, 'brown-d'); r(17, 32, 1, 22, 'brown-l'); // 기둥

    const rows = [[6, 12, 28], [7, 8, 32], [8, 6, 34], [9, 5, 35]];
    for (let y = 10; y <= 30; y++) rows.push([y, 4, 36]);
    rows.push([31, 5, 35]);
    rows.forEach(([y, x0, x1]) => r(x0, y, x1 - x0 + 1, 1, 'ink')); // 외곽선
    rows.forEach(([y, x0, x1], i) => { if (i > 0 && i < rows.length - 1) r(x0 + 1, y, x1 - x0 - 1, 1, 'blue'); });
    r(6, 10, 2, 20, 'blue-l'); r(8, 8, 3, 1, 'blue-l'); // 하이라이트
    r(33, 10, 2, 20, 'blue-d'); // 그림자
    r(12, 11, 17, 1, 'ink'); // 우편 투입구
    r(10, 14, 21, 14, 'ink'); r(11, 15, 19, 12, 'blue-l'); r(11, 26, 19, 1, 'blue'); // 문
    r(26, 20, 3, 3, 'gold'); r(26, 20, 1, 1, 'gold-l');
  }

  /* ---------- 깃발 12x20 (up=true 올림 / false 내림) -------------------------- */
  function drawFlag(canvas, up) {
    const { r, clear } = ctxOf(canvas);
    clear();
    r(0, 4, 2, 16, 'ink');
    const y = up ? 0 : 13;
    r(2, y, 9, 7, 'red-d'); r(3, y + 1, 7, 5, 'red'); r(3, y + 1, 7, 1, 'gold-l');
    if (!up) r(0, 4, 2, 9, 'ink');
  }

  /* ---------- 편지봉투 32x22 ------------------------------------------------- */
  function drawEnvelope(canvas) {
    const { r, clear } = ctxOf(canvas);
    clear();
    r(0, 0, 32, 22, 'brown-d'); r(1, 1, 30, 20, 'paper'); r(1, 20, 30, 1, 'paper-d');
    for (let x = 1; x <= 15; x++) {
      const y = 1 + Math.round(((x - 1) * 10) / 14);
      r(x, y, 1, 1, 'brown'); r(31 - x, y, 1, 1, 'brown');
    }
    r(13, 10, 6, 5, 'red-d'); r(14, 11, 4, 3, 'red'); r(15, 11, 2, 1, 'gold-l'); // 씰
  }

  root.Sprites = { drawBackground, drawMailbox, drawFlag, drawEnvelope };
})(window);
