// Molduras em ASCII

// Tamanho e margem da grelha
const FRAME_SIZE = 15;
const FRAME_M = 30;

// Desenhos (canto de cima à esquerda; o resto é espelhado)
// Cada bloco apaga o que está por baixo, incluindo os espaços
const raw = String.raw;
const FRAME_ART = {
  classica: {
    rules: [[0, '=', '|'], [1, '-', '|']],
    corner: raw`
.==================
| .----------------
| |  .-.
| | ( @ )-~
| |  '-'
| |  ~`,
    center: raw`
====.   .-.   .====
----'-.( @ ).-'----
       '-v-'`,
    side: raw`
| |
| |.-.
| ( @ )
| |'-'
| |`,
  },
  arabesco: {
    rules: [[0, '-', '|'], [1, '~', '(']],
    corner: raw`
.-------------------
| .-~~~~-.  .~~~~~~~
|(  .--.  )(
|( ( @ )  ) '.
|(  '-'  /   ~@
|(     .'
| '-~-'
|  (
|  '.
|   ~@`,
    center: raw`
 ---.     .-~~-.     .--- 
~~~ '-~-.( (@@) ).-~-' ~~~
   @~-'   '.  .'   '-~@
            \/
`,
    side: raw`
| (
|  '.
|  .-.
| ( @ )~
|  '-'
|  .'
| (`,
  },
  vinhas: {
    rules: [[0, '~-~<>', '|']],
    corner: raw`
@~-~<>
|\ .-.
| ( @ )~<>
|  '-'
| <>
| ~`,
    center: raw`
 ~<>~-.   .-.   .-~<>~ 
       '-( @ )-'       
        <>'|'<>        
           @`,
  },
  arco: {
    rules: [[0, '-', '|'], [1, '·', '·']],
    corner: raw`
              .-------
         .---'  .·····
     .--'  .·'·'
   .'  .·'
  /  .'
 /  :
|  :
|  :`,
    bottom: raw`
.---.
| @ |·
'---'
 ·`,
    center: raw`
 .-^-. 
-( @ )-
 '\ /'
   v`,
  },
  filigrana: {
    rules: [[0, '-', '|'], [2, '·o', 'o·']],
    corner: raw`
.--------
|  \|/
| --@--
|  /|\
`,
    center: raw`
-----. \|/ .-----
      '(@)'      
o·o·o·  |  ·o·o·o
        *`,
  },
};

// Espelhos de caracteres
const MIRROR_H = { '/': '\\', '\\': '/', '(': ')', ')': '(', '<': '>', '>': '<', '{': '}', '}': '{', '[': ']', ']': '[' };
const MIRROR_V = { '/': '\\', '\\': '/', "'": '.', '.': "'", '^': 'v', 'v': '^', 'u': 'n', 'n': 'u' };
const flipH = (c) => MIRROR_H[c] || c;
const flipV = (c) => MIRROR_V[c] || c;

// Bloco de texto em linhas
const art = (s) => s.replace(/^\n/, '').replace(/\n\s*$/, '').split('\n');

// Moldura à volta do postal
function drawFrame(g, P, key) {
  const F = FRAME_ART[key];
  if (!F) return;

  // Grelha que cabe certa no postal
  const cols = floor((PC_W - 2 * FRAME_M) / (FRAME_SIZE * 0.6)) + 1;
  const rows = floor((PC_H - 2 * FRAME_M) / (FRAME_SIZE * 1.15)) + 1;
  const cw = (PC_W - 2 * FRAME_M) / (cols - 1);
  const lh = (PC_H - 2 * FRAME_M) / (rows - 1);
  const cells = new Map();
  const put = (c, r, ch) => {
    if (ch === ' ') cells.delete(`${c},${r}`);
    else cells.set(`${c},${r}`, ch);
  };

  // Réguas (o = distância à margem)
  for (const [o, top, side, corner] of F.rules) {
    const c0 = o * 2, c1 = cols - 1 - o * 2, r0 = o, r1 = rows - 1 - o;
    for (let c = c0; c <= c1; c++) {
      const ch = top[(c - c0) % top.length];
      put(c, r0, ch);
      put(c, r1, flipV(ch));
    }
    for (let r = r0 + 1; r < r1; r++) {
      const ch = side[(r - r0) % side.length];
      put(c0, r, ch);
      put(c1, r, flipH(ch));
    }
    if (corner) for (const [c, r] of [[c0, r0], [c1, r0], [c0, r1], [c1, r1]]) put(c, r, corner);
  }

  // Bloco: apaga o que está por baixo e escreve (espelhado se preciso)
  const block = (lines, c0, r0, mh, mv) => {
    lines.forEach((line, i) => {
      [...line].forEach((ch, j) => {
        let v = ch;
        if (mh) v = flipH(v);
        if (mv) v = flipV(v);
        put(mh ? c0 - j : c0 + j, mv ? r0 - i : r0 + i, v);
      });
    });
  };

  // Cantos
  if (F.corner) {
    const top = art(F.corner), bot = F.bottom ? art(F.bottom) : top;
    block(top, 0, 0, false, false);
    block(top, cols - 1, 0, true, false);
    block(bot, 0, rows - 1, false, true);
    block(bot, cols - 1, rows - 1, true, true);
  }

  // Centro de cima e de baixo (em baixo só 3 linhas, por causa do rodapé)
  if (F.center) {
    const lines = art(F.center);
    const w = max(...lines.map((l) => l.length));
    const c0 = floor((cols - w) / 2);
    block(lines, c0, 0, false, false);
    block(lines.slice(0, 3), c0, rows - 1, false, true);
  }

  // Centro dos lados
  if (F.side) {
    const lines = art(F.side);
    const r0 = floor((rows - lines.length) / 2);
    block(lines, 0, r0, false, false);
    block(lines, cols - 1, r0, true, false);
  }

  // Desenha
  for (const [k, ch] of cells) {
    const [c, r] = k.split(',').map(Number);
    glyph(g, ch, FRAME_M + c * cw, FRAME_M + r * lh + FRAME_SIZE * 0.32, { font: MONO, size: FRAME_SIZE, col: P.ink });
  }
}
