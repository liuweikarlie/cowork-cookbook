# Copilot Cowork Cookbook

A static training cookbook for **Microsoft 365 Copilot Cowork**, built with Astro and TypeScript. Includes English, Traditional Chinese, and Simplified Chinese; five deck-based scenarios; original English slide prompts; and a separate in-memory assumptions calculator.

**Status: local authoring preview, not a verified training release.** No real Cowork desktop run or capture has been performed. Screenshot positions are explicitly pending, not simulated screens. Financial models and translations require human review. The preview is published at https://liuweikarlie.github.io/cowork-cookbook/ and stays labeled as an authoring preview (noindex) until the release gate passes.

## Run locally

Use a supported Node LTS version (Node 24 recommended; one transitive dependency requires Node 22.19 or later).

```powershell
npm ci
npm run build
npm.cmd run preview -- --host 127.0.0.1 --port 4321
```

Open `http://127.0.0.1:4321/cowork-cookbook/en/`. The preview command runs in the foreground; stop it with Ctrl+C.

On Windows PowerShell, use `npm.cmd` for commands that forward flags; the `npm.ps1` shim can consume them. On other platforms, use `npm`.

For development, this scaffold also supports `npm.cmd run dev -- --background`, then `npm.cmd run astro -- dev status` / `npm.cmd run astro -- dev stop`. Do not detach a process without user authorization.

```powershell
npm run check
npm test
npx playwright install chromium
npm run test:e2e
```

Browser tests start and stop their own production-preview server. Keep port 4321 available.

If the Chromium download is unavailable and Microsoft Edge is already installed, use an isolated Edge test context instead:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'msedge'
npm run test:e2e
```

This does not automate or capture the user's Copilot desktop app.

## What is implemented

- Learner-first discovery: recognizable business problems, desired workflows, and tangible deliverables. Recipe pages place business context beside a prominent annual capacity estimate, with visible assumptions and a personalization action before the tutorial.
- Persistent desktop scenario navigation grouped by persona; accessible mobile drawer with a no-JavaScript disclosure fallback.
- Continuous recipe pages, wide-screen section outline, prompt copying, language switching, light/dark theme, and accessible assumption dialogs.
- Five scenarios with source-derived business context, goals, data sources, workflow stages, expected outputs, and the original English prompts. The source workflows have four, five, six, five, and six stages respectively.
- Original prompt wording, placeholders, and approval clauses preserved on all three language editions. Chinese text translates or summarizes the surrounding source content; it does not replace the English prompt.
- No custom lab prompts, fictional datasets, sample ZIPs, or authored answer keys. Learners need the source systems and authorized work context described in the deck.
- Typed, deterministic capacity-value models. Shared and persona-specific inputs update figures, component explanations, and related narrative together.
- Inputs are held only in memory. No storage, cookies, URL parameters, telemetry, server, or external calculation endpoint receives them. Full reloads/new tabs reset to defaults; enhanced navigation preserves them within the open page.
- Content, arithmetic, TypeScript, and browser validation; the Pages workflow publishes the labeled preview.

## Material provenance

The presentation is the source of truth for task prompts and workflow instructions. `src/data/deck-prompts.ts` preserves the original prompt text, with paragraph-edge whitespace normalized. There are no appended safety prompts or rewritten tasks. Source approval conditions remain intact. Website usage reminders are explicitly labeled as cookbook guidance, outside the copyable prompt.

The earlier synthetic exercises and downloads have been removed at the user's request. The deck itself does not provide a verified click-by-click tutorial; actual execution evidence remains a release requirement. Reading or copying a prompt does not authorize access, communication, publishing, scheduling, or writebacks.

The separate capacity estimator remains cookbook-authored, using source-informed inputs rather than reproducing the slides' headline benefit figures. Its function-wide estimates are not per-person savings, cash savings, or net ROI. Editing assumptions does not change the original prompts or workflows.

After building, compare the site directly with your private local deck:

```powershell
python scripts\verify-deck.py 'C:\path\to\Persona-based Use Cases and Business Value [Nifty Fifty].pptx'
```

This checks the prompt on all 15 recipe pages and the English goals, outputs, and workflow sequences. Unit tests also pin source-extracted prompt fingerprints. The deck is not included in the repository or build artifacts.

Source content lives in `src/data/recipes.ts` as structured localized entries. An Astro content collection validates the same schema used by tests. Keeping the three language variants together makes field parity explicit without adding an MDX compiler.

## Release blockers

1. Enable authorized Computer Use or provide guided manual captures of **actual** Copilot Cowork runs. Follow [capture instructions](docs/screenshot-capture.md).
2. Review both Chinese editions and execute the original source prompts in the intended product.
3. Review the cookbook-authored financial formulas and public assets. The source deck lacks formula notes for the five pilot cases.
4. Authorize access to create/manage `liuweikarlie/cowork-cookbook`. The planning-time CLI identity had no push permission to that account's existing Pages repository.

Run `npm run release:check`. It currently **fails by design**, enumerating missing evidence and review approvals. Until it passes, the site shows the authoring-preview notice and is marked noindex.

## GitHub Pages

The configured destination is `https://liuweikarlie.github.io/cowork-cookbook/`. No remote repository has been created. The existing personal homepage must remain unchanged.

Pushing to `main` in `liuweikarlie/cowork-cookbook` runs **Deploy cookbook to GitHub Pages** (Pages source: GitHub Actions). The workflow builds with `COOKBOOK_ADMIN=off`, so the `/admin/` page and its links are left out of the public site; local builds keep them. Keep a known-good commit for rollback; redeploy that revision rather than editing generated HTML.

## Maintainer guides

- [Authoring and source mapping](docs/authoring.md)
- [Real screenshot capture](docs/screenshot-capture.md)
- [Localization](docs/localization.md)
- [Benefit models and review](docs/benefit-models.md)

The original presentation, account data, credentials, and raw captures must never enter the public repository. Public permission for adapted scenario concepts does not automatically authorize third-party assets or real-tenant screenshots.
