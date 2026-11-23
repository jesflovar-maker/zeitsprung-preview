// NEUPFARRPLATZ · JÜDISCHES VIERTEL — V1 (MASTER, Phase 07B). One vanilla ES module, DE / EN / ES, no external libraries.
// Grammar inherited from ALTES_RATHAUS (sticky 9:16 stage + one step per scroll segment, entry gate with thin line) and
// the 06G.2B.1 standards (scene safe area, shared zs-viewer, destination ending). Everything is vertical scroll-down.
// HISTORICAL_BRIEFING = PENDING: only visual-state labels (np-i18n.js), no dates. K09 = OWNER_APPROVED_VISUAL_KFRAME +
// GEOMETRY_REVIEW_PENDING (no geometry claims). Provisional anchor NP_ASSET_001, provisional trailer NP_ASSET_098 and the
// hero film NP_ASSET_058 are 1:1 replaceable through the constants below. Visible AI / reconstruction badges = 0.
import { STR, LANGS, STORAGE_KEY } from "./np-i18n.js?v=20261123c";
import { initGuide } from "../../js/zt-guide.js?v=20261123e"; // 07B.1: global Brückmandl guide
import { ztSound } from "../../js/zt-sound.js?v=20261119e";
import { openPhoto, openElement } from "../../js/zs-media-viewer.js";

const A = "../assets/neupfarrplatz/";
const img = (n) => `${A}img/${n}_720.webp`;
const full = (n) => `${A}img/${n}_full.webp`;
const ANCHOR = "np_anchor";                                   // NP_ASSET_001 (OWNER_APPROVED_PROVISIONAL_ANCHOR_HEUTE)
const HERO_SRC = `${A}video/np_hero_k10_720.mp4`;             // NP_ASSET_058 k10.mp4 (real audio, verified −23.8 dB mean)
const TL_SRC = `${A}video/np_timeline_540.mp4`;               // NP_ASSET_095 cropped 608:1080:656:0 → 540×960, silent track removed
const TL_POSTER = `${A}poster/np_timeline_poster.webp`;
const TL_HAS_AUDIO = false;                                   // digital silence in the master → no sound control (auto-enabled if a real-audio master replaces it)
// K cues re-measured on the runtime master (07B, frame-match onset of each K state, 8 fps)
const TL_CUE = [0, 11.0, 26.25, 36.5, 46.125, 59.875, 72.25, 87.375, 100.25, 105.875];
const TL_DUR = 116.375;
const TR_SRC = `${A}video/np_trailer_720.mp4`;                // NP_ASSET_098 triler.mp4 (OWNER_APPROVED_PROVISIONAL_TRAILER, 30 s, no audio)
const TR_POSTER = `${A}poster/np_trailer_poster.webp`;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;
if (reduced) root.classList.add("is-reduced");
const $ = (s, r = document) => r.querySelector(s);
const el = (t, c, a) => { const e = document.createElement(t); if (c) e.className = c; if (a) for (const k in a) e.setAttribute(k, a[k]); return e; };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const fmt = (s) => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
// video posters are fetched only when their section approaches (a poster attribute downloads immediately otherwise)
const lazyPoster = (v, url) => { new IntersectionObserver((es, io) => { if (es.some((e) => e.isIntersecting)) { v.setAttribute("poster", url); io.disconnect(); } }, { rootMargin: "150% 0px" }).observe(v); return v; };
const ZOOM = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

/* ---------- language: stored choice -> browser language -> DE ---------- */
let lang = "de";
try { const s = localStorage.getItem(STORAGE_KEY); if (LANGS.includes(s)) lang = s; else { const n = (navigator.language || "de").slice(0, 2).toLowerCase(); if (LANGS.includes(n)) lang = n; } } catch (e) {}
const T = () => STR[lang];
const LF = [];
const onLang = (fn) => { LF.push(fn); fn(); };
const bind = (node, get, attr) => { onLang(() => { const v = get(T()); if (attr) node.setAttribute(attr, v); else node.textContent = v; }); return node; };
function setLang(l) {
  if (!LANGS.includes(l) || l === lang) return; lang = l;
  try { localStorage.setItem(STORAGE_KEY, l); } catch (e) {}
  root.lang = l; LF.forEach((f) => f());
  document.querySelectorAll("#anLang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === l)));
}

/* ---------- shared scroll dispatcher (one rAF per frame) ---------- */
const SC = []; let raf = 0;
const run = () => { raf = 0; SC.forEach((f) => f()); };
addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(run); }, { passive: true });
addEventListener("resize", () => { if (!raf) raf = requestAnimationFrame(run); });
const prog = (tr) => { const r = tr.getBoundingClientRect(); const t = r.height - innerHeight; return t > 0 ? clamp(-r.top / t, 0, 1) : 0; };
const near = (node) => { const r = node.getBoundingClientRect(); return r.bottom > -innerHeight && r.top < innerHeight * 2; };
const head = (box, key) => { const e = el("p", "aeyebrow"); bind(e, (t) => t[key].eyebrow); const h = el("h2", "ah"); bind(h, (t) => t[key].h); box.append(e, h); };
const lead = (key, f) => { const p = el("p", "alead"); bind(p, (t) => t[key][f]); return p; };
const zoomBtn = (stage, current) => {
  const b = el("button", "nzoom", { type: "button" }); b.innerHTML = ZOOM; bind(b, (t) => t.zoom, "aria-label"); stage.append(b);
  const open = () => { const c = current(); if (c) openPhoto({ src: c.src, alt: c.alt }); };
  b.addEventListener("click", (e) => { e.stopPropagation(); open(); });
  stage.addEventListener("click", (e) => { if (!e.target.closest("button, a")) open(); });
  return b;
};

/* ---------- generic vertical scroll sequence: sticky 9:16 stage + one step per scroll segment ----------
   cfg: { sec, key, files: [image name | {v, poster, label}], vh, overlay (K mode) }
   Images: lazy 720 WebP on stage, the larger "full" WebP in the shared viewer. Loops play muted only while their step is shown. */
function buildSeq(cfg) {
  const s = $("#" + cfg.sec); const w = el("div", "awrap aseq__head ar"); head(w, cfg.key); if (STR.de[cfg.key].p) w.append(lead(cfg.key, "p")); s.append(w);
  const items = () => T()[cfg.key].items; const N = cfg.files.length; const K = !!cfg.overlay;
  const altOf = (i) => { const it = items()[i]; return K ? it.n + " · " + it.state + " — " + it.title : it[0] + " — " + it[1]; };
  const mkMedia = (f, i) => {
    if (typeof f === "string") { const im = el("img", "", { loading: "lazy", decoding: "async", src: img(f), width: "720", height: "1280" }); im.dataset.full = full(f); bind(im, () => altOf(i), "alt"); return im; }
    const v = el("video", "", { muted: "", loop: "", playsinline: "", preload: "none", disablepictureinpicture: "", tabindex: "-1" }); v.muted = true; v.dataset.src = f.v; lazyPoster(v, f.poster); bind(v, () => altOf(i), "aria-label"); return v;
  };
  if (reduced) {
    const list = el("div", "awrap aseq__static");
    cfg.files.forEach((f, i) => { const fig = el("figure", "aseq__fig"); const st = el("div", "astage"); const m = typeof f === "string" ? mkMedia(f, i) : el("img", "", { loading: "lazy", src: f.poster, alt: "" }); st.append(m);
      if (m.tagName === "IMG" && m.dataset.full) zoomBtn(st, () => ({ src: m.dataset.full, alt: m.alt }));
      const cap = el("figcaption"); const t = el("h3", "aseq__t"); const d = el("p", "aseq__d");
      onLang(() => { const it = items()[i]; t.textContent = K ? it.n + " · " + it.state : it[0]; d.textContent = K ? it.title + ". " + it.d : it[1]; }); cap.append(t, d); fig.append(st, cap); list.append(fig); });
    s.append(list); return;
  }
  const tr = el("div", "atrack aseq" + (K ? " nkf" : "")); tr.style.height = (N * (cfg.vh || 70) + 40) + "svh";
  const st = el("div", "asticky"); const wrap = el("div", "aseq__wrap"); const stage = el("div", "aseq__stage");
  const ims = cfg.files.map((f, i) => { const m = mkMedia(f, i); if (i) m.classList.add("is-off"); stage.append(m); return m; });
  const vids = ims.filter((m) => m.tagName === "VIDEO");
  const bar = el("div", "aseq__bar", { "aria-hidden": "true" }); const fill = el("span"); bar.append(fill); stage.append(bar);
  let ov = null, ok, op, os, ot;
  if (K) { ov = el("div", "nov zt-ov", { "aria-hidden": "true" }); ok = el("p", "zt-ov__k"); op = el("p", "zt-ov__p"); os = el("p", "zt-ov__s"); ot = el("p", "zt-ov__t"); ov.append(ok, op, os, ot); stage.append(ov); }
  const txt = el("div", "aseq__txt", { "aria-live": "polite" }); const k = el("p", "aseq__k"); const t = el("h3", "aseq__t"); const d = el("p", "aseq__d");
  let rail = null; if (K) { rail = el("div", "nkf__rail", { "aria-hidden": "true" }); for (let i = 0; i < N; i++) rail.append(el("i")); txt.append(rail, d); } else txt.append(k, t, d);
  wrap.append(stage, txt); st.append(wrap); tr.append(st); s.append(tr);
  let cur = -1;
  zoomBtn(stage, () => { const m = ims[cur]; return m && m.tagName === "IMG" ? { src: m.dataset.full, alt: m.alt } : null; });
  const zb = stage.querySelector(".nzoom");
  const paint = () => {
    const it = items()[cur];
    if (K) { ok.textContent = it.n + " / K" + String(N).padStart(2, "0"); op.textContent = it.period || ""; os.textContent = it.state; ot.textContent = it.title; d.textContent = it.d; [...rail.children].forEach((x, j) => x.classList.toggle("is-on", j <= cur)); }
    else { k.textContent = String(cur + 1).padStart(2, "0") + " / " + String(N).padStart(2, "0"); t.textContent = it[0]; d.textContent = it[1]; }
    zb.hidden = ims[cur].tagName !== "IMG";
  };
  const show = (i) => { if (i === cur) return; cur = i; ims.forEach((m, j) => m.classList.toggle("is-off", j !== i)); const anim = K ? ov : txt; anim.classList.remove("is-new"); void anim.offsetWidth; anim.classList.add("is-new"); paint(); };
  const onScreen = () => { const r = tr.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
  const syncV = () => { const live = onScreen(); vids.forEach((v) => { const on = live && ims[cur] === v; if (on && v.paused) { if (!v.getAttribute("src")) v.src = v.dataset.src; const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); } else if (!on && !v.paused) v.pause(); }); };
  LF.push(() => { if (cur >= 0) paint(); });
  show(0);
  SC.push(() => { if (!near(tr)) { if (vids.length) syncV(); return; } const p = prog(tr); fill.style.transform = "scaleX(" + p + ")"; show(clamp(Math.floor(p * N), 0, N - 1)); if (vids.length) syncV(); });
}

/* ---------- nav ---------- */
const NAV = ["heute", "viertel", "synagoge", "zeit", "film", "grundriss", "kirche", "misrach"];
function buildNav() {
  const links = $("#anLinks");
  NAV.forEach((id, i) => { const a = el("a", "", { href: "#" + id }); bind(a, (t) => t.navItems[i]); links.append(a); });
  onLang(() => { const b = $("#anBack"); b.textContent = T().back; b.dataset.short = T().backShort; $("#anLang").setAttribute("aria-label", T().langLabel); links.setAttribute("aria-label", T().nav); $("#aSkip").textContent = T().skip; });
  document.querySelectorAll("#anLang button").forEach((b) => { b.setAttribute("aria-pressed", String(b.dataset.lang === lang)); b.addEventListener("click", () => setLang(b.dataset.lang)); });
  // compact ♪: the hero film (NP_ASSET_058) has genuinely audible audio → one shared sound state; timeline + trailer are silent (no control)
  ztSound.mount($("#anLang"), () => T().snd); LF.push(() => ztSound.relabel());
  const bar = $("#aProg"); const an = $("#an");
  SC.push(() => {
    an.classList.toggle("is-solid", scrollY > 40);
    const h = root.scrollHeight - innerHeight; bar.style.transform = "scaleX(" + (h > 0 ? clamp(scrollY / h, 0, 1) : 0) + ")";
    let cur = ""; NAV.forEach((id) => { const s = document.getElementById(id); if (s && s.getBoundingClientRect().top <= innerHeight * 0.4) cur = id; });
    links.querySelectorAll("a").forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + cur)));
  });
}

/* ---------- entry: hero + gate (platform monument entry standard: one START, thin line, no percentage) ---------- */
function buildHero() {
  const im = el("img", "", { decoding: "async", src: img(ANCHOR), width: "720", height: "1280", fetchpriority: "high" }); bind(im, (t) => t.hero.alt, "alt");
  $("#heroStage").append(im); $("#heroBg").style.backgroundImage = `url(${img(ANCHOR)})`;
  bind($("#heroEyebrow"), (t) => t.hero.eyebrow); bind($("#heroTitle"), (t) => t.hero.title); bind($("#heroSub"), (t) => t.hero.sub); bind($("#heroTag"), (t) => t.hero.tag);
  const b = bind($("#startBtn"), (t) => t.hero.start); bind($("#heroAll"), (t) => t.hero.all);
  const go = () => $("#heute").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  let entering = false;
  const heroReady = new Promise((res) => { if (im.complete) return res(); ["load", "error"].forEach((ev) => im.addEventListener(ev, res, { once: true })); });
  const pageReady = new Promise((res) => { if (document.readyState === "complete") res(); else addEventListener("load", res, { once: true }); });
  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready.catch(() => {}) : Promise.resolve();
  if (!reduced) heroFilm(pageReady);
  const load = el("div", "aload", { "aria-hidden": "true" }); load.hidden = true; load.append(el("i")); document.body.append(load);
  const release = () => { root.classList.remove("is-loading", "is-gated"); root.classList.add("is-started"); load.classList.remove("is-on"); setTimeout(() => { load.hidden = true; }, 320); requestAnimationFrame(() => { run(); requestAnimationFrame(go); }); };
  b.addEventListener("click", () => {
    if (!root.classList.contains("is-gated")) { go(); return; }
    if (entering) return; entering = true; root.classList.add("is-loading"); load.hidden = false; requestAnimationFrame(() => load.classList.add("is-on"));
    const t0 = performance.now(); let done = false;
    const finish = () => { if (done) return; done = true; setTimeout(release, reduced ? 0 : Math.max(0, 450 - (performance.now() - t0))); };
    Promise.all([heroReady, pageReady, fontsReady]).then(finish, finish); setTimeout(finish, 5000);
  });
}
// hero film: plays once muted, holds its final frame, paused off screen; sound only through the compact ♪ (never audible autoplay)
function heroFilm(pageReady) {
  const stage = $("#heroStage");
  const v = el("video", "ahero__film", { muted: "", playsinline: "", preload: "none", poster: img(ANCHOR), disablepictureinpicture: "", tabindex: "-1" }); v.muted = true; bind(v, (t) => t.hero.videoAlt, "aria-label");
  stage.append(v);
  const play = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
  let vis = true;
  ztSound.add(v, { onEnable: () => { if (vis && v.getAttribute("src") && (v.ended || v.paused)) { if (v.ended) v.currentTime = 0; play(); } } });
  v.addEventListener("playing", () => v.classList.add("is-on"));
  v.addEventListener("error", () => v.remove());
  new IntersectionObserver((es) => es.forEach((e) => { vis = e.isIntersecting; if (!vis && !v.paused) v.pause(); else if (vis && v.paused && !v.ended && v.currentTime > 0) play(); }), { threshold: 0.25 }).observe(stage);
  pageReady.then(() => setTimeout(() => { if (!vis) return; v.src = HERO_SRC; play(); }, 250));
}

/* ---------- 01 today ---------- */
function buildNow() { const w = el("div", "awrap ar"); head(w, "now"); w.append(lead("now", "p1"), lead("now", "p2"), el("div", "anow__rule")); $("#heute").append(w); }

/* ---------- 06 timeline: chapter-controlled player (silent master) ---------- */
function buildTimeline() {
  const s = $("#film"); const w = el("div", "awrap ar"); head(w, "tl"); w.append(lead("tl", "p")); s.append(w);
  const kf = () => T().kf.items; const N = TL_CUE.length;
  const box = el("div", "awrap ntl__box");
  const stage = el("div", "ntl__stage");
  const v = el("video", "", { playsinline: "", preload: "none", disablepictureinpicture: "", controlslist: "nodownload noplaybackrate" }); v.muted = true; lazyPoster(v, TL_POSTER); bind(v, (t) => t.tl.alt, "aria-label");
  const big = el("button", "ntl__big", { type: "button" }); big.append(el("span")); bind(big, (t) => t.tl.play, "aria-label");
  const ov = el("div", "nov zt-ov", { "aria-hidden": "true" }); const ok = el("p", "zt-ov__k"); const op = el("p", "zt-ov__p"); const os = el("p", "zt-ov__s"); const ot = el("p", "zt-ov__t"); ov.append(ok, op, os, ot);
  const fsbar = el("div", "ntl__fsbar"); const fsPlay = el("button", "abtn abtn--sm", { type: "button" }); const fsExit = el("button", "abtn abtn--sm", { type: "button" }); fsbar.append(fsPlay, fsExit);
  stage.append(v, ov, big, fsbar);
  const panel = el("div", "ntl__panel");
  const hd = el("div", "ntl__head"); const hl = el("span"); const time = el("span"); hd.append(hl, time); bind(hl, (t) => t.tl.chapters);
  const bar = el("div", "ntl__bar", { role: "slider", tabindex: "0", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": "0" }); const fill = el("span", "ntl__fill"); const ticks = el("div", "ntl__ticks", { "aria-hidden": "true" });
  TL_CUE.forEach((c) => { const i = el("i"); i.style.left = (c / TL_DUR) * 100 + "%"; ticks.append(i); }); bar.append(ticks, fill); bind(bar, (t) => t.tl.seek, "aria-label");
  const chips = el("div", "ntl__chips", { role: "group" }); bind(chips, (t) => t.tl.chapters, "aria-label");
  const chipEls = TL_CUE.map((c, i) => { const b = el("button", "ntl__chip", { type: "button" }); b.textContent = "K" + String(i + 1).padStart(2, "0"); bind(b, () => { const it = kf()[i]; return it.n + " — " + it.state + ": " + it.title; }, "aria-label"); chips.append(b); return b; });
  const now = el("p", "ntl__now", { "aria-live": "polite" });
  const ctl = el("div", "ntl__ctl"); const bp = el("button", "abtn abtn--sm", { type: "button" }); const bf = el("button", "abtn abtn--sm", { type: "button" }); ctl.append(bp, bf);
  // sound control reserved by architecture: shown only when the master carries real audio (TL_HAS_AUDIO)
  if (TL_HAS_AUDIO) { ztSound.add(v); }
  panel.append(hd, bar, chips, now, ctl); box.append(stage, panel); s.append(box);
  let cur = -1, attached = false;
  const dur = () => (isFinite(v.duration) && v.duration > 0 ? v.duration : TL_DUR);
  const attach = () => { if (attached) return; attached = true; v.preload = "auto"; v.src = TL_SRC; };
  const play = () => { attach(); const p = v.play(); if (p && p.catch) p.catch(() => {}); };
  const chapterAt = (sec) => { let k = 0; TL_CUE.forEach((c, j) => { if (sec >= c - 0.01) k = j; }); return k; };
  const paintCh = () => { const it = kf()[cur]; ok.textContent = it.n + " / K" + String(N).padStart(2, "0"); op.textContent = it.period || ""; os.textContent = it.state; ot.textContent = it.title;
    now.replaceChildren(); const b = el("b"); b.textContent = it.n + " · " + it.state + " — "; now.append(b, document.createTextNode(it.title + ". " + it.d)); chipEls.forEach((c, j) => c.setAttribute("aria-current", String(j === cur))); };
  const setCh = (k) => { if (k === cur) return; cur = k; ov.classList.remove("is-new"); void ov.offsetWidth; ov.classList.add("is-new"); paintCh(); };
  const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
  const isFs = () => fsEl() === stage || stage.classList.contains("is-pfs");
  const labels = () => { const l = v.paused ? T().tl.play : T().tl.pause; bp.textContent = l; fsPlay.textContent = l; bf.textContent = isFs() ? T().tl.fullExit : T().tl.full; fsExit.textContent = T().tl.fullExit; };
  const prog_ = () => { const d = dur(), c = v.currentTime || 0; fill.style.transform = "scaleX(" + (d ? Math.min(1, c / d) : 0) + ")"; bar.setAttribute("aria-valuenow", String(Math.round((d ? c / d : 0) * 100))); bar.setAttribute("aria-valuetext", fmt(c) + " / " + fmt(d)); time.textContent = fmt(c) + " / " + fmt(d); };
  const seek = (sec) => { attach(); sec = clamp(sec, 0, Math.max(0, dur() - 0.2)); const doSeek = () => { try { v.currentTime = sec; } catch (e) {} }; if (v.readyState >= 1) doSeek(); else v.addEventListener("loadedmetadata", doSeek, { once: true }); setCh(chapterAt(sec)); fill.style.transform = "scaleX(" + sec / dur() + ")"; time.textContent = fmt(sec) + " / " + fmt(dur()); };
  const toggle = () => { if (v.paused) play(); else v.pause(); };
  bp.addEventListener("click", toggle); big.addEventListener("click", toggle); fsPlay.addEventListener("click", toggle); v.addEventListener("click", toggle);
  chipEls.forEach((b, i) => b.addEventListener("click", () => { seek(TL_CUE[i] + 0.05); play(); }));
  bar.addEventListener("click", (e) => { const r = bar.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * dur()); });
  bar.addEventListener("keydown", (e) => { const c = v.currentTime || 0; if (e.key === "ArrowRight") { e.preventDefault(); seek(c + 5); } else if (e.key === "ArrowLeft") { e.preventDefault(); seek(c - 5); } else if (e.key === "Home") { e.preventDefault(); seek(0); } });
  // native element fullscreen first; when the browser refuses or lacks it (e.g. iPhone), a fixed full-viewport layer keeps
  // video + localized overlay + controls together (never the overlay-less native video player)
  const onKey = (e) => { if (e.key === "Escape") exitFs(); };
  const pseudo = (on) => { stage.classList.toggle("is-pfs", on); root.classList.toggle("np-pfs", on); if (on) document.addEventListener("keydown", onKey); else document.removeEventListener("keydown", onKey); labels(); };
  const enterFs = () => { const req = stage.requestFullscreen || stage.webkitRequestFullscreen; if (!req) { pseudo(true); return; }
    const fb = () => { if (fsEl() !== stage && !stage.classList.contains("is-pfs")) pseudo(true); };
    try { const r = req.call(stage); if (r && r.catch) r.catch(fb); } catch (e) { fb(); } setTimeout(fb, 700); };
  const exitFs = () => { if (stage.classList.contains("is-pfs")) { pseudo(false); return; } if (document.exitFullscreen) document.exitFullscreen().catch(() => {}); else if (document.webkitExitFullscreen) document.webkitExitFullscreen(); };
  bf.addEventListener("click", () => { if (isFs()) exitFs(); else enterFs(); });
  fsExit.addEventListener("click", exitFs);
  ["fullscreenchange", "webkitfullscreenchange"].forEach((ev) => document.addEventListener(ev, labels));
  v.addEventListener("play", () => { stage.classList.add("is-playing"); labels(); });
  v.addEventListener("pause", () => { stage.classList.remove("is-playing"); labels(); });
  v.addEventListener("ended", () => { stage.classList.remove("is-playing"); labels(); });
  v.addEventListener("timeupdate", () => { prog_(); setCh(chapterAt(v.currentTime || 0)); });
  v.addEventListener("loadedmetadata", prog_);
  new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting && !v.paused && !isFs()) v.pause(); }), { threshold: 0 }).observe(stage);
  LF.push(() => { if (cur >= 0) paintCh(); labels(); });
  setCh(0); labels(); prog_();
}

/* ---------- 12 present-day return ---------- */
function buildReturn() {
  const s = $("#rueckkehr"); const w = el("div", "awrap ar"); head(w, "ret"); w.append(lead("ret", "p"));
  const st = el("div", "astage"); const im = el("img", "", { loading: "lazy", decoding: "async", src: img(ANCHOR), width: "720", height: "1280" }); bind(im, (t) => t.hero.alt, "alt"); st.append(im);
  zoomBtn(st, () => ({ src: full(ANCHOR), alt: im.alt })); w.append(st); s.append(w);
}

/* ---------- 13 trailer: provisional silent 30 s master, plays on view, pauses off screen, replays on re-entry ---------- */
function buildTrailer() {
  const s = $("#trailer"); const w = el("div", "awrap ar"); head(w, "tr"); w.append(lead("tr", "p"));
  const st = el("div", "ntr__film"); const po = el("img", "", { loading: "lazy", decoding: "async", src: TR_POSTER, alt: "" }); st.append(po);
  const ov = el("div", "ntr__ov zt-ov", { "aria-hidden": "true" }); const l1 = el("p", "zt-ov__k"); const l2 = el("p", "zt-ov__s"); const l3 = el("p", "zt-ov__p"); const ln = el("p", "zt-ov__t");
  bind(l1, (t) => t.tr.l1); bind(l2, (t) => t.tr.l2); bind(l3, (t) => t.tr.l3); bind(ln, (t) => t.tr.line); ov.append(l1, l2, l3, ln);
  w.append(st); s.append(w);
  if (reduced) { st.append(ov); return; }
  const v = el("video", "", { muted: "", playsinline: "", preload: "none", disablepictureinpicture: "", tabindex: "-1" }); v.muted = true; bind(v, (t) => t.tr.alt, "aria-label"); // poster = the lazy <img> underneath
  st.append(v, ov);
  const play = () => { if (!v.getAttribute("src")) v.src = TR_SRC; const p = v.play(); if (p && p.catch) p.catch(() => {}); };
  v.addEventListener("playing", () => st.classList.add("is-playing"));
  v.addEventListener("ended", () => { st.classList.remove("is-playing"); v.dataset.done = "1"; });
  v.addEventListener("error", () => { st.classList.remove("is-playing"); v.remove(); });
  new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { if (v.dataset.done) { delete v.dataset.done; try { v.currentTime = 0; } catch (x) {} } play(); } else if (!v.paused) v.pause(); }), { threshold: 0.55 }).observe(st);
}
function openTrailerViewer() {
  const fr = el("div", "ntrv"); const v = el("video", "", { muted: "", playsinline: "", preload: "auto", poster: TR_POSTER, disablepictureinpicture: "" }); v.muted = true; v.src = TR_SRC; fr.append(v);
  v.addEventListener("click", () => { if (v.paused) { const p = v.play(); if (p && p.catch) p.catch(() => {}); } else v.pause(); });
  document.body.append(fr);
  openElement(fr, { onClose: () => { v.pause(); v.removeAttribute("src"); try { v.load(); } catch (e) {} fr.remove(); } });
  const p = v.play(); if (p && p.catch) p.catch(() => {});
}

/* ---------- 14 destination ending (routes from monuments.config.json; never this monument) ---------- */
const SELF = "neupfarrplatz";
const ORDER = ["steinerne-bruecke", "dom-st-peter", "porta-praetoria", "altes-rathaus"];
const LABEL = { "steinerne-bruecke": "STEINERNE BRÜCKE", "dom-st-peter": "DOM ST. PETER", "porta-praetoria": "PORTA PRAETORIA", "altes-rathaus": "ALTES RATHAUS" };
const FALLBACK = { "steinerne-bruecke": "STEINERNE_BRUECKE/index.html", "dom-st-peter": "DOM_ST_PETER/index.html", "porta-praetoria": "PORTA_PRAETORIA/index.html", "altes-rathaus": "ALTES_RATHAUS_REICHSSAAL/index.html" };
function buildEnd() {
  const s = $("#ende"); const inn = el("div", "nend__in");
  const copy = el("div"); copy.append(el("span", "nend__rule", { "aria-hidden": "true" }));
  const eb = el("p", "nend__eyebrow"); eb.textContent = "ZEITSPRUNG"; const h = el("h2", "nend__title"); bind(h, (t) => t.end.title); const p = el("p", "nend__text"); bind(p, (t) => t.end.text);
  const all = el("a", "nend__primary", { href: "../index.html#index-monuments" }); bind(all, (t) => t.end.all); copy.append(eb, h, p, all);
  const more = el("div"); const lb = el("p", "nend__label"); bind(lb, (t) => t.end.next); const dest = el("nav", "nend__dest"); bind(dest, (t) => t.end.next, "aria-label");
  const draw = (list) => { dest.replaceChildren(...list.map((id) => { const a = el("a", "nend__btn", { href: "../" + (FALLBACK[id]) }); a.dataset.mid = id; a.textContent = LABEL[id]; return a; })); };
  draw(ORDER);
  fetch("../monuments.config.json", { cache: "no-cache" }).then((r) => (r.ok ? r.json() : null)).then((cfg) => {
    const ms = cfg && Array.isArray(cfg.monuments) ? cfg.monuments : null; if (!ms) return;
    const live = ORDER.filter((id) => { const m = ms.find((x) => x.id === id); if (m && m.route) FALLBACK[id] = String(m.route).replace(/^\/+/, ""); return m && m.enabled === true && m.route && id !== SELF; });
    if (live.length) draw(live);
  }).catch(() => {});
  const trb = el("button", "nend__trailer", { type: "button" }); trb.append(el("i", "", { "aria-hidden": "true" })); const trl = el("span"); bind(trl, (t) => t.end.trailer); trb.append(trl); trb.addEventListener("click", openTrailerViewer);
  more.append(lb, dest, trb); inn.append(copy, more); s.append(inn);
}

function reveal() { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { threshold: 0.12 }); document.querySelectorAll(".ar").forEach((n) => io.observe(n)); }
// shared viewer open → page scroll locked (class set by zs-media-viewer)
try { history.scrollRestoration = "manual"; } catch (e) {}
root.lang = lang;
buildNav(); buildHero(); buildNow();
buildSeq({ sec: "viertel", key: "quarter", files: ["np_q_north_entrance", "np_q_lane", "np_q_houses"] });                     // NP 016 / 006 / 090
buildSeq({ sec: "alltag", key: "people", files: ["np_p_study", "np_p_pottery", "np_p_carpentry", "np_p_masons"] });               // NP 017 / 011 / 010 / 096
buildSeq({ sec: "synagoge", key: "syn", vh: 60, files: ["np_s_three_pillars", "np_s_interior", "np_s_vaults", "np_s_hall_bimah", "np_s_bimah", "np_s_ark", "np_s_window", "np_s_oculus", "np_s_bimah_detail"] }); // NP 097/086/083/032/004/002/100/101/036
buildSeq({ sec: "zeit", key: "kf", overlay: true, vh: 75, files: ["np_k01", "np_k02", "np_k03", "np_k04", "np_k05", "np_k06", "np_k07", "np_k08", "np_k09", "np_k10"] }); // NP 041…059 (K09 owner-approved)
buildTimeline();                                                                                                                     // NP 095
buildSeq({ sec: "grundriss", key: "plan", vh: 55, files: ["np_2d_01", "np_2d_02", "np_2d_03", "np_2d_04", "np_2d_05", "np_2d_06", "np_2d_07", "np_2d_08"] }); // NP 025/026/073/028/029/027/031/030
buildSeq({ sec: "licht", key: "holo", files: ["np_h_cutaway", "np_h_interior", "np_h_square", "np_h_capital", "np_h_column"] });   // NP 085/084/015/008/012
buildSeq({ sec: "kirche", key: "church", files: ["np_c_model_east", "np_c_model_apse", "np_c_holo", "np_c_interior", "np_c_organ"] }); // NP 063/068/075/034/076
buildSeq({ sec: "archaeologie", key: "arch", files: [{ v: `${A}video/np_arch_trans_540.mp4`, poster: `${A}poster/np_arch_trans_poster.webp` }, "np_k08", "np_k08_hr"] }); // NP 020 / 055 (K08 canonical) / 019 (high-res support)
buildSeq({ sec: "misrach", key: "mis", files: [{ v: `${A}video/np_misrach_trans_540.mp4`, poster: `${A}poster/np_misrach_trans_poster.webp` }, "np_k09", "np_k10"] }); // NP 056 / 057 (K09 required) / 059
buildReturn(); buildTrailer(); buildEnd(); reveal(); initGuide({ monument: "neupfarrplatz" });
requestAnimationFrame(run);
