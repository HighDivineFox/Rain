import { SAVE_KEY, SETTINGS_KEY } from './config.js';
import { ui } from './ui.js';

export const settings = {
  reduceMotion: false,
  hideVersion: false,
  visualIntensity: 'normal'
};

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn(`Could not read ${key}:`, error);
    return null;
  }
}

export function loadSettings() {
  const saved = readJson(SETTINGS_KEY);
  if (!saved || typeof saved !== 'object') return;
  settings.reduceMotion = Boolean(saved.reduceMotion);
  settings.hideVersion = Boolean(saved.hideVersion);
  settings.visualIntensity = saved.visualIntensity === 'low' ? 'low' : 'normal';
}

export function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function applySettingsToDocument() {
  document.body.classList.toggle('reduce-motion', settings.reduceMotion);
  document.body.classList.toggle('hide-version', settings.hideVersion);
  document.body.dataset.visualIntensity = settings.visualIntensity;
}

export function updateSettingsUI() {
  if (!ui.reduceMotion || !ui.hideVersion || !ui.visualIntensity) return;
  ui.reduceMotion.checked = settings.reduceMotion;
  ui.hideVersion.checked = settings.hideVersion;
  ui.visualIntensity.value = settings.visualIntensity;
}

export function updateSetting(key, value) {
  if (!(key in settings)) return;
  settings[key] = value;
  saveSettings();
  applySettingsToDocument();
  updateSettingsUI();
}

export function exportSaveBundle() {
  const bundle = {
    exportedAt: new Date().toISOString(),
    game: readJson(SAVE_KEY),
    settings: readJson(SETTINGS_KEY) || { ...settings }
  };
  return JSON.stringify(bundle, null, 2);
}

export function importSaveBundle(raw) {
  const bundle = JSON.parse(raw);
  if (!bundle || typeof bundle !== 'object') throw new Error('Save data must be a JSON object.');
  if (!bundle.game || typeof bundle.game !== 'object') throw new Error('Save data is missing a game object.');
  localStorage.setItem(SAVE_KEY, JSON.stringify(bundle.game));
  if (bundle.settings && typeof bundle.settings === 'object') {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(bundle.settings));
  }
}

export function bindSettingsControls({ showToast, resetGame }) {
  if (ui.reduceMotion) ui.reduceMotion.addEventListener('change', () => updateSetting('reduceMotion', ui.reduceMotion.checked));
  if (ui.hideVersion) ui.hideVersion.addEventListener('change', () => updateSetting('hideVersion', ui.hideVersion.checked));
  if (ui.visualIntensity) ui.visualIntensity.addEventListener('change', () => updateSetting('visualIntensity', ui.visualIntensity.value));
  if (ui.exportSave) {
    ui.exportSave.addEventListener('click', async () => {
      const payload = exportSaveBundle();
      try {
        await navigator.clipboard.writeText(payload);
        showToast('Save data copied to clipboard.');
      } catch (error) {
        window.prompt('Copy your save data:', payload);
      }
    });
  }
  if (ui.importSave) {
    ui.importSave.addEventListener('click', () => {
      const raw = window.prompt('Paste exported Rain Garden save data:');
      if (!raw) return;
      try {
        importSaveBundle(raw);
        showToast('Save imported. Reloading garden...');
        setTimeout(() => window.location.reload(), 600);
      } catch (error) {
        showToast(error.message || 'Save import failed.');
      }
    });
  }
  if (ui.reset) ui.reset.addEventListener('click', () => resetGame());
}
