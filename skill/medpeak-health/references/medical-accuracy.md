# Medical accuracy (a health channel lives or dies on this)

## Sources
- Allowed: PubMed (peer-reviewed papers, prefer meta-analyses, RCTs and large cohorts), WHO, NIH,
  CDC, ICMR, NHS, national guidelines. Not allowed as a source: blogs, news articles, brand sites,
  other YouTube videos, AI summaries.
- Read the abstract (`videos/<slug>/research/abstracts.md`) and copy the exact figure, the sample size
  and the comparison into the source's `note` in video.json. The script's wording must match the note.
- Every scene that says a number lists its source id (the checker fails otherwise). The video shows
  "Source: ..." on screen and the description lists every source with its link.
- Check links: `node pipeline/research.mjs <slug> --check-urls` (CDC/AHA block bots: cite WHO/PubMed).

## Wording
- Association is not causation: cohort studies are "linked to", "associated with"; only trials say
  "caused" or "lowered".
- Keep the comparison: "26% higher risk than people who drank none", not "26% more diabetes".
- Do not round into a new claim: HR 2.75 = "nearly three times"; 7.2% -> 3.8% stays exact.
- Prediabetes is not diabetes. Risk is not certainty. A study in children is said to be in children.
- Never: cure, miracle, detox, guaranteed, "reverses diabetes", "doctors hate this", dosing advice,
  telling viewers to stop a medicine. The checker blocks the obvious ones.
- Every description ends with the disclaimer; the long video's end screen repeats it.

## Visuals
- Never an AI image or video of a real, identifiable person. Organs and cells are stylised.
- AI-made visuals are disclosed on upload (`containsSyntheticMedia: true`).

## Toons, format 6 (2026-11-23)

The owner approved the engine study (decisions 1, 2, 20): "All 28 recommend and start 2 to 3 agents to fix and upgrade engine and everything i want proper as per report".
- A Toon carries at most 3 sourced facts in the story, at least 2 of them in the answer block; the rest go to the
  description, each with its source. Every fact still has an allowed source with its exact words in `note`.
- The answer block names the condition (a title word or the `term`), the cause in plain words and ONE action, and ends with
  (or is followed by) the care line. Association wording unchanged ("linked to"), no doses, no "stop taking".
- One spoken source word at most ("a study", "WHO"), only where honesty needs it. One number said aloud at most.
- A time card's claim ("8 HOURS LATER" the carbon monoxide falls) is a fact like any other: sourced, or cut.
