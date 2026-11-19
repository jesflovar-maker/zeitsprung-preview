/* ZEITSPRUNG — PORTA_PRAETORIA/js/pp-index-chapters.js (06G.1)
   INDEX chronology chapters for the Porta timeline film (pp_timeline_540.mp4, 191 s, PP_ASSET_059).
   Source: 02_CONTENT/Porta_Praetoria/PORTA_TIMELINE_CONTENT_AUDIT_V1.json. ONLY chapters with status SUPPORTED /
   DOCUMENTED_HIGH and no required correction become buttons: #1 (0 s), #5 (+ "ca." per audit), #13, #14, #19.
   Everything else (UNVERIFIED / UNCERTAIN / CONTRADICTED / PLAUSIBLE-only scenes, the model card and the end card)
   is a gap entry (y:null) → no button and no label while it plays. Boundaries refined 06G.1 by reading the burned-in
   captions (audit times were ±4 s). Wording = the film's own DE caption (shortened); EN/ES = translation of that caption. */
export const TIMES = [0, 7.25, 29.25, 36.0, 103.25, 108.25, 115.5, 180.5, 187.75];
const G = { y: null, h: null };
export const STR = {
  de: { tlv: [
    { y: "Vor fast 1.850 Jahren", h: "Hier stand eine römische Festung" }, G,
    { y: "Graben & Fundament", h: "V-Graben, ca. 6–7 m breit und 2,5–3 m tief" }, G,
    { y: "Porta Praetoria", h: "Das Nordtor zur Donau" },
    { y: "Torbau", h: "Fundamente der beiden Tortürme" }, G,
    { y: "Heute", h: "Erhalten: Turm und Bogen des Nordtors" }, G] },
  en: { tlv: [
    { y: "Almost 1,850 years ago", h: "A Roman fortress stood here" }, G,
    { y: "Ditch & foundation", h: "V-shaped ditch, approx. 6–7 m wide and 2.5–3 m deep" }, G,
    { y: "Porta Praetoria", h: "The north gate facing the Danube" },
    { y: "Gate construction", h: "Foundations of the two gate towers" }, G,
    { y: "Today", h: "Surviving: tower and arch of the north gate" }, G] },
  es: { tlv: [
    { y: "Hace casi 1.850 años", h: "Aquí se alzaba una fortaleza romana" }, G,
    { y: "Foso y cimientos", h: "Foso en V, de unos 6–7 m de ancho y 2,5–3 m de profundidad" }, G,
    { y: "Porta Praetoria", h: "La puerta norte hacia el Danubio" },
    { y: "Construcción de la puerta", h: "Cimientos de las dos torres de la puerta" }, G,
    { y: "Hoy", h: "Se conservan: torre y arco de la puerta norte" }, G] },
};
