/* ZEITSPRUNG V2 — js/zt-film.js (07C-H, GLOBAL VIDEO / TRAILER PRESENTATION V1)
   ONE shared cinematic film player for every monument. Two modes, one implementation:
     mode "timeline" — chapter-controlled documentary film: lower documentary overlay (.zt-ov: chapter · period · title),
                       progress bar with chapter ticks, elapsed / total, chapter chips, the longer line BELOW the video,
                       PLAY / PAUSE, SOUND (only with real audio), FULLSCREEN (phones only, CSS).
     mode "trailer"  — dedicated cinematic trailer section: the approved NEUPFARRPLATZ title card (.zt-tc:
                       ZEITSPRUNG · MONUMENT · SUBTITLE · tagline) over a restrained lower gradient, muted autoplay only while
                       >= 55 % visible, paused off screen, clean restart on re-entry, ZEITSPRUNG controls.
   Rules (ZEITSPRUNG_TYPOGRAPHY_SYSTEM_V1 + VERTICAL_EXPERIENCE_STANDARD_V1 · MEDIA-FIRST DOCUMENTARY COMPOSITION):
     - no native browser controls; text is HTML (never burned in); language follows <html lang> instantly, no MP4 reload;
     - never audible autoplay: a film joins the page's ONE sound state only after the visitor touches THAT player
       (PLAY / SOUND / tap); before that it is always muted;
     - fullscreen = the same element (currentTime, chapter, language, play state preserved): native element fullscreen,
       fixed full-viewport fallback (html.zt-pfs) when the browser refuses (iPhone) — overlay + controls stay together.
   Usage: import { mountFilm } from "../js/zt-film.js";  const f = mountFilm(hostEl, { mode, src, poster, ... });
     o.sound = { isOn(), toggle(), register(video), subscribe(fn) }  (adapter onto the page's single sound state) */
import { slowNet } from "./zt-media-priority.js?v=20261125h"; // 07D: a starting film has priority on the network
const UI = {
  de: { play: "ABSPIELEN", pause: "PAUSE", on: "TON AN", off: "TON AUS", full: "VOLLBILD", exit: "SCHLIESSEN", ch: "KAPITEL", seek: "Position im Film", film: "FILM" },
  en: { play: "PLAY", pause: "PAUSE", on: "SOUND ON", off: "SOUND OFF", full: "FULLSCREEN", exit: "CLOSE", ch: "CHAPTERS", seek: "Position in the film", film: "FILM" },
  es: { play: "REPRODUCIR", pause: "PAUSA", on: "SONIDO SÍ", off: "SONIDO NO", full: "AGRANDAR", exit: "CERRAR", ch: "CAPÍTULOS", seek: "Posición en la película", film: "PELÍCULA" },
};
const lang = () => { const l = (document.documentElement.lang || "de").slice(0, 2).toLowerCase(); return UI[l] ? l : "de"; };
const U = () => UI[lang()];
const fmt = (s) => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
const mk = (tag, cls, attrs) => { const e = document.createElement(tag); if (cls) e.className = cls; if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
const REDUCED = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** 07D: on a slow or data-saving connection (slowNet) the same film is taken from its smaller derivative (o.srcLite), decided once when the film is first needed */
export function mountFilm(host, o = {}) {
  if (!host) return null;
  const trailer = o.mode === "trailer";
  const cues = Array.isArray(o.cues) ? o.cues : [];
  const root = mk("div", "ztf ztf--" + (trailer ? "trailer" : "timeline"));
  let hE, hH, hP;
  if (o.head) { const hd = mk("div", "ztf__head"); hE = mk("p", "ztf__eyebrow"); hH = mk("h2", "ztf__title"); hP = mk("p", "ztf__lead"); hd.append(hE, hH, hP); root.append(hd); }
  const box = mk("div", "ztf__box");
  const stage = mk("div", "ztf__stage");
  const po = mk("img", "ztf__poster", { alt: "", loading: "lazy", decoding: "async", draggable: "false" }); if (o.poster) po.src = o.poster;
  const v = mk("video", "ztf__video", { playsinline: "", preload: "none", disablepictureinpicture: "", controlslist: "nodownload noplaybackrate", tabindex: "-1" });
  v.muted = true; v.setAttribute("muted", "");
  // documentary overlay (timeline) or cinematic title card (trailer)
  let ov, ok, op, os, ot, tk, tn, ts, tl;
  if (trailer) { ov = mk("div", "zt-tc", { "aria-hidden": "true" }); tk = mk("p", "zt-tc__k"); tn = mk("p", "zt-tc__n"); ts = mk("p", "zt-tc__s"); tl = mk("p", "zt-tc__l"); ov.append(tk, tn, ts, tl); }
  else { ov = mk("div", "zt-ov", { "aria-hidden": "true" }); ok = mk("p", "zt-ov__k"); op = mk("p", "zt-ov__p"); os = mk("p", "zt-ov__s"); ot = mk("p", "zt-ov__t"); ov.append(ok, op, os, ot); ov.hidden = true; }
  const big = mk("button", "ztf__big", { type: "button" }); big.append(mk("span", "", { "aria-hidden": "true" }));
  const fsbar = mk("div", "ztf__fsbar"); const fsPlay = mk("button", "ztf__btn", { type: "button" }); const fsExit = mk("button", "ztf__btn", { type: "button" }); fsbar.append(fsPlay, fsExit);
  stage.append(po, v, ov, big, fsbar);
  // control panel
  const panel = mk("div", "ztf__panel");
  const row = mk("div", "ztf__row"); const rl = mk("span"); const time = mk("span", "ztf__time"); row.append(rl, time);
  const bar = mk("div", "ztf__bar", { role: "slider", tabindex: "0", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": "0" });
  const fill = mk("span", "ztf__fill"); const ticks = mk("div", "ztf__ticks", { "aria-hidden": "true" }); bar.append(ticks, fill);
  const chips = mk("div", "ztf__chips", { role: "group" });
  const now = mk("p", "ztf__now", { "aria-live": "polite" });
  const ctl = mk("div", "ztf__ctl"); const bp = mk("button", "ztf__btn ztf__btn--play", { type: "button" }); ctl.append(bp);
  const bs = o.hasAudio && o.sound ? mk("button", "ztf__btn ztf__btn--snd", { type: "button", "aria-pressed": "false" }) : null; if (bs) ctl.append(bs);
  const bf = mk("button", "ztf__btn ztf__btn--fs", { type: "button" }); ctl.append(bf);
  panel.append(row, bar);
  if (!trailer) panel.append(chips, now);
  panel.append(ctl);
  box.append(stage, panel); root.append(box); host.append(root);

  const durFallback = +o.duration || 0;
  const dur = () => (isFinite(v.duration) && v.duration > 0 ? v.duration : durFallback);
  const chapter = (i) => (o.chapter && i >= 0 ? o.chapter(i) : null);
  const chipIdx = [];
  if (!trailer) cues.forEach((c, i) => { if (!chapter(i)) return; const t = mk("i"); t.style.left = (durFallback ? (c / durFallback) * 100 : 0) + "%"; ticks.append(t); const b = mk("button", "ztf__chip", { type: "button" }); b.dataset.i = String(i); chips.append(b); chipIdx.push(i); });

  // ---- playback ----
  let attached = false, engaged = false, cur = -2, userPaused = false, vis = false;
  let warm = false, busy = false, busyT = 0;
  const focusOn = () => { if (busy) return; busy = true; document.dispatchEvent(new CustomEvent("zt:film-focus")); clearTimeout(busyT); busyT = setTimeout(focusOff, 20000); };
  const focusOff = () => { if (!busy) return; busy = false; clearTimeout(busyT); document.dispatchEvent(new CustomEvent("zt:film-free")); };
  // 07D: the index of the file (moov) is fetched when the film comes near, so PLAY only has to fetch pictures
  let file = ""; const pick = () => file || (file = o.srcLite && slowNet() ? o.srcLite : o.src);
  const warmUp = () => { if (warm || attached) return; warm = true; v.preload = "metadata"; v.src = pick(); };
  const attach = () => { if (attached) return; attached = true; focusOn(); v.preload = "auto"; if (!v.getAttribute("src")) { delete v.dataset.ztSrc; v.src = pick(); } else if (v.networkState === 3 || v.error) { v.src = pick(); v.load(); } };
  const engage = () => { if (engaged || !bs) return; engaged = true; o.sound.register(v); };
  const play = (user) => { if (user) { engage(); userPaused = false; } attach(); const p = v.play(); if (p && p.catch) p.catch(() => { if (!v.muted) { v.muted = true; const q = v.play(); if (q && q.catch) q.catch(() => {}); } }); };
  const pause = (user) => { if (user) userPaused = true; v.pause(); };
  const toggle = () => { if (v.paused) play(true); else pause(true); };
  v.addEventListener("playing", () => { stage.classList.add("is-playing", "has-started"); paint(); });
  v.addEventListener("pause", () => { stage.classList.remove("is-playing"); focusOff(); paint(); });
  // network priority ends once the film runs with a few seconds in reserve
  v.addEventListener("progress", () => { if (!busy || v.paused || !v.buffered.length) return; const e = v.buffered.end(v.buffered.length - 1); if (e - v.currentTime > 8 || e >= v.duration - 0.5) focusOff(); });
  v.addEventListener("waiting", () => { if (attached && !v.paused && stage.classList.contains("has-started")) focusOn(); stage.classList.add("is-waiting"); });
  ["playing", "pause", "error"].forEach((n) => v.addEventListener(n, () => stage.classList.remove("is-waiting")));
  v.addEventListener("ended", () => { stage.classList.remove("is-playing"); v.dataset.done = "1"; paint(); });
  let tries = 0;
  v.addEventListener("error", () => { focusOff(); stage.classList.remove("is-playing"); if (attached && tries < 2 && v.getAttribute("src")) { tries++; const t = v.currentTime || 0, run = stage.classList.contains("has-started") && !userPaused; setTimeout(() => { v.src = pick(); v.load(); v.addEventListener("loadedmetadata", () => { try { v.currentTime = t; } catch (e) {} if (run && vis) play(false); }, { once: true }); }, 1200 * tries); return; } if (attached) stage.classList.add("is-error"); });
  [bp, big, fsPlay].forEach((b) => b.addEventListener("click", toggle));
  v.addEventListener("click", toggle);
  if (bs) bs.addEventListener("click", () => { engage(); o.sound.toggle(); if (o.sound.isOn() && v.paused && attached && !v.dataset.done) play(true); paint(); });

  // ---- chapters / progress ----
  const chapterAt = (sec) => { let k = -1; cues.forEach((c, j) => { if (sec >= c - 0.01) k = j; }); return k; };
  const paintChapter = (force) => {
    if (trailer) return;
    const i = chapterAt(v.currentTime || 0); if (i === cur && !force) return; const changed = i !== cur; cur = i;
    const c = chapter(i);
    chips.querySelectorAll(".ztf__chip").forEach((b) => b.setAttribute("aria-current", String(+b.dataset.i === i)));
    if (!c || !stage.classList.contains("has-started")) { ov.hidden = true; now.textContent = ""; return; }
    ok.textContent = c.k || ""; op.textContent = c.p || ""; os.textContent = c.s || ""; ot.textContent = c.t || ""; ov.hidden = false;
    now.replaceChildren(); const b = mk("b"); b.textContent = [c.s, c.t].filter(Boolean).join(" — "); now.append(b); if (c.d) now.append(document.createTextNode(" " + c.d));
    if (changed) { ov.classList.remove("is-new"); void ov.offsetWidth; ov.classList.add("is-new"); }
  };
  const progress = () => { const d = dur(), c = v.currentTime || 0; fill.style.transform = "scaleX(" + (d ? Math.min(1, c / d) : 0) + ")"; bar.setAttribute("aria-valuenow", String(Math.round((d ? c / d : 0) * 100))); bar.setAttribute("aria-valuetext", fmt(c) + " / " + fmt(d)); time.textContent = fmt(c) + " / " + fmt(d); };
  // MODE A title card = opening + closing moment only (media first): visible on the poster, the first 4.5 s, the last 3 s
  // and whenever paused; it fades out while the middle of the film plays so the architecture stays the protagonist.
  const quiet = () => { if (!trailer) return; const d = dur(), c = v.currentTime || 0; ov.classList.toggle("is-quiet", !v.paused && c > 4.5 && (!d || c < d - 3)); };
  v.addEventListener("timeupdate", () => { progress(); paintChapter(false); quiet(); });
  v.addEventListener("pause", quiet);
  v.addEventListener("loadedmetadata", progress);
  v.addEventListener("seeked", () => paintChapter(true));
  v.addEventListener("playing", () => paintChapter(true));
  const seek = (sec) => { attach(); const d = dur(); sec = Math.min(Math.max(0, sec), Math.max(0, d - 0.2)); const go = () => { try { v.currentTime = sec; } catch (e) {} }; if (v.readyState >= 1) go(); else v.addEventListener("loadedmetadata", go, { once: true }); };
  chips.addEventListener("click", (e) => { const b = e.target.closest(".ztf__chip"); if (!b) return; seek(cues[+b.dataset.i] + 0.05); stage.classList.add("has-started"); play(true); paintChapter(true); });
  bar.addEventListener("click", (e) => { const r = bar.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * dur()); });
  bar.addEventListener("keydown", (e) => { const c = v.currentTime || 0; if (e.key === "ArrowRight") { e.preventDefault(); seek(c + 5); } else if (e.key === "ArrowLeft") { e.preventDefault(); seek(c - 5); } else if (e.key === "Home") { e.preventDefault(); seek(0); } });

  // ---- fullscreen (same element; native first, fixed-layer fallback) ----
  const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
  const isFs = () => fsEl() === stage || stage.classList.contains("is-pfs");
  const onKey = (e) => { if (e.key === "Escape") exitFs(); };
  const pseudo = (on) => { stage.classList.toggle("is-pfs", on); document.documentElement.classList.toggle("zt-pfs", on); if (on) document.addEventListener("keydown", onKey); else document.removeEventListener("keydown", onKey); paint(); };
  const enterFs = () => { const req = stage.requestFullscreen || stage.webkitRequestFullscreen; if (!req) { pseudo(true); return; }
    const fb = () => { if (fsEl() !== stage && !stage.classList.contains("is-pfs")) pseudo(true); };
    try { const r = req.call(stage); if (r && r.catch) r.catch(fb); } catch (e) { fb(); } setTimeout(fb, 700); };
  const exitFs = () => { if (stage.classList.contains("is-pfs")) { pseudo(false); return; } if (document.exitFullscreen) document.exitFullscreen().catch(() => {}); else if (document.webkitExitFullscreen) document.webkitExitFullscreen(); };
  bf.addEventListener("click", () => { if (isFs()) exitFs(); else enterFs(); });
  fsExit.addEventListener("click", exitFs);
  ["fullscreenchange", "webkitfullscreenchange"].forEach((ev) => document.addEventListener(ev, () => { stage.classList.toggle("is-fs", fsEl() === stage); paint(); }));

  // ---- visibility: trailer = muted autoplay at >= 55 %; timeline = pause off screen ----
  if (!trailer) new IntersectionObserver((es, i) => { if (es.some((e) => e.isIntersecting)) { i.disconnect(); warmUp(); } }, { rootMargin: "60% 0px" }).observe(stage);
  // the visitor has arrived at the film: its index comes first, everything else waits (at most 3 s, or until PLAY)
  if (!trailer) { let arrT = 0; new IntersectionObserver((es, i) => { const e = es[es.length - 1]; clearTimeout(arrT); if (attached || v.readyState >= 1) { i.disconnect(); return; } if (e.intersectionRatio >= 0.3) arrT = setTimeout(() => { i.disconnect(); if (attached) return; warmUp(); focusOn(); const off = () => { if (!attached) focusOff(); }; v.addEventListener("loadedmetadata", off, { once: true }); setTimeout(off, 3000); }, 160); }, { threshold: [0, 0.3] }).observe(stage); }
  const auto = trailer && o.autoplay !== false && !REDUCED();
  new IntersectionObserver((es) => es.forEach((en) => {
    vis = en.isIntersecting && en.intersectionRatio >= (trailer ? 0.55 : 0.01);
    if (isFs()) return;
    if (vis) {
      // re-entry autoplay only while it would stay silent (never audible autoplay)
      if (auto && !userPaused && (!engaged || v.muted)) { if (v.dataset.done) { delete v.dataset.done; try { v.currentTime = 0; } catch (x) {} } play(false); }
    } else { if (!v.paused) v.pause(); userPaused = false; }
  }), { threshold: [0, 0.01, 0.55] }).observe(stage);

  // ---- labels (DE / EN / ES, instant, no reload) ----
  function paint() {
    const u = U(), pl = v.paused ? u.play : u.pause;
    bp.textContent = pl; fsPlay.textContent = pl; fsExit.textContent = u.exit; bf.textContent = isFs() ? u.exit : u.full;
    big.setAttribute("aria-label", u.play); bar.setAttribute("aria-label", u.seek); chips.setAttribute("aria-label", u.ch);
    if (bs) { const on = !!o.sound.isOn(); bs.textContent = on ? u.on : u.off; bs.setAttribute("aria-pressed", String(on)); }
  }
  const relabel = () => {
    paint();
    rl.textContent = trailer ? (o.label ? o.label() : u_film()) : U().ch;
    if (o.head) { const h = o.head(); hE.textContent = h.e || ""; hH.textContent = h.h || ""; hP.textContent = h.p || ""; hP.hidden = !h.p; }
    if (trailer && o.titleCard) { const c = o.titleCard(); tk.textContent = c.k || "ZEITSPRUNG"; tn.textContent = c.n || ""; ts.textContent = c.s || ""; tl.textContent = c.l || ""; }
    if (o.alt) v.setAttribute("aria-label", o.alt());
    chips.querySelectorAll(".ztf__chip").forEach((b) => { const c = chapter(+b.dataset.i); b.textContent = c ? (c.chip || c.s || "") : ""; if (c) b.setAttribute("aria-label", [c.k, c.s, c.t].filter(Boolean).join(" · ")); });
    paintChapter(true); progress();
  };
  const u_film = () => U().film;
  new MutationObserver(relabel).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  if (bs && o.sound.subscribe) o.sound.subscribe(paint);
  relabel();
  return { root, stage, video: v, play: () => { stage.classList.add("has-started"); play(true); }, pause: () => pause(true), relabel };
}

/** adapter onto js/zt-sound.js (Dom, Porta, Rathaus, Neupfarrplatz) */
export const ztSoundAdapter = (ztSound) => ({ isOn: () => ztSound.on, toggle: () => ztSound.toggle(), register: (v) => ztSound.add(v), subscribe: (fn) => ztSound.subscribe(fn) });
