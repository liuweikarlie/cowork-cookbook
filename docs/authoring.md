# Recipe authoring

## Source mapping

The five pilot pairs are Executive 8–9, Sales 28–29, Marketing 48–49, Service 68–69, and Finance 88–89. The full deck has 112 slides: overview 1–7, detailed pairs 8–109, assumptions 110–112.

The visible pair ranges are Executive 8–27 (10), Sales 28–47 (10), Marketing 48–67 (10), Service 68–87 (10), and Finance & Operations 88–109 (11). Finance includes a Weekly business review at 94–95. The source's 50-case summary and aggregate benefit figures do not reconcile with this structure. Expand only after reconciling this discrepancy; do not inherit the original aggregate.

## Content

Edit `src/data/recipes.ts`. Each entry is loaded into an Astro content collection and validated against `src/lib/schema.ts`. It needs stable IDs, all three languages for surrounding content, value context, source slide numbers, prerequisites, data sources, goal, source workflow stages, original English prompt, expected output, and evidence metadata.

Store the unchanged English prompt in `src/data/deck-prompts.ts`, with only paragraph-edge whitespace normalized. Retain placeholders, unusual wording, and approval clauses. Do not append custom task instructions or invent follow-up prompts. All locales display the same English original, explicitly labeled.

Number the deck's workflow stages in their original order, not a fixed four-step template. Do not invent exact UI actions, expected results, sample records, or answer keys. General access/placeholder guidance belongs outside the prompt, clearly identified as cookbook guidance. Use stable English slugs and step IDs in every language.

Learner-facing fields derived from the deck's overview slides 3–7 and each recipe's slides: `worksIn` (apps listed on the slide), `thesis`, `measures` (the ROI-hypothesis KPIs), `deckHeadline` (the slide's headline benefit, shown only as a labeled reference beside the capacity-only estimate), and `reviewGate` (a plain-language restatement of the prompt's own approval clause). Recipe pages render a beginner "Run it in Cowork" sequence: open Cowork, fill the placeholders (extracted automatically from `[brackets]`), copy the prompt (highlighted display; the copied `textContent` is the exact original), follow the deck stages, and review before approving.

Preview entries are visible in the local authoring build. Public deployment is all-or-nothing for the five-recipe pilot: the release gate must pass for every entry. Do not publish draft entries as verified lessons.

## Assets

- No synthetic practice-data downloads or authored reference-check files.
- `public/reference-outputs/<id>/`: actual sanitized Cowork artifacts only after authorized execution and review.
- `public/screenshots/<id>/`: genuine reviewed screenshots only.
- Raw captures stay outside the repository, preferably in the private session workspace. `.capture-private/` is also ignored, but do not rely on ignoring a file as a substitute for reviewing what you commit.

HTML output downloads must not execute inside the site origin. Provide static previews and downloads, not trusted inline HTML.

## Validation

Run `npm run build`, `npm run check`, `npm test`, and `npm run test:e2e`. Run `npm run release:check` before any public deployment. Add new models only through typed calculation functions with documented units and independent expected values.

Run `python scripts\verify-deck.py '<private-deck-path>'` after building. Prompt fingerprints in content tests were extracted from the source PPTX, not the recipe implementation; update them only after verifying an intentional source revision.
