# ZEITSPRUNG V2 — Fixed Asset Slot System · Steinerne Brücke

**Status:** architecture prepared and documented. The 2.5D experience itself has NOT been built yet — this system only exists so future content can be swapped without touching code.

---

## 1. What this is

A fixed, human-manageable folder of **curated web copies** for Steinerne Brücke. These are NOT the MASTER source assets — the originals in `03_ASSETS/Steinerne_Bruecke/` were never moved, renamed, or modified. Everything here is a copy made for direct web use, under a stable, predictable filename.

## 2. Where it lives

```
04_PREVIEWS/PROTOTYPES/ZEITSPRUNG_V2/assets/steinerne-bruecke/
├── hero/
├── overview/
├── exploded/
├── details/
├── materials/
├── restoration/
├── timeline/
├── video/
└── depth/
```

## 3. How to replace content (two ways — no code, no HTML, no GSAP changes needed)

**Option 1 — Keep the filename, replace the file.**
Drop a new file on top of the existing one with the exact same filename (e.g. overwrite `hero/hero_main.png` with a new image, same name). The site keeps working immediately — nothing else changes.

**Option 2 — Change one path in the JSON.**
Edit `03_ASSETS/Steinerne_Bruecke/2_5D_ASSET_MAP.json` → `web_slots.slots.<slot_name>.path` to point somewhere else entirely (new filename, new subfolder). Again, no HTML/GSAP/layout edit required — once the future site is wired to read from this JSON (see §6), it will pick up the new path automatically.

## 4. Current slot map

| Slot | File | Status |
|---|---|---|
| `hero_main` | `hero/hero_main.png` | ✅ populated |
| `bridge_full` | `hero/bridge_full.png` | ✅ populated |
| `overview_main` | `overview/overview_main.png` | ✅ populated |
| `exploded_main` | `exploded/exploded_main.png` | ✅ populated |
| `exploded_piers` | `exploded/exploded_piers.png` | ✅ populated |
| `exploded_arches` | `exploded/exploded_arches.png` | ✅ populated |
| `exploded_deck` | `exploded/exploded_deck.png` | ✅ populated |
| `detail_pier_01` | `details/detail_pier_01.png` | ✅ populated |
| `detail_arch_01` | `details/detail_arch_01.png` | ✅ populated |
| `material_stone_01` | `materials/material_stone_01.png` | ✅ populated |
| `restoration_2010_2018_01` | `restoration/restoration_2010_2018_01.png` | ✅ populated |
| `depth_bridge_alpha` | `depth/SB_DEPTH_02_BRIDGE_ALPHA.png` | ✅ populated (copy of `03_ASSETS/Steinerne_Bruecke/IMAGES/MASTER/SB_DEPTH_02_BRIDGE_ALPHA.png` — 1536×512 RGBA, 16 arches/15 piers confirmed, used as the single rigid layer in the 2.5D museum experience) |
| `depth_foreground_alpha` | `depth/SB_DEPTH_03_FOREGROUND_ALPHA.png` | ✅ populated but fully transparent (READY_EMPTY_BY_DESIGN — copy of `03_ASSETS/Steinerne_Bruecke/IMAGES/MASTER/SB_DEPTH_03_FOREGROUND_ALPHA.png`, referenced by the 2.5D museum experience but currently contributes no visible pixels) |
| `timeline_F01` … `timeline_F12` | `timeline/F01.webp` … `F12.webp` | ⏳ **reserved, empty** — separate future task |
| `video_preview` | `video/preview.mp4` | ⏳ empty — no source assigned |
| `video_fpv` | `video/fpv.mov` | ✅ populated (see format note) |
| `video_construction` | `video/construction.mp4` | ⏳ empty — no source exists |
| `video_restoration` | `video/restoration.mp4` | ⏳ empty — no source exists |
| `video_assembly` | `video/assembly.mp4` | ⏳ empty — no source exists |

Every slot's real path, its MASTER source (for traceability), and its status live in `2_5D_ASSET_MAP.json` → `web_slots.slots`. This table is a convenience summary — the JSON is the source of truth.

## 5. Format note — read before assuming `.webp`/`.mp4`

This environment has no `.webp` encoder (`cwebp` not installed, `sips` cannot write webp) and no `ffmpeg`. So:

- **Images** were copied as **`.png`** (visually and functionally identical to `.webp` in a browser, just larger on disk). Filenames match what was requested except the extension.
- **Video** (`fpv`) was copied as its real container, **`.mov`** (HEVC + AAC) — already confirmed to play correctly in Chromium during V2 testing. It was NOT renamed to `.mp4`, because a renamed `.mov` is not guaranteed to be a valid `.mp4` file just by changing the extension.
- To get true `.webp`/`.mp4` later: re-encode with any image tool / `ffmpeg -i fpv.mov -c copy fpv.mp4` (a fast remux, no quality loss, once `ffmpeg` is available), then apply Option 1 or Option 2 above. The slot system does not care which format is used — only that the file at the stated path is valid.

## 6. How the future site should consume this (not implemented yet)

The existing `ZEITSPRUNG_V2/STEINERNE_BRUECKE/js/main.js` already uses a single `ASSET_BASE` constant prefixed onto per-state paths — the same pattern should be reused for the 2.5D build: define one `SLOT_BASE` (or load `2_5D_ASSET_MAP.json` directly at runtime) and resolve every image/video `src` from `web_slots.slots.<name>.path`. This is intentionally **not wired up yet** — no 2.5D HTML/JS was built in this task, per instruction.

## 7. What was NOT done in this task (by design)

- No 2.5D experience was built.
- No timeline frames (F01–F12) were chosen or populated — that curation is a separate, not-yet-started task.
- No video transcoding was performed (no tool available) — `fpv.mov` is the real file, others remain empty placeholders.
- No MASTER or REFERENCE source file was moved, renamed, or modified.

## 8. Update — first 2.5D museum build (this task)

A first working 2.5D "museum" experience (`#museum25d`) was built directly into
`04_PREVIEWS/PROTOTYPES/ZEITSPRUNG_V2/STEINERNE_BRUECKE/` (see `js/museum25d.js`).
It formalizes the `depth/` folder anticipated above (previously "tentatively placed
under hero/" — no file ever actually lived there, this is the first population)
and consumes `overview/`, `exploded/`, `details/`, `materials/` slots directly by
path, following the same `ASSET_BASE`-relative pattern already used in `main.js`.
`restoration/restoration_2010_2018_01.png` was intentionally NOT reused for the
CONSTRUCTION mode (a restoration photo is not a construction photo); that mode
shows an explicit PENDING state instead. No slot file was renamed, overwritten,
or moved by this task — only two new files were added under the new `depth/`
folder, exactly as anticipated in §6/§7 above.
