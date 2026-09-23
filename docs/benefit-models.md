# Capacity model v1 — pending human review

These are **cookbook-authored estimates**, not recovered formulas from the slide deck and not validated ROI. There is no implementation cost, net ROI, or payback calculation. Capacity recovered is not necessarily cash saved.

## Source audit

Slide 110 supplies baseline inputs and derived definitions. Slide 111 describes recalculation. Slide 112 warns that improvements and totals are illustrative.

The supplied 112-slide file has 30 notes parts; 10 contain scenario formula lines. None belongs to the five pilot pairs (8–9, 28–29, 48–49, 68–69, 88–89). Do not force a formula to match a rounded dollar headline.

Important corrections:

- `cost_per_user` means fully loaded annual employee cost, not software price.
- Risk adjustment of 90% means multiplying by **0.10**.
- Meeting preparation is **0.75 hours** and follow-up is **0.5 hours**, not 75% and 50%.
- Team headcount ("People in …") is scoped per function. Marketing and Finance activity inputs are already team totals.
- Slide 111's reference to slides 2–51 is stale; the source now contains 51 visible case pairs, while slide 112 still says 50.

## Shared definitions

`active = people in the function × active rate`

`hourly cost = annual employee cost / annual working hours`

`retained = 1 - risk reduction`

`component capacity value = annual hours saved × hourly cost × retained`

Each rate shown as a percentage in settings is divided by 100 exactly once. Executive hourly cost additionally uses the executive multiplier. A cookbook-specific calendar assumption annualizes executive daily work using five days per working week.

## Reviewed specification to approve

| Model | Annual hours saved | Baseline value (USD/year) |
|---|---|---:|
| Executive | `active × executive share × weeks × 5 × administrative hours/day × saving` | 1,280,000.00 |
| Sales preparation | `active × seller share × meetings/week × weeks × preparation hours × preparation saving` | 345,600.00 |
| Sales follow-up | `active × seller share × meetings/week × weeks × follow-up hours × follow-up saving` | 192,000.00 |
| Marketing | `campaigns × assets/campaign × hours/asset × participation × saving` | 80,000.00 |
| Service | `active × agent share × cases/day × service days × covered-case share × minutes saved / 60` | 304,000.00 |
| Finance | `team close hours/month × 12 × participation × saving` | 53,333.33 |

For team-volume Marketing and Finance models, `participation = active rate` if active users are nonzero, otherwise zero. This is an explicit cookbook assumption about the fraction of team activity assisted, not a fact established by the deck. Increasing headcount with a fixed team workload does not increase modeled savings; it changes feasibility/capacity checks.

Default improvements (all provisional): Executive 50%; Sales preparation 60%, follow-up 50%; Marketing 40%; Service 30% covered cases with five minutes saved; Finance 25%. Visible slide improvement labels informed some defaults, but their applicability remains unverified.

Only Sales has two additive components, using disjoint preparation and follow-up hours. Revenue, margin, retention, and risk-reduction benefits remain qualitative. Therefore gross margin and revenue anchors are not editable controls in v1: no published monetary formula uses them.

Do not add the five recipe values into a portfolio total. Separate user groups do not prove that all business outcomes are independent.

## Independent custom example

Change only annual employee cost to USD 120,000 and adoption to 50%:

| Executive | Sales combined | Marketing | Service | Finance |
|---:|---:|---:|---:|---:|
| 960,000 | 403,200 | 60,000 | 228,000 | 40,000 |

Tests compare unrounded values with a USD 0.00001 tolerance. Formatting rounds only the presentation. Service minutes saved cannot exceed baseline handling time. Workload cannot exceed the relevant annual user capacity. Empty, nonfinite, negative, fractional-headcount, and out-of-range inputs are rejected, never silently defaulted.

## Publication approval

A human reviewer must confirm the model assumptions, units, treatment of adoption, overlap, workload constraints, source rights, and limitations. Store a non-sensitive review record in the repository. Update `src/data/release.ts` only after that review; point `reviewRecord` at the actual record. Do not insert an approval name or date on someone else's behalf.

Any change to formulas or defaults requires fresh independent examples and review. Benefits-only settings must never rewrite source-deck prompts, workflows, or screenshots. This separate calculator is unchanged by the removal of synthetic labs.

## Cost vs value per run

`runEconomics()` in `src/lib/benefits.ts` compares one run and one month of runs with an estimated Cowork cost. Cowork is billed per use in Copilot Credits (Microsoft Learn: usage-based billing). Cost per run = credits per run × price per credit, both read from `src/data/credit-settings.json` (illustrative defaults 300 / 500 / 500 / 500 / 800 credits, USD 0.01 pay-as-you-go). Value per run = hours saved per run × hourly employee cost (× executive multiplier), without the annual risk discount; the cautious value is shown separately. Run cadence: executive per working day, sales per meeting, marketing per campaign (team), service per covered case, finance per monthly close (team). Credit defaults are not Microsoft-published and require review.
## Updating credits per run (admin)

Credits per run and the credit price live in one file: `src/data/credit-settings.json`. Learners cannot edit them in the Assumptions dialog.

1. Open `/<locale>/admin/` (linked from the footer: “Admin: credits per run”). Enter the credits per run for each recipe and the price per credit; the table previews cost, time value and value ÷ cost live.
2. “Preview on this site” applies the numbers in the current tab only (memory-only, resets on reload).
3. “Download credit-settings.json” (or “Copy JSON”), then replace the file in the repository and commit to `main`. The Pages workflow rebuilds the site with the new defaults.

The page is static and unauthenticated; publishing is controlled by repository write access, not by the page.
