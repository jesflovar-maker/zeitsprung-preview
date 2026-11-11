// DOM ST. PETER — PRESENTATION BUILD V1.2: immersive scroll journey, experience gate, DE / EN / ES.
// One runtime, vanilla ES module, no external libraries. Text lives in dom-i18n.js; the DOM is built ONCE and
// language switches only re-run text refreshers (no rebuild, no new listeners / observers / timers).
// Media: runtime derivatives only (../assets/dom-st-peter/). One primary video plays at a time; lazy loading.
import { STR, LANGS, STORAGE_KEY } from "./dom-i18n.js";

const A = "../assets/dom-st-peter/";
const HI = new Set(["k03", "k05", "k06", "k07", "k08", "k10", "k11", "int_portal", "int_nave", "int_choir", "int_vault", "heute"]); // also exist at 1080 px
const img = (n, w = 720) => `${A}img/dsp_${n}_${w}.webp`;
const srcset = (n) => (HI.has(n) ? `${img(n, 720)} 720w, ${img(n, 1080)} 1080w` : `${img(n, 720)} 720w`);
const vid = (n) => `${A}video/dsp_${n}_720.mp4`;
const poster = (n) => `${A}poster/dsp_${n}_poster.webp`;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const el = (t, c, a) => { const e = document.createElement(t); if (c) e.className = c; if (a) for (const k in a) e.setAttribute(k, a[k]); return e; };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const pad2 = (n) => String(n).padStart(2, "0");

/* ---------- language ---------- */
let lang = "de";
// Same resolution order as the index and Steinerne (platform convention): stored choice -> browser language -> DE.
try { const s = localStorage.getItem(STORAGE_KEY); if (LANGS.includes(s)) lang = s; else { const n = (navigator.language || "de").slice(0, 2).toLowerCase(); if (LANGS.includes(n)) lang = n; } } catch (e) {}
const T = () => STR[lang];
const LF = []; // text refreshers, registered once per built component
const onLang = (fn) => { LF.push(fn); fn(); };
const bind = (node, get, attr) => { onLang(() => { const v = get(T()); if (attr) node.setAttribute(attr, v); else node.textContent = v; }); return node; };

/* ---------- media (index-aligned with the text arrays in dom-i18n.js) ---------- */
const MARK_T = [0, 3.6, 10.8, 14.6, 27.2, 38.4];
const ARCH_M = [{ v: "arch_exploded" }, { v: "arch_pillars" }, { v: "arch_vault" }, { v: "arch_roof" }, { v: "arch_west_alt" }, { v: "arch_towers_alt" }];
const BAU_M = [{ v: "bau_choir" }, { v: "bau_nave" }, { v: "bau_west" }, { v: "bau_towers" }, { v: "tour_nw" }];
const KF_M = ["k03", "k04", "k05", "k06", "k07", "k08", "k10", "k11"].map((s) => ({ s }));
const GLAS_M = [{ v: "glass_light", ti: 0 }, { s: "glass_choir", ti: 0 }, { v: "glass_painter", ti: 1 }, { v: "glass_lead", ti: 1 }, { s: "glass_macro", ti: 2 }, { s: "stone_quarry", ti: 3 }, { s: "stone_wall", ti: 3 }, { v: "work_carver", ti: 4 }];
const PEOPLE_M = [{ v: "people_mason" }, { v: "people_bauhuette" }, { v: "work_master" }, { v: "work_truss" }, { v: "work_wheel" }];
const TLV_T = [0, 7, 19, 27, 37, 45, 65, 73, 79.4]; // seek positions (s) in dsp_timeline_720.mp4
const ROUTE_M = [{ v: "tour_nw" }, { v: "tour_ws" }, { v: "tour_se" }, { s: ["int_portal", "int_nave", "int_choir"] }, { v: "arch_pillars" }];
const NAV = ["rundum", "holo", "architektur", "bauabfolge", "zeitreise", "zeitleiste", "glas", "menschen", "unten", "heute"];
const GUIDE_GO = ["zeitreise", "zeitleiste", "bauabfolge", "architektur", "bauabfolge", "glas", "glas", "menschen", "unten", "heute"]; // topic -> chapter
const GUIDE_CTX = { rundum: 0, holo: 0, architektur: 3, bauabfolge: 2, zeitreise: 0, zeitleiste: 1, glas: 5, menschen: 7, unten: 8, rundgang: 3, heute: 9, ende: 9 }; // chapter -> topic

/* ---------- one shared scroll / resize dispatcher ---------- */
const SC = []; let scRaf = 0;
const runSC = () => { scRaf = 0; SC.forEach((f) => f()); };
addEventListener("scroll", () => { if (!scRaf) scRaf = requestAnimationFrame(runSC); }, { passive: true });
addEventListener("resize", () => { if (!scRaf) scRaf = requestAnimationFrame(runSC); });

/* ---------- video manager: lazy src, single primary playback ---------- */
let trailerOpen = false;
const VM = {
  list: new Map(), pause: false,
  io: new IntersectionObserver((es) => { es.forEach((e) => { const r = VM.list.get(e.target); if (!r) return; r.ratio = e.isIntersecting ? e.intersectionRatio : 0; if (e.isIntersecting) VM.load(e.target); }); VM.tick(); }, { threshold: [0, .15, .3, .45, .6, .8, 1], rootMargin: "35% 0px 35% 0px" }),
  add(v, opt = {}) { v.muted = true; v.setAttribute("playsinline", ""); v.setAttribute("muted", ""); v.preload = "none"; v.disablePictureInPicture = true; if (opt.loop !== false) v.loop = true; this.list.set(v, { ratio: 0, role: opt.role || "loop", eager: !!opt.eager }); this.io.observe(v); if (opt.eager) this.load(v); },
  remove(v) { this.io.unobserve(v); this.list.delete(v); try { v.pause(); } catch (e) {} v.removeAttribute("src"); try { v.load(); } catch (e) {} },
  load(v) { if (!v.getAttribute("src") && v.dataset.src) { v.src = v.dataset.src; v.preload = "auto"; } },
  tick() {
    if (this.pause) { this.list.forEach((r, v) => { if (r.role !== "scrub" && !v.paused) v.pause(); }); return; }
    let best = null, br = 0.42;
    this.list.forEach((r, v) => { if (r.role === "scrub" || r.hold) return; if (r.ratio >= br && r.ratio >= (r.eager ? 0.2 : br)) { best = v; br = r.ratio; } });
    this.list.forEach((r, v) => { if (r.role === "scrub") return; if (v === best) { if (!reduced && v.paused) { this.load(v); const p = v.play(); if (p && p.catch) p.catch(() => {}); } } else if (!v.paused) v.pause(); });
  }
};
document.addEventListener("visibilitychange", () => { VM.pause = document.hidden || trailerOpen; VM.tick(); });
function mkVideo(name, opt = {}) { const v = el("video"); v.dataset.src = vid(name); v.poster = poster(name); v.setAttribute("aria-hidden", "true"); VM.add(v, opt); return v; }
function mkImg(name, alt) { const i = el("img"); i.src = img(name, 720); i.srcset = srcset(name); i.sizes = "(min-width:1100px) 460px, 92vw"; i.alt = alt || ""; i.decoding = "async"; i.loading = "lazy"; return i; }
const stage = (extra = "") => el("div", "stage " + extra);
const tag = () => { const s = el("span", "dvis stage__tag"); s.textContent = T().ui.vis; return s; };
onLang(() => document.querySelectorAll(".stage__tag").forEach((s) => { s.textContent = T().ui.vis; }));

/* ---------- reveal ---------- */
const rvIO = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); rvIO.unobserve(e.target); } }), { threshold: 0.12 });
const reveal = (r) => r.querySelectorAll(".rv").forEach((n) => rvIO.observe(n));
function head(key) { const w = el("div"); const a = el("p", "deyebrow rv"), b = el("h2", "dh rv"), c = el("p", "dlead rv"); bind(a, (t) => t[key].eb); bind(b, (t) => t[key].h); bind(c, (t) => t[key].lead || t[key].p || ""); w.append(a, b, c); return w; }

/* ---------- 00 experience gate ---------- */
function buildHero() {
  const s = stage(); const v = mkVideo("holo", { eager: true }); s.append(v); $("#heroStage").append(s);
  v.addEventListener("error", () => { s.replaceChildren(mkImg("k11", "Dom St. Peter")); });
  bind($("#heroEyebrow"), (t) => t.hero.eyebrow); bind($("#heroSub"), (t) => t.hero.sub); const b = bind($("#startBtn"), (t) => t.hero.start);
  const go = () => $("#rundum").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  b.addEventListener("click", () => {
    if (!root.classList.contains("is-gated")) { go(); return; }
    root.classList.remove("is-gated"); root.classList.add("is-started");
    requestAnimationFrame(() => { runSC(); VM.tick(); requestAnimationFrame(go); });
  });
}

/* ---------- 01 master scroll ---------- */
function buildScrub() {
  const s = $("#rundum"); const intro = el("div", "dwrap dscrub__intro"); intro.append(head("scrub"));
  const track = el("div", "dscrub__track"); track.style.height = "620svh";
  const sticky = el("div", "dscrub__sticky"); const st = el("div", "stage dscrub__stage stage--contain");
  const v = el("video"); v.muted = true; v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.preload = "auto"; v.poster = poster("master"); v.dataset.src = vid("master"); v.setAttribute("aria-hidden", "true"); st.append(v, tag());
  const comp = el("div", "dscrub__compass"); MARK_T.forEach(() => comp.append(el("b")));
  const mk = el("div", "dscrub__mark"); const mi = el("div", "dscrub__mark-in"); mk.append(mi);
  const play = el("button", "dbtn dscrub__play", { type: "button" }); bind(play, (t) => t.scrub.play);
  sticky.append(st, mk, comp, play); track.append(sticky); s.append(intro, track); reveal(s);
  VM.list.set(v, { ratio: 0, role: "scrub" });
  let dur = 0, target = 0, cur = 0, mi_ = -1, ready = false, raf = 0, fallback = false;
  const fill = (k) => { const m = T().marks[k]; mi.innerHTML = `<div class="dscrub__dir">${m.k}</div><h3 class="dscrub__mt">${m.h}</h3><p class="dscrub__mp">${m.p}</p>`; };
  const mark = (t) => { let k = 0; MARK_T.forEach((x, i) => { if (t >= x) k = i; }); if (k === mi_) return; const first = mi_ < 0; mi_ = k; [...comp.children].forEach((b, i) => b.classList.toggle("is-on", i === k)); if (first) { fill(k); return; } mi.classList.add("is-out"); setTimeout(() => { fill(mi_); mi.classList.remove("is-out"); }, 180); };
  onLang(() => { [...comp.children].forEach((b, i) => { b.textContent = T().marks[i].k; }); if (mi_ >= 0) fill(mi_); });
  mark(0);
  const setFallback = () => { fallback = true; s.classList.add("is-fallback"); v.loop = true; };
  v.addEventListener("loadedmetadata", () => { dur = v.duration; ready = isFinite(dur) && dur > 1; if (!ready) setFallback(); }, { once: true });
  v.addEventListener("error", setFallback);
  play.addEventListener("click", () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); play.style.display = "none"; });
  const loop = () => { raf = 0; if (!ready || fallback) return; cur += (target - cur) * 0.16; if (Math.abs(target - cur) < 0.01) cur = target; if (Math.abs(v.currentTime - cur) > 0.03) { try { v.currentTime = cur; } catch (e) {} } mark(cur); if (cur !== target) raf = requestAnimationFrame(loop); };
  SC.push(() => { if (!track.offsetHeight) return; const r = track.getBoundingClientRect(); const tot = track.offsetHeight - innerHeight; const p = clamp(-r.top / tot, 0, 1); if (ready) { target = p * (dur - 0.05); if (!raf) raf = requestAnimationFrame(loop); } else mark(p * 43); });
  const near = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && !v.getAttribute("src")) { v.src = v.dataset.src; v.load(); near.disconnect(); } }), { rootMargin: "120% 0px" }); near.observe(track);
  if (reduced) setFallback();
}

/* ---------- 02 hologram: from the physical cathedral to its digital reading ---------- */
function buildHolo() {
  const s = $("#holo"); const w = el("div", "dwrap dnow__grid"); const st = stage("rv"); st.append(mkVideo("holo"), tag());
  const tx = el("div"); const a = el("p", "deyebrow rv"), b = el("h2", "dh rv"), c = el("p", "dlead rv"); bind(a, (t) => t.holo.eb); bind(b, (t) => t.holo.h); bind(c, (t) => t.holo.p); tx.append(a, b, c);
  w.append(st, tx); s.append(w); reveal(s);
}

/* ---------- generic scroll story: sticky 9:16 stage, scrolling advances the steps ---------- */
function buildStory(sel, key, stepsKey, MEDIA, opt = {}) {
  const s = $(sel); const intro = el("div", "dwrap dkf__intro"); intro.append(head(key));
  const n = MEDIA.length; const track = el("div", "dkf__track"); track.style.height = `calc(${n} * 74svh + 100svh)`;
  const sticky = el("div", "dkf__sticky"); const st = el("div", "stage dkf__stage");
  const layers = MEDIA.map((m, i) => { const l = el("div", "stage__layer"); const im = el("img"); im.decoding = "async"; im.loading = i < 1 ? "eager" : "lazy"; im.alt = ""; if (m.s) { im.src = img(m.s, 720); im.srcset = srcset(m.s); im.sizes = "(min-width:1100px) 460px, 92vw"; } else im.src = poster(m.v); l.append(im); st.append(l); return l; });
  st.append(tag());
  const cap = el("div", "dkf__cap"); const ci = el("div", "dkf__cap-in"); cap.append(ci);
  const count = el("div", "dkf__count"); const rail = el("div", "dkf__rail"); MEDIA.forEach(() => rail.append(el("i")));
  sticky.append(st, cap, count, rail);
  let bar = null;
  if (opt.gauge) { const g = el("div", "dgauge dgauge--story"); const lab = el("div", "dgauge__lab"); const o = el("span"), we = el("span"); bind(o, (t) => t.bau.ost); bind(we, (t) => t.bau.west); lab.append(o, we); const gb = el("div", "dgauge__bar"); bar = el("span"); gb.append(bar); g.append(lab, gb); sticky.append(g); }
  track.append(sticky); s.append(intro, track); reveal(s);
  let cur = -1, v = null, capT = -1;
  const ti = (i) => (MEDIA[i].ti != null ? MEDIA[i].ti : i);
  const fill = () => { const f = T()[stepsKey][ti(cur)]; ci.innerHTML = `<div class="dkf__date">${f.d}</div><h3 class="dkf__title">${f.t}</h3><p class="dkf__text">${f.p}</p>`; };
  function show(i) {
    if (i === cur) return; const first = cur < 0; cur = i;
    layers.forEach((l, k) => { l.classList.toggle("is-on", k === i); if (Math.abs(k - i) <= 1) l.firstChild.loading = "eager"; });
    [...rail.children].forEach((d, k) => d.classList.toggle("is-on", k === i)); count.textContent = `${pad2(i + 1)} / ${pad2(n)}`;
    if (v) { VM.remove(v); v.remove(); v = null; }
    if (MEDIA[i].v) { v = mkVideo(MEDIA[i].v); layers[i].append(v); VM.tick(); }
    if (bar) bar.style.width = `${((i + 1) / n) * 100}%`;
    if (ti(i) === capT) return; capT = ti(i);
    if (first) fill(); else { ci.classList.add("is-out"); setTimeout(() => { fill(); ci.classList.remove("is-out"); }, 220); }
  }
  show(0);
  onLang(() => { if (cur >= 0) fill(); layers.forEach((l, k) => { l.firstChild.alt = T()[stepsKey][ti(k)].t; }); });
  SC.push(() => { if (!track.offsetHeight) return; const r = track.getBoundingClientRect(); if (r.bottom < -innerHeight || r.top > innerHeight * 2) return; const tot = track.offsetHeight - innerHeight; const p = clamp(-r.top / tot, 0, 0.9999); show(Math.floor(p * n)); });
}

/* ---------- 06 timeline video ---------- */
function buildTimeline() {
  const s = $("#zeitleiste"); const w = el("div", "dwrap"); w.append(head("tl"));
  const g = el("div", "dtlv rv"); const col = el("div", "dtlv__media"); const st = stage("dtlv__stage");
  const v = el("video"); v.dataset.src = vid("timeline"); v.poster = poster("timeline"); bind(v, (t) => t.tl.videoAria, "aria-label"); VM.add(v, { loop: false, role: "timeline" });
  const rec = VM.list.get(v); rec.hold = false;
  const bar = el("div", "dtlv__bar"); bar.innerHTML = "<span></span>"; st.append(v, bar, tag());
  const ctl = el("div", "dtlv__ctl"); const bp = el("button", "dbtn", { type: "button" }); const bm = el("button", "dbtn", { type: "button", "aria-pressed": "false" }); const bt = el("button", "dbtn", { type: "button", "data-trailer": "" }); bind(bt, (t) => t.ui.trailerShort);
  const note = el("p", "dtlv__note"); bind(note, (t) => t.tl.note);
  ctl.append(bp, bm, bt); col.append(st, ctl, note);
  const side = el("div", "dtlv__side"); const chips = el("div", "dtlv__chips"); chips.setAttribute("role", "list"); const info = el("div", "dtlv__info"); info.setAttribute("aria-live", "polite"); side.append(chips, info);
  g.append(col, side); w.append(g); s.append(w); reveal(s);
  let cur = 0;
  const fill = () => { const c = T().tlv[cur]; info.innerHTML = `<div class="dtlv__y">${c.y}</div><h3 class="dtlv__h">${c.h}</h3><p class="dtlv__p">${c.p}</p>`; };
  const setCh = (k, force) => { if (k === cur && !force) return; cur = k; [...chips.children].forEach((b, i) => { b.classList.toggle("is-on", i === k); b.setAttribute("aria-current", String(i === k)); }); fill(); const on = chips.children[k]; if (on && chips.scrollWidth > chips.clientWidth) chips.scrollTo({ left: on.offsetLeft - 18, behavior: reduced ? "auto" : "smooth" }); };
  const lab = () => { bp.textContent = v.paused ? T().tl.play : T().tl.pause; bm.textContent = v.muted ? T().tl.soundOn : T().tl.soundOff; };
  TLV_T.forEach((t, i) => { const b = el("button", "dtlv__chip", { type: "button", role: "listitem" }); b.append(el("b"), el("span")); b.addEventListener("click", () => { VM.load(v); const go = () => { try { v.currentTime = t + 0.05; } catch (e) {} setCh(i, true); rec.hold = false; VM.tick(); }; if (v.readyState >= 1) go(); else v.addEventListener("loadedmetadata", go, { once: true }); }); chips.append(b); });
  onLang(() => { [...chips.children].forEach((b, i) => { const c = T().tlv[i]; b.firstChild.textContent = c.y; b.lastChild.textContent = c.h; }); fill(); lab(); note.hidden = !T().tl.note; });
  v.addEventListener("timeupdate", () => { const t = v.currentTime; let k = 0; TLV_T.forEach((x, i) => { if (t >= x) k = i; }); setCh(k); if (v.duration) bar.firstChild.style.transform = `scaleX(${t / v.duration})`; });
  v.addEventListener("play", lab); v.addEventListener("pause", lab); v.addEventListener("ended", () => { rec.hold = true; lab(); });
  bp.addEventListener("click", () => { if (v.paused) { rec.hold = false; VM.load(v); if (v.ended) v.currentTime = 0; const p = v.play(); if (p && p.catch) p.catch(() => {}); } else { rec.hold = true; v.pause(); } });
  bm.addEventListener("click", () => { v.muted = !v.muted; bm.setAttribute("aria-pressed", String(!v.muted)); lab(); });
  st.addEventListener("click", (e) => { if (e.target === v) bp.click(); });
  setCh(0, true);
}

/* ---------- 09 underground ---------- */
function buildUnder() {
  const s = $("#unten"); const w = el("div", "dwrap"); w.append(head("under"));
  const g = el("div", "dunder__grid"); const a = stage("rv"); a.append(mkVideo("under_descent"), tag());
  const b = el("div", "dunder__stills rv"); const bs = stage(); const ls = ["under_a", "under_b", "under_hall"].map((n, i) => { const l = el("div", "stage__layer" + (i === 0 ? " is-on" : "")); const im = mkImg(n); bind(im, (t) => t.under.alt, "alt"); l.append(im); bs.append(l); return l; }); bs.append(tag()); b.append(bs);
  g.append(a, b); w.append(g); s.append(w); reveal(s);
  let k = 0; if (!reduced) setInterval(() => { if (document.hidden || root.classList.contains("is-gated")) return; ls[k].classList.remove("is-on"); k = (k + 1) % ls.length; ls[k].classList.add("is-on"); }, 4200);
}

/* ---------- 10 tour (secondary detail; tabs) ---------- */
function buildRoute() {
  const s = $("#rundgang"); const w = el("div", "dwrap"); w.append(head("route"));
  const tabs = el("div", "dtabs rv"); tabs.setAttribute("role", "tablist"); const body = el("div", "droute__body"); const st = stage("droute__stage"); const cap = el("div", "droute__cap"); body.append(st, cap);
  let v = null, timer = 0, cur = 0;
  const fill = () => { const r = T().routeSteps[cur]; cap.innerHTML = `<div class="deyebrow">${pad2(cur + 1)} · ${r.l.toUpperCase()}</div><h3 class="droute__ct">${r.t}</h3><p class="droute__cp">${r.p}</p>`; };
  function pick(i) {
    cur = i; [...tabs.children].forEach((b, k) => b.setAttribute("aria-selected", String(k === i))); const m = ROUTE_M[i]; if (v) { VM.remove(v); v = null; } if (timer) { clearInterval(timer); timer = 0; } st.replaceChildren();
    if (m.v) { v = mkVideo(m.v); st.append(v); }
    else { const ls = m.s.map((n, k) => { const l = el("div", "stage__layer" + (k === 0 ? " is-on" : "")); const im = mkImg(n); im.loading = "eager"; l.append(im); st.append(l); return l; }); if (ls.length > 1 && !reduced) { let k = 0; timer = setInterval(() => { ls[k].classList.remove("is-on"); k = (k + 1) % ls.length; ls[k].classList.add("is-on"); }, 3600); } }
    st.append(tag()); fill(); VM.tick();
  }
  ROUTE_M.forEach((r, i) => { const b = el("button", "", { type: "button", role: "tab" }); b.addEventListener("click", () => pick(i)); tabs.append(b); });
  w.append(tabs, body); s.append(w); pick(0); reveal(s);
  onLang(() => { [...tabs.children].forEach((b, i) => { b.textContent = T().routeSteps[i].l; }); fill(); });
}

/* ---------- 11 today (the one HEUTE chapter) + 12 closing ---------- */
function buildNow() {
  const s = $("#heute"); const w = el("div", "dwrap dnow__grid"); const st = stage("rv"); const im = mkImg("heute"); bind(im, (t) => t.now.alt, "alt"); st.append(im, tag());
  const tx = el("div"); const a = el("p", "deyebrow rv"), b = el("h2", "dh rv"), c = el("p", "dlead rv"); bind(a, (t) => t.now.eb); bind(b, (t) => t.now.h); bind(c, (t) => t.now.lead); tx.append(a, b, c);
  w.append(st, tx); s.append(w); reveal(s);
}
function buildEnd() {
  const s = $("#ende"); const br = el("div", "dend__brand rv"); br.textContent = "ZEITSPRUNG"; const h = bind(el("h2", "dend__t rv"), (t) => t.end.h); const p = bind(el("p", "dend__p rv"), (t) => t.end.p);
  const cta = el("div", "dend__cta rv"); const a1 = bind(el("a", "dbtn dbtn--primary", { href: "../index.html" }), (t) => t.end.overview); const a2 = bind(el("a", "dbtn", { href: "../STEINERNE_BRUECKE/index.html" }), (t) => t.end.sb); const tr = bind(el("button", "dbtn", { type: "button", "data-trailer": "" }), (t) => t.ui.trailer); cta.append(a1, a2, tr);
  const note = bind(el("p", "dend__note"), (t) => t.end.note); s.append(br, h, p, cta, note); reveal(s);
}

/* ---------- trailer (kept, but only inside the experience) ---------- */
function buildTrailer() {
  const dlg = $("#trailerDlg"), box = $("#trailerStage"); bind(dlg, (t) => t.ui.trailerAria, "aria-label"); bind($("#trailerClose"), (t) => t.ui.close, "aria-label");
  document.addEventListener("click", (ev) => {
    if (!ev.target.closest("[data-trailer]") || dlg.open) return;
    box.replaceChildren(); const t = el("video"); t.controls = true; t.playsInline = true; t.preload = "metadata"; t.poster = poster("trailer"); t.src = vid("trailer"); box.append(t);
    trailerOpen = true; VM.pause = true; VM.tick(); dlg.showModal(); const p = t.play(); if (p && p.catch) p.catch(() => {});
  });
  const close = () => { try { dlg.close(); } catch (e) {} };
  $("#trailerClose").addEventListener("click", close);
  dlg.addEventListener("close", () => { const t = $("video", box); if (t) { t.pause(); t.removeAttribute("src"); } box.replaceChildren(); trailerOpen = false; VM.pause = document.hidden; VM.tick(); });
  dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); });
}

/* ---------- navigation, language switch ---------- */
let curSec = "hero";
function buildNav() {
  const n = $("#dnLinks"); bind(n, (t) => t.ui.navAria, "aria-label"); bind($("#dnBrand"), (t) => t.ui.brandAria, "aria-label"); bind($("#dnBack"), (t) => t.ui.back); bind($("#dnLang"), (t) => t.ui.langAria, "aria-label");
  NAV.forEach((id) => { const a = el("a"); a.href = `#${id}`; bind(a, (t) => t.nav[id]); n.append(a); });
  const hd = $("#dn"), pr = $("#dProg span"); const all = [...document.querySelectorAll("main > section")];
  SC.push(() => { hd.classList.toggle("is-solid", scrollY > 40); const t = root.scrollHeight - innerHeight; pr.style.transform = `scaleX(${t > 0 ? clamp(scrollY / t, 0, 1) : 0})`; let c = "hero"; all.forEach((sc) => { if (sc.offsetHeight && sc.getBoundingClientRect().top < innerHeight * 0.4) c = sc.id; }); curSec = c; [...n.children].forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === `#${c}`))); });
  $("#dnLang").addEventListener("click", (e) => { const b = e.target.closest("[data-lang]"); if (b) setLang(b.dataset.lang); });
}
function applyLang() {
  root.lang = lang; document.title = T().meta.title; const md = $('meta[name="description"]'); if (md) md.setAttribute("content", T().meta.desc);
  document.querySelectorAll("#dnLang [data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  LF.forEach((f) => f());
}
function setLang(l) {
  if (!LANGS.includes(l) || l === lang) return;
  const anchor = document.getElementById(curSec); const before = anchor ? anchor.getBoundingClientRect().top : 0;
  lang = l; try { localStorage.setItem(STORAGE_KEY, l); } catch (e) {}
  applyLang();
  if (anchor && !root.classList.contains("is-gated")) { const d = anchor.getBoundingClientRect().top - before; if (Math.abs(d) > 1) scrollBy(0, d); }
}

/* ---------- Brückmandl: contextual ZEITSPRUNG guide (Dom content, DE / EN / ES; canonical character assets reused) ---------- */
function buildGuide() {
  const fab = $("#guideFab"), pn = $("#guidePanel"); if (!fab || !pn) return;
  const B = "../assets/steinerne-bruecke/bruckmandl/ai/bruckmandl_ai_";
  pn.innerHTML = `<div class="dguide__head"><img class="dguide__av" src="${B}talk.webp" alt="" width="64" height="64" loading="lazy"><div><div class="dguide__name">BRÜCKMANDL</div><div class="dguide__role"></div></div><button class="dguide__close" type="button">×</button></div><p class="dguide__hi"></p><div class="dguide__topics"></div><p class="dguide__ctx" hidden></p><div class="dguide__ans" aria-live="polite"></div>`;
  const topics = $(".dguide__topics", pn), ans = $(".dguide__ans", pn), av = $(".dguide__av", pn), ctx = $(".dguide__ctx", pn), cls = $(".dguide__close", pn);
  let sel = -1;
  const render = () => { [...topics.children].forEach((x, k) => x.setAttribute("aria-pressed", String(k === sel))); if (sel < 0) { ans.replaceChildren(); return; } av.src = `${B}expression_03_explain.webp`; ans.innerHTML = `<p>${T().guideTopics[sel][1]}</p><a class="dguide__go" href="#${GUIDE_GO[sel]}">${T().guide.go}</a>`; };
  STR.de.guideTopics.forEach((x, i) => { const b = el("button", "dguide__topic", { type: "button", "aria-pressed": "false" }); b.addEventListener("click", () => { sel = i; ctx.hidden = true; render(); }); topics.append(b); });
  onLang(() => { const g = T().guide; pn.setAttribute("aria-label", g.aria); $("#guideFabLabel").textContent = g.fab; fab.title = g.fab; fab.setAttribute("aria-label", g.fab); $(".dguide__role", pn).textContent = g.role; $(".dguide__hi", pn).textContent = g.hi; ctx.textContent = g.ctx; cls.setAttribute("aria-label", T().ui.close); [...topics.children].forEach((b, i) => { b.textContent = T().guideTopics[i][0]; }); render(); });
  const onKey = (e) => { if (e.key === "Escape") close(); };
  function open() { const c = GUIDE_CTX[curSec]; if (c != null) { sel = c; ctx.hidden = false; render(); } pn.hidden = false; fab.setAttribute("aria-expanded", "true"); document.addEventListener("keydown", onKey); requestAnimationFrame(() => pn.classList.add("is-open")); cls.focus(); }
  function close(refocus = true) { if (pn.hidden) return; pn.classList.remove("is-open"); pn.hidden = true; fab.setAttribute("aria-expanded", "false"); document.removeEventListener("keydown", onKey); if (refocus) fab.focus(); }
  fab.addEventListener("click", () => (pn.hidden ? open() : close()));
  cls.addEventListener("click", () => close());
  ans.addEventListener("click", (e) => { if (e.target.closest(".dguide__go")) close(false); });
}

/* ---------- boot ---------- */
try { history.scrollRestoration = "manual"; } catch (e) {}
scrollTo(0, 0);
buildHero(); buildScrub(); buildHolo();
buildStory("#architektur", "arch", "archSteps", ARCH_M);
buildStory("#bauabfolge", "bau", "bauSteps", BAU_M, { gauge: true });
buildStory("#zeitreise", "kf", "frames", KF_M);
buildTimeline();
buildStory("#glas", "glas", "glasSteps", GLAS_M);
buildStory("#menschen", "people", "peopleSteps", PEOPLE_M);
buildUnder(); buildRoute(); buildNow(); buildEnd(); buildTrailer(); buildNav(); buildGuide();
applyLang();
