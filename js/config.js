// Configuração

// Tipografia
const SERIF = 'EB Garamond';
const MONO = 'DM Mono';

// Temas
const THEMES = {
  light: { paper: [255, 255, 255], ink: [17, 17, 17],    grey: [138, 138, 138], faint: [196, 196, 196] },
  dark:  { paper: [10, 10, 10],    ink: [236, 234, 228], grey: [122, 122, 122], faint: [70, 70, 70] },
};

// Planta
const STEM0 = 16;
const FRAGMENT_CHARS = 30;
const SEED_CHARS = 16;
const FLOWER_H = 168;

// Ritmo do crescimento
const DROPS_PER_TIER = 28;
const OPEN_DROPS = 220;
const GROW_LERP = 0.08;
const HEIGHT_LERP = 0.09;
const OPEN_LERP = 0.045;
const MAX_DROPS = 260;

// Flores
const FLOWERS = {
  chavetas:  'flor de chavetas',
  margarida: 'margarida',
  rosa:      'rosa',
  dente:     'dente-de-leão',
  tulipa:    'tulipa',
  girassol:  'girassol',
  lavanda:   'lavanda',
  papoila:   'papoila',
  hortensia: 'hortênsia',
  campanula: 'campânula',
  cravo:     'cravo',
  lirio:     'lírio',
  cardo:     'cardo',
  cerejeira: 'cerejeira',
  jacinto:   'jacinto',
};
const FLOWER_TYPES = Object.keys(FLOWERS);

// Estilos dos fragmentos
const WORD_STYLES = [['italic', 40], ['roman', 22], ['caps', 12], ['mono', 12], ['underline', 8], ['large', 6]];

// Glifos das partículas
const DROP_GLYPHS = ['.', ',', "'", 's', 't', 'o', '.', '.'];
const SPARK_GLYPHS = ['+', '+', '‡', '*', '+'];

// Hand-tracking
const HAND_TIMEOUT = 1500;
const HAND_HOLD = 4000;
const HAND_INTERVAL = 50;

// Poemas próprios
const MAX_VERSES = 8;
const MAX_VERSE_CHARS = 48;
const MAX_TITLE_CHARS = 32;
const MAX_AUTHOR_CHARS = 28;

// Postal A5
const PC_W = 1240, PC_H = 874;

// Molduras do postal
const FRAMES = {
  none:      { label: 'sem' },
  classica:  { label: 'clássica' },
  arabesco:  { label: 'arabesco' },
  vinhas:    { label: 'vinhas' },
  arco:      { label: 'arco' },
  filigrana: { label: 'filigrana' },
};

// Pares de cores sugeridos
const POSTCARD_SWATCHES = [
  ['#ffffff', '#111111'], ['#0a0a0a', '#eceae4'], ['#f3eee4', '#1f3a5f'],
  ['#1f3a5f', '#f3eee4'], ['#efe6d2', '#8a5a1c'], ['#0f2a1d', '#e7e2c8'],
];

// Retratos
const PORTRAIT_PAGES = {
  'Fernando Pessoa': 'Fernando_Pessoa',
  'Ricardo Reis': 'Fernando_Pessoa',
  'Álvaro de Campos': 'Fernando_Pessoa',
  'Alberto Caeiro': 'Fernando_Pessoa',
  'Luís de Camões': 'Luís_de_Camões',
  'Florbela Espanca': 'Florbela_Espanca',
  'Cesário Verde': 'Cesário_Verde',
  'Camilo Pessanha': 'Camilo_Pessanha',
  'Mário de Sá-Carneiro': 'Mário_de_Sá-Carneiro',
  'Antero de Quental': 'Antero_de_Quental',
  'Almeida Garrett': 'Almeida_Garrett',
  'Bocage': 'Manuel_Maria_Barbosa_du_Bocage',
};
const PORTRAIT_DARKEN = 0.5;
const PORTRAIT_SATURATION = 50;
const HETERONYMS = ['Ricardo Reis', 'Álvaro de Campos', 'Alberto Caeiro'];

// Armazenamento local
const STORE_KEY = 'jardim-das-palavras:resultados';
const POEMS_KEY = 'jardim-das-palavras:poemas';
const THEME_KEY = 'jardim-theme';
