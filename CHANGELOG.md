# Changelog

## v0.5.1

- Split `src/game.js` into focused modules for config, state, save, UI, rendering, and dev tools.
- Kept `src/game.js` as the game-loop and startup coordinator.
- Preserved the existing save key and gameplay behavior from v0.5.0.

## v0.5.0

- Refactored the game out of a single HTML file.
- Moved styling into `styles.css`.
- Moved game logic into `src/game.js`.
- Kept gameplay behavior aligned with v0.4.2.

## v0.4.2

- Added upgrade-linked visual feedback.
- Added milestone unlock toasts.

## v0.4.1

- Added progression feedback, lower starter costs, upgrade levels, and URL-gated dev tools.

## v0.4.0

- Added version display and slower rain progression.
