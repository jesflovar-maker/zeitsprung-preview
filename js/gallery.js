/* ZEITSPRUNG V2 — js/gallery.js
   PHASE 2.7 — MAIN INDEX config-driven monument gallery.

   Reads ONE source of truth (../monuments.config.json) and renders:
     - a dominant vertical panel for the CURRENT monument (portrait visual +
       name/subtitle/description + CTA-or-status affordance)
     - a full-screen background treatment of the SAME visual (blurred/dimmed),
       reused rather than requiring a second wider asset per monument
     - a compact tab strip (1..5) for direct selection + prev/next
     - a "K01/05"-style progress counter, mirroring the restrained secondary
       nav pattern already proven in STEINERNE_BRUECKE/js/kframes-gallery.js

   LAZY-LOADING DISCIPLINE (mirrors kframes-gallery.js's preloadWindow()):
   only the CURRENT monument's visual and its immediate NEXT neighbor are
   assigned a real <img src> eagerly. Every other monument's visual is only
   given a real src the moment the visitor actually navigates to it (a
   discrete, user-intentional action, not a prefetch) or when it becomes the
   new "next" neighbor. This satisfies the brief's "current + likely-next
   only" requirement without needing an IntersectionObserver (this component
   is click/swipe-driven, not scroll-driven).

   TRANSITION VOCABULARY: opacity + very small scale/translate on the
   foreground portrait, opacity-only crossfade on the blurred background —
   the same restrained, non-gimmicky vocabulary already used by
   kframes-gallery.js's frame crossfade and js/main.js's #stage layerA/layerB
   pattern. No carousel spin, no 3D tilt. `prefers-reduced-motion: reduce`
   collapses this to a plain opacity fade only (see css/index.css).

   NO NEW HISTORICAL CLAIM IS MADE HERE. All name/subtitle/description/cta
   strings are read verbatim from monuments.config.json, which itself only
   restates monument names/roles already used in
   01_ARCHITECTURE/ZEITSPRUNG_PROJECT_CONCEPT.md section 8. */

const CONFIG_URL = "./monuments.config.json";

function el(tag, className, attrs) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (attrs) Object.keys(attrs).forEach((k) => node.setAttribute(k, attrs[k]));
  return node;
}

function pick(obj, lang) {
  if (!obj) return "";
  return obj[lang] !== undefined ? obj[lang] : (obj.de || "");
}

import { activate, deactivate } from "./video-playback.js";

export async function initGallery({ root, getLang, reducedMotion, onSelect }) {
  if (!root) return null;

  let monuments = [];
  try {
    const res = await fetch(CONFIG_URL, { cache: "no-store" });
    const data = await res.json();
    monuments = (data.monuments || []).slice().sort((a, b) => a.order - b.order);
  } catch (err) {
    // Fail quietly but visibly in the console — this component simply does
    // not render rather than showing broken/invented content.
    console.error("ZEITSPRUNG gallery: could not load monuments.config.json", err);
    return null;
  }
  if (!monuments.length) return null;

  const n = monuments.length;
  let activeIdx = 0;

  // -- DOM scaffold ---------------------------------------------------------
  root.innerHTML = "";
  const bgA = el("div", "gallery__bg gallery__bg--a");
  const bgB = el("div", "gallery__bg gallery__bg--b");
  // SINGLE-DECODER CANVAS MIRROR (owner-approved performance experiment,
  // replaces the two-<video> background) — bgA/bgB (the still-image
  // crossfade pair) stay exactly as before, mounted underneath as the
  // permanent still fallback and as what's visible before the foreground
  // has a decoded frame. The moving atmosphere layer is now this ONE
  // <canvas>, painted from panelVideo's own decoded frames (see the canvas
  // mirror block below) — there is no second <video> element, so no second
  // decoder, at all.
  const bgCanvas = el("canvas", "gallery__bg-canvas", { "aria-hidden": "true" });
  const scrim = el("div", "gallery__scrim");
  const stage = el("div", "gallery__stage");
  const panel = el("article", "gallery__panel");
  const panelMedia = el("div", "gallery__panel-media");
  const panelImgA = el("img", "gallery__panel-img gallery__panel-img--a");
  const panelImgB = el("img", "gallery__panel-img gallery__panel-img--b");
  panelImgA.alt = ""; panelImgB.alt = ""; panelImgA.draggable = false; panelImgB.draggable = false;
  const placeholder = el("div", "gallery__placeholder", { "aria-hidden": "true" });
  // PHASE 2.7C.2 — ONE foreground video layer, the single decoder this
  // whole card runs on (the moving background is a <canvas> mirror, no
  // second <video> — see the canvas mirror block below). Sits above the
  // placeholder/img layers.
  const panelVideo = el("video", "gallery__panel-video", { "aria-hidden": "true", tabindex: "-1" });
  panelVideo.muted = true; panelVideo.playsInline = true; panelVideo.disablePictureInPicture = true;
  panelMedia.appendChild(placeholder);
  panelMedia.appendChild(panelImgA);
  panelMedia.appendChild(panelImgB);
  panelMedia.appendChild(panelVideo);

  const info = el("div", "gallery__info");
  const counter = el("p", "gallery__counter gallery__field");
  const eyebrow = el("p", "gallery__subtitle gallery__field");
  const title = el("h3", "gallery__name gallery__field");
  const desc = el("p", "gallery__desc gallery__field");
  info.appendChild(counter);
  info.appendChild(eyebrow);
  info.appendChild(title);
  info.appendChild(desc);

  // VISUAL LOCK (owner-approved DESIGN + MOTION REVISION) — CTA is
  // deliberately NOT the last item flowing inside .gallery__info's text
  // column. Per the owner's locked spatial reference, it sits as its own
  // centered row BELOW the video+text pairing, not tucked under the
  // description on the right. .gallery__top groups exactly the video+text
  // pairing (row on desktop, column on mobile — see css/index.css); ctaWrap
  // is `.gallery__panel`'s other direct child, always centered under it.
  const top = el("div", "gallery__top");
  const ctaWrap = el("div", "gallery__cta-wrap gallery__field");
  top.appendChild(panelMedia);
  top.appendChild(info);

  panel.appendChild(top);
  panel.appendChild(ctaWrap);

  const nav = el("div", "gallery__nav", { role: "tablist", "aria-label": "ZEITSPRUNG monuments" });
  const prevBtn = el("button", "gallery__arrow gallery__arrow--prev", { type: "button", "aria-label": "Previous monument" });
  prevBtn.textContent = "‹";
  const nextBtn = el("button", "gallery__arrow gallery__arrow--next", { type: "button", "aria-label": "Next monument" });
  nextBtn.textContent = "›";

  const tabs = monuments.map((m, i) => {
    const tab = el("button", "gallery__tab", { type: "button", role: "tab", "data-idx": String(i) });
    const thumb = el("div", "gallery__tab-thumb");
    const label = el("span", "gallery__tab-label");
    tab.appendChild(thumb);
    tab.appendChild(label);
    nav.appendChild(tab);
    return { tab, thumb, label };
  });

  stage.appendChild(panel);
  root.appendChild(bgA);
  root.appendChild(bgB);
  root.appendChild(bgCanvas);
  root.appendChild(scrim);
  root.appendChild(stage);
  root.appendChild(prevBtn);
  root.appendChild(nextBtn);
  root.appendChild(nav);

  // Still image used for the main panel/bg composition — the video's own
  // poster frame when a video exists (a real decoded frame of that clip,
  // not a generic hero shot), else the monument's plain hero visual. Tab
  // thumbnails intentionally keep using `visual` directly (see renderTabs)
  // — a small strip thumbnail favours the curated hero shot over a video
  // still, and must stay identical for every monument regardless of
  // video_mode.
  function stillFor(m) {
    return (m && (m.poster || m.visual)) || null;
  }

  // -- image cache: current + next ONLY assigned a real src eagerly --------
  const loaded = new Set();
  function ensureLoaded(idx) {
    const m = monuments[idx];
    const src = stillFor(m);
    if (!m || !src || loaded.has(idx)) return;
    const probe = new Image();
    probe.decoding = "async";
    probe.src = src;
    loaded.add(idx);
  }

  // PHASE 2.7C.2 — video preload discipline, mirroring ensureLoaded()'s
  // "current + likely-next only" rule but one notch lighter for video: the
  // NEXT monument's clip only gets a metadata-only probe (browser resolves
  // duration/dimensions and opens the connection) — never a full body
  // download for a card the visitor has not actually selected yet. The
  // ACTIVE monument's clip is the only one ever fully requested/played
  // (see syncMedia()). A monument with no video or video_mode "static" is
  // a no-op here.
  const videoWarmed = new Set();
  function ensureVideoWarm(idx) {
    const m = monuments[idx];
    if (!m || !m.video || m.video_mode === "static" || videoWarmed.has(idx)) return;
    if (reducedMotion()) return; // never even probed — video is never used in this mode
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.muted = true;
    probe.src = m.video;
    videoWarmed.add(idx);
  }

  function isPriority(idx) {
    return idx === activeIdx || idx === (activeIdx + 1) % n;
  }

  // -- render one monument's static (non-transition) info -------------------
  function renderTabs() {
    tabs.forEach(({ tab, thumb, label }, i) => {
      const m = monuments[i];
      const lang = getLang();
      tab.classList.toggle("is-active", i === activeIdx);
      tab.setAttribute("aria-selected", i === activeIdx ? "true" : "false");
      label.textContent = String(i + 1).padStart(2, "0");
      thumb.style.backgroundImage = m.visual ? `url("${m.visual}")` : "none";
      thumb.classList.toggle("gallery__tab-thumb--empty", !m.visual);
      tab.classList.toggle("is-pending", !m.enabled);
      tab.title = pick(m.name, lang);
    });
  }

  function renderCta(m, lang) {
    ctaWrap.innerHTML = "";
    if (m.enabled && m.route) {
      const a = el("a", "gallery__cta gallery__cta--active", { href: m.route });
      a.textContent = pick(m.cta, lang);
      ctaWrap.appendChild(a);
    } else {
      // Explicitly NOT a link — an inert status affordance, never a dead
      // click target (hard constraint from the brief).
      const span = el("span", "gallery__cta gallery__cta--pending", { "aria-disabled": "true" });
      span.textContent = pick(m.cta, lang);
      ctaWrap.appendChild(span);
    }
  }

  function applyBg(url) {
    // Two-layer crossfade (a/b), same pattern as js/main.js's #stage
    // layerA/layerB — whichever layer is NOT current becomes the new
    // current and fades in; the old one fades out. This never mutates a
    // background that is mid-transition.
    const showingA = bgA.classList.contains("is-visible");
    const nextLayer = showingA ? bgB : bgA;
    const prevLayer = showingA ? bgA : bgB;
    nextLayer.style.backgroundImage = url ? `url("${url}")` : "none";
    nextLayer.classList.add("is-visible");
    prevLayer.classList.remove("is-visible");
  }

  function applyPanelImage(url) {
    const showingA = panelImgA.classList.contains("is-visible");
    const nextImg = showingA ? panelImgB : panelImgA;
    const prevImg = showingA ? panelImgA : panelImgB;
    if (url) {
      nextImg.src = url;
      nextImg.classList.add("is-visible");
      placeholder.classList.add("is-hidden");
    } else {
      nextImg.removeAttribute("src");
      nextImg.classList.remove("is-visible");
      placeholder.classList.remove("is-hidden");
    }
    prevImg.classList.remove("is-visible");
  }

  // PHASE 2.7C.2 — single-active-video media layer. Mirrors the discipline
  // already proven by STEINERNE_BRUECKE/js/museum25d.js's
  // syncLoopPlayback()/pauseAllMotionVideos() (same PATTERN: only ever one
  // clip playing, always paused/reset before a new one starts), but as an
  // independent implementation — this file does not import museum25d.js.
  // `mediaToken` guards every async callback (canplay/ended) against firing
  // for a monument the visitor has already navigated away from.
  let mediaToken = 0;
  let lastMediaId = null;

  // SINGLE-DECODER CANVAS MIRROR (owner-approved performance experiment) —
  // panelVideo is the ONE authoritative playback instance (unchanged, still
  // owned via video-playback.js's activate()/deactivate()). bgCanvas has NO
  // media ownership and NO independent playback of any kind: it is a plain
  // 2D canvas repainted from panelVideo's own decoded frames on a throttled
  // schedule, so there is only ever ONE video decoder for this card,
  // period. This replaces both the original two-<video> mirror (activate-d
  // background) and its immediate successor (a lightweight second <video>)
  // — a measured runtime diagnostic showed the cost was tied to having a
  // SECOND PLAYING VIDEO ELEMENT at all, not its resolution/bitrate, so the
  // only remaining way to keep the moving-background effect at one-decoder
  // cost is to source it from pixels already being decoded anyway.
  const CANVAS_W = 270, CANVAS_H = 480; // experimental backing resolution — see the owner's max 270x480 ceiling; blur(22px) hides the low native detail
  bgCanvas.width = CANVAS_W;
  bgCanvas.height = CANVAS_H;
  const bgCtx = bgCanvas.getContext("2d", { alpha: false });
  let canvasFps = 8; // tunable for local A/B testing (6/8/10); the shipped default lives here
  let canvasIntervalMs = 1000 / canvasFps;
  let lastDrawTime = 0;
  let canvasActive = false;
  let canvasVfcHandle = null;
  let canvasRafHandle = null;
  window.__ztCanvasDrawCount = 0; // debug-only counter, mirrors the project's existing ?debug=1 conventions
  window.__ztSetCanvasFps = (fps) => { canvasFps = fps; canvasIntervalMs = 1000 / fps; }; // debug-only tuning hook, same spirit

  function drawMirrorFrame() {
    if (panelVideo.paused || panelVideo.readyState < 2) return;
    const vw = panelVideo.videoWidth, vh = panelVideo.videoHeight;
    if (!vw || !vh) return;
    // object-fit:cover-equivalent crop math -- never stretches/distorts.
    const canvasAspect = CANVAS_W / CANVAS_H;
    const videoAspect = vw / vh;
    let sx, sy, sw, sh;
    if (videoAspect > canvasAspect) {
      sh = vh; sw = vh * canvasAspect; sx = (vw - sw) / 2; sy = 0;
    } else {
      sw = vw; sh = vw / canvasAspect; sx = 0; sy = (vh - sh) / 2;
    }
    bgCtx.drawImage(panelVideo, sx, sy, sw, sh, 0, 0, CANVAS_W, CANVAS_H);
    window.__ztCanvasDrawCount += 1;
  }

  function canvasTick() {
    if (!canvasActive) return;
    const now = performance.now();
    if (now - lastDrawTime >= canvasIntervalMs) {
      lastDrawTime = now;
      drawMirrorFrame();
    }
    scheduleCanvasTick();
  }
  function scheduleCanvasTick() {
    if (!canvasActive) return;
    // requestVideoFrameCallback (when available) only fires while the
    // source video actually has a new decoded frame -- cheaper and more
    // correct than a bare rAF loop, but the FPS throttle above still caps
    // the actual draw rate regardless of how often it fires.
    if (typeof panelVideo.requestVideoFrameCallback === "function") {
      canvasVfcHandle = panelVideo.requestVideoFrameCallback(canvasTick);
    } else {
      canvasRafHandle = requestAnimationFrame(canvasTick);
    }
  }
  function startCanvasMirror() {
    if (canvasActive || reducedMotion() || document.visibilityState === "hidden") return;
    canvasActive = true;
    lastDrawTime = 0;
    drawMirrorFrame(); // paint immediately -- never wait a full throttle interval for the first frame
    scheduleCanvasTick();
  }
  function stopCanvasMirror() {
    canvasActive = false;
    if (canvasVfcHandle && typeof panelVideo.cancelVideoFrameCallback === "function") {
      panelVideo.cancelVideoFrameCallback(canvasVfcHandle);
    }
    if (canvasRafHandle) cancelAnimationFrame(canvasRafHandle);
    canvasVfcHandle = null; canvasRafHandle = null;
  }
  panelVideo.addEventListener("play", startCanvasMirror);
  panelVideo.addEventListener("playing", startCanvasMirror);
  panelVideo.addEventListener("pause", stopCanvasMirror);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") stopCanvasMirror();
    else if (!panelVideo.paused) startCanvasMirror();
  });

  function stopMedia() {
    mediaToken += 1;
    deactivate(panelVideo);
    stopCanvasMirror();
    bgCanvas.classList.remove("is-visible");
    bgCtx.clearRect(0, 0, CANVAS_W, CANVAS_H); // never let a stale monument's frame linger under the next reveal
    panelVideo.loop = false;
    panelVideo.removeAttribute("src");
    try { panelVideo.load(); } catch (err) { /* ignore */ }
    panelVideo.classList.remove("is-visible");
  }

  function playClip(m, url, token) {
    if (token !== mediaToken || !url) return;
    panelVideo.src = url;
    const loopNative = m.video_mode !== "assembly_loop" || !m.video_reverse;
    panelVideo.loop = loopNative;

    const reveal = () => {
      if (token !== mediaToken) return;
      panelVideo.classList.add("is-visible");
      activate(panelVideo, { id: `gallery:${m.id}:panel`, role: "gallery-panel" });
      startCanvasMirror();
      bgCanvas.classList.add("is-visible"); // the immediate drawMirrorFrame() inside startCanvasMirror() already painted a real frame, so this never fades in over a blank/stale canvas
    };
    panelVideo.addEventListener("canplay", reveal, { once: true });

    if (!loopNative) {
      // Ping-pong chain: assembly <-> disassembly, per Section 5 option (b)
      // — this is the ONLY monument today (steinerne-bruecke) with a
      // `video_reverse`, giving the "complete -> transformation -> exploded
      // -> reassembly -> complete" grammar as a seamless, indefinitely
      // repeating loop for as long as this card stays active.
      const onEnded = () => {
        if (token !== mediaToken) return;
        const next = url === m.video ? m.video_reverse : m.video;
        playClip(m, next, token);
      };
      panelVideo.addEventListener("ended", onEnded, { once: true });
    }
  }

  function syncMedia(m) {
    stopMedia();
    const token = mediaToken;
    if (reducedMotion() || !m.video || m.video_mode === "static") return;
    playClip(m, m.video, token);
  }

  function render(direction) {
    const m = monuments[activeIdx];
    const lang = getLang();

    stage.classList.remove("is-shift-left", "is-shift-right");
    if (!reducedMotion() && direction) {
      stage.classList.add(direction > 0 ? "is-shift-left" : "is-shift-right");
      // eslint-disable-next-line no-unused-expressions
      void stage.offsetWidth; // restart the CSS transition deterministically
      stage.classList.remove("is-shift-left", "is-shift-right");
    }

    const still = stillFor(m);
    applyBg(still);
    applyPanelImage(still);
    // Only (re)start media when the ACTIVE monument itself actually changed
    // (goTo()) — refreshLang() also calls render(0) on every DE/EN/ES
    // switch, and a currently-playing clip must not restart/flash back to
    // its poster just because the visitor changed language mid-loop.
    if (lastMediaId !== m.id) {
      lastMediaId = m.id;
      syncMedia(m);
    }

    // PHASE 2.7C.2 — per-field choreography restart (see .gallery__field /
    // .gallery__panel.is-in in css/index.css): drop the class, force a
    // reflow, add it back, so every switch replays the same
    // counter -> subtitle -> name -> desc -> cta ladder rather than only
    // running once on first load. Toggled on `panel` (not `info`) since the
    // VISUAL LOCK moved ctaWrap out of .gallery__info to be `panel`'s own
    // direct child (see DOM scaffold above) — it must stay in this ladder.
    panel.classList.remove("is-in");

    counter.textContent = `${String(activeIdx + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`;
    eyebrow.textContent = pick(m.subtitle, lang);
    title.textContent = pick(m.name, lang);
    desc.textContent = pick(m.description, lang);
    renderCta(m, lang);
    renderTabs();

    // eslint-disable-next-line no-unused-expressions
    void panel.offsetWidth; // restart the CSS transition deterministically
    panel.classList.add("is-in");

    ensureLoaded(activeIdx);
    ensureLoaded((activeIdx + 1) % n);
    ensureVideoWarm((activeIdx + 1) % n);
  }

  function goTo(idx, direction) {
    const next = ((idx % n) + n) % n;
    if (next === activeIdx) return;
    const dir = direction !== undefined ? direction : (next > activeIdx ? 1 : -1);
    activeIdx = next;
    render(dir);
    if (typeof onSelect === "function") onSelect(monuments[activeIdx].id);
  }

  tabs.forEach(({ tab }, i) => {
    tab.addEventListener("click", () => goTo(i));
  });
  prevBtn.addEventListener("click", () => goTo(activeIdx - 1, -1));
  nextBtn.addEventListener("click", () => goTo(activeIdx + 1, 1));

  // Basic keyboard support (left/right) when the gallery has focus-within.
  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { goTo(activeIdx + 1, 1); }
    else if (e.key === "ArrowLeft") { goTo(activeIdx - 1, -1); }
  });

  // Minimal touch swipe (no library) — horizontal intent only.
  let touchStartX = null;
  stage.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener("touchend", (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) goTo(activeIdx + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    touchStartX = null;
  }, { passive: true });

  render(0);

  return {
    refreshLang() { render(0); },
    getActiveIndex: () => activeIdx,
    // PHASE 2.7C.1 — selection entry point for js/route-map.js: selecting a
    // map pin drives THIS existing gallery instead of a parallel selection
    // mechanism. No monument data is duplicated — the lookup is by id
    // against the SAME monuments[] array already loaded from
    // monuments.config.json above.
    selectById(id) {
      const idx = monuments.findIndex((m) => m.id === id);
      if (idx === -1) return false;
      goTo(idx);
      return true;
    },
    getMonumentIds: () => monuments.map((m) => m.id)
  };
}
