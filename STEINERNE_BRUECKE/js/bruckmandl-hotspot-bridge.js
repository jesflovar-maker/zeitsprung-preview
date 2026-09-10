/* ZEITSPRUNG V2 — STEINERNE_BRUECKE/js/bruckmandl-hotspot-bridge.js
   ============================================================================
   BRUCKMANDL HOTSPOT BRIDGE — connects real interactive-fact elements on
   this page to the Bruckmandl assistant, WITHOUT coupling those elements'
   own rendering code to any Bruckmandl content.

   WHY THIS FILE EXISTS
   ---------------------
   The owner asked for hotspot -> Bruckmandl wiring following this pattern:
     hotspot emits context -> a small bridge listens -> the bridge resolves
     a known topic id -> the bridge drives Bruckmandl's EXISTING pose/answer
     rendering (never a new render path, never duplicated QA content).

   INVESTIGATION FINDING THIS FILE IS SCOPED TO (see delivery report for the
   full write-up): museum25d.js (Group B, untouched) implements ZERO tap-
   hotspots by design, and the page's only other "hotspot"-shaped element
   (kframes-gallery.js's `.kf__cap-hotspot`) is a plain scroll-to-anchor CTA
   with no historical content of its own — neither is a real candidate for
   this bridge.

   UPDATE (Phase: bridge knowledge expansion) — the FACTS section's four
   `.fact-card` elements (Baubeginn / Fertigstellung / Bögen / Pfeiler) used
   to be explicitly left unwired here, because none of the original 8
   BRUCKMANDL_QA topics said anything about the bridge's arch/pier count or
   construction dates. That content gap is now closed: 6 new bridge-level
   topics (bridge_overview/arches/piers/bridge_materials/timeline/
   construction) were added to bruckmandl-guide-core.js, each sourced from
   already-approved MUSEUM_CONTENT_MAP.json / i18n.js content (see that
   file's header for the full provenance). The four fact cards are now
   wired below via `js/main.js`'s `wireFactCardHotspots()`, which dispatches
   the SAME BRUCKMANDL_HOTSPOT_EVENT the cutout/material cards already use
   — this bridge only had to gain 4 new map entries, no new event system.
   Baubeginn (1135) and Fertigstellung (1146) both resolve to
   `bridge_overview`, since that topic's own answer already states the full
   "1135–1146" construction range (MUSEUM_CONTENT_MAP.json's
   bridge_overview_structure short_description) — inventing two separately
   worded answers for the two endpoints of the same validated date range
   would be a distinction the sources don't make. Bögen resolves to
   `arches`, Pfeiler resolves to `piers` — both direct 1:1 matches.

   The other already-existing, content-matched candidates are INSIDE the
   Bruckmandl module itself: specific cutout/material crops
   (STEINERNE_BRUECKE/js/bruckmandl.js's CUTOUT_ASSETS/MATERIAL_ASSETS) that
   depict the exact physical element a canonical QA answer already
   describes in its own text (e.g. the "detail" answer literally names
   "das Wappenschild mit den Schlüsseln am Sockel" — the shield_panel_keys
   cutout). See HOTSPOT_TOPIC_MAP below for the full, honest list — every
   entry is commented with the textual justification for the match. No id
   here was invented; every id is a real, already-shipped asset id from
   bruckmandl.js's own CUTOUT_ASSETS/MATERIAL_ASSETS arrays, or a real,
   already-rendered fact-card element id from index.html's #facts section.

   ARCHITECTURE / NO CIRCULAR DEPENDENCY
   ---------------------------------------------------------------------------
   - This module imports the topic core (bruckmandl-guide-core.js) and the
     answer provider (bruckmandl-knowledge-provider.js) — it does NOT import
     bruckmandl.js, and bruckmandl.js does NOT import this module's topic
     map. The only thing bruckmandl.js's rendering code imports from
     "shared wiring" is BRUCKMANDL_HOTSPOT_EVENT, and that constant lives in
     bruckmandl-guide-core.js (a common, already-neutral root both files
     already depend on) — never imported directly between bruckmandl.js and
     this bridge in either direction. No import cycle exists.
   - This module never renders anything and never touches the DOM beyond
     `document.addEventListener`. It has no opinion about which elements are
     tappable — that decision belongs entirely to whichever module renders
     the hotspot UI (bruckmandl.js's own HOTSPOT_ENABLED_IDS constant, kept
     in manual sync with this map's keys via a comment in both files, since
     the two lists must never drift silently).
   - Wiring itself (giving this bridge a live reference to the mounted
     Bruckmandl assistant API) is done by js/main.js via plain dependency
     injection (a getApi() closure), not via an import between the two
     feature modules.
   - If Bruckmandl never mounts (getApi() returns null/undefined, or the
     returned API has no answerTopic method), the bridge does nothing and
     throws nothing — the rest of the page, including whatever dispatched
     the hotspot event, is completely unaffected (additive-only, per the
     brief's "must keep working even if Brückmandl fails to load" rule).
   - This bridge NEVER contains historical content or QA logic itself — it
     only maps an id to an already-authored topic id and defers to
     LocalValidatedProvider / bruckmandl.js's own render functions for
     everything else.
   ============================================================================ */

import { BRUCKMANDL_HOTSPOT_EVENT, BRUCKMANDL_TOPICS } from "../../js/bruckmandl-guide-core.js";
import { LocalValidatedProvider } from "../../js/bruckmandl-knowledge-provider.js";

// ---------------------------------------------------------------------------
// hotspotId -> canonical BRUCKMANDL_QA topic id. ONLY real, already-shipped
// asset ids (STEINERNE_BRUECKE/js/bruckmandl.js's CUTOUT_ASSETS/
// MATERIAL_ASSETS) map to ONLY real, already-authored topic ids
// (bruckmandl-guide-core.js's BRUCKMANDL_TOPICS). Validated defensively at
// module load below — an id mapped to anything else is dropped with a
// console.warn rather than ever risking an invented/mismatched answer.
//
// Every entry's justification is the QA answer's OWN wording, not an
// inference:
//   - shield_panel_keys / shield_panel_lion_with_cap -> "detail": the
//     "detail" answer literally names "das Wappenschild mit den Schlüsseln
//     am Sockel" / "the heraldic shield with the keys" and explicitly
//     refers to "die beiden Wappenreliefs" / "the two heraldic reliefs" —
//     these two cutouts ARE those two reliefs.
//   - figure -> "who": the "who" answer's own text is "Die Figur, die du
//     hier siehst..." / "The figure you see today..." — a direct
//     self-reference to the whole-figure cutout. This is the weakest of
//     the three justifications (a general portrait vs. a narrowly-targeted
//     physical detail) — flagged in the delivery report for the owner to
//     confirm or drop.
//   - stone_surface / weathering / inscription_surface / relief_surface /
//     column_surface -> "material": all five are literally grouped under
//     bruckmandl.js's own "Materialien" media-strip label
//     (bruckmandlMaterialsLabel), and the "material" QA answer is exactly
//     about what material the figure is made of (Grünsandstein for the
//     1579 original, unresolved for the current 1854 figure) — the same
//     subject these five crops depict.
// ---------------------------------------------------------------------------
const RAW_HOTSPOT_TOPIC_MAP = {
  figure: "who",
  shield_panel_keys: "detail",
  shield_panel_lion_with_cap: "detail",
  stone_surface: "material",
  weathering: "material",
  inscription_surface: "material",
  relief_surface: "material",
  column_surface: "material",
  // FACTS section's 4 real, already-rendered `.fact-card` elements
  // (index.html's #facts, dispatched by js/main.js's
  // wireFactCardHotspots() — see that function's header for the exact
  // hotspotId values, which mirror the cards' own existing DOM ids).
  // Baubeginn/Fertigstellung both resolve to bridge_overview (its answer
  // already states the full validated "1135–1146" range as one claim, see
  // this file's header note above for why the two dates are not split into
  // two different answers). Bögen -> arches, Pfeiler -> piers: direct 1:1
  // matches to the newly-authored bridge-level topics.
  fact_baubeginn: "bridge_overview",
  fact_fertigstellung: "bridge_overview",
  fact_boegen: "arches",
  fact_pfeiler: "piers"
};

// Defensive filter — never trust the raw map blindly. Any entry whose topic
// is not one of the 8 real canonical topics is dropped (and logged), so a
// future typo here can never surface as a silently-wrong/invented answer.
const HOTSPOT_TOPIC_MAP = Object.freeze(
  Object.fromEntries(
    Object.entries(RAW_HOTSPOT_TOPIC_MAP).filter(([hotspotId, topic]) => {
      const ok = BRUCKMANDL_TOPICS.includes(topic);
      if (!ok) {
        // eslint-disable-next-line no-console
        console.warn(`[bruckmandl-hotspot-bridge] dropping "${hotspotId}" -> "${topic}" (not a real BRUCKMANDL_TOPICS id)`);
      }
      return ok;
    })
  )
);

/** @param {string} hotspotId @returns {boolean} */
export function isKnownBruckmandlHotspot(hotspotId) {
  return Object.prototype.hasOwnProperty.call(HOTSPOT_TOPIC_MAP, hotspotId);
}

// Exported read-only for anything that wants to render an affordance ONLY
// for ids this bridge actually understands (e.g. a future page-level
// hotspot renderer). bruckmandl.js's own media-strip cards intentionally do
// NOT import this map (see file header) — they keep a manually-synced local
// list instead, to avoid bruckmandl.js depending on this bridge module.
export function getBruckmandlHotspotIds() {
  return Object.keys(HOTSPOT_TOPIC_MAP);
}

let wired = false;

/**
 * Wires the document-level hotspot listener. Safe to call once at startup,
 * independent of whether/when the Bruckmandl module itself has mounted —
 * `getApi()` is called lazily on every event, not cached at wiring time.
 * @param {{ getApi: () => ({ answerTopic: (topic: string) => void } | null),
 *           getLang: () => string }} params
 */
export function initBruckmandlHotspotBridge({ getApi, getLang } = {}) {
  if (wired) return; // idempotent — main.js should only call this once, but never double-wire if it does
  if (typeof getApi !== "function" || typeof getLang !== "function") return;
  wired = true;

  document.addEventListener(BRUCKMANDL_HOTSPOT_EVENT, (event) => {
    const hotspotId = event && event.detail && event.detail.hotspotId;
    if (!hotspotId) return;

    const topic = HOTSPOT_TOPIC_MAP[hotspotId];
    if (!topic) return; // no entry -> leave the hotspot's own existing behavior untouched, no guessing

    // Resolved purely for the defensive "no validated content" pathway
    // (BrueckmandlKnowledgeProvider's own contract) — never used to render
    // anything itself. The actual pose/answer rendering is always driven
    // through bruckmandl.js's own answerTopic(), reusing the exact same
    // function its suggested-question buttons already call — no duplicated
    // rendering logic lives in this bridge.
    const lang = getLang();
    const preview = LocalValidatedProvider.answerTopic(topic, lang);
    if (!preview || !preview.matched) return; // defensive only — every mapped topic above is a real BRUCKMANDL_QA entry

    const api = getApi();
    if (!api || typeof api.answerTopic !== "function") return; // Bruckmandl not mounted / failed to load — fail silently, rest of page unaffected

    api.answerTopic(topic);
  });
}
