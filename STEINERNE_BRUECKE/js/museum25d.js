/* ZEITSPRUNG V2 — museum25d.js
   ============================================================================
   "2.5D museum" — the Steinerne Brücke exhibition module (#museum25d).

   ROLE OF THIS FILE (PHASE 2)
   ---------------------------
   This file is the ASSET AUTHORITY. It owns, and is the only place that owns:

     - loading + interpreting 03_ASSETS/Steinerne_Bruecke/2d/ASSET_SWAP_MAP.json
     - resolving slot_id -> usable URL (resolveSlot)
     - the generic display-fit system (preferred_fit / align_x / align_y /
       max_width / max_height / background_mode -> applyFitToImage / getFitMeta)
     - creating and populating the actual <img> layers, one per unique slot
     - loading 03_ASSETS/Steinerne_Bruecke/2d/MUSEUM_CONTENT_MAP.json
     - the deferred asset preload + decode gate
     - the rigid-layer pointer/touch parallax
     - the generic OPTIONAL video_loop capability (PHASE 2.2): discovery,
       creation, deferred src, and the chapter-active + section-visible
       play/pause gate for every manifest slot of type "video_loop"

   The CHOREOGRAPHY (10-chapter narrative, the single authored GSAP master
   timeline, the pinned ScrollTrigger, all coordinated typography and the
   chapter dots) lives in ./museum2d-scroll.js and consumes what this file
   resolves. That module never touches the manifest, and this file never
   authors motion. There is exactly ONE asset-resolution system in the module.

   MANIFEST-DRIVEN, ALWAYS. There are zero literal image/video paths in this
   file (SLOT_BASE + the two JSON URLs are the only path strings, and both are
   registry locations, not assets).

   Core rule enforced here: every image is ONE single, geometrically-locked
   layer — SB_DEPTH_02_BRIDGE_ALPHA.png ("bridge_alpha") most of all. Layers
   are only ever moved / scaled / tilted as a whole. Nothing is split, redrawn,
   cropped into parts or warped, and no fake per-component geometry is
   fabricated: the EXPLODED and REASSEMBLY beats are camera-like depth moves
   between whole images.

   See 03_ASSETS/Steinerne_Bruecke/2d/ASSET_SWAP_SYSTEM.md for the full slot
   documentation and how to safely add / replace / disable assets without
   touching this file.
   ============================================================================ */

import { CHAPTER_SCRIPT, buildMuseumScrollExperience } from "./museum2d-scroll.js";
import { ZT_AUDIO_BUS } from "../../js/zt-audio.js";

const SLOT_BASE = "../assets/steinerne-bruecke";
const MANIFEST_URL = "../03_ASSETS/Steinerne_Bruecke/2d/ASSET_SWAP_MAP.json";
const CONTENT_MAP_URL = "../03_ASSETS/Steinerne_Bruecke/2d/MUSEUM_CONTENT_MAP.json";

// Shared primary-layer slot ids (the rigid bridge + its optional foreground).
const PRIMARY_BRIDGE_SLOT = "bridge_alpha";
const PRIMARY_FOREGROUND_SLOT = "foreground_alpha";

// PHASE 2.2 — OPTIONAL CINEMATIC LOOP SLOTS.
// The construction chapter's video_loop slot (bau_loop_01) is no longer a
// hardcoded special case. Loops are DISCOVERED from the manifest: any slot with
// type === "video_loop" and a chapter_key is offered to that chapter. See
// "loop_slot_contract" in ASSET_SWAP_MAP.json for the full contract.
//   - status !== READY (or file_path null)  -> no <video> is created at all and
//     the chapter renders its approved still image exactly as before. This is
//     the state of ALL EIGHT loop slots today.
//   - render_target "pending_layer"         -> reuses the already-proven
//     #museumPendingVideo element (bau_loop_01's Phase 1/2 path, unchanged).
//   - render_target "flat_layer" (default)  -> injects a <video> into
//     #museumFlat that behaves like any other chapter layer.
const LOOP_TYPE = "video_loop";
const LOOP_TARGET_PENDING = "pending_layer";

// PHASE 2.3 — ONE-SHOT DIRECTIONAL TRANSITION CLIPS (assembly/disassembly
// pairs). Distinct system from the ambient LOOP_TYPE above: a slot of type
// "video_transition" is one HALF of a pair (pair_role "assembly" |
// "disassembly") sharing a chapter_key, discovered generically from the
// manifest exactly like loop slots (no slot_id is hardcoded). See
// "video_transition_contract" in ASSET_SWAP_MAP.json for the full contract.
const TRANSITION_TYPE = "video_transition";
const TRANSITION_TARGET_PRIMARY = "primary_layer";
const ROLE_ASSEMBLY = "assembly";
const ROLE_DISASSEMBLY = "disassembly";

// Fallback guide-line geometry, used only if a manifest section sets
// guides:true but supplies no guide_points. Currently no section enables
// guides, so nothing renders — capability retained, not exercised.
const DEFAULT_GUIDE_POINTS = [
  [8, 20, 30, 42], [92, 22, 68, 44], [12, 78, 32, 58],
  [88, 80, 70, 58], [50, 6, 50, 30]
];

// ---------------------------------------------------------------------
// PHASE 2.4A — STEINERNE BRÜCKE SFX EVENT MAP (monument-specific; lives here,
// NOT in ./zt-audio.js). Registers this monument's own semantic-key -> file
// mapping with the shared, monument-agnostic audio bus, and declares which
// chapters get which cues. All 16 discovered SFX/ambience files are
// registered so they exist in the bus's registry; only a subset is actually
// invoked below (per the "silence and spacing" instruction — everything
// registered-but-unused is documented, never silently orphaned).
// ---------------------------------------------------------------------
const SFX_MAP = {
  // stone
  STONE_SLIDE: "stone/stone_slide_01.wav",
  STONE_IMPACT: "stone/stone_impact_soft_01.wav",
  STONE_LOCK: "stone/stone_lock_01.wav",
  STONE_DEBRIS: "stone/stone_debris_small_01.wav",
  // wood
  WOOD_CREAK: "wood/wood_creak_01.wav",
  WOOD_BEAM_MOVE: "wood/wood_beam_move_01.wav",
  WOOD_KNOCK: "wood/wood_knock_01.wav", // registered, not invoked this phase
  // rope_pulley
  ROPE_TENSION: "rope_pulley/rope_tension_01.wav",
  ROPE_PULL: "rope_pulley/rope_pull_01.wav",
  PULLEY_MECHANISM: "rope_pulley/pulley_mechanism_01.wav",
  // transition
  ASSEMBLY_WHOOSH: "transition/assembly_whoosh_01.wav",
  ASSEMBLY_LOCK: "transition/assembly_lock_01.wav",
  REVEAL_SOFT: "transition/reveal_soft_01.wav",
  // ambience — only CONSTRUCTION_AMBIENCE is wired to a chapter this phase;
  // the other two are registered/available for a future judgment call per the
  // spec's "other museum chapters: do NOT add constant ambience unless
  // clearly useful" instruction.
  CONSTRUCTION_AMBIENCE: "ambience/construction_ambience_01.wav",
  INTERIOR_STONE_AMBIENCE: "ambience/interior_stone_ambience_01.wav", // unused this phase
  EXTERIOR_CITY_AMBIENCE: "ambience/exterior_city_subtle_01.wav"      // unused this phase
};

// One-shot "chapter-entry" cues for the three PING-PONG ambient-loop chapters
// (PHASE 2.3A — piers/arches/deck have no natural "ended" event, only
// chapter-entry). `move` fires on every real entry (subject to the bus's own
// per-event cooldown, so a tiny back-and-forth around the chapter boundary
// only fires once). `settle` fires ONCE PER SESSION only (tracked in
// sfxState.settledOnce below) — restrained per "not on every entry".
// `settleDelayMs` staggers the settle cue so it never overlaps the move cue.
const LOOP_CHAPTER_SFX = {
  piers: { move: "STONE_SLIDE", settle: "STONE_LOCK", settleDelayMs: 850 },
  // Arches: centering/Lehrgerüst timber is the era-defining detail here, so
  // wood leads; the settle cue represents a voussoir keying into place.
  arches: { move: "WOOD_CREAK", settle: "STONE_IMPACT", settleDelayMs: 700 },
  deck: { move: "STONE_SLIDE", settle: "ASSEMBLY_LOCK", settleDelayMs: 800 }
};

// Transition-clip hooks (PHASE 2.3's playTransitionClip / settle). Only
// "exploded" and "complete" currently resolve to a real transition clip at
// runtime (piers/arches/deck/materials/construction all have a READY loop
// instead, and the PHASE 2.3A loop-priority guard in onChapterChange below
// already prevents triggerTransition() from ever being called for those —
// see LOOP_CHAPTER_SFX above for their audio instead). `forward`/`reverse`
// map to entry.forwardRole vs the opposite role (see playTransitionClip
// call site below) — reverse gets the softer REVEAL_SOFT cue per the spec's
// "reverse scroll may use a softer sound" option, rather than suppressing it
// outright, since a fully silent reverse felt like a missing confirmation.
// `onSettle` (played near the clip's `ended` event) is registered for every
// entry as a forward-looking capability, but is currently reachable only if
// a future manifest change resolves a loop away from piers/arches/deck.
const TRANSITION_SFX = {
  exploded: { forward: "ASSEMBLY_WHOOSH", reverse: "REVEAL_SOFT", onSettle: null },
  complete: { forward: "ASSEMBLY_WHOOSH", reverse: "REVEAL_SOFT", onSettle: null },
  piers: { forward: null, reverse: null, onSettle: "STONE_LOCK" },
  arches: { forward: null, reverse: null, onSettle: "STONE_IMPACT" },
  deck: { forward: null, reverse: null, onSettle: "ASSEMBLY_LOCK" }
};

// BAU (construction) — the ONLY chapter that gets a looping ambience bed,
// plus 3 sparse, spaced one-shot beats. Delays are wall-clock (ms) from the
// moment the chapter is entered, not scroll-unit fractions — this chapter is
// a ping-pong ambient loop with no scroll-driven "moment" to hang a beat on,
// so a real-time stagger is used instead, restarted every time the chapter is
// (re-)entered and cancelled if the visitor leaves before a beat fires.
const BAU_AMBIENCE_KEY = "CONSTRUCTION_AMBIENCE";
const BAU_BEATS = [
  { key: "ROPE_TENSION", atMs: 1400 },
  { key: "WOOD_CREAK", atMs: 4200 },
  { key: "STONE_IMPACT", atMs: 7200 }
];

ZT_AUDIO_BUS.registerSfx(SFX_MAP);

// Session-scoped state for the SFX layer (module-level: exactly one museum
// instance exists per page load).
const sfxState = {
  settledOnce: Object.create(null), // chapter key -> true, once its settle cue has fired this session
  bauTimers: []                     // pending setTimeout ids for the active BAU beat schedule
};

function clearBauTimers() {
  sfxState.bauTimers.forEach((id) => window.clearTimeout(id));
  sfxState.bauTimers = [];
}

// Called from onChapterChange for EVERY chapter change (not only piers/
// arches/deck/materials/construction) — a no-op for any key with no entry in
// LOOP_CHAPTER_SFX / BAU handling, and always cancels a previously scheduled
// BAU beat sequence when the visitor leaves "construction" for anything else.
function handleChapterAudio(key) {
  if (key !== "construction") {
    ZT_AUDIO_BUS.stopAmbience(1.0); // fade-stop, never a hard cut — inert if BAU ambience was not active
    clearBauTimers();
  }

  const loopCfg = LOOP_CHAPTER_SFX[key];
  if (loopCfg) {
    if (loopCfg.move) ZT_AUDIO_BUS.playSfx(loopCfg.move, { eventId: `${loopCfg.move}::${key}` });
    if (loopCfg.settle && !sfxState.settledOnce[key]) {
      sfxState.settledOnce[key] = true;
      window.setTimeout(() => {
        ZT_AUDIO_BUS.playSfx(loopCfg.settle, { eventId: `${loopCfg.settle}::${key}::settle` });
      }, loopCfg.settleDelayMs || 0);
    }
    return;
  }

  if (key === "construction") {
    clearBauTimers();
    ZT_AUDIO_BUS.startAmbience(BAU_AMBIENCE_KEY, { fadeIn: 1.6, gain: 1 });
    BAU_BEATS.forEach((beat) => {
      const id = window.setTimeout(() => {
        ZT_AUDIO_BUS.playSfx(beat.key, { eventId: `${beat.key}::construction-beat` });
      }, beat.atMs);
      sfxState.bauTimers.push(id);
    });
  }
}

// Called from playTransitionClip (PHASE 2.3) at the moment a transition clip
// actually STARTS playing. `isForwardRole` distinguishes the chapter's own
// forwardRole (see entry.forwardRole in PHASE 2.3) from the opposite role.
function handleTransitionPlayAudio(key, isForwardRole) {
  const cfg = TRANSITION_SFX[key];
  if (!cfg) return;
  const sfxKey = isForwardRole ? cfg.forward : cfg.reverse;
  if (sfxKey) ZT_AUDIO_BUS.playSfx(sfxKey, { eventId: `${sfxKey}::${key}` });
}

// Called from the transition clip's own `settle()` (near/at its `ended`
// event — see PHASE 2.3). Currently unreachable for piers/arches/deck at
// runtime (loop-priority guard keeps triggerTransition() from ever running
// for them — see LOOP_CHAPTER_SFX for their actual audio path) and
// deliberately NOT wired for exploded/complete (onSettle: null — the
// play-start whoosh already covers those, avoiding a stacked second cue).
function handleTransitionSettleAudio(key) {
  const cfg = TRANSITION_SFX[key];
  if (!cfg || !cfg.onSettle) return;
  ZT_AUDIO_BUS.playSfx(cfg.onSettle, { eventId: `${cfg.onSettle}::${key}::settle` });
}

// ---------------------------------------------------------------------
// Registry loading + slot resolution
// ---------------------------------------------------------------------
async function loadJson(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

function emptyRegistry() {
  return { manifest: { sections: {}, slots: [] }, bySlotId: {} };
}

function buildRegistry(manifest) {
  if (!manifest) return emptyRegistry();
  const bySlotId = {};
  (manifest.slots || []).forEach((slot) => {
    if (slot && slot.slot_id) bySlotId[slot.slot_id] = slot;
  });
  return { manifest, bySlotId };
}

// Indexes MUSEUM_CONTENT_MAP.json by component id. Every visible sentence in
// the module comes from here (or from the approved i18n label strings).
function buildContentIndex(map) {
  const byId = {};
  if (map && Array.isArray(map.components)) {
    map.components.forEach((c) => { if (c && c.id) byId[c.id] = c; });
  }
  return byId;
}

function sectionConfig(registry, sectionKey) {
  return (registry.manifest.sections && registry.manifest.sections[sectionKey]) || {};
}

function sectionGuides(registry, sectionKey) {
  const cfg = sectionConfig(registry, sectionKey);
  return {
    enabled: !!cfg.guides,
    points: Array.isArray(cfg.guide_points) && cfg.guide_points.length ? cfg.guide_points : DEFAULT_GUIDE_POINTS
  };
}

// Resolves a slot_id (image OR video_loop — same status/file_path contract) to
// a usable URL. Returns { ok:false } for any missing manifest entry,
// PENDING/DISABLED status, null file_path, or lookup failure — callers must
// treat ok:false as "show the safe placeholder", never as an invented or
// broken <img>/<video>.
function resolveSlot(registry, slotId) {
  if (!slotId) return { ok: false, reason: "no-slot-id" };
  const slot = registry.bySlotId[slotId];
  if (!slot) return { ok: false, reason: "missing-slot" };
  if (slot.status !== "READY") return { ok: false, reason: slot.status || "not-ready" };
  if (!slot.file_path) return { ok: false, reason: "no-file-path" };
  return { ok: true, url: encodeURI(`${SLOT_BASE}/${slot.file_path}`), slot };
}

// ---------------------------------------------------------------------
// Generic display-fit system — driven entirely by each slot's OPTIONAL
// orientation / preferred_fit / max_width / max_height / align_x / align_y /
// background_mode fields (see ASSET_SWAP_MAP.json + ASSET_SWAP_SYSTEM.md §3a).
// This branches only on preferred_fit/orientation VALUES, never on slot_id — it
// must keep working unchanged for any future monument/slot declaring the same
// fields. Unchanged from Phase 1B (including its alpha-bbox-aware align_x /
// align_y centring), deliberately preserved rather than rebuilt.
// ---------------------------------------------------------------------
const FIT_DEFAULTS = {
  cutout_stage: { alignX: "center", alignY: "center", backgroundMode: "none" },
  portrait_focus: { alignX: "center", alignY: "center", backgroundMode: "none" },
  contain_tall: { alignX: "center", alignY: "center", backgroundMode: "none" },
  contain_wide: { alignX: "center", alignY: "center", backgroundMode: "framed" },
  detail_card: { alignX: "center", alignY: "center", backgroundMode: "framed" }
};
const FIT_MODES = Object.keys(FIT_DEFAULTS);
const BG_MODES = ["none", "soft-glow", "framed"];
const FIT_CLASS_PREFIX = "museum__fit--";
const BG_CLASS_PREFIX = "museum__bgmode--";
const ALL_FIT_CLASSES = FIT_MODES.map((m) => FIT_CLASS_PREFIX + m.replace(/_/g, "-"));
const ALL_BG_CLASSES = BG_MODES.map((m) => BG_CLASS_PREFIX + m);

function inferPreferredFit(slot) {
  if (slot && slot.preferred_fit && FIT_DEFAULTS[slot.preferred_fit]) return slot.preferred_fit;
  if (slot && slot.orientation === "landscape") return "contain_wide";
  return "portrait_focus";
}

function getFitMeta(slot) {
  const preferredFit = inferPreferredFit(slot);
  const defaults = FIT_DEFAULTS[preferredFit];
  return {
    preferredFit,
    alignX: (slot && slot.align_x) || defaults.alignX,
    alignY: (slot && slot.align_y) || defaults.alignY,
    backgroundMode: (slot && BG_MODES.includes(slot.background_mode)) ? slot.background_mode : defaults.backgroundMode,
    maxWidth: (slot && slot.max_width) || null,
    maxHeight: (slot && slot.max_height) || null
  };
}

// Applies fit metadata to a single <img>. Safe with slot === null (clears any
// previous fit classes/vars instead of leaving stale sizing behind).
function applyFitToImage(imgEl, slot) {
  if (!imgEl) return;
  ALL_FIT_CLASSES.forEach((c) => imgEl.classList.remove(c));
  ALL_BG_CLASSES.forEach((c) => imgEl.classList.remove(c));
  imgEl.style.removeProperty("--fit-max-w");
  imgEl.style.removeProperty("--fit-max-h");
  imgEl.style.marginLeft = "";
  imgEl.style.marginRight = "";
  imgEl.style.alignSelf = "";
  if (!slot) return;

  const meta = getFitMeta(slot);
  imgEl.classList.add(FIT_CLASS_PREFIX + meta.preferredFit.replace(/_/g, "-"));
  imgEl.classList.add(BG_CLASS_PREFIX + meta.backgroundMode);
  if (meta.maxWidth) imgEl.style.setProperty("--fit-max-w", meta.maxWidth);
  if (meta.maxHeight) imgEl.style.setProperty("--fit-max-h", meta.maxHeight);

  imgEl.style.alignSelf = meta.alignY === "top" ? "flex-start" : meta.alignY === "bottom" ? "flex-end" : "center";
  if (meta.alignX === "left") { imgEl.style.marginRight = "auto"; }
  else if (meta.alignX === "right") { imgEl.style.marginLeft = "auto"; }
}

// The fit system is purely class/CSS-variable based, so it applies unchanged to
// a <video> layer. Alias only — applyFitToImage is untouched so nothing that
// already calls it can be affected.
const applyFitToMedia = applyFitToImage;

// ---------------------------------------------------------------------
// Public init — async because both registries are fetched before the module
// can decide what to render.
// ---------------------------------------------------------------------
export async function initMuseum25D({ section, t, getLang, lenis }) {
  if (!section) return null;

  const [manifestJson, contentJson] = await Promise.all([
    loadJson(MANIFEST_URL),
    loadJson(CONTENT_MAP_URL)
  ]);
  const registry = buildRegistry(manifestJson);
  const content = buildContentIndex(contentJson);

  const sticky = section.querySelector("#museumSticky");
  const viewport = section.querySelector("#museumViewport");
  const primaryInner = section.querySelector("#museumPrimaryInner");
  const primaryOuter = primaryInner ? primaryInner.parentElement : null; // .museum__primary
  const bridgeImg = section.querySelector("#museumBridgeImg");
  const foregroundImg = section.querySelector("#museumForegroundImg");
  const primaryGuides = section.querySelector("#museumPrimaryGuides");

  const flatLayer = section.querySelector("#museumFlat");
  const flatGuides = section.querySelector("#museumFlatGuides");
  const pendingLayer = section.querySelector("#museumPending");
  const pendingVideo = section.querySelector("#museumPendingVideo");

  const captionHost = section.querySelector("#museumCaption");
  const dotsWrap = section.querySelector("#museumChapterDots");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // -------------------------------------------------------------------
  // LAYER CREATION — one permanent <img> per UNIQUE manifest slot used by the
  // chapter script. Created once, sized once, never recreated and never
  // re-`src`-ed on scroll (Phase 1 alternated two <img>s and swapped their src
  // per segment; that made preloading impossible and risked a visible load
  // during a transition). explosion_main is used by two chapters and
  // deliberately maps to the SAME element.
  // -------------------------------------------------------------------
  const bridgeResolved = resolveSlot(registry, PRIMARY_BRIDGE_SLOT);
  const foregroundResolved = resolveSlot(registry, PRIMARY_FOREGROUND_SLOT);

  const uniqueFlatSlots = [];
  CHAPTER_SCRIPT.forEach((ch) => {
    if (ch.layer.kind === "flat" && uniqueFlatSlots.indexOf(ch.layer.slot) === -1) {
      uniqueFlatSlots.push(ch.layer.slot);
    }
  });

  const flatLayers = {};    // slotId -> { el, resolved }
  const preloadQueue = [];  // { el, url } — src assigned later, see ensureAssets()

  uniqueFlatSlots.forEach((slotId) => {
    const resolved = resolveSlot(registry, slotId);
    if (!resolved.ok || !flatLayer) {
      flatLayers[slotId] = { el: null, resolved };
      return;
    }
    const img = document.createElement("img");
    img.className = "museum__flat-img";
    img.setAttribute("data-slot", slotId);
    img.setAttribute("alt", "");
    img.setAttribute("draggable", "false");
    img.decoding = "async";
    applyFitToImage(img, resolved.slot);
    // Insert before the guides SVG so the overlay stays on top.
    if (flatGuides) flatLayer.insertBefore(img, flatGuides);
    else flatLayer.appendChild(img);
    flatLayers[slotId] = { el: img, resolved };
    preloadQueue.push({ el: img, url: resolved.url });
  });

  if (bridgeImg) {
    if (bridgeResolved.ok) {
      bridgeImg.hidden = false;
      bridgeImg.decoding = "async";
      applyFitToImage(bridgeImg, bridgeResolved.slot);
      preloadQueue.push({ el: bridgeImg, url: bridgeResolved.url });
    } else {
      bridgeImg.removeAttribute("src");
      bridgeImg.hidden = true;
      applyFitToImage(bridgeImg, null);
    }
  }
  if (foregroundImg) {
    if (foregroundResolved.ok) {
      foregroundImg.hidden = false;
      preloadQueue.push({ el: foregroundImg, url: foregroundResolved.url });
    } else {
      foregroundImg.removeAttribute("src");
      foregroundImg.hidden = true;
    }
  }

  // -------------------------------------------------------------------
  // OPTIONAL CINEMATIC LOOPS (generic — PHASE 2.2)
  //
  // Generalised from the Phase 1/2 construction-video capability rather than
  // reinvented per chapter. One pass over the manifest builds a
  // chapterKey -> { el, resolved } map. A chapter only ends up in that map when
  // its loop slot genuinely resolves (status READY + real file_path), so with
  // every loop slot PENDING — which is the state of all eight today — this
  // whole block does nothing at all: no element is created, no src is fetched,
  // no observer is registered, and layerFor() below returns exactly what it
  // returned in Phase 2.1. That is the fallback guarantee: the still-image path
  // is not "restored" when a loop is missing, it is simply never left.
  // -------------------------------------------------------------------
  const loopLayers = {};        // chapterKey -> { el, resolved, target }
  const loopVideos = [];        // every created <video>, for the play/pause gate
  const videoPreloadQueue = []; // { el, url } — src assigned in ensureAssets()

  (registry.manifest.slots || []).forEach((slot) => {
    if (!slot || slot.type !== LOOP_TYPE || !slot.chapter_key) return;
    const resolved = resolveSlot(registry, slot.slot_id);
    if (!resolved.ok) return; // PENDING / DISABLED / no file_path -> still image
    const target = slot.render_target || "flat_layer";

    if (target === LOOP_TARGET_PENDING) {
      // bau_loop_01's proven path, preserved exactly.
      if (!pendingVideo || !pendingLayer) return;
      pendingVideo.hidden = false;
      pendingLayer.classList.add("museum__pending--video-ready");
      videoPreloadQueue.push({ el: pendingVideo, url: resolved.url });
      loopVideos.push(pendingVideo);
      loopLayers[slot.chapter_key] = { el: pendingLayer, video: pendingVideo, resolved, target };
      return;
    }

    if (!flatLayer) return;
    const v = document.createElement("video");
    v.className = "museum__flat-img museum__loop-video";
    v.setAttribute("data-slot", slot.slot_id);
    v.setAttribute("aria-hidden", "true");
    v.muted = true; v.loop = true; v.controls = false;
    v.playsInline = true;
    // Attributes as well as properties: iOS/Safari inline autoplay needs the
    // literal attributes present in the markup, not only the DOM properties.
    v.setAttribute("muted", "");
    v.setAttribute("loop", "");
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");
    v.setAttribute("disablepictureinpicture", "");
    v.preload = "none"; // a PENDING slot costs nothing; a READY one costs
                        // nothing until its chapter is actually reached
    applyFitToMedia(v, resolved.slot); // same generic fit system as the images
    if (flatGuides) flatLayer.insertBefore(v, flatGuides);
    else flatLayer.appendChild(v);
    videoPreloadQueue.push({ el: v, url: resolved.url });
    loopVideos.push(v);
    loopLayers[slot.chapter_key] = { el: v, video: v, resolved, target };
  });

  // Play/pause gate. TWO conditions must both hold for a loop to run:
  //   (a) the museum section is intersecting the viewport (the pre-existing
  //       IntersectionObserver pattern, now shared by every loop), and
  //   (b) the loop's own chapter is the current chapter of the master timeline
  //       (fed by onChapterChange below).
  // Nothing is ever scrubbed by scroll position: a loop either plays at its own
  // rate or is paused. No loop plays while another chapter is dominant.
  let sectionInView = true;
  let activeChapterKey = null;

  // -------------------------------------------------------------------
  // PHASE 2.3 — TRANSITION-CLIP DISCOVERY (video_transition, assembly /
  // disassembly pairs). Grouped by chapter_key into transitionChapters, exactly
  // parallel to loopLayers above but for one-shot directional clips instead of
  // ambient loops. transitionVideos collects every created <video> so the
  // single-active-video rule (below) can span BOTH systems.
  //   transitionChapters[chapterKey] = {
  //     assembly:    { el, resolved } | null,
  //     disassembly: { el, resolved } | null,
  //     lastRole:    the pair_role most recently triggered for this chapter
  //                  (null until the chapter has been entered once) — used to
  //                  suppress a replay when the chapter is re-entered from the
  //                  SAME direction as last time (no direction change).
  //     gen:         single-flight generation counter, bumped on every trigger
  //                  and on every settle-elsewhere call, so a stale
  //                  play()/ended handler from a superseded request can never
  //                  act on the wrong element.
  //     activeEl:    the <video> currently playing/visible for this chapter,
  //                  or null once it has ended/been superseded/settled.
  //   }
  // -------------------------------------------------------------------
  const transitionChapters = {};
  const transitionVideos = [];

  (registry.manifest.slots || []).forEach((slot) => {
    if (!slot || slot.type !== TRANSITION_TYPE || !slot.chapter_key) return;
    if (slot.pair_role !== ROLE_ASSEMBLY && slot.pair_role !== ROLE_DISASSEMBLY) return;
    const key = slot.chapter_key;
    if (!transitionChapters[key]) {
      transitionChapters[key] = {
        assembly: null, disassembly: null,
        target: slot.render_target || "flat_layer",
        fallbackSlotId: slot.fallback_slot_id || null,
        // Additive, opt-in (PHASE 2.3 fix): a chapter whose natural FORWARD
        // entry is a disassembly motion (e.g. "exploded", reached forward from
        // "opening" — the bridge coming apart) declares forward_role:
        // "disassembly" on either/both of its slots. Every pre-existing pair
        // (piers/arches/deck/complete) has no such field and keeps defaulting
        // to "assembly", so this changes nothing for them.
        forwardRole: ROLE_ASSEMBLY,
        lastRole: null, gen: 0, activeEl: null
      };
    }
    const entry = transitionChapters[key];
    if (slot.forward_role === ROLE_DISASSEMBLY) entry.forwardRole = ROLE_DISASSEMBLY;
    const resolved = resolveSlot(registry, slot.slot_id);
    if (!resolved.ok) {
      // PENDING / DISABLED / no file_path for this ONE direction only — the
      // other direction (if resolved) still works; this direction simply has
      // no clip to play and the chapter falls back to its static image for
      // that direction, exactly like any other unresolved slot in this module.
      entry[slot.pair_role] = null;
      return;
    }

    let v;
    if (entry.target === TRANSITION_TARGET_PRIMARY) {
      // PHASE 2.3A FIX — this used to be appended into #museumPrimaryInner
      // (display:inline-block, shrink-wrapped to .museum__bridge's own ~3:1
      // LANDSCAPE box), which rendered a portrait 1080x1920 clip as a small
      // vertical strip inside that wide box (the "small black 9:16 rectangle"
      // bug). #museumPrimary (primaryOuter) is the TRUE full-stage flex
      // container (position:absolute;inset:0;display:flex;align-items:center;
      // justify-content:center) — the same shape #museumFlat already is for
      // every flat chapter image/loop video — so this element is now a direct
      // child of primaryOuter (a sibling of #museumPrimaryInner, not a child
      // of it) and runs through the SAME generic display-fit system
      // (applyFitToMedia) every other cutout in this module uses, sized
      // against its own real aspect ratio instead of an ancestor shaped for a
      // different asset. .museum__flat-img supplies the shared base box
      // (position:absolute;width:auto;height:auto;object-fit:contain);
      // .museum__primary-transition-video only adds what that class does not.
      if (!primaryOuter) return;
      v = document.createElement("video");
      v.className = "museum__flat-img museum__primary-transition-video";
      v.setAttribute("data-slot", slot.slot_id);
      v.setAttribute("aria-hidden", "true");
      applyFitToMedia(v, resolved.slot);
      primaryOuter.appendChild(v);
    } else {
      // "flat_layer" (default) — sibling of the chapter's existing static
      // <img class="museum__flat-img"> inside #museumFlat, stacked above it via
      // z-index (see .museum__transition-video). Uses the SAME generic fit
      // system as every flat image/loop video, since #museumFlat IS the flex
      // box that system assumes.
      if (!flatLayer) return;
      v = document.createElement("video");
      v.className = "museum__flat-img museum__transition-video";
      v.setAttribute("data-slot", slot.slot_id);
      v.setAttribute("aria-hidden", "true");
      applyFitToMedia(v, resolved.slot);
      if (flatGuides) flatLayer.insertBefore(v, flatGuides);
      else flatLayer.appendChild(v);
    }

    v.muted = true; v.loop = false; v.controls = false;
    v.playsInline = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");
    v.setAttribute("disablepictureinpicture", "");
    // preload="none" — this clip costs zero bytes until it joins the SAME
    // deferred preload queue every other image/loop uses (see
    // videoPreloadQueue below); it is never a second preload gate.
    v.preload = "none";

    videoPreloadQueue.push({ el: v, url: resolved.url });
    transitionVideos.push(v);
    entry[slot.pair_role] = { el: v, resolved };
  });

  // Single-active-video rule, spanning BOTH the ambient-loop system (above)
  // and the transition-clip system: pausing here is the ONE place either
  // system stops playback belonging to the other, so at most one <video> can
  // ever be in a playing state anywhere in this module. `exceptEl` (or
  // undefined/null to pause everything) is the element a caller is about to
  // start or is keeping alive.
  function pauseAllMotionVideos(exceptEl) {
    loopVideos.forEach((v) => { if (v !== exceptEl && !v.paused) v.pause(); });
    transitionVideos.forEach((v) => { if (v !== exceptEl && !v.paused) v.pause(); });
  }

  function showTransitionEl(v) { v.style.opacity = "1"; }
  function hideTransitionEl(v) { v.style.opacity = "0"; }

  // Plays ONE role's clip for ONE chapter. Guards against overlapping/stale
  // playback via `entry.gen`: every call bumps it, and the async
  // play()-rejection / 'ended' handlers captured by THIS call compare their
  // closed-over `gen` against the entry's CURRENT `gen` before touching the
  // DOM, so a superseded (aborted) request can never hide/reveal the wrong
  // element after a newer request has already moved on.
  function playTransitionClip(key, entry, role) {
    entry.lastRole = role;
    entry.gen += 1;
    const gen = entry.gen;

    // The non-selected direction's element (if it exists and happens to be
    // mid-playback from an earlier, now-superseded request) is stopped and
    // hidden immediately — it can never be the visible element once a role is
    // chosen for this chapter.
    const otherRole = role === ROLE_ASSEMBLY ? ROLE_DISASSEMBLY : ROLE_ASSEMBLY;
    const other = entry[otherRole];
    if (other && other.el) {
      other.el.pause();
      hideTransitionEl(other.el);
    }

    const clip = entry[role];
    if (!clip || !clip.el) {
      // This direction has no approved clip (PENDING/unresolved) — settle on
      // the static fallback image directly, exactly as if no transition slot
      // existed for this chapter at all.
      if (entry.activeEl) hideTransitionEl(entry.activeEl);
      entry.activeEl = null;
      return;
    }

    const v = clip.el;
    pauseAllMotionVideos(v); // stop every other video system-wide, including
                              // any ambient loop, before this one starts.
    entry.activeEl = v;
    showTransitionEl(v);
    try { v.currentTime = 0; } catch (err) { /* not yet seekable — fine, plays from wherever it lands */ }

    // PHASE 2.4A — SFX play-start hook. Fires exactly once per real
    // play()-attempt (this function itself is only reached once per real
    // direction change, via playTransitionClip's own `entry.lastRole` guard
    // in triggerTransition below), so no additional debounce is needed here
    // beyond the audio bus's own per-event cooldown.
    handleTransitionPlayAudio(key, role === entry.forwardRole);

    const settle = () => {
      if (entry.gen !== gen) return; // a newer request already owns this chapter
      hideTransitionEl(v);
      if (entry.activeEl === v) entry.activeEl = null;
      handleTransitionSettleAudio(key); // PHASE 2.4A — see TRANSITION_SFX.onSettle
    };
    v.addEventListener("ended", settle, { once: true });

    const p = v.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => { if (entry.gen === gen) settle(); }); // autoplay/decoding
                                                            // failure -> settle
                                                            // on the static
                                                            // image, never a
                                                            // stuck blank video
    }
  }

  // Called on EVERY chapter change, before deciding what the NEWLY active
  // chapter should do. Pauses/hides any transition clip left playing from a
  // chapter OTHER than the one just entered — necessary because a visitor can
  // scroll directly from (say) PIERS into EXPLODED (which has no transition
  // slot at all), and nothing else would ever stop the piers clip in that case.
  function settleOtherTransitions(exceptKey) {
    Object.keys(transitionChapters).forEach((k) => {
      if (k === exceptKey) return;
      const e = transitionChapters[k];
      if (e.activeEl) {
        e.gen += 1; // invalidate any in-flight 'ended'/play() handler for it
        hideTransitionEl(e.activeEl);
        try { e.activeEl.pause(); } catch (err) {}
        e.activeEl = null;
      }
    });
  }

  // TRANSITION_DIRECTION_RULE (documented in ASSET_SWAP_MAP.json's
  // video_transition_contract): entering a transition-paired chapter moving
  // FORWARD (direction 1, or no direction info available) plays that
  // chapter's forwardRole clip (ASSEMBLY by default; DISASSEMBLY only for a
  // chapter that opts in via forward_role — see the "exploded" pair, PHASE
  // 2.3 fix); moving BACKWARD (direction -1) plays the OTHER role. Applied
  // identically to every paired chapter (piers/arches/deck/complete/exploded)
  // — no per-chapter special-casing beyond the single forwardRole flag. If
  // the chapter is re-entered from the SAME direction as last time
  // (entry.lastRole already equals the computed role), nothing is
  // re-triggered: the chapter is already settled in the correct visual state
  // and replaying would violate the no-restart-on-tiny-scroll /
  // no-duplicate-playback rule.
  function triggerTransition(key, direction) {
    const entry = transitionChapters[key];
    if (!entry) return;
    const forward = entry.forwardRole === ROLE_DISASSEMBLY ? ROLE_DISASSEMBLY : ROLE_ASSEMBLY;
    const backward = forward === ROLE_ASSEMBLY ? ROLE_DISASSEMBLY : ROLE_ASSEMBLY;
    const role = direction === -1 ? backward : forward;
    if (entry.lastRole === role) return;
    playTransitionClip(key, entry, role);
  }

  function syncLoopPlayback() {
    pauseAllMotionVideos(null);
    if (!sectionInView || !activeChapterKey) return;
    const entry = loopLayers[activeChapterKey];
    if (!entry || !entry.video) return;
    const p = entry.video.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }

  if (loopVideos.length || transitionVideos.length) {
    if ("IntersectionObserver" in window) {
      // Observes `sticky` (#museumSticky), NOT the outer `section`. The
      // section is the full pin-spacer height (thousands of px, since it
      // hosts the entire scrubbed 10-chapter timeline) — its intersection
      // ratio against a single viewport height can never exceed roughly
      // (viewport height / section height), a few percent at most, so a
      // 0.15 threshold against it can never be satisfied at any real scroll
      // position and permanently latched sectionInView to false. `sticky` is
      // the actual pinned stage element, whose box matches the viewport
      // (near-100% ratio) for the entire time the exhibit is pinned on
      // screen, and correctly reports non-intersecting before/after the
      // pinned range — the semantically correct target for "is the exhibit
      // currently visible".
      new IntersectionObserver((entries) => {
        entries.forEach((entry) => { sectionInView = entry.isIntersecting; });
        if (!sectionInView) pauseAllMotionVideos(null);
        else syncLoopPlayback(); // ambient loops resume; a mid-play transition
                                  // clip intentionally does NOT auto-resume on
                                  // re-entering the viewport (it already ran
                                  // once for this chapter/direction — resuming
                                  // it would be a second, unrequested play).
      }, { threshold: 0.15 }).observe(sticky || section);
    } else {
      sectionInView = true;
    }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pauseAllMotionVideos(null);
      else syncLoopPlayback();
    });
  }

  // The choreography module asks for one element per chapter. Resolution order:
  // approved video_loop > approved still cutout > explicit PENDING placeholder.
  // Any chapter whose slot fails to resolve degrades to the PENDING placeholder
  // rather than a blank/broken layer.
  function layerFor(chapter) {
    const loop = loopLayers[chapter.key];
    if (loop && loop.el) return loop.el;
    if (chapter.layer.kind !== "flat") {
      // If the rigid bridge slot itself could not be resolved, the geometry
      // simply does not exist — show the explicit PENDING placeholder rather
      // than animating an empty stage (same honest-degradation rule as before).
      return bridgeResolved.ok ? primaryOuter : pendingLayer;
    }
    const entry = flatLayers[chapter.layer.slot];
    if (entry && entry.el) return entry.el;
    return pendingLayer;
  }

  // Guide-line capability retained but inert: no manifest section currently
  // sets guides:true, so both SVGs render empty and stay hidden. Re-enabling
  // needs per-chapter wiring in museum2d-scroll.js, not just a manifest flag.
  const structureGuides = sectionGuides(registry, "struktur");
  const explosionGuides = sectionGuides(registry, "explosion");
  buildGuideLines(primaryGuides, structureGuides.enabled ? structureGuides.points : []);
  buildGuideLines(flatGuides, explosionGuides.enabled ? explosionGuides.points : []);
  [primaryGuides, flatGuides].forEach((svg) => { if (svg) svg.style.opacity = "0"; });

  // -------------------------------------------------------------------
  // DEFERRED PRELOAD + DECODE GATE
  // The 7 chapter images total ~14 MB of PNG, so they are NOT attached during
  // the initial page load. Every <img> element exists from the start (so the
  // timeline can be built against stable DOM) but stays src-less until either
  // (a) the visitor scrolls to within ~2 viewports of the museum section, or
  // (b) the browser goes idle — whichever happens first. Once every image has
  // decoded we refresh ScrollTrigger so the pin measures a settled layout.
  // Nothing is ever created/destroyed per scroll tick.
  // -------------------------------------------------------------------
  let assetsRequested = false;
  function ensureAssets() {
    if (assetsRequested) return;
    assetsRequested = true;
    const decodes = preloadQueue.map(({ el, url }) => {
      el.src = url;
      if (typeof el.decode === "function") return el.decode().catch(() => {});
      return Promise.resolve();
    });
    // Loop videos join the same deferred gate, but only get their src — with
    // preload="none" that still costs zero bytes until the chapter is reached,
    // and it is deliberately NOT awaited, so a video can never delay the
    // ScrollTrigger.refresh() that the images' decode gate performs.
    videoPreloadQueue.forEach(({ el, url }) => { el.src = url; });
    Promise.all(decodes).then(() => {
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  }

  if (window.ScrollTrigger) {
    ScrollTrigger.create({
      trigger: section,
      start: "top bottom+=100%",
      once: true,
      onEnter: ensureAssets
    });
  }
  if ("requestIdleCallback" in window) window.requestIdleCallback(ensureAssets, { timeout: 6000 });
  else setTimeout(ensureAssets, 4000);

  // -------------------------------------------------------------------
  // Pointer parallax (desktop) + touch drag (mobile) — rigid layer only, and
  // only while the rigid layer is actually on screen. Applies to
  // #museumPrimaryInner (tilt + small pan), never to #museumPrimary, which the
  // master timeline owns exclusively (single-ownership rule: no element is
  // driven by two systems). Kept on ONE combined gsap.to() for the compound 3D
  // rotation — splitting rotateX/rotateY into two independent quickTo() setters
  // reintroduces the GSAP 3.12 "not eligible for reset" console warning that
  // was fixed earlier.
  // -------------------------------------------------------------------
  let isPrimaryVisible = true;
  let quickTX, quickTY, hasParallax = false;
  if (window.gsap && primaryInner) {
    quickTX = gsap.quickTo(primaryInner, "x", { duration: 0.6, ease: "power3.out" });
    quickTY = gsap.quickTo(primaryInner, "y", { duration: 0.6, ease: "power3.out" });
    hasParallax = true;
  }

  function applyParallax(nx, ny) {
    if (!isPrimaryVisible || prefersReducedMotion || !hasParallax) return;
    const MAX_ROT = 6.5; // degrees — restrained, not gimmicky
    const MAX_PAN = 10;  // px
    gsap.to(primaryInner, {
      rotateX: -ny * MAX_ROT,
      rotateY: nx * MAX_ROT,
      duration: 0.6,
      ease: "power3.out",
      overwrite: "auto"
    });
    quickTX(nx * MAX_PAN);
    quickTY(ny * MAX_PAN * 0.6);
  }

  function resetParallax(animate) {
    if (!hasParallax) return;
    if (animate) {
      gsap.to(primaryInner, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "power3.out", overwrite: "auto" });
      quickTX(0); quickTY(0);
    } else if (window.gsap) {
      gsap.killTweensOf(primaryInner, "rotateX,rotateY");
      gsap.set(primaryInner, { rotateX: 0, rotateY: 0, x: 0, y: 0 });
    }
  }

  if (!prefersReducedMotion && viewport) {
    viewport.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return; // touch handled by the drag logic below
      const rect = viewport.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      applyParallax(nx, ny);
    });
    viewport.addEventListener("pointerleave", () => resetParallax(true));

    let dragActive = false;
    let dragStartX = 0, dragStartY = 0;
    viewport.addEventListener("touchstart", (e) => {
      if (!isPrimaryVisible) return;
      const touch = e.touches[0];
      if (!touch) return;
      dragActive = true;
      dragStartX = touch.clientX;
      dragStartY = touch.clientY;
    }, { passive: true });
    viewport.addEventListener("touchmove", (e) => {
      if (!dragActive) return;
      const touch = e.touches[0];
      if (!touch) return;
      const rect = viewport.getBoundingClientRect();
      const nx = Math.max(-1, Math.min(1, (touch.clientX - dragStartX) / (rect.width * 0.5)));
      const ny = Math.max(-1, Math.min(1, (touch.clientY - dragStartY) / (rect.height * 0.5)));
      applyParallax(nx, ny);
    }, { passive: true });
    ["touchend", "touchcancel"].forEach((evt) => {
      viewport.addEventListener(evt, () => {
        dragActive = false;
        resetParallax(true);
      });
    });
  }

  // -------------------------------------------------------------------
  // Scroll-based "camera approach" — a subtle dolly as the section first
  // enters view, before the pinned sequence engages. Independent, unpinned,
  // and it targets #museumViewport, which the master timeline never touches.
  // -------------------------------------------------------------------
  if (window.gsap && window.ScrollTrigger && viewport && !prefersReducedMotion) {
    gsap.fromTo(viewport, { scale: 0.94 }, {
      scale: 1,
      ease: "none",
      scrollTrigger: { trigger: section, start: "top bottom", end: "top 35%", scrub: 0.4 }
    });
  }

  // -------------------------------------------------------------------
  // Hand off to the choreography module.
  // -------------------------------------------------------------------
  const experience = buildMuseumScrollExperience({
    sticky,
    captionHost,
    dotsWrap,
    primaryOuter,
    layerFor,
    content,
    t,
    getLang,
    lenis,
    reducedMotion: prefersReducedMotion,
    onPrimaryVisible: (visible) => {
      isPrimaryVisible = visible;
      if (!visible) resetParallax(false);
    },
    // Fired only when the current chapter actually changes (the choreography
    // module already tracks that for the chapter dots). `direction` is
    // GSAP ScrollTrigger's self.direction (1 forward / -1 backward / undefined
    // for the two non-ScrollTrigger call sites in museum2d-scroll.js), passed
    // through purely as data — nothing here builds a second progress->chapter
    // authority, this is still the ONE existing chapter-change point. Gates
    // BOTH the ambient-loop system and the PHASE 2.3 transition-clip system.
    onChapterChange: (index, key, direction) => {
      activeChapterKey = key;
      handleChapterAudio(key); // PHASE 2.4A — see LOOP_CHAPTER_SFX / BAU ambience above
      if (loopVideos.length) syncLoopPlayback();
      settleOtherTransitions(key); // always runs — harmless cleanup for a
                                    // chapter that is no longer active.
      // PHASE 2.3A — LOOP-PRIORITY GUARD. Once a chapter has a resolved
      // ambient loop (loopLayers[key] set — see the video_loop discovery pass
      // above), that loop is this chapter's default/active behavior and the
      // 5s one-shot transition clip must NOT also fire for it (it would fight
      // the ambient loop for the same visual space via its own independent
      // opacity/z-index toggling — layerFor() already prioritizes the loop
      // over the flat/primary static layer for the MASTER TIMELINE's own tween
      // target, but the transition-clip system is fully independent of that
      // and does not know a loop exists). The transition-pair slots stay
      // registered/resolvable in the manifest either way (per the
      // video_transition_contract's "SOURCE/AVAILABLE" requirement) — this
      // guard only stops them from being INVOKED at runtime for a chapter that
      // now has a loop. Chapters with no loop (exploded/complete/reassembly as
      // of this phase) are completely unaffected.
      if (!loopLayers[key]) triggerTransition(key, direction);
    },
    // PHASE 2.4A — MATERIAL specimen-cycle beat (the only in-chapter beat with
    // no chapter-change/transition-clip event of its own — see the doc
    // comment on this parameter in museum2d-scroll.js). Kept very subtle
    // (STONE_DEBRIS's own EVENT_GAIN_MULTIPLIER is 0.55) and NOT looping/
    // constant, per the spec's explicit instruction for this chapter.
    onSfxBeat: (kind, index) => {
      if (kind !== "material_specimen") return;
      ZT_AUDIO_BUS.playSfx("STONE_DEBRIS", { eventId: `STONE_DEBRIS::materials::${index}` });
    }
  });

  return {
    refreshLabels: () => experience.refreshLabels(),
    refresh: () => experience.refresh(),
    // Exposed for QA/debugging only — not used by the page.
    debug: () => ({
      chapters: experience.chapterCount,
      totalUnits: experience.totalUnits,
      endPercent: experience.endPercent,
      slots: Object.keys(flatLayers).map((k) => ({
        slot: k, ok: flatLayers[k].resolved.ok, reason: flatLayers[k].resolved.reason || null
      })),
      // Which chapters (if any) are currently served by an approved video_loop.
      // Expected to be [] until a loop slot is flipped to READY in the manifest.
      activeLoops: Object.keys(loopLayers).map((k) => ({
        chapter: k, slot: loopLayers[k].resolved.slot.slot_id, target: loopLayers[k].target
      })),
      loopSlotsDeclared: (registry.manifest.slots || [])
        .filter((s) => s && s.type === LOOP_TYPE)
        .map((s) => ({ slot: s.slot_id, chapter: s.chapter_key || null, status: s.status })),
      // PHASE 2.3 — per-chapter transition-pair resolution + last-triggered
      // direction, for QA/debugging only (not used by the page).
      transitionChaptersDeclared: Object.keys(transitionChapters).map((k) => {
        const e = transitionChapters[k];
        return {
          chapter: k,
          target: e.target,
          assemblyResolved: !!(e.assembly && e.assembly.el),
          disassemblyResolved: !!(e.disassembly && e.disassembly.el),
          lastRole: e.lastRole
        };
      })
    })
  };
}

// ---------------------------------------------------------------------
// Guide-line SVG (warm-gold pointer lines — currently disabled for every
// section; see sections.struktur/explosion in ASSET_SWAP_MAP.json). Purely
// decorative overlay geometry — never touches the source images. `points` is
// data-driven. An empty array renders an empty, non-interactive SVG
// (pointer-events:none in CSS) — never a dead click target.
// ---------------------------------------------------------------------
function buildGuideLines(svg, points) {
  if (!svg) return;
  svg.innerHTML = "";
  const svgNS = "http://www.w3.org/2000/svg";
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("preserveAspectRatio", "none");
  (points || []).forEach(([x1, y1, x2, y2]) => {
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", x1); line.setAttribute("y1", y1);
    line.setAttribute("x2", x2); line.setAttribute("y2", y2);
    line.setAttribute("class", "museum__guide-line");
    svg.appendChild(line);
    const dot = document.createElementNS(svgNS, "circle");
    dot.setAttribute("cx", x1); dot.setAttribute("cy", y1);
    dot.setAttribute("r", "0.9");
    dot.setAttribute("class", "museum__guide-dot");
    svg.appendChild(dot);
  });
}

/* ---------------------------------------------------------------------
   HOTSPOT EXTENSION POINT (not implemented — intentionally empty)
   ---------------------------------------------------------------------
   No real hotspot content (id / target / DE-EN-ES label / body copy /
   close-state) has been authored or approved for this module. Per the
   "no orphans" rule, this build implements ZERO tap-hotspots rather than
   inventing placeholder content. If/when real hotspot content is briefed and
   approved, a hotspot config would be added here with this shape, resolved
   per-chapter (never hardcoded):

     const HOTSPOTS = {
       <chapterKey>: [
         {
           id: "unique-hotspot-id",
           x: 0..100, y: 0..100,          // position within the viewport, %
           label: { de: "...", en: "...", es: "..." },
           content: { de: "...", en: "...", es: "..." },
           close: { de: "Schließen", en: "Close", es: "Cerrar" }
         }
       ]
     };

   Nothing above is user-visible; it is a documentation-only extension point.

   PHASE 1C (2026-08-29): re-confirmed no real Brückmandl landing page/anchor
   exists anywhere in this project. A formal PENDING_DESTINATION placeholder for
   a future "bruckmandl" hotspot is registered as DATA ONLY in
   03_ASSETS/Steinerne_Bruecke/2d/ASSET_SWAP_MAP.json under "hotspots_registry".
   Neither this file nor museum2d-scroll.js reads that key, and no Brückmandl
   content appears anywhere in the 10-chapter sequence. */
