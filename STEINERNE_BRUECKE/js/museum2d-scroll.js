/* ZEITSPRUNG V2 — museum2d-scroll.js
   ============================================================================
   PHASE 2 of the Steinerne Brücke 2.5D museum module (#museum25d).

   WHAT THIS FILE IS
   -----------------
   The CHOREOGRAPHY layer. It owns:
     - the 10-chapter narrative script (dwell/transition timing in abstract
       "scroll units")
     - ONE authored GSAP master timeline driven by ONE pinned ScrollTrigger
     - the coordinated typography (caption beats) animated on that same
       timeline
     - the secondary chapter-dot navigation
     - the progress -> chapter mapping (a pure function of progress)

   WHAT THIS FILE IS NOT
   ---------------------
   It is NOT an asset system. It contains ZERO image/video paths and never
   reads the manifest. museum25d.js remains the single manifest / slot
   resolution / fit-mode authority; it resolves every layer element and hands
   them here through `layerFor()`. This module only moves elements it is given.

   HISTORICAL COPY RULE
   --------------------
   Every word of on-screen prose comes from
   03_ASSETS/Steinerne_Bruecke/2d/MUSEUM_CONTENT_MAP.json (labels /
   short_description / extended_description, per language, each carrying its
   own `evidence_status` + `sources`), or — for chapters that have NO validated
   content entry — from the pre-existing, already-approved i18n label/sub
   strings only. Nothing is authored here. Chapters without a content entry are
   deliberately kept VISUALLY-LED with a minimal label instead of receiving
   invented description text (`textless: true`).

   MOTION RULE
   -----------
   Every chapter transition is a coordinated depth move between WHOLE image
   layers: opacity + translate + scale + very small rotateX/rotateY, plus one
   short transition blur on desktop only. No PNG is ever split, warped,
   decomposed or animated piece-by-piece — the "explosion" and "reassembly"
   illusions come exclusively from camera-like depth motion between whole,
   rigid images. No particles, no spin, no bounce, no glow.

   DETERMINISM (forward AND reverse scroll)
   ----------------------------------------
     1. Every animated element gets an explicit gsap.set() initial state before
        the timeline is built.
     2. EVERY tween is a fromTo() with `immediateRender: false`, so creation
        order can never corrupt the initial state, and the playhead moving
        backwards past a tween restores its exact "from" values.
     3. Per element+property, tween time ranges NEVER overlap. Endpoint
        continuity is guaranteed structurally by the `st()` state tracker: each
        new tween's "from" IS the previous tween's "to".
     4. The only place a value may jump discontinuously is while the element is
        at opacity 0 (used for the explosion layer's re-entry in REASSEMBLY and
        for the bridge's return in COMPLETE) — see `jumpTo()`.
     5. Text CONTENT is never swapped mid-scroll. Each chapter owns permanent
        caption DOM, so the timeline only ever crossfades blocks. There is no
        scroll-direction-dependent state machine anywhere in this file.

   PHASE 2.2 — TYPOGRAPHY
   ----------------------
   The caption MOTION is no longer authored here. It is delegated to the
   reusable ZT typography system (./zt-typography.js), which owns every
   distance / duration / stagger / ease / drop-cap value and the accessible
   character-splitting machinery. This file keeps ownership of WHEN each beat
   happens inside a chapter (BEAT_SCHEDULE below) and hands the typography
   module its own deterministic primitives (`engine`), so every tween it emits
   still obeys rules 1-5 above.
   ============================================================================ */

import { createZtTypography, ztVisualLength, ZT_TYPO } from "./zt-typography.js";

// ---------------------------------------------------------------------------
// TIMING MODEL
// One "unit" = UNIT_VH percent of the pinned stage height of scrolling.
// TOTAL_UNITS is derived from the script below, so the pinned length is
// total * 55 % of the stage height. Change UNIT_VH alone to make the exhibit
// longer/shorter without touching any chapter's relative rhythm.
//
// PHASE 2.2: the `hold` (dwell) values below were lengthened so every important
// chapter reads as OBJECT -> TITLE -> TEXT -> READING MOMENT -> TRANSITION
// instead of object + text-flash -> next chapter. The `transitionIn` values are
// deliberately UNCHANGED: every object tween is expressed as a fraction of its
// own `m.tin`, so leaving the transitions alone keeps Phase 2.1's approved
// object choreography bit-for-bit identical while only the reading time grows.
//   before: 25.0 units -> 1375% pinned length
//   after : 35.9 units -> 1974% pinned length  (+43.6%)
// (35.9*55 = 1974.4999... in IEEE-754, so Math.round() yields 1974, not 1975.)
// ---------------------------------------------------------------------------
const UNIT_VH = 55;

// Must match .museum__flat-img's CSS drop-shadow so the one blur tween below
// can animate `filter` without silently deleting the shadow.
const FLAT_SHADOW = "drop-shadow(0 22px 40px rgba(0,0,0,0.55))";

// ---------------------------------------------------------------------------
// THE 10-CHAPTER SCRIPT
//   transitionIn : scroll units spent transitioning INTO this chapter
//   hold         : scroll units this chapter dwells (time to read / inspect)
//   layer        : "primary" (the rigid bridge_alpha layer) | "flat" + slot
//   text         : which MUSEUM_CONTENT_MAP.json entries feed the captions
//                  - primary        : content id -> eyebrow / title / short_description
//                  - detail         : a SECOND content id, revealed later in the
//                                     same chapter's own scroll range
//                  - detailExtended : reveals `extended_description` of `primary`
//                                     later in the same chapter's scroll range
//                  - specimens      : material chapter — N validated entries
//                                     cycled as sub-beats
//                  - textless       : NO content entry exists -> label/sub only,
//                                     visually led, nothing invented
//   dim          : how far the image layer dims while a long text beat is on
//                  screen (readability + a deliberate "reading" beat)
//   dropCap      : "a" | "b" — which beat's paragraph receives the ZT_DROP_CAP
//                  treatment. PURELY PRESENTATIONAL: the sentence inside a drop
//                  cap is the exact same validated string from
//                  MUSEUM_CONTENT_MAP.json, never a rewritten one.
// ---------------------------------------------------------------------------
export const CHAPTER_SCRIPT = [
  {
    key: "overview", transitionIn: 0, hold: 1.9,
    layer: { kind: "primary" },
    labelKey: "museumModeOverview", subKey: "museumSubOverview",
    text: { primary: "bridge_overview_structure" }
  },
  {
    // "OPENING" — no dedicated content entry exists and none is invented.
    // Reuses the already-approved STRUKTUR label/sub, which is exactly what
    // this beat shows: the bridge opening up into its structural geometry.
    key: "opening", transitionIn: 1.2, hold: 0.9,
    layer: { kind: "primary" },
    labelKey: "museumModeStructure", subKey: "museumSubStructure",
    text: { textless: true }
  },
  {
    key: "exploded", transitionIn: 1.2, hold: 1.4,
    layer: { kind: "flat", slot: "explosion_main" },
    labelKey: "museumModeExploded", subKey: "museumSubExploded",
    text: { textless: true } // explosion_main has content_ids: [] — visual only
  },
  {
    key: "piers", transitionIn: 1.0, hold: 3.2,
    layer: { kind: "flat", slot: "pfeiler_detail" },
    labelKey: "museumModePiers", subKey: "museumSubPiers",
    text: { primary: "pier_structure", detail: "beschlaechte_pier_protection" },
    dim: 0.5
  },
  {
    key: "arches", transitionIn: 1.0, hold: 3.2,
    layer: { kind: "flat", slot: "boegen_detail" },
    labelKey: "museumModeArches", subKey: "museumSubArches",
    text: { primary: "arch_construction", detailExtended: true },
    dim: 0.5
  },
  {
    key: "deck", transitionIn: 1.0, hold: 3.2,
    layer: { kind: "flat", slot: "fahrbahn_main" },
    labelKey: "museumModeDeck", subKey: "museumSubDeck",
    text: { primary: "fahrbahn_belag", detailExtended: true },
    dim: 0.5
  },
  {
    key: "materials", transitionIn: 1.0, hold: 4.2,
    layer: { kind: "flat", slot: "material_stone" },
    labelKey: "museumModeMaterials", subKey: "museumSubMaterials",
    text: {
      specimens: [
        "material_kalkstein", "material_gruensandstein", "material_fuellmauerwerk",
        "material_holzpfahl", "material_eisenklammer", "material_findling"
      ]
    },
    dim: 0.42
  },
  {
    key: "construction", transitionIn: 1.0, hold: 3.5,
    layer: { kind: "flat", slot: "bau_construction" },
    labelKey: "museumModeConstruction", subKey: "museumSubConstruction",
    text: { primary: "bau_process_lehrgeruest_kran", detailExtended: true },
    // ZT_DROP_CAP — the only drop cap in the exhibit. See §DROP CAP below.
    dropCap: "b",
    dim: 0.5
  },
  {
    // REASSEMBLY — explosion_main returns as the structural intermediary
    // between the isolated components and the finished bridge. Same rigid
    // image, re-entering from a WIDER framing so it reads as parts converging
    // inward rather than a new picture appearing.
    key: "reassembly", transitionIn: 1.2, hold: 1.0,
    layer: { kind: "flat", slot: "explosion_main" },
    labelKey: "museumModeReassembly", subKey: "museumSubReassembly",
    text: { textless: true }
  },
  {
    key: "complete", transitionIn: 1.4, hold: 3.4,
    layer: { kind: "primary" },
    labelKey: "museumModeComplete", subKey: "museumSubComplete",
    // No dim here on purpose: the closing state must resolve calm and bright.
    text: { primary: "bridge_overview_structure", detailExtended: true }
  }
];

// Evidence-status chip copy lives in js/i18n.js as museumEvidence<STATUS>
// (DE/EN/ES). It is a UI translation of MUSEUM_CONTENT_MAP.json's
// `evidence_status` enum — terminology only, never a historical claim. It is
// displayed so RECONSTRUCTED / ESTIMATED content is never read as confirmed
// fact. Unknown enum values fall through to the raw value rather than being
// silently dropped.
const EVIDENCE_KEYS = [
  "PRESERVED", "PARTIALLY_PRESERVED", "RECONSTRUCTED", "ESTIMATED", "NEEDS_VALIDATION"
];
function evidenceLabel(status, t, lang) {
  if (!status) return "";
  return EVIDENCE_KEYS.indexOf(status) === -1 ? status : t(lang, `museumEvidence${status}`);
}

const CHIP_ACTIVE_COLOR = "#d4af78";              // === var(--z-gold)
const CHIP_IDLE_COLOR = "rgba(244,239,230,0.34)"; // === var(--z-ink-faint)

// ---------------------------------------------------------------------------
// BEAT SCHEDULE (PHASE 2.2)
// WHEN each text beat happens inside its chapter, in fractions of that
// chapter's own `transitionIn` / `hold`. This is the ONLY place chapter-level
// text scheduling numbers live in this file; HOW the text moves (distances,
// durations, staggers, eases) lives exclusively in ZT_TYPO.
//
// The intended rhythm per important chapter:
//   object establishes  -> aStartOfTin  (62% into the incoming transition)
//   eyebrow / title / body reveal, sequenced by the ZT presets
//   READING MOMENT      -> nothing moves for at least `readMin`
//   beat A leaves       -> bStartOfHold
//   beat B reveals      -> bStartOfHold + bRevealOffset
//   READING MOMENT      -> again at least `readMin`
//   beat leaves         -> at the chapter's own `he`
// ---------------------------------------------------------------------------
const BEAT_SCHEDULE = {
  aStartFirst: 0.05,        // chapter 01 has no incoming transition
  aStartOfTin: 0.62,        // object first, then the text
  bStartOfHold: 0.44,       // beat A exits here
  bRevealOffset: 0.26,      // beat B starts this long after beat A begins leaving
  hideAOfHold: 0.16,        // beat-A exit duration cap, as a fraction of hold
  readMin: 0.30,            // guaranteed static reading time before the next event
  specStartOfHold: 0.28,    // MATERIAL: when the specimen cycle begins
  specInOfBeat: 0.42,       // specimen reveal duration, fraction of its sub-beat
  specOutAtOfBeat: 0.76,    // when a specimen begins to leave
  specOutOfBeat: 0.30,      // specimen exit duration, fraction of its sub-beat
  dimAtOfHold: 0.40,        // object dim for the long reading beat
  dimAtOfHoldSpecimens: 0.18,
  dimDurOfHold: 0.18,
  exitOfNextTin: 0.45,      // chapter exit duration, fraction of the NEXT tin
  exitMin: 0.25,
  winMin: 0.20              // never hand the typography a degenerate window
};

// The three languages the split-title character pools must be sized for. Pool
// size is the MAXIMUM over all three, so switching language can never need a
// span that does not already exist. See §MULTILINGUAL in zt-typography.js.
const LANGS = ["de", "en", "es"];

// ---------------------------------------------------------------------------
// Timing map — derived once from CHAPTER_SCRIPT. Pure data, no side effects.
//   tStart : unit time the transition INTO this chapter begins
//   hs     : unit time this chapter's hold begins (object settled)
//   he     : unit time this chapter's hold ends (its exit transition begins)
// ---------------------------------------------------------------------------
export function buildTimingMap(script) {
  const marks = [];
  let time = 0;
  script.forEach((ch, i) => {
    const tin = i === 0 ? 0 : ch.transitionIn;
    const tStart = time;
    const hs = time + tin;
    const he = hs + ch.hold;
    marks.push({ tStart, tin, hs, he, hold: ch.hold });
    time = he;
  });
  return { marks, total: time };
}

// ---------------------------------------------------------------------------
// Caption DOM. Built ONCE. Every chapter owns permanent markup for all of its
// text beats, so scroll never swaps text content — it only crossfades blocks.
// This is the single biggest reason the typography reverses deterministically.
// ---------------------------------------------------------------------------
function el(tag, cls, attrs) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (attrs) Object.keys(attrs).forEach((k) => node.setAttribute(k, attrs[k]));
  return node;
}

function makeEyebrow(index, total) {
  const p = el("p", "museum__cap-eyebrow", { "data-reveal": "eyebrow" });
  const idx = el("span", "museum__cap-index");
  idx.textContent = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  p.appendChild(idx);
  p.appendChild(el("span", "museum__cap-chapter"));
  p.appendChild(el("span", "museum__cap-evidence"));
  return p;
}

// ---------------------------------------------------------------------------
// TITLE TEXT AUTHORITY (PHASE 2.2)
// ONE function decides what a beat's title says, in any language. Used both by
// fillCaptions() (to display it) and by buildCaptions() (to measure the longest
// translation and size the character pool). Having a single implementation is
// what guarantees the pool can never be too small for a language.
//
// Nothing here authors copy: it either reads MUSEUM_CONTENT_MAP.json labels or
// the already-approved i18n sub-line for chapters that have no content entry —
// exactly the same rule as Phase 2.
// ---------------------------------------------------------------------------
function beatTitleText(ch, content, t, lang, which) {
  const primary = ch.text.primary ? content[ch.text.primary] : null;
  if (which === "b") {
    const detail = ch.text.detail ? content[ch.text.detail] : primary;
    return detail ? pick(detail.labels, lang) : "";
  }
  if (ch.text.textless || ch.text.specimens) return t(lang, ch.subKey) || "";
  return primary ? pick(primary.labels, lang) : "";
}

function titlePoolSize(ch, content, t, which) {
  let max = 0;
  LANGS.forEach((lang) => {
    max = Math.max(max, ztVisualLength(beatTitleText(ch, content, t, lang, which)));
  });
  return max;
}

// Title block. The inner structure (visually-hidden full text + aria-hidden
// split, or a single semantic line under reduced motion) is built by the
// typography module; `museum__cap-line` is handed to it so every existing
// font-size / weight / desktop-override CSS rule still applies unchanged.
function makeTitle(typo, poolSize) {
  const h = el("h4", "museum__cap-title", { "data-reveal": "title" });
  typo.mountTitle(h, poolSize, "museum__cap-line");
  return h;
}

function makeLead(typo, cls, dropCap) {
  const p = el("p", cls, { "data-reveal": "lead" });
  typo.mountLead(p, !!dropCap);
  return p;
}

function buildCaptions(host, script, typo, content, t) {
  host.innerHTML = "";
  const total = script.length;
  const refs = [];

  script.forEach((ch, i) => {
    const cap = el("article", "museum__cap", { "data-cap": ch.key });
    const beats = [];

    // ---- Beat A — always present -------------------------------------
    const beatA = el("div", "museum__cap-beat", { "data-beat": "a" });
    beatA.appendChild(makeEyebrow(i, total));
    beatA.appendChild(makeTitle(typo, titlePoolSize(ch, content, t, "a")));
    if (!ch.text.textless && !ch.text.specimens) {
      beatA.appendChild(makeLead(typo, "museum__cap-lead", ch.dropCap === "a"));
    }
    if (ch.text.specimens) {
      // Order matters: the specimen slot sits ABOVE the chip index, so a long
      // description grows upward toward the title instead of over the index.
      // data-zt-group makes the slot and the chip index reveal AS ONE stage —
      // the slot's own children are individually animated sub-beats, so giving
      // it a separate stage of its own would only add dead time.
      const slot = el("div", "museum__cap-spec-slot", { "data-reveal": "specslot", "data-zt-group": "specs" });
      ch.text.specimens.forEach(() => slot.appendChild(el("p", "museum__cap-spec")));
      beatA.appendChild(slot);
      const chips = el("div", "museum__cap-chips", { "data-reveal": "chips", "data-zt-group": "specs" });
      ch.text.specimens.forEach(() => chips.appendChild(el("span", "museum__cap-chip")));
      beatA.appendChild(chips);
    }
    cap.appendChild(beatA);
    beats.push(beatA);

    // ---- Beat B — second text phase inside the SAME chapter -----------
    // Used when validated content is longer than comfortably fits at once
    // (spec: distribute across the chapter's own scroll duration).
    if (ch.text.detail || ch.text.detailExtended) {
      const beatB = el("div", "museum__cap-beat", { "data-beat": "b" });
      beatB.appendChild(makeEyebrow(i, total));
      beatB.appendChild(makeTitle(typo, titlePoolSize(ch, content, t, "b")));
      beatB.appendChild(makeLead(typo, "museum__cap-lead museum__cap-lead--long", ch.dropCap === "b"));
      cap.appendChild(beatB);
      beats.push(beatB);
    }

    host.appendChild(cap);
    refs.push({ cap, beats, chapter: ch, index: i });
  });

  return refs;
}

// ---------------------------------------------------------------------------
// Text population — re-runnable on every DE/EN/ES change. Reads ONLY from the
// content map + the existing i18n dictionary.
// ---------------------------------------------------------------------------
function pick(obj, lang) {
  if (!obj) return "";
  return obj[lang] || obj.de || "";
}

function setEyebrow(beat, chapterLabel, evidenceStatus, t, lang) {
  const chapterEl = beat.querySelector(".museum__cap-chapter");
  const evEl = beat.querySelector(".museum__cap-evidence");
  if (chapterEl) chapterEl.textContent = chapterLabel;
  if (!evEl) return;
  if (!evidenceStatus) {
    evEl.textContent = "";
    evEl.hidden = true;
    return;
  }
  evEl.hidden = false;
  evEl.setAttribute("data-status", evidenceStatus);
  evEl.textContent = evidenceLabel(evidenceStatus, t, lang);
}

function fillCaptions(refs, typo, content, t, lang) {
  refs.forEach((ref) => {
    const ch = ref.chapter;
    const beatA = ref.beats[0];
    const beatB = ref.beats[1];
    const primary = ch.text.primary ? content[ch.text.primary] : null;

    // ---- Beat A
    setEyebrow(beatA, t(lang, ch.labelKey), primary ? primary.evidence_status : null, t, lang);
    const leadA = beatA.querySelector(".museum__cap-lead");

    // Title: one authority (beatTitleText) for both the measured pool size and
    // the displayed string, so they can never diverge. setTitleText REUSES the
    // pooled character spans — it never creates or destroys a wrapper, which is
    // what makes repeated DE/EN/ES switching non-accumulating.
    typo.setTitleText(beatA.querySelector(".museum__cap-title"), beatTitleText(ch, content, t, lang, "a"));
    if (leadA && primary && !ch.text.textless && !ch.text.specimens) {
      typo.setLeadText(leadA, pick(primary.short_description, lang));
    }

    if (ch.text.specimens) {
      const chips = beatA.querySelectorAll(".museum__cap-chip");
      const specs = beatA.querySelectorAll(".museum__cap-spec");
      ch.text.specimens.forEach((id, k) => {
        const c = content[id];
        if (!c || !chips[k]) return;
        chips[k].textContent = pick(c.labels, lang);
        specs[k].innerHTML = "";
        const chip = el("span", "museum__cap-evidence museum__cap-evidence--inline", { "data-status": c.evidence_status });
        chip.textContent = evidenceLabel(c.evidence_status, t, lang);
        const body = el("span", "museum__cap-spec-text");
        body.textContent = pick(c.short_description, lang);
        specs[k].appendChild(chip);
        specs[k].appendChild(body);
      });
    }

    // ---- Beat B
    if (beatB) {
      const detail = ch.text.detail ? content[ch.text.detail] : primary;
      if (!detail) return;
      setEyebrow(beatB, t(lang, ch.labelKey), detail.evidence_status, t, lang);
      typo.setTitleText(beatB.querySelector(".museum__cap-title"), beatTitleText(ch, content, t, lang, "b"));
      // The drop cap (when this beat has one) is applied INSIDE setLeadText by
      // splitting the rendered string — the string itself is untouched
      // validated content, and the complete unfragmented sentence is what
      // assistive technology receives.
      typo.setLeadText(beatB.querySelector(".museum__cap-lead"), ch.text.detail
        ? pick(detail.short_description, lang)
        : pick(detail.extended_description, lang));
    }
  });
}

// ---------------------------------------------------------------------------
// PUBLIC BUILDER
// ---------------------------------------------------------------------------
export function buildMuseumScrollExperience({
  sticky, captionHost, dotsWrap,
  primaryOuter, layerFor, content,
  t, getLang, lenis, reducedMotion,
  onPrimaryVisible, onChapterChange,
  // PHASE 2.4A — OPTIONAL, purely-informational SFX hook. This module still
  // authors ZERO audio itself and knows no semantic sound names; it only
  // reports "a specimen sub-beat started" (the one in-chapter beat that has
  // no chapter-change/transition-clip event of its own to hang audio on — see
  // museum25d.js's handleChapterAudio for the other chapters). Implemented as
  // a plain tl.call() side-effect callback: it registers no tween, animates no
  // property and therefore cannot violate the determinism rules (§DETERMINISM)
  // that govern every visual tween in this file. GSAP calls a tl.call()
  // callback whenever the playhead crosses that instant in EITHER scroll
  // direction, which is intentional here (the caller's own cooldown handles a
  // rapid back-and-forth scrub around the same instant).
  onSfxBeat,
  // PHASE 3.2 (this task) — OPTIONAL, purely-informational raw-progress hook,
  // fired with the SAME self.progress the master ScrollTrigger already
  // computes on every tick (piggy-backs on the one existing onUpdate below —
  // no second ScrollTrigger/rAF loop is created). Registers no tween, reads
  // no state and therefore cannot violate this file's own determinism rules
  // (§DETERMINISM). museum25d.js is the only consumer, for its
  // scroll-scrubbed complete<->exploded video (see SCRUB_ZONE_A/B there) —
  // this file still authors zero video/media logic itself.
  onProgress
}) {
  const script = CHAPTER_SCRIPT;
  const { marks, total } = buildTimingMap(script);

  // The SINGLE switch that turns depth motion off for prefers-reduced-motion
  // while keeping 100% of the content and the exact same chapter architecture
  // (opacity-only crossfades, identical scroll length, identical text order).
  const R = !!reducedMotion;
  const mv = (v) => (R ? 0 : v); // translation / rotation offsets
  const ms = (v) => (R ? 1 : v); // scale factors
  const canBlur = !R && window.matchMedia("(min-width: 900px)").matches;

  // -- typography ----------------------------------------------------------
  // The ZT typography system is handed THIS file's own deterministic
  // primitives, so every tween it emits is registered in the same `states`
  // tracker and obeys the same fromTo/immediateRender rules as the object
  // choreography. It never touches the timeline directly except through these.
  // (engineSet/engineTw/engineTween are hoisted function declarations defined
  // further down; they are never CALLED before `states`/`tl` exist.)
  const typo = createZtTypography({
    engine: { set: engineSet, tw: engineTw, tween: engineTween },
    reducedMotion: R,
    desktop: window.matchMedia(`(min-width: ${ZT_TYPO.desktopMinWidth}px)`).matches
  });

  // -- caption DOM ---------------------------------------------------------
  const refs = buildCaptions(captionHost, script, typo, content, t);
  fillCaptions(refs, typo, content, t, getLang());

  // -- element resolution --------------------------------------------------
  // layerFor() is museum25d.js's manifest-resolved element provider. It may
  // return the SAME element twice (explosion_main is used by both EXPLODED and
  // REASSEMBLY) — intentional, and handled by the state tracker below.
  const chapterEls = script.map((ch) => layerFor(ch));
  const uniqueEls = [];
  chapterEls.forEach((e) => { if (e && uniqueEls.indexOf(e) === -1) uniqueEls.push(e); });

  // -------------------------------------------------------------------------
  // No-GSAP fallback: full content, no animation, no pin.
  // -------------------------------------------------------------------------
  if (!window.gsap) {
    refs.forEach((ref, i) => {
      ref.beats.forEach((b, k) => { b.style.opacity = (i === 0 && k === 0) ? "1" : "0"; });
      // Includes the split characters / drop cap, which have no inline styles
      // of their own until a tween writes them — without this they would be
      // invisible in the no-GSAP path.
      typo.showBeatStatic(ref.beats[0]);
    });
    if (primaryOuter) primaryOuter.style.opacity = "1";
    return {
      refreshLabels: () => fillCaptions(refs, typo, content, t, getLang()),
      refresh: () => {},
      chapterCount: script.length,
      totalUnits: total,
      endPercent: 0,
      scrollTrigger: () => null
    };
  }

  // -------------------------------------------------------------------------
  // DETERMINISM MACHINERY (see header §DETERMINISM)
  // `states` holds the authored value of every animated property of every
  // element at the current point of timeline CONSTRUCTION. Every tween's
  // "from" is read from here and its "to" written back, which structurally
  // guarantees endpoint continuity and non-overlapping windows per property.
  // -------------------------------------------------------------------------
  const states = new Map();
  function st(node, initial) {
    if (!states.has(node)) states.set(node, Object.assign({}, initial || {}));
    return states.get(node);
  }
  function jumpTo(node, vals) {
    // ONLY legal while the element is invisible (opacity 0) — an unseen reset.
    Object.assign(st(node), vals);
  }

  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });

  function tw(node, at, dur, to, ease) {
    if (!node || !(dur > 0)) return;
    const cur = st(node);
    const from = {};
    Object.keys(to).forEach((k) => { from[k] = cur[k]; });
    tl.fromTo(node, from, Object.assign({}, to, {
      duration: dur,
      ease: ease || "power2.inOut",
      immediateRender: false // rule 2 — creation order can never corrupt state
    }), at);
    Object.assign(cur, to);
  }

  // -------------------------------------------------------------------------
  // ENGINE ADAPTER for the ZT typography module (PHASE 2.2).
  // Three primitives, nothing more. `set` registers the initial state in the
  // SAME `states` map used by the object choreography, so a typography tween's
  // "from" comes from the same authority as everything else and rule 3
  // (non-overlapping windows per element+property) holds across both systems.
  // `tween` exists only for properties the state tracker does not need to carry
  // (letter-spacing), and is the exact same untracked pattern Phase 2 already
  // used for the eyebrow tracking settle.
  // -------------------------------------------------------------------------
  function engineSet(node, vars) {
    if (!node) return;
    gsap.set(node, vars);
    Object.assign(st(node, {}), vars);
  }
  function engineTw(node, at, dur, to, ease) {
    tw(node, at, dur, to, ease);
  }
  function engineTween(node, from, to, at, dur, ease) {
    if (!node || !(dur > 0)) return;
    tl.fromTo(node, from, Object.assign({}, to, {
      duration: dur, ease: ease || "power2.out", immediateRender: false
    }), at);
  }

  // -- initial states (rule 1) ---------------------------------------------
  const LAYER_INIT = { opacity: 0, scale: 1, y: 0, rotateX: 0, rotateY: 0 };
  uniqueEls.forEach((node) => {
    gsap.set(node, Object.assign({}, LAYER_INIT, {
      x: 0, transformPerspective: 1200, transformOrigin: "50% 50%", force3D: true
    }));
    st(node, LAYER_INIT);
  });
  // Chapter 01 is the calm initial state: the bridge is simply already there.
  // (Deliberately NOT an entrance tween — a 0-progress tween would render its
  // "from" state at the exact moment the pin engages and flash an empty stage.)
  if (chapterEls[0]) {
    gsap.set(chapterEls[0], { opacity: 1 });
    st(chapterEls[0]).opacity = 1;
  }

  refs.forEach((ref) => {
    ref.beats.forEach((beat) => {
      gsap.set(beat, { force3D: true });
      engineSet(beat, { opacity: 1, y: 0 });
      // Every [data-reveal] part (eyebrow / title / lead / spec slot / chips) —
      // including the split characters and the drop cap — is initialised by the
      // typography module from ZT_TYPO, not from numbers in this file.
      typo.initBeat(beat);
      beat.querySelectorAll(".museum__cap-chip").forEach((chip) => {
        engineSet(chip, { color: CHIP_IDLE_COLOR });
      });
      beat.querySelectorAll(".museum__cap-spec").forEach((spec) => {
        typo.initLine(spec);
      });
    });
  });

  // -------------------------------------------------------------------------
  // TYPOGRAPHY (PHASE 2.2 — delegated to ./zt-typography.js)
  //
  // reveal order per beat, sequenced by the ZT presets, never overlapping:
  //   eyebrow / category  -> ZT eyebrow preset (rise + tracking settle)
  //   title               -> ZT_REVEAL_CHAR (short titles) or ZT_REVEAL_LINE
  //                          (long titles / reduced motion: the pre-existing
  //                          masked vertical reveal)
  //   body copy           -> ZT_REVEAL_LINE, optionally led by ZT_DROP_CAP
  //   spec slot + chips   -> one grouped ZT_REVEAL_LINE stage
  // exit: the whole beat block, so a chapter's text is gone before the next
  //       object becomes dominant.
  //
  // `win` caps the reveal so it can never eat the chapter's reading moment or
  // spill into its exit; the module time-scales its own plan to fit.
  // -------------------------------------------------------------------------
  function revealBeat(beat, at, win) {
    return typo.revealBeat(beat, at, win);
  }

  function hideBeat(beat, at, dur) {
    typo.hideBlock(beat, at, dur);
  }

  // -------------------------------------------------------------------------
  // OBJECT CHOREOGRAPHY
  // Generic depth transition: the outgoing whole image recedes (scales down,
  // sinks, yaws slightly, fades) while the incoming whole image advances out of
  // depth and settles. 30% overlap -> never a blank frame.
  // -------------------------------------------------------------------------
  function depthTransition(outEl, inEl, at, dur) {
    if (outEl && outEl !== inEl) {
      tw(outEl, at, dur * 0.70, { opacity: 0, scale: ms(0.86), y: mv(30), rotateY: mv(-4) }, "power2.in");
    }
    if (inEl && inEl !== outEl) {
      jumpTo(inEl, { opacity: 0, scale: ms(1.16), y: mv(-34), rotateY: mv(5), rotateX: 0 });
      tw(inEl, at + dur * 0.40, dur * 0.60, { opacity: 1, scale: 1, y: 0, rotateY: 0 }, "power2.out");
    }
  }

  // ---- chapter-by-chapter authoring --------------------------------------
  script.forEach((ch, i) => {
    const m = marks[i];
    const layer = chapterEls[i];
    const prevLayer = i > 0 ? chapterEls[i - 1] : null;
    const beatA = refs[i].beats[0];
    const beatB = refs[i].beats[1];
    const nextTin = i < script.length - 1 ? marks[i + 1].tin : 0;

    // ---------- OBJECT ----------
    if (i === 0) {
      // Calm start — no entrance motion at all (state set above).
    } else if (ch.key === "opening") {
      // T1 — the bridge itself pushes forward in depth. Same rigid layer,
      // reframed as a whole (scale / translate / tilt), never warped.
      tw(layer, m.tStart, m.tin, { scale: ms(1.18), y: mv(-14), rotateX: mv(3) }, "power1.inOut");

      // PHASE 2.1 — OPENING is the chapter with the most unused stage: the
      // panoramic bridge is a shallow ~7:1 band, so most of the portrait
      // mobile stage is empty while the visitor waits for chapter 03. Rather
      // than leaving that space blank, the exploded structure PRE-ENTERS here
      // at low opacity from deep in the stage, spatially overlapping the still
      // complete bridge — the structure visibly beginning to separate instead
      // of a held pause. Strictly opacity/scale/translate on the WHOLE rigid
      // image, consistent with every other transition in this module: no
      // particles, no per-component motion, no split geometry.
      // It is a fromTo() like every other tween, with its own non-overlapping
      // time window, so it reverses exactly, and the jumpTo() below is legal
      // because the layer is still at opacity 0 at this point (rule 4).
      const emerging = chapterEls[i + 1];
      if (emerging && emerging !== layer) {
        jumpTo(emerging, { opacity: 0, scale: ms(0.58), y: mv(56), rotateX: 0, rotateY: 0 });
        tw(
          emerging,
          m.tStart + m.tin * 0.55,
          m.tin * 0.45 + ch.hold * 0.9,
          { opacity: 0.16, scale: ms(0.72), y: mv(38) },
          "power1.out"
        );
      }
    } else if (ch.key === "exploded") {
      // T2 — "the bridge opens": the camera keeps pushing until it passes
      // THROUGH the bridge, and the component study emerges from inside it.
      tw(prevLayer, m.tStart, m.tin * 0.72, {
        opacity: 0, scale: ms(1.62), y: mv(-40), rotateX: mv(6)
      }, "power2.in");
      // PHASE 2.1 — this layer is no longer invisible when the chapter begins:
      // OPENING already brought it in at opacity 0.16 / scale 0.72 / y 38, so
      // the previous jumpTo() here would now be an ILLEGAL discontinuous reset
      // on a VISIBLE element (rule 4) and would flicker. Replaced by a
      // continuous first leg that tweens from the pre-entry state to exactly
      // the values the old jumpTo() used to establish. Endpoints, timing and
      // the resulting motion of the second leg are unchanged, so the settled
      // chapter-03 state (opacity 1 / scale 1 / y 0 at tStart + tin) is
      // byte-identical to before.
      tw(layer, m.tStart, m.tin * 0.34, { opacity: 0.34, scale: ms(0.80), y: mv(28) }, "power1.inOut");
      tw(layer, m.tStart + m.tin * 0.34, m.tin * 0.66, { opacity: 1, scale: 1, y: 0 }, "power2.out");
    } else if (ch.key === "reassembly") {
      // T8 — parts begin to converge: BAU recedes, the structural study
      // returns from a WIDER framing (components moving inward, not outward).
      tw(prevLayer, m.tStart, m.tin * 0.65, {
        opacity: 0, scale: ms(0.84), y: mv(26), rotateY: mv(-3)
      }, "power2.in");
      jumpTo(layer, { opacity: 0, scale: ms(1.26), y: mv(-24), rotateY: mv(-3), rotateX: 0 });
      tw(layer, m.tStart + m.tin * 0.35, m.tin * 0.65, {
        opacity: 1, scale: 1, y: 0, rotateY: 0
      }, "power2.out");
    } else if (ch.key === "complete") {
      // T9 — the resolve. The component study collapses inward and softens
      // while the whole bridge arrives from depth and settles.
      // PHASE 2.3B — scale-continuity fix: this chapter is now preceded (when
      // overview_transition_assembly/disassembly resolve, see museum25d.js) by
      // a large, dominant 9:16 assembly video occupying most of the stage.
      // Settling all the way down to the chapter-01 rest scale (1) on its own
      // final frame produced a visible size cut. COMPLETE_SETTLE_SCALE lands
      // the bridge modestly larger than chapter 1 instead — closer to
      // continuous with the video's presence — while staying inside the
      // measured safe margin: bridge_alpha's bounding box already sits only
      // ~1.11%/3.13% (left/right) of transparent PNG margin inside its own
      // canvas (Phase 1B alpha-bbox decode) before the VISIBLE bridge
      // geometry itself begins — worked out algebraically (center-preserving
      // scale around the existing translateX(1.01%)-corrected optical
      // centre) at BOTH 375px mobile and 1440px desktop, the real ceiling
      // before the visible arches/towers start clipping is ~1.044-1.047x,
      // consistent across breakpoints because it is a percentage-of-own-size
      // constraint, not an absolute-pixel one. 1.035 stays safely under that
      // with a real margin, verified with no visible clipping at
      // 375/430/1440/1920. This is a small, geometrically-honest increase —
      // bridge_alpha was already scaled to near its own ceiling in Phase 2.1,
      // so there is little room left; the rest of the "video → static"
      // continuity fix relies on the settle tween's timing/easing, not a
      // dramatic size jump this asset cannot make without clipping.
      // Chapter 1 (overview) is deliberately NOT touched — it has no
      // preceding video and its scale-1 rest state remains the baseline.
      const COMPLETE_SETTLE_SCALE = 1.035;
      const outTo = { opacity: 0, scale: ms(0.92), y: mv(-8) };
      if (canBlur && prevLayer) {
        // Seed the filter state with the value the CSS already renders, so the
        // tween's "from" is visually identical to the current appearance and
        // the CSS drop-shadow is preserved through the blur.
        jumpTo(prevLayer, { filter: `${FLAT_SHADOW} blur(0px)` });
        outTo.filter = `${FLAT_SHADOW} blur(6px)`;
      }
      tw(prevLayer, m.tStart, m.tin * 0.66, outTo, "power1.inOut");
      jumpTo(layer, { opacity: 0, scale: ms(1.34), y: mv(18), rotateX: mv(4), rotateY: 0 });
      tw(layer, m.tStart + m.tin * 0.30, m.tin * 0.70, {
        opacity: 1, scale: ms(COMPLETE_SETTLE_SCALE), y: 0, rotateX: 0
      }, "power2.out");
    } else {
      depthTransition(prevLayer, layer, m.tStart, m.tin);
    }

    // ---------- TYPOGRAPHY: beat A ----------
    // Rule: the architectural object establishes FIRST, then the text arrives.
    // The WINDOW granted to beat A ends `readMin` before the next thing that
    // happens in this chapter (beat B's exit of A, the specimen cycle, or the
    // chapter's own end) — that subtraction IS the guaranteed reading moment.
    const textInAt = i === 0
      ? BEAT_SCHEDULE.aStartFirst
      : m.tStart + m.tin * BEAT_SCHEDULE.aStartOfTin;

    const bStart = beatB ? m.hs + ch.hold * BEAT_SCHEDULE.bStartOfHold : null;
    const specStart = ch.text.specimens ? m.hs + ch.hold * BEAT_SCHEDULE.specStartOfHold : null;
    const aLimit = bStart !== null ? bStart : (specStart !== null ? specStart : m.he);
    const winA = Math.max(BEAT_SCHEDULE.winMin, aLimit - textInAt - BEAT_SCHEDULE.readMin);
    revealBeat(beatA, textInAt, winA);

    // ---------- TYPOGRAPHY: material specimen sub-beats ----------
    if (ch.text.specimens) {
      const chips = Array.from(beatA.querySelectorAll(".museum__cap-chip"));
      const specs = Array.from(beatA.querySelectorAll(".museum__cap-spec"));
      const beatLen = (m.he - specStart) / specs.length;
      // Specimen reveals use the ZT line preset, capped by the sub-beat length
      // so each specimen still gets a static stretch of its own.
      const inDur = Math.min(typo.lineDur(), beatLen * BEAT_SCHEDULE.specInOfBeat);
      const outAt = beatLen * BEAT_SCHEDULE.specOutAtOfBeat;
      const outDur = Math.min(typo.lineDur() * 0.6, beatLen * BEAT_SCHEDULE.specOutOfBeat);
      specs.forEach((spec, k) => {
        const s = specStart + beatLen * k;
        typo.revealLine(spec, s, inDur);
        tw(chips[k], s, inDur, { color: CHIP_ACTIVE_COLOR }, "power2.out");
        // PHASE 2.4A — side-effect only, see onSfxBeat doc comment above.
        if (onSfxBeat) tl.call(() => onSfxBeat("material_specimen", k), null, s);
        // The last specimen stays until the chapter's own exit handles it.
        if (k < specs.length - 1) {
          typo.hideLine(spec, s + outAt, outDur);
          tw(chips[k], s + outAt, outDur, { color: CHIP_IDLE_COLOR }, "power2.in");
        }
      });
    }

    // ---------- TYPOGRAPHY: beat B (second reading phase) ----------
    if (beatB) {
      hideBeat(beatA, bStart, Math.min(typo.exitDur(), ch.hold * BEAT_SCHEDULE.hideAOfHold));
      const startB = bStart + BEAT_SCHEDULE.bRevealOffset;
      const winB = Math.max(BEAT_SCHEDULE.winMin, m.he - startB - BEAT_SCHEDULE.readMin);
      revealBeat(beatB, startB, winB);
    }

    // ---------- OBJECT: dim for the long reading beat ----------
    if (ch.dim) {
      const dimAt = m.hs + ch.hold * (ch.text.specimens
        ? BEAT_SCHEDULE.dimAtOfHoldSpecimens
        : BEAT_SCHEDULE.dimAtOfHold);
      tw(layer, dimAt, ch.hold * BEAT_SCHEDULE.dimDurOfHold,
        { opacity: ch.dim, scale: ms(0.965), y: mv(6) }, "power1.inOut");
    }

    // ---------- TYPOGRAPHY: chapter exit ----------
    // Text leaves during the FIRST part of the outgoing transition, so it is
    // gone before the next object becomes dominant (which happens at 40–100%).
    if (i < script.length - 1) {
      hideBeat(beatB || beatA, m.he,
        Math.max(nextTin * BEAT_SCHEDULE.exitOfNextTin, BEAT_SCHEDULE.exitMin));
    }
  });

  // -------------------------------------------------------------------------
  // DURATION LOCK. A GSAP timeline's duration is "the end of its last child",
  // which after the Phase 2.2 dwell changes lands at ~35.54 units, not the
  // 35.9 the timing map describes.
  // ScrollTrigger maps scroll progress 0..1 onto timeline time 0..duration, so
  // without this the whole chapter/progress map (dots, dot-jumps, the
  // parallax-visibility thresholds) would be silently compressed by ~1% and
  // chapter 10's closing dwell would be swallowed. A single inert zero-duration
  // child at t = total pins the duration to exactly the authored length.
  // -------------------------------------------------------------------------
  tl.set({ _end: 0 }, { _end: 1 }, total);

  // -------------------------------------------------------------------------
  // PROGRESS -> CHAPTER (pure function; identical forward and backward)
  // A chapter is "current" from the midpoint of its incoming transition to the
  // midpoint of its outgoing transition.
  // -------------------------------------------------------------------------
  const bounds = marks.map((m, i) => ({
    from: (m.tStart + m.tin * 0.5) / total,
    to: i === marks.length - 1 ? 1 : (m.he + marks[i + 1].tin * 0.5) / total
  }));

  function chapterAt(progress) {
    for (let i = bounds.length - 1; i >= 0; i--) {
      if (progress >= bounds[i].from) return i;
    }
    return 0;
  }

  // The rigid bridge layer is only on screen at the two ends of the journey;
  // pointer/touch parallax must be inert everywhere else. Looked up by chapter
  // key (not by hardcoded index) so re-ordering the script cannot desync this.
  const idxOf = (key) => script.findIndex((c) => c.key === key);
  const outIdx = idxOf("exploded");   // the transition where the bridge fades out
  const inIdx = idxOf("complete");    // the transition where the bridge returns
  const primaryOutAt = outIdx > 0 ? (marks[outIdx].tStart + marks[outIdx].tin * 0.45) / total : 1;
  const primaryInAt = inIdx > 0 ? (marks[inIdx].tStart + marks[inIdx].tin * 0.62) / total : 1;

  let currentIndex = -1;
  let primaryVisible = true;

  function updateDots(activeIndex) {
    if (!dotsWrap) return;
    Array.from(dotsWrap.children).forEach((dot, i) => {
      dot.classList.toggle("is-active", i === activeIndex);
      dot.setAttribute("aria-current", i === activeIndex ? "true" : "false");
    });
  }

  function syncChapter(progress, direction) {
    const idx = chapterAt(progress);
    if (idx !== currentIndex) {
      currentIndex = idx;
      updateDots(idx);
      // PHASE 2.2 — the asset layer uses this to gate optional cinematic loops
      // (play only the ACTIVE chapter's loop, pause everything else). It fires
      // from the one existing chapter-change point, so there is no second
      // progress->chapter authority.
      // PHASE 2.3 — `direction` (GSAP ScrollTrigger's self.direction, 1 forward /
      // -1 backward) is threaded through as a THIRD, purely-informational
      // argument. It is read by nothing in this file — museum25d.js is the only
      // consumer, for its direction-aware transition-clip selection. No
      // scroll-direction-dependent branching is added to this file's own
      // tween/timeline construction (rule 5 in the header stays true).
      if (onChapterChange) onChapterChange(idx, script[idx] ? script[idx].key : null, direction);
    }
    const vis = progress < primaryOutAt || progress > primaryInAt;
    if (vis !== primaryVisible) {
      primaryVisible = vis;
      if (onPrimaryVisible) onPrimaryVisible(vis);
    }
  }

  // -------------------------------------------------------------------------
  // Chapter dots — SECONDARY navigation only. Never a mode-switcher grid.
  // -------------------------------------------------------------------------
  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = "";
    script.forEach((ch, i) => {
      const dot = el("button", "museum__chapter-dot" + (i === 0 ? " is-active" : ""), {
        type: "button", "data-chapter-index": String(i)
      });
      dot.setAttribute("aria-label", `${i + 1} / ${script.length} — ${t(getLang(), ch.labelKey)}`);
      dotsWrap.appendChild(dot);
    });
  }
  buildDots();

  // -------------------------------------------------------------------------
  // MASTER SCROLLTRIGGER — the single driver of everything above.
  // Created LAST so nothing it calls synchronously (onUpdate -> syncChapter ->
  // chapterAt -> bounds) can hit a temporal-dead-zone binding.
  // -------------------------------------------------------------------------
  const endPercent = Math.round(total * UNIT_VH);
  let stInstance = null;

  if (window.ScrollTrigger && sticky) {
    stInstance = ScrollTrigger.create({
      // trigger is the sticky stage itself (NOT the outer section): the section
      // also contains .museum__inner in normal flow above it, and pinning on
      // the section's own top left the pinned stage permanently offset by that
      // header's height on mobile. Unchanged behaviour from Phase 1.
      trigger: sticky,
      start: "top top",
      end: `+=${endPercent}%`,
      scrub: 0.85,
      pin: sticky,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      animation: tl,
      onUpdate: (self) => {
        syncChapter(self.progress, self.direction);
        if (onProgress) onProgress(self.progress, self.direction);
      }
    });
  }

  // -------------------------------------------------------------------------
  // CHAPTER-DOT NAVIGATION (PHASE 2.1 — navigation robustness)
  //
  // THE BUG THAT WAS FIXED
  // The previous handler fired `lenis.scrollTo(target, { duration: 1.1 })` on
  // every click with no state of its own. Three independent defects followed
  // from that, and all three are addressed below:
  //
  //   1. NO SINGLE-FLIGHT GUARD. A second click during the ~1.1s animation
  //      issued a second scrollTo. Lenis's internal Animation is replaced
  //      rather than queued, so this is not literally a stack — but the
  //      replacement re-reads `animatedScroll` as its new "from", and Lenis
  //      only re-syncs `animatedScroll`/`targetScroll` to the true
  //      `window.scrollY` inside reset(). If anything moved the real scroll
  //      position underneath Lenis between the two calls, the second animation
  //      interpolated from a stale origin and settled at the wrong place.
  //   2. SOMETHING REALLY DOES MOVE THE SCROLL POSITION UNDERNEATH LENIS.
  //      `ScrollTrigger.refresh()` re-applies the saved scroll position after
  //      remeasuring, and this module calls it from TWO places that can easily
  //      fire while a dot animation is in flight: museum25d.js's deferred
  //      asset gate (`Promise.all(decodes).then(... refresh())` — ~14 MB of
  //      PNG, so it lands late and unpredictably) and `refreshLabels()` on
  //      every DE/EN/ES switch. That is the concrete mechanism behind the
  //      reported "Lenis's tracked scroll desynced from the true
  //      window.scrollY after repeated rapid programmatic scrollTo calls".
  //   3. NO CLAMP. `target` was computed from `stInstance.start/end` and
  //      trusted unconditionally. `invalidateOnRefresh: true` means those
  //      bounds are re-derived on every refresh; if a refresh landed between
  //      the read and the settle, nothing constrained the landing to the
  //      pinned range at all — which is exactly the observed symptom of ending
  //      up past `end`, in the following (FPV video) section.
  //
  // WHY A LOCK + AN EXPLICIT CANCEL, RATHER THAN JUST ONE OF THEM
  // Lenis 1.1.14 (see index.html) exposes no `cancelScrollTo`. Its only
  // reliable cancel primitive is `stop()` -> `reset()`, which both halts the
  // running internal animation AND re-syncs animatedScroll/targetScroll to the
  // real `actualScroll`; `start()` immediately restores user scrolling. That
  // pair is therefore used to CANCEL, and it repairs defect 2's desync as a
  // side effect. (`scrollTo(current, { immediate: true })` is NOT usable as a
  // cancel: Lenis early-returns when the resolved target equals `targetScroll`,
  // which during a programmatic scroll it always does.) The lock on top of it
  // guarantees at most one navigation exists at any instant, and doubles as
  // the touch double-tap guard's backstop.
  //
  // WHAT THIS DELIBERATELY DOES NOT DO
  // It never kills, recreates or refreshes `tl` / `stInstance`, and it never
  // sets `tl.progress()` while a ScrollTrigger exists. It is purely a scroll
  // POSITION change; the master timeline keeps its identity and its scrubbed
  // progress the whole time. Destinations still come from the one existing
  // progress-map authority (`marks` / `hs` / `hold` / `total`) — no second
  // table of pixel offsets exists anywhere in this module.
  // -------------------------------------------------------------------------
  if (dotsWrap) {
    const NAV_DURATION = 1.1;   // seconds — unchanged from Phase 2
    const NAV_TAP_GUARD = 320;  // ms — synthesized/duplicate tap suppression

    let navSeq = 0;        // bumped on every start AND every cancel
    let navActive = false;
    let navSafety = 0;
    let lastNavAt = -Infinity;

    function endNav(seq) {
      if (seq !== navSeq) return; // a newer navigation owns the state now
      navActive = false;
      if (navSafety) { clearTimeout(navSafety); navSafety = 0; }
    }

    function cancelNav() {
      navSeq++;                   // invalidates the superseded onComplete
      navActive = false;
      if (navSafety) { clearTimeout(navSafety); navSafety = 0; }
      if (lenis && typeof lenis.stop === "function" && typeof lenis.start === "function") {
        lenis.stop();   // halts the in-flight animation + re-syncs to window.scrollY
        lenis.start();  // re-enables user scrolling immediately
      }
    }

    dotsWrap.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-chapter-index]");
      if (!btn) return;

      const index = Number(btn.getAttribute("data-chapter-index"));
      if (!Number.isFinite(index) || index < 0 || index >= marks.length) return;

      // Clicking the chapter you are already in is a no-op — but only when the
      // page is genuinely inside the pinned range. Before the pin engages
      // currentIndex is still 0 while the dots are already on screen, and a
      // bare `index === currentIndex` test would make dot 01 a dead tap for a
      // visitor trying to enter the exhibit from above.
      if (index === currentIndex && stInstance) {
        const y = window.scrollY || window.pageYOffset || 0;
        if (y >= stInstance.start && y <= stInstance.end) return;
      } else if (index === currentIndex && !stInstance) {
        return;
      }

      // Touch double-tap / synthesized-click suppression. Guards the EVENT
      // itself, independently of the animation lock below, so a 300ms ghost
      // click after touchend can never issue a second navigation command.
      const now = (window.performance && performance.now) ? performance.now() : Date.now();
      if (now - lastNavAt < NAV_TAP_GUARD) return;
      lastNavAt = now;

      // SAME progress-map authority the master timeline is built from.
      // Land just inside the chapter's hold: object settled, text revealed.
      const m = marks[index];
      const p = Math.min(0.999, (m.hs + m.hold * 0.30) / total);

      if (!stInstance) {
        // No live ScrollTrigger to read a direction from — infer it from the
        // requested index relative to the current one (purely informational,
        // same as the ScrollTrigger-driven path above).
        tl.progress(p);
        syncChapter(p, index >= currentIndex ? 1 : -1);
        return;
      }

      // Replace, never stack.
      if (navActive) cancelNav();

      // LIVE bounds, read at click time. `invalidateOnRefresh: true` moves
      // these on every ScrollTrigger.refresh(), so a cached copy would drift.
      const start = stInstance.start;
      const end = stInstance.end;
      if (!(typeof start === "number" && typeof end === "number" && end > start)) return;

      // Hard clamp: a navigation click can never land outside the pinned
      // section, whatever happens to the bounds while the scroll is running.
      const target = Math.min(end, Math.max(start, start + p * (end - start)));

      const seq = ++navSeq;
      navActive = true;
      // Backstop: Lenis stops calling our onComplete if the user scrolls and
      // its Animation gets replaced, so the lock is also released on a timer.
      navSafety = window.setTimeout(() => endNav(seq), NAV_DURATION * 1000 + 400);

      if (lenis && typeof lenis.scrollTo === "function") {
        lenis.scrollTo(target, {
          duration: NAV_DURATION,
          force: true, // survives a transient isStopped/isLocked state
          onComplete: () => endNav(seq)
        });
      } else {
        window.scrollTo({ top: target, behavior: "smooth" });
      }
    });
  }

  syncChapter(0, 1); // initial calm state — forward, matching chapter 01's "no entrance motion" rest state
  if (onProgress) onProgress(0, 1); // same initial-state parity for the scrub hook

  // -------------------------------------------------------------------------
  // PUBLIC API
  // -------------------------------------------------------------------------
  return {
    // DE/EN/ES switch: re-fill every caption from the content map, rebuild the
    // dot aria-labels, then recalculate. Caption blocks are absolutely
    // positioned and bottom-anchored, so text length never feeds back into the
    // pinned scroll length — but ScrollTrigger.refresh() is still called so any
    // layout consequence is measured, and it preserves the current scroll
    // position (and therefore the current chapter / progress).
    refreshLabels() {
      fillCaptions(refs, typo, content, t, getLang());
      buildDots();
      updateDots(currentIndex < 0 ? 0 : currentIndex);

      // PHASE 2.2 — TIMELINE RE-RENDER AFTER A LANGUAGE SWITCH.
      // Why this is necessary and why it is safe:
      // A split title's characters are a POOL sized to the LONGEST of DE/EN/ES.
      // A shorter language leaves the tail of the pool unused (hidden). If the
      // visitor then switches to a longer language while standing PAST a
      // chapter whose title just grew, those newly-used spans would still carry
      // the inline style their tween last wrote — and a scrubbed timeline does
      // NOT re-render tweens that lie outside the current playhead, so they
      // could stay at their "from" state (invisible characters).
      // Sweeping the playhead to 0 and back forces GSAP to render every child
      // it passes in both directions, which restores each span to exactly the
      // state its own tween prescribes for the CURRENT progress. The round trip
      // ends on the value it started from, so the visible frame is unchanged
      // and ScrollTrigger's own scrub re-asserts the same value on its next
      // update. It never kills, recreates or refreshes `tl`/`stInstance` and it
      // never changes the scroll position — Phase 2.1's navigation lock/clamp
      // is untouched by it.
      const p = tl.progress();
      tl.progress(0);
      tl.progress(p);

      if (window.ScrollTrigger) ScrollTrigger.refresh();
    },
    refresh() {
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    },
    chapterCount: script.length,
    totalUnits: total,
    endPercent,
    scrollTrigger: () => stInstance
  };
}
