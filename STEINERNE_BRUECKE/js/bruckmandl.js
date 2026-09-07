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

   AI GUIDE — CLOSED INTERACTIVE DEMO (this phase)
   -------------------------------------------------------
     - renderAssistant() now renders a small, CLOSED interactive prototype:
       a WELCOME->IDLE entry sequence, a fixed panel of 8 pre-written
       questions, and — on selection — a TALK/POINT pose plus one
       pre-written answer. This is NOT an open chatbot: no external AI API,
       no free-form generation, no state persisted beyond the current DOM
       (a language switch fully re-renders and resets it). Every answer is
       a direct paraphrase of this file's own already-approved i18n content
       (see js/i18n.js's bruckmandlAiQA) — no new historical claim is
       introduced, and NEEDS_REVIEW material (current figure's material,
       heraldic shield identity) is always presented as unresolved, never
       as fact.
     - no tap-to-enlarge for cutouts/materials — no lightbox component
       exists anywhere in this codebase yet (confirmed by search), and the
       brief explicitly says to leave enlargement out rather than invent one
     - no read or write of monuments.config.json's featureFlags.brueckmandl
     - no wiring into museum25d.js's HOTSPOTS extension point
     - no historical claim beyond what
       02_CONTENT/Steinerne_Bruecke/SOURCES/CLAIM_SOURCE_MAP.json already
       registers as SUPPORTED, or (for the legend/interpretation content)
       what it registers under content_type: LEGEND / INTERPRETATION — every
       string used here lives in js/i18n.js's bruckmandl* keys, sourced from
       the already-committed 02_CONTENT/Steinerne_Bruecke/Bruckmandl/*
       content files, never invented in this render layer
   ============================================================================ */

import { STEINERNE_BRUCKMANDL_ASSET_BASE, STEINERNE_SOURCES_URL } from "../../js/zt-paths.js";

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

function renderHero(container, assets) {
  const hero = el("div", "bruckmandl__hero");
  const img = el("img", "bruckmandl__hero-img", { alt: "", draggable: "false" });
  img.src = assets.hero.url;
  hero.appendChild(img);
  container.appendChild(hero);
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

function renderGallery(container, assets, t, lang) {
  container.appendChild(el("p", "bruckmandl__section-label")).textContent = t(lang, "bruckmandlGalleryLabel");
  const gallery = el("div", "bruckmandl__gallery");
  const track = el("div", "bruckmandl__gallery-track");
  assets.gallery.forEach((view) => {
    const card = el("div", "bruckmandl__gallery-card");
    const img = el("img", null, { alt: t(lang, view.labelKey) || "", draggable: "false" });
    img.src = view.url;
    card.appendChild(img);
    track.appendChild(card);
  });
  gallery.appendChild(track);
  container.appendChild(gallery);
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

function renderMediaStrip(container, labelKey, assets, labelMapKey, t, lang) {
  container.appendChild(el("p", "bruckmandl__section-label")).textContent = t(lang, labelKey);
  const strip = el("div", "bruckmandl__media-strip");
  const labelMap = t(lang, labelMapKey) || {};
  assets.forEach((item) => {
    const card = el("div", "bruckmandl__media-card");
    const img = el("img", null, { alt: labelMap[item.id] || "", draggable: "false" });
    img.src = item.url;
    card.appendChild(img);
    card.appendChild(el("p", "bruckmandl__media-card-label")).textContent = labelMap[item.id] || "";
    strip.appendChild(card);
  });
  container.appendChild(strip);
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

// ---------------------------------------------------------------------------
// AI GUIDE — CLOSED INTERACTIVE DEMO (owner-approved). NOT an open chatbot:
// no external API, no free-form generation — a fixed set of 8 questions,
// each mapped to ONE pre-written answer paraphrased directly from this
// file's already-approved i18n content (bruckmandlFactPoints/
// bruckmandlHistory for SUPPORTED claims, bruckmandlLegendText for the
// registered LEGEND, bruckmandlUncertainPoints for the registered
// NEEDS_REVIEW material/heraldic-identity points). See js/i18n.js's
// bruckmandlAiQA array for the exact per-language text.
//
// AI_QA_POSE_BY_INDEX / AI_QA_STATUS_BY_INDEX are BEHAVIORAL, not
// linguistic — same 8 entries in every language, so they live here rather
// than being repeated 3x in i18n.js. status codes are internal (never
// user-facing strings) and render as small badges reusing the exact same
// fact/legend/uncertain color language already established by
// .bruckmandl__factcheck-column--fact/--legend/--uncertain.
// ---------------------------------------------------------------------------
const AI_QA_POSE_BY_INDEX = ["talk", "talk", "point", "talk", "talk", "talk", "talk", "point"];
const AI_QA_STATUS_BY_INDEX = [
  ["fact"],
  ["fact"],
  ["fact"],
  ["fact", "legend"],
  ["legend"],
  ["fact"],
  ["fact", "uncertain"],
  ["uncertain"]
];
const AI_STATUS_LABEL_KEY = { fact: "bruckmandlStatusFact", legend: "bruckmandlLegendLabel", uncertain: "bruckmandlStatusUncertain" };
const AI_POSE_ALT_KEY = { welcome: "bruckmandlAiWelcomeAlt", idle: "bruckmandlAiIdleAlt", point: "bruckmandlAiPointAlt", talk: "bruckmandlAiTalkAlt" };

function prefersReducedMotion() {
  return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
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

function renderAssistant(container, assets, t, lang) {
  const reduced = prefersReducedMotion();

  // Preload all 4 poses once so a later pose switch never shows a blank/
  // half-loaded frame during the crossfade.
  ["welcome", "idle", "point", "talk"].forEach((pose) => {
    const preload = new Image();
    preload.src = assets.ai[pose];
  });

  const wrap = el("div", "bruckmandl__assistant");

  const stage = el("div", "bruckmandl__ai-stage");
  const img = el("img", "bruckmandl__ai-img", { alt: t(lang, "bruckmandlAiWelcomeAlt") || "", draggable: "false" });
  img.src = assets.ai.welcome;
  stage.appendChild(img);
  wrap.appendChild(stage);

  function setPose(poseKey) {
    const alt = t(lang, AI_POSE_ALT_KEY[poseKey]) || "";
    if (reduced) {
      img.src = assets.ai[poseKey];
      img.alt = alt;
      return;
    }
    img.classList.add("is-fading");
    aiScheduleTimer(() => {
      img.src = assets.ai[poseKey];
      img.alt = alt;
      img.classList.remove("is-fading");
    }, 220);
  }

  // Entry sequence: WELCOME for a short moment, then settle into IDLE.
  aiScheduleTimer(() => setPose("idle"), reduced ? 0 : 1600);

  const panel = el("div", "bruckmandl__ai-panel");
  panel.appendChild(el("p", "bruckmandl__ai-heading")).textContent = t(lang, "bruckmandlAiHeading");

  const qWrap = el("div", "bruckmandl__ai-questions", { role: "group", "aria-label": t(lang, "bruckmandlAiHeading") || "" });
  const answerWrap = el("div", "bruckmandl__ai-answer", { "aria-live": "polite" });
  answerWrap.hidden = true;
  const statusRow = el("div", "bruckmandl__ai-answer-status");
  const answerText = el("p", "bruckmandl__ai-answer-text");
  answerWrap.appendChild(statusRow);
  answerWrap.appendChild(answerText);

  const qa = t(lang, "bruckmandlAiQA") || [];
  const buttons = [];

  qa.forEach((item, i) => {
    const btn = el("button", "bruckmandl__ai-question-btn", { type: "button", "aria-pressed": "false" });
    btn.textContent = item.question;
    btn.addEventListener("click", () => {
      buttons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", active ? "true" : "false");
      });

      const pose = AI_QA_POSE_BY_INDEX[i] || "talk";
      setPose(pose);

      statusRow.innerHTML = "";
      (AI_QA_STATUS_BY_INDEX[i] || []).forEach((code) => {
        const badge = el("span", `bruckmandl__ai-status-badge bruckmandl__ai-status-badge--${code}`);
        badge.textContent = t(lang, AI_STATUS_LABEL_KEY[code]) || "";
        statusRow.appendChild(badge);
      });
      answerText.textContent = item.answer;
      answerWrap.hidden = false;

      // Return to IDLE after the answer has had time to be read, while the
      // answer card itself stays visible — the visitor can pick another
      // question at any point, this only rests the character's pose.
      aiScheduleTimer(() => setPose("idle"), 2400);
    });
    buttons.push(btn);
    qWrap.appendChild(btn);
  });

  panel.appendChild(qWrap);
  panel.appendChild(answerWrap);
  wrap.appendChild(panel);
  container.appendChild(wrap);
}

function render(inner, assets, sourcesMap, t, getLang) {
  const lang = getLang();
  aiClearTimers();
  inner.innerHTML = "";
  renderIntro(inner, t, lang);
  renderHero(inner, assets);
  // TEMPORARY PUBLICATION FIX (2026-09-07): video block hidden until a
  // better replacement video is uploaded. renderVideo() itself is untouched
  // below — restore by uncommenting the next line.
  // renderVideo(inner, assets, t, lang);
  renderGallery(inner, assets, t, lang);
  renderHistory(inner, t, lang);
  renderLegend(inner, t, lang);
  renderFactcheck(inner, t, lang);
  renderMediaStrip(inner, "bruckmandlMaterialsLabel", assets.materials, "bruckmandlMaterialLabels", t, lang);
  renderMediaStrip(inner, "bruckmandlCutoutsLabel", assets.cutouts, "bruckmandlCutoutLabels", t, lang);
  renderSources(inner, t, lang, sourcesMap);
  renderAssistant(inner, assets, t, lang);
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

  render(inner, assets, sourcesMap, t, getLang);

  return {
    refreshLabels() {
      render(inner, assets, sourcesMap, t, getLang);
    }
  };
}
