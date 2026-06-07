export const SAVE_KEY = 'rainGardenSave:v1';
export const OFFLINE_CAP_SECONDS = 8 * 60 * 60;
export const AUTOSAVE_MS = 10000;

export const upgradeNames = {
  clouds: 'More Clouds',
  ripples: 'Deeper Ripples',
  mist: 'Mist Catcher'
};

export const milestones = [
  { name: 'Mossy Ground', value: 100, message: 'Moss spreads through the garden.' },
  { name: 'Flowerbed', value: 1000, message: 'Moonflowers begin to bloom.' },
  { name: 'Moon Pond', value: 10000, message: 'The pond starts to glow.' },
  { name: 'Firefly Grove', value: 100000, message: 'Fireflies arrive.' }
];

export const random = (min, max) => Math.random() * (max - min) + min;
export const seededRandom = seed => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const format = n => n < 1000
  ? Math.floor(n).toString()
  : n < 1e6
    ? (n / 1000).toFixed(1) + 'k'
    : n < 1e9
      ? (n / 1e6).toFixed(1) + 'm'
      : (n / 1e9).toFixed(1) + 'b';

export const costs = {
  clouds: state => Math.floor(12 * Math.pow(1.68, state.upgrades.clouds)),
  ripples: state => Math.floor(25 * Math.pow(1.74, state.upgrades.ripples)),
  mist: state => Math.floor(50 * Math.pow(1.86, state.upgrades.mist))
};

export const waterPerDrop = state => 1 + state.upgrades.ripples * 0.65;
export const passivePerSecond = state => state.upgrades.mist * 0.28;
export const dropInterval = state => Math.max(0.42, 3 * Math.pow(0.78, state.upgrades.clouds));
export const maxActiveDrops = state => 2 + state.upgrades.clouds * 2;
export const rippleVisualBoost = state => 1 + Math.min(0.7, state.upgrades.ripples * 0.08);
export const mistVisualBoost = state => 1 + Math.min(0.9, state.upgrades.mist * 0.09);
