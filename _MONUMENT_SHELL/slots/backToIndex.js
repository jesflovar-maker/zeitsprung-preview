/* _MONUMENT_SHELL/slots/backToIndex.js — SLOT 10: BACK TO INDEX
   ----------------------------------------------------------------------------
   SCAFFOLDING ONLY — not wired into any page. See ../index.js for the full
   contract. Reusable reference implementation to MODEL against:
   STEINERNE_BRUECKE/index.html's `.navbar__brand` link (`href="../index.html"`,
   already relative-from-monument-page, no zt-paths.js resolution needed) —
   the always-present, non-feature-flagged way back to the main ZEITSPRUNG
   monument gallery. Unlike the other 9 slots, this one has no matching
   featureFlags key (see ../index.js's MONUMENT_SHELL_SLOTS: `featureFlag: null`)
   — it is expected to always render for every monument, active or not.

   Expected `config` shape a future monument would author (illustrative only):
     { indexHref: "../index.html" } // constant across all monuments today
*/
export function renderBackToIndexSlot(config, container) {
  // eslint-disable-next-line no-console
  console.warn("[_MONUMENT_SHELL] renderBackToIndexSlot() is a scaffold stub — not implemented.", { config, container });
  return null;
}
