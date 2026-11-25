/* ZEITSPRUNG V2 — js/zt-guide-ask.js (07D) — free-text questions inside the existing Brückmandl panel (both engines use it).
   Owner revision of BRUCKMANDL_ASSISTANT_PATTERN_V1: the compact panel now also has one question line. Still no chat service:
   answers are verbatim approved passages from js/zt-guide-index.js, with chapter link and registered source. */
import { createIndex, otherMonument } from "./zt-guide-index.js?v=20261125d";
import { sourceById } from "./zt-sources-data.js?v=20261125d";
const UI = {
  de: { label: "Frage an das Brückmandl", ph: "Ihre Frage …", send: "Fragen", you: "Ihre Frage", src: "Quelle", more: "Passt dazu", go: "Zum Kapitel →", none: "Dazu habe ich auf dieser Seite keine geprüfte Information. Ich erfinde nichts. Vielleicht hilft eines dieser Themen:", year: (y) => "Zum Jahr " + y + " habe ich keine geprüfte Angabe. Am nächsten kommt:", open: "Zu diesem Punkt ist die Prüfung noch nicht abgeschlossen.", other: (n) => "Das gehört zu einem anderen Monument: " + n + ". Hier beantworte ich nur Fragen zu diesem Ort.", goto: (n) => n + " öffnen →", empty: "Bitte schreiben Sie eine kurze Frage.", sources: "Alle Quellen" },
  en: { label: "Question for the Brückmandl", ph: "Your question …", send: "Ask", you: "Your question", src: "Source", more: "Related", go: "Go to chapter →", none: "I have no verified information about that on this page. I do not make things up. One of these topics may help:", year: (y) => "I have no verified statement about the year " + y + ". The closest is:", open: "The review of this point is not finished.", other: (n) => "That belongs to another monument: " + n + ". Here I only answer questions about this place.", goto: (n) => "Open " + n + " →", empty: "Please write a short question.", sources: "All sources" },
  es: { label: "Pregunta para el Brückmandl", ph: "Su pregunta …", send: "Preguntar", you: "Su pregunta", src: "Fuente", more: "Relacionado", go: "Ir al capítulo →", none: "No tengo información verificada sobre eso en esta página. No invento nada. Quizá le ayude uno de estos temas:", year: (y) => "No tengo ningún dato verificado sobre el año " + y + ". Lo más cercano es:", open: "La revisión de este punto aún no ha terminado.", other: (n) => "Eso pertenece a otro monumento: " + n + ". Aquí solo respondo preguntas sobre este lugar.", goto: (n) => "Abrir " + n + " →", empty: "Escriba una pregunta breve.", sources: "Todas las fuentes" },
};
const NAME = { "steinerne-bruecke": ["Steinerne Brücke", "STEINERNE_BRUECKE"], "dom-st-peter": ["Dom St. Peter", "DOM_ST_PETER"], "porta-praetoria": ["Porta Praetoria", "PORTA_PRAETORIA"], "altes-rathaus": ["Altes Rathaus", "ALTES_RATHAUS_REICHSSAAL"], neupfarrplatz: ["Neupfarrplatz", "NEUPFARRPLATZ"] };
const ROOT = new URL("../", import.meta.url).href;
const lang = () => { const l = (document.documentElement.lang || "de").slice(0, 2); return UI[l] ? l : "de"; };
const mk = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
let n = 0;

/** o: { monument, panel, before (node the form is placed before), answer (answer box), units(lang), section(), pose?(name), onAsk?(), close() } */
export function mountAsk(o) {
  const id = "ztAsk" + (++n);
  const form = mk("form", "zt-ask"); form.noValidate = true; form.setAttribute("role", "search");
  const lb = mk("label", "zt-ask__label"); lb.htmlFor = id; const row = mk("div", "zt-ask__row");
  const inp = mk("input", "zt-ask__in"); inp.id = id; inp.type = "text"; inp.maxLength = 160; inp.autocomplete = "off"; inp.setAttribute("enterkeyhint", "send"); inp.spellcheck = false;
  const btn = mk("button", "zt-ask__send"); btn.type = "submit"; row.append(inp, btn); form.append(lb, row); o.before.before(form);
  let idx = {}, prev = null, last = null;
  const index = async (l) => idx[l] || (idx[l] = createIndex(await o.units(l)));
  const unitsById = async (l) => { const us = await o.units(l); return new Map(us.map((u) => [u.id, u])); };
  const chips = (box, list) => { if (!list.length) return; const u = UI[lang()]; box.append(mk("p", "zt-assist__group", u.more.toUpperCase())); const g = mk("div", "zt-assist__group-list"); list.forEach((x) => { const b = mk("button", "zt-assist__topic", x.t.replace(/^K\d\d · /, "")); b.type = "button"; b.dataset.ask = x.id; g.append(b); }); box.append(g); };
  const show = (unit, r, pre) => { // one approved passage, verbatim
    const u = UI[lang()], box = mk("div", "zt-ask__res");
    if (last && last.q) { const q = mk("p", "zt-ask__q"); q.append(mk("span", "", u.you + ": "), document.createTextNode(last.q)); box.append(q); }
    if (pre) box.append(mk("p", "zt-ask__note", pre));
    if (unit) {
      box.append(mk("p", "zt-ask__t", unit.t), mk("p", "", unit.x)); if (unit.note === "open") box.append(mk("p", "zt-ask__note", u.open));
      const act = mk("div", "zt-ask__act");
      if (unit.sec && document.getElementById(unit.sec)) { const a = mk("a", "zt-assist__go", u.go); a.href = "#" + unit.sec; a.dataset.scroll = unit.sec; act.append(a); }
      (unit.src || []).slice(0, 2).map(sourceById).filter(Boolean).forEach((s) => { const a = mk("a", "zt-ask__src", u.src + ": " + s.by.split(" · ")[0]); a.href = "#src-" + s.id; a.dataset.src = s.id; a.title = s.title; act.append(a); });
      if (act.childNodes.length) box.append(act); box.dataset.unit = unit.id; box.dataset.src = (unit.src || []).join(" ");
    }
    chips(box, (r || []).slice(0, 3)); o.answer.replaceChildren(box); if (o.pose) o.pose(unit ? "explain" : "idle");
    requestAnimationFrame(() => { o.panel.scrollTo({ top: Math.max(0, o.answer.offsetTop - 12), behavior: "auto" }); });
  };
  async function ask(q) {
    const l = lang(), u = UI[l]; q = q.trim(); if (o.onAsk) o.onAsk();
    if (q.length < 2) { o.answer.replaceChildren(mk("p", "zt-ask__note", u.empty)); return; }
    last = { q, l }; const om = otherMonument(q, o.monument);
    const ix = await index(l); const us = await o.units(l);
    if (om) { const box = mk("div", "zt-ask__res"); const qq = mk("p", "zt-ask__q"); qq.append(mk("span", "", u.you + ": "), document.createTextNode(q)); const a = mk("a", "zt-assist__go", u.goto(NAME[om][0])); a.href = ROOT + NAME[om][1] + "/index.html"; box.append(qq, mk("p", "", u.other(NAME[om][0])), a); box.dataset.other = om; o.answer.replaceChildren(box); return; }
    const r = ix.search(q, { section: o.section ? o.section() : "", prev }); const h = r.hits[0];
    const ok = h && h.cov >= (r.who ? 0.6 : 0.5) && h.sc >= 0.7;
    last.unit = ok ? h.u.id : null; last.rel = r.hits.slice(ok ? 1 : 0, ok ? 4 : 3).filter((x) => x.sc > 0.35).map((x) => x.u.id);
    if (!ok) { prev = null; const sec = o.section ? o.section() : ""; const sug = [...r.hits.slice(0, 2).map((x) => x.u), ...us.filter((x) => x.sec === sec), ...us].filter((x, i, a) => a.findIndex((y) => y.id === x.id) === i).slice(0, 3); last.rel = sug.map((x) => x.id); last.none = true; show(null, sug, u.none); return; }
    prev = { words: r.words, id: h.u.id }; const miss = r.years.find((y) => !us.some((x) => (x.t + x.x).includes(y))); last.year = miss || "";
    show(h.u, r.hits.slice(1, 4).filter((x) => x.sc > h.sc * 0.35).map((x) => x.u), miss ? u.year(miss) : "");
  }
  form.addEventListener("submit", (e) => { e.preventDefault(); const q = inp.value; inp.value = ""; ask(q); });
  o.answer.addEventListener("click", async (e) => {
    const c = e.target.closest("[data-ask]"); if (c) { const m = await unitsById(lang()); const x = m.get(c.dataset.ask); if (x) { last = { q: x.t, l: lang(), unit: x.id, rel: [] }; prev = { words: [], id: x.id }; const ix = await index(lang()); const r = ix.search(x.t); prev.words = r.words; show(x, r.hits.map((y) => y.u).filter((y) => y.id !== x.id).slice(0, 3)); } return; }
    const s = e.target.closest("[data-src]"); if (s && s.tagName === "A") { e.preventDefault(); o.close(); const { goToSources } = await import("./zt-sources.js?v=20261125d"); goToSources(s.dataset.src); }
  });
  const relabel = async () => { const u = UI[lang()]; lb.textContent = u.label; inp.placeholder = u.ph; btn.textContent = u.send;
    if (last && last.l !== lang() && o.answer.querySelector(".zt-ask__res")) { const m = await unitsById(lang()); const q = last.q; last = Object.assign({}, last, { l: lang() }); if (last.unit && m.get(last.unit)) show(m.get(last.unit), (last.rel || []).map((i) => m.get(i)).filter(Boolean), last.year ? UI[lang()].year(last.year) : ""); else if (last.none) show(null, (last.rel || []).map((i) => m.get(i)).filter(Boolean), UI[lang()].none); void q; } };
  relabel(); new MutationObserver(() => setTimeout(relabel, 0)).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  return { ask, clear: () => { last = null; }, input: inp, get active() { return !!o.answer.querySelector(".zt-ask__res"); } };
}

/* ---- floating icon: never on top of text, controls, buttons or navigation (07D, replaces fixed corner) ----
   While the page scrolls on a phone the icon is out of the way; when it rests, the first free corner is used.
   If no corner is free it stays tucked (still reachable by keyboard). Nothing runs while nothing moves. */
export function keepClear(fab, isOpen) {
  const M = matchMedia("(max-width: 759px)"); const SLOTS = [["r", 0], ["l", 0], ["r", 76], ["l", 76], ["r", 152], ["l", 152]];
  const pad = 6; let t = 0;
  const busy = (r) => {
    if (r.top < 70) return true; const pts = []; [[0, 0], [1, 0], [0.5, 0.5], [0, 1], [1, 1]].forEach(([i, j]) => pts.push([r.left + r.width * i, r.top + r.height * j]));
    const seen = new Set();
    for (const [x, y] of pts) for (const el of document.elementsFromPoint(Math.min(innerWidth - 1, Math.max(0, x)), Math.min(innerHeight - 1, Math.max(0, y)))) {
      if (seen.has(el) || el === fab || fab.contains(el)) continue; seen.add(el);
      if (el.closest(".zt-assist") || el.closest("[hidden]")) continue; const st = getComputedStyle(el); if (st.visibility === "hidden" || +st.opacity < 0.2) continue;
      const ctl = el.closest("button,a,input,select,textarea,summary,[role=slider],[role=button]"); if (ctl) { const b = ctl.getBoundingClientRect(); if (b.width < innerWidth * 0.8 || b.height < innerHeight * 0.4) return true; }
      for (const nd of el.childNodes) if (nd.nodeType === 3 && nd.textContent.trim()) { const rg = document.createRange(); rg.selectNodeContents(nd); for (const q of rg.getClientRects()) if (q.right > r.left - pad && q.left < r.right + pad && q.bottom > r.top - pad && q.top < r.bottom + pad) return true; }
    }
    // text that is not hit-testable (pointer-events:none overlays such as captions) is checked through known caption layers
    for (const el of document.querySelectorAll(".zt-ov:not([hidden]) p, .zt-tc p, .zt-kin:not([hidden]) p, .stage__caption > *, .museum__caption p, .museum__caption h4, .kf__caption p, .kf__caption h4, .aseq__txt p, .aseq__txt h3, .dkf__cap p, .dkf__cap h3, .craft__cap p, .craft__cap h4, .scroll-hint")) { const q = el.getBoundingClientRect(); if (!q.width || q.bottom < r.top - pad || q.top > r.bottom + pad || q.right < r.left - pad || q.left > r.right + pad) continue; let o = 1; for (let e = el; e && e !== document.body; e = e.parentElement) o *= +getComputedStyle(e).opacity; if (o > 0.25 && el.textContent.trim()) return true; }
    return false;
  };
  const place = () => {
    t = 0; fab.classList.remove("is-moving"); if (isOpen()) { fab.classList.remove("is-tucked"); return; }
    const w = fab.offsetWidth || 52, h = fab.offsetHeight || 52, m = M.matches ? 12 : 16;
    for (const [side, up] of SLOTS) { const top = innerHeight - m - h - up, left = side === "r" ? innerWidth - m - w : m; const r = { left, top, right: left + w, bottom: top + h, width: w, height: h }; if (!busy(r)) { fab.style.setProperty("--fab-x", side === "r" ? "0px" : -(innerWidth - 2 * m - w) + "px"); fab.style.setProperty("--fab-y", -up + "px"); fab.classList.remove("is-tucked"); return; } }
    fab.classList.add("is-tucked");
  };
  const poke = () => { if (M.matches && !isOpen()) fab.classList.add("is-moving"); clearTimeout(t); t = setTimeout(place, 260); };
  addEventListener("scroll", poke, { passive: true }); addEventListener("resize", poke); document.addEventListener("click", () => { clearTimeout(t); t = setTimeout(place, 420); }, true);
  new MutationObserver(() => { clearTimeout(t); t = setTimeout(place, 420); }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang", "class"] });
  setInterval(() => { if (document.hidden || isOpen() || t || fab.classList.contains("is-moving")) return; const r = fab.getBoundingClientRect(); if (fab.classList.contains("is-tucked") || busy(r)) place(); }, 3000); // captions can change by themselves (films)
  setTimeout(place, 600); return place;
}
