// PORTA PRAETORIA · CASTRA REGINA — PUBLIC V1: one vanilla ES module, DE / EN / ES, no external libraries.
// The DOM is built ONCE; a language switch only re-runs text refreshers (no rebuild, no new listeners / observers / timers).
// Media: runtime derivatives only (../assets/porta-praetoria/). One video plays at a time; every video loads lazily (preload none + poster).
import { STR, LANGS, STORAGE_KEY } from "./porta-i18n.js?v=20261124a";
import { initGuide } from "../../js/zt-guide.js?v=20261125e"; // 07B.1: global Brückmandl guide (one engine, data from ZEITSPRUNG_GLOBAL_GUIDE_V1)
import { mountDestinations } from "../../js/zt-destinations.js?v=20261123c"; // 07B.1: direct links to every other active monument (monuments.config.json)

import { ztSound } from "../../js/zt-sound.js?v=20261124a";
import { mountSources, goToSources } from "../../js/zt-sources.js?v=20261125d"; // 07D: one bibliography per page
import { mountFilm, ztSoundAdapter } from "../../js/zt-film.js?v=20261125f"; // 07C-H: shared film player (trailer slot)
/* 07C-H TRAILER SLOT — same architecture as the other monuments, NOT public yet: the corrected final trailer
   PP_TRAILER_MASTER_CLEAN_V1 is DEFERRED (owner). When approved, set { src, poster, duration, hasAudio } here — the
   section (#trailer before the ending) is then created automatically; no redesign. */
const PP_TRAILER = null;
function buildTrailerSlot() {
  if (!PP_TRAILER) return;
  const end = document.getElementById("quellen"); if (!end) return;
  const s = document.createElement("section"); s.id = "trailer"; s.className = "psec ptrailer-sec"; s.setAttribute("aria-label", "Trailer"); end.before(s);
  mountFilm(s, { mode: "trailer", ...PP_TRAILER, sound: ztSoundAdapter(ztSound),
    head: () => ({ e: T().tr.eyebrow, h: T().tr.h, p: T().tr.p }),
    titleCard: () => ({ k: "ZEITSPRUNG", n: T().tr.l2, s: T().tr.l3, l: T().tr.line }),
    label: () => T().tr.eyebrow, alt: () => T().tr.alt });
} // 06G: compact ♪ beside DE | EN | ES (no in-panel sound button)

const A = "../assets/porta-praetoria/";
const img = (n, w = 720) => `${A}img/${n}_${w}.webp`;
const vsrc = (n) => `${A}video/pp_${n}_540.mp4`;
const vposter = (n) => `${A}poster/pp_${n}_poster.webp`;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;
if (reduced) root.classList.add("is-reduced");
const $ = (s, r = document) => r.querySelector(s);
const el = (t, c, a) => { const e = document.createElement(t); if (c) e.className = c; if (a) for (const k in a) e.setAttribute(k, a[k]); return e; };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const fmt = (s) => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };

/* ---------- language (platform convention: stored choice -> browser language -> DE) ---------- */
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
  document.querySelectorAll("#pnLang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === l)));
}

/* ---------- one shared scroll / resize dispatcher ---------- */
const SC = []; let scRaf = 0;
const runSC = () => { scRaf = 0; SC.forEach((f) => f()); };
addEventListener("scroll", () => { if (!scRaf) scRaf = requestAnimationFrame(runSC); }, { passive: true });
addEventListener("resize", () => { if (!scRaf) scRaf = requestAnimationFrame(runSC); });
const prog = (track) => { const r = track.getBoundingClientRect(); const total = r.height - innerHeight; return total > 0 ? clamp(-r.top / total, 0, 1) : 0; };

/* ---------- video manager: lazy src, one video at a time, pause offscreen / hidden tab ---------- */
const VM = {
  cur: null,
  ensure(v) { if (!v.getAttribute("src") && v.dataset.src) { v.preload = "metadata"; v.src = v.dataset.src; } },
  play(v) { this.ensure(v); const p = v.play(); if (p && p.catch) p.catch(() => {}); },
  register(v, kind, auto) {
    v.dataset.kind = kind; v.dataset.auto = auto ? "1" : "0";
    v.addEventListener("play", () => { if (this.cur && this.cur !== v && !this.cur.paused) this.cur.pause(); this.cur = v; });
    ioLoad.observe(v); ioPlay.observe(v);
  },
};
const ioLoad = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { VM.ensure(e.target); ioLoad.unobserve(e.target); } }), { rootMargin: "80% 0px" });
const ioPlay = new IntersectionObserver((es) => es.forEach((e) => {
  const v = e.target; const vis = e.isIntersecting && e.intersectionRatio >= (v.dataset.kind === "main" ? 0.25 : 0.5);
  if (!vis) { if (!v.paused) v.pause(); return; }
  if (v.dataset.auto === "1" && !reduced && !v._user && v.paused) { if (VM.cur && VM.cur !== v && VM.cur.dataset.kind === "main" && !VM.cur.paused) return; VM.play(v); }
}), { threshold: [0, 0.25, 0.5, 0.75] });
document.addEventListener("visibilitychange", () => { if (document.hidden && VM.cur && !VM.cur.paused) VM.cur.pause(); });

/* small loop with its own play / pause control (accessible; autoplay muted when in view unless reduced motion) */
function loop(name, auto = true, cls = "pstage") {
  const st = el("div", cls); const v = el("video"); v.muted = true; v.setAttribute("muted", ""); v.loop = true; v.setAttribute("playsinline", ""); v.preload = "none"; v.poster = vposter(name); v.dataset.src = vsrc(name); v.setAttribute("aria-hidden", "true");
  const b = el("button", "pbtn pbtn--sm pplay", { type: "button" }); st.append(v, b);
  const sync = () => { const on = !v.paused; b.textContent = on ? T().holo.pause : T().holo.play; b.setAttribute("aria-pressed", String(on)); };
  v.addEventListener("play", sync); v.addEventListener("pause", sync); LF.push(sync); sync();
  b.addEventListener("click", () => { if (v.paused) { v._user = false; VM.play(v); } else { v._user = true; v.pause(); } });
  VM.register(v, "loop", auto);
  return { st, v };
}
// 06G.2B: standalone methodology badges are no longer rendered (provenance stays in the media manifest).
const tag = () => document.createComment("badge-removed");

/* ---------- 00 header + nav ---------- */
const NAV = ["ctx", "holo", "durchfahrt", "turm", "y179", "castra", "bau", "film"];
function buildNav() {
  const pn = $("#pn"); const links = $("#pnLinks");
  NAV.forEach((id, i) => { const a = el("a", "", { href: "#" + id }); bind(a, (t) => t.navItems[i]); links.append(a); });
  onLang(() => { $("#pnBack").textContent = T().back; $("#pnBack").dataset.short = T().backShort; $("#pnLang").setAttribute("aria-label", T().langLabel); links.setAttribute("aria-label", T().nav); $("#pSkip").textContent = T().skip; document.title = "ZEITSPRUNG — Porta Praetoria · Castra Regina, Regensburg"; });
  document.querySelectorAll("#pnLang button").forEach((b) => { b.setAttribute("aria-pressed", String(b.dataset.lang === lang)); b.addEventListener("click", () => { setLang(b.dataset.lang); ztSound.relabel(); }); });
  ztSound.mount($("#pnLang"));
  const bar = $("#pProg span");
  SC.push(() => {
    pn.classList.toggle("is-solid", scrollY > 40);
    const h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = "scaleX(" + (h > 0 ? clamp(scrollY / h, 0, 1) : 0) + ")";
    let cur = ""; NAV.forEach((id) => { const s = document.getElementById(id); if (s && s.getBoundingClientRect().top <= innerHeight * 0.4) cur = id; });
    links.querySelectorAll("a").forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + cur)));
  });
}

/* ---------- 01 entry: hero + experience gate ---------- */
function buildHero() {
  const im = el("img", "", { src: img("pp_heute"), width: "720", height: "1280", fetchpriority: "high", decoding: "async" }); bind(im, (t) => t.heute.alt, "alt");
  $("#heroStage").append(im); $("#heroBg").style.backgroundImage = `url(${img("pp_heute")})`;
  bind($("#heroEyebrow"), (t) => t.hero.eyebrow); bind($("#heroTitle"), (t) => t.hero.title); bind($("#heroSub"), (t) => t.hero.sub); bind($("#heroRange"), (t) => t.hero.range);
  const b = bind($("#startBtn"), (t) => t.hero.start); bind($("#heroAll"), (t) => t.hero.all);
  const go = () => $("#ctx").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  if (!reduced) heroFilm();
  // MONUMENT ENTRY STANDARD: START -> thin gold loading line while the hero stays visible -> critical first-view readiness -> release.
  // Critical = page load (CSS/JS), fonts, hero image decode. Minimum 450 ms, hard timeout 5 s, no percentages.
  let entering = false;
  const heroReady = new Promise((res) => { if (im.complete) return res(); ["load", "error"].forEach((ev) => im.addEventListener(ev, res, { once: true })); });
  const pageReady = new Promise((res) => { if (document.readyState === "complete") res(); else addEventListener("load", res, { once: true }); });
  const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready.catch(() => {}) : Promise.resolve();
  const load = el("div", "pload", { "aria-hidden": "true" }); load.hidden = true; load.appendChild(document.createElement("i")); document.body.appendChild(load);
  const release = () => {
    root.classList.remove("is-loading", "is-gated"); root.classList.add("is-started"); load.classList.remove("is-on"); setTimeout(() => { load.hidden = true; }, 320);
    requestAnimationFrame(() => { runSC(); requestAnimationFrame(go); });
  };
  b.addEventListener("click", () => {
    if (!root.classList.contains("is-gated")) { go(); return; }
    if (entering) return; entering = true; root.classList.add("is-loading"); load.hidden = false; requestAnimationFrame(() => load.classList.add("is-on"));
    const t0 = performance.now(); let done = false;
    const finish = () => { if (done) return; done = true; setTimeout(release, reduced ? 0 : Math.max(0, 450 - (performance.now() - t0))); };
    Promise.all([heroReady, pageReady, fontsReady]).then(finish, finish); setTimeout(finish, 5000);
  });
}

/* ---------- 06G.2B hero film: PP_HERO_ENTRY_V1 → pp_hero_entry_720.mp4 (Type A) ----------
   The anchor image stays as base / fallback. Loads after window load, starts muted, plays ONCE and holds its last frame
   (= poster). Sound only via the compact ♪ (switching it on while visible replays with sound). Paused off screen. */
function heroFilm() {
  const stage = $("#heroStage");
  const v = el("video", "phero__film", { muted: "", playsinline: "", preload: "none", poster: `${A}poster/pp_hero_entry_poster.webp`, disablepictureinpicture: "", tabindex: "-1" }); v.muted = true; bind(v, (t) => t.hero.film, "aria-label");
  stage.append(v); let vis = true;
  const play = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
  ztSound.add(v, { onEnable: () => { if (vis && v.getAttribute("src") && (v.ended || v.paused)) { if (v.ended) v.currentTime = 0; play(); } } });
  v.addEventListener("playing", () => v.classList.add("is-on")); v.addEventListener("error", () => v.remove());
  new IntersectionObserver((es) => es.forEach((e) => { vis = e.isIntersecting; if (!vis && !v.paused) v.pause(); else if (vis && v.paused && !v.ended && v.currentTime > 0) play(); }), { threshold: 0.25 }).observe(stage);
  const start = () => setTimeout(() => { if (!vis) return; v.src = `${A}video/pp_hero_entry_720.mp4`; play(); }, 250);
  if (document.readyState === "complete") start(); else addEventListener("load", start, { once: true });
}

/* ---------- 06G.2B vertical scroll sequence (one sticky 9:16 stage, one item per scroll step) ----------
   items: [{ img } | { video, poster }], label(i) → title text. Videos: muted loop, only the active one plays while on screen. */
function vseq(host, items, label, vh = 60) {
  const N = items.length;
  if (reduced) {
    const list = el("div", "pwrap pvseq__static");
    items.forEach((it, i) => { const f = el("figure", "pvseq__fig pr"); const st = el("div", "pstage"); const im = el("img", "", { src: it.img || it.poster, loading: "lazy", decoding: "async" }); bind(im, () => label(i) || "", "alt"); st.append(im); const c = el("figcaption", "pvseq__t"); bind(c, () => label(i) || ""); f.append(st, c); list.append(f); });
    host.append(list); return;
  }
  const tr = el("div", "ptrack pvseq"); tr.style.height = (N * vh + 40) + "svh";
  const sticky = el("div", "psticky"); const wrap = el("div", "pvseq__wrap"); const st = el("div", "pvseq__stage");
  const els = items.map((it, i) => {
    let m;
    if (it.video) { m = el("video", "", { playsinline: "", preload: "none", poster: it.poster, disablepictureinpicture: "", tabindex: "-1" }); m.muted = true; m.setAttribute("muted", ""); m.loop = true; m.dataset.src = it.video; }
    else { m = el("img", "", { src: it.img, loading: "lazy", decoding: "async" }); if (it.srcset) { m.srcset = it.srcset; m.sizes = "(max-width:900px) 92vw, 540px"; } }
    bind(m, () => label(i) || "", it.video ? "aria-label" : "alt"); if (i) m.classList.add("is-off"); st.append(m); return m;
  });
  const bar = el("div", "pvseq__bar", { "aria-hidden": "true" }); const fill = el("span"); bar.append(fill); st.append(bar);
  const tx = el("div", "pvseq__txt", { "aria-live": "polite" }); const k = el("p", "pvseq__k"); const t = el("h3", "pvseq__t"); tx.append(k, t);
  wrap.append(st, tx); sticky.append(wrap); tr.append(sticky); host.append(tr);
  let cur = -1; const vids = els.filter((m) => m.tagName === "VIDEO");
  const paint = () => { k.textContent = String(cur + 1).padStart(2, "0") + " / " + String(N).padStart(2, "0"); t.textContent = label(cur) || ""; };
  const onScreen = () => { const r = tr.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
  const syncV = () => { const live = onScreen(); vids.forEach((v) => { const on = live && els[cur] === v; if (on && v.paused) { if (!v.getAttribute("src")) v.src = v.dataset.src; const p = v.play(); if (p && p.catch) p.catch(() => {}); } else if (!on && !v.paused) v.pause(); }); };
  const show = (i) => { if (i === cur) return; cur = i; els.forEach((m, j) => m.classList.toggle("is-off", j !== i)); tx.classList.remove("is-new"); void tx.offsetWidth; tx.classList.add("is-new"); paint(); };
  LF.push(() => { if (cur >= 0) paint(); });
  show(0);
  SC.push(() => { const r = tr.getBoundingClientRect(); if (r.bottom < -innerHeight || r.top > innerHeight * 2) { if (vids.length) syncV(); return; } const p = prog(tr); fill.style.transform = "scaleX(" + p + ")"; show(clamp(Math.floor(p * N), 0, N - 1)); if (vids.length) syncV(); });
}

/* ---------- section helpers ---------- */
const head = (box, key, extra) => {
  const e = el("p", "peyebrow"); bind(e, (t) => t[key].eyebrow); const h = el("h2", "ph"); bind(h, (t) => t[key].h); box.append(e, h); return { e, h };
};
const lead = (key, f) => { const p = el("p", "plead"); bind(p, (t) => t[key][f]); return p; };
const facts = (key, ids) => { const g = el("div", "pfacts"); ids.forEach((n) => { const d = el("div"); const b = el("b"); const s = el("span"); bind(b, (t) => t[key]["c" + n]); bind(s, (t) => t[key]["c" + n + "l"]); d.append(b, s); g.append(d); }); return g; };
const stageImg = (name, altKey, cls = "pstage", w = [720]) => {
  const st = el("div", cls); const i = el("img", "", { src: img(name, w[0]), loading: "lazy", decoding: "async" });
  if (w.length > 1) { i.srcset = w.map((x) => `${img(name, x)} ${x}w`).join(", "); i.sizes = "(max-width:900px) 92vw, 720px"; }
  bind(i, altKey, "alt"); st.append(i); return st;
};

/* ---------- 02 context ---------- */
function buildCtx() {
  const s = $("#ctx"); const w = el("div", "pwrap pr"); head(w, "ctx");
  w.append(lead("ctx", "p1"), lead("ctx", "p2"));
  const g = el("div", "pfacts"); [1, 2, 3].forEach((n) => { const d = el("div"); const b = el("b"); const sp = el("span"); bind(b, (t) => t.ctx["fact" + n]); bind(sp, (t) => t.ctx["fact" + n + "s"]); d.append(b, sp); g.append(d); }); w.append(g); s.append(w);
}

/* ---------- 03 hologram dissolve ---------- */
function buildHolo() {
  const s = $("#holo"); const hd = el("div", "pwrap pholo__head pr"); head(hd, "holo"); hd.append(lead("holo", "p")); s.append(hd);
  const tr = el("div", "ptrack"); tr.style.height = reduced ? "auto" : "240svh";
  const sticky = el("div", "psticky"); const d = el("div", "pdis");
  const a = el("img", "", { src: img("pp_anchor"), loading: "lazy", decoding: "async" }); const h = el("img", "pdis__holo", { src: img("pp_holo_front"), loading: "lazy", decoding: "async" });
  bind(a, (t) => t.hero.alt, "alt"); bind(h, (t) => t.holo.cap, "alt"); d.append(a, h); sticky.append(d); tr.append(sticky); s.append(tr);
  if (!reduced) SC.push(() => { const p = prog(tr); const k = clamp((p - 0.25) / 0.5, 0, 1); const e = k * k * (3 - 2 * k); h.style.opacity = e; a.style.opacity = 1 - e * 0.85; d.style.transform = "scale(" + (1 + p * 0.03) + ")"; });
  const cp = el("p", "pcap pwrap"); bind(cp, (t) => t.holo.cap); s.append(cp);
  const c = el("div", "pwrap pholo__clip"); const lp = loop("holo_to_real", true); lp.st.append(el("span")); const l2 = tag("rec"); lp.st.append(l2); c.append(lp.st); const ct = el("p", "pcap"); ct.style.textAlign = "center"; bind(ct, (t) => t.holo.clip); c.append(ct); s.append(c);
}

/* ---------- 04 double passage / 05 tower + wall ---------- */
function buildPass() {
  // 06G.2B: vertical museum order — text → portrait media (scroll reveal) → facts
  const s = $("#durchfahrt"); s.classList.add("pvert"); const w = el("div", "pwrap pvert__in");
  const tx = el("div", "pr"); head(tx, "pass"); tx.append(lead("pass", "p1"), lead("pass", "p2"));
  const st = stageImg("pp_double_303", (t) => t.pass.alt, "pstage pstage--hologram pvert__media pr");
  const f = facts("pass", [1, 2, 3]); f.classList.add("pr"); w.append(tx, st, f); s.append(w);
}
function buildTower() {
  const s = $("#turm"); s.classList.add("pvert"); const w = el("div", "pwrap pvert__in");
  const tx = el("div", "pr"); head(tx, "tow"); tx.append(lead("tow", "p1"), lead("tow", "p2"));
  const st = stageImg("pp_holo_302", (t) => t.tow.alt, "pstage pstage--hologram pstage--pt pvert__media pr");
  const g = facts("tow", [1, 2]); g.classList.add("pr"); g.style.gridTemplateColumns = "repeat(2,1fr)"; const n = el("p", "pnote pr"); bind(n, (t) => t.tow.p3); w.append(tx, st, g, n); s.append(w);
}

/* ---------- 06 AD 179 ---------- */
function buildY179() {
  // 06G.2B: PP_RECONSTRUCTION_V2 (PP_ASSET_155) replaces the 5 s castra_aerial loop. Not seamless → play once, hold the last
  // frame ~2.5 s, soft fade, restart; only while visible; muted; no controls. Reduced motion: poster only.
  const s = $("#y179"); s.classList.add("pvert"); const w = el("div", "pwrap pvert__in");
  const tx = el("div", "pr"); head(tx, "y179"); tx.append(lead("y179", "p1"), lead("y179", "p2"));
  const st = el("div", "pstage pvert__media pr"); const cp = el("p", "pcap pr"); cp.style.textAlign = "center"; bind(cp, (t) => t.y179.clip);
  const v = el("video", "", { playsinline: "", preload: "none", poster: `${A}poster/pp_reconstruction_v2_poster.webp`, disablepictureinpicture: "", tabindex: "-1" }); v.muted = true; v.setAttribute("muted", ""); bind(v, (t) => t.y179.clip, "aria-label"); st.append(v);
  w.append(tx, st, cp); s.append(w);
  if (!reduced) {
    let vis = false, hold = 0;
    const play = () => { if (!v.getAttribute("src")) v.src = `${A}video/pp_reconstruction_v2_540.mp4`; const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    v.addEventListener("ended", () => { clearTimeout(hold); hold = setTimeout(() => { if (!vis) return; v.classList.add("is-fade"); setTimeout(() => { try { v.currentTime = 0; } catch (e) {} v.classList.remove("is-fade"); if (vis) play(); }, 450); }, 2500); });
    new IntersectionObserver((es) => es.forEach((e) => { vis = e.isIntersecting && e.intersectionRatio >= 0.5; if (vis) { if (v.paused && !v.ended) play(); } else { clearTimeout(hold); if (!v.paused) v.pause(); } }), { threshold: [0, 0.5] }).observe(st);
  }
}

/* ---------- 07 Castra Regina reveal (zoom out) ---------- */
function buildCastra() {
  const s = $("#castra"); const hd = el("div", "pwrap pr"); head(hd, "cas"); hd.append(lead("cas", "p")); const big = el("p", "pcastra__big"); bind(big, (t) => t.cas.big); const bs = el("p", "pcastra__bigs"); bind(bs, (t) => t.cas.bigs); hd.append(big, bs); s.append(hd);
  const tr = el("div", "ptrack"); tr.style.height = reduced ? "auto" : "260svh"; tr.style.marginTop = "28px"; const sticky = el("div", "psticky"); const d = el("div", "pdis");
  const z = el("div", "pcastra__zoom"); z.style.cssText = "position:absolute;inset:0"; const i = el("img", "", { src: img("pp_castra_301", 720), srcset: `${img("pp_castra_301", 720)} 720w, ${img("pp_castra_301", 1080)} 1080w`, sizes: "(max-width:900px) 92vw, 720px", loading: "lazy", decoding: "async" }); i.style.objectFit = "contain"; bind(i, (t) => t.cas.alt, "alt"); z.append(i); d.append(z);
  const cap = el("div", "pcastra__cap"); const ct = el("p", "pcastra__big"); ct.style.margin = "0"; bind(ct, (t) => t.cas.big); cap.append(ct); d.append(cap);
  sticky.append(d); tr.append(sticky); s.append(tr);
  if (!reduced) { d.style.aspectRatio = "1199/1312"; SC.push(() => { const p = prog(tr); const e = clamp(p / 0.75, 0, 1); const k = 1 - Math.pow(1 - e, 3); z.style.transform = "scale(" + (2.9 - 1.9 * k) + ")"; cap.classList.toggle("is-on", p > 0.7); }); }
  else cap.classList.add("is-on");
  const c = el("div", "pwrap pholo__clip"); const lp = loop("holo_orbit", true); lp.st.append(tag("rec")); c.append(lp.st); s.append(c);
}

/* ---------- 08 plan: 2D explainer (schematic SVG, only documented figures labelled) ---------- */
const NS = "http://www.w3.org/2000/svg";
const sv = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.append(e); return e; };
function buildPlan() {
  const s = $("#plan"); const w = el("div", "pwrap pr"); head(w, "plan"); w.append(lead("plan", "p"));
  const grid = el("div", "pplan__grid"); const fig = el("figure", "pplan__fig");
  const svg = sv("svg", { viewBox: "0 0 360 330", role: "img" }); bind(svg, (t) => t.plan.ptitle, "aria-label");
  sv("path", { d: "M30 22 q30 -12 60 0 t60 0 t60 0 t60 0 t60 0", fill: "none", stroke: "#7aa7c7", "stroke-width": "1.2" }, svg);
  const tn = sv("text", { x: 330, y: 14, "text-anchor": "end", "font-size": 9 }, svg); bind(tn, (t) => t.plan.north);
  sv("rect", { x: 30, y: 40, width: 300, height: 250, fill: "#0b0c0f", stroke: "#d4af78", "stroke-width": 2 }, svg);
  sv("rect", { x: 158, y: 33, width: 44, height: 14, fill: "#d4af78" }, svg);
  const tp = sv("text", { x: 180, y: 62, "text-anchor": "middle", "font-size": 9 }, svg); tp.style.fill = "#d4af78"; bind(tp, (t) => t.plan.porta);
  const tc = sv("text", { x: 180, y: 170, "text-anchor": "middle", "font-size": 10.5 }, svg); bind(tc, (t) => t.plan.camp);
  sv("line", { x1: 30, y1: 308, x2: 330, y2: 308, stroke: "rgba(244,239,230,.4)", "stroke-width": 1 }, svg);
  const tw = sv("text", { x: 180, y: 322, "text-anchor": "middle", "font-size": 9 }, svg); tw.textContent = "≈ 540 m";
  sv("line", { x1: 14, y1: 40, x2: 14, y2: 290, stroke: "rgba(244,239,230,.4)", "stroke-width": 1 }, svg);
  const th = sv("text", { x: 0, y: 0, "font-size": 9, transform: "translate(10 168) rotate(-90)", "text-anchor": "middle" }, svg); th.textContent = "≈ 450 m";
  fig.append(svg);
  const fig2 = el("figure", "pplan__fig"); const g2 = sv("svg", { viewBox: "0 0 360 240", role: "img" }); bind(g2, (t) => t.plan.planTitle, "aria-label");
  const gt = sv("text", { x: 180, y: 16, "text-anchor": "middle", "font-size": 9.5 }, g2); bind(gt, (t) => t.plan.planTitle);
  const wl = (x, wd) => sv("rect", { x, y: 108, width: wd, height: 12, fill: "#14110c", stroke: "#d4af78", "stroke-width": 1.4 }, g2);
  wl(8, 62); wl(290, 62);
  [101, 259].forEach((cx) => { sv("path", { d: `M${cx - 31} 108 A31 31 0 0 1 ${cx + 31} 108 L${cx + 31} 178 L${cx - 31} 178 Z`, fill: "#14110c", stroke: "#d4af78", "stroke-width": 1.6 }, g2); });
  sv("rect", { x: 132, y: 112, width: 96, height: 62, fill: "#14110c", stroke: "#d4af78", "stroke-width": 1.4 }, g2);
  sv("rect", { x: 135, y: 112, width: 37, height: 62, fill: "#000", stroke: "rgba(212,175,120,.5)" }, g2); sv("rect", { x: 189, y: 112, width: 37, height: 62, fill: "#000", stroke: "rgba(212,175,120,.5)" }, g2);
  const l1 = sv("text", { x: 101, y: 66, "text-anchor": "middle", "font-size": 8.5 }, g2); bind(l1, (t) => t.plan.tw);
  sv("line", { x1: 101, y1: 70, x2: 101, y2: 84, stroke: "rgba(244,239,230,.4)" }, g2);
  sv("line", { x1: 132, y1: 196, x2: 228, y2: 196, stroke: "rgba(244,239,230,.5)" }, g2); const l2 = sv("text", { x: 180, y: 212, "text-anchor": "middle", "font-size": 8.5 }, g2); bind(l2, (t) => t.plan.gh);
  const l3 = sv("text", { x: 153, y: 232, "text-anchor": "middle", "font-size": 8 }, g2); bind(l3, (t) => t.plan.ps);
  const l4 = sv("text", { x: 8, y: 138, "font-size": 8.5 }, g2); bind(l4, (t) => t.plan.wl);
  fig2.append(g2); grid.append(fig, fig2); w.append(grid); s.append(w); // 06G.2B: "schematic reconstruction" badge removed (the lead already says "schematic sketch")
}

/* ---------- 09 construction story K02 -> K05 (crossfade only; no interpolated architecture) ---------- */
const BAU = [["pp_k02", "foundation"], ["pp_k03", "scaffold"], ["pp_k04", "centring"], ["pp_k05_v11", "pullback"]]; // V1.1: K05 is its own corrected image (platform HEUTE stays pp_anchor)
function buildBau() {
  const s = $("#bau"); const hd = el("div", "pwrap pbau__head pr"); head(hd, "bau"); s.append(hd);
  const N = BAU.length; const tr = el("div", "ptrack"); tr.style.height = reduced ? "auto" : (N * 100) + "svh";
  const sticky = el("div", "psticky"); const wrap = el("div", "pbau__wrap"); const st = el("div", "pbau__stage"); const imgs = BAU.map(([n], i) => { const im = el("img", i === 0 ? "is-on" : "", { src: img(n), loading: "lazy", decoding: "async" }); st.append(im); return im; });
  const mv = el("video", "", { playsinline: "", preload: "none", "aria-hidden": "true" }); mv.muted = true; mv.setAttribute("muted", ""); mv.loop = true; st.append(mv); VM.register(mv, "loop", false);
  const tx = el("div", "pbau__txt"); const k = el("p", "pbau__k"); const t = el("h3", "pbau__t"); const p = el("p", "pbau__p"); const ctl = el("div", "pbau__ctl");
  const mb = el("button", "pbtn pbtn--sm", { type: "button" }); const dots = el("div", "pdots"); const db = BAU.map((_, i) => { const b = el("button", "", { type: "button" }); b.append(el("i")); bind(b, (T_) => T_.bau.step + " " + (i + 1) + " / " + N + " — " + T_.bau.states[i].t, "aria-label"); dots.append(b); return b; });
  ctl.append(mb, dots); const cp = el("p", "pbau__cap"); bind(cp, (T_) => T_.bau.cap); tx.append(k, t, p, ctl, cp); wrap.append(st, tx); sticky.append(wrap); tr.append(sticky); s.append(tr);
  let cur = -1, on = false;
  const mvOff = () => { on = false; mv.pause(); mv.classList.remove("is-on"); };
  const show = (i) => { if (i === cur) return; cur = i; imgs.forEach((im, j) => im.classList.toggle("is-on", j === i)); mvOff(); db.forEach((b, j) => b.setAttribute("aria-current", String(j === i))); upd(); };
  const upd = () => { if (cur < 0) return; const S = T().bau.states[cur]; k.textContent = S.k + " · " + (cur + 1) + "/" + N; t.textContent = S.t; p.textContent = S.p; mb.textContent = on ? T().bau.stop : T().bau.play; mb.setAttribute("aria-pressed", String(on)); };
  LF.push(upd);
  mb.addEventListener("click", () => { if (on) { mvOff(); upd(); return; } on = true; mv.dataset.src = vsrc(BAU[cur][1]); mv.removeAttribute("src"); mv.poster = vposter(BAU[cur][1]); mv.load(); mv.classList.add("is-on"); mv._user = false; VM.play(mv); upd(); });
  db.forEach((b, i) => b.addEventListener("click", () => { if (reduced) { show(i); return; } const top = tr.getBoundingClientRect().top + scrollY; const total = tr.offsetHeight - innerHeight; scrollTo({ top: top + ((i + 0.5) / N) * total, behavior: "smooth" }); }));
  show(0);
  if (!reduced) SC.push(() => { const pr = prog(tr); show(clamp(Math.floor(pr * N), 0, N - 1)); });
  // reduced motion: plain stacked list instead of the sticky stage
  if (reduced) { const lite = el("div", "pbau__lite pwrap"); BAU.forEach(([n], i) => { const a = el("article"); const im = el("img", "", { src: img(n), loading: "lazy", alt: "" }); const ti = el("h3", "pbau__t"); const pp = el("p", "pbau__p"); bind(ti, (T_) => T_.bau.states[i].k + " · " + T_.bau.states[i].t); bind(pp, (T_) => T_.bau.states[i].p); a.append(im, ti, pp); lite.append(a); }); s.append(lite); }
}

/* ---------- 10 film player (play / pause, sound, progress, time, keyboard ±5 s) ---------- */
function player(host, name, labelKey, noteKey) {
  const w = el("div", "pplayer"); const st = el("div", "pplayer__stage", { tabindex: "0", role: "group" });
  const v = el("video", "", { playsinline: "", preload: "none" }); v.muted = true; v.setAttribute("muted", ""); v.poster = vposter(name); v.dataset.src = vsrc(name); v.setAttribute("aria-label", name);
  st.append(v); const ctl = el("div", "pplayer__ctl"); const pb = el("button", "pbtn pbtn--sm", { type: "button" }); const sb = el("button", "pbtn pbtn--sm", { type: "button" }); const tm = el("span", "pplayer__time"); ctl.append(pb, tm); ztSound.add(v); // 06G: sb (large sound button) removed from the panel
  const rg = el("input", "", { type: "range", min: "0", max: "1000", value: "0", step: "1" }); bind(rg, (t) => t.tl.seek, "aria-label");
  const kb = el("p", "pplayer__kbd"); bind(kb, (t) => t.tl.kbd); w.append(st, ctl, rg, kb); if (noteKey) { const n = el("p", "pnote"); bind(n, (t) => t.tl.note); w.append(n); } host.append(w);
  let dur = 0, drag = false, pend = null;
  const draw = () => { const c = v.currentTime || 0; tm.textContent = fmt(c) + " / " + fmt(dur); if (!drag && dur) rg.value = String(Math.round((c / dur) * 1000)); };
  const sync = () => { const on = !v.paused; pb.textContent = on ? T().tl.pause : T().tl.play; pb.setAttribute("aria-pressed", String(on)); sb.textContent = v.muted ? T().tl.sound : T().tl.mute; sb.setAttribute("aria-pressed", String(!v.muted)); };
  LF.push(sync); onLang(draw);
  v.addEventListener("loadedmetadata", () => { dur = v.duration || dur; if (pend != null) { v.currentTime = pend; pend = null; } draw(); });
  ["timeupdate", "durationchange"].forEach((e) => v.addEventListener(e, () => { dur = v.duration || dur; draw(); }));
  ["play", "pause", "volumechange", "ended"].forEach((e) => v.addEventListener(e, sync));
  pb.addEventListener("click", () => { if (v.paused) { v._user = false; VM.play(v); } else { v._user = true; v.pause(); } });
  sb.addEventListener("click", () => { v.muted = !v.muted; if (v.muted) v.setAttribute("muted", ""); else v.removeAttribute("muted"); sync(); });
  const seekTo = (s) => { VM.ensure(v); if (v.readyState >= 1) v.currentTime = clamp(s, 0, v.duration || s); else pend = s; };
  rg.addEventListener("input", () => { drag = true; const s = (+rg.value / 1000) * (dur || 191); tm.textContent = fmt(s) + " / " + fmt(dur || 191); }); rg.addEventListener("change", () => { drag = false; seekTo((+rg.value / 1000) * (dur || 191)); });
  st.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") { e.preventDefault(); seekTo((v.currentTime || 0) + 5); } else if (e.key === "ArrowLeft") { e.preventDefault(); seekTo((v.currentTime || 0) - 5); } else if (e.key === " " || e.key === "Enter") { e.preventDefault(); pb.click(); } });
  VM.register(v, "main", false); sync(); draw(); return { v, w };
}
function buildFilm() {
  const s = $("#film"); const w = el("div", "pwrap pr"); head(w, "tl"); w.append(lead("tl", "p")); const wrap = el("div"); w.append(wrap); s.append(w);
  player(wrap, "timeline", "work", true);
}

/* ---------- 11 loops strip + master film ---------- */
function buildLoops() {
  const s = $("#alltag"); const w = el("div", "pwrap pr"); head(w, "loops"); w.append(lead("loops", "p")); s.append(w);
  // 06G.2B: vertical worker sequence (no horizontal scroll-snap strip); the active loop plays muted only while on screen.
  vseq(s, STR.de.loops.items.map(([name]) => ({ video: vsrc(name), poster: vposter(name) })), (i) => T().loops.items[i] ? T().loops.items[i][1] : "", 50);
  const m = el("div", "pwrap ploops__master pr"); const h3 = el("h3", "ph"); h3.style.fontSize = "clamp(20px,5vw,28px)"; bind(h3, (t) => t.loops.master); const mp = el("p", "plead"); bind(mp, (t) => t.loops.masterP); m.append(h3, mp); const host = el("div"); m.append(host); s.append(m);
  player(host, "master", "recAi", false);
}

/* ---------- 06G.2B owner gallery: the 5 approved ZEITSPRUNG_Porta_Praetoria_01…05 images (PP_ASSET 06G.2A set), vertical ---------- */
function buildGallery() {
  const s = $("#galerie"); if (!s) return; const w = el("div", "pwrap pr pgal__head"); head(w, "gal"); w.append(lead("gal", "p")); s.append(w);
  const items = [1, 2, 3, 4, 5].map((n) => { const b = `pp_gallery_${String(n).padStart(2, "0")}`; return { img: img(b), srcset: `${img(b)} 720w, ${img(b, 1080)} 1080w` }; });
  vseq(s, items, (i) => T().gal.h + " · " + String(i + 1).padStart(2, "0"), 55);
}

/* ---------- 12 return + sources ---------- */
function buildEnd() {
  const s = $("#heute"); const w = el("div", "pwrap pr"); head(w, "end"); w.append(lead("end", "p"));
  const st = el("div", "pstage"); const i = el("img", "", { src: img("pp_heute"), loading: "lazy", decoding: "async" }); bind(i, (t) => t.heute.alt, "alt"); st.append(i); w.append(st); // HEUTE: the owner anchor image, no reconstruction badge
  const cta = el("div", "pend__cta"); const sb = el("button", "pbtn", { type: "button" }); bind(sb, (t) => t.end.sources); const ab = el("a", "pbtn pbtn--primary", { href: "../index.html#index-monuments" }); bind(ab, (t) => t.back); cta.append(sb, ab);
  // 07D order: HEUTE (last content) -> trailer slot -> QUELLEN -> destinations (own block after #heute)
  const tail = el("section", "psec pend ptail"); const tw = el("div", "pwrap"); tw.append(cta); tail.append(tw); s.after(tail);
  mountSources({ monument: "porta-praetoria", before: tail }); mountDestinations(tw, { self: "porta-praetoria", btnClass: "pbtn" }); // 07B.1 (no Porta trailer: final clean trailer deferred)
  s.append(w); // 06G.2B: methodology disclaimer removed from the page (global footer later)
  sb.addEventListener("click", () => goToSources()); // 07D: the dialog became the #quellen section
}

/* ---------- scroll reveal ---------- */
function reveal() {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { threshold: 0.12 });
  document.querySelectorAll(".pr").forEach((n) => io.observe(n));
}

try { history.scrollRestoration = "manual"; } catch (e) {}
root.lang = lang;
buildNav(); buildHero(); buildCtx(); buildHolo(); buildPass(); buildTower(); buildY179(); buildCastra(); buildPlan(); buildBau(); buildFilm(); buildLoops(); buildGallery(); buildEnd(); buildTrailerSlot(); reveal(); initGuide({ monument: "porta-praetoria" });
requestAnimationFrame(runSC);
