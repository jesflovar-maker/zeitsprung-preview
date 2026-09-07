# ZEITSPRUNG — Steinerne Brücke
## Quellen / Sources Master

Every source below was found in existing ZEITSPRUNG project material — `01_ARCHITECTURE/ZEITSPRUNG_ACCURACY_RULES.md`, `03_ASSETS/Steinerne_Bruecke/2d/MUSEUM_CONTENT_MAP.json`, the project's own OCR working transcript, and `02_CONTENT/SOURCES/SOURCE_REGISTRY.md`. No internet research was performed for this task and no bibliographic detail was invented. Where a detail could not be found, it is written `null`/`UNKNOWN` rather than guessed.

This file is the human-readable companion to `sources.json` (machine-readable) and `CLAIM_SOURCE_MAP.json` (claim → source mapping). IDs here (`Q001`, `Q002`, …) are a new, monument-scoped ID space; each entry also cross-references the pre-existing `SB_SRC_00x` ID already registered in the central `02_CONTENT/SOURCES/SOURCE_REGISTRY.json` — both registries are kept consistent, neither supersedes the other.

---

### Q001

**Title:** Die Steinerne Brücke – 2010 bis 2018
**Institution / Author:** Tiefbauamt Regensburg (author: UNKNOWN)
**Publisher:** Battenberg Gietl Verlag
**ISBN:** 978-3-86646-366-0
**Year:** UNKNOWN — not held in any project document
**Document/File:** Cited via the project's own OCR working transcript at `03_ASSETS/Steinerne_Bruecke/DOCUMENTS/Die_Steinerne_Bruecke_Textextraktion.pdf`
**Type:** Official published documentation
**Used for:** Construction dates, arch count, length, materials, foundation technique, restoration
**Evidence level:** PRIMARY
**Project location:** `01_ARCHITECTURE/ZEITSPRUNG_ACCURACY_RULES.md` (Monumento 1 — "Fuente autorizada principal")
**Cross-reference:** `SB_SRC_001` in `02_CONTENT/SOURCES/SOURCE_REGISTRY.json`
**Notes:** The authorized principal source for this monument. Publisher and ISBN were found in `MUSEUM_CONTENT_MAP.json`'s `primary_source_note` — this detail existed in the project already but had not previously been propagated into the central source registry.

---

### Q002

**Title:** ZEITSPRUNG_ACCURACY_RULES.md — Monumento 1: Steinerne Brücke
**Institution / Author:** ZEITSPRUNG project
**Document/File:** `01_ARCHITECTURE/ZEITSPRUNG_ACCURACY_RULES.md`
**Type:** Internal project document
**Used for:** Restates the validated facts originally sourced to Q001 ("Datos validados"); also the source for production/accuracy constraints such as the Dom-Gothic-background rule
**Evidence level:** SECONDARY (restatement of Q001, not an independent authority)
**Project location:** `01_ARCHITECTURE/ZEITSPRUNG_ACCURACY_RULES.md`
**Cross-reference:** `SB_SRC_005`

---

### Q003

**Title:** Die Steinerne Brücke — Textextraktion (OCR working transcript)
**Institution / Author:** ZEITSPRUNG project (working transcript of Q001)
**Document/File:** `03_ASSETS/Steinerne_Bruecke/DOCUMENTS/Die_Steinerne_Bruecke_Textextraktion.pdf`
**Type:** Working document / OCR transcript
**Used for:** Locating specific claims within Q001 via its own "Scanreferenz: Aufnahme NN" page markers — e.g. Aufnahme 020–022 (bridge overview), 050–051 (pier construction/foundation), 052–053 (arch construction, "Wolf" lifting tool), 041 / 087–088 / 108–109 (materials), 070–071 (Rampenbrücke oak piles, dendrochronology 1565/1575), 013–014 (roadway surface, Flossenbürger Granit)
**Evidence level:** SECONDARY / locator aid — the transcript itself carries a printed disclaimer that the Q001 printed edition remains authoritative for exact scholarly citation
**Cross-reference:** none (not separately registered in the central registry)

---

### Q004

**Title:** Steinerne Brücke – Weltwunder des Mittelalters
**Institution / Author:** Regensburg Tourismus GmbH
**Document/File:** UNKNOWN (URL/edition not held locally)
**Type:** Official website
**Used for:** Bruckmandl location and legend
**Evidence level:** SECONDARY
**Project location:** `01_ARCHITECTURE/ZEITSPRUNG_WEB_OPERATING_RULES.md` §29.8
**Cross-reference:** `SB_SRC_002`

---

### Q005

**Title:** Kulturdatenbank – "Bruckmandl"
**Institution / Author:** Stadt Regensburg
**Document/File:** https://www.regensburg.de/kultur/kulturdatenbank/eintrag/118949
**Type:** City archive (official municipal database entry)
**Used for:** Bruckmandl figure identity, dating, material, sculptor, location/orientation, restoration history, and interpretation (alternative readings)
**Evidence level:** PRIMARY
**Project location:** `01_ARCHITECTURE/ZEITSPRUNG_WEB_OPERATING_RULES.md` §29.8
**Cross-reference:** `SB_SRC_003`
**Notes:** Directly fetched and read in full on 2026-09-07 (official regensburg.de Kulturdatenbank entry, HTTP 200). Confirms: Jahr/Zeit der Entstehung 1446; Material Kalkstein (Original: Grünsandstein); Künstler — Original: unbekannt, Kopie: Anton Blank (Skulptur), Michael Mauerer (Entwurf der Säule); installed 23 April 1854 as the second successor of the original (destroyed 1579); on the western parapet at the bridge's highest point, ~11m above the river, facing south; meaning not conclusively settled (Südweiser vs. legendary Baumeister); right arm lost 2012 (probable vandalism), reinstalled after restoration 5 June 2018, a placeholder stood in its place 2014–2017. This entry cites its own source: Bauer, Karl — *Regensburg. Aus Kunst-, Kultur- und Sittengeschichte*, Regensburg 1988, S. 436–8 (registered separately as Q008, not directly consulted).

---

### Q006

**Title:** Ausstellungstafeln / documentación oficial sobre la Steinerne Brücke
**Institution / Author:** Stadt Regensburg
**Document/File:** https://www.regensburg.de/fm/121/steinerne-bruecke-ausstellungstafeln.pdf
**Type:** Museum source (official municipal exhibition panels, PDF, 23 pages)
**Used for:** Bruckmandl history, predecessor figures, long pedestal inscription, short Spruchband inscription, legend text, and the legend's chronological implausibility (pp. 5–6)
**Evidence level:** PRIMARY
**Project location:** `01_ARCHITECTURE/ZEITSPRUNG_WEB_OPERATING_RULES.md` §29.8
**Cross-reference:** `SB_SRC_004`
**Notes:** Directly fetched and read in full on 2026-09-07 (official regensburg.de exhibition-panel PDF, HTTP 200, 23 pages total; Bruckmandl content on pp. 5–6). Confirms the current figure is the third sandstone figure of this name (original destroyed 1579 and lost; second version's torso survives in the Historisches Museum; third version by sculptor Anton Blank, installed 1854); quotes the long pedestal inscription verbatim; quotes the short Spruchband under the left hand verbatim with its St. Emmeram-manuscript translation, stating its interpretation remains unresolved; retells the builder's-wager/devil's-pact legend in full, then explicitly states the two buildings' construction dates make the legend impossible as literally told. Searched all 23 pages for "Wappen"/"Schild"/"Schlüssel"/"Löwe"/"Relief" — zero matches; the panels do not address either heraldic shield on the pedestal. Calls the current figure a "Sandsteinfigur" — conflicts with Q005's "Kalkstein" for the same figure; flagged unresolved, see `CLAIM_SOURCE_MAP.json`'s `bruckmandl_material_current`.

---

### Q007

**Title:** ZEITSPRUNG_CONTROL_PANEL.md — M1 Steinerne Brücke (sub-timelapse torres)
**Institution / Author:** ZEITSPRUNG project
**Document/File:** `01_ARCHITECTURE/ZEITSPRUNG_CONTROL_PANEL.md`
**Type:** Internal production-planning document
**Used for:** Tower-count-by-period figure (3 towers until 1784, 2 until ~1810, 1 since)
**Evidence level:** NEEDS_REVIEW — internal planning figure, no independent external primary source registered yet for the exact years
**Cross-reference:** `SB_SRC_006`

---

### Q008

**Title:** Regensburg. Aus Kunst-, Kultur- und Sittengeschichte
**Institution / Author:** Karl Bauer
**Publisher:** UNKNOWN (not held locally)
**Year:** 1988
**Document/File:** Not held locally — pp. 436–438 cited by Q005
**Type:** Published local-history monograph
**Used for:** Underlying academic source cited by Q005's Kulturdatenbank entry for the Bruckmandl
**Evidence level:** NEEDS_REVIEW
**Project location:** Cited via Q005 only
**Cross-reference:** none
**Notes:** NOT DIRECTLY CONSULTED. Cited by Q005 (Stadt Regensburg Kulturdatenbank, "Bruckmandl" entry) as: "Bauer, Karl: Regensburg. Aus Kunst-, Kultur- und Sittengeschichte. Regensburg 1988, S. 436-8." Registered here only so the citation chain is traceable — do not treat as independently verified evidence until this book is obtained and read directly.

---

## Claims not currently backed by any registered source

These remain explicitly unsupported — see `CLAIM_SOURCE_MAP.json` for the full record:

- **K08** — condition/date not confirmed, no source.
- **K09** — condition/date not confirmed, no source.
- **K06 Dom-spire visual-review flag** — a possible inconsistency between K06's depicted background (an apparently complete Gothic spire) and the Dom-Gothic-background rule (Q002), for a frame dated 1140–1146. Flagged `VISUAL_REVIEW_REQUIRED` in `KFRAMES_STORY_MAP.json`; not resolved, image/date/sources untouched.

## What this file deliberately does NOT do

- It does not translate official titles — "Die Steinerne Brücke – 2010 bis 2018" and similar official titles remain in their original language everywhere they are cited or displayed.
- It does not invent a publication year, author, or URL where the project holds none.
- It does not mark every claim SUPPORTED — three claims above are explicitly left unsupported, and `bridge_15_piers` is explicitly marked as a structural derivation rather than an independently attested fact.
