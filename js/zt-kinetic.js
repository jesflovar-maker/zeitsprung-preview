/* ZEITSPRUNG V2 — js/zt-kinetic.js (07C.0) — ZEITSPRUNG_KINETIC_VIDEO_TYPE_V1
   ONE reusable cinematic text-animation layer for narrative sequences and films. HTML / CSS only (css/zt-kinetic.css),
   never burned into an MP4. It is a SEPARATE narrative layer: documentary timelines (.zt-ov in the film players) keep
   their own canonical typography and never receive it.
   Effects (one-shot, transform + opacity only, no continuous loops):
     "reveal" KINETIC_REVEAL · "scale" KINETIC_SCALE_UP · "letter" KINETIC_LETTER_EXPAND · "change" KINETIC_CHAPTER_CHANGE
     every title ends with KINETIC_FADE_OUT after a readable hold, so the architecture is free again.
   Two ways to drive it:
     A) sequences — k.set(() => ({ k, t, s }), effect): call when the visible step changes (scroll galleries)
     B) films     — mountKinetic(stage, { video, cues: [{ at, out, text: () => ({ k, t, s }), effect }] })
        the video's own clock decides: play, seek, pause and language change always show the right title; a paused or
        sought film shows it as still text; nothing is restarted and no second player is created.
   Text comes from the page's own i18n (k = small index, t = large title, s = short line); language follows <html lang>.
   The layer lives INSIDE the media stage -> works embedded, in native fullscreen and in the fixed-layer fallback.
   Accessibility: the animated letters are aria-hidden; the equivalent text is the page's own caption, or (films without
   caption: opt.sr) one visually hidden, non-live paragraph. prefers-reduced-motion = static readable text, no animation. */
const HOLD = 2300, OUT = 700, SETTLE = 160;
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)");
let fontAsked = false;
function askFont() { // one weight, requested only when a kinetic stage comes near
  if (fontAsked) return; fontAsked = true;
  const l = document.createElement("link"); l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap"; document.head.append(l);
}
const mk = (c, tag) => { const e = document.createElement(tag || "span"); if (c) e.className = c; return e; };

export function mountKinetic(stage, opt = {}) {
  if (!stage) return null;
  const layer = mk("zt-kin", "div"); layer.setAttribute("aria-hidden", "true"); layer.hidden = true;
  if (opt.place) layer.classList.add("zt-kin--" + opt.place);
  stage.append(layer);
  const sr = opt.sr ? mk("zt-kin-sr", "p") : null; if (sr) stage.append(sr);
  let get = null, effect = "reveal", timer = 0, settle = 0, seen = false, pending = false, cue = -1;

  function write(fx) { // builds the current title; fx = null -> still text
    const x = get && get(); if (!x || !x.t) { hide(true); return; }
    const k = mk("zt-kin__k", "p"), t = mk("zt-kin__t", "p"), s = mk("zt-kin__s", "p");
    k.textContent = x.k || ""; s.textContent = x.s || "";
    const words = String(x.t).length <= 12 ? [String(x.t).replace(/\s+/g, "\u00a0")] : String(x.t).split(/\s+/); /* dates / short states stay on one line */ const L = Math.max(...words.map((w) => w.length));
    t.style.setProperty("--kin-size", Math.max(7, Math.min(25, 88 / (L * 0.8))).toFixed(2) + "cqi"); // longest word always fits
    let n = 0;
    words.forEach((w, wi) => { const we = mk("zt-kin__w"); if (wi) t.append(" ");
      if (fx === "letter") [...w].forEach((c) => { const l = mk("zt-kin__l"); l.textContent = c; l.style.setProperty("--i", String(n)); if (n === 0) l.classList.add("is-big"); n++; we.append(l); });
      else we.textContent = w;
      t.append(we); });
    layer.replaceChildren(k, t, s);
    layer.className = layer.className.replace(/\s*\b(fx-\w+|is-out|is-still)\b/g, "");
    layer.hidden = false; void layer.offsetWidth; layer.classList.add(fx ? "fx-" + fx : "is-still");
    stage.classList.add("is-kin");
    if (sr) sr.textContent = [x.k, x.t, x.s].filter(Boolean).join(" · ");
  }
  function hide(now) {
    clearTimeout(timer);
    const done = () => { layer.hidden = true; layer.classList.remove("is-out"); layer.replaceChildren(); stage.classList.remove("is-kin"); };
    if (now || layer.hidden || REDUCED.matches) { done(); return; }
    layer.classList.add("is-out"); stage.classList.remove("is-kin"); timer = setTimeout(done, OUT);
  }
  function play(hold) {
    clearTimeout(timer);
    const fx = REDUCED.matches ? null : (effect === "change" && !layer.hidden ? "change" : effect === "change" ? "reveal" : effect);
    write(fx); if (hold && !layer.hidden) timer = setTimeout(() => hide(false), hold);
  }

  // the layer only works while its stage is on screen
  new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) askFont(); }), { rootMargin: "100% 0px" }).observe(stage);
  new IntersectionObserver((es) => { const e = es[es.length - 1]; seen = e.isIntersecting && e.intersectionRatio >= 0.45;
    if (!seen) { clearTimeout(settle); if (!opt.video) { hide(true); pending = !!get; } }
    else if (pending) { pending = false; play(HOLD); } }, { threshold: [0, 0.45, 0.7] }).observe(stage);

  // A) sequences
  const set = (fn, fx) => { get = fn; effect = fx || opt.effect || "reveal"; clearTimeout(settle);
    if (!seen) { hide(true); pending = true; return; }
    settle = setTimeout(() => play(HOLD), SETTLE); }; // fast scrolling never strobes titles

  // B) films — the video clock is the only clock
  const v = opt.video, cues = opt.cues || [];
  if (v && cues.length) {
    const sync = (still) => {
      const t = v.currentTime || 0; const started = t > 0 || !v.paused;
      const i = started ? cues.findIndex((c) => t >= c.at && t < c.out) : -1;
      if (i === cue && !still) return; const changed = i !== cue; cue = i;
      if (i < 0) { if (changed) hide(!!still); return; }
      get = cues[i].text; effect = cues[i].effect || opt.effect || "reveal";
      if (still || v.paused) { clearTimeout(timer); write(null); } else play(0);
    };
    ["timeupdate", "playing"].forEach((ev) => v.addEventListener(ev, () => sync(false)));
    v.addEventListener("seeked", () => sync(v.paused));
    v.addEventListener("pause", () => { if (!v.ended && cue >= 0) { clearTimeout(timer); write(null); } });
    v.addEventListener("emptied", () => { cue = -1; hide(true); });
  }
  const relabel = () => { if (!layer.hidden && get) { const run = layer.className; write(null); if (/is-out/.test(run)) hide(true); } };
  new MutationObserver(() => setTimeout(relabel, 0)).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  return { set, hide: () => hide(false), relabel, layer };
}
