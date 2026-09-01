/* ZEITSPRUNG — zt-audio.js
   ============================================================================
   ZT AUDIO SFX ENGINE v1 — a REUSABLE, monument-agnostic Web Audio SFX bus.

   PHASE 2.4A — first activation on the Steinerne Brücke 2.5D museum module.
   This module is a sibling of ./zt-typography.js in spirit: it knows nothing
   about chapters, scroll timelines, manifests or any specific monument's
   content. It only knows:

     - AudioContext lifecycle + a master/category gain graph
     - a semantic-key -> relative-file-path registry, resolved/decoded lazily
     - "play this one-shot now" with a built-in per-event cooldown
     - "start/stop this looping ambience" with linear fade, never a hard cut
     - a persistent (session-only) mute flag

   A host monument (Steinerne Brücke today, any future monument later) supplies
   its OWN event-name -> file-path map via registerSfx() and its OWN chapter/
   choreography logic decides WHEN to call playSfx()/startAmbience()/
   stopAmbience(). This file never contains a monument-specific event name, a
   literal chapter key, or a hardcoded file path outside of SFX_ROOT (the
   shared web-copy audio location, sibling to every monument folder — see
   03_ASSETS/AUDIO/SFX/ for the master library).

   SUGGESTED EVENT VOCABULARY (starting point for THIS and future monuments —
   not a closed enum; a host may register additional semantic keys as needed):
     STONE_MOVE, STONE_LOCK, WOOD_CREAK, ROPE_TENSION, PULLEY_MOVE,
     ASSEMBLY_WHOOSH, CONSTRUCTION_AMBIENCE
   Steinerne Brücke's own registration (see museum25d.js) uses a superset of
   this list (STONE_SLIDE, STONE_IMPACT, STONE_DEBRIS, WOOD_BEAM_MOVE,
   ROPE_PULL, PULLEY_MECHANISM, ASSEMBLY_LOCK, REVEAL_SOFT, plus two additional
   ambience beds) because the discovered audio library offered more usable
   variety than the minimal vocabulary above — future monuments are free to
   reuse either list.

   CATEGORIES — one gain node per category, matching the discovered SFX folder
   names 1:1 (ambience / rope_pulley / stone / transition / wood), inferred
   automatically from each registered relative path's first path segment. A
   future monument's new category (e.g. "metal/") needs ZERO changes here: it
   simply appears the first time a registered path uses that prefix.

   AUDIO UNLOCK — browsers start every AudioContext `suspended` until resumed
   from inside a real user-gesture handler. This module NEVER calls resume()
   itself; ZT_AUDIO_BUS.unlock() must be invoked directly from the SAME click/
   tap handler that represents the user's real gesture (see main.js's
   introSoundToggle / introStartBtn wiring). Calling unlock() multiple times
   from multiple real gestures is safe — AudioContext.resume() is idempotent.

   MUTE — a single master gain node ramps to 0 when muted (default state) and
   back to 1 when unmuted. Muting NEVER stops/destroys the underlying graph or
   any scheduled source — every SFX call site keeps firing exactly as if sound
   were on, so nothing about the visual experience is ever gated on audio
   state (per the hard constraint: the experience must work identically with
   audio permanently off).

   COOLDOWN / ANTI-SPAM — enforced HERE, once, so every call site gets it for
   free rather than re-implementing its own guard (mirrors the `lastRole`/
   `gen` debounce pattern already proven in museum25d.js's transition-clip
   system). Each call to playSfx() carries an "event id" (defaults to the
   semantic key itself, but a host may pass a more specific id — e.g.
   "STONE_LOCK::piers" — so the same sound used by two different chapters does
   not share one cooldown clock). A call within `cooldownMs` of the previous
   FIRED call with the same event id is silently dropped.

   PERSISTENCE — mute state is a plain in-memory module variable, matching the
   "persists for the current session" requirement (not sessionStorage/
   localStorage: the spec only asks for same-session persistence, and a plain
   variable already satisfies that for as long as the page is loaded; using
   sessionStorage was judged unnecessary complexity for this phase).
   ============================================================================ */

// Shared web-copy location for every SFX/ambience WAV, sibling to every
// monument folder (never duplicated inside a monument's own asset tree).
const SFX_ROOT = new URL("../assets/audio/sfx", import.meta.url).href;

// One gain node per discovered category folder name.
const CATEGORIES = ["ambience", "rope_pulley", "stone", "transition", "wood"];

// Per-category BASE volume (linear gain, 0..1). Chosen per the spec's
// "ambience = very low, whoosh/movement = low, wood/rope = low-medium, stone
// lock = medium-but-short" hierarchy. A single loud one-shot at these levels
// still reads as a discreet accent, never a sound-effects showcase.
const CATEGORY_VOLUME = {
  ambience: 0.12,
  transition: 0.30,
  wood: 0.26,
  rope_pulley: 0.28,
  stone: 0.30
};

// Per-event gain MULTIPLIER on top of its category's base volume — lets one
// specific event (e.g. the "lock" moment) read as slightly more present than
// its siblings without a whole new category. 1.0 = exactly the category base.
const EVENT_GAIN_MULTIPLIER = {
  STONE_LOCK: 1.3,       // "medium-but-short" — the one deliberately emphasised stone cue
  ASSEMBLY_LOCK: 1.25,
  REVEAL_SOFT: 0.8,      // deliberately softer than ASSEMBLY_WHOOSH
  STONE_DEBRIS: 0.55     // MATERIAL specimen cue — must read as very subtle
};

// Per-event cooldown (ms) — the anti-spam guard. Tuned by judgment: short
// ambient movement cues (slide/creak/rope) get a shorter window than the two
// "settle" impact sounds, which must never double-fire on a tiny back-and-
// forth scroll around a chapter boundary.
const DEFAULT_COOLDOWN_MS = 650;
const EVENT_COOLDOWN_MS = {
  STONE_LOCK: 900,
  ASSEMBLY_LOCK: 900,
  ASSEMBLY_WHOOSH: 800,
  REVEAL_SOFT: 800,
  STONE_DEBRIS: 600
};

function categoryOfPath(relPath) {
  const idx = relPath.indexOf("/");
  return idx === -1 ? null : relPath.slice(0, idx);
}

function nowMs() {
  return (window.performance && typeof performance.now === "function") ? performance.now() : Date.now();
}

function createZtAudioBus() {
  let ctx = null;
  let masterGain = null;
  const categoryGains = {};
  const registry = new Map();   // semantic key -> relative path under SFX_ROOT
  const buffers = new Map();    // relative path -> Promise<AudioBuffer|null>
  const lastFired = new Map();  // event id -> timestamp (ms)
  let muted = true;             // default OFF, matches the existing soundEnabled default
  let activeAmbience = null;    // { source, gainNode, key } | null

  function ensureContext() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null; // unsupported browser — every public method below no-ops safely
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = muted ? 0 : 1;
    masterGain.connect(ctx.destination);
    CATEGORIES.forEach((cat) => {
      const g = ctx.createGain();
      g.gain.value = CATEGORY_VOLUME[cat] != null ? CATEGORY_VOLUME[cat] : 0.25;
      g.connect(masterGain);
      categoryGains[cat] = g;
    });
    return ctx;
  }

  // MUST be called synchronously from inside a real user-gesture event
  // handler (click/pointerup/touchend). Safe to call redundantly from more
  // than one real gesture — resume() on an already-running context is a
  // harmless no-op.
  function unlock() {
    const c = ensureContext();
    if (!c) return;
    if (c.state === "suspended" && typeof c.resume === "function") {
      c.resume().catch(() => {});
    }
  }

  function setMuted(next) {
    muted = !!next;
    if (masterGain && ctx) {
      const t = ctx.currentTime;
      masterGain.gain.cancelScheduledValues(t);
      masterGain.gain.setValueAtTime(masterGain.gain.value, t);
      masterGain.gain.linearRampToValueAtTime(muted ? 0 : 1, t + 0.12);
    }
  }
  function isMuted() { return muted; }
  function toggleMuted() { setMuted(!muted); return muted; }

  // ZT_SFX_REGISTRY — semantic key -> relative path. Categories are inferred
  // from the path, never declared separately, so a future monument's new
  // category folder needs no engine change (see header).
  function registerSfx(map) {
    Object.keys(map || {}).forEach((key) => registry.set(key, map[key]));
  }

  function loadBuffer(relPath) {
    if (buffers.has(relPath)) return buffers.get(relPath);
    const c = ensureContext();
    if (!c) return Promise.resolve(null);
    const url = `${SFX_ROOT}/${relPath}`;
    const p = fetch(url)
      .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(new Error("sfx fetch failed"))))
      .then((ab) => c.decodeAudioData(ab))
      .catch(() => null);
    buffers.set(relPath, p);
    return p;
  }

  // Optional prefetch — decodes now instead of waiting for first use. Never
  // called automatically at module load (would compete with the page's own
  // ~14 MB image preload); a host may call this once its own deferred-asset
  // gate fires, if it wants zero latency on the very first SFX play.
  function prefetch(keys) {
    const list = keys && keys.length ? keys : Array.from(registry.keys());
    list.forEach((key) => {
      const relPath = registry.get(key);
      if (relPath) loadBuffer(relPath);
    });
  }

  // ZT_SFX_EVENT — plays ONE registered semantic event now, subject to the
  // per-event-id cooldown. `opts.eventId` lets a host scope the cooldown more
  // narrowly than the bare semantic key (e.g. one id per chapter using the
  // same sound) without touching this file. `opts.gain` is an additional
  // caller-side multiplier on top of the category + per-event defaults, for
  // the rare case a host wants one specific occurrence quieter/louder.
  function playSfx(key, opts) {
    const o = opts || {};
    const relPath = registry.get(key);
    if (!relPath) return false; // unknown key — never throws, never plays garbage

    const eventId = o.eventId || key;
    const cooldown = o.cooldownMs != null ? o.cooldownMs : (EVENT_COOLDOWN_MS[key] != null ? EVENT_COOLDOWN_MS[key] : DEFAULT_COOLDOWN_MS);
    const t = nowMs();
    const last = lastFired.has(eventId) ? lastFired.get(eventId) : -Infinity;
    if (t - last < cooldown) return false;
    lastFired.set(eventId, t);

    const c = ensureContext();
    if (!c) return false;
    const category = categoryOfPath(relPath);
    const catGain = categoryGains[category] || masterGain;

    loadBuffer(relPath).then((buffer) => {
      if (!buffer || !ctx) return;
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const gainNode = ctx.createGain();
      const eventMul = EVENT_GAIN_MULTIPLIER[key] != null ? EVENT_GAIN_MULTIPLIER[key] : 1;
      gainNode.gain.value = eventMul * (o.gain != null ? o.gain : 1);
      src.connect(gainNode);
      gainNode.connect(catGain);
      try { src.start(0); } catch (err) { /* context closed mid-flight — ignore */ }
    });
    return true;
  }

  // Looping ambience — distinct from one-shot SFX. Only ONE ambience track is
  // ever active at a time; starting a new one always fades/stops whichever
  // was previously active first. Never a hard cut in either direction.
  function startAmbience(key, opts) {
    const o = opts || {};
    if (activeAmbience && activeAmbience.key === key) return; // already the active bed
    const relPath = registry.get(key);
    if (!relPath) return;

    const fadeOutPrev = o.crossfadeOut != null ? o.crossfadeOut : 0.8;
    stopAmbience(fadeOutPrev);

    const c = ensureContext();
    if (!c) return;
    const category = categoryOfPath(relPath) || "ambience";
    const catGain = categoryGains[category] || masterGain;
    const fadeIn = o.fadeIn != null ? o.fadeIn : 1.4; // seconds
    const targetVol = o.gain != null ? o.gain : 1;

    // This request may be superseded (another startAmbience/stopAmbience call)
    // before the buffer finishes decoding — `token` guards against a stale
    // decode callback starting playback after a newer request already moved on.
    const token = {};
    activeAmbience = { source: null, gainNode: null, key, token, pending: true };

    loadBuffer(relPath).then((buffer) => {
      if (!buffer || !ctx || !activeAmbience || activeAmbience.token !== token) return;
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0;
      src.connect(gainNode);
      gainNode.connect(catGain);
      const t0 = ctx.currentTime;
      gainNode.gain.setValueAtTime(0, t0);
      gainNode.gain.linearRampToValueAtTime(targetVol, t0 + fadeIn);
      try { src.start(0); } catch (err) { return; }
      activeAmbience = { source: src, gainNode, key, token, pending: false };
    });
  }

  function stopAmbience(fadeOutSeconds) {
    if (!activeAmbience) return;
    const dur = fadeOutSeconds != null ? fadeOutSeconds : 1.2;
    const entry = activeAmbience;
    activeAmbience = null; // released immediately so a concurrent startAmbience() never sees a stale "already active" match
    if (entry.pending || !ctx || !entry.source || !entry.gainNode) return; // nothing audible yet — nothing to fade
    try {
      const t0 = ctx.currentTime;
      entry.gainNode.gain.cancelScheduledValues(t0);
      entry.gainNode.gain.setValueAtTime(entry.gainNode.gain.value, t0);
      entry.gainNode.gain.linearRampToValueAtTime(0.0001, t0 + dur);
      entry.source.stop(t0 + dur + 0.05);
    } catch (err) { /* already stopped/closed — ignore */ }
  }

  return {
    unlock,
    setMuted,
    isMuted,
    toggleMuted,
    registerSfx,
    prefetch,
    playSfx,
    startAmbience,
    stopAmbience,
    categories: CATEGORIES.slice()
  };
}

// Singleton — ONE audio bus for the whole page (a host page never needs two
// AudioContexts). Any monument module imports this same instance.
export const ZT_AUDIO_BUS = createZtAudioBus();
