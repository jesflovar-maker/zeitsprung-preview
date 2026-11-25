/* ZEITSPRUNG V2 — js/zt-guide-index.js (07D) — BRÜCKMANDL: local retrieval over APPROVED page text.
   No AI, no API, no network, no key: a small word index in the browser. It never writes text — an answer is always one
   passage that already stands on this monument's page, word for word, with its chapter and its registered source.
   unit = { id, t: title, x: text, sec: section id, src: [source ids], kw: extra words, note?: "open" }  (one monument only) */
const A = (v) => (Array.isArray(v) ? v : []);
/* ---- which passages each monument offers ---- */
export const UNITS = {
  "dom-st-peter": (S) => [
    ...A(S.frames).map((f, i) => ({ id: "kf" + i, t: f.d + " · " + f.t, x: f.p, sec: "zeitreise", kw: i === 6 ? "hoehe height altura turm tower torre fertig vollendet completed terminaron" : "", src: i === 6 ? ["DOM_TOWERS", "DOM_STONE"] : i === 7 ? ["DOM_HUETTE", "DOM_FLYER"] : i === 5 ? ["DOM_STONE", "BLFD"] : i === 2 ? ["DOM_FLYER", "DOM_750"] : i === 3 || i === 4 ? ["DOM_STONE"] : [], note: [1, 2, 3, 4].includes(i) ? "open" : "" })),
    ...A(S.bauSteps).map((f, i) => ({ id: "bau" + i, t: f.d + " · " + f.t, x: f.p, sec: "bauabfolge", kw: i === 3 ? "hoehe height altura turm tower torre terminaron" : "", src: i > 2 ? ["DOM_TOWERS", "DOM_STONE"] : ["DOM_STONE"], note: i < 2 ? "open" : "" })),
    ...A(S.archSteps).map((f, i) => ({ id: "arch" + i, t: f.t, x: f.p, sec: "architektur", kw: i === 5 ? "hoehe height altura turm tower torre" : "", src: i === 5 ? ["DOM_TOWERS"] : [] })),
    ...A(S.glasSteps).map((f, i) => ({ id: "glas" + i, t: f.t, x: f.p, sec: "glas", src: i === 0 ? ["DOM_FLYER"] : [] })),
    ...A(S.peopleSteps).map((f, i) => ({ id: "ppl" + i, t: f.t, x: f.p, sec: "menschen", src: i === 1 ? ["DOM_HUETTE"] : [] })),
    { id: "now", t: S.now.h, x: S.now.lead, sec: "heute", src: ["UNESCO1155", "DOM_HUETTE"], kw: "unesco welterbe world heritage patrimonio" }, { id: "under", t: S.under.h, x: S.under.lead, sec: "unten", src: [], kw: "unter darunter under below beneath debajo boden ausgrabung dom kathedrale cathedral catedral" },
    { id: "tl8", t: S.bau.h, x: S.bau.lead, sec: "bauabfolge", src: ["DOM_STONE"] },
  ],
  "porta-praetoria": (S) => [
    { id: "ctx", t: S.ctx.h, x: S.ctx.p1, sec: "ctx", src: ["BLFD", "PP_AUM"], kw: "heute today hoy rest reste remains erhalten" },
    { id: "pass", t: S.pass.h, x: S.pass.p1 + " " + S.pass.p2, sec: "durchfahrt", src: ["PP_AUM"], kw: "breit width ancho passage" }, { id: "tow", t: S.tow.h, x: S.tow.p1 + " " + S.tow.p2, sec: "turm", src: ["PP_AUM"] },
    { id: "roof", t: S.tow.h, x: S.tow.p3, sec: "turm", src: ["PP_AUM"], kw: "turm tower torre dach roof tejado zinnen battlements almenas" },
    { id: "y179", t: S.y179.h, x: S.y179.p1, sec: "y179", src: ["PP_INS", "PP_AUM"], kw: "inschrift inscription inscripcion gegruendet founded fundado wann baujahr alter" }, { id: "y179b", t: S.y179.eyebrow.replace(/^\d+ · /, ""), x: S.y179.p2, sec: "y179", src: ["PP_AUM"] },
    { id: "cas", t: S.cas.h, x: S.cas.p, sec: "castra", src: ["BLFD"], kw: "groesse size tamano lager camp campamento" },
    ...A(S.bau.states).map((b, i) => ({ id: "bau" + i, t: b.t, x: b.p, sec: "bau", src: i === 0 ? ["PP_AUM"] : [] })),
    { id: "end", t: S.end.h, x: S.end.p, sec: "heute", src: ["BLFD"] },
  ],
  "altes-rathaus": (S) => [
    { id: "now", t: S.now.h, x: S.now.p1, sec: "heute", src: ["BLFD"] }, { id: "diet", t: S.rt.h, x: S.now.p2 + " " + S.rt.p1, sec: "reichstag", src: ["AR_DOC", "AR_HLB_END"], kw: "reichstag diet dieta immerwaehrend perpetual" },
    ...A(S.out.items).map((b, i) => ({ id: "out" + i, t: b[0], x: b[1], sec: "aussen", src: ["BLFD", ...(i ? [] : ["AR_TOUR"])] })),
    { id: "hall", t: S.hall.h, x: S.hall.p1 + " " + S.hall.p2, sec: "saalbau", src: ["AR_TOUR", "BLFD"], kw: "gebaut built construyo construir saal hall sala tanzsaal dance baile zweck purpose" },
    ...A(S.time.ch).map((c, i) => ({ id: "t" + i, t: c[0] + " · " + c[1], x: c[2], sec: "zeit", src: i === 5 ? ["AR_HLB_RDH", "AR_HLB_END"] : i === 0 || i === 1 ? ["AR_TOUR", "BLFD"] : i === 4 ? ["BLFD"] : [], note: i === 2 || i === 3 ? "open" : "" })),
    ...A(S.saal.spots).map((b, i) => ({ id: "sp" + i, t: b.t, x: b.d, sec: "saal", src: [] })), ...A(S.people.items).map((b, i) => ({ id: "pp" + i, t: b[0], x: b[1], sec: "menschen", src: [], note: "open" })),
    ...A(S.mat.items).map((b, i) => ({ id: "mt" + i, t: b[0], x: b[1], sec: "material", src: [] })), ...A(S.plan.items).map((b, i) => ({ id: "pl" + i, t: b[0], x: b[1], sec: "ansicht", src: [] })), ...A(S.bau.items).map((b, i) => ({ id: "bh" + i, t: b[0], x: b[1], sec: "zeit", src: [] })),
  ],
  neupfarrplatz: (S) => [
    { id: "now", t: S.now.h, x: S.now.p1, sec: "heute", src: ["NP_TOUR"] }, { id: "q", t: S.quarter.h, x: S.quarter.p + " " + S.guideTopics[0][1], sec: "viertel", src: ["NP_HDBG_G"], kw: "viertel quarter barrio juden jews judios" },
    { id: "syn", t: S.syn.h, x: S.guideTopics[1][1], sec: "synagoge", src: ["NP_HDBG_S"], kw: "synagoge synagogue sinagoga" }, ...A(S.syn.items).map((b, i) => ({ id: "s" + i, t: b[0], x: b[1], sec: "synagoge", src: ["NP_HDBG_S"] })),
    ...A(S.people.items).map((b, i) => ({ id: "p" + i, t: b[0], x: b[1], sec: "alltag", src: [] })), ...A(S.kf.items).map((b) => ({ id: b.n, t: b.n + " · " + b.state + " · " + b.title, x: b.d, sec: "zeit", src: [], note: "open" })),
    { id: "arch", t: S.arch.h, x: S.guideTopics[3][1], sec: "archaeologie", src: ["NP_CITY", "NP_LMU"], kw: "grabung archaeologie excavation excavacion dig found gefunden hallazgos encontro" }, { id: "ch", t: S.church.h, x: S.now.p1, sec: "kirche", src: ["BLFD"], kw: "neupfarrkirche kirche church iglesia" },
    ...A(S.church.items).slice(0, 2).map((b, i) => ({ id: "c" + i, t: S.church.h + " · " + b[0], x: b[1], sec: "kirche", src: ["BLFD"] })), { id: "mis", t: "Misrach · " + S.mis.h, x: S.mis.p, sec: "misrach", src: ["NP_CITY"], kw: "karavan denkmal memorial monumento misrach mizrach", note: "open" },
  ],
};
/* ---- words ---- */
const STOP = new Set(("macht machte machen hizo hace hacen wohnte wohnten make makes worauf woraus womit wofuer stehen steht stand liegt tenian tengo during happened passierte geschah paso hatten welchem welchen viele vielen wieviel wieviele wurden waere sein seine ihr ihre haette many any some tiene tienen tenia hubo mide cuanto cuanta cuantos cuantas tell does der die das den dem des ein eine einen einem einer und oder aber ist sind war waren wird wurde wurden hat haben hatte was wer wie wo wann warum wieso welche welcher welches es er sie ich du man mir mich sich im in an am auf aus bei mit von vom zu zum zur fuer ueber unter nach vor noch nur auch denn eigentlich bitte gibt gab kann sag erzaehl erklaer etwas mehr viel sehr so dann da hier dieser diese dieses hast du kannst mal the a an of and or is are was were be been did do does has have had what who how where when why which it he she i you me my in on at from by with to for about over under after before still only also please can tell explain something more much very so then here this that these those there el la los las un una unos unas y o es son era eran fue fueron ser ha han habia que quien como donde cuando por porque cual cuales lo le me mi en de del al con para sobre bajo tras antes aun solo tambien puede dime explica algo mas mucho muy asi entonces aqui este esta esto estos estas hay se su sus").split(" "));
export const fold = (s) => String(s || "").toLowerCase().replace(/ß/g, "ss").replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").normalize("NFD").replace(/[̀-ͯ]/g, "");
const KEEP = new Set(["taller", "portal", "puente", "fuente", "grande", "fenster", "unter"]); // stems that would collide between languages
const stem = (w) => (w.length > 5 && !KEEP.has(w) && !/^\d/.test(w) ? w.replace(/(ungen|ung|ern|en|er|es|em|e|s|n|ing|ed|os|as|cion|ciones)$/, "") : w);
/* concept groups DE/EN/ES — every word of a group counts as the same word */
const SYN = ("breit breite wide width ancho anchura|bauen erbaut gebaut errichtet entstanden entstand baubeginn baujahr built build begun erected construction construir construido construida construyo construccion erigido|brand feuer abgebrannt fire burned burnt incendio quemado fuego|zerstoert zerstoerung abbruch abgerissen destroyed destruction demolished destruida destruido demolido|alt alter aelteste old age oldest antiguo edad antigua|hoch hoehe high height tall alto altura|lang laenge long length largo longitud|gross groesse big large size grande tamano|stein steine material materialien kalkstein gruensandstein naturstein stone stones limestone piedra piedras caliza materiales|fenster glas glasmalerei verglasung window windows glass stained vidriera vidrieras ventana ventanas|turm tuerme helme tower towers spire spires torre torres agujas|tor portal eingang gate door entrance puerta portal entrada|bogen boegen arch arches arco arcos|pfeiler saeule pier piers pillar pillars column pilar pilares columna|arbeiter menschen handwerker steinmetz steinmetze worker workers mason masons people craftsmen obreros canteros gente trabajadores|werkstatt dombauhuette bauhuette workshop taller|krieg war guerra|eis eisstoss eisgang ice hielo|legende sage legend leyenda|architekt baumeister architect builder arquitecto constructor|soldat soldaten legion legionaer soldiers soldier legionary soldados legionario|roemer roemisch roman romans romano romanos|inschrift inscription inscripcion|dach daecher roof roofs tejado techo|decke ceiling techo|chor choir coro|synagoge synagogue sinagoga|juedisch juden jewish jews judio judios judia|grabung ausgrabung archaeologie excavation excavations archaeology excavacion excavaciones arqueologia|kirche church iglesia|dom kathedrale cathedral catedral|bruecke bridge puente|rathaus townhall ayuntamiento|reichstag diet dieta|saal reichssaal hall sala salon|gesandte gesandter envoy envoys enviados|kaiser emperor emperador|lager camp castra campamento|fundament fundamente gruendung foundation foundations cimientos cimentacion|restaurierung sanierung restoration renovation restauracion|strassenbahn tram tranvia|heute today hoy actualidad|fassade facade fachada|denkmal memorial misrach monumento memorial").split("|").map((g) => g.split(" ").map((w) => stem(fold(w))));
const CON = new Map(); SYN.forEach((g, i) => g.forEach((w) => CON.set(w, "#" + i)));
const tok = (s) => fold(s).split(/[^a-z0-9]+/).filter((w) => w && (w.length > 1 || /\d/.test(w)) && !STOP.has(w)).map(stem);
const con = (w) => CON.get(w) || w;
const lev = (a, b, max) => { if (Math.abs(a.length - b.length) > max) return max + 1; let p = [...Array(b.length + 1).keys()]; for (let i = 1; i <= a.length; i++) { const c = [i]; let m = i; for (let j = 1; j <= b.length; j++) { c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); if (a[i - 1] === b[j] && a[i] === b[j - 1]) c[j] = Math.min(c[j], p[j]); m = Math.min(m, c[j]); } if (m > max) return max + 1; p = c; } return p[b.length]; };
/* practical visitor questions are outside the approved content -> honest "no information", never a forced match */
const SERVICE = /restaurant|pizza|essen gehen|wetter|weather|\bclima\b|parken|parkplatz|parking|aparcar|eintritt|ticket|entrada cuesta|kostet|\bcost\b|precio|oeffnungszeit|opening hours|horario|toilet|\bwc\b|wlan|wi-?fi|hotel|hostal|fussball|football|futbol|mundial|estadio|stadion|stadium|paella|rezept|recipe|receta|passwor/;
/* other monuments: never mixed, only pointed to */
const NAMES = { "steinerne-bruecke": /steiner\w* brueck|stone bridge|puente de piedra|bru?e?ckmandl/, "dom-st-peter": /\bdom\b|st\.? ?peter|kathedral|cathedral|catedral/, "porta-praetoria": /porta pr|castra regina|nordtor/, "altes-rathaus": /rathaus|reichssaal|reichstag|town hall|imperial diet|ayuntamiento|\bdieta\b/, neupfarrplatz: /neupfarr|synagog|sinagoga|misrach|mizrach/ };

export function createIndex(units) {
  const docs = units.filter((u) => u && u.x).map((u) => { const T = tok(u.t), K = tok(u.kw || ""), X = tok(u.x); const tf = new Map(); const add = (ws, n) => ws.forEach((w) => [w, con(w)].forEach((k, i) => { if (i && k === w) return; tf.set(k, (tf.get(k) || 0) + n); })); add(X, 1); add(T, 2.4); add(K, 2); return { u, tf, len: X.length + T.length }; });
  const df = new Map(); docs.forEach((d) => d.tf.forEach((_, k) => df.set(k, (df.get(k) || 0) + 1))); const N = docs.length || 1;
  const vocab = [...df.keys()].filter((w) => w[0] !== "#"); const idf = (k) => Math.log(1 + N / (df.get(k) || 1));
  const known = [...new Set([...vocab, ...CON.keys()])];
  const fix = (w) => { if (df.has(w) || CON.has(w) || /^\d/.test(w) || w.length < 4) return w; const max = w.length >= 9 ? 2 : w.length >= 5 ? 1 : -1; let best = w, bd = Math.max(1, max + 1); for (const v of known) { if (max < 0) break; if (v.length < 5 || v[0] !== w[0]) continue; const d = lev(w, v, max); if (d < bd) { bd = d; best = v; if (d === 0) break; } } if (bd <= max) return best; for (const v of known) if (v.length >= 4 && (w.startsWith(v) && v.length / w.length > 0.5 || v.startsWith(w) && w.length / v.length > 0.5)) return v; return w; };
  return { size: docs.length,
    search(q, { section = "", prev = null } = {}) {
      const f = fold(q); const raw = tok(q); let words = raw.map(fix); const fuzzy = words.filter((w, i) => w !== raw[i]).length; const years = (f.match(/\b\d{3,4}\b/g) || []);
      const when = /\bwann\b|\bwhen\b|\bcuando\b|welche[ms]? jahr|what year|que ano|jahreszahl/.test(f), who = /\bwer\b|\bwho\b|\bquien/.test(f);
      const short = words.length <= 1 && prev && prev.words.length && (/^(und|and|y|also|warum|wieso|why|por que|wann|when|cuando|wer|who|quien|wo|where|donde|mehr|more|mas)\b/.test(f.trim()) || !words.length);
      if (short) words = [...new Set([...words, ...prev.words])];
      if (!words.length || SERVICE.test(f)) return { hits: [], words, years, short };
      const high = /\bhoch\b|\bhoehe|\bhigh\b|\btall\b|height|\balt[oa]s?\b|altura/.test(f), many = /wie ?viele?|how many|cuant[oa]s/.test(f);
      let total = 0; const W = words.map((w) => { const keys = [w, con(w)].filter((k) => df.has(k)); const v = Math.max(...keys.map(idf), keys.length ? 0 : 2.2); total += v; return { w, v, keys }; });
      const hits = docs.map((d) => { let s = 0, cov = 0; W.forEach(({ v, keys }) => { let m = 0; keys.forEach((k, i) => { const n = d.tf.get(k); if (n) m = Math.max(m, (i ? 0.85 : 1) * (n / (n + 0.9))); }); if (m) { cov += v; s += v * m; } });
        if (!s) return null; let sc = s; if (d.u.sec === section) sc *= 1.18; if (high && /\d+ ?(m\b|met)/i.test(d.u.x)) sc *= 1.9; if (many) sc *= /\d|zwei|drei|two|three|\bdos\b|tres|sech|sixteen|dieci/i.test(d.u.t + d.u.x) ? 1.35 : 0.7; if (when) sc *= /\b1\d{3}\b|\b20\d\d\b|\b179\b/.test(d.u.t + d.u.x) ? 1.35 : (short ? 0.4 : 0.85); if (years.length && years.some((y) => (d.u.t + d.u.x).includes(y))) sc *= 1.6; if (short && prev.id === d.u.id) sc *= 0.75; return { u: d.u, sc, cov: cov / total - (fuzzy && fuzzy === words.length && words.length > 1 ? 0.25 : 0) }; }).filter(Boolean).sort((a, b) => b.sc - a.sc);
      return { hits, words, years, short, who };
    } };
}
export function otherMonument(q, self) { const f = fold(q); if (NAMES[self] && NAMES[self].test(f)) return null; for (const k in NAMES) if (k !== self && NAMES[k].test(f)) return k; return null; }
