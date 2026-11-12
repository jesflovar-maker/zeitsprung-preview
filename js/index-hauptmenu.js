/* ZEITSPRUNG V2 — js/index-hauptmenu.js
   ============================================================================
   INDEX HAUPTMENÜ V1 (2026-11-11) — the permanent monument navigation system.
   See 01_ARCHITECTURE/ZEITSPRUNG_INDEX_HAUPTMENU_STANDARD.md.

   "Hauptmenü" is the INTERNAL name of this navigation concept — it is never
   shown as a public title. Position in the index: directly AFTER the
   cinematic intro and BEFORE Vision / Mission / Objective.

     five PORTRAIT (9:16) monument cards  ->  ONE stage for the selected monument:
       active monument : its FULL timeline film + progress (+ chapters when the
                         monument already has chapter data) + "Erlebnis starten"
       future monument : identity image + "in preparation" (no fake timeline)

   DATA — monuments.config.json only (name / subtitle / description / cta /
   route / poster + the additive `menu_order` and `menu_timeline`). Nothing is
   hard-coded per monument here; a future monument becomes active by setting
   enabled + route + menu_timeline in that file.

   MEDIA — `menu_timeline.src` points at the SAME runtime file the monument
   page already plays. This module never copies or re-encodes video.
   Chapter LABELS are read from the monument's own i18n module (read-only
   dynamic import); chapter TIMES come from the config. No chapters are
   invented: a monument without chapter data simply gets none.

   PLAYBACK — there is exactly ONE <video> element, so two timelines can never
   play at once. Muted by default; sound only by explicit toggle. preload="none":
   only the selected monument's film is ever requested, and only once it is
   in view (muted autoplay) or the visitor presses play. Paused when it leaves
   the viewport or the tab is hidden. The last position per monument is kept.

   ORBIT (ZEITSPRUNG_ORBIT_SELECTOR_V1, 2026-11-12, INDEX ONLY) — the five
   portrait cards sit on a flattened ellipse around the editorial line. Cards
   only TRAVEL (translate3d + scale + opacity); they never rotate and stay
   upright. The selected card is always the front-most. Ambient motion is a slow
   sweep (one cycle = ORBIT_CYCLE_S) around the selected card; it pauses on
   hover, keyboard focus, drag/touch and timeline interaction (play, seek,
   chapter, mute), and resumes gently. prefers-reduced-motion: static orbit, no rAF, no ambient, no easing.
   Selecting a card never navigates — it only updates the stage below.

   LIFECYCLE — built once. Language changes (observed on <html lang>) only
   rewrite text: selection, source and playback position are untouched.
   Observers: IntersectionObserver x2 (stage video, orbit visibility),
   ResizeObserver (orbit geometry), MutationObserver (<html lang>), one
   visibilitychange listener. requestAnimationFrame runs ONLY while the orbit is
   on screen and moving. One short timer (resume delay) after an interaction.
   No scroll / window-resize listeners.
   ============================================================================ */
import { t } from "./index-i18n.js";
import { ZT_PATHS } from "./zt-paths.js";

const CONFIG_URL = "./monuments.config.json";
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const langNow = () => { const l = (document.documentElement.lang || "de").slice(0, 2).toLowerCase(); return ["de", "en", "es"].includes(l) ? l : "de"; };
const pick = (o, l) => (o ? (o[l] !== undefined ? o[l] : o.de || "") : "");
const mk = (tag, cls, attrs) => { const e = document.createElement(tag); if (cls) e.className = cls; if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
const fmt = (s) => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
const ORBIT_CYCLE_S = 48;     // one ambient cycle (target 35–60 s)
const ORBIT_SWEEP_DEG = 12;   // ambient sweep either side of the selected card (< 36° so the selected card stays front-most and near the centre)
const RESUME_MS = 2500;       // quiet time before the ambient orbit resumes
const resolve = (tl, p) => (tl.base === "assets_root" ? ZT_PATHS.assetsRoot : tl.base === "web_root" ? ZT_PATHS.webRoot : "") + p;

async function init() {
  const cardsHost = document.getElementById("hmCards"), stageHost = document.getElementById("hmStage"), hm = document.getElementById("hauptmenu");
  if (!cardsHost || !stageHost) return;
  let monuments = [];
  try { monuments = ((await (await fetch(CONFIG_URL, { cache: "no-store" })).json()).monuments || []).slice(); }
  catch (err) { console.error("ZEITSPRUNG Hauptmenü: could not load monuments.config.json", err); return; }
  monuments.sort((a, b) => (a.menu_order ?? a.order) - (b.menu_order ?? b.order));
  if (!monuments.length) return;
  const isActive = (m) => !!(m.enabled && m.route && m.menu_timeline && m.menu_timeline.src);

  /* ---------- cards ---------- */
  const cards = monuments.map((m, i) => {
    const b = mk("button", "hm__card " + (isActive(m) ? "hm__card--active" : "hm__card--future"), { type: "button", role: "tab", id: "hmTab-" + m.id, "aria-controls": "hmStage", "aria-selected": "false", tabindex: "-1" });
    const th = mk("span", "hm__card-thumb"); const im = mk("img", "", { alt: "", loading: "lazy", decoding: "async", draggable: "false" }); im.src = m.visual || m.poster || ""; if (m.menu_focus) im.style.objectPosition = m.menu_focus; th.appendChild(im);
    const tx = mk("span", "hm__card-text"); const no = mk("span", "hm__card-no"); no.textContent = String(i + 1).padStart(2, "0"); const nm = mk("span", "hm__card-name"); const st = mk("span", "hm__card-status");
    const plate = mk("span", "hm__card-plate zs-glass zs-glass--plate zs-glass--still"); plate.appendChild(nm); plate.appendChild(st);
    tx.appendChild(no); tx.appendChild(plate); b.appendChild(th); b.appendChild(tx); cardsHost.appendChild(b);
    return { m, b, nm, st };
  });

  /* ---------- stage (built once) ---------- */
  const media = mk("div", "hm__media");
  const posterImg = mk("img", "hm__poster", { alt: "", decoding: "async", draggable: "false" });
  const video = mk("video", "hm__video", { playsinline: "", preload: "none", disablepictureinpicture: "", controlslist: "nodownload noplaybackrate" }); video.muted = true; video.setAttribute("muted", "");
  const bigPlay = mk("button", "hm__bigplay", { type: "button" }); bigPlay.appendChild(mk("span", "hm__bigplay-icon", { "aria-hidden": "true" }));
  const soon = mk("div", "hm__soonflag");
  media.appendChild(posterImg); media.appendChild(video); media.appendChild(bigPlay); media.appendChild(soon);
  const info = mk("div", "hm__info");
  const count = mk("p", "hm__count"); const sub = mk("p", "hm__sub"); const name = mk("h2", "hm__name"); const desc = mk("p", "hm__desc");
  const tl = mk("div", "hm__tl zs-glass zs-glass--flat"); const tlHead = mk("div", "hm__tl-head"); const tlLabel = mk("span", "hm__tl-label"); const tlTime = mk("span", "hm__tl-time"); tlHead.appendChild(tlLabel); tlHead.appendChild(tlTime);
  const bar = mk("div", "hm__bar", { role: "slider", tabindex: "0", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": "0" }); const fill = mk("span", "hm__bar-fill"); bar.appendChild(fill);
  const chapters = mk("div", "hm__chapters", { role: "group" });
  const chapterNow = mk("p", "hm__chapter-now"); chapterNow.setAttribute("aria-live", "polite");
  const ctl = mk("div", "hm__ctl"); const bp = mk("button", "hm__btn zs-glass-control", { type: "button" }); const bm = mk("button", "hm__btn zs-glass-control", { type: "button", "aria-pressed": "false" }); ctl.appendChild(bp); ctl.appendChild(bm);
  const note = mk("p", "hm__note");
  tl.appendChild(tlHead); tl.appendChild(bar); tl.appendChild(chapters); tl.appendChild(chapterNow); tl.appendChild(ctl); tl.appendChild(note);
  const soonText = mk("p", "hm__soontext");
  const cta = mk("a", "hm__cta zs-glass-cta");
  info.appendChild(count); info.appendChild(sub); info.appendChild(name); info.appendChild(desc); info.appendChild(tl); info.appendChild(soonText); info.appendChild(cta);
  stageHost.appendChild(media); stageHost.appendChild(info);


  /* ---------- orbit (INDEX only) ---------- */
  const N = cards.length, SLOT = (2 * Math.PI) / N;            // 72° between cards
  const orbitOn = true;                                       // the engine is always on; reduced motion = static render
  hm.classList.add("hm--orbit");
  const wrap = (d) => ((((d + N / 2) % N) + N) % N) - N / 2;   // -> [-N/2, N/2)
  const geo = { rx: 0, ry: 0, w: 0, h: 0, s0: 0.72, px: 1 };
  let phase = 0, tgt = 0, drift = 0, gain = 0, tAcc = 0, last = 0, raf = 0, orbitInView = false, resumeAt = 0, dragSuppress = false, rtimer = 0;
  const holds = new Set();
  const ambientOK = () => !reduced() && holds.size === 0 && performance.now() >= resumeAt && orbitInView && document.visibilityState === "visible";
  function measure() {
    const cw = cardsHost.clientWidth, w = cards[0].b.offsetWidth; if (!cw || !w) return;
    const narrow = cw < 640;
    geo.w = w; geo.h = (w * 16) / 9; geo.s0 = narrow ? 0.76 : 0.7; geo.rx = narrow ? 0.4 * cw : Math.min(0.41 * cw, 2.7 * w); geo.ry = 0.1 * geo.h; geo.px = Math.max(40, w * 0.75);
    cardsHost.style.setProperty("--hm-orbit-h", Math.round(geo.h + 24) + "px");
    cardsHost.style.setProperty("--hm-rx", Math.round(geo.rx) + "px"); cardsHost.style.setProperty("--hm-ry", Math.round(geo.ry * 2) + "px");
  }
  function render(ph) {
    if (!geo.w) return;
    for (let i = 0; i < N; i++) {
      const th = wrap(i - ph) * SLOT, z = Math.cos(th), t = (z + 1) / 2, sc = geo.s0 + (1 - geo.s0) * t * t;
      const e = cards[i].b; e.style.transform = "translate3d(" + (geo.rx * Math.sin(th)).toFixed(1) + "px," + (-geo.ry * (1 - t)).toFixed(1) + "px,0) scale(" + sc.toFixed(4) + ")";
      e.style.opacity = (0.76 + 0.24 * t).toFixed(3); e.style.zIndex = String(2 + Math.round(t * 100)); e.style.setProperty("--t", t.toFixed(3));
    }
  }
  function frame(ts) {
    raf = 0; const dt = Math.min(0.05, last ? (ts - last) / 1000 : 0.016); last = ts;
    if (reduced()) phase = tgt; else phase += (tgt - phase) * (1 - Math.exp(-dt / 0.3));
    if (Math.abs(tgt - phase) < 0.0006) phase = tgt;
    const want = ambientOK(); gain += ((want ? 1 : 0) - gain) * (1 - Math.exp(-dt / (want ? 1.2 : 0.45))); if (!want && gain < 0.002) gain = 0;
    tAcc += dt * gain;
    drift = reduced() ? 0 : (ORBIT_SWEEP_DEG / (360 / N)) * Math.sin((2 * Math.PI * tAcc) / ORBIT_CYCLE_S); render(phase + drift);
    if (orbitInView && document.visibilityState === "visible" && (phase !== tgt || gain > 0 || ambientOK())) raf = requestAnimationFrame(frame); else last = 0;
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  function orbitTo(idx, instant) { if (idx < 0) return; tgt = (instant && !geo.w ? idx : phase + wrap(idx - phase)); if (instant) { phase = tgt = idx; } if (!geo.w) return; if (instant || reduced()) { phase = tgt; render(phase + drift); } else kick(); }
  function nudgeOrbit() { resumeAt = performance.now() + RESUME_MS; clearTimeout(rtimer); rtimer = setTimeout(kick, RESUME_MS + 80); } // timeline interaction: ambient motion rests, then resumes
  function holdOrbit(k, on) { if (on) holds.add(k); else { holds.delete(k); resumeAt = performance.now() + RESUME_MS; clearTimeout(rtimer); rtimer = setTimeout(kick, RESUME_MS + 80); } }
  new ResizeObserver(() => { measure(); render(phase + drift); }).observe(cardsHost);
  new IntersectionObserver((es) => { es.forEach((e) => { orbitInView = e.isIntersecting; }); if (orbitInView) kick(); }, { threshold: 0 }).observe(cardsHost);
  cardsHost.addEventListener("pointerenter", () => holdOrbit("hover", true));
  cardsHost.addEventListener("pointerleave", () => holdOrbit("hover", false));
  cardsHost.addEventListener("focusin", (e) => { if (e.target.matches && e.target.matches(":focus-visible")) holdOrbit("focus", true); });
  cardsHost.addEventListener("focusout", () => holdOrbit("focus", false));
  // gentle drag / swipe — horizontal only (touch-action: pan-y keeps vertical page scroll), snaps to the nearest card
  let drag = null;
  cardsHost.addEventListener("pointerdown", (e) => { if (e.pointerType === "mouse" && e.button !== 0) return; drag = { id: e.pointerId, x: e.clientX, p0: tgt, moved: false }; });
  cardsHost.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return; const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 8) { drag.moved = true; try { cardsHost.setPointerCapture(e.pointerId); } catch (er) {} holdOrbit("drag", true); }
    if (drag.moved) { tgt = drag.p0 - dx / geo.px; phase = tgt; render(phase + drift); }
  });
  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return; const d = drag; drag = null; if (!d.moved) return;
    try { cardsHost.releasePointerCapture(e.pointerId); } catch (er) {}
    dragSuppress = true; setTimeout(() => { dragSuppress = false; }, 60);
    const idx = ((Math.round(tgt) % N) + N) % N; select(cards[idx].m); tgt = Math.round(tgt); orbitTo(idx); holdOrbit("drag", false);
  };
  cardsHost.addEventListener("pointerup", endDrag); cardsHost.addEventListener("pointercancel", endDrag);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") kick(); });
  matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", () => { if (reduced()) { phase = tgt; drift = 0; render(phase); } else kick(); });

  /* ---------- state ---------- */
  let sel = null;                 // selected monument
  const pos = new Map();          // id -> last currentTime
  const labels = new Map();       // id -> { de:[{y,h}], en:[...], es:[...] } once loaded
  let userPaused = false, inView = false, chIdx = -1;
  const tlOf = (m) => (isActive(m) ? m.menu_timeline : null);
  const chTimes = () => { const c = sel && tlOf(sel) && tlOf(sel).chapters; return c && Array.isArray(c.times) ? c.times : null; };
  const dur = () => (isFinite(video.duration) && video.duration > 0 ? video.duration : (sel && tlOf(sel) ? tlOf(sel).duration_s || 0 : 0));

  function ensureSrc() { const tlm = sel && tlOf(sel); if (!tlm) return false; if (!video.getAttribute("src")) { video.src = resolve(tlm, tlm.src); video.preload = "metadata"; const at = pos.get(sel.id) || 0; if (at > 0.2) video.addEventListener("loadedmetadata", () => { try { video.currentTime = at; } catch (e) {} }, { once: true }); } return true; }
  function play() { if (!ensureSrc()) return; const p = video.play(); if (p && p.catch) p.catch(() => {}); }
  function autoplayMaybe() { if (inView && !userPaused && !reduced() && sel && tlOf(sel) && video.paused && document.visibilityState === "visible") play(); }

  function renderChapters() {
    const l = langNow(); const times = chTimes(); const lab = sel && labels.get(sel.id);
    chapters.replaceChildren(); chapters.hidden = !(times && lab);
    if (chapters.hidden) { chapterNow.textContent = ""; return; }
    chapters.setAttribute("aria-label", t(l, "hmChapters"));
    times.forEach((tm, i) => { const c = (lab[l] || lab.de || [])[i]; if (!c) return; const b = mk("button", "hm__chapter zs-glass-control", { type: "button" }); b.dataset.i = String(i); b.textContent = c.y; b.title = c.h; b.setAttribute("aria-label", c.y + " — " + c.h); chapters.appendChild(b); });
    markChapter(true);
  }
  function markChapter(force) {
    const times = chTimes(); const lab = sel && labels.get(sel.id); if (!times || !lab) return;
    const cur = pos.get(sel.id) || 0; let k = 0; times.forEach((x, i) => { if (cur >= x) k = i; });
    if (k === chIdx && !force) return; chIdx = k;
    [...chapters.children].forEach((b) => b.setAttribute("aria-current", String(+b.dataset.i === k)));
    const c = (lab[langNow()] || lab.de || [])[k]; chapterNow.textContent = c ? c.y + " — " + c.h : "";
  }
  function renderProgress() {
    const d = dur(), cur = sel ? pos.get(sel.id) || 0 : 0; const f = d ? Math.min(1, cur / d) : 0;
    fill.style.transform = "scaleX(" + f + ")"; bar.setAttribute("aria-valuenow", String(Math.round(f * 100))); bar.setAttribute("aria-valuetext", fmt(cur) + " / " + fmt(d));
    tlTime.textContent = fmt(cur) + " / " + fmt(d);
  }
  function relabel() {
    const l = langNow();
    cardsHost.setAttribute("aria-label", t(l, "hmMenuAria"));
    cards.forEach(({ m, nm, st }) => { nm.textContent = pick(m.name, l); st.textContent = isActive(m) ? pick(m.subtitle, l) : t(l, "hmSoon"); });
    if (!sel) return;
    const act = isActive(sel), tlm = tlOf(sel);
    count.textContent = String(monuments.indexOf(sel) + 1).padStart(2, "0") + " / " + String(monuments.length).padStart(2, "0");
    sub.textContent = pick(sel.subtitle, l); name.textContent = pick(sel.name, l); desc.textContent = pick(sel.description, l);
    stageHost.setAttribute("aria-labelledby", "hmTab-" + sel.id);
    tlLabel.textContent = t(l, "hmTimeline"); bar.setAttribute("aria-label", t(l, "hmSeek"));
    video.setAttribute("aria-label", t(l, "hmFilmAria") + " — " + pick(sel.name, l));
    bp.textContent = video.paused ? t(l, "hmPlay") : t(l, "hmPause"); bigPlay.setAttribute("aria-label", t(l, "hmPlay"));
    bm.textContent = video.muted ? t(l, "hmSoundOn") : t(l, "hmSoundOff");
    // burned-in caption disclosure — only when the film's language is not the visitor's
    const bt = tlm ? tlm.burned_text || "" : ""; note.textContent = !bt || bt.split("+").includes(l) ? "" : t(l, bt === "de" ? "hmNoteDe" : "hmNoteDeEn"); note.hidden = !note.textContent;
    soon.textContent = t(l, "hmSoon"); soonText.textContent = t(l, "hmSoonText");
    cta.textContent = pick(sel.cta, l);
    renderChapters(); renderProgress();
  }
  function select(m, focus, silent) {
    if (sel === m) return;
    if (sel) { if (tlOf(sel)) pos.set(sel.id, video.currentTime || pos.get(sel.id) || 0); try { video.pause(); } catch (e) {} }
    video.removeAttribute("src"); try { video.load(); } catch (e) {}
    sel = m; userPaused = false; chIdx = -1;
    cards.forEach(({ m: x, b }) => { const on = x === m; b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; b.classList.toggle("is-selected", on); if (on && focus) b.focus({ preventScroll: true }); if (on && !silent && !orbitOn && cardsHost.scrollWidth > cardsHost.clientWidth) cardsHost.scrollTo({ left: b.offsetLeft - (cardsHost.clientWidth - b.offsetWidth) / 2, behavior: reduced() ? "auto" : "smooth" }); });
    const act = isActive(m), tlm = tlOf(m);
    stageHost.classList.toggle("hm__stage--future", !act); media.classList.remove("is-playing", "has-started");
    posterImg.src = tlm && tlm.poster ? resolve(tlm, tlm.poster) : (m.visual || m.poster || "");
    video.hidden = !act; bigPlay.hidden = !act; soon.hidden = act; tl.hidden = !act; soonText.hidden = act; cta.hidden = !act;
    if (act) cta.setAttribute("href", m.route); else cta.removeAttribute("href");
    if (act && tlm.chapters && tlm.chapters.labels_module && !labels.has(m.id)) {
      import(new URL(tlm.chapters.labels_module, document.baseURI).href).then((mod) => { const S = mod.STR || {}; const out = {}; ["de", "en", "es"].forEach((l) => { const a = S[l] && S[l][tlm.chapters.labels_key]; if (Array.isArray(a)) out[l] = a.map((c) => ({ y: c.y, h: c.h })); }); labels.set(m.id, out); if (sel === m) renderChapters(); }).catch(() => {});
    }
    orbitTo(monuments.indexOf(m), !!silent);
    relabel(); autoplayMaybe();
    if (!silent) { try { history.replaceState(null, "", "#index-" + m.id); } catch (e) {} }
  }

  /* ---------- wiring (once) ---------- */
  cards.forEach(({ m, b }, i) => {
    b.addEventListener("click", () => { if (dragSuppress) return; select(m); });
    b.addEventListener("keydown", (e) => { let j = -1; if (e.key === "ArrowRight" || e.key === "ArrowDown") j = (i + 1) % cards.length; else if (e.key === "ArrowLeft" || e.key === "ArrowUp") j = (i - 1 + cards.length) % cards.length; else if (e.key === "Home") j = 0; else if (e.key === "End") j = cards.length - 1; if (j >= 0) { e.preventDefault(); select(cards[j].m, true); } });
  });
  const toggle = () => { nudgeOrbit(); if (video.paused) { userPaused = false; play(); } else { userPaused = true; video.pause(); } };
  bp.addEventListener("click", toggle); bigPlay.addEventListener("click", toggle); video.addEventListener("click", toggle);
  bm.addEventListener("click", () => { nudgeOrbit(); video.muted = !video.muted; bm.setAttribute("aria-pressed", String(!video.muted)); relabel(); });
  video.addEventListener("play", () => { media.classList.add("is-playing", "has-started"); relabel(); });
  video.addEventListener("pause", () => { media.classList.remove("is-playing"); relabel(); });
  video.addEventListener("ended", () => { userPaused = true; if (sel) pos.set(sel.id, 0); });
  video.addEventListener("timeupdate", () => { if (!sel || !video.getAttribute("src")) return; pos.set(sel.id, video.currentTime); renderProgress(); markChapter(false); });
  video.addEventListener("loadedmetadata", renderProgress);
  const seekTo = (sec) => { if (!sel || !tlOf(sel)) return; const d = dur(); sec = Math.min(Math.max(0, sec), Math.max(0, d - 0.2)); pos.set(sel.id, sec); if (video.getAttribute("src") && video.readyState >= 1) { try { video.currentTime = sec; } catch (e) {} } else { ensureSrc(); } renderProgress(); markChapter(true); };
  bar.addEventListener("click", (e) => { nudgeOrbit(); const r = bar.getBoundingClientRect(); seekTo(((e.clientX - r.left) / r.width) * dur()); });
  bar.addEventListener("keydown", (e) => { nudgeOrbit(); const cur = sel ? pos.get(sel.id) || 0 : 0; if (e.key === "ArrowRight") { e.preventDefault(); seekTo(cur + 5); } else if (e.key === "ArrowLeft") { e.preventDefault(); seekTo(cur - 5); } else if (e.key === "Home") { e.preventDefault(); seekTo(0); } });
  chapters.addEventListener("click", (e) => { nudgeOrbit(); const b = e.target.closest(".hm__chapter"); const times = chTimes(); if (!b || !times) return; seekTo(times[+b.dataset.i] + 0.05); userPaused = false; play(); });
  new IntersectionObserver((es) => { es.forEach((e) => { inView = e.isIntersecting && e.intersectionRatio >= 0.5; }); if (inView) autoplayMaybe(); else if (!video.paused) video.pause(); }, { threshold: [0, 0.5, 0.9] }).observe(media);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") { if (!video.paused) video.pause(); } else autoplayMaybe(); });
  new MutationObserver(relabel).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  const fromHash = monuments.find((m) => location.hash === "#index-" + m.id);
  select(fromHash || monuments.find(isActive) || monuments[0], false, true); // default selection never touches the URL or the scroll position
}
init();
