// Formulário do poema

// Sementes das pré-visualizações
const PREVIEW_SEEDS = Array.from({ length: 64 }, (_, i) => ({ a: i * GOLDEN, len: 0.72 + rnd(i + 91) * 0.28, star: rnd(i + 57) < 0.4 }));
let flowerPreviews = null;
let poemFormTried = false;

// Lê e valida o formulário
function readPoemForm() {
  const clean1 = (s) => s.replace(/[\u0000-\u001f]/g, '').trim().replace(/\s+/g, ' ');
  const title = clean1(document.getElementById('wTitle').value);
  const author = clean1(document.getElementById('wAuthor').value);
  const lines = document.getElementById('wLines').value.split('\n').map(clean1).filter(Boolean);
  const maxChars = lines.length ? max(...lines.map((l) => l.length)) : 0;
  const flower = document.querySelector('#flowerGrid [aria-checked="true"]')?.dataset.flower || null;

  const errors = [];
  if (!title) errors.push('falta o título');
  if (title.length > MAX_TITLE_CHARS) errors.push(`o título tem no máximo ${MAX_TITLE_CHARS} caracteres`);
  if (!author) errors.push('falta o autor');
  if (author.length > MAX_AUTHOR_CHARS) errors.push(`o autor tem no máximo ${MAX_AUTHOR_CHARS} caracteres`);
  if (!lines.length) errors.push('escreve pelo menos um verso');
  if (lines.length > MAX_VERSES) errors.push(`no máximo ${MAX_VERSES} versos`);
  const longChars = lines.map((l, i) => (l.length > MAX_VERSE_CHARS ? i + 1 : 0)).filter(Boolean);
  if (longChars.length) {
    const many = longChars.length > 1;
    errors.push(`${many ? 'os versos' : 'o verso'} ${longChars.join(', ')} ${many ? 'passam' : 'passa'} dos ${MAX_VERSE_CHARS} caracteres`);
  }
  if (!flower) errors.push('escolhe uma flor');

  // Sem asneiras
  const rude = [];
  if (hasProfanity(title)) rude.push('o título');
  if (hasProfanity(author)) rude.push('o autor');
  const rudeLines = lines.map((l, i) => (hasProfanity(l) ? i + 1 : 0)).filter(Boolean);
  if (rudeLines.length) rude.push(`${rudeLines.length > 1 ? 'os versos' : 'o verso'} ${rudeLines.join(', ')}`);
  if (rude.length) errors.push(`${rude.join(', ')} ${rude.length > 1 || rudeLines.length > 1 ? 'têm' : 'tem'} palavras que não são permitidas`);
  const over = lines.length > MAX_VERSES || longChars.length > 0;
  return { title, author, lines, maxChars, flower, errors, over };
}

// Grelha de flores
function buildFlowerGrid() {
  const grid = document.getElementById('flowerGrid');
  if (!flowerPreviews) {
    flowerPreviews = FLOWER_TYPES.map((type) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'flower-opt';
      b.dataset.flower = type;
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', 'false');
      const g = createGraphics(120, 120);
      g.pixelDensity(2);
      g.elt.style.display = 'block';
      const label = document.createElement('span');
      label.className = 'mono';
      label.textContent = FLOWERS[type];
      b.append(g.elt, label);
      b.addEventListener('click', () => {
        grid.querySelectorAll('.flower-opt').forEach((o) => o.setAttribute('aria-checked', String(o === b)));
        updatePoemForm();
      });
      grid.appendChild(b);
      return { type, g };
    });
  }
  const P = { ...THEMES[themeName], knock: true };
  for (const { type, g } of flowerPreviews) {
    g.clear();
    g.push();
    g.translate(60, 114);
    g.scale(0.55);
    drawFlower(g, P, { type, seeds: PREVIEW_SEEDS }, 1, 255, 0);
    g.pop();
  }
}

// Atualiza o contador e os avisos
function updatePoemForm() {
  const f = readPoemForm();
  const count = document.getElementById('wCount');
  count.textContent = `${f.lines.length} / ${MAX_VERSES} versos · verso mais longo ${f.maxChars} / ${MAX_VERSE_CHARS} caracteres`;
  count.classList.toggle('over', f.over);
  // Avisos
  const shown = poemFormTried ? f.errors : f.errors.filter((e) => /versos? \d|máximo/.test(e));
  document.getElementById('wError').textContent = shown.join(' · ');
  return f;
}

// Abre o formulário vazio
function openPoemForm() {
  document.getElementById('writeForm').reset();
  document.querySelectorAll('#flowerGrid .flower-opt').forEach((o) => o.setAttribute('aria-checked', 'false'));
  poemFormTried = false;
  document.getElementById('wLimits').textContent = `até ${MAX_VERSES} versos · ${MAX_VERSE_CHARS} caracteres por verso`;
  buildFlowerGrid();
  updatePoemForm();
  setModal('write', true);
  setTimeout(() => document.getElementById('wTitle').focus(), 50);
}

// Guarda o poema e planta-o
function submitPoemForm(e) {
  e.preventDefault();
  poemFormTried = true;
  const f = updatePoemForm();
  if (f.errors.length) return;
  const poem = {
    id: 'p' + Date.now().toString(36),
    custom: true,
    author: f.author,
    title: f.title,
    lines: f.lines,
    excerpt: false,
    flower: f.flower,
  };
  const list = loadCustomPoems();
  list.unshift(poem);
  if (!storeCustomPoems(list)) {
    document.getElementById('wError').textContent = 'não há espaço no navegador para guardar o poema';
    return;
  }
  setModal('write', false);
  setModal('poems', false);
  requestPoem(poem);
}
