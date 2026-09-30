// Tema

// Muda de tema
function setTheme(name, instant = false) {
  themeName = name;
  document.body.dataset.theme = name;
  const btn = document.getElementById('theme');
  if (btn) btn.textContent = name === 'dark' ? '◑ claro' : '◐ escuro';
  if (instant) themeT = name === 'dark' ? 1 : 0;
  try { localStorage.setItem(THEME_KEY, name); } catch (e) {}
}

// Tema inicial
function initialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch (e) {}
  return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Transição de cores
function updateThemeColours() {
  themeT = lerp(themeT, themeName === 'dark' ? 1 : 0, 0.06);
  for (const k of Object.keys(C)) C[k] = lerpArr(THEMES.light[k], THEMES.dark[k], themeT);
}
