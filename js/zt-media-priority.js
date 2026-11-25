/* ZEITSPRUNG V2 — js/zt-media-priority.js (07D · 06H) — who may use the network now.
   Measured before (live, 2026-11-25): after a fast scroll through Steinerne 40–54 downloads were still running for parts the
   visitor had already left; the timeline film and the images on screen had to wait (first frame 7.0–14.5 s, one image > 9 s).
   This module is small and passive:
     1 RETRY    an <img> that fails to load is asked for again (1 s, 3 s, 8 s, and when the browser is online again / the tab
                returns) — no manual page refresh. Broken images never stay silent.
     2 DWELL    a lazy image starts only when it has been near for a moment, so scrolling past starts nothing. 06H.1: what is
                ON SCREEN starts at once; what is only near waits in line (nearest first, at most 3 travelling), a picture
                covered by another one of its stack comes last, one at a time. What is already loading may finish, unless too
                many have been left behind — then the one left longest ago gives its connection back.
     3 RELEASE  clips inside an opted-in container (museum) stop downloading once the container is far away; they are
                attached again, same file, before it returns.
     3b PAUSED  (06H.1) a film that waits paused at its start, far away, stops downloading too (same file again when near).
     4 FOCUS    while a film starts ("zt:film-focus"), 2 and 3 run at once and waiting preloads pause until "zt:film-free". */
const WAIT = [1000, 3000, 8000];
let started = false, focus = 0; const lazy = new Map(); const boxes = new Set(); const idle = [];
export const filmBusy = () => focus > 0;
/** 06H.1: a film starts, or a picture the visitor is looking at is still on its way — preloading waits */
export const viewBusy = () => { if (focus) return true; for (const im of fly) if (im.__ztHi && im.dataset.ztParked == null && !im.complete && onScreen(im)) return true; return false; };

/** 07D/06H.1: a slow or data-saving connection (measured on this visit first; the browser's estimate only when nothing was measured) */
const measured = () => { let m = 0; try { performance.getEntriesByType("resource").forEach((e) => { if (e.transferSize > 80000 && e.responseEnd > e.responseStart) m = Math.max(m, (e.transferSize * 8) / (e.responseEnd - e.responseStart) / 1000); }); } catch (x) {} return m; }; // Mbit/s actually seen
export const slowNet = () => { const c = navigator.connection; if (c && c.saveData) return true; if (measured() > 4) return false; return !!c && (/2g|3g/.test(c.effectiveType || "") || (c.downlink > 0 && c.downlink < 2 && c.rtt >= 150)); };

/* 1 — retry */
function onImgError(e) {
  const im = e.target; if (!im || im.tagName !== "IMG" || im.dataset.ztParked != null) return; const src = im.getAttribute("src"); if (!src || src.startsWith("data:")) return;
  const n = +(im.dataset.ztTry || 0); if (n >= WAIT.length) { im.dataset.ztFailed = "1"; return; } im.dataset.ztTry = String(n + 1);
  setTimeout(() => reload(im, src, n), WAIT[n]);
}
function reload(im, src, n) {
  if (!im.isConnected || im.getAttribute("src") !== src || (im.complete && im.naturalWidth)) return;
  const set = im.getAttribute("srcset"); if (n >= 1 && set) { im.removeAttribute("srcset"); } // last resort: the plain file
  const u = new URL(src, im.baseURI); if (n >= 1) u.searchParams.set("zr", String(n)); im.src = ""; im.src = n >= 1 ? u.href : src;
}
const again = () => document.querySelectorAll("img[data-zt-failed]").forEach((im) => { delete im.dataset.ztFailed; im.dataset.ztTry = "0"; reload(im, im.getAttribute("src"), 1); });

/* 2 — lazy images in flight but far away */
const park = (im) => { if (im.dataset.ztParked != null || im.complete && im.naturalWidth || !im.getAttribute("src")) return; im.dataset.ztParked = im.getAttribute("src"); const s = im.getAttribute("srcset"); if (s) { im.dataset.ztSet = s; im.removeAttribute("srcset"); } im.removeAttribute("src"); };
const unpark = (im) => { if (im.dataset.ztParked == null) return; const s = im.dataset.ztParked; delete im.dataset.ztParked; if (im.dataset.ztSet) { im.setAttribute("srcset", im.dataset.ztSet); delete im.dataset.ztSet; } if (!im.getAttribute("src")) im.src = s; };
let io = null;
const left = new Set(); const line = new Set(); const fly = new Set(); const MAXNEAR = 3;
let slowV = false, slowAt = 0; const slow = () => { const t = Date.now(); if (t - slowAt > 4000) { slowAt = t; slowV = slowNet(); } return slowV; };
const done = (im) => { io.unobserve(im); lazy.delete(im); left.delete(im); line.delete(im); fly.delete(im); serve(); };
const watchImg = (im) => { if (!io || lazy.has(im) || im.loading !== "lazy" || im.complete && im.naturalWidth) return; lazy.set(im, false); if (!im.currentSrc || !im.complete) { const r = im.getBoundingClientRect(); if (r.bottom < -innerHeight || r.top > innerHeight * 2 || !r.width) park(im); } io.observe(im); im.addEventListener("load", () => done(im)); im.addEventListener("error", () => { fly.delete(im); serve(); }); };
const enter = (im) => { left.delete(im); clearTimeout(im.__ztD); im.__ztD = setTimeout(() => { if (!lazy.get(im)) return; line.add(im); serve(); }, 130); };
const dist = (im) => { const r = im.getBoundingClientRect(), vh = innerHeight; return r.bottom < 0 ? -r.bottom / vh : r.top > vh ? (r.top - vh) / vh : 0; };
const onScreen = (im) => { if (dist(im) > 0.1) return false; const r = im.getBoundingClientRect(); return r.right > -20 && r.left < innerWidth + 20; };
const go = (im, hi) => { line.delete(im); fly.add(im); if (hi) im.fetchPriority = "high"; im.__ztHi = hi; unpark(im); };
// slow line: what the visitor looks at now goes first — what is covered or a screen away gives its place and comes back by itself
function yieldLine() { fly.forEach((im) => { if (im.dataset.ztParked == null && !(im.complete && im.naturalWidth) && (covered(im) || dist(im) > 0.9)) { fly.delete(im); park(im); if (lazy.get(im)) line.add(im); } }); const vh = innerHeight; boxes.forEach((c) => { const r = c.getBoundingClientRect(); if (r.bottom < -vh * 0.2 || r.top > vh * 1.2) detach(c); }); document.dispatchEvent(new CustomEvent("zt:view-wait")); }
let serveT = 0;
function serve() { clearTimeout(serveT); serveT = setTimeout(serveNow, 0); }
function serveNow() {
  if (!line.size) return; const wait = []; let fresh = false; // while a film starts only what is on screen may start
  fly.forEach((im) => { if (im.dataset.ztParked != null || im.complete && im.naturalWidth) fly.delete(im); });
  line.forEach((im) => { if (im.dataset.ztParked == null) { if (im.complete && im.naturalWidth) line.delete(im); else { line.delete(im); fly.add(im); } return; } const c = covered(im); if (!c && onScreen(im)) { go(im, true); fresh = true; } else wait.push([c ? 10 + dist(im) : dist(im), im, c]); });
  if (fresh && slow()) yieldLine();
  if (focus) return; let n = 0, cv = 0, hi = 0; fly.forEach((im) => { if (im.__ztHi) hi++; else n++; if (covered(im)) cv++; });
  wait.sort((x, y) => x[0] - y[0]); for (const [, im, c] of wait) { if (n >= (slow() ? (hi ? 1 : 2) : MAXNEAR) || hi > 2 && n >= 1 || c && cv >= 1) { if (!c) break; continue; } go(im, false); n++; if (c) cv++; }
}
// stacked stages (one picture on top, the others transparent): the picture on top comes first
const covered = (im) => im.classList.contains("is-off") || (im.parentElement && im.parentElement.classList.contains("stage__layer") && !im.parentElement.classList.contains("is-on")) || (im.classList.contains("craft__layer") && !im.classList.contains("is-on")) || (!im.classList.contains("is-on") && im.parentElement && [...im.parentElement.children].some((x) => x !== im && x.tagName === "IMG" && x.classList.contains("is-on")));
const leave = (im) => { clearTimeout(im.__ztD); if (im.dataset.ztParked != null || im.complete && im.naturalWidth || !im.getAttribute("src")) return; line.delete(im); left.add(im); if (left.size > 2) { const o = left.values().next().value; left.delete(o); fly.delete(o); park(o); serve(); } };
const scan = (n) => { if (n.nodeType !== 1) return; if (n.tagName === "IMG") watchImg(n); else n.querySelectorAll && n.querySelectorAll("img[loading=lazy]").forEach(watchImg); };

/* 3 — clips of an opted-in container */
export function releaseWhenFar(container, margin = "160% 0px") {
  if (!container || boxes.has(container)) return; boxes.add(container); container.__ztNear = true;
  new IntersectionObserver((es) => { const near = es[es.length - 1].isIntersecting; container.__ztNear = near; if (near) attach(container); else detach(container); }, { rootMargin: margin }).observe(container);
}
function detach(c) { c.querySelectorAll("img").forEach((im) => { if (im.getAttribute("src") && !(im.complete && im.naturalWidth)) { park(im); im.dataset.ztBox = "1"; } }); c.querySelectorAll("video").forEach((v) => { if (!v.getAttribute("src") || v.readyState === 4 && v.buffered.length && v.buffered.end(v.buffered.length - 1) >= v.duration - 0.3) return; v.dataset.ztSrc = v.getAttribute("src"); v.dataset.ztPre = v.preload; try { v.pause(); } catch (e) {} v.removeAttribute("src"); v.preload = "none"; v.load(); }); }
function attach(c) { if (focus) return; c.querySelectorAll("img[data-zt-box]").forEach((im) => { delete im.dataset.ztBox; unpark(im); }); c.querySelectorAll("video[data-zt-src]").forEach((v) => { if (held.has(v)) return; const s = v.dataset.ztSrc; delete v.dataset.ztSrc; if (v.getAttribute("src")) return; v.preload = v.dataset.ztPre || "none"; v.src = s; }); }

/* 3b — paused films far away (never one that has been watched: its position and picture stay) */
let vio = null; const held = new WeakSet();
const holdable = (v) => v.getAttribute("src") && v.paused && !v.ended && (v.currentTime < 0.05 || v.duration < 30) && v.networkState === 2 && v.dataset.ztSrc == null && !(v.readyState === 4 && v.buffered.length && v.buffered.end(v.buffered.length - 1) >= v.duration - 0.3) && ![...boxes].some((b) => b.contains(v));
function sweepVideos(all) { if (!vio) return; document.querySelectorAll("video[src]").forEach((v) => { const r = v.getBoundingClientRect(), vh = innerHeight; if (!r.width && !r.height) return; if (r.bottom > -vh * (all ? 0.3 : 1.3) && r.top < vh * (all ? 1.3 : 2.3)) return; if (!holdable(v)) return; v.dataset.ztSrc = v.getAttribute("src"); v.dataset.ztPre = v.preload; held.add(v); v.removeAttribute("src"); v.preload = "none"; v.load(); vio.observe(v); }); }
function giveBack(v) { vio.unobserve(v); held.delete(v); const s = v.dataset.ztSrc, want = !v.paused; delete v.dataset.ztSrc; if (s == null || v.getAttribute("src")) return; v.preload = v.dataset.ztPre || "none"; v.src = s; if (want) { const p = v.play(); if (p && p.catch) p.catch(() => {}); } }
let sweepT = 0; const onScroll = () => { clearTimeout(sweepT); sweepT = setTimeout(() => { sweepVideos(false); serve(); }, 350); if (line.size) serve(); };

/* 4 — film focus + polite preloading */
function onFocus() { focus++; sweepVideos(true); lazy.forEach((near, im) => { if (!near) park(im); }); const vh = innerHeight; lazy.forEach((near, im) => { const r = im.getBoundingClientRect(); if (r.bottom < -vh * 0.4 || r.top > vh * 1.6) { park(im); fly.delete(im); } }); boxes.forEach((c) => { if (c.getBoundingClientRect().bottom < -vh * 0.2 || c.getBoundingClientRect().top > vh * 1.2) detach(c); }); }
function onFree() { focus = Math.max(0, focus - 1); if (focus) return; lazy.forEach((near, im) => { if (near) enter(im); }); boxes.forEach((c) => { if (c.__ztNear) attach(c); }); document.querySelectorAll("video[data-zt-src]").forEach((v) => { if (held.has(v)) { vio.unobserve(v); vio.observe(v); } }); pump(); }
/** preload one thing after the other, never while a film starts: job() returns a promise */
export function whenQuiet(job) { idle.push(job); pump(); }
let pumping = false;
async function pump() { if (pumping || focus) return; pumping = true; while (idle.length && !focus) { for (let k = 0; k < 40 && viewBusy(); k++) await new Promise((r) => setTimeout(r, 250)); if (focus) break; const j = idle.shift(); try { await j(); } catch (e) {} await new Promise((r) => setTimeout(r, 60)); } pumping = false; }

export function initMediaPriority() {
  if (started) return; started = true;
  document.addEventListener("error", onImgError, true); addEventListener("online", again); document.addEventListener("visibilitychange", () => { if (!document.hidden) again(); }); addEventListener("pageshow", (e) => { if (e.persisted) again(); });
  // page-own timeline players (Dom, Rathaus, Porta, Neupfarrplatz): same priority while a long film starts
  const prio = new WeakSet(); const rel = (v) => { if (prio.has(v)) { prio.delete(v); onFree(); } };
  document.addEventListener("play", (e) => { const v = e.target; if (!(v instanceof HTMLVideoElement) || v.loop || v.classList.contains("ztf__video") || prio.has(v) || v.dataset.ztSrc != null) return; if (v.duration && v.duration < 25) return; prio.add(v); onFocus(); setTimeout(() => rel(v), 9000); }, true);
  ["pause", "ended", "error", "emptied"].forEach((n) => document.addEventListener(n, (e) => rel(e.target), true));
  document.addEventListener("progress", (e) => { const v = e.target; if (prio.has(v) && v.buffered.length && v.buffered.end(v.buffered.length - 1) - v.currentTime > 8) rel(v); }, true);
  document.addEventListener("zt:film-focus", onFocus); document.addEventListener("zt:film-free", onFree);
  // images that failed before this module ran
  document.querySelectorAll("img").forEach((im) => { if (im.complete && im.getAttribute("src") && !im.naturalWidth && im.loading !== "lazy") onImgError({ target: im }); });
  if ("IntersectionObserver" in window) {
    vio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && held.has(e.target) && (!focus || dist(e.target) < 0.3)) giveBack(e.target); }), { rootMargin: "110% 0px" }); addEventListener("scroll", onScroll, { passive: true });
    io = new IntersectionObserver((es) => es.forEach((e) => { const im = e.target; if (!lazy.has(im)) return; lazy.set(im, e.isIntersecting); if (e.isIntersecting) enter(im); else leave(im); }), { rootMargin: "150% 0px" });
    new MutationObserver((ms) => ms.forEach((m) => { const t = m.target, im = t.tagName === "IMG" ? t : t.classList && t.classList.contains("stage__layer") ? t.firstElementChild : null; if (im && im.dataset && im.dataset.ztParked != null && !covered(im)) { clearTimeout(im.__ztD); if (lazy.get(im)) go(im, true); else { im.fetchPriority = "high"; unpark(im); } } })).observe(document.body, { attributes: true, attributeFilter: ["class"], subtree: true });
    scan(document.body); new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach(scan))).observe(document.body, { childList: true, subtree: true });
  }
}
initMediaPriority();
