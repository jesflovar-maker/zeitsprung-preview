/* ZEITSPRUNG V2 — main.js
   Orchestration: Lenis smooth scroll + GSAP + ScrollTrigger as the PRIMARY motion
   stack for the whole scroll-driven historical journey (scrubbed timelines,
   pinned sections) — reinterpreting patterns studied from a CodePen reference
   (Filip Zrnzevic, "Layout Explorations with Gsap, Lenis and ScrollTrigger N°5"),
   without copying its literal assets, fonts, text or code.

   Libraries loaded via CDN as native ES modules / UMD globals (no Node/npm/Vite
   available in this environment):
   - GSAP core + ScrollTrigger  (jsdelivr CDN, UMD -> window.gsap / window.ScrollTrigger)
   - Lenis                      (jsdelivr CDN, UMD -> window.Lenis)
   - Three.js                   (jsdelivr CDN, native ES module — see viewer3d.js)
   This is still "GSAP + ScrollTrigger + Lenis as primary motion stack" exactly as
   requested — only the delivery mechanism (CDN vs. bundler) differs. */

import { DICT, getInitialLang, setLang, applyI18n, t } from "./i18n.js";
import { buildPortal } from "./portal.js";
import { initMuseum25D } from "./museum25d.js";
import { initKframesGallery } from "./kframes-gallery.js";
import { ZT_AUDIO_BUS } from "../../js/zt-audio.js";
import { activate, deactivate, getDebugSnapshot } from "../../js/video-playback.js";
import { STEINERNE_ASSET_BASE, STEINERNE_WEB_ASSET_BASE, ASSET_SWAP_MANIFEST_URL } from "../../js/zt-paths.js";
// PHASE 3.0A — Section 7. READ-ONLY proof that central "monument capability"
// config can be loaded at runtime — see js/zt-feature-flags.js's own header
// for why this is deliberately NOT used to gate any UI yet. Only consumed
// below by ztLoadFeatureFlags(), a non-blocking, purely diagnostic call.
import { getFeatureFlags } from "../../js/zt-feature-flags.js";
// PHASE 2.6 — TASK 2 / TASK 4. Reuses the SAME reusable typography module
// already consumed by museum2d-scroll.js and kframes-gallery.js (see those
// files' own createZtTypography() call sites for the original pattern).
// zt-typography.js itself is NOT modified — this file only supplies its own
// small, real-time (non-scroll-scrubbed) "engine" adapter below, mirroring
// kframes-gallery.js's engineSet/makeEngineTw/makeEngineTween exactly, for
// the two one-shot beats that do not belong to any existing pinned timeline:
// the #intro-gate title (revealed once on page load) and the historical
// reel's title (revealed once on scroll-into-view).
import { createZtTypography, ztVisualLength } from "./zt-typography.js";
// viewer3d.js (and the three.js/GLTFLoader/OrbitControls modules it imports)
// is loaded via dynamic import() inside wireThreeDChapter() only, and only
// when THREE_D_ENABLED is true — while disabled, none of those module files
// are even requested over the network, not just visually hidden.

const ASSET_BASE = STEINERNE_ASSET_BASE;

// PHASE 3.0 — Section 23 debug aid, same convention as js/index-main.js's
// ztLogDebugState(): `?debug=1` logs a one-shot state snapshot to the
// console only. Inert otherwise.
const ZT_DEBUG = new URLSearchParams(location.search).get("debug") === "1";
// PHASE 3.0A — Section 7. Fire-and-forget, non-blocking read of this
// monument's featureFlags via js/zt-feature-flags.js, stored on a namespaced
// global for inspection (`window.ZT_FEATURE_FLAGS`) and always console-
// logged (independent of `?debug=1` — this is architecture-proof, not a
// debug aid). Does NOT gate/activate any feature: no `if (flags.x)`
// conditional exists anywhere in this file. See zt-feature-flags.js's header
// for why wiring an actual UI conditional is an explicitly separate, future
// task.
function ztLoadFeatureFlags() {
  getFeatureFlags("steinerne-bruecke").then((flags) => {
    window.ZT_FEATURE_FLAGS = flags;
    // eslint-disable-next-line no-console
    console.log("[ZT_FEATURE_FLAGS] steinerne-bruecke:", flags);
  });
}

function ztLogDebugState() {
  if (!ZT_DEBUG) return;
  const introVideo = document.getElementById("introVideo");
  // eslint-disable-next-line no-console
  console.log("[ZEITSPRUNG debug]", {
    route: location.pathname,
    basePath: location.pathname.replace(/index\.html?$/, ""),
    language: lang,
    currentMonument: "steinerne-bruecke",
    activeMediaSrc: introVideo ? (introVideo.currentSrc || introVideo.src || null) : null,
    videos: getDebugSnapshot()
  });
}

// ---------------------------------------------------------------------------
// PHASE 2.6 — web-optimized derivative base for the NEW hero/intro/flyover/
// reel media (muted, faststart, video-only .mp4 / plain .png copies of the
// approved 03_ASSETS/Steinerne_Bruecke masters, already produced upstream of
// this task — see the per-usage comments below for exact provenance).
// Mirrors museum25d.js's SLOT_BASE convention: playback in this file NEVER
// points at a raw 03_ASSETS/... master path, only at this derived, web-ready
// copy. The masters themselves are untouched and remain the source of truth.
// ---------------------------------------------------------------------------
const WEB_ASSET_BASE = STEINERNE_WEB_ASSET_BASE;

// ---------------------------------------------------------------------------
// FEATURE FLAGS
// ---------------------------------------------------------------------------
// THREE_D_ENABLED — single switch for the #threeD GLB chapter (nav entry +
// section + Three.js init). Set to true to restore it with zero other
// changes: viewer3d.js, the GLB files and the manifest are completely
// untouched by this flag — it only controls wiring/visibility here and in
// index.html's nav/section hidden state (applied at runtime below so the
// HTML markup itself is never deleted).
const THREE_D_ENABLED = false;

// ---------------------------------------------------------------------------
// #stage cutout asset resolution — mirrors museum25d.js's manifest-driven
// slot pattern (03_ASSETS/Steinerne_Bruecke/2d/ASSET_SWAP_MAP.json) so the
// "piers" chapter's approved museum cutout (slot_id "pfeiler_detail") has
// exactly ONE source of truth (the manifest entry / file on disk), never a
// hardcoded duplicate path. museum25d.js itself is intentionally NOT
// imported from here (out of scope for this task — its own logic must stay
// untouched); this is a standalone equivalent of its resolveSlot() just for
// this one slot, using the identical MANIFEST_URL / SLOT_BASE / resolution
// contract (status must be READY, file_path required).
// ---------------------------------------------------------------------------
const PFEILER_MANIFEST_URL = ASSET_SWAP_MANIFEST_URL;
const PFEILER_SLOT_BASE = STEINERNE_WEB_ASSET_BASE;
const PFEILER_CUTOUT_SLOT_ID = "pfeiler_detail";

async function resolvePfeilerCutoutUrl() {
  try {
    const res = await fetch(PFEILER_MANIFEST_URL, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const slot = (data.slots || []).find((s) => s && s.slot_id === PFEILER_CUTOUT_SLOT_ID);
    if (!slot || slot.status !== "READY" || !slot.file_path) return null;
    return encodeURI(`${PFEILER_SLOT_BASE}/${slot.file_path}`);
  } catch (err) {
    return null; // resolution failure -> caller keeps the legacy fallback image, never a broken layer
  }
}

// Kicked off immediately (module load), not awaited here — resolves well
// before the user reaches startExperience() (gated behind the intro-gate
// Start button), so it never delays first paint.
const pfeilerCutoutPromise = resolvePfeilerCutoutUrl();

// ---------------------------------------------------------------------------
// 9-state historical sequence — real classified assets from ASSET_MANIFEST.md
//
// Per-state visual fields (Task A, ZEITSPRUNG DESIGN scope authorized for
// #stage only, 2026-08-29):
//   objectFit      "cover" (default full-bleed photo treatment) or
//                  "contain" (used only by the "piers" cutout below)
//   objectPosition desktop/default CSS background-position value
//   backgroundSize desktop/default CSS background-size value (cutout only —
//                  cover states always use "cover", set generically in code)
//   mobile         optional override object for <=899px (same keys)
// Applied via JS (applyStageLayerStyle()) directly to whichever
// .stage__bg-layer is showing that state, never crammed into a single
// shared CSS rule — see buildStageScrollTrigger() below.
// ---------------------------------------------------------------------------
const STATES = [
  {
    key: "today-open",
    // -------------------------------------------------------------------
    // PHASE 2.6 — TASK 1, ACTIVE. Approved production hero
    // (03_ASSETS/Steinerne_Bruecke/IMAGES/HERO/sb_hero_current_9x16_v01.png,
    // 941x1672, ~9:16) replaces the provisional reference render below.
    // Verified by direct inspection: an aerial DIORAMA render — bridge,
    // Danube, old-town rooftops, Gothic cathedral spires — sitting on a
    // BLACK canvas with a generous, deliberate margin (the diorama reads as
    // a rotated diamond, with black triangular corners top and bottom), NOT
    // an edge-to-edge photo like the legacy image it replaces. Content is
    // concentrated in the upper ~90% of the frame; the lowest slice is
    // black already, which happens to line up well with keeping
    // .stage__caption's bottom-left safe zone clear.
    //
    // Because of that composition, this state is switched to the SAME
    // isCutout:true / objectFit:"contain" / dark-backdrop treatment already
    // established for the "piers" state below (an isolated floating cutout
    // on a near-black backdrop, matching the museum module's own cutout
    // convention) rather than the plain full-bleed "cover" used by every
    // other #stage state — "cover" on this asset would either show it
    // unmodified on a matching-aspect mobile viewport (harmless) or, on a
    // wide desktop viewport, crop deep into the diorama's edges (bridge/
    // cathedral) rather than into its black margin. "contain" guarantees
    // the whole diorama (bridge + cathedral + Danube) is always fully
    // visible at every breakpoint — the explicit requirement for this task.
    // Old crop values for a full-bleed photo (objectPosition "center 58%" /
    // mobile "42% center") were tuned for THAT image's framing and are not
    // reused here; see fresh values below, tuned for the diorama instead.
    img: `${WEB_ASSET_BASE}/hero/sb_hero_current_9x16_v01.png`,
    isCutout: true,
    objectFit: "contain",
    backgroundColor: "#08090b",
    // Desktop: generous height, biased slightly above vertical center so
    // the diorama's lower black margin (not its content) absorbs the space
    // nearest .stage__caption.
    objectPosition: "center 34%",
    backgroundSize: "auto 86vh",
    mobile: {
      // Mobile: shorter absolute height (mirrors the "piers" mobile
      // treatment below) so the diorama's visible bottom edge clears the
      // .stage__caption safe zone (bottom:78px + year/title/text block)
      // with margin, biased toward the top of the viewport.
      objectPosition: "center 22%",
      backgroundSize: "auto 64vh"
    }
  },
  // ---------------------------------------------------------------------
  // LEGACY_REFERENCE_ONLY (Phase 2.6 TASK 1) — the previous provisional
  // "today-open" hero. Preserved on disk, untouched, at:
  //   ASSET_BASE + "/IMAGES/REFERENCE/ChatGPT Image 16. Aug. 2026, 23_59_19 (9).png"
  // i.e. 03_ASSETS/Steinerne_Bruecke/IMAGES/REFERENCE/ChatGPT Image 16. Aug.
  // 2026, 23_59_19 (9).png. NOT deleted, NOT referenced by any STATES entry
  // above, NOT deployed. Kept here only as a documentation anchor in case a
  // future session needs to compare against it.
  // ---------------------------------------------------------------------
  {
    key: "before",
    img: `${ASSET_BASE}/IMAGES/REFERENCE/ChatGPT Image 16. Aug. 2026, 23_59_15 (1).png`,
    // Pre-bridge river/hamlet diorama: content fills the frame edge-to-edge
    // (walled settlement top-left, riverside construction/boats bottom),
    // no single dominant horizontal focal point — near-default framing is
    // already correct, just made explicit/deliberate here.
    objectFit: "cover",
    objectPosition: "center 52%",
    mobile: { objectPosition: "center center" }
  },
  {
    key: "foundation",
    img: `${ASSET_BASE}/IMAGES/MASTER/ChatGPT Image 16. Aug. 2026, 22_26_31 (4).png`,
    // Isolated pier cutaway diorama on a plain gradient backdrop, single
    // object already horizontally centered; vertically the object's mass
    // sits slightly below the frame's midline.
    objectFit: "cover",
    objectPosition: "center 56%",
    mobile: { objectPosition: "center center" }
  },
  {
    key: "piers",
    // PHASE (2026-08-29, authorized scope): this chapter now shows the
    // approved museum 2.5D cutout (manifest slot_id "pfeiler_detail",
    // 03_ASSETS/Steinerne_Bruecke/2d/ASSET_SWAP_MAP.json) instead of a
    // full-bleed cover photo — see resolvePfeilerCutoutUrl()/
    // pfeilerCutoutPromise above. `img` below is ONLY the legacy fallback
    // used if that manifest resolution fails for any reason ("no orphans"
    // rule — this chapter must never render empty). isCutout:true switches
    // this state to the contain/transparent-cutout rendering path in
    // applyStageLayerStyle() instead of the standard cover treatment.
    img: `${ASSET_BASE}/IMAGES/MASTER/ChatGPT Image 17. Aug. 2026, 00_00_04 (1).png`,
    isCutout: true,
    objectFit: "contain",
    backgroundColor: "#050506",
    // Desktop: distinctly larger/more generous than mobile (Task E) — a
    // bigger cutout so it doesn't read as "lost" in a large dark frame.
    objectPosition: "center 30%",
    backgroundSize: "auto 84vh",
    mobile: {
      // Mobile: smaller absolute height so the cutout's bottom edge clears
      // the .stage__caption safe zone (bottom:78px + text block, plus
      // margin) with room to spare, biased toward the top so nearly all of
      // the resulting empty space falls below the image, not above it
      // (top only needs to clear the navbar/language switcher).
      objectPosition: "center 20%",
      backgroundSize: "auto 68vh"
    }
  },
  {
    key: "arches",
    img: `${ASSET_BASE}/IMAGES/REFERENCE/ChatGPT Image 16. Aug. 2026, 22_26_33 (8).png`,
    // Bird's-eye construction diorama: town top-left, the era-defining
    // detail (timber arch-centering wheels + crane) sits center-right,
    // lower-mid frame. Framed to keep that cluster in view rather than the
    // comparatively empty sand foreground at the very bottom.
    // CLASSIFICATION: KEEP.
    objectFit: "cover",
    objectPosition: "center 60%",
    mobile: { objectPosition: "58% center" }
  },
  {
    key: "medieval",
    img: `${ASSET_BASE}/IMAGES/REFERENCE/ChatGPT Image 16. Aug. 2026, 22_26_31 (3).png`,
    // CLASSIFICATION: NEEDS_REPLACEMENT (user-confirmed, 2026-08-29) — this
    // foggy/stylized bridge render is NOT an approved final asset for the
    // "1146–1275 / Mittelalterliche Vollendung" chapter. Kept displaying
    // for now per explicit instruction (an empty chapter is worse than a
    // provisional one) and repositioned like every other state, but this
    // image itself must be swapped for an approved asset in a future task —
    // do not treat it as final.
    objectFit: "cover",
    objectPosition: "center 55%",
    mobile: { objectPosition: "center center" }
  },
  {
    key: "transform19c",
    img: `${ASSET_BASE}/IMAGES/REFERENCE/ChatGPT Image 16. Aug. 2026, 23_59_16 (4).png`,
    // Same overall composition family as "today-open" (cathedral + bridge),
    // but the era-defining detail here is the scaffolding on the spire, so
    // framed slightly higher than today-open to keep more of it visible.
    objectFit: "cover",
    objectPosition: "center 54%",
    mobile: { objectPosition: "center center" }
  },
  {
    key: "restoration",
    img: `${ASSET_BASE}/IMAGES/REFERENCE/ChatGPT Image 16. Aug. 2026, 23_59_18 (8).png`,
    // Post-restoration-era view: scaffolding/work detail sits on the bridge
    // deck itself (lower half of frame) rather than on the spire.
    // CLASSIFICATION: KEEP.
    objectFit: "cover",
    objectPosition: "center 60%",
    mobile: { objectPosition: "center center" }
  },
  {
    key: "today-close",
    // PHASE 2.7C — REPLACED. Old placeholder-named legacy render
    // ("ChatGPT Image 23. Aug. 2026, 15_21_40.png", 2172x724 landscape) is
    // now LEGACY_REFERENCE_ONLY — preserved on disk at its original path,
    // untouched, no longer referenced by any code. New approved asset:
    // 03_ASSETS/Steinerne_Bruecke/IMAGES:HERO/sb_present_hero_v02.png
    // (1536x2752, ~9:16 portrait — matches the design system's
    // portrait-first convention better than the old landscape placeholder),
    // web-optimized derivative copied to WEB_ASSET_BASE/present/ per the
    // project's own "never point at a raw 03_ASSETS master" convention.
    img: `${WEB_ASSET_BASE}/present/sb_present_hero_v02_web.jpg`,
    // Portrait ~9:16 source on a portrait #stage viewport — plain full-bleed
    // "cover" is now the correct treatment (no more 3:1-in-portrait crop
    // problem the old landscape asset required "68%/74% center" to manage).
    objectFit: "cover",
    objectPosition: "center 42%",
    mobile: { objectPosition: "center 38%" }
  }
];

// ---------------------------------------------------------------------------
// Task D — FUTURE mapping preparation only (inert, NOT wired up, NOT
// applied). Documents the additional manifest slots the user has named as
// likely future swaps for other #stage chapters, so a later task can wire
// them without re-discovering the mapping. Do NOT read/use this object
// anywhere yet — no chapter besides "piers" is authorized for an asset swap
// in this task.
// ---------------------------------------------------------------------------
const FUTURE_STAGE_CUTOUT_MAPPINGS_NOT_APPLIED = {
  piers: "pfeiler_detail_cutout.png", // APPLIED (this task) — see "piers" STATES entry above
  arches: "boegen_detail_cutout.png", // NOT APPLIED — future candidate for the "arches" chapter
  // "FAHRBAHN"/deck has no equivalent #stage chapter today (fahrbahn is a
  // #museum25d chapter only) — named here only because the user referenced
  // it alongside the others; not a #stage state key.
  fahrbahn: "fahrbahn_main_cutout.png", // NOT APPLIED — reference only, no matching #stage state
  construction: "bau_construction_cutout.png" // NOT APPLIED — no matching #stage state today
};

// PHASE 2.6 — TASK 3, ACTIVE. Approved production flyover
// (03_ASSETS/Steinerne_Bruecke/VIDEO/FLYOVER/sb_flyover_city_8s_v01.mp4 —
// filename says "8s", actual runtime is 15.04s, flagged not fixed here per
// brief — muted/faststart web derivative below) replaces the previous
// placeholder FPV source. Content verified by inspection: a dramatic sunset
// aerial flyover of the bridge/Danube/Regensburg/cathedral — matches this
// chapter's role exactly. #videoChapter's structure, fallback handling and
// scroll-triggered play/pause (buildVideoChapter() below) are UNCHANGED —
// this is a source swap only.
const VIDEO_PATH = `${WEB_ASSET_BASE}/flyover/sb_flyover_city_8s_v01_web.mp4`;

// LEGACY_REFERENCE_ONLY (Phase 2.6 TASK 3) — the previous FPV source stays
// on disk, untouched, at:
//   ASSET_BASE + "/VIDEO/FPV/fpv video szernernebrücke.mov"
// i.e. 03_ASSETS/Steinerne_Bruecke/VIDEO/FPV/fpv video szernernebrücke.mov.
// NOT deleted, NOT referenced by VIDEO_PATH above, NOT deployed.

let lang = getInitialLang();

// ---------------------------------------------------------------------------
// PHASE 2.6 — shared ZT typography adapter (TASK 2 intro-gate title, TASK 4
// historical reel title). One createZtTypography() instance is reused for
// BOTH beats — its title/lead registries are WeakMaps keyed by the actual
// DOM node, so multiple unrelated titles can share one instance safely
// (kframes-gallery.js does the same for its 12 K-frame captions). Each
// reveal call gets its own short-lived gsap.timeline() played once in real
// time (not scroll-scrubbed), exactly like kframes-gallery.js's
// revealFrameCaption() — tracked property state -> correct fromTo "from"
// values on the very first reveal, which the generic
// (k in cur) ? cur[k] : to[k] fallback cannot provide by itself.
// ---------------------------------------------------------------------------
const ztPropState = new Map();
function ztStFor(node) {
  if (!ztPropState.has(node)) ztPropState.set(node, {});
  return ztPropState.get(node);
}
function ztEngineSet(node, vars) {
  if (!node) return;
  Object.assign(ztStFor(node), vars);
  gsap.set(node, vars);
}
function ztMakeTw(tl) {
  return function (node, at, dur, to, ease) {
    if (!node || !(dur > 0)) return;
    const cur = ztStFor(node);
    const from = {};
    Object.keys(to).forEach((k) => { from[k] = (k in cur) ? cur[k] : to[k]; });
    tl.fromTo(node, from, Object.assign({}, to, {
      duration: dur, ease: ease || "power2.out", immediateRender: false
    }), at);
    Object.assign(cur, to);
  };
}
function ztMakeTween(tl) {
  return function (node, from, to, at, dur, ease) {
    if (!node || !(dur > 0)) return;
    tl.fromTo(node, from, Object.assign({}, to, {
      duration: dur, ease: ease || "power2.out", immediateRender: false
    }), at);
  };
}
let ztActiveTw = null;
let ztActiveTween = null;
let ztTypoSingleton = null;

function getZtTypo() {
  if (ztTypoSingleton) return ztTypoSingleton;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  ztTypoSingleton = createZtTypography({
    engine: {
      set: ztEngineSet,
      tw: (n, a, d, to, e) => { if (ztActiveTw) ztActiveTw(n, a, d, to, e); },
      tween: (n, f, to, a, d, e) => { if (ztActiveTween) ztActiveTween(n, f, to, a, d, e); }
    },
    reducedMotion,
    desktop: window.matchMedia("(min-width: 900px)").matches
  });
  return ztTypoSingleton;
}

/** Reveal one beat (a container with data-reveal children) in real time,
 * once, starting `delay` seconds from now. Returns the shared typo instance
 * so the caller can also mount/fill titles beforehand. */
function ztRevealBeatNow(beat, delay) {
  if (!beat) return;
  const tl = gsap.timeline({ delay: delay || 0 });
  ztActiveTw = ztMakeTw(tl);
  ztActiveTween = ztMakeTween(tl);
  getZtTypo().revealBeat(beat, 0);
  ztActiveTw = null;
  ztActiveTween = null;
}

// ---------------------------------------------------------------------------
// Bootstrapping
// ---------------------------------------------------------------------------
function boot() {
  applyI18n(lang);
  populateLangButtons();
  applyThreeDFeatureFlag();
  renderStageCaptionShell();
  renderFacts();
  wireIntroGate();
  buildIntroMedia();       // PHASE 2.6 TASK 2 — cinematic video layer
  buildIntroTypography();  // PHASE 2.6 TASK 2 — ZT title reveal over it
  ztLogDebugState();
  ztLoadFeatureFlags();    // PHASE 3.0A — Section 7, read-only, non-gating
}
// PHASE 2.6B — defensive complement to the click-buffering fix in
// wireIntroGate(): `type="module"` scripts execute deferred, so on a slow
// enough load `document.readyState` can already be past "loading" (i.e.
// DOMContentLoaded has already fired) by the time this line runs — a bare
// `addEventListener("DOMContentLoaded", boot)` at that point would register
// for an event that already happened and boot() would simply never run.
// Checking readyState first is the standard, spec-safe pattern that removes
// this whole class of "registered after the fact" timing bugs regardless of
// why this module took a while to reach this line.
//
// BUG FOUND AND FIXED during verification of the above: calling boot()
// SYNCHRONOUSLY in the "else" branch crashed with
// "ReferenceError: Cannot access 'currentStateIndex' before initialization"
// — boot() (via populateLangButtons()) reads module-scope `let` bindings
// (e.g. `currentStateIndex`) that are declared FURTHER DOWN in this same
// file. Those declarations only exist once the module's own top-level code
// has finished running top-to-bottom; calling boot() immediately, mid-file,
// pre-empts that and hits the temporal dead zone. This would have made the
// "else" branch — precisely the slow-load path this fix targets — crash
// completely instead of merely lagging, a regression worse than the
// original bug. Fix: `queueMicrotask` defers the call to run after the
// CURRENT script (the rest of this module's synchronous top-level code,
// including every remaining declaration) has finished — not an arbitrary
// timeout, just "as soon as physically possible", still always before any
// user interaction can occur.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  queueMicrotask(boot);
}

// Applies THREE_D_ENABLED to the nav entry + section markup. Runs on every
// load regardless of flag value, so flipping the const is the only change
// needed to show/hide the whole chapter again.
function applyThreeDFeatureFlag() {
  const navBtn = document.querySelector('[data-scroll-to="#threeD"]');
  const section = document.getElementById("threeD");
  if (navBtn) navBtn.hidden = !THREE_D_ENABLED;
  if (section) section.hidden = !THREE_D_ENABLED;
}

function populateLangButtons() {
  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.getAttribute("data-lang") === lang);
    btn.addEventListener("click", () => {
      lang = btn.getAttribute("data-lang");
      setLang(lang);
      applyI18n(lang);
      document.querySelectorAll("[data-lang]").forEach((b) =>
        b.classList.toggle("is-active", b === btn)
      );
      updateStageCaption(currentStateIndex, true);
      renderFacts();
      if (museumApi) museumApi.refreshLabels();
      if (kframesApi) kframesApi.refreshLabels();
      const introStartBtn = document.getElementById("introStartBtn");
      if (introStartBtn) introStartBtn.textContent = t(lang, "introStart");
      applyMuteUI(); // PHASE 2.4A — re-translate both mute controls' labels
      // PHASE 2.6 — re-fill the two ZT-typography titles this file owns
      // (#introTitle / #reelTitle). setTitleText only rewrites pooled
      // characters' textContent, never their opacity/transform, so this is
      // safe even after a beat has already revealed (see zt-typography.js's
      // own "LANGUAGE SWITCHING — NO WRAPPER ACCUMULATION" note).
      const introTitleEl = document.getElementById("introTitle");
      if (introTitleEl) getZtTypo().setTitleText(introTitleEl, t(lang, "introTitle"));
      const reelTitleEl = document.getElementById("reelTitle");
      if (reelTitleEl) getZtTypo().setTitleText(reelTitleEl, t(lang, "reelTitle"));
      const reelReplayBtn = document.getElementById("reelReplayBtn");
      if (reelReplayBtn) reelReplayBtn.setAttribute("aria-label", t(lang, "reelReplayLabel"));
    });
  });
}

// ---------------------------------------------------------------------------
// Intro gate + PHASE 2.4A global mute control
// ---------------------------------------------------------------------------
// Default OFF, unchanged from before Phase 2.4A. This is now the single
// source of truth for BOTH mute controls (the intro-gate toggle AND the
// persistent navbar toggle added below) — toggling either updates the same
// `soundEnabled` flag, the same ZT_AUDIO_BUS master-mute state, and both
// controls' visual state together (see applyMuteUI()).
//
// PHASE 2.7 — minimal, additive cross-page preference continuity (main
// ZEITSPRUNG_V2/index.html <-> this bridge). sessionStorage only carries the
// visitor's ON/OFF PREFERENCE across a real page navigation — it can NEVER
// itself resume a suspended AudioContext (browser autoplay policy requires a
// real user gesture on THIS page too; see ZT_AUDIO_BUS.unlock() calls below,
// unchanged). Key shared with ../js/index-main.js: "zeitsprung:soundEnabled".
const ZT_SOUND_PREF_KEY = "zeitsprung:soundEnabled";
let soundEnabled = (function () {
  try { return sessionStorage.getItem(ZT_SOUND_PREF_KEY) === "1"; }
  catch (e) { return false; }
})();

// Re-applies the current `soundEnabled` state to every control that displays
// it. Called on toggle AND on every DE/EN/ES language switch (see
// populateLangButtons above), since the intro-gate label is translated text.
function applyMuteUI() {
  const introToggle = document.getElementById("introSoundToggle");
  const introLabel = document.getElementById("introSoundLabel");
  const navToggle = document.getElementById("navSoundToggle");
  if (introToggle) introToggle.classList.toggle("is-on", soundEnabled);
  if (introLabel) introLabel.textContent = t(lang, soundEnabled ? "introSoundOn" : "introSoundOff");
  if (navToggle) {
    navToggle.classList.toggle("is-on", soundEnabled);
    navToggle.setAttribute("aria-pressed", soundEnabled ? "true" : "false");
    // Reuses the already-approved introSoundOn/introSoundOff i18n strings as
    // this icon-only button's accessible name — no new copy needed.
    navToggle.setAttribute("aria-label", t(lang, soundEnabled ? "introSoundOn" : "introSoundOff"));
  }
}

function setSoundEnabled(next) {
  soundEnabled = next;
  ZT_AUDIO_BUS.setMuted(!soundEnabled); // master-gain ramp, never gates any visual/content behavior
  try { sessionStorage.setItem(ZT_SOUND_PREF_KEY, soundEnabled ? "1" : "0"); } catch (e) {}
  applyMuteUI();
}

function wireIntroGate() {
  const soundToggle = document.getElementById("introSoundToggle");
  applyMuteUI();
  soundToggle.addEventListener("click", () => {
    // AUDIO UNLOCK — this is a real user-gesture click handler, the correct
    // (and only sanctioned) place to resume a suspended AudioContext.
    // Idempotent: safe even if the visitor toggles sound on/off repeatedly.
    ZT_AUDIO_BUS.unlock();
    setSoundEnabled(!soundEnabled);
  });

  const startBtn = document.getElementById("introStartBtn");

  // Guarded so it can safely be called from two places (the normal click
  // listener below, and the PHASE 2.6B buffered-early-click check) without
  // ever double-activating — `startBtn.disabled` is the single source of
  // truth, checked and set atomically before anything else runs.
  function enterExperience() {
    if (startBtn.disabled) return;
    // Second real-gesture unlock attempt (safety net) — resume() on an
    // already-running/resuming context is a harmless no-op.
    ZT_AUDIO_BUS.unlock();
    startBtn.disabled = true;
    startExperience();
  }

  startBtn.addEventListener("click", enterExperience);

  // PHASE 2.6B — INTRO ENTRY RELIABILITY MICRO-FIX. See the inline script at
  // the top of index.html's <body> for the full root-cause explanation: a
  // click on #introStartBtn that lands before this module has finished
  // loading (a real race on a fresh/cold load, since type="module" scripts
  // execute deferred) previously did nothing, because no listener existed
  // yet. That inline script buffers such a click into `__ztIntroEarlyClick`
  // without acting on it. The instant the REAL listener above exists, this
  // checks that flag once and enters immediately — no polling, no timeout.
  if (window.__ztIntroEarlyClick) enterExperience();

  // PHASE 2.4A — persistent, discreet mute control covering the WHOLE
  // experience (the intro-gate toggle is only ever seen once, before the
  // visitor presses Start). Lives in the fixed top navbar (see index.html),
  // shares the exact same soundEnabled/ZT_AUDIO_BUS state as the toggle above.
  const navToggle = document.getElementById("navSoundToggle");
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      ZT_AUDIO_BUS.unlock();
      setSoundEnabled(!soundEnabled);
    });
  }
}

// ---------------------------------------------------------------------------
// PHASE 2.6 — TASK 2: #intro-gate cinematic video layer.
//
// Enhances the EXISTING intro-gate (index.html) — no second, separate
// full-screen intro sequence is created. Layer order (back to front):
//   1. #introPosterImg  — the NEW hero image, ALWAYS present, always the
//      base layer. This is what a browser that blocks autoplay, fails to
//      decode the video, or simply never lets `canplay` fire ends up
//      showing — never a black stage.
//   2. #introVideo       — muted/playsinline, preload deferred, src assigned
//      here (not in markup) mirroring museum25d.js's ensureAssets()/
//      videoPreloadQueue lazy-preload discipline. Faded in (opacity 0 -> 1)
//      only once `playing` actually fires, so a blocked/slow/erroring
//      autoplay attempt never shows a flash of a black <video> box over the
//      poster.
//   3. .intro-gate__scrim — a dark gradient over both, for text legibility
//      (reuses the SAME visual language already on .intro-gate — no new
//      colours), sits under .intro-gate__inner's real content.
//
// Playback decision (documented per brief): a SINGLE play, no loop. The
// asset is an abstract material/texture mood piece (limestone, brick,
// cobblestone cubes on black), not a literal shot that needs to keep
// moving — letting it end and hold its last frame (native <video> behaviour
// for a non-looping, paused-at-end video) reads as the moment "settling"
// once the visitor has had time to read the eyebrow/title, exactly as the
// brief asks for, with zero extra timer/JS logic needed to fake that hold.
// ---------------------------------------------------------------------------
function buildIntroMedia() {
  const poster = document.getElementById("introPosterImg");
  const video = document.getElementById("introVideo");
  if (!poster) return;

  // Same NEW hero asset as STATES[0] ("today-open") — see that state's own
  // comment block above for full provenance. Using it here too means the
  // intro-gate's fallback state and the #stage's first state are visually
  // the same image, which reads as one coherent opening beat rather than
  // two different pictures.
  poster.src = encodeURI(`${WEB_ASSET_BASE}/hero/sb_hero_current_9x16_v01.png`);

  if (!video) return;

  video.muted = true;
  video.playsInline = true;
  video.loop = false; // single play, see decision note above
  video.preload = "metadata"; // brief allows "none" or "metadata"; "metadata"
                               // lets the browser learn duration/dimensions
                               // immediately without downloading frame data
  video.setAttribute("poster", poster.src);

  // Deferred src assignment — the network request only starts here, at
  // DOMContentLoaded, not embedded in the HTML `src` attribute. This is a
  // single, small (~4.8MB) asset with no shared preload queue needed (the
  // brief explicitly says a dedicated queue is unnecessary for one video);
  // it simply never blocks first paint of the intro-gate's poster/text.
  video.src = encodeURI(`${WEB_ASSET_BASE}/intro/sb_intro_cinematic_8s_v01_web.mp4`);

  video.addEventListener("playing", () => {
    gsap.to(video, { opacity: 1, duration: 0.5, ease: "power1.out" });
  }, { once: true });

  video.addEventListener("error", () => {
    // Never a black box: hide the (broken) <video> entirely, poster stays
    // visible underneath exactly as it already is at rest.
    video.hidden = true;
  });

  // Real-gesture-independent autoplay attempt, mirroring buildVideoChapter()
  // below's existing FPV handling (activate()). If the browser blocks it,
  // `playing` never fires, the video stays at opacity 0 (see initial CSS
  // state), and the poster underneath is what the visitor sees — never a
  // broken/empty layer. The shared runtime's gesture-retry queue also
  // catches this case the moment the visitor's first real tap/click happens.
  activate(video, { id: "steinerneIntro", role: "intro" });
}

// ---------------------------------------------------------------------------
// PHASE 2.6 — TASK 2: #intro-gate title reveal via zt-typography.js.
//
// ZT_REVEAL_CHAR for the eyebrow/title (both short, identical across DE/EN/
// ES — "ZEITSPRUNG" / "STEINERNE BRÜCKE" — so no language-switch handling is
// needed: the intro-gate is only ever visible BEFORE the language switcher
// exists in the DOM, inside #app), ZT_REVEAL_LINE for the city/range lines,
// via ONE beat container (#introRevealGroup, data-reveal children already
// authored in index.html) — exactly the "beat" pattern zt-typography.js is
// built around, same as museum2d-scroll.js / kframes-gallery.js.
//
// Button-copy decision (documented per brief): #introStartBtn's existing
// approved copy ("ERLEBNIS STARTEN" / "START EXPERIENCE" / "EXPERIENCIA
// INICIAR", data-i18n="introStart") is LEFT UNCHANGED. The brief's
// "ENTDECKEN/EXPLORE/EXPLORAR" wording was explicitly flagged as
// illustrative, not mandatory; the existing string already communicates the
// same entry action, is already translated in all 3 languages, and
// `startExperience()`'s click flow is required to stay exactly as-is either
// way. Judgment call: not worth spending an already-approved, working
// trilingual string on a copy-only change with no structural benefit.
// ---------------------------------------------------------------------------
function buildIntroTypography() {
  const beat = document.getElementById("introRevealGroup");
  const title = document.getElementById("introTitle");
  if (!beat || !title) return;

  const typo = getZtTypo();
  // introTitle is identical across DE/EN/ES ("STEINERNE BRÜCKE") — measuring
  // just the current lang's string is sufficient, but max() across all three
  // costs nothing and future-proofs a per-monument copy change.
  const poolSize = Math.max(
    ztVisualLength(t("de", "introTitle")),
    ztVisualLength(t("en", "introTitle")),
    ztVisualLength(t("es", "introTitle"))
  );
  typo.mountTitle(title, poolSize, "intro-gate__title-line");
  typo.setTitleText(title, t(lang, "introTitle"));
  typo.initBeat(beat);

  // Small delay so the intro video has a beat on screen before the type
  // reveals over it (Task 2's requested sequencing: video establishes ->
  // typography reveals -> start action). 0.5s is a restrained choice, not a
  // measured/approved design-system value — documented judgment call.
  ztRevealBeatNow(beat, 0.5);
}

async function startExperience() {
  const intro = document.getElementById("intro-gate");
  const preloader = document.getElementById("preloader");
  const preloaderFill = document.getElementById("preloaderFill");
  const preloaderPct = document.getElementById("preloaderPct");

  gsap.to(intro, {
    autoAlpha: 0,
    duration: 0.6,
    ease: "power2.out",
    onComplete: () => { intro.style.display = "none"; }
  });

  preloader.hidden = false;
  gsap.fromTo(preloader, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 });

  // Resolve the manifest-driven pfeiler cutout (kicked off at module load,
  // see pfeilerCutoutPromise above) before building the asset preload list,
  // so the "piers" state's actual final image gets preloaded — not the
  // legacy fallback — whenever resolution succeeds. Already-settled by now
  // in virtually every real session (user had to open the intro gate and
  // click Start first); awaited here only as a correctness safety net.
  const pfeilerUrl = await pfeilerCutoutPromise;
  if (pfeilerUrl) {
    const piersState = STATES.find((s) => s.key === "piers");
    if (piersState) piersState.img = pfeilerUrl;
  }

  const assetsToLoad = STATES.map((s) => s.img);
  let loaded = 0;

  const updateProgress = () => {
    loaded++;
    const pct = Math.round((loaded / assetsToLoad.length) * 100);
    gsap.to(preloaderFill, { width: pct + "%", duration: 0.25, ease: "power1.out" });
    preloaderPct.textContent = pct + "%";
    if (loaded >= assetsToLoad.length) {
      setTimeout(revealApp, 250);
    }
  };

  assetsToLoad.forEach((src) => {
    const img = new Image();
    img.onload = updateProgress;
    img.onerror = updateProgress; // do not block the experience on a single failed asset
    img.src = encodeURI(src);
  });

  // Safety timeout in case an asset never fires load/error
  setTimeout(() => {
    if (loaded < assetsToLoad.length) revealApp();
  }, 6000);
}

function revealApp() {
  const preloader = document.getElementById("preloader");
  const app = document.getElementById("app");

  gsap.to(preloader, {
    autoAlpha: 0,
    duration: 0.5,
    onComplete: () => { preloader.hidden = true; }
  });

  app.hidden = false;
  gsap.fromTo(app, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, delay: 0.15 });

  initLenisAndScroll();
}

// ---------------------------------------------------------------------------
// Stage caption shell (year / title / text / dots)
// ---------------------------------------------------------------------------
let currentStateIndex = 0;

function renderStageCaptionShell() {
  const dotsWrap = document.getElementById("stageDots");
  dotsWrap.innerHTML = "";
  STATES.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.className = "stage__dot" + (i === 0 ? " is-active" : "");
    dot.dataset.index = String(i);
    dotsWrap.appendChild(dot);
  });
  updateStageCaption(0, true);
}

function updateStageCaption(index, force) {
  if (!force && index === currentStateIndex) return;
  currentStateIndex = index;
  const s = DICT[lang].states[index] || DICT.de.states[index];
  const yearEl = document.getElementById("stateYear");
  const titleEl = document.getElementById("stateTitle");
  const textEl = document.getElementById("stateText");
  yearEl.textContent = s.year;
  titleEl.textContent = s.title;
  textEl.textContent = s.text;

  document.querySelectorAll(".stage__dot").forEach((d) => {
    d.classList.toggle("is-active", Number(d.dataset.index) === index);
  });
}

// ---------------------------------------------------------------------------
// Facts chapter
// ---------------------------------------------------------------------------
function renderFacts() {
  const d = DICT[lang];
  setText("factBaubeginnLabel", d.factBaubeginn);
  setText("factFertigstellungLabel", d.factFertigstellung);
  setText("factBoegenLabel", d.factBoegen);
  setText("factBoegenNote", d.factBoegenNote);
  setText("factPfeilerLabel", d.factPfeilerLabel);
  setText("factPfeilerNote", d.factPfeilerNote);
  setText("factSourceNote", d.factSourceNote);
}
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ---------------------------------------------------------------------------
// Lenis + GSAP ScrollTrigger orchestration
// ---------------------------------------------------------------------------
let portalRefs = null;

function initLenisAndScroll() {
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    duration: 1.15,
    smoothWheel: true,
    smoothTouch: false,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Portal motif
  const portalMount = document.getElementById("portal");
  portalRefs = buildPortal(portalMount);

  buildStageScrollTrigger();
  buildFactsReveal();
  // PHASE 2.5 FIX (post-delivery, live-browser verification caught this):
  // wireKframesGallery() used to run independently, in parallel with
  // wireMuseum25D() — both are fire-and-forget async manifest fetches that
  // each create their own pinned ScrollTrigger the moment THEIR OWN fetch
  // resolves. kframes-gallery's manifest is a single small JSON file;
  // museum25d's is two. On a fast/cached load, kframes' fetch can resolve
  // and create its ScrollTrigger BEFORE the museum section's pin-spacer
  // exists — confirmed live: kframes' measured start/end range then landed
  // entirely INSIDE the museum's range (measured against the pre-spacer,
  // shorter page layout), and a later ScrollTrigger.refresh() did not
  // reliably self-correct it once that wrong spacer was already inserted.
  // Fix: wireMuseum25D() now returns its init promise; kframes is wired
  // only once that promise settles, so its own ScrollTrigger.create() can
  // never run before the museum's pin-spacer is in the DOM.
  wireMuseum25D(lenis).then(() => wireKframesGallery(lenis));
  buildHistoricalReel(); // PHASE 2.6 TASK 4 — after the K-frame gallery, before the flyover
  buildVideoChapter();
  // Skipped entirely while disabled — no GLB fetch, no Three.js scene/
  // renderer/camera setup, no scroll-triggered load-on-enter wiring at all
  // (not just a visual hide) — see THREE_D_ENABLED above.
  if (THREE_D_ENABLED) wireThreeDChapter();
  wireNav(lenis);

  // Reveal nav + scroll hint
  gsap.to(".navbar", { autoAlpha: 1, y: 0, duration: 0.6, delay: 0.1 });
  gsap.to(".scroll-hint", { autoAlpha: 1, duration: 0.6, delay: 0.4 });

  // .scroll-hint is a "start scrolling" nudge only — it previously had no
  // dismissal logic at all, so it stayed at opacity 1 for the rest of the
  // page and could visually collide with the museum caption (bottom-left) once
  // the museum pinned stage actually reached its full mobile height (see
  // the "trigger: sticky" pin fix note in museum25d.js). Once the visitor
  // has actually started scrolling there is nothing left to hint at, so we
  // fade it out once and never re-show it — this removes the collision at
  // every pinned/sticky section on the page, not just the museum one.
  let scrollHintDismissed = false;
  lenis.on("scroll", (e) => {
    if (scrollHintDismissed) return;
    const y = typeof e.scroll === "number" ? e.scroll : window.scrollY;
    if (y > 40) {
      scrollHintDismissed = true;
      gsap.to(".scroll-hint", { autoAlpha: 0, duration: 0.4, ease: "power1.out" });
    }
  });

  ScrollTrigger.refresh();
}

// Applies a STATES entry's per-state visual fields (Task A) to whichever
// .stage__bg-layer is being made to show it — cover/photo states get
// background-size:cover with a per-state focal position; the "piers" cutout
// state (isCutout:true) instead gets a dark backdrop color + contain-style
// fixed-height sizing so the transparent RGBA cutout renders uncropped,
// never stretched/cropped like a cover photo would. Mobile overrides
// (<=899px) are read from state.mobile when present.
const STAGE_MOBILE_MQ = window.matchMedia("(max-width: 899px)");

function applyStageLayerStyle(layer, state) {
  if (!layer || !state) return;
  const isMobile = STAGE_MOBILE_MQ.matches;
  if (state.isCutout) {
    const position = (isMobile && state.mobile && state.mobile.objectPosition) || state.objectPosition || "center";
    const size = (isMobile && state.mobile && state.mobile.backgroundSize) || state.backgroundSize || "auto 80vh";
    layer.style.backgroundColor = state.backgroundColor || "#050506";
    layer.style.backgroundRepeat = "no-repeat";
    layer.style.backgroundSize = size;
    layer.style.backgroundPosition = position;
  } else {
    const position = (isMobile && state.mobile && state.mobile.objectPosition) || state.objectPosition || "center";
    layer.style.backgroundColor = "";
    layer.style.backgroundRepeat = "";
    layer.style.backgroundSize = "cover";
    layer.style.backgroundPosition = position;
  }
}

function buildStageScrollTrigger() {
  const stage = document.getElementById("stage");
  const layerA = document.querySelector(".stage__bg-layer--a");
  const layerB = document.querySelector(".stage__bg-layer--b");

  // Tracks which STATES index each alternating layer currently displays, so
  // a viewport-breakpoint change (STAGE_MOBILE_MQ) can re-apply the correct
  // mobile/desktop styling to whichever layer is currently on screen without
  // needing to re-derive it from scroll progress.
  let layerAStateIndex = 0;
  let layerBStateIndex = Math.min(1, STATES.length - 1);

  layerA.style.backgroundImage = `url("${encodeURI(STATES[layerAStateIndex].img)}")`;
  layerA.style.opacity = "1";
  applyStageLayerStyle(layerA, STATES[layerAStateIndex]);
  layerB.style.backgroundImage = `url("${encodeURI(STATES[layerBStateIndex].img)}")`;
  layerB.style.opacity = "0";
  applyStageLayerStyle(layerB, STATES[layerBStateIndex]);

  const segmentCount = STATES.length - 1; // transitions between states

  const st = ScrollTrigger.create({
    trigger: stage,
    start: "top top",
    end: `+=${segmentCount * 100}%`,
    scrub: 0.6,
    pin: ".stage__sticky",
    anticipatePin: 1,
    onUpdate: (self) => {
      const progress = self.progress; // 0..1 across the whole stage
      const scaled = progress * segmentCount;
      const idx = Math.min(STATES.length - 1, Math.floor(scaled));
      const localT = scaled - idx; // 0..1 crossfade progress within this segment

      const fromLayer = idx % 2 === 0 ? layerA : layerB;
      const toLayer = idx % 2 === 0 ? layerB : layerA;

      const nextIdx = Math.min(STATES.length - 1, idx + 1);
      const toIsLayerA = toLayer === layerA;
      const toStateIndexChanged = toIsLayerA ? layerAStateIndex !== nextIdx : layerBStateIndex !== nextIdx;
      if (toStateIndexChanged) {
        toLayer.style.backgroundImage = `url("${encodeURI(STATES[nextIdx].img)}")`;
        applyStageLayerStyle(toLayer, STATES[nextIdx]);
        if (toIsLayerA) layerAStateIndex = nextIdx; else layerBStateIndex = nextIdx;
      }

      gsap.set(fromLayer, { opacity: 1 - localT });
      gsap.set(toLayer, { opacity: localT });

      // Subtle parallax scale so the crossfade never feels like a flat cut
      gsap.set(fromLayer, { scale: 1 + localT * 0.04 });
      gsap.set(toLayer, { scale: 1.04 - localT * 0.04 });

      const displayIdx = localT > 0.5 ? nextIdx : idx;
      updateStageCaption(displayIdx);

      animatePortal(progress, localT, idx);
    }
  });

  // Re-apply the active per-state styling when crossing the mobile/desktop
  // breakpoint (e.g. device rotation, browser resize) — inline styles set
  // above would otherwise stay frozen at whichever breakpoint was active
  // when a given layer's background was last assigned.
  const handleStageBreakpointChange = () => {
    applyStageLayerStyle(layerA, STATES[layerAStateIndex]);
    applyStageLayerStyle(layerB, STATES[layerBStateIndex]);
    ScrollTrigger.refresh();
  };
  if (STAGE_MOBILE_MQ.addEventListener) {
    STAGE_MOBILE_MQ.addEventListener("change", handleStageBreakpointChange);
  } else if (STAGE_MOBILE_MQ.addListener) {
    // Safari <14 fallback
    STAGE_MOBILE_MQ.addListener(handleStageBreakpointChange);
  }

  return st;
}

function animatePortal(globalProgress, localT, idx) {
  if (!portalRefs) return;
  const { ringOuter, ringMid, aperture, ticksGroup, svg } = portalRefs;

  // The portal "opens" over the first ~30% of the journey, then holds open,
  // and its rings rotate continuously to suggest the passage of time.
  const openAmount = Math.min(1, globalProgress / 0.3);
  const apertureScale = 0.55 + openAmount * 0.45;
  gsap.set(aperture, { attr: { r: 40 + apertureScale * 52 }, opacity: 0.12 + openAmount * 0.1 });
  gsap.set(ringOuter, { attr: { r: 150 + openAmount * 20 } });
  gsap.set(ringMid, { attr: { r: 110 + openAmount * 20 } });

  const rotation = globalProgress * 220;
  gsap.set(svg, { rotate: rotation, transformOrigin: "50% 50%" });
  gsap.set(ticksGroup, { rotate: -rotation * 0.4, transformOrigin: "200px 200px" });

  // Era-tinted stroke: cool stone-grey pre-construction -> warm limestone during
  // build -> present-day neutral gold.
  const eraColors = [
    "rgba(226,232,240,0.55)", // today open
    "rgba(148,163,184,0.5)",  // before
    "rgba(180,160,120,0.6)",  // foundation
    "rgba(196,170,120,0.65)", // piers
    "rgba(212,175,120,0.7)",  // arches
    "rgba(214,190,150,0.6)",  // medieval
    "rgba(200,180,190,0.55)", // 19th c.
    "rgba(160,180,200,0.55)", // restoration
    "rgba(226,232,240,0.6)"   // today close
  ];
  const color = eraColors[Math.min(idx, eraColors.length - 1)];
  gsap.set([ringOuter, ringMid], { stroke: color });
}

// ---------------------------------------------------------------------------
// 2.5D museum chapter (Steinerne Brücke isolated on museum backdrop)
// ---------------------------------------------------------------------------
let museumApi = null;

function wireMuseum25D(lenis) {
  const section = document.getElementById("museum25d");
  if (!section) return Promise.resolve(); // PHASE 2.5 — caller now chains .then()

  gsap.fromTo(
    section.querySelector(".museum__inner"),
    { autoAlpha: 0, y: 30 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: section,
        start: "top 78%",
        toggleActions: "play none none reverse"
      }
    }
  );

  // initMuseum25D is async — it fetches the manifest-driven asset registry
  // (03_ASSETS/Steinerne_Bruecke/2d/ASSET_SWAP_MAP.json) before resolving.
  // PHASE 2.5 — returned so the caller can chain wireKframesGallery() after
  // this fully resolves (see that call site's comment for why).
  return initMuseum25D({ section, t, getLang: () => lang, lenis }).then((api) => {
    museumApi = api;
    // PHASE 2.5 FIX (post-delivery, live-browser verification caught this):
    // museum25d.js and kframes-gallery.js each independently fetch their own
    // manifest and create their own pinned ScrollTrigger the moment THEIR
    // OWN fetch resolves, with no coordination between the two. If
    // kframes-gallery's (smaller, single-file) manifest fetch resolves
    // before this museum fetch does, its ScrollTrigger gets created and
    // measured BEFORE this section's pin-spacer exists yet — confirmed live:
    // the K-frame gallery's trigger reported a start/end range that
    // OVERLAPPED the museum's own range entirely, because it was measured
    // against the pre-spacer (shorter) page layout. This module resolves
    // later and is higher up the page, so refreshing here (now that its own
    // pin-spacer is inserted) is the correct point to re-settle any
    // sibling trigger below it that has `invalidateOnRefresh: true`
    // (kframes-gallery.js's trigger does) — a plain fire-and-forget
    // coordination fix, not a new shared init-order system.
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });
}

// ---------------------------------------------------------------------------
// PHASE 2.5 — K01–K12 historical visual gallery (#kframesGallery). A NEW,
// separate module — see js/kframes-gallery.js's own header for the full
// scope note. This wiring function only mirrors wireMuseum25D()'s
// fire-and-forget async-init pattern (the manifest fetch resolves well
// before the visitor scrolls this far down the page).
// ---------------------------------------------------------------------------
let kframesApi = null;

function wireKframesGallery(lenis) {
  const section = document.getElementById("kframesGallery");
  if (!section) return;

  gsap.fromTo(
    section.querySelector(".kf__inner"),
    { autoAlpha: 0, y: 30 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: section,
        start: "top 78%",
        toggleActions: "play none none reverse"
      }
    }
  );

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  initKframesGallery({ section, t, getLang: () => lang, lenis, reducedMotion }).then((api) => {
    kframesApi = api;
  });
}

// ---------------------------------------------------------------------------
// Facts reveal (Baubeginn / Fertigstellung / Bögen / Pfeiler-unverified)
// ---------------------------------------------------------------------------
function buildFactsReveal() {
  gsap.utils.toArray(".fact-card").forEach((card, i) => {
    gsap.fromTo(
      card,
      { autoAlpha: 0, y: 40 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          toggleActions: "play none none reverse"
        },
        delay: i * 0.08
      }
    );
  });
}

// ---------------------------------------------------------------------------
// PHASE 2.6 — TASK 4: #historicalReel, a small editorial "cinematic summary"
// beat placed AFTER the K01–K12 gallery. Deliberately NOT built inside
// #kframesGallery / kframes-gallery.js (that file's pinned scroll/crossfade
// logic is untouched by this task) — this is a normal, non-pinned,
// reveal-on-scroll section, wired here in main.js like #facts/#museum25d's
// own intro blocks, just once, ScrollTrigger `once:true` (no reverse — a
// one-directional teaser, not a scrubbed chapter).
//
// ACTIVE asset: 03_ASSETS/Steinerne_Bruecke/VIDEO/REELS/
// sb_kframes_history_reel_15s_v01.mp4 (filename says "15s", actual runtime
// is 8.04s — flagged, not corrected here) -> muted/faststart web derivative
// below. Content verified by inspection: a ground-level cinematic shot of
// the bridge deck/arches with the cathedral behind, golden light — a
// premium editorial mood shot, distinct from the K-frame gallery's
// construction-history stills, which is why a short clarifying caption
// (reelNote, i18n) is included so this section does not read as a
// duplicate of the gallery above it.
// ---------------------------------------------------------------------------
function buildHistoricalReel() {
  const section = document.getElementById("historicalReel");
  if (!section) return;
  const frame = section.querySelector(".reel__frame");
  const video = document.getElementById("reelVideo");
  const beat = section.querySelector(".reel__caption");
  const title = document.getElementById("reelTitle");
  const replayBtn = document.getElementById("reelReplayBtn");

  if (title) {
    const poolSize = Math.max(
      ztVisualLength(t("de", "reelTitle")),
      ztVisualLength(t("en", "reelTitle")),
      ztVisualLength(t("es", "reelTitle"))
    );
    getZtTypo().mountTitle(title, poolSize, "reel__title-line");
    getZtTypo().setTitleText(title, t(lang, "reelTitle"));
  }
  if (beat) getZtTypo().initBeat(beat);

  if (video) {
    video.muted = true;
    video.playsInline = true;
    video.loop = false; // single restrained play, holds its last frame — no
                         // controls, no SFX, matches the intro video's
                         // documented decision above
    video.preload = "none"; // this section is well below the fold; the
                             // network request only starts once the visitor
                             // actually scrolls near it (onEnter below)

    video.addEventListener("error", () => {
      // Never a broken/empty rectangle: hide the <video>, the section's own
      // dark backdrop (.reel__frame background) remains a coherent surface.
      video.hidden = true;
    });
  }

  const REEL_ID = { id: "historicalReel", role: "reel" };
  let played = false;
  function playReel() {
    if (played || !video) return;
    played = true;
    video.src = encodeURI(`${WEB_ASSET_BASE}/reels/sb_kframes_history_reel_15s_v01_web.mp4`);
    activate(video, REEL_ID);
  }

  ScrollTrigger.create({
    trigger: section,
    start: "top 75%",
    once: true,
    onEnter: () => {
      if (frame) gsap.to(frame, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" });
      if (beat) ztRevealBeatNow(beat, 0.2);
      playReel();
    }
  });

  // Small, subtle replay affordance (icon-button, not a video-player-style
  // control) — restarts the single play, never loops on its own.
  if (replayBtn) {
    replayBtn.setAttribute("aria-label", t(lang, "reelReplayLabel"));
    replayBtn.addEventListener("click", () => {
      if (!video) return;
      if (!video.src) playReel();
      else { video.currentTime = 0; activate(video, REEL_ID); }
    });
  }
}

// ---------------------------------------------------------------------------
// Video chapter
// ---------------------------------------------------------------------------
function buildVideoChapter() {
  const section = document.getElementById("videoChapter");
  const video = document.getElementById("fpvVideo");
  const fallback = document.getElementById("videoFallback");

  video.src = encodeURI(VIDEO_PATH);

  video.addEventListener("error", () => {
    fallback.hidden = false;
    video.hidden = true;
  });

  gsap.fromTo(
    section.querySelector(".video-chapter__frame"),
    { autoAlpha: 0, scale: 0.92 },
    {
      autoAlpha: 1,
      scale: 1,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: section,
        start: "top 70%",
        toggleActions: "play none none reverse"
      }
    }
  );

  const FPV_ID = { id: "steinerneFpv", role: "flyover" };
  ScrollTrigger.create({
    trigger: section,
    start: "top 60%",
    end: "bottom 40%",
    onEnter: () => activate(video, FPV_ID),
    onEnterBack: () => activate(video, FPV_ID),
    onLeave: () => deactivate(video),
    onLeaveBack: () => deactivate(video)
  });

  // PHASE 3.1 — the bespoke Safari/iOS-backgrounding visibilitychange
  // re-assert that used to live here (a video paused by the OS when the tab
  // goes background does not always resume cleanly on return, even after a
  // later ScrollTrigger onEnter — WebKit quirk) is now handled by the ONE
  // centralized pauseHidden()/resumeActive() mechanism in video-playback.js
  // (Section 7 of the day's brief): this video only needs to be marked
  // ACTIVE via activate() above — the shared runtime resumes it on its own
  // the moment the tab becomes visible again, with no bespoke geometry
  // check needed here.
}

// ---------------------------------------------------------------------------
// 3D chapter
// ---------------------------------------------------------------------------
let viewer = null;
let viewerLoaded = false;

function wireThreeDChapter() {
  const section = document.getElementById("threeD");
  const mount = document.getElementById("threeDMount");
  const loadingEl = document.getElementById("threeDLoading");
  const errorEl = document.getElementById("threeDError");
  const progressEl = document.getElementById("threeDProgress");

  gsap.fromTo(
    section.querySelector(".threed-chapter__inner"),
    { autoAlpha: 0, y: 30 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.8,
      scrollTrigger: {
        trigger: section,
        start: "top 75%",
        toggleActions: "play none none reverse",
        onEnter: () => { if (!viewerLoaded) loadViewer(); }
      }
    }
  );

  function loadViewer() {
    viewerLoaded = true;
    import("./viewer3d.js").then(({ initViewer3D }) => {
      viewer = initViewer3D({
        mount,
        onLoadStart: () => { loadingEl.hidden = false; },
        onLoadProgress: (p) => { progressEl.textContent = Math.round(p * 100) + "%"; },
        onLoadDone: () => { loadingEl.hidden = true; },
        onLoadError: (err) => {
          loadingEl.hidden = true;
          errorEl.hidden = false;
          console.error("ZEITSPRUNG V2 — GLB load error:", err);
        }
      });
      viewer.load();
    });
  }
  document.getElementById("btn3dFront").addEventListener("click", () => viewer && viewer.setCameraPreset("front"));
  document.getElementById("btn3dThreeQuarter").addEventListener("click", () => viewer && viewer.setCameraPreset("threequarter"));
  document.getElementById("btn3dTop").addEventListener("click", () => viewer && viewer.setCameraPreset("top"));
  document.getElementById("btn3dReset").addEventListener("click", () => viewer && viewer.setCameraPreset("reset"));
}

// ---------------------------------------------------------------------------
// Nav
// ---------------------------------------------------------------------------
function wireNav(lenis) {
  document.querySelectorAll("[data-scroll-to]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetSel = btn.getAttribute("data-scroll-to");
      const targetEl = document.querySelector(targetSel);
      if (targetEl) lenis.scrollTo(targetEl, { offset: 0, duration: 1.2 });
    });
  });

  document.getElementById("footerBackBtn").addEventListener("click", () => {
    lenis.scrollTo(0, { duration: 1.4 });
  });
}
