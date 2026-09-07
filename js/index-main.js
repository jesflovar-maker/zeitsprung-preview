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
import { initGallery } from "./gallery.js?v=20260905";
import { initRouteMap } from "./route-map.js";
import { activate, deactivate, register, getDebugSnapshot } from "./video-playback.js?v=20260905";
import { STEINERNE_BRUCKMANDL_ASSET_BASE } from "./zt-paths.js";

const ZT_SOUND_PREF_KEY = "zeitsprung:soundEnabled"; // shared with STEINERNE_BRUECKE/js/main.js

// PHASE 3.0 — Section 23 debug aid. `?debug=1` on the URL logs a one-shot
// snapshot of route/basePath/language/current-monument/active-media-src to
// the console (console.log only — never a visible UI panel, never wraps
// existing logic in a new conditional beyond this single opt-in call at the
// end of boot()). Absent the query param this entire block is inert.
const ZT_DEBUG = new URLSearchParams(location.search).get("debug") === "1";
function ztLogDebugState({ galleryHandle, routeMapHandle, lang }) {
  if (!ZT_DEBUG) return;
  const activeIdx = galleryHandle && typeof galleryHandle.getActiveIndex === "function" ? galleryHandle.getActiveIndex() : null;
  const bgVideo = document.querySelector("#galleryRoot .gallery__bg-video, #galleryRoot video");
  // eslint-disable-next-line no-console
  console.log("[ZEITSPRUNG debug]", {
    route: location.pathname,
    basePath: location.pathname.replace(/index\.html?$/, ""),
    language: lang,
    activeMonumentIndex: activeIdx,
    activeMonumentId: routeMapHandle && typeof routeMapHandle.getCurrentId === "function" ? routeMapHandle.getCurrentId() : null,
    activeMediaSrc: bgVideo ? (bgVideo.currentSrc || bgVideo.src || null) : null,
    videos: getDebugSnapshot()
  });
}

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
  const aiGuideImg = document.getElementById("aiGuideImg");
  if (aiGuideImg) aiGuideImg.alt = t(lang, "aiGuideAlt");
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
// HERO — BUILD SCROLL EXPERIENCE (ZEITSPRUNG DESIGN REVISION + ZEITSPRUNG
// MOTION REVISION, owner-approved). Replaces the previous PHASE 2.7C.4
// simple autoplay/loop hero with a scroll-scrubbed architectural "build"
// sequence: MASTER asset 03_ASSETS/VIDEO/INDEX/INTRO/zeitsprung_intro_build_v01.mp4
// (an abstract wireframe that resolves into a photoreal aerial night shot of
// the Steinerne Brücke + Altstadt + Dom towers), web derivative encoded with
// a short GOP (keyframe every 4 frames, NO B-frames) specifically for
// smooth bidirectional currentTime scrubbing — see that file's own header
// comment in assets/video/index/intro/ for the exact ffmpeg recipe.
//
// IMPORTANT — the MASTER video is PORTRAIT (480x854, ~9:16), not 16:9.
// Framed into this wide hero box via object-fit:cover (css/index.css),
// object-position tuned against the actual final frame to keep the bridge
// + Dom towers in view. This does not violate the frozen portrait-first 9:16
// design system rule — the hero is one of its two documented exceptions
// (HERO_BANNER_HORIZONTAL); cover-cropping a portrait source INTO that
// horizontal exception is a framing decision, not a portrait-first violation.
//
// LEGACY_REFERENCE_ONLY (kept on disk, NOT deleted, no longer referenced by
// any chapter): assets/video/index/intro/zeitsprung_intro_main_loop_final_web.mp4
// (+ its poster) — the PREVIOUS hero source (a different, non-build clip).
// ---------------------------------------------------------------------------
// INDEX HERO MOBILE FRAME-SCRUB REPAIR — capability check, not a UA/brand
// sniff (brief Section 10 explicitly asks for this): "coarse" pointer or
// "no hover" both indicate a touch-first device on every real browser engine,
// covering iPhone Safari/Chrome and Android Chrome/Edge alike without ever
// branching on a browser name/string.
function isTouchFirstDevice() {
  try {
    return window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(hover: none)").matches;
  } catch (e) {
    return false; // matchMedia unsupported (very old browser) -> fall back to the desktop/video path, never crash
  }
}

function wireHeroMedia() {
  const video = document.getElementById("heroVideo");
  const poster = document.getElementById("heroPoster");
  const canvas = document.getElementById("heroCanvas");
  // Paths are relative to index.html (this page's own location), which
  // shares the ZEITSPRUNG_V2/assets/ folder with the bridge (see
  // monuments.config.json's own path convention note).
  // Poster = the video's own final, fully-resolved frame (not a separate
  // asset) — the same completed-city composition the scrub ends on, so a
  // reduced-motion visitor or a load/scrub failure sees the SAME approved
  // result state, never an unrelated placeholder image. Shared by BOTH the
  // desktop-video and mobile-canvas paths as the pre-ready fallback (brief
  // Section 14) — never a black hero, empty canvas, or broken-image icon.
  const POSTER_IMG = "assets/video/index/intro/zeitsprung_intro_build_v01_poster.jpg";
  if (poster) poster.src = POSTER_IMG;
  // prefers-reduced-motion: the poster stays the permanent hero image on
  // EITHER path; neither the video nor the frame sequence is ever requested
  // (css/index.css also hides both defensively under prefers-reduced-motion).
  if (reducedMotion()) return;

  if (isTouchFirstDevice() && canvas) {
    // Touch-first device: the MP4 is never assigned a src at all here (no
    // download, no decode, no seeking) — see initHeroFrameScrub()'s own
    // header comment for the full rationale. Desktop/non-touch falls
    // through to the completely unchanged video path below.
    initHeroFrameScrub(canvas);
    return;
  }

  if (!video) return;
  video.src = "assets/video/index/intro/zeitsprung_intro_build_v01_web.mp4";
  register(video, { id: "indexHero", role: "hero-build-scrub" });
  video.preload = "auto"; // must be buffered enough to scrub smoothly, not just play once
  video.addEventListener("loadedmetadata", () => {
    video.classList.add("is-ready");
    initHeroScrub(video);
  }, { once: true });
  // If the browser can't load/decode it at all, the poster image (the
  // video's own final frame) stays the permanent, fully legible fallback —
  // never a black box, never a broken <video>, never an infinite spinner.
  video.addEventListener("error", () => { video.classList.remove("is-ready"); }, { once: true });
}

// ---------------------------------------------------------------------------
// Shared zt-typography.js engine-adapter pattern (mirrors
// STEINERNE_BRUECKE/js/main.js's ztRevealBeatNow()/getZtTypo() exactly) —
// used below for the hero's ONE-SHOT title/tagline reveal, now fired by
// crossing a scroll-scrub threshold instead of firing on page load.
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

// Prepares (mounts/pools) the hero title's char-reveal spans once, ahead of
// time — mounting is idempotent layout prep, not an animation, so doing it
// at boot (rather than lazily at reveal time) costs nothing and means the
// actual reveal below has zero setup latency the first time it fires.
let heroTypo = null;
let heroRevealActiveTw = null;
let heroRevealActiveTween = null;
function prepareHeroTypography() {
  if (typeof gsap === "undefined") return; // no GSAP -> base CSS keeps text visible by default, nothing to prepare
  const beat = document.getElementById("heroRevealGroup");
  const titleEl = document.getElementById("heroTitle");
  if (!beat || !titleEl) return;
  heroTypo = createZtTypography({
    engine: {
      set: ztEngineSet,
      tw: (n, a, d, to, e) => { if (heroRevealActiveTw) heroRevealActiveTw(n, a, d, to, e); },
      tween: (n, f, to, a, d, e) => { if (heroRevealActiveTween) heroRevealActiveTween(n, f, to, a, d, e); }
    },
    reducedMotion: reducedMotion(),
    desktop: window.matchMedia("(min-width: 900px)").matches
  });
  heroTypo.mountTitle(titleEl, "ZEITSPRUNG".length, "hero__title-line");
  heroTypo.setTitleText(titleEl, "ZEITSPRUNG");
  heroTypo.initBeat(beat);
}

// Fires the SAME char/line reveal choreography the hero always used
// (eyebrow -> ZT_REVEAL_CHAR title -> ZT_REVEAL_LINE tagline), just once,
// the first time the scrub crosses the title threshold — see
// initHeroScrub() below. Reuses the existing ZEITSPRUNG typography/motion
// language rather than inventing a new animation for this new trigger.
function runHeroTitleReveal() {
  const beat = document.getElementById("heroRevealGroup");
  if (!heroTypo || !beat || typeof gsap === "undefined") return;
  const tl = gsap.timeline();
  heroRevealActiveTw = ztMakeTw(tl);
  heroRevealActiveTween = ztMakeTween(tl);
  heroTypo.revealBeat(beat, 0);
}

// ---------------------------------------------------------------------------
// Scroll-scrub controller — pins .hero (GSAP ScrollTrigger) for a fixed
// scroll distance and maps scroll progress directly onto the build video's
// currentTime, continuously and bidirectionally (scroll down = construction
// advances, scroll up = it reverses, stop scrolling = frame holds exactly
// where it is). This is deliberately NOT run through video-playback.js's
// activate()/safePlay() — that shared runtime's contract is "play and keep
// playing"; this hero video is never actually playing, only ever seeked, a
// fundamentally different lifecycle that would not fit that API without
// distorting it. register() (called in wireHeroMedia() above) still gives
// it the same safe-autoplay attrs + debug-snapshot visibility as every
// other tracked video, without pretending it is playback-active.
// ---------------------------------------------------------------------------
// Shared by BOTH the desktop-video scrub (initHeroScrub) and the
// mobile-canvas frame scrub (initHeroFrameScrub) — the hint/identity/title
// reveal choreography is authored exactly once here so the two rendering
// paths can never drift apart on WHEN text appears, only HOW the visual
// frame itself is produced. Returns a function that takes the current
// progress (0-1) and applies every text-state side effect.
function makeHeroTextState(hero) {
  let hintShown = false;
  let identityShown = false;
  let titleShown = false;
  let titleRevealFired = false;

  return function applyTextState(progress) {
    // Scrollhint — only as the initial "start scrolling" invitation.
    const hintVisible = progress < 0.02;
    if (hintVisible !== hintShown) {
      hintShown = hintVisible;
      hero.classList.toggle("is-hint-visible", hintVisible);
    }

    // 70% — subtle identity (eyebrow) begins to appear.
    const identityVisible = progress >= 0.70;
    if (identityVisible !== identityShown) {
      identityShown = identityVisible;
      hero.classList.toggle("is-identity-visible", identityVisible);
    }

    // 85% — full ZEITSPRUNG title + tagline reveal, once, via the shared
    // char/line reveal engine (see runHeroTitleReveal()). Scrolling back
    // below 85% hides it again via CSS (class toggle), but the one-shot
    // GSAP reveal itself is never re-fired — re-running a char-by-char
    // reveal on every scroll direction change would read as glitchy, not
    // premium.
    const titleVisible = progress >= 0.85;
    if (titleVisible !== titleShown) {
      titleShown = titleVisible;
      hero.classList.toggle("is-title-visible", titleVisible);
      if (titleVisible && !titleRevealFired) {
        titleRevealFired = true;
        runHeroTitleReveal();
      }
    }
  };
}

function initHeroScrub(video) {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  if (reducedMotion()) {
    // css/index.css already hides .hero__media video entirely under
    // prefers-reduced-motion (poster = the video's own final frame is the
    // only visual) and the base (non-.hero--scrub-active) CSS already
    // keeps eyebrow/title/tagline visible with no animation — nothing
    // further to wire for a stable, readable reduced-motion presentation.
    return;
  }

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    // CDN blocked / plugin failed to load — degrade to the previously-
    // proven-safe simple autoplay/loop presentation rather than leaving a
    // silent, permanently-static (if technically valid) single frame.
    video.loop = true;
    activate(video, { id: "indexHero", role: "hero-build-scrub-fallback" });
    return;
  }

  const duration = video.duration;
  if (!(duration > 0) || !isFinite(duration)) return; // safety guard — never scrub against an unknown duration

  gsap.registerPlugin(ScrollTrigger);
  hero.classList.add("hero--scrub-active");

  const SEEK_EPSILON = 0.02; // seconds — avoid reassigning currentTime for negligible scroll deltas
  let lastTarget = -1;
  const applyTextState = makeHeroTextState(hero);

  function applyProgress(progress) {
    const p = Math.min(Math.max(progress, 0), 1);
    const target = p * duration;
    const clamped = Math.min(target, duration - SEEK_EPSILON);
    if (Math.abs(clamped - lastTarget) > SEEK_EPSILON) {
      video.currentTime = clamped;
      lastTarget = clamped;
    }
    applyTextState(p);
  }

  ScrollTrigger.create({
    trigger: hero,
    start: "top top",
    end: "+=260%", // ~260svh pinned scroll distance — within the suggested 220-300svh range
    pin: true,
    anticipatePin: 1,
    onUpdate: (self) => applyProgress(self.progress),
    onRefresh: (self) => applyProgress(self.progress)
  });

  // Page restoration (bfcache back/forward) — re-measure pin geometry and
  // re-sync the video frame to whatever scroll position was restored,
  // rather than leaving a stale pin/video state.
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) ScrollTrigger.refresh();
  });

  // Orientation change (mobile) — ScrollTrigger already listens to plain
  // resize internally; orientationchange on some mobile browsers fires a
  // resize late/inconsistently, so this is a small, deliberate belt-and-
  // suspenders refresh, not a second competing resize system.
  window.addEventListener("orientationchange", () => {
    ScrollTrigger.refresh();
  });
}

// ---------------------------------------------------------------------------
// INDEX HERO MOBILE FRAME-SCRUB REPAIR — touch-first device path.
//
// Physical-device QA found the desktop path above (video.currentTime scrub)
// seeks robotically on Android Chrome/Edge and does not render the
// scroll-build interaction reliably at all on iPhone Safari/Chrome, while
// every OTHER ZEITSPRUNG video system works correctly — isolating the fault
// to arbitrary-currentTime MP4 seeking specifically, not the hero design, not
// the creative asset, not infrastructure. Fix: touch-first devices never seek
// an MP4 for the hero at all. Instead, 96 frames pre-extracted via ffmpeg
// from the SAME approved web derivative
// (assets/video/index/intro/zeitsprung_intro_build_v01_web.mp4, itself an
// untouched derivative of MASTER 03_ASSETS/VIDEO/INDEX/INTRO/
// zeitsprung_intro_build_v01.mp4 — neither file touched by this task) are
// drawn to a <canvas> selected by nearest-frame-index from the EXACT SAME
// ScrollTrigger progress value the desktop path uses (one
// ScrollTrigger.create() per path, never two competing triggers on the same
// element) — see makeHeroTextState() above, shared by both paths so hint/
// identity/title reveal timing is authored exactly once and can never drift
// between the two rendering strategies.
//
// Extraction recipe (for the next regeneration): ffmpeg -i
// zeitsprung_intro_build_v01_web.mp4 -vf "fps=96/10.04166667,scale=480:854"
// -frames:v 96 -c:v libwebp -quality 70 -compression_level 6 frame_%03d.webp
// — 96 frames, 480x854 (native resolution of the web derivative, no upscale/
// downscale needed), WebP quality 70, 2.4MB total (well inside the <=6MB
// target, so quality/count were not reduced from the initial attempt).
// ---------------------------------------------------------------------------
const HERO_FRAME_COUNT = 96;
const HERO_FRAME_BASE = "assets/video/index/intro/mobile_frames_v01/";
function heroFrameUrl(i) {
  return HERO_FRAME_BASE + "frame_" + String(i).padStart(3, "0") + ".webp";
}

function initHeroFrameScrub(canvas) {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  if (reducedMotion()) return; // poster stays the sole visual, exactly like the video path

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    // CDN blocked / plugin failed — leave the poster (the video's own final,
    // fully-resolved frame) as the sole visual. Unlike the desktop fallback
    // (which can loop the actual video), a frame sequence has nothing sane
    // to "autoplay" without scroll driving it, so a static approved frame is
    // the correct degradation here, not an invented animation.
    return;
  }

  const ctx = canvas.getContext("2d", { alpha: false });
  const images = new Array(HERO_FRAME_COUNT).fill(null);
  const loading = new Array(HERO_FRAME_COUNT).fill(false);
  let currentIndex = -1;

  // Bounded-concurrency loader (brief Section 5) — never more than
  // MAX_CONCURRENT simultaneous frame requests in flight, regardless of how
  // many indices get queued at once. Priority: frame 0 and the final frame
  // first (both queued at the front immediately below), then everything
  // else in plain order; requestFrame()/renderTick() below additionally
  // re-prioritizes the frames actually near the current scroll position to
  // the front of the queue on every real progress update.
  const MAX_CONCURRENT = 4;
  let activeLoads = 0;
  const queue = [];
  function pump() {
    while (activeLoads < MAX_CONCURRENT && queue.length) {
      const i = queue.shift();
      if (images[i] || loading[i]) continue;
      loading[i] = true;
      activeLoads++;
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        images[i] = img;
        loading[i] = false;
        activeLoads--;
        if (i === 0) { canvas.classList.add("is-ready"); if (currentIndex < 0) drawFrame(0); }
        if (i === currentIndex) drawFrame(i);
        pump();
      };
      img.onerror = () => { loading[i] = false; activeLoads--; pump(); }; // images[i] stays null -> drawFrame() below simply keeps the last good frame, never a broken-image icon
      img.src = heroFrameUrl(i);
    }
  }
  function enqueue(i, front) {
    if (i < 0 || i >= HERO_FRAME_COUNT || images[i] || loading[i]) return;
    if (front) queue.unshift(i); else queue.push(i);
  }

  enqueue(0, true);
  enqueue(HERO_FRAME_COUNT - 1, true);
  for (let i = 1; i < HERO_FRAME_COUNT - 1; i++) enqueue(i, false);
  pump();

  // object-fit:cover-equivalent crop, generalized from js/gallery.js's own
  // proven single-decoder-canvas-mirror drawMirrorFrame() (which centers at
  // 50/50) to also support the hero's own tuned object-position (62%, 32%
  // — css/index.css) instead of a fixed center, so the bridge + Dom towers
  // stay in frame exactly like the desktop video path.
  const OBJ_POS_X = 0.62, OBJ_POS_Y = 0.32;
  function drawFrame(i) {
    const img = images[i];
    if (!img) return; // no frame yet at this index -- caller keeps whatever was drawn before (or the poster underneath)
    const cw = canvas.width, ch = canvas.height;
    if (!cw || !ch) return;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const canvasAspect = cw / ch, imgAspect = iw / ih;
    let sx, sy, sw, sh;
    if (imgAspect > canvasAspect) {
      sh = ih; sw = ih * canvasAspect; sx = (iw - sw) * OBJ_POS_X; sy = 0;
    } else {
      sw = iw; sh = iw / canvasAspect; sx = 0; sy = (ih - sh) * OBJ_POS_Y;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
  }

  function resizeCanvas() {
    const rect = hero.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // capped -- a hero-sized canvas at 3x DPR is real memory/paint cost for no visible gain over a 480px-native source
    const w = Math.round(rect.width * dpr), h = Math.round(rect.height * dpr);
    if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
      canvas.width = w;
      canvas.height = h;
      if (currentIndex >= 0) drawFrame(currentIndex); // resize clears the backing store -- repaint immediately, never a blank frame after rotate/resize
    }
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Light progress smoothing (brief Section 8) — small on purpose. This is
  // NOT fake video interpolation between frames; it only smooths WHICH
  // progress value gets fed into the nearest-frame-index selection, so a
  // noisy burst of scroll-delta events can't cause visible frame chatter.
  // SMOOTH_FACTOR is deliberately high (snappy) so down/up/stop all still
  // feel immediate, per the brief's explicit "no long lag" requirement.
  const SMOOTH_FACTOR = 0.35;
  let smoothed = 0;
  let smoothedInit = false;
  let targetProgress = 0;
  let rafPending = false;
  let heroInView = true;

  const applyTextState = makeHeroTextState(hero);

  // Convergence threshold for the smoothing below, in frame-index units:
  // once `smoothed` is closer to `targetProgress` than this, further
  // stepping cannot change the ROUNDED frame index anyway, so settling
  // stops exactly ("quickly", per the brief) rather than chasing an
  // imperceptible remainder forever.
  const SETTLE_EPSILON = 1 / (HERO_FRAME_COUNT - 1) / 4;

  function renderTick() {
    rafPending = false;
    if (!heroInView) return; // lifecycle (brief Section 13) -- zero draws while genuinely offscreen; resumes naturally from wherever it left off once a real onUpdate fires again
    if (!smoothedInit) { smoothed = targetProgress; smoothedInit = true; }
    else smoothed += (targetProgress - smoothed) * SMOOTH_FACTOR;
    applyTextState(smoothed);
    const idx = Math.round(smoothed * (HERO_FRAME_COUNT - 1));
    if (idx !== currentIndex) {
      currentIndex = idx;
      // Re-prioritize the frames actually needed right now to the front of
      // the load queue -- "frames near current scroll position" (brief
      // Section 5, priority 3) without re-queuing anything already
      // loaded/in-flight (enqueue() itself is a no-op for those).
      enqueue(idx, true);
      enqueue(Math.min(idx + 1, HERO_FRAME_COUNT - 1), true);
      enqueue(Math.max(idx - 1, 0), true);
      pump();
      drawFrame(idx); // no-op (keeps last drawn frame) if this exact index hasn't loaded yet -- never blank
    }
    // MEASURED CORRECTION (this task, pre-delivery QA): a single onUpdate
    // event only scheduled ONE renderTick, which moved `smoothed` just
    // SMOOTH_FACTOR (35%) of the way toward the real target and then froze
    // there — fine for a slow, continuous real scroll gesture (which fires
    // many onUpdate events in quick succession, each converging further),
    // but confirmed live to leave the hero stuck on the WRONG frame after a
    // fast/discrete scroll change, directly contradicting the brief's "stop
    // scroll settles quickly, no long lag" requirement. Fixed by having
    // renderTick keep re-scheduling ITSELF (still only ever one rAF in
    // flight at a time, still gated on heroInView, still never runs after
    // scrolling away) until `smoothed` has actually converged — a short,
    // self-terminating settle animation, not an unrestricted per-frame loop:
    // at SMOOTH_FACTOR=0.35 this typically resolves within single-digit
    // frames of the last real scroll event.
    if (Math.abs(targetProgress - smoothed) > SETTLE_EPSILON) {
      rafPending = true;
      requestAnimationFrame(renderTick);
    }
  }

  function requestFrame(rawProgress) {
    targetProgress = Math.min(Math.max(rawProgress, 0), 1);
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(renderTick);
    }
  }

  gsap.registerPlugin(ScrollTrigger);
  hero.classList.add("hero--scrub-active");

  ScrollTrigger.create({
    trigger: hero,
    start: "top top",
    end: "+=260%", // identical pinned scroll distance to the desktop path -- same hero, same pin/text/VISION-transition timing, only the visual-frame mechanism differs
    pin: true,
    anticipatePin: 1,
    onUpdate: (self) => requestFrame(self.progress),
    onRefresh: (self) => requestFrame(self.progress)
  });

  // Explicit viewport guard in ADDITION to ScrollTrigger's own pin-scoped
  // onUpdate (which already stops firing once fully scrolled past the pinned
  // range, matching the desktop path's existing "zero seeks after exit"
  // behavior) — belt-and-suspenders against a stray rAF from a resize/
  // refresh firing while genuinely offscreen.
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => { heroInView = entry.isIntersecting; });
    }, { threshold: 0 }).observe(hero);
  }

  window.addEventListener("pageshow", (e) => {
    if (e.persisted) ScrollTrigger.refresh();
  });
  window.addEventListener("orientationchange", () => {
    ScrollTrigger.refresh();
    resizeCanvas();
  });
}

// ---------------------------------------------------------------------------
// Generic ONE-SHOT, scroll-triggered char/line reveal for a secondary beat
// (PHASE 2.7C — "RUTA INTERACTIVA" gallery heading; PHASE 2.7C.1 — also used
// for the VISION/MISSION/OBJECTIVE chapters). Same createZtTypography
// adapter pattern as the hero's prepareHeroTypography()/runHeroTitleReveal()
// above, but fires the first time
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
// AI GUIDE — new INDEX entry card (see index.html for the full scope note).
// First version only: sets the character image src (SAME approved PNG the
// Bruckmandl module itself already uses, via STEINERNE_BRUCKMANDL_ASSET_BASE
// — no second asset copy) and the localized alt text, then plays a single
// restrained fade/translate-up reveal on scroll-into-view, mirroring
// STEINERNE_BRUECKE/js/main.js's own wireBruckmandl()/wireKframesGallery()
// gsap.fromTo + ScrollTrigger convention exactly (same duration/ease/
// toggleActions), rather than the heavier per-character zt-typography
// buildBeatReveal() above, which is unnecessary for a static label+tagline.
// Navigation itself is a plain <a href> — no click handler, no chatbot, no
// AI response logic, no backend, no state machine.
// ---------------------------------------------------------------------------
function wireAiGuideCard() {
  const card = document.getElementById("aiGuideCard");
  const img = document.getElementById("aiGuideImg");
  if (!card || !img) return;

  img.src = `${STEINERNE_BRUCKMANDL_ASSET_BASE}/ai/bruckmandl_ai_idle.png`;
  img.alt = t(lang, "aiGuideAlt");

  if (typeof gsap === "undefined" || reducedMotion()) return;

  gsap.registerPlugin(ScrollTrigger); // idempotent — safe alongside the other registerPlugin call sites in this file
  gsap.fromTo(
    card,
    { autoAlpha: 0, y: 30 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
        toggleActions: "play none none reverse"
      }
    }
  );
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
      // Only actually activate() if this layer is (still) the active one —
      // startVideo() can be called ahead of a layer becoming active (see
      // startVideo() call sites below), and 'canplay' is async: the visitor
      // may have already scrolled past this chapter by the time it fires.
      if (activeLayer === layer) activateLayer(layer);
    }, { once: true });
    v.addEventListener("error", () => { v.classList.remove("is-ready"); }, { once: true });
  }

  let activeLayer = null;
  function activateLayer(layer) {
    if (!layer || !layer.videoEl) return;
    activate(layer.videoEl, { id: layer.beatId, role: "thesis-chapter" });
  }
  function switchTo(layer) {
    if (!layer || activeLayer === layer) return;
    layers.forEach((l) => l.layerEl.classList.toggle("is-active", l === layer));
    if (activeLayer && activeLayer.videoEl) deactivate(activeLayer.videoEl);
    activeLayer = layer;
    startVideo(layer);
    if (layer.started && layer.videoEl) activateLayer(layer);
  }

  if (typeof IntersectionObserver === "undefined") { switchTo(layers[0]); return; }

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
      switchTo(layers[0]);
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
    if (!best) {
      // VIDEO DECODE PERFORMANCE HOTFIX (confirmed defect) — previously this
      // branch didn't exist, so the last-active chapter's video kept
      // playing indefinitely once the visitor scrolled past the whole
      // thesis-wrap section (no beat intersecting at all). Reuses the SAME
      // deactivate() this function already calls on every normal
      // chapter-to-chapter switch -- clearing activeLayer (rather than
      // leaving it set) is what lets switchTo() genuinely re-activate on
      // re-entry instead of no-op'ing on its own `activeLayer === layer`
      // guard.
      if (activeLayer && activeLayer.videoEl) deactivate(activeLayer.videoEl);
      activeLayer = null;
      return;
    }
    const found = beatEls.find((b) => b.beat === best);
    if (found) switchTo(found.layer);
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
  prepareHeroTypography(); // mount/pool the title spans before the video's loadedmetadata can fire initHeroScrub()
  wireHeroMedia(); // fires initHeroScrub() -> runHeroTitleReveal() itself, once the scrub crosses 85%
  wireThesisMedia();
  buildBeatReveal("visionBeat", "visionTitle", t(lang, "visionTitle"), "thesis-chapter__title-line");
  buildBeatReveal("missionBeat", "missionTitle", t(lang, "missionTitle"), "thesis-chapter__title-line");
  buildBeatReveal("objectiveBeat", "objectiveTitle", t(lang, "objectiveTitle"), "thesis-chapter__title-line");
  buildBeatReveal("galleryHeadBeat", "galleryTitle", t(lang, "galleryTitle"), "route-title-chapter__title-line");
  wireAiGuideCard();

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

  ztLogDebugState({ galleryHandle, routeMapHandle, lang });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
