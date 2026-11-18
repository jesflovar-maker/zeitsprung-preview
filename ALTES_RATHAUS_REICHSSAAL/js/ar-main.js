// ALTES RATHAUS · REICHSSAAL — V1.2 (MASTER, Phase 06C.2). One vanilla ES module, DE / EN / ES, no external libraries.
// Design anchor: OUTSIDE -> TIME -> ENTER -> REVEAL THE REICHSSAAL -> PEOPLE -> MATERIAL -> RETURN TO TODAY.
// Everything is a vertical, scroll-driven narrative (sticky stage + scroll progress). No galleries, no carousels.
// K01–K11 and every K-chain-derived video (timeline master / chapters / transitions) stay excluded (06B + 06C.2 audit).
// Visible AI / reconstruction badges = 0 (owner rule 2026-11-18); provenance stays in the media manifest.
import { STR, LANGS, STORAGE_KEY } from "./ar-i18n.js?v=20261118e";

const A = "../assets/altes-rathaus/";
const img = (n) => `${A}img/${n}_720.webp`;
// Reichssaal media: AR_ASSET_167 (supersedes 130) / AR_ASSET_168 (supersedes 135).
const SAAL_1700 = "ar_reichssaal_1700_v1_corrected";
const SAAL_HEUTE = "ar_reichssaal_heute_v1_corrected";
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;
if (reduced) root.classList.add("is-reduced");
const $ = (s, r = document) => r.querySelector(s);
const el = (t, c, a) => { const e = document.createElement(t); if (c) e.className = c; if (a) for (const k in a) e.setAttribute(k, a[k]); return e; };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (a, b, x) => { const k = clamp((x - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };

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

const pic = (name, altGet, extra) => { const i = el("img", "", { src: img(name), loading: "lazy", decoding: "async" }); bind(i, altGet, "alt"); if (extra) for (const k in extra) i.setAttribute(k, extra[k]); return i; };
const head = (box, key) => { const e = el("p", "aeyebrow"); bind(e, (t) => t[key].eyebrow); const h = el("h2", "ah"); bind(h, (t) => t[key].h); box.append(e, h); };
const lead = (key, f) => { const p = el("p", "alead"); bind(p, (t) => t[key][f]); return p; };

/* ---------- generic vertical scroll sequence: sticky 9:16 stage + one step per scroll segment ---------- */
// cfg: { sec, key, list (i18n array key), files[], date (bool: list item = [date,title,text]), note, vh }
function buildSeq(cfg) {
  const s = $("#" + cfg.sec); const w = el("div", "awrap aseq__head ar"); head(w, cfg.key); if (STR.de[cfg.key].p) w.append(lead(cfg.key, "p")); s.append(w);
  const items = () => T()[cfg.key][cfg.list || "items"]; const N = cfg.files.length; const D = cfg.date ? 1 : 0;
  if (reduced) {
    // reduced motion: readable static sequence, nothing hidden
    const list = el("div", "awrap aseq__static");
    cfg.files.forEach((f, i) => {
      const fig = el("figure", "aseq__fig"); const st = el("div", "astage"); st.append(pic(f, () => items()[i][D]));
      const cap = el("figcaption"); if (D) { const y = el("p", "aseq__y"); bind(y, () => items()[i][0]); cap.append(y); }
      const t = el("h3", "aseq__t"); bind(t, () => items()[i][D]); const d = el("p", "aseq__d"); bind(d, () => items()[i][D + 1]); cap.append(t, d); fig.append(st, cap); list.append(fig);
    });
    if (cfg.note) { const n = el("p", "aseq__note"); bind(n, (t) => t[cfg.key].note); list.append(n); }
    s.append(list); return;
  }
  const tr = el("div", "atrack aseq"); tr.style.height = (N * (cfg.vh || 70) + 40) + "svh";
  const st = el("div", "asticky"); const wrap = el("div", "aseq__wrap"); const stage = el("div", "aseq__stage");
  const ims = cfg.files.map((f, i) => { const im = pic(f, () => items()[i][D]); if (i) im.classList.add("is-off"); stage.append(im); return im; });
  const bar = el("div", "aseq__bar", { "aria-hidden": "true" }); const fill = el("span"); bar.append(fill); stage.append(bar);
  const txt = el("div", "aseq__txt", { "aria-live": "polite" }); const k = el("p", "aseq__k"); const y = el("p", "aseq__y"); const t = el("h3", "aseq__t"); const d = el("p", "aseq__d");
  if (D) txt.append(k, y, t, d); else txt.append(k, t, d);
  if (cfg.note) { const n = el("p", "aseq__note"); bind(n, (T_) => T_[cfg.key].note); txt.append(n); }
  wrap.append(stage, txt); st.append(wrap); tr.append(st); s.append(tr);
  let cur = -1;
  const paint = () => { const it = items()[cur]; k.textContent = String(cur + 1).padStart(2, "0") + " / " + String(N).padStart(2, "0"); if (D) y.textContent = it[0]; t.textContent = it[D]; d.textContent = it[D + 1]; };
  const show = (i) => { if (i === cur) return; cur = i; ims.forEach((im, j) => im.classList.toggle("is-off", j !== i)); txt.classList.remove("is-new"); void txt.offsetWidth; txt.classList.add("is-new"); paint(); };
  LF.push(() => { if (cur >= 0) paint(); });
  show(0);
  SC.push(() => { if (!near(tr)) return; const p = prog(tr); fill.style.transform = "scaleX(" + p + ")"; show(clamp(Math.floor(p * N), 0, N - 1)); });
}

/* ---------- nav ---------- */
const NAV = ["heute", "aussen", "zeit", "portal", "saal", "menschen", "material", "heute-innen"];
function buildNav() {
  const links = $("#anLinks");
  NAV.forEach((id, i) => { const a = el("a", "", { href: "#" + id }); bind(a, (t) => t.navItems[i]); links.append(a); });
  onLang(() => { const b = $("#anBack"); b.textContent = T().back; b.dataset.short = T().backShort; $("#anLang").setAttribute("aria-label", T().langLabel); links.setAttribute("aria-label", T().nav); $("#aSkip").textContent = T().skip; });
  document.querySelectorAll("#anLang button").forEach((b) => { b.setAttribute("aria-pressed", String(b.dataset.lang === lang)); b.addEventListener("click", () => setLang(b.dataset.lang)); });
  const bar = $("#aProg"); const an = $("#an");
  SC.push(() => {
    an.classList.toggle("is-solid", scrollY > 40);
    const h = root.scrollHeight - innerHeight; bar.style.transform = "scaleX(" + (h > 0 ? clamp(scrollY / h, 0, 1) : 0) + ")";
    let cur = ""; NAV.forEach((id) => { const s = document.getElementById(id); if (s && s.getBoundingClientRect().top <= innerHeight * 0.4) cur = id; });
    links.querySelectorAll("a").forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + cur)));
  });
}

/* ---------- entry: hero + gate (platform monument entry standard) ---------- */
function buildHero() {
  const im = el("img", "", { src: img("ar_heute_v1"), width: "720", height: "1279", fetchpriority: "high", decoding: "async" }); bind(im, (t) => t.hero.alt, "alt");
  $("#heroStage").append(im); $("#heroBg").style.backgroundImage = `url(${img("ar_heute_v1")})`;
  bind($("#heroEyebrow"), (t) => t.hero.eyebrow); bind($("#heroTitle"), (t) => t.hero.title); bind($("#heroSub"), (t) => t.hero.sub); bind($("#heroTag"), (t) => t.hero.tag);
  const b = bind($("#startBtn"), (t) => t.hero.start); bind($("#heroAll"), (t) => t.hero.all);
  const go = () => $("#heute").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  let entering = false;
  const heroReady = new Promise((res) => { if (im.complete) return res(); ["load", "error"].forEach((ev) => im.addEventListener(ev, res, { once: true })); });
  const pageReady = new Promise((res) => { if (document.readyState === "complete") res(); else addEventListener("load", res, { once: true }); });
  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready.catch(() => {}) : Promise.resolve();
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

/* ---------- 01 today ---------- */
function buildNow() { const w = el("div", "awrap ar"); head(w, "now"); w.append(lead("now", "p1"), lead("now", "p2"), el("div", "anow__rule")); $("#heute").append(w); }

/* ---------- 03 Reichssaalbau: hologram dissolve -> Erker exploded (scroll-scrubbed video, no player) ---------- */
function buildHall() {
  const s = $("#saalbau"); const w = el("div", "awrap ar"); head(w, "hall"); w.append(lead("hall", "p1"), lead("hall", "p2")); s.append(w);
  const tr = el("div", "atrack"); tr.style.height = reduced ? "auto" : "230svh"; const st = el("div", "asticky"); const d = el("div", "adis");
  const a = pic("ar_holo_complex_v1", (t) => t.hall.h1); const b = pic("ar_holo_reichssaal_v1", (t) => t.hall.h2); b.className = "adis__b";
  const cap = el("p", "adis__cap"); d.append(a, b, cap); st.append(d); tr.append(st); s.append(tr);
  let stage = -1; const setCap = () => { cap.textContent = stage === 1 ? T().hall.h2 : T().hall.h1; }; LF.push(setCap);
  const upd = () => { const p = reduced ? 1 : prog(tr); const e = smooth(0.3, 0.7, p); b.style.opacity = reduced ? "" : e; const ns = e > 0.5 ? 1 : 0; if (ns !== stage) { stage = ns; setCap(); } };
  if (!reduced) SC.push(upd); upd();
  buildErker(s);
}
/* ---------- scroll-scrub engine (no player): paused video, scroll progress -> currentTime ----------
   One rAF per frame via the shared dispatcher; a seek is issued only when the delta is meaningful and no seek is pending;
   after each "seeked" the latest target is re-applied, so the frame always settles on the scroll position.
   Source attached lazily near the viewport; if the host does not serve byte ranges (not seekable), the clip is re-loaded
   as a blob so seeking works on any static host. No controls, no autoplay, no sound. */
function scrubVideo(tr, v, SRC, map) {
  v.muted = true; v.playsInline = true; v.controls = false;
  let ready = false, seeking = false, attached = false, target = 0, blobbed = false;
  const fps = 1 / 30;
  const seek = () => { if (!ready || seeking) return; if (Math.abs(v.currentTime - target) > fps) { seeking = true; v.currentTime = target; } };
  const blob = () => { if (blobbed) return; blobbed = true; ready = false; fetch(SRC).then((r) => { if (!r.ok) throw 0; return r.blob(); }).then((b) => { v.src = URL.createObjectURL(b); v.load(); }).catch(() => {}); };
  v.addEventListener("loadedmetadata", () => { if (!blobbed && (!v.seekable.length || v.seekable.end(0) < v.duration - 0.5)) { blob(); return; } ready = true; seek(); });
  v.addEventListener("seeked", () => { seeking = false; seek(); });
  v.addEventListener("play", () => v.pause());
  new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && !attached) { attached = true; v.preload = "auto"; v.src = SRC; v.load(); } }), { rootMargin: "100% 0px" }).observe(tr);
  SC.push(() => { if (!near(tr)) return; const p = prog(tr); target = map(p) * Math.max(0, (v.duration || 0) - 0.05); seek(); });
  return () => target;
}
const scrubEl = (poster, label) => { const v = el("video", "", { playsinline: "", muted: "", preload: "none", poster, disablepictureinpicture: "", tabindex: "-1" }); bind(v, label, "aria-label"); return v; };

// AR_ASSET_175 (RATH_LOOP_ERKER_EXPLODED_AI.mp4) -> ar_erker_scrub_v1_540.mp4 (first half, GOP 6). Reduced motion = still.
function buildErker(s) {
  const POSTER = `${A}poster/ar_erker_scrub_v1_poster.webp`, SRC = `${A}video/ar_erker_scrub_v1_540.mp4`;
  const w = el("div", "awrap aerk__head ar"); const t = el("h3", "aerk__t"); bind(t, (T_) => T_.hall.erkT); const p = el("p", "alead"); bind(p, (T_) => T_.hall.erkD); w.append(t, p); s.append(w);
  if (reduced) { const st = el("div", "astage aerk__still"); const im = el("img", "", { src: POSTER, loading: "lazy", decoding: "async" }); bind(im, (T_) => T_.hall.erkAlt, "alt"); st.append(im); const ww = el("div", "awrap"); ww.append(st); s.append(ww); return; }
  const tr = el("div", "atrack"); tr.style.height = "220svh"; const st = el("div", "asticky"); const d = el("div", "adis");
  const v = scrubEl(POSTER, (T_) => T_.hall.erkAlt); d.append(v); st.append(d); tr.append(st); s.append(tr);
  scrubVideo(tr, v, SRC, (p) => smooth(0.08, 0.92, p));
}

/* ---------- 03 master cinematic build timeline: AR_ASSET_191 (RATH_TIMELINE_LIMPIO_sin_texto_9x16.mp4), scroll-scrubbed ----------
   Owner sequence (06C.4 override): K0A = conceptual empty pre-state, K0B = site preparation / start of works, K1+ = visual build
   evolution, final = completed later state, then HEUTE. The video shows visual architectural evolution; the validated
   chronology is UI overlay text only (no dates burned into the video). Chapter cues = segment boundaries measured in 06C.4A. */
const TL_CUE = [0, 13.75, 31.0, 37.75, 44.5, 51.5, 55.5]; // seconds in the clean master where each overlay chapter starts
function buildTimeline() {
  const s = $("#zeit"); const w = el("div", "awrap aseq__head ar"); head(w, "time"); w.append(lead("time", "p")); s.append(w);
  const POSTER = `${A}poster/ar_timeline_scrub_v1_poster.webp`, SRC = `${A}video/ar_timeline_scrub_v1_540.mp4`;
  const ch = () => T().time.ch; const N = TL_CUE.length;
  if (reduced) {
    const list = el("div", "awrap aseq__static"); const fig = el("figure", "aseq__fig"); const st = el("div", "astage");
    const im = el("img", "", { src: POSTER, loading: "lazy", decoding: "async" }); bind(im, (t) => t.time.alt, "alt"); st.append(im); fig.append(st); list.append(fig);
    STR.de.time.ch.forEach((_, i) => { const c = el("div", "aseq__fig atl2__static"); const y = el("p", "aseq__y"); bind(y, () => ch()[i][0]); const t = el("h3", "aseq__t"); bind(t, () => ch()[i][1]); const d = el("p", "aseq__d"); bind(d, () => ch()[i][2]); c.append(y, t, d); list.append(c); });
    s.append(list); return;
  }
  const tr = el("div", "atrack aseq atl2"); tr.style.height = "900svh";
  const st = el("div", "asticky"); const wrap = el("div", "aseq__wrap"); const stage = el("div", "aseq__stage");
  const v = scrubEl(POSTER, (t) => t.time.alt); stage.append(v);
  const ticks = el("ol", "atl2__ticks", { "aria-hidden": "true" }); const tk = TL_CUE.map(() => { const li = el("li"); ticks.append(li); return li; }); stage.append(ticks);
  const bar = el("div", "aseq__bar", { "aria-hidden": "true" }); const fill = el("span"); bar.append(fill); stage.append(bar);
  const txt = el("div", "aseq__txt", { "aria-live": "polite" }); const k = el("p", "aseq__k"); const y = el("p", "aseq__y"); const t = el("h3", "aseq__t"); const d = el("p", "aseq__d"); txt.append(k, y, t, d);
  wrap.append(stage, txt); st.append(wrap); tr.append(st); s.append(tr);
  const DUR = 58.79; const ease = (p) => clamp((p - 0.03) / 0.94, 0, 1);
  const getT = scrubVideo(tr, v, SRC, ease);
  let cur = -1;
  const paint = () => { const it = ch()[cur]; k.textContent = String(cur + 1).padStart(2, "0") + " / " + String(N).padStart(2, "0"); y.textContent = it[0]; t.textContent = it[1]; d.textContent = it[2]; tk.forEach((li, j) => li.classList.toggle("is-on", j <= cur)); };
  LF.push(() => { if (cur >= 0) paint(); });
  const show = (i) => { if (i === cur) return; cur = i; txt.classList.remove("is-new"); void txt.offsetWidth; txt.classList.add("is-new"); paint(); };
  show(0);
  SC.push(() => { if (!near(tr)) return; const p = prog(tr); fill.style.transform = "scaleX(" + p + ")"; const sec = (v.duration ? getT() / (v.duration - 0.05) : ease(p)) * DUR; let i = 0; TL_CUE.forEach((c, j) => { if (sec >= c - 0.01) i = j; }); show(i); });
}

/* ---------- 06 portal: outside -> inside (transform / opacity only) ---------- */
function buildPortal() {
  const s = $("#portal"); const w = el("div", "awrap aportal__head ar"); head(w, "portal"); w.append(lead("portal", "p")); s.append(w);
  const tr = el("div", "atrack"); tr.style.height = reduced ? "auto" : "260svh"; const st = el("div", "asticky"); const d = el("div", "adis");
  const z = el("div", "aportal__zoom"); z.append(pic("ar_portal_v1", (t) => t.portal.alt)); const blk = el("div", "aportal__black");
  const hall = el("div", "aportal__hall"); hall.append(pic(SAAL_1700, (t) => t.saal.alt));
  d.append(z, blk, hall); st.append(d); tr.append(st); s.append(tr);
  if (!reduced) SC.push(() => { if (!near(tr)) return; const p = prog(tr); z.style.transform = "scale(" + (1 + 2.2 * smooth(0, 0.62, p)) + ")"; blk.style.opacity = smooth(0.42, 0.66, p) * (1 - smooth(0.7, 0.92, p)); hall.style.opacity = smooth(0.7, 0.95, p); });
}

/* ---------- 07 Reichssaal: enter and understand the hall (6 points) ---------- */
const SPOTS = [[49, 10], [82, 40], [93, 52], [42, 54], [10, 62], [48, 76]]; // % on AR_ASSET_167: ceiling beam, window, window front, throne/dais, left bench, open centre
function buildSaal() {
  const s = $("#saal"); const w = el("div", "awrap asaal__head ar"); head(w, "saal"); w.append(lead("saal", "p")); s.append(w);
  const N = SPOTS.length; const tr = el("div", "atrack"); tr.style.height = reduced ? "auto" : (N * 70 + 30) + "svh";
  const st = el("div", "asticky"); const wrap = el("div", "asaal__wrap"); const stage = el("div", "asaal__stage");
  stage.append(pic(SAAL_1700, (t) => t.saal.alt));
  const k = el("p", "asaal__k"); const t = el("h3", "asaal__t"); const dsc = el("p", "asaal__d", { "aria-live": "polite" });
  const btns = SPOTS.map(([x, y], i) => { const b = el("button", "aspot", { type: "button" }); b.style.left = x + "%"; b.style.top = y + "%"; b.textContent = String(i + 1); bind(b, (T_) => T_.saal.step + " " + (i + 1) + ": " + T_.saal.spots[i].t, "aria-label"); stage.append(b); return b; });
  const txt = el("div", "asaal__txt"); txt.append(k, t, dsc); wrap.append(stage, txt); st.append(wrap); tr.append(st); s.append(tr);
  let cur = -1;
  const show = (i) => { if (i === cur) return; cur = i; btns.forEach((b, j) => b.setAttribute("aria-current", String(j === i))); paint(); };
  const paint = () => { const S = T().saal.spots[cur]; k.textContent = String(cur + 1).padStart(2, "0") + " / " + String(N).padStart(2, "0"); t.textContent = S.t; dsc.textContent = S.d; };
  LF.push(() => { if (cur >= 0) paint(); });
  btns.forEach((b, i) => b.addEventListener("click", () => { show(i); if (reduced) return; const top = tr.getBoundingClientRect().top + scrollY; scrollTo({ top: top + ((i + 0.5) / N) * (tr.offsetHeight - innerHeight), behavior: "smooth" }); }));
  show(0);
  if (!reduced) SC.push(() => { if (near(tr)) show(clamp(Math.floor(prog(tr) * N), 0, N - 1)); });
}

/* ---------- 09 Reichstag 1663–1806 (typographic interlude) ---------- */
function buildRT() {
  const s = $("#reichstag"); const w = el("div", "awrap art__in ar");
  const e = el("p", "aeyebrow"); bind(e, (t) => t.rt.eyebrow); const big = el("p", "art__big"); bind(big, (t) => t.rt.h); w.append(e, big, lead("rt", "p1"));
  const ul = el("ul", "art__roles"); STR.de.rt.roles.forEach((_, i) => { const li = el("li"); const b = el("b"); const sp = el("span"); bind(b, (t) => t.rt.roles[i][0]); bind(sp, (t) => t.rt.roles[i][1]); li.append(b, sp); ul.append(li); }); w.append(ul);
  s.append(w);
}

/* ---------- 11 the hall: around 1700 / today ---------- */
function buildToggle() {
  const s = $("#heute-innen"); const w = el("div", "awrap ar"); head(w, "tg"); w.append(lead("tg", "p"));
  const st = el("div", "astage atg__stage"); const a = pic(SAAL_1700, (t) => t.tg.altA); const b = pic(SAAL_HEUTE, (t) => t.tg.altB); b.classList.add("is-off"); st.append(a, b);
  const bt = el("div", "atg__btns", { role: "group" }); const ba = el("button", "abtn abtn--sm", { type: "button", "aria-pressed": "true" }); const bb = el("button", "abtn abtn--sm", { type: "button", "aria-pressed": "false" });
  bind(ba, (t) => t.tg.a); bind(bb, (t) => t.tg.b); bind(bt, (t) => t.tg.h, "aria-label"); bt.append(ba, bb);
  const set = (h) => { a.classList.toggle("is-off", h); b.classList.toggle("is-off", !h); ba.setAttribute("aria-pressed", String(!h)); bb.setAttribute("aria-pressed", String(h)); };
  ba.addEventListener("click", () => set(false)); bb.addEventListener("click", () => set(true));
  w.append(st, bt); s.append(w);
}

/* ---------- 12 return to today + sources (no visible AI / methodology note: platform footer later) ---------- */
function buildEnd() {
  const s = $("#ende"); const w = el("div", "awrap ar"); head(w, "end"); w.append(lead("end", "p"));
  const st = el("div", "astage"); st.append(pic("ar_heute_v1", (t) => t.hero.alt)); w.append(st);
  const cta = el("div", "aend__cta"); const sb = el("button", "abtn", { type: "button" }); bind(sb, (t) => t.end.sources); const ab = el("a", "abtn abtn--primary", { href: "../index.html#index-monuments" }); bind(ab, (t) => t.back); cta.append(sb, ab); w.append(cta);
  s.append(w);
  const dlg = $("#srcDlg"); const list = $("#srcList"); const cl = $("#srcClose");
  onLang(() => { $("#srcTitle").textContent = T().end.srcH; list.replaceChildren(...T().end.srcList.map((x) => { const li = el("li"); li.textContent = x; return li; })); cl.textContent = T().end.close; });
  sb.addEventListener("click", () => { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", ""); });
  cl.addEventListener("click", () => { if (dlg.close) dlg.close(); else dlg.removeAttribute("open"); });
  dlg.addEventListener("click", (e) => { if (e.target === dlg && dlg.close) dlg.close(); });
}

function reveal() { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { threshold: 0.12 }); document.querySelectorAll(".ar").forEach((n) => io.observe(n)); }

try { history.scrollRestoration = "manual"; } catch (e) {}
root.lang = lang;
buildNav(); buildHero(); buildNow();
buildSeq({ sec: "aussen", key: "out", files: ["ar_tower_v1", "ar_erker_v1", "ar_night_v1"] });                                   // AR 014 / 015 / 006
buildTimeline();                                                                                                                   // AR 191 master, scroll-scrubbed
buildHall();
buildSeq({ sec: "ansicht", key: "plan", files: ["ar_layers_v1", "ar_elevation_v1"], vh: 60 });                                   // AR 074 / 011
buildPortal(); buildSaal();
buildSeq({ sec: "menschen", key: "people", note: true, files: ["ar_envoy_v1", "ar_pp_scribe_v1", "ar_pp_courier_v1", "ar_pp_council_v1", "ar_pp_official_v1"] }); // AR 007 / 072 / 073 / 063 / 061
buildRT();
buildSeq({ sec: "material", key: "mat", files: ["ar_mat_wood_v1", "ar_mat_stone_v1", "ar_window_v1", "ar_mat_iron_v1", "ar_seal_v1"] });            // AR 018 / 027 / 136 / 023 / 021
buildToggle(); buildEnd(); reveal();
requestAnimationFrame(run);
