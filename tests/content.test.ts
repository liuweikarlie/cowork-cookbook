import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { recipes } from '../src/data/recipes';
import { locales, recipeSchema } from '../src/lib/schema';

// SHA-256 of the original PPTX prompt text boxes: trimmed paragraphs joined by LF.
const sourceHashes = [
  '2ff92f69f8d00101664b78a5df9bd3c85dc648b3811d36f6f480e5ab19d0970e',
  '3d9604c74e6817b299fdb086dfb9508a7676e6423320f4686e155c88edc9d142',
  '88bf7a23120d49ac8a0742e695e74f9f0be282e266dc5f10e86a4b1b276e4351',
  '212cfe971e34dc53052cd18436fc26ca499f3d9e915bb048b671ce50c22628d2',
  'cd2252fee790fe258bb21e477896a4896b88c7a64e0a586c552686cd2deaaffc',
];

test('five complete locale-validated recipes with source workflows', () => {
  assert.equal(recipes.length, 5);
  assert.equal(new Set(recipes.map((recipe) => recipe.id)).size, 5);
  assert.deepEqual(recipes.map((recipe) => recipe.steps.length), [4,5,6,5,6]);
  for (const recipe of recipes) {
    recipeSchema.parse(recipe);
    assert.equal(new Set(recipe.steps.map((step) => step.id)).size, recipe.steps.length);
    for (const locale of locales) {
      assert.ok(recipe.goal[locale]);
      assert.ok(recipe.steps.every((step) => step.title[locale].includes('→')));
    }
  }
});
test('original English prompts match source-deck fingerprints, including placeholders and approval clauses', () => {
  recipes.forEach((recipe, index) => {
    assert.equal(createHash('sha256').update(recipe.sourcePrompt).digest('hex'), sourceHashes[index], recipe.id);
  });
});
test('schema rejects missing translations and unreviewed evidence', () => {
  const invalid = structuredClone(recipes[0]);
  invalid.title['zh-Hant'] = '';
  assert.equal(recipeSchema.safeParse(invalid).success, false);
  const missing = { ...recipes[0], title: { en: 'Only English' } };
  assert.equal(recipeSchema.safeParse(missing).success, false);
  const unreviewed = structuredClone(recipes[0]);
  const injected = { ...unreviewed, steps: [{ ...unreviewed.steps[0], evidence: [{file:'test.png', reviewed:false}] }, ...unreviewed.steps.slice(1)] };
  assert.equal(recipeSchema.safeParse(injected).success, false);
});
test('retired synthetic packs and independent answer keys are not public assets', () => {
  for (const recipe of recipes) {
    assert.equal(existsSync(`public/practice-data/${recipe.id}`), false);
    assert.equal(existsSync(`public/reference-outputs/${recipe.id}/reference-checks.txt`), false);
  }
});
test('unverified captures are never misrepresented as real output', () => {
  for (const recipe of recipes) {
    if (recipe.verified) {
      for (const step of recipe.steps) assert.ok(step.evidence.length > 0);
      assert.ok(recipe.outputEvidence?.length);
    }
    for (const step of recipe.steps) {
      for (const image of step.evidence) {
        assert.equal(image.reviewed,true);
        assert.equal(image.redacted,true);
      }
    }
  }
});
