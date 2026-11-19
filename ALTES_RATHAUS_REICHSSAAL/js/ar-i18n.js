// ALTES RATHAUS · REICHSSAAL — text (DE / EN / ES). Phase 06C.2: cinematic vertical scroll.
// Every historical statement comes from 02_CONTENT/Altes_Rathaus_Reichssaal/ (claim matrix, chronology control,
// exterior geometry control, Reichssaal visual control). Not used: 1446, tower storey count, dimensions, window counts,
// seating order, named persons. People images are type figures, never named individuals.
// Visible AI / reconstruction badges and methodology notes = 0 (owner rule 2026-11-18); provenance stays in the media manifest.
export const STORAGE_KEY = "zeitsprung_v2_lang";
export const LANGS = ["de", "en", "es"];

export const STR = {
  de: {
    back: "ALLE MONUMENTE", backShort: "ALLE", langLabel: "Sprache", nav: "Kapitel", skip: "Zum Inhalt springen",
    navItems: ["Heute", "Außen", "Zeit", "Portal", "Reichssaal", "Menschen", "Material", "Heute innen"],
    scroll: "Scrollen",
    hero: { eyebrow: "REGENSBURG", title: "ALTES RATHAUS", sub: "REICHSSAAL", tag: "Vom Rathaus in den Reichssaal", start: "ERLEBNIS STARTEN", all: "ALLE MONUMENTE", alt: "Das Alte Rathaus in Regensburg mit Reichssaalbau, Rathausturm und barockem Rathausflügel" },
    now: { eyebrow: "01 · HEUTE", h: "Ein Bau aus vielen Jahrhunderten", p1: "Mittelalterliche Teile, ein gotischer Saalbau und barocke Flügel stehen am Rathausplatz nebeneinander.", p2: "Hier tagte von 1663 bis 1806 der Immerwährende Reichstag." },
    out: { eyebrow: "02 · AUSSEN", h: "Die Fassade lesen", p: "Scrollen Sie: Turm, Erker, Barock – von links nach rechts.", items: [
      ["Rathausturm", "Kern aus der Mitte des 13. Jahrhunderts, rund 55 m hoch. Das Turmdach mit Laterne entstand erst im frühen 18. Jahrhundert."],
      ["Erker", "Der Standerker sitzt an der Fensterfront des Reichssaals."],
      ["Barocker Flügel", "Rechts schließt das barocke Rathaus an: 1660–1662 und 1721–1723 errichtet."]] },
    hall: { eyebrow: "04 · REICHSSAALBAU", h: "Ein Saalbau für Feste", p1: "Um 1320/30 entstand der Reichssaalbau: zweigeschossig, gotisch, mit Stufengiebeln und Erker.", p2: "Gedacht als Tanz- und Festsaal – erst später politisches Zentrum des Reiches.", h1: "Der Rathauskomplex", h2: "Der Reichssaalbau im Komplex", erkT: "Der Erker", erkD: "Scrollen Sie: Der Erker löst sich in seine Bauteile auf.", erkAlt: "Erker des Reichssaalbaus, in Bauteile zerlegt" },
    plan: { eyebrow: "05 · ANSICHT", h: "Schichten eines Gebäudes", p: "Die Ansichten zeigen, wie die Bauteile nebeneinander und übereinander stehen – keine vermessenen Pläne.", items: [
      ["Schichten des Reichssaalbaus", "Vom Erdgeschoss bis zum Dach: die Ebenen des gotischen Saalbaus."],
      ["Ansicht des Rathauskomplexes", "Turm, Reichssaalbau und barocker Flügel in einer Front."]] },
    time: { eyebrow: "03 · ZEIT", h: "Das Rathaus wächst", p: "Scrollen Sie nach unten, und der Bau entsteht – nach oben, und die Zeit läuft zurück.", alt: "Die bauliche Entwicklung des Alten Rathauses vom leeren Bauplatz bis heute", ch: [
      ["Mitte 13. Jh. · 1245", "Der älteste Kern", "Turm und westlicher Bau entstehen. 1245 erhält Regensburg den Rang einer Freien Reichsstadt."],
      ["um 1320/30", "Der Reichssaalbau", "Der gotische Saalbau entsteht – als Tanz- und Festsaal."],
      ["1360–1363 · 1408 · 1564", "Turm, Portal, Zugang", "Nach dem Turmbrand wird der Turm wiederhergestellt. 1408 entsteht das gotische Hauptportal, 1564 ein neuer Zugang zum Saal."],
      ["1594 · 1663", "Ort der Reichstage", "Ab 1594 tagen die Reichstage nur noch in Regensburg. Ab 1663 bleibt der Reichstag dauerhaft."],
      ["1660–1662 · 1721–1723", "Barocke Erweiterung", "Das barocke Rathaus entsteht und wird später erweitert."],
      ["1803 · 1806", "Das Ende", "1803 beschließt der Reichstag den Reichsdeputationshauptschluss; Regensburg verliert den Status als Freie Reichsstadt. 1806 endet mit dem Reich auch der Reichstag."],
      ["Heute", "Museum und Empfang", "Der Reichssaal ist Museum und Ort städtischer Empfänge."]] },
    portal: { eyebrow: "06 · PORTAL", h: "Durch das Portal von 1408", p: "Scrollen Sie: Durch das gotische Hauptportal führt der Weg ins Innere.", alt: "Gotisches Hauptportal des Alten Rathauses" },
    saal: { eyebrow: "07 · REICHSSAAL", h: "Den Saal verstehen", p: "Sechs Punkte zeigen, wie der Raum aufgebaut ist und wie er genutzt wurde.", step: "Punkt", alt: "Der Reichssaal um 1700 (Rekonstruktion)", spots: [
      { t: "Decke", d: "Eine spätgotische Holzbohlendecke: flach, mit einem Längsbalken in der Mitte." },
      { t: "Fenster", d: "Hohe Spitzbogenfenster mit Maßwerk öffnen die lange Seite des Saals." },
      { t: "Erker", d: "Der Erker liegt an der Fensterfront – nach außen sichtbar am Rathausplatz." },
      { t: "Podest", d: "Am Ende des Saals: ein erhöhtes Podest mit Thron unter einem Baldachin." },
      { t: "Bänke", d: "Bänke an den Längswänden – hier saßen die Gesandten." },
      { t: "Raummitte", d: "Die Mitte des Saals blieb weitgehend frei." }] },
    people: { eyebrow: "08 · MENSCHEN", h: "Menschen im Reichssaal", p: "Wer arbeitete für den Reichstag? Scrollen Sie durch die Rollen.", items: [
      ["Gesandte", "Die Reichsstände schickten Gesandte. Sie berieten und stimmten nach den Weisungen ihrer Herren."],
      ["Schreiber", "Sekretäre und Schreiber hielten Beratungen und Beschlüsse schriftlich fest."],
      ["Kuriere", "Kuriere brachten Weisungen von den Höfen und trugen Berichte zurück."],
      ["Ratsherren", "Das Rathaus gehörte der Reichsstadt. Ihr Rat stellte die Räume für den Reichstag."],
      ["Städtische Bedienstete", "Sie verwalteten Schlüssel, Räume und Abläufe im Rathaus."]], note: "Typische Rollen – keine historischen Einzelpersonen." },
    rt: { eyebrow: "09 · REICHSTAG", h: "1663–1806", p1: "143 Jahre lang tagte hier der Immerwährende Reichstag – bis zum Ende des Heiligen Römischen Reiches.", roles: [
      ["Gesandte", "Die Reichsstände schickten Gesandte statt selbst zu kommen."], ["Prinzipalkommissar", "Er vertrat den Kaiser beim Reichstag."], ["Kollegien", "Beraten wurde auch in Nebenräumen – getrennt nach Kurfürsten, Fürsten und Städten."]] },
    mat: { eyebrow: "10 · MATERIAL", h: "Woraus der Saal gemacht ist", p: "Holz, Stein, Glas, Eisen – und die Werkzeuge dafür.", items: [
      ["Holz", "Holz trägt den Saal: die flache Bohlendecke mit Längsbalken und die Bänke an den Wänden."],
      ["Stein", "Die Gliederungen der Fassade sind aus Kalkstein; Steinmetze arbeiteten Portal und Maßwerk."],
      ["Glas", "Spitzbogenfenster mit Maßwerk bringen das Licht in den Saal."],
      ["Eisen", "Beschläge, Schlösser und Schlüssel sicherten Türen und Truhen."],
      ["Werkzeug", "Mit Knüpfel, Eisen und Winkel wurde jeder Werkstein von Hand bearbeitet."]] },
    tg: { eyebrow: "11 · REICHSSAAL HEUTE", h: "Damals und heute", p: "Wechseln Sie zwischen dem Saal um 1700 und heute.", a: "UM 1700", b: "HEUTE", altA: "Der Reichssaal um 1700 (Rekonstruktion)", altB: "Der Reichssaal heute (Visualisierung)" },
    end: { eyebrow: "12 · HEUTE", h: "Ein Gebäude, viele Zeiten", p: "Vom Festsaal zum Ort des Reichstags: Das Alte Rathaus bewahrt mehrere Jahrhunderte Architektur und Politik.", sources: "QUELLEN", srcH: "Hauptquellen", close: "Schließen", srcList: [
      "Bayerisches Landesamt für Denkmalpflege: Denkmalliste Regensburg, Altes Rathaus (D-3-62-000-956).",
      "Regensburg Tourismus GmbH: Old Town Hall.",
      "Kupferstich zum Reichstag 1653 (Flugblatt).",
      "Michael Neher: Das Rathaus in Regensburg (1841)."] },
  },
  en: {
    back: "ALL MONUMENTS", backShort: "ALL", langLabel: "Language", nav: "Chapters", skip: "Skip to content",
    navItems: ["Today", "Outside", "Time", "Portal", "Imperial Hall", "People", "Material", "Inside today"],
    scroll: "Scroll",
    hero: { eyebrow: "REGENSBURG", title: "ALTES RATHAUS", sub: "REICHSSAAL", tag: "From the Town Hall into the Imperial Hall", start: "START EXPERIENCE", all: "ALL MONUMENTS", alt: "The Old Town Hall in Regensburg with the Reichssaal building, the town hall tower and the baroque wing" },
    now: { eyebrow: "01 · TODAY", h: "A building of many centuries", p1: "Medieval parts, a Gothic hall building and baroque wings stand side by side on the Rathausplatz.", p2: "From 1663 to 1806 the Perpetual Imperial Diet met here." },
    out: { eyebrow: "02 · OUTSIDE", h: "Reading the façade", p: "Scroll: tower, oriel, baroque – from left to right.", items: [
      ["Town hall tower", "Its core dates from the mid-13th century; it is about 55 m high. The roof with lantern only came in the early 18th century."],
      ["Oriel", "The standing oriel sits on the window front of the Imperial Hall."],
      ["Baroque wing", "On the right the baroque town hall follows: built 1660–1662 and 1721–1723."]] },
    hall: { eyebrow: "04 · HALL BUILDING", h: "A hall built for festivities", p1: "Around 1320/30 the Reichssaal building was erected: two storeys, Gothic, with stepped gables and an oriel.", p2: "Meant as a dance and festival hall – only later the political centre of the Empire.", h1: "The town hall complex", h2: "The hall building within the complex", erkT: "The oriel", erkD: "Scroll: the oriel comes apart into its building parts.", erkAlt: "Oriel of the hall building, taken apart into its components" },
    plan: { eyebrow: "05 · ELEVATION", h: "Layers of a building", p: "The views show how the parts stand next to and above each other – not measured plans.", items: [
      ["Layers of the hall building", "From ground floor to roof: the levels of the Gothic hall building."],
      ["Elevation of the town hall complex", "Tower, hall building and baroque wing in one front."]] },
    time: { eyebrow: "03 · TIME", h: "The town hall grows", p: "Scroll down and the building rises – scroll up and time runs back.", alt: "The architectural evolution of the Old Town Hall from the empty site to today", ch: [
      ["mid-13th c. · 1245", "The oldest core", "The tower and the western building are built. In 1245 Regensburg becomes a Free Imperial City."],
      ["c. 1320/30", "The hall building", "The Gothic hall building is built – as a dance and festival hall."],
      ["1360–1363 · 1408 · 1564", "Tower, portal, access", "After the tower fire the tower is restored. In 1408 the Gothic main portal is built, in 1564 a new access to the hall."],
      ["1594 · 1663", "Seat of the Diets", "From 1594 the Imperial Diets meet only in Regensburg. From 1663 the Diet stays permanently."],
      ["1660–1662 · 1721–1723", "Baroque extension", "The baroque town hall is built and later extended."],
      ["1803 · 1806", "The end", "In 1803 the Diet adopts the Reichsdeputationshauptschluss; Regensburg loses its status as a Free Imperial City. In 1806 the Diet ends with the Empire."],
      ["Today", "Museum and receptions", "The Imperial Hall is a museum and a venue for city receptions."]] },
    portal: { eyebrow: "06 · PORTAL", h: "Through the portal of 1408", p: "Scroll: the way inside leads through the Gothic main portal.", alt: "Gothic main portal of the Old Town Hall" },
    saal: { eyebrow: "07 · IMPERIAL HALL", h: "Understanding the hall", p: "Six points show how the room is built and how it was used.", step: "Point", alt: "The Imperial Hall around 1700 (reconstruction)", spots: [
      { t: "Ceiling", d: "A late-Gothic timber board ceiling: flat, with a longitudinal beam in the middle." },
      { t: "Windows", d: "Tall pointed windows with tracery open the long side of the hall." },
      { t: "Oriel", d: "The oriel lies on the window front – visible from the Rathausplatz." },
      { t: "Platform", d: "At the end of the hall: a raised platform with a throne under a canopy." },
      { t: "Benches", d: "Benches along the long walls – here the envoys sat." },
      { t: "Centre", d: "The middle of the hall remained largely open." }] },
    people: { eyebrow: "08 · PEOPLE", h: "People of the Imperial Diet", p: "Who worked for the Diet? Scroll through the roles.", items: [
      ["Envoys", "The estates of the Empire sent envoys. They deliberated and voted on the instructions of their lords."],
      ["Scribes", "Secretaries and scribes put deliberations and decisions in writing."],
      ["Couriers", "Couriers brought instructions from the courts and carried reports back."],
      ["City councillors", "The town hall belonged to the Imperial City. Its council provided the rooms for the Diet."],
      ["City staff", "They looked after keys, rooms and daily routines in the town hall."]], note: "Typical roles – not historical individuals." },
    rt: { eyebrow: "09 · IMPERIAL DIET", h: "1663–1806", p1: "For 143 years the Perpetual Imperial Diet met here – until the end of the Holy Roman Empire.", roles: [
      ["Envoys", "The estates of the Empire sent envoys instead of coming themselves."], ["Principal commissioner", "He represented the emperor at the Diet."], ["Colleges", "Deliberations also took place in side rooms – separately for electors, princes and cities."]] },
    mat: { eyebrow: "10 · MATERIAL", h: "What the hall is made of", p: "Wood, stone, glass, iron – and the tools to work them.", items: [
      ["Wood", "Wood carries the hall: the flat board ceiling with its longitudinal beam and the benches along the walls."],
      ["Stone", "The façade articulation is made of limestone; stonemasons worked the portal and the tracery."],
      ["Glass", "Pointed windows with tracery bring the light into the hall."],
      ["Iron", "Fittings, locks and keys secured doors and chests."],
      ["Tools", "With mallet, chisel and square every block of stone was worked by hand."]] },
    tg: { eyebrow: "11 · THE HALL TODAY", h: "Then and now", p: "Switch between the hall around 1700 and today.", a: "AROUND 1700", b: "TODAY", altA: "The Imperial Hall around 1700 (reconstruction)", altB: "The Imperial Hall today (visualisation)" },
    end: { eyebrow: "12 · TODAY", h: "One building, many times", p: "From festival hall to the seat of the Imperial Diet: the Old Town Hall preserves several centuries of architecture and politics.", sources: "SOURCES", srcH: "Main sources", close: "Close", srcList: [
      "Bavarian State Office for the Preservation of Monuments: Denkmalliste Regensburg, Altes Rathaus (D-3-62-000-956).",
      "Regensburg Tourismus GmbH: Old Town Hall.",
      "Engraving of the Imperial Diet 1653 (broadsheet).",
      "Michael Neher: Das Rathaus in Regensburg (1841)."] },
  },
  es: {
    back: "TODOS LOS MONUMENTOS", backShort: "TODOS", langLabel: "Idioma", nav: "Capítulos", skip: "Saltar al contenido",
    navItems: ["Hoy", "Exterior", "Tiempo", "Portal", "Reichssaal", "Personas", "Material", "Hoy dentro"],
    scroll: "Desplazar",
    hero: { eyebrow: "REGENSBURG", title: "ALTES RATHAUS", sub: "REICHSSAAL", tag: "Del Ayuntamiento al Reichssaal", start: "INICIAR EXPERIENCIA", all: "TODOS LOS MONUMENTOS", alt: "El Antiguo Ayuntamiento de Regensburg con el edificio del Reichssaal, la torre y el ala barroca" },
    now: { eyebrow: "01 · HOY", h: "Un edificio de muchos siglos", p1: "Partes medievales, un edificio gótico de salón y alas barrocas conviven en la Rathausplatz.", p2: "De 1663 a 1806 se reunió aquí la Dieta Imperial Perpetua." },
    out: { eyebrow: "02 · EXTERIOR", h: "Leer la fachada", p: "Desplácese: torre, mirador, barroco, de izquierda a derecha.", items: [
      ["Torre del ayuntamiento", "Su núcleo es de mediados del siglo XIII; mide unos 55 m. El tejado con linterna surgió a comienzos del siglo XVIII."],
      ["Mirador (Erker)", "El mirador está en la fachada de ventanas del Reichssaal."],
      ["Ala barroca", "A la derecha sigue el ayuntamiento barroco: construido en 1660–1662 y 1721–1723."]] },
    hall: { eyebrow: "04 · EDIFICIO DEL SALÓN", h: "Un salón para fiestas", p1: "Hacia 1320/30 se levantó el edificio del Reichssaal: gótico, de dos plantas, con hastiales escalonados y mirador.", p2: "Concebido como salón de baile y fiestas; solo después, centro político del Imperio.", h1: "El conjunto del ayuntamiento", h2: "El edificio del salón dentro del conjunto", erkT: "El mirador", erkD: "Desplácese: el mirador se separa en sus piezas.", erkAlt: "Mirador del edificio del salón, separado en sus piezas" },
    plan: { eyebrow: "05 · ALZADO", h: "Capas de un edificio", p: "Las vistas muestran cómo se yuxtaponen y superponen las partes; no son planos medidos.", items: [
      ["Capas del edificio del salón", "De la planta baja al tejado: los niveles del edificio gótico."],
      ["Alzado del conjunto", "Torre, edificio del salón y ala barroca en un mismo frente."]] },
    time: { eyebrow: "03 · TIEMPO", h: "El ayuntamiento crece", p: "Desplácese hacia abajo y el edificio se levanta; hacia arriba, el tiempo retrocede.", alt: "La evolución arquitectónica del Antiguo Ayuntamiento desde el solar vacío hasta hoy", ch: [
      ["mediados s. XIII · 1245", "El núcleo más antiguo", "Se construyen la torre y el edificio occidental. En 1245 Regensburg obtiene el rango de Ciudad Imperial Libre."],
      ["hacia 1320/30", "El edificio del salón", "Se levanta el edificio gótico, como salón de baile y fiestas."],
      ["1360–1363 · 1408 · 1564", "Torre, portal, acceso", "Tras el incendio, la torre se restaura. En 1408 surge el portal gótico principal; en 1564, un nuevo acceso a la sala."],
      ["1594 · 1663", "Sede de las Dietas", "Desde 1594 las Dietas Imperiales se celebran solo en Regensburg. Desde 1663 la Dieta se queda de forma permanente."],
      ["1660–1662 · 1721–1723", "Ampliación barroca", "Se construye el ayuntamiento barroco, que después se amplía."],
      ["1803 · 1806", "El final", "En 1803 la Dieta aprueba el Reichsdeputationshauptschluss; Regensburg pierde su condición de Ciudad Imperial Libre. En 1806 la Dieta termina con el Imperio."],
      ["Hoy", "Museo y recepciones", "El Reichssaal es museo y lugar de recepciones municipales."]] },
    portal: { eyebrow: "06 · PORTAL", h: "Por el portal de 1408", p: "Desplácese: el camino al interior pasa por el portal gótico principal.", alt: "Portal gótico principal del Antiguo Ayuntamiento" },
    saal: { eyebrow: "07 · REICHSSAAL", h: "Entender la sala", p: "Seis puntos muestran cómo está construida la sala y cómo se usaba.", step: "Punto", alt: "El Reichssaal hacia 1700 (reconstrucción)", spots: [
      { t: "Techo", d: "Un techo de tablas de madera tardogótico: plano, con una viga longitudinal en el centro." },
      { t: "Ventanas", d: "Altas ventanas apuntadas con tracería abren el lado largo de la sala." },
      { t: "Mirador", d: "El mirador está en la fachada de ventanas, visible desde la Rathausplatz." },
      { t: "Estrado", d: "Al fondo de la sala: un estrado elevado con trono bajo dosel." },
      { t: "Bancos", d: "Bancos a lo largo de los muros largos: aquí se sentaban los enviados." },
      { t: "Centro", d: "El centro de la sala quedaba en gran parte libre." }] },
    people: { eyebrow: "08 · PERSONAS", h: "Personas del Reichssaal", p: "¿Quién trabajaba para la Dieta? Desplácese por los oficios.", items: [
      ["Enviados", "Los estados del Imperio enviaban representantes. Deliberaban y votaban según las instrucciones de sus señores."],
      ["Escribanos", "Secretarios y escribanos ponían por escrito deliberaciones y acuerdos."],
      ["Correos", "Los correos traían instrucciones de las cortes y llevaban informes de vuelta."],
      ["Concejales", "El ayuntamiento pertenecía a la Ciudad Imperial. Su concejo cedía las salas a la Dieta."],
      ["Personal municipal", "Se ocupaban de llaves, salas y del funcionamiento diario del ayuntamiento."]], note: "Oficios típicos, no personas históricas concretas." },
    rt: { eyebrow: "09 · DIETA IMPERIAL", h: "1663–1806", p1: "Durante 143 años se reunió aquí la Dieta Imperial Perpetua, hasta el fin del Sacro Imperio Romano Germánico.", roles: [
      ["Enviados", "Los estados del Imperio enviaban representantes en lugar de acudir en persona."], ["Comisario principal", "Representaba al emperador ante la Dieta."], ["Colegios", "También se deliberaba en salas contiguas: por separado electores, príncipes y ciudades."]] },
    mat: { eyebrow: "10 · MATERIAL", h: "De qué está hecha la sala", p: "Madera, piedra, vidrio, hierro y las herramientas para trabajarlos.", items: [
      ["Madera", "La madera sostiene la sala: el techo plano de tablas con su viga longitudinal y los bancos de los muros."],
      ["Piedra", "Las articulaciones de la fachada son de piedra caliza; los canteros labraron el portal y la tracería."],
      ["Vidrio", "Las ventanas apuntadas con tracería llevan la luz a la sala."],
      ["Hierro", "Herrajes, cerraduras y llaves aseguraban puertas y arcones."],
      ["Herramientas", "Con mazo, cincel y escuadra se labraba a mano cada sillar."]] },
    tg: { eyebrow: "11 · LA SALA HOY", h: "Antes y ahora", p: "Cambie entre la sala hacia 1700 y hoy.", a: "HACIA 1700", b: "HOY", altA: "El Reichssaal hacia 1700 (reconstrucción)", altB: "El Reichssaal hoy (visualización)" },
    end: { eyebrow: "12 · HOY", h: "Un edificio, muchas épocas", p: "Del salón de fiestas a la sede de la Dieta Imperial: el Antiguo Ayuntamiento conserva siglos de arquitectura y política.", sources: "FUENTES", srcH: "Fuentes principales", close: "Cerrar", srcList: [
      "Oficina Estatal Bávara para la Conservación de Monumentos: Denkmalliste Regensburg, Altes Rathaus (D-3-62-000-956).",
      "Regensburg Tourismus GmbH: Old Town Hall.",
      "Grabado de la Dieta Imperial de 1653 (hoja volante).",
      "Michael Neher: Das Rathaus in Regensburg (1841)."] },
  },
};
// INDEX selector chapter labels (monuments.config.json -> menu_timeline.chapters.labels_key = "tlv"), derived from the same chronology.
LANGS.forEach((l) => { STR[l].tlv = STR[l].time.ch.map((c) => ({ y: c[0], h: c[1] })); });

// Phase 06E (2026-11-19): hero film, building-site loops, hologram assembly, roof + material overview.
// Kept as one additive block so the approved 06C texts above stay byte-identical.
const ADD_06E = {
  de: {
    hero: { soundOn: "TON AN", soundOff: "TON AUS", videoAlt: "Das Alte Rathaus entsteht als Lichtmodell und wird zum heutigen Bau" },
    bau: { eyebrow: "03 · BAUSTELLE", h: "Die Bauhütte", p: "Wer baute das Rathaus? Scrollen Sie durch die Arbeit auf der Baustelle.", items: [
      ["Steinmetze", "In der Bauhütte richteten Steinmetze jeden Werkstein von Hand zu – Quader, Gewände und Maßwerk."],
      ["Tretradkran", "Menschen im Laufrad trieben den Kran an und hoben schwere Steine auf die Mauer."]] },
    evo: { t: "Stück für Stück", d: "Scrollen Sie: Fundament, Saalbau, Turm und Dach fügen sich zusammen.", alt: "Modell des Alten Rathauses, das sich Bauteil für Bauteil zusammensetzt" },
    roof: ["Das Dach", "Ziegeldeckung, Lattung und hölzerner Dachstuhl schließen den Saalbau nach oben ab."],
    board: ["Materialien", "Naturstein, farbiger Putz, Holz, Dachziegel, Eisen und Glas prägen den Bau."],
  },
  en: {
    hero: { soundOn: "SOUND ON", soundOff: "SOUND OFF", videoAlt: "The Old Town Hall appears as a model of light and becomes today's building" },
    bau: { eyebrow: "03 · BUILDING SITE", h: "The masons' lodge", p: "Who built the town hall? Scroll through the work on the building site.", items: [
      ["Stonemasons", "In the masons' lodge every stone was dressed by hand – ashlar blocks, door frames and tracery."],
      ["Treadwheel crane", "People walking inside the wheel powered the crane and lifted heavy stones onto the walls."]] },
    evo: { t: "Piece by piece", d: "Scroll: foundation, hall building, tower and roof come together.", alt: "Model of the Old Town Hall assembling part by part" },
    roof: ["The roof", "Tiles, battens and a timber roof structure close the hall building at the top."],
    board: ["Materials", "Natural stone, coloured render, wood, roof tiles, iron and glass shape the building."],
  },
  es: {
    hero: { soundOn: "ACTIVAR SONIDO", soundOff: "QUITAR SONIDO", videoAlt: "El Antiguo Ayuntamiento aparece como un modelo de luz y se convierte en el edificio actual" },
    bau: { eyebrow: "03 · OBRA", h: "El taller de cantería", p: "¿Quién construyó el ayuntamiento? Desplácese por el trabajo en la obra.", items: [
      ["Canteros", "En el taller, los canteros labraban a mano cada piedra: sillares, jambas y tracerías."],
      ["Grúa de rueda", "Personas que caminaban dentro de la rueda movían la grúa y subían las piedras pesadas al muro."]] },
    evo: { t: "Pieza a pieza", d: "Desplácese: cimientos, edificio del salón, torre y tejado se ensamblan.", alt: "Modelo del Antiguo Ayuntamiento que se ensambla pieza a pieza" },
    roof: ["El tejado", "Tejas, listones y una armadura de madera cierran por arriba el edificio del salón."],
    board: ["Materiales", "Piedra natural, revoque de color, madera, tejas, hierro y vidrio definen el edificio."],
  },
};
LANGS.forEach((l) => {
  const a = ADD_06E[l], s = STR[l];
  Object.assign(s.hero, a.hero); s.bau = a.bau; s.evo = a.evo;
  s.plan.items.push(a.roof);   // ansicht: layers, elevation, + roof
  s.mat.items.unshift(a.board); // material: overview first
});
