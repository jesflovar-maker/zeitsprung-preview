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
// Canonical topic ids — same order as the 8 originally-approved suggestion
// buttons. Behavioral metadata (pose/evidence) is language-independent, so
// it lives here once rather than being repeated per language.
// ---------------------------------------------------------------------------
export const BRUCKMANDL_TOPICS = [
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
  detail: "point"
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
  detail: ["uncertain"]
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
// produce a historical answer (§5 of the brief). Ties (two topics with the
// same nonzero keyword-hit count) resolve to "no match" — the caller must
// show the fallback rather than guess.
// ---------------------------------------------------------------------------
function normalizeQuestionText(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining accents/umlauts (ä/ü/é/ñ -> a/u/e/n)
    .replace(/[¿?¡!.,;:()"'«»]/g, " ")
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
    detail: ["zeig mir ein detail", "wichtiges detail", "was bedeutet das wappen", "wappen bedeutung", "zeig mir etwas", "zeig mir ein wichtiges detail"]
  },
  en: {
    who: ["who are you", "what is the bruckmandl", "who is the bruckmandl"],
    when: ["when were you", "how old are you", "what year", "when was the figure", "since when", "when do you date"],
    where: ["where are you", "where on the bridge", "which side of the bridge", "whereabouts"],
    fact_legend: ["what is fact", "fact and legend", "fact or legend", "what is true", "what is real", "what's fact"],
    legend: ["tell me the legend", "the legend", "builder legend", "devil pact", "pact with the devil", "story of the"],
    previous_figures: ["earlier figures", "previous figures", "older figures", "what happened to the"],
    material: ["what are you made of", "what material", "made from"],
    detail: ["show me a detail", "important detail", "what does that shield mean", "shield mean", "show me something"]
  },
  es: {
    who: ["quien eres", "quien es el bruckmandl", "que es el bruckmandl"],
    when: ["cuando te hicieron", "de que ano eres", "cuando te pusieron", "cuando fuiste instalado", "cuantos anos tienes", "desde cuando", "de cuando data"],
    where: ["donde estas", "en que parte del puente", "donde te encuentras", "en que lado del puente"],
    fact_legend: ["que es verdad", "hecho y leyenda", "que es hecho", "que es real", "que es cierto"],
    legend: ["cuentame la leyenda", "la leyenda", "leyenda del maestro", "pacto con el diablo"],
    previous_figures: ["otras figuras", "figuras anteriores", "figuras previas", "que paso con las"],
    material: ["de que material", "que material", "hecho de que"],
    detail: ["muestrame un detalle", "detalle importante", "que significa ese escudo", "significado del escudo"]
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

/**
 * Matches free-typed text to one of the 8 canonical topics, or null if no
 * confident match exists. NEVER guesses under a tie.
 * @param {string} rawText
 * @param {string} lang
 * @returns {string|null} topic id
 */
export function matchBruckmandlIntent(rawText, lang) {
  const text = normalizeQuestionText(rawText);
  if (!text) return null;
  const dict = INTENT_KEYWORDS[lang] || INTENT_KEYWORDS.en;
  let best = null;
  let bestScore = 0;
  let tie = false;
  BRUCKMANDL_TOPICS.forEach((topic) => {
    const keywords = dict[topic] || [];
    let score = 0;
    keywords.forEach((kw) => {
      if (text.includes(kw)) score++;
    });
    if (score > bestScore) {
      bestScore = score;
      best = topic;
      tie = false;
    } else if (score === bestScore && score > 0 && topic !== best) {
      tie = true;
    }
  });
  if (bestScore === 0 || tie) return null;
  return best;
}
