import { existsSync } from 'node:fs';
import { recipes } from '../src/data/recipes';
import { recipeSchema } from '../src/lib/schema';
import { releaseReview } from '../src/data/release';

const release = process.argv.includes('--release');
const errors: string[] = [];
const ids = new Set<string>();
for (const recipe of recipes) {
  const result = recipeSchema.safeParse(recipe);
  if (!result.success) errors.push(`${recipe.id}: ${result.error.message}`);
  if (ids.has(recipe.id)) errors.push(`Duplicate recipe: ${recipe.id}`);
  ids.add(recipe.id);
  const stepIds = new Set<string>();
  for (const step of recipe.steps) {
    if (stepIds.has(step.id)) errors.push(`${recipe.id}: duplicate step ${step.id}`);
    stepIds.add(step.id);
    for (const image of step.evidence) {
      if (image.file.includes('..') || !existsSync(`public/screenshots/${recipe.id}/${image.file}`)) errors.push(`${recipe.id}: invalid or missing screenshot ${image.file}`);
    }
    if (release && step.evidence.length === 0) errors.push(`${recipe.id}/${step.id}: genuine capture required`);
  }
  if (existsSync(`public/practice-data/${recipe.id}`) || existsSync(`public/reference-outputs/${recipe.id}/reference-checks.txt`)) errors.push(`${recipe.id}: retired synthetic assets must not be published`);
  if (release && (!recipe.verified || !recipe.translationsReviewed)) errors.push(`${recipe.id}: real run and translation review are incomplete`);
  if (release && !recipe.outputEvidence?.length) errors.push(`${recipe.id}: sanitized actual Cowork output ZIP required`);
  for (const output of recipe.outputEvidence ?? []) {
    if (!existsSync(`public/reference-outputs/${recipe.id}/${output.file}`)) errors.push(`${recipe.id}: missing captured output ${output.file}`);
  }
}
if (release && (!releaseReview.financialModelApproved || !releaseReview.publicAssetsApproved || !releaseReview.reviewRecord || !existsSync(releaseReview.reviewRecord))) {
  errors.push('Financial models and public assets require a documented review record. See src/data/release.ts and docs/benefit-models.md.');
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`${recipes.length} multilingual recipes validated. Preview only; run release:check before publishing.`);
}
