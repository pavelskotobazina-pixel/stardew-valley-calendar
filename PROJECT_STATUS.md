# Project Status

## v0.4.0 Direction

The project is moving from a Stardew-themed checklist toward a visual desk interface.

Current priority order:

1. Visual quality and screen identity.
2. Interface ergonomics and interaction.
3. Checklist logic.
4. Data growth from local game/mod files and wiki verification.

## Current Patch

- Removed the old "Локальный помощник" label.
- Added a Stardew / Expanded mode switch in the top identity panel.
- Expanded is intentionally separate from vanilla data.
- Copied and cropped first SVE assets from the local installed mod.
- Added large section hero panels to most vanilla tabs.
- Added a first Expanded workspace with SVE, Ridgeside Village, East Scarp, and a shelf of detected content mods.
- Added Expanded inner tabs for residents, locations, and progress pipeline.
- Added `GITHUB_DEPLOY.md` and rebuilt the static folder so the current images are included for GitHub Pages-style upload.

## Next Visual Work

- Replace remaining generic cards with stronger in-world metaphors.
- Make Community Center feel more like clickable rooms, not a list.
- Turn Villagers into a true social book with weekly gift board, birthday route, and wiki-level schedules.
- Turn Farm into a profit/season desk with clearer planting math.
- Build Expanded sub-navigation: SVE residents, SVE locations, mod quests, mod fish/items, and mod progression.

## Current Stage

The project is now a local-first Stardew Valley companion app with a stronger game-like interface, generated game data, and persistent per-browser checklist state.

The site is usable as:

- a daily Stardew planner;
- a community center bundle tracker;
- a fishing and farming reference;
- a villager gift and route helper;
- a compact item/recipe catalog;
- a late-game and perfection checklist.

## What Improved In This Pass

- The top date panel is no longer a plain web form. It now behaves like a date console with season, day, weather, stage, week, and search controls.
- Villager gift tracking now follows the intended weekly logic more closely: two gifts per week are tracked separately, and birthday gifts are separate daily checks.
- The UI has more contextual state: selected week, calm/event day, and active stage are visible from the header.
- The project is prepared for full handoff through a source archive, generated data, assets, static build, and GitHub Pages-ready folder.

## Remaining Weak Spots

- The visual style is closer to Stardew now, but several screens still rely on repeated card grids.
- The farm page needs deeper profit math, seed source details, and animal/building planning.
- The villager page should eventually show map-like daily routes instead of only timeline rows.
- Endgame should be expanded into separate subtabs for Ginger Island, walnuts, volcano, Qi, obelisks, and perfection preparation.
- The app bundle is large because the generated game database is bundled directly into the client.

## Recommended Next Direction

1. Build stronger per-section layouts instead of one repeated card system.
2. Add visual route maps for villagers and endgame progression.
3. Add calculators: crop profit, keg/preserve value, greenhouse layout, fish pond planning, and perfection remaining cost.
4. Split generated data into lazy-loaded chunks if public deployment performance becomes important.
5. Continue replacing generic cards with in-game objects: books, boards, maps, drawers, chests, signs, and recipe pages.

## Data Notes

The generated data comes from local Stardew Valley content files where possible, then the interface is structured around wiki-verified gameplay concepts. Local checklist progress is stored in each user's browser through `localStorage`.
