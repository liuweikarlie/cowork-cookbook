# Localization

Supported locales: `en`, `zh-Hant`, `zh-Hans`. Language changes preserve the recipe and matching step anchor; all versions use the same model state within enhanced navigation.

UI text: `src/i18n/index.ts`. Recipe content: `src/data/recipes.ts`. Field labels and generated benefit prose: `src/lib/benefits.ts`. Getting-started content is in its localized route template.

The `text(en, hant, hans)` helper and schema require all variants. A missing/empty translation fails validation. Do not substitute a Simplified string for Traditional Chinese without review.

Original English slide prompts are intentionally shared verbatim across all language editions, retaining placeholders and approval clauses. Do not create translated replacement prompts or add task instructions. Surrounding Chinese content translates or summarizes the source business context, goals, workflow, data sources, and expected outputs. Genuine English app screenshots can be shared with localized captions and alt text.

Glossary: approval = 核准 / 批准; draft = 草稿; source = 來源 / 来源; capacity value = 產能價值 / 产能价值. Do not translate capacity value as guaranteed cash savings.

Translations are authored but **not human-reviewed**. Mark `translationsReviewed` true only after review; separately verify real execution of the original English prompts. Numbers use locale formatting but remain USD; language selection never performs FX conversion.
