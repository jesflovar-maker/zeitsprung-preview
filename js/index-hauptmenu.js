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

   LIFECYCLE — built once. Language changes (observed on <html lang>) only
   rewrite text: selection, source and playback position are untouched.
   1 IntersectionObserver, 1 MutationObserver, 1 visibilitychange listener.
   No scroll / resize listeners, no timers.
   ============================================================================ */
import { t } from "./index-i18n.js";
import { ZT_PATHS } from "./zt-paths.js";

const CONFIG_URL = "./monuments.config.json";
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const langNow = () => { const l = (document.documentElement.lang || "de").slice(0, 2).toLowerCase(); return ["de", "en", "es"].includes(l) ? l : "de"; };
const pick = (o, l) => (o ? (o[l] !== undefined ? o[l] : o.de || "") : "");
const mk = (tag, cls, attrs) => { const e = document.createElement(tag); if (cls) e.className = cls; if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
const fmt = (s) => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
const resolve = (tl, p) => (tl.base === "assets_root" ? ZT_PATHS.assetsRoot : tl.base === "web_root" ? ZT_PATHS.webRoot : "") + p;

async function init() {
  const cardsHost = document.getElementById("hmCards"), stageHost = document.getElementById("hmStage");
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
    tx.appendChild(no); tx.appendChild(nm); tx.appendChild(st); b.appendChild(th); b.appendChild(tx); cardsHost.appendChild(b);
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
  const tl = mk("div", "hm__tl"); const tlHead = mk("div", "hm__tl-head"); const tlLabel = mk("span", "hm__tl-label"); const tlTime = mk("span", "hm__tl-time"); tlHead.appendChild(tlLabel); tlHead.appendChild(tlTime);
  const bar = mk("div", "hm__bar", { role: "slider", tabindex: "0", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": "0" }); const fill = mk("span", "hm__bar-fill"); bar.appendChild(fill);
  const chapters = mk("div", "hm__chapters", { role: "group" });
  const chapterNow = mk("p", "hm__chapter-now"); chapterNow.setAttribute("aria-live", "polite");
  const ctl = mk("div", "hm__ctl"); const bp = mk("button", "hm__btn", { type: "button" }); const bm = mk("button", "hm__btn", { type: "button", "aria-pressed": "false" }); ctl.appendChild(bp); ctl.appendChild(bm);
  const note = mk("p", "hm__note");
  tl.appendChild(tlHead); tl.appendChild(bar); tl.appendChild(chapters); tl.appendChild(chapterNow); tl.appendChild(ctl); tl.appendChild(note);
  const soonText = mk("p", "hm__soontext");
  const cta = mk("a", "hm__cta");
  info.appendChild(count); info.appendChild(sub); info.appendChild(name); info.appendChild(desc); info.appendChild(tl); info.appendChild(soonText); info.appendChild(cta);
  stageHost.appendChild(media); stageHost.appendChild(info);

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
    times.forEach((tm, i) => { const c = (lab[l] || lab.de || [])[i]; if (!c) return; const b = mk("button", "hm__chapter", { type: "button" }); b.dataset.i = String(i); b.textContent = c.y; b.title = c.h; b.setAttribute("aria-label", c.y + " — " + c.h); chapters.appendChild(b); });
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
    cards.forEach(({ m: x, b }) => { const on = x === m; b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; b.classList.toggle("is-selected", on); if (on && focus) b.focus(); if (on && !silent && cardsHost.scrollWidth > cardsHost.clientWidth) cardsHost.scrollTo({ left: b.offsetLeft - (cardsHost.clientWidth - b.offsetWidth) / 2, behavior: reduced() ? "auto" : "smooth" }); });
    const act = isActive(m), tlm = tlOf(m);
    stageHost.classList.toggle("hm__stage--future", !act); media.classList.remove("is-playing", "has-started");
    posterImg.src = tlm && tlm.poster ? resolve(tlm, tlm.poster) : (m.visual || m.poster || "");
    video.hidden = !act; bigPlay.hidden = !act; soon.hidden = act; tl.hidden = !act; soonText.hidden = act; cta.hidden = !act;
    if (act) cta.setAttribute("href", m.route); else cta.removeAttribute("href");
    if (act && tlm.chapters && tlm.chapters.labels_module && !labels.has(m.id)) {
      import(new URL(tlm.chapters.labels_module, document.baseURI).href).then((mod) => { const S = mod.STR || {}; const out = {}; ["de", "en", "es"].forEach((l) => { const a = S[l] && S[l][tlm.chapters.labels_key]; if (Array.isArray(a)) out[l] = a.map((c) => ({ y: c.y, h: c.h })); }); labels.set(m.id, out); if (sel === m) renderChapters(); }).catch(() => {});
    }
    relabel(); autoplayMaybe();
    if (!silent) { try { history.replaceState(null, "", "#index-" + m.id); } catch (e) {} }
  }

  /* ---------- wiring (once) ---------- */
  cards.forEach(({ m, b }, i) => {
    b.addEventListener("click", () => select(m));
    b.addEventListener("keydown", (e) => { let j = -1; if (e.key === "ArrowRight" || e.key === "ArrowDown") j = (i + 1) % cards.length; else if (e.key === "ArrowLeft" || e.key === "ArrowUp") j = (i - 1 + cards.length) % cards.length; else if (e.key === "Home") j = 0; else if (e.key === "End") j = cards.length - 1; if (j >= 0) { e.preventDefault(); select(cards[j].m, true); } });
  });
  const toggle = () => { if (video.paused) { userPaused = false; play(); } else { userPaused = true; video.pause(); } };
  bp.addEventListener("click", toggle); bigPlay.addEventListener("click", toggle); video.addEventListener("click", toggle);
  bm.addEventListener("click", () => { video.muted = !video.muted; bm.setAttribute("aria-pressed", String(!video.muted)); relabel(); });
  video.addEventListener("play", () => { media.classList.add("is-playing", "has-started"); relabel(); });
  video.addEventListener("pause", () => { media.classList.remove("is-playing"); relabel(); });
  video.addEventListener("ended", () => { userPaused = true; if (sel) pos.set(sel.id, 0); });
  video.addEventListener("timeupdate", () => { if (!sel || !video.getAttribute("src")) return; pos.set(sel.id, video.currentTime); renderProgress(); markChapter(false); });
  video.addEventListener("loadedmetadata", renderProgress);
  const seekTo = (sec) => { if (!sel || !tlOf(sel)) return; const d = dur(); sec = Math.min(Math.max(0, sec), Math.max(0, d - 0.2)); pos.set(sel.id, sec); if (video.getAttribute("src") && video.readyState >= 1) { try { video.currentTime = sec; } catch (e) {} } else { ensureSrc(); } renderProgress(); markChapter(true); };
  bar.addEventListener("click", (e) => { const r = bar.getBoundingClientRect(); seekTo(((e.clientX - r.left) / r.width) * dur()); });
  bar.addEventListener("keydown", (e) => { const cur = sel ? pos.get(sel.id) || 0 : 0; if (e.key === "ArrowRight") { e.preventDefault(); seekTo(cur + 5); } else if (e.key === "ArrowLeft") { e.preventDefault(); seekTo(cur - 5); } else if (e.key === "Home") { e.preventDefault(); seekTo(0); } });
  chapters.addEventListener("click", (e) => { const b = e.target.closest(".hm__chapter"); const times = chTimes(); if (!b || !times) return; seekTo(times[+b.dataset.i] + 0.05); userPaused = false; play(); });
  new IntersectionObserver((es) => { es.forEach((e) => { inView = e.isIntersecting && e.intersectionRatio >= 0.5; }); if (inView) autoplayMaybe(); else if (!video.paused) video.pause(); }, { threshold: [0, 0.5, 0.9] }).observe(media);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") { if (!video.paused) video.pause(); } else autoplayMaybe(); });
  new MutationObserver(relabel).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  const fromHash = monuments.find((m) => location.hash === "#index-" + m.id);
  select(fromHash || monuments.find(isActive) || monuments[0], false, true); // default selection never touches the URL or the scroll position
}
init();
