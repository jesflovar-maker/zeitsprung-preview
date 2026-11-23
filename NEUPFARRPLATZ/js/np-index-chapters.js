/* ZEITSPRUNG — NEUPFARRPLATZ/js/np-index-chapters.js (07B)
   INDEX chronology chapters for the Neupfarrplatz timeline (np_timeline_540.mp4, NP_ASSET_095, silent).
   HISTORICAL_BRIEFING = PENDING: chips are K numbers + visual-state labels from np-i18n.js — never dates.
   Times = K onsets re-measured on the runtime master (07B). Same TIMES are used on the monument page. */
import { STR as NP } from "./np-i18n.js?v=20261123c";
export const TIMES = [0, 11.0, 26.25, 36.5, 46.125, 59.875, 72.25, 87.375, 100.25, 105.875];
const map = (l) => NP[l].kf.items.map((k) => ({ y: k.n + " · " + k.state, h: k.title }));
export const STR = { de: { tlv: map("de") }, en: { tlv: map("en") }, es: { tlv: map("es") } };
