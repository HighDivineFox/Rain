# Calm garden visual progression

This stacked PR defines how the rain simulation should visually evolve as the idle game progresses.

## Goal

Make upgrades and water accumulation change the scene, not just the numbers.

The game should stay calm. The visual direction should be slow, soft, and readable.

## Milestones

| Stage | Requirement | Visual change |
| --- | ---: | --- |
| Seedbed | 0 water | Bare dark ground, simple rain and ripples |
| Mossy Ground | 100 water | Low moss shapes appear near the bottom of the scene |
| Flowerbed | 1,000 water | Small moonflowers begin to bloom around ripple zones |
| Moon Pond | 10,000 water | A subtle pond glow appears in the lower half |
| Firefly Grove | 100,000 water | Fireflies drift even outside golden-drop events |

## Upgrade-linked visual changes

### More Clouds

- Increase visible rain density.
- Add slightly thicker mist at higher levels.
- Optional: add slow cloud silhouettes near the top.

### Deeper Ripples

- Increase ripple brightness slightly.
- Add a second faint ring at higher levels.
- Avoid making ripples too noisy.

### Mist Catcher

- Add gentle floating mist collectors or reed-like shapes.
- Increase passive drifting mist.

## Rare event evolution

The golden drop should become more meaningful as the garden develops.

Suggested behavior:

- Before Flowerbed: golden drop gives a water burst.
- Flowerbed and later: golden drop briefly lights nearby flowers.
- Moon Pond and later: golden drop sends a warm glow through the pond.
- Firefly Grove and later: golden drop releases extra fireflies.

## Implementation plan

1. Add a `drawGarden(now)` function between background/mist and rain.
2. Use `gardenStage()` to determine what to draw.
3. Keep generated decorative positions deterministic during a session.
4. Use soft translucent shapes rather than detailed sprites.
5. Keep all visuals canvas-based to avoid adding assets.

Suggested sketch:

```js
function drawGarden(now) {
  const stage = gardenStage();

  if (stage !== 'Seedbed') drawMoss();
  if (['Flowerbed', 'Moon Pond', 'Firefly Grove'].includes(stage)) drawFlowers(now);
  if (['Moon Pond', 'Firefly Grove'].includes(stage)) drawPondGlow(now);
  if (stage === 'Firefly Grove') drawAmbientFireflies(now);
}
```

## Balance notes

Visual milestones should trigger from lifetime or current water. Current water is simpler, but it can regress after spending. Lifetime water is better long-term.

Recommended addition for a future PR:

```js
state.lifetimeWater = 0;
```

Then increment it inside `addWater(amount)`.

## Review checklist

- Visual changes are noticeable but not distracting.
- Mobile performance remains smooth.
- Milestones are readable from the stats panel.
- The garden still feels like rain first, game second.
