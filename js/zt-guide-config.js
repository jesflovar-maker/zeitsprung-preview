/* ZEITSPRUNG V2 — js/zt-guide-config.js
   ZEITSPRUNG_GLOBAL_GUIDE_V1 (07B.1) — the ONE configuration of the Brückmandl guide for every monument.
   The engine (js/zt-guide.js) is shared; this file only says, per monument:
     data      : module that exports STR[lang].guide {role, hi, go, ctx} and STR[lang].guideTopics [[label, answer], …]
                 (answers are composed from that monument's own validated page text — never written here)
     go        : topic index -> section id ("Zum Kapitel" link)
     sections  : section id -> topic index (section awareness: the topic offered first while that section is on screen)
   engine "bridge" = Steinerne Brücke keeps its canonical, already-approved bridge knowledge provider
   (js/zt-assistant-fab.js + js/bruckmandl-knowledge-provider.js) through the same entry point.
   Same character (Brückmandl) everywhere; only the topics change. Module URLs must match the page's own i18n import
   (same URL = same module instance, no second download). */
export const ZEITSPRUNG_GLOBAL_GUIDE_V1 = {
  version: 1,
  monuments: {
    "steinerne-bruecke": {
      engine: "bridge",
      link: { scrollTo: "bruckmandl", label: { de: "Zum Kapitel →", en: "Go to chapter →", es: "Ir al capítulo →" } },
      moreLink: { scrollTo: "museum25d", label: { de: "Zur Ausstellung →", en: "To the exhibition →", es: "A la exposición →" } },
      // section -> existing canonical topic id (bridge knowledge provider)
      sections: { stage: "bridge_overview", facts: "bridge_overview", museum25d: "construction", craftGallery: "bridge_materials", kframesGallery: "timeline", bruckmandl: "who", timelineFilm: "timeline", bridgeRoute: "bridge_overview" },
    },
    "dom-st-peter": {
      data: "../DOM_ST_PETER/js/dom-i18n.js?v=20261124a",
      go: ["zeitreise", "zeitleiste", "bauabfolge", "architektur", "bauabfolge", "glas", "glas", "menschen", "unten", "heute"],
      sections: { rundum: 0, holo: 0, architektur: 3, bauabfolge: 2, zeitreise: 0, zeitleiste: 1, glas: 5, menschen: 7, unten: 8, rundgang: 3, heute: 9, ende: 9 },
    },
    "porta-praetoria": {
      data: "../PORTA_PRAETORIA/js/porta-i18n.js?v=20261126a", // 08A: final media (K-frame evolution, clean timeline, trailer)
      go: ["ctx", "durchfahrt", "turm", "y179", "castra", "bau", "film", "heute"],
      sections: { ctx: 0, holo: 1, durchfahrt: 1, turm: 2, y179: 3, castra: 4, plan: 4, bau: 5, kframes: 5, film: 6, alltag: 5, galerie: 0, heute: 7, trailer: 6 },
    },
    "altes-rathaus": {
      data: "../ALTES_RATHAUS_REICHSSAAL/js/ar-i18n.js?v=20261124a",
      go: ["zeit", "aussen", "saalbau", "portal", "saal", "reichstag", "menschen", "material"],
      sections: { heute: 0, aussen: 1, zeit: 0, saalbau: 2, ansicht: 0, portal: 3, saal: 4, menschen: 6, reichstag: 5, material: 7, "heute-innen": 4, ende: 5 },
    },
    "neupfarrplatz": {
      data: "../NEUPFARRPLATZ/js/np-i18n.js?v=20261125a",
      go: ["viertel", "synagoge", "zeit", "archaeologie", "kirche", "misrach", null],
      sections: { heute: 4, viertel: 0, alltag: 0, synagoge: 1, zeit: 2, film: 2, grundriss: 4, licht: 1, kirche: 4, archaeologie: 3, misrach: 5, rueckkehr: 4, trailer: 2, ende: 2 },
    },
  },
};
