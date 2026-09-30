// Menu de poemas

const poemFilter = { q: '', author: 'all' };

// Pesquisa
function matchesPoem(p) {
  const q = fold(poemFilter.q.trim());
  if (!q) return true;
  return fold(`${p.title} ${p.author} ${p.lines.join(' ')}`).includes(q);
}

// Filtros
function renderPoemChips() {
  const chips = document.getElementById('poemChips');
  chips.innerHTML = '';
  const custom = loadCustomPoems();
  const authors = [...new Set(POEMS.map((p) => p.author))].sort((a, b) => a.localeCompare(b, 'pt'));
  const options = [['all', 'todos', POEMS.length + custom.length]];
  if (custom.length) options.push(['own', 'os teus poemas', custom.length]);
  for (const a of authors) options.push([a, a, POEMS.filter((p) => p.author === a).length]);
  if (poemFilter.author === 'own' && !custom.length) poemFilter.author = 'all';

  for (const [value, label, n] of options) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (poemFilter.author === value ? ' active' : '');
    b.setAttribute('aria-pressed', String(poemFilter.author === value));
    b.textContent = `${label} `;
    const count = document.createElement('span');
    count.className = 'n';
    count.textContent = n;
    b.appendChild(count);
    b.addEventListener('click', () => {
      poemFilter.author = value;
      renderPoemChips();
      renderPoemsMenu();
    });
    chips.appendChild(b);
  }
}

// Lista de poemas
function renderPoemsMenu() {
  const list = document.getElementById('poemsList');
  list.innerHTML = '';
  let shown = 0;

  // Grupo com o nome do poeta
  const group = (name, note) => {
    const g = document.createElement('section');
    g.className = 'poet';
    const h = document.createElement('h3');
    h.textContent = name;
    g.appendChild(h);
    if (note) {
      const n = document.createElement('span');
      n.className = 'mono';
      n.textContent = note;
      g.appendChild(n);
    }
    list.appendChild(g);
    return g;
  };

  // Linha de um poema
  const item = (g, poem, extra = '', onDelete = null) => {
    const row = document.createElement('div');
    row.className = 'poem-item';
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'poem-open';
    const t = document.createElement('span');
    t.className = 't';
    t.textContent = poem.title;
    const first = document.createElement('span');
    first.className = 'mono first';
    first.textContent = poem.lines[0] + extra;
    open.append(t, first);
    open.addEventListener('click', () => {
      setModal('poems', false);
      requestPoem(poem);
    });
    row.appendChild(open);
    if (onDelete) {
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'pill small ghost';
      del.textContent = 'apagar';
      del.addEventListener('click', onDelete);
      row.appendChild(del);
    }
    g.appendChild(row);
    shown++;
  };

  // Os teus poemas
  const custom = loadCustomPoems().filter(matchesPoem);
  if (custom.length && (poemFilter.author === 'all' || poemFilter.author === 'own')) {
    const g = group('os teus poemas', 'guardados neste navegador');
    g.classList.add('own');
    for (const p of custom) {
      item(g, p, ` · ${FLOWERS[p.flower] || ''}`, async () => {
        const yes = await confirmDialog({
          title: 'Apagar este poema?',
          text: `«${p.title}», de ${p.author}, sai do jardim. Esta ação não se pode desfazer.`,
        });
        if (!yes) return;
        storeCustomPoems(loadCustomPoems().filter((x) => x.id !== p.id));
        renderPoemChips();
        renderPoemsMenu();
      });
    }
  }

  // Poetas
  const showAuthor = (a) => poemFilter.author === 'all' || poemFilter.author === a;
  const byAuthor = new Map();
  for (const p of POEMS) {
    if (!showAuthor(p.author) || !matchesPoem(p)) continue;
    if (!byAuthor.has(p.author)) byAuthor.set(p.author, []);
    byAuthor.get(p.author).push(p);
  }
  [...byAuthor.keys()].sort((a, b) => a.localeCompare(b, 'pt')).forEach((author) => {
    const g = group(author, HETERONYMS.includes(author) ? 'heterónimo de Fernando Pessoa' : '');
    byAuthor.get(author).forEach((p) => item(g, p));
  });

  // Contagem e estado vazio
  document.getElementById('poemCount').textContent = `${shown} ${shown === 1 ? 'poema' : 'poemas'}`;
  if (!shown) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'nenhum poema encontrado.';
    list.appendChild(empty);
  }
}
