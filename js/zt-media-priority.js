/* ZEITSPRUNG V2 — js/zt-media-priority.js (07D · 06H) — who may use the network now.
   Measured before (live, 2026-11-25): after a fast scroll through Steinerne 40–54 downloads were still running for parts the
   visitor had already left; the timeline film and the images on screen had to wait (first frame 7.0–14.5 s, one image > 9 s).
   This module is small and passive:
     1 RETRY    an <img> that fails to load is asked for again (1 s, 3 s, 8 s, and when the browser is online again / the tab
                returns) — no manual page refresh. Broken images never stay silent.
     2 CANCEL   a lazy image that is still loading but far away gives its connection back and is asked for again when it
                comes near (nothing that has finished loading is ever touched).
     3 RELEASE  clips inside an opted-in container (museum) stop downloading once the container is far away; they are
                attached again, same file, before it returns.
     4 FOCUS    while a film starts ("zt:film-focus"), 2 and 3 run at once and waiting preloads pause until "zt:film-free". */
const WAIT = [1000, 3000, 8000];
let started = false, focus = 0; const lazy = new Map(); const boxes = new Set(); const idle = [];
export const filmBusy = () => focus > 0;

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
const park = (im) => { if (im.dataset.ztParked != null || im.complete && im.naturalWidth || !im.getAttribute("src")) return; if (im.complete && !im.currentSrc) return; im.dataset.ztParked = im.getAttribute("src"); const s = im.getAttribute("srcset"); if (s) { im.dataset.ztSet = s; im.removeAttribute("srcset"); } im.removeAttribute("src"); };
const unpark = (im) => { if (im.dataset.ztParked == null) return; const s = im.dataset.ztParked; delete im.dataset.ztParked; if (im.dataset.ztSet) { im.setAttribute("srcset", im.dataset.ztSet); delete im.dataset.ztSet; } if (!im.getAttribute("src")) im.src = s; };
let io = null;
const watchImg = (im) => { if (!io || lazy.has(im) || im.loading !== "lazy") return; lazy.set(im, false); io.observe(im); im.addEventListener("load", () => { io.unobserve(im); lazy.delete(im); }, { once: true }); };
const scan = (n) => { if (n.nodeType !== 1) return; if (n.tagName === "IMG") watchImg(n); else n.querySelectorAll && n.querySelectorAll("img[loading=lazy]").forEach(watchImg); };

/* 3 — clips of an opted-in container */
export function releaseWhenFar(container, margin = "160% 0px") {
  if (!container || boxes.has(container)) return; boxes.add(container); container.__ztNear = true;
  new IntersectionObserver((es) => { const near = es[es.length - 1].isIntersecting; container.__ztNear = near; if (near) attach(container); else detach(container); }, { rootMargin: margin }).observe(container);
}
function detach(c) { c.querySelectorAll("video").forEach((v) => { if (!v.getAttribute("src") || v.readyState === 4 && v.buffered.length && v.buffered.end(v.buffered.length - 1) >= v.duration - 0.3) return; v.dataset.ztSrc = v.getAttribute("src"); v.dataset.ztPre = v.preload; try { v.pause(); } catch (e) {} v.removeAttribute("src"); v.preload = "none"; v.load(); }); }
function attach(c) { if (focus) return; c.querySelectorAll("video[data-zt-src]").forEach((v) => { const s = v.dataset.ztSrc; delete v.dataset.ztSrc; if (v.getAttribute("src")) return; v.preload = v.dataset.ztPre || "none"; v.src = s; }); }

/* 4 — film focus + polite preloading */
function onFocus() { focus++; lazy.forEach((near, im) => { if (!near) park(im); }); const vh = innerHeight; lazy.forEach((near, im) => { const r = im.getBoundingClientRect(); if (r.bottom < -vh * 0.4 || r.top > vh * 1.6) park(im); }); boxes.forEach((c) => { if (c.getBoundingClientRect().bottom < -vh * 0.2 || c.getBoundingClientRect().top > vh * 1.2) detach(c); }); }
function onFree() { focus = Math.max(0, focus - 1); if (focus) return; lazy.forEach((near, im) => { if (near) unpark(im); }); boxes.forEach((c) => { if (c.__ztNear) attach(c); }); pump(); }
/** preload one thing after the other, never while a film starts: job() returns a promise */
export function whenQuiet(job) { idle.push(job); pump(); }
let pumping = false;
async function pump() { if (pumping || focus) return; pumping = true; while (idle.length && !focus) { const j = idle.shift(); try { await j(); } catch (e) {} await new Promise((r) => setTimeout(r, 60)); } pumping = false; }

export function initMediaPriority() {
  if (started) return; started = true;
  document.addEventListener("error", onImgError, true); addEventListener("online", again); document.addEventListener("visibilitychange", () => { if (!document.hidden) again(); }); addEventListener("pageshow", (e) => { if (e.persisted) again(); });
  // page-own timeline players (Dom, Rathaus, Porta, Neupfarrplatz): same priority while a long film starts
  const held = new WeakSet(); const rel = (v) => { if (held.has(v)) { held.delete(v); onFree(); } };
  document.addEventListener("play", (e) => { const v = e.target; if (!(v instanceof HTMLVideoElement) || v.loop || v.classList.contains("ztf__video") || held.has(v)) return; if (v.duration && v.duration < 25) return; held.add(v); onFocus(); setTimeout(() => rel(v), 15000); }, true);
  ["pause", "ended", "error", "emptied"].forEach((n) => document.addEventListener(n, (e) => rel(e.target), true));
  document.addEventListener("progress", (e) => { const v = e.target; if (held.has(v) && v.buffered.length && v.buffered.end(v.buffered.length - 1) - v.currentTime > 8) rel(v); }, true);
  document.addEventListener("zt:film-focus", onFocus); document.addEventListener("zt:film-free", onFree);
  // images that failed before this module ran
  document.querySelectorAll("img").forEach((im) => { if (im.complete && im.getAttribute("src") && !im.naturalWidth && im.loading !== "lazy") onImgError({ target: im }); });
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver((es) => es.forEach((e) => { const im = e.target; if (!lazy.has(im)) return; lazy.set(im, e.isIntersecting); if (e.isIntersecting) unpark(im); else if (im.dataset.ztSeen) park(im); if (e.isIntersecting) im.dataset.ztSeen = "1"; }), { rootMargin: "150% 0px" });
    scan(document.body); new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach(scan))).observe(document.body, { childList: true, subtree: true });
  }
}
initMediaPriority();
