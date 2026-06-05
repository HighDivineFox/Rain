# Save and offline progress layer

This stacked PR describes the next implementation step after the calm garden idle core loop.

## Goal

Make the calm garden feel like an idle game that continues to exist between visits.

## Proposed behavior

- Save the player's water total and upgrade levels to `localStorage`.
- Save `lastSavedAt` as a timestamp.
- Auto-save every 10 seconds and whenever an upgrade is purchased.
- On page load, calculate elapsed offline time.
- Award offline water from passive production only, using `Mist Catcher` as the main offline generator.
- Cap offline gains to 8 hours so the game does not run away too quickly.
- Show a small welcome-back message, for example:

```text
While you were away, the garden gathered 1.2k water.
```

## Implementation notes

Suggested state shape:

```js
const SAVE_KEY = 'rainGardenSave:v1';

const state = {
  water: 0,
  upgrades: { clouds: 0, ripples: 0, mist: 0 },
  lastSavedAt: Date.now()
};
```

Suggested functions:

```js
function saveGame() {
  state.lastSavedAt = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return;

  const saved = JSON.parse(raw);
  Object.assign(state, saved, {
    upgrades: { ...state.upgrades, ...saved.upgrades }
  });

  const elapsedSeconds = Math.min(
    8 * 60 * 60,
    Math.max(0, (Date.now() - saved.lastSavedAt) / 1000)
  );

  const offlineWater = passivePerSecond() * elapsedSeconds;
  state.water += offlineWater;
}
```

## Review checklist

- Refreshing the page preserves water and upgrades.
- Closing and reopening the page awards offline passive water.
- Bad/corrupt save data does not break the page.
- Mobile layout still shows the stats and shop panels.
- There is a way to reset progress during development.
