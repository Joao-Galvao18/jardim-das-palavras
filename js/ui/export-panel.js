// Painel do postal

function setupExportPanel() {
  const bgIn = document.getElementById('bgCol');
  const inkIn = document.getElementById('inkCol');
  const bgHexIn = document.getElementById('bgHex');
  const inkHexIn = document.getElementById('inkHex');
  const saveBtn = document.getElementById('saveBtn');
  const note = document.getElementById('portraitNote');
  const modeBtns = document.querySelectorAll('#bgMode [data-mode]');
  const portraitBtn = document.querySelector('#bgMode [data-mode="portrait"]');
  const pc = { mode: 'color', img: null, frame: 'none' };
  const NO_PORTRAIT = 'sem retrato disponível para este autor';

  const pdfBtn = document.getElementById('dlPdf');
  const preview = document.getElementById('preview');

  // Retrato atual
  const currentPortrait = () => (pc.mode === 'portrait' ? pc.img : null);
  // Cor de fundo (nenhuma se for transparente)
  const currentBg = () => (pc.mode === 'clear' ? null : bgIn.value);

  // Guardar
  // Botão guardar
  const saveKey = () => [bgIn.value, inkIn.value, pc.mode, pc.frame].join('|');
  const updateSaveBtn = () => {
    const saved = !!(plant.savedKeys && plant.savedKeys.has(saveKey()));
    saveBtn.classList.toggle('saved', saved);
    saveBtn.disabled = saved;
    saveBtn.textContent = saved ? 'guardado ✓' : 'guardar nos resultados ♡';
  };

  // Redesenha a pré-visualização
  const refresh = () => {
    renderPostcard(postcardTwin(plant), currentBg(), inkIn.value, currentPortrait(), pc.frame);
    updateSaveBtn();
  };

  // Cores
  const setColour = (input, hexIn, hex) => {
    input.value = hex.toLowerCase();
    hexIn.value = hex.toUpperCase();
  };

  // Lê um código hex
  const parseHex = (v) => {
    v = v.trim().replace(/^#?/, '#');
    if (/^#[0-9a-f]{3}$/i.test(v)) v = '#' + [...v.slice(1)].map((c) => c + c).join('');
    return /^#[0-9a-f]{6}$/i.test(v) ? v : null;
  };

  for (const [input, hexIn] of [[bgIn, bgHexIn], [inkIn, inkHexIn]]) {
    input.addEventListener('input', () => { hexIn.value = input.value.toUpperCase(); refresh(); });
    hexIn.addEventListener('input', () => {
      const v = parseHex(hexIn.value);
      if (v) { input.value = v.toLowerCase(); refresh(); }
    });
    hexIn.addEventListener('blur', () => { hexIn.value = input.value.toUpperCase(); });
    hexIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') hexIn.blur(); });
  }

  // Amostras de pares de cores
  const sw = document.getElementById('swatches');
  for (const [bg, ink] of POSTCARD_SWATCHES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'swatch';
    b.style.background = bg;
    b.style.color = ink;
    b.textContent = 'a';
    b.title = `fundo ${bg} · texto ${ink}`;
    b.addEventListener('click', () => {
      setColour(bgIn, bgHexIn, bg);
      setColour(inkIn, inkHexIn, ink);
      refresh();
    });
    sw.appendChild(b);
  }

  // Fundo
  const setMode = (mode) => {
    pc.mode = mode;
    modeBtns.forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
    document.getElementById('bgPicker').classList.toggle('off', mode !== 'color');
    preview.classList.toggle('clear', mode === 'clear');
    pdfBtn.disabled = mode === 'clear';
    pdfBtn.title = mode === 'clear' ? 'o PDF não guarda transparência' : '';
  };

  modeBtns.forEach((b) => b.addEventListener('click', () => {
    if (b.disabled) return;

    // Cor
    if (b.dataset.mode === 'color') {
      setMode('color');
      note.textContent = portraitBtn.disabled ? NO_PORTRAIT : '';
      refresh();
      return;
    }

    // Transparente
    if (b.dataset.mode === 'clear') {
      setMode('clear');
      note.textContent = 'fundo transparente · só em PNG';
      refresh();
      return;
    }

    // Retrato
    setMode('portrait');
    if (luminance(inkIn.value) < 0.5) setColour(inkIn, inkHexIn, '#F3EEE4');
    const author = plant.poem.author;
    note.textContent = 'a carregar o retrato…';
    refresh();
    loadPortrait(author).then((img) => {
      if (pc.mode !== 'portrait' || plant.poem.author !== author) return;
      if (!img) {
        note.textContent = 'retrato indisponível (sem ligação à internet?)';
        setMode('color');
      } else {
        pc.img = img;
        const who = HETERONYMS.includes(author) ? `Fernando Pessoa (${author})` : author;
        note.textContent = `retrato de ${who} · Wikipédia / Wikimedia Commons`;
      }
      refresh();
    });
  }));

  // Moldura
  const frameBox = document.getElementById('frames');
  const setFrame = (key) => {
    pc.frame = key;
    frameBox.querySelectorAll('[data-frame]').forEach((b) => b.classList.toggle('active', b.dataset.frame === key));
  };
  for (const [key, f] of Object.entries(FRAMES)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pill small frame-opt';
    b.dataset.frame = key;
    b.textContent = f.label;
    b.title = key === 'none' ? 'sem moldura' : `moldura ${f.label}`;
    b.addEventListener('click', () => { setFrame(key); refresh(); });
    frameBox.appendChild(b);
  }

  // Abrir o painel
  document.getElementById('exportBtn').addEventListener('click', () => {
    const cur = THEMES[themeName];
    setColour(bgIn, bgHexIn, toHex(cur.paper));
    setColour(inkIn, inkHexIn, toHex(cur.ink));
    setMode('color');
    setFrame('none');
    pc.img = null;
    const hasPortrait = !!PORTRAIT_PAGES[plant.poem.author] && !plant.poem.custom;
    portraitBtn.disabled = !hasPortrait;
    note.textContent = hasPortrait ? '' : NO_PORTRAIT;
    setModal('export', true);
    refresh();
  });

  // Guardar e exportar
  saveBtn.addEventListener('click', () => {
    if (saveBtn.disabled) return;
    if (saveCurrentPostcard(currentBg(), inkIn.value, pc.mode, pc.img, pc.frame)) {
      plant.savedKeys = plant.savedKeys || new Set();
      plant.savedKeys.add(saveKey());
      updateSaveBtn();
    } else {
      saveBtn.textContent = 'não foi possível guardar';
      setTimeout(updateSaveBtn, 2200);
    }
  });

  document.getElementById('dlPng').addEventListener('click', () => {
    const tw = postcardTwin(plant);
    renderPostcard(tw, currentBg(), inkIn.value, currentPortrait(), pc.frame);
    downloadPNG(postcardName(tw, 'png'));
  });

  if (!window.jspdf) pdfBtn.style.display = 'none';
  pdfBtn.addEventListener('click', () => {
    if (pdfBtn.disabled) return;
    const tw = postcardTwin(plant);
    renderPostcard(tw, currentBg(), inkIn.value, currentPortrait(), pc.frame);
    downloadPDF(postcardName(tw, 'pdf'));
  });
}
