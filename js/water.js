// Água

// Gotas
// Gota
class WaterDrop {
  constructor(x, y, vx, vy) {
    this.pos = createVector(x, y);
    this.vel = createVector(vx, vy);
    this.ch = random(DROP_GLYPHS);
    this.size = 13;
    this.terminal = random(4.6, 7);
    this.alpha = 0;
    this.dead = false;
  }

  // Movimento
  update(wind, attractX) {
    this.vel.y = lerp(this.vel.y, this.terminal, 0.05);
    const dx = attractX - this.pos.x;
    const near = abs(dx) < 150;
    this.vel.x = lerp(this.vel.x, near ? dx * 0.035 : wind, near ? 0.06 : 0.015);
    this.pos.add(this.vel);
    this.alpha = lerp(this.alpha, 1, 0.25);
    if (this.pos.y > height + 20 || this.pos.x < -20 || this.pos.x > width + 20) this.dead = true;
  }

  show() {
    glyph(MAIN, this.ch, this.pos.x, this.pos.y, { size: this.size, alpha: 210 * this.alpha, italic: true });
  }
}

// Faíscas
// Faíscas
class Spark {
  constructor(x, y) {
    this.x = x + random(-14, 14);
    this.y = y;
    this.ch = random(SPARK_GLYPHS);
    this.age = 0;
    this.life = random(34, 50);
  }

  update() { this.age++; }

  get dead() { return this.age > this.life; }

  show() {
    const k = this.age / this.life;
    glyph(MAIN, this.ch, this.x, this.y - k * 18, { font: MONO, size: 12, alpha: 220 * (1 - k) });
  }
}

// Pólen
// Pólen
class Pollen {
  constructor(x, y, seedy) {
    this.x = x;
    this.y = y;
    this.vx = random(-0.6, 0.6);
    this.vy = random(-0.8, -0.2);
    this.ch = seedy ? random(['*', '+', '*']) : random(['·', '·', '.', '+']);
    this.size = seedy ? random(10, 13) : random(9, 12);
    this.age = 0;
    this.life = random(140, 240);
  }

  update(wind) {
    this.vx = lerp(this.vx, wind * 2.2 + sin(this.age * 0.05) * 0.3, 0.02);
    this.vy = lerp(this.vy, -0.35, 0.02);
    this.x += this.vx;
    this.y += this.vy;
    this.age++;
  }

  get dead() { return this.age > this.life; }

  show() {
    const k = this.age / this.life;
    const a = k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85;
    glyph(MAIN, this.ch, this.x, this.y, { font: MONO, size: this.size, alpha: 200 * a });
  }
}

// Regador
// Desenho do regador: corpo, bico a subir e o chuveiro (":" são os furos)
const CAN_ART = [
  '  .-.     ,:',
  ' (^u^)___/ :',
  "  '-'     ':",
];
// Linha e coluna do chuveiro, de onde sai a água
const CAN_TIP = [1, 11];
const CAN_SIZE = 13;
const CAN_LH = 12;

// Regador em ASCII
class WateringCan {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.prev = this.pos.copy();
    this.tilt = 0;
    this.swing = 0;
    this.alpha = 0;
    this.pouring = false;
    this.cw = 9;
    this.tipLocal = createVector(6.5 * this.cw, -1);
    this.dirLocal = createVector(1, 0.15).normalize();
  }

  // Movimento
  update(target, watering, ease = 0.09) {
    this.prev.set(this.pos);
    this.pos.x = lerp(this.pos.x, target.x, ease);
    this.pos.y = lerp(this.pos.y, target.y, ease);
    const vx = this.pos.x - this.prev.x;
    this.swing = lerp(this.swing, constrain(vx * 0.012, -0.2, 0.2), 0.08);
    this.tilt = lerp(this.tilt, watering ? 0.5 : 0, 0.1);
    this.pouring = this.tilt > 0.22;
    this.alpha = lerp(this.alpha, 1, 0.03);
  }

  get angle() { return this.tilt + this.swing + sin(frameCount * 0.021) * 0.02; }

  tip() { return this.tipLocal.copy().rotate(this.angle).add(this.pos); }

  dir() { return this.dirLocal.copy().rotate(this.angle); }

  // Rega
  emit(list) {
    if (!this.pouring || list.length > MAX_DROPS) return;
    const flow = map(this.tilt, 0.22, 0.5, 0.4, 1, true);
    const n = random() < flow ? (random() < 0.55 ? 2 : 1) : 0;
    const tip = this.tip();
    const dir = this.dir();
    for (let k = 0; k < n; k++) {
      // O chuveiro espalha a água por toda a altura dos furos
      const spread = createVector(0, random(-1, 1) * CAN_LH).rotate(this.angle);
      const sp = random(0.8, 1.8);
      list.push(new WaterDrop(
        tip.x + spread.x + random(-2, 2),
        tip.y + spread.y,
        dir.x * sp + random(-0.3, 0.3),
        dir.y * sp + random(-0.2, 0.6),
      ));
    }
  }

  // Origem no meio do corpo; o bico sai do próprio desenho
  show() {
    this.cw = measure(MAIN, 'M', MONO, CAN_SIZE);
    const ox = 3.5 * this.cw, oy = CAN_LH;
    const [row, col] = CAN_TIP;
    this.tipLocal.set((col + 0.5) * this.cw - ox, row * CAN_LH - oy - CAN_SIZE * 0.3);
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    CAN_ART.forEach((r, i) => {
      glyph(MAIN, r, -ox, i * CAN_LH - oy, { font: MONO, size: CAN_SIZE, align: LEFT, alpha: 255 * this.alpha });
    });
    pop();
  }
}
