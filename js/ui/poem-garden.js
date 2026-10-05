// Jardim de poemas

const GARDEN = { fs: 0.55, spriteW: 170, spriteH: 170, headY: 150 };
const spriteCache = new Map();
let gardenG = null;
let gardenItems = [];
let gardenHover = -1;

// Imagem da flor (desenhada uma só vez, sem caule)
function flowerSprite(type) {
  const key = `${type}|${themeName}`;
  if (!spriteCache.has(key)) {
    const P = { ...THEMES[themeName], knock: true };
    const g = createGraphics(GARDEN.spriteW, GARDEN.spriteH);
    g.pixelDensity(2);
    g.push();
    g.translate(GARDEN.spriteW / 2, GARDEN.headY);
    g.scale(GARDEN.fs);
    drawFlower(g, P, { type, seeds: PREVIEW_SEEDS }, 1, 255, 0);
    g.pop();
    spriteCache.set(key, g);
  }
  return spriteCache.get(key);
}

// Monta o jardim em espiral, com profundidade
function buildPoemGarden(items) {
  const box = document.getElementById('poemGarden');
  const n = items.length;
  const W = max(280, floor(box.clientWidth));
  const k = constrain(W / 1000, 0.62, 1);
  // Altura: ocupa o ecrã e cresce se houver muitas flores
  const H = floor(max(420, innerHeight * 0.78, (n * 135 * 135 * k * k) / W));

  // Canvas
  if (!gardenG) {
    gardenG = createGraphics(W, H);
    gardenG.pixelDensity(min(2, displayDensity()));
    gardenG.elt.id = 'poemGardenCanvas';
    gardenG.elt.style.display = 'block';
    box.appendChild(gardenG.elt);
    setupGardenPointer(gardenG.elt);
  } else if (gardenG.width !== W || gardenG.height !== H) {
    gardenG.resizeCanvas(W, H);
  }

  // Espiral de ouro esticada até aos cantos, vista em perspetiva
  const top = 140 * k, bottom = H - 22;
  gardenItems = items.map((it, i) => {
    const u = sqrt((i + 0.5) / max(1, n));
    const th = i * GOLDEN + 0.6;
    const toSquare = 1 / max(abs(cos(th)), abs(sin(th)));
    const r = u * lerp(1, toSquare, 0.85);
    const jx = (rnd(i + 11) - 0.5) * 0.1, jy = (rnd(i + 29) - 0.5) * 0.1;
    const px = constrain(cos(th) * r + jx, -1, 1);
    const py = constrain(sin(th) * r + jy, -1, 1);
    const y = lerp(top, bottom, (py + 1) / 2);
    const depth = (y - top) / max(1, bottom - top);
    return {
      ...it,
      x: W / 2 + px * (W / 2 - 46 * k),
      y,
      depth,
      s: k * (0.6 + depth * 0.55),
      stemH: 46 + min(it.poem.lines.length, 8) * 7 + rnd(i + 5) * 18,
      type: poemFlower(it.poem),
      phase: rnd(i + 3) * TWO_PI,
      wig: 0,
      dim: 1,
      ang: 0,
    };
  });

  // Desenhar de trás para a frente
  gardenItems.sort((a, b) => a.y - b.y);
  gardenHover = -2;
  setGardenHover(-1);
}

// Brisa: ondas lentas e leves que atravessam o jardim
function windAt(x, t) {
  const gust = 0.75 + noise(t * 0.07) * 0.5;
  const wave = (noise(x * 0.0025 - t * 0.2, t * 0.04) - 0.5) * 2;
  return wave * 0.05 * gust + sin(t * 0.45 + x * 0.008) * 0.01;
}

// Desenha o jardim (a cada frame, só com o menu aberto)
function drawPoemGarden(t) {
  if (!gardenG || poemView !== 'garden' || !document.getElementById('poems').classList.contains('open')) return;
  const g = gardenG;
  const P = THEMES[themeName];
  const ctx = g.drawingContext;
  g.clear();

  gardenItems.forEach((it, i) => {
    // Brisa + inclinação suave ao passar por cima
    it.wig = lerp(it.wig, i === gardenHover ? 1 : 0, 0.05);
    const lean = it.wig * (0.04 + sin(t * 1.2 + it.phase) * 0.015);
    it.ang = windAt(it.x, t) * (0.7 + it.depth * 0.5) + sin(t * 0.9 + it.phase) * 0.006 + lean;
    const s = it.s * (1 + it.wig * 0.04);

    // Atrás mais ténue; ao destacar uma flor, as outras desvanecem aos poucos
    it.dim = lerp(it.dim, gardenHover >= 0 && i !== gardenHover ? 0.65 : 1, 0.06);
    ctx.globalAlpha = (0.45 + it.depth * 0.55) * it.dim;

    drawStemFlower(g, P, it.x, it.y, s, it.stemH, it.ang, it.type);
  });
  ctx.globalAlpha = 1;

  // Sem poemas
  if (!gardenItems.length) {
    glyph(g, 'nenhum poema encontrado.', g.width / 2, 90, { size: 22, italic: true, col: P.grey });
  }
}

// Flor com caule curvo que dobra com o vento
function drawStemFlower(g, P, x, y, s, len, ang, type) {
  g.push();
  g.translate(x, y);
  g.scale(s);
  const tipX = sin(ang) * len, tipY = -cos(ang) * len;
  g.noFill();
  g.stroke(P.ink[0], P.ink[1], P.ink[2]);
  g.strokeWeight(1 / max(0.6, s));
  g.bezier(0, 0, 0, -len * 0.45, tipX * 0.55, tipY * 0.85, tipX, tipY);
  g.noStroke();
  glyph(g, '^', 0, 5, { font: MONO, size: 12, col: P.ink });

  // Flor na ponta do caule
  g.translate(tipX, tipY);
  g.rotate(ang * 1.3);
  g.image(flowerSprite(type), -GARDEN.spriteW / 2, -GARDEN.headY, GARDEN.spriteW, GARDEN.spriteH);
  g.pop();
}

// Centro da cabeça da flor (coordenadas do jardim)
function gardenHead(it) {
  const len = it.stemH;
  return {
    x: it.x + (sin(it.ang) * len + sin(it.ang) * -HEAD_Y * GARDEN.fs) * it.s,
    y: it.y + (-cos(it.ang) * len + HEAD_Y * GARDEN.fs) * it.s,
  };
}

// Flor por baixo de um ponto (a da frente ganha)
function gardenIndexAt(clientX, clientY) {
  if (!gardenG) return -1;
  const r = gardenG.elt.getBoundingClientRect();
  const lx = (clientX - r.left) * (gardenG.width / r.width);
  const ly = (clientY - r.top) * (gardenG.height / r.height);
  let best = -1, bestScore = Infinity;
  gardenItems.forEach((it, i) => {
    const h = gardenHead(it);
    const rad = 52 * it.s;
    const d = dist(lx, ly, h.x, h.y);
    const onStem = abs(lx - it.x) < 14 * it.s && ly < it.y + 6 && ly > h.y;
    if (d < rad || onStem) {
      const score = d - it.depth * 40; // à frente tem prioridade
      if (score < bestScore) { best = i; bestScore = score; }
    }
  });
  return best;
}

// Destaca uma flor e mostra o popup com o título e o autor
function setGardenHover(i) {
  if (i === gardenHover) return;
  gardenHover = i;
  const tip = document.getElementById('gardenTip');
  if (!gardenG) return;
  gardenG.elt.style.cursor = i >= 0 ? 'pointer' : 'default';
  if (i < 0) { tip.hidden = true; return; }
  const it = gardenItems[i];
  const k = gardenG.elt.getBoundingClientRect().width / gardenG.width;
  const h = gardenHead(it);
  tip.innerHTML = '';
  const t = document.createElement('span');
  t.className = 't';
  t.textContent = it.poem.title;
  const a = document.createElement('span');
  a.className = 'mono';
  a.textContent = it.own ? `${it.poem.author} · o teu poema` : it.poem.author;
  const hint = document.createElement('span');
  hint.className = 'mono hint';
  hint.textContent = `${FLOWERS[it.type]} · ${gardenTouch ? 'toca outra vez para plantar' : 'clica para plantar'}`;
  tip.append(t, a, hint);
  tip.style.left = `${constrain(h.x, 120, gardenG.width - 120) * k}px`;
  tip.style.top = `${max(90, h.y - 60 * it.s) * k}px`;
  tip.hidden = false;
}

// Planta o poema da flor escolhida
function gardenPick(i) {
  const it = gardenItems[i];
  if (!it) return;
  sfxClick();
  setModal('poems', false);
  requestPoem(it.poem);
}

// Rato e toque
let gardenTouch = false;
function setupGardenPointer(el) {
  el.addEventListener('pointerdown', (e) => { gardenTouch = e.pointerType !== 'mouse'; });

  // Rato: passar por cima destaca, clicar planta
  el.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse') setGardenHover(gardenIndexAt(e.clientX, e.clientY));
  });
  el.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse') setGardenHover(-1);
  });
  el.addEventListener('click', (e) => {
    if (gardenTouch) return;
    const i = gardenIndexAt(e.clientX, e.clientY);
    if (i >= 0) gardenPick(i);
  });

  // Toque: o primeiro toque mostra o popup, o segundo planta
  el.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'mouse') return;
    const i = gardenIndexAt(e.clientX, e.clientY);
    if (i >= 0 && i === gardenHover) gardenPick(i);
    else setGardenHover(i);
  });
}
