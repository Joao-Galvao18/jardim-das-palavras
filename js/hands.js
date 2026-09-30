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
  handPose.detectStart(video, gotHands);
}

// Keypoint por nome
function kp(hand, name, index) {
  return hand[name] || (hand.keypoints && hand.keypoints[index]);
}

// Mãos detetadas
function gotHands(results) {
  if (!results || results.length === 0) return;
  const hand = results[0];
  if (hand.confidence !== undefined && hand.confidence < 0.5) return;

  const index = kp(hand, 'index_finger_tip', 8);
  const thumb = kp(hand, 'thumb_tip', 4);
  const wrist = kp(hand, 'wrist', 0);
  const midMcp = kp(hand, 'middle_finger_mcp', 9);
  if (!index || !thumb || !wrist || !midMcp) return;

  // Vídeo → canvas
  const vw = video.width, vh = video.height;
  const nx = constrain(map(index.x, vw * 0.12, vw * 0.88, 0, 1), 0, 1);
  const ny = constrain(map(index.y, vh * 0.1, vh * 0.8, 0, 1), 0, 1);
  handTarget.set(nx * width, ny * height);

  // Pinça
  const handSize = max(1, dist(wrist.x, wrist.y, midMcp.x, midMcp.y));
  const ratio = dist(thumb.x, thumb.y, index.x, index.y) / handSize;
  if (!isPinching && ratio < 0.28) isPinching = true;
  else if (isPinching && ratio > 0.42) isPinching = false;

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

// Webcam quase invisível
function drawVideoGhost() {
  if (!camReady || !video) return;
  const ctx = drawingContext;
  ctx.save();
  ctx.globalAlpha = 0.02;
  ctx.filter = 'grayscale(1)';
  ctx.translate(width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video.elt, 0, 0, width, height);
  ctx.restore();
}

// Estado no rodapé
function trackerStatus(usingHand) {
  if (usingHand) return isPinching ? '● mão · pinça' : '● mão · pinça para regar ou carregar';
  if (TOUCH_ONLY) return mouseWatering ? '● dedo · a regar' : '○ toca e segura para regar';
  if (ml5Missing) return '○ rato · clica para regar';
  if (!camReady) return millis() > 8000 ? '○ rato · câmara indisponível' : '○ a iniciar a câmara…';
  if (!modelReady) return '○ a carregar o handpose…';
  return '○ rato · mostra a mão à câmara';
}
