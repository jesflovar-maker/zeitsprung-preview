/* ZEITSPRUNG V2 — js/zt-assistant-fab.js
   ============================================================================
   BRUCKMANDL_ASSISTANT_PATTERN_V1 (2026-11-11) — the platform standard:

     small floating icon  ->  compact context panel  ->  topic-based answer
                          ->  deep link / scroll to the chapter

   NOT a search bar, NOT a chat textbox, NOT a full-width assistant strip.
   See 01_ARCHITECTURE/ZEITSPRUNG_ASSISTANT_AND_LANGUAGE_STANDARD.md.

   This shared module is used by the INDEX and by STEINERNE_BRUECKE. It is a
   pure consumer of the canonical, already-approved knowledge
   (js/bruckmandl-knowledge-provider.js -> js/bruckmandl-guide-core.js): it
   never writes, matches free text or generates anything. Dom St. Peter has
   its own monument content and implements the same pattern locally
   (DOM_ST_PETER/js/dom-main.js buildGuide()).

   LIFECYCLE — built once. Listeners: 1 click on the icon, 1 click per topic
   button, 1 click on close; `keydown` (Escape) exists ONLY while the panel is
   open. One MutationObserver on <html lang> re-labels on language change.
   No scroll / resize listeners, no timers, no IntersectionObserver.
   ============================================================================ */
import { LocalValidatedProvider } from "./bruckmandl-knowledge-provider.js";
import { BRUCKMANDL_STATUS_LABELS, getBruckmandlEntry } from "./bruckmandl-guide-core.js";

// The 6 bridge-level topics that already exist in the canonical knowledge (previously reachable only by typing).
const MORE_TOPICS = ["bridge_overview", "arches", "piers", "bridge_materials", "timeline", "construction"];

const AVATAR = new URL("../assets/steinerne-bruecke/bruckmandl/ai/", import.meta.url).href;
const UI = {
  de: { open: "Brückmandl öffnen", aria: "Brückmandl — Ihr ZEITSPRUNG-Begleiter", role: "Ihr ZEITSPRUNG-Begleiter", hi: "Grüß Gott! Ich bin das Bruckmandl von der Steinernen Brücke. Wählen Sie eine Frage.", close: "Schließen", main: "HAUPTFRAGEN", more: "MEHR ENTDECKEN" },
  en: { open: "Open Brückmandl guide", aria: "Bruckmandl — your ZEITSPRUNG guide", role: "Your ZEITSPRUNG guide", hi: "Grüß Gott! I am the Bruckmandl from the Stone Bridge. Choose a question.", close: "Close", main: "MAIN QUESTIONS", more: "DISCOVER MORE" },
  es: { open: "Abrir guía Brückmandl", aria: "Bruckmandl — su guía ZEITSPRUNG", role: "Su guía ZEITSPRUNG", hi: "¡Grüß Gott! Soy el Bruckmandl del Puente de Piedra. Elija una pregunta.", close: "Cerrar", main: "PREGUNTAS PRINCIPALES", more: "DESCUBRIR MÁS" }
};
const langNow = () => { const l = (document.documentElement.lang || "de").slice(0, 2).toLowerCase(); return UI[l] ? l : "de"; };

/**
 * @param {{ link: object, moreLink?: object }} opt  each: { href?: string, scrollTo?: string, label: {de,en,es} }
 *   moreLink is used for the 6 bridge-level topics (falls back to link)
 *   link.href      -> normal navigation (e.g. from the index into a monument chapter)
 *   link.scrollTo  -> id of a section on the same page
 */
export function initAssistantFab(opt = {}) {
  if (document.getElementById("ztAssistantFab")) return null;
  const mk = (tag, cls, attrs) => { const e = document.createElement(tag); if (cls) e.className = cls; if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  const fab = mk("button", "zt-assist__fab", { type: "button", id: "ztAssistantFab", "aria-haspopup": "dialog", "aria-expanded": "false", "aria-controls": "ztAssistantPanel" });
  const fabImg = mk("img", "", { alt: "", width: "56", height: "56", draggable: "false" }); fabImg.src = AVATAR + "bruckmandl_ai_idle.webp"; fab.appendChild(fabImg);
  const pn = mk("aside", "zt-assist", { id: "ztAssistantPanel", role: "dialog" }); pn.hidden = true;
  const head = mk("div", "zt-assist__head"); const av = mk("img", "zt-assist__av", { alt: "", width: "56", height: "56", loading: "lazy" }); av.src = AVATAR + "bruckmandl_ai_talk.webp";
  const who = mk("div"); const name = mk("div", "zt-assist__name"); name.textContent = "BRÜCKMANDL"; const role = mk("div", "zt-assist__role"); who.appendChild(name); who.appendChild(role);
  const cls = mk("button", "zt-assist__close", { type: "button" }); cls.textContent = "×";
  head.appendChild(av); head.appendChild(who); head.appendChild(cls);
  const hi = mk("p", "zt-assist__hi"); const topics = mk("div", "zt-assist__topics"); const ans = mk("div", "zt-assist__ans", { "aria-live": "polite" });
  pn.appendChild(head); pn.appendChild(hi); pn.appendChild(topics); pn.appendChild(ans);
  document.body.appendChild(fab); document.body.appendChild(pn);

  let sel = null; // selected topic id
  const renderAnswer = () => {
    const l = langNow(); ans.replaceChildren();
    topics.querySelectorAll(".zt-assist__topic").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.topic === sel)));
    if (!sel) return;
    const r = LocalValidatedProvider.answerTopic(sel, l);
    // Public UI shows NO validation-status chips (documented / unverified stay internal metadata).
    // Only an existing legend classification is carried as editorial context.
    if ((r.statusCodes || []).includes("legend")) { const lg = mk("p", "zt-assist__legend"); lg.textContent = (BRUCKMANDL_STATUS_LABELS[l] || BRUCKMANDL_STATUS_LABELS.en).legend; ans.appendChild(lg); }
    const p = mk("p"); p.textContent = r.text; ans.appendChild(p);
    const lk = MORE_TOPICS.includes(sel) && opt.moreLink ? opt.moreLink : opt.link;
    if (lk) { const a = mk("a", "zt-assist__go", { href: lk.href || "#" + lk.scrollTo }); a.dataset.scroll = lk.scrollTo || ""; a.textContent = lk.label[l] || lk.label.de; ans.appendChild(a); }
    av.src = AVATAR + "bruckmandl_ai_expression_03_explain.webp";
  };
  const relabel = () => {
    const l = langNow(), u = UI[l];
    fab.setAttribute("aria-label", u.open); fab.title = u.open; pn.setAttribute("aria-label", u.aria); role.textContent = u.role; hi.textContent = u.hi; cls.setAttribute("aria-label", u.close);
    topics.replaceChildren();
    const group = (title, list) => { const h = mk("p", "zt-assist__group"); h.textContent = title; const g = mk("div", "zt-assist__group-list", { role: "group", "aria-label": title }); list.forEach((q) => { const b = mk("button", "zt-assist__topic", { type: "button", "aria-pressed": "false" }); b.dataset.topic = q.topic; b.textContent = q.question; g.appendChild(b); }); topics.appendChild(h); topics.appendChild(g); };
    group(u.main, LocalValidatedProvider.getSuggestedTopics(l));
    group(u.more, MORE_TOPICS.map((id) => getBruckmandlEntry(id, l)).filter(Boolean).map((e) => ({ topic: e.topic, question: e.question })));
    renderAnswer();
  };
  // one delegated listener for all topic buttons (re-labelling never adds listeners)
  topics.addEventListener("click", (e) => { const b = e.target.closest(".zt-assist__topic"); if (!b) return; sel = b.dataset.topic; renderAnswer(); pn.scrollTo({ top: pn.scrollHeight, behavior: "auto" }); });
  const onKey = (e) => { if (e.key === "Escape") close(); };
  function open() { pn.hidden = false; fab.setAttribute("aria-expanded", "true"); document.addEventListener("keydown", onKey); requestAnimationFrame(() => pn.classList.add("is-open")); cls.focus(); }
  function close(refocus = true) { if (pn.hidden) return; pn.classList.remove("is-open"); pn.hidden = true; fab.setAttribute("aria-expanded", "false"); document.removeEventListener("keydown", onKey); if (refocus) fab.focus(); }
  fab.addEventListener("click", () => (pn.hidden ? open() : close()));
  cls.addEventListener("click", () => close());
  ans.addEventListener("click", (e) => {
    const a = e.target.closest(".zt-assist__go"); if (!a) return;
    if (a.dataset.scroll) { e.preventDefault(); const t = document.getElementById(a.dataset.scroll); close(false); if (t) t.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); }
  });
  new MutationObserver(relabel).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  relabel();
  return { open, close };
}
