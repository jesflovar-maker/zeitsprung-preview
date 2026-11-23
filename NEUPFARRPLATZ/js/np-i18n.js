// NEUPFARRPLATZ · JÜDISCHES VIERTEL — DE / EN / ES (Phase 07B).
// HISTORICAL_BRIEFING = PENDING (Accuracy Rules, monument 5). Every label below is a VISUAL-STATE / chapter label derived from
// the owner material — never a documentary dating claim. No years, centuries or date ranges are published.
// Structure-ready: each K entry carries an empty `period` slot that validated YEAR / DATE RANGE / PERIOD text can fill later
// (np-main.js shows it automatically when non-empty) without any runtime change.
// K09 (Misrach memorial floor plan): OWNER_APPROVED_VISUAL_KFRAME + GEOMETRY_REVIEW_PENDING — no text describes its geometry.
export const LANGS = ["de", "en", "es"];
export const STORAGE_KEY = "zeitsprung_v2_lang";

// K01–K10: [state (large), short title (medium), very short visual description]
const K = {
  de: [
    ["Jüdisches Viertel", "Viertel und Synagoge", "Häuser, Gassen und die Synagoge."],
    ["Abbruch", "Trümmerfläche", "Das Viertel ist abgetragen, Fundamente liegen frei."],
    ["Kirchenbau", "Gerüst und Kran", "Auf dem Platz wächst eine Kirche."],
    ["Kirchenbau", "Rohbau", "Die Türme sind noch unvollendet."],
    ["Kirche", "Ostteil vollendet", "Der Chor zwischen den Türmen steht."],
    ["Turmbau", "Kran am Turm", "Arbeit an den Türmen."],
    ["Späterer Platz", "Pferdewagen", "Markt und Verkehr auf dem Platz."],
    ["Archäologie", "Grabung", "Unter dem Pflaster wird gegraben."],
    ["Misrach", "Der weiße Grundriss", "Ein heller Grundriss im Pflaster des Platzes."],
    ["Heute", "Grundriss und Lichtmodell", "Über dem Grundriss erscheint die Synagoge als Lichtmodell."],
  ],
  en: [
    ["Jewish Quarter", "The quarter and the synagogue", "Houses, lanes and the synagogue."],
    ["Demolition", "Field of rubble", "The quarter is gone; foundations lie exposed."],
    ["Church construction", "Scaffold and crane", "A church rises on the square."],
    ["Church construction", "Shell", "The towers are still unfinished."],
    ["Church", "East end completed", "The choir between the towers stands."],
    ["Tower work", "Crane at the tower", "Work on the towers."],
    ["Later square", "Horse carts", "Market and traffic on the square."],
    ["Archaeology", "Excavation", "Digging beneath the paving."],
    ["Misrach", "The white floor plan", "A pale floor plan set into the paving of the square."],
    ["Today", "Floor plan and light model", "Above the floor plan the synagogue appears as a light model."],
  ],
  es: [
    ["Barrio judío", "El barrio y la sinagoga", "Casas, callejas y la sinagoga."],
    ["Demolición", "Campo de escombros", "El barrio ha desaparecido; los cimientos quedan al descubierto."],
    ["Construcción de la iglesia", "Andamio y grúa", "Una iglesia crece sobre la plaza."],
    ["Construcción de la iglesia", "Obra gruesa", "Las torres aún están sin terminar."],
    ["Iglesia", "Cabecera terminada", "El coro entre las torres ya se alza."],
    ["Obras en la torre", "Grúa en la torre", "Trabajos en las torres."],
    ["Plaza posterior", "Carros de caballos", "Mercado y tráfico en la plaza."],
    ["Arqueología", "Excavación", "Se excava bajo el pavimento."],
    ["Misrach", "La planta blanca", "Una planta clara integrada en el pavimento de la plaza."],
    ["Hoy", "Planta y modelo de luz", "Sobre la planta aparece la sinagoga como modelo de luz."],
  ],
};
// validated period text goes here later (same index as K); empty = not shown
const PERIOD = ["", "", "", "", "", "", "", "", "", ""];
const kf = (l) => K[l].map(([state, title, d], i) => ({ n: "K" + String(i + 1).padStart(2, "0"), state, title, d, period: PERIOD[i] }));

export const STR = {
  de: {
    skip: "Zum Inhalt springen", nav: "Kapitel", langLabel: "Sprache", back: "ALLE MONUMENTE", backShort: "MONUMENTE",
    navItems: ["Heute", "Viertel", "Synagoge", "Zeit", "Film", "Grundriss", "Kirche", "Misrach"],
    hero: { eyebrow: "MONUMENT 05 · ALTSTADT", title: "NEUPFARRPLATZ", sub: "JÜDISCHES VIERTEL", tag: "Ein Platz, viele Zeitschichten", start: "ERLEBNIS STARTEN", all: "ALLE MONUMENTE", alt: "Neupfarrplatz in Regensburg, die Neupfarrkirche als Lichtmodell in der Abenddämmerung", videoAlt: "Film: der weiße Grundriss auf dem Platz, darüber die Synagoge als Lichtmodell" },
    snd: { on: "Ton an", off: "Ton aus" },
    now: { eyebrow: "01 · HEUTE", h: "Der Neupfarrplatz", p1: "Ein offener Platz im Herzen der Regensburger Altstadt, in seiner Mitte die Neupfarrkirche.", p2: "Die folgenden Bilder führen durch seine Zeitschichten – vom jüdischen Viertel bis heute." },
    quarter: { eyebrow: "02 · JÜDISCHES VIERTEL", h: "Gassen und Häuser", p: "Szenen aus dem mittelalterlichen Viertel.",
      items: [["Am Portal der Synagoge", "Menschen vor dem Eingang."], ["In einer Gasse", "Bewohner zwischen den Häusern des Viertels."], ["Zwischen Steinhäusern", "Die Synagoge inmitten der Bebauung."]] },
    people: { eyebrow: "03 · ALLTAG", h: "Menschen im Viertel", p: "Lernen, Handel und Handwerk.",
      items: [["Lernen", "Gemeinsames Studium in der Synagoge."], ["Töpferware und Tausch", "Handel vor den Häusern."], ["Zimmerei", "Arbeit mit Holz im Viertel."], ["Steinmetze", "Behauen der Steinblöcke."]] },
    syn: { eyebrow: "04 · DIE SYNAGOGE", h: "Halle, Bima und Gewölbe", p: "Ein Gang durch den Raum, von der Halle bis ins Detail.",
      items: [["Drei Pfeiler", "Die Halle unter Kreuzgewölben."], ["Der Raum", "Blick durch die Halle."], ["Gewölbe", "Pfeiler und Kreuzgewölbe."], ["Halle und Bima", "Die Bima im Zentrum der Halle."], ["Die Bima", "Steinerne Bima mit Arkaden."], ["Toraschrein", "Eine Nische in der Wand."], ["Fenster", "Spitzbogenfenster und Okulus."], ["Sechspass", "Rundfenster am Vorbau."], ["Detail der Bima", "Säulchen und Brüstung aus Stein."]] },
    kf: { eyebrow: "05 · ZEITSCHICHTEN", h: "Ein Ort, zehn Zustände", p: "Derselbe Blick auf den Platz in zehn Bildzuständen. Die Bezeichnungen beschreiben das Bild, nicht ein Datum.", items: kf("de") },
    tl: { eyebrow: "06 · ZEITLEISTE", h: "Der Film", p: "Alle zehn Zustände in einem Film. Der Film hat keinen Ton.", alt: "Film: der Neupfarrplatz in zehn Zuständen",
      play: "Abspielen", pause: "Pause", full: "Vollbild", fullExit: "Vollbild beenden", seek: "Position im Film", chapters: "Kapitel" },
    plan: { eyebrow: "07 · GRUNDRISS", h: "Von oben", p: "Draufsicht auf Kirche und Synagoge: Bauplatz, Struktur, Materialisierung.",
      items: [["Bauplatz", "Fundamente und Arbeiter."], ["Mauern wachsen", "Die Umrisse werden sichtbar."], ["Bau und Lichtplan", "Bauzustand mit leuchtendem Plan."], ["Lichtmodell", "Der Bau ganz als Licht."], ["Materialisierung", "Licht wird zu Stein."], ["Dächer im Licht", "Die Dächer noch als Linien."], ["Dächer im Übergang", "Ziegel ersetzen das Licht."], ["Vollendet", "Kirche und Synagogenmodell."]] },
    holo: { eyebrow: "08 · LICHTMODELL", h: "Die Synagoge im Licht", p: "Die Synagoge als leuchtendes Modell – im Schnitt, im Innenraum und auf dem heutigen Platz.",
      items: [["Schnittmodell", "Die Halle geöffnet."], ["Innenraum", "Pfeiler und Gewölbe aus Licht."], ["Auf dem heutigen Platz", "Das Lichtmodell vor der Kirche."], ["Kapitell und Gewölbe", "Detail im Licht über dem Platz."], ["Zwischen Stein und Licht", "Eine Säule, halb Stein, halb Licht."]] },
    church: { eyebrow: "09 · NEUPFARRKIRCHE", h: "Die Neupfarrkirche", p: "Modelle und Lichtansichten der Kirche.",
      items: [["Modell", "Ostansicht mit den beiden Türmen."], ["Chor", "Der Chor zwischen den Türmen."], ["Lichtmodell", "Die Kirche mit leuchtenden Kanten."], ["Innenraum", "Das Kirchenschiff im Licht."], ["Orgelempore", "Blick zur Empore."]] },
    arch: { eyebrow: "10 · ARCHÄOLOGIE", h: "Unter dem Pflaster", p: "Vom Platz zur Grabung.",
      items: [["Vom Platz zur Grabung", "Der Platz öffnet sich."], ["Grabung", "Mauerreste im Boden."], ["Im Detail", "Die Grabung aus der Nähe."]] },
    mis: { eyebrow: "11 · MISRACH", h: "Der weiße Grundriss", p: "Ein heller Grundriss im Pflaster; darüber, als Lichtmodell, die Synagoge.",
      items: [["Von der Grabung zum Grundriss", "Aus der Grabung wird der Grundriss."], ["Der Grundriss", "Hell im Pflaster des Platzes."], ["Lichtmodell", "Die Synagoge erscheint über dem Grundriss."]] },
    ret: { eyebrow: "12 · HEUTE", h: "Zurück im Heute", p: "Der Neupfarrplatz am Abend." },
    tr: { eyebrow: "13 · TRAILER", h: "Neupfarrplatz in Bildern", p: "Ein kurzer Film durch die Zeitschichten des Platzes.", l1: "ZEITSPRUNG", l2: "NEUPFARRPLATZ", l3: "JÜDISCHES VIERTEL", line: "Ein Platz, viele Zeitschichten", alt: "Trailer Neupfarrplatz" },
    end: { title: "Reise fortsetzen", text: "Regensburg erzählt weiter – wählen Sie Ihr nächstes Monument.", all: "ALLE MONUMENTE", next: "DIREKT WEITER ZU", trailer: "TRAILER ANSEHEN" },
    zoom: "Bild vergrößern",
  },
  en: {
    skip: "Skip to content", nav: "Chapters", langLabel: "Language", back: "ALL MONUMENTS", backShort: "MONUMENTS",
    navItems: ["Today", "Quarter", "Synagogue", "Time", "Film", "Plan", "Church", "Misrach"],
    hero: { eyebrow: "MONUMENT 05 · OLD TOWN", title: "NEUPFARRPLATZ", sub: "JEWISH QUARTER", tag: "One square, many layers of time", start: "START EXPERIENCE", all: "ALL MONUMENTS", alt: "Neupfarrplatz in Regensburg, the Neupfarrkirche as a light model at dusk", videoAlt: "Film: the white floor plan on the square, the synagogue above it as a light model" },
    snd: { on: "Sound on", off: "Sound off" },
    now: { eyebrow: "01 · TODAY", h: "Neupfarrplatz", p1: "An open square in the heart of Regensburg's old town, with the Neupfarrkirche at its centre.", p2: "The following images lead through its layers of time – from the Jewish quarter to today." },
    quarter: { eyebrow: "02 · JEWISH QUARTER", h: "Lanes and houses", p: "Scenes from the medieval quarter.",
      items: [["At the synagogue portal", "People in front of the entrance."], ["In a lane", "Residents between the houses of the quarter."], ["Among stone houses", "The synagogue amid the buildings."]] },
    people: { eyebrow: "03 · DAILY LIFE", h: "People of the quarter", p: "Study, trade and craft.",
      items: [["Study", "Learning together in the synagogue."], ["Pottery and barter", "Trade in front of the houses."], ["Carpentry", "Woodwork in the quarter."], ["Stonemasons", "Dressing the stone blocks."]] },
    syn: { eyebrow: "04 · THE SYNAGOGUE", h: "Hall, bimah and vaults", p: "A walk through the space, from the hall to the detail.",
      items: [["Three pillars", "The hall under cross vaults."], ["The space", "A view through the hall."], ["Vaults", "Pillars and cross vaults."], ["Hall and bimah", "The bimah at the centre of the hall."], ["The bimah", "Stone bimah with arcades."], ["Torah ark", "A niche in the wall."], ["Window", "Pointed window and oculus."], ["Sexfoil", "Round window on the porch."], ["Bimah detail", "Small columns and stone balustrade."]] },
    kf: { eyebrow: "05 · LAYERS OF TIME", h: "One place, ten states", p: "The same view of the square in ten visual states. The labels describe the image, not a date.", items: kf("en") },
    tl: { eyebrow: "06 · TIMELINE", h: "The film", p: "All ten states in one film. The film has no sound.", alt: "Film: Neupfarrplatz in ten states",
      play: "Play", pause: "Pause", full: "Fullscreen", fullExit: "Exit fullscreen", seek: "Position in the film", chapters: "Chapters" },
    plan: { eyebrow: "07 · PLAN", h: "From above", p: "Top view of the church and the synagogue: site, structure, materialisation.",
      items: [["Building site", "Foundations and workers."], ["Walls rise", "The outlines become visible."], ["Works and light plan", "Construction with a glowing plan."], ["Light model", "The building entirely as light."], ["Materialisation", "Light turns into stone."], ["Roofs in light", "The roofs still as lines."], ["Roofs in transition", "Tiles replace the light."], ["Completed", "Church and synagogue model."]] },
    holo: { eyebrow: "08 · LIGHT MODEL", h: "The synagogue in light", p: "The synagogue as a glowing model – in section, inside and on today's square.",
      items: [["Section model", "The hall opened up."], ["Interior", "Pillars and vaults of light."], ["On today's square", "The light model in front of the church."], ["Capital and vault", "Detail in light above the square."], ["Between stone and light", "A column, half stone, half light."]] },
    church: { eyebrow: "09 · NEUPFARRKIRCHE", h: "The Neupfarrkirche", p: "Models and light views of the church.",
      items: [["Model", "East view with the two towers."], ["Choir", "The choir between the towers."], ["Light model", "The church with glowing edges."], ["Interior", "The nave in light."], ["Organ gallery", "View towards the gallery."]] },
    arch: { eyebrow: "10 · ARCHAEOLOGY", h: "Beneath the paving", p: "From the square to the excavation.",
      items: [["From square to excavation", "The square opens up."], ["Excavation", "Wall remains in the ground."], ["Close up", "The excavation seen from near."]] },
    mis: { eyebrow: "11 · MISRACH", h: "The white floor plan", p: "A pale floor plan in the paving; above it, as a light model, the synagogue.",
      items: [["From excavation to floor plan", "The excavation becomes the floor plan."], ["The floor plan", "Pale in the paving of the square."], ["Light model", "The synagogue appears above the floor plan."]] },
    ret: { eyebrow: "12 · TODAY", h: "Back to today", p: "Neupfarrplatz in the evening." },
    tr: { eyebrow: "13 · TRAILER", h: "Neupfarrplatz in pictures", p: "A short film through the square's layers of time.", l1: "ZEITSPRUNG", l2: "NEUPFARRPLATZ", l3: "JEWISH QUARTER", line: "One square, many layers of time", alt: "Neupfarrplatz trailer" },
    end: { title: "Continue the journey", text: "Regensburg's story goes on – choose your next monument.", all: "ALL MONUMENTS", next: "CONTINUE DIRECTLY TO", trailer: "WATCH TRAILER" },
    zoom: "Enlarge image",
  },
  es: {
    skip: "Saltar al contenido", nav: "Capítulos", langLabel: "Idioma", back: "TODOS LOS MONUMENTOS", backShort: "MONUMENTOS",
    navItems: ["Hoy", "Barrio", "Sinagoga", "Tiempo", "Película", "Planta", "Iglesia", "Misrach"],
    hero: { eyebrow: "MONUMENTO 05 · CASCO ANTIGUO", title: "NEUPFARRPLATZ", sub: "BARRIO JUDÍO", tag: "Una plaza, muchas capas de tiempo", start: "INICIAR EXPERIENCIA", all: "TODOS LOS MONUMENTOS", alt: "Neupfarrplatz en Regensburg, la Neupfarrkirche como modelo de luz al anochecer", videoAlt: "Película: la planta blanca en la plaza y, sobre ella, la sinagoga como modelo de luz" },
    snd: { on: "Activar sonido", off: "Quitar sonido" },
    now: { eyebrow: "01 · HOY", h: "La Neupfarrplatz", p1: "Una plaza abierta en el corazón del casco antiguo de Regensburg, con la Neupfarrkirche en su centro.", p2: "Las imágenes siguientes recorren sus capas de tiempo: del barrio judío hasta hoy." },
    quarter: { eyebrow: "02 · BARRIO JUDÍO", h: "Callejas y casas", p: "Escenas del barrio medieval.",
      items: [["Ante el portal de la sinagoga", "Personas frente a la entrada."], ["En una calleja", "Vecinos entre las casas del barrio."], ["Entre casas de piedra", "La sinagoga en medio del caserío."]] },
    people: { eyebrow: "03 · VIDA COTIDIANA", h: "Gente del barrio", p: "Estudio, comercio y oficio.",
      items: [["Estudio", "Aprendizaje en común en la sinagoga."], ["Cerámica y trueque", "Comercio delante de las casas."], ["Carpintería", "Trabajo con madera en el barrio."], ["Canteros", "Labra de los bloques de piedra."]] },
    syn: { eyebrow: "04 · LA SINAGOGA", h: "Sala, bimá y bóvedas", p: "Un recorrido por el espacio, de la sala al detalle.",
      items: [["Tres pilares", "La sala bajo bóvedas de crucería."], ["El espacio", "Vista a través de la sala."], ["Bóvedas", "Pilares y bóvedas de crucería."], ["Sala y bimá", "La bimá en el centro de la sala."], ["La bimá", "Bimá de piedra con arcadas."], ["Arca de la Torá", "Un nicho en el muro."], ["Ventana", "Ventana ojival y óculo."], ["Sexifolio", "Óculo del vestíbulo."], ["Detalle de la bimá", "Columnillas y antepecho de piedra."]] },
    kf: { eyebrow: "05 · CAPAS DE TIEMPO", h: "Un lugar, diez estados", p: "La misma vista de la plaza en diez estados visuales. Las etiquetas describen la imagen, no una fecha.", items: kf("es") },
    tl: { eyebrow: "06 · LÍNEA DE TIEMPO", h: "La película", p: "Los diez estados en una sola película. La película no tiene sonido.", alt: "Película: la Neupfarrplatz en diez estados",
      play: "Reproducir", pause: "Pausa", full: "Agrandar", fullExit: "Salir de pantalla completa", seek: "Posición en la película", chapters: "Capítulos" },
    plan: { eyebrow: "07 · PLANTA", h: "Desde arriba", p: "Vista cenital de la iglesia y la sinagoga: solar, estructura, materialización.",
      items: [["Solar", "Cimientos y trabajadores."], ["Crecen los muros", "Los contornos se hacen visibles."], ["Obra y plano de luz", "Estado de obra con plano luminoso."], ["Modelo de luz", "El edificio entero como luz."], ["Materialización", "La luz se convierte en piedra."], ["Tejados de luz", "Los tejados aún como líneas."], ["Tejados en transición", "Las tejas sustituyen a la luz."], ["Terminado", "Iglesia y maqueta de la sinagoga."]] },
    holo: { eyebrow: "08 · MODELO DE LUZ", h: "La sinagoga en luz", p: "La sinagoga como modelo luminoso: en sección, en su interior y sobre la plaza actual.",
      items: [["Maqueta en sección", "La sala abierta."], ["Interior", "Pilares y bóvedas de luz."], ["Sobre la plaza actual", "El modelo de luz ante la iglesia."], ["Capitel y bóveda", "Detalle de luz sobre la plaza."], ["Entre piedra y luz", "Una columna, mitad piedra, mitad luz."]] },
    church: { eyebrow: "09 · NEUPFARRKIRCHE", h: "La Neupfarrkirche", p: "Maquetas y vistas de luz de la iglesia.",
      items: [["Maqueta", "Vista oriental con las dos torres."], ["Coro", "El coro entre las torres."], ["Modelo de luz", "La iglesia con aristas luminosas."], ["Interior", "La nave en luz."], ["Tribuna del órgano", "Vista hacia la tribuna."]] },
    arch: { eyebrow: "10 · ARQUEOLOGÍA", h: "Bajo el pavimento", p: "De la plaza a la excavación.",
      items: [["De la plaza a la excavación", "La plaza se abre."], ["Excavación", "Restos de muros en el suelo."], ["De cerca", "La excavación vista de cerca."]] },
    mis: { eyebrow: "11 · MISRACH", h: "La planta blanca", p: "Una planta clara en el pavimento; sobre ella, como modelo de luz, la sinagoga.",
      items: [["De la excavación a la planta", "La excavación se convierte en planta."], ["La planta", "Clara en el pavimento de la plaza."], ["Modelo de luz", "La sinagoga aparece sobre la planta."]] },
    ret: { eyebrow: "12 · HOY", h: "De vuelta al presente", p: "La Neupfarrplatz al anochecer." },
    tr: { eyebrow: "13 · TRÁILER", h: "La Neupfarrplatz en imágenes", p: "Una breve película por las capas de tiempo de la plaza.", l1: "ZEITSPRUNG", l2: "NEUPFARRPLATZ", l3: "BARRIO JUDÍO", line: "Una plaza, muchas capas de tiempo", alt: "Tráiler Neupfarrplatz" },
    end: { title: "Continuar el viaje", text: "Regensburg sigue contando su historia: elige tu próximo monumento.", all: "TODOS LOS MONUMENTOS", next: "CONTINUAR DIRECTAMENTE A", trailer: "VER TRÁILER" },
    zoom: "Ampliar imagen",
  },
};

/* 07B.1 — GLOBAL BRÜCKMANDL GUIDE data (ZEITSPRUNG_GLOBAL_GUIDE_V1, engine js/zt-guide.js).
   HISTORICAL_BRIEFING = PENDING: conservative topics; answers reuse ONLY the visual descriptions above (no dates, no
   Misrach geometry). A dedicated topic answers requests for precise details with the owner-defined pending sentence. */
{
  const UIG = {
    de: { role: "Ihr ZEITSPRUNG-Begleiter", hi: "Grüß Gott! Sonst wache ich auf der Steinernen Brücke — hier begleite ich Sie über den Neupfarrplatz. Wählen Sie ein Thema.", go: "Zum Kapitel →", ctx: "PASSEND ZU DIESEM KAPITEL", aria: "Brückmandl — Ihr ZEITSPRUNG-Begleiter",
      t: ["Jüdisches Viertel", "Synagoge", "K01–K10 Entwicklung", "Archäologie", "Neupfarrkirche", "Misrach", "Genaue Daten?"], pending: "Die historische Prüfung dieses Details ist noch nicht abgeschlossen." },
    en: { role: "Your ZEITSPRUNG guide", hi: "Grüß Gott! I usually keep watch on the Stone Bridge — here I accompany you across Neupfarrplatz. Choose a topic.", go: "Go to chapter →", ctx: "FOR THIS CHAPTER", aria: "Bruckmandl — your ZEITSPRUNG guide",
      t: ["Jewish Quarter", "Synagogue", "K01–K10 development", "Archaeology", "Neupfarrkirche", "Misrach", "Exact dates?"], pending: "Historical validation for this detail is still pending." },
    es: { role: "Su guía ZEITSPRUNG", hi: "¡Grüß Gott! Normalmente vigilo el Puente de Piedra; aquí le acompaño por la Neupfarrplatz. Elija un tema.", go: "Ir al capítulo →", ctx: "PARA ESTE CAPÍTULO", aria: "Bruckmandl — su guía ZEITSPRUNG",
      t: ["Barrio judío", "Sinagoga", "Evolución K01–K10", "Arqueología", "Neupfarrkirche", "Misrach", "¿Fechas exactas?"], pending: "La validación histórica de este detalle aún está pendiente." },
  };
  for (const l of LANGS) {
    const S = STR[l], u = UIG[l], K = S.kf.items;
    S.guide = { role: u.role, hi: u.hi, go: u.go, ctx: u.ctx, aria: u.aria, pending: u.pending };
    S.guideTopics = [
      [u.t[0], S.quarter.p + " " + K[0].d],
      [u.t[1], S.syn.h + ". " + S.syn.p],
      [u.t[2], S.kf.p],
      [u.t[3], K[7].d + " " + S.arch.p],
      [u.t[4], S.now.p1],
      [u.t[5], S.mis.p],
      [u.t[6], u.pending],
    ];
  }
}
