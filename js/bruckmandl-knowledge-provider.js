/* ZEITSPRUNG V2 — js/bruckmandl-knowledge-provider.js
   ============================================================================
   BRÜCKMANDL KNOWLEDGE PROVIDER — source-of-answer abstraction (V1).

   WHY THIS FILE EXISTS
   ---------------------
   Both AI-guide surfaces (STEINERNE_BRUECKE/js/bruckmandl.js's monument-page
   assistant and js/index-main.js's persistent INDEX bar) used to call
   bruckmandl-guide-core.js's matchBruckmandlIntent()/BRUCKMANDL_QA/
   BRUCKMANDL_TOPIC_POSE/BRUCKMANDL_TOPIC_STATUS directly. That worked, but it
   meant the UI layer (DOM building, pose/crossfade timing, button state,
   answer-card rendering) was wired straight to ONE specific answer source.

   This file introduces a thin, explicit interface — BrueckmandlKnowledgeProvider
   — between "the UI asks a question" and "something resolves the answer",
   so a future different answer source (e.g. an AIProvider, NOT implemented
   here, NOT even stubbed beyond this shape) could later be swapped in
   without touching the avatar, pose/state machine, i18n, UI markup, or the
   hotspot system. V1 ships exactly ONE implementation: LocalValidatedProvider.

   BrueckmandlKnowledgeProvider interface (duck-typed, no TS in this vanilla
   JS project — documented via JSDoc only):

     getSuggestedTopics(lang) -> Array<{ topic: string, question: string }>
       The fixed list of guided/suggested questions to render as buttons,
       already localized for `lang`.

     answerTopic(topic, lang) -> BrueckmandlAnswer
       Resolves one canonical topic id (as returned by getSuggestedTopics or
       by answerFreeText) to an answer.

     answerFreeText(rawText, lang) -> BrueckmandlAnswer
       Resolves a visitor-typed question to an answer, or to the
       "unmatched" state. Never guesses.

   @typedef {Object} BrueckmandlAnswer
   @property {string|null} topic       - matched canonical topic id, or null
   @property {boolean} matched         - false only for "could not understand
                                          the question" / "no registered
                                          content for this topic" states
   @property {"talk"|"point"} pose     - which avatar pose the UI should show
   @property {("fact"|"legend"|"uncertain")[]} statusCodes
                                        - evidence classification codes for
                                          this specific answer; the UI
                                          resolves these to localized badge
                                          text via BRUCKMANDL_STATUS_LABELS
                                          (unchanged, still owned by
                                          bruckmandl-guide-core.js — this
                                          file does not duplicate UI chrome)
   @property {string} text             - the answer text to display, already
                                          localized for the requested `lang`

   ABSOLUTE RULE (enforced here, not just documented): NO_SOURCE /
   NO_VALIDATED_CONTENT = NO_HISTORICAL_CLAIM. LocalValidatedProvider never
   invents an answer. Every non-fallback answer it returns is one of the
   canonical BRUCKMANDL_QA entries in bruckmandl-guide-core.js — the
   original 8 statue-focused topics (an unedited paraphrase of already-
   approved content from
   02_CONTENT/Steinerne_Bruecke/Bruckmandl/{DE,EN,ES}/bruckmandl_content_*.md)
   plus 6 additive bridge-level topics (bridge_overview/arches/piers/
   bridge_materials/timeline/construction), each composed of verbatim/near-
   verbatim text from 03_ASSETS/Steinerne_Bruecke/2d/MUSEUM_CONTENT_MAP.json
   and STEINERNE_BRUECKE/js/i18n.js's states[] array (see that core file's
   header for the full provenance chain of both groups). getSuggestedTopics()
   below surfaces only the original 8 as buttons; the 6 bridge topics remain
   fully answerable via answerTopic()/answerFreeText(), just not offered as
   suggestion buttons (see that method's own comment for why). This file
   adds NO new historical claims, NO new knowledge, and duplicates NO QA
   content — it only re-shapes existing lookups behind a stable interface.
   ============================================================================ */

import {
  BRUCKMANDL_TOPIC_POSE,
  BRUCKMANDL_TOPIC_STATUS,
  BRUCKMANDL_QA,
  BRUCKMANDL_SUGGESTED_TOPICS,
  BRUCKMANDL_FALLBACK,
  BRUCKMANDL_NO_VALIDATED_INFO,
  matchBruckmandlIntent,
  getBruckmandlEntry
} from "./bruckmandl-guide-core.js";

/**
 * V1's only real BrueckmandlKnowledgeProvider implementation. Answers
 * exclusively from the already-validated local content wired through
 * bruckmandl-guide-core.js — no external AI API, no network call, no
 * free-form generation, no invented content, no gap-filling.
 */
export const LocalValidatedProvider = {
  id: "local-validated-v1",

  /**
   * Returns the curated, short suggestion-button list only (the original 8
   * statue-focused topics — BRUCKMANDL_SUGGESTED_TOPICS). The 6 newer
   * bridge-level topics (bridge_overview/arches/piers/bridge_materials/
   * timeline/construction) are real, fully-answerable canonical topics
   * (see answerTopic()/answerFreeText() below) but are deliberately NOT
   * surfaced here, to keep this panel a short, clean "ask the Bruckmandl"
   * list rather than doubling its button count — they remain reachable via
   * free-text matching and via the fact-card hotspot bridge
   * (STEINERNE_BRUECKE/js/bruckmandl-hotspot-bridge.js). Same interface
   * shape as before (Array<{topic, question}>), so no caller needs to
   * change.
   * @param {string} lang @returns {Array<{topic:string, question:string}>}
   */
  getSuggestedTopics(lang) {
    const list = BRUCKMANDL_QA[lang] || BRUCKMANDL_QA.en;
    return list
      .filter((entry) => BRUCKMANDL_SUGGESTED_TOPICS.includes(entry.topic))
      .map((entry) => ({ topic: entry.topic, question: entry.question }));
  },

  /** @param {string} topic @param {string} lang @returns {BrueckmandlAnswer} */
  answerTopic(topic, lang) {
    const entry = getBruckmandlEntry(topic, lang);
    if (!entry) {
      // Defensive path only — every canonical topic id in V1 (who/when/
      // where/fact_legend/legend/previous_figures/material/detail, plus
      // bridge_overview/arches/piers/bridge_materials/timeline/construction)
      // always resolves. If a caller ever passes an id with no registered
      // content (e.g. a future hotspot topic not yet authored, like the
      // deliberately-excluded south_tower), never invent an answer: return
      // the fixed, exact-wording NO_VALIDATED_CONTENT state.
      return {
        topic,
        matched: false,
        pose: "talk",
        statusCodes: ["uncertain"],
        text: BRUCKMANDL_NO_VALIDATED_INFO[lang] || BRUCKMANDL_NO_VALIDATED_INFO.en
      };
    }
    return {
      topic,
      matched: true,
      pose: BRUCKMANDL_TOPIC_POSE[topic] || "talk",
      statusCodes: BRUCKMANDL_TOPIC_STATUS[topic] || [],
      text: entry.answer
    };
  },

  /** @param {string} rawText @param {string} lang @returns {BrueckmandlAnswer} */
  answerFreeText(rawText, lang) {
    const topic = matchBruckmandlIntent(rawText, lang);
    if (!topic) {
      // Deterministic keyword matcher found no confident match (or a tie —
      // see matchBruckmandlIntent()'s own tie-resolves-to-null rule). Show
      // the "I don't understand which topic you mean" fallback, never a
      // guessed historical claim.
      return {
        topic: null,
        matched: false,
        pose: "talk",
        statusCodes: ["uncertain"],
        text: BRUCKMANDL_FALLBACK[lang] || BRUCKMANDL_FALLBACK.en
      };
    }
    return this.answerTopic(topic, lang);
  }
};

export default LocalValidatedProvider;
