# Changelog

## 0.4.1 - Expanded inner desk and GitHub-ready pass

- Added inner Expanded navigation: overview, residents, locations, and progress pipeline.
- Cropped additional SVE portrait faces from the local installed mod: Andy, Claire, Olivia, Victor, Susan, Martin, Morris, Marlon, Magnus, Morgan, Scarlett, Isaac, Camilla, and others.
- Added a first residents book for Expanded so SVE NPC work can continue from a real visual structure.
- Added a first locations board for SVE maps: expanded valley, Highlands, Crimson Badlands, Grampleton Suburbs, and Joja route.
- Added checklist hooks for Expanded residents, location unlock review, and the future data pipeline.
- Rebuilt the GitHub-ready static folder with all current images copied through `public/game`.
- Added a universal image fallback so missing item icons in catalog/wiki views no longer render as broken images on the static site.

## 0.4.0 - vNext visual desk and Expanded foundation

- Rebuilt the top-left identity panel: removed "local helper" wording and added Stardew / Expanded mode switching.
- Added a separate Expanded workspace so modded data does not mix with the vanilla Stardew screens.
- Copied and cropped first local SVE assets into `public/game/sve`: Sophia, Lance, Apples portraits, SVE maps, Crimson Badlands map, and Aurora Vineyard deed.
- Added section hero panels to calendar, community center, fishing, farm, villagers, catalog, recipes, endgame, and perfection.
- Reduced duplicate text headers on fishing and farm screens so the pages read more like tools than repeated articles.
- Added an Expanded mod shelf for detected content mods: SVE, Ridgeside Village, East Scarp, Sword & Sorcery, Lurking in the Dark, Juliet & Jessie, Rodney O'Brien, Eli and Dylan, Leilani, and Nora.
- Kept the SMAPI/save-sync idea out of this patch; current focus is visual rebuild, interface structure, and local mod-base foundation.

## 0.3.0 - Visual and checklist systems pass

- Reworked the top date controls into a Stardew-styled date console with season tabs, day arrows, weather buttons, stage selector, search, and week label.
- Added date badges to the main date plaque so the current week and daily event state are visible without opening another screen.
- Added contextual weekly gift tracking for villagers:
  - 2 gift slots per villager per week.
  - Gift keys include stage, season, Stardew week, and villager id.
  - Birthday gift is tracked as a separate daily slot.
- Kept local-only save behavior through `localStorage`.
- Updated ESLint ignore rules so generated builds are not linted as source code.
- Preserved GitHub Pages portability with relative Vite base paths.
- Fixed the missing Leo sprite fallback so the villagers screen no longer requests a broken image.

## 0.2.0 - Game-data and visual rebuild

- Rebuilt the app from a side-menu layout into a top-tab Stardew-style interface.
- Added local generated data from unpacked Stardew Valley content.
- Added sections for calendar, community center bundles, fishing, farm, villagers, catalog, recipes, endgame, and perfection.
- Added item usage links for bundles, recipes, and villager gifts.
- Added first GitHub Pages-ready static build folder.

## 0.1.0 - Initial local companion

- Created a local Stardew Valley helper prototype.
- Added date filters, local checklists, starter pages, and generated visual assets.
