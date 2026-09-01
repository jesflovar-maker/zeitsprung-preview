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
**Document/File:** UNKNOWN (URL/entry not held locally)
**Type:** City archive
**Used for:** Bruckmandl figure interpretation (alternative readings)
**Evidence level:** SECONDARY
**Project location:** `01_ARCHITECTURE/ZEITSPRUNG_WEB_OPERATING_RULES.md` §29.8
**Cross-reference:** `SB_SRC_003`

---

### Q006

**Title:** Ausstellungstafeln / documentación oficial sobre la Steinerne Brücke
**Institution / Author:** Stadt Regensburg
**Document/File:** UNKNOWN
**Type:** Museum source
**Used for:** Not currently cited by any registered claim — secondary/complementary official source, referenced but not yet directly consulted
**Evidence level:** NEEDS_REVIEW
**Project location:** `01_ARCHITECTURE/ZEITSPRUNG_WEB_OPERATING_RULES.md` §29.8
**Cross-reference:** `SB_SRC_004`

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

## Claims not currently backed by any registered source

These remain explicitly unsupported — see `CLAIM_SOURCE_MAP.json` for the full record:

- **K08** — condition/date not confirmed, no source.
- **K09** — condition/date not confirmed, no source.
- **K06 Dom-spire visual-review flag** — a possible inconsistency between K06's depicted background (an apparently complete Gothic spire) and the Dom-Gothic-background rule (Q002), for a frame dated 1140–1146. Flagged `VISUAL_REVIEW_REQUIRED` in `KFRAMES_STORY_MAP.json`; not resolved, image/date/sources untouched.

## What this file deliberately does NOT do

- It does not translate official titles — "Die Steinerne Brücke – 2010 bis 2018" and similar official titles remain in their original language everywhere they are cited or displayed.
- It does not invent a publication year, author, or URL where the project holds none.
- It does not mark every claim SUPPORTED — three claims above are explicitly left unsupported, and `bridge_15_piers` is explicitly marked as a structural derivation rather than an independently attested fact.
