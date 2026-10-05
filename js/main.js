// Ciclo do p5

// Início
function setup() {
  const cnv = createCanvas(windowWidth, windowHeight);
  cnv.style('cursor', 'none');
  cnv.style('touch-action', 'none');
  pixelDensity(min(2, displayDensity()));

  // Fontes
  if (document.fonts) {
    document.fonts.load(`16px "${SERIF}"`);
    document.fonts.load(`italic 16px "${SERIF}"`);
    document.fonts.load(`16px "${MONO}"`);
  }

  setTheme(initialTheme(), true);
  updateThemeColours();

  // Primeiro poema
  spawnPlant(randomPoem());
  for (let i = 0; i < 3; i++) {
    const tier = plant.grow();
    if (tier) tier.appear = -0.25 * i;
  }

  layout = computeLayout(plant.poem, plant.seq.length, plant);
  handTarget = createVector(layout.plantX - 40, height * 0.4);
  handGoal.x = handTarget.x;
  handGoal.y = handTarget.y;
  can = new WateringCan(layout.plantX - 40, height * 0.4);

  setupPointer(cnv);
  setupInterface();

  // Começa na entrada, com o jardim de poemas por trás
  openPoemsMenu();
  setupIntro();

  // Webcam
  if (TOUCH_ONLY) ml5Missing = true;
  else initHandTracking();
}

// Rato e dedo
function setupPointer(cnv) {
  const setPointer = (e) => {
    const r = cnv.elt.getBoundingClientRect();
    pointer.x = e.clientX - r.left;
    pointer.y = e.clientY - r.top;
    pointer.touch = e.pointerType !== 'mouse';
    mouseHasMoved = true;
  };
  cnv.elt.addEventListener('pointerdown', (e) => {
    setPointer(e);
    mouseWatering = true;
    if (pointer.touch) can.pos.set(pointer.x - 40, pointer.y - 80);
  });
  cnv.elt.addEventListener('pointermove', setPointer);
  cnv.elt.addEventListener('contextmenu', (e) => e.preventDefault());
  const stopWatering = () => { mouseWatering = false; };
  window.addEventListener('pointerup', stopWatering);
  window.addEventListener('pointercancel', stopWatering);
  window.addEventListener('blur', stopWatering);
}

// Cada frame
function draw() {
  const t = millis() / 1000;
  windX = (noise(t * 0.08) - 0.5) * 0.8;

  updateThemeColours();

  // Mão ou rato
  const usingHand = millis() - lastHandSeen < (isPinching ? HAND_HOLD : HAND_TIMEOUT);
  if (!usingHand) isPinching = false;

  // Ecrã de entrada
  if (introOpen) {
    updateHandPointer(usingHand);
    drawIntro(t);
    return;
  }

  // Painel aberto: o poster fica tapado, só a mão e o jardim de poemas
  if (document.querySelector('.modal.open')) {
    setWateringSound(false);
    updateHandPointer(usingHand);
    drawPoemGarden(t);
    return;
  }

  background(C.paper[0], C.paper[1], C.paper[2]);

  // Troca de poema
  if (plant.dying && plant.life < 0.02 && nextPoem) {
    spawnPlant(nextPoem);
    nextPoem = null;
  }

  currentLayout();
  plant.update(layout.plantX);

  // Regador
  const target = controlTarget(usingHand);
  updateHandPointer(usingHand);
  const watering = usingHand ? isPinching && !pinchOnUI : mouseWatering;
  can.update(target, watering, usingHand ? 0.16 : 0.09);
  setWateringSound(watering && !plant.dying);
  can.emit(drops);

  // Poema e estado
  drawPoemBlock(MAIN, C, plant, layout.poemCX, layout.poemCY, layout.poemSize, { A: plant.life });
  drawGrowthLabel();

  // Planta e flor
  plant.render(MAIN, C, { x: plant.x, baseY: layout.groundY, TH: layout.TH, fs: layout.fs, ps: layout.ps }, { t });
  updatePollen();
  updateDrops();

  // Regador e marca do ponteiro
  can.show();
  glyph(MAIN, '·', target.x, target.y + 4, { size: 18, col: C.grey, alpha: 160 });

  // Botão de exportar
  if (plant.complete && !plant.dying && !exportShown) showExport();
  placeExportButton();

  drawFooter(usingHand);
}

// Alvo do regador
function controlTarget(usingHand) {
  if (usingHand) return handTarget;
  if (!mouseHasMoved) return createVector(layout.plantX - 40, height * 0.4);
  return pointer.touch ? createVector(pointer.x - 40, pointer.y - 80) : createVector(pointer.x, pointer.y);
}

// Gotas
function updateDrops() {
  for (const d of drops) {
    d.update(windX, plant.dying ? -9999 : plant.x);
    if (plant.hitTest(d.pos.x, d.pos.y, layout.groundY, layout.TH, layout.fs, layout.ps)) {
      plant.absorb();
      if (random() < 0.3) sparks.push(new Spark(d.pos.x, d.pos.y));
      d.dead = true;
    }
    if (!d.dead) d.show();
  }
  drops = drops.filter((d) => !d.dead);

  for (const s of sparks) { s.update(); s.show(); }
  sparks = sparks.filter((s) => !s.dead);
}

// Pólen
function updatePollen() {
  if (plant.open > 0.6 && !plant.dying) {
    const rate = plant.flower.type === 'dente' ? 0.16 : 0.07;
    if (random() < rate * plant.open) {
      const headY = layout.groundY + (-(STEM0 + plant.topN * layout.TH) + HEAD_Y * layout.fs) * layout.ps;
      const a = random(TWO_PI), r = random(10, 60) * layout.fs * layout.ps;
      pollen.push(new Pollen(plant.x + cos(a) * r, headY + sin(a) * r, plant.flower.type === 'dente'));
    }
  }
  for (const p of pollen) { p.update(windX); p.show(); }
  pollen = pollen.filter((p) => !p.dead);
}

// À volta do poster
// Estado por cima do poema
function drawGrowthLabel() {
  const y = layout.poemCY - poemBlockH(plant.poem, layout.poemSize) / 2 - 22;
  const name = FLOWERS[plant.flower.type];
  let s;
  if (!plant.bloomed) s = `a crescer · ${plant.tiers.length} / ${plant.seq.length}`;
  else if (!plant.complete) s = `rega a flor para ela abrir · ${name} · ${round(plant.open * 100)}%`;
  else s = `em flor · ${name}`;
  glyph(MAIN, s, layout.poemCX, y, { font: MONO, size: 11, col: C.grey, alpha: 255 * plant.life });
}

// Posiciona o botão de exportar
let lastBtnPos = '';
function placeExportButton() {
  const x = round(layout.wide ? layout.poemCX : width / 2);
  const y = round(layout.wide ? layout.poemBottom + 54 : height - 92);
  const key = `${x},${y}`;
  if (key === lastBtnPos) return;
  lastBtnPos = key;
  const btn = document.getElementById('exportBtn');
  btn.style.left = `${x}px`;
  btn.style.top = `${y}px`;
}

// Rodapé
function drawFooter(usingHand) {
  if (!layout.wide && exportShown) return;
  const y = height - (layout.wide ? 18 : 14);
  glyph(MAIN, trackerStatus(usingHand), 22, y, { font: MONO, size: 11, col: C.grey, align: LEFT });
  if (width > 760) {
    glyph(MAIN, 'pinça ou clique para regar · a flor abre com mais água', width - 22, y, {
      font: MONO, size: 11, col: C.grey, align: RIGHT,
    });
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (introOpen) buildIntro();
  if (poemView === 'garden' && document.getElementById('poems').classList.contains('open')) {
    buildPoemGarden(visiblePoems());
  }
}
