// Resultados

const loadResults = () => loadList(STORE_KEY);
const storeResults = (list) => storeList(STORE_KEY, list);

// Miniatura
function makeThumb() {
  const c = document.createElement('canvas');
  c.width = 620;
  c.height = 437;
  c.getContext('2d').drawImage(postcard.elt, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.82);
}

// Guarda o postal
function saveCurrentPostcard(bg, ink, mode, portrait, frame = 'none') {
  const twin = postcardTwin(plant);
  renderPostcard(twin, bg, ink, mode === 'portrait' ? portrait : null, frame);
  let thumb;
  try { thumb = makeThumb(); } catch (e) { return false; }
  const list = loadResults();
  list.unshift({
    id: Date.now().toString(36) + floor(random(1e4)).toString(36),
    created: Date.now(),
    poem: { author: plant.poem.author, title: plant.poem.title, lines: plant.poem.lines, excerpt: !!plant.poem.excerpt },
    word: plant.word,
    flower: plant.flower,
    seq: twin.seq,
    bg,
    ink,
    mode,
    frame,
    thumb,
  });
  const ok = storeResults(list);
  updateResultsCount();
  return ok;
}

// Contador de resultados
function updateResultsCount() {
  const n = loadResults().length;
  document.getElementById('resultsBtn').textContent = n ? `resultados · ${n}` : 'resultados';
}

// Desenha a grelha de resultados
function renderResults() {
  const grid = document.getElementById('resultsGrid');
  const list = loadResults();
  grid.innerHTML = '';

  // Sem postais
  if (!list.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.style.gridColumn = '1 / -1';
    empty.innerHTML = 'ainda não há postais.<br>rega um poema até florir e guarda-o aqui.';
    grid.appendChild(empty);
    return;
  }

  const fmt = new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  for (const r of list) {
    const poem = recipePoem(r);
    if (!poem) continue;
    grid.appendChild(resultCard(r, poem, fmt));
  }
}

// Cartão de um postal
function resultCard(r, poem, fmt) {
  const isPortrait = r.mode === 'portrait';
  const card = document.createElement('div');
  card.className = 'card';

  const img = document.createElement('img');
  img.src = r.thumb;
  img.alt = `Postal: ${poem.title}, ${poem.author}`;

  const title = document.createElement('div');
  title.className = 't';
  title.textContent = poem.title;

  // Autor, flor, data e cores
  const meta = document.createElement('div');
  meta.className = 'meta';
  const info = document.createElement('span');
  info.className = 'mono';
  info.textContent = `${poem.author} · ${FLOWERS[r.flower.type]}${isPortrait ? ' · retrato' : ''} · ${fmt.format(r.created)}`;
  const dots = document.createElement('span');
  dots.className = 'dots';
  for (const c of isPortrait ? [r.ink] : [r.bg, r.ink]) {
    const d = document.createElement('span');
    d.style.background = c;
    dots.appendChild(d);
  }
  meta.append(info, dots);

  // Botões
  const actions = document.createElement('div');
  actions.className = 'actions';
  const button = (label, cls, fn) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = cls;
    b.textContent = label;
    b.addEventListener('click', fn);
    actions.appendChild(b);
  };

  // Redesenha em alta resolução
  const redraw = async () => {
    const tw = Plant.fromRecipe(r);
    const portrait = isPortrait ? await loadPortrait(poem.author) : null;
    renderPostcard(tw, r.bg, r.ink, portrait, r.frame || 'none');
    return tw;
  };
  button('PNG ↓', 'pill small', async () => { const tw = await redraw(); downloadPNG(postcardName(tw, 'png')); });
  if (window.jspdf) button('PDF ↓', 'pill small', async () => { const tw = await redraw(); downloadPDF(postcardName(tw, 'pdf')); });
  button('apagar', 'pill small ghost', async () => {
    const yes = await confirmDialog({
      title: 'Apagar este postal?',
      text: `«${poem.title}» sai dos resultados. Esta ação não se pode desfazer.`,
    });
    if (!yes) return;
    storeResults(loadResults().filter((x) => x.id !== r.id));
    updateResultsCount();
    renderResults();
  });

  card.append(img, title, meta, actions);
  return card;
}
