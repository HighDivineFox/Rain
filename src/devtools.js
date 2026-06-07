import { nextMilestone, runtime, state } from './state.js';
import { clearSave, saveGame } from './save.js';
import { forceGoldenDrop, trimActiveDrops } from './render.js';
import { pulseHud, showToast, updateUI } from './ui.js';

export function handleDev(action, addWater, resetGame) {
  if (action === 'water100') addWater(100);
  if (action === 'water1000') addWater(1000);
  if (action === 'nextMilestone') {
    const next = nextMilestone();
    if (next) addWater(Math.max(0, next.value - state.lifetimeWater));
  }
  if (action === 'golden') forceGoldenDrop();
  if (action === 'cloud') state.upgrades.clouds += 1;
  if (action === 'ripple') state.upgrades.ripples += 1;
  if (action === 'mist') state.upgrades.mist += 1;
  if (action === 'reset') resetGame(true);

  trimActiveDrops();
  if (action !== 'reset') saveGame();
  updateUI();
  pulseHud();
  if (action !== 'reset') showToast('Dev change applied.');
}

export function resetRuntimeForNewGame() {
  state.water = 0;
  state.lifetimeWater = 0;
  state.upgrades = { clouds: 0, ripples: 0, mist: 0 };
  runtime.seenMilestoneLevel = 0;
  runtime.recentWater = [];
  runtime.drops = [];
  runtime.dropSpawnTimer = 0;
  clearSave();
}
