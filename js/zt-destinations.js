/* ZEITSPRUNG V2 — js/zt-destinations.js (07B.1)
   ONE shared destination block for monument endings: direct links to every OTHER active monument, read from
   monuments.config.json (enabled + route; the current monument is never listed). No hand-maintained lists:
   activating a future monument in the config makes it appear everywhere automatically.
   Usage: mountDestinations(hostEl, { self: "dom-st-peter", btnClass: "dbtn" })  — styling comes from the page's own
   button class; the module only adds a tiny neutral layout (own .zt-dest namespace). Language follows <html lang>. */
const L10N = { de: "DIREKT WEITER ZU", en: "CONTINUE DIRECTLY TO", es: "CONTINUAR DIRECTAMENTE A" };
// fixed display labels (proper names, identical in all languages; uppercase in the UI)
const LABEL = { "steinerne-bruecke": "STEINERNE BRÜCKE", "dom-st-peter": "DOM ST. PETER", "porta-praetoria": "PORTA PRAETORIA", "altes-rathaus": "ALTES RATHAUS", "neupfarrplatz": "NEUPFARRPLATZ" };
const CONFIG = new URL("../monuments.config.json", import.meta.url).href;
const ROOT = new URL("../", import.meta.url).href;
let styled = false;
const css = () => {
  if (styled) return; styled = true;
  const s = document.createElement("style");
  s.textContent = ".zt-dest{margin:22px auto 0;max-width:560px;width:100%}.zt-dest__label{margin:0 0 10px;font:500 10px/1 'IBM Plex Mono',ui-monospace,monospace;letter-spacing:.26em;opacity:.6;text-align:center}.zt-dest__list{display:grid;gap:10px}.zt-dest__list a{display:flex;align-items:center;justify-content:center;gap:10px;min-height:48px;text-align:center}.zt-dest__list a::after{content:'→';opacity:.8}@media (min-width:720px){.zt-dest__list{grid-template-columns:1fr 1fr}}";
  document.head.appendChild(s);
};
const lang = () => { const l = (document.documentElement.lang || "de").slice(0, 2); return L10N[l] ? l : "de"; };
export function mountDestinations(host, opt = {}) {
  if (!host) return null;
  css();
  const box = document.createElement("nav"); box.className = "zt-dest";
  const lb = document.createElement("p"); lb.className = "zt-dest__label";
  const list = document.createElement("div"); list.className = "zt-dest__list";
  box.append(lb, list); host.appendChild(box);
  const relabel = () => { lb.textContent = L10N[lang()]; box.setAttribute("aria-label", L10N[lang()]); };
  relabel(); new MutationObserver(relabel).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  fetch(CONFIG, { cache: "no-cache" }).then((r) => (r.ok ? r.json() : null)).then((cfg) => {
    const ms = cfg && Array.isArray(cfg.monuments) ? cfg.monuments : [];
    const live = ms.filter((m) => m && m.enabled === true && m.route && m.id !== opt.self)
      .sort((a, b) => (a.menu_order || a.order || 99) - (b.menu_order || b.order || 99));
    list.replaceChildren(...live.map((m) => {
      const a = document.createElement("a"); a.className = opt.btnClass || ""; a.href = ROOT + String(m.route).replace(/^\/+/, ""); a.dataset.mid = m.id;
      a.textContent = LABEL[m.id] || String(m.id).toUpperCase(); return a;
    }));
    box.hidden = !live.length;
  }).catch(() => { box.hidden = true; });
  return box;
}
