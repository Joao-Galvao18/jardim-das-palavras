// Interface

function setupInterface() {
  const byId = (id) => document.getElementById(id);

  // Barra de topo
  byId('reset').addEventListener('click', () => requestPoem(randomPoem()));
  byId('theme').addEventListener('click', () => setTheme(themeName === 'dark' ? 'light' : 'dark'));
  byId('aboutBtn').addEventListener('click', () => setModal('about', true));
  byId('resultsBtn').addEventListener('click', () => {
    renderResults();
    setModal('results', true);
  });
  byId('poemsBtn').addEventListener('click', () => {
    renderPoemChips();
    renderPoemsMenu();
    setModal('poems', true);
  });

  // Pesquisa
  const search = byId('poemSearch');
  search.addEventListener('input', () => {
    poemFilter.q = search.value;
    renderPoemsMenu();
  });
  search.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && search.value) {
      e.stopPropagation();
      search.value = '';
      poemFilter.q = '';
      renderPoemsMenu();
    }
  });

  // Formulário
  byId('writeBtn').addEventListener('click', openPoemForm);
  byId('writeForm').addEventListener('submit', submitPoemForm);
  byId('writeForm').addEventListener('input', updatePoemForm);

  // Fechar painéis
  document.querySelectorAll('[data-close]').forEach((b) =>
    b.addEventListener('click', () => setModal(b.closest('.modal').id, false))
  );

  // Tecla Esc
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (dialogClose) { dialogClose(false); return; }
    const open = [...document.querySelectorAll('.modal.open')];
    if (open.length) setModal(open[open.length - 1].id, false);
  });

  // Postal e resultados
  setupExportPanel();
  updateResultsCount();
}
