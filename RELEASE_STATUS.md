# ZEITSPRUNG PRESENTATION RELEASE

**Status:** PRESENTATION_READY_WITH_2_POST_RELEASE_MEDIA_SWAPS

**Date:** 2026-09-01

## Known post-presentation media swaps

These do not block the current presentation build. Neither is shown to visitors as a warning, error, or development banner.

1. **Steinerne Brücke K06** — possible historical visual inconsistency (a visually complete Gothic cathedral spire may appear in a frame currently mapped to 1140–1146, before the Dom's Gothic phase). Flagged internally as `VISUAL_REVIEW_REQUIRED` in `03_ASSETS/Steinerne_Bruecke/2d/KFRAMES_STORY_MAP.json` (K06 entry only). Current image remains active.

2. **Steinerne Brücke historical reel** — user will supply/replace the final reel after today's presentation. Current file remains active: `assets/steinerne-bruecke/reels/sb_kframes_history_reel_15s_v01_web.mp4`, referenced directly in `STEINERNE_BRUECKE/js/main.js` (no manifest entry exists for the reel — confirmed no natural place to attach an internal status marker there, so no marker was added to avoid inventing an untracked field pattern; this document is the marker).

## Deployment architecture note

The public GitHub Pages deployment (`jesflovar-maker/zeitsprung-preview`) is a **build/copy artifact**, not a mirror of `ZEITSPRUNG_MASTER`'s own folder layout. It preserves the exact same relative structure (`index.html` + `STEINERNE_BRUECKE/` subfolder, not flattened) but had to include copies of the specific `03_ASSETS/Steinerne_Bruecke/` and `02_CONTENT/Steinerne_Bruecke/SOURCES/` files the bridge experience references, plus deployment-only relative-path fixes to a handful of path constants that were previously hardcoded as domain-root-absolute (`/03_ASSETS/...`) for local-dev convenience. `ZEITSPRUNG_MASTER`'s own source files were left completely untouched — see the deploy repo's own commit message for the exact file list.

This document is intentionally not linked from any page navigation.
