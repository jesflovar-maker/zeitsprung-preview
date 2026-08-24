/* ZEITSPRUNG V2 — i18n.js
   Experimental prototype. DE / EN / ES dictionary.
   Independent from V1 — no shared code, only same DE/EN/ES philosophy. */

export const DICT = {
  de: {
    metaTitle: "ZEITSPRUNG — Steinerne Brücke",
    introEyebrow: "ZEITSPRUNG",
    introTitle: "STEINERNE BRÜCKE",
    introCity: "REGENSBURG",
    introRange: "1135 → HEUTE",
    introStart: "ERLEBNIS STARTEN",
    introSoundOn: "TON AN",
    introSoundOff: "TON AUS",
    introHint: "Bereit für eine Reise durch 890 Jahre Geschichte",
    preloaderLabel: "WIRD GELADEN",
    navRoute: "ROUTE",
    navTimeline: "ZEITLEISTE",
    nav3d: "3D",
    navHistory: "GESCHICHTE",
    scrollHint: "SCROLLEN, UM DURCH DIE ZEIT ZU REISEN",
    factBaubeginn: "BAUBEGINN",
    factFertigstellung: "FERTIGSTELLUNG",
    factBoegen: "BÖGEN",
    factBoegenNote: "validiert — 16 Originalbögen",
    factPfeilerLabel: "PFEILER",
    factPfeilerNote: "Anzahl nicht abschließend als historisches Faktum bestätigt*",
    factSourceNote: "* siehe ZEITSPRUNG Accuracy Rules — nur \"16 Bögen\" ist als Faktum validiert",
    states: [
      {
        year: "HEUTE",
        title: "Die Brücke heute",
        text: "Nach der Restaurierung 2010–2018 verbindet die Steinerne Brücke weiterhin die Altstadt mit Stadtamhof — über 300 Meter, 16 Bögen, fast 900 Jahre alt."
      },
      {
        year: "VOR 1135",
        title: "Vor dem Bau",
        text: "Vor der Steinbrücke überquerten eine hölzerne Behelfsbrücke und Fähren die Donau. Die Stadt bereitet den größten Bauauftrag ihrer Zeit vor."
      },
      {
        year: "1135",
        title: "Fundamentierung",
        text: "Die Pfeiler ruhen direkt auf dem tragfähigen Donaukies. Nur an schwächeren Stellen sichern Eichenroste den Untergrund; die Beschlächte schützen die Kanten mit Holzpfählen, Astgeflecht und Stein."
      },
      {
        year: "1136–1140",
        title: "Die Pfeiler wachsen",
        text: "Kalkstein und Grünsandstein werden auf Lastkähnen herangeschafft. Kalkmörtel — kein Zement — verbindet das Füllmauerwerk im Inneren der Pfeiler."
      },
      {
        year: "1140–1146",
        title: "Die Bögen entstehen",
        text: "Hölzerne Lehrgerüste tragen die Bogensteine, bis der Schlussstein jedes Bogens sitzt. Kräne, Seilwinden und Flaschenzüge heben die Steinquader in Position."
      },
      {
        year: "1146–1275",
        title: "Mittelalterliche Vollendung",
        text: "Die fertige Brücke trägt mehrere Türme; im Hintergrund erhebt sich noch der romanische Vorgängerbau des Doms — die gotischen Türme existieren noch nicht."
      },
      {
        year: "1859–1869",
        title: "Historische Verwandlung",
        text: "Während die Stadt sich verändert, wachsen die gotischen Domtürme empor — eingerüstet und im Bau, ein neuer Horizont für die alte Brücke."
      },
      {
        year: "2010–2018",
        title: "Restaurierung",
        text: "Gerüste, moderne Technik und sorgfältige Handwerkskunst sichern die Substanz der Brücke für kommende Generationen."
      },
      {
        year: "HEUTE",
        title: "Zurück in der Gegenwart",
        text: "Die Steinerne Brücke trägt heute Fußgänger und Radfahrer — ein fast 900 Jahre altes Bauwerk, mitten im Alltag von Regensburg."
      }
    ],
    videoChapterTitle: "Der Flug über die Brücke",
    videoChapterText: "Eine FPV-Aufnahme der Steinerne Brücke aus der Vogelperspektive.",
    videoUnavailable: "Video konnte in diesem Browser nicht geladen werden (möglicherweise HEVC-Codec-Einschränkung).",
    threeDTitle: "Interaktives 3D-Modell",
    threeDText: "Erkunden Sie die Konstruktion der Brücke in drei Dimensionen.",
    threeDLoading: "3D-Modell wird geladen…",
    threeDOrbit: "ORBIT",
    threeDReset: "RESET",
    threeDFront: "FRONT",
    threeD34: "3/4",
    threeDTop: "TOP",
    threeDStateNote: "Hinweis: Dieses Master-GLB liegt bereits in einem teil-explodierten Zustand vor (Dateiname: EXPLODED_MASTER).",
    continueTitle: "Reise fortsetzen",
    continueText: "Weitere Monumente von ZEITSPRUNG folgen in Kürze.",
    footerBack: "ZURÜCK ZUM ANFANG"
  },
  en: {
    metaTitle: "ZEITSPRUNG — Steinerne Brücke",
    introEyebrow: "ZEITSPRUNG",
    introTitle: "STEINERNE BRÜCKE",
    introCity: "REGENSBURG",
    introRange: "1135 → TODAY",
    introStart: "START EXPERIENCE",
    introSoundOn: "SOUND ON",
    introSoundOff: "SOUND OFF",
    introHint: "Ready for a journey through 890 years of history",
    preloaderLabel: "LOADING",
    navRoute: "ROUTE",
    navTimeline: "TIMELINE",
    nav3d: "3D",
    navHistory: "HISTORY",
    scrollHint: "SCROLL TO TRAVEL THROUGH TIME",
    factBaubeginn: "CONSTRUCTION BEGAN",
    factFertigstellung: "COMPLETED",
    factBoegen: "ARCHES",
    factBoegenNote: "validated — 16 original arches",
    factPfeilerLabel: "PIERS",
    factPfeilerNote: "count not conclusively confirmed as historical fact*",
    factSourceNote: "* see ZEITSPRUNG Accuracy Rules — only \"16 arches\" is validated as fact",
    states: [
      {
        year: "TODAY",
        title: "The bridge today",
        text: "After the 2010–2018 restoration, the Steinerne Brücke still connects the old town with Stadtamhof — over 300 meters long, 16 arches, almost 900 years old."
      },
      {
        year: "BEFORE 1135",
        title: "Before construction",
        text: "Before the stone bridge, a temporary wooden bridge and ferries crossed the Danube. The city prepares the largest construction project of its time."
      },
      {
        year: "1135",
        title: "Foundation",
        text: "The piers rest directly on the load-bearing Danube gravel. Only in weaker spots do oak-lattice rafts secure the ground; the Beschlächte protect the edges with timber piles, wattle and stone."
      },
      {
        year: "1136–1140",
        title: "The piers rise",
        text: "Limestone and greensandstone are transported on barges. Lime mortar — not cement — binds the fill masonry inside the piers."
      },
      {
        year: "1140–1146",
        title: "The arches take shape",
        text: "Wooden centering frames carry the arch stones until each keystone locks into place. Cranes, winches and pulleys hoist the stone blocks into position."
      },
      {
        year: "1146–1275",
        title: "Medieval completion",
        text: "The finished bridge carries several towers; in the background stands the Romanesque predecessor of the cathedral — the Gothic spires do not yet exist."
      },
      {
        year: "1859–1869",
        title: "Historical transformation",
        text: "As the city changes around it, the Gothic cathedral spires rise — scaffolded and under construction, a new skyline for the old bridge."
      },
      {
        year: "2010–2018",
        title: "Restoration",
        text: "Scaffolding, modern technique and careful craftsmanship secure the bridge's substance for coming generations."
      },
      {
        year: "TODAY",
        title: "Back to the present",
        text: "The Steinerne Brücke today carries pedestrians and cyclists — an almost 900-year-old structure, woven into everyday life in Regensburg."
      }
    ],
    videoChapterTitle: "Flying over the bridge",
    videoChapterText: "An FPV aerial shot of the Steinerne Brücke.",
    videoUnavailable: "Video could not load in this browser (possible HEVC codec limitation).",
    threeDTitle: "Interactive 3D model",
    threeDText: "Explore the bridge's construction in three dimensions.",
    threeDLoading: "Loading 3D model…",
    threeDOrbit: "ORBIT",
    threeDReset: "RESET",
    threeDFront: "FRONT",
    threeD34: "3/4",
    threeDTop: "TOP",
    threeDStateNote: "Note: this master GLB is already delivered in a partially exploded state (filename: EXPLODED_MASTER).",
    continueTitle: "Continue the journey",
    continueText: "More ZEITSPRUNG monuments are coming soon.",
    footerBack: "BACK TO START"
  },
  es: {
    metaTitle: "ZEITSPRUNG — Steinerne Brücke",
    introEyebrow: "ZEITSPRUNG",
    introTitle: "STEINERNE BRÜCKE",
    introCity: "REGENSBURG",
    introRange: "1135 → HOY",
    introStart: "EXPERIENCIA INICIAR",
    introSoundOn: "SONIDO ACTIVADO",
    introSoundOff: "SONIDO DESACTIVADO",
    introHint: "Listo para un viaje a través de 890 años de historia",
    preloaderLabel: "CARGANDO",
    navRoute: "RUTA",
    navTimeline: "LÍNEA DE TIEMPO",
    nav3d: "3D",
    navHistory: "HISTORIA",
    scrollHint: "DESPLÁZATE PARA VIAJAR EN EL TIEMPO",
    factBaubeginn: "INICIO DE CONSTRUCCIÓN",
    factFertigstellung: "FINALIZACIÓN",
    factBoegen: "ARCOS",
    factBoegenNote: "validado — 16 arcos originales",
    factPfeilerLabel: "PILARES",
    factPfeilerNote: "cifra no confirmada de forma concluyente como dato histórico*",
    factSourceNote: "* ver ZEITSPRUNG Accuracy Rules — solo \"16 arcos\" está validado como dato",
    states: [
      {
        year: "HOY",
        title: "El puente hoy",
        text: "Tras la restauración de 2010–2018, la Steinerne Brücke sigue uniendo el casco antiguo con Stadtamhof — más de 300 metros, 16 arcos, casi 900 años de historia."
      },
      {
        year: "ANTES DE 1135",
        title: "Antes de la construcción",
        text: "Antes del puente de piedra, un puente de madera provisional y barcas cruzaban el Danubio. La ciudad prepara la obra más grande de su época."
      },
      {
        year: "1135",
        title: "Cimentación",
        text: "Los pilares se asientan directamente sobre la grava portante del Danubio. Solo en zonas más débiles, emparrillados de roble refuerzan el terreno; los Beschlächte protegen los bordes con pilotes de madera, zarzo y piedra."
      },
      {
        year: "1136–1140",
        title: "Los pilares se elevan",
        text: "Piedra caliza y arenisca verde llegan en barcazas. El mortero de cal — no cemento — une la mampostería de relleno en el interior de los pilares."
      },
      {
        year: "1140–1146",
        title: "Los arcos toman forma",
        text: "Cimbras de madera sostienen las dovelas hasta que la clave de cada arco encaja. Grúas, tornos y poleas elevan los bloques de piedra hasta su posición."
      },
      {
        year: "1146–1275",
        title: "Finalización medieval",
        text: "El puente terminado luce varias torres; al fondo se alza todavía el predecesor románico de la catedral — las agujas góticas aún no existen."
      },
      {
        year: "1859–1869",
        title: "Transformación histórica",
        text: "Mientras la ciudad cambia a su alrededor, las agujas góticas de la catedral se elevan — entre andamios y en construcción, un nuevo perfil para el viejo puente."
      },
      {
        year: "2010–2018",
        title: "Restauración",
        text: "Andamios, técnica moderna y un cuidadoso trabajo artesanal aseguran la sustancia del puente para las próximas generaciones."
      },
      {
        year: "HOY",
        title: "De vuelta al presente",
        text: "La Steinerne Brücke sostiene hoy a peatones y ciclistas — una estructura de casi 900 años, tejida en la vida cotidiana de Regensburg."
      }
    ],
    videoChapterTitle: "Sobrevolando el puente",
    videoChapterText: "Una toma aérea FPV de la Steinerne Brücke.",
    videoUnavailable: "El vídeo no pudo cargarse en este navegador (posible limitación del códec HEVC).",
    threeDTitle: "Modelo 3D interactivo",
    threeDText: "Explora la construcción del puente en tres dimensiones.",
    threeDLoading: "Cargando modelo 3D…",
    threeDOrbit: "ÓRBITA",
    threeDReset: "REINICIAR",
    threeDFront: "FRENTE",
    threeD34: "3/4",
    threeDTop: "CENITAL",
    threeDStateNote: "Nota: este GLB maestro se entrega ya en un estado parcialmente explosionado (nombre de archivo: EXPLODED_MASTER).",
    continueTitle: "Continuar el viaje",
    continueText: "Pronto llegarán más monumentos de ZEITSPRUNG.",
    footerBack: "VOLVER AL INICIO"
  }
};

const STORAGE_KEY = "zeitsprung_v2_lang";

export function getInitialLang() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && DICT[stored]) return stored;
  const nav = (navigator.language || "de").slice(0, 2).toLowerCase();
  if (DICT[nav]) return nav;
  return "de";
}

export function setLang(lang) {
  localStorage.setItem(STORAGE_KEY, lang);
}

export function t(lang, key) {
  return (DICT[lang] && DICT[lang][key] !== undefined) ? DICT[lang][key] : DICT.de[key];
}

export function applyI18n(lang) {
  document.documentElement.lang = lang;
  document.title = t(lang, "metaTitle");
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const val = t(lang, key);
    if (typeof val === "string") el.textContent = val;
  });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    const val = t(lang, key);
    if (typeof val === "string") el.innerHTML = val;
  });
}
