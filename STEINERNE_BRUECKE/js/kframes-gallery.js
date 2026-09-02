/* ZEITSPRUNG V2 — kframes-gallery.js
   ============================================================================
   PHASE 2.5 — K01–K12 HISTORICAL VISUAL GALLERY (#kframesGallery).

   A NEW, SEPARATE scroll-driven module. It does NOT read, import or modify:
     - js/main.js's #stage 9-state journey (STATES / updateStageCaption)
     - js/museum25d.js / js/museum2d-scroll.js (#museum25d, 10-chapter museum)
   and it is not read by either of those files. Three independent pinned
   scroll sections coexist on the same page.

   WHAT THIS FILE OWNS
   --------------------
     - fetching 03_ASSETS/Steinerne_Bruecke/2d/KFRAMES_STORY_MAP.json (the
       ONLY source of per-frame date/title/description/evidence/hotspot data)
     - resolving each frame's image URL (asset_base + frame.asset)
     - a two-layer crossfade viewport (mirrors js/main.js's STATES layerA/
       layerB pattern) so AT MOST 3 images are ever kept as live Image
       references at a time (previous + current + next) — never all 12
     - ONE permanent caption block per K-frame (eyebrow/date, evidence chip,
       title, description OR needs-validation note, optional real hotspot CTA,
       optional restrained source line — Phase 2.7C.3, Section 3: "QUELLE /
       SOURCE / FUENTE — institution · title", resolved from each frame's new
       `source_ids` against 02_CONTENT/Steinerne_Bruecke/SOURCES/sources.json;
       omitted entirely for frames with no registered source, e.g. K08/K09)
     - the ZT typography reveal (ZT_REVEAL_CHAR for titles via
       zt-typography.js's title mode, ZT_REVEAL_LINE for description text),
       via a small local tracked-tween adapter matching the engine.set/tw/
       tween contract zt-typography.js expects (same determinism rules as
       museum2d-scroll.js: explicit initial state, fromTo + immediateRender:
       false, no scroll-direction-dependent state machine)
     - a restrained secondary nav ("K03 / 12" counter + dots), mirroring
       .museum__chapter-dots — scroll remains the primary interaction

   WHAT THIS FILE DOES NOT DO
   ---------------------------
     - no SFX/audio calls of any kind (explicit brief instruction — global
       mute/SFX system from Phase 2.4A is untouched)
     - no modification of the 12 source PNGs
     - no invented dates/history — every date/title/description string is
       read from KFRAMES_STORY_MAP.json, which itself only re-cites the
       already-approved js/i18n.js `states[]` array
     - no clickable hotspot for any frame whose hotspot_target resolves to
       "PENDING_DESTINATION" (K09 only, today) — inert data only, same
       convention as ASSET_SWAP_MAP.json's hotspots_registry.bruckmandl
   ============================================================================ */

import { createZtTypography, ztVisualLength } from "./zt-typography.js";

const MANIFEST_URL = "../03_ASSETS/Steinerne_Bruecke/2d/KFRAMES_STORY_MAP.json";
// Phase 2.7C.3, Section 3 — monument-scoped source registry (mirrors
// 02_CONTENT/SOURCES/SOURCE_REGISTRY.json's Steinerne_Bruecke sources under
// the SAME SB_SRC_00x IDs; see 02_CONTENT/Steinerne_Bruecke/SOURCES/
// SOURCES_MASTER.md for why no parallel ID scheme was introduced). Used only
// to resolve each frame's `source_ids` into a short "institution · title"
// string for the restrained source line below.
const SOURCES_URL = "../02_CONTENT/Steinerne_Bruecke/SOURCES/sources.json";
const LANGS = ["de", "en", "es"];

// Real, currently-working anchors this gallery is allowed to link a hotspot
// to. Anything else in a frame's hotspot_target (notably the literal string
// "PENDING_DESTINATION") is NEVER rendered as a clickable control.
const REAL_HOTSPOT_TARGETS = {
  "#museum25d": "kframesHotspotMuseum",
  "#stage": "kframesHotspotStage"
};

function el(tag, className, attrs) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (attrs) Object.keys(attrs).forEach((k) => node.setAttribute(k, attrs[k]));
  return node;
}

function pick(obj, lang) {
  if (!obj) return "";
  return obj[lang] || obj.de || "";
}

async function loadManifest() {
  try {
    const res = await fetch(MANIFEST_URL, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

// Phase 2.7C.3 — best-effort source lookup. A failed/missing fetch degrades
// gracefully: every frame's source line is simply omitted (never a broken
// citation, never invented bibliographic text).
async function loadSources() {
  try {
    const res = await fetch(SOURCES_URL, { cache: "no-store" });
    if (!res.ok) return new Map();
    const data = await res.json();
    const list = (data && Array.isArray(data.sources)) ? data.sources : [];
    const map = new Map();
    // FINAL QUELLEN REGISTRY — sources.json now keys each entry by `id`
    // (Q001, Q002, ...), not the earlier ad-hoc `source_id` field.
    list.forEach((s) => { if (s && s.id) map.set(s.id, s); });
    return map;
  } catch (err) {
    return new Map();
  }
}

// Resolves a frame's `source_ids` to a single restrained "institution · short
// title" string, citing only the FIRST (primary) source_id — deliberately
// not concatenating every source_id into a bibliography line. Most frames
// carry two source_ids (Q001 + Q002), where Q002 is an internal restatement
// of Q001 (see SOURCES_MASTER.md); showing both here would just repeat the
// same institution twice. Returns "" if the frame has no registered source
// (K08/K09 today) — never a placeholder string.
function resolveFrameSourceText(frame, sourcesMap) {
  const ids = Array.isArray(frame.source_ids) ? frame.source_ids : [];
  if (!ids.length) return "";
  const primary = sourcesMap.get(ids[0]);
  if (!primary) return "";
  const institution = primary.institution || "";
  const title = primary.short_title || primary.title || "";
  if (institution && title) return `${institution} · ${title}`;
  return institution || title || "";
}

// ---------------------------------------------------------------------------
// DETERMINISM MACHINERY — same shape as museum2d-scroll.js's `st()`/`tw()`:
// a shared state map (per animated property, per node) so every tween's
// "from" is the last authored value for that node+property, guaranteeing
// endpoint continuity without a scroll-direction-dependent branch anywhere.
// Unlike the museum's ONE authored master timeline (continuously scrubbed),
// this gallery's caption reveal fires as a short, self-playing tween exactly
// once per discrete frame-index crossing (forward OR backward) — the same
// lighter "reveal-on-threshold-cross" pattern already used elsewhere on this
// page for .fact-card and .video-chapter__frame (see js/main.js). This is a
// deliberate scope choice: it keeps the reveal genuinely scroll-triggered
// (never a timer/autoplay) without re-authoring a full scrubbed timeline for
// a text-only crossfade.
// ---------------------------------------------------------------------------
const propState = new Map();
function stFor(node) {
  if (!propState.has(node)) propState.set(node, {});
  return propState.get(node);
}

function engineSet(node, vars) {
  if (!node) return;
  Object.assign(stFor(node), vars);
  gsap.set(node, vars);
}

// Tracked fromTo — reads "from" out of the shared state map, writes "to"
// back into it. `tl` is whichever short-lived timeline is currently being
// authored by revealFrameCaption()/hideFrameCaption() below.
function makeEngineTw(tl) {
  return function engineTw(node, at, dur, to, ease) {
    if (!node || !(dur > 0)) return;
    const cur = stFor(node);
    const from = {};
    Object.keys(to).forEach((k) => { from[k] = (k in cur) ? cur[k] : to[k]; });
    tl.fromTo(node, from, Object.assign({}, to, {
      duration: dur,
      ease: ease || "power2.inOut",
      immediateRender: false
    }), at);
    Object.assign(cur, to);
  };
}

// Untracked fromTo (own explicit "from" values) — used by zt-typography for
// properties it manages independently of the shared node-level state (e.g.
// eyebrow letterSpacing). Never reads/writes propState.
function makeEngineTween(tl) {
  return function engineTween(node, from, to, at, dur, ease) {
    if (!node || !(dur > 0)) return;
    tl.fromTo(node, from, Object.assign({}, to, {
      duration: dur,
      ease: ease || "power2.inOut",
      immediateRender: false
    }), at);
  };
}

// ---------------------------------------------------------------------------
// PUBLIC ENTRY POINT
// ---------------------------------------------------------------------------
export async function initKframesGallery({ section, t, getLang, lenis, reducedMotion }) {
  if (!section) return null;
  // Phase 2.7C.3 — fetched in parallel; a slow/failed sources fetch must
  // never delay or block the gallery itself (the "no orphans" empty-manifest
  // rule below only applies to the frames manifest, not the sources lookup).
  const [manifest, sourcesMap] = await Promise.all([loadManifest(), loadSources()]);
  const frames = (manifest && Array.isArray(manifest.frames)) ? manifest.frames.slice().sort((a, b) => a.order - b.order) : [];
  if (!frames.length) {
    // "No orphans" rule — never render an empty pinned section. Hide it
    // entirely if the manifest failed to resolve, rather than showing a
    // broken/blank scroll trap.
    section.hidden = true;
    return null;
  }

  const assetBase = (manifest.asset_base || "../03_ASSETS/Steinerne_Bruecke/2d/KFRAMES").replace(/\/$/, "");
  const resolveUrl = (frame) => encodeURI(`${assetBase}/${frame.asset}`);

  const sticky = document.getElementById("kfSticky");
  const imgA = document.getElementById("kfImgA");
  const imgB = document.getElementById("kfImgB");
  const captionHost = document.getElementById("kfCaption");
  const dotsWrap = document.getElementById("kfDots");
  const counterEl = document.getElementById("kfCounter");

  // -- per-frame crop-safe framing --------------------------------------
  // All 12 K-frames share the same ~9:16 canvas, but the bridge/subject does
  // not always sit centered within that canvas. object-fit:cover + a
  // per-frame object-position keeps the bridge itself always in view instead
  // of a generic center crop. Verified by looking at each image directly
  // (see the task brief's per-frame visual descriptions).
  const FRAME_POSITION = {
    k01: "center 55%",   // aerial, cofferdams centered, riverbank stone staging lower-frame
    k02: "center 55%",
    k03: "center 50%",   // aerial arches + town skyline balanced top/bottom
    k04: "center 48%",   // background cranes near top — keep slightly higher
    k05: "center 55%",   // nearest arch scaffolding lower-frame
    k06: "center 55%",
    k07: "center 55%",   // complete bridge + pedestrians, town in background
    k08: "center 50%",   // identical image to k03
    k09: "center 55%",   // nearest arch bracing, lower-frame focal point
    k10: "center 45%",   // tall Gothic spires — keep more headroom at top
    k11: "center 55%",   // restoration workers on the deck, lower-frame
    k12: "center 50%"
  };

  frames.forEach((f) => { f.__url = resolveUrl(f); f.__position = FRAME_POSITION[f.id] || "center 52%"; });

  // -- lazy image cache: current + previous + next ONLY -------------------
  // No <img> ever gets a src the visitor is not within one frame of. Moving
  // more than one frame away drops the reference so it can be garbage
  // collected (the browser HTTP cache still serves a fast re-fetch if the
  // visitor scrolls back later — this governs live JS/decoded-bitmap memory,
  // not network caching).
  const imgCache = new Map(); // order -> HTMLImageElement
  function ensurePreloaded(order) {
    const frame = frames[order];
    if (!frame || imgCache.has(order)) return;
    const im = new Image();
    im.decoding = "async";
    im.src = frame.__url;
    imgCache.set(order, im);
  }
  function pruneCache(centerOrder) {
    Array.from(imgCache.keys()).forEach((k) => {
      if (Math.abs(k - centerOrder) > 1) imgCache.delete(k);
    });
  }
  function preloadWindow(idx) {
    ensurePreloaded(idx);
    if (idx > 0) ensurePreloaded(idx - 1);
    if (idx < frames.length - 1) ensurePreloaded(idx + 1);
    pruneCache(idx);
  }

  // -------------------------------------------------------------------
  // Caption DOM — one permanent block per K-frame (rule: text content is
  // never swapped mid-scroll, only crossfaded — same principle as
  // #museum25d's caption system).
  // -------------------------------------------------------------------
  // ONE typo instance for the whole gallery's lifetime — its internal
  // WeakMaps (title/lead mount records) are keyed by the actual DOM nodes
  // mounted below, so the SAME instance must both mount and later reveal
  // them. `engine.tw`/`engine.tween` are indirected through mutable
  // `activeTw`/`activeTween` references so each discrete reveal event (see
  // revealFrameCaption) can point them at a fresh, short-lived timeline
  // without needing a second typo instance (which would have empty WeakMaps
  // and silently fail to find any mounted title/lead).
  let activeTw = null;
  let activeTween = null;
  const typo = createZtTypography({
    engine: {
      set: engineSet,
      tw: (node, at, dur, to, ease) => { if (activeTw) activeTw(node, at, dur, to, ease); },
      tween: (node, from, to, at, dur, ease) => { if (activeTween) activeTween(node, from, to, at, dur, ease); }
    },
    reducedMotion: !!reducedMotion,
    desktop: window.matchMedia("(min-width: 900px)").matches
  });

  captionHost.innerHTML = "";
  const capRefs = frames.map((frame, i) => {
    const cap = el("article", "kf__cap", { "data-cap": frame.id });

    // Frame index ("K01 / 12") lives ONLY in the secondary side nav counter
    // (#kfCounter, see updateDots below) — kept out of the caption eyebrow to
    // avoid duplicating the same information twice on screen at once.
    const eyebrow = el("div", "kf__cap-eyebrow", { "data-reveal": "eyebrow" });
    const date = el("span", "kf__cap-date");
    const evidence = el("span", "kf__cap-evidence", { "data-status": frame.evidence_status });
    eyebrow.appendChild(date);
    eyebrow.appendChild(evidence);
    cap.appendChild(eyebrow);

    const maxTitleLen = Math.max(...LANGS.map((l) => ztVisualLength(pick(frame.title, l))));
    const h4 = el("h4", "kf__cap-title", { "data-reveal": "title" });
    typo.mountTitle(h4, maxTitleLen, "kf__cap-line");
    cap.appendChild(h4);

    let leadP = null;
    const hasDescription = LANGS.some((l) => pick(frame.description, l));
    if (hasDescription) {
      leadP = el("p", "kf__cap-lead", { "data-reveal": "lead" });
      typo.mountLead(leadP, false); // brief: drop caps sparingly/not needed for this short content
      cap.appendChild(leadP);
    } else if (frame.evidence_status === "NEEDS_VALIDATION") {
      // K09 path — no description text is authored (see manifest note),
      // just a restrained, visible NEEDS_VALIDATION note reusing the
      // already-approved i18n copy.
      const note = el("p", "kf__cap-needs-validation", { "data-reveal": "line" });
      note.setAttribute("data-i18n-fill", "kframesNeedsValidationNote");
      cap.appendChild(note);
    }

    let hotspotBtn = null;
    const target = frame.hotspot_target;
    if (target && target !== "PENDING_DESTINATION" && REAL_HOTSPOT_TARGETS[target]) {
      hotspotBtn = el("button", "kf__cap-hotspot", { type: "button", "data-reveal": "line", "data-i18n-fill": REAL_HOTSPOT_TARGETS[target] });
      hotspotBtn.addEventListener("click", () => {
        const el2 = document.querySelector(target);
        if (el2 && lenis) lenis.scrollTo(el2, { offset: 0, duration: 1.2 });
        else if (el2) el2.scrollIntoView({ behavior: "smooth" });
      });
      cap.appendChild(hotspotBtn);
    }
    // frame.hotspot_target === "PENDING_DESTINATION" (K09 only, today) ->
    // deliberately NO button rendered at all. Inert data only.

    // Phase 2.7C.3, Section 3+6 — restrained source line, ALWAYS the last
    // child of `.kf__cap` (so revealBeat's DOM-order-driven sequencing makes
    // it the final reveal beat, per Section 6: IMAGE -> K-NUMBER/DATE ->
    // TITLE -> DESCRIPTION -> SOURCE). Only created for frames that actually
    // resolve to a source (K08/K09 today have none) — never an empty or
    // placeholder citation line.
    let sourceP = null;
    const sourceText = resolveFrameSourceText(frame, sourcesMap);
    if (sourceText) {
      sourceP = el("p", "kf__cap-source", { "data-reveal": "line" });
      const label = el("span", "kf__cap-source-label");
      sourceP.appendChild(label);
      sourceP.appendChild(document.createTextNode(sourceText));
      cap.appendChild(sourceP);
    }

    captionHost.appendChild(cap);
    return { cap, eyebrow, date, evidence, h4, leadP, hotspotBtn, sourceP, sourceLabel: sourceP ? sourceP.firstChild : null, sourceText, frame, index: i };
  });

  function fillCaptionText(lang) {
    capRefs.forEach((ref) => {
      const f = ref.frame;
      ref.date.textContent = f.date || "";
      ref.evidence.textContent = evidenceLabel(f, t, lang);
      typo.setTitleText(ref.h4, pick(f.title, lang));
      if (ref.leadP) typo.setLeadText(ref.leadP, pick(f.description, lang));
      const noteEl = ref.cap.querySelector('[data-i18n-fill="kframesNeedsValidationNote"]');
      if (noteEl) noteEl.textContent = t(lang, "kframesNeedsValidationNote");
      if (ref.hotspotBtn) {
        const key = ref.hotspotBtn.getAttribute("data-i18n-fill");
        ref.hotspotBtn.textContent = t(lang, key);
      }
      if (ref.sourceP) {
        ref.sourceLabel.textContent = t(lang, "kfSourceLabel") + " — ";
      }
    });
  }

  // Phase 2.7C.3, Section 5 — for a NEEDS_VALIDATION frame whose uncertainty
  // is specifically about DATING (frame.uncertainty_type === "DATE"; K08/K09
  // today), use the K-Frame-specific, more editorial `kfDateUnderReview`
  // label instead of the generic, SHARED `museumEvidence${status}` key. The
  // shared key/lookup path itself is untouched and remains the fallback for
  // every other status and for any future non-date K-frame uncertainty.
  function evidenceLabel(frame, tFn, lang) {
    const status = frame.evidence_status;
    if (!status) return "";
    if (status === "NEEDS_VALIDATION" && frame.uncertainty_type === "DATE") {
      return tFn(lang, "kfDateUnderReview") || status;
    }
    const key = `museumEvidence${status}`; // reuses the already-approved evidence-chip i18n keys
    return tFn(lang, key) || status;
  }

  fillCaptionText(getLang());

  // Initial hidden state for every beat's animatable parts (rule 1 —
  // explicit initial state before any tween exists).
  capRefs.forEach((ref) => {
    typo.initBeat(ref.cap);
    gsap.set(ref.cap, { autoAlpha: 0 });
  });

  // -------------------------------------------------------------------
  // Secondary dots + counter (mirrors .museum__chapter-dots)
  // -------------------------------------------------------------------
  dotsWrap.innerHTML = "";
  frames.forEach((f, i) => {
    const dot = el("span", "kf__dot" + (i === 0 ? " is-active" : ""));
    dot.dataset.index = String(i);
    dot.setAttribute("role", "button");
    dot.setAttribute("tabindex", "0");
    dot.setAttribute("aria-label", `K${String(f.order).padStart(2, "0")}`);
    dot.addEventListener("click", () => jumpToFrame(i));
    dotsWrap.appendChild(dot);
  });

  function updateDots(idx) {
    dotsWrap.querySelectorAll(".kf__dot").forEach((d) => {
      d.classList.toggle("is-active", Number(d.dataset.index) === idx);
    });
    counterEl.textContent = `K${String(frames[idx].order).padStart(2, "0")} / ${frames.length}`;
  }

  // -------------------------------------------------------------------
  // Image crossfade (mirrors js/main.js's STATES layerA/layerB pattern)
  // -------------------------------------------------------------------
  let layerAIdx = 0;
  let layerBIdx = Math.min(1, frames.length - 1);
  imgA.src = frames[layerAIdx].__url;
  imgA.style.objectPosition = frames[layerAIdx].__position;
  imgA.style.opacity = "1";
  imgB.src = frames[layerBIdx].__url;
  imgB.style.objectPosition = frames[layerBIdx].__position;
  imgB.style.opacity = "0";
  preloadWindow(0);

  let currentIdx = 0;
  let activeRevealTl = null;
  let activeHideTl = null;

  function revealFrameCaption(idx) {
    const ref = capRefs[idx];
    if (activeRevealTl) activeRevealTl.kill();
    activeRevealTl = gsap.timeline();
    activeTw = makeEngineTw(activeRevealTl);
    activeTween = makeEngineTween(activeRevealTl);
    gsap.set(ref.cap, { autoAlpha: 1 });
    typo.revealBeat(ref.cap, 0);
    activeTw = null;
    activeTween = null;
  }

  function hideFrameCaption(idx) {
    const ref = capRefs[idx];
    if (!ref) return;
    // PHASE 2.5 FIX (post-delivery, live-browser verification caught this):
    // was `if (activeHideTl) activeHideTl.kill()` — a SINGLE shared variable
    // tracking only the most recently started hide-tween. During a fast
    // scroll, goToFrame() fires for several indices in quick succession
    // (0->1->2->3...); each call's hideFrameCaption(prevIdx) killed the
    // PREVIOUS call's still-running tween — which belonged to a DIFFERENT,
    // earlier caption element — abandoning it at whatever partial opacity it
    // had reached at that instant, forever (autoAlpha never reached 0).
    // Confirmed live: after a multi-frame scroll, up to 4-6 different
    // captions were simultaneously visible at various stuck partial
    // opacities, overlapping unreadably. Fix: kill tweens SCOPED TO THIS
    // ELEMENT ONLY (gsap.killTweensOf(ref.cap)), so hiding one caption can
    // never cancel another caption's own in-flight fade.
    gsap.killTweensOf(ref.cap);
    gsap.to(ref.cap, {
      autoAlpha: 0,
      duration: reducedMotion ? 0.2 : 0.35,
      ease: "power1.out",
      onComplete: () => { typo.initBeat(ref.cap); } // reset for a future re-entry
    });
  }

  function goToFrame(idx, immediate) {
    if (idx === currentIdx && !immediate) return;
    const prevIdx = currentIdx;
    currentIdx = idx;
    preloadWindow(idx);
    updateDots(idx);
    if (!immediate) hideFrameCaption(prevIdx);
    revealFrameCaption(idx);
  }

  function jumpToFrame(idx) {
    if (!lenis || !sticky) return;
    const st = ScrollTrigger.getById("kfScrollTrigger");
    if (!st) return;
    const progress = idx / (frames.length - 1);
    const targetScroll = st.start + progress * (st.end - st.start);
    lenis.scrollTo(targetScroll, { duration: 1.0 });
  }

  // Reveal the first caption immediately (no scroll needed to see K01).
  goToFrame(0, true);

  const segmentCount = frames.length - 1;
  let scrollTriggerInstance = null;
  if (window.gsap && window.ScrollTrigger) {
    scrollTriggerInstance = ScrollTrigger.create({
      id: "kfScrollTrigger",
      // PHASE 2.5 FIX (post-delivery, live-browser verification caught this):
      // trigger must be `sticky` (#kfSticky), NOT the outer `section`
      // (#kframesGallery). `.kf__inner`'s intro heading/paragraph sits in
      // normal document flow ABOVE `.kf__sticky` inside the same section —
      // with `trigger: section`, the pin engages the instant the SECTION's
      // own top (i.e. `.kf__inner`'s top) reaches the viewport top, freezing
      // `.kf__inner` permanently overlapping the pinned image for the entire
      // K01-K12 scroll (confirmed live: a ~300-400px solid black band with no
      // image ate the top of every mobile screenshot). This is the exact
      // same class of bug already found and fixed once in museum25d.js
      // (Phase 1B: "trigger: sticky — NOT trigger: section") — same fix here.
      trigger: sticky,
      start: "top top",
      end: `+=${segmentCount * 100}%`,
      scrub: 0.6,
      pin: sticky,
      anticipatePin: 1,
      // PHASE 2.5 FIX (post-delivery, live-browser verification caught
      // this): without invalidateOnRefresh, a DE/EN/ES language switch that
      // changes an EARLIER section's text length (e.g. #stage/#facts, which
      // sit above this gallery in document flow) can shift this section's
      // absolute page position, but this ScrollTrigger's cached start/end
      // never recomputed — confirmed live: after a language switch, this
      // trigger's own `.progress` still reported a plausible K-frame value
      // against its STALE bounds while the real scroll position had drifted
      // into the museum section above. Mirrors museum2d-scroll.js's master
      // ScrollTrigger, which already carries this flag for the same reason.
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const scaled = progress * segmentCount;
        // PHASE 2.5 FIX (post-delivery, live-browser verification caught
        // this): at progress===1 exactly (the very last frame, K12), `scaled`
        // equals `segmentCount` exactly, so `Math.floor(scaled)` was
        // `segmentCount` too — jumping directly to idx=segmentCount/
        // localT=0 instead of the natural end-of-last-segment state
        // (idx=segmentCount-1/localT=1). That skipped the crossfade's normal
        // "toLayer.src assignment" step for the final frame, leaving the
        // LAST frame's image never loaded into the visible layer — the
        // caption correctly showed K12's text while the image underneath was
        // still K10 (confirmed live via kfImgA/kfImgB src inspection).
        // Clamping idx to segmentCount-1 keeps every progress value,
        // including exactly 1, inside a real "idx -> idx+1" segment.
        const idx = Math.min(segmentCount - 1, Math.floor(scaled));
        const localT = Math.min(1, scaled - idx);

        const fromLayer = idx % 2 === 0 ? imgA : imgB;
        const toLayer = idx % 2 === 0 ? imgB : imgA;
        const nextIdx = Math.min(frames.length - 1, idx + 1);
        const toIsA = toLayer === imgA;
        const toIdxChanged = toIsA ? layerAIdx !== nextIdx : layerBIdx !== nextIdx;
        if (toIdxChanged) {
          ensurePreloaded(nextIdx);
          toLayer.src = frames[nextIdx].__url;
          toLayer.style.objectPosition = frames[nextIdx].__position;
          if (toIsA) layerAIdx = nextIdx; else layerBIdx = nextIdx;
        }
        // PHASE 2.5 FIX (post-delivery, live-browser verification caught
        // this): `fromLayer` (the element showing the CURRENT idx, opacity
        // 1-localT) was NEVER explicitly assigned a src here — the code
        // relied entirely on it having been correctly loaded during some
        // EARLIER call, back when it played the `toLayer` role for idx-1.
        // That assumption only holds under monotonically-forward scroll. On
        // a fast REVERSE scroll (confirmed live: end-of-gallery back to K01)
        // the physical element now playing `fromLayer` for idx=0 still held
        // whatever frame it was LAST assigned many segments ago and was
        // never told to reload — the caption correctly showed K01's text
        // while the image underneath was still a much later frame (K03).
        // Mirroring the toLayer check symmetrically for fromLayer/idx fixes
        // both directions with the same preload-cache-aware assignment path.
        const fromIsA = fromLayer === imgA;
        const fromIdxChanged = fromIsA ? layerAIdx !== idx : layerBIdx !== idx;
        if (fromIdxChanged) {
          ensurePreloaded(idx);
          fromLayer.src = frames[idx].__url;
          fromLayer.style.objectPosition = frames[idx].__position;
          if (fromIsA) layerAIdx = idx; else layerBIdx = idx;
        }

        gsap.set(fromLayer, { opacity: 1 - localT });
        gsap.set(toLayer, { opacity: localT });

        const displayIdx = localT > 0.5 ? nextIdx : idx;
        goToFrame(displayIdx);
      }
    });
  } else {
    // No-GSAP fallback: show frame 1 statically, no pin, no crossfade.
    typo.showBeatStatic(capRefs[0].cap);
  }

  // RUNTIME HOTFIX — visible Quellen access point. Renders the SAME
  // sourcesMap already loaded above (no second fetch, no fabricated data)
  // into the compact panel in index.html. sourcesMap entries carry
  // `title`/`short_title`/`institution` per 02_CONTENT/Steinerne_Bruecke/
  // SOURCES/sources.json's schema (see resolveFrameSourceText above).
  function renderSourcesPanel(lang) {
    const list = document.getElementById("kfSourcesPanelList");
    if (!list) return;
    list.innerHTML = "";
    sourcesMap.forEach((s, id) => {
      const entry = el("div", "kf__source-entry");
      const idEl = el("p", "kf__source-entry__id");
      idEl.textContent = id;
      const titleEl = el("p", "kf__source-entry__title");
      titleEl.textContent = s.short_title || s.title || "";
      const instEl = el("p", "kf__source-entry__institution");
      instEl.textContent = s.institution || "";
      entry.append(idEl, titleEl, instEl);
      list.appendChild(entry);
    });
    const titleLabel = document.getElementById("kfSourcesPanelTitle");
    if (titleLabel) titleLabel.textContent = t(lang, "kfSourcesButton");
    const btn = document.getElementById("kfSourcesBtn");
    if (btn) btn.textContent = t(lang, "kfSourcesButton");
  }
  renderSourcesPanel(getLang());

  const sourcesBtn = document.getElementById("kfSourcesBtn");
  const sourcesPanel = document.getElementById("kfSourcesPanel");
  const sourcesCloseBtn = document.getElementById("kfSourcesCloseBtn");
  if (sourcesBtn && sourcesPanel) {
    const openPanel = () => { sourcesPanel.hidden = false; };
    const closePanel = () => { sourcesPanel.hidden = true; };
    sourcesBtn.addEventListener("click", openPanel);
    if (sourcesCloseBtn) sourcesCloseBtn.addEventListener("click", closePanel);
    sourcesPanel.addEventListener("click", (e) => { if (e.target === sourcesPanel) closePanel(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !sourcesPanel.hidden) closePanel(); });
  }

  return {
    refreshLabels: () => {
      fillCaptionText(getLang());
      renderSourcesPanel(getLang());
      // PHASE 2.5 FIX — see the invalidateOnRefresh comment above. Forces
      // this trigger to recompute start/end against the post-switch layout
      // immediately, instead of waiting for some unrelated future refresh.
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    },
    frameCount: frames.length
  };
}
