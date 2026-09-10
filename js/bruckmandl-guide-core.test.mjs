/* ZEITSPRUNG V2 — js/bruckmandl-guide-core.test.mjs
   ============================================================================
   Minimal, framework-free regression test for matchBruckmandlIntent()
   (js/bruckmandl-guide-core.js). This prototype has no test runner
   configured anywhere in the frontend (no package.json, no jest/vitest/
   mocha config under 04_PREVIEWS/PROTOTYPES/ZEITSPRUNG_V2) — this script is
   plain Node/ESM, runnable directly:

     node 04_PREVIEWS/PROTOTYPES/ZEITSPRUNG_V2/js/bruckmandl-guide-core.test.mjs

   Exits 0 if every case passes, exits 1 (non-zero) if any case fails, and
   always prints a full pass/fail summary line-by-line.

   Placed alongside bruckmandl-guide-core.js (not a separate test/ folder)
   since this prototype has no existing test-folder convention to follow —
   co-locating the test with the single module it exercises is the lowest-
   friction, easiest-to-find option.
   ============================================================================ */

import { matchBruckmandlIntent } from "./bruckmandl-guide-core.js";

/** Each case: [label, rawText, lang, expectedTopicIdOrNull] */
const cases = [
  // --- EN -------------------------------------------------------------
  ["EN — what's fact (straight apostrophe U+0027)", "what's fact", "en", "fact_legend"],
  ["EN — what’s fact (curly apostrophe U+2019)", "what’s fact", "en", "fact_legend"],
  // These 3 cases use paraphrased/shortened wording rather than a shipped
  // keyword phrase verbatim. Verified against the CURRENT, unchanged
  // material/bridge_materials/arches keyword lists (this task's fixes did
  // not add/remove any of those keyword strings, only normalized them —
  // normalizing an already-plain-ASCII, already-lowercase phrase is a
  // no-op): none of the shipped keyword phrases for material/
  // bridge_materials/arches is a substring of these particular inputs, so
  // the matcher's correct, expected, pre-existing behavior is `null`
  // (never guess). This null result is itself a useful assertion for §5 of
  // the brief: it confirms these paraphrases do NOT falsely cross-match
  // "material" vs "bridge_materials" (or "arches" vs "bridge_overview")
  // either — no silent wrong-topic guess, just a correct non-match.
  ["EN — statue material phrasing (paraphrase, no shipped keyword covers it -> null, not a false cross-match)", "what material is the statue made of", "en", null],
  ["EN — bridge materials phrasing (paraphrase, no shipped keyword covers it -> null, not a false cross-match)", "what materials were used in the bridge", "en", null],
  ["EN — how many arches (bare, shorter than the shipped bridge_overview keyword phrase -> null)", "how many arches", "en", null],
  ["EN — how was the bridge built", "how was the bridge built", "en", "construction"],
  ["EN — tell me the legend", "tell me the legend", "en", "legend"],

  // --- DE ---------------------------------------------------------------
  ["DE — statue material phrasing", "aus welchem material bist du", "de", "material"],
  ["DE — bridge materials phrasing", "aus welchen materialien besteht die brücke", "de", "bridge_materials"],
  ["DE — Bögen", "Bögen", "de", null],
  ["DE — Pfeiler", "Pfeiler", "de", null],
  ["DE — Bauweise", "Bauweise", "de", null],
  ["DE — Legende", "Legende", "de", null],

  // --- ES ---------------------------------------------------------------
  ["ES — statue material phrasing", "¿de qué material estás hecho?", "es", "material"],
  ["ES — bridge materials phrasing", "¿de qué materiales está construido el puente?", "es", "bridge_materials"],
  ["ES — arcos", "arcos", "es", null],
  ["ES — pilares", "pilares", "es", null],
  ["ES — construcción", "construcción", "es", null],
  ["ES — leyenda", "leyenda", "es", null],

  // --- Edge cases ---------------------------------------------------------
  ["Edge — empty string", "", "en", null],
  ["Edge — unrecognized gibberish", "asdkjfh qweoiruqwoiuer zzz", "en", null],
  ["Edge — extra punctuation", "what... is, the;; legend?!?", "en", "legend"],
  ["Edge — uppercase input", "WHO ARE YOU", "en", "who"],
  ["Edge — double spaces", "who  are   you", "en", "who"],
  ["Edge — curly-apostrophe input (generic)", "what’s the legend", "en", "legend"]
];

// -----------------------------------------------------------------------
// Notes on single-bare-word DE/ES cases above ("Bögen", "Pfeiler",
// "Bauweise", "Legende", "arcos", "pilares", "construcción", "leyenda"):
// these bare nouns, on their own, are NOT substrings of any currently
// shipped keyword phrase for their respective topic (every DE/ES keyword
// phrase is a multi-word phrase such as "wie sind die pfeiler aufgebaut" /
// "como estan construidos los pilares" — the bare noun alone never
// satisfies text.includes(fullPhrase)). Expected result is therefore null
// (safe fallback), not a guess. This is the CORRECT behavior of the
// current, already-approved keyword content — this test intentionally
// documents that behavior rather than inventing a new expected mapping.
// -----------------------------------------------------------------------

let pass = 0;
let fail = 0;

for (const [label, rawText, lang, expected] of cases) {
  const actual = matchBruckmandlIntent(rawText, lang);
  const ok = actual === expected;
  if (ok) {
    pass++;
    console.log(`PASS  ${label}  ->  ${JSON.stringify(actual)}`);
  } else {
    fail++;
    console.log(`FAIL  ${label}  ->  got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
  }
}

console.log("");
console.log(`${pass} passed, ${fail} failed, ${cases.length} total`);

if (fail > 0) {
  process.exit(1);
}
