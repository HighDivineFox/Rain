import { milestones } from './config.js';

export const state = {
  water: 0,
  lifetimeWater: 0,
  upgrades: { clouds: 0, ripples: 0, mist: 0 },
  lastSavedAt: Date.now()
};

export const runtime = {
  width: 0,
  height: 0,
  dpr: Math.min(window.devicePixelRatio || 1, 2),
  drops: [],
  ripples: [],
  mist: [],
  sparks: [],
  mossPatches: [],
  flowers: [],
  ambientFireflies: [],
  cloudShapes: [],
  reeds: [],
  special: null,
  specialCooldown: 16,
  recentWater: [],
  lastSavedAt: Date.now(),
  lastAutoSaveAt: Date.now(),
  toastTimer: null,
  dropSpawnTimer: 0,
  seenMilestoneLevel: 0
};

export function milestoneLevel() {
  if (state.lifetimeWater >= 100000) return 4;
  if (state.lifetimeWater >= 10000) return 3;
  if (state.lifetimeWater >= 1000) return 2;
  if (state.lifetimeWater >= 100) return 1;
  return 0;
}

export function nextMilestone() {
  return milestones.find(m => state.lifetimeWater < m.value) || null;
}

export function gardenStage() {
  if (state.lifetimeWater >= 100000) return 'Firefly Grove';
  if (state.lifetimeWater >= 10000) return 'Moon Pond';
  if (state.lifetimeWater >= 1000) return 'Flowerbed';
  if (state.lifetimeWater >= 100) return 'Mossy Ground';
  return 'Seedbed';
}
