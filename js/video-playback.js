// ---------------------------------------------------------------------------
// ZEITSPRUNG — shared safe video playback helper (RUNTIME HOTFIX).
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
      if (desiredPaused.get(video)) video.pause();
    },
    () => {
      pending.set(video, null);
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
