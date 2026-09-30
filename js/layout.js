// Layout

// Fundo real da barra de topo (medido só quando a barra muda)
let barBottomCache = null;
function barBottom() {
  if (barBottomCache === null) {
    const bar = document.getElementById('bar');
    if (!bar) return 60;
    barBottomCache = bar.getBoundingClientRect().bottom;
    new ResizeObserver(() => {
      barBottomCache = bar.getBoundingClientRect().bottom;
      layoutKey = '';
    }).observe(bar);
  }
  return barBottomCache;
}

// Layout guardado (só recalcula quando algo muda)
let layoutKey = '';
let layoutPlant = null;
function currentLayout() {
  const key = `${width}x${height}|${barBottom()}`;
  if (key !== layoutKey || layoutPlant !== plant || !layout) {
    layoutKey = key;
    layoutPlant = plant;
    layout = computeLayout(plant.poem, plant.seq.length, plant);
  }
  return layout;
}

// Calcula o layout
function computeLayout(poem, seqLen, pl = null) {
  const wide = width >= 760;
  const L = { wide };
  const barB = barBottom();

  if (wide) {
    // Ecrã largo
    L.groundY = height - max(132, height * 0.18);
    L.poemCX = width * 0.33;
    const top = max(100, barB + 40), bottom = height - 150;
    L.poemSize = fitPoemSize(poem, min(520, width * 0.46 - 80), bottom - top, 30);
    L.poemCY = (top + bottom) / 2;
    L.plantX = width * 0.74;
    L.topLimit = barB + 16;
    L.fs = constrain(height / 720, 0.85, 1.4);
    L.sideW = width * 0.22;
  } else {
    // Ecrã estreito
    L.groundY = height - 158;
    L.poemCX = width / 2;
    const top = barB + 36;
    L.poemSize = fitPoemSize(poem, width - 40, height * 0.34, 18);
    const bh = poemBlockH(poem, L.poemSize);
    L.poemCY = top + bh / 2;
    L.plantX = width / 2;
    L.topLimit = top + bh + 18;
    L.fs = constrain(width / 540, 0.55, 0.75);
    L.sideW = width / 2 - 12;
  }

  L.poemBottom = L.poemCY + poemBlockH(poem, L.poemSize) / 2;
  L.avail = L.groundY - STEM0 - FLOWER_H * L.fs - L.topLimit;
  L.TH = seqLen ? constrain(L.avail / seqLen, wide ? 10 : 12, 24) : 18;

  // Escala da planta
  L.ps = 1;
  if (pl && seqLen) {
    const natural = STEM0 + seqLen * L.TH + FLOWER_H * L.fs;
    const fragW = 14 + pl.fragWidth(constrain(L.TH * 0.72, 11, 16));
    L.ps = constrain(min((L.groundY - L.topLimit) / natural, L.sideW / fragW), 0.25, 1);
  }
  return L;
}
