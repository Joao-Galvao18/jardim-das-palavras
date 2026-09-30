// Jardim

// Poemas próprios
const loadCustomPoems = () => loadList(POEMS_KEY);
const storeCustomPoems = (list) => storeList(POEMS_KEY, list);
const allPoems = () => POEMS.concat(loadCustomPoems());

// Dois poemas são o mesmo
const samePoem = (a, b) => !!a && !!b && (a === b || (a.id && a.id === b.id) ||
  (a.title === b.title && a.author === b.author && a.lines.join('\n') === b.lines.join('\n')));

// Poema de um postal guardado
const recipePoem = (r) => (typeof r.poem === 'number' ? POEMS[r.poem] : r.poem);

// Palavra-semente
// Palavra-semente
function keyWord(poem) {
  const words = poem.lines.join(' ').split(' ').map(clean).filter(Boolean);
  const fit = words.filter((w) => w.length <= SEED_CHARS);
  return (fit.length ? fit : words).reduce((a, b) => (b.length > a.length ? b : a), '');
}

// Encurta a palavra da base
const shortWord = (w) => cut(w, SEED_CHARS);

// Plantar
// Troca de poema
function requestPoem(poem) {
  if (plant && !plant.dying) {
    plant.dying = true;
    nextPoem = poem;
  } else {
    spawnPlant(poem);
  }
}

// Cria a planta do poema
function spawnPlant(poem) {
  const L = computeLayout(poem, 0);
  const chunk = L.wide ? FRAGMENT_CHARS : constrain(floor((width / 2 - 30) / 6), 12, FRAGMENT_CHARS);
  const tiers = floor(max(L.avail, L.wide ? 0 : height * 0.3) / 16);
  plant = new Plant(poem, keyWord(poem), tiers, L.plantX, chunk);
  drops = [];
  pollen = [];
  hideExport();
}

// Um poema ao acaso
function randomPoem() {
  return random(allPoems().filter((p) => !plant || !samePoem(p, plant.poem)));
}
