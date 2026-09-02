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
    navMuseum: "AUSSTELLUNG",
    nav3d: "3D",
    navHistory: "GESCHICHTE",
    // Phase 2.5 — status marker for the future full interactive timeline
    // feature (the ZEITLEISTE nav button already works, it scrolls to the
    // real #facts section; this badge only marks the FULL timeline ambition
    // as not yet built, per ZEITSPRUNG_PROJECT_CONCEPT.md's TIME layer).
    // Phase 2.7C.3 — copy refreshed to the new two-line placeholder wording
    // ("ZEITLEISTE" / "IN VISUELLER PRODUKTION"), rendered via data-i18n-html
    // (see index.html's .navbar__timeline-badge) since it is genuinely two
    // lines of content, not a single string. This key is used ONLY by the
    // navbar Timeline badge now — see bruckmandlStatus below for why the
    // Brückmandl status note (which used to reuse this same key) now has its
    // own, separate key instead.
    navTimelineStatus: "ZEITLEISTE<br>IN VISUELLER PRODUKTION",
    // Phase 2.7C.3 — NEW. Split out of navTimelineStatus so that changing the
    // Timeline badge's copy (now Timeline-specific) can never silently change
    // the unrelated Brückmandl status note's copy too. Text is the OLD
    // navTimelineStatus value, unchanged in meaning ("in development"),
    // preserving the Brückmandl note's original, still-accurate meaning.
    bruckmandlStatus: "IN ARBEIT",
    scrollHint: "SCROLLEN, UM DURCH DIE ZEIT ZU REISEN",
    factBaubeginn: "BAUBEGINN",
    factFertigstellung: "FERTIGSTELLUNG",
    factBoegen: "BÖGEN",
    factBoegenNote: "validiert — 16 Originalbögen",
    factPfeilerLabel: "PFEILER",
    // Phase 2.7C.3 — asterisk removed (Section 4): stated confidently, no
    // alarming inline footnote marker. The sourcing detail (SB_PIER_COUNT,
    // DERIVED from the validated 16-arch count) now lives in factSourceNote's
    // restrained "QUELLE" line below and in the K-Frame source UI, not as a
    // visible asterisk on the primary fact card.
    factPfeilerNote: "15 Pfeiler — direkte strukturelle Folge der 16 validierten Bögen",
    // Phase 2.7C.3 — folded from "* siehe ZEITSPRUNG Accuracy Rules…" (an
    // internal doc name meaningless to a visitor) into the same restrained
    // "QUELLE — institution · title" convention as the new K-Frame source
    // line (Section 3), citing the real institutional source instead.
    factSourceNote: "QUELLE — Tiefbauamt Regensburg · Die Steinerne Brücke – 2010 bis 2018",
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
    // Phase 2.5 — K01–K12 historical visual gallery. NEW, separate from
    // #stage and #museum25d. Section chrome copy only — every per-frame
    // date/title/description comes from KFRAMES_STORY_MAP.json (itself a
    // verbatim re-citation of the states[] array above).
    kframesTitle: "Die Baustelle im Bild",
    kframesText: "Zwölf Bildmomente der Bauzeit, chronologisch geordnet — von der Fundamentierung bis heute.",
    kframesCounterLabel: "BILD",
    kframesHotspotMuseum: "Mehr in der Ausstellung ansehen",
    kframesHotspotStage: "Zur Zeitreise",
    kframesNeedsValidationNote: "Für diesen Bildmoment liegt keine bestätigte historische Einordnung vor.",
    // Phase 2.7C.3, Section 3 — restrained source-attribution line, K-Frame
    // gallery only. Full institution/title comes from
    // 02_CONTENT/Steinerne_Bruecke/SOURCES/sources.json, resolved at render
    // time in kframes-gallery.js; this key is only the small "QUELLE" label.
    kfSourceLabel: "QUELLE",
    // RUNTIME HOTFIX — visible Quellen access-point button/panel title.
    kfSourcesButton: "QUELLEN",
    // Phase 2.7C.3, Section 5 — K-Frame-specific, more editorial label for
    // frames whose NEEDS_VALIDATION status is specifically about DATING
    // (K08/K09 today, via KFRAMES_STORY_MAP.json's new uncertainty_type
    // field). Deliberately separate from the SHARED museumEvidenceNEEDS_
    // VALIDATION key ("ZU PRÜFEN"), which stays untouched and is still used
    // by #museum25d and as the generic fallback for any non-date K-frame
    // uncertainty in future.
    kfDateUnderReview: "DATIERUNG IN PRÜFUNG",
    // Phase 2.6 — #historicalReel editorial "cinematic summary" section
    // (Task 4). Date range and framing are drawn from already-validated
    // content (facts: Baubeginn 1135; restoration: 2010–2018) — no new
    // historical claim is introduced. reelNote exists specifically to keep
    // this teaser from reading as a duplicate of the K-frame gallery above it.
    reelEyebrow: "1135–2018",
    reelTitle: "Die Brücke im Zeitraffer",
    reelNote: "Redaktionelle Zusammenfassung — die vollständige Geschichte setzt sich oben fort.",
    reelReplayLabel: "Video erneut abspielen",
    // Phase 2.6 — Task 5, Brückmandl status note. Proper noun, identical in
    // all 3 languages (matches ASSET_SWAP_MAP.json's
    // hotspots_registry.bruckmandl placeholder label). Status text used to
    // reuse navTimelineStatus's copy; Phase 2.7C.3 split that into its own
    // bruckmandlStatus key (see above) once navTimelineStatus's copy became
    // Timeline-specific — see index.html.
    bruckmandlName: "Brückmandl",
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
    museumTitle: "Die Brücke im Raum",
    museumText: "Eine interaktive Ausstellung der Tragstruktur — isoliert betrachtet, wie ein Exponat im Museum.",
    museumModeOverview: "ÜBERBLICK",
    museumModeExploded: "EXPLOSION",
    museumModeStructure: "STRUKTUR",
    museumModePiers: "PFEILER",
    museumModeArches: "BÖGEN",
    museumModeDeck: "FAHRBAHN",
    museumModeMaterials: "MATERIAL",
    museumModeConstruction: "BAU",
    museumModeReassembly: "ZUSAMMENFÜGUNG",
    museumModeComplete: "VOLLENDET",
    museumModeReset: "RESET",
    museumSubOverview: "16 Bögen · 15 Pfeiler · isolierte Struktur",
    museumSubStructure: "Geometrie der Bogenkonstruktion",
    museumSubExploded: "Bauteile in kontrollierter Trennung",
    museumSubPiers: "Detailansicht eines Pfeilers",
    museumSubArches: "Detailansicht eines Bogens",
    museumSubDeck: "Aufbau der Fahrbahnebene",
    museumSubMaterials: "Kalkstein / Grünsandstein — Materialprobe",
    museumSubConstruction: "Baustellenbetrieb: Lehrgerüst und Kran",
    museumSubReassembly: "Bauteile finden zur Gesamtform zurück",
    museumSubComplete: "Die vollendete Brücke, 1146",
    museumChipMain: "GESAMT",
    museumChipPiers: "PFEILER",
    museumChipArches: "BÖGEN",
    museumChipDeck: "FAHRBAHN",
    museumPendingBadge: "PENDING",
    museumPendingText: "Für diese Bauphase liegt noch kein freigegebenes Bildmaterial vor — es wird kein Bild ersetzt oder erfunden.",
    /* Evidence-status chips for the 2.5D museum captions. These are UI
       translations of MUSEUM_CONTENT_MAP.json's `evidence_status` enum —
       terminology only, never a historical claim. They exist so that
       reconstructed / estimated content is never presented as confirmed fact. */
    museumEvidencePRESERVED: "ERHALTEN",
    museumEvidencePARTIALLY_PRESERVED: "TEILWEISE ERHALTEN",
    museumEvidenceRECONSTRUCTED: "REKONSTRUIERT",
    museumEvidenceESTIMATED: "GESCHÄTZT",
    museumEvidenceNEEDS_VALIDATION: "ZU PRÜFEN",
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
    navMuseum: "EXHIBITION",
    nav3d: "3D",
    navHistory: "HISTORY",
    navTimelineStatus: "TIMELINE<br>VISUAL PRODUCTION",
    bruckmandlStatus: "IN DEVELOPMENT",
    scrollHint: "SCROLL TO TRAVEL THROUGH TIME",
    factBaubeginn: "CONSTRUCTION BEGAN",
    factFertigstellung: "COMPLETED",
    factBoegen: "ARCHES",
    factBoegenNote: "validated — 16 original arches",
    factPfeilerLabel: "PIERS",
    factPfeilerNote: "15 piers — a direct structural consequence of the 16 validated arches",
    factSourceNote: "SOURCE — Tiefbauamt Regensburg · Die Steinerne Brücke – 2010 bis 2018",
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
    kframesTitle: "The construction site in pictures",
    kframesText: "Twelve visual moments from the construction period, in chronological order — from the foundations to today.",
    kframesCounterLabel: "FRAME",
    kframesHotspotMuseum: "See more in the exhibition",
    kframesHotspotStage: "To the time journey",
    kframesNeedsValidationNote: "No confirmed historical placement exists yet for this visual moment.",
    kfSourceLabel: "SOURCE",
    kfSourcesButton: "SOURCES",
    kfDateUnderReview: "DATE UNDER REVIEW",
    reelEyebrow: "1135–2018",
    reelTitle: "The bridge in fast-forward",
    reelNote: "Editorial summary — the full story continues above.",
    reelReplayLabel: "Replay video",
    bruckmandlName: "Brückmandl",
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
    museumTitle: "The bridge in space",
    museumText: "An interactive exhibition of the load-bearing structure — viewed in isolation, like an exhibit in a museum.",
    museumModeOverview: "OVERVIEW",
    museumModeExploded: "EXPLODED",
    museumModeStructure: "STRUCTURE",
    museumModePiers: "PIERS",
    museumModeArches: "ARCHES",
    museumModeDeck: "DECK",
    museumModeMaterials: "MATERIALS",
    museumModeConstruction: "CONSTRUCTION",
    museumModeReassembly: "REASSEMBLY",
    museumModeComplete: "COMPLETE",
    museumModeReset: "RESET",
    museumSubOverview: "16 arches · 15 piers · isolated structure",
    museumSubStructure: "Geometry of the arch construction",
    museumSubExploded: "Components in controlled separation",
    museumSubPiers: "Close-up view of a pier",
    museumSubArches: "Close-up view of an arch",
    museumSubDeck: "Structure of the deck level",
    museumSubMaterials: "Limestone / greensandstone — material specimen",
    museumSubConstruction: "The construction site: centering and crane",
    museumSubReassembly: "Components returning to the whole form",
    museumSubComplete: "The completed bridge, 1146",
    museumChipMain: "OVERALL",
    museumChipPiers: "PIERS",
    museumChipArches: "ARCHES",
    museumChipDeck: "DECK",
    museumPendingBadge: "PENDING",
    museumPendingText: "No approved imagery exists yet for this construction phase — no image is substituted or invented.",
    museumEvidencePRESERVED: "PRESERVED",
    museumEvidencePARTIALLY_PRESERVED: "PARTIALLY PRESERVED",
    museumEvidenceRECONSTRUCTED: "RECONSTRUCTED",
    museumEvidenceESTIMATED: "ESTIMATED",
    museumEvidenceNEEDS_VALIDATION: "NEEDS VALIDATION",
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
    navMuseum: "EXPOSICIÓN",
    nav3d: "3D",
    navHistory: "HISTORIA",
    navTimelineStatus: "LÍNEA DE TIEMPO<br>EN PRODUCCIÓN VISUAL",
    bruckmandlStatus: "EN CONSTRUCCIÓN",
    scrollHint: "DESPLÁZATE PARA VIAJAR EN EL TIEMPO",
    factBaubeginn: "INICIO DE CONSTRUCCIÓN",
    factFertigstellung: "FINALIZACIÓN",
    factBoegen: "ARCOS",
    factBoegenNote: "validado — 16 arcos originales",
    factPfeilerLabel: "PILARES",
    factPfeilerNote: "15 pilares — consecuencia estructural directa de los 16 arcos validados",
    factSourceNote: "FUENTE — Tiefbauamt Regensburg · Die Steinerne Brücke – 2010 bis 2018",
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
    kframesTitle: "La obra en imágenes",
    kframesText: "Doce momentos visuales de la fase de construcción, en orden cronológico — desde la cimentación hasta hoy.",
    kframesCounterLabel: "IMAGEN",
    kframesHotspotMuseum: "Ver más en la exposición",
    kframesHotspotStage: "Al viaje en el tiempo",
    kframesNeedsValidationNote: "Todavía no existe una ubicación histórica confirmada para este momento visual.",
    kfSourceLabel: "FUENTE",
    kfSourcesButton: "FUENTES",
    kfDateUnderReview: "DATACIÓN EN REVISIÓN",
    reelEyebrow: "1135–2018",
    reelTitle: "El puente en cámara rápida",
    reelNote: "Resumen editorial — la historia completa continúa más arriba.",
    reelReplayLabel: "Repetir vídeo",
    bruckmandlName: "Brückmandl",
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
    museumTitle: "El puente en el espacio",
    museumText: "Una exposición interactiva de la estructura portante — vista de forma aislada, como una pieza de museo.",
    museumModeOverview: "VISTA GENERAL",
    museumModeExploded: "EXPLOSIONADA",
    museumModeStructure: "ESTRUCTURA",
    museumModePiers: "PILARES",
    museumModeArches: "ARCOS",
    museumModeDeck: "CALZADA",
    museumModeMaterials: "MATERIAL",
    museumModeConstruction: "CONSTRUCCIÓN",
    museumModeReassembly: "REENSAMBLAJE",
    museumModeComplete: "COMPLETADO",
    museumModeReset: "REINICIAR",
    museumSubOverview: "16 arcos · 15 pilares · estructura aislada",
    museumSubStructure: "Geometría de la construcción de los arcos",
    museumSubExploded: "Componentes en separación controlada",
    museumSubPiers: "Vista detallada de un pilar",
    museumSubArches: "Vista detallada de un arco",
    museumSubDeck: "Estructura del nivel de la calzada",
    museumSubMaterials: "Piedra caliza / arenisca verde — muestra de material",
    museumSubConstruction: "La obra: cimbra y grúa",
    museumSubReassembly: "Los componentes regresan a la forma completa",
    museumSubComplete: "El puente completado, 1146",
    museumChipMain: "GENERAL",
    museumChipPiers: "PILARES",
    museumChipArches: "ARCOS",
    museumChipDeck: "CALZADA",
    museumPendingBadge: "PENDIENTE",
    museumPendingText: "Todavía no existe material gráfico aprobado para esta fase de construcción — no se sustituye ni se inventa ninguna imagen.",
    museumEvidencePRESERVED: "CONSERVADO",
    museumEvidencePARTIALLY_PRESERVED: "PARCIALMENTE CONSERVADO",
    museumEvidenceRECONSTRUCTED: "RECONSTRUIDO",
    museumEvidenceESTIMATED: "ESTIMADO",
    museumEvidenceNEEDS_VALIDATION: "POR VALIDAR",
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
