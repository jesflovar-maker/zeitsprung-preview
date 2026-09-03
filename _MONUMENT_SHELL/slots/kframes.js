/* _MONUMENT_SHELL/slots/kframes.js — SLOT 4: KFRAMES
   ----------------------------------------------------------------------------
   SCAFFOLDING ONLY — not wired into any page. See ../index.js for the full
   contract. Reusable reference implementation to MODEL against:
   STEINERNE_BRUECKE/js/kframes-gallery.js's ENGINE (manifest-driven crossfade
   viewport + caption block + Quellen source-line resolution). Per
   PLATFORM_ARCHITECTURE_V3.md Section G that engine is "MODIFY before
   reuse" — the JS logic is generic, but a future monument needs its OWN
   manifest (its own KFRAMES_STORY_MAP.json-equivalent) and its own container
   id, not literally `#kframesGallery` + Steinerne Brücke's K01-K12 content.

   Expected `config` shape a future monument would author (illustrative only):
     { manifestUrl: "<MASTER 03_ASSETS path via js/zt-paths.js>", containerId }
*/
export function renderKframesSlot(config, container) {
  // eslint-disable-next-line no-console
  console.warn("[_MONUMENT_SHELL] renderKframesSlot() is a scaffold stub — not implemented.", { config, container });
  return null;
}
