import { AUTOSAVE_MS, OFFLINE_CAP_SECONDS, SAVE_KEY, format, passivePerSecond } from './config.js';
import { runtime, state } from './state.js';

export function saveGame() {
  state.lastSavedAt = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  runtime.lastSavedAt = state.lastSavedAt;
}

export function loadGame(addWater, showToast) {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== 'object') return;

    state.water = Number.isFinite(saved.water) ? Math.max(0, saved.water) : 0;
    state.lifetimeWater = Number.isFinite(saved.lifetimeWater)
      ? Math.max(state.water, saved.lifetimeWater)
      : state.water;
    state.upgrades = {
      clouds: Math.max(0, Number(saved.upgrades?.clouds) || 0),
      ripples: Math.max(0, Number(saved.upgrades?.ripples) || 0),
      mist: Math.max(0, Number(saved.upgrades?.mist) || 0)
    };

    const savedAt = Number(saved.lastSavedAt) || Date.now();
    const elapsedSeconds = Math.min(OFFLINE_CAP_SECONDS, Math.max(0, (Date.now() - savedAt) / 1000));
    const offlineWater = passivePerSecond(state) * elapsedSeconds;
    if (offlineWater >= 1) {
      addWater(offlineWater, false, false);
      showToast(`While you were away, the garden gathered ${format(offlineWater)} water.`);
    }
    runtime.lastSavedAt = savedAt;
  } catch (error) {
    console.warn('Could not load save data:', error);
    showToast('Save data could not be loaded, so a fresh garden was started.');
  }
}

export function maybeAutoSave(now = Date.now()) {
  if (now - runtime.lastAutoSaveAt < AUTOSAVE_MS) return;
  saveGame();
  runtime.lastAutoSaveAt = now;
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}
