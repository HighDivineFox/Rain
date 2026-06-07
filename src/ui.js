import { costs, format, passivePerSecond } from './config.js';
import { gardenStage, nextMilestone, runtime, state } from './state.js';

export const ui = {
  hud: document.getElementById('hud'),
  water: document.getElementById('water'),
  waterDetail: document.getElementById('waterDetail'),
  rate: document.getElementById('rate'),
  rateDetail: document.getElementById('rateDetail'),
  stage: document.getElementById('stage'),
  stageDetail: document.getElementById('stageDetail'),
  nextMilestone: document.getElementById('nextMilestone'),
  milestoneProgress: document.getElementById('milestoneProgress'),
  saved: document.getElementById('saved'),
  toast: document.getElementById('toast'),
  reset: document.getElementById('reset'),
  devToggle: document.getElementById('devToggle'),
  devPanel: document.getElementById('devPanel'),
  devButtons: [...document.querySelectorAll('[data-dev]')],
  panelButtons: [...document.querySelectorAll('[data-panel]')],
  panels: [...document.querySelectorAll('.sheet')],
  closeButtons: [...document.querySelectorAll('[data-close]')],
  buttons: [...document.querySelectorAll('.upgrade')],
  costs: {
    clouds: document.getElementById('cloudsCost'),
    ripples: document.getElementById('ripplesCost'),
    mist: document.getElementById('mistCost')
  },
  levels: {
    clouds: document.getElementById('cloudsLevel'),
    ripples: document.getElementById('ripplesLevel'),
    mist: document.getElementById('mistLevel')
  }
};

export function setOpenPanel(panelId) {
  for (const panel of ui.panels) {
    const open = panel.id === panelId && !panel.classList.contains('open');
    panel.classList.toggle('open', open);
    panel.setAttribute('aria-hidden', String(!open));
  }
  for (const button of ui.panelButtons) {
    const expanded = document.getElementById(button.dataset.panel).classList.contains('open');
    button.setAttribute('aria-expanded', String(expanded));
  }
}

export function closePanel(panelId) {
  const panel = document.getElementById(panelId);
  panel.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
  const button = ui.panelButtons.find(item => item.dataset.panel === panelId);
  if (button) button.setAttribute('aria-expanded', 'false');
}

export function showToast(message, duration = 4800) {
  ui.toast.textContent = message;
  ui.toast.classList.add('visible');
  clearTimeout(runtime.toastTimer);
  runtime.toastTimer = setTimeout(() => ui.toast.classList.remove('visible'), duration);
}

export function pulseHud() {
  ui.hud.classList.remove('pulse');
  void ui.hud.offsetWidth;
  ui.hud.classList.add('pulse');
}

function recentRate(now) {
  runtime.recentWater = runtime.recentWater.filter(entry => now - entry.time < 5000);
  return runtime.recentWater.reduce((sum, entry) => sum + entry.amount, 0) / 5 + passivePerSecond(state);
}

function updateSavedLabel() {
  const seconds = Math.max(0, Math.floor((Date.now() - runtime.lastSavedAt) / 1000));
  ui.saved.textContent = seconds < 5 ? 'now' : `${seconds}s ago`;
}

export function updateUI(now = performance.now()) {
  const water = format(state.water);
  const rate = format(recentRate(now)) + '/s';
  const stage = gardenStage();
  const next = nextMilestone();
  ui.water.textContent = water;
  ui.waterDetail.textContent = water;
  ui.rate.textContent = rate;
  ui.rateDetail.textContent = rate;
  ui.stage.textContent = stage;
  ui.stageDetail.textContent = stage;
  ui.nextMilestone.textContent = next ? `${next.name} at ${format(next.value)}` : 'Complete';
  ui.milestoneProgress.textContent = next ? `${format(state.lifetimeWater)} / ${format(next.value)}` : `${format(state.lifetimeWater)} lifetime`;
  updateSavedLabel();
  for (const button of ui.buttons) {
    const key = button.dataset.upgrade;
    const cost = costs[key](state);
    ui.costs[key].textContent = format(cost);
    ui.levels[key].textContent = `Level ${state.upgrades[key]}`;
    button.disabled = state.water < cost;
  }
}

export function enableDevToolsIfRequested() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('dev') && window.location.hash !== '#dev') return;
  ui.devToggle.classList.add('visible');
  showToast('Dev tools enabled.');
}
