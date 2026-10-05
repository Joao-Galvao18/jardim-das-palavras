// Estado

// Cores
const C = { ...THEMES.light };
let themeName = 'light';
let themeT = 0;

// Jardim
let plant = null;
let nextPoem = null;
let drops = [];
let sparks = [];
let pollen = [];
let can;
let layout;
let windX = 0;

// Postal
let postcard = null;
let exportShown = false;

// Rato / dedo
let mouseWatering = false;
let mouseHasMoved = false;
const pointer = { x: 0, y: 0, touch: false };

// Ecrã só tátil
const TOUCH_ONLY = !!(window.matchMedia &&
  matchMedia('(pointer: coarse)').matches && !matchMedia('(any-pointer: fine)').matches);

// Hand-tracking
let video = null;
let handPose = null;
let camReady = false;
let modelReady = false;
let ml5Missing = false;
let detecting = false;
let handTarget;
const handGoal = { x: 0, y: 0 };
let lastHandSeen = -1e6;
let isPinching = false;
let handWasPinching = false;
let pinchOnUI = false;
let handHoverEl = null;
let handWasOverGarden = false;
const handCursorPos = { x: 0, y: 0 };
