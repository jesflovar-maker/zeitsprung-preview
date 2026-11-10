// DOM ST. PETER — PRESENTATION BUILD V1.1 (timeline video after K-frames, Glas & Material, Dombauhütte, contextual guide).
// One continuous museum experience. Vanilla ES module, no external libraries.
// Media: runtime derivatives only (../assets/dom-st-peter/). One primary video plays at a time; current/next lazy loading.
const A = "../assets/dom-st-peter/";
const HI = new Set(["k03","k05","k06","k07","k08","k10","k11","int_portal","int_nave","int_choir","int_vault","heute"]); // names that also exist at 1080 px
const img = (n, w = 720) => `${A}img/dsp_${n}_${w}.webp`;
const srcset = (n) => (HI.has(n) ? `${img(n, 720)} 720w, ${img(n, 1080)} 1080w` : `${img(n, 720)} 720w`);
const vid = (n) => `${A}video/dsp_${n}_720.mp4`;
const poster = (n) => `${A}poster/dsp_${n}_poster.webp`;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = document) => r.querySelector(s);
const el = (t, c, a) => { const e = document.createElement(t); if (c) e.className = c; if (a) for (const k in a) e.setAttribute(k, a[k]); return e; };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* ---------- content (German; historical copy follows the project's source-controlled master) ---------- */
const FRAMES = [
  { d: "CA. 1000", t: "Der romanische Dom", p: "Der romanische Vorgängerbau wird nach Westen erweitert: Querhaus, zwei Türme, Atrium und eine Krypta gehören zur Anlage. Vom romanischen Dom steht heute nur noch der Eselsturm.", i: "k03" },
  { d: "1156 · 1172", t: "Brände und Wiederherstellung", p: "Der romanische Dom erleidet 1156 und 1172 zwei Brände und wird beide Male wiederhergestellt.", i: "k04" },
  { d: "1273 · 1276", t: "Brand und Beginn des gotischen Neubaus", p: "1273 zerstört ein Brand den romanischen Vorgängerbau. Um 1275 beginnt der gotische Neubau — im Osten: Als erster Abschnitt wurde 1276 vermutlich der Südchor geweiht. Von dort wächst der Dom nach Westen.", i: "k05" },
  { d: "1295 – 1315", t: "Der hochgotische Chor entsteht", p: "Im Osten wird der Chor hochgotisch neu gefasst: Ab 1295 entsteht ein zweiter Bauabschnitt mit zunehmend durchlichteten Wänden und dem dreiteiligen Aufriss aus Arkaden, Triforium und Obergaden. Um 1310/15 folgt die erste große Verglasung mit Glasmalerei.", i: "k06" },
  { d: "1325 – 1443", t: "Der Dom wächst nach Westen", p: "Der Bau schreitet von Osten nach Westen voran: Querhaus und Langhausjoche wachsen westwärts. Die Stiftskirche St. Johann behindert den Weiterbau; um 1360 sind im Westen vor allem das südliche Seitenschiff und das Erdgeschoss des Südturms möglich.", i: "k07" },
  { d: "BIS 1520/25", t: "Die unvollendeten Türme", p: "Die Westfassade wächst ab etwa 1325 über rund 200 Jahre „von rechts unten nach links oben“. Um 1520/25 kommt der große Dombau zum Stillstand: Beide Türme enden in Höhe des Glockengeschosses unter Pyramidendächern.", i: "k08" },
  { d: "1859 – 1869", t: "Die Türme werden vollendet", p: "Auf den mittelalterlichen Turmstümpfen entsteht die Vollendung: Die Türme werden senkrecht weitergeführt, erhalten achteckige Obergeschosse und die heutigen neugotischen Helme (rund 105 m). 1870–72 folgen Querhausgiebel und Dachreiter.", i: "k10" },
  { d: "20. JAHRHUNDERT", t: "Dombauhütte und Restaurierung", p: "1923/24 wird die Dombauhütte als staatliche Werkstatt wieder eingerichtet und arbeitet seither ohne Unterbrechung. 1984–1989 folgen eine umfassende Restaurierung und der Einbau der Bischofskrypta; 1985–1988 wird die farbige Raumfassung des Innenraums restauriert.", i: "k11" }
];
const BAU = [
  { y: "AB 1275", t: "Der Chor", p: "Der gotische Neubau beginnt im Osten. Als erster Abschnitt wurde 1276 vermutlich der Südchor geweiht. Ab 1295 wird der Hauptchor hochgotisch neu gefasst: mit durchlichteten Wänden und dem dreiteiligen Aufriss aus Arkaden, Triforium und Obergaden — um 1310/15 folgt die erste große Verglasung.", v: "bau_choir", dir: "OST" },
  { y: "14. JAHRHUNDERT", t: "Querhaus und Langhaus", p: "Von Osten her wachsen Querhaus und Langhausjoche nach Westen. Die Stiftskirche St. Johann behindert den Weiterbau; um 1360 sind im Westen vor allem das südliche Seitenschiff und das Erdgeschoss des Südturms möglich.", v: "bau_nave", dir: "MITTE" },
  { y: "AB ETWA 1325", t: "Die Westfassade", p: "Die Westfassade wächst über rund 200 Jahre „von rechts unten nach links oben“. Um 1520 ruhen die Arbeiten: Beide Türme enden in Höhe des Glockengeschosses unter Pyramidendächern.", v: "bau_west", dir: "WEST" },
  { y: "1859 – 1869", t: "Die Türme", p: "Auf den mittelalterlichen Turmstümpfen entstehen achteckige Obergeschosse und die heutigen neugotischen Helme von rund 105 Metern.", v: "bau_towers", dir: "WEST" }
];
const ARCH = [
  { l: "Tragwerk & Gewölbe", t: "Pfeiler, Rippen, Gewölbe", p: "Bündelpfeiler und Rippengewölbe führen die Lasten in die Tiefe — das Prinzip der Gotik: Die Wände öffnen sich, das Licht kommt in den Raum.", v: ["arch_pillars", "arch_vault"] },
  { l: "Westfassade & Türme", t: "Zwei Türme über der Stadt", p: "Die Westfassade mit ihren beiden Türmen prägt das Bild des Doms. Die Helme erreichen rund 105 Meter.", v: ["arch_west_alt", "arch_towers_alt"] },
  { l: "Dach & Hülle", t: "Die Dachlandschaft", p: "Über dem Gewölbe schützt das Dach den Bau. Die Visualisierung öffnet die Dachlandschaft Schicht für Schicht.", v: ["arch_roof"] },
  { l: "Schichten des Baus", t: "Vom Ganzen zur Struktur", p: "Der Dom lässt sich in seine Bauteile zerlegen: Chor, Langhaus, Fassade, Türme und Dach.", v: ["arch_exploded"] }
];
const MARKS = [
  { t: 0, k: "WEST", h: "Westfassade & Türme", p: "Zwei Türme prägen die Westseite. An der Fassade wurde über rund 200 Jahre gebaut." },
  { t: 3.6, k: "SÜD", h: "Struktur & Strebewerk", p: "An der Südseite wird das Tragwerk des Langhauses sichtbar: Strebepfeiler und Strebebögen." },
  { t: 10.8, k: "OST", h: "Der Chor", p: "Im Osten begann um 1275 der gotische Neubau." },
  { t: 14.6, k: "NORD", h: "Architektur im Detail", p: "Fenster, Maßwerk und Dächer gliedern die Nordseite." },
  { t: 27.2, k: "ZENIT", h: "Dach & Gesamtstruktur", p: "Von oben zeichnet sich der kreuzförmige Grundriss des Doms ab." },
  { t: 38.4, k: "ABSTIEG", h: "Unter dem Dom", p: "Schichten und Spuren reichen in die Tiefe." }
];
const PEOPLE = [
  { l: "Steinmetze", t: "Arbeit am Stein", p: "Handwerk, Werkzeug und ein geschulter Blick: Steinmetze geben dem Dom seit Generationen Form.", v: "people_mason" },
  { l: "Bauhütte", t: "Die Dombauhütte", p: "Die Dombauhütte ist die Werkstatt des Doms — hier wird geplant, gearbeitet und bewahrt. 1923/24 wurde sie als staatliche Werkstatt wieder eingerichtet und arbeitet seither ohne Unterbrechung.", v: "people_bauhuette" },
  { l: "Planung", t: "Vom Entwurf zum Werkstück", p: "Am Anfang steht die Zeichnung: Formen werden entworfen und auf den Stein übertragen.", v: "work_master" },
  { l: "Zimmerleute", t: "Holz für den Bau aus Stein", p: "Gerüste und Dachwerke gehören zum Dombau — ohne Holz kein Dom aus Stein.", v: "work_truss" },
  { l: "Hebezeuge", t: "Stein für Stein in die Höhe", p: "Jeder Werkstein muss an seinen Platz gehoben und versetzt werden.", v: "work_wheel" }
];
const GLAS = [
  { l: "Glasmalerei", t: "Licht als Baustoff", p: "Mit dem hochgotischen Chor öffnen sich die Wände zunehmend dem Licht. Um 1310/15 folgt die erste große Verglasung mit Glasmalerei — farbiges Licht wird Teil der Architektur.", m: [{ v: "glass_light" }, { s: "glass_choir" }] },
  { l: "Werkstatt", t: "Vom Glasstück zum Fenster", p: "Glas wird zugeschnitten, bemalt, gebrannt und in Blei gefasst. Die Visualisierung zeigt diese Arbeitsschritte.", m: [{ v: "glass_painter" }, { v: "glass_lead" }] },
  { l: "Detail", t: "Farbe aus der Nähe", p: "Aus der Nähe zeigt sich die Arbeit im einzelnen Glasstück: Farbe, Zeichnung und Bleinetz.", m: [{ s: "glass_macro" }] },
  { l: "Stein", t: "Ein Bau aus Naturstein", p: "Der Dom ist aus Naturstein errichtet. Die Dombauhütte arbeitet bis heute ausschließlich in Naturstein.", m: [{ s: "stone_quarry" }, { s: "stone_wall" }] },
  { l: "Maßwerk & Skulptur", t: "Form aus dem Block", p: "Maßwerk, Fialen und Bauzier entstehen in Handarbeit — Stück für Stück aus dem Stein.", m: [{ v: "work_carver" }] }
];
// Timeline video chapters: t = seek position (s) in dsp_timeline_720.mp4; copy = source-controlled historical master.
const TLV = [
  { t: 0, y: "1273", h: "Brand des romanischen Doms", p: "1273 zerstört ein Brand den romanischen Vorgängerbau." },
  { t: 7, y: "UM 1275", h: "Beginn des gotischen Neubaus", p: "Der Neubau beginnt im Osten. Als erster Abschnitt wurde 1276 vermutlich der Südchor geweiht." },
  { t: 19, y: "AB 1295", h: "Der hochgotische Chor", p: "Ab 1295 wird der Chor hochgotisch neu gefasst. Um 1310/15 folgt die erste große Verglasung mit Glasmalerei." },
  { t: 27, y: "AB ETWA 1325", h: "Der Dom wächst nach Westen", p: "Querhaus und Langhausjoche wachsen westwärts; die Westfassade entsteht über rund 200 Jahre." },
  { t: 37, y: "UM 1520/25", h: "Stillstand", p: "Der große Dombau kommt zum Stillstand: Beide Türme enden in Höhe des Glockengeschosses unter Pyramidendächern." },
  { t: 45, y: "1859 – 1869", h: "Die Türme werden vollendet", p: "Auf den mittelalterlichen Turmstümpfen entstehen achteckige Obergeschosse und die neugotischen Helme von rund 105 Metern." },
  { t: 65, y: "1870 – 1872", h: "Querhausgiebel und Dachreiter", p: "1870–72 folgen Querhausgiebel und Dachreiter." },
  { t: 73, y: "1923/24", h: "Die Dombauhütte", p: "Die Dombauhütte wird als staatliche Werkstatt wieder eingerichtet und arbeitet seither ohne Unterbrechung." },
  { t: 79.4, y: "HEUTE", h: "UNESCO-Welterbe", p: "Seit 2006 gehört der Dom zum UNESCO-Welterbe „Regensburg mit Stadtamhof“." }
];
const ROUTE = [
  { l: "West", t: "Die Westfassade", p: "Der Blick von Westen: Fassade, Portale und die beiden Türme.", m: { v: "tour_nw" } },
  { l: "Seiten", t: "Entlang des Langhauses", p: "Strebewerk und Dächer zeigen, wie der Bau getragen wird.", m: { v: "tour_ws" } },
  { l: "Ost", t: "Der Chor", p: "Im Osten begann der gotische Neubau.", m: { v: "tour_se" } },
  { l: "Innen", t: "Der Innenraum", p: "Vom Westportal durch das Langhaus bis zum Chor.", m: { s: ["int_portal", "int_nave", "int_choir"] } },
  { l: "Detail", t: "Pfeiler und Gewölbe", p: "Die Höhe des Raums entsteht aus Pfeilern, Rippen und Gewölben.", m: { v: "arch_pillars" } },
  { l: "Unten", t: "Unter dem Dom", p: "Schichten und Spuren reichen in die Tiefe.", m: { v: "under_descent" } },
  { l: "Zurück", t: "Der Dom heute", p: "Zurück an der Oberfläche: der Dom im Herzen der Altstadt.", m: { s: ["heute"] } }
];
const NAV = [["zeitreise", "Zeitreise"], ["zeitleiste", "Zeitleiste"], ["bauabfolge", "Bauabfolge"], ["glas", "Glas"], ["menschen", "Dombauhütte"], ["architektur", "Architektur"], ["rundum", "Rundum"], ["unten", "Unten"], ["rundgang", "Rundgang"]];

/* ---------- video manager: lazy src, single primary playback ---------- */
const VM = {
  list: new Map(), pause: false,
  io: new IntersectionObserver((es) => { es.forEach((e) => { const r = VM.list.get(e.target); if (!r) return; r.ratio = e.isIntersecting ? e.intersectionRatio : 0; r.near = e.isIntersecting; if (e.isIntersecting) VM.load(e.target); }); VM.tick(); }, { threshold: [0, .15, .3, .45, .6, .8, 1], rootMargin: "35% 0px 35% 0px" }),
  add(v, opt = {}) { v.muted = true; v.setAttribute("playsinline", ""); v.setAttribute("muted", ""); v.preload = "none"; v.disablePictureInPicture = true; if (opt.loop !== false) v.loop = true; this.list.set(v, { ratio: 0, near: false, role: opt.role || "loop", eager: !!opt.eager }); this.io.observe(v); if (opt.eager) this.load(v); },
  remove(v) { this.io.unobserve(v); this.list.delete(v); try { v.pause(); } catch (e) {} v.removeAttribute("src"); },
  load(v) { if (!v.getAttribute("src") && v.dataset.src) { v.src = v.dataset.src; v.preload = "auto"; } },
  tick() {
    if (this.pause) { this.list.forEach((r, v) => { if (!v.paused) v.pause(); }); return; }
    let best = null, br = 0.42;
    this.list.forEach((r, v) => { if (r.role === "scrub" || r.hold) return; if (r.ratio >= br && r.ratio >= (r.eager ? 0.2 : br)) { best = v; br = r.ratio; } });
    this.list.forEach((r, v) => { if (v === best) { if (!reduced && v.paused) { this.load(v); const p = v.play(); if (p && p.catch) p.catch(() => {}); } } else if (!v.paused) v.pause(); });
  }
};
document.addEventListener("visibilitychange", () => { VM.pause = document.hidden; VM.tick(); });
function mkVideo(name, opt = {}) {
  const v = el("video"); v.dataset.src = vid(name); v.poster = poster(name); v.setAttribute("aria-hidden", "true");
  if (opt.ended) { v.loop = false; v.addEventListener("ended", opt.ended); }
  VM.add(v, opt); return v;
}
function mkImg(name, alt) { const i = el("img"); i.src = img(name, 720); i.srcset = srcset(name); i.sizes = "(min-width:1100px) 460px, 92vw"; i.alt = alt || ""; i.decoding = "async"; i.loading = "lazy"; return i; }
function stage(extra = "") { return el("div", "stage " + extra); }
const tag = () => { const s = el("span", "dvis stage__tag"); s.textContent = "Visualisierung"; return s; };

/* ---------- reveal ---------- */
const rvIO = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); rvIO.unobserve(e.target); } }), { threshold: 0.12 });
const reveal = (root) => root.querySelectorAll(".rv").forEach((n) => rvIO.observe(n));
const head = (eb, h, lead) => { const w = el("div"); w.innerHTML = `<p class="deyebrow rv">${eb}</p><h2 class="dh rv">${h}</h2>${lead ? `<p class="dlead rv">${lead}</p>` : ""}`; return w; };

/* ---------- sections ---------- */
function buildHero() {
  const st = $("#heroStage"); const s = stage(); const v = mkVideo("holo", { eager: true });
  s.append(v); st.append(s);
  v.addEventListener("error", () => { s.replaceChildren(mkImg("k11", "Dom St. Peter bei Nacht")); });
  const dlg = $("#trailerDlg"), box = $("#trailerStage");
  document.addEventListener("click", (ev) => { if (!ev.target.closest("[data-trailer]") || dlg.open) return;
    box.replaceChildren(); const t = el("video"); t.controls = true; t.playsInline = true; t.preload = "metadata"; t.poster = poster("trailer"); t.src = vid("trailer"); box.append(t);
    VM.pause = true; VM.tick(); dlg.showModal(); const p = t.play(); if (p && p.catch) p.catch(() => {});
  });
  const close = () => { try { dlg.close(); } catch (e) {} };
  $("#trailerClose").addEventListener("click", close);
  dlg.addEventListener("close", () => { const t = $("video", box); if (t) { t.pause(); t.removeAttribute("src"); } box.replaceChildren(); VM.pause = false; VM.tick(); });
  dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); });
}
function buildIntro() {
  const s = $("#intro"); const w = el("div", "dwrap");
  w.append(head("EINLEITUNG", "Ein Dom, der über Jahrhunderte wuchs", "Nach dem Brand von 1273 beginnt um 1275 der gotische Neubau — im Osten. Von dort wächst der Dom Joch um Joch nach Westen. Um 1520 ruhen die Arbeiten, beide Türme enden unter Pyramidendächern; erst 1859 bis 1869 werden sie vollendet."));
  const f = el("div", "dfacts");
  [["1275", "Beginn des gotischen Neubaus"], ["1859–1869", "Vollendung der beiden Türme"], ["2006", "UNESCO-Welterbe „Regensburg mit Stadtamhof“"]].forEach(([v, l]) => { const c = el("div", "dfact rv"); c.innerHTML = `<div class="dfact__v">${v}</div><p class="dfact__l">${l}</p>`; f.append(c); });
  w.append(f); s.append(w); reveal(s);
}
function buildFrames() {
  const s = $("#zeitreise"); const intro = el("div", "dwrap dkf__intro"); intro.append(head("ZEITREISE", "Vom romanischen Dom bis zur Vollendung", "Scrollen Sie durch die Bauzeit — Bild für Bild."));
  const track = el("div", "dkf__track"); track.style.height = `calc(${FRAMES.length} * 82svh + 100svh)`;
  const sticky = el("div", "dkf__sticky"); const st = el("div", "stage dkf__stage"); const layers = FRAMES.map((f, i) => { const l = el("div", "stage__layer"); const im = mkImg(f.i, f.t); im.loading = i < 2 ? "eager" : "lazy"; im.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover"; l.append(im); st.append(l); return l; });
  st.append(tag());
  const cap = el("div", "dkf__cap"); const ci = el("div", "dkf__cap-in"); cap.append(ci);
  const count = el("div", "dkf__count"); const rail = el("div", "dkf__rail"); FRAMES.forEach(() => rail.append(el("i")));
  sticky.append(st, cap, count, rail); track.append(sticky); s.append(intro, track); reveal(s);
  let cur = -1;
  function show(i) {
    if (i === cur) return; const first = cur < 0; cur = i; const f = FRAMES[i];
    layers.forEach((l, k) => { l.classList.toggle("is-on", k === i); if (Math.abs(k - i) <= 1) { const im = l.firstChild; if (im.loading === "lazy") im.loading = "eager"; } });
    [...rail.children].forEach((d, k) => d.classList.toggle("is-on", k === i)); count.textContent = `${String(i + 1).padStart(2, "0")} / ${String(FRAMES.length).padStart(2, "0")}`;
    const set = () => { ci.innerHTML = `<div class="dkf__date">${f.d}</div><h3 class="dkf__title">${f.t}</h3><p class="dkf__text">${f.p}</p>`; ci.classList.remove("is-out"); };
    if (first) set(); else { ci.classList.add("is-out"); setTimeout(set, 220); }
  }
  show(0);
  const upd = () => { const r = track.getBoundingClientRect(); const tot = track.offsetHeight - innerHeight; const p = clamp(-r.top / tot, 0, 0.9999); show(Math.floor(p * FRAMES.length)); };
  addEventListener("scroll", () => requestAnimationFrame(upd), { passive: true }); addEventListener("resize", upd); upd();
}
function buildBau() {
  const s = $("#bauabfolge"); const w = el("div", "dwrap");
  w.append(head("BAUABFOLGE", "Von Osten nach Westen", "Der gotische Dom wuchs nicht in einem Zug, sondern Abschnitt für Abschnitt — vom Chor im Osten bis zu den Türmen im Westen."));
  const g = el("div", "dgauge"); g.innerHTML = `<div class="dgauge__lab"><span>OST</span><span>WEST</span></div><div class="dgauge__bar"><span></span></div>`; w.append(g);
  const steps = BAU.map((b, i) => { const d = el("article", "dstep"); const st = stage("rv"); const v = mkVideo(b.v); st.append(v, tag()); const tx = el("div", "rv"); tx.innerHTML = `<div class="dstep__n">${String(i + 1).padStart(2, "0")}</div><div class="dstep__d">${b.y}</div><h3 class="dstep__t">${b.t}</h3><p class="dstep__p">${b.p}</p>`; d.append(st, tx); w.append(d); return d; });
  s.append(w); reveal(s);
  const bar = $(".dgauge__bar span", s); const sio = new IntersectionObserver((es) => { let bi = -1, br = 0; es.forEach((e) => { const i = steps.indexOf(e.target); if (e.isIntersecting && e.intersectionRatio >= br) { br = e.intersectionRatio; bi = i; } }); if (bi >= 0) bar.style.width = `${((bi + 1) / steps.length) * 100}%`; }, { threshold: [.2, .5, .8], rootMargin: "-30% 0px -30% 0px" });
  steps.forEach((d) => sio.observe(d)); bar.style.width = "0%";
}
function buildTabs(sel, hd, DATA) {
  const s = $(sel); const w = el("div", "dwrap"); w.append(hd);
  const tabs = el("div", "dtabs rv"); tabs.setAttribute("role", "tablist");
  const body = el("div", "darch__body"); const stages = el("div", "darch__stages"); const txt = el("div"); body.append(stages, txt);
  let vids = [];
  function pick(i) {
    [...tabs.children].forEach((b, k) => b.setAttribute("aria-selected", String(k === i)));
    vids.forEach((v) => VM.remove(v)); vids = []; stages.replaceChildren(); const c = DATA[i];
    (c.m || c.v.map((n) => ({ v: n }))).forEach((m) => { const st = stage(); if (m.v) { const v = mkVideo(m.v); vids.push(v); st.append(v, tag()); VM.io.unobserve(v); VM.io.observe(v); } else { const im = mkImg(m.s, c.t); st.append(im, tag()); } stages.append(st); });
    txt.innerHTML = `<h3 class="darch__t">${c.t}</h3><p class="darch__p">${c.p}</p>`; VM.tick();
  }
  DATA.forEach((c, i) => { const b = el("button", "", { type: "button", role: "tab" }); b.textContent = c.l; b.addEventListener("click", () => pick(i)); tabs.append(b); });
  w.append(tabs, body); s.append(w); pick(0); reveal(s);
}
const buildArch = () => buildTabs("#architektur", head("ARCHITEKTUR", "Wie der Dom steht", "Vier Blicke auf die Struktur der Kathedrale."), ARCH);
const buildGlas = () => buildTabs("#glas", head("GLAS & MATERIAL", "Licht, Glas und Stein", "Woraus der Dom gemacht ist — und wie das Licht in den Raum kommt."), GLAS);
function buildScrub() {
  const s = $("#rundum"); const intro = el("div", "dwrap dscrub__intro"); intro.append(head("RUND UM DEN DOM", "Einmal um die Kathedrale", "Von der Westfassade über Süd, Ost und Nord bis in die Höhe — und hinab unter den Dom."));
  const track = el("div", "dscrub__track"); track.style.height = "620svh";
  const sticky = el("div", "dscrub__sticky"); const st = el("div", "stage dscrub__stage stage--contain");
  const v = el("video"); v.muted = true; v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.preload = "auto"; v.poster = poster("master"); v.dataset.src = vid("master"); v.setAttribute("aria-hidden", "true"); st.append(v, tag());
  const comp = el("div", "dscrub__compass"); MARKS.forEach((m) => { const b = el("b"); b.textContent = m.k; comp.append(b); });
  const mk = el("div", "dscrub__mark"); const mi = el("div", "dscrub__mark-in"); mk.append(mi);
  const play = el("button", "dbtn dscrub__play", { type: "button" }); play.textContent = "ABSPIELEN";
  sticky.append(st, mk, comp, play); track.append(sticky); s.append(intro, track); reveal(s);
  VM.list.set(v, { ratio: 0, near: false, role: "scrub" }); VM.io.observe(v);
  let dur = 0, target = 0, cur = 0, mi_ = -1, ready = false, raf = 0, fallback = false;
  const mark = (t) => { let k = 0; MARKS.forEach((m, i) => { if (t >= m.t) k = i; }); if (k === mi_) return; mi_ = k; const m = MARKS[k]; [...comp.children].forEach((b, i) => b.classList.toggle("is-on", i === k)); mi.classList.add("is-out"); setTimeout(() => { mi.innerHTML = `<div class="dscrub__dir">${m.k}</div><h3 class="dscrub__mt">${m.h}</h3><p class="dscrub__mp">${m.p}</p>`; mi.classList.remove("is-out"); }, 180); };
  mark(0);
  const setFallback = () => { fallback = true; s.classList.add("is-fallback"); v.controls = false; v.loop = true; };
  v.addEventListener("loadedmetadata", () => { dur = v.duration; ready = isFinite(dur) && dur > 1; if (!ready) setFallback(); }, { once: true });
  v.addEventListener("error", setFallback);
  play.addEventListener("click", () => { VM.pause = false; const p = v.play(); if (p && p.catch) p.catch(() => {}); play.style.display = "none"; });
  const loop = () => { raf = 0; if (!ready || fallback) return; cur += (target - cur) * 0.16; if (Math.abs(target - cur) < 0.01) cur = target; if (Math.abs(v.currentTime - cur) > 0.03) { try { v.currentTime = cur; } catch (e) {} } mark(cur); if (cur !== target) raf = requestAnimationFrame(loop); };
  const upd = () => { const r = track.getBoundingClientRect(); const tot = track.offsetHeight - innerHeight; const p = clamp(-r.top / tot, 0, 1); if (ready) { target = p * (dur - 0.05); if (!raf) raf = requestAnimationFrame(loop); } else mark(p * 43); };
  const near = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && !v.getAttribute("src")) { v.src = v.dataset.src; v.load(); } }), { rootMargin: "120% 0px" }); near.observe(track);
  if (reduced) { setFallback(); }
  addEventListener("scroll", () => requestAnimationFrame(upd), { passive: true }); addEventListener("resize", upd); upd();
}
function buildUnder() {
  const s = $("#unten"); const w = el("div", "dwrap");
  w.append(head("UNTER DEM DOM", "Schichten unter dem Dom", "Unter dem heutigen Dom liegen Schichten früherer Zeiten: Spuren, Fundamente und archäologische Ebenen. Die Bilder visualisieren diesen Blick in die Tiefe."));
  const g = el("div", "dunder__grid"); const a = stage("rv"); const v = mkVideo("under_descent"); a.append(v, tag());
  const b = el("div", "dunder__stills rv"); const bs = stage(); const names = ["under_a", "under_b", "under_hall"]; const ls = names.map((n, i) => { const l = el("div", "stage__layer" + (i === 0 ? " is-on" : "")); const im = mkImg(n, "Blick unter den Dom"); im.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover"; l.append(im); bs.append(l); return l; }); bs.append(tag()); b.append(bs);
  g.append(a, b); w.append(g); s.append(w); reveal(s);
  let k = 0; if (!reduced) setInterval(() => { if (document.hidden) return; ls[k].classList.remove("is-on"); k = (k + 1) % ls.length; ls[k].classList.add("is-on"); }, 4200);
}
function buildPeople() {
  const s = $("#menschen"); const w = el("div", "dwrap");
  w.append(head("DOMBAUHÜTTE", "Die Menschen hinter dem Dom", "Ein Dom entsteht nicht von selbst. Steinmetze, Handwerker und die Dombauhütte gaben ihm über Generationen Form. Die Dombauhütte arbeitet bis heute ausschließlich in Naturstein; 2023 feierte sie 100 Jahre ununterbrochene Arbeit."));
  const g = el("div", "dpeople__grid"); const st = stage("rv"); const info = el("div", "dcard rv"); const list = el("div"); info.append(list);
  const chips = el("div", "dchips"); ["STEINMETZE", "BAUHÜTTE", "ZIMMERLEUTE", "HANDWERK", "WERKZEUGE"].forEach((c) => { const x = el("span", "dchip"); x.textContent = c; chips.append(x); });
  g.append(st, info); w.append(g, chips); s.append(w); reveal(s);
  let i = 0, v = null; function show(k) { i = k; if (v) VM.remove(v); st.replaceChildren(); v = mkVideo(PEOPLE[k].v, { ended: () => show((i + 1) % PEOPLE.length) }); st.append(v, tag()); VM.io.unobserve(v); VM.io.observe(v); list.innerHTML = `<h3 class="dcard__t">${PEOPLE[k].t}</h3><p class="dcard__p">${PEOPLE[k].p}</p>`; const row = el("div", "dtabs"); PEOPLE.forEach((p, j) => { const b = el("button", "", { type: "button", "aria-selected": String(j === k) }); b.textContent = p.l; b.addEventListener("click", () => show(j)); row.append(b); }); list.append(row); VM.tick(); }
  show(0);
}
function buildTimeline() {
  const s = $("#zeitleiste"); const w = el("div", "dwrap");
  w.append(head("ZEITLEISTE", "Fast 600 Jahre Baugeschichte", "Der Film führt durch die Bauzeit des Doms. Wählen Sie ein Datum, um direkt dorthin zu springen."));
  const g = el("div", "dtlv rv"); const col = el("div", "dtlv__media"); const st = stage("dtlv__stage");
  const v = el("video"); v.dataset.src = vid("timeline"); v.poster = poster("timeline"); v.setAttribute("aria-label", "Film: Zeitleiste des Doms"); VM.add(v, { loop: false, role: "timeline" });
  const rec = VM.list.get(v); rec.hold = false;
  const bar = el("div", "dtlv__bar"); bar.innerHTML = "<span></span>"; st.append(v, bar, tag());
  const ctl = el("div", "dtlv__ctl"); const bp = el("button", "dbtn", { type: "button" }); const bm = el("button", "dbtn", { type: "button", "aria-pressed": "false" }); const bt = el("button", "dbtn", { type: "button", "data-trailer": "" }); bt.textContent = "▶ TRAILER";
  bm.textContent = "TON AN"; ctl.append(bp, bm, bt); col.append(st, ctl);
  const side = el("div", "dtlv__side"); const chips = el("div", "dtlv__chips"); chips.setAttribute("role", "list"); const info = el("div", "dtlv__info"); info.setAttribute("aria-live", "polite"); side.append(chips, info);
  g.append(col, side); w.append(g); s.append(w); reveal(s);
  let cur = -1;
  const setCh = (k) => { if (k === cur) return; cur = k; [...chips.children].forEach((b, i) => { b.classList.toggle("is-on", i === k); b.setAttribute("aria-current", String(i === k)); }); const c = TLV[k]; info.innerHTML = `<div class="dtlv__y">${c.y}</div><h3 class="dtlv__h">${c.h}</h3><p class="dtlv__p">${c.p}</p>`; const on = chips.children[k]; if (on && chips.scrollWidth > chips.clientWidth) chips.scrollTo({ left: on.offsetLeft - 18, behavior: reduced ? "auto" : "smooth" }); };
  const lab = () => { bp.textContent = v.paused ? "ABSPIELEN" : "PAUSE"; };
  TLV.forEach((c, i) => { const b = el("button", "dtlv__chip", { type: "button", role: "listitem" }); b.innerHTML = `<b>${c.y}</b><span>${c.h}</span>`; b.addEventListener("click", () => { VM.load(v); const go = () => { try { v.currentTime = c.t + 0.05; } catch (e) {} setCh(i); rec.hold = false; VM.tick(); if (reduced) lab(); }; if (v.readyState >= 1) go(); else v.addEventListener("loadedmetadata", go, { once: true }); }); chips.append(b); });
  v.addEventListener("timeupdate", () => { const t = v.currentTime; let k = 0; TLV.forEach((c, i) => { if (t >= c.t) k = i; }); setCh(k); if (v.duration) bar.firstChild.style.transform = `scaleX(${t / v.duration})`; });
  v.addEventListener("play", lab); v.addEventListener("pause", lab); v.addEventListener("ended", () => { rec.hold = true; lab(); });
  bp.addEventListener("click", () => { if (v.paused) { rec.hold = false; VM.load(v); if (v.ended) v.currentTime = 0; const p = v.play(); if (p && p.catch) p.catch(() => {}); } else { rec.hold = true; v.pause(); } });
  bm.addEventListener("click", () => { v.muted = !v.muted; bm.textContent = v.muted ? "TON AN" : "TON AUS"; bm.setAttribute("aria-pressed", String(!v.muted)); });
  st.addEventListener("click", (e) => { if (e.target === v) bp.click(); });
  setCh(0); lab();
}
function buildRoute() {
  const s = $("#rundgang"); const w = el("div", "dwrap"); w.append(head("RUNDGANG", "Den Dom erkunden", "Wählen Sie einen Ort — von der Westfassade bis unter den Dom."));
  const tabs = el("div", "dtabs rv"); tabs.setAttribute("role", "tablist"); const body = el("div", "droute__body"); const st = stage("droute__stage"); const cap = el("div", "droute__cap"); body.append(st, cap);
  let v = null, timer = 0;
  function pick(i) {
    [...tabs.children].forEach((b, k) => b.setAttribute("aria-selected", String(k === i))); const r = ROUTE[i]; if (v) { VM.remove(v); v = null; } clearInterval(timer); st.replaceChildren();
    if (r.m.v) { v = mkVideo(r.m.v); st.append(v); VM.io.unobserve(v); VM.io.observe(v); }
    else { const ls = r.m.s.map((n, k) => { const l = el("div", "stage__layer" + (k === 0 ? " is-on" : "")); const im = mkImg(n, r.t); im.loading = "eager"; im.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover"; l.append(im); st.append(l); return l; }); if (ls.length > 1 && !reduced) { let k = 0; timer = setInterval(() => { ls[k].classList.remove("is-on"); k = (k + 1) % ls.length; ls[k].classList.add("is-on"); }, 3600); } }
    st.append(tag()); cap.innerHTML = `<div class="deyebrow">${String(i + 1).padStart(2, "0")} · ${r.l.toUpperCase()}</div><h3 class="droute__ct">${r.t}</h3><p class="droute__cp">${r.p}</p>`; VM.tick();
  }
  ROUTE.forEach((r, i) => { const b = el("button", "", { type: "button", role: "tab" }); b.textContent = r.l; b.addEventListener("click", () => pick(i)); tabs.append(b); });
  w.append(tabs, body); s.append(w); pick(0); reveal(s);
}
function buildNow() {
  const s = $("#heute"); const w = el("div", "dwrap dnow__grid"); const st = stage("rv"); st.append(mkImg("heute", "Der Dom heute"), tag()); const tx = el("div"); tx.innerHTML = `<p class="deyebrow rv">HEUTE</p><h2 class="dh rv">Der Dom heute</h2><p class="dlead rv">Seit 2006 gehört der Dom zum UNESCO-Welterbe „Regensburg mit Stadtamhof“. Die Dombauhütte arbeitet bis heute ausschließlich in Naturstein; 2023 feierte sie 100 Jahre ununterbrochene Arbeit.</p>`;
  w.append(st, tx); s.append(w); reveal(s);
}
function buildEnd() {
  const s = $("#ende"); s.innerHTML = `<div class="dend__brand rv">ZEITSPRUNG</div><h2 class="dend__t rv">Ein Sprung durch die Zeit</h2><p class="dend__p rv">Der Dom ist ein Ort, an dem sich Jahrhunderte übereinanderlegen. Entdecken Sie weitere Orte Regensburgs.</p><div class="dend__cta rv"><a class="dbtn dbtn--primary" href="../index.html">ZUR ÜBERSICHT</a><a class="dbtn" href="../STEINERNE_BRUECKE/index.html">STEINERNE BRÜCKE</a></div><p class="dend__note">Die Bilder und Videos dieser Seite sind Visualisierungen auf Grundlage des historischen Forschungsstands und ersetzen keine dokumentarische Fotografie.</p>`; reveal(s);
}
function buildNav() {
  const n = $("#dnLinks"); NAV.forEach(([id, l]) => { const a = el("a"); a.href = `#${id}`; a.textContent = l; n.append(a); });
  const hd = $("#dn"), pr = $("#dProg span"); const secs = NAV.map(([id]) => document.getElementById(id));
  const upd = () => { hd.classList.toggle("is-solid", scrollY > 40); const t = document.documentElement.scrollHeight - innerHeight; pr.style.transform = `scaleX(${t > 0 ? clamp(scrollY / t, 0, 1) : 0})`; let cur = -1; secs.forEach((sc, i) => { const r = sc.getBoundingClientRect(); if (r.top < innerHeight * 0.4) cur = i; }); [...n.children].forEach((a, i) => a.setAttribute("aria-current", String(i === cur))); };
  addEventListener("scroll", () => requestAnimationFrame(upd), { passive: true }); upd();
}
/* ---------- Brückmandl: contextual ZEITSPRUNG guide (Dom content only; canonical character assets reused) ---------- */
const GUIDE = [
  ["Baugeschichte", "intro", "Nach dem Brand von 1273 beginnt um 1275 der gotische Neubau — im Osten. Von dort wächst der Dom Joch um Joch nach Westen. Um 1520 ruhen die Arbeiten; erst 1859 bis 1869 werden die Türme vollendet."],
  ["Zeitleiste", "zeitleiste", "Die Zeitleiste zeigt die Bauzeit als Film. Wählen Sie dort ein Datum, um direkt zu diesem Moment zu springen."],
  ["Ost → West", "bauabfolge", "Der gotische Dom wuchs nicht in einem Zug, sondern Abschnitt für Abschnitt — vom Chor im Osten bis zu den Türmen im Westen."],
  ["Westfassade", "bauabfolge", "Die Westfassade wächst ab etwa 1325 über rund 200 Jahre „von rechts unten nach links oben“."],
  ["Türme", "bauabfolge", "Um 1520/25 enden beide Türme in Höhe des Glockengeschosses unter Pyramidendächern. 1859 bis 1869 entstehen die achteckigen Obergeschosse und die neugotischen Helme von rund 105 Metern."],
  ["Glasmalerei", "glas", "Mit dem hochgotischen Chor öffnen sich die Wände dem Licht. Um 1310/15 folgt die erste große Verglasung mit Glasmalerei."],
  ["Materialien", "glas", "Der Dom ist aus Naturstein errichtet. Die Dombauhütte arbeitet bis heute ausschließlich in Naturstein."],
  ["Dombauhütte", "menschen", "1923/24 wird die Dombauhütte als staatliche Werkstatt wieder eingerichtet und arbeitet seither ohne Unterbrechung. 2023 feierte sie 100 Jahre ununterbrochene Arbeit."],
  ["Unter dem Dom", "unten", "Unter dem heutigen Dom liegen Schichten früherer Zeiten: Spuren, Fundamente und archäologische Ebenen. Die Bilder dort sind Visualisierungen."],
  ["Heute", "heute", "Seit 2006 gehört der Dom zum UNESCO-Welterbe „Regensburg mit Stadtamhof“."]
];
function buildGuide() {
  const fab = $("#guideFab"), pn = $("#guidePanel"); if (!fab || !pn) return;
  const B = "../assets/steinerne-bruecke/bruckmandl/ai/bruckmandl_ai_";
  pn.innerHTML = `<div class="dguide__head"><img class="dguide__av" src="${B}talk.webp" alt="" width="64" height="64" loading="lazy"><div><div class="dguide__name">BRÜCKMANDL</div><div class="dguide__role">Ihr ZEITSPRUNG-Begleiter</div></div><button class="dguide__close" type="button" aria-label="Schließen">×</button></div><p class="dguide__hi">Grüß Gott! Sonst wache ich auf der Steinernen Brücke — hier begleite ich Sie durch den Dom. Wählen Sie ein Thema.</p><div class="dguide__topics"></div><div class="dguide__ans" aria-live="polite"></div>`;
  const topics = $(".dguide__topics", pn), ans = $(".dguide__ans", pn), av = $(".dguide__av", pn);
  GUIDE.forEach(([l, id, tx], i) => { const b = el("button", "dguide__topic", { type: "button", "aria-pressed": "false" }); b.textContent = l; b.addEventListener("click", () => { [...topics.children].forEach((x, k) => x.setAttribute("aria-pressed", String(k === i))); av.src = `${B}expression_03_explain.webp`; ans.innerHTML = `<p>${tx}</p><a class="dguide__go" href="#${id}">Zum Kapitel →</a>`; }); topics.append(b); });
  const onKey = (e) => { if (e.key === "Escape") close(); };
  function open() { pn.hidden = false; fab.setAttribute("aria-expanded", "true"); document.addEventListener("keydown", onKey); requestAnimationFrame(() => pn.classList.add("is-open")); $(".dguide__close", pn).focus(); }
  function close(refocus = true) { if (pn.hidden) return; pn.classList.remove("is-open"); pn.hidden = true; fab.setAttribute("aria-expanded", "false"); document.removeEventListener("keydown", onKey); if (refocus) fab.focus(); }
  fab.addEventListener("click", () => (pn.hidden ? open() : close()));
  $(".dguide__close", pn).addEventListener("click", () => close());
  ans.addEventListener("click", (e) => { if (e.target.closest(".dguide__go")) close(false); });
}
buildHero(); buildIntro(); buildFrames(); buildTimeline(); buildBau(); buildGlas(); buildPeople(); buildArch(); buildScrub(); buildUnder(); buildRoute(); buildNow(); buildEnd(); buildNav(); buildGuide();
