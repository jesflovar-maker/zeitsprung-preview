/* ZEITSPRUNG V2 — STEINERNE_BRUECKE/js/craft-gallery.js
   ============================================================================
   MUSEUM PHOTO GALLERY — "Die Menschen hinter der Brücke" (2026-11-11).
   A small, self-contained, ADDITIVE module living in #craftGallery, directly
   after #museum25d (whose Material / Bau chapters it deepens). It does NOT
   touch Group B, the K-frames, the timeline, the route or the Bruckmandl.

   CONTENT — every caption marked src:true is copied verbatim (or as one whole
   sentence) from the already-approved DE/EN/ES copy in
   03_ASSETS/Steinerne_Bruecke/2d/MUSEUM_CONTENT_MAP.json (principal source:
   "Die Steinerne Brücke – 2010 bis 2018"). Captions with src:false are
   generic craft labels that make no historical claim.
   IMAGES — owner-supplied reconstructions (not documentary photographs);
   labelled as such. Runtime derivatives only (assets/steinerne-bruecke/craft/).

   LIFECYCLE — the DOM is built once; refreshLabels() only rewrites text.
   No scroll / resize listeners, no observers, no timers. Fixed 9:16 boxes
   keep the layout stable before images decode (no layout shift for the
   ScrollTriggers created afterwards by main.js).
   ============================================================================ */
import { openPhoto } from "../../js/zs-media-viewer.js";

const BASE = new URL("../../assets/steinerne-bruecke/craft/", import.meta.url).href;
const GROUPS = [
 {
  "id": "material",
  "title": {
   "de": "MATERIAL IM DETAIL",
   "en": "MATERIAL IN DETAIL",
   "es": "EL MATERIAL EN DETALLE"
  },
  "items": [
   {
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
   }
  ]
 },
 {
  "id": "people",
  "title": {
   "de": "WER BAUTE",
   "en": "WHO BUILT IT",
   "es": "QUIÉNES CONSTRUYERON"
  },
  "items": [
   {
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
   }
  ]
 },
 {
  "id": "tools",
  "title": {
   "de": "WERKZEUG",
   "en": "TOOLS",
   "es": "HERRAMIENTAS"
  },
  "items": [
   {
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
   }
  ]
 },
 {
  "id": "technique",
  "title": {
   "de": "BAUTECHNIK",
   "en": "CONSTRUCTION TECHNIQUE",
   "es": "TÉCNICA CONSTRUCTIVA"
  },
  "items": [
   {
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
  ]
 }
];

export function initCraftGallery({ t, getLang }) {
  const host = document.getElementById("craftGroups");
  if (!host) return null;
  const binds = [];
  const mk = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };
  GROUPS.forEach((g) => {
    const sec = mk("div", "craft__group craft__group--" + g.id);
    const h = mk("h4", "craft__group-title"); sec.appendChild(h); binds.push((l) => { h.textContent = g.title[l]; });
    const grid = mk("div", "craft__grid");
    g.items.forEach((it, i) => {
      const fig = mk("figure", "craft__item" + (i === 0 ? " craft__item--lead" : ""));
      const btn = mk("button", "craft__media"); btn.type = "button";
      const img = mk("img"); img.src = BASE + "sb_craft_" + it.slug + "_720.webp"; img.width = 720; img.height = 1290; img.loading = "lazy"; img.decoding = "async";
      btn.appendChild(img);
      btn.addEventListener("click", () => openPhoto({ src: img.src, alt: img.alt }));
      const cap = mk("figcaption", "craft__cap"); const ti = mk("span", "craft__cap-title"); const tx = mk("span", "craft__cap-text"); const rf = mk("span", "craft__cap-ref");
      cap.appendChild(ti); cap.appendChild(tx); cap.appendChild(rf);
      fig.appendChild(btn); fig.appendChild(cap); grid.appendChild(fig);
      binds.push((l) => {
        ti.textContent = it.title[l]; tx.textContent = it.text[l];
        rf.textContent = it.src ? t(l, "craftRecon") + " · " + t(l, "craftAfter") + " „Die Steinerne Brücke – 2010 bis 2018“" : t(l, "craftRecon");
        img.alt = it.title[l] + " — " + t(l, "craftRecon");
        btn.setAttribute("aria-label", t(l, "craftEnlarge") + ": " + it.title[l]);
      });
    });
    sec.appendChild(grid); host.appendChild(sec);
  });
  const refreshLabels = () => { const l = getLang(); binds.forEach((f) => f(l)); };
  refreshLabels();
  return { refreshLabels };
}
