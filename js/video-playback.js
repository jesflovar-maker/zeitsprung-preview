// ---------------------------------------------------------------------------
// ZEITSPRUNG — shared safe video playback helper (RUNTIME HOTFIX).
//
// PHASE 3.1 — GLOBAL VIDEO RUNTIME. Everything below the original
// safePlay()/safePause() (unchanged, still the low-level browser-mechanics
// primitives every call site already used) is an ADDITIVE state-ownership
// layer: register()/activate()/deactivate() give every presentation video
// ONE explicit state owner (never "ACTIVE per module A, PAUSED per module
// B" at once), and retryActive()/pauseHidden()/resumeActive() are the ONE
// centralized first-gesture-retry and document-visibility mechanism for
// every video that goes through activate() — replacing the one bespoke,
// FPV-only visibilitychange listener that predates this phase (removed from
// STEINERNE_BRUECKE/js/main.js's buildVideoChapter(), see that file) with a
// single mechanism any current or future (monument 6-12+) module gets for
// free just by calling activate()/deactivate() instead of raw play()/
// pause(). This is still NOT a video framework and not a second competing
// manager — modules still only ever call functions exported from this one
// file for browser playback; they still own WHEN media should be active
// (scroll position, selection state, chapter geometry), this file still
// only owns HOW that intent is executed safely.
//
// ROOT CAUSE this file fixes: every presentation video across the project
// (index hero/VISION/MISSION/OBJECTIVE, monument gallery foreground/
// background, the Steinerne Brücke FPV flyover) called `video.play()` with a
// bare `.catch(() => {})` and never tracked the returned promise. On its own
// that's harmless — but every one of these call sites ALSO calls
// `video.pause()` from a different trigger (ScrollTrigger onLeave, an
// IntersectionObserver, a monument-switch handler) with no coordination
// against an in-flight, not-yet-resolved play() promise. Calling pause()
// while play() is still pending throws
// "The play() request was interrupted by a call to pause()" — swallowed by
// the bare .catch(), so nothing ever surfaced as an error — but on WebKit
// (Safari/iOS) this leaves the <video> in a state where the browser has
// decided playback is "paused" internally even though JS already saw
// paused === false from an earlier synchronous read, and subsequent play()
// calls silently no-op (poster/last frame stays static, currentTime never
// advances again) until the page is fully reloaded. This reproduces exactly
// the reported symptom: HTTP 200, poster/first frame visible, paused
// reads false, but the video is visually frozen.
//
// Fix: every play()/pause() call for a presentation video goes through
// safePlay()/safePause() below, which track one in-flight play promise per
// video and defer any pause request until that promise settles (or ignore a
// stale one). This is NOT a new video framework — it's the same "call
// .play(), ignore the rejection" pattern every call site already used,
// just made race-safe.
// ---------------------------------------------------------------------------

const pending = new WeakMap(); // video -> Promise<void> | null
const desiredPaused = new WeakMap(); // video -> boolean (what SHOULD happen once play() settles)

// ---------------------------------------------------------------------------
// PHASE 3.1 — explicit state model (Section 4). One owner per video: this
// WeakMap IS that owner. Every video register()-ed gets one meta record;
// nothing outside this file mutates `.state` directly.
// ---------------------------------------------------------------------------
export const STATE = Object.freeze({
  INACTIVE: "INACTIVE",
  PREPARING: "PREPARING",
  ACTIVE: "ACTIVE",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
  BLOCKED: "BLOCKED",
  ERROR: "ERROR"
});

const meta = new WeakMap(); // video -> { id, role, state, pausedByVisibility, lastBlockReason }
const activeVideos = new Set(); // videos currently owned ACTIVE by some module (register/activate order preserved)
const listenersWired = new WeakSet();

function metaFor(video) {
  if (!meta.has(video)) {
    meta.set(video, { id: null, role: null, state: STATE.INACTIVE, pausedByVisibility: false, lastBlockReason: null });
  }
  return meta.get(video);
}

function setState(video, state) {
  const m = metaFor(video);
  m.state = state;
}

function ensureAutoplayAttrs(video) {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("muted", "");
}

// Plays `video`, coordinating against any in-flight play() from a previous
// call so a fast play->pause->play sequence (scroll, monument switch,
// re-entering a ScrollTrigger zone) can never interrupt a pending promise.
// Null-safe. Never throws / never produces an uncaught rejection.
export function safePlay(video) {
  if (!video) return;
  ensureAutoplayAttrs(video);
  desiredPaused.set(video, false);

  if (pending.get(video)) return; // a play() is already in flight; let it settle

  let p;
  try {
    p = video.play();
  } catch (err) {
    return;
  }
  if (!p || typeof p.then !== "function") return; // older browsers: play() returns undefined

  pending.set(video, p);
  p.then(
    () => {
      pending.set(video, null);
      // A pause was requested while this play() was still resolving —
      // honor it now that it's safe to do so.
      if (desiredPaused.get(video)) {
        video.pause();
      } else if (meta.has(video)) {
        setState(video, STATE.PLAYING);
      }
    },
    (err) => {
      pending.set(video, null);
      if (meta.has(video)) {
        setState(video, STATE.BLOCKED);
        metaFor(video).lastBlockReason = (err && err.name) || String(err);
      }
      // Autoplay was blocked (e.g. a stray non-gesture context on some
      // WebKit versions) — the first-gesture retry queue below will
      // attempt this exact video again.
      queueGestureRetry(video);
    }
  );
}

// Pauses `video`, deferring until any in-flight play() promise has settled
// so we never call pause() mid-flight (the exact race that causes the
// freeze this file fixes). Null-safe.
export function safePause(video) {
  if (!video) return;
  desiredPaused.set(video, true);
  if (pending.get(video)) return; // play() in flight — its .then() above will pause once settled
  try {
    video.pause();
  } catch (err) {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// First-gesture retry queue — for videos whose initial safePlay() was
// rejected by the browser's autoplay policy (rare for muted video, but does
// happen on some WebKit versions for a video not yet attached to the DOM at
// the moment play() was first attempted). Retries ONLY videos that are
// still marked as "should be playing" at the moment the gesture fires —
// never starts a video that has since become inactive/hidden.
// ---------------------------------------------------------------------------
const retryQueue = new Set();
let gestureListenersInstalled = false;

function queueGestureRetry(video) {
  retryQueue.add(video);
  installGestureListenersOnce();
}

function retryQueuedVideos() {
  retryQueue.forEach((video) => {
    if (desiredPaused.get(video) === false) safePlay(video);
  });
  retryQueue.clear();
}

function installGestureListenersOnce() {
  if (gestureListenersInstalled) return;
  gestureListenersInstalled = true;
  const events = ["pointerdown", "touchstart", "click", "keydown"];
  const handler = () => {
    retryQueuedVideos();
    if (retryQueue.size === 0) {
      events.forEach((ev) => document.removeEventListener(ev, handler, true));
      gestureListenersInstalled = false;
    }
  };
  events.forEach((ev) => document.addEventListener(ev, handler, true));
}

// ---------------------------------------------------------------------------
// PHASE 3.1 — register/activate/deactivate (Section 3's required conceptual
// API). A module declares WHEN a video becomes the active one for its own
// slot (scroll position, selection, chapter geometry) by calling
// activate()/deactivate(); this file alone decides HOW that gets executed
// (safePlay/safePause, retry, visibility). Never a second competing manager.
// ---------------------------------------------------------------------------

// Wires the real DOM events once per video (idempotent) purely for ACCURATE
// state/debug reporting — never used to decide play/pause itself, so it can
// never race against or override safePlay/safePause's own logic.
function wireStateListenersOnce(video) {
  if (listenersWired.has(video)) return;
  listenersWired.add(video);
  video.addEventListener("playing", () => {
    if (meta.has(video)) setState(video, STATE.PLAYING);
  });
  video.addEventListener("pause", () => {
    if (meta.has(video) && metaFor(video).state !== STATE.INACTIVE) setState(video, STATE.PAUSED);
  });
  video.addEventListener("ended", () => {
    // A non-looping single-play video (intro-gate, historical reel) holds
    // its last frame — 'ended' is a legitimate settled state, not an error.
    if (meta.has(video) && metaFor(video).state !== STATE.INACTIVE) setState(video, STATE.PAUSED);
  });
  video.addEventListener("error", () => {
    if (meta.has(video)) setState(video, STATE.ERROR);
  });
}

// Registers `video` under a logical id/role (both optional, debug-only —
// never consumed for playback logic) and ensures the safe-autoplay attrs are
// present even before any play attempt. Idempotent — safe to call every time
// a module (re)builds a surface (e.g. gallery.js's per-monument switch).
export function register(video, options) {
  if (!video) return video;
  ensureAutoplayAttrs(video);
  const m = metaFor(video);
  if (options && options.id) m.id = options.id;
  if (options && options.role) m.role = options.role;
  wireStateListenersOnce(video);
  return video;
}

// Marks `video` as the ACTIVE video for its slot and plays it. This is what
// every existing safePlay() call site that means "this is now THE video for
// this slot" should call instead — the ONLY functional difference from a
// bare safePlay() is that the video is now tracked in `activeVideos`, so the
// centralized retryActive()/pauseHidden()/resumeActive() below know about it.
export function activate(video, options) {
  if (!video) return;
  register(video, options);
  setState(video, STATE.PREPARING);
  activeVideos.add(video);
  metaFor(video).pausedByVisibility = false;
  safePlay(video);
}

// Marks `video` as no longer the active video for its slot and pauses it.
// Removes it from `activeVideos` — pauseHidden()/resumeActive() will never
// touch a deactivated video (its owning module, not a tab-visibility event,
// decides if/when it becomes active again).
export function deactivate(video) {
  if (!video) return;
  activeVideos.delete(video);
  if (meta.has(video)) {
    metaFor(video).pausedByVisibility = false;
    setState(video, STATE.INACTIVE);
  }
  safePause(video);
}

// Section 6 — ONE centralized first-user-gesture recovery entry point.
// Retries ONLY videos that are (a) currently owned ACTIVE by some module and
// (b) actually BLOCKED — never starts a hidden/inactive video. Exposed as a
// named export so a caller (e.g. a debug panel) can invoke it explicitly;
// the gesture listeners installed by queueGestureRetry() already call the
// equivalent internal logic automatically the moment any real play()
// rejection occurs, so nothing needs to call this manually in normal
// operation.
export function retryActive() {
  activeVideos.forEach((video) => {
    if (meta.has(video) && metaFor(video).state === STATE.BLOCKED) safePlay(video);
  });
}

// Section 7 — ONE centralized document-visibility handler. Pauses only
// videos that are currently ACTIVE-and-PLAYING (never a hidden gallery/
// chapter video that some module already deactivated) — ownership in
// `activeVideos` is untouched, so this can never look like "the module gave
// up on this video," only "the browser tab can't render it right now."
export function pauseHidden() {
  activeVideos.forEach((video) => {
    const m = meta.get(video);
    if (!m) return;
    // Marked unconditionally, NOT gated on `video.paused` -- some WebKit
    // versions silently pause a backgrounded video at the OS level before
    // (or without ever firing) this handler observing `paused === false`,
    // which is exactly the freeze this replaces a bespoke per-video fix
    // for (see the removed visibilitychange listener that used to live in
    // STEINERNE_BRUECKE/js/main.js's buildVideoChapter()). Always flagging
    // "this ACTIVE video should resume on visible" regardless of its
    // current .paused reading is what makes resumeActive() reliable.
    m.pausedByVisibility = true;
    safePause(video);
  });
}

// Resumes only the videos pauseHidden() itself paused for visibility reasons
// (never a video some module deactivated in the meantime, and never a video
// that was already BLOCKED/ERROR before the tab was hidden — that stays for
// the gesture-retry path, not this one).
export function resumeActive() {
  activeVideos.forEach((video) => {
    const m = meta.get(video);
    if (!m || !m.pausedByVisibility) return;
    m.pausedByVisibility = false;
    safePlay(video);
  });
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") pauseHidden();
    else resumeActive();
  });
}

// ---------------------------------------------------------------------------
// PHASE 3.1 — Section 18 debug support. Development diagnostics only, never
// rendered as visitor-facing UI; callers gate this behind their own existing
// `?debug=1` check (see js/index-main.js, STEINERNE_BRUECKE/js/main.js).
// ---------------------------------------------------------------------------
export function getDebugSnapshot() {
  // Only currently-ACTIVE-owned videos -- a video some module already
  // deactivated is no longer this runtime's concern to report on (its own
  // module's state, if any, is what's relevant at that point).
  const rows = [];
  activeVideos.forEach((video) => rows.push(video));
  return rows.map((video) => {
    const m = metaFor(video);
    return {
      id: m.id,
      role: m.role,
      state: m.state,
      paused: video.paused,
      currentTime: video.currentTime,
      readyState: video.readyState,
      muted: video.muted,
      playsInline: video.playsInline,
      visibility: document.visibilityState,
      lastBlockReason: m.lastBlockReason
    };
  });
}
