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

  // Posição pelos nós dos dedos
  const vw = video.width, vh = video.height;
  const hx = (indexMcp.x + midMcp.x) / 2, hy = (indexMcp.y + midMcp.y) / 2;
  const nx = constrain(map(hx, vw * 0.12, vw * 0.88, 0, 1), 0, 1);
  const ny = constrain(map(hy, vh * 0.08, vh * 0.78, 0, 1), 0, 1);
  handTarget.set(nx * width, ny * height);

  // Pinça ou mão fechada
  const handSize = max(1, dist(wrist.x, wrist.y, midMcp.x, midMcp.y));
  const pinch = dist(thumb.x, thumb.y, indexTip.x, indexTip.y) / handSize;
  const tips = [8, 12, 16, 20].map((i) => hand.keypoints && hand.keypoints[i]).filter(Boolean);
  const fist = tips.length
    ? tips.reduce((s, t) => s + dist(t.x, t.y, wrist.x, wrist.y), 0) / tips.length / handSize
    : 9;
  if (!isPinching && (pinch < 0.3 || fist < 1.25)) isPinching = true;
  else if (isPinching && pinch > 0.45 && fist > 1.5) isPinching = false;

  lastHandSeen = millis();
}

// Mão como cursor
const HAND_CLICKABLE = 'button, a[href], input, textarea, select, [role="radio"]';

// Botão por baixo da mão
function clickableAt(x, y) {
  const el = document.elementFromPoint(x, y);
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
  if (!usingHand) {
    cursor.classList.remove('show');
    setHandHover(null);
    handWasPinching = pinchOnUI = false;
    return;
  }

  // Cursor suavizado
  handCursorPos.x = lerp(handCursorPos.x, handTarget.x, 0.35);
  handCursorPos.y = lerp(handCursorPos.y, handTarget.y, 0.35);
  const { x, y } = handCursorPos;
  const el = clickableAt(x, y);
  setHandHover(el);

  // Cursor
  cursor.style.transform = `translate(${x}px, ${y}px)`;
  cursor.classList.toggle('show', !!el || uiOpen());
  cursor.classList.toggle('pinch', isPinching);

  // Pinça = clique
  if (isPinching && !handWasPinching) {
    pinchOnUI = !!el || uiOpen();
    if (el) {
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
