/* ZEITSPRUNG V2 — bruckmandl.js
   ============================================================================
   BRUCKMANDL MODULE — first visible local preview.

   Replaces the former "Brückmandl — IN ARBEIT" placeholder note that used to
   live in #historicalReel. Not yet linked from monuments.config.json's
   featureFlags.brueckmandl and not yet wired to the museum25d hotspot
   extension point — this is the module rendering into its reserved DOM slot
   (#bruckmandl) for local owner review only.

   WHAT THIS FILE OWNS
   --------------------
     - the canonical WEB asset base + flat id -> filename maps for every
       asset category (hero/ gallery/ cutouts/ video/ materials/ ai/),
       exactly as before this preview step
     - rendering all of it into the DOM host it is given, using the SAME
       el()/pick() helper convention as kframes-gallery.js
     - fetching 02_CONTENT/Steinerne_Bruecke/SOURCES/sources.json (via
       STEINERNE_SOURCES_URL, the SAME constant kframes-gallery.js already
       uses) and rendering only the three sources this module's own
       committed content cites (Q004/Q005/Q006) in a Quellen dialog that
       mirrors .kf__sources-btn/.kf__sources-panel's markup/behavior
     - a refreshLabels() method (mirrors museum25d.js/kframes-gallery.js's
       own museumApi/kframesApi.refreshLabels()) so a DE/EN/ES language
       switch re-renders this module's text without reloading the page

   AI GUIDE — CLOSED INTERACTIVE DEMO, GLOBAL CORE (this phase)
   -------------------------------------------------------
     - renderAssistant() renders a small, CLOSED interactive prototype: a
       WELCOME->IDLE entry sequence, a typed free-text input, a fixed panel
       of 8 pre-written suggestion questions, and — on selection or a typed
       match — a TALK/POINT pose plus one pre-written answer. This is NOT
       an open chatbot: no external AI API, no free-form generation, no
       backend, no state persisted beyond the current DOM (a language
       switch fully re-renders and resets it).
     - The QA content itself (question/answer text, topic ids, pose/
       evidence metadata, the deterministic keyword intent matcher) now
       lives in the SINGLE canonical ../../js/bruckmandl-guide-core.js,
       shared verbatim with the INDEX page's persistent global assistant
       bar (js/index-main.js) — a typed question here and the equivalent
       typed question on INDEX produce the exact same answer. See that
       file's header for the full provenance note. No historical claim was
       altered by this move; NEEDS_REVIEW material (current figure's
       material, heraldic shield identity) is always presented as
       unresolved, never as fact.
     - no read or write of monuments.config.json's featureFlags.brueckmandl
     - no wiring into museum25d.js's HOTSPOTS extension point
     - no historical claim beyond what
       02_CONTENT/Steinerne_Bruecke/SOURCES/CLAIM_SOURCE_MAP.json already
       registers as SUPPORTED, or (for the legend/interpretation content)
       what it registers under content_type: LEGEND / INTERPRETATION — every
       string used here lives in js/i18n.js's bruckmandl* keys, sourced from
       the already-committed 02_CONTENT/Steinerne_Bruecke/Bruckmandl/*
       content files, never invented in this render layer

   ASSISTANT V1 — PROVIDER ABSTRACTION (this phase)
   -------------------------------------------------
     - renderAssistant() no longer calls bruckmandl-guide-core.js's
       matchBruckmandlIntent()/BRUCKMANDL_QA/BRUCKMANDL_TOPIC_POSE/
       BRUCKMANDL_TOPIC_STATUS directly. It now resolves every suggested
       question and every answer through
       ../../js/bruckmandl-knowledge-provider.js's LocalValidatedProvider —
       the sole V1 implementation of the BrueckmandlKnowledgeProvider
       interface (getSuggestedTopics/answerTopic/answerFreeText). This is a
       pure call-site change: DOM structure, pose/crossfade timing,
       button/answer-card rendering and CSS are all untouched. A future
       AIProvider implementing the same 3-method interface could be swapped
       in later without touching this file's rendering code, provided it
       obeys the same NO_SOURCE = NO_HISTORICAL_CLAIM rule.

   HOTSPOT BRIDGE WIRING (this phase)
   -------------------------------------------------
     - museum25d.js's HOTSPOTS extension point is still untouched/unused
       (that file implements zero tap-hotspots by design — Group B, not
       this task's concern). What IS new: a small, real set of already-
       existing cutout/material media cards (HOTSPOT_ENABLED_CUTOUT_IDS /
       HOTSPOT_ENABLED_MATERIAL_IDS above) now dispatch
       BRUCKMANDL_HOTSPOT_EVENT (a plain DOM CustomEvent, id-only, no QA
       content) on click/tap. STEINERNE_BRUECKE/js/bruckmandl-hotspot-
       bridge.js listens for that event elsewhere, resolves the id to one
       of the 8 real canonical topics, and calls this module's own exposed
       answerTopic(topic) (see initBruckmandl()'s return value below) —
       which reuses renderAssistant()'s existing answerTopic()/showAnswer()
       verbatim. This file never imports the bridge's topic map and the
       bridge never imports this file, by design (no circular dependency —
       see the bridge file's own header).

   DUAL PREMIUM INTERACTIVE MUSEUM GALLERY (this phase)
   -------------------------------------------------
     - GALLERY 01 (renderArtifactViewer()) turns the former separate hero
       image + independent 4-view scroll strip into ONE connected cinematic
       artifact viewer: a shared crossfade stage (createCrossfadeStage()),
       a premium indexed view selector (FRONT/BACK/SIDE/INSCRIPTION), a
       restrained pointer-driven tilt/parallax/breathing loop
       (startHeroMotion()), and gold hotspot dots at visually-measured
       positions (HERO_VIEW_HOTSPOTS) reusing the EXACT existing
       BRUCKMANDL_HOTSPOT_EVENT chain — no new event, no duplicated QA.
     - GALLERY 02 (renderExplodedCollection()) replaces the old uniform
       renderMediaStrip() grid for BOTH materials and cutouts with an
       asymmetric editorial layout (see css/style.css's .bruckmandl__exploded
       rules) plus lift/tilt/zoom hover motion and a GSAP ScrollTrigger
       stagger entrance (revealOnScroll()). hotspotIds keeps its previous
       meaning/behavior unchanged; non-hotspot pieces open INSPECTION MODE.
     - INSPECTION MODE (openInspection()/closeInspection()) is a single
       shared fullscreen piece viewer used by both galleries (never a second,
       bespoke lightbox): prev/next, Escape, arrow keys, touch swipe, and an
       optional "ask" affordance for hotspot-enabled items that dispatches
       the SAME BRUCKMANDL_HOTSPOT_EVENT — never a second QA path.
     - Cross-gallery connection: a Gallery 01 hero hotspot also briefly
       highlights (highlightExplodedPiece()) its corresponding Gallery 02
       cutout piece, purely as a same-page visual echo — no forced
       navigation, no invented association beyond the 3 ids that already
       have a real 1:1 cutout match (figure, shield_panel_keys,
       shield_panel_lion_with_cap).
     - No new historical content anywhere in this phase: every name/category
       string still comes from js/i18n.js's existing bruckmandlCutoutLabels/
       bruckmandlMaterialLabels/bruckmandlGalleryLabel* keys; the only NEW
       i18n keys added (bruckmandlInspectPrev/Next/Close/Open, all 3
       languages) are functional UI microcopy, not historical claims.
   06G.2B.2 (2026-11-19) — FINAL SCROLL CONVERSION. Gallery 01's tabbed
   viewer (auto-rotation, crossfade, tilt), Gallery 02's card grids and the
   module's own Inspection Mode are RETIRED. Views and parts/material details
   are now vertical cinematic scroll stages (renderViewsScroll() /
   renderDetailsScroll()); enlarging uses the platform's single shared
   zs-viewer (openBruckmandlPhoto()). Hotspot ids, the hotspot event, the
   assistant reactions and every text string are unchanged. The notes above
   describe the earlier implementation and are kept for history only.
   ============================================================================ */

import { STEINERNE_BRUCKMANDL_ASSET_BASE, STEINERNE_SOURCES_URL } from "../../js/zt-paths.js";
import { openPhoto } from "../../js/zs-media-viewer.js"; // 06G.2B.2: the ONE shared viewer (same URL as main.js / craft-gallery.js)
import {
  BRUCKMANDL_STATUS_LABELS,
  BRUCKMANDL_UI_LABELS,
  // Technical DOM event name only (not QA/provider data) — shared with
  // bruckmandl-hotspot-bridge.js via this common, neutral core file so
  // neither feature module has to import the other directly (see that
  // bridge file's header for the full no-circular-dependency rationale).
  BRUCKMANDL_HOTSPOT_EVENT
} from "../../js/bruckmandl-guide-core.js";
// Answer resolution now goes exclusively through the
// BrueckmandlKnowledgeProvider abstraction (LocalValidatedProvider is V1's
// only implementation) — this module no longer imports the QA data/matcher
// directly, so it never depends on where the answers actually come from.
import { LocalValidatedProvider } from "../../js/bruckmandl-knowledge-provider.js";

export const BRUCKMANDL_ASSET_BASE = STEINERNE_BRUCKMANDL_ASSET_BASE;
const SOURCES_URL = STEINERNE_SOURCES_URL;

// Only the sources this module's own committed content (Section I in
// 02_CONTENT/Steinerne_Bruecke/Bruckmandl/{DE,EN,ES}/bruckmandl_content_*.md)
// actually cites — never the full registry, and never Q008 (explicitly
// NOT DIRECTLY CONSULTED, not visitor-facing).
const BRUCKMANDL_SOURCE_IDS = ["Q004", "Q005", "Q006"];

function resolveAsset(subfolder, filename) {
  return `${BRUCKMANDL_ASSET_BASE}/${subfolder}/${filename}`;
}

function el(tag, className, attrs) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (attrs) Object.keys(attrs).forEach((k) => node.setAttribute(k, attrs[k]));
  return node;
}

// ---------------------------------------------------------------------------
// Hero / master monument image — assets/steinerne-bruecke/bruckmandl/hero/
// ---------------------------------------------------------------------------
const HERO_ASSET = {
  id: "master_front",
  file: "bruckmandl_monument_master_front.webp"
};

// ---------------------------------------------------------------------------
// Four-view gallery — assets/steinerne-bruecke/bruckmandl/gallery/
// labelKey points at the matching js/i18n.js key for each view's caption.
// ---------------------------------------------------------------------------
const GALLERY_ASSETS = [
  { id: "front", file: "bruckmandl_gallery_01_front.webp", labelKey: "bruckmandlGalleryFront" },
  { id: "back", file: "bruckmandl_gallery_02_back.webp", labelKey: "bruckmandlGalleryBack" },
  { id: "side_blank", file: "bruckmandl_gallery_03_side_blank.webp", labelKey: "bruckmandlGalleryBlank" },
  { id: "inscription", file: "bruckmandl_gallery_04_inscription.webp", labelKey: "bruckmandlGalleryInscription" }
];

// ---------------------------------------------------------------------------
// Architectural cutouts / parts — assets/steinerne-bruecke/bruckmandl/cutouts/
// id naming matches the canonical MASTER filenames 1:1 (see
// 03_ASSETS/Steinerne_Bruecke/Bruckmandl/03_PNG_CUTOUTS/) — never re-derive
// or guess a shorter id here. Labels resolved from
// t(lang, "bruckmandlCutoutLabels")[id] at render time.
// ---------------------------------------------------------------------------
const CUTOUT_ASSETS = [
  { id: "figure", file: "bruckmandl_cutout_01_figure.webp" },
  { id: "gable_cap", file: "bruckmandl_cutout_02_gable_cap.webp" },
  { id: "shield_panel_keys", file: "bruckmandl_cutout_03_shield_panel_keys.webp" },
  { id: "inscription_hand_panel", file: "bruckmandl_cutout_04_inscription_hand_panel.webp" },
  { id: "shield_panel_lion_with_cap", file: "bruckmandl_cutout_05_shield_panel_lion_with_cap.webp" },
  { id: "capital_cornice", file: "bruckmandl_cutout_06_capital_cornice.webp" },
  { id: "column_and_base", file: "bruckmandl_cutout_07_column_and_base.webp" }
];

// ---------------------------------------------------------------------------
// Five material/detail crops — assets/steinerne-bruecke/bruckmandl/materials/
// Deliberately NOT paired with a stone-type label here — the current
// figure's material remains NEEDS_REVIEW in CLAIM_SOURCE_MAP.json
// (bruckmandl_material_current). Labels resolved from
// t(lang, "bruckmandlMaterialLabels")[id] at render time.
// ---------------------------------------------------------------------------
const MATERIAL_ASSETS = [
  { id: "stone_surface", file: "bruckmandl_material_01_stone_surface.webp" },
  { id: "weathering", file: "bruckmandl_material_02_weathering.webp" },
  { id: "inscription_surface", file: "bruckmandl_material_03_inscription_surface.webp" },
  { id: "relief_surface", file: "bruckmandl_material_04_relief_surface.webp" },
  { id: "column_surface", file: "bruckmandl_material_05_column_surface.webp" }
];

// ---------------------------------------------------------------------------
// HOTSPOT AFFORDANCE — which already-existing cutout/material crop ids get
// a tap/click affordance (see renderExplodedCollection() below). This list decides
// ONLY presentation (which cards look/behave tappable) — it carries no
// topic/QA meaning itself and this file never imports the real
// hotspotId -> topic map (that lives solely in
// STEINERNE_BRUECKE/js/bruckmandl-hotspot-bridge.js, to avoid a circular
// dependency between the two files — see that file's header). MUST be kept
// in manual sync with that bridge's HOTSPOT_TOPIC_MAP keys: an id enabled
// here with no matching bridge entry is a silent dead tap; an id in the
// bridge but not enabled here never becomes tappable. Both lists are small
// and reviewed together in the same delivery, so this is a deliberate,
// documented tradeoff rather than an oversight.
// ---------------------------------------------------------------------------
const HOTSPOT_ENABLED_CUTOUT_IDS = new Set(["figure", "shield_panel_keys", "shield_panel_lion_with_cap"]);
const HOTSPOT_ENABLED_MATERIAL_IDS = new Set([
  "stone_surface", "weathering", "inscription_surface", "relief_surface", "column_surface"
]);

// ---------------------------------------------------------------------------
// GALLERY 01 — CINEMATIC ARTIFACT VIEWER: hero hotspot anchors.
// Coordinates are percentages of each gallery view's own frame (all four
// GALLERY_ASSETS PNGs share the same 941x1672 canvas and the same physical
// object/camera framing), read visually off the real, already-approved
// PNGs (bruckmandl_gallery_01_front.png / _02_back.png / _03_side_blank.png
// / _04_inscription.png) — measured, not invented. ONLY hotspot ids the
// existing bridge (STEINERNE_BRUECKE/js/bruckmandl-hotspot-bridge.js's
// HOTSPOT_TOPIC_MAP) already resolves to a real topic are listed: "figure"
// is visible near the top of every view (the seated figure itself);
// "shield_panel_keys" (crossed-keys relief) is only visible on the FRONT
// view; "shield_panel_lion_with_cap" (lion relief) is only visible on the
// BACK view. The side_blank/inscription views show neither shield face, so
// they only ever get the "figure" dot. gable_cap/inscription_hand_panel/
// capital_cornice/column_and_base and the 5 material crops have no bridge
// entry and therefore never get a hero dot, per the brief's "si no existe
// mapping fiable para una zona, no mostrar hotspot" rule — see the delivery
// report for the full per-dot visual justification.
// ---------------------------------------------------------------------------
const HERO_VIEW_HOTSPOTS = {
  front: [
    { id: "figure", x: 50, y: 14 },
    { id: "shield_panel_keys", x: 50, y: 45 }
  ],
  back: [
    { id: "figure", x: 47, y: 14 },
    { id: "shield_panel_lion_with_cap", x: 50, y: 45 }
  ],
  side_blank: [
    { id: "figure", x: 49, y: 15 }
  ],
  inscription: [
    { id: "figure", x: 48, y: 12 }
  ]
};

// ---------------------------------------------------------------------------
// AI assistant character — assets/steinerne-bruecke/bruckmandl/ai/
// Full pose map kept here for future use; THIS preview renders only "idle"
// (see renderAssistant() below) — no state machine, no pose switching yet.
// ---------------------------------------------------------------------------
const AI_POSES = {
  master: "bruckmandl_ai_master.webp",
  idle: "bruckmandl_ai_idle.webp",
  welcome: "bruckmandl_ai_welcome.webp",
  point: "bruckmandl_ai_point.webp",
  talk: "bruckmandl_ai_talk.webp",
  expression_01_neutral: "bruckmandl_ai_expression_01_neutral.webp",
  expression_02_friendly: "bruckmandl_ai_expression_02_friendly.webp",
  expression_03_explain: "bruckmandl_ai_expression_03_explain.webp"
};

// ---------------------------------------------------------------------------
// AI POSE VISUAL-SCALE NORMALIZATION (2026-09-10) — pairs with
// STEINERNE_BRUECKE/css/style.css's `.bruckmandl__ai-img` rule
// (`transform: scale(var(--bruckmandl-ai-scale))`) and `.bruckmandl__ai-
// stage`'s fixed `aspect-ratio: 941 / 1672`.
//
// Root cause: the 4 pose PNGs above (idle/point/talk/welcome) are exported
// on two DIFFERENT canvas sizes — idle+point: 941x1672 (ratio 0.5628);
// talk+welcome: 1122x1402 (ratio 0.8003) — and within EACH canvas the
// character consistently occupies ~95% of that canvas's own height (the
// crops themselves are tight/consistent; only the two canvas ratios
// disagree with each other). Because `.bruckmandl__ai-img` used to be
// sized by width with `height: auto` (deriving height from each image's
// own intrinsic ratio), the visible character in talk/welcome rendered
// ~30% shorter on screen than in idle/point.
//
// AI_POSE_SCALE corrects this by scaling each pose's rendered <img> UP so
// its visible character height matches idle's at any shared render width
// (idle is the fixed reference — never scaled down, per owner
// instruction). Values measured via canvas alpha-channel bounding-box
// analysis on the actual served PNGs (real getImageData pixel data):
//
//   pose      canvasW x H     alpha bbox (minX,minY -> maxX,maxY)  bboxW x H
//   idle      941 x 1672      (239,34)  -> (796,1623)              558 x 1590
//   point     941 x 1672      (43,47)   -> (910,1632)              868 x 1586
//   talk      1122 x 1402     (258,17)  -> (898,1347)              641 x 1331
//   welcome   1122 x 1402     (64,20)   -> (877,1356)              814 x 1337
//
// S_i = (bboxH_idle / canvasW_idle) / (bboxH_i / canvasW_i)
//     = 1.68970 / (bboxH_i / canvasW_i)
//
// If this asset set is ever re-exported/re-cropped, re-measure the alpha
// bbox of each new PNG and recompute this table — these numbers are not
// arbitrary and will silently drift out of sync with a new export.
//
// Scope note: js/index-main.js's global assistant bar uses a DIFFERENT CSS
// pattern for these same 4 images (fixed HEIGHT, width: auto) and is
// already immune to this bug (measured <1px visible-height spread) — this
// table/transform is intentionally applied ONLY in this monument-page
// module, not there.
// ---------------------------------------------------------------------------
const AI_POSE_SCALE = {
  idle: 1,
  point: 1.00252,
  talk: 1.42438,
  welcome: 1.41822
};

// Applies the pose's normalization scale as a CSS custom property consumed
// by .bruckmandl__ai-img's `transform: scale(var(--bruckmandl-ai-scale))`
// (and by the idle-breathe / talk-active keyframes, which also read the
// same variable so the animated transform never drops the scale).
function applyPoseScale(imgEl, poseKey) {
  imgEl.style.setProperty("--bruckmandl-ai-scale", String(AI_POSE_SCALE[poseKey] || 1));
}

// ---------------------------------------------------------------------------
// 10-second monument assembly video — assets/steinerne-bruecke/bruckmandl/video/
// ---------------------------------------------------------------------------
const VIDEO_ASSET = {
  id: "assembly",
  file: "bruckmandl_monument_video_01_assembly.mp4"
};

/**
 * Resolves every asset map above to full URLs, once, without touching the
 * DOM or the network. Pure data — safe to call repeatedly.
 */
export function buildBruckmandlAssetMap() {
  return {
    hero: { id: HERO_ASSET.id, url: resolveAsset("hero", HERO_ASSET.file) },
    gallery: GALLERY_ASSETS.map((a) => ({ id: a.id, url: resolveAsset("gallery", a.file), labelKey: a.labelKey })),
    cutouts: CUTOUT_ASSETS.map((a) => ({ id: a.id, url: resolveAsset("cutouts", a.file) })),
    materials: MATERIAL_ASSETS.map((a) => ({ id: a.id, url: resolveAsset("materials", a.file) })),
    ai: Object.fromEntries(
      Object.entries(AI_POSES).map(([pose, file]) => [pose, resolveAsset("ai", file)])
    ),
    video: { id: VIDEO_ASSET.id, url: resolveAsset("video", VIDEO_ASSET.file) }
  };
}

// Best-effort source lookup, same shape as kframes-gallery.js's own
// loadSources() (Map keyed by `id`, resolved from sources.json's `sources[]`
// array). A failed/missing fetch degrades to an empty Quellen panel rather
// than inventing bibliographic text.
async function loadSources() {
  try {
    const res = await fetch(SOURCES_URL, { cache: "no-store" });
    if (!res.ok) return new Map();
    const data = await res.json();
    const list = Array.isArray(data && data.sources) ? data.sources : [];
    const map = new Map();
    list.forEach((s) => { if (s && s.id) map.set(s.id, s); });
    return map;
  } catch (err) {
    return new Map();
  }
}

function renderIntro(container, t, lang) {
  container.appendChild(el("p", "bruckmandl__eyebrow")).textContent = t(lang, "bruckmandlEyebrow");
  container.appendChild(el("h3", "bruckmandl__title")).textContent = t(lang, "bruckmandlTitle");
  container.appendChild(el("p", "bruckmandl__summary")).textContent = t(lang, "bruckmandlSummary");
}

function prefersReducedMotion() {
  return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

// ---------------------------------------------------------------------------
// DUAL PREMIUM INTERACTIVE MUSEUM GALLERY — shared cleanup-tracked state.
// Mirrors aiPendingTimers/aiClearTimers() further below: every render() call
// (initial mount + every language-switch refreshLabels()) must be able to
// tear down whatever the PREVIOUS render created before rebuilding, so a
// re-render can never leak a GSAP ScrollTrigger instance, a dangling
// document-level keydown listener, a stray requestAnimationFrame loop, or a
// stale Inspection Mode overlay left over from a previous language.
// ---------------------------------------------------------------------------
let ztScrollTriggers = [];
function ztClearScrollTriggers() {
  ztScrollTriggers.forEach((st) => {
    try { st.kill(); } catch (err) { /* a killed/invalid instance must never break a re-render */ }
  });
  ztScrollTriggers = [];
}

// Hero parallax/breathing loop (see startHeroMotion() below) — a single
// rAF id tracked at module scope so a language-switch re-render (or the
// viewer simply not being reduced-motion-eligible) can always cancel a
// previous loop before a new one is ever started.
let ztViewerRafId = null;
function ztStopViewerRaf() {
  if (ztViewerRafId != null) {
    window.cancelAnimationFrame(ztViewerRafId);
    ztViewerRafId = null;
  }
}

// ---------------------------------------------------------------------------
// BRÜCKMANDL ACTIVE GUIDE — character's own pointer/ambient-gaze tilt loop
// (see startAssistantMotion() inside renderAssistant() below). A SEPARATE
// rAF id from ztViewerRafId above (that one belongs to Gallery 01's hero
// viewer stage, a different element with a different motion budget) but the
// exact same one-loop-per-concern discipline: tracked at module scope, torn
// down explicitly at the top of every render() call.
// ---------------------------------------------------------------------------
let ztAiTiltRafId = null;
function ztStopAiTiltRaf() {
  if (ztAiTiltRafId != null) {
    window.cancelAnimationFrame(ztAiTiltRafId);
    ztAiTiltRafId = null;
  }
}

// PAGE AWARENESS (brief §2) — every IntersectionObserver created by
// renderAssistant()'s observeAwareness() helper is pushed here, exactly
// mirroring ztScrollTriggers/ztClearScrollTriggers() above. #stage and
// #facts live OUTSIDE this module's own .bruckmandl__inner subtree and are
// therefore never destroyed by render()'s `inner.innerHTML = ""` sweep — if
// these observers were not explicitly disconnected on every re-render, a
// language switch would leave a growing set of stale observers all firing
// into detached/stale closures. Swept at the top of render(), alongside
// ztClearScrollTriggers()/ztStopViewerRaf().
let ztAwarenessObservers = [];
function ztClearAwarenessObservers() {
  ztAwarenessObservers.forEach((observer) => {
    try { observer.disconnect(); } catch (err) { /* a stale/invalid observer must never break a re-render */ }
  });
  ztAwarenessObservers = [];
}

// RENDER-SCOPED CLEANUPS — render() rebuilds the whole subtree on every
// language switch, but handlers attached to `document` and observers created
// for per-render elements outlive that sweep. Anything a render registers
// outside its own subtree (document listeners, its IntersectionObserver, its
// auto-advance timers) pushes a teardown here; render() runs them all before
// building the next subtree, so repeated re-renders never accumulate.
let ztRenderCleanups = [];
function ztOnRenderCleanup(fn) { ztRenderCleanups.push(fn); }
function ztRunRenderCleanups() {
  const pending = ztRenderCleanups;
  ztRenderCleanups = [];
  pending.forEach((fn) => {
    try { fn(); } catch (err) { /* a stale teardown must never break a re-render */ }
  });
}

// Bridges module-scope openInspection()/closeInspection() (shared by BOTH
// galleries, defined outside renderAssistant()'s own closure — see those
// functions below) to the assistant's single setPose() mutator, without a
// second/duplicated pose-tracking variable. Set at the end of
// renderAssistant() to that render's own ambient handle; reset to null at
// the top of every render() call. Mirrors ztExplodedPieceEls/
// highlightExplodedPiece()'s existing cross-closure bridging pattern above.
let ztAssistantAmbient = null;

// Cross-gallery narrative connection (see the module header addition below):
// maps a cutout id -> its rendered Gallery 02 piece element, populated only
// by the CUTOUTS call to renderExplodedCollection(). Reset every render() so
// a stale reference from a previous language can never be touched.
let ztExplodedPieceEls = {};
function highlightExplodedPiece(id) {
  const target = ztExplodedPieceEls[id];
  if (!target) return;
  target.classList.add("is-linked");
  aiScheduleTimer(() => target.classList.remove("is-linked"), 2400);
}

// ---------------------------------------------------------------------------
// 06G.2B.2 — SHARED VIEWER BRIDGE. Every Bruckmandl view/detail enlarges in
// the platform's ONE zs-viewer (contain, black museum backdrop, close, ESC,
// native pinch-zoom; Lenis is stopped by main.js while it is open). The
// assistant keeps its existing "inspection" reaction: an ambient POINT pose
// held while the viewer is open and released when it closes.
// ---------------------------------------------------------------------------
function openBruckmandlPhoto(url, alt) {
  openPhoto({ src: url, alt: alt || "" });
  if (!ztAssistantAmbient) return;
  const ambient = ztAssistantAmbient;
  ambient.hold("point");
  const mo = new MutationObserver(() => {
    if (!document.documentElement.classList.contains("zs-viewer-open")) { mo.disconnect(); ambient.release(); }
  });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
}

const ZOOM_ICON_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

// One IntersectionObserver per render (no scroll listeners): adds .is-in once a
// stage/detail reaches the useful viewport. CSS owns the restrained reveal
// (opacity + small rise + scale settle, caption after the image). Reduced
// motion: everything is visible immediately, no transforms.
function observeReveal(nodes) {
  if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
    nodes.forEach((n) => n.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
  }, { threshold: 0.3, rootMargin: "0px 0px -8% 0px" });
  nodes.forEach((n) => io.observe(n));
  ztOnRenderCleanup(() => io.disconnect());
}

function zoomButton(label, onOpen) {
  const b = el("button", "zt-zoom bm-zoom", { type: "button", "aria-label": label || "" });
  b.innerHTML = ZOOM_ICON_SVG;
  b.addEventListener("click", (e) => { e.stopPropagation(); onOpen(); });
  return b;
}

// ---------------------------------------------------------------------------
// 06G.2B.2 — VIEWS: vertical cinematic scroll. Each approved view is its own
// light-sticky stage inside the usable scene (below nav + safe area + 20px):
// the sculpture dominates (~80% of the useful height, contain, never cropped),
// rises/settles into place, holds while the visitor keeps scrolling, then the
// next view rises in. Caption in a controlled lower band. Existing validated
// hotspot dots (HERO_VIEW_HOTSPOTS) stay on their views and fire the SAME
// BRUCKMANDL_HOTSPOT_EVENT. No tabs, no auto-rotation, no carousel.
// ---------------------------------------------------------------------------
function renderViewsScroll(container, assets, t, lang, ui) {
  const views = assets.gallery;
  if (!views || !views.length) return;
  const cutoutLabels = t(lang, "bruckmandlCutoutLabels") || {};
  const openLabel = t(lang, "bruckmandlInspectOpen") || "";
  const wrap = el("div", "bm-views");
  wrap.appendChild(el("p", "bruckmandl__section-label bm-views__label")).textContent = t(lang, "bruckmandlGalleryLabel");
  const stages = [];
  views.forEach((view, i) => {
    const name = t(lang, view.labelKey) || "";
    const stage = el("section", "bm-view", { "aria-label": `${String(i + 1).padStart(2, "0")} — ${name}` });
    const pin = el("div", "bm-view__pin");
    const frame = el("div", "bm-view__frame");
    const img = el("img", "bm-view__img", { alt: name, draggable: "false", loading: i === 0 ? "eager" : "lazy", decoding: "async", width: "941", height: "1672" });
    img.src = view.url;
    frame.appendChild(img);
    const dots = el("div", "bm-view__dots");
    (HERO_VIEW_HOTSPOTS[view.id] || []).forEach((point) => {
      const label = cutoutLabels[point.id] || "";
      const dot = el("button", "bm-view__dot", {
        type: "button",
        style: `left:${point.x}%; top:${point.y}%;`,
        "aria-label": label ? (ui.heading ? `${label} — ${ui.heading}` : label) : (ui.heading || "")
      });
      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        document.dispatchEvent(new CustomEvent(BRUCKMANDL_HOTSPOT_EVENT, { detail: { hotspotId: point.id } }));
        highlightExplodedPiece(point.id);
        if (label) { micro.textContent = label; micro.hidden = false; }
      });
      dots.appendChild(dot);
    });
    frame.appendChild(dots);
    const open = () => openBruckmandlPhoto(view.url, name);
    frame.appendChild(zoomButton(openLabel, open));
    frame.addEventListener("click", open);
    pin.appendChild(frame);
    const cap = el("div", "bm-view__cap");
    cap.appendChild(el("span", "bm-view__idx")).textContent = `${String(i + 1).padStart(2, "0")} / ${String(views.length).padStart(2, "0")}`;
    cap.appendChild(el("span", "bm-view__name")).textContent = name;
    const micro = el("span", "bm-view__micro", { "aria-live": "polite" });
    micro.hidden = true;
    cap.appendChild(micro);
    pin.appendChild(cap);
    stage.appendChild(pin);
    wrap.appendChild(stage);
    stages.push(stage);
  });
  container.appendChild(wrap);
  observeReveal(stages);
}

function renderVideo(container, assets, t, lang) {
  container.appendChild(el("p", "bruckmandl__section-label")).textContent = t(lang, "bruckmandlVideoLabel");
  const wrap = el("div", "bruckmandl__video");
  const video = el("video", null, { muted: "", playsinline: "", controls: "", preload: "none" });
  video.muted = true;
  video.src = assets.video.url;
  wrap.appendChild(video);
  container.appendChild(wrap);
}

function renderHistory(container, t, lang) {
  container.appendChild(el("p", "bruckmandl__section-label")).textContent = t(lang, "bruckmandlHistoryLabel");
  const history = el("div", "bruckmandl__history");
  const items = t(lang, "bruckmandlHistory") || [];
  items.forEach((item) => {
    const row = el("div", "bruckmandl__history-item");
    row.appendChild(el("div", "bruckmandl__history-item-year")).textContent = item.year;
    row.appendChild(el("div", "bruckmandl__history-item-text")).textContent = item.text;
    history.appendChild(row);
  });
  container.appendChild(history);
}

function renderLegend(container, t, lang) {
  const legend = el("div", "bruckmandl__legend");
  legend.appendChild(el("span", "bruckmandl__legend-label")).textContent = t(lang, "bruckmandlLegendLabel");
  legend.appendChild(el("p", "bruckmandl__legend-text")).textContent = t(lang, "bruckmandlLegendText");
  container.appendChild(legend);
}

function renderFactcheckColumn(parent, modifierClass, headingKey, pointsKey, t, lang) {
  const column = el("div", `bruckmandl__factcheck-column ${modifierClass}`);
  column.appendChild(el("p", "bruckmandl__factcheck-heading")).textContent = t(lang, headingKey);
  const list = el("ul", "bruckmandl__factcheck-list");
  (t(lang, pointsKey) || []).forEach((point) => {
    const li = el("li");
    li.textContent = point;
    list.appendChild(li);
  });
  column.appendChild(list);
  parent.appendChild(column);
}

function renderFactcheck(container, t, lang) {
  const factcheck = el("div", "bruckmandl__factcheck");
  renderFactcheckColumn(factcheck, "bruckmandl__factcheck-column--fact", "bruckmandlFactHeading", "bruckmandlFactPoints", t, lang);
  renderFactcheckColumn(factcheck, "bruckmandl__factcheck-column--legend", "bruckmandlLegendGroupHeading", "bruckmandlLegendPoints", t, lang);
  renderFactcheckColumn(factcheck, "bruckmandl__factcheck-column--uncertain", "bruckmandlUncertainHeading", "bruckmandlUncertainPoints", t, lang);
  container.appendChild(factcheck);
}

// ---------------------------------------------------------------------------
// 06G.2B.2 — DETAILS / PARTS: vertical cinematic scroll (normal flow, no pin).
// Each existing approved part/material crop becomes: NUMBER · CATEGORY ↓
// large centred image (contain, lazy) ↓ its existing caption ↓ next detail.
// Image enters → settles → caption reveals (IntersectionObserver + CSS).
// Tap/enlarge opens the shared zs-viewer. Hotspot-enabled ids keep their
// EXACT existing behaviour through a small "ask" control that dispatches the
// SAME BRUCKMANDL_HOTSPOT_EVENT (HOTSPOT_ENABLED_* sets unchanged).
// Small material crops are never shown above their native pixel width.
// ---------------------------------------------------------------------------
function renderDetailsScroll(container, labelKey, rawAssets, labelMapKey, t, lang, hotspotIds, ui, opts) {
  const options = opts || {};
  const labelMap = t(lang, labelMapKey) || {};
  const categoryLabel = t(lang, labelKey) || "";
  const openLabel = t(lang, "bruckmandlInspectOpen") || "";
  const group = el("div", `bm-details ${options.modifier || ""}`);
  group.appendChild(el("p", "bruckmandl__section-label bm-details__label")).textContent = categoryLabel;
  const nodes = [];
  rawAssets.forEach((item, i) => {
    const name = labelMap[item.id] || "";
    const isHotspot = !!(hotspotIds && hotspotIds.has(item.id));
    const fig = el("figure", "bm-detail");
    fig.appendChild(el("p", "bm-detail__idx")).textContent = `${String(i + 1).padStart(2, "0")} / ${String(rawAssets.length).padStart(2, "0")} · ${categoryLabel}`;
    const frame = el("div", "bm-detail__frame");
    const img = el("img", "bm-detail__img", { alt: name, draggable: "false", loading: "lazy", decoding: "async" });
    if (options.nativeWidths && options.nativeWidths[item.id]) img.style.maxWidth = `min(100%, ${options.nativeWidths[item.id]}px)`;
    img.src = item.url;
    frame.appendChild(img);
    const open = () => openBruckmandlPhoto(item.url, name);
    frame.appendChild(zoomButton(openLabel, open));
    frame.addEventListener("click", open);
    fig.appendChild(frame);
    const cap = el("figcaption", "bm-detail__cap");
    cap.appendChild(el("span", "bm-detail__name")).textContent = name;
    if (isHotspot && ui && ui.heading) {
      const ask = el("button", "bm-detail__ask", { type: "button", "aria-label": name ? `${name} — ${ui.heading}` : ui.heading });
      ask.textContent = ui.heading;
      ask.addEventListener("click", () => document.dispatchEvent(new CustomEvent(BRUCKMANDL_HOTSPOT_EVENT, { detail: { hotspotId: item.id } })));
      cap.appendChild(ask);
    }
    fig.appendChild(cap);
    if (options.registerPieces) ztExplodedPieceEls[item.id] = fig;
    group.appendChild(fig);
    nodes.push(fig);
  });
  container.appendChild(group);
  observeReveal(nodes);
}

// Native pixel widths of the five small material close-up crops (measured from the
// approved WebP files) — they are displayed at most at this CSS width (no upscale).
const MATERIAL_NATIVE_WIDTHS = { stone_surface: 320, weathering: 320, inscription_surface: 650, relief_surface: 400, column_surface: 500 };

function renderSources(container, t, lang, sourcesMap) {
  const btn = el("button", "bruckmandl__sources-btn", {
    type: "button",
    "aria-haspopup": "dialog",
    "aria-controls": "bruckmandlSourcesPanel"
  });
  btn.textContent = t(lang, "kfSourcesButton");

  const panel = el("div", "bruckmandl__sources-panel", {
    id: "bruckmandlSourcesPanel",
    role: "dialog",
    "aria-modal": "false",
    hidden: ""
  });
  const inner = el("div", "bruckmandl__sources-panel__inner");
  const head = el("div", "bruckmandl__sources-panel__head");
  head.appendChild(el("h4")).textContent = t(lang, "kfSourcesButton");
  const closeBtn = el("button", "bruckmandl__sources-panel__close", { type: "button", "aria-label": "Close" });
  closeBtn.textContent = "×";
  head.appendChild(closeBtn);
  inner.appendChild(head);

  const list = el("div", "bruckmandl__sources-panel__list");
  BRUCKMANDL_SOURCE_IDS.forEach((id) => {
    const source = sourcesMap.get(id);
    if (!source) return; // no orphans — never render a placeholder citation
    const entry = el("div", "bruckmandl__source-entry");
    entry.appendChild(el("p", "bruckmandl__source-entry__id")).textContent = id;
    entry.appendChild(el("p", "bruckmandl__source-entry__title")).textContent = source.short_title || source.title || "";
    entry.appendChild(el("p", "bruckmandl__source-entry__institution")).textContent = source.institution || "";
    list.appendChild(entry);
  });
  inner.appendChild(list);
  panel.appendChild(inner);

  const openPanel = () => { panel.hidden = false; };
  const closePanel = () => { panel.hidden = true; };
  btn.addEventListener("click", openPanel);
  closeBtn.addEventListener("click", closePanel);
  panel.addEventListener("click", (e) => { if (e.target === panel) closePanel(); });
  const onSourcesEscape = (e) => { if (e.key === "Escape" && !panel.hidden) closePanel(); };
  document.addEventListener("keydown", onSourcesEscape);
  ztOnRenderCleanup(() => document.removeEventListener("keydown", onSourcesEscape));

  container.appendChild(btn);
  container.appendChild(panel);
}

// Pending pose-transition timers (welcome->idle entry sequence, talk/point->
// idle after an answer). Tracked at module scope and swept at the start of
// every render() call (language switch rebuilds the whole subtree) so a
// stale timer from a previous render can never touch a detached <img>.
let aiPendingTimers = [];
function aiClearTimers() {
  aiPendingTimers.forEach((id) => window.clearTimeout(id));
  aiPendingTimers = [];
}
function aiScheduleTimer(fn, ms) {
  const id = window.setTimeout(fn, ms);
  aiPendingTimers.push(id);
  return id;
}

// ---------------------------------------------------------------------------
// renderAssistant() — CLOSED interactive demo, driven entirely by the
// canonical core (../../js/bruckmandl-guide-core.js): topic ids, pose/
// evidence metadata, per-language QA text, the fallback copy and the
// deterministic keyword matcher all come from there, never duplicated here.
// A typed question is normalized+matched by matchBruckmandlIntent() (no
// external AI, no backend); an unmatched question shows BRUCKMANDL_FALLBACK
// with a neutral "uncertain"-style badge, never a guessed historical claim.
// ---------------------------------------------------------------------------
function renderAssistant(container, assets, t, lang) {
  const reduced = prefersReducedMotion();
  const ui = BRUCKMANDL_UI_LABELS[lang] || BRUCKMANDL_UI_LABELS.en;
  const statusLabels = BRUCKMANDL_STATUS_LABELS[lang] || BRUCKMANDL_STATUS_LABELS.en;

  // Preload all 4 poses once so a later pose switch never shows a blank/
  // half-loaded frame during the crossfade.
  ["welcome", "idle", "point", "talk"].forEach((pose) => {
    const preload = new Image();
    preload.src = assets.ai[pose];
  });

  const wrap = el("div", "bruckmandl__assistant");

  // ACTIVE GUIDE V1 — two new, purely presentational wrapper elements around
  // the existing, UNTOUCHED .bruckmandl__ai-stage/.bruckmandl__ai-img pair
  // (see css/style.css's dedicated comment block for the full rationale):
  //   .bruckmandl__ai-life — slow CSS-only ambient sway/drift (brief §1),
  //     always on unless prefers-reduced-motion, independent of pose.
  //   .bruckmandl__ai-tilt — JS-driven pointer + ambient-gaze micro-lean
  //     (brief §2's "gallery -> mirada hacia la zona" / §3's pointer
  //     reaction), a single rAF loop (startAssistantMotion() below).
  // Each element owns exactly one transform source, so nothing ever fights
  // .bruckmandl__ai-img's own opacity crossfade / --bruckmandl-ai-scale /
  // idle-breathe / talk-active keyframes.
  const life = el("div", "bruckmandl__ai-life");
  const tilt = el("div", "bruckmandl__ai-tilt");
  const stage = el("div", "bruckmandl__ai-stage");
  const img = el("img", "bruckmandl__ai-img", { alt: ui.welcomeAlt || "", draggable: "false" });
  img.src = assets.ai.welcome;
  applyPoseScale(img, "welcome");
  stage.appendChild(img);
  tilt.appendChild(stage);
  life.appendChild(tilt);
  wrap.appendChild(life);

  function setPose(poseKey) {
    const alt = ui[`${poseKey}Alt`] || "";
    img.classList.toggle("bruckmandl__ai-img--idle-breathe", poseKey === "idle");
    img.classList.toggle("bruckmandl__ai-img--talk-active", poseKey === "talk");
    if (reduced) {
      img.src = assets.ai[poseKey];
      img.alt = alt;
      applyPoseScale(img, poseKey);
      return;
    }
    img.classList.add("is-fading");
    aiScheduleTimer(() => {
      img.src = assets.ai[poseKey];
      img.alt = alt;
      applyPoseScale(img, poseKey);
      img.classList.remove("is-fading");
    }, 220);
  }

  // -------------------------------------------------------------------
  // POSE STATE MACHINE (brief §5) — setPose() above remains the single
  // source of truth for what is actually painted. Everything below only
  // ever calls setPose() (or schedules a call to it via aiScheduleTimer(),
  // the file's single existing timer mechanism) — no second, parallel pose
  // variable. isAnswerActive is the one priority flag: true for as long as
  // a REAL answer (typed question, suggested-question click, or a hotspot/
  // fact-card click resolved through answerTopic()) is being displayed AND
  // its own 2400ms return-to-idle timer is still pending. Every AMBIENT
  // (passive, no text/badge — HARD CONSTRAINT 4) reaction below checks this
  // flag before touching the pose, so a scroll-triggered ambient reaction
  // can never yank the pose away from — or cancel/shorten — a real answer
  // mid-read (HARD CONSTRAINT 5).
  // -------------------------------------------------------------------
  let isAnswerActive = false;
  // The single pending "ambient return-to-idle" timer id, tracked so a
  // second ambient reaction arriving while one is already holding never
  // creates a second competing timer (brief §5's "evitar ... doble
  // transición"). Still goes through aiScheduleTimer()/aiClearTimers() —
  // this is only bookkeeping for WHICH of those timers is the current
  // ambient one, not a second timer system.
  let ztAmbientIdleTimerId = null;

  // Sets an ambient pose immediately (no scheduled return) — used for
  // open-ended states such as "Inspection Mode is open" (brief §6), which
  // has no fixed duration of its own; released explicitly by the caller.
  function ambientSetPose(poseKey) {
    if (isAnswerActive) return;
    if (ztAmbientIdleTimerId != null) {
      window.clearTimeout(ztAmbientIdleTimerId);
      ztAmbientIdleTimerId = null;
    }
    setPose(poseKey);
  }

  // Sets an ambient pose and schedules its own return to IDLE after holdMs
  // (brief §2's "hero -> WELCOME", "fact card -> POINT", "gallery -> point/
  // gaze" reactions — a temporary pulse, not an open-ended hold).
  function ambientPose(poseKey, holdMs) {
    ambientSetPose(poseKey);
    if (isAnswerActive) return;
    ztAmbientIdleTimerId = aiScheduleTimer(() => {
      ztAmbientIdleTimerId = null;
      // Re-check isAnswerActive at fire time too, not just at schedule
      // time — a real answer may have started (and taken priority) after
      // this ambient timer was scheduled but before it fired.
      if (!isAnswerActive) setPose("idle");
    }, holdMs);
  }

  // Explicit release back to IDLE (brief §6's "inspection mode" close).
  function ambientRelease() {
    if (isAnswerActive) return;
    if (ztAmbientIdleTimerId != null) {
      window.clearTimeout(ztAmbientIdleTimerId);
      ztAmbientIdleTimerId = null;
    }
    setPose("idle");
  }

  // -------------------------------------------------------------------
  // POINTER REACTION (brief §3) + AMBIENT GAZE (brief §2's "gallery ->
  // mirada/reacción hacia la zona") — ONE single rAF loop (never a second
  // one) driving .bruckmandl__ai-tilt's inline transform. Off entirely
  // under prefers-reduced-motion (returns null; gazeTowards() below then
  // simply no-ops, exactly like startHeroMotion()'s own early return).
  // Pointer tracking itself is further gated to hover-capable devices only
  // (desktop) — the SAME `(hover: none)` convention already used by
  // renderExplodedCollection()'s own canHover check above — so touch/mobile
  // never gets cursor-follow behavior, while ambient gaze (page-awareness,
  // not pointer-driven) still works identically on every device, per brief
  // §3 ("mobile: desactivar cursor tracking, conservar ambient motion").
  // Values are intentionally tiny (a few px / a few degrees) — HARD
  // CONSTRAINT 11 — and applied as a 2D translate+rotate (never rotateX/
  // rotateY): the character is a flat cutout, not a 3D vitrine object like
  // Gallery 01's artifact, and .bruckmandl__ai-tilt has no `perspective`
  // ancestor set up for a convincing 3D tilt. transform-origin stays
  // bottom-center (see css/style.css) so the lean pivots from the feet.
  // -------------------------------------------------------------------
  function startAssistantMotion(tiltEl, hitAreaEl) {
    if (reduced) return null;
    const canHoverPointer = !(window.matchMedia && window.matchMedia("(hover: none)").matches);
    let pointerX = 0; // px, small range
    let pointerTilt = 0; // deg, small range
    let ambientX = 0;
    let ambientTilt = 0;
    let curX = 0;
    let curTilt = 0;

    if (canHoverPointer) {
      hitAreaEl.addEventListener("pointermove", (e) => {
        const rect = hitAreaEl.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const px = (e.clientX - rect.left) / rect.width;
        pointerX = (px - 0.5) * 6; // max ±3px
        pointerTilt = (px - 0.5) * 4; // max ±2deg
      });
      hitAreaEl.addEventListener("pointerleave", () => {
        pointerX = 0;
        pointerTilt = 0;
      });
    }

    function tick() {
      const targetX = pointerX + ambientX;
      const targetTilt = pointerTilt + ambientTilt;
      curX += (targetX - curX) * 0.08;
      curTilt += (targetTilt - curTilt) * 0.08;
      tiltEl.style.transform = `translateX(${curX.toFixed(2)}px) rotate(${curTilt.toFixed(2)}deg)`;
      ztAiTiltRafId = window.requestAnimationFrame(tick);
    }
    ztAiTiltRafId = window.requestAnimationFrame(tick);

    return {
      nudge(x, tiltDeg) {
        ambientX = x;
        ambientTilt = tiltDeg;
      },
      release() {
        ambientX = 0;
        ambientTilt = 0;
      }
    };
  }

  const assistantMotion = startAssistantMotion(tilt, life);

  // Temporary directional lean toward a page zone that just scrolled into
  // view (brief §2's "gallery -> mirada/reacción hacia la zona"), reusing
  // the SAME single rAF loop above rather than a second animation system.
  // Gated by isAnswerActive for the same reason every other ambient
  // reaction is (HARD CONSTRAINT 5) and self-decays via aiScheduleTimer().
  let ztGazeReleaseTimerId = null;
  function gazeTowards(x, holdMs) {
    if (!assistantMotion || isAnswerActive) return;
    assistantMotion.nudge(x, x * 0.6);
    if (ztGazeReleaseTimerId != null) window.clearTimeout(ztGazeReleaseTimerId);
    ztGazeReleaseTimerId = aiScheduleTimer(() => {
      ztGazeReleaseTimerId = null;
      if (!isAnswerActive) assistantMotion.release();
    }, holdMs);
  }

  // Entry sequence: WELCOME for a short moment, then settle into IDLE.
  aiScheduleTimer(() => setPose("idle"), reduced ? 0 : 1600);

  const panel = el("div", "bruckmandl__ai-panel");
  panel.appendChild(el("p", "bruckmandl__ai-heading")).textContent = ui.heading;

  // Typed free-text input — same engine as the INDEX persistent assistant
  // bar (js/index-main.js). Enter and the send button both submit.
  const form = el("form", "bruckmandl__ai-form");
  const input = el("input", "bruckmandl__ai-input", {
    type: "text",
    placeholder: ui.placeholder,
    "aria-label": ui.inputAriaLabel,
    autocomplete: "off"
  });
  const sendBtn = el("button", "bruckmandl__ai-send", { type: "submit", "aria-label": ui.send });
  sendBtn.textContent = ui.send;
  form.appendChild(input);
  form.appendChild(sendBtn);

  const qWrap = el("div", "bruckmandl__ai-questions", { role: "group", "aria-label": ui.heading });
  const answerWrap = el("div", "bruckmandl__ai-answer", { "aria-live": "polite" });
  answerWrap.hidden = true;
  const statusRow = el("div", "bruckmandl__ai-answer-status");
  const answerText = el("p", "bruckmandl__ai-answer-text");
  answerWrap.appendChild(statusRow);
  answerWrap.appendChild(answerText);

  const topics = LocalValidatedProvider.getSuggestedTopics(lang);
  const buttons = [];

  // Shared tail for showAnswer()/answerUnknown() below (brief §5/§6's
  // "respuesta activa -> TALK ... después -> retorno suave a IDLE", and the
  // §6 "answer start"/"answer end" events): marks isAnswerActive so no
  // ambient reaction can interrupt this real answer while it is being read,
  // then — after the EXACT SAME 2400ms this already used before this
  // refactor (HARD CONSTRAINT 6) — clears the flag and returns to IDLE,
  // UNLESS Inspection Mode is still open, in which case its own "point"
  // ambient hold (see openInspection()) is simply re-asserted instead of
  // flashing back to idle underneath an still-open inspection overlay.
  function scheduleAnswerReturnToIdle() {
    isAnswerActive = true;
    aiScheduleTimer(() => {
      isAnswerActive = false;
      if (document.documentElement.classList.contains("zs-viewer-open")) ambientSetPose("point"); // 06G.2B.2: shared viewer still open
      else setPose("idle");
    }, 2400);
  }

  function showAnswer(pose, statusCodes, text, activeBtn) {
    buttons.forEach((b) => {
      const active = b === activeBtn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-pressed", active ? "true" : "false");
    });

    setPose(pose);

    statusRow.innerHTML = "";
    statusCodes.forEach((code) => {
      const badge = el("span", `bruckmandl__ai-status-badge bruckmandl__ai-status-badge--${code}`);
      badge.textContent = statusLabels[code] || "";
      statusRow.appendChild(badge);
    });
    answerText.textContent = text;
    answerWrap.hidden = false;

    // Return to IDLE after the answer has had time to be read, while the
    // answer card itself stays visible — the visitor can pick another
    // question at any point, this only rests the character's pose.
    scheduleAnswerReturnToIdle();
  }

  function answerTopic(topic, activeBtn) {
    const result = LocalValidatedProvider.answerTopic(topic, lang);
    showAnswer(result.pose, result.statusCodes, result.text, activeBtn);
  }

  // Renders a provider result that is NOT a matched canonical topic — either
  // "couldn't understand the question" (topic: null) or the defensive
  // "no validated content for this topic" state. Never a guessed historical
  // claim; text always comes from the provider (BRUCKMANDL_FALLBACK /
  // BRUCKMANDL_NO_VALIDATED_INFO), never composed here.
  function answerUnknown(result) {
    setPose(result.pose);
    statusRow.innerHTML = "";
    result.statusCodes.forEach((code) => {
      const badge = el("span", `bruckmandl__ai-status-badge bruckmandl__ai-status-badge--${code}`);
      badge.textContent = statusLabels[code] || "";
      statusRow.appendChild(badge);
    });
    answerText.textContent = result.text;
    answerWrap.hidden = false;
    buttons.forEach((b) => { b.classList.remove("is-active"); b.setAttribute("aria-pressed", "false"); });
    scheduleAnswerReturnToIdle();
  }

  topics.forEach((entry) => {
    const btn = el("button", "bruckmandl__ai-question-btn", { type: "button", "aria-pressed": "false" });
    btn.textContent = entry.question;
    btn.addEventListener("click", () => answerTopic(entry.topic, btn));
    buttons.push(btn);
    qWrap.appendChild(btn);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const raw = input.value;
    if (!raw || !raw.trim()) return;
    const result = LocalValidatedProvider.answerFreeText(raw, lang);
    if (result.matched && result.topic) {
      const matchingBtn = buttons[topics.findIndex((entry) => entry.topic === result.topic)] || null;
      showAnswer(result.pose, result.statusCodes, result.text, matchingBtn);
    } else {
      answerUnknown(result);
    }
    input.value = "";
  });

  panel.appendChild(form);
  panel.appendChild(qWrap);
  panel.appendChild(answerWrap);
  wrap.appendChild(panel);
  container.appendChild(wrap);

  // ---------------------------------------------------------------------
  // PAGE AWARENESS (brief §2) — passive, scroll-into-view ambient
  // reactions. Pure pose/gaze motion only, NEVER text/badges, NEVER
  // showAnswer()/answerUnknown() (HARD CONSTRAINT 4) — only ambientPose()/
  // gazeTowards() above, both already gated by isAnswerActive (HARD
  // CONSTRAINT 5). No polling: IntersectionObserver only, one instance per
  // observed zone, each pushed into ztAwarenessObservers and disconnected
  // at the top of every render() call (see ztClearAwarenessObservers()).
  // `primed` skips each observer's very first callback (which reports
  // CURRENT state at observe()-time, e.g. the hero section being in view
  // simply because the page just loaded at its top) so mounting this
  // module never fires a redundant ambient pulse racing the WELCOME->IDLE
  // entry sequence above — only genuine, later scroll-driven transitions
  // ever call onEnter().
  // threshold: 0 (NOT a fraction like 0.4) — IntersectionObserver measures
  // "percent of the TARGET's own box visible", not percent of viewport. A
  // fractional threshold silently NEVER fires for a target taller than the
  // viewport (confirmed live: #stage's own pinned intro section is ~11000px
  // tall vs. a ~1200px viewport, so 0.4 could never be reached and "hero ->
  // WELCOME" never triggered). threshold: 0 fires as soon as ANY part of
  // the target is visible, which is correct regardless of the target's own
  // height relative to any viewport (desktop or mobile) and still only
  // fires on a genuine enter/exit crossing, not continuously.
  // ---------------------------------------------------------------------
  function observeAwareness(target, onEnter) {
    if (!target || typeof IntersectionObserver !== "function") return;
    let primed = false;
    const observer = new IntersectionObserver((entries) => {
      if (primed) entries.forEach((entry) => { if (entry.isIntersecting) onEnter(); });
      primed = true;
    }, { threshold: 0 });
    observer.observe(target);
    ztAwarenessObservers.push(observer);
  }

  // hero (#stage, outside this module's own subtree) -> WELCOME.
  observeAwareness(document.getElementById("stage"), () => ambientPose("welcome", 1800));

  // fact cards (#facts, outside this module's own subtree) -> POINT.
  observeAwareness(document.getElementById("facts"), () => ambientPose("point", 1600));

  // Gallery 01's own hotspot-interactive artifact viewer -> POINT + a small
  // gaze lean (already inside `container`/`inner`, appended earlier in
  // this same render() pass, so it is safe to query here).
  observeAwareness(container.querySelector(".bm-views"), () => {
    ambientPose("point", 1600);
    gazeTowards(-3, 1600);
  });

  // Gallery 02's two exploded collections (materials + cutouts) -> POINT +
  // a small gaze lean the other way.
  container.querySelectorAll(".bm-details").forEach((gridEl) => {
    observeAwareness(gridEl, () => {
      ambientPose("point", 1600);
      gazeTowards(3, 1600);
    });
  });

  // Bridges openInspection()/closeInspection() (module-scope, outside this
  // closure — brief §6's "inspection mode" event) to this render's own
  // ambient pose functions. Reset to null at the top of every render().
  ztAssistantAmbient = {
    hold(poseKey) { ambientSetPose(poseKey); },
    release() { ambientRelease(); }
  };

  // ---------------------------------------------------------------------
  // External hook — used exclusively by initBruckmandl()'s returned
  // answerTopic() (in turn called only by bruckmandl-hotspot-bridge.js).
  // Reuses the SAME answerTopic()/showAnswer() functions defined above
  // (no duplicated rendering/pose logic) with no matching suggestion
  // button highlighted (activeBtn omitted), since the trigger came from a
  // hotspot elsewhere in this module, not a button click.
  // ---------------------------------------------------------------------
  return {
    answerTopic(topic) {
      answerTopic(topic, null);
    },
    rootEl: wrap
  };
}

function render(inner, assets, sourcesMap, t, getLang) {
  const lang = getLang();
  const ui = BRUCKMANDL_UI_LABELS[lang] || BRUCKMANDL_UI_LABELS.en;
  aiClearTimers();
  ztClearScrollTriggers();
  ztStopViewerRaf();
  ztStopAiTiltRaf();
  ztClearAwarenessObservers();
  ztRunRenderCleanups();
  // 06G.2B.2: the module's own Inspection Mode is retired (the shared zs-viewer
  // is used instead); start each render with a clean ambient hook.
  ztAssistantAmbient = null;
  ztExplodedPieceEls = {};
  inner.innerHTML = "";
  // 06G.2B.2 FLOW: intro → VIEWS (vertical cinematic scroll) → PARTS → MATERIAL
  // details (vertical cinematic scroll) → history / legend / fact-check → sources → assistant.
  renderIntro(inner, t, lang);
  renderViewsScroll(inner, assets, t, lang, ui);
  renderDetailsScroll(inner, "bruckmandlCutoutsLabel", assets.cutouts, "bruckmandlCutoutLabels", t, lang, HOTSPOT_ENABLED_CUTOUT_IDS, ui, { registerPieces: true, modifier: "bm-details--parts" });
  renderDetailsScroll(inner, "bruckmandlMaterialsLabel", assets.materials, "bruckmandlMaterialLabels", t, lang, HOTSPOT_ENABLED_MATERIAL_IDS, ui, { nativeWidths: MATERIAL_NATIVE_WIDTHS, modifier: "bm-details--material" });
  // TEMPORARY PUBLICATION FIX (2026-09-07): video block hidden until a
  // better replacement video is uploaded. renderVideo() itself is untouched
  // below — restore by uncommenting the next line.
  // renderVideo(inner, assets, t, lang);
  renderHistory(inner, t, lang);
  renderLegend(inner, t, lang);
  renderFactcheck(inner, t, lang);
  renderSources(inner, t, lang, sourcesMap);
  return renderAssistant(inner, assets, t, lang);
}

/**
 * Bruckmandl module entry point. Mirrors the initMuseum25D({ section, ... })
 * / initKframesGallery({ section, ... }) convention used elsewhere in this
 * folder: safely no-ops if no DOM host was passed in, otherwise renders the
 * full first-preview module and returns { refreshLabels() } so a language
 * switch (see js/main.js's populateLangButtons()) can re-render this
 * module's text without a page reload.
 * @param {{ section?: Element|null, t: Function, getLang: () => string, lenis?: unknown }} params
 * @returns {Promise<{ refreshLabels: () => void } | null>}
 */
export async function initBruckmandl({ section, t, getLang } = {}) {
  if (!section) return null;
  const inner = section.querySelector(".bruckmandl__inner") || section;

  const assets = buildBruckmandlAssetMap();
  const sourcesMap = await loadSources();

  // Updated on every render() call (initial + each language-switch
  // refreshLabels()) so the externally-exposed answerTopic() below always
  // reaches the CURRENT render's closures, never a stale one from a
  // previous language.
  let assistantApi = render(inner, assets, sourcesMap, t, getLang);

  return {
    refreshLabels() {
      assistantApi = render(inner, assets, sourcesMap, t, getLang);
    },
    // Called exclusively by bruckmandl-hotspot-bridge.js after it has
    // already resolved a hotspotId to a real canonical topic id. Reuses
    // renderAssistant()'s own answerTopic()/showAnswer() — no duplicated
    // pose/rendering logic. Fails silently (no-op) if the assistant isn't
    // mounted for any reason, per the "additive only" rule.
    answerTopic(topic) {
      if (!assistantApi || typeof assistantApi.answerTopic !== "function") return;
      assistantApi.answerTopic(topic);
      if (assistantApi.rootEl && typeof assistantApi.rootEl.scrollIntoView === "function") {
        assistantApi.rootEl.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "center"
        });
      }
    }
  };
}
