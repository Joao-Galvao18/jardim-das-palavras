// Postal

const EXPORT_ERROR = 'Não foi possível exportar este postal com o retrato. Experimenta com um fundo de cor.';
const portraitCache = new Map();

// Planta do postal
// Planta do postal
function postcardTwin(src) {
  if (!src.twin) {
    src.twin = new Plant(src.poem, src.word, 28, 0);
    src.twin.flower = src.flower;
    src.twin.bloomed = true;
  }
  return src.twin;
}

// Retratos
// Retrato da Wikipédia
function loadPortrait(author) {
  if (!portraitCache.has(author)) {
    portraitCache.set(author, (async () => {
      try {
        const page = PORTRAIT_PAGES[author];
        if (!page) return null;
        const res = await fetch(`https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(page)}`);
        if (!res.ok) return null;
        const data = await res.json();
        let src = data.originalimage && data.originalimage.source;
        // Miniatura para imagens grandes
        if (data.originalimage && data.originalimage.width > 2000 && data.thumbnail) {
          src = data.thumbnail.source.replace(/\/\d+px-/, '/1800px-');
        }
        if (!src) return null;
        return await new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = src;
        });
      } catch (e) {
        return null;
      }
    })());
  }
  return portraitCache.get(author);
}

// Desenho
// Cria o canvas do postal
function ensurePostcard() {
  if (postcard) return;
  postcard = createGraphics(PC_W, PC_H);
  postcard.pixelDensity(2);
  document.getElementById('preview').appendChild(postcard.elt);
  postcard.elt.style.display = 'block';

  // Coluna com a altura do postal
  const side = document.querySelector('#export .side');
  new ResizeObserver(() => {
    const h = postcard.elt.getBoundingClientRect().height;
    if (h > 0) side.style.setProperty('--pc-h', `${h}px`);
    side.classList.toggle('tight', h > 0 && h < 440);
  }).observe(postcard.elt);
}

// Último postal desenhado (para a segunda página do PDF)
let postcardArgs = null;

// Desenha o postal (sem bgHex o fundo fica transparente)
function renderPostcard(twin, bgHex, inkHex, portrait = null, frame = 'none') {
  postcardArgs = [twin, bgHex, inkHex, portrait, frame];
  ensurePostcard();
  const g = postcard;
  const P = postcardBackground(g, bgHex, inkHex, portrait);
  g.push();

  // Flor à direita
  const baseY = PC_H - 150;
  const avail = baseY - 70;
  const FS = 1.75;
  const TH = constrain((avail - STEM0 - FLOWER_H * FS) / twin.seq.length, 10, 22);
  const natural = STEM0 + twin.seq.length * TH + FLOWER_H * FS;
  const s = constrain(avail / natural, 0.75, 1.5);
  g.push();
  g.translate(PC_W * 0.74, baseY);
  g.scale(s);
  twin.render(g, P, { x: 0, baseY: 0, TH, fs: FS }, { stat: true });
  g.pop();

  // Poema centrado à esquerda
  const size = fitPoemSize(twin.poem, 540, PC_H - 240, 40, true);
  drawPoemBlock(g, P, twin, PC_W * 0.33, PC_H * 0.47, size, { stat: true, flower: FLOWERS[twin.flower.type] });

  postcardFinish(g, P, frame);
  g.pop();
}

// Fundo do postal: cor, transparente ou retrato escurecido
function postcardBackground(g, bgHex, inkHex, portrait) {
  const ink = hexToRgb(inkHex);
  const clear = !portrait && !bgHex;
  const bg = portrait ? [20, 20, 20] : clear ? (luminance(inkHex) < 0.5 ? [255, 255, 255] : [0, 0, 0]) : hexToRgb(bgHex);
  const P = { paper: bg, ink, grey: lerpArr(ink, bg, 0.4), faint: lerpArr(ink, bg, 0.75), knock: !portrait && !clear };

  if (clear) g.clear();
  else g.background(bg[0], bg[1], bg[2]);

  // Retrato a cobrir o postal
  if (portrait) {
    const ctx = g.drawingContext;
    const sc = max(PC_W / portrait.naturalWidth, PC_H / portrait.naturalHeight);
    const w = portrait.naturalWidth * sc, h = portrait.naturalHeight * sc;
    ctx.save();
    ctx.filter = `saturate(${PORTRAIT_SATURATION}%)`;
    ctx.drawImage(portrait, (PC_W - w) / 2, (PC_H - h) * 0.3, w, h);
    ctx.restore();
    g.noStroke();
    g.fill(0, 0, 0, 255 * PORTRAIT_DARKEN);
    g.rect(0, 0, PC_W, PC_H);
  }
  return P;
}

// Rodapé e moldura
function postcardFinish(g, P, frame) {
  const footY = frame && frame !== 'none' ? PC_H - 100 : PC_H - 44;
  glyph(g, 'jardim das palavras', PC_W / 2, footY, { font: MONO, size: 11, col: P.grey });
  drawFrame(g, P, frame);
}

// Caixa da flor desenhada (em unidades da flor)
function flowerBounds(flower, P) {
  const N = 520, ox = N / 2, oy = N * 0.7;
  const t = createGraphics(N, N);
  t.pixelDensity(1);
  t.translate(ox, oy);
  drawFlower(t, P, flower, 1, 255, 0);
  t.loadPixels();
  let x0 = N, y0 = N, x1 = 0, y1 = 0;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (t.pixels[(y * N + x) * 4 + 3] > 40) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  t.remove();
  if (x1 < x0) return { cx: 0, cy: HEAD_Y, w: FLOWER_H, h: FLOWER_H };
  return { cx: (x0 + x1) / 2 - ox, cy: (y0 + y1) / 2 - oy, w: max(40, x1 - x0), h: max(40, y1 - y0) };
}

// Segunda página: só a flor, ao centro, sem o texto do poema
function renderFlowerCard(twin, bgHex, inkHex, portrait = null, frame = 'none') {
  ensurePostcard();
  const g = postcard;
  const P = postcardBackground(g, bgHex, inkHex, portrait);

  // Tamanho e centro reais do desenho desta flor
  const box = flowerBounds(twin.flower, P);
  const S = min(2.6, (PC_H * 0.52) / box.h, (PC_W * 0.42) / box.w);
  g.push();
  g.translate(PC_W / 2 - box.cx * S, PC_H / 2 - 12 - box.cy * S);
  g.scale(S);
  drawFlower(g, P, twin.flower, 1, 255, 0);
  g.pop();
  g.push();
  postcardFinish(g, P, frame);
  g.pop();
}


// Downloads
// Nome do ficheiro
function postcardName(twin, ext) {
  const slug = norm(twin.poem.title.replace(/\s+/g, '-')).slice(0, 40) || 'poema';
  return `jardim-das-palavras_${slug}_A5.${ext}`;
}

// PNG
function downloadPNG(name) {
  try {
    postcard.elt.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }, 'image/png');
  } catch (e) {
    alert(EXPORT_ERROR);
  }
}

// PDF: o postal e, na segunda página, a flor sozinha
function downloadPDF(name) {
  if (!window.jspdf || !postcardArgs) return;
  const args = postcardArgs;
  try {
    const doc = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' });
    doc.addImage(postcard.elt.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 210, 148);
    renderFlowerCard(...args);
    doc.addPage('a5', 'landscape');
    doc.addImage(postcard.elt.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 210, 148);
    doc.save(name);
  } catch (e) {
    alert(EXPORT_ERROR);
  }
  // Volta a mostrar o postal
  renderPostcard(...args);
}

// Botão de exportar
function showExport() {
  exportShown = true;
  document.getElementById('exportBtn').classList.add('show');
}

function hideExport() {
  exportShown = false;
  document.getElementById('exportBtn')?.classList.remove('show');
}
