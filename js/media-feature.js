/* ZEITSPRUNG V2 — media-feature.js
   ============================================================================
   REUSABLE MONUMENT MEDIA FEATURE (trailer / timeline film / spatial route).
   Poster-first, lazy video. Monument-agnostic: every file name, label and
   mode comes from data-* attributes + the i18n dictionary of the host page;
   the media base URL is passed in by the caller (ZT_PATHS), so other
   monuments reuse this file unchanged.

   Markup contract (one element per feature):
     <section class="mf" data-mf data-mf-mode="click|ambient"
              data-mf-video="file.mp4" data-mf-poster="poster.jpg">
       ... <div class="mf__frame"><video class="mf__video" playsinline preload="none"></video>
                                   <button class="mf__play" type="button"></button></div>
     </section>

   Behaviour
     - poster is set immediately (small image); the video src is NOT set until
       the visitor presses play (click mode) or the frame is >=45% visible
       (ambient mode, muted, looping, only when reduced-motion is off).
     - leaving the viewport pauses the video (no off-screen decode/audio).
     - no RAF loop, no scroll listener: IntersectionObserver + media events only.
   ============================================================================ */

import { openElement, viewerLabel } from "./zs-media-viewer.js";

export function initMediaFeatures({ root, base, playLabel, reducedMotion }) {
  const features = Array.from((root || document).querySelectorAll("[data-mf]"));
  const cleanBase = String(base || "").replace(/\/$/, "");
  const handles = features.map((section) => {
    const video = section.querySelector(".mf__video");
    const btn = section.querySelector(".mf__play");
    if (!video) return null;
    const mode = section.getAttribute("data-mf-mode") || "click";
    const file = section.getAttribute("data-mf-video");
    const poster = section.getAttribute("data-mf-poster");
    if (poster) video.setAttribute("poster", `${cleanBase}/${poster}`);
    if (btn && playLabel) btn.setAttribute("aria-label", playLabel());
    let armed = false;

    const arm = () => {
      if (armed) return;
      armed = true;
      video.preload = "auto";
      video.src = `${cleanBase}/${file}`;
      video.load();
    };
    const showPlay = (on) => { if (btn) btn.hidden = !on; };

    if (mode === "ambient" && !reducedMotion) {
      video.muted = true;
      video.loop = true;
      video.setAttribute("muted", "");
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio >= 0.45) {
            arm();
            const p = video.play();
            if (p && p.catch) p.catch(() => showPlay(true));
          } else if (armed) {
            video.pause();
          }
        });
      }, { threshold: [0, 0.45, 0.8] });
      io.observe(video);
      showPlay(false);
    } else {
      showPlay(true);
      const start = () => {
        arm();
        video.controls = true;
        showPlay(false);
        const p = video.play();
        if (p && p.catch) p.catch(() => { video.controls = true; });
      };
      if (btn) btn.addEventListener("click", start);
      video.addEventListener("ended", () => { video.controls = false; showPlay(true); });
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting && armed && !video.paused) video.pause();
        });
      }, { threshold: 0 });
      io.observe(video);
    }
    // EXPLICIT ENLARGE (opt-in via data-mf-expand, user-triggered only): re-parents the
    // existing frame (video element kept -> playback/audio continue) into the common viewer.
    const frame = video.closest(".mf__frame");
    if (section.hasAttribute("data-mf-expand") && frame && mode !== "ambient") {
      const exp = document.createElement("button");
      exp.type = "button";
      exp.className = "mf__expand";
      exp.setAttribute("aria-label", viewerLabel("expand"));
      exp.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
      frame.appendChild(exp);
      exp.addEventListener("click", () => {
        arm();
        video.controls = true;
        showPlay(false);
        frame.classList.add("is-enlarged");
        openElement(frame, { onClose: () => frame.classList.remove("is-enlarged") });
        const p = video.play();
        if (p && p.catch) p.catch(() => { video.controls = true; });
      });
    }
    return { section, video };
  }).filter(Boolean);

  return {
    refreshLabels: () => {
      features.forEach((section) => {
        const btn = section.querySelector(".mf__play");
        if (btn && playLabel) btn.setAttribute("aria-label", playLabel());
      });
    },
    count: handles.length
  };
}
