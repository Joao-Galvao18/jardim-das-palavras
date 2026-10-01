// Planta

class Plant {
  // Divide o poema em andares
  constructor(poem, seed, maxTiers, x, maxChunkChars = FRAGMENT_CHARS) {
    this.poem = poem;
    this.word = shortWord(seed);
    this.x = x;

    // Flor
    this.flower = {
      type: poemFlower(poem),
      seeds: Array.from({ length: 64 }, (_, i) => ({
        a: i * GOLDEN,
        len: random(0.72, 1),
        star: random() < 0.4,
      })),
    };

    // Fragmentos
    const lines = poem.lines.map((l) => l.split(' '));
    const total = lines.flat().length;
    const k = max(1, ceil(total / max(4, maxTiers - lines.length)));
    this.seq = [];
    this.wordTier = [];
    let side = -1, idx = 0;
    for (const words of lines) {
      let i = 0;
      while (i < words.length) {
        const chunk = [words[i++]];
        while (i < words.length && chunk.length < k &&
               chunk.join(' ').length + 1 + words[i].length <= maxChunkChars) {
          chunk.push(words[i++]);
        }
        for (let c = 0; c < chunk.length; c++) this.wordTier[idx++] = this.seq.length;
        let text = chunk.join(' ');
        if (text.length > maxChunkChars) text = text.slice(0, maxChunkChars - 1) + '…';
        this.seq.push({ type: 'word', text, side, style: weighted(WORD_STYLES) });
        side = random() < 0.8 ? -side : side;
      }
      this.seq.push({ type: 'node' });
    }

    this.fragW = null;
    this.tiers = [];
    this.water = 0;
    this.topN = 0;
    this.phase = random(TWO_PI);
    this.life = 0;
    this.dying = false;
    this.bloomed = false;
    this.bloomWater = 0;
    this.open = 0;
    this.complete = false;
    this.catchR = 30;
  }

  // Planta de um postal guardado
  static fromRecipe(r) {
    const p = new Plant(recipePoem(r), r.word, 28, 0);
    p.seq = r.seq;
    p.flower = r.flower;
    p.bloomed = true;
    return p;
  }

  // Revelação de uma palavra
  reveal(idx) {
    const s = this.wordTier[idx];
    return s < this.tiers.length ? constrain(this.tiers[s].appear, 0, 1) : 0;
  }

  // Colisão
  hitTest(x, y, baseY, TH, fs, ps = 1) {
    if (this.dying) return false;
    const top = baseY - (STEM0 + this.topN * TH + (this.bloomed ? FLOWER_H * fs : 20)) * ps;
    return abs(x - this.x) < max(46 * ps, this.catchR * ps, 30) && y > top && y < baseY + 12;
  }

  // Fragmento mais largo
  fragWidth(size) {
    if (!this.fragW || this.fragW.size !== size) {
      let w = 0;
      for (const s of this.seq) {
        if (s.type === 'word') w = max(w, measure(MAIN, s.text, SERIF, size * 1.25, true));
      }
      this.fragW = { size, w };
    }
    return this.fragW.w;
  }

  // Absorve uma gota
  absorb() {
    if (this.bloomed) { this.bloomWater++; return; }
    if (++this.water >= DROPS_PER_TIER) {
      this.water = 0;
      this.grow();
    }
  }

  // Acrescenta o próximo andar
  grow() {
    if (this.tiers.length >= this.seq.length) return null;
    const tier = { ...this.seq[this.tiers.length], appear: 0 };
    this.tiers.push(tier);
    if (this.tiers.length === this.seq.length) this.bloomed = true;
    return tier;
  }

  // Animação
  update(targetX) {
    this.x = lerp(this.x, targetX, 0.08);
    this.life = lerp(this.life, this.dying ? 0 : 1, this.dying ? 0.07 : 0.04);
    this.topN = lerp(this.topN, this.tiers.length, HEIGHT_LERP);
    for (const tier of this.tiers) tier.appear = lerp(tier.appear, 1, GROW_LERP);
    const target = this.bloomed ? min(1, this.bloomWater / OPEN_DROPS) : 0;
    this.open = lerp(this.open, target, OPEN_LERP);
    if (!this.complete && this.open > 0.97) this.complete = true;
  }

  // Desenha um fragmento
  drawWord(g, P, tier, y, baseSize, alpha) {
    const s = tier.side;
    const align = s < 0 ? RIGHT : LEFT;
    const slash = s < 0 ? '/' : '\\';
    glyph(g, slash, s * 6, y, { size: baseSize, italic: true, align, alpha, col: P.ink });
    const wx = s * (6 + measureCached(slash, SERIF, baseSize, true) + baseSize * 0.35);

    let txt = tier.text, font = SERIF, size = baseSize, italic = true, underline = false;
    switch (tier.style) {
      case 'roman':     italic = false; break;
      case 'caps':      txt = tier.text.toUpperCase(); size = baseSize * 0.72; italic = false; break;
      case 'mono':      font = MONO; size = baseSize * 0.78; italic = false; break;
      case 'underline': underline = true; break;
      case 'large':     size = baseSize * 1.25; break;
    }
    glyph(g, txt, wx, y, { size, font, italic, align, alpha, col: P.ink });

    if (underline && alpha > 1) {
      const w = measureCached(txt, font, size, italic);
      const x0 = s < 0 ? wx - w : wx;
      g.stroke(P.ink[0], P.ink[1], P.ink[2], alpha);
      g.strokeWeight(0.8);
      g.line(x0, y + 3, x0 + w, y + 3);
      g.noStroke();
    }
  }

  // Desenha a planta
  render(g, P, { x, baseY, TH, fs = 1, ps = 1 }, { t = 0, stat = false } = {}) {
    const L = stat ? 1 : this.life;
    const items = stat ? this.seq : this.tiers;
    const topH = (stat ? this.seq.length : this.topN) * TH;
    const stemTop = -(STEM0 + topH);

    g.push();
    g.translate(x, baseY);
    if (ps !== 1) g.scale(ps);

    // Base
    glyph(g, '^', 0, 4, { font: MONO, size: 14, col: P.ink, alpha: 255 * L });

    // Progresso da rega
    if (!stat && !this.complete) {
      const frac = this.bloomed ? min(1, this.bloomWater / OPEN_DROPS) : this.water / DROPS_PER_TIER;
      let dots = '';
      for (let k = 0; k < 8; k++) dots += k < floor(frac * 8) ? '•' : '·';
      glyph(g, dots, 0, 22, { font: MONO, size: 9, col: P.faint, alpha: 255 * L });
    }

    // Balanço ligeiro à volta da base
    if (!stat) g.rotate(sin(t * 0.45 + this.phase) * 0.008 * min(1, topH / 160));

    // Caule
    if (topH > 1) {
      g.stroke(P.ink[0], P.ink[1], P.ink[2], 255 * L);
      g.strokeWeight(1);
      g.line(0, -STEM0, 0, stemTop);
      g.noStroke();
    }

    // Andares
    const wordSize = constrain(TH * 0.72, 11, 16);
    for (let i = 0; i < items.length; i++) {
      const tier = items[i];
      const a = stat ? 1 : constrain(tier.appear, 0, 1);
      if (a < 0.01) continue;
      const ease = smooth(a);
      const y = -STEM0 - (i + 0.5) * TH + 4 + (1 - ease) * 6;
      const alpha = 255 * ease * L;

      if (tier.type === 'node') {
        // Nó ~*~
        const w = measureCached('~*~', MONO, 13);
        if (P.knock !== false) {
          g.fill(P.paper[0], P.paper[1], P.paper[2], 255 * L);
          g.rect(-w / 2 - 2, y - 10, w + 4, 13);
        }
        glyph(g, '~*~', 0, y, { font: MONO, size: 13, alpha, col: P.ink });
      } else {
        this.drawWord(g, P, tier, y, wordSize, alpha);
      }
    }

    // Botão ou flor
    g.push();
    g.translate(0, stemTop);
    g.scale(fs);
    if (this.bloomed || stat) {
      drawFlower(g, P, this.flower, stat ? 1 : this.open, 255 * L, t);
    } else {
      g.stroke(P.ink[0], P.ink[1], P.ink[2], 255 * L);
      g.strokeWeight(1);
      g.line(0, -7, 0, -12);
      g.noStroke();
    }
    g.pop();
    g.pop();
  }
}
