/* ZEITSPRUNG V2 — _MONUMENT_SHELL/index.js
   ============================================================================
   PHASE 3.0A — Section 8. TECHNICAL SCAFFOLDING ONLY.

   WHAT THIS FOLDER IS
   ---------------------------------------------------------------------------
   `_MONUMENT_SHELL/` is the documented CONTRACT for the reusable monument
   template referenced by CLAUDE.md ("the five initial monuments must share
   one reusable monument template") and by
   01_ARCHITECTURE/PLATFORM_ARCHITECTURE_V3.md Section G's KEEP/MODIFY/REMOVE
   classification of STEINERNE_BRUECKE's current modules.

   It is NOT a working page, NOT a router, and NOT wired into any HTML file
   in this project. No file in STEINERNE_BRUECKE/ or ZEITSPRUNG_V2/index.html
   imports anything from this folder. It exists purely so a FUTURE monument
   build (Dom St. Peter, Altes Rathaus, Porta Praetoria, Neupfarrplatz) has a
   documented, consistent set of function signatures to implement against,
   instead of re-inventing the section list/order ad hoc per monument.

   THE 10 SLOTS
   ---------------------------------------------------------------------------
   Leading (prefixed with the underscore folder above) is the STEINERNE_BRUECKE
   section order PLATFORM_ARCHITECTURE_V3.md Section G already classified as
   the canonical order to KEEP: Hero/Intro -> Facts -> Historical Story ->
   K-Frames -> Timeline -> Quellen -> Technical/2.5D -> Media/Reel -> Guide ->
   Back to Index. Each slot below maps to one function stub in ./slots/.

   | # | Slot               | Stub file               | Exported function          | featureFlags key* |
   |---|---------------------|--------------------------|-----------------------------|--------------------|
   | 1 | INTRO               | slots/intro.js           | renderIntroSlot             | intro              |
   | 2 | FACTS               | slots/facts.js           | renderFactsSlot             | facts              |
   | 3 | HISTORICAL STORY    | slots/historicalStory.js | renderHistoricalStorySlot   | historical_story   |
   | 4 | KFRAMES             | slots/kframes.js         | renderKframesSlot           | kframes            |
   | 5 | TIMELINE            | slots/timeline.js        | renderTimelineSlot          | timeline           |
   | 6 | QUELLEN             | slots/sources.js         | renderSourcesSlot           | sources            |
   | 7 | TECHNICAL / 2.5D    | slots/technical25d.js    | renderTechnical25DSlot      | museum25d          |
   | 8 | MEDIA / REEL        | slots/media.js           | renderMediaSlot             | reel               |
   | 9 | GUIDE               | slots/guide.js           | renderGuideSlot             | guide              |
   |10 | BACK TO INDEX       | slots/backToIndex.js     | renderBackToIndexSlot       | (none — always on) |

   * featureFlags key = the matching key in a monument's
     monuments.config.json `featureFlags` object (see js/zt-feature-flags.js).
     `threeD` and `brueckmandl` exist in that schema but are DELIBERATELY NOT
     among these 10 slots (3D viewer and Brückmandl assistant are their own,
     separately-gated future modules — see PLATFORM_ARCHITECTURE_V3.md
     Section H and ZEITSPRUNG_WEB_OPERATING_RULES.md Sections 29/31 — folding
     them into this generic content shell would overstate their readiness).

   THE COMMON FUNCTION CONTRACT
   ---------------------------------------------------------------------------
   Every slot module exports exactly one function:

     renderXSlot(config, container) -> void

   - `config` — the plain-data object a future monument would author for that
     slot (shape intentionally undefined here — each stub documents its own
     expected shape in comments; see MONUMENT_SHELL_ONBOARDING.md for how this
     relates to monuments.config.json + a monument's own content files).
   - `container` — the DOM element the slot should render into (an actual
     future implementation would query this, e.g. `document.getElementById(...)`,
     the same way STEINERNE_BRUECKE/js/main.js already does per-section today).

   Every stub in ./slots/ is intentionally a NO-OP scaffold (console-only,
   returns null) — see each file's own header. Filling in real rendering
   logic per slot, for a real future monument, is out of scope for this
   phase (it would mean building Dom St. Peter et al., which Phase 3.0A
   explicitly does not do).
   ============================================================================ */

export { renderIntroSlot } from "./slots/intro.js";
export { renderFactsSlot } from "./slots/facts.js";
export { renderHistoricalStorySlot } from "./slots/historicalStory.js";
export { renderKframesSlot } from "./slots/kframes.js";
export { renderTimelineSlot } from "./slots/timeline.js";
export { renderSourcesSlot } from "./slots/sources.js";
export { renderTechnical25DSlot } from "./slots/technical25d.js";
export { renderMediaSlot } from "./slots/media.js";
export { renderGuideSlot } from "./slots/guide.js";
export { renderBackToIndexSlot } from "./slots/backToIndex.js";

// Ordered slot registry — documents the canonical section ORDER (Section G)
// alongside each slot's matching featureFlags key, for a future onboarding
// script/template to iterate over rather than hardcoding the list twice.
// Not consumed by any runtime code today.
export const MONUMENT_SHELL_SLOTS = [
  { slot: "INTRO", featureFlag: "intro" },
  { slot: "FACTS", featureFlag: "facts" },
  { slot: "HISTORICAL_STORY", featureFlag: "historical_story" },
  { slot: "KFRAMES", featureFlag: "kframes" },
  { slot: "TIMELINE", featureFlag: "timeline" },
  { slot: "QUELLEN", featureFlag: "sources" },
  { slot: "TECHNICAL_2_5D", featureFlag: "museum25d" },
  { slot: "MEDIA_REEL", featureFlag: "reel" },
  { slot: "GUIDE", featureFlag: "guide" },
  { slot: "BACK_TO_INDEX", featureFlag: null }
];
