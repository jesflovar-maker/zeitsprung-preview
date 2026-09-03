/* ZEITSPRUNG V2 — js/zt-paths.js
   ============================================================================
   ZT_PATHS — the ONE base-path authority for every JS module that needs to
   resolve a MASTER-only asset family (03_ASSETS/**, 02_CONTENT/**) from the
   browser, instead of hardcoding an absolute-from-server-root string like
   "/03_ASSETS/..." (works only on localhost:8020, served from the
   ZEITSPRUNG_MASTER filesystem root — breaks under any other base path,
   e.g. GitHub Pages' "/zeitsprung-preview/" subpath).

   WHY THIS NEEDS ONE REAL ENVIRONMENT BRANCH (not just a relative string)
   ---------------------------------------------------------------------------
   assets/ (the web-optimized derivative tree) lives INSIDE ZEITSPRUNG_V2/
   itself in both the local MASTER runtime and the deploy repo (the deploy
   repo IS a copy of ZEITSPRUNG_V2/ at its own root) — so a plain
   import.meta.url-relative string ("../assets/...") already resolves
   correctly in both places with zero branching (same technique zt-audio.js's
   SFX_ROOT already proved correct).

   03_ASSETS/ and 02_CONTENT/, however, are NOT inside ZEITSPRUNG_V2/ in the
   MASTER runtime — they are sibling folders four levels up, at the
   ZEITSPRUNG_MASTER project root (03_ASSETS/Steinerne_Bruecke/...,
   02_CONTENT/Steinerne_Bruecke/SOURCES/...). The deploy repo cannot reach
   outside its own repo, so 01_ARCHITECTURE/scripts/zeitsprung-sync.sh copies
   only the small subset actually needed straight into the DEPLOY REPO ROOT
   (one level up from js/), not four. Those two real, different folder depths
   cannot both be satisfied by one static relative string — so this file
   contains exactly one, centralized, self-referential environment check
   (based on THIS file's own import.meta.url, never on hostname/pathname
   guessing) and every consumer below imports the already-resolved constant
   instead of repeating that branch itself.

   Once a module imports from here, moving it from the MASTER runtime into
   the deploy repo is a pure file copy — no manual sed edit of any path
   constant, which is the whole point of this file (see
   01_ARCHITECTURE/PLATFORM_ARCHITECTURE_V3.md, Section 7).
   ============================================================================ */

const SELF_URL = import.meta.url;

// The MASTER local runtime always serves this exact file from inside
// ".../04_PREVIEWS/PROTOTYPES/ZEITSPRUNG_V2/js/zt-paths.js". A deploy target
// that copies ZEITSPRUNG_V2/ to its own repo root (current: GitHub Pages
// "zeitsprung-preview") never has that path segment in this file's own URL,
// because the copy lives at "<repo-root>/js/zt-paths.js" instead. That is the
// ONLY environment signal this module uses.
const IS_MASTER_RUNTIME = SELF_URL.indexOf("/04_PREVIEWS/PROTOTYPES/ZEITSPRUNG_V2/") !== -1;

// Offsets are all anchored to THIS file's own import.meta.url — never to the
// URL of whichever HTML document happens to have imported it (that is what
// makes this safe to import from both the top-level index.html and any
// monument sub-page's index.html without a second branch per caller).
const ASSETS_ROOT = new URL(IS_MASTER_RUNTIME ? "../../../../03_ASSETS/" : "../03_ASSETS/", SELF_URL).href;
const CONTENT_ROOT = new URL(IS_MASTER_RUNTIME ? "../../../../02_CONTENT/" : "../02_CONTENT/", SELF_URL).href;
const WEB_ROOT = new URL("../assets/", SELF_URL).href; // no branch needed — see header

// STEINERNE_BRUECKE_V1/routes/ — a THIRD depth pattern, found independently
// while validating this phase's own work (js/route-map.js, not in the
// original 5-file audit list): in the MASTER runtime it is a sibling of
// ZEITSPRUNG_V2/ (two levels up from js/); in the deploy repo it is copied
// INSIDE the repo root (one level up from js/) — the same "manual relative-
// path patch per release" problem this file exists to eliminate, so it is
// fixed here too rather than left as a 6th untracked drift point.
const ROUTE_JSON_URL = new URL(
  IS_MASTER_RUNTIME
    ? "../../STEINERNE_BRUECKE_V1/routes/regensburg-main-route.json"
    : "../STEINERNE_BRUECKE_V1/routes/regensburg-main-route.json",
  SELF_URL
).href;

export const ZT_PATHS = {
  isMasterRuntime: IS_MASTER_RUNTIME,
  assetsRoot: ASSETS_ROOT,   // -> .../03_ASSETS/            (MASTER-only family)
  contentRoot: CONTENT_ROOT, // -> .../02_CONTENT/           (MASTER-only family)
  webRoot: WEB_ROOT          // -> .../ZEITSPRUNG_V2/assets/ (or deploy equivalent)
};

// ---------------------------------------------------------------------------
// Named, ready-to-use resolved constants for every currently-known consumer.
// Add new named exports here rather than re-deriving assetsRoot/contentRoot
// inline inside a consumer module — that is exactly the duplication this
// file exists to remove.
// ---------------------------------------------------------------------------

// Shared web-copy SFX/ambience library (js/zt-audio.js).
export const SFX_ROOT = WEB_ROOT + "audio/sfx";

// Steinerne Brücke — MASTER asset family (03_ASSETS/Steinerne_Bruecke/**).
export const STEINERNE_ASSET_BASE = ASSETS_ROOT + "Steinerne_Bruecke";
export const KFRAMES_MANIFEST_URL = STEINERNE_ASSET_BASE + "/2d/KFRAMES_STORY_MAP.json";
export const KFRAMES_DEFAULT_ASSET_BASE = STEINERNE_ASSET_BASE + "/2d/KFRAMES";
export const ASSET_SWAP_MANIFEST_URL = STEINERNE_ASSET_BASE + "/2d/ASSET_SWAP_MAP.json";
export const MUSEUM_CONTENT_MAP_URL = STEINERNE_ASSET_BASE + "/2d/MUSEUM_CONTENT_MAP.json";
export const STEINERNE_GLB_URL = STEINERNE_ASSET_BASE + "/3D_GLB/STEINERNE_BRUECKE_EXPLODED_MASTER_v1.glb";

// Steinerne Brücke — MASTER content family (02_CONTENT/Steinerne_Bruecke/**).
export const STEINERNE_SOURCES_URL = CONTENT_ROOT + "Steinerne_Bruecke/SOURCES/sources.json";

// Steinerne Brücke — web-optimized derivative tree (ZEITSPRUNG_V2/assets/steinerne-bruecke/**).
// Reused as-is for main.js's ASSET_BASE-for-web-media/WEB_ASSET_BASE/
// PFEILER_SLOT_BASE and museum25d.js's SLOT_BASE — all four names referred to
// this exact same folder before this file existed.
export const STEINERNE_WEB_ASSET_BASE = WEB_ROOT + "steinerne-bruecke";

// STEINERNE_BRUECKE_V1/routes/regensburg-main-route.json (js/route-map.js).
export const STEINERNE_ROUTE_JSON_URL = ROUTE_JSON_URL;

// monuments.config.json — always a sibling of ZEITSPRUNG_V2/index.html (one
// level up from js/), in BOTH the MASTER runtime and the deploy repo: the
// deploy repo IS a copy of ZEITSPRUNG_V2/ at its own root (same reasoning as
// WEB_ROOT above), so this needs no IS_MASTER_RUNTIME branch either. Added
// for js/zt-feature-flags.js (PHASE 3.0A, Section 7) — not consumed by any
// other module yet.
export const MONUMENTS_CONFIG_URL = new URL("../monuments.config.json", SELF_URL).href;
