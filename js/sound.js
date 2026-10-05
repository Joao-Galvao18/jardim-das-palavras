// Som

// Volumes
const MUSIC_VOL = 0.6;
const MUSIC_DUCK = 0.35;
const SFX_VOL = 0.6;
const SOUND_KEY = 'jardim-som';

// Estado do áudio
const sound = {
  on: true,
  ctx: null,
  master: null,
  music: null,
  sfx: null,
  verb: null,
  next: 0,
  chord: 0,
  melody: 3,
  timer: null,
  water: null,
  gestureAt: -1e6,
};

// Música: pads quentes, piano abafado e sinos de vidro
const BEAT = 60 / 56;
const CHORD_BEATS = 8;
const PROGRESSION = [
  // Ré
  { root: 38, pad: [57, 62, 66], keys: [50, 57, 62, 66], tones: [2, 6, 9] },
  // Si menor
  { root: 35, pad: [54, 59, 62], keys: [47, 54, 59, 62], tones: [11, 2, 6] },
  // Sol
  { root: 43, pad: [55, 59, 62], keys: [43, 50, 59, 62], tones: [7, 11, 2] },
  // Ré sobre fá#
  { root: 42, pad: [57, 62, 66], keys: [42, 54, 57, 62], tones: [2, 6, 9] },
  // Mi menor 7
  { root: 40, pad: [55, 59, 62], keys: [40, 52, 55, 62], tones: [4, 7, 11, 2] },
  // Si menor
  { root: 47, pad: [54, 59, 62], keys: [47, 54, 59, 62], tones: [11, 2, 6] },
  // Sol
  { root: 43, pad: [55, 59, 62], keys: [43, 50, 59, 62], tones: [7, 11, 2] },
  // Lá suspenso, a resolver em ré
  { root: 45, pad: [57, 62, 64], keys: [45, 52, 57, 64], tones: [9, 2, 4] },
];
// Ré maior pentatónico, no registo dos sinos
const BELL_NOTES = [74, 76, 78, 81, 83, 86, 88, 90];

// Arranque
function initSound() {
  try { sound.on = localStorage.getItem(SOUND_KEY) !== 'off'; } catch (e) {}
  updateSoundBtn();

  // O navegador só deixa tocar depois de um gesto
  const start = () => {
    if (!sound.on) return;
    if (!sound.ctx || sound.ctx.state !== 'running') sound.gestureAt = performance.now();
    startAudio();
  };
  window.addEventListener('pointerdown', start, true);
  window.addEventListener('keydown', start, true);

  // Clique em botões
  document.addEventListener('click', (e) => {
    if (e.target.closest && e.target.closest('button, .swatch, [role="radio"]')) sfxClick();
  }, true);

  // Pausa quando o separador fica escondido
  document.addEventListener('visibilitychange', () => {
    if (!sound.ctx) return;
    if (document.hidden) sound.ctx.suspend();
    else if (sound.on) sound.ctx.resume();
  });

  document.querySelectorAll('[data-sound]').forEach((b) => b.addEventListener('click', toggleSound));

  // Tenta tocar logo (alguns navegadores deixam)
  if (sound.on) startAudio();
}

// Liga e desliga
function toggleSound() {
  // O clique que acabou de acordar o som não o desliga
  if (sound.on && performance.now() - sound.gestureAt < 600) return;
  sound.on = !sound.on;
  try { localStorage.setItem(SOUND_KEY, sound.on ? 'on' : 'off'); } catch (e) {}
  if (sound.on) startAudio();
  else stopAudio();
  updateSoundBtn();
}

function updateSoundBtn() {
  document.querySelectorAll('[data-sound]').forEach((b) => {
    b.textContent = sound.on ? '♪ som' : '♪ sem som';
    b.setAttribute('aria-pressed', String(sound.on));
  });
}

// Cria o áudio
function startAudio() {
  if (!sound.ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = (sound.ctx = new AC());

    sound.master = ctx.createGain();
    sound.master.gain.value = 0;
    sound.master.connect(ctx.destination);

    // Espaço largo
    sound.verb = ctx.createConvolver();
    sound.verb.buffer = roomImpulse(ctx, 4.5);
    const wet = ctx.createGain();
    wet.gain.value = 0.45;
    sound.verb.connect(wet);
    wet.connect(sound.master);

    // Música e efeitos
    sound.music = ctx.createGain();
    sound.music.gain.value = MUSIC_VOL;
    sound.music.connect(sound.master);
    sound.music.connect(sound.verb);
    sound.sfx = ctx.createGain();
    sound.sfx.gain.value = SFX_VOL;
    sound.sfx.connect(sound.master);
    sound.sfx.connect(sound.verb);

    setupWaterSound();
    sound.next = ctx.currentTime + 0.3;
    sound.timer = setInterval(tick, 150);
  }
  if (sound.ctx.state !== 'running') sound.ctx.resume();
  sound.master.gain.cancelScheduledValues(sound.ctx.currentTime);
  sound.master.gain.setTargetAtTime(1, sound.ctx.currentTime, 1);
}

function stopAudio() {
  if (!sound.ctx) return;
  sound.master.gain.setTargetAtTime(0, sound.ctx.currentTime, 0.15);
  setTimeout(() => { if (!sound.on) sound.ctx.suspend(); }, 800);
}

// Pronto a tocar
const audioLive = () => sound.on && sound.ctx && sound.ctx.state === 'running';

// Instrumentos

const midiHz = (m) => 440 * Math.pow(2, (m - 69) / 12);

// Reverberação
function roomImpulse(ctx, secs) {
  const len = Math.floor(ctx.sampleRate * secs);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
  }
  return buf;
}

// Pad: cordas suaves que entram e saem devagar
function pad(notes, when, dur, vol) {
  const ctx = sound.ctx;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 900;
  lp.Q.value = 0.3;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(vol, when + 3);
  g.gain.setValueAtTime(vol, when + dur - 0.5);
  g.gain.linearRampToValueAtTime(0, when + dur + 3);
  lp.connect(g);
  g.connect(sound.music);
  for (const m of notes) {
    for (const cents of [-6, 6]) {
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.value = midiHz(m);
      o.detune.value = cents;
      o.connect(lp);
      o.start(when);
      o.stop(when + dur + 3.1);
    }
  }
}

// Piano abafado: ataque macio e uma cauda curta
function keys(midi, when, vol) {
  const ctx = sound.ctx;
  const f = midiHz(midi);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(2200, when);
  lp.frequency.exponentialRampToValueAtTime(600, when + 1.5);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(vol, when + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 3);
  lp.connect(g);
  g.connect(sound.music);
  for (const [mult, amp, type] of [[1, 1, 'sine'], [2, 0.25, 'triangle'], [3, 0.06, 'sine']]) {
    const o = ctx.createOscillator();
    const a = ctx.createGain();
    o.type = type;
    o.frequency.value = f * mult;
    a.gain.value = amp;
    o.connect(a);
    a.connect(lp);
    o.start(when);
    o.stop(when + 3.05);
  }
}

// Sino de vidro
function bell(midi, when, vol, dest, decay = 2.6) {
  const ctx = sound.ctx;
  const f = midiHz(midi);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(vol, when + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, when + decay);
  g.connect(dest);
  for (const [mult, amp] of [[1, 1], [2.01, 0.28], [3.98, 0.08]]) {
    const o = ctx.createOscillator();
    const a = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = f * mult;
    a.gain.value = amp;
    o.connect(a);
    a.connect(g);
    o.start(when);
    o.stop(when + decay + 0.05);
  }
}

// Música

// A cada passo: agenda a música e a água
function tick() {
  const ctx = sound.ctx;
  if (!ctx || ctx.state !== 'running') return;
  if (sound.next < ctx.currentTime) sound.next = ctx.currentTime + 0.1;
  while (sound.next < ctx.currentTime + 0.8) {
    playChord(sound.chord, sound.next);
    sound.next += CHORD_BEATS * BEAT;
    sound.chord++;
  }
  if (wateringNow) trickle(ctx.currentTime);
}

// Um acorde: pad, piano em arpejo lento e uma pequena frase de sinos
function playChord(i, t0) {
  const c = PROGRESSION[i % PROGRESSION.length];
  const dur = CHORD_BEATS * BEAT;
  pad(c.pad, t0, dur, 0.028);

  // Piano: o baixo e depois as notas, devagar
  c.keys.forEach((m, j) => keys(m, t0 + j * BEAT * 0.75 + random(0, 0.03), j === 0 ? 0.09 : 0.06));
  if (random() < 0.5) keys(c.keys[2] + 12, t0 + 5 * BEAT, 0.04);

  // Sinos: duas ou três notas, a passear pela escala
  if (i % 4 === 3 && random() < 0.5) return;
  const count = floor(random(2, 4));
  for (let n = 0; n < count; n++) {
    let idx = constrain(sound.melody + random([-2, -1, 1, 1, 2]), 0, BELL_NOTES.length - 1);
    if (n === 0) {
      let best = idx, bestD = 99;
      BELL_NOTES.forEach((m, k) => {
        if (c.tones.includes(m % 12) && abs(k - idx) < bestD) { best = k; bestD = abs(k - idx); }
      });
      idx = best;
    }
    sound.melody = idx;
    bell(BELL_NOTES[idx], t0 + (1 + n * 2) * BEAT + random(0, 0.04), 0.045, sound.music, 3.5);
  }
}

// Efeitos

// Clique: um toque leve e abafado
function sfxClick() {
  if (!audioLive()) return;
  const ctx = sound.ctx;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const lp = ctx.createBiquadFilter();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(520, t);
  o.frequency.exponentialRampToValueAtTime(360, t + 0.06);
  lp.type = 'lowpass';
  lp.frequency.value = 900;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.07, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
  o.connect(lp);
  lp.connect(g);
  g.connect(sound.master);
  o.start(t);
  o.stop(t + 0.1);
}

// Um sino por cada verso completo
function sfxVerse(n) {
  if (!audioLive()) return;
  bell([74, 78, 81, 83, 86][n % 5], sound.ctx.currentTime, 0.1, sound.sfx);
}

// A haste chegou ao fim
function sfxBud() {
  if (!audioLive()) return;
  bell(81, sound.ctx.currentTime + 0.35, 0.08, sound.sfx);
}

// Jingles de cada flor: notas (sinos), intervalo entre elas e nota grave de piano
const JINGLES = {
  chavetas:  { notes: [74, 78, 81, 78, 86], step: 0.16, low: 50 },
  margarida: { notes: [74, 76, 78, 81, 86], step: 0.2, low: 50 },
  rosa:      { notes: [81, 78, 83, 81, 86], step: 0.34, low: 47 },
  dente:     { notes: [93, 90, 88, 86, 83, 81, 78], step: 0.11, low: null },
  tulipa:    { notes: [69, 76, 81, 88], step: 0.26, low: 45 },
  girassol:  { notes: [74, 78, 81, 86, 90], step: 0.14, low: 50, chord: [74, 78, 81] },
  lavanda:   { notes: [81, 83, 81, 78, 81], step: 0.28, low: 43 },
  papoila:   { notes: [86, 81, 78, 74], step: 0.12, low: 50 },
  hortensia: { notes: [74, 78, 81, 83, 86, 90], step: 0.05, low: 43 },
  campanula: { notes: [88, 86, 83, 81, 78, 76, 74], step: 0.22, low: null },
  cravo:     { notes: [74, 81, 78, 83, 81], step: 0.24, low: 45 },
  lirio:     { notes: [78, 86, 81, 88], step: 0.42, low: 47 },
  cardo:     { notes: [86, 74, 88, 76, 90], step: 0.13, low: 40 },
  cerejeira: { notes: [90, 86, 88, 83, 86, 81], step: 0.3, low: 43 },
  jacinto:   { notes: [74, 76, 78, 81, 83, 86, 88], step: 0.08, low: 50 },
};

// A flor abriu: um jingle diferente para cada flor
function sfxBloom(type) {
  if (!audioLive()) return;
  const J = JINGLES[type] || JINGLES.margarida;
  const t = sound.ctx.currentTime + 0.05;
  if (J.low) keys(J.low, t, 0.1);
  J.notes.forEach((m, j) => bell(m, t + j * J.step, 0.085, sound.sfx, 3));
  if (J.chord) J.chord.forEach((m, j) => bell(m + 12, t + J.notes.length * J.step + 0.15 + j * 0.03, 0.05, sound.sfx, 3.5));
}

// Rega: um fio de água (ruído grave e bolhas que sobem)
function setupWaterSound() {
  const ctx = sound.ctx;
  const len = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 650;
  const g = ctx.createGain();
  g.gain.value = 0;
  src.connect(lp);
  lp.connect(g);
  g.connect(sound.sfx);
  src.start();
  sound.water = g;
}

// Bolhas do fio de água para os próximos instantes
function trickle(now) {
  const ctx = sound.ctx;
  const n = floor(random(1, 4));
  for (let k = 0; k < n; k++) {
    const t = now + random(0.02, 0.15);
    const f = random(500, 1100);
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * random(1.4, 1.9), t + 0.05);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(random(0.012, 0.028), t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    o.connect(g);
    g.connect(sound.sfx);
    o.start(t);
    o.stop(t + 0.08);
  }
}

// Liga ou desliga a água e baixa a música enquanto se rega
let wateringNow = false;
function setWateringSound(on) {
  if (on === wateringNow || !sound.water) return;
  wateringNow = on;
  const t = sound.ctx.currentTime;
  sound.water.gain.setTargetAtTime(on ? 0.05 : 0, t, on ? 0.12 : 0.35);
  sound.music.gain.setTargetAtTime(on ? MUSIC_VOL * MUSIC_DUCK : MUSIC_VOL, t, on ? 0.3 : 0.8);
}
