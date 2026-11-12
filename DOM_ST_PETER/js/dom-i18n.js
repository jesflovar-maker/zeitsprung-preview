// DOM ST. PETER — i18n (DE / EN / ES). One runtime, three languages.
// DE = source-controlled historical copy. EN / ES = translations of that copy (no added claims).
// Media references (image / video names) live in dom-main.js; arrays here are index-aligned with them.
export const LANGS = ["de", "en", "es"];
export const STORAGE_KEY = "zeitsprung_v2_lang"; // existing ZEITSPRUNG convention (js/index-i18n.js)

export const STR = {
  de: {
    meta: { title: "ZEITSPRUNG — Dom St. Peter, Regensburg", desc: "Dom St. Peter in Regensburg: eine Zeitreise durch Bau, Architektur und Geschichte der gotischen Kathedrale." },
    ui: { brandAria: "ZEITSPRUNG — zur Übersicht", back: "ALLE MONUMENTE", backShort: "MONUMENTE", navAria: "Kapitel", langAria: "Sprache", vis: "Visualisierung", scrollAria: "Nach unten", close: "Schließen", trailer: "TRAILER ANSEHEN", trailerShort: "▶ TRAILER", trailerAria: "Trailer" },
    nav: { rundum: "Rundum", holo: "Modell", architektur: "Architektur", bauabfolge: "Bauabfolge", zeitreise: "Zeitreise", zeitleiste: "Zeitleiste", glas: "Glas", menschen: "Dombauhütte", unten: "Unten", heute: "Heute" },
    hero: { eyebrow: "REGENSBURG", sub: "Gotische Kathedrale im Herzen Regensburgs — ein Bau, der über Jahrhunderte in die Höhe wuchs.", start: "ERLEBNIS BEGINNEN" },
    scrub: { eb: "RUND UM DEN DOM", h: "Einmal um die Kathedrale", lead: "Von der Westfassade über Süd, Ost und Nord bis in die Höhe — und hinab unter den Dom.", play: "ABSPIELEN" },
    marks: [
      { k: "WEST", h: "Westfassade & Türme", p: "Zwei Türme prägen die Westseite. An der Fassade wurde über rund 200 Jahre gebaut." },
      { k: "SÜD", h: "Struktur & Strebewerk", p: "An der Südseite wird das Tragwerk des Langhauses sichtbar: Strebepfeiler und Strebebögen." },
      { k: "OST", h: "Der Chor", p: "Im Osten begann um 1275 der gotische Neubau." },
      { k: "NORD", h: "Architektur im Detail", p: "Fenster, Maßwerk und Dächer gliedern die Nordseite." },
      { k: "ZENIT", h: "Dach & Gesamtstruktur", p: "Von oben zeichnet sich der kreuzförmige Grundriss des Doms ab." },
      { k: "ABSTIEG", h: "Unter dem Dom", p: "Schichten und Spuren reichen in die Tiefe." }
    ],
    holo: { eb: "DIGITALES MODELL", h: "Vom Bauwerk zum digitalen Modell", p: "Das Hologramm übersetzt den Dom in Linien und Schichten — der Ausgangspunkt für den Blick in seine Struktur." },
    arch: { eb: "ARCHITEKTUR", h: "Wie der Dom steht", lead: "Sechs Blicke auf die Struktur der Kathedrale." },
    archSteps: [
      { d: "DAS GANZE", t: "Vom Ganzen zur Struktur", p: "Der Dom lässt sich in seine Bauteile zerlegen: Chor, Langhaus, Fassade, Türme und Dach." },
      { d: "PFEILER", t: "Bündelpfeiler", p: "Bündelpfeiler führen die Lasten in die Tiefe und tragen den Raum in die Höhe." },
      { d: "GEWÖLBE", t: "Rippen und Gewölbe", p: "Rippengewölbe sammeln die Lasten — das Prinzip der Gotik: Die Wände öffnen sich, das Licht kommt in den Raum." },
      { d: "DACH", t: "Die Dachlandschaft", p: "Über dem Gewölbe schützt das Dach den Bau. Die Visualisierung öffnet die Dachlandschaft Schicht für Schicht." },
      { d: "WESTFASSADE", t: "Die Westfassade", p: "Die Westfassade mit ihren beiden Türmen prägt das Bild des Doms." },
      { d: "TÜRME", t: "Zwei Türme über der Stadt", p: "Die Helme der beiden Türme erreichen rund 105 Meter." }
    ],
    bau: { eb: "BAUABFOLGE", h: "Von Osten nach Westen", lead: "Der gotische Dom wuchs nicht in einem Zug, sondern Abschnitt für Abschnitt — vom Chor im Osten bis zu den Türmen im Westen.", ost: "OST", west: "WEST" },
    bauSteps: [
      { d: "AB 1275", t: "Der Chor", p: "Der gotische Neubau beginnt im Osten. Als erster Abschnitt wurde 1276 vermutlich der Südchor geweiht. Ab 1295 wird der Hauptchor hochgotisch neu gefasst — um 1310/15 folgt die erste große Verglasung." },
      { d: "14. JAHRHUNDERT", t: "Querhaus und Langhaus", p: "Von Osten her wachsen Querhaus und Langhausjoche nach Westen. Die Stiftskirche St. Johann behindert den Weiterbau; um 1360 sind im Westen vor allem das südliche Seitenschiff und das Erdgeschoss des Südturms möglich." },
      { d: "AB ETWA 1325", t: "Die Westfassade", p: "Die Westfassade wächst über rund 200 Jahre „von rechts unten nach links oben“. Um 1520 ruhen die Arbeiten: Beide Türme enden in Höhe des Glockengeschosses unter Pyramidendächern." },
      { d: "1859 – 1869", t: "Die Türme", p: "Auf den mittelalterlichen Turmstümpfen entstehen achteckige Obergeschosse und die heutigen neugotischen Helme von rund 105 Metern." },
      { d: "1870 – 1872", t: "Die Vollendung", p: "1870–72 folgen Querhausgiebel und Dachreiter." }
    ],
    kf: { eb: "ZEITREISE", h: "Vom romanischen Dom bis zur Vollendung", lead: "Scrollen Sie durch die Bauzeit — Bild für Bild." },
    frames: [
      { d: "CA. 1000", t: "Der romanische Dom", p: "Der romanische Vorgängerbau wird nach Westen erweitert: Querhaus, zwei Türme, Atrium und eine Krypta gehören zur Anlage. Vom romanischen Dom steht heute nur noch der Eselsturm." },
      { d: "1156 · 1172", t: "Brände und Wiederherstellung", p: "Der romanische Dom erleidet 1156 und 1172 zwei Brände und wird beide Male wiederhergestellt." },
      { d: "1273 · 1276", t: "Brand und Beginn des gotischen Neubaus", p: "1273 zerstört ein Brand den romanischen Vorgängerbau. Um 1275 beginnt der gotische Neubau — im Osten: Als erster Abschnitt wurde 1276 vermutlich der Südchor geweiht. Von dort wächst der Dom nach Westen." },
      { d: "1295 – 1315", t: "Der hochgotische Chor entsteht", p: "Im Osten wird der Chor hochgotisch neu gefasst: Ab 1295 entsteht ein zweiter Bauabschnitt mit zunehmend durchlichteten Wänden und dem dreiteiligen Aufriss aus Arkaden, Triforium und Obergaden. Um 1310/15 folgt die erste große Verglasung mit Glasmalerei." },
      { d: "1325 – 1443", t: "Der Dom wächst nach Westen", p: "Der Bau schreitet von Osten nach Westen voran: Querhaus und Langhausjoche wachsen westwärts. Die Stiftskirche St. Johann behindert den Weiterbau; um 1360 sind im Westen vor allem das südliche Seitenschiff und das Erdgeschoss des Südturms möglich." },
      { d: "BIS 1520/25", t: "Die unvollendeten Türme", p: "Die Westfassade wächst ab etwa 1325 über rund 200 Jahre „von rechts unten nach links oben“. Um 1520/25 kommt der große Dombau zum Stillstand: Beide Türme enden in Höhe des Glockengeschosses unter Pyramidendächern." },
      { d: "1859 – 1869", t: "Die Türme werden vollendet", p: "Auf den mittelalterlichen Turmstümpfen entsteht die Vollendung: Die Türme werden senkrecht weitergeführt, erhalten achteckige Obergeschosse und die heutigen neugotischen Helme (rund 105 m). 1870–72 folgen Querhausgiebel und Dachreiter." },
      { d: "20. JAHRHUNDERT", t: "Dombauhütte und Restaurierung", p: "1923/24 wird die Dombauhütte als staatliche Werkstatt wieder eingerichtet und arbeitet seither ohne Unterbrechung. 1984–1989 folgen eine umfassende Restaurierung und der Einbau der Bischofskrypta; 1985–1988 wird die farbige Raumfassung des Innenraums restauriert." }
    ],
    tl: { eb: "ZEITLEISTE", h: "Fast 600 Jahre Baugeschichte", lead: "Der Film führt durch die Bauzeit des Doms. Wählen Sie ein Datum, um direkt dorthin zu springen.", play: "ABSPIELEN", pause: "PAUSE", soundOn: "TON AN", soundOff: "TON AUS", videoAria: "Film: Zeitleiste des Doms", note: "" },
    tlv: [
      { y: "1273", h: "Brand des romanischen Doms", p: "1273 zerstört ein Brand den romanischen Vorgängerbau." },
      { y: "UM 1275", h: "Beginn des gotischen Neubaus", p: "Der Neubau beginnt im Osten. Als erster Abschnitt wurde 1276 vermutlich der Südchor geweiht." },
      { y: "AB 1295", h: "Der hochgotische Chor", p: "Ab 1295 wird der Chor hochgotisch neu gefasst. Um 1310/15 folgt die erste große Verglasung mit Glasmalerei." },
      { y: "AB ETWA 1325", h: "Der Dom wächst nach Westen", p: "Querhaus und Langhausjoche wachsen westwärts; die Westfassade entsteht über rund 200 Jahre." },
      { y: "UM 1520/25", h: "Stillstand", p: "Der große Dombau kommt zum Stillstand: Beide Türme enden in Höhe des Glockengeschosses unter Pyramidendächern." },
      { y: "1859 – 1869", h: "Die Türme werden vollendet", p: "Auf den mittelalterlichen Turmstümpfen entstehen achteckige Obergeschosse und die neugotischen Helme von rund 105 Metern." },
      { y: "1870 – 1872", h: "Querhausgiebel und Dachreiter", p: "1870–72 folgen Querhausgiebel und Dachreiter." },
      { y: "1923/24", h: "Die Dombauhütte", p: "Die Dombauhütte wird als staatliche Werkstatt wieder eingerichtet und arbeitet seither ohne Unterbrechung." },
      { y: "2006", h: "UNESCO-Welterbe", p: "Seit 2006 gehört der Dom zum UNESCO-Welterbe „Regensburg mit Stadtamhof“." }
    ],
    glas: { eb: "GLAS & MATERIAL", h: "Licht, Glas und Stein", lead: "Woraus der Dom gemacht ist — und wie das Licht in den Raum kommt." },
    glasSteps: [
      { d: "GLASMALEREI", t: "Licht als Baustoff", p: "Mit dem hochgotischen Chor öffnen sich die Wände zunehmend dem Licht. Um 1310/15 folgt die erste große Verglasung mit Glasmalerei — farbiges Licht wird Teil der Architektur." },
      { d: "WERKSTATT", t: "Vom Glasstück zum Fenster", p: "Glas wird zugeschnitten, bemalt, gebrannt und in Blei gefasst. Die Visualisierung zeigt diese Arbeitsschritte." },
      { d: "DETAIL", t: "Farbe aus der Nähe", p: "Aus der Nähe zeigt sich die Arbeit im einzelnen Glasstück: Farbe, Zeichnung und Bleinetz." },
      { d: "STEIN", t: "Ein Bau aus Naturstein", p: "Der Dom ist aus Naturstein errichtet. Die Dombauhütte arbeitet bis heute ausschließlich in Naturstein." },
      { d: "MASSWERK & SKULPTUR", t: "Form aus dem Block", p: "Maßwerk, Fialen und Bauzier entstehen in Handarbeit — Stück für Stück aus dem Stein." }
    ],
    people: { eb: "DOMBAUHÜTTE", h: "Die Menschen hinter dem Dom", lead: "Ein Dom entsteht nicht von selbst. Steinmetze, Handwerker und die Dombauhütte gaben ihm über Generationen Form. Die Dombauhütte arbeitet bis heute ausschließlich in Naturstein; 2023 feierte sie 100 Jahre ununterbrochene Arbeit." },
    peopleSteps: [
      { d: "STEINMETZE", t: "Arbeit am Stein", p: "Handwerk, Werkzeug und ein geschulter Blick: Steinmetze geben dem Dom seit Generationen Form." },
      { d: "BAUHÜTTE", t: "Die Dombauhütte", p: "Die Dombauhütte ist die Werkstatt des Doms — hier wird geplant, gearbeitet und bewahrt. 1923/24 wurde sie als staatliche Werkstatt wieder eingerichtet und arbeitet seither ohne Unterbrechung." },
      { d: "PLANUNG", t: "Vom Entwurf zum Werkstück", p: "Am Anfang steht die Zeichnung: Formen werden entworfen und auf den Stein übertragen." },
      { d: "ZIMMERLEUTE", t: "Holz für den Bau aus Stein", p: "Gerüste und Dachwerke gehören zum Dombau — ohne Holz kein Dom aus Stein." },
      { d: "HEBEZEUGE", t: "Stein für Stein in die Höhe", p: "Jeder Werkstein muss an seinen Platz gehoben und versetzt werden." }
    ],
    under: { eb: "UNTER DEM DOM", h: "Schichten unter dem Dom", lead: "Unter dem heutigen Dom liegen Schichten früherer Zeiten: Spuren, Fundamente und archäologische Ebenen. Die Bilder visualisieren diesen Blick in die Tiefe.", alt: "Blick unter den Dom" },
    route: { eb: "RUNDGANG", h: "Den Dom erkunden", lead: "Wählen Sie einen Ort — von der Westfassade bis in den Innenraum." },
    routeSteps: [
      { l: "West", t: "Die Westfassade", p: "Der Blick von Westen: Fassade, Portale und die beiden Türme." },
      { l: "Seiten", t: "Entlang des Langhauses", p: "Strebewerk und Dächer zeigen, wie der Bau getragen wird." },
      { l: "Ost", t: "Der Chor", p: "Im Osten begann der gotische Neubau." },
      { l: "Innen", t: "Der Innenraum", p: "Vom Westportal durch das Langhaus bis zum Chor." },
      { l: "Detail", t: "Pfeiler und Gewölbe", p: "Die Höhe des Raums entsteht aus Pfeilern, Rippen und Gewölben." }
    ],
    now: { eb: "HEUTE", h: "Der Dom heute", lead: "Seit 2006 gehört der Dom zum UNESCO-Welterbe „Regensburg mit Stadtamhof“. Die Dombauhütte arbeitet bis heute ausschließlich in Naturstein; 2023 feierte sie 100 Jahre ununterbrochene Arbeit.", alt: "Der Dom heute" },
    end: { h: "Ein Sprung durch die Zeit", p: "Der Dom ist ein Ort, an dem sich Jahrhunderte übereinanderlegen. Entdecken Sie weitere Orte Regensburgs.", overview: "ZUR ÜBERSICHT", sb: "STEINERNE BRÜCKE", note: "Die Bilder und Videos dieser Seite sind Visualisierungen auf Grundlage des historischen Forschungsstands und ersetzen keine dokumentarische Fotografie." },
    guide: { fab: "Brückmandl öffnen", aria: "Brückmandl — Ihr ZEITSPRUNG-Begleiter", role: "Ihr ZEITSPRUNG-Begleiter", hi: "Grüß Gott! Sonst wache ich auf der Steinernen Brücke — hier begleite ich Sie durch den Dom. Wählen Sie ein Thema.", go: "Zum Kapitel →", ctx: "Passend zu diesem Kapitel" },
    guideTopics: [
      ["Baugeschichte", "Nach dem Brand von 1273 beginnt um 1275 der gotische Neubau — im Osten. Von dort wächst der Dom Joch um Joch nach Westen. Um 1520 ruhen die Arbeiten; erst 1859 bis 1869 werden die Türme vollendet."],
      ["Zeitleiste", "Die Zeitleiste zeigt die Bauzeit als Film. Wählen Sie dort ein Datum, um direkt zu diesem Moment zu springen."],
      ["Ost → West", "Der gotische Dom wuchs nicht in einem Zug, sondern Abschnitt für Abschnitt — vom Chor im Osten bis zu den Türmen im Westen."],
      ["Westfassade", "Die Westfassade wächst ab etwa 1325 über rund 200 Jahre „von rechts unten nach links oben“."],
      ["Türme", "Um 1520/25 enden beide Türme in Höhe des Glockengeschosses unter Pyramidendächern. 1859 bis 1869 entstehen die achteckigen Obergeschosse und die neugotischen Helme von rund 105 Metern."],
      ["Glasmalerei", "Mit dem hochgotischen Chor öffnen sich die Wände dem Licht. Um 1310/15 folgt die erste große Verglasung mit Glasmalerei."],
      ["Materialien", "Der Dom ist aus Naturstein errichtet. Die Dombauhütte arbeitet bis heute ausschließlich in Naturstein."],
      ["Dombauhütte", "1923/24 wird die Dombauhütte als staatliche Werkstatt wieder eingerichtet und arbeitet seither ohne Unterbrechung. 2023 feierte sie 100 Jahre ununterbrochene Arbeit."],
      ["Unter dem Dom", "Unter dem heutigen Dom liegen Schichten früherer Zeiten: Spuren, Fundamente und archäologische Ebenen. Die Bilder dort sind Visualisierungen."],
      ["Heute", "Seit 2006 gehört der Dom zum UNESCO-Welterbe „Regensburg mit Stadtamhof“."]
    ]
  },

  en: {
    meta: { title: "ZEITSPRUNG — Regensburg Cathedral (Dom St. Peter)", desc: "Regensburg Cathedral: a journey through the construction, architecture and history of the Gothic cathedral." },
    ui: { brandAria: "ZEITSPRUNG — back to overview", back: "ALL MONUMENTS", backShort: "MONUMENTS", navAria: "Chapters", langAria: "Language", vis: "Visualisation", scrollAria: "Scroll down", close: "Close", trailer: "WATCH TRAILER", trailerShort: "▶ TRAILER", trailerAria: "Trailer" },
    nav: { rundum: "Around", holo: "Model", architektur: "Architecture", bauabfolge: "Building", zeitreise: "Time travel", zeitleiste: "Timeline", glas: "Glass", menschen: "Workshop", unten: "Below", heute: "Today" },
    hero: { eyebrow: "REGENSBURG", sub: "A Gothic cathedral in the heart of Regensburg — a building that rose over centuries.", start: "START EXPERIENCE" },
    scrub: { eb: "AROUND THE CATHEDRAL", h: "Once around the cathedral", lead: "From the west front past south, east and north, up to the top — and down beneath the cathedral.", play: "PLAY" },
    marks: [
      { k: "WEST", h: "West front & towers", p: "Two towers define the west side. The façade was under construction for around 200 years." },
      { k: "SOUTH", h: "Structure & buttressing", p: "On the south side the structure of the nave becomes visible: buttresses and flying buttresses." },
      { k: "EAST", h: "The choir", p: "The Gothic rebuilding began in the east around 1275." },
      { k: "NORTH", h: "Architecture in detail", p: "Windows, tracery and roofs articulate the north side." },
      { k: "ZENITH", h: "Roof & overall structure", p: "From above, the cross-shaped ground plan of the cathedral becomes apparent." },
      { k: "DESCENT", h: "Beneath the cathedral", p: "Layers and traces reach down into the ground." }
    ],
    holo: { eb: "DIGITAL MODEL", h: "From building to digital model", p: "The hologram translates the cathedral into lines and layers — the starting point for looking into its structure." },
    arch: { eb: "ARCHITECTURE", h: "How the cathedral stands", lead: "Six views of the structure of the cathedral." },
    archSteps: [
      { d: "THE WHOLE", t: "From the whole to the structure", p: "The cathedral can be taken apart into its components: choir, nave, façade, towers and roof." },
      { d: "PIERS", t: "Compound piers", p: "Compound piers carry the loads down and lift the space upwards." },
      { d: "VAULTS", t: "Ribs and vaults", p: "Rib vaults gather the loads — the principle of Gothic architecture: the walls open up and light enters the space." },
      { d: "ROOF", t: "The roofscape", p: "Above the vaults, the roof protects the building. The visualisation opens the roofscape layer by layer." },
      { d: "WEST FRONT", t: "The west front", p: "The west front with its two towers defines the image of the cathedral." },
      { d: "TOWERS", t: "Two towers above the city", p: "The spires of the two towers reach around 105 metres." }
    ],
    bau: { eb: "BUILDING SEQUENCE", h: "From east to west", lead: "The Gothic cathedral did not rise in a single campaign but section by section — from the choir in the east to the towers in the west.", ost: "EAST", west: "WEST" },
    bauSteps: [
      { d: "FROM 1275", t: "The choir", p: "The Gothic rebuilding begins in the east. The first section, probably the south choir, was consecrated in 1276. From 1295 the main choir is recast in High Gothic forms — the first major glazing follows around 1310/15." },
      { d: "14TH CENTURY", t: "Transept and nave", p: "From the east, the transept and the bays of the nave grow westwards. The collegiate church of St. Johann obstructs further building; around 1360 mainly the south aisle and the ground floor of the south tower are possible in the west." },
      { d: "FROM ABOUT 1325", t: "The west front", p: "The west front grows over around 200 years “from bottom right to top left”. Around 1520 work comes to rest: both towers end at belfry level under pyramid roofs." },
      { d: "1859 – 1869", t: "The towers", p: "On the medieval tower stumps, octagonal upper storeys and today's neo-Gothic spires of around 105 metres are built." },
      { d: "1870 – 1872", t: "Completion", p: "The transept gables and the ridge turret follow in 1870–72." }
    ],
    kf: { eb: "TIME TRAVEL", h: "From the Romanesque cathedral to completion", lead: "Scroll through the building period — image by image." },
    frames: [
      { d: "C. 1000", t: "The Romanesque cathedral", p: "The Romanesque predecessor is extended to the west: a transept, two towers, an atrium and a crypt belong to the complex. Of the Romanesque cathedral only the Eselsturm survives today." },
      { d: "1156 · 1172", t: "Fires and restoration", p: "The Romanesque cathedral suffers two fires, in 1156 and 1172, and is restored both times." },
      { d: "1273 · 1276", t: "Fire and the start of the Gothic rebuilding", p: "In 1273 a fire destroys the Romanesque predecessor. Around 1275 the Gothic rebuilding begins — in the east: the first section, probably the south choir, was consecrated in 1276. From there the cathedral grows westwards." },
      { d: "1295 – 1315", t: "The High Gothic choir takes shape", p: "In the east the choir is recast in High Gothic forms: from 1295 a second building phase follows, with increasingly light-filled walls and the three-part elevation of arcades, triforium and clerestory. Around 1310/15 the first major glazing with stained glass follows." },
      { d: "1325 – 1443", t: "The cathedral grows westwards", p: "Building advances from east to west: the transept and the bays of the nave grow westwards. The collegiate church of St. Johann obstructs further building; around 1360 mainly the south aisle and the ground floor of the south tower are possible in the west." },
      { d: "UNTIL 1520/25", t: "The unfinished towers", p: "From about 1325 the west front grows over around 200 years “from bottom right to top left”. Around 1520/25 the great building campaign comes to a halt: both towers end at belfry level under pyramid roofs." },
      { d: "1859 – 1869", t: "The towers are completed", p: "Completion rises on the medieval tower stumps: the towers are continued vertically and receive octagonal upper storeys and today's neo-Gothic spires (around 105 m). The transept gables and the ridge turret follow in 1870–72." },
      { d: "20TH CENTURY", t: "Cathedral workshop and restoration", p: "In 1923/24 the Dombauhütte (cathedral workshop) is re-established as a state workshop and has worked without interruption ever since. A comprehensive restoration and the installation of the bishops' crypt follow in 1984–1989; in 1985–1988 the coloured decorative scheme of the interior is restored." }
    ],
    tl: { eb: "TIMELINE", h: "Almost 600 years of building history", lead: "The film leads through the cathedral's building period. Choose a date to jump straight to it.", play: "PLAY", pause: "PAUSE", soundOn: "SOUND ON", soundOff: "SOUND OFF", videoAria: "Film: timeline of the cathedral", note: "" },
    tlv: [
      { y: "1273", h: "Fire in the Romanesque cathedral", p: "In 1273 a fire destroys the Romanesque predecessor." },
      { y: "C. 1275", h: "Start of the Gothic rebuilding", p: "The rebuilding begins in the east. The first section, probably the south choir, was consecrated in 1276." },
      { y: "FROM 1295", h: "The High Gothic choir", p: "From 1295 the choir is recast in High Gothic forms. Around 1310/15 the first major glazing with stained glass follows." },
      { y: "FROM ABOUT 1325", h: "The cathedral grows westwards", p: "The transept and the bays of the nave grow westwards; the west front takes shape over around 200 years." },
      { y: "C. 1520/25", h: "Standstill", p: "The great building campaign comes to a halt: both towers end at belfry level under pyramid roofs." },
      { y: "1859 – 1869", h: "The towers are completed", p: "On the medieval tower stumps, octagonal upper storeys and the neo-Gothic spires of around 105 metres are built." },
      { y: "1870 – 1872", h: "Transept gables and ridge turret", p: "The transept gables and the ridge turret follow in 1870–72." },
      { y: "1923/24", h: "The cathedral workshop", p: "The Dombauhütte is re-established as a state workshop and has worked without interruption ever since." },
      { y: "2006", h: "UNESCO World Heritage", p: "Since 2006 the cathedral has been part of the UNESCO World Heritage site “Old town of Regensburg with Stadtamhof”." }
    ],
    glas: { eb: "GLASS & MATERIAL", h: "Light, glass and stone", lead: "What the cathedral is made of — and how light enters the space." },
    glasSteps: [
      { d: "STAINED GLASS", t: "Light as a building material", p: "With the High Gothic choir the walls open up more and more to light. Around 1310/15 the first major glazing with stained glass follows — coloured light becomes part of the architecture." },
      { d: "WORKSHOP", t: "From a piece of glass to a window", p: "Glass is cut, painted, fired and set in lead. The visualisation shows these steps." },
      { d: "DETAIL", t: "Colour up close", p: "Up close, the work in a single piece of glass becomes visible: colour, drawing and the lead net." },
      { d: "STONE", t: "A building of natural stone", p: "The cathedral is built of natural stone. To this day the cathedral workshop works exclusively in natural stone." },
      { d: "TRACERY & SCULPTURE", t: "Form from the block", p: "Tracery, pinnacles and architectural ornament are made by hand — piece by piece from the stone." }
    ],
    people: { eb: "CATHEDRAL WORKSHOP", h: "The people behind the cathedral", lead: "A cathedral does not build itself. Stonemasons, craftspeople and the Dombauhütte (cathedral workshop) shaped it over generations. To this day the workshop works exclusively in natural stone; in 2023 it celebrated 100 years of uninterrupted work." },
    peopleSteps: [
      { d: "STONEMASONS", t: "Working the stone", p: "Craft, tools and a trained eye: stonemasons have given the cathedral its form for generations." },
      { d: "WORKSHOP", t: "The Dombauhütte", p: "The Dombauhütte is the cathedral's workshop — this is where planning, work and conservation take place. In 1923/24 it was re-established as a state workshop and has worked without interruption ever since." },
      { d: "PLANNING", t: "From design to workpiece", p: "It starts with the drawing: forms are designed and transferred to the stone." },
      { d: "CARPENTERS", t: "Timber for a building of stone", p: "Scaffolding and roof structures are part of building a cathedral — no cathedral of stone without timber." },
      { d: "LIFTING GEAR", t: "Stone by stone, upwards", p: "Every dressed stone has to be lifted and set in its place." }
    ],
    under: { eb: "BENEATH THE CATHEDRAL", h: "Layers beneath the cathedral", lead: "Beneath today's cathedral lie layers of earlier times: traces, foundations and archaeological levels. The images visualise this view into the depths.", alt: "View beneath the cathedral" },
    route: { eb: "TOUR", h: "Explore the cathedral", lead: "Choose a place — from the west front to the interior." },
    routeSteps: [
      { l: "West", t: "The west front", p: "The view from the west: façade, portals and the two towers." },
      { l: "Sides", t: "Along the nave", p: "Buttressing and roofs show how the building is carried." },
      { l: "East", t: "The choir", p: "The Gothic rebuilding began in the east." },
      { l: "Inside", t: "The interior", p: "From the west portal through the nave to the choir." },
      { l: "Detail", t: "Piers and vaults", p: "The height of the space arises from piers, ribs and vaults." }
    ],
    now: { eb: "TODAY", h: "The cathedral today", lead: "Since 2006 the cathedral has been part of the UNESCO World Heritage site “Old town of Regensburg with Stadtamhof”. To this day the cathedral workshop works exclusively in natural stone; in 2023 it celebrated 100 years of uninterrupted work.", alt: "The cathedral today" },
    end: { h: "A leap through time", p: "The cathedral is a place where centuries lie on top of one another. Discover more places in Regensburg.", overview: "TO THE OVERVIEW", sb: "STONE BRIDGE", note: "The images and videos on this page are visualisations based on the current state of historical research and do not replace documentary photography." },
    guide: { fab: "Open Brückmandl guide", aria: "Bruckmandl — your ZEITSPRUNG guide", role: "Your ZEITSPRUNG guide", hi: "Grüß Gott! I usually keep watch on the Stone Bridge — here I accompany you through the cathedral. Choose a topic.", go: "Go to chapter →", ctx: "Related to this chapter" },
    guideTopics: [
      ["Building history", "After the fire of 1273 the Gothic rebuilding begins around 1275 — in the east. From there the cathedral grows bay by bay to the west. Around 1520 work comes to rest; the towers are only completed between 1859 and 1869."],
      ["Timeline", "The timeline shows the building period as a film. Choose a date there to jump straight to that moment."],
      ["East → West", "The Gothic cathedral did not rise in a single campaign but section by section — from the choir in the east to the towers in the west."],
      ["West front", "From about 1325 the west front grows over around 200 years “from bottom right to top left”."],
      ["Towers", "Around 1520/25 both towers end at belfry level under pyramid roofs. Between 1859 and 1869 the octagonal upper storeys and the neo-Gothic spires of around 105 metres are built."],
      ["Stained glass", "With the High Gothic choir the walls open up to light. Around 1310/15 the first major glazing with stained glass follows."],
      ["Materials", "The cathedral is built of natural stone. To this day the cathedral workshop works exclusively in natural stone."],
      ["Workshop", "In 1923/24 the Dombauhütte is re-established as a state workshop and has worked without interruption ever since. In 2023 it celebrated 100 years of uninterrupted work."],
      ["Beneath the cathedral", "Beneath today's cathedral lie layers of earlier times: traces, foundations and archaeological levels. The images there are visualisations."],
      ["Today", "Since 2006 the cathedral has been part of the UNESCO World Heritage site “Old town of Regensburg with Stadtamhof”."]
    ]
  },

  es: {
    meta: { title: "ZEITSPRUNG — Catedral de Ratisbona (Dom St. Peter)", desc: "Catedral de Ratisbona: un viaje por la construcción, la arquitectura y la historia de la catedral gótica." },
    ui: { brandAria: "ZEITSPRUNG — volver al inicio", back: "TODOS LOS MONUMENTOS", backShort: "MONUMENTOS", navAria: "Capítulos", langAria: "Idioma", vis: "Visualización", scrollAria: "Bajar", close: "Cerrar", trailer: "VER TRÁILER", trailerShort: "▶ TRÁILER", trailerAria: "Tráiler" },
    nav: { rundum: "Alrededor", holo: "Modelo", architektur: "Arquitectura", bauabfolge: "Construcción", zeitreise: "Viaje", zeitleiste: "Cronología", glas: "Vidrio", menschen: "Taller", unten: "Subsuelo", heute: "Hoy" },
    hero: { eyebrow: "RATISBONA", sub: "Una catedral gótica en el corazón de Ratisbona: un edificio que creció hacia lo alto durante siglos.", start: "COMENZAR EXPERIENCIA" },
    scrub: { eb: "ALREDEDOR DE LA CATEDRAL", h: "Una vuelta a la catedral", lead: "De la fachada oeste por el sur, el este y el norte hasta lo alto — y hacia abajo, bajo la catedral.", play: "REPRODUCIR" },
    marks: [
      { k: "OESTE", h: "Fachada oeste y torres", p: "Dos torres definen el lado oeste. La fachada se construyó a lo largo de unos 200 años." },
      { k: "SUR", h: "Estructura y contrafuertes", p: "En el lado sur se hace visible la estructura de la nave: contrafuertes y arbotantes." },
      { k: "ESTE", h: "El coro", p: "En el este comenzó, hacia 1275, la nueva construcción gótica." },
      { k: "NORTE", h: "Arquitectura en detalle", p: "Ventanas, tracerías y cubiertas articulan el lado norte." },
      { k: "CENIT", h: "Cubierta y estructura general", p: "Desde arriba se reconoce la planta en forma de cruz de la catedral." },
      { k: "DESCENSO", h: "Bajo la catedral", p: "Capas y huellas se adentran en la profundidad." }
    ],
    holo: { eb: "MODELO DIGITAL", h: "Del edificio al modelo digital", p: "El holograma traduce la catedral en líneas y capas: el punto de partida para mirar su estructura." },
    arch: { eb: "ARQUITECTURA", h: "Cómo se sostiene la catedral", lead: "Seis miradas a la estructura de la catedral." },
    archSteps: [
      { d: "EL CONJUNTO", t: "Del conjunto a la estructura", p: "La catedral puede descomponerse en sus partes: coro, nave, fachada, torres y cubierta." },
      { d: "PILARES", t: "Pilares fasciculados", p: "Los pilares fasciculados conducen las cargas hacia abajo y elevan el espacio." },
      { d: "BÓVEDAS", t: "Nervios y bóvedas", p: "Las bóvedas de crucería recogen las cargas: el principio del gótico. Los muros se abren y la luz entra en el espacio." },
      { d: "CUBIERTA", t: "El paisaje de cubiertas", p: "Sobre las bóvedas, la cubierta protege el edificio. La visualización abre las cubiertas capa a capa." },
      { d: "FACHADA OESTE", t: "La fachada oeste", p: "La fachada oeste, con sus dos torres, define la imagen de la catedral." },
      { d: "TORRES", t: "Dos torres sobre la ciudad", p: "Las agujas de las dos torres alcanzan unos 105 metros." }
    ],
    bau: { eb: "SECUENCIA CONSTRUCTIVA", h: "De este a oeste", lead: "La catedral gótica no creció de una sola vez, sino tramo a tramo: del coro en el este a las torres en el oeste.", ost: "ESTE", west: "OESTE" },
    bauSteps: [
      { d: "DESDE 1275", t: "El coro", p: "La nueva construcción gótica comienza en el este. Como primera parte se consagró en 1276, probablemente, el coro sur. Desde 1295 el coro principal se reformula en gótico pleno; hacia 1310/15 llega el primer gran acristalamiento." },
      { d: "SIGLO XIV", t: "Transepto y nave", p: "Desde el este, el transepto y los tramos de la nave crecen hacia el oeste. La colegiata de St. Johann dificulta la continuación; hacia 1360, en el oeste solo son posibles sobre todo la nave lateral sur y la planta baja de la torre sur." },
      { d: "DESDE HACIA 1325", t: "La fachada oeste", p: "La fachada oeste crece durante unos 200 años «de abajo a la derecha hacia arriba a la izquierda». Hacia 1520 las obras se detienen: ambas torres terminan a la altura del cuerpo de campanas, bajo tejados piramidales." },
      { d: "1859 – 1869", t: "Las torres", p: "Sobre los muñones medievales de las torres se levantan los cuerpos octogonales y las actuales agujas neogóticas, de unos 105 metros." },
      { d: "1870 – 1872", t: "La culminación", p: "En 1870–72 siguen los hastiales del transepto y la aguja sobre el crucero (Dachreiter)." }
    ],
    kf: { eb: "VIAJE EN EL TIEMPO", h: "De la catedral románica a su culminación", lead: "Recorra la época de construcción con el scroll, imagen a imagen." },
    frames: [
      { d: "HACIA 1000", t: "La catedral románica", p: "El edificio románico anterior se amplía hacia el oeste: transepto, dos torres, atrio y una cripta forman parte del conjunto. De la catedral románica hoy solo queda en pie la Eselsturm." },
      { d: "1156 · 1172", t: "Incendios y restauración", p: "La catedral románica sufre dos incendios, en 1156 y 1172, y es restaurada en ambas ocasiones." },
      { d: "1273 · 1276", t: "Incendio e inicio de la construcción gótica", p: "En 1273 un incendio destruye el edificio románico anterior. Hacia 1275 comienza la nueva construcción gótica, en el este: como primera parte se consagró en 1276, probablemente, el coro sur. Desde allí la catedral crece hacia el oeste." },
      { d: "1295 – 1315", t: "Nace el coro del gótico pleno", p: "En el este, el coro se reformula en gótico pleno: desde 1295 surge una segunda fase, con muros cada vez más abiertos a la luz y el alzado tripartito de arcadas, triforio y claristorio. Hacia 1310/15 llega el primer gran acristalamiento con vidrieras." },
      { d: "1325 – 1443", t: "La catedral crece hacia el oeste", p: "La obra avanza de este a oeste: el transepto y los tramos de la nave crecen hacia poniente. La colegiata de St. Johann dificulta la continuación; hacia 1360, en el oeste solo son posibles sobre todo la nave lateral sur y la planta baja de la torre sur." },
      { d: "HASTA 1520/25", t: "Las torres inacabadas", p: "Desde hacia 1325 la fachada oeste crece durante unos 200 años «de abajo a la derecha hacia arriba a la izquierda». Hacia 1520/25 la gran obra se detiene: ambas torres terminan a la altura del cuerpo de campanas, bajo tejados piramidales." },
      { d: "1859 – 1869", t: "Se culminan las torres", p: "Sobre los muñones medievales llega la culminación: las torres se prolongan en vertical y reciben cuerpos octogonales y las actuales agujas neogóticas (unos 105 m). En 1870–72 siguen los hastiales del transepto y la aguja sobre el crucero (Dachreiter)." },
      { d: "SIGLO XX", t: "Taller de la catedral y restauración", p: "En 1923/24 la Dombauhütte (taller de la catedral) se restablece como taller estatal y trabaja desde entonces sin interrupción. En 1984–1989 siguen una restauración integral y la construcción de la cripta episcopal; en 1985–1988 se restaura la policromía del interior." }
    ],
    tl: { eb: "CRONOLOGÍA", h: "Casi 600 años de historia constructiva", lead: "La película recorre la época de construcción de la catedral. Elija una fecha para saltar directamente a ese momento.", play: "REPRODUCIR", pause: "PAUSA", soundOn: "ACTIVAR SONIDO", soundOff: "QUITAR SONIDO", videoAria: "Película: cronología de la catedral", note: "Los rótulos dentro de la película están en alemán e inglés." },
    tlv: [
      { y: "1273", h: "Incendio de la catedral románica", p: "En 1273 un incendio destruye el edificio románico anterior." },
      { y: "HACIA 1275", h: "Inicio de la construcción gótica", p: "La nueva obra comienza en el este. Como primera parte se consagró en 1276, probablemente, el coro sur." },
      { y: "DESDE 1295", h: "El coro del gótico pleno", p: "Desde 1295 el coro se reformula en gótico pleno. Hacia 1310/15 llega el primer gran acristalamiento con vidrieras." },
      { y: "DESDE HACIA 1325", h: "La catedral crece hacia el oeste", p: "El transepto y los tramos de la nave crecen hacia poniente; la fachada oeste se levanta durante unos 200 años." },
      { y: "HACIA 1520/25", h: "Paralización", p: "La gran obra se detiene: ambas torres terminan a la altura del cuerpo de campanas, bajo tejados piramidales." },
      { y: "1859 – 1869", h: "Se culminan las torres", p: "Sobre los muñones medievales se levantan los cuerpos octogonales y las agujas neogóticas, de unos 105 metros." },
      { y: "1870 – 1872", h: "Hastiales del transepto y aguja del crucero", p: "En 1870–72 siguen los hastiales del transepto y la aguja sobre el crucero (Dachreiter)." },
      { y: "1923/24", h: "El taller de la catedral", p: "La Dombauhütte se restablece como taller estatal y trabaja desde entonces sin interrupción." },
      { y: "2006", h: "Patrimonio Mundial de la UNESCO", p: "Desde 2006 la catedral forma parte del Patrimonio Mundial de la UNESCO «Casco antiguo de Ratisbona con Stadtamhof»." }
    ],
    glas: { eb: "VIDRIO Y MATERIAL", h: "Luz, vidrio y piedra", lead: "De qué está hecha la catedral — y cómo entra la luz en el espacio." },
    glasSteps: [
      { d: "VIDRIERAS", t: "La luz como material de construcción", p: "Con el coro del gótico pleno los muros se abren cada vez más a la luz. Hacia 1310/15 llega el primer gran acristalamiento con vidrieras: la luz de color pasa a formar parte de la arquitectura." },
      { d: "TALLER", t: "De la pieza de vidrio a la ventana", p: "El vidrio se corta, se pinta, se cuece y se engarza en plomo. La visualización muestra estos pasos." },
      { d: "DETALLE", t: "El color de cerca", p: "De cerca se aprecia el trabajo en cada pieza de vidrio: color, dibujo y red de plomo." },
      { d: "PIEDRA", t: "Un edificio de piedra natural", p: "La catedral está construida en piedra natural. El taller de la catedral trabaja hasta hoy exclusivamente con piedra natural." },
      { d: "TRACERÍA Y ESCULTURA", t: "La forma sale del bloque", p: "Tracerías, pináculos y ornamentos se hacen a mano, pieza a pieza, a partir de la piedra." }
    ],
    people: { eb: "DOMBAUHÜTTE", h: "Las personas detrás de la catedral", lead: "Una catedral no surge sola. Canteros, artesanos y la Dombauhütte (taller de la catedral) le dieron forma durante generaciones. El taller trabaja hasta hoy exclusivamente con piedra natural; en 2023 celebró 100 años de trabajo ininterrumpido." },
    peopleSteps: [
      { d: "CANTEROS", t: "El trabajo de la piedra", p: "Oficio, herramienta y una mirada entrenada: los canteros dan forma a la catedral desde hace generaciones." },
      { d: "TALLER", t: "La Dombauhütte", p: "La Dombauhütte es el taller de la catedral: aquí se planifica, se trabaja y se conserva. En 1923/24 se restableció como taller estatal y trabaja desde entonces sin interrupción." },
      { d: "PLANIFICACIÓN", t: "Del diseño a la pieza", p: "Al principio está el dibujo: las formas se diseñan y se trasladan a la piedra." },
      { d: "CARPINTEROS", t: "Madera para un edificio de piedra", p: "Andamios y armaduras de cubierta forman parte de la obra: sin madera no hay catedral de piedra." },
      { d: "MEDIOS DE ELEVACIÓN", t: "Piedra a piedra hacia lo alto", p: "Cada sillar debe elevarse y colocarse en su sitio." }
    ],
    under: { eb: "BAJO LA CATEDRAL", h: "Capas bajo la catedral", lead: "Bajo la catedral actual hay capas de épocas anteriores: huellas, cimientos y niveles arqueológicos. Las imágenes visualizan esta mirada a la profundidad.", alt: "Vista bajo la catedral" },
    route: { eb: "RECORRIDO", h: "Explorar la catedral", lead: "Elija un lugar: de la fachada oeste al interior." },
    routeSteps: [
      { l: "Oeste", t: "La fachada oeste", p: "La vista desde el oeste: fachada, portadas y las dos torres." },
      { l: "Lados", t: "A lo largo de la nave", p: "Contrafuertes y cubiertas muestran cómo se sostiene el edificio." },
      { l: "Este", t: "El coro", p: "En el este comenzó la construcción gótica." },
      { l: "Interior", t: "El interior", p: "Desde la portada oeste, por la nave, hasta el coro." },
      { l: "Detalle", t: "Pilares y bóvedas", p: "La altura del espacio nace de pilares, nervios y bóvedas." }
    ],
    now: { eb: "HOY", h: "La catedral hoy", lead: "Desde 2006 la catedral forma parte del Patrimonio Mundial de la UNESCO «Casco antiguo de Ratisbona con Stadtamhof». El taller de la catedral trabaja hasta hoy exclusivamente con piedra natural; en 2023 celebró 100 años de trabajo ininterrumpido.", alt: "La catedral hoy" },
    end: { h: "Un salto en el tiempo", p: "La catedral es un lugar donde los siglos se superponen. Descubra otros lugares de Ratisbona.", overview: "AL INICIO", sb: "PUENTE DE PIEDRA", note: "Las imágenes y los vídeos de esta página son visualizaciones basadas en el estado actual de la investigación histórica y no sustituyen a la fotografía documental." },
    guide: { fab: "Abrir guía Brückmandl", aria: "Bruckmandl — su guía ZEITSPRUNG", role: "Su guía ZEITSPRUNG", hi: "¡Grüß Gott! Normalmente vigilo en el Puente de Piedra; aquí le acompaño por la catedral. Elija un tema.", go: "Ir al capítulo →", ctx: "Relacionado con este capítulo" },
    guideTopics: [
      ["Historia constructiva", "Tras el incendio de 1273, hacia 1275 comienza la nueva construcción gótica, en el este. Desde allí la catedral crece tramo a tramo hacia el oeste. Hacia 1520 las obras se detienen; las torres no se culminan hasta 1859–1869."],
      ["Cronología", "La cronología muestra la época de construcción como película. Elija allí una fecha para saltar directamente a ese momento."],
      ["Este → Oeste", "La catedral gótica no creció de una sola vez, sino tramo a tramo: del coro en el este a las torres en el oeste."],
      ["Fachada oeste", "Desde hacia 1325 la fachada oeste crece durante unos 200 años «de abajo a la derecha hacia arriba a la izquierda»."],
      ["Torres", "Hacia 1520/25 ambas torres terminan a la altura del cuerpo de campanas, bajo tejados piramidales. Entre 1859 y 1869 se levantan los cuerpos octogonales y las agujas neogóticas, de unos 105 metros."],
      ["Vidrieras", "Con el coro del gótico pleno los muros se abren a la luz. Hacia 1310/15 llega el primer gran acristalamiento con vidrieras."],
      ["Materiales", "La catedral está construida en piedra natural. El taller de la catedral trabaja hasta hoy exclusivamente con piedra natural."],
      ["Dombauhütte", "En 1923/24 la Dombauhütte se restablece como taller estatal y trabaja desde entonces sin interrupción. En 2023 celebró 100 años de trabajo ininterrumpido."],
      ["Bajo la catedral", "Bajo la catedral actual hay capas de épocas anteriores: huellas, cimientos y niveles arqueológicos. Las imágenes de ese capítulo son visualizaciones."],
      ["Hoy", "Desde 2006 la catedral forma parte del Patrimonio Mundial de la UNESCO «Casco antiguo de Ratisbona con Stadtamhof»."]
    ]
  }
};
