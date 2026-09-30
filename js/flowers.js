// Flores

const HEAD_Y = -74;

// Desenha a flor
function drawFlower(g, P, flower, o, A, t) {
  const e = smooth(constrain(o, 0, 1));
  const ink = P.ink;
  const cy = HEAD_Y;

  // Glifo centrado
  const put = (s, x, y, size = 14, a = 1, font = MONO) => {
    if (a > 0.004) glyph(g, s, x, y + size * 0.32, { font, size, col: ink, alpha: A * a });
  };

  // Botão comum
  if (!['tulipa', 'papoila', 'campanula', 'lavanda'].includes(flower.type)) {
    const budA = constrain(1 - o * 2.5, 0, 1);
    put('(', -6, -14, 20, budA, SERIF);
    put(')', 6, -14, 20, budA, SERIF);
    put('·', 0, -14, 14, budA);
    put('v', 0, -3, 12, budA);
  }

  switch (flower.type) {
    // Chavetas
    case 'chavetas': {
      const rowsK = [2, 3, 4, 5, 6, 6, 5, 4, 3, 2];
      const n = rowsK.length;
      for (let r = 0; r < n; r++) {
        const ra = constrain(o * n * 1.15 - r, 0, 1);
        if (ra <= 0) continue;
        const k = rowsK[r];
        let s = '{'.repeat(k) + '}'.repeat(k);
        if (r === 4 || r === 5) s = s.slice(0, k - 1) + (r === 4 ? '**' : '@@') + s.slice(k + 1);
        if (r === 3 || r === 6) s = s.slice(0, k - 1) + '++' + s.slice(k + 1);
        const shown = max(2, round((2 * k * smooth(ra)) / 2) * 2);
        put(s.slice(k - shown / 2, k + shown / 2), 0, -12 - r * 14, 16, ra);
      }
      // Folhas e sépalas
      const la = constrain(o * 3, 0, 1);
      put('~~', -38, -8, 16, la);
      put('~~', 38, -8, 16, la);
      put('\\', -16, -2, 15, la);
      put('/', 16, -2, 15, la);
      // Faíscas
      if (o > 0.75) {
        const sa = map(o, 0.75, 1, 0, 1);
        [[-62, -90, '+'], [64, -104, '+'], [-44, -138, '·'], [48, -144, '*'], [0, -160, '+'], [-70, -40, '·'], [72, -52, '*']]
          .forEach(([x, y, c], i) => put(c, x, y + sin(t * 1.5 + i) * 2, 13, sa));
      }
      break;
    }

    // Margarida
    case 'margarida': {
      const N = 18;
      // Coroa de trás
      for (let i = 0; i < N; i++) {
        const pe = smooth(constrain((o - 0.15 - (i / N) * 0.5) / 0.35, 0, 1));
        if (pe <= 0) continue;
        const a = -HALF_PI + ((i + 0.5) * TWO_PI) / N + (1 - pe) * 0.8 + t * 0.02;
        for (const rr of [24, 38, 50]) put(dirChar(a), cos(a) * rr * pe, cy + sin(a) * rr * pe, 13, pe * 0.4);
      }
      // Coroa da frente
      for (let i = 0; i < N; i++) {
        const pe = smooth(constrain((o - (i / N) * 0.55) / 0.35, 0, 1));
        if (pe <= 0) continue;
        const a = -HALF_PI + (i * TWO_PI) / N + (1 - pe) * 0.9 + t * 0.02;
        for (const rr of [21, 33, 45]) put(dirChar(a), cos(a) * rr * pe, cy + sin(a) * rr * pe, 15, pe);
        put('.', cos(a) * 57 * pe, cy + sin(a) * 57 * pe, 15, pe * 0.8);
      }
      // Disco central em espiral de ouro
      const count = floor(40 * e);
      for (let j = 1; j < count; j++) {
        const ang = j * GOLDEN, r = 2.6 * sqrt(j);
        put(j < 12 ? '·' : j < 26 ? 'o' : '·', cos(ang) * r, cy + sin(ang) * r, j < 12 ? 11 : 9, 1);
      }
      if (e > 0.1) put('@', 0, cy, 13, e);
      // Sépalas
      put('\\', -10, -6, 14, e);
      put('/', 10, -6, 14, e);
      break;
    }

    // Rosa
    case 'rosa': {
      const N = 100;
      const rot = (1 - e) * 3.4 + t * 0.015;
      const sc = 0.3 + 0.7 * e;
      const shown = o * N;
      for (let j = 0; j < N; j++) {
        const ja = constrain(shown - j, 0, 1);
        if (ja <= 0) break;
        const th = j * 0.47 + rot;
        const r = (1.2 + j * 0.5) * sc;
        const x = cos(th) * r, y = cy + sin(th) * r * 0.86;
        if (j > 0 && j < 4) continue;
        const ch = j === 0 ? '@' : j % 9 === 0 ? '~' : x < 0 ? '(' : ')';
        put(ch, x, y, 11 + min(j, 70) * 0.06, ja, SERIF);
      }
      // Pétalas exteriores
      if (o > 0.5) {
        const pa = map(o, 0.5, 1, 0, 1);
        for (let i = 0; i < 9; i++) {
          const a = (i * TWO_PI) / 9 + 0.3 - (1 - pa) * 0.6;
          put(cos(a) < 0 ? '(' : ')', cos(a) * 60, cy + sin(a) * 52, 24, pa * 0.75, SERIF);
        }
      }
      // Sépalas e folhas
      put('\\', -12, -6, 15, e);
      put('/', 12, -6, 15, e);
      put('v', 0, -2, 13, e);
      put('~~', -32, 8, 15, e * 0.8);
      put('~~', 32, 8, 15, e * 0.8);
      break;
    }

    // Dente-de-leão
    case 'dente': {
      const R = 60;
      const k = o <= 0 ? 0 : easeOutBack(constrain(o, 0, 1));
      // Hastes finas
      g.stroke(ink[0], ink[1], ink[2], A * 0.26 * e);
      g.strokeWeight(0.5);
      g.line(0, -2, 0, cy);
      for (const s of flower.seeds) {
        g.line(0, cy, cos(s.a) * R * s.len * k * 0.92, cy + sin(s.a) * R * s.len * k * 0.92);
      }
      g.noStroke();
      // Sementes
      for (const s of flower.seeds) {
        const x = cos(s.a) * R * s.len * k, y = cy + sin(s.a) * R * s.len * k;
        put(s.star ? '*' : '+', x, y, 11, e);
        put('·', cos(s.a) * R * s.len * k * 1.13, cy + sin(s.a) * R * s.len * k * 1.13, 10, e * 0.55);
      }
      // Centro
      put('@', 0, cy, 13, e);
      for (let i = 0; i < 10; i++) {
        const a = (i * TWO_PI) / 10;
        put('.', cos(a) * 8, cy + sin(a) * 8, 10, e);
      }
      break;
    }

    // Tulipa
    case 'tulipa': {
      // Uma pétala
      const petal = (side, back) => {
        g.push();
        g.translate(0, -4);
        g.rotate(side * (0.05 + e * (back ? 0.32 : 0.62)));
        const steps = 8;
        for (let j = 0; j <= steps; j++) {
          const u = j / steps;
          const x = side * (6 + 18 * sin(PI * u * 0.92)) * (back ? 0.75 : 1);
          const y = -8 - 96 * u;
          const ch = u > 0.82 ? (side < 0 ? '/' : '\\') : side < 0 ? '(' : ')';
          put(ch, x, y, back ? 16 : 19, back ? 0.5 : 1, SERIF);
        }
        g.pop();
      };
      petal(-1, true);
      petal(1, true);
      // Estames
      if (o > 0.1) {
        g.stroke(ink[0], ink[1], ink[2], A * 0.5 * e);
        g.strokeWeight(0.7);
        for (const sx of [-12, -4, 4, 12]) {
          const h = 34 + e * (40 - abs(sx) * 1.2);
          g.line(0, -10, sx * e * 1.6, -10 - h);
        }
        g.noStroke();
        for (const sx of [-12, -4, 4, 12]) {
          const h = 34 + e * (40 - abs(sx) * 1.2);
          put('*', sx * e * 1.6, -12 - h, 13, e);
        }
      }
      petal(-1, false);
      petal(1, false);
      // Pétala da frente
      for (let j = 0; j < 7; j++) put('|', 0, -14 - j * 13, 15, 1 - e);
      // Folhas
      put('\\~', -30, 4, 16, 1);
      put('~/', 30, 4, 16, 1);
      break;
    }

    // Girassol
    case 'girassol': {
      const disc = 28, M = 120;
      const count = floor(M * constrain(o * 1.7, 0, 1));
      for (let j = 1; j < count; j++) {
        const ang = j * GOLDEN, r = disc * sqrt(j / M);
        put(j < 30 ? '·' : j < 80 ? ':' : 'o', cos(ang) * r, cy + sin(ang) * r, j < 30 ? 9 : 10, 1);
      }
      const N = 24;
      for (let layer = 0; layer < 2; layer++) {
        for (let i = 0; i < N; i++) {
          const pe = smooth(constrain((o - 0.35 - (i / N) * 0.3 - layer * 0.05) / 0.3, 0, 1));
          if (pe <= 0) continue;
          const a = -HALF_PI + ((i + layer * 0.5) * TWO_PI) / N + (1 - pe) * 0.7;
          const len = layer ? 20 : 30;
          for (const f of [0.3, 0.65, 1]) {
            const r = disc + 4 + len * f * pe;
            put(dirChar(a), cos(a) * r, cy + sin(a) * r, layer ? 13 : 15, pe * (layer ? 0.45 : 1));
          }
        }
      }
      put('\\', -10, -4, 15, e);
      put('/', 10, -4, 15, e);
      put('~~', -34, 6, 16, e);
      put('~~', 34, 6, 16, e);
      break;
    }

    // Lavanda
    case 'lavanda': {
      const spikes = [
        { ang: 0, len: 150 }, { ang: -0.26, len: 124 }, { ang: 0.24, len: 132 },
        { ang: -0.52, len: 96 }, { ang: 0.5, len: 104 }, { ang: -0.78, len: 64 }, { ang: 0.76, len: 70 },
      ];
      spikes.forEach((s, k) => {
        g.push();
        g.rotate(s.ang * (0.25 + 0.75 * e));
        const bare = s.len * 0.3;
        g.stroke(ink[0], ink[1], ink[2], A * 0.8);
        g.strokeWeight(0.7);
        g.line(0, 0, 0, -bare);
        g.noStroke();
        const n = floor((s.len - bare) / 7);
        for (let f = 0; f < n; f++) {
          const u = f / n;
          const fa = constrain((o * 1.35 - u * 0.9 - k * 0.05) / 0.22, 0, 1);
          const y = -bare - f * 7;
          const w = 5 * (1 - u * 0.6);
          if (fa < 0.5) {
            put(':', 0, y, 11, 0.6);
          } else {
            const ch = ['*', '+', '*', 'x'][floor(rnd(f + k * 31) * 4)];
            put(ch, -w, y, 11, fa);
            put(ch, w, y - 3, 11, fa);
            put('·', 0, y - 1, 10, fa * 0.8);
          }
        }
        g.pop();
      });
      break;
    }

    // Papoila
    case 'papoila': {
      // Uma pétala
      const petal = (side, back) => {
        g.push();
        g.translate(0, -6);
        g.rotate(side * (0.1 + e * (back ? 0.55 : 1.05)));
        const steps = 9;
        for (let j = 0; j <= steps; j++) {
          const u = j / steps;
          const x = side * 26 * sin(PI * u) * (back ? 0.8 : 1);
          const y = -74 * u;
          const ch = u > 0.85 ? '~' : side < 0 ? '(' : ')';
          put(ch, x, y, back ? 17 : 21, back ? 0.45 : 1, SERIF);
        }
        g.pop();
      };
      petal(-1, true);
      petal(1, true);
      // Centro escuro com estames
      if (o > 0.2) {
        const ca = map(o, 0.2, 1, 0, 1, true);
        put('#', 0, -30, 16, ca);
        for (let i = 0; i < 9; i++) {
          const a = -PI + (i / 8) * PI;
          put(i % 2 ? '·' : ':', cos(a) * 14 * ca, -30 + sin(a) * 10 * ca, 11, ca);
        }
      }
      petal(-1, false);
      petal(1, false);
      put('\\', -8, -2, 14, 1);
      put('/', 8, -2, 14, 1);
      break;
    }

    // Hortênsia
    case 'hortensia': {
      const M = 130;
      for (let i = 0; i < M; i++) {
        const delay = rnd(i + 7) * 0.72;
        const fa = constrain((o - delay) / 0.26, 0, 1);
        if (fa <= 0) continue;
        const k = easeOutBack(fa);
        const ang = i * GOLDEN, r = 62 * sqrt((i + 0.5) / M);
        const x = cos(ang) * r + (rnd(i + 3) - 0.5) * 6;
        const y = cy + sin(ang) * r * 0.84 + (rnd(i + 5) - 0.5) * 6;
        const ch = ['*', '+', 'x', '*', '·'][floor(rnd(i + 11) * 5)];
        put(ch, x, y, max(2, (10 + rnd(i + 13) * 6) * k), min(1, fa * 1.6));
      }
      put('~~', -38, 2, 16, e);
      put('~~', 38, 2, 16, e);
      put('\\', -12, -2, 14, e);
      put('/', 12, -2, 14, e);
      break;
    }

    // Campânula
    case 'campanula': {
      const arches = [
        { p: [0, 0, 0, -110, 40, -150, 74, -112], bells: [0.38, 0.55, 0.7, 0.84, 0.97] },
        { p: [0, 0, 0, -70, -30, -104, -58, -76], bells: [0.5, 0.72, 0.95] },
      ];
      arches.forEach((ar, k) => {
        const [x0, y0, x1, y1, x2, y2, x3, y3] = ar.p;
        g.noFill();
        g.stroke(ink[0], ink[1], ink[2], A * 0.85);
        g.strokeWeight(0.8);
        g.bezier(x0, y0, x1, y1, x2, y2, x3, y3);
        g.noStroke();
        ar.bells.forEach((u, i) => {
          const ba = constrain((o * 1.3 - u * 0.8 - k * 0.12) / 0.25, 0, 1);
          const bx = bezierPoint(x0, x1, x2, x3, u);
          const by = bezierPoint(y0, y1, y2, y3, u);
          g.push();
          g.translate(bx, by);
          g.rotate(sin(t * 1.3 + i + k) * 0.12 * ba);
          put('|', 0, 5, 10, 0.8);
          if (ba < 0.4) {
            put('o', 0, 13, 11, 1);
          } else {
            const s = 0.7 + 0.3 * smooth(ba);
            put('(', -6 * s, 16, 17 * s, ba, SERIF);
            put(')', 6 * s, 16, 17 * s, ba, SERIF);
            put('~', 0, 25 * s, 13, ba);
            put('·', 0, 29 * s, 11, ba);
          }
          g.pop();
        });
      });
      break;
    }
  }
}
