/* ZEITSPRUNG V2 — STEINERNE_BRUECKE/js/craft-gallery.js
   ============================================================================
   MUSEUM PHOTO GALLERY — "Die Menschen hinter der Brücke".
   2026-11-11 (rev. 2): presentation rebuilt as a DOWN-SCROLL story — one
   sticky 9:16 image stage, scrolling advances 15 steps in 7 chapters; text,
   chapter and reference change with the image. Content, images, captions and
   references are unchanged from rev. 1.

   CONTENT — captions marked src:true are copied from the already-approved
   DE/EN/ES copy in 03_ASSETS/Steinerne_Bruecke/2d/MUSEUM_CONTENT_MAP.json
   (principal source: "Die Steinerne Brücke – 2010 bis 2018"); src:false =
   generic craft label without a historical claim.
   IMAGES — owner-supplied reconstructions (not documentary photographs),
   labelled as such. Runtime derivatives only (assets/steinerne-bruecke/craft/).

   ADDITIVE — lives in #craftGallery directly after #museum25d. It does not
   touch Group B, the K-frames, the timeline, the route or the Bruckmandl.

   LIFECYCLE — DOM built once; refreshLabels() only rewrites text. Pinning is
   plain CSS `position: sticky` (no ScrollTrigger pin, no pin-spacer, fixed
   track height -> no layout shift for the ScrollTriggers main.js creates
   afterwards). Progress is read from getBoundingClientRect() in ONE passive
   scroll listener + ONE resize listener (rAF-throttled), added once.
   No observers, no timers.
   ============================================================================ */
import { openPhoto } from "../../js/zs-media-viewer.js";

const BASE = new URL("../../assets/steinerne-bruecke/craft/", import.meta.url).href;
const CHAPTERS = [
 {
  "id": "material",
  "title": {
   "de": "MATERIAL IM DETAIL",
   "en": "MATERIAL IN DETAIL",
   "es": "EL MATERIAL EN DETALLE"
  }
 },
 {
  "id": "who",
  "title": {
   "de": "WER BAUTE DIE BRÜCKE?",
   "en": "WHO BUILT THE BRIDGE?",
   "es": "¿QUIÉN CONSTRUYÓ EL PUENTE?"
  }
 },
 {
  "id": "masons",
  "title": {
   "de": "STEINMETZE",
   "en": "STONEMASONS",
   "es": "CANTEROS"
  }
 },
 {
  "id": "carpenters",
  "title": {
   "de": "ZIMMERLEUTE",
   "en": "CARPENTERS",
   "es": "CARPINTEROS"
  }
 },
 {
  "id": "tools",
  "title": {
   "de": "WERKZEUG",
   "en": "TOOLS",
   "es": "HERRAMIENTAS"
  }
 },
 {
  "id": "piers",
  "title": {
   "de": "GRÜNDUNG & PFEILER",
   "en": "FOUNDATION & PIERS",
   "es": "CIMENTACIÓN Y PILARES"
  }
 },
 {
  "id": "arches",
  "title": {
   "de": "BÖGEN & LEHRGERÜST",
   "en": "ARCHES & CENTERING",
   "es": "ARCOS Y CIMBRA"
  }
 }
];
const STEPS = [
 {
  "ch": 0,
  "slug": "gruensandstein",
  "title": {
   "de": "Grünsandstein",
   "en": "Green sandstone",
   "es": "Arenisca verde"
  },
  "text": {
   "de": "Der Regensburger Grünsandstein ist das dominierende Baumaterial der Bögen, Pfeilerschalen und Schildwände.",
   "en": "Regensburg green sandstone is the dominant building material of the arches, pier shells and spandrel walls.",
   "es": "La arenisca verde de Regensburg es el material constructivo dominante en los arcos, las envolturas de los pilares y los muros laterales."
  },
  "src": true
 },
 {
  "ch": 0,
  "slug": "kalkstein",
  "title": {
   "de": "Kalkstein",
   "en": "Limestone",
   "es": "Piedra caliza"
  },
  "text": {
   "de": "Heller Kalkstein, teils aus Zweitverwendung römischer Quader, findet sich vor allem in den Pfeilersockeln.",
   "en": "Pale limestone, in some cases reused Roman ashlar, occurs mainly in the pier plinths.",
   "es": "La piedra caliza clara, en parte procedente de sillares romanos reutilizados, aparece sobre todo en los zócalos de los pilares."
  },
  "src": true
 },
 {
  "ch": 0,
  "slug": "schale_kern",
  "title": {
   "de": "Schale und Kern",
   "en": "Shell and core",
   "es": "Envoltura y núcleo"
  },
  "text": {
   "de": "Jeder Pfeiler besitzt eine Werksteinschale aus Grünsandstein-Quadern mit einem vermörtelten Bruchstein-Kern.",
   "en": "Each pier has an outer shell of dressed green-sandstone ashlar around a mortared rubble-stone core.",
   "es": "Cada pilar tiene una envoltura de sillares de arenisca verde con un núcleo interior de mampostería de relleno unida con mortero de cal."
  },
  "src": true
 },
 {
  "ch": 0,
  "slug": "fuellmauerwerk",
  "title": {
   "de": "Füllmauerwerk",
   "en": "Rubble fill",
   "es": "Relleno de mampostería"
  },
  "text": {
   "de": "Das Innere von Pfeilern und Bögen besteht aus Bruchstein, der lagenweise mit Kalkmörtel vergossen wurde.",
   "en": "The interior of the piers and arches consists of rubble stone cast in layers with lime mortar.",
   "es": "El interior de pilares y arcos está formado por piedra de cascote vertida en capas con mortero de cal."
  },
  "src": true
 },
 {
  "ch": 0,
  "slug": "eisenklammer",
  "title": {
   "de": "Eisenklammern",
   "en": "Iron cramps",
   "es": "Grapas de hierro"
  },
  "text": {
   "de": "Werksteinquader wurden untereinander mit eingebleiten Eisenklammern verbunden, um den Verbund zu sichern.",
   "en": "Dressed stone blocks were tied together with lead-anchored iron cramps to secure the bond between them.",
   "es": "Los sillares se unían entre sí mediante grapas de hierro ancladas en plomo para asegurar su trabazón."
  },
  "src": true
 },
 {
  "ch": 1,
  "slug": "baumeister",
  "title": {
   "de": "Baumeister",
   "en": "Master builder",
   "es": "Maestro de obras"
  },
  "text": {
   "de": "Planung und Leitung der Baustelle. Ein Name des Baumeisters ist in den hier verwendeten Quellen nicht belegt.",
   "en": "Planning and direction of the building site. No name of the master builder is recorded in the sources used here.",
   "es": "Planificación y dirección de la obra. En las fuentes aquí utilizadas no consta ningún nombre del maestro de obras."
  },
  "src": false
 },
 {
  "ch": 2,
  "slug": "steinmetze",
  "title": {
   "de": "Steinmetze",
   "en": "Stonemasons",
   "es": "Canteros"
  },
  "text": {
   "de": "Jeder Bogen besteht aus außen sichtbaren Schildbögen aus hohen Werksteinen und dazwischenliegenden, etwas schwächeren Gewölbequadern.",
   "en": "Each arch consists of visible outer 'shield arches' of tall dressed stones with somewhat lighter vault stones between them.",
   "es": "Cada arco se compone de 'arcos de escudo' visibles hechos de sillares altos, con dovelas algo más ligeras entre ellos formando la bóveda."
  },
  "src": true
 },
 {
  "ch": 2,
  "slug": "steinwerkzeug",
  "title": {
   "de": "Steinwerkzeug",
   "en": "Stone tools",
   "es": "Herramientas de cantería"
  },
  "text": {
   "de": "Werkzeug für die Bearbeitung der Werksteine.",
   "en": "Tools for dressing the stone blocks.",
   "es": "Herramientas para labrar los sillares."
  },
  "src": false
 },
 {
  "ch": 3,
  "slug": "zimmerleute",
  "title": {
   "de": "Zimmerleute",
   "en": "Carpenters",
   "es": "Carpinteros"
  },
  "text": {
   "de": "Archäologisch gut belegt: hölzerne Lehrgerüste, Kräne und die Hebeklammer 'Wolf' beim Versetzen der Werksteine.",
   "en": "Well documented archaeologically: wooden centering, cranes and the 'Wolf' lifting clamp used to move the dressed stones into place.",
   "es": "Bien documentado arqueológicamente: cimbras de madera, grúas y la grapa de izado 'lobo' para colocar los sillares."
  },
  "src": true
 },
 {
  "ch": 3,
  "slug": "zimmermannswerkzeug",
  "title": {
   "de": "Zimmermannswerkzeug",
   "en": "Carpentry tools",
   "es": "Herramientas de carpintería"
  },
  "text": {
   "de": "Werkzeug für Lehrgerüste und Gerüste aus Holz.",
   "en": "Tools for timber centering and scaffolding.",
   "es": "Herramientas para cimbras y andamios de madera."
  },
  "src": false
 },
 {
  "ch": 4,
  "slug": "wolf",
  "title": {
   "de": "Der „Wolf“",
   "en": "The “Wolf”",
   "es": "El «lobo»"
  },
  "text": {
   "de": "Die einzelnen Werksteine wurden vermutlich mit einem 'Wolf' (einer zangenartigen Hebeklammer, wie sie schon aus römischer Zeit bekannt ist) versetzt.",
   "en": "The individual dressed stones were most likely lifted using a 'Wolf' — a tongs-like lifting clamp already known from Roman times — and matching 'wolf holes' survive on several stones.",
   "es": "Los sillares individuales se izaban probablemente mediante un 'lobo' (una grapa de izado en forma de tenaza, ya conocida en época romana)."
  },
  "src": true
 },
 {
  "ch": 5,
  "slug": "gruendung",
  "title": {
   "de": "Gründung auf Donaukies",
   "en": "Founded on Danube gravel",
   "es": "Cimentación sobre grava del Danubio"
  },
  "text": {
   "de": "Nach den Bohrbefunden der Sanierung 2010–2018 gründen die Pfeiler direkt auf dem Donaukies — es wurde kein durchgängiges Pfahlwerk unter den mittelalterlichen Pfeilern gefunden.",
   "en": "According to the core-drilling surveys carried out during the 2010–2018 restoration, the piers are founded directly on the Danube gravel — no continuous timber pile foundation was found beneath the medieval piers.",
   "es": "Según las perforaciones de estudio realizadas durante la restauración de 2010-2018, los pilares se apoyan directamente sobre la grava del Danubio — no se halló un entramado continuo de pilotes bajo los pilares medievales."
  },
  "src": true
 },
 {
  "ch": 5,
  "slug": "beschlaechte",
  "title": {
   "de": "Beschlächte",
   "en": "Beschlächte",
   "es": "Beschlächte"
  },
  "text": {
   "de": "Insel­förmige Vorbauten aus Holzpfählen, Steinpaketen und Astgeflecht schützten die Pfeiler vor Unterspülung.",
   "en": "Island-shaped cutwater structures of timber piles, stone packing and wattle protected the piers against scouring.",
   "es": "Estructuras protectoras en forma de isla, hechas de pilotes de madera, paquetes de piedra y entramado de ramas, protegían los pilares contra la socavación."
  },
  "src": true
 },
 {
  "ch": 6,
  "slug": "lehrgeruest_auflager",
  "title": {
   "de": "Auflager des Lehrgerüsts",
   "en": "Bearing of the centering",
   "es": "Apoyo de la cimbra"
  },
  "text": {
   "de": "Für die Wölbung war ein stabiles hölzernes Lehrgerüst ('Spantenkonstruktion') notwendig, dessen Auflagerspuren als schlitzartige Ausnehmungen im Pfeilermauerwerk noch heute nachweisbar sind.",
   "en": "Building the vault required a sturdy wooden centering framework ('Spantenkonstruktion'), whose bearing marks survive as slot-like recesses in the pier masonry today.",
   "es": "Construir la bóveda requería una cimbra de madera robusta ('construcción de cerchas'), cuyas huellas de apoyo aún se conservan como ranuras en la mampostería de los pilares."
  },
  "src": true
 },
 {
  "ch": 6,
  "slug": "lehrgeruest",
  "title": {
   "de": "Lehrgerüst",
   "en": "Centering",
   "es": "Cimbra"
  },
  "text": {
   "de": "16 Bögen aus Werksteinen wurden über hölzernen Lehrgerüsten gemauert und mit Kränen versetzt.",
   "en": "16 arches of dressed stone were built over wooden centering frames and set in place with cranes.",
   "es": "Los 16 arcos de sillería se construyeron sobre cimbras de madera y se colocaron con la ayuda de grúas."
  },
  "src": true
 }
];

export function initCraftGallery({ t, getLang }) {
  const host = document.getElementById("craftGroups");
  if (!host) return null;
  const mk = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };
  const n = STEPS.length;
  const track = mk("div", "craft__track"); track.style.height = "calc(" + n + " * 72svh + 100svh)";
  const sticky = mk("div", "craft__sticky");
  const stage = mk("button", "craft__stage"); stage.type = "button";
  const layers = STEPS.map((s, i) => { const img = mk("img", "craft__layer"); img.src = BASE + "sb_craft_" + s.slug + "_720.webp"; img.width = 720; img.height = 1290; img.decoding = "async"; img.loading = i < 2 ? "eager" : "lazy"; stage.appendChild(img); return img; });
  const cap = mk("div", "craft__cap"); const capIn = mk("div", "craft__cap-in");
  const chap = mk("p", "craft__cap-chapter"); const ti = mk("h4", "craft__cap-title"); const tx = mk("p", "craft__cap-text"); const rf = mk("p", "craft__cap-ref");
  capIn.appendChild(chap); capIn.appendChild(ti); capIn.appendChild(tx); capIn.appendChild(rf); cap.appendChild(capIn);
  const count = mk("div", "craft__count"); const rail = mk("div", "craft__rail"); rail.setAttribute("aria-hidden", "true");
  STEPS.forEach((s, i) => { const d = mk("i"); if (i === 0 || STEPS[i - 1].ch !== s.ch) d.className = "is-chapter"; rail.appendChild(d); });
  sticky.appendChild(stage); sticky.appendChild(cap); sticky.appendChild(count); sticky.appendChild(rail);
  track.appendChild(sticky); host.appendChild(track);
  const next = mk("a", "craft__next"); next.href = "#kframesGallery"; host.appendChild(next);

  let cur = -1, timer = 0;
  const pad = (x) => String(x).padStart(2, "0");
  const fill = () => {
    const l = getLang(), s = STEPS[cur], c = CHAPTERS[s.ch];
    chap.textContent = pad(s.ch + 1) + " · " + c.title[l];
    ti.textContent = s.title[l]; tx.textContent = s.text[l];
    rf.textContent = s.src ? t(l, "craftRecon") + " · " + t(l, "craftAfter") + " „Die Steinerne Brücke – 2010 bis 2018“" : t(l, "craftRecon");
    stage.setAttribute("aria-label", t(l, "craftEnlarge") + ": " + s.title[l]);
    count.textContent = pad(cur + 1) + " / " + pad(n);
  };
  function show(i) {
    if (i === cur) return; const first = cur < 0; cur = i;
    layers.forEach((img, k) => { img.classList.toggle("is-on", k === i); if (Math.abs(k - i) <= 1) img.loading = "eager"; });
    [...rail.children].forEach((d, k) => d.classList.toggle("is-on", k === i));
    if (first) { fill(); return; }
    capIn.classList.add("is-out"); clearTimeout(timer); timer = setTimeout(() => { fill(); capIn.classList.remove("is-out"); }, 200);
  }
  stage.addEventListener("click", () => { const img = layers[cur]; openPhoto({ src: img.src, alt: img.alt }); });
  let raf = 0;
  const measure = () => { raf = 0; const h = track.offsetHeight; if (!h) return; const r = track.getBoundingClientRect(); if (r.bottom < -innerHeight || r.top > innerHeight * 2) return; const tot = h - innerHeight; const p = Math.min(0.9999, Math.max(0, -r.top / tot)); show(Math.floor(p * n)); };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll);
  show(0);
  const refreshLabels = () => { const l = getLang(); layers.forEach((img, k) => { img.alt = STEPS[k].title[l] + " — " + t(l, "craftRecon"); }); next.textContent = t(l, "craftNext"); fill(); };
  refreshLabels();
  return { refreshLabels };
}
