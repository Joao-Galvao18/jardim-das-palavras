// Poema

// Espaço da assinatura
const RESERVE = { base: 62, per: 2.1, flowerBase: 84, flowerPer: 2.6 };

// Altura da assinatura
const poemReserve = (size, withFlower) =>
  withFlower ? max(RESERVE.flowerBase, size * RESERVE.flowerPer) : max(RESERVE.base, size * RESERVE.per);

// Altura total do bloco do poema
const poemBlockH = (poem, size, withFlower = false) =>
  poem.lines.length * size * 1.42 + poemReserve(size, withFlower);

// Tamanho pela largura
function poemSize(poem, colW, maxSize) {
  const longest = max(...poem.lines.map((l) => measure(MAIN, l, SERIF, 100, true)));
  return min(maxSize, (colW * 100) / longest);
}

// Tamanho que cabe na caixa
function fitPoemSize(poem, colW, maxH, maxSize, withFlower = false) {
  const n = poem.lines.length;
  const base = withFlower ? RESERVE.flowerBase : RESERVE.base;
  const per = withFlower ? RESERVE.flowerPer : RESERVE.per;
  const byHeight = min((maxH - base) / (n * 1.42), maxH / (n * 1.42 + per));
  return max(11, min(poemSize(poem, colW, maxSize), byHeight));
}

// Posição de cada palavra em relação ao centro (guardada por tamanho)
function wordOffsets(pl, size) {
  if (!pl.wordPos || pl.wordPos.size !== size) {
    const lines = pl.poem.lines.map((line) => {
      let x = -measure(MAIN, line, SERIF, size, true) / 2;
      return line.split(' ').map((w) => {
        const item = { w, dx: x };
        x += measure(MAIN, w + ' ', SERIF, size, true);
        return item;
      });
    });
    pl.wordPos = { size, lines };
  }
  return pl.wordPos.lines;
}

// Desenha o poema
function drawPoemBlock(g, P, pl, cx, cy, size, { A = 1, stat = false, flower = null } = {}) {
  const poem = pl.poem;
  const lh = size * 1.42;
  let y = cy - poemBlockH(poem, size, !!flower) / 2 + size;
  let idx = 0;

  // Versos
  for (const line of wordOffsets(pl, size)) {
    for (const { w, dx } of line) {
      const a = stat ? 1 : pl.reveal(idx);
      idx++;
      if (a > 0.01) {
        glyph(g, w, cx + dx, y + (1 - smooth(a)) * 4, {
          size, italic: true, align: LEFT, col: P.ink, alpha: 255 * smooth(a) * A,
        });
      }
    }
    y += lh;
  }

  // Assinatura
  const sa = stat ? 1 : constrain(pl.topN / pl.seq.length, 0, 1) ** 6;
  const authorY = y + max(22, size * 0.75);
  glyph(g, `— ${cut(poem.author, 40)}`, cx, authorY, {
    font: MONO, size: max(11, size * 0.4), col: P.grey, alpha: 255 * sa * A,
  });
  const titleY = authorY + max(24, size * 0.9);
  glyph(g, cut(poem.title, 44) + (poem.excerpt ? ' (excerto)' : ''), cx, titleY, {
    size: max(13, size * 0.55), italic: true, col: P.grey, alpha: 255 * sa * A,
  });

  // Tipo de flor
  if (flower) {
    glyph(g, `flor · ${flower}`, cx, titleY + max(28, size * 1.0), {
      font: MONO, size: max(10, size * 0.32), col: P.grey, alpha: 255 * sa * A,
    });
  }
}
