/* ZEITSPRUNG V2 — js/zt-sources.js (07D) — QUELLEN / SOURCES / FUENTES: one shared, discreet museum section per monument.
   Order on every page: last content -> trailer (where available) -> THIS -> destination ending. One bibliography per page:
   every "Quellen" button on a monument scrolls here. Data: js/zt-sources-data.js. Styling: css/zt-sources.css.
   Usage: mountSources({ monument, before: endingElement })  (creates <section id="quellen">) */
import { sourcesFor, OPEN } from "./zt-sources-data.js?v=20261125d";
const UI = {
  de: { eyebrow: "QUELLEN", h: "Woher wir das wissen", p: "Gelesene Quellen zu diesem Monument. Titel bleiben im Original.", open: "Offene Punkte", link: "Quelle öffnen", ext: "öffnet in neuem Tab", HISTORICAL: "Geschichte", ARCHAEOLOGICAL: "Archäologie", ARCHITECTURAL: "Architektur", VISUAL_REFERENCE: "Bildquelle" },
  en: { eyebrow: "SOURCES", h: "How we know this", p: "Sources we have read for this monument. Titles stay in the original language.", open: "Open points", link: "Open source", ext: "opens in a new tab", HISTORICAL: "History", ARCHAEOLOGICAL: "Archaeology", ARCHITECTURAL: "Architecture", VISUAL_REFERENCE: "Visual source" },
  es: { eyebrow: "FUENTES", h: "Cómo lo sabemos", p: "Fuentes leídas sobre este monumento. Los títulos se mantienen en el idioma original.", open: "Puntos abiertos", link: "Abrir fuente", ext: "se abre en una pestaña nueva", HISTORICAL: "Historia", ARCHAEOLOGICAL: "Arqueología", ARCHITECTURAL: "Arquitectura", VISUAL_REFERENCE: "Fuente visual" },
};
const ORDER = ["HISTORICAL", "ARCHITECTURAL", "ARCHAEOLOGICAL", "VISUAL_REFERENCE"];
const lang = () => { const l = (document.documentElement.lang || "de").slice(0, 2); return UI[l] ? l : "de"; };
const mk = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };

export function mountSources({ monument, before }) {
  if (!before || document.getElementById("quellen")) return null;
  const s = mk("section", "zt-src"); s.id = "quellen"; s.setAttribute("aria-labelledby", "quellenTitle"); s.tabIndex = -1;
  before.before(s);
  const list = sourcesFor(monument).slice().sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind));
  const draw = () => {
    const l = lang(), u = UI[l]; const keep = s.querySelector("details") && s.querySelector("details").open;
    const w = mk("div", "zt-src__in"); const h = mk("h2", "zt-src__h", u.h); h.id = "quellenTitle";
    w.append(mk("p", "zt-src__eyebrow", u.eyebrow), h, mk("p", "zt-src__lead", u.p));
    const ol = mk("ol", "zt-src__list");
    list.forEach((x) => {
      const li = mk("li", "zt-src__item"); li.id = "src-" + x.id;
      li.append(mk("p", "zt-src__kind", u[x.kind]));
      const t = mk("p", "zt-src__t", x.title); if (x.id !== "UNESCO1155" && !/English edition|^Old town hall|^document Imp|^Neupfarrplatz$/.test(x.title)) t.lang = "de"; li.append(t);
      li.append(mk("p", "zt-src__by", [x.by, x.y, x.ref && x.ref[monument], x.doc].filter(Boolean).join(" · ")), mk("p", "zt-src__n", x.n[l]));
      if (x.url) { const a = mk("a", "zt-src__a", u.link + " ↗"); a.href = x.url; a.target = "_blank"; a.rel = "noopener noreferrer"; a.setAttribute("aria-label", u.link + ": " + x.title + " (" + u.ext + ")"); li.append(a); }
      ol.append(li);
    });
    w.append(ol);
    const op = OPEN[monument] && OPEN[monument][l];
    if (op && op.length) { const d = mk("details", "zt-src__open"); d.open = !!keep; d.append(mk("summary", "", u.open)); const ul = mk("ul"); op.forEach((x) => ul.append(mk("li", "", x))); d.append(ul); w.append(d); }
    s.replaceChildren(w);
  };
  draw(); new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  return s;
}
/** every in-page "Quellen" button uses this (one bibliography per page) */
export function goToSources(id) {
  const t = (id && document.getElementById("src-" + id)) || document.getElementById("quellen"); if (!t) return;
  const red = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.__ztScrollTo) window.__ztScrollTo(t); else t.scrollIntoView({ behavior: red ? "auto" : "smooth", block: "start" });
  const s = document.getElementById("quellen"); if (s) s.focus({ preventScroll: true });
}
