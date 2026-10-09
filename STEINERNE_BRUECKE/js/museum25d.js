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

import { CHAPTER_SCRIPT, buildMuseumScrollExperience, buildTimingMap } from "./museum2d-scroll.js";
import { ZT_AUDIO_BUS } from "../../js/zt-audio.js";
import { STEINERNE_WEB_ASSET_BASE, ASSET_SWAP_MANIFEST_URL, MUSEUM_CONTENT_MAP_URL as CONTENT_MAP_URL_RESOLVED } from "../../js/zt-paths.js";

const SLOT_BASE = STEINERNE_WEB_ASSET_BASE;
const MANIFEST_URL = ASSET_SWAP_MANIFEST_URL;
const CONTENT_MAP_URL = CONTENT_MAP_URL_RESOLVED;

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

// PHASE 3.2 (this task) — SCROLL-SCRUBBED COMPLETE<->EXPLODED VIDEO ZONES.
// Derived ONCE, at module load, from the SAME buildTimingMap(CHAPTER_SCRIPT)
// authority museum2d-scroll.js's own progress->chapter map is built from —
// no second timing table exists anywhere in this file. Looked up by chapter
// KEY (not hardcoded index), so a future re-ordering of CHAPTER_SCRIPT cannot
// silently desync these boundaries, exactly like museum2d-scroll.js's own
// idxOf() pattern for primaryOutAt/primaryInAt.
//   ZONE A (disassembly video), RETIMED AGAIN (this task, owner correction
//     #2 — "SOLO VIDEO EN ESA SECCION"): the previous iteration gave
//     chapter 03 EXPLODED's own still (explosion_main) a dwell window
//     before the video took over, so the still was still visible on screen
//     as a "static cover" for part of that chapter — exactly what the
//     owner rejected this round: no static image of any kind may be
//     visible anywhere inside the EXPLODED chapter's own screen time, video
//     only. Zone A now spans the chapter's ENTIRE span, tStart -> he
//     (transitionIn AND hold), so the video is the sole visual for chapter
//     03 from the instant it becomes the active chapter to the instant it
//     hands off to 'piers'. explosion_main is never shown at all in this
//     configuration (see the suppression guard below, which now also
//     forces the PRIMARY layer — bridge_alpha, still finishing its own
//     chapter-02-exit fade at tStart — to 0 for the same span, so there is
//     no crossfade overlap at the chapter boundary either: a clean, hard
//     handoff from bridge_alpha directly to the video's own opening
//     "complete bridge" frame, which is visually similar enough that this
//     reads as continuous rather than jarring).
//   ZONE B (assembly video), RETIMED AGAIN (GROUP B FINAL CONTENT FLOW
//     CORRECTION, this task): previously spanned chapter 09 REASSEMBLY's own
//     tStart through chapter 10 COMPLETE's own tStart, handing off cleanly to
//     chapter 10's separate bridge_alpha "arrival" tween the instant chapter
//     10 began (see the git history of this comment for that fix's own
//     reasoning). Chapter 10 "complete" has now been REMOVED from
//     CHAPTER_SCRIPT entirely per owner request: showing bridge_alpha arrive
//     a second time, right after the assembly video's own last frame already
//     held on that exact same complete bridge, was a redundant duplicate
//     panel. 'reassembly' is now the LAST chapter, so Zone B is redefined to
//     span 'reassembly'.tStart -> 'reassembly'.he (its own ENTIRE span,
//     mirroring exactly how Zone A already spans 'exploded's entire span) —
//     the video is the sole visual for the whole reassembly chapter, and
//     since 'reassembly'.he now equals the timeline's own `total` (it is the
//     final chapter), Zone B's end is simultaneously "the end of this
//     chapter" and "the end of the whole pinned sequence": the video plays
//     through and, on 'ended', simply holds its own last frame (default
//     <video> behaviour, no code needed) for as long as the visitor remains
//     within the pin — which is what now visually closes the module, with no
//     separate closing chapter/panel required.
const SCRUB_TIMING = buildTimingMap(CHAPTER_SCRIPT);
const SCRUB_CHAPTER_INDEX = (key) => CHAPTER_SCRIPT.findIndex((c) => c.key === key);
const SCRUB_EXPLODED_IDX = SCRUB_CHAPTER_INDEX("exploded");
const SCRUB_REASSEMBLY_IDX = SCRUB_CHAPTER_INDEX("reassembly");
// FINAL PRODUCTION CLOSURE (2026-10-08) — BLACK-GAP FIX. The disassembly video
// used to be hidden the instant Zone A ended, while the next chapter's layer
// (piers) only starts fading in 40% into its own transitionIn window and is
// opaque at 100% — leaving ~200px of scroll with NO visible media (confirmed by
// a per-50px visibility scan). `holdUntil` keeps the disassembly clip's last
// frame on screen until the piers layer is ~96% opaque (tStart + 0.85*tin,
// power2.out). Pure visibility window: playback/zone-entry logic is untouched.
const SCRUB_PIERS_IDX = SCRUB_CHAPTER_INDEX("piers");
const SCRUB_ZONE_A = {
  start: SCRUB_TIMING.marks[SCRUB_EXPLODED_IDX].tStart / SCRUB_TIMING.total,
  end: SCRUB_TIMING.marks[SCRUB_EXPLODED_IDX].he / SCRUB_TIMING.total,
  holdUntil: SCRUB_PIERS_IDX > 0
    ? (SCRUB_TIMING.marks[SCRUB_PIERS_IDX].tStart + SCRUB_TIMING.marks[SCRUB_PIERS_IDX].tin * 0.85) / SCRUB_TIMING.total
    : null
};
const SCRUB_ZONE_B = {
  start: SCRUB_TIMING.marks[SCRUB_REASSEMBLY_IDX].tStart / SCRUB_TIMING.total,
  end: SCRUB_TIMING.marks[SCRUB_REASSEMBLY_IDX].he / SCRUB_TIMING.total
};
// GROUP B CONTENT EDIT — SHORT VERSION (this task): SCRUB_SEEK_EPSILON
// (formerly used to avoid reassigning video.currentTime for negligible
// scroll deltas) removed — zonePlayOne() no longer writes currentTime on
// every tick, it plays the clip through once per zone-entry (see that
// function's own comment), so no seek-dedup threshold is needed any more.

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

// Transition-clip hooks (PHASE 2.3's playTransitionClip / settle). Neither
// "exploded" nor "complete" is actually reachable through this ordinary
// chapter-entry path today: both are scrub-flagged (see SCRUB_ZONE_A/B
// above), so onChapterChange's own guard skips triggerTransition() for them
// entirely — "exploded"'s clips run via zonePlayOne() instead, and
// "complete" (the manifest's still-registered, still-dormant
// overview_transition_assembly/disassembly primary_layer pair) never
// resolves to a DOM element at all (see the discovery loop's
// TRANSITION_TARGET_PRIMARY guard below). This map/registration is kept for
// schema completeness and for any FUTURE non-scrub transition-paired chapter
// (piers/arches/deck/materials/construction all have a READY loop instead,
// and the PHASE 2.3A loop-priority guard in onChapterChange below already
// prevents triggerTransition() from ever being called for those too — see
// LOOP_CHAPTER_SFX above for their audio instead). `forward`/`reverse`
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
  detail_card: { alignX: "center", alignY: "center", backgroundMode: "framed" },
  // MATERIAL — TRUE FULL SCREEN (this task) — new mode, generic like every
  // other one above (branches on the mode NAME only, never on slot_id).
  // Every mode above only ever caps max-width/max-height and leaves the
  // shared `.museum__flat-img{object-fit:contain}` base rule in charge, so a
  // 9:16 clip always letterboxes inside a wider stage box. full_cover is for
  // a slot that has explicitly asked to fill its box edge-to-edge instead,
  // cropping rather than letterboxing — see the matching
  // `.museum__fit--full-cover` CSS rule (sets width/height:100% and
  // object-fit:cover, unlike every other fit-mode rule).
  full_cover: { alignX: "center", alignY: "center", backgroundMode: "none" }
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
  // MATERIAL PING-PONG (this task) — every loop slot whose playback.ping_pong
  // is true (currently only materials_loop; generic, not slot_id-gated) gets
  // pushed here instead of relying on native `loop`. See the dedicated
  // ticker below (search "PING-PONG DRIVER") for the playback mechanism.
  const pingPongLoops = []; // { el, chapterKey, direction: 1|-1 }

  // GROUP B V2 (2026-10-10) — a loop video shows its approved still (the slot's
  // fallback_slot_id image, already in the image preload set) as its poster, so
  // a clip that has not decoded its first frame yet never reads as an empty
  // black stage. Visual-only; no new asset.
  function setLoopPoster(videoEl, slot) {
    if (!slot || !slot.fallback_slot_id) return;
    const fb = resolveSlot(registry, slot.fallback_slot_id);
    if (fb && fb.ok && fb.url) videoEl.poster = fb.url;
  }
  (registry.manifest.slots || []).forEach((slot) => {
    if (!slot || slot.type !== LOOP_TYPE || !slot.chapter_key) return;
    const resolved = resolveSlot(registry, slot.slot_id);
    if (!resolved.ok) return; // PENDING / DISABLED / no file_path -> still image
    const target = slot.render_target || "flat_layer";
    const isPingPong = !!(slot.playback && slot.playback.ping_pong === true);

    if (target === LOOP_TARGET_PENDING) {
      // bau_loop_01's proven path, preserved exactly. ping_pong is not
      // supported on the pending_layer target (no slot has requested it);
      // BAU keeps its native loop=true unconditionally, as before.
      if (!pendingVideo || !pendingLayer) return;
      pendingVideo.hidden = false;
      pendingLayer.classList.add("museum__pending--video-ready");
      setLoopPoster(pendingVideo, slot);
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
    // MATERIAL PING-PONG (this task): native `loop` stays true for every
    // OTHER slot (pfeiler/boegen/fahrbahn/bau), unchanged. A ping_pong slot
    // gets loop=false instead — with loop=true a looping video's `ended`
    // event never fires at all (the browser seeks back to 0 and keeps
    // playing before JS ever sees it), which would make the forward-end
    // detection the ticker below relies on impossible to observe.
    v.muted = true; v.loop = !isPingPong; v.controls = false;
    v.playsInline = true;
    // Attributes as well as properties: iOS/Safari inline autoplay needs the
    // literal attributes present in the markup, not only the DOM properties.
    v.setAttribute("muted", "");
    if (!isPingPong) v.setAttribute("loop", ""); // matches the loop PROPERTY above
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");
    v.setAttribute("disablepictureinpicture", "");
    v.preload = "none"; // a PENDING slot costs nothing; a READY one costs
                        // nothing until its chapter is actually reached
    applyFitToMedia(v, resolved.slot); // same generic fit system as the images
    if (flatGuides) flatLayer.insertBefore(v, flatGuides);
    else flatLayer.appendChild(v);
    setLoopPoster(v, slot);
    videoPreloadQueue.push({ el: v, url: resolved.url });
    loopVideos.push(v);
    loopLayers[slot.chapter_key] = { el: v, video: v, resolved, target };
    if (isPingPong) pingPongLoops.push({ el: v, chapterKey: slot.chapter_key, direction: 1 });
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
        lastRole: null, gen: 0, activeEl: null,
        // PHASE 3.2 (this task) — see ASSET_SWAP_MAP.json's
        // video_transition_contract.scrub_extension. Set true when ANY slot
        // of this chapter_key's pair carries playback.scrub === true; once
        // true, onChapterChange below never calls triggerTransition() for
        // this chapter_key — the old one-shot autoplay mechanism is fully
        // bypassed in favour of the continuous scroll-scrub controller.
        scrub: false
      };
    }
    const entry = transitionChapters[key];
    if (slot.forward_role === ROLE_DISASSEMBLY) entry.forwardRole = ROLE_DISASSEMBLY;
    const isScrubSlot = !!(slot.playback && slot.playback.scrub === true);
    if (isScrubSlot) entry.scrub = true;
    const resolved = resolveSlot(registry, slot.slot_id);
    if (!resolved.ok) {
      // PENDING / DISABLED / no file_path for this ONE direction only — the
      // other direction (if resolved) still works; this direction simply has
      // no clip to play and the chapter falls back to its static image for
      // that direction, exactly like any other unresolved slot in this module.
      entry[slot.pair_role] = null;
      return;
    }

    if (isScrubSlot && entry.target === TRANSITION_TARGET_PRIMARY) {
      // PHASE 3.2 (this task) — a scrub-flagged 'primary_layer' slot
      // (overview_transition_assembly/disassembly) is intentionally never
      // instantiated as a DOM element. #museumFlat paints ABOVE #museumPrimary
      // in this module's existing stacking order (see index.html DOM order +
      // .museum__primary/.museum__flat both z-index:2, later element wins),
      // so the scrub-flagged 'flat_layer' sibling slot (exploded_transition_*
      // — the SAME physical file under a second slot_id) already correctly
      // occludes #museumPrimary for the whole scrub span with no per-chapter
      // tween changes needed. A second <video> decoding the identical file
      // here would add zero compositing benefit and would violate the
      // single-active-video-decoder discipline this module already enforces
      // (see pauseAllMotionVideos below) — so it is skipped, exactly like any
      // other unresolved slot: entry[pair_role] stays null.
      entry[slot.pair_role] = null;
      return;
    }

    if (isScrubSlot && prefersReducedMotion) {
      // A scrub video IS motion — prefers-reduced-motion visitors keep the
      // pre-existing opacity-only crossfade between the rigid static image
      // layers (museum2d-scroll.js's own R/mv()/ms() reduced-motion mode,
      // completely untouched by this task) with no video element created or
      // fetched at all, matching the approved index-hero scrub's own
      // reduced-motion convention (initHeroScrub() early-returns identically).
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

    // 2026-10-09: a slot whose runtime file is a forward+reverse ping-pong derivative
    // declares playback.loop=true and loops natively (no end-frame freeze).
    v.muted = true; v.loop = !!(slot.playback && slot.playback.loop); v.controls = false;
    v.playsInline = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");
    v.setAttribute("disablepictureinpicture", "");
    // preload="none" — this clip costs zero bytes until it joins the SAME
    // deferred preload queue every other image/loop uses (see
    // videoPreloadQueue below); it is never a second preload gate.
    // PHASE 3.2 exception, CORRECTED (this task, local-preview QA): a
    // scrub-driven element needs to be arbitrarily seekable across its
    // whole duration well before the scroll reaches its zone. "metadata"
    // was tried first (fetches only the container header, not frame data)
    // but was found live to break scrubbing completely whenever the dev
    // server doesn't support byte-range requests (confirmed: this
    // project's local `python3 -m http.server` never sends Accept-Ranges/
    // 206 for ANY file) — Chrome's metadata-only preload issues one GET,
    // reads just enough of the header to learn .duration, then aborts the
    // connection (net::ERR_ABORTED, confirmed via read_network_requests);
    // with no Range support the browser has no way to resume for a later
    // seek, so .currentTime writes silently become permanent no-ops
    // (readyState stays 4/HAVE_ENOUGH_DATA and .duration reads fine, which
    // is what made this easy to miss — only .seekable, stuck at [[0,0]],
    // gives it away). "auto" makes the browser commit to downloading the
    // whole file up front instead of aborting early, which is heavier but
    // is the only reliably seekable option on a non-range-serving server;
    // src is still assigned lazily by the SAME deferred gate as every other
    // asset, so this is not a second preload gate, only a heavier one for
    // the two scrub slots specifically.
    v.preload = isScrubSlot ? "auto" : "none";
    // Scrub elements skip .museum__transition-video's shared 0.35s opacity
    // CSS transition — confirmed live as a real (if brief, ~350ms) overlap
    // source: the suppression guards for primaryOuter/explosionMainEl snap
    // instantly (matching scroll position exactly, which is the whole point
    // of a SCROLL-SCRUBBED video), but the ordinary one-shot transition
    // clips' decorative crossfade means the VIDEO's own hide lags behind by
    // up to 0.35s after the instant snap — during reverse scroll specifically,
    // that gap briefly showed the just-restored still AND the still-fading
    // video at once. Ordinary (non-scrub) transition clips keep the shared
    // CSS transition unchanged — this override is scoped to scrub elements
    // only via inline style, which always wins over the stylesheet rule.
    if (isScrubSlot) v.style.transition = "none";

    videoPreloadQueue.push({ el: v, url: resolved.url });
    transitionVideos.push(v);
    entry[slot.pair_role] = { el: v, resolved };
  });

  // PHASE 3.1 — GLOBAL VIDEO RUNTIME audit exception (Section 14 of that
  // phase's brief). This function and the 5 other raw .play()/.pause() call
  // sites below it (playTransitionClip's `v.play()`/`other.el.pause()`,
  // settleOtherTransitions' `e.activeEl.pause()`, syncLoopPlayback's
  // `entry.video.play()`) were audited and DELIBERATELY NOT migrated onto
  // js/video-playback.js's activate()/deactivate(). Reason: this module
  // already has its own, independently-correct race-safety mechanism —
  // every async play()-rejection/'ended' callback closes over `entry.gen`
  // and re-checks it against the entry's CURRENT generation before touching
  // the DOM (see playTransitionClip() below), which is what actually
  // prevents a superseded request from fighting a newer one here, AND is
  // tightly coupled to this module's own SFX play-start/settle audio hooks
  // (handleTransitionPlayAudio/handleTransitionSettleAudio) and the 10-
  // chapter assembly/disassembly choreography itself. Routing these through
  // activate()/deactivate() would add a SECOND, differently-shaped
  // ownership/generation system on top of an already-correct one, risking
  // exactly the kind of subtle race this phase exists to eliminate, for a
  // module with no reported symptom and an explicit protect-zone instruction
  // ("approved choreography... do not touch"). Left exactly as-is.
  //
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

  // -------------------------------------------------------------------
  // MATERIAL PING-PONG DRIVER (this task) — generic, drives every entry in
  // pingPongLoops (currently only materials_loop; nothing here is gated on
  // slot_id). No browser reliably supports negative video.playbackRate, so
  // "play backward" is simulated the standard way: let the clip play FORWARD
  // natively to its own end, then take over and manually step currentTime
  // BACKWARD in real time until 0, then hand back to native forward
  // playback — repeating indefinitely, with no pause inserted at either
  // turnaround (the direction flip happens within the same tick that
  // detects it).
  //
  // Runs as its own gsap.ticker callback, exactly like the suppression guard
  // above and for the same reason: it needs to reassert its own state every
  // single frame, independently of scroll events, because syncLoopPlayback()
  // — unrelated, untouched, still governing pfeiler/boegen/fahrbahn/bau
  // exactly as before — calls pauseAllMotionVideos(null) then play() on
  // every chapter change and viewport-visibility toggle. That is harmless
  // during the FORWARD phase (a stray play() on an already-playing/about-to-
  // play element is a no-op), but during the REVERSE phase a stray play()
  // would resume NATIVE forward playback from wherever currentTime happens
  // to be mid-reverse, breaking the illusion. Rather than special-casing
  // syncLoopPlayback() itself (shared code, used by every other loop
  // chapter), this driver simply re-pauses on the very next frame if it
  // finds itself un-paused while it owns the reverse phase — the same
  // self-healing pattern already used for the bridge's own zonePlayOne().
  if (pingPongLoops.length && window.gsap) {
    gsap.ticker.add((time, deltaTime) => {
      const dtSec = Math.min(Math.max((deltaTime || 16.7) / 1000, 0), 0.25); // clamp a
                                                                              // tab-backgrounding
                                                                              // stall to 250ms of
                                                                              // simulated reverse
                                                                              // motion, never a jump
      pingPongLoops.forEach((s) => {
        const shouldRun = sectionInView && activeChapterKey === s.chapterKey;
        if (!shouldRun) {
          if (!s.el.paused) { try { s.el.pause(); } catch (err) {} }
          return;
        }
        if (s.direction === 1) {
          // FORWARD — native playback owns the clip. Self-heal: resume if
          // something else (syncLoopPlayback, a tab-visibility pause) left
          // it paused mid-forward.
          if (s.el.paused && !s.el.ended) {
            const p = s.el.play();
            if (p && typeof p.catch === "function") p.catch(() => {});
          }
          const dur = s.el.duration;
          const atEnd = s.el.ended || (dur > 0 && isFinite(dur) && s.el.currentTime >= dur - 0.05);
          if (atEnd) {
            s.direction = -1;
            try { s.el.pause(); } catch (err) {}
          }
        } else {
          // REVERSE — this driver owns currentTime directly; native playback
          // must stay paused for the whole phase (self-heal every tick).
          if (!s.el.paused) { try { s.el.pause(); } catch (err) {} }
          let next = s.el.currentTime - dtSec;
          if (next <= 0) {
            next = 0;
            s.direction = 1;
          }
          try { s.el.currentTime = next; } catch (err) { /* not yet seekable — retried next tick */ }
          if (s.direction === 1) {
            const p = s.el.play();
            if (p && typeof p.catch === "function") p.catch(() => {});
          }
        }
      });
    });
  }

  // -------------------------------------------------------------------
  // PHASE 3.2 (this task) — SCROLL-SCRUBBED COMPLETE<->EXPLODED VIDEO.
  // Reuses the EXACT scrub technique already approved for the index page's
  // hero build video (js/index-main.js's initHeroScrub): scroll progress is
  // mapped DIRECTLY onto video.currentTime, continuously and bidirectionally
  // (scroll down = disassembles/reassembles forward, scroll up = reverses,
  // stop = the exact frame holds) — never play()/pause(), never a second
  // rAF/ScrollTrigger instance (this piggy-backs on the ONE onProgress tick
  // museum2d-scroll.js's own master ScrollTrigger already emits — see the
  // `onProgress` hook wired into buildMuseumScrollExperience below).
  //
  // Both elements are the 'exploded' chapter_key pair's flat_layer videos
  // (exploded_transition_disassembly/assembly — the 'primary_layer' sibling
  // slots for chapter_key 'complete' are intentionally never instantiated,
  // see the discovery loop's isScrubSlot/TRANSITION_TARGET_PRIMARY guard
  // above). Because #museumFlat paints above #museumPrimary in this module's
  // existing DOM/stacking order, showing either video at opacity 1 already
  // fully occludes whatever museum2d-scroll.js's untouched per-chapter GSAP
  // tweens are doing underneath — "one visual owner" is achieved by
  // compositing order, not by disabling/rewriting that choreography.
  //
  // At most one of the two zones is ever active at a given scroll position
  // (SCRUB_ZONE_A/B never overlap — see their derivation above), so at most
  // one of these two elements is ever shown/scrubbed at a time, and neither
  // ever calls .play() — both remain in the browser's default paused state
  // for their entire lifetime, satisfying the single-active-video-decoder
  // rule the same way the rest of this module already does.
  // -------------------------------------------------------------------
  const scrubPair = transitionChapters.exploded || null;
  const scrubDisassemblyEl = (scrubPair && scrubPair.disassembly && scrubPair.disassembly.el) || null;
  const scrubAssemblyEl = (scrubPair && scrubPair.assembly && scrubPair.assembly.el) || null;
  const scrubVideoState = {
    dis: { el: scrubDisassemblyEl, zone: SCRUB_ZONE_A, visible: false },
    asm: { el: scrubAssemblyEl, zone: SCRUB_ZONE_B, visible: false }
  };

  function scrubSetVisible(s, visible) {
    if (!s.el || s.visible === visible) return;
    s.visible = visible;
    if (visible) showTransitionEl(s.el); else hideTransitionEl(s.el);
  }

  // GROUP B CONTENT EDIT — SHORT VERSION (this task): renamed from scrubOne().
  // Zone detection (SCRUB_ZONE_A/B, computed above) is UNCHANGED — this still
  // decides WHEN each element should be the visible/active one for its
  // direction. What changed is what happens once inside the zone: instead of
  // mapping scroll progress directly onto video.currentTime every tick (the
  // PHASE 3.2 behaviour), this now plays the clip through ONCE at its own
  // natural rate, per the owner's explicit instruction that this section must
  // "reproducirse automáticamente de principio a fin... sin frenarse con el
  // scroll". The element is shown and v.play() is called exactly once, the
  // first tick progress enters the zone (transition false->true); nothing
  // else is written to it on subsequent in-zone ticks — the browser's own
  // playback clock owns it from there. If it reaches its natural 'ended'
  // state while progress is still inside the zone, this function does
  // nothing further: a <video> holds its last decoded frame by default once
  // playback stops, which is exactly what keeps the section "showing" its
  // resolved state (for the assembly clip, the fully reassembled bridge —
  // see ASSET_SWAP_MAP.json's note on this slot) instead of cutting back to a
  // static image mid-scroll. Only when progress actually LEAVES the zone
  // (transition true->false, either direction) is the element paused and
  // hidden, hand-off to that boundary chapter's own normal presentation —
  // the same hand-off every other one-shot transition pair in this module
  // already performs on a chapter change (see settleOtherTransitions above).
  function zonePlayOne(s, progress) {
    if (!s.el) return;
    const inZone = progress >= s.zone.start && progress <= s.zone.end;
    // Held-last-frame band after the zone (see SCRUB_ZONE_A.holdUntil).
    const inHold = !inZone && s.zone.holdUntil != null && progress > s.zone.end && progress <= s.zone.holdUntil;
    if (inHold) {
      if (!s.visible) {
        // Re-entering the band while scrolling BACK: show the clip parked on its final frame.
        scrubSetVisible(s, true);
        try { s.el.pause(); if (isFinite(s.el.duration)) s.el.currentTime = Math.max(0, s.el.duration - 0.04); } catch (err) {}
      }
      return;
    }
    if (inZone && !s.visible) {
      scrubSetVisible(s, true);
      pauseAllMotionVideos(s.el); // single-active-video-decoder rule, same
                                   // guarantee playTransitionClip() gives the
                                   // ordinary one-shot pairs.
      try { s.el.currentTime = 0; } catch (err) { /* not yet seekable — plays from wherever it lands */ }
      const p = s.el.play();
      if (p && typeof p.catch === "function") p.catch(() => {}); // autoplay/decoding
                                                                   // failure -> stays
                                                                   // on its first frame,
                                                                   // never a stuck blank video
    } else if (!inZone && s.visible) {
      scrubSetVisible(s, false);
      try { s.el.pause(); } catch (err) {}
    } else if (inZone && s.visible && s.el.paused && !s.el.ended) {
      // SELF-HEALING RESUME (live-QA fix, this task): syncLoopPlayback()
      // calls pauseAllMotionVideos(null) — pausing EVERY motion video,
      // unconditionally — on every single onChapterChange event, including
      // one that lands INSIDE this element's own zone (e.g. the chapter
      // boundary the zone starts at). That pre-existing, unrelated behavior
      // is correct and untouched for every other chapter; it simply used to
      // be harmless for THIS pair because the old scrub mechanism never
      // called .play() at all. Confirmed live: without this branch, a
      // chapter-change tick landing mid-zone could pause this element right
      // after it started and it would never resume, holding a random early
      // frame instead of playing through. Resuming in place (not
      // restarting, not touched if already .ended) makes the one-shot
      // playthrough robust to that interaction without changing
      // syncLoopPlayback()/pauseAllMotionVideos() themselves.
      const p = s.el.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }
    // else: either still inside the zone and already playing/settled (left
    // alone, no restart) or still outside it (nothing to do).
  }

  function hideAllScrubVideos() {
    scrubSetVisible(scrubVideoState.dis, false);
    scrubSetVisible(scrubVideoState.asm, false);
    try { if (scrubVideoState.dis.el) scrubVideoState.dis.el.pause(); } catch (err) {}
    try { if (scrubVideoState.asm.el) scrubVideoState.asm.el.pause(); } catch (err) {}
  }

  const hasScrubVideos = !!(scrubDisassemblyEl || scrubAssemblyEl);

  // PHASE 3.2 POST-QA FIX — double-ownership guard, EXTENDED to VIDEO-ONLY
  // (this task, owner correction #2: "SOLO VIDEO EN ESA SECCION" — no
  // static image of any kind, including explosion_main, may remain visible
  // anywhere inside a scrub-video zone's own screen time).
  //
  // explosion_main is the flat-layer image SHARED by chapter 03 EXPLODED
  // and chapter 09 REASSEMBLY; primaryOuter (bridge_alpha's real animated
  // ancestor, .museum__primary) is chapters 01/02/10's shared layer.
  // museum2d-scroll.js's UNTOUCHED tweens independently drive both of
  // these across chapter boundaries that now fall INSIDE Zone A/B (Zone A
  // is chapter 03's entire tStart->he span, so it overlaps both
  // primaryOuter's own chapter-02-exit fade at tStart AND explosion_main's
  // own chapter-03-entrance fade). Live-browser QA on the previous
  // iteration (video only during the back part of chapter 03's hold)
  // confirmed explosion_main WAS still visible alone for the front part of
  // that chapter, exactly the "static cover" the owner rejected this round.
  // Rather than reworking museum2d-scroll.js's authored timing (out of
  // scope, and it must stay correct for when NO scrub video is present),
  // this force-writes BOTH elements' opacity to 0 for exactly the span
  // EITHER scrub video is visible, leaving them under full, untouched
  // museum2d-scroll.js control everywhere else (primaryOuter still does its
  // normal job for chapters 01/02/10 outside Zone A; explosion_main still
  // does its normal job for chapter 09's own reassembly-entrance outside
  // Zone B's suppressed span).
  //
  // MEASURED CORRECTION (earlier this task, post-implementation QA): the
  // master timeline is Lenis-scrubbed, so GSAP's OWN ticker re-renders it
  // on every animation frame independently of when onProgress fires (Lenis
  // feeds ScrollTrigger continuously via its own rAF loop, not only on
  // discrete scroll events) — a one-time write inside handleScrubProgress
  // therefore loses a race against GSAP's next tween render and gets
  // overwritten back to the tween's own opacity value (confirmed live: the
  // write landed, then was clobbered back to a fractional GSAP-driven value
  // within one frame). Fixed by registering on gsap.ticker itself instead:
  // GSAP invokes ticker callbacks in registration order, and its own
  // internal tween-rendering is wired in at library load, before this
  // module runs, so a callback added here via gsap.ticker.add() is
  // guaranteed to run after GSAP's own render for that frame — every
  // frame, not just on scroll ticks. The moment progress leaves BOTH zones
  // this stops writing and museum2d-scroll.js's own tweens (never
  // modified, still fully reversible) are free to paint their own value
  // again.
  //
  // primaryOuter needs different handling than explosionMainEl, and NOT as
  // a one-shot "restore on release" (tried first — fragile under fast/
  // programmatic scroll jumps that can skip the exact release frame,
  // confirmed live: it left primaryOuter stuck invisible partway back
  // through a reverse sweep instead of restoring at progress 0). Both of
  // Zone A's boundaries (opening/piers) border chapters whose relevant
  // tween for THIS element already completed (opening's own opacity was
  // set once, at builder init) or never touches it at all (piers, a
  // flat-kind chapter) — GSAP will not re-render primaryOuter's opacity
  // again on its own once we're back outside Zone A. So instead of an
  // edge-triggered restore, this asserts primaryOuter's correct value
  // EVERY frame, unconditionally, from two cheap, always-current facts:
  // whether Zone A is active right now, and which side of Zone A the last
  // known progress sits on:
  //   - inside Zone A                  -> 0 (suppressed, video only)
  //   - outside Zone A, before its start -> 1 (GROUP B FINAL CONTENT FLOW
  //     CORRECTION, this task: with 'exploded' now chapter 0, Zone A's own
  //     start is exactly 0 — this branch is therefore now permanently
  //     unreachable, progress can never be < 0 — kept only because it is
  //     still correct/harmless and removing it would add risk for no
  //     benefit; primaryOuter has no "before Zone A" resting state left to
  //     assert since there is no chapter before 'exploded' any more)
  //   - outside Zone A, at/after its end -> left UNTOUCHED. GROUP B FINAL
  //     CONTENT FLOW CORRECTION (this task): chapter 10 "complete" — whose
  //     own entrance tween used to bring primaryOuter back for the closing
  //     beat, which is what this branch originally deferred to — has been
  //     REMOVED from CHAPTER_SCRIPT. No chapter is `kind:"primary"` any
  //     more, so primaryOuter no longer appears in chapterEls/uniqueEls at
  //     all and nothing in museum2d-scroll.js ever touches its opacity
  //     again after this guard first suppresses it entering Zone A — it
  //     simply stays at 0 for the rest of the module's lifetime, which is
  //     correct: the closing "complete bridge" state is now the assembly
  //     video's own held last frame (Zone B), not a second bridge_alpha
  //     arrival. Zone B (asm) still intentionally does not suppress
  //     primaryOuter itself — it has nothing left to suppress by that point.
  // GROUP B FINAL CONTENT FLOW CORRECTION (this task) — third suppression
  // target added: `pendingLayer` (#museumPending / .museum__pending, the
  // element the CONSTRUCTION chapter's bau_loop_01 video tweens directly,
  // since its render_target is "pending_layer" rather than "flat_layer").
  // Zone B now starts exactly at 'reassembly'.tStart, same boundary as
  // before this task — but the caption/chapter-active window used by
  // museum2d-scroll.js's own chapterAt() is intentionally WIDER than a raw
  // chapter's tStart->he span (it extends half of the NEXT chapter's own
  // transitionIn past `he`, so captions overlap-crossfade instead of
  // cutting). That means CONSTRUCTION's own exit fade (driven by its
  // pendingLayer opacity tween) is still legitimately mid-transition for a
  // short span AFTER Zone B has already started showing the assembly video.
  // Live QA (this task) caught it directly: at a held scroll position
  // inside that overlap, `.museum__pending` measured opacity 0.4471 while
  // the assembly video was simultaneously opacity 1 — and because
  // `.museum__pending` shares #museumFlat's own z-index (2) and comes AFTER
  // it in the DOM, the partially-faded BAU/crane scene painted OVER the
  // video, not under it, reading as a genuine double-visual/wrong-content
  // glitch rather than a normal brief crossfade. Same fix pattern as
  // explosionMainEl below: force it to 0 for exactly the span Zone B's
  // video is visible, leave it under construction's own untouched tween
  // control everywhere else (its normal entrance/exit for chapters
  // materials<->construction<->reassembly, none of which are inside Zone
  // B). Zone A has no equivalent risk — BAU/pending is nowhere near the
  // exploded chapter — so this is gated on `asm.visible` only, not
  // `suppressShared`.
  const explosionMainEl = (flatLayers.explosion_main && flatLayers.explosion_main.el) || null;
  let scrubLastProgress = 0;
  if ((explosionMainEl || primaryOuter || pendingLayer) && window.gsap) {
    gsap.ticker.add(() => {
      const suppressShared = scrubVideoState.dis.visible || scrubVideoState.asm.visible;
      if (explosionMainEl) explosionMainEl.style.opacity = suppressShared ? "0" : "";
      // CONTENT FIX — RESTORE MATERIAL + BAU ONLY (this task): the "" release
      // pattern used below for explosionMainEl is WRONG for pendingLayer and
      // was the actual regression the owner reported ("La obra: cimbra y
      // grúa" showing text/background only, no video). Root cause, confirmed
      // live: `.museum__pending`'s own CSS default is `opacity: 0` (see
      // style.css) — GSAP's construction-chapter tween writes a real inline
      // opacity (e.g. 1) directly to this SAME element every frame it is
      // scrubbing, but this ticker callback runs AFTER that render (by
      // design, see the comment block above) and, when NOT suppressing,
      // immediately ERASED that inline style back to "" — which does not
      // mean "let GSAP's value show", it means "fall back to the CSS
      // default", i.e. invisible, EVERY single frame, permanently, any time
      // construction was the active chapter. explosionMainEl/primaryOuter do
      // not exhibit this because their own "on" chapters ('exploded'/
      // 'reassembly'/'complete') are ENTIRELY covered by Zone A/B suppression
      // by design already (video-only, no static image ever) — their real
      // GSAP-driven opacity is never actually needed to reach a visible value
      // anywhere, so the same "" pattern never had a visible chapter to
      // break. CONSTRUCTION is not covered by any zone, so its own tweened
      // opacity genuinely needs to reach the DOM. Fix: only ever WRITE "0"
      // while Zone B's assembly video is actually visible (the brief,
      // legitimate crossfade-overlap window at the construction->reassembly
      // boundary this guard exists for); do nothing at every other tick, so
      // GSAP's own tween is never fought outside that narrow window. Bridge
      // Zone A/B behavior itself (dis/asm triggering, autoplay, held end
      // frame) is untouched by this one-line change.
      if (pendingLayer && scrubVideoState.asm.visible) pendingLayer.style.opacity = "0";
      if (primaryOuter) {
        if (scrubVideoState.dis.visible) primaryOuter.style.opacity = "0";
        else if (scrubLastProgress < SCRUB_ZONE_A.start) primaryOuter.style.opacity = "1";
        // else: leave untouched, see comment above.
      }
    });
  }

  // Passed as `onProgress` to buildMuseumScrollExperience below — fired on
  // the SAME master-timeline ScrollTrigger tick as syncChapter(), never a
  // separate observer/rAF loop. Gated on sectionInView/document visibility,
  // mirroring the ambient-loop/transition-clip play/pause gate just above.
  function handleScrubProgress(progress) {
    scrubLastProgress = progress;
    if (!hasScrubVideos) return;
    if (!sectionInView || document.hidden) { hideAllScrubVideos(); return; }
    zonePlayOne(scrubVideoState.dis, progress);
    zonePlayOne(scrubVideoState.asm, progress);
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
        if (!sectionInView) {
          pauseAllMotionVideos(null);
          hideAllScrubVideos();
        } else {
          syncLoopPlayback(); // ambient loops resume; a mid-play transition
                               // clip intentionally does NOT auto-resume on
                               // re-entering the viewport (it already ran
                               // once for this chapter/direction — resuming
                               // it would be a second, unrequested play).
          handleScrubProgress(scrubLastProgress); // PHASE 3.2 — restores the
                               // scrub video's correct visibility/frame for
                               // whatever scroll position was last recorded.
        }
      }, { threshold: 0.15 }).observe(sticky || section);
    } else {
      sectionInView = true;
    }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        pauseAllMotionVideos(null);
        hideAllScrubVideos();
      } else {
        syncLoopPlayback();
        handleScrubProgress(scrubLastProgress); // PHASE 3.2 — see above
      }
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
  // GROUP B V2 — CURRENT + NEXT MEDIA. Chapter videos get their src at proximity but
  // stay preload="none"; the NEXT two chapters' clips are switched to preload="auto"
  // as soon as a chapter becomes active (and the first two when the section is
  // approached), so the next exhibit is buffered before the visitor reaches it.
  // Distant chapters stay untouched; nothing is decoded/played here.
  const WARM_ORDER = CHAPTER_SCRIPT.map((c) => c.key);
  function warmEl(el) {
    if (!el || !el.src || el.preload === "auto") return;
    el.preload = "auto";
    if (el.readyState === 0 && el.networkState === 1) { try { el.load(); } catch (err) { /* noop */ } }
  }
  function warmAhead(key) {
    const i = WARM_ORDER.indexOf(key);
    if (i < 0) return;
    for (let n = 1; n <= 2; n++) {
      const k = WARM_ORDER[i + n];
      const entry = k && loopLayers[k];
      if (entry && entry.video) warmEl(entry.video);
    }
  }
  let assetsRequested = false;
  let videosRequested = false;
  // MOBILE-FIRST (2026-10-09): the museum's transition/loop videos total ~30+ MB
  // (zone A/B clips alone ~30 MB). On touch/narrow viewports they are NO LONGER
  // attached by the idle fallback — only by the proximity trigger (visitor within
  // ~2 viewports of the section). Images (WebP, <1 MB each now) still use the
  // idle fallback everywhere; desktop keeps the idle video warm-up.
  const isDesktopLike = window.matchMedia("(min-width: 900px) and (pointer: fine)").matches;
  function ensureVideos() {
    if (videosRequested) return;
    videosRequested = true;
    // Loop videos join the same deferred gate, but only get their src — with
    // preload="none" that still costs zero bytes until the chapter is reached,
    // and it is deliberately NOT awaited, so a video can never delay the
    // ScrollTrigger.refresh() that the images' decode gate performs.
    videoPreloadQueue.forEach(({ el, url }) => { el.src = url; });
    warmAhead("exploded"); // warms piers + arches
  }
  function ensureAssets(fromProximity) {
    if (!assetsRequested) {
      assetsRequested = true;
      const decodes = preloadQueue.map(({ el, url }) => {
        el.src = url;
        if (typeof el.decode === "function") return el.decode().catch(() => {});
        return Promise.resolve();
      });
      Promise.all(decodes).then(() => {
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      });
    }
    if (fromProximity === true || isDesktopLike) ensureVideos();
  }

  if (window.ScrollTrigger) {
    ScrollTrigger.create({
      trigger: section,
      start: "top bottom+=100%",
      once: true,
      onEnter: () => ensureAssets(true)
    });
  }
  if ("requestIdleCallback" in window) window.requestIdleCallback(() => ensureAssets(false), { timeout: 6000 });
  else setTimeout(() => ensureAssets(false), 4000);

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
      warmAhead(key); // GROUP B V2 — current + next media strategy
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
      // PHASE 3.2 — SCRUB GUARD. A chapter_key flagged scrub:true (currently
      // "complete" and "exploded" — see transitionChapters[key].scrub above)
      // is now driven entirely by the continuous handleScrubProgress()
      // controller (wired via `onProgress` below), so its old one-shot
      // chapter-entry autoplay must never also fire — that would be a second,
      // conflicting visual owner for the same span. Every OTHER
      // transition-paired chapter (piers/arches/deck) has no such flag and
      // keeps its pre-existing one-shot behaviour completely unchanged.
      const tPair = transitionChapters[key];
      if (!loopLayers[key] && !(tPair && tPair.scrub)) triggerTransition(key, direction);
    },
    // PHASE 3.2 (this task) — fired on the SAME master-timeline ScrollTrigger
    // tick as onChapterChange's own chapter-boundary events (see the
    // `onProgress` hook added to buildMuseumScrollExperience in
    // museum2d-scroll.js), continuously, not just on chapter change. Drives
    // the scroll-scrubbed complete<->exploded video — see
    // handleScrubProgress()'s own doc comment above for the full mechanism.
    onProgress: (progress) => handleScrubProgress(progress),
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
          lastRole: e.lastRole,
          scrub: !!e.scrub // PHASE 3.2 — true for "complete"/"exploded"
        };
      }),
      // PHASE 3.2 (this task) — scroll-scrub QA snapshot: computed zone
      // boundaries (same [0,1] progress units the master ScrollTrigger
      // reports) and whether each direction actually has a live element.
      scrub: {
        zoneA: SCRUB_ZONE_A,
        zoneB: SCRUB_ZONE_B,
        hasDisassemblyVideo: !!scrubDisassemblyEl,
        hasAssemblyVideo: !!scrubAssemblyEl,
        reducedMotion: prefersReducedMotion
      }
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
