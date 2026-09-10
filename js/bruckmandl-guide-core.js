/* ZEITSPRUNG V2 — js/bruckmandl-guide-core.js
   ============================================================================
   BRUCKMANDL AI GUIDE — CANONICAL QA CORE.

   THE single source of truth for the closed-demo Bruckmandl question/answer
   system. Consumed by BOTH:
     - index.html's persistent global assistant bar (js/index-main.js)
     - STEINERNE_BRUECKE/#bruckmandl's monument-module assistant
       (STEINERNE_BRUECKE/js/bruckmandl.js)
   so a typed or tapped question produces the exact same canonical answer
   regardless of which surface the visitor is on — no second copy of any
   answer exists anywhere else in the project.

   PROVENANCE — every answer below is an unedited paraphrase of already-
   approved STEINERNE_BRUECKE/js/i18n.js content (bruckmandlFactPoints /
   bruckmandlHistory for SUPPORTED claims, bruckmandlLegendText for the
   registered LEGEND, bruckmandlUncertainPoints for the registered
   NEEDS_REVIEW material/heraldic-identity points). This file MOVED that
   content out of STEINERNE_BRUECKE/js/i18n.js (previously bruckmandlAiQA/
   bruckmandlAiHeading/bruckmandlStatusFact/bruckmandlStatusUncertain/
   bruckmandlAiWelcomeAlt/IdleAlt/PointAlt/TalkAlt) rather than duplicating
   it — that i18n.js still owns every OTHER Bruckmandl string (title,
   summary, history, legend text, factcheck lists, material/cutout labels,
   Quellen) untouched, since those belong to the static module, not the QA
   system. No historical claim was altered by this move.

   THIS IS A CLOSED DEMO — no external AI API, no free-form generation, no
   backend. matchBruckmandlIntent() below is a small deterministic keyword
   matcher (substring match against a fixed per-language keyword list, no
   fuzzy/edit-distance matching), never a model call.
   ============================================================================ */

// ---------------------------------------------------------------------------
// Technical DOM event name for the hotspot->Bruckmandl bridge (STEINERNE_
// BRUECKE/js/bruckmandl-hotspot-bridge.js). NOT historical content — a
// plain wiring constant, placed here (rather than in bruckmandl.js or the
// bridge itself) purely so both the hotspot-emitting UI code
// (bruckmandl.js's renderMediaStrip()) and the bridge that listens for it
// can import the exact same string from one shared, already-neutral module
// without importing from EACH OTHER (which would create a circular
// dependency between bruckmandl.js and the bridge). This core file already
// has zero dependents importing IT, so adding one more content-free export
// here is the lowest-risk shared root available.
// ---------------------------------------------------------------------------
export const BRUCKMANDL_HOTSPOT_EVENT = "zt:bruckmandl-hotspot";

// ---------------------------------------------------------------------------
// Canonical topic ids — same order as the 8 originally-approved suggestion
// buttons, PLUS 6 additive BRIDGE-level topics (Phase: "bridge knowledge
// expansion"). The original 8 are all about the BRUCKMANDL STATUE (first
// person "who/when/where..."); the 6 new ones are about the STEINERNE
// BRÜCKE itself (the bridge as a structure) — a deliberately DIFFERENT
// subject from "material" (the statue's own material), which is why the
// new bridge materials topic is named `bridge_materials`, not `material`,
// to avoid any id collision or content overload. See BRUCKMANDL_QA below
// for the full provenance of each new topic's answer text.
//
// PROVENANCE (new topics) — every answer is composed of verbatim (or
// near-verbatim, minimally re-joined) sentences copied from:
//   - 03_ASSETS/Steinerne_Bruecke/2d/MUSEUM_CONTENT_MAP.json (component
//     labels/short_description/extended_description — components
//     bridge_overview_structure, arch_construction, pier_structure,
//     beschlaechte_pier_protection, material_kalkstein,
//     material_gruensandstein, material_fuellmauerwerk, material_holzpfahl,
//     material_eisenklammer, material_findling, bau_process_lehrgeruest_kran)
//   - STEINERNE_BRUECKE/js/i18n.js's `states[]` timeline array (the
//     `timeline` topic's ONLY source — no new timeline prose was written)
//   - STEINERNE_BRUECKE/js/i18n.js's factPfeilerNote key (the exact,
//     already-approved "15 piers — a direct structural consequence of the
//     16 validated arches" framing, reused verbatim for the `piers` topic's
//     pier-count sentence, mirroring the live #facts card's own wording —
//     never independently re-derived)
//   All claims cited are SUPPORTED in
//   02_CONTENT/Steinerne_Bruecke/SOURCES/CLAIM_SOURCE_MAP.json, except the
//   `construction` topic's wheel-crane detail (claim
//   bau_process_crane_technique, NEEDS_REVIEW) and the `piers` topic's
//   exact pier count (claim bridge_15_piers,
//   DERIVED_FROM_CANONICAL_STRUCTURE) — both carried over with the SAME
//   hedge/framing already used by the source material, never stated as
//   flatly settled fact. `south_tower` was investigated and deliberately
//   NOT implemented — no independent source validates it.
// ---------------------------------------------------------------------------
export const BRUCKMANDL_TOPICS = [
  "who", "when", "where", "fact_legend", "legend", "previous_figures", "material", "detail",
  "bridge_overview", "arches", "piers", "bridge_materials", "timeline", "construction"
];

// The original 8 statue-focused topics only — this is the curated subset
// rendered as suggestion BUTTONS by both AI-guide surfaces (see
// bruckmandl-knowledge-provider.js's getSuggestedTopics()). The 6 new
// bridge-level topics are deliberately NOT added here: doubling the button
// count would turn the short, museographic suggestion panel into a long
// list, and every new topic is already fully reachable via free-text
// matching (matchBruckmandlIntent()) and via the new fact-card hotspot
// wiring (STEINERNE_BRUECKE/js/bruckmandl-hotspot-bridge.js) — see this
// task's delivery report for the full reasoning.
export const BRUCKMANDL_SUGGESTED_TOPICS = [
  "who", "when", "where", "fact_legend", "legend", "previous_figures", "material", "detail"
];

export const BRUCKMANDL_TOPIC_POSE = {
  who: "talk",
  when: "talk",
  where: "point",
  fact_legend: "talk",
  legend: "talk",
  previous_figures: "talk",
  material: "talk",
  detail: "point",
  // New bridge-level topics — "point" for anything pointing at one specific
  // physical structural element (arches/piers, same convention as "where"/
  // "detail" above), "talk" for general narrative (overview/materials/
  // timeline/construction-process, same convention as "who"/"when"/
  // "material" above).
  bridge_overview: "talk",
  arches: "point",
  piers: "point",
  bridge_materials: "talk",
  timeline: "talk",
  construction: "talk"
};

// Internal evidence codes (fact/legend/uncertain) — never user-facing
// strings themselves, resolved via BRUCKMANDL_STATUS_LABELS at render time.
export const BRUCKMANDL_TOPIC_STATUS = {
  who: ["fact"],
  when: ["fact"],
  where: ["fact"],
  fact_legend: ["fact", "legend"],
  legend: ["legend"],
  previous_figures: ["fact"],
  material: ["fact", "uncertain"],
  detail: ["uncertain"],
  // bridge_overview/arches/bridge_materials/timeline: every claim cited is
  // SUPPORTED in CLAIM_SOURCE_MAP.json -> plain "fact". piers/construction
  // each carry one specific NOT-independently-attested/NEEDS_REVIEW detail
  // (the 15-pier count is DERIVED_FROM_CANONICAL_STRUCTURE; the wheel-crane
  // detail is NEEDS_REVIEW) alongside otherwise-SUPPORTED content, mirroring
  // the same ["fact","uncertain"] pattern already used by "material" above.
  bridge_overview: ["fact"],
  arches: ["fact"],
  piers: ["fact", "uncertain"],
  bridge_materials: ["fact"],
  timeline: ["fact"],
  construction: ["fact", "uncertain"]
};

export const BRUCKMANDL_STATUS_LABELS = {
  de: { fact: "BELEGT", legend: "SAGE", uncertain: "UNGEPRÜFT" },
  en: { fact: "DOCUMENTED", legend: "LEGEND", uncertain: "UNVERIFIED" },
  es: { fact: "DOCUMENTADO", legend: "LEYENDA", uncertain: "NO VERIFICADO" }
};

// Small UI chrome shared by both surfaces (heading/placeholder/send/alt
// text/collapse control) — kept here alongside the QA data it labels,
// rather than duplicated per-page, since both surfaces render it verbatim.
export const BRUCKMANDL_UI_LABELS = {
  de: {
    heading: "FRAG DAS BRUCKMANDL",
    placeholder: "Frag den Brückmandl …",
    send: "FRAGEN",
    inputAriaLabel: "Frage an das Bruckmandl",
    welcomeAlt: "Bruckmandl-Assistent begrüßt dich",
    idleAlt: "Bruckmandl-Assistent, ruhende Haltung",
    pointAlt: "Bruckmandl-Assistent zeigt auf ein Detail",
    talkAlt: "Bruckmandl-Assistent spricht",
    collapse: "Antwort einklappen",
    expand: "Antwort anzeigen"
  },
  en: {
    heading: "ASK THE BRUCKMANDL",
    placeholder: "Ask the Bruckmandl …",
    send: "ASK",
    inputAriaLabel: "Question for the Bruckmandl",
    welcomeAlt: "Bruckmandl assistant welcoming you",
    idleAlt: "Bruckmandl assistant, resting pose",
    pointAlt: "Bruckmandl assistant pointing at a detail",
    talkAlt: "Bruckmandl assistant speaking",
    collapse: "Collapse answer",
    expand: "Show answer"
  },
  es: {
    heading: "PREGÚNTALE AL BRUCKMANDL",
    placeholder: "Pregúntale al Brückmandl …",
    send: "PREGUNTAR",
    inputAriaLabel: "Pregunta para el Bruckmandl",
    welcomeAlt: "El asistente Bruckmandl te da la bienvenida",
    idleAlt: "Asistente Bruckmandl, postura en reposo",
    pointAlt: "Asistente Bruckmandl señalando un detalle",
    talkAlt: "Asistente Bruckmandl hablando",
    collapse: "Ocultar respuesta",
    expand: "Mostrar respuesta"
  }
};

// Shown when no topic can be matched confidently — never a guess, never
// styled as a documented/fact answer.
export const BRUCKMANDL_FALLBACK = {
  de: "Diese Demo beantwortet derzeit nur geprüfte Fragen zum Brückmandl und zur Steinernen Brücke. Frag mich zum Beispiel nach meiner Geschichte, meinem Standort, Material oder der Legende.",
  en: "This demo currently answers only verified questions about the Bruckmandl and the Stone Bridge. Try asking about my history, location, material or the legend.",
  es: "Esta demo responde actualmente solo preguntas verificadas sobre el Brückmandl y el Puente de Piedra. Puedes preguntarme, por ejemplo, por mi historia, ubicación, material o la leyenda."
};

// NO_SOURCE / NO_VALIDATED_CONTENT = NO_HISTORICAL_CLAIM (brief §"Absolute
// rule"). Distinct from BRUCKMANDL_FALLBACK above: BRUCKMANDL_FALLBACK is
// shown when a typed question could not be matched to any of the 8
// canonical topics at all (a matching problem). This string is reserved for
// the different case where a topic/point IS identified (e.g. a future
// hotspot reference) but no validated content exists for it yet (a content
// gap, not a matching problem) — used by
// bruckmandl-knowledge-provider.js's LocalValidatedProvider as the
// defensive "no registered answer" return. Currently unreachable in
// practice since all 8 canonical topics are fully authored, but the
// pathway must exist and must never fall back to inventing an answer.
// Exact wording as given by the project owner — not paraphrased.
export const BRUCKMANDL_NO_VALIDATED_INFO = {
  de: "Zu diesem Punkt liegen mir derzeit noch keine validierten historischen Informationen vor.",
  en: "I don't currently have validated historical information about this point.",
  es: "No dispongo todavía de información histórica validada sobre este punto."
};

// ---------------------------------------------------------------------------
// Canonical QA content — MOVED verbatim from STEINERNE_BRUECKE/js/i18n.js's
// former bruckmandlAiQA array (see file header). Each entry's `topic` id
// resolves pose/evidence via BRUCKMANDL_TOPIC_POSE/BRUCKMANDL_TOPIC_STATUS
// above.
// ---------------------------------------------------------------------------
export const BRUCKMANDL_QA = {
  de: [
    {
      topic: "who",
      question: "Wer bist du?",
      answer: "Ich bin das Bruckmandl — eine kleine Steinfigur hoch über der Donau, am höchsten Punkt der Steinernen Brücke. Die Figur, die du hier siehst, stammt aus dem Jahr 1854 und ist bereits die dritte ihrer Art."
    },
    {
      topic: "when",
      question: "Von wann stammst du?",
      answer: "Das früheste dokumentierte Jahr ist 1446. Die ursprüngliche Figur aus Grünsandstein wurde 1579 zerstört. Die heutige, dritte Figur wurde 1854 von Anton Blank geschaffen und zwischen 2012 und 2018 saniert."
    },
    {
      topic: "where",
      question: "Wo bist du auf der Brücke?",
      answer: "Ich sitze auf der westlichen Brüstung, am höchsten Punkt der Brücke — etwa 11 Meter über der Donau, mit Blick nach Süden."
    },
    {
      topic: "fact_legend",
      question: "Was ist Fakt, was Legende?",
      answer: "Historisch belegt sind zum Beispiel das Jahr 1854 und mein Standort auf der westlichen Brüstung. Überliefert als Sage sind dagegen die Wette mit dem Dombaumeister und der Pakt mit dem Teufel — das sind Erzählungen, keine belegten Fakten."
    },
    {
      topic: "legend",
      question: "Erzähl mir die Baumeister-Sage.",
      answer: "Der Sage nach soll das Bruckmandl den Baumeister der Steinernen Brücke darstellen, der besorgt zu den Domtürmen hinüberschaut. Er habe mit dem Dombaumeister gewettet und, um zu gewinnen, einen Pakt mit dem Teufel geschlossen — Hilfe beim Brückenbau gegen die Seelen der ersten drei Brückengänger. Mit einer List aus zwei Hähnen und einem Hund entkam die Stadt dem Pakt; aus Wut soll der Teufel die Brücke verbogen und die Donaustrudel verursacht haben."
    },
    {
      topic: "previous_figures",
      question: "Was geschah mit den früheren Figuren?",
      answer: "Die ursprüngliche Figur aus Grünsandstein wurde 1579 zerstört; ihr Bildhauer ist unbekannt. Die heutige Figur von 1854 ist bereits die dritte ihrer Art — über eine zweite Figur ist in den validierten Quellen nichts Näheres bekannt."
    },
    {
      topic: "material",
      question: "Aus welchem Material bist du?",
      answer: "Die ursprüngliche Figur von 1579 bestand nachweislich aus Grünsandstein. Das Material der heutigen, dritten Figur ist dagegen nicht abschließend geklärt — das gilt in den Quellen als ungeprüft."
    },
    {
      topic: "detail",
      question: "Zeig mir ein wichtiges Detail.",
      answer: "Ein auffälliges Detail ist das Wappenschild mit den Schlüsseln am Sockel. Was genau dieses Wappen darstellt, ist in den Quellen nicht gesichert — die Identität der beiden Wappenreliefs gilt als ungeklärt."
    },
    {
      topic: "bridge_overview",
      question: "Was ist die Steinerne Brücke?",
      answer: "Erbaut 1135–1146, über 300 Meter lang, mit ursprünglich 16 Bögen über die Donau. Die Steinerne Brücke ist kein einheitliches Bauwerk aus einem Guss, sondern ein steinernes Archiv: Pfeiler, Bögen und Fahrbahn stammen zu großen Teilen noch aus der Bauzeit des 12. Jahrhunderts, während Türme, Kapellen, Tore und die Fahrbahnoberfläche über Jahrhunderte hinweg wiederholt erneuert wurden."
    },
    {
      topic: "arches",
      question: "Wie wurden die Bögen der Brücke gebaut?",
      answer: "16 Bögen aus Werksteinen wurden über hölzernen Lehrgerüsten gemauert und mit Kränen versetzt. Die einzelnen Werksteine wurden vermutlich mit einem 'Wolf' (einer zangenartigen Hebeklammer, wie sie schon aus römischer Zeit bekannt ist) versetzt; entsprechende Wolfslöcher sind an mehreren Steinen erhalten."
    },
    {
      topic: "piers",
      question: "Wie sind die Pfeiler der Brücke aufgebaut?",
      answer: "15 Pfeiler — direkte strukturelle Folge der 16 validierten Bögen. Jeder Pfeiler besitzt eine Werksteinschale aus Grünsandstein-Quadern mit einem vermörtelten Bruchstein-Kern. Nach den Bohrbefunden der Sanierung 2010–2018 gründen die Pfeiler direkt auf dem Donaukies — es wurde kein durchgängiges Pfahlwerk unter den mittelalterlichen Pfeilern gefunden; nur an Stellen mit schlechter gelagertem Kies kommen punktuell Eichenroste vor. Die Beschlächte: Inselförmige Vorbauten aus Holzpfählen, Steinpaketen und Astgeflecht schützten die Pfeiler zusätzlich vor Unterspülung."
    },
    {
      topic: "bridge_materials",
      question: "Aus welchen Materialien besteht die Brücke?",
      answer: "Kalkstein: Heller Kalkstein, teils aus Zweitverwendung römischer Quader, findet sich vor allem in den Pfeilersockeln. Grünsandstein: Der Regensburger Grünsandstein ist das dominierende Baumaterial der Bögen, Pfeilerschalen und Schildwände. Füllmauerwerk / Gusskern: Das Innere von Pfeilern und Bögen besteht aus Bruchstein, der lagenweise mit Kalkmörtel vergossen wurde. Eichenholzpfähle: Eichenholzpfähle sicherten die Beschlächte und die Fundamente der jüngeren Rampenbrücke — nicht die mittelalterlichen Hauptpfeiler. Eisenklammern (in Blei verankert): Werksteinquader wurden untereinander mit eingebleiten Eisenklammern verbunden, um den Verbund zu sichern. Findlinge (Steinpakete der Beschlächte): Große, runde Feldsteine bildeten zusammen mit Holzpfählen und Astgeflecht die schützenden Steinpakete der Beschlächte."
    },
    {
      topic: "timeline",
      question: "Wie verlief der Bau der Brücke von Anfang bis heute?",
      answer: "Vor 1135: Vor der Steinbrücke überquerten eine hölzerne Behelfsbrücke und Fähren die Donau; die Stadt bereitet den größten Bauauftrag ihrer Zeit vor. 1135: Die Pfeiler ruhen direkt auf dem tragfähigen Donaukies; die Beschlächte schützen die Kanten mit Holzpfählen, Astgeflecht und Stein. 1136–1140: Kalkstein und Grünsandstein werden auf Lastkähnen herangeschafft, Kalkmörtel verbindet das Füllmauerwerk im Inneren der Pfeiler. 1140–1146: Hölzerne Lehrgerüste tragen die Bogensteine, bis der Schlussstein jedes Bogens sitzt; Kräne, Seilwinden und Flaschenzüge heben die Steinquader in Position. 1146–1275: Die fertige Brücke trägt mehrere Türme; im Hintergrund erhebt sich noch der romanische Vorgängerbau des Doms — die gotischen Türme existieren noch nicht. 1859–1869: Während die Stadt sich verändert, wachsen die gotischen Domtürme empor — eingerüstet und im Bau, ein neuer Horizont für die alte Brücke. 2010–2018: Gerüste, moderne Technik und sorgfältige Handwerkskunst sichern die Substanz der Brücke für kommende Generationen. Heute: Die Steinerne Brücke trägt weiterhin Fußgänger und Radfahrer — ein fast 900 Jahre altes Bauwerk, mitten im Alltag von Regensburg."
    },
    {
      topic: "construction",
      question: "Welche Bautechnik wurde beim Bau verwendet?",
      answer: "Für den Bau der Bögen war ein stabiles, hölzernes Lehrgerüst notwendig, dessen Auflagerspuren als schlitzartige Nischen im Pfeilermauerwerk archäologisch nachgewiesen sind. Die schweren Werksteine wurden vermutlich mit einfachen hölzernen Kränen, Flaschenzügen oder Seilwinden und einer zangenartigen Hebeklammer ('Wolf') versetzt. Laufkräne/Tretkräne werden als für die Epoche plausibel eingeschätzt, gelten aber nicht als gesicherter Nachweis."
    }
  ],
  en: [
    {
      topic: "who",
      question: "Who are you?",
      answer: "I'm the Bruckmandl — a small stone figure high above the Danube, at the highest point of the Stone Bridge. The figure you see today dates from 1854 and is already the third of its kind."
    },
    {
      topic: "when",
      question: "When do you date from?",
      answer: "The earliest documented year is 1446. The original Grünsandstein figure was destroyed in 1579. Today's third figure was created in 1854 by Anton Blank and restored between 2012 and 2018."
    },
    {
      topic: "where",
      question: "Where are you on the bridge?",
      answer: "I sit on the western parapet, at the highest point of the bridge — about 11 meters above the Danube, facing south."
    },
    {
      topic: "fact_legend",
      question: "What's fact, what's legend?",
      answer: "Historically documented, for example, are the year 1854 and my location on the western parapet. Passed down as legend, on the other hand, are the wager with the cathedral's builder and the pact with the devil — those are tales, not documented facts."
    },
    {
      topic: "legend",
      question: "Tell me the builder legend.",
      answer: "According to legend, the Bruckmandl represents the bridge's master builder, anxiously watching the cathedral towers rise. He is said to have wagered with the cathedral's builder and, to win, struck a pact with the devil — help finishing the bridge for the souls of its first three crossers. A trick with two roosters and a dog let the city escape the bargain; furious, the devil is said to have bent the bridge and stirred up the Danube's whirlpools."
    },
    {
      topic: "previous_figures",
      question: "What happened to the earlier figures?",
      answer: "The original Grünsandstein figure was destroyed in 1579; its sculptor is unknown. Today's 1854 figure is already the third of its kind — the validated sources record nothing further about a second figure."
    },
    {
      topic: "material",
      question: "What material are you made from?",
      answer: "The original 1579 figure was documented as made of Grünsandstein. The material of today's third figure, however, has not been conclusively established — the sources flag this as unverified."
    },
    {
      topic: "detail",
      question: "Show me an important detail.",
      answer: "One striking detail is the heraldic shield with the keys on the pedestal. What exactly this shield represents is not confirmed in the sources — the identity of the two heraldic reliefs remains unresolved."
    },
    {
      topic: "bridge_overview",
      question: "What is the Stone Bridge?",
      answer: "Built 1135–1146, more than 300 metres long, originally spanning the Danube with 16 arches. The Stone Bridge is not a single, uniform structure but a stone archive: the piers, arches and roadway substructure largely date back to the 12th-century construction phase, while towers, chapels, gates and the road surface were repeatedly renewed over the centuries."
    },
    {
      topic: "arches",
      question: "How were the bridge's arches built?",
      answer: "16 arches of dressed stone were built over wooden centering frames and set in place with cranes. The individual dressed stones were most likely lifted using a 'Wolf' — a tongs-like lifting clamp already known from Roman times — and matching 'wolf holes' survive on several stones."
    },
    {
      topic: "piers",
      question: "How are the bridge's piers built?",
      answer: "15 piers — a direct structural consequence of the 16 validated arches. Each pier has an outer shell of dressed green-sandstone ashlar around a mortared rubble-stone core. According to the core-drilling surveys carried out during the 2010–2018 restoration, the piers are founded directly on the Danube gravel — no continuous timber pile foundation was found beneath the medieval piers; oak grillages appear only locally where the gravel was poorly compacted. The Beschlächte: island-shaped cutwater structures of timber piles, stone packing and wattle protected the piers against scouring."
    },
    {
      topic: "bridge_materials",
      question: "What materials is the bridge built from?",
      answer: "Limestone: Pale limestone, in some cases reused Roman ashlar, occurs mainly in the pier plinths. Green sandstone: Regensburg green sandstone is the dominant building material of the arches, pier shells and spandrel walls. Rubble-fill core (Gusskern): The interior of the piers and arches consists of rubble stone cast in layers with lime mortar. Oak piles: Oak piles secured the Beschlächte cutwaters and the foundations of the later ramp bridge — not the medieval main piers. Iron cramps (lead-anchored): Dressed stone blocks were tied together with lead-anchored iron cramps to secure the bond between them. Boulders (Beschlächte stone packing): Large rounded field stones, combined with timber piles and wattle, formed the protective stone packing of the Beschlächte."
    },
    {
      topic: "timeline",
      question: "How did the bridge's construction unfold from start to today?",
      answer: "Before 1135: Before the stone bridge, a temporary wooden bridge and ferries crossed the Danube; the city prepares the largest construction project of its time. 1135: The piers rest directly on the load-bearing Danube gravel; the Beschlächte protect the edges with timber piles, wattle and stone. 1136–1140: Limestone and greensandstone are transported on barges; lime mortar binds the fill masonry inside the piers. 1140–1146: Wooden centering frames carry the arch stones until each keystone locks into place; cranes, winches and pulleys hoist the stone blocks into position. 1146–1275: The finished bridge carries several towers; in the background stands the Romanesque predecessor of the cathedral — the Gothic spires do not yet exist. 1859–1869: As the city changes around it, the Gothic cathedral spires rise — scaffolded and under construction, a new skyline for the old bridge. 2010–2018: Scaffolding, modern technique and careful craftsmanship secure the bridge's substance for coming generations. Today: The Steinerne Brücke carries pedestrians and cyclists — an almost 900-year-old structure, woven into everyday life in Regensburg."
    },
    {
      topic: "construction",
      question: "What construction technique was used to build it?",
      answer: "Building the arches required a sturdy wooden centering framework, whose bearing marks survive archaeologically as slot-like recesses in the pier masonry. The heavy dressed stones were most likely moved using simple wooden cranes, block-and-tackle systems or capstans together with a tongs-like lifting clamp (the 'Wolf'). Treadwheel cranes are considered plausible for the period but are not confirmed as certain fact."
    }
  ],
  es: [
    {
      topic: "who",
      question: "¿Quién eres?",
      answer: "Soy el Bruckmandl — una pequeña figura de piedra en lo alto del Danubio, en el punto más elevado del Puente de Piedra. La figura que ves hoy data de 1854 y es ya la tercera de su tipo."
    },
    {
      topic: "when",
      question: "¿De cuándo data?",
      answer: "El año documentado más antiguo es 1446. La figura original de Grünsandstein fue destruida en 1579. La figura actual, la tercera, fue creada en 1854 por Anton Blank y restaurada entre 2012 y 2018."
    },
    {
      topic: "where",
      question: "¿Dónde estás en el puente?",
      answer: "Me siento en la balaustrada occidental, en el punto más alto del puente — a unos 11 metros sobre el Danubio, mirando hacia el sur."
    },
    {
      topic: "fact_legend",
      question: "¿Qué es hecho, qué es leyenda?",
      answer: "Está históricamente documentado, por ejemplo, el año 1854 y mi ubicación en la balaustrada occidental. Transmitida como leyenda, en cambio, está la apuesta con el constructor de la catedral y el pacto con el diablo — son relatos, no hechos documentados."
    },
    {
      topic: "legend",
      question: "Cuéntame la leyenda del maestro.",
      answer: "Según la leyenda, el Bruckmandl representa al maestro constructor del puente, observando con inquietud cómo se alzan las torres de la catedral. Se dice que apostó con el constructor de la catedral y, para ganar, hizo un pacto con el diablo — ayuda para terminar el puente a cambio de las almas de los tres primeros en cruzarlo. Un engaño con dos gallos y un perro libró a la ciudad del pacto; furioso, el diablo habría torcido el puente y provocado los remolinos del Danubio."
    },
    {
      topic: "previous_figures",
      question: "¿Qué pasó con las figuras anteriores?",
      answer: "La figura original de Grünsandstein fue destruida en 1579; se desconoce su escultor. La figura actual de 1854 es ya la tercera de su tipo — las fuentes validadas no registran más detalles sobre una segunda figura."
    },
    {
      topic: "material",
      question: "¿De qué material estás hecho?",
      answer: "La figura original de 1579 estaba documentada como hecha de Grünsandstein. El material de la figura actual, la tercera, en cambio, no está confirmado de forma concluyente — las fuentes lo marcan como no verificado."
    },
    {
      topic: "detail",
      question: "Muéstrame un detalle importante.",
      answer: "Un detalle llamativo es el escudo heráldico con las llaves en el pedestal. Lo que representa exactamente ese escudo no está confirmado en las fuentes — la identidad de los dos relieves heráldicos sigue sin resolverse."
    },
    {
      topic: "bridge_overview",
      question: "¿Qué es el Puente de Piedra?",
      answer: "Construido entre 1135 y 1146, con más de 300 metros de longitud y originalmente 16 arcos sobre el Danubio. El Puente de Piedra no es una obra homogénea de una sola fase, sino un auténtico archivo en piedra: los pilares, los arcos y la subestructura de la calzada corresponden en gran parte a la fase constructiva del siglo XII, mientras que torres, capillas, puertas y la superficie de la calzada fueron renovadas repetidamente a lo largo de los siglos."
    },
    {
      topic: "arches",
      question: "¿Cómo se construyeron los arcos del puente?",
      answer: "Los 16 arcos de sillería se construyeron sobre cimbras de madera y se colocaron con la ayuda de grúas. Los sillares individuales se izaban probablemente mediante un 'lobo' (una grapa de izado en forma de tenaza, ya conocida en época romana); varios sillares conservan los correspondientes orificios de anclaje."
    },
    {
      topic: "piers",
      question: "¿Cómo están construidos los pilares del puente?",
      answer: "15 pilares — consecuencia estructural directa de los 16 arcos validados. Cada pilar tiene una envoltura de sillares de arenisca verde con un núcleo interior de mampostería de relleno unida con mortero de cal. Según las perforaciones de estudio realizadas durante la restauración de 2010-2018, los pilares se apoyan directamente sobre la grava del Danubio — no se halló un entramado continuo de pilotes bajo los pilares medievales; solo aparecen puntualmente emparrillados de roble en zonas con grava mal compactada. Los Beschlächte: estructuras protectoras en forma de isla, hechas de pilotes de madera, paquetes de piedra y entramado de ramas, protegían los pilares contra la socavación."
    },
    {
      topic: "bridge_materials",
      question: "¿De qué materiales está construido el puente?",
      answer: "Piedra caliza: La piedra caliza clara, en parte procedente de sillares romanos reutilizados, aparece sobre todo en los zócalos de los pilares. Arenisca verde: La arenisca verde de Regensburg es el material constructivo dominante en los arcos, las envolturas de los pilares y los muros laterales. Relleno de mampostería (núcleo de vertido): El interior de pilares y arcos está formado por piedra de cascote vertida en capas con mortero de cal. Pilotes de roble: Los pilotes de roble aseguraban los Beschlächte y los cimientos del puente rampa posterior — no los pilares principales medievales. Grapas de hierro (ancladas en plomo): Los sillares se unían entre sí mediante grapas de hierro ancladas en plomo para asegurar su trabazón. Bloques erráticos (relleno pétreo del Beschlächte): Grandes canchales redondeados, combinados con pilotes de madera y entramado de ramas, formaban el relleno pétreo protector de los Beschlächte."
    },
    {
      topic: "timeline",
      question: "¿Cómo se desarrolló la construcción del puente desde el inicio hasta hoy?",
      answer: "Antes de 1135: Antes del puente de piedra, un puente de madera provisional y barcas cruzaban el Danubio; la ciudad prepara la obra más grande de su época. 1135: Los pilares se asientan directamente sobre la grava portante del Danubio; los Beschlächte protegen los bordes con pilotes de madera, zarzo y piedra. 1136–1140: Piedra caliza y arenisca verde llegan en barcazas; el mortero de cal une la mampostería de relleno en el interior de los pilares. 1140–1146: Cimbras de madera sostienen las dovelas hasta que la clave de cada arco encaja; grúas, tornos y poleas elevan los bloques de piedra hasta su posición. 1146–1275: El puente terminado luce varias torres; al fondo se alza todavía el predecesor románico de la catedral — las agujas góticas aún no existen. 1859–1869: Mientras la ciudad cambia a su alrededor, las agujas góticas de la catedral se elevan — entre andamios y en construcción, un nuevo perfil para el viejo puente. 2010–2018: Andamios, técnica moderna y un cuidadoso trabajo artesanal aseguran la sustancia del puente para las próximas generaciones. Hoy: La Steinerne Brücke sostiene hoy a peatones y ciclistas — una estructura de casi 900 años, tejida en la vida cotidiana de Regensburg."
    },
    {
      topic: "construction",
      question: "¿Qué técnica de construcción se utilizó?",
      answer: "La construcción de los arcos requería una cimbra de madera robusta, cuyas huellas de apoyo se conservan arqueológicamente como ranuras en la mampostería de los pilares. Los pesados sillares se desplazaban probablemente con grúas de madera sencillas, poleas o cabrestantes, junto con una grapa de izado en forma de tenaza (el 'lobo'). Las grúas de rueda de tracción humana se consideran plausibles para la época, pero no están confirmadas como hecho seguro."
    }
  ]
};

/** Looks up one canonical QA entry by topic id + language. */
export function getBruckmandlEntry(topic, lang) {
  const list = BRUCKMANDL_QA[lang] || BRUCKMANDL_QA.en;
  return list.find((e) => e.topic === topic) || null;
}

// ---------------------------------------------------------------------------
// Deterministic intent matcher — CLOSED DEMO, no external AI.
//
// Substring keyword match against a small fixed per-language/per-topic
// phrase list (includes each topic's own canonical question text plus a
// handful of reasonable paraphrases/synonyms). Deliberately NOT fuzzy/edit-
// distance matching, so an unrelated typed sentence does not accidentally
// produce a historical answer (§5 of the brief).
//
// Tie-break rule (deterministic, never a guess) — see matchBruckmandlIntent()
// below for the implementation:
//   1. Highest keyword-hit count wins outright.
//   2. On a tie in hit count, the topic whose single LONGEST matched keyword
//      phrase is longer wins (a longer matched substring is inherently more
//      specific; an exact canonical-question match is, by construction, the
//      longest possible match for that input, so this rule also covers
//      "prefer an exact canonical-question match" without a special case).
//   3. If step 2 is ALSO tied, this is a genuine, unresolvable ambiguity ->
//      return null. No further/arbitrary tie-break (e.g. no ranked list of
//      "more concrete" topics) is applied — never guess.
// ---------------------------------------------------------------------------
function normalizeQuestionText(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining accents/umlauts (ä/ü/é/ñ -> a/u/e/n)
    // Punctuation strip — includes the straight apostrophe (U+0027) AND the
    // typographic/curly variants a phone keyboard's autocorrect commonly
    // substitutes (right single quote ’, left single quote ‘, and the
    // backtick, sometimes typed as a makeshift apostrophe), so "what's" /
    // "what’s" / "what`s" all normalize identically. Applied to BOTH the
    // user's typed input and every INTENT_KEYWORDS phrase below (see the
    // one-time normalization pass right after INTENT_KEYWORDS is defined),
    // so neither side needs manual pre-normalization anymore.
    .replace(/[¿?¡!.,;:()"'‘’`«»]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const INTENT_KEYWORDS = {
  de: {
    who: ["wer bist du", "wer bist", "was ist das bruckmandl", "was ist der bruckmandl", "wer ist das bruckmandl"],
    when: ["wann wurdest du", "wann bist du aufgestellt", "aus welchem jahr", "wann stammst du", "wie alt bist du", "seit wann"],
    where: ["wo stehst du", "wo bist du", "wo befindest du dich", "wo auf der brucke", "welche seite der brucke", "an welcher stelle"],
    fact_legend: ["was ist fakt", "fakt und was legende", "fakt oder legende", "was ist wahr", "was stimmt wirklich", "was ist real"],
    legend: ["erzahl mir die legende", "erzahl die legende", "die sage", "baumeister legende", "teufelspakt", "pakt mit dem teufel", "legende von", "baumeister-sage"],
    previous_figures: ["fruheren figuren", "vorherigen figuren", "alteren figuren", "was geschah mit den fruheren", "erste figur", "zweite figur"],
    material: ["aus welchem material", "welches material bist du", "woraus bestehst du", "material bist du"],
    detail: ["zeig mir ein detail", "wichtiges detail", "was bedeutet das wappen", "wappen bedeutung", "zeig mir etwas", "zeig mir ein wichtiges detail"],
    // New bridge-level topics (Phase: bridge knowledge expansion) — all
    // phrased about "die Brücke" (the bridge), never "du" (you, the
    // statue), so they never collide with the 8 statue-focused lists above.
    bridge_overview: ["was ist die steinerne brucke", "was ist die brucke", "erzahl mir etwas uber die brucke", "wie lang ist die brucke", "wieviele bogen hat die brucke", "wie viele bogen hat die brucke", "wie alt ist die brucke", "beschreib die brucke"],
    arches: ["wie wurden die bogen gebaut", "wie wurden die bogen der brucke gebaut", "bau der bogen", "bogenbau", "wie sind die bogen gebaut"],
    piers: ["wie sind die pfeiler aufgebaut", "wie sind die pfeiler der brucke aufgebaut", "wie sind die pfeiler gebaut", "woraus bestehen die pfeiler", "fundament der pfeiler", "worauf stehen die pfeiler"],
    bridge_materials: ["aus welchen materialien besteht die brucke", "materialien der brucke", "woraus besteht die brucke", "baumaterial der brucke", "welche materialien wurden verwendet"],
    timeline: ["wie verlief der bau der brucke", "geschichte des bruckenbaus", "bauzeitleiste", "wie hat sich der bau entwickelt", "bau von anfang bis heute", "zeitleiste der brucke"],
    construction: ["welche bautechnik", "wie wurde die brucke gebaut", "bauverfahren", "mit welcher technik wurde gebaut"]
  },
  en: {
    who: ["who are you", "what is the bruckmandl", "who is the bruckmandl"],
    when: ["when were you", "how old are you", "what year", "when was the figure", "since when", "when do you date"],
    where: ["where are you", "where on the bridge", "which side of the bridge", "whereabouts"],
    fact_legend: ["what is fact", "fact and legend", "fact or legend", "what is true", "what is real", "what's fact"],
    legend: ["tell me the legend", "the legend", "builder legend", "devil pact", "pact with the devil", "story of the"],
    previous_figures: ["earlier figures", "previous figures", "older figures", "what happened to the"],
    // "what material" (bare/generic) was replaced with "what material are
    // you" (Phase: bridge knowledge expansion) — the bare form is a
    // substring of "what materials" (plural), which would otherwise
    // false-positive-match the new bridge_materials topic's own questions
    // ("what materials is the bridge...") and produce a scoring tie. The
    // statue's own canonical question ("What material are you made from?")
    // still matches this list unambiguously.
    material: ["what are you made of", "what material are you", "made from"],
    detail: ["show me a detail", "important detail", "what does that shield mean", "shield mean", "show me something"],
    // New bridge-level topics — phrased about "the bridge", never "you", so
    // they never collide with the 8 statue-focused lists above.
    // (Formerly noted here: hand-authored keywords had to be written WITHOUT
    // apostrophes/accents as a fragile convention, since only the INPUT text
    // was normalized, never the keyword strings themselves. That convention
    // is no longer required — every keyword in INTENT_KEYWORDS is now run
    // through the same normalizeQuestionText() pipeline once at module load
    // (see the pass right after this object literal), so a keyword written
    // WITH an apostrophe or accent, e.g. "bridge's", would normalize and
    // match correctly too. Possessive phrasing is still written as a plain
    // compound below purely by longstanding convention, not because the
    // apostrophe form would fail.)
    bridge_overview: ["what is the stone bridge", "what is the bridge", "tell me about the bridge", "how long is the bridge", "how many arches does the bridge have", "how old is the bridge", "describe the bridge"],
    arches: ["how were the arches built", "building the arches", "arch construction"],
    piers: ["how are the piers built", "what are the piers made of", "pier foundation", "what do the piers stand on"],
    bridge_materials: ["what materials is the bridge made of", "what materials is the bridge built from", "materials of the bridge", "building materials of the bridge"],
    timeline: ["construction timeline", "how did the construction develop", "from start to today", "timeline of the bridge construction"],
    construction: ["what construction technique", "how was the bridge built", "construction method", "what technique was used to build"]
  },
  es: {
    who: ["quien eres", "quien es el bruckmandl", "que es el bruckmandl"],
    when: ["cuando te hicieron", "de que ano eres", "cuando te pusieron", "cuando fuiste instalado", "cuantos anos tienes", "desde cuando", "de cuando data"],
    where: ["donde estas", "en que parte del puente", "donde te encuentras", "en que lado del puente"],
    fact_legend: ["que es verdad", "hecho y leyenda", "que es hecho", "que es real", "que es cierto"],
    legend: ["cuentame la leyenda", "la leyenda", "leyenda del maestro", "pacto con el diablo"],
    previous_figures: ["otras figuras", "figuras anteriores", "figuras previas", "que paso con las"],
    // Bare "de que material" / "que material" were replaced with phrasing
    // anchored to "estas hecho" (Phase: bridge knowledge expansion) — the
    // bare forms are substrings of "de que materiales" / "que materiales"
    // (plural), which would otherwise false-positive-match the new
    // bridge_materials topic's own questions and produce a scoring tie.
    // The statue's own canonical question ("¿De qué material estás
    // hecho?") still matches this list unambiguously.
    material: ["de que material estas hecho", "material estas hecho", "hecho de que"],
    detail: ["muestrame un detalle", "detalle importante", "que significa ese escudo", "significado del escudo"],
    // New bridge-level topics — phrased about "el puente", never "tu"/"tu
    // eres", so they never collide with the 8 statue-focused lists above.
    bridge_overview: ["que es el puente de piedra", "que es el puente", "hablame del puente", "cuanto mide el puente", "cuantos arcos tiene el puente", "cuantos anos tiene el puente", "describe el puente"],
    arches: ["como se construyeron los arcos", "como se construyeron los arcos del puente", "construccion de los arcos"],
    piers: ["como estan construidos los pilares", "como estan construidos los pilares del puente", "de que estan hechos los pilares", "cimentacion de los pilares", "sobre que se apoyan los pilares"],
    bridge_materials: ["de que materiales esta construido el puente", "de que materiales esta hecho el puente", "materiales del puente", "de que esta construido el puente"],
    timeline: ["como se desarrollo la construccion del puente", "historia de la construccion del puente", "linea de tiempo de la construccion", "desde el inicio hasta hoy"],
    construction: ["que tecnica de construccion", "como se construyo el puente", "metodo de construccion", "que tecnica se utilizo"]
  }
};

// Every canonical button question is also always a valid, guaranteed match
// for its own topic — appended once here rather than repeated by hand above.
Object.keys(BRUCKMANDL_QA).forEach((lang) => {
  BRUCKMANDL_QA[lang].forEach((entry) => {
    const dict = INTENT_KEYWORDS[lang];
    if (dict && dict[entry.topic]) dict[entry.topic].push(normalizeQuestionText(entry.question));
  });
});

// Normalize every keyword phrase itself through the exact same
// normalizeQuestionText() pipeline used for the user's typed input — once,
// here, at module load (not on every matchBruckmandlIntent() call, for
// performance). This retires the previously fragile, comment-enforced-only
// convention of hand-authoring every keyword already lowercase/unaccented/
// apostrophe-free: keywords can now safely contain accents (ä/ö/ü/ñ/é) or
// straight/curly apostrophes without silently failing to match, because
// both sides of every text.includes(kw) comparison in matchBruckmandlIntent()
// now go through the identical normalization. Normalizing an
// already-normalized string is a no-op, so for every keyword that was
// already hand-written correctly (the entire existing list, verified
// keyword-by-keyword) this is a pure robustness addition with zero
// behavior change; it only newly "fixes" keywords that were previously
// silently dead (e.g. EN fact_legend's "what's fact", which contained a
// literal apostrophe and could never match the apostrophe-stripped input).
Object.keys(INTENT_KEYWORDS).forEach((lang) => {
  const dict = INTENT_KEYWORDS[lang];
  Object.keys(dict).forEach((topic) => {
    dict[topic] = dict[topic].map((kw) => normalizeQuestionText(kw));
  });
});

/**
 * Matches free-typed text to one of the canonical topics, or null if no
 * confident match exists. NEVER guesses under a genuine tie — see the
 * tie-break rule documented in the comment block above normalizeQuestionText().
 * @param {string} rawText
 * @param {string} lang
 * @returns {string|null} topic id
 */
export function matchBruckmandlIntent(rawText, lang) {
  const text = normalizeQuestionText(rawText);
  if (!text) return null;
  const dict = INTENT_KEYWORDS[lang] || INTENT_KEYWORDS.en;

  // Per-topic score = number of keyword phrases that are substrings of the
  // normalized input. Per-topic maxMatchLen = length (in normalized
  // characters) of the single LONGEST keyword phrase that matched — used
  // only to break ties in score (see rule below).
  const scored = [];
  BRUCKMANDL_TOPICS.forEach((topic) => {
    const keywords = dict[topic] || [];
    let score = 0;
    let maxMatchLen = 0;
    keywords.forEach((kw) => {
      if (kw && text.includes(kw)) {
        score++;
        if (kw.length > maxMatchLen) maxMatchLen = kw.length;
      }
    });
    if (score > 0) scored.push({ topic, score, maxMatchLen });
  });

  if (scored.length === 0) return null;

  // Deterministic tie-break (documented in full above normalizeQuestionText()):
  //   1. Highest score wins.
  //   2. Tie in score -> longest maxMatchLen wins (more specific match).
  //   3. Still tied -> null. Never guess further.
  scored.sort((a, b) => b.score - a.score || b.maxMatchLen - a.maxMatchLen);
  const [first, second] = scored;
  if (second && second.score === first.score && second.maxMatchLen === first.maxMatchLen) {
    return null;
  }
  return first.topic;
}
