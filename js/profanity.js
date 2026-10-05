// Asneiras (português e inglês)

// Palavras inteiras
const BAD_WORDS = [
  'porra', 'porras', 'puta', 'putas', 'cona', 'conas', 'cabrao', 'cabroes', 'colhoes', 'cu',
  'bosta', 'buceta', 'boceta', 'xoxota', 'viado', 'viados', 'otario', 'otarios',
  'cagalhao', 'badalhoca', 'badalhoco',
  'dick', 'dicks', 'dickhead', 'bastard', 'bastards', 'retard', 'retarded', 'fag', 'fags',
  'faggot', 'faggots', 'nigger', 'niggers', 'nigga', 'niggas', 'kike', 'chink', 'spic',
  'tranny', 'jackass', 'bollocks',
];

// Começos de palavra (apanham as variantes)
const BAD_STEMS = [
  'merd', 'caralh', 'fod', 'punhet', 'putari', 'paneleir', 'arrombad',
  'fuck', 'shit', 'bitch', 'cunt', 'whore', 'slut', 'wank', 'twat', 'pussy', 'asshole',
];

// Dentro de qualquer palavra (só as que não enganam)
const BAD_ANYWHERE = ['fuck', 'caralh', 'paneleir', 'punhet'];

// Números e símbolos usados como letras
const LEET = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', '@': 'a', $: 's', '!': 'i' };

// Minúsculas, sem acentos, sem disfarces e sem letras repetidas
const squash = (s) => s.replace(/(.)\1+/g, '$1');
function plainWords(text) {
  const s = fold(text).replace(/[013457@$!]/g, (c) => LEET[c]).replace(/[^a-z]+/g, ' ');
  return squash(s).split(' ').filter(Boolean);
}

const BAD_SET = new Set(BAD_WORDS.map(squash));
const BAD_STEMS_SQ = BAD_STEMS.map(squash);
const BAD_ANYWHERE_SQ = BAD_ANYWHERE.map(squash);

// O texto tem asneiras?
function hasProfanity(text) {
  const words = plainWords(text);

  // Letras soltas ("f u c k") contam como uma palavra
  const groups = [...words];
  let run = '';
  for (const w of words.concat([''])) {
    if (w.length === 1) run += w;
    else {
      if (run.length >= 3) groups.push(run);
      run = '';
    }
  }

  const joined = words.join('');
  return (
    groups.some((w) => BAD_SET.has(w) || BAD_STEMS_SQ.some((s) => w.startsWith(s))) ||
    BAD_ANYWHERE_SQ.some((s) => joined.includes(s))
  );
}
