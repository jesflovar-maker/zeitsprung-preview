/* ZEITSPRUNG V2 — js/index-i18n.js
   PHASE 2.7 — MAIN INDEX chrome dictionary (DE/EN/ES).

   This is a SEPARATE, small dictionary from STEINERNE_BRUECKE/js/i18n.js — it
   only carries copy for THIS page's own chrome (hero, vision/mission/
   objective, gallery labels, footer). Per-monument name/subtitle/description/
   cta copy lives in ../monuments.config.json instead (config-driven, not
   hardcoded here) — see js/gallery.js.

   STORAGE_KEY is DELIBERATELY IDENTICAL to STEINERNE_BRUECKE/js/i18n.js's own
   "zeitsprung_v2_lang" localStorage key. localStorage (unlike sessionStorage)
   already persists across a full page navigation, so simply reusing the same
   key is sufficient for language continuity between this index and the
   Steinerne Brücke bridge in both directions — no second, competing
   persistence mechanism is introduced for language. (Sound-mute preference
   uses a separate sessionStorage key — see js/index-main.js.) */

export const DICT = {
  de: {
    metaTitle: "ZEITSPRUNG — Regensburg",
    coreIdea: "Geschichte sehen, nicht nur lesen.",
    navBrand: "ZEITSPRUNG",
    navExplore: "MONUMENTE",
    navAbout: "ÜBER ZEITSPRUNG",
    heroEyebrow: "ZEITSPRUNG · REGENSBURG",
    heroTitle: "ZEITSPRUNG",
    heroTagline: "Geschichte sehen, nicht nur lesen.",
    heroScrollHint: "SCROLLEN, UM ZU BEGINNEN",
    soundOn: "TON AN",
    soundOff: "TON AUS",

    visionEyebrow: "VISION",
    visionTitle: "Regensburgs Erbe sichtbar machen",
    visionText: "ZEITSPRUNG macht das kulturelle Erbe Regensburgs sichtbar, erlebbar, verständlich und historisch verantwortungsvoll — direkt im Browser, ohne App.",

    missionEyebrow: "MISSION",
    missionTitle: "Tourismus, Kultur und Bildung verbinden",
    missionText: "Verborgene historische Schichten sichtbar machen, statische Informationen in Erlebnisse verwandeln — für Reisende, Einwohner, Schulen und Forschende.",

    objectiveEyebrow: "AUFGABE",
    objectiveTitle: "Geschichte zeigen statt nur beschreiben",
    objectiveText: "Wo Texttafeln nicht zeigen können, wie sich ein Bauwerk durch die Zeit verändert hat, macht ZEITSPRUNG diese verborgene Tiefe interaktiv erfahrbar.",

    galleryEyebrow: "DIE MONUMENTE",
    galleryTitle: "INTERAKTIVE ROUTE",
    gallerySubtitle: "Fünf Orte, eine Zeitreise",
    galleryText: "Wähle ein Monument, um seine Geschichte zu entdecken.",
    galleryCounterLabel: "MONUMENT",
    galleryStatusActive: "VERFÜGBAR",

    footerText: "Weitere Monumente von ZEITSPRUNG folgen in Kürze.",
    footerCity: "REGENSBURG"
  },
  en: {
    metaTitle: "ZEITSPRUNG — Regensburg",
    coreIdea: "See history, not only read it.",
    navBrand: "ZEITSPRUNG",
    navExplore: "MONUMENTS",
    navAbout: "ABOUT ZEITSPRUNG",
    heroEyebrow: "ZEITSPRUNG · REGENSBURG",
    heroTitle: "ZEITSPRUNG",
    heroTagline: "See history, not only read it.",
    heroScrollHint: "SCROLL TO BEGIN",
    soundOn: "SOUND ON",
    soundOff: "SOUND OFF",

    visionEyebrow: "VISION",
    visionTitle: "Making Regensburg's heritage visible",
    visionText: "ZEITSPRUNG makes Regensburg's cultural heritage visible, experiential, understandable and historically responsible — directly in the browser, no app required.",

    missionEyebrow: "MISSION",
    missionTitle: "Connecting tourism, culture and education",
    missionText: "Making hidden historical layers visible, turning static information into visual experience — for travelers, residents, schools and researchers.",

    objectiveEyebrow: "OBJECTIVE",
    objectiveTitle: "Showing history, not only describing it",
    objectiveText: "Where text panels cannot show how a monument changed through time, ZEITSPRUNG makes that hidden depth interactive and explorable.",

    galleryEyebrow: "THE MONUMENTS",
    galleryTitle: "INTERACTIVE ROUTE",
    gallerySubtitle: "Five places, one journey through time",
    galleryText: "Choose a monument to discover its history.",
    galleryCounterLabel: "MONUMENT",
    galleryStatusActive: "AVAILABLE",

    footerText: "More ZEITSPRUNG monuments are coming soon.",
    footerCity: "REGENSBURG"
  },
  es: {
    metaTitle: "ZEITSPRUNG — Regensburg",
    coreIdea: "Ver la historia, no solo leerla.",
    navBrand: "ZEITSPRUNG",
    navExplore: "MONUMENTOS",
    navAbout: "SOBRE ZEITSPRUNG",
    heroEyebrow: "ZEITSPRUNG · REGENSBURG",
    heroTitle: "ZEITSPRUNG",
    heroTagline: "Ver la historia, no solo leerla.",
    heroScrollHint: "DESPLÁZATE PARA COMENZAR",
    soundOn: "SONIDO ACTIVADO",
    soundOff: "SONIDO DESACTIVADO",

    visionEyebrow: "VISIÓN",
    visionTitle: "Hacer visible el patrimonio de Regensburg",
    visionText: "ZEITSPRUNG hace que el patrimonio cultural de Regensburg sea visible, vivencial, comprensible e históricamente responsable — directamente en el navegador, sin necesidad de una app.",

    missionEyebrow: "MISIÓN",
    missionTitle: "Conectar turismo, cultura y educación",
    missionText: "Hacer visibles las capas históricas ocultas y convertir la información estática en experiencia visual — para viajeros, residentes, escuelas e investigadores.",

    objectiveEyebrow: "OBJETIVO",
    objectiveTitle: "Mostrar la historia, no solo describirla",
    objectiveText: "Donde los paneles de texto no pueden mostrar cómo cambió un monumento a través del tiempo, ZEITSPRUNG hace esa profundidad oculta interactiva y explorable.",

    galleryEyebrow: "LOS MONUMENTOS",
    galleryTitle: "RUTA INTERACTIVA",
    gallerySubtitle: "Cinco lugares, un viaje en el tiempo",
    galleryText: "Elige un monumento para descubrir su historia.",
    galleryCounterLabel: "MONUMENTO",
    galleryStatusActive: "DISPONIBLE",

    footerText: "Pronto llegarán más monumentos de ZEITSPRUNG.",
    footerCity: "REGENSBURG"
  }
};

const STORAGE_KEY = "zeitsprung_v2_lang";

export function getInitialLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && DICT[stored]) return stored;
  } catch (e) {}
  const nav = (navigator.language || "de").slice(0, 2).toLowerCase();
  if (DICT[nav]) return nav;
  return "de";
}

export function setLang(lang) {
  try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
}

export function t(lang, key) {
  return (DICT[lang] && DICT[lang][key] !== undefined) ? DICT[lang][key] : DICT.de[key];
}

export function applyI18n(lang) {
  document.documentElement.lang = lang;
  document.title = t(lang, "metaTitle");
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const val = t(lang, key);
    if (typeof val === "string") el.textContent = val;
  });
}
