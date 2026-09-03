/* _MONUMENT_SHELL/slots/sources.js — SLOT 6: QUELLEN
   ----------------------------------------------------------------------------
   SCAFFOLDING ONLY — not wired into any page. See ../index.js for the full
   contract. Reusable reference implementation to MODEL against: the per-
   K-frame Quellen line resolved by kframes-gallery.js against
   02_CONTENT/Steinerne_Bruecke/SOURCES/sources.json (source_ids -> full
   citation) — per PLATFORM_ARCHITECTURE_V3.md Section L, "QUELLEN
   ARCHITECTURE ... confirmed reusable" as-is.

   Expected `config` shape a future monument would author (illustrative only):
     { sourcesUrl: "<MASTER 02_CONTENT path via js/zt-paths.js>" }
   (a future monument supplies its own sources.json; the resolution logic
   itself needs no change).
*/
export function renderSourcesSlot(config, container) {
  // eslint-disable-next-line no-console
  console.warn("[_MONUMENT_SHELL] renderSourcesSlot() is a scaffold stub — not implemented.", { config, container });
  return null;
}
