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
import { initViewer3D } from "./viewer3d.js";

const ASSET_BASE = "./assets";

// ---------------------------------------------------------------------------
// 9-state historical sequence — real classified assets from ASSET_MANIFEST.md
// ---------------------------------------------------------------------------
const STATES = [
  {
    key: "today-open",
    img: `${ASSET_BASE}/images/ChatGPT Image 16. Aug. 2026, 23_59_19 (9).png`
  },
  {
    key: "before",
    img: `${ASSET_BASE}/images/ChatGPT Image 16. Aug. 2026, 23_59_15 (1).png`
  },
  {
    key: "foundation",
    img: `${ASSET_BASE}/images/ChatGPT Image 16. Aug. 2026, 22_26_31 (4).png`
  },
  {
    key: "piers",
    img: `${ASSET_BASE}/images/ChatGPT Image 17. Aug. 2026, 00_00_04 (1).png`
  },
  {
    key: "arches",
    img: `${ASSET_BASE}/images/ChatGPT Image 16. Aug. 2026, 22_26_33 (8).png`
  },
  {
    key: "medieval",
    img: `${ASSET_BASE}/images/ChatGPT Image 16. Aug. 2026, 22_26_31 (3).png`
  },
  {
    key: "transform19c",
    img: `${ASSET_BASE}/images/ChatGPT Image 16. Aug. 2026, 23_59_16 (4).png`
  },
  {
    key: "restoration",
    img: `${ASSET_BASE}/images/ChatGPT Image 16. Aug. 2026, 23_59_18 (8).png`
  },
  {
    key: "today-close",
    img: `${ASSET_BASE}/images/ChatGPT Image 23. Aug. 2026, 15_21_40.png`
  }
];

const VIDEO_PATH = `${ASSET_BASE}/video/fpv video szernernebrücke.mov`;

let lang = getInitialLang();

// ---------------------------------------------------------------------------
// Bootstrapping
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  applyI18n(lang);
  populateLangButtons();
  renderStageCaptionShell();
  renderFacts();
  wireIntroGate();
});

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
      const introStartBtn = document.getElementById("introStartBtn");
      if (introStartBtn) introStartBtn.textContent = t(lang, "introStart");
    });
  });
}

// ---------------------------------------------------------------------------
// Intro gate
// ---------------------------------------------------------------------------
let soundEnabled = false;

function wireIntroGate() {
  const soundToggle = document.getElementById("introSoundToggle");
  const soundLabel = document.getElementById("introSoundLabel");
  soundLabel.textContent = t(lang, "introSoundOff");
  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundToggle.classList.toggle("is-on", soundEnabled);
    soundLabel.textContent = t(lang, soundEnabled ? "introSoundOn" : "introSoundOff");
    // Reserved for future audio support — no audio asset is wired in yet.
  });

  const startBtn = document.getElementById("introStartBtn");
  startBtn.addEventListener("click", () => {
    startBtn.disabled = true;
    startExperience();
  });
}

function startExperience() {
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
  buildVideoChapter();
  wireThreeDChapter();
  wireNav(lenis);

  // Reveal nav + scroll hint
  gsap.to(".navbar", { autoAlpha: 1, y: 0, duration: 0.6, delay: 0.1 });
  gsap.to(".scroll-hint", { autoAlpha: 1, duration: 0.6, delay: 0.4 });

  ScrollTrigger.refresh();
}

function buildStageScrollTrigger() {
  const stage = document.getElementById("stage");
  const layerA = document.querySelector(".stage__bg-layer--a");
  const layerB = document.querySelector(".stage__bg-layer--b");
  layerA.style.backgroundImage = `url("${encodeURI(STATES[0].img)}")`;
  layerA.style.opacity = "1";
  layerB.style.backgroundImage = `url("${encodeURI(STATES[1] ? STATES[1].img : STATES[0].img)}")`;
  layerB.style.opacity = "0";

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
      toLayer.style.backgroundImage = `url("${encodeURI(STATES[nextIdx].img)}")`;

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

  ScrollTrigger.create({
    trigger: section,
    start: "top 60%",
    end: "bottom 40%",
    onEnter: () => video.play().catch(() => {}),
    onEnterBack: () => video.play().catch(() => {}),
    onLeave: () => video.pause(),
    onLeaveBack: () => video.pause()
  });
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
