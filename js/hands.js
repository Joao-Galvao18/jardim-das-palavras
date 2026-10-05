// Mão

// Liga a webcam
function initHandTracking() {
  if (typeof ml5 === 'undefined') {
    ml5Missing = true;
    return;
  }
  try {
    video = createCapture({ video: { width: 640, height: 480 }, audio: false });
    video.size(640, 480);
    video.hide();
    video.elt.addEventListener('loadeddata', () => {
      camReady = true;
      startDetection();
    });
    // Modelo HandPose
    handPose = ml5.handPose({ maxHands: 1, flipped: true }, () => {
      modelReady = true;
      startDetection();
    });
  } catch (err) {
    console.warn('Hand-tracking indisponível, a usar o rato.', err);
    ml5Missing = true;
  }
}

// Começa a deteção
function startDetection() {
  if (detecting || !camReady || !modelReady) return;
  detecting = true;
  const tick = async () => {
    try {
      gotHands(await handPose.detect(video));
    } catch (e) {}
    setTimeout(tick, HAND_INTERVAL);
  };
  tick();
}

// Keypoint por nome
function kp(hand, name, index) {
  return hand[name] || (hand.keypoints && hand.keypoints[index]);
}

// Filtro One Euro: quase sem tremor parado, pouco atraso a mexer
class OneEuro {
  constructor(minCutoff, beta, dCutoff = 1) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    this.reset();
  }

  reset() {
    this.x = null;
    this.dx = 0;
    this.t = 0;
  }

  alpha(cutoff, dt) {
    const tau = 1 / (TWO_PI * cutoff);
    return 1 / (1 + tau / dt);
  }

  filter(v, t, minCutoff = this.minCutoff) {
    if (this.x === null) {
      this.x = v;
      this.t = t;
      return v;
    }
    const dt = max(1e-3, t - this.t);
    this.t = t;
    this.dx += this.alpha(this.dCutoff, dt) * ((v - this.x) / dt - this.dx);
    const cutoff = minCutoff + this.beta * abs(this.dx);
    this.x += this.alpha(cutoff, dt) * (v - this.x);
    return this.x;
  }
}

const handFX = new OneEuro(1.1, 0.006);
const handFY = new OneEuro(1.1, 0.006);

// Gesto suavizado e confirmado
let pinchScore = 1;
let fistScore = 9;
let gestureVotes = 0;
let gestureAt = -1e6;

// Mãos detetadas
function gotHands(results) {
  if (!results || results.length === 0) return;
  const hand = results[0];
  if (hand.confidence !== undefined && hand.confidence < 0.2) return;

  const wrist = kp(hand, 'wrist', 0);
  const thumb = kp(hand, 'thumb_tip', 4);
  const indexTip = kp(hand, 'index_finger_tip', 8);
  const indexMcp = kp(hand, 'index_finger_mcp', 5);
  const midMcp = kp(hand, 'middle_finger_mcp', 9);
  if (!wrist || !thumb || !indexTip || !indexMcp || !midMcp) return;

  // Posição pelo centro da palma (não se mexe ao fechar a mão)
  const palm = [0, 5, 9, 13, 17].map((i) => hand.keypoints && hand.keypoints[i]).filter(Boolean);
  const hx = palm.reduce((s, p) => s + p.x, 0) / palm.length;
  const hy = palm.reduce((s, p) => s + p.y, 0) / palm.length;
  const vw = video.width, vh = video.height;
  const rawX = constrain(map(hx, vw * 0.12, vw * 0.88, 0, 1), 0, 1) * width;
  const rawY = constrain(map(hy, vh * 0.12, vh * 0.85, 0, 1), 0, 1) * height;

  // A mão voltou: começa onde ela está
  const now = millis();
  if (now - lastHandSeen > HAND_TIMEOUT) {
    handFX.reset();
    handFY.reset();
    handTarget.set(rawX, rawY);
    handCursorPos.x = rawX;
    handCursorPos.y = rawY;
  }

  // Pinça ou mão fechada, com médias para não piscar
  const handSize = max(1, dist(wrist.x, wrist.y, midMcp.x, midMcp.y));
  const pinch = dist(thumb.x, thumb.y, indexTip.x, indexTip.y) / handSize;
  const tips = [8, 12, 16, 20].map((i) => hand.keypoints && hand.keypoints[i]).filter(Boolean);
  const fist = tips.length
    ? tips.reduce((s, t) => s + dist(t.x, t.y, wrist.x, wrist.y), 0) / tips.length / handSize
    : 9;
  pinchScore = lerp(pinchScore, pinch, 0.55);
  fistScore = lerp(fistScore, fist, 0.55);
  const wantOn = pinchScore < 0.32 || fistScore < 1.3;
  const wantOff = pinchScore > 0.45 && fistScore > 1.5;
  gestureVotes = (isPinching ? wantOff : wantOn) ? gestureVotes + 1 : 0;
  if (gestureVotes >= 2) {
    isPinching = !isPinching;
    gestureVotes = 0;
    gestureAt = now;
  }

  // Enquanto o gesto muda, a posição fica mais presa
  const settling = gestureVotes > 0 || now - gestureAt < 250;
  const t = now / 1000;
  handGoal.x = handFX.filter(rawX, t, settling ? 0.25 : handFX.minCutoff);
  handGoal.y = handFY.filter(rawY, t, settling ? 0.25 : handFY.minCutoff);

  lastHandSeen = now;
}

// Mão como cursor
const HAND_CLICKABLE = 'button, a[href], input, textarea, select, [role="radio"]';

// Botão por baixo da mão
function clickableAt(x, y) {
  const el = document.elementFromPoint(x, y);
  if (el && el.id === 'poemGardenCanvas') return el;
  if (!el || el.tagName === 'CANVAS') return null;
  return el.closest(HAND_CLICKABLE);
}

// Painel aberto
const uiOpen = () => !!document.querySelector('.modal.open, .dialog.open');

// Destaque do botão
function setHandHover(el) {
  if (el === handHoverEl) return;
  if (handHoverEl) handHoverEl.classList.remove('hand-hover');
  handHoverEl = el;
  if (el) el.classList.add('hand-hover');
}

// Cursor da mão
function updateHandPointer(usingHand) {
  const cursor = document.getElementById('handCursor');

  // Movimento contínuo entre leituras da câmara
  const k = 1 - Math.exp(-min(0.05, deltaTime / 1000) * 16);
  handTarget.x += (handGoal.x - handTarget.x) * k;
  handTarget.y += (handGoal.y - handTarget.y) * k;

  if (!usingHand) {
    cursor.classList.remove('show');
    setHandHover(null);
    handWasPinching = pinchOnUI = false;
    if (handWasOverGarden) setGardenHover(-1);
    handWasOverGarden = false;
    return;
  }

  // Cursor
  handCursorPos.x = handTarget.x;
  handCursorPos.y = handTarget.y;
  const { x, y } = handCursorPos;
  const el = clickableAt(x, y);
  setHandHover(el);

  // Jardim de poemas
  const overGarden = !!el && el.id === 'poemGardenCanvas';
  if (overGarden) setGardenHover(gardenIndexAt(x, y));
  else if (handWasOverGarden) setGardenHover(-1);
  handWasOverGarden = overGarden;

  // Cursor
  cursor.style.transform = `translate(${x}px, ${y}px)`;
  cursor.classList.toggle('show', !!el || uiOpen());
  cursor.classList.toggle('pinch', isPinching);

  // Pinça = clique
  if (isPinching && !handWasPinching) {
    pinchOnUI = !!el || uiOpen();
    if (overGarden) {
      const i = gardenIndexAt(x, y);
      if (i >= 0) gardenPick(i);
    } else if (el) {
      if (el.matches('input, textarea, select')) el.focus();
      else el.click();
    }
  }
  if (!isPinching) pinchOnUI = false;
  handWasPinching = isPinching;
}

// Estado no rodapé
function trackerStatus(usingHand) {
  if (usingHand) return isPinching ? '● mão · a regar' : '● mão · fecha a mão para regar ou carregar';
  if (TOUCH_ONLY) return mouseWatering ? '● dedo · a regar' : '○ toca e segura para regar';
  if (ml5Missing) return '○ rato · clica para regar';
  if (!camReady) return millis() > 8000 ? '○ rato · câmara indisponível' : '○ a iniciar a câmara…';
  if (!modelReady) return '○ a carregar o handpose…';
  return '○ rato · mostra a mão à câmara';
}
