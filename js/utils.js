// Utilitários

const MAIN = window;
const GOLDEN = 2.39996;

// Texto
// Desenha texto
function glyph(g, str, x, y, o = {}) {
  const {
    size = 15, col = C.ink, alpha = 255, italic = false,
    align = CENTER, blur = 0, font = SERIF,
  } = o;
  if (alpha < 1) return;
  g.noStroke();
  g.textFont(font);
  g.textSize(size);
  g.textStyle(italic ? ITALIC : NORMAL);
  g.textAlign(align, BASELINE);
  g.fill(col[0], col[1], col[2], alpha);
  const useBlur = blur > 0.2;
  if (useBlur) g.drawingContext.filter = `blur(${blur.toFixed(2)}px)`;
  g.text(str, x, y);
  if (useBlur) g.drawingContext.filter = 'none';
}

// Largura de um texto
function measure(g, str, font, size, italic = false) {
  g.textFont(font);
  g.textSize(size);
  g.textStyle(italic ? ITALIC : NORMAL);
  return g.textWidth(str);
}

// Caráter para uma direção
function dirChar(a) {
  const dx = cos(a), dy = sin(a);
  if (abs(dx) < 0.38) return '|';
  if (abs(dy) < 0.38) return '-';
  return dx * dy < 0 ? '/' : '\\';
}

// Aleatório
// Escolha com pesos
function weighted(list) {
  const total = list.reduce((s, [, w]) => s + w, 0);
  let r = random(total);
  for (const [v, w] of list) { if ((r -= w) <= 0) return v; }
  return list[0][0];
}

// Pseudo-aleatório determinístico
function rnd(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// Curvas e cores
const lerpArr = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
const smooth = (x) => x * x * (3 - 2 * x);
const easeOutBack = (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * pow(x - 1, 3) + c1 * pow(x - 1, 2); };
const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c) => '#' + c.map((v) => round(v).toString(16).padStart(2, '0')).join('');
const luminance = (hex) => {
  const [r, g, b] = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
};

// Texto
const fold = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const norm = (s) => fold(s).replace(/[^a-z0-9-]/g, '');
const clean = (s) => s.replace(/[^\p{L}\p{N}-]/gu, '').toLowerCase();
const cut = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

// Armazenamento local
// Lê uma lista do localStorage
function loadList(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch (e) { return []; }
}

// Guarda uma lista no localStorage
function storeList(key, list) {
  try { localStorage.setItem(key, JSON.stringify(list)); return true; } catch (e) { return false; }
}
