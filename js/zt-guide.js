/* ZEITSPRUNG V2 — js/zt-guide.js (07B.1)
   GLOBAL BRÜCKMANDL GUIDE — ONE engine for all five monuments (BRUCKMANDL_ASSISTANT_PATTERN_V1):
     small floating icon -> compact panel -> monument topics -> short validated answer -> link to the chapter.
   No search bar, no chat field, no free text. Data + section mapping come from ZEITSPRUNG_GLOBAL_GUIDE_V1
   (js/zt-guide-config.js). Steinerne ("bridge" engine) delegates to the canonical bridge provider UI.
   Visual identity = css/zt-assistant.css (same Brückmandl, same panel everywhere).
   Section awareness: when the panel opens, the configured section occupying most of the viewport is measured once
   (no scroll listener, no continuous scanning) and its topic is offered first.
   Never touches media or sound. Language follows <html lang> (zeitsprung_v2_lang), relabels instantly.
   Usage: initGuide({ monument: "dom-st-peter" }) */
import { ZEITSPRUNG_GLOBAL_GUIDE_V1 } from "./zt-guide-config.js?v=20261125a";

const AVATAR = new URL("../assets/steinerne-bruecke/bruckmandl/ai/", import.meta.url).href;
const UI = {
  de: { open: "Brückmandl fragen", close: "Schließen" },
  en: { open: "Ask the Brückmandl", close: "Close" },
  es: { open: "Preguntar al Brückmandl", close: "Cerrar" },
};
// elements the floating icon must never cover on phones (endings, destination lists, timeline control rows)
const AVOID = "#ende, .nend, .dend__cta, .aend__cta, .pend__cta, .zt-dest, .ntl__panel, .dtlv__ctl, .dtlv__side, .ztf__panel, .sb-end__in, .hm__ctl";
const langNow = () => { const l = (document.documentElement.lang || "de").slice(0, 2).toLowerCase(); return UI[l] ? l : "de"; };

export async function initGuide({ monument } = {}) {
  const cfg = ZEITSPRUNG_GLOBAL_GUIDE_V1.monuments[monument];
  if (!cfg || document.getElementById("ztAssistantFab")) return null;
  if (cfg.engine === "bridge") {
    const { initAssistantFab } = await import("./zt-assistant-fab.js?v=20261124a");
    return initAssistantFab({ link: cfg.link, moreLink: cfg.moreLink, sections: cfg.sections, avoid: AVOID });
  }
  const mod = await import(new URL(cfg.data, import.meta.url).href);
  const STR = mod.STR;
  const G = () => STR[langNow()] || STR.de;
  const mk = (tag, cls, attrs) => { const e = document.createElement(tag); if (cls) e.className = cls; if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  const fab = mk("button", "zt-assist__fab", { type: "button", id: "ztAssistantFab", "aria-haspopup": "dialog", "aria-expanded": "false", "aria-controls": "ztAssistantPanel" });
  const fabImg = mk("img", "", { alt: "", width: "56", height: "56", draggable: "false", decoding: "async" }); fabImg.src = AVATAR + "bruckmandl_ai_idle.webp"; fab.appendChild(fabImg);
  const pn = mk("aside", "zt-assist", { id: "ztAssistantPanel", role: "dialog" }); pn.hidden = true;
  const head = mk("div", "zt-assist__head"); const av = mk("img", "zt-assist__av", { alt: "", width: "56", height: "56", loading: "lazy" });
  const who = mk("div"); const name = mk("div", "zt-assist__name"); name.textContent = "BRÜCKMANDL"; const role = mk("div", "zt-assist__role"); who.append(name, role);
  const cls = mk("button", "zt-assist__close", { type: "button" }); cls.textContent = "×";
  head.append(av, who, cls);
  const hi = mk("p", "zt-assist__hi"); const ctx = mk("p", "zt-assist__group"); ctx.hidden = true;
  const topics = mk("div", "zt-assist__group-list", { role: "group" }); const ans = mk("div", "zt-assist__ans", { "aria-live": "polite" });
  pn.append(head, hi, ctx, topics, ans);
  document.body.append(fab, pn);

  let sel = -1, curSec = "";
  const render = () => {
    [...topics.children].forEach((b, k) => b.setAttribute("aria-pressed", String(k === sel)));
    ans.replaceChildren(); if (sel < 0) return;
    const t = (G().guideTopics || [])[sel]; if (!t) return;
    av.src = AVATAR + "bruckmandl_ai_expression_03_explain.webp";
    const p = mk("p"); p.textContent = t[1]; ans.appendChild(p);
    const go = cfg.go && cfg.go[sel];
    if (go && document.getElementById(go)) { const a = mk("a", "zt-assist__go", { href: "#" + go }); a.dataset.scroll = go; a.textContent = G().guide.go; ans.appendChild(a); }
  };
  const relabel = () => {
    const g = G().guide, u = UI[langNow()];
    fab.setAttribute("aria-label", u.open); fab.title = u.open; pn.setAttribute("aria-label", g.aria || "Brückmandl"); role.textContent = g.role; hi.textContent = g.hi; ctx.textContent = g.ctx; cls.setAttribute("aria-label", u.close); topics.setAttribute("aria-label", g.role);
    const list = G().guideTopics || [];
    if (topics.children.length !== list.length) { topics.replaceChildren(...list.map((_, i) => { const b = mk("button", "zt-assist__topic", { type: "button", "aria-pressed": "false" }); b.dataset.i = String(i); return b; })); }
    [...topics.children].forEach((b, i) => { b.textContent = list[i][0]; });
    render();
  };
  topics.addEventListener("click", (e) => { const b = e.target.closest(".zt-assist__topic"); if (!b) return; sel = +b.dataset.i; ctx.hidden = true; render(); });
  // section awareness: measured ONCE when the panel opens (no scroll listener, no continuous scanning) —
  // the configured section occupying most of the viewport decides which topic is offered first
  const secs = Object.keys(cfg.sections || {}).map((id) => document.getElementById(id)).filter(Boolean);
  const sectionNow = () => { let best = "", bh = 0; secs.forEach((el) => { const r = el.getBoundingClientRect(); const h = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0); if (h > bh) { bh = h; best = el.id; } }); return best; };
  // never cover CTAs / timeline controls on phones: while one of them is on screen the icon tucks away (one observer)
  if ("IntersectionObserver" in window) {
    const on = new Set();
    const io2 = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) on.add(e.target); else on.delete(e.target); }); fab.classList.toggle("is-tucked", on.size > 0 && pn.hidden); }, { threshold: 0.01 });
    const watch = () => document.querySelectorAll(AVOID).forEach((n) => { if (!n.__ztAv) { n.__ztAv = 1; io2.observe(n); } });
    watch(); setTimeout(watch, 2500); setTimeout(watch, 6000); // late-built panels (films, destinations)
  }
  const onKey = (e) => { if (e.key === "Escape") close(); };
  function open() {
    av.src = AVATAR + "bruckmandl_ai_talk.webp";
    curSec = sectionNow(); const c = cfg.sections && cfg.sections[curSec];
    if (c != null) { sel = c; ctx.hidden = false; } render();
    pn.hidden = false; fab.setAttribute("aria-expanded", "true"); document.addEventListener("keydown", onKey);
    requestAnimationFrame(() => pn.classList.add("is-open")); cls.focus();
  }
  function close(refocus = true) { if (pn.hidden) return; pn.classList.remove("is-open"); pn.hidden = true; fab.setAttribute("aria-expanded", "false"); document.removeEventListener("keydown", onKey); if (refocus) fab.focus(); }
  fab.addEventListener("click", () => (pn.hidden ? open() : close()));
  cls.addEventListener("click", () => close());
  ans.addEventListener("click", (e) => {
    const a = e.target.closest(".zt-assist__go"); if (!a) return; e.preventDefault();
    const t = document.getElementById(a.dataset.scroll); close(false);
    if (t) t.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  });
  new MutationObserver(relabel).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  relabel();
  return { open, close };
}
