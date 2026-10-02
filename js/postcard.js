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

// Desenha o postal
function renderPostcard(twin, bgHex, inkHex, portrait = null, frame = 'none') {
  ensurePostcard();
  const g = postcard;
  const ink = hexToRgb(inkHex);
  const bg = portrait ? [20, 20, 20] : hexToRgb(bgHex);
  const P = { paper: bg, ink, grey: lerpArr(ink, bg, 0.4), faint: lerpArr(ink, bg, 0.75), knock: !portrait };

  g.push();
  g.background(bg[0], bg[1], bg[2]);

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

  // Rodapé
  glyph(g, 'jardim das palavras', PC_W / 2, PC_H - 44, { font: MONO, size: 11, col: P.grey });

  // Moldura
  drawFrame(g, P, frame);
  g.pop();
}

// Moldura ASCII à volta do postal
function drawFrame(g, P, key) {
  const f = FRAMES[key];
  if (!f || !f.h) return;
  const m = 24;
  const x0 = m, x1 = PC_W - m, y0 = m, y1 = PC_H - m;
  const nx = floor((x1 - x0) / f.hs), ny = floor((y1 - y0) / f.vs);
  const sx = (x1 - x0) / nx, sy = (y1 - y0) / ny;
  const pick = (c, i) => (Array.isArray(c) ? c[i % c.length] : c);
  const put = (ch, x, y) => glyph(g, ch, x, y + 4, { font: MONO, size: 13, col: P.ink, alpha: 210 });

  // Cima e baixo
  for (let i = 1; i < nx; i++) {
    put(pick(f.h, i), x0 + i * sx, y0);
    put(pick(f.h, i), x0 + i * sx, y1);
  }
  // Lados
  for (let j = 1; j < ny; j++) {
    put(f.v, x0, y0 + j * sy);
    put(f.v2 || f.v, x1, y0 + j * sy);
  }
  // Cantos
  for (const [x, y] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) put(f.c, x, y);
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

// PDF
function downloadPDF(name) {
  if (!window.jspdf) return;
  try {
    const doc = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' });
    doc.addImage(postcard.elt.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 210, 148);
    doc.save(name);
  } catch (e) {
    alert(EXPORT_ERROR);
  }
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
