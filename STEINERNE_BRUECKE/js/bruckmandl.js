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
   ============================================================================ */

import { STEINERNE_BRUCKMANDL_ASSET_BASE, STEINERNE_SOURCES_URL } from "../../js/zt-paths.js";
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
  file: "bruckmandl_monument_master_front.png"
};

// ---------------------------------------------------------------------------
// Four-view gallery — assets/steinerne-bruecke/bruckmandl/gallery/
// labelKey points at the matching js/i18n.js key for each view's caption.
// ---------------------------------------------------------------------------
const GALLERY_ASSETS = [
  { id: "front", file: "bruckmandl_gallery_01_front.png", labelKey: "bruckmandlGalleryFront" },
  { id: "back", file: "bruckmandl_gallery_02_back.png", labelKey: "bruckmandlGalleryBack" },
  { id: "side_blank", file: "bruckmandl_gallery_03_side_blank.png", labelKey: "bruckmandlGalleryBlank" },
  { id: "inscription", file: "bruckmandl_gallery_04_inscription.png", labelKey: "bruckmandlGalleryInscription" }
];

// ---------------------------------------------------------------------------
// Architectural cutouts / parts — assets/steinerne-bruecke/bruckmandl/cutouts/
// id naming matches the canonical MASTER filenames 1:1 (see
// 03_ASSETS/Steinerne_Bruecke/Bruckmandl/03_PNG_CUTOUTS/) — never re-derive
// or guess a shorter id here. Labels resolved from
// t(lang, "bruckmandlCutoutLabels")[id] at render time.
// ---------------------------------------------------------------------------
const CUTOUT_ASSETS = [
  { id: "figure", file: "bruckmandl_cutout_01_figure.png" },
  { id: "gable_cap", file: "bruckmandl_cutout_02_gable_cap.png" },
  { id: "shield_panel_keys", file: "bruckmandl_cutout_03_shield_panel_keys.png" },
  { id: "inscription_hand_panel", file: "bruckmandl_cutout_04_inscription_hand_panel.png" },
  { id: "shield_panel_lion_with_cap", file: "bruckmandl_cutout_05_shield_panel_lion_with_cap.png" },
  { id: "capital_cornice", file: "bruckmandl_cutout_06_capital_cornice.png" },
  { id: "column_and_base", file: "bruckmandl_cutout_07_column_and_base.png" }
];

// ---------------------------------------------------------------------------
// Five material/detail crops — assets/steinerne-bruecke/bruckmandl/materials/
// Deliberately NOT paired with a stone-type label here — the current
// figure's material remains NEEDS_REVIEW in CLAIM_SOURCE_MAP.json
// (bruckmandl_material_current). Labels resolved from
// t(lang, "bruckmandlMaterialLabels")[id] at render time.
// ---------------------------------------------------------------------------
const MATERIAL_ASSETS = [
  { id: "stone_surface", file: "bruckmandl_material_01_stone_surface.png" },
  { id: "weathering", file: "bruckmandl_material_02_weathering.png" },
  { id: "inscription_surface", file: "bruckmandl_material_03_inscription_surface.png" },
  { id: "relief_surface", file: "bruckmandl_material_04_relief_surface.png" },
  { id: "column_surface", file: "bruckmandl_material_05_column_surface.png" }
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
  master: "bruckmandl_ai_master.png",
  idle: "bruckmandl_ai_idle.png",
  welcome: "bruckmandl_ai_welcome.png",
  point: "bruckmandl_ai_point.png",
  talk: "bruckmandl_ai_talk.png",
  expression_01_neutral: "bruckmandl_ai_expression_01_neutral.png",
  expression_02_friendly: "bruckmandl_ai_expression_02_friendly.png",
  expression_03_explain: "bruckmandl_ai_expression_03_explain.png"
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

// Small GSAP ScrollTrigger-driven entrance reveal, reusing the exact
// fromTo(autoAlpha/y)/toggleActions pattern already used elsewhere on this
// page (js/main.js's buildFactsReveal()). Falls back to an instant, fully
// visible state when GSAP is unavailable or the visitor prefers reduced
// motion — never a blocked/invisible element.
function revealOnScroll(target, index, reduced) {
  if (!target) return;
  if (reduced || typeof gsap === "undefined") {
    target.style.opacity = "1";
    target.style.transform = "none";
    return;
  }
  const tween = gsap.fromTo(
    target,
    { autoAlpha: 0, y: 36 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out",
      delay: (index || 0) * 0.06,
      scrollTrigger: {
        trigger: target,
        start: "top 90%",
        toggleActions: "play none none reverse"
      }
    }
  );
  if (tween && tween.scrollTrigger) ztScrollTriggers.push(tween.scrollTrigger);
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
  target.classList.add("bruckmandl__exploded-piece--linked");
  aiScheduleTimer(() => target.classList.remove("bruckmandl__exploded-piece--linked"), 2400);
}

// ---------------------------------------------------------------------------
// INSPECTION MODE — shared fullscreen piece viewer for BOTH galleries.
// Appended to document.body (a true fullscreen layer, not confined to
// .bruckmandl__inner's own stacking context/overflow) — so, unlike every
// other piece of this module's DOM, it is NOT removed automatically by
// render()'s `inner.innerHTML = ""` sweep. closeInspection() is therefore
// called explicitly at the top of render() (see aiClearTimers()'s identical
// precedent) so a language switch can never leave a detached overlay + a
// dangling document-level keydown listener + a locked <body> scroll behind.
// ---------------------------------------------------------------------------
let ztInspectionEl = null;
let ztInspectionKeydownHandler = null;
let ztInspectionReturnFocusEl = null;
let ztInspectionPrevBodyOverflow = "";

function closeInspection() {
  if (!ztInspectionEl) return;
  if (ztInspectionKeydownHandler) {
    document.removeEventListener("keydown", ztInspectionKeydownHandler);
    ztInspectionKeydownHandler = null;
  }
  ztInspectionEl.remove();
  ztInspectionEl = null;
  document.body.style.overflow = ztInspectionPrevBodyOverflow;
  const returnEl = ztInspectionReturnFocusEl;
  ztInspectionReturnFocusEl = null;
  if (returnEl && typeof returnEl.focus === "function") returnEl.focus();
  // SECTION REACTIONS (brief §6) — "inspection mode" is one of the existing
  // events the brief asks Brückmandl to react to. A pure ambient pose hold
  // (never showAnswer()/text — see HARD CONSTRAINT 4), released the instant
  // Inspection Mode closes. No-ops if the assistant isn't mounted (initial
  // page load before renderAssistant() has run once) or is mid-way through
  // a REAL answer (ambientAmbient's own isAnswerActive gate — see
  // renderAssistant() below).
  if (ztAssistantAmbient) ztAssistantAmbient.release();
}

// Shared two-layer crossfade image stage — used by BOTH the Gallery 01 hero
// viewer and Inspection Mode's own stage. Two stacked <img> layers instead
// of a single swapped `src` (the previous implementation): swapping `src`
// alone is an instant cut with no transition. The outgoing frame stays
// visible and in place while the incoming frame fades/slides/scales in with
// a minimal transitory blur, then the outgoing layer is discarded. Respects
// prefers-reduced-motion by degrading to an instant swap (see
// prefersReducedMotion() above). DEVIATION FROM BRIEF (documented in the
// delivery report): the View Transitions API is intentionally NOT used here
// — its browser support/testability tradeoffs made the always-safe, fully
// verifiable two-layer CSS-transition approach the more defensible choice
// for "fallback seguro"; this mechanism already delivers every visual
// requirement (crossfade, scale/depth, directional movement, minimal blur).
function createCrossfadeStage(stageExtraClass, initialUrl, initialAlt) {
  const stage = el("div", `zt-crossfade ${stageExtraClass}`);
  const layerA = el("img", "zt-crossfade__img zt-crossfade__img--active", { alt: initialAlt || "", draggable: "false" });
  layerA.src = initialUrl;
  const layerB = el("img", "zt-crossfade__img", { alt: "", draggable: "false" });
  stage.appendChild(layerA);
  stage.appendChild(layerB);
  let active = layerA;
  let inactive = layerB;

  function swapTo(url, alt, direction) {
    if (prefersReducedMotion()) {
      active.src = url;
      active.alt = alt || "";
      return;
    }
    const enterSide = direction < 0 ? "zt-crossfade__img--enter-left" : "zt-crossfade__img--enter-right";
    const exitSide = direction < 0 ? "zt-crossfade__img--exit-right" : "zt-crossfade__img--exit-left";
    inactive.src = url;
    inactive.alt = alt || "";
    inactive.classList.add(enterSide);
    // Force a reflow so the "enter" starting transform above is committed
    // before the next line flips it to --active — without this the browser
    // can coalesce both class changes into a single frame and skip the
    // transition entirely.
    void inactive.offsetWidth;
    inactive.classList.add("zt-crossfade__img--active");
    inactive.classList.remove(enterSide);
    active.classList.remove("zt-crossfade__img--active");
    active.classList.add(exitSide);
    const prevActive = active;
    active = inactive;
    inactive = prevActive;
    window.setTimeout(() => {
      inactive.classList.remove(
        "zt-crossfade__img--exit-left",
        "zt-crossfade__img--exit-right",
        "zt-crossfade__img--enter-left",
        "zt-crossfade__img--enter-right"
      );
    }, 700);
  }

  return { stageEl: stage, swapTo };
}

// Shared, minimal fullscreen piece viewer opened by Gallery 01's hero expand
// control (cycles the 4 gallery views) and by Gallery 02's non-hotspot
// pieces (cycles that piece's own cutouts/materials collection). Never
// opened FROM a hotspot-enabled card — those keep their existing,
// regression-tested tap -> BRUCKMANDL_HOTSPOT_EVENT behavior completely
// unchanged. Its own optional "ask" affordance (rendered only when the
// current item is hotspot-enabled) dispatches the EXACT SAME event, never a
// second/duplicated QA path — see the module header for the full chain.
// @param {{items: Array<{id:string,url:string,name:string,category:string,isHotspot:boolean}>,
//           startIndex: number, t: Function, lang: string, ui: object, triggerEl?: Element}} params
function openInspection({ items, startIndex, t, lang, ui, triggerEl }) {
  if (!items || !items.length) return;
  closeInspection();
  ztInspectionReturnFocusEl = triggerEl || null;
  ztInspectionPrevBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  // SECTION REACTIONS (brief §6) — the visitor is now closely examining a
  // piece; hold a "point"/attentive pose for as long as Inspection Mode
  // stays open (released above in closeInspection()). Pure ambient pose
  // only, gated by the same isAnswerActive priority rule as every other
  // ambient reaction (see renderAssistant()'s ambientSetPose()).
  if (ztAssistantAmbient) ztAssistantAmbient.hold("point");

  let index = ((startIndex % items.length) + items.length) % items.length;

  const overlay = el("div", "bruckmandl__inspect", { role: "dialog", "aria-modal": "true" });
  const stage = el("div", "bruckmandl__inspect-stage");
  const crossfade = createCrossfadeStage("bruckmandl__inspect-frame", items[index].url, items[index].name || "");
  stage.appendChild(crossfade.stageEl);

  const closeBtn = el("button", "bruckmandl__inspect-close", { type: "button", "aria-label": t(lang, "bruckmandlInspectClose") });
  closeBtn.textContent = "×";
  stage.appendChild(closeBtn);

  let prevBtn = null;
  let nextBtn = null;
  if (items.length > 1) {
    prevBtn = el("button", "bruckmandl__inspect-nav bruckmandl__inspect-nav--prev", { type: "button", "aria-label": t(lang, "bruckmandlInspectPrev") });
    prevBtn.textContent = "‹";
    nextBtn = el("button", "bruckmandl__inspect-nav bruckmandl__inspect-nav--next", { type: "button", "aria-label": t(lang, "bruckmandlInspectNext") });
    nextBtn.textContent = "›";
    stage.appendChild(prevBtn);
    stage.appendChild(nextBtn);
  }

  const annotation = el("button", "bruckmandl__inspect-annotation", { type: "button", hidden: "" });
  annotation.appendChild(el("span", "bruckmandl__inspect-annotation-line", { "aria-hidden": "true" }));
  const annotationLabel = el("span", "bruckmandl__inspect-annotation-label");
  annotation.appendChild(annotationLabel);
  stage.appendChild(annotation);

  const meta = el("div", "bruckmandl__inspect-meta");
  const indexEl = el("p", "bruckmandl__inspect-index");
  const nameEl = el("h4", "bruckmandl__inspect-name");
  const categoryEl = el("p", "bruckmandl__inspect-category");
  const askWrap = el("div", "bruckmandl__inspect-ask-wrap");
  meta.appendChild(indexEl);
  meta.appendChild(nameEl);
  meta.appendChild(categoryEl);
  meta.appendChild(askWrap);

  overlay.appendChild(stage);
  overlay.appendChild(meta);
  document.body.appendChild(overlay);
  ztInspectionEl = overlay;

  function renderCurrent(direction) {
    const item = items[index];
    if (direction != null) crossfade.swapTo(item.url, item.name || "", direction);
    indexEl.textContent = items.length > 1
      ? `${String(index + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`
      : "";
    nameEl.textContent = item.name || "";
    categoryEl.textContent = item.category || "";
    overlay.setAttribute("aria-label", [item.category, item.name].filter(Boolean).join(" — "));

    askWrap.innerHTML = "";
    annotation.hidden = true;
    if (item.isHotspot) {
      const askLabel = item.name ? `${item.name} — ${ui.heading || ""}` : (ui.heading || "");
      const askBtn = el("button", "bruckmandl__inspect-ask", { type: "button" });
      askBtn.textContent = ui.heading || "";
      askBtn.setAttribute("aria-label", askLabel);
      askBtn.addEventListener("click", () => {
        document.dispatchEvent(new CustomEvent(BRUCKMANDL_HOTSPOT_EVENT, { detail: { hotspotId: item.id } }));
        highlightExplodedPiece(item.id);
      });
      askWrap.appendChild(askBtn);

      annotation.hidden = false;
      annotationLabel.textContent = item.name || "";
      annotation.setAttribute("aria-label", askLabel);
      annotation.onclick = () => askBtn.click();
    }
  }

  function go(delta) {
    if (items.length < 2) return;
    index = ((index + delta) % items.length + items.length) % items.length;
    renderCurrent(delta > 0 ? 1 : -1);
  }

  if (prevBtn) prevBtn.addEventListener("click", () => go(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => go(1));
  closeBtn.addEventListener("click", closeInspection);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeInspection(); });

  ztInspectionKeydownHandler = (e) => {
    if (e.key === "Escape") { e.preventDefault(); closeInspection(); }
    else if (e.key === "ArrowRight") { go(1); }
    else if (e.key === "ArrowLeft") { go(-1); }
  };
  document.addEventListener("keydown", ztInspectionKeydownHandler);

  let touchStartX = null;
  stage.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener("touchend", (e) => {
    if (touchStartX == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchStartX = null;
  }, { passive: true });

  renderCurrent(null);
  closeBtn.focus();
}

// Drives Gallery 01's "physical piece in a digital vitrine" motion: a small
// pointer-following tilt (rotateX/rotateY, clamped to a few degrees) plus an
// extremely slow, near-imperceptible breathing scale — both computed in a
// single rAF loop so they combine smoothly without a CSS-animation/inline-
// style transform conflict. No-ops entirely under prefers-reduced-motion
// (the stage stays perfectly static). pointermove/pointerleave are attached
// to `stageEl`, a DOM node rebuilt by every render() — no explicit removal
// needed (see the module-level cleanup note above); the rAF id itself is the
// only thing requiring the explicit ztStopViewerRaf() teardown.
function startHeroMotion(tiltEl, stageEl) {
  if (prefersReducedMotion()) return;
  let targetRX = 0;
  let targetRY = 0;
  let curRX = 0;
  let curRY = 0;
  const startTime = performance.now();

  stageEl.addEventListener("pointermove", (e) => {
    const rect = stageEl.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    targetRY = (px - 0.5) * 10;
    targetRX = (0.5 - py) * 8;
    stageEl.style.setProperty("--vpx", `${(px * 100).toFixed(1)}%`);
    stageEl.style.setProperty("--vpy", `${(py * 100).toFixed(1)}%`);
  });
  stageEl.addEventListener("pointerleave", () => {
    targetRX = 0;
    targetRY = 0;
  });

  function tick(now) {
    curRX += (targetRX - curRX) * 0.08;
    curRY += (targetRY - curRY) * 0.08;
    const breathe = 1 + Math.sin((now - startTime) / 1900) * 0.008;
    tiltEl.style.transform = `rotateX(${curRX.toFixed(2)}deg) rotateY(${curRY.toFixed(2)}deg) scale(${breathe.toFixed(4)})`;
    ztViewerRafId = window.requestAnimationFrame(tick);
  }
  ztViewerRafId = window.requestAnimationFrame(tick);
}

// ---------------------------------------------------------------------------
// GALLERY 01 — CINEMATIC ARTIFACT VIEWER. Replaces the former independent
// renderHero()/renderGallery() pair: the master image used to be a separate
// "hero" asset byte-identical to the gallery's own FRONT entry (confirmed
// duplicate — same file size/pixels, see the delivery report) — it is now
// simply the gallery's first entry, so the big artifact image and the
// FRONT/BACK/SIDE/INSCRIPTION selector below it are ONE connected object,
// not two unrelated images. Selecting a view crossfades the SAME stage
// (createCrossfadeStage()) with directional movement + minimal blur;
// desktop pointer movement drives a small, restrained parallax tilt +
// specular sheen (startHeroMotion()) so the artifact reads as a physical
// piece in a vitrine, never a spinning novelty (no rotation is ever
// simulated — only 4 real photographed views exist). Hotspot dots reuse the
// EXACT existing tap -> BRUCKMANDL_HOTSPOT_EVENT -> bridge -> assistant
// chain (see HOTSPOT_ENABLED_CUTOUT_IDS/HERO_VIEW_HOTSPOTS above) — no new
// event, no duplicated QA rendering. Clicking the hero itself (or its
// explicit "enlarge" control) opens the shared Inspection Mode, cycling
// through the same 4 views.
// ---------------------------------------------------------------------------
function renderArtifactViewer(container, assets, t, lang, ui) {
  const views = assets.gallery;
  if (!views || !views.length) return;

  container.appendChild(el("p", "bruckmandl__section-label")).textContent = t(lang, "bruckmandlGalleryLabel");

  const cutoutLabels = t(lang, "bruckmandlCutoutLabels") || {};
  const categoryLabel = t(lang, "bruckmandlCutoutsLabel") || "";

  const viewer = el("div", "bruckmandl__viewer");
  const stage = el("div", "bruckmandl__viewer-stage");
  const tilt = el("div", "bruckmandl__viewer-tilt");

  let activeIndex = 0;
  const firstView = views[0];
  const crossfade = createCrossfadeStage("bruckmandl__viewer-frame", firstView.url, t(lang, firstView.labelKey) || "");
  tilt.appendChild(crossfade.stageEl);

  const hotspotLayer = el("div", "bruckmandl__viewer-hotspots");
  tilt.appendChild(hotspotLayer);

  const sheen = el("div", "bruckmandl__viewer-sheen", { "aria-hidden": "true" });
  const expandBtn = el("button", "bruckmandl__viewer-expand", { type: "button", "aria-label": t(lang, "bruckmandlInspectOpen") });
  expandBtn.textContent = "⤢";

  stage.appendChild(tilt);
  stage.appendChild(sheen);
  stage.appendChild(expandBtn);
  viewer.appendChild(stage);

  const microtext = el("div", "bruckmandl__viewer-microtext", { "aria-live": "polite" });
  microtext.hidden = true;
  const microName = el("p", "bruckmandl__viewer-microtext-name");
  const microCategory = el("p", "bruckmandl__viewer-microtext-category");
  const microBadge = el("span", "bruckmandl__viewer-microtext-badge");
  microtext.appendChild(microName);
  microtext.appendChild(microCategory);
  microtext.appendChild(microBadge);
  viewer.appendChild(microtext);

  function showMicrotext(hotspotId) {
    const name = cutoutLabels[hotspotId];
    if (!name) { microtext.hidden = true; return; }
    microName.textContent = name;
    microCategory.textContent = categoryLabel;
    microBadge.textContent = ui.heading || "";
    microtext.hidden = false;
  }
  function hideMicrotext() { microtext.hidden = true; }

  // Reuses the EXACT existing hotspot chain (see HOTSPOT_ENABLED_CUTOUT_IDS
  // above / renderExplodedCollection() below): dispatches the same
  // BRUCKMANDL_HOTSPOT_EVENT the media cards already fire, resolved by
  // STEINERNE_BRUECKE/js/bruckmandl-hotspot-bridge.js into the assistant's
  // own POINT/TALK answer (auto-scrolled into view by that existing chain —
  // untouched here). The hero's own microtext (name/category/badge only,
  // never the validated answer text itself — see HARD CONSTRAINT 4 / the
  // delivery report) is a purely local, non-duplicated addition.
  function fireHotspot(hotspotId) {
    document.dispatchEvent(new CustomEvent(BRUCKMANDL_HOTSPOT_EVENT, { detail: { hotspotId } }));
    showMicrotext(hotspotId);
    highlightExplodedPiece(hotspotId);
  }

  function renderHotspots(viewId) {
    hotspotLayer.innerHTML = "";
    const points = HERO_VIEW_HOTSPOTS[viewId] || [];
    points.forEach((point) => {
      const label = cutoutLabels[point.id] || "";
      const dot = el("button", "bruckmandl__viewer-hotspot", {
        type: "button",
        style: `left:${point.x}%; top:${point.y}%;`,
        "aria-label": label ? (ui.heading ? `${label} — ${ui.heading}` : label) : (ui.heading || "")
      });
      dot.addEventListener("click", () => fireHotspot(point.id));
      hotspotLayer.appendChild(dot);
    });
  }

  const selector = el("div", "bruckmandl__viewer-selector", {
    role: "tablist",
    "aria-label": t(lang, "bruckmandlGalleryLabel")
  });
  const tabs = [];

  function focusActiveTab() {
    if (tabs[activeIndex]) tabs[activeIndex].focus();
  }

  function activateView(index, options) {
    const animate = !options || options.animate !== false;
    const prevIndex = activeIndex;
    activeIndex = ((index % views.length) + views.length) % views.length;
    const view = views[activeIndex];
    const alt = t(lang, view.labelKey) || "";
    if (animate && activeIndex !== prevIndex) {
      crossfade.swapTo(view.url, alt, activeIndex > prevIndex ? 1 : -1);
    }
    renderHotspots(view.id);
    hideMicrotext();
    tabs.forEach((tabBtn, i) => {
      const isActive = i === activeIndex;
      tabBtn.classList.toggle("is-active", isActive);
      tabBtn.setAttribute("aria-selected", isActive ? "true" : "false");
      tabBtn.setAttribute("tabindex", isActive ? "0" : "-1");
    });
  }

  views.forEach((view, i) => {
    const tabBtn = el("button", "bruckmandl__viewer-tab", {
      type: "button",
      role: "tab",
      "aria-selected": i === 0 ? "true" : "false",
      tabindex: i === 0 ? "0" : "-1"
    });
    tabBtn.appendChild(el("span", "bruckmandl__viewer-tab-index")).textContent = String(i + 1).padStart(2, "0");
    tabBtn.appendChild(el("span", "bruckmandl__viewer-tab-label")).textContent = t(lang, view.labelKey) || "";

    tabBtn.addEventListener("click", () => activateView(i));
    tabBtn.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        activateView(i + 1);
        focusActiveTab();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        activateView(i - 1);
        focusActiveTab();
      } else if (e.key === "Home") {
        e.preventDefault();
        activateView(0);
        focusActiveTab();
      } else if (e.key === "End") {
        e.preventDefault();
        activateView(views.length - 1);
        focusActiveTab();
      }
    });

    tabs.push(tabBtn);
    selector.appendChild(tabBtn);
  });

  viewer.appendChild(selector);
  container.appendChild(viewer);

  // Initial paint — no crossfade animation needed, layerA already holds the
  // first view's image.
  renderHotspots(views[0].id);
  tabs[0].classList.add("is-active");

  function openHeroInspection() {
    const items = views.map((view) => ({
      id: view.id,
      url: view.url,
      name: t(lang, view.labelKey) || "",
      category: t(lang, "bruckmandlGalleryLabel") || "",
      isHotspot: false
    }));
    openInspection({ items, startIndex: activeIndex, t, lang, ui, triggerEl: expandBtn });
  }
  expandBtn.addEventListener("click", openHeroInspection);
  crossfade.stageEl.style.cursor = "pointer";
  crossfade.stageEl.addEventListener("click", openHeroInspection);

  startHeroMotion(tilt, stage);
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
// GALLERY 02 — EXPLODED INTERACTIVE COLLECTION. Replaces the former
// renderMediaStrip()'s uniform horizontal-scroll grid of square cards (used
// for BOTH the materials and cutouts sections) with an asymmetric editorial
// layout — hero/medium/small pieces + negative space, a CSS grid on desktop
// and an offset editorial stack on mobile (see css/style.css's
// .bruckmandl__exploded rules). hotspotIds keeps its EXACT existing meaning/
// behavior from renderMediaStrip() (tap/click/keydown -> the SAME
// BRUCKMANDL_HOTSPOT_EVENT, completely unchanged); pieces WITHOUT a hotspot
// mapping open the shared Inspection Mode (openInspection()) instead —
// never both on the same piece, and never a hotspot id outside the already-
// reviewed HOTSPOT_ENABLED_CUTOUT_IDS/HOTSPOT_ENABLED_MATERIAL_IDS sets.
// opts.registerPieces (used only for the CUTOUTS call) records each piece's
// element in ztExplodedPieceEls so a Gallery 01 hero hotspot can visually
// echo-highlight its corresponding Gallery 02 piece (highlightExplodedPiece()
// above) — the brief's "connection between galleries", implemented as a
// same-page visual echo rather than a forced/ambiguous cross-navigation.
// ---------------------------------------------------------------------------
const EXPLODED_SIZE_PATTERN = ["hero", "sm", "md", "sm", "sm", "md", "sm"];

function renderExplodedCollection(container, labelKey, rawAssets, labelMapKey, t, lang, hotspotIds, ui, opts) {
  const options = opts || {};
  container.appendChild(el("p", "bruckmandl__section-label")).textContent = t(lang, labelKey);
  const grid = el("div", "bruckmandl__exploded");
  const labelMap = t(lang, labelMapKey) || {};
  const categoryLabel = t(lang, labelKey) || "";
  const reduced = prefersReducedMotion();
  const canHover = !(window.matchMedia && window.matchMedia("(hover: none)").matches);

  const items = rawAssets.map((item) => ({
    id: item.id,
    url: item.url,
    name: labelMap[item.id] || "",
    category: categoryLabel,
    isHotspot: !!(hotspotIds && hotspotIds.has(item.id))
  }));

  items.forEach((item, i) => {
    const size = EXPLODED_SIZE_PATTERN[i % EXPLODED_SIZE_PATTERN.length];
    const pieceClass = `bruckmandl__exploded-piece bruckmandl__exploded-piece--${size}` + (item.isHotspot ? " bruckmandl__exploded-piece--hotspot" : "");
    const piece = el("div", pieceClass, { role: "button", tabindex: "0" });
    const label = item.isHotspot && ui && ui.heading ? `${item.name} — ${ui.heading}` : item.name;
    piece.setAttribute("aria-label", label || "");

    const figure = el("div", "bruckmandl__exploded-figure");
    const img = el("img", "bruckmandl__exploded-img", { alt: item.name, draggable: "false" });
    img.src = item.url;
    figure.appendChild(img);
    piece.appendChild(figure);
    piece.appendChild(el("p", "bruckmandl__exploded-caption")).textContent = item.name;

    function activate() {
      if (item.isHotspot) {
        document.dispatchEvent(new CustomEvent(BRUCKMANDL_HOTSPOT_EVENT, { detail: { hotspotId: item.id } }));
      } else {
        openInspection({ items, startIndex: i, t, lang, ui, triggerEl: piece });
      }
    }
    piece.addEventListener("click", activate);
    piece.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        activate();
      }
    });

    if (!reduced && canHover) {
      piece.addEventListener("pointermove", (e) => {
        const rect = piece.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        piece.style.setProperty("--epx", `${(px * 6).toFixed(2)}deg`);
        piece.style.setProperty("--epy", `${(py * -6).toFixed(2)}deg`);
      });
      piece.addEventListener("pointerleave", () => {
        piece.style.setProperty("--epx", "0deg");
        piece.style.setProperty("--epy", "0deg");
      });
    }

    if (options.registerPieces) ztExplodedPieceEls[item.id] = piece;

    grid.appendChild(piece);
    revealOnScroll(piece, i, reduced);
  });

  container.appendChild(grid);
}

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
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) closePanel(); });

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
      if (ztInspectionEl) ambientSetPose("point");
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
  observeAwareness(container.querySelector(".bruckmandl__viewer-stage"), () => {
    ambientPose("point", 1600);
    gazeTowards(-3, 1600);
  });

  // Gallery 02's two exploded collections (materials + cutouts) -> POINT +
  // a small gaze lean the other way.
  container.querySelectorAll(".bruckmandl__exploded").forEach((gridEl) => {
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
  closeInspection();
  // Reset AFTER closeInspection() above (which, if a previous render's
  // Inspection Mode was still open, calls the PREVIOUS render's own
  // ztAssistantAmbient.release() one last time) so this render starts with
  // a clean null hook — openInspection()/closeInspection() defensively
  // no-op via `if (ztAssistantAmbient)` whenever nothing is mounted yet.
  ztAssistantAmbient = null;
  ztExplodedPieceEls = {};
  inner.innerHTML = "";
  renderIntro(inner, t, lang);
  renderArtifactViewer(inner, assets, t, lang, ui);
  // TEMPORARY PUBLICATION FIX (2026-09-07): video block hidden until a
  // better replacement video is uploaded. renderVideo() itself is untouched
  // below — restore by uncommenting the next line.
  // renderVideo(inner, assets, t, lang);
  renderHistory(inner, t, lang);
  renderLegend(inner, t, lang);
  renderFactcheck(inner, t, lang);
  renderExplodedCollection(inner, "bruckmandlMaterialsLabel", assets.materials, "bruckmandlMaterialLabels", t, lang, HOTSPOT_ENABLED_MATERIAL_IDS, ui, {});
  renderExplodedCollection(inner, "bruckmandlCutoutsLabel", assets.cutouts, "bruckmandlCutoutLabels", t, lang, HOTSPOT_ENABLED_CUTOUT_IDS, ui, { registerPieces: true });
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
