/* ZEITSPRUNG — zt-typography.js
   ============================================================================
   ZT TYPOGRAPHY MOTION SYSTEM v1 — a REUSABLE, monument-agnostic editorial
   typography layer.

   WHY IT IS A SEPARATE FILE
   -------------------------
   Other monuments (and eventually the landing page) must be able to use these
   presets WITHOUT importing the Steinerne-Brücke museum choreography. This
   module therefore knows nothing about chapters, scroll triggers, manifests,
   Lenis or the content map. It only knows:

     - three reveal presets (ZT_REVEAL_CHAR / ZT_REVEAL_LINE / ZT_DROP_CAP)
     - one exit preset
     - how to build + refill an accessible split-title structure
     - how to PLAN a beat (relative timing) and how to AUTHOR that plan through
       an engine the host supplies

   IT DOES NOT OWN A TIMELINE. The host passes an `engine` with the exact same
   deterministic primitives it uses for everything else, so every tween this
   module emits obeys the host's determinism rules (explicit initial state,
   fromTo with immediateRender:false, non-overlapping windows per
   element+property, endpoint continuity via the host's state tracker).

   TIME UNIT
   ---------
   All durations/gaps below are expressed in the HOST'S timeline units. In the
   Steinerne-Brücke museum module one unit is UNIT_VH (=55) percent of the
   pinned stage height of scrolling, i.e. a duration of 0.30 units ≈ 16.5vh of
   scroll. A host that plays its timeline in real time instead can read the same
   numbers as seconds. Nothing here assumes which of the two it is.

   ONE AUTHORITY FOR MOTION VALUES
   -------------------------------
   Every distance, duration, stagger, ease and desktop/mobile scale factor lives
   in ZT_TYPO below. There are no motion magic numbers anywhere else in this
   file, and none in the host's typography code either.

   ACCESSIBILITY
   -------------
   A character-split title is meaningless to a screen reader. Every split title
   therefore carries a visually-hidden node with the COMPLETE original string,
   and the visual split structure is aria-hidden. Same pattern for a drop-cap
   paragraph (the visible first capital + the visible remainder are aria-hidden;
   the full sentence is exposed once, unfragmented). Under
   prefers-reduced-motion nothing is split at all — the title stays a single
   semantic text node and receives a plain fade.

   LANGUAGE SWITCHING — NO WRAPPER ACCUMULATION
   --------------------------------------------
   The character spans are a POOL, allocated ONCE at build time and sized to the
   longest of DE/EN/ES. Refilling a title never creates or destroys a character
   span: it only rewrites textContent and re-parents the pooled spans into fresh
   (never animated) word wrappers. Consequences:
     - element identity of every tween target is stable for the life of the page,
       so a language switch can never orphan a tween or leave a new span
       un-animated;
     - the split structure cannot accumulate duplicate wrappers, because the
       wrappers are rebuilt from an emptied container every time and the pool
       size never grows.
   ============================================================================ */

// ---------------------------------------------------------------------------
// THE CONFIG — the single authority for typography motion values.
// Every preset has a `desktop` and a `mobile` variant. `mobile` is deliberately
// shorter in displacement and more restrained in stagger; `desktop` is slower
// and larger because it has the editorial column to breathe in.
// ---------------------------------------------------------------------------
export const ZT_TYPO = {
  version: "ZT_TYPOGRAPHY_V1",

  // Viewport switch. Read ONCE when the host builds its timeline (the timeline
  // is authored, not re-authored on resize) — same lifetime as the host's own
  // desktop-only decisions. A device that crosses this breakpoint after build
  // keeps the variant it was built with; it never breaks, it is only less
  // ideally tuned. Documented limitation, not a bug.
  desktopMinWidth: 900,

  // ZT_REVEAL_CHAR — short titles only.
  char: {
    // A title longer than this many NON-SPACE characters is not split at all
    // and falls back to ZT_REVEAL_LINE. The check runs against the LONGEST of
    // DE/EN/ES so the mode is language-independent (the DOM structure and the
    // authored tweens must not change when the visitor switches language).
    maxChars: 46,
    desktop: {
      dur: 0.30,          // per-character duration
      staggerSpan: 0.34,  // TOTAL span from first to last character
      staggerMax: 0.05,   // per-character ceiling (short titles)
      yEm: 0.85,          // start offset, in em of the title's own font-size
      scaleFrom: 0.985,   // "extremely subtle scale settling"
      ease: "power3.out"  // elegant deceleration, no bounce/elastic
    },
    mobile: {
      dur: 0.24,
      staggerSpan: 0.24,
      staggerMax: 0.045,
      yEm: 0.55,
      scaleFrom: 0.990,
      ease: "power3.out"
    }
  },

  // ZT_REVEAL_LINE — body copy, groups, chips. Never per-character.
  line: {
    desktop: { dur: 0.42, y: 26, ease: "power2.out" },
    mobile:  { dur: 0.34, y: 16, ease: "power2.out" }
  },

  // Eyebrow / category / period line. A line reveal plus a tracking settle.
  eyebrow: {
    desktop: { dur: 0.30, y: 14, ease: "power2.out", trackFrom: "0.42em", trackTo: "0.2em" },
    mobile:  { dur: 0.26, y: 12, ease: "power2.out", trackFrom: "0.38em", trackTo: "0.2em" }
  },

  // ZT_DROP_CAP — oversized initial capital. Almost static, subtly alive.
  dropCap: {
    desktop: { dur: 0.50, y: 14, scaleFrom: 0.97,  lead: 0.10, ease: "power2.out" },
    mobile:  { dur: 0.42, y: 9,  scaleFrom: 0.975, lead: 0.08, ease: "power2.out" }
  },

  // Whole-block exit (the beat leaves before the next object dominates).
  exit: {
    desktop: { dur: 0.42, y: -18, ease: "power2.in" },
    mobile:  { dur: 0.34, y: -14, ease: "power2.in" }
  },

  // Gaps measured from the PREVIOUS stage's END. Negative = deliberate overlap.
  gaps: {
    desktop: { afterEyebrow: 0.06, afterTitle: -0.14, afterLead: 0.02, afterGroup: 0.02 },
    mobile:  { afterEyebrow: 0.05, afterTitle: -0.12, afterLead: 0.02, afterGroup: 0.02 }
  },

  // prefers-reduced-motion: opacity only, no per-character movement, no
  // displacement anywhere. The information architecture is untouched.
  reduced: { dur: 0.36, gap: 0.10, ease: "power1.out" },

  // Generic scheduling hints a host may use. Chapter-specific scheduling stays
  // in the host (see BEAT_SCHEDULE in museum2d-scroll.js).
  schedule: { readMin: 0.30 }
};

// ---------------------------------------------------------------------------
// Small DOM helper (local — this module must not depend on the host's).
// ---------------------------------------------------------------------------
function mk(tag, cls, attrs) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (attrs) Object.keys(attrs).forEach((k) => node.setAttribute(k, attrs[k]));
  return node;
}

/** Non-space character count — the length that actually gets animated. */
export function ztVisualLength(text) {
  if (!text) return 0;
  return Array.from(String(text)).filter((c) => !/\s/.test(c)).length;
}

/** First typographic character of a string (drop-cap glyph), or "". */
export function ztFirstLetter(text) {
  const s = String(text || "").trim();
  if (!s) return "";
  return Array.from(s)[0];
}

// ---------------------------------------------------------------------------
// FACTORY
//   engine.set(node, vars)                       -> gsap.set + host state register
//   engine.tw(node, at, dur, toVars, ease)       -> tracked fromTo (host authority)
//   engine.tween(node, from, to, at, dur, ease)  -> untracked fromTo (own property)
// ---------------------------------------------------------------------------
export function createZtTypography({ engine, reducedMotion, desktop }) {
  const R = !!reducedMotion;
  const isDesktop = typeof desktop === "boolean"
    ? desktop
    : window.matchMedia(`(min-width: ${ZT_TYPO.desktopMinWidth}px)`).matches;
  const V = (preset) => preset[isDesktop ? "desktop" : "mobile"];

  const G = V(ZT_TYPO.gaps);
  const LINE = V(ZT_TYPO.line);
  const EYE = V(ZT_TYPO.eyebrow);
  const CHAR = V(ZT_TYPO.char);
  const CAP = V(ZT_TYPO.dropCap);
  const EXIT = V(ZT_TYPO.exit);

  // handle registries — WeakMap so a discarded caption block is collectable.
  const titles = new WeakMap(); // h4 -> { sr, split, pool, mode }
  const leads = new WeakMap();  // p  -> { sr, cap, body } | { sr, body }

  // =========================================================================
  // TITLE — build / refill
  // =========================================================================

  /**
   * Allocate a title's permanent structure.
   * @param {HTMLElement} h4        the title block (kept, not replaced)
   * @param {number} poolSize       NON-SPACE character count of the LONGEST
   *                                translation this title will ever show
   * @param {string} lineClass      class the visible text container must carry
   *                                so the host's existing CSS still applies
   * @returns {"char"|"line"} the mode this title will use for its lifetime
   */
  function mountTitle(h4, poolSize, lineClass) {
    if (!h4) return "line";
    const mode = (!R && poolSize > 0 && poolSize <= ZT_TYPO.char.maxChars) ? "char" : "line";
    h4.innerHTML = "";
    h4.classList.toggle("zt-mode-char", mode === "char");

    // Visually-hidden, ALWAYS-complete text for assistive technology.
    const sr = mk("span", "zt-sr");
    // Visible container. Reuses the host's own line class so every existing
    // font-size / weight / line-height rule (incl. the desktop override)
    // applies unchanged.
    const split = mk("span", `${lineClass || ""} zt-split`.trim());

    const pool = [];
    if (mode === "char") {
      split.setAttribute("aria-hidden", "true");
      h4.appendChild(sr);
      for (let i = 0; i < poolSize; i++) pool.push(mk("span", "zt-char"));
    } else {
      // Line mode: the visible node IS the semantic node. No duplicate text,
      // no aria-hidden, nothing to keep in sync.
      sr.hidden = true;
      h4.appendChild(sr);
    }
    h4.appendChild(split);

    titles.set(h4, { sr, split, pool, mode });
    return mode;
  }

  /**
   * Refill a title. Never creates or destroys a character span.
   * Word wrappers ARE rebuilt every time (they are never tween targets), which
   * is what structurally prevents wrapper accumulation across language switches.
   */
  function setTitleText(h4, text) {
    const h = titles.get(h4);
    if (!h) return;
    const str = String(text || "");
    h.sr.textContent = str;
    if (h.mode === "line") { h.split.textContent = str; return; }

    h.split.textContent = ""; // detaches word wrappers; pooled spans survive
    const words = str.split(/\s+/).filter(Boolean);
    let idx = 0;
    words.forEach((word, wi) => {
      const wrap = mk("span", "zt-word"); // inline-block + nowrap => safe breaks
      Array.from(word).forEach((chr) => {
        const span = h.pool[idx];
        if (!span) {
          // Pool exhausted (a translation longer than every one measured at
          // build time). Render the overflow as plain, un-animated text rather
          // than dropping characters. Content integrity beats the effect.
          wrap.appendChild(document.createTextNode(chr));
          return;
        }
        span.textContent = chr;
        span.hidden = false;
        wrap.appendChild(span);
        idx++;
      });
      h.split.appendChild(wrap);
      if (wi < words.length - 1) h.split.appendChild(document.createTextNode(" "));
    });
    // Unused pooled spans stay in the DOM but hidden: [hidden] is display:none,
    // so whatever inline opacity/transform a tween left on them is inert.
    for (; idx < h.pool.length; idx++) {
      const span = h.pool[idx];
      span.textContent = "";
      span.hidden = true;
      h.split.appendChild(span);
    }
  }

  /** Animated targets of a title, in reading order. */
  function titleTargets(h4) {
    const h = titles.get(h4);
    if (!h) return [];
    return h.mode === "char" ? h.pool.slice() : [h.split];
  }
  function titleMode(h4) {
    const h = titles.get(h4);
    return h ? h.mode : "line";
  }

  // =========================================================================
  // LEAD PARAGRAPH — build / refill (with optional ZT_DROP_CAP)
  // =========================================================================

  /**
   * Allocate a paragraph's permanent structure.
   * `dropCap:true` splits the visible rendering into an oversized initial and
   * the remainder — both aria-hidden, with the full sentence exposed once via
   * the visually-hidden node. Under reduced motion the drop cap is still
   * RENDERED (it is a typographic device, not an animation) but it is only
   * faded, never moved or scaled.
   */
  function mountLead(p, dropCap) {
    if (!p) return;
    p.innerHTML = "";
    const sr = mk("span", "zt-sr");
    if (!dropCap) {
      sr.hidden = true;
      p.appendChild(sr);
      const body = mk("span", "zt-line-body");
      p.appendChild(body);
      leads.set(p, { sr, cap: null, body });
      return;
    }
    p.classList.add("zt-has-dropcap");
    const cap = mk("span", "zt-dropcap", { "aria-hidden": "true" });
    const body = mk("span", "zt-dc-body", { "aria-hidden": "true" });
    p.appendChild(sr);
    p.appendChild(cap);
    p.appendChild(body);
    leads.set(p, { sr, cap, body });
  }

  function setLeadText(p, text) {
    const h = leads.get(p);
    if (!h) { if (p) p.textContent = String(text || ""); return; }
    const str = String(text || "");
    h.sr.textContent = str;
    if (!h.cap) { h.body.textContent = str; return; }
    const first = ztFirstLetter(str);
    h.cap.textContent = first;
    h.body.textContent = first ? str.slice(first.length) : str;
    // An empty string must not leave a floating empty box behind.
    h.cap.hidden = !first;
  }

  /** Animated targets of a lead, in reading order (drop cap leads the body). */
  function leadTargets(p) {
    const h = leads.get(p);
    if (!h) return p ? [p] : [];
    return h.cap && !h.cap.hidden ? [h.cap, h.body] : [h.body];
  }
  function leadHasDropCap(p) {
    const h = leads.get(p);
    return !!(h && h.cap);
  }

  // =========================================================================
  // INITIAL STATES  (host determinism rule 1)
  // =========================================================================
  function initTitle(h4) {
    const mode = titleMode(h4);
    if (mode === "char") {
      titleTargets(h4).forEach((span) => {
        engine.set(span, R
          ? { opacity: 0 }
          : { opacity: 0, y: `${CHAR.yEm}em`, scale: CHAR.scaleFrom });
      });
      return;
    }
    // Line mode keeps the pre-existing masked vertical reveal
    // (.museum__cap-title{overflow:hidden} + inner block translated by yPercent),
    // which is also the reduced-motion path (opacity only).
    const target = titleTargets(h4)[0];
    engine.set(target, R ? { opacity: 0, yPercent: 0 } : { opacity: 1, yPercent: 112 });
  }

  function initLine(node) {
    engine.set(node, R ? { opacity: 0 } : { opacity: 0, y: LINE.y });
  }

  function initEyebrow(node) {
    engine.set(node, R ? { opacity: 0 } : { opacity: 0, y: EYE.y });
  }

  function initLead(p) {
    const h = leads.get(p);
    if (!h) { initLine(p); return; }
    engine.set(p, { opacity: 1 }); // the <p> is a static container in this mode
    if (h.cap && !h.cap.hidden) {
      engine.set(h.cap, R ? { opacity: 0 } : { opacity: 0, y: CAP.y, scale: CAP.scaleFrom });
    }
    engine.set(h.body, R ? { opacity: 0 } : { opacity: 0, y: LINE.y });
  }

  // =========================================================================
  // PRESET AUTHORING — each returns the preset's own duration
  // =========================================================================
  function revealChar(h4, at) {
    const spans = titleTargets(h4);
    const n = spans.length;
    if (!n) return 0;
    if (R) {
      spans.forEach((s) => engine.tw(s, at, ZT_TYPO.reduced.dur, { opacity: 1 }, ZT_TYPO.reduced.ease));
      return ZT_TYPO.reduced.dur;
    }
    const stagger = n > 1 ? Math.min(CHAR.staggerMax, CHAR.staggerSpan / (n - 1)) : 0;
    spans.forEach((span, i) => {
      engine.tw(span, at + stagger * i, CHAR.dur, { opacity: 1, y: 0, scale: 1 }, CHAR.ease);
    });
    return stagger * (n - 1) + CHAR.dur;
  }

  function revealTitleLine(h4, at) {
    const target = titleTargets(h4)[0];
    if (!target) return 0;
    if (R) {
      engine.tw(target, at, ZT_TYPO.reduced.dur, { opacity: 1, yPercent: 0 }, ZT_TYPO.reduced.ease);
      return ZT_TYPO.reduced.dur;
    }
    engine.tw(target, at, LINE.dur, { opacity: 1, yPercent: 0 }, "power3.out");
    return LINE.dur;
  }

  function revealTitle(h4, at) {
    return titleMode(h4) === "char" ? revealChar(h4, at) : revealTitleLine(h4, at);
  }

  function revealLine(node, at, durOverride) {
    if (!node) return 0;
    const dur = durOverride || (R ? ZT_TYPO.reduced.dur : LINE.dur);
    if (R) { engine.tw(node, at, dur, { opacity: 1 }, ZT_TYPO.reduced.ease); return dur; }
    engine.tw(node, at, dur, { opacity: 1, y: 0 }, LINE.ease);
    return dur;
  }

  function revealEyebrow(node, at) {
    if (!node) return 0;
    if (R) { engine.tw(node, at, ZT_TYPO.reduced.dur, { opacity: 1 }, ZT_TYPO.reduced.ease); return ZT_TYPO.reduced.dur; }
    engine.tw(node, at, EYE.dur, { opacity: 1, y: 0 }, EYE.ease);
    // Tracking settle — its own property, its own non-overlapping window.
    engine.tween(node, { letterSpacing: EYE.trackFrom }, { letterSpacing: EYE.trackTo }, at, EYE.dur, EYE.ease);
    return EYE.dur;
  }

  function revealLead(p, at) {
    const h = leads.get(p);
    if (!h) return revealLine(p, at);
    if (!h.cap || h.cap.hidden) return revealLine(h.body, at);
    if (R) {
      engine.tw(h.cap, at, ZT_TYPO.reduced.dur, { opacity: 1 }, ZT_TYPO.reduced.ease);
      engine.tw(h.body, at + ZT_TYPO.reduced.gap, ZT_TYPO.reduced.dur, { opacity: 1 }, ZT_TYPO.reduced.ease);
      return ZT_TYPO.reduced.gap + ZT_TYPO.reduced.dur;
    }
    engine.tw(h.cap, at, CAP.dur, { opacity: 1, y: 0, scale: 1 }, CAP.ease);
    engine.tw(h.body, at + CAP.lead, LINE.dur, { opacity: 1, y: 0 }, LINE.ease);
    return Math.max(CAP.dur, CAP.lead + LINE.dur);
  }

  function hideLine(node, at, dur) {
    if (!node) return;
    engine.tw(node, at, dur, R ? { opacity: 0 } : { opacity: 0, y: -Math.round(LINE.y * 0.5) }, "power2.in");
  }

  /** Whole-block exit (a beat container, not its parts). */
  function hideBlock(node, at, durOverride) {
    if (!node) return 0;
    const dur = durOverride || EXIT.dur;
    engine.tw(node, at, dur, R ? { opacity: 0 } : { opacity: 0, y: EXIT.y }, EXIT.ease);
    return dur;
  }

  // =========================================================================
  // BEAT ORCHESTRATION
  // Order is DOM order: eyebrow -> title -> lead -> group(spec slot + chips).
  // Parts carrying the SAME data-zt-group value reveal simultaneously.
  //
  // The plan is built first (relative, unscaled), then uniformly time-scaled to
  // fit the window the host grants. Scaling preserves the authored rhythm and
  // guarantees the reveal can never spill into the chapter's reading pause or
  // its exit — which is what keeps every tween window non-overlapping.
  // =========================================================================
  function planParts(parts) {
    const plan = [];
    let cursor = 0;
    let prevKind = null;
    let groupKey = null;
    let groupStart = 0;

    parts.forEach((part) => {
      const kind = part.getAttribute("data-reveal");
      const grp = part.getAttribute("data-zt-group");
      let start;
      if (grp && grp === groupKey) {
        start = groupStart; // simultaneous with the rest of its group
      } else {
        const gap = prevKind === null ? 0
          : prevKind === "eyebrow" ? G.afterEyebrow
          : prevKind === "title" ? G.afterTitle
          : prevKind === "lead" ? G.afterLead
          : G.afterGroup;
        start = cursor + gap;
        groupKey = grp || null;
        groupStart = start;
      }
      const dur = kind === "eyebrow" ? (R ? ZT_TYPO.reduced.dur : EYE.dur)
        : kind === "title" ? titleDur(part)
        : kind === "lead" ? leadDur(part)
        : (R ? ZT_TYPO.reduced.dur : LINE.dur);
      plan.push({ part, kind, start, dur });
      cursor = Math.max(cursor, start + dur);
      prevKind = kind;
    });
    return { plan, length: cursor };
  }

  function titleDur(h4) {
    if (R) return ZT_TYPO.reduced.dur;
    if (titleMode(h4) !== "char") return LINE.dur;
    const n = titleTargets(h4).length;
    if (!n) return 0;
    const stagger = n > 1 ? Math.min(CHAR.staggerMax, CHAR.staggerSpan / (n - 1)) : 0;
    return stagger * (n - 1) + CHAR.dur;
  }

  function leadDur(p) {
    if (R) return leadHasDropCap(p) ? ZT_TYPO.reduced.gap + ZT_TYPO.reduced.dur : ZT_TYPO.reduced.dur;
    return leadHasDropCap(p) ? Math.max(CAP.dur, CAP.lead + LINE.dur) : LINE.dur;
  }

  /**
   * Initialise every animatable part of a beat.
   * The beat container itself stays the host's responsibility.
   */
  function initBeat(beat) {
    Array.from(beat.querySelectorAll("[data-reveal]")).forEach((part) => {
      const kind = part.getAttribute("data-reveal");
      if (kind === "eyebrow") initEyebrow(part);
      else if (kind === "title") initTitle(part);
      else if (kind === "lead") initLead(part);
      else initLine(part);
    });
  }

  /**
   * Author a beat's reveal.
   * @param {HTMLElement} beat
   * @param {number} at    absolute host-timeline time of the first stage
   * @param {number} win   maximum time the reveal may occupy (0/undefined = no cap)
   * @returns {number}     absolute time the last stage finishes
   */
  function revealBeat(beat, at, win) {
    const parts = Array.from(beat.querySelectorAll("[data-reveal]"));
    if (!parts.length) return at;
    const { plan, length } = planParts(parts);
    const scale = (win > 0 && length > win) ? (win / length) : 1;

    plan.forEach(({ part, kind, start }) => {
      const t = at + start * scale;
      if (kind === "eyebrow") revealEyebrow(part, t);
      else if (kind === "title") revealTitleScaled(part, t, scale);
      else if (kind === "lead") revealLeadScaled(part, t, scale);
      else revealLine(part, t, (R ? ZT_TYPO.reduced.dur : LINE.dur) * scale);
    });
    return at + length * scale;
  }

  // Scaled variants — the scale factor has to reach INSIDE the char stagger and
  // the drop-cap lead, otherwise a compressed beat would still overrun.
  function revealTitleScaled(h4, at, scale) {
    if (scale === 1) return revealTitle(h4, at);
    if (R || titleMode(h4) !== "char") {
      const target = titleTargets(h4)[0];
      const dur = (R ? ZT_TYPO.reduced.dur : LINE.dur) * scale;
      engine.tw(target, at, dur, R ? { opacity: 1, yPercent: 0 } : { opacity: 1, yPercent: 0 },
        R ? ZT_TYPO.reduced.ease : "power3.out");
      return dur;
    }
    const spans = titleTargets(h4);
    const n = spans.length;
    const stagger = (n > 1 ? Math.min(CHAR.staggerMax, CHAR.staggerSpan / (n - 1)) : 0) * scale;
    spans.forEach((span, i) => {
      engine.tw(span, at + stagger * i, CHAR.dur * scale, { opacity: 1, y: 0, scale: 1 }, CHAR.ease);
    });
    return stagger * (n - 1) + CHAR.dur * scale;
  }

  function revealLeadScaled(p, at, scale) {
    if (scale === 1) return revealLead(p, at);
    const h = leads.get(p);
    if (!h || !h.cap || h.cap.hidden) {
      return revealLine(h ? h.body : p, at, (R ? ZT_TYPO.reduced.dur : LINE.dur) * scale);
    }
    if (R) {
      engine.tw(h.cap, at, ZT_TYPO.reduced.dur * scale, { opacity: 1 }, ZT_TYPO.reduced.ease);
      engine.tw(h.body, at + ZT_TYPO.reduced.gap * scale, ZT_TYPO.reduced.dur * scale, { opacity: 1 }, ZT_TYPO.reduced.ease);
      return (ZT_TYPO.reduced.gap + ZT_TYPO.reduced.dur) * scale;
    }
    engine.tw(h.cap, at, CAP.dur * scale, { opacity: 1, y: 0, scale: 1 }, CAP.ease);
    engine.tw(h.body, at + CAP.lead * scale, LINE.dur * scale, { opacity: 1, y: 0 }, LINE.ease);
    return Math.max(CAP.dur, CAP.lead + LINE.dur) * scale;
  }

  /** Length a beat's reveal WOULD take, unscaled — for host budgeting. */
  function measureBeat(beat) {
    const parts = Array.from(beat.querySelectorAll("[data-reveal]"));
    if (!parts.length) return 0;
    return planParts(parts).length;
  }

  /** No-GSAP / no-animation fallback: show everything, immediately. */
  function showBeatStatic(beat) {
    beat.querySelectorAll("[data-reveal]").forEach((part) => {
      part.style.opacity = "1";
      part.style.transform = "none";
    });
    beat.querySelectorAll(".zt-char, .zt-split, .zt-dropcap, .zt-dc-body, .zt-line-body").forEach((n) => {
      n.style.opacity = "1";
      n.style.transform = "none";
    });
  }

  return {
    config: ZT_TYPO,
    isDesktop,
    reducedMotion: R,
    mountTitle, setTitleText, titleMode, titleTargets,
    mountLead, setLeadText, leadHasDropCap,
    initBeat, initLine,
    revealBeat, measureBeat, hideBlock, revealLine, hideLine,
    showBeatStatic,
    // exposed for hosts that animate individual lines outside a beat
    lineDur: () => (R ? ZT_TYPO.reduced.dur : LINE.dur),
    exitDur: () => (R ? ZT_TYPO.reduced.dur : EXIT.dur)
  };
}
