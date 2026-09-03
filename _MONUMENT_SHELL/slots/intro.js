/* _MONUMENT_SHELL/slots/intro.js — SLOT 1: INTRO
   ----------------------------------------------------------------------------
   SCAFFOLDING ONLY — not wired into any page. See ../index.js for the full
   contract. Reusable reference implementation to MODEL against (not copy
   verbatim): STEINERNE_BRUECKE/index.html's `#intro-gate` + main.js's
   buildIntroMedia()/buildIntroTypography()/wireIntroGate() — a cinematic
   full-bleed hero (video or poster image) + title reveal + a tap/scroll gate
   into the rest of the page.

   Expected `config` shape a future monument would author (illustrative only):
     {
       title: { de, en, es },
       subtitle: { de, en, es },
       heroVideo: "assets/<monument>/hero/....mp4" | null,
       heroPoster: "assets/<monument>/hero/....jpg"
     }
*/
export function renderIntroSlot(config, container) {
  // eslint-disable-next-line no-console
  console.warn("[_MONUMENT_SHELL] renderIntroSlot() is a scaffold stub — not implemented.", { config, container });
  return null;
}
