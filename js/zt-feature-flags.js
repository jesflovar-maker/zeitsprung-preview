/* ZEITSPRUNG V2 — js/zt-feature-flags.js
   ============================================================================
   PHASE 3.0A — Section 7. Read-only access to the `featureFlags` object each
   monument already carries inside monuments.config.json (added in Phase 3.0,
   see that file's per-monument `featureFlags._readme`).

   WHAT THIS MODULE IS
   ---------------------------------------------------------------------------
   A small, central place to FETCH monuments.config.json and hand back one
   monument's featureFlags object, using js/zt-paths.js's MONUMENTS_CONFIG_URL
   constant (never a hardcoded/re-derived path — see that file's own header
   for why every consumer must import its resolved constants instead of
   re-deriving them).

   WHAT THIS MODULE IS EXPLICITLY NOT (READ THIS BEFORE WIRING IT IN FURTHER)
   ---------------------------------------------------------------------------
   This is a READ CAPABILITY ONLY. As of Phase 3.0A, NOTHING in the runtime
   calls getFeatureFlags() to gate any UI (`if (flags.x) { show/hide... }`).
   The only current caller (STEINERNE_BRUECKE/js/main.js's boot()) uses it
   purely to prove the architecture can read central "monument capability"
   config end-to-end — it stores the result on `window.ZT_FEATURE_FLAGS` and
   logs it, and does not branch any visible behavior on it.

   Wiring an actual feature flag into a real UI conditional for a specific
   module (Timeline, 3D, Guide, Brückmandl, ...) is a FUTURE, separate task —
   doing so here would be "activating an unfinished feature" ahead of that
   feature actually being built, which Phase 3.0A explicitly prohibits (see
   PLATFORM_ARCHITECTURE_V3.md Section 10 and CLAUDE.md's frozen-baseline
   rule). Do not add conditionals against this module's return value without
   an explicit go-ahead for that specific feature.

   USAGE
   ---------------------------------------------------------------------------
     import { getFeatureFlags } from "../../js/zt-feature-flags.js";
     const flags = await getFeatureFlags("steinerne-bruecke");
     // flags === { intro: true, facts: true, ... } (or the safe all-false
     // default below if the monument id or its featureFlags block is
     // missing/malformed).
   ============================================================================ */

import { MONUMENTS_CONFIG_URL } from "./zt-paths.js";

// Keys mirrored 1:1 from monuments.config.json's documented featureFlags
// schema (PLATFORM_ARCHITECTURE_V3.md Section 10). Kept here as the safe
// fallback shape so a caller always receives a fully-populated, boolean-only
// object regardless of config state — never `undefined`/partial.
const SAFE_DEFAULT_FLAGS = Object.freeze({
  intro: false,
  facts: false,
  historical_story: false,
  kframes: false,
  timeline: false,
  sources: false,
  museum25d: false,
  threeD: false,
  reel: false,
  guide: false,
  brueckmandl: false
});

let configPromise = null;

// Fetches monuments.config.json exactly once per page load and caches the
// in-flight/resolved promise for every subsequent call (fine-grained enough
// for this small file; no need for a full config module yet).
function loadConfig() {
  if (!configPromise) {
    configPromise = fetch(MONUMENTS_CONFIG_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`monuments.config.json fetch failed: HTTP ${res.status}`);
        return res.json();
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn("[ZT_FEATURE_FLAGS] could not load monuments.config.json:", err);
        return null;
      });
  }
  return configPromise;
}

/**
 * Returns the featureFlags object for the given monument id, or a safe
 * all-false default object if the monument, the config file, or its
 * featureFlags block cannot be found/parsed. Never rejects.
 * @param {string} monumentId - e.g. "steinerne-bruecke"
 * @returns {Promise<Object>} boolean-only featureFlags object (see
 *   SAFE_DEFAULT_FLAGS for the exact key set)
 */
export async function getFeatureFlags(monumentId) {
  const data = await loadConfig();
  if (!data || !Array.isArray(data.monuments)) {
    return { ...SAFE_DEFAULT_FLAGS };
  }
  const monument = data.monuments.find((m) => m && m.id === monumentId);
  if (!monument || typeof monument.featureFlags !== "object" || monument.featureFlags === null) {
    return { ...SAFE_DEFAULT_FLAGS };
  }
  // Merge onto the safe defaults rather than returning the raw object, so a
  // future monument entry that omits a not-yet-invented flag key still
  // returns a fully-shaped object instead of `undefined` for that key.
  const { _readme, ...rest } = monument.featureFlags;
  return { ...SAFE_DEFAULT_FLAGS, ...rest };
}
