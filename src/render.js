import { dropInterval, maxActiveDrops, mistVisualBoost, random, rippleVisualBoost, seededRandom, waterPerDrop } from './config.js';
import { milestoneLevel, runtime, state } from './state.js';

export const canvas = document.getElementById('rain');
export const ctx = canvas.getContext('2d');

const landingY = () => random(runtime.height * 0.66, runtime.height * 0.98);

export function buildGardenDecorations() {
  const { width, height } = runtime;
  runtime.mossPatches = Array.from({ length: 34 }, (_, index) => ({ x: seededRandom(index * 14.7 + 2) * width, y: height * (0.72 + seededRandom(index * 11.3 + 5) * 0.24), radius: 18 + seededRandom(index * 8.1 + 9) * 42, flatness: 0.22 + seededRandom(index * 4.8 + 3) * 0.18, phase: seededRandom(index * 5.2 + 1) * Math.PI * 2 }));
  runtime.flowers = Array.from({ length: 22 }, (_, index) => ({ x: seededRandom(index * 19.9 + 7) * width, y: height * (0.68 + seededRandom(index * 15.1 + 4) * 0.25), stem: 10 + seededRandom(index * 3.6 + 8) * 24, size: 3.5 + seededRandom(index * 2.7 + 6) * 4.5, phase: seededRandom(index * 6.1 + 3) * Math.PI * 2 }));
  runtime.ambientFireflies = Array.from({ length: 18 }, (_, index) => ({ x: seededRandom(index * 13.3 + 1) * width, y: height * (0.44 + seededRandom(index * 10.1 + 12) * 0.42), radius: 18 + seededRandom(index * 3.9 + 4) * 46, speed: 0.00035 + seededRandom(index * 7.7 + 8) * 0.00045, phase: seededRandom(index * 9.4 + 2) * Math.PI * 2, size: 1.1 + seededRandom(index * 5.8 + 11) * 1.9 }));
  runtime.cloudShapes = Array.from({ length: 8 }, (_, index) => ({ x: seededRandom(index * 21.1 + 4) * width, y: height * (0.08 + seededRandom(index * 17.5 + 2) * 0.16), radius: 70 + seededRandom(index * 12.8 + 6) * 130, speed: 4 + seededRandom(index * 7.4 + 5) * 8, phase: seededRandom(index * 9.8 + 3) * Math.PI * 2 }));
  runtime.reeds = Array.from({ length: 18 }, (_, index) => ({ x: seededRandom(index * 22.4 + 8) * width, y: height * (0.78 + seededRandom(index * 9.7 + 1) * 0.18), height: 18 + seededRandom(index * 6.5 + 3) * 42, phase: seededRandom(index * 3.5 + 10) * Math.PI * 2 }));
}

export function resize() {
  runtime.dpr = Math.min(window.devicePixelRatio || 1, 2);
  runtime.width = window.innerWidth;
  runtime.height = window.innerHeight;
  canvas.width = Math.floor(runtime.width * runtime.dpr);
  canvas.height = Math.floor(runtime.height * runtime.dpr);
  canvas.style.width = runtime.width + 'px';
  canvas.style.height = runtime.height + 'px';
  ctx.setTransform(runtime.dpr, 0, 0, runtime.dpr, 0, 0);
  runtime.mist = Array.from({ length: Math.max(10, Math.floor(runtime.width / 90)) }, createMist);
  buildGardenDecorations();
  runtime.drops = [];
  runtime.dropSpawnTimer = 0;
}

function createDrop() {
  const depth = random(0.35, 1);
  const impactY = landingY();
  return { x: random(-runtime.width * 0.1, runtime.width * 1.1), y: random(-runtime.height * 0.18, -28), length: random(12, 34) * depth, speed: random(210, 460) * depth, drift: random(-22, -7) * depth, alpha: random(0.14, 0.36) * depth, lineWidth: random(0.6, 1.2) * depth, depth, impactY };
}

export function spawnDrops(delta) {
  runtime.dropSpawnTimer += delta;
  const interval = dropInterval(state);
  const cap = maxActiveDrops(state);
  while (runtime.dropSpawnTimer >= interval && runtime.drops.length < cap) {
    runtime.drops.push(createDrop());
    runtime.dropSpawnTimer -= interval;
  }
  if (runtime.drops.length >= cap) runtime.dropSpawnTimer = Math.min(runtime.dropSpawnTimer, interval);
}

function createMist() {
  return { x: random(0, runtime.width), y: random(runtime.height * 0.58, runtime.height * 0.98), radius: random(90, 230), speed: random(3, 10), alpha: random(0.01, 0.027) };
}

export function createRipple(x, y, strength = 1, warm = false) {
  const boost = rippleVisualBoost(state);
  runtime.ripples.push({ x, y, radius: 1, alpha: (warm ? 0.3 : 0.18) * boost, growth: random(18, 42) * strength * boost, stretch: random(1.45, 2.15) + Math.min(0.35, state.upgrades.ripples * 0.025), warm, double: state.upgrades.ripples >= 2 && !warm });
}

export function trimActiveDrops() {
  const max = maxActiveDrops(state);
  if (runtime.drops.length > max) runtime.drops.length = max;
}

export function forceGoldenDrop() {
  runtime.special = { x: random(runtime.width * 0.15, runtime.width * 0.85), y: -80, impactY: landingY(), speed: random(160, 230), drift: random(-6, 6), length: 42, phase: 'falling', age: 0 };
}

function maybeStartSpecial(delta) {
  if (runtime.special) return;
  runtime.specialCooldown -= delta;
  if (runtime.specialCooldown > 0) return;
  if (Math.random() < delta / 190) {
    forceGoldenDrop();
    runtime.specialCooldown = random(120, 240);
  }
}

export function drawBackground(time) {
  const pulse = 0.04 + Math.sin(time * 0.00018) * 0.015;
  const gradient = ctx.createRadialGradient(runtime.width * 0.5, runtime.height * 0.18, 0, runtime.width * 0.5, runtime.height * 0.22, Math.max(runtime.width, runtime.height));
  gradient.addColorStop(0, `rgba(49, 74, 104, ${0.88 + pulse})`);
  gradient.addColorStop(0.42, 'rgba(17, 25, 35, .96)');
  gradient.addColorStop(1, 'rgba(5, 8, 12, 1)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, runtime.width, runtime.height);
}

export function drawClouds(time) {
  if (state.upgrades.clouds <= 0) return;
  const count = Math.min(runtime.cloudShapes.length, 1 + Math.floor(state.upgrades.clouds / 2));
  const alpha = Math.min(0.12, 0.025 + state.upgrades.clouds * 0.008);
  ctx.save();
  for (let i = 0; i < count; i++) {
    const cloud = runtime.cloudShapes[i];
    const x = (cloud.x + time * 0.001 * cloud.speed) % (runtime.width + cloud.radius * 2) - cloud.radius;
    const y = cloud.y + Math.sin(time * 0.0004 + cloud.phase) * 7;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, cloud.radius);
    grad.addColorStop(0, `rgba(190, 215, 235, ${alpha})`);
    grad.addColorStop(1, 'rgba(190, 215, 235, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y, cloud.radius, cloud.radius * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawWindowGlow(time) {
  const shimmer = 0.06 + Math.sin(time * 0.0005) * 0.025;
  const glow = ctx.createLinearGradient(0, 0, 0, runtime.height);
  glow.addColorStop(0, `rgba(170, 205, 235, ${shimmer})`);
  glow.addColorStop(0.5, 'rgba(170, 205, 235, .015)');
  glow.addColorStop(1, 'rgba(170, 205, 235, .03)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, runtime.width, runtime.height);
}

export function drawMist(delta) {
  for (const cloud of runtime.mist) {
    cloud.x += cloud.speed * delta * mistVisualBoost(state);
    if (cloud.x - cloud.radius > runtime.width) {
      cloud.x = -cloud.radius;
      cloud.y = random(runtime.height * 0.58, runtime.height * 0.98);
    }
    const gradient = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.radius);
    gradient.addColorStop(0, `rgba(180, 210, 230, ${cloud.alpha * mistVisualBoost(state)})`);
    gradient.addColorStop(1, 'rgba(180, 210, 230, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawGarden(time) {
  const level = milestoneLevel();
  ctx.save();
  if (state.upgrades.mist > 0) drawMistCatchers(time);
  if (level >= 1) drawMoss(time);
  if (level >= 3) drawPond(time);
  if (level >= 2) drawFlowers(time);
  if (level >= 4) drawFireflies(time);
  ctx.restore();
}

function drawMistCatchers(time) {
  const count = Math.min(runtime.reeds.length, 3 + state.upgrades.mist * 2);
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const reed = runtime.reeds[i];
    const sway = Math.sin(time * 0.001 + reed.phase) * 4;
    ctx.strokeStyle = 'rgba(135, 170, 138, .22)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(reed.x, reed.y);
    ctx.quadraticCurveTo(reed.x + sway, reed.y - reed.height * 0.55, reed.x + sway * 1.4, reed.y - reed.height);
    ctx.stroke();
    ctx.fillStyle = 'rgba(190, 215, 180, .18)';
    ctx.beginPath();
    ctx.ellipse(reed.x + sway * 1.5, reed.y - reed.height, 4, 9, sway * 0.03, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawMoss(time) {
  for (const moss of runtime.mossPatches) {
    const pulse = 0.85 + Math.sin(time * 0.001 + moss.phase) * 0.15;
    ctx.fillStyle = `rgba(80, 132, 100, ${0.075 * pulse})`;
    ctx.beginPath();
    ctx.ellipse(moss.x, moss.y, moss.radius, moss.radius * moss.flatness, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPond(time) {
  const pond = ctx.createRadialGradient(runtime.width * 0.5, runtime.height * 0.9, 0, runtime.width * 0.5, runtime.height * 0.9, Math.max(runtime.width, runtime.height) * 0.42);
  const shimmer = 0.1 + Math.sin(time * 0.0007) * 0.035;
  pond.addColorStop(0, `rgba(118, 178, 202, ${shimmer})`);
  pond.addColorStop(0.55, 'rgba(80, 130, 160, 0.045)');
  pond.addColorStop(1, 'rgba(80, 130, 160, 0)');
  ctx.fillStyle = pond;
  ctx.beginPath();
  ctx.ellipse(runtime.width * 0.5, runtime.height * 0.9, runtime.width * 0.46, runtime.height * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawFlowers(time) {
  for (const flower of runtime.flowers) {
    const sway = Math.sin(time * 0.0012 + flower.phase) * 2.2;
    ctx.strokeStyle = 'rgba(112, 168, 126, 0.28)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(flower.x, flower.y);
    ctx.quadraticCurveTo(flower.x + sway, flower.y - flower.stem * 0.55, flower.x + sway * 1.4, flower.y - flower.stem);
    ctx.stroke();
    const bloomX = flower.x + sway * 1.4;
    const bloomY = flower.y - flower.stem;
    ctx.fillStyle = 'rgba(218, 230, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(bloomX, bloomY, flower.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 227, 155, 0.24)';
    ctx.beginPath();
    ctx.arc(bloomX, bloomY, flower.size * 0.42, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFireflies(time) {
  for (const fly of runtime.ambientFireflies) {
    const angle = time * fly.speed + fly.phase;
    const x = fly.x + Math.cos(angle) * fly.radius;
    const y = fly.y + Math.sin(angle * 0.8) * fly.radius * 0.38;
    const alpha = 0.22 + Math.sin(time * 0.003 + fly.phase) * 0.16;
    ctx.fillStyle = `rgba(255, 230, 150, ${Math.max(0.06, alpha)})`;
    ctx.beginPath();
    ctx.arc(x, y, fly.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawDrops(delta, addWater) {
  ctx.lineCap = 'round';
  for (let i = runtime.drops.length - 1; i >= 0; i--) {
    const drop = runtime.drops[i];
    const previousY = drop.y;
    const previousX = drop.x;
    drop.x += drop.drift * delta;
    drop.y += drop.speed * delta;
    if (previousY < drop.impactY && drop.y >= drop.impactY) {
      const t = (drop.impactY - previousY) / Math.max(drop.y - previousY, 0.001);
      const impactX = previousX + (drop.x - previousX) * t;
      addWater(waterPerDrop(state));
      createRipple(impactX, drop.impactY, 0.75 + drop.depth * 0.7);
      runtime.drops.splice(i, 1);
      continue;
    }
    if (drop.y > runtime.height + 80 || drop.x < -160 || drop.x > runtime.width + 160) {
      runtime.drops.splice(i, 1);
      continue;
    }
    const gradient = ctx.createLinearGradient(drop.x, drop.y - drop.length, drop.x + drop.drift * 0.04, drop.y);
    gradient.addColorStop(0, 'rgba(205, 226, 242, 0)');
    gradient.addColorStop(0.45, `rgba(205, 226, 242, ${drop.alpha})`);
    gradient.addColorStop(1, 'rgba(205, 226, 242, 0)');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = drop.lineWidth;
    ctx.beginPath();
    ctx.moveTo(drop.x, drop.y - drop.length);
    ctx.lineTo(drop.x + drop.drift * 0.055, drop.y);
    ctx.stroke();
  }
}

export function drawRipples(delta) {
  for (let i = runtime.ripples.length - 1; i >= 0; i--) {
    const ripple = runtime.ripples[i];
    ripple.radius += ripple.growth * delta;
    ripple.alpha -= (ripple.warm ? 0.07 : 0.12) * delta;
    if (ripple.alpha <= 0) {
      runtime.ripples.splice(i, 1);
      continue;
    }
    ctx.strokeStyle = ripple.warm ? `rgba(255, 219, 139, ${ripple.alpha})` : `rgba(185, 220, 240, ${ripple.alpha})`;
    ctx.lineWidth = ripple.warm ? 1.4 : 1 + Math.min(0.8, state.upgrades.ripples * 0.08);
    ctx.beginPath();
    ctx.ellipse(ripple.x, ripple.y, ripple.radius * ripple.stretch, ripple.radius * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();
    if (ripple.double) {
      ctx.strokeStyle = `rgba(185, 220, 240, ${ripple.alpha * 0.42})`;
      ctx.beginPath();
      ctx.ellipse(ripple.x, ripple.y, ripple.radius * ripple.stretch * 1.34, ripple.radius * 0.58, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

export function drawSpecial(delta, addWater, pulseHud) {
  maybeStartSpecial(delta);
  if (!runtime.special) return;
  runtime.special.age += delta;
  if (runtime.special.phase === 'falling') drawFallingSpecial(delta, addWater, pulseHud);
  else drawSpecialBloom(delta);
}

function drawFallingSpecial(delta, addWater, pulseHud) {
  const special = runtime.special;
  const previousY = special.y;
  special.x += special.drift * delta;
  special.y += special.speed * delta;
  const trail = ctx.createLinearGradient(special.x, special.y - special.length, special.x, special.y);
  trail.addColorStop(0, 'rgba(255, 231, 158, 0)');
  trail.addColorStop(0.55, 'rgba(255, 231, 158, .9)');
  trail.addColorStop(1, 'rgba(255, 255, 220, .1)');
  ctx.strokeStyle = trail;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(special.x, special.y - special.length);
  ctx.lineTo(special.x + special.drift * 0.08, special.y);
  ctx.stroke();
  if (previousY < special.impactY && special.y >= special.impactY) {
    addWater(waterPerDrop(state) * 90);
    pulseHud();
    special.phase = 'bloom';
    special.age = 0;
    special.y = special.impactY;
    for (let i = 0; i < 5; i++) createRipple(special.x, special.y, 1.1 + i * 0.34, true);
    runtime.sparks = Array.from({ length: 18 + milestoneLevel() * 3 }, () => ({ x: special.x, y: special.y, vx: random(-24, 24), vy: random(-52, -18), life: random(2.5, 4.8), age: 0, size: random(1.3, 2.8) }));
  }
}

function drawSpecialBloom(delta) {
  const special = runtime.special;
  const life = 5.5;
  const fade = Math.max(0, 1 - special.age / life);
  const glowRadius = 70 + special.age * 22;
  const glow = ctx.createRadialGradient(special.x, special.y, 0, special.x, special.y, glowRadius);
  glow.addColorStop(0, `rgba(255, 224, 150, ${0.22 * fade})`);
  glow.addColorStop(1, 'rgba(255, 224, 150, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(special.x, special.y, glowRadius, 0, Math.PI * 2);
  ctx.fill();
  for (let i = runtime.sparks.length - 1; i >= 0; i--) {
    const spark = runtime.sparks[i];
    spark.age += delta;
    spark.x += spark.vx * delta;
    spark.y += spark.vy * delta;
    spark.vy += 9 * delta;
    const alpha = Math.max(0, 1 - spark.age / spark.life) * 0.75;
    ctx.fillStyle = `rgba(255, 230, 150, ${alpha})`;
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
    ctx.fill();
    if (spark.age >= spark.life) runtime.sparks.splice(i, 1);
  }
  if (special.age >= life) {
    runtime.special = null;
    runtime.sparks = [];
  }
}
