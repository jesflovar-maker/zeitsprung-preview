/* ZEITSPRUNG V2 — js/index-main.js
   PHASE 2.7 — MAIN INDEX bootstrap: language switcher, global mute control,
   hero typography reveal, monument gallery wiring.

   REUSE, NOT FORK:
     - ZT_AUDIO_BUS               from ../js/zt-audio.js (SAME instance the
       Steinerne Brücke bridge uses — Phase 2.4A's single audio bus)
     - createZtTypography         from ../STEINERNE_BRUECKE/js/zt-typography.js
       (the SAME reusable module already consumed by museum2d-scroll.js,
       kframes-gallery.js and STEINERNE_BRUECKE/js/main.js). This file
       supplies its own small GSAP-backed real-time engine adapter, mirroring
       STEINERNE_BRUECKE/js/main.js's ztRevealBeatNow() pattern exactly, for
       the ONE-SHOT (non-scroll-scrubbed) hero title reveal on first load.
       zt-typography.js itself is not modified, moved or duplicated.

   GSAP is loaded via the same CDN as STEINERNE_BRUECKE/js/main.js (see
   index.html) — ScrollTrigger/Lenis are NOT loaded here, this page has no
   pinned/scrubbed scroll sections. */

import { getInitialLang, setLang, applyI18n, t } from "./index-i18n.js";
import { ZT_AUDIO_BUS } from "./zt-audio.js";
import { createZtTypography } from "../STEINERNE_BRUECKE/js/zt-typography.js";
import { initGallery } from "./gallery.js";
import { initRouteMap } from "./route-map.js";
import { safePlay, safePause } from "./video-playback.js";

const ZT_SOUND_PREF_KEY = "zeitsprung:soundEnabled"; // shared with STEINERNE_BRUECKE/js/main.js

let lang = getInitialLang();
let soundEnabled = (function () {
  try { return sessionStorage.getItem(ZT_SOUND_PREF_KEY) === "1"; }
  catch (e) { return false; }
})();

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ---------------------------------------------------------------------------
// PHASE 2.7C.2 — gallery transition SFX (Section 17). This page's own
// ZT_AUDIO_BUS module instance starts with an EMPTY registry (registerSfx()
// calls in STEINERNE_BRUECKE/js/museum25d.js belong to a different page/
// module instance and never reach this one) — one semantic key, reusing the
// SAME already-registered category-2 WAV file
// (03_ASSETS/AUDIO/SFX/transition/reveal_soft_01.wav, its web copy already
// lives under assets/audio/sfx/transition/, same SFX_ROOT the bridge uses).
// No new audio file is added. Respects the global mute exactly like the
// bridge — ZT_AUDIO_BUS's own master gain gates this regardless of call site.
// ---------------------------------------------------------------------------
ZT_AUDIO_BUS.registerSfx({ GALLERY_TRANSITION: "transition/reveal_soft_01.wav" });

// ---------------------------------------------------------------------------
// Language switcher
// ---------------------------------------------------------------------------
let galleryHandle = null;
let routeMapHandle = null;

function applyLang(next) {
  lang = next;
  setLang(lang);
  applyI18n(lang);
  document.querySelectorAll(".langbtn").forEach((b) => {
    b.classList.toggle("is-active", b.getAttribute("data-lang") === lang);
  });
  applyMuteUI();
  if (galleryHandle) galleryHandle.refreshLang();
  if (routeMapHandle) routeMapHandle.refreshLang();
}

function wireLangSwitcher() {
  document.querySelectorAll(".langbtn").forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.getAttribute("data-lang")));
  });
}

// ---------------------------------------------------------------------------
// Sound toggle — same ZT_AUDIO_BUS.unlock()/setMuted() pattern as the bridge.
// ---------------------------------------------------------------------------
function applyMuteUI() {
  const btn = document.getElementById("navSoundToggle");
  if (!btn) return;
  btn.classList.toggle("is-on", soundEnabled);
  btn.setAttribute("aria-pressed", soundEnabled ? "true" : "false");
  btn.setAttribute("aria-label", t(lang, soundEnabled ? "soundOn" : "soundOff"));
}

function setSoundEnabled(next) {
  soundEnabled = next;
  ZT_AUDIO_BUS.setMuted(!soundEnabled);
  try { sessionStorage.setItem(ZT_SOUND_PREF_KEY, soundEnabled ? "1" : "0"); } catch (e) {}
  applyMuteUI();
}

function wireSoundToggle() {
  const btn = document.getElementById("navSoundToggle");
  if (!btn) return;
  applyMuteUI();
  btn.addEventListener("click", () => {
    ZT_AUDIO_BUS.unlock(); // real user gesture — the only sanctioned place to resume the AudioContext
    setSoundEnabled(!soundEnabled);
  });
}

// ---------------------------------------------------------------------------
// Hero cinematic flyover — PHASE 2.7C.4: main ZEITSPRUNG PROJECT intro,
// swapped to the purpose-built INTRO master
// (03_ASSETS/VIDEO/INDEX/INTRO/zeitsprung_intro_main_loop_final.mp4 — a
// water-level Steinerne Brücke shot with the Regensburg Dom skyline behind
// it, i.e. still the whole-city "PLACE" arrival moment, not one monument
// page). Video-only h264 derivative (audio stripped, +faststart), poster =
// t=0.5s frame. Muted/playsinline/no controls. This is the ONLY video
// eager-loaded on the page; not required for the page to be understood if
// it fails to load (poster + text remain fully legible). This is the very
// first thing to load -> preload="auto" (eager), unlike the
// VISION/MISSION/OBJECTIVE loops which must stay lazily deferred.
//
// LEGACY_REFERENCE_ONLY (Phase 2.7C-era hero asset, NOT deleted): assets/
// zeitsprung/intro/zt_intro_fpv_regensburg_15s_v01_web.mp4 (+ its poster) is
// no longer the hero source. A Phase 2.7C.4 pass had briefly repurposed it
// as VISION's background loop too, but that was a mistake (visitors saw
// this generic city clip where the dedicated VISION loop belongs) — fixed
// in the URGENT INDEX FIX task; VISION now uses its own real loop (see the
// CHAPTERS array's "visionBeat" entry inside wireThesisMedia() below). This
// file is kept on disk as a reusable asset, not currently referenced by any
// chapter.
// ---------------------------------------------------------------------------
function wireHeroMedia() {
  const video = document.getElementById("heroVideo");
  const poster = document.getElementById("heroPoster");
  // Paths are relative to index.html (this page's own location), which
  // shares the ZEITSPRUNG_V2/assets/ folder with the bridge (see
  // monuments.config.json's own path convention note).
  const POSTER_IMG = "assets/video/index/intro/zeitsprung_intro_poster_final.jpg";
  if (poster) poster.src = POSTER_IMG;
  if (!video) return;
  // prefers-reduced-motion: the poster stays the permanent hero image; the
  // video is never even requested (css/index.css also hides it defensively).
  if (reducedMotion()) return;
  video.src = "assets/video/index/intro/zeitsprung_intro_main_loop_final_web.mp4";
  video.muted = true;
  video.playsInline = true;
  video.loop = true;
  video.preload = "auto";
  video.addEventListener("canplay", () => {
    video.classList.add("is-ready");
    safePlay(video);
  }, { once: true });
  // If the browser can't play it at all (unlikely, this derivative already
  // ships to STEINERNE_BRUECKE/index.html successfully), the poster image
  // stays the permanent, fully legible fallback — never a blank hero.
  video.addEventListener("error", () => { video.classList.remove("is-ready"); }, { once: true });
}

// ---------------------------------------------------------------------------
// Hero title reveal — ONE-SHOT, real-time (not scroll-scrubbed), via the
// shared zt-typography.js engine-adapter pattern (mirrors
// STEINERNE_BRUECKE/js/main.js's ztRevealBeatNow()/getZtTypo() exactly).
// ---------------------------------------------------------------------------
const ztPropState = new Map();
function ztStFor(node) { if (!ztPropState.has(node)) ztPropState.set(node, {}); return ztPropState.get(node); }
function ztEngineSet(node, vars) { if (!node) return; Object.assign(ztStFor(node), vars); gsap.set(node, vars); }
function ztMakeTw(tl) {
  return function (node, at, dur, to, ease) {
    if (!node || !(dur > 0)) return;
    const cur = ztStFor(node);
    const from = {};
    Object.keys(to).forEach((k) => { from[k] = (k in cur) ? cur[k] : to[k]; });
    tl.fromTo(node, from, Object.assign({}, to, { duration: dur, ease: ease || "power2.out", immediateRender: false }), at);
    Object.assign(cur, to);
  };
}
function ztMakeTween(tl) {
  return function (node, from, to, at, dur, ease) {
    if (!node || !(dur > 0)) return;
    tl.fromTo(node, from, Object.assign({}, to, { duration: dur, ease: ease || "power2.out", immediateRender: false }), at);
  };
}

function buildHeroTypography() {
  if (typeof gsap === "undefined") {
    // No GSAP loaded (e.g. blocked CDN) — degrade to plain CSS-visible text,
    // never a blank hero. index.css already shows these elements at
    // opacity:1 by default; this function simply never runs a reveal.
    return;
  }
  const beat = document.getElementById("heroRevealGroup");
  const titleEl = document.getElementById("heroTitle");
  if (!beat || !titleEl) return;

  const R = reducedMotion();
  let activeTw = null, activeTween = null;
  const typo = createZtTypography({
    engine: {
      set: ztEngineSet,
      tw: (n, a, d, to, e) => { if (activeTw) activeTw(n, a, d, to, e); },
      tween: (n, f, to, a, d, e) => { if (activeTween) activeTween(n, f, to, a, d, e); }
    },
    reducedMotion: R,
    desktop: window.matchMedia("(min-width: 900px)").matches
  });

  typo.mountTitle(titleEl, "ZEITSPRUNG".length, "hero__title-line");
  typo.setTitleText(titleEl, "ZEITSPRUNG");
  typo.initBeat(beat);

  const tl = gsap.timeline({ delay: 0.15 });
  activeTw = ztMakeTw(tl);
  activeTween = ztMakeTween(tl);
  typo.revealBeat(beat, 0);
}

// ---------------------------------------------------------------------------
// Generic ONE-SHOT, scroll-triggered char/line reveal for a secondary beat
// (PHASE 2.7C — "RUTA INTERACTIVA" gallery heading; PHASE 2.7C.1 — also used
// for the VISION/MISSION/OBJECTIVE chapters). Mirrors buildHeroTypography
// exactly (same createZtTypography adapter pattern), but fires the first time
// the beat's container enters the viewport instead of immediately on load —
// a light, restrained IntersectionObserver reveal, NOT scroll-scrubbed/pinned
// (matches kframes-gallery.js's own reveal-choreography restraint, per brief
// Section 2/20). Falls back to plain CSS-visible text if GSAP is unavailable
// or the element has already been revealed once. initBeat()/revealBeat() (see
// zt-typography.js) already walk every [data-reveal] child of the beat
// (eyebrow/title/line), so this single call authors the WHOLE chapter
// (eyebrow -> ZT_REVEAL_CHAR title -> ZT_REVEAL_LINE body copy), not just
// the title.
// ---------------------------------------------------------------------------
function buildBeatReveal(containerId, titleId, titleText, lineClass) {
  if (typeof gsap === "undefined") return;
  const beat = document.getElementById(containerId);
  const titleEl = document.getElementById(titleId);
  if (!beat || !titleEl) return;

  const R = reducedMotion();
  let activeTw = null, activeTween = null;
  const typo = createZtTypography({
    engine: {
      set: ztEngineSet,
      tw: (n, a, d, to, e) => { if (activeTw) activeTw(n, a, d, to, e); },
      tween: (n, f, to, a, d, e) => { if (activeTween) activeTween(n, f, to, a, d, e); }
    },
    reducedMotion: R,
    desktop: window.matchMedia("(min-width: 900px)").matches
  });

  typo.mountTitle(titleEl, titleText.length, lineClass || "zt-title-line");
  typo.setTitleText(titleEl, titleText);
  typo.initBeat(beat);

  if (R || typeof IntersectionObserver === "undefined") {
    // Reduced motion / no IO support: show statically, no animated reveal.
    if (typeof typo.showBeatStatic === "function") typo.showBeatStatic(beat);
    return;
  }

  let fired = false;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || fired) return;
      fired = true;
      const tl = gsap.timeline({ delay: 0.05 });
      activeTw = ztMakeTw(tl);
      activeTween = ztMakeTween(tl);
      typo.revealBeat(beat, 0);
      io.disconnect();
    });
  }, { threshold: 0.35 });
  io.observe(beat);
}

// ---------------------------------------------------------------------------
// VISION/MISSION/OBJECTIVE background — PHASE 2.7C.1 architecture,
// PHASE 2.7C.4 media: each chapter has its OWN dedicated background loop,
// all three genuinely distinct derivatives under
// assets/video/index/vision_mission_objective/ (vision/mission/objective
// _loop_01_web.mp4 + matching posters). URGENT INDEX FIX (this task): VISION
// was incorrectly still pointing at the former hero flyover
// (assets/zeitsprung/intro/zt_intro_fpv_regensburg_15s_v01_web.mp4) — a
// leftover from before the dedicated VISION loop existed. That old flyover
// asset remains on disk, LEGACY_REFERENCE_ONLY, no longer referenced by any
// chapter here.
//
// Same sticky-background technique as before (css/index.css .thesis-media /
// .thesis-chapters), just parametrized per chapter: three
// .thesis-media__layer wrappers are stacked in the same sticky box, and
// whichever chapter is most visible drives which layer is opacity:1 (same
// restrained two-layer-crossfade vocabulary as gallery.js's applyBg(), N=3
// here). Lazy-loading discipline is preserved: nothing in this section gets
// a real video src until .thesis-wrap is about to enter the viewport
// (rootMargin gives a head start, matching the original single-clip
// version's behavior) — VISION is the first chapter reached, so it is the
// one primed at that moment; MISSION/OBJECTIVE only get their own real src
// the instant their own chapter becomes the most-visible one via the
// per-chapter IntersectionObserver below (never all three eagerly).
// prefers-reduced-motion: only VISION's poster is shown, statically, exactly
// like the hero's own reduced-motion fallback; css/index.css also hides
// .thesis-media outright in that case (no pseudo-parallax at all).
// ---------------------------------------------------------------------------
function wireThesisMedia() {
  const wrap = document.querySelector(".thesis-wrap");
  if (!wrap) return;

  const CHAPTERS = [
    {
      beatId: "visionBeat", layerId: "thesisLayerVision",
      poster: "assets/video/index/vision_mission_objective/vision_poster_01.jpg",
      video: "assets/video/index/vision_mission_objective/vision_loop_01_web.mp4"
    },
    {
      beatId: "missionBeat", layerId: "thesisLayerMission",
      poster: "assets/video/index/vision_mission_objective/mission_poster_01.jpg",
      video: "assets/video/index/vision_mission_objective/mission_loop_01_web.mp4"
    },
    {
      beatId: "objectiveBeat", layerId: "thesisLayerObjective",
      poster: "assets/video/index/vision_mission_objective/objective_poster_01.jpg",
      video: "assets/video/index/vision_mission_objective/objective_loop_01_web.mp4"
    }
  ];

  const layers = CHAPTERS.map((c) => {
    const layerEl = document.getElementById(c.layerId);
    if (!layerEl) return null;
    const posterEl = layerEl.querySelector(".thesis-media__poster");
    const videoEl = layerEl.querySelector(".thesis-media__video");
    if (posterEl) posterEl.src = c.poster;
    return Object.assign({}, c, { layerEl, videoEl, started: false });
  }).filter(Boolean);
  if (!layers.length) return;

  if (reducedMotion()) {
    // Static poster only — VISION's layer stays permanently active, no
    // video is ever requested for any chapter.
    layers[0].layerEl.classList.add("is-active");
    return;
  }

  function startVideo(layer) {
    if (!layer || layer.started || !layer.videoEl) return;
    layer.started = true;
    const v = layer.videoEl;
    v.src = layer.video;
    v.muted = true;
    v.playsInline = true;
    v.loop = true;
    v.preload = "auto";
    v.addEventListener("canplay", () => {
      v.classList.add("is-ready");
      safePlay(v);
    }, { once: true });
    v.addEventListener("error", () => { v.classList.remove("is-ready"); }, { once: true });
  }

  let activeLayer = null;
  function activate(layer) {
    if (!layer || activeLayer === layer) return;
    layers.forEach((l) => l.layerEl.classList.toggle("is-active", l === layer));
    if (activeLayer && activeLayer.videoEl) safePause(activeLayer.videoEl);
    activeLayer = layer;
    startVideo(layer);
    if (layer.started && layer.videoEl) safePlay(layer.videoEl);
  }

  if (typeof IntersectionObserver === "undefined") { activate(layers[0]); return; }

  const beatEls = layers.map((l) => {
    const beat = document.getElementById(l.beatId);
    return beat ? { beat, layer: l } : null;
  }).filter(Boolean);

  // Head-start arming: only once .thesis-wrap is about to enter the
  // viewport does VISION (the first chapter reached) get primed — mirrors
  // the original single-clip version's rootMargin lazy-load discipline.
  const armIo = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      activate(layers[0]);
      armIo.disconnect();
    });
  }, { rootMargin: "600px 0px" });
  armIo.observe(wrap);

  // Per-chapter crossfade driver: whichever chapter is currently most
  // visible determines the active media layer. MISSION/OBJECTIVE only ever
  // get a real <video src> (startVideo()) the moment they actually become
  // the most-visible chapter — never prefetched ahead of that.
  const chapterIo = new IntersectionObserver((entries) => {
    let best = null;
    let bestRatio = 0;
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
        bestRatio = entry.intersectionRatio;
        best = entry.target;
      }
    });
    if (!best) return;
    const found = beatEls.find((b) => b.beat === best);
    if (found) activate(found.layer);
  }, { threshold: [0.15, 0.3, 0.5, 0.7, 0.9] });
  beatEls.forEach((b) => chapterIo.observe(b.beat));
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
async function boot() {
  applyI18n(lang);
  document.querySelectorAll(".langbtn").forEach((b) => {
    b.classList.toggle("is-active", b.getAttribute("data-lang") === lang);
  });
  wireLangSwitcher();
  wireSoundToggle();
  wireHeroMedia();
  buildHeroTypography();
  wireThesisMedia();
  buildBeatReveal("visionBeat", "visionTitle", t(lang, "visionTitle"), "thesis-chapter__title-line");
  buildBeatReveal("missionBeat", "missionTitle", t(lang, "missionTitle"), "thesis-chapter__title-line");
  buildBeatReveal("objectiveBeat", "objectiveTitle", t(lang, "objectiveTitle"), "thesis-chapter__title-line");
  buildBeatReveal("galleryHeadBeat", "galleryTitle", t(lang, "galleryTitle"), "route-title-chapter__title-line");

  const galleryRoot = document.getElementById("galleryRoot");
  galleryHandle = await initGallery({
    root: galleryRoot,
    getLang: () => lang,
    reducedMotion,
    // PHASE 2.7C.2 — REVERSE map sync (Section 11): the gallery's own
    // tabs/prev/next/swipe now call this after every real selection change
    // (not on initial render(0), and not when route-map.js itself drove the
    // change via selectById() — route-map's setActive() below only updates
    // its OWN pin visuals and never re-enters selectById(), so this can
    // never become a feedback loop between the two directions). Also fires
    // the single restrained transition SFX cue (Section 17) and lets
    // ZT_AUDIO_BUS's own per-event cooldown guard against rapid re-triggers
    // rather than adding a second debounce here.
    onSelect(id) {
      if (routeMapHandle && typeof routeMapHandle.setActive === "function") routeMapHandle.setActive(id);
      ZT_AUDIO_BUS.playSfx("GALLERY_TRANSITION");
    }
  });

  const routeMapRoot = document.getElementById("routeMapRoot");
  routeMapHandle = await initRouteMap({
    root: routeMapRoot,
    getLang: () => lang,
    getGalleryHandle: () => galleryHandle,
    reducedMotion
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
