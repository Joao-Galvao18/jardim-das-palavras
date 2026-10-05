// Ecrã de entrada

let introOpen = true;
let introG = null;
let introItems = [];
const introPtr = { x: 0, y: 0, active: false };

function setupIntro() {
  const el = document.getElementById('intro');
  document.getElementById('enterBtn').addEventListener('click', closeIntro);

  // Rato e dedo por cima das flores
  const move = (e) => {
    if (!introG) return;
    const r = introG.elt.getBoundingClientRect();
    introPtr.x = (e.clientX - r.left) * (introG.width / r.width);
    introPtr.y = (e.clientY - r.top) * (introG.height / r.height);
    introPtr.active = true;
  };
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerdown', move);
  el.addEventListener('pointerleave', () => { introPtr.active = false; });

  buildIntro();
}

// Entrar no jardim
function closeIntro() {
  introOpen = false;
  const el = document.getElementById('intro');
  el.classList.remove('open');
  el.setAttribute('aria-hidden', 'true');
}

// Prado de flores ao fundo, com profundidade
function buildIntro() {
  const box = document.getElementById('introGarden');
  const W = max(280, floor(box.clientWidth));
  const H = max(180, floor(box.clientHeight));
  if (!introG) {
    introG = createGraphics(W, H);
    introG.pixelDensity(min(2, displayDensity()));
    introG.elt.style.display = 'block';
    box.appendChild(introG.elt);
  } else if (introG.width !== W || introG.height !== H) {
    introG.resizeCanvas(W, H);
  }

  const k = constrain(W / 1100, 0.65, 1.1);
  const n = max(12, floor(W / (30 * k)));
  introItems = [];
  for (let i = 0; i < n; i++) {
    const depth = rnd(i + 7);
    const s = k * (0.5 + depth * 0.55);
    const room = (H - 12) / s - 110;
    introItems.push({
      x: ((i + 0.5 + (rnd(i + 3) - 0.5) * 0.9) / n) * W,
      y: H - 4 - (1 - depth) * 30 * k,
      depth,
      s,
      stemH: max(30, room * (0.25 + rnd(i + 13) * 0.6)),
      type: FLOWER_TYPES[(i * 7 + 3) % FLOWER_TYPES.length],
      phase: rnd(i + 5) * TWO_PI,
      push: 0,
      wig: 0,
      dim: 1,
    });
  }
  // Atrás primeiro
  introItems.sort((a, b) => a.depth - b.depth);
}

// Cabeça da flor (coordenadas do canvas)
function introHead(it, ang) {
  const len = it.stemH + 40;
  return { x: it.x + sin(ang) * len * it.s, y: it.y - cos(ang) * len * it.s };
}

// Desenha as flores ao vento, a reagir ao rato
function drawIntro(t) {
  if (!introG) return;
  const g = introG;
  const P = THEMES[themeName];
  const ctx = g.drawingContext;
  const R = 150 * constrain(g.width / 1100, 0.65, 1.1);

  // Flor mais próxima do rato (a da frente ganha)
  let hover = -1, bestScore = Infinity;
  if (introPtr.active) {
    introItems.forEach((it, i) => {
      const h = introHead(it, 0);
      const d = dist(introPtr.x, introPtr.y, h.x, h.y);
      if (d < 46 * it.s + 10 && d - it.depth * 30 < bestScore) { hover = i; bestScore = d - it.depth * 30; }
    });
  }

  g.clear();
  introItems.forEach((it, i) => {
    let ang = windAt(it.x, t) * (1.2 + it.depth * 0.6) + sin(t * 0.8 + it.phase) * 0.012;

    // Afasta-se um pouco do rato, como erva a ser tocada
    const h = introHead(it, ang);
    let target = 0;
    if (introPtr.active) {
      const d = dist(introPtr.x, introPtr.y, h.x, h.y);
      if (d < R) target = (1 - d / R) * (h.x >= introPtr.x ? 1 : -1);
    }
    it.push = lerp(it.push, target, 0.06);
    ang += it.push * 0.22;

    // A flor por baixo do rato inclina-se e cresce um pouco; as outras desvanecem
    it.wig = lerp(it.wig, i === hover ? 1 : 0, 0.06);
    ang += it.wig * (0.04 + sin(t * 1.2 + it.phase) * 0.015);
    it.dim = lerp(it.dim, hover >= 0 && i !== hover ? 0.7 : 1, 0.06);

    ctx.globalAlpha = (0.35 + it.depth * 0.65) * it.dim;
    drawStemFlower(g, P, it.x, it.y, it.s * (1 + it.wig * 0.06), it.stemH, ang, it.type);
  });
  ctx.globalAlpha = 1;
}
