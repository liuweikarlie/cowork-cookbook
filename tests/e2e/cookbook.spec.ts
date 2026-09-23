import { test, expect } from '@playwright/test';
import { recipes } from '../../src/data/recipes';
import { ui } from '../../src/i18n';
import { locales } from '../../src/lib/schema';

const recipeIds = ['executive-command-center','customer-meeting-prep','campaign-asset-production','case-intake-brief','close-variance-narrative'];
test('all recipes and locales show source prompts and do not serve retired assets', async ({ page, request }) => {
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(error.message));
  for (const locale of ['en','zh-Hant','zh-Hans']) {
    for (const id of recipeIds) {
      await page.goto(`${locale}/recipes/${id}/`);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('[data-scenario-link][aria-current="page"]')).toHaveCount(1);
      const recipe = recipes.find((recipe) => recipe.id === id)!;
      await expect(page.locator('.step')).toHaveCount(recipe.steps.length);
      await expect(page.locator('.capture-pending')).toHaveCount(recipe.steps.filter((step) => !step.evidence.length).length);
      await expect(page.locator('#prompt-source')).toHaveText(recipe.sourcePrompt);
      expect(await page.locator('#prompt-source').textContent()).toBe(recipe.sourcePrompt);
      const placeholders = [...new Set(recipe.sourcePrompt.match(/\[[^\]]+\]/g) ?? [])];
      await expect(page.locator('[data-placeholders] mark')).toHaveText(placeholders);
      await expect(page.locator('.review-step')).toContainText(recipe.reviewGate[locale as 'en']);
      await expect(page.locator('#prompt-source')).toHaveAttribute('lang','en');
      await expect(page.locator('a[href*="practice-data"], a[href*="reference-checks"]')).toHaveCount(0);
    }
  }
  for (const id of recipeIds) {
    expect((await request.get(`practice-data/${id}/practice-pack.zip`)).status()).toBe(404);
    expect((await request.get(`reference-outputs/${id}/reference-checks.txt`)).status()).toBe(404);
  }
  expect(failures).toEqual([]);
});
test('search, filtering, theme, and locale navigation work', async ({ page }) => {
  await page.goto('en/?scoutTheme=light');
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await page.locator('#theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.locator('#scenario-search').fill('meeting prep');
  await expect(page.locator('[data-recipe-card]:visible')).toHaveCount(1);
  await expect(page.locator('[data-scenario-link]:visible')).toHaveCount(1);
  await page.locator('[data-clear-search]').click();
  await page.locator('#scenario-search').fill('detective work');
  await expect(page.locator('[data-recipe-card]:visible')).toHaveCount(1);
  await expect(page.locator('[data-scenario-link]:visible')).toHaveText('Daily executive command center');
  await page.locator('[data-clear-search]').click();
  await page.locator('#complexity-filter').selectOption('high');
  await expect(page.locator('[data-recipe-card]:visible')).toHaveCount(1);
  await page.locator('[data-scenario-link]').filter({ hasText: 'meeting' }).click();
  await expect(page).toHaveURL(/customer-meeting-prep/);
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.locator('.language-links summary').click();
  await page.locator('[data-language-link][lang="zh-Hant"]').click();
  await expect(page).toHaveURL(/zh-Hant\/recipes\/customer-meeting-prep/);
});
test('settings apply consistently, cancel safely, persist only across enhanced navigation', async ({ page }) => {
  await page.goto('en/recipes/customer-meeting-prep/');
  const before = await page.locator('[data-benefit-total]').textContent();
  await page.locator('.benefit [data-open-settings]').click();
  await page.locator('#input-annualCost').fill('120000');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  expect(await page.locator('[data-benefit-total]').textContent()).toBe(before);
  await page.locator('.benefit [data-open-settings]').click();
  await expect(page.locator('#input-annualCost')).toHaveValue('100000');
  await page.locator('#input-annualCost').fill('120000');
  await page.getByRole('button', { name: 'Apply assumptions', exact: true }).click();
  await expect(page.locator('[data-benefit-total]')).toContainText('645,120');
  await expect(page.locator('[data-benefit-narrative]')).toContainText('645,120');
  await page.locator('[data-scenario-link]').filter({ hasText: 'Daily executive' }).click();
  await expect(page.locator('[data-benefit-total]')).toContainText('1,536,000');
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, cookies: document.cookie }))).toEqual({local:0,session:0,cookies:''});
  await page.reload();
  await expect(page.locator('[data-benefit-total]')).toContainText('1,280,000');
});
test('invalid settings cannot apply and reset changes only the draft', async ({ page }) => {
  await page.goto('en/recipes/case-intake-brief/');
  const baseline = await page.locator('[data-benefit-total]').textContent();
  await page.locator('.benefit [data-open-settings]').click();
  await page.locator('#input-annualHours').fill('0');
  await page.getByRole('button',{name:'Apply assumptions',exact:true}).click();
  await expect(page.locator('#assumptions-dialog')).toBeVisible();
  await expect(page.locator('#input-annualHours')).toHaveAttribute('aria-invalid','true');
  expect(await page.locator('[data-benefit-total]').textContent()).toBe(baseline);
  await page.locator('#reset-draft').click();
  await expect(page.locator('#input-annualHours')).toHaveValue('1800');
  await page.getByRole('button',{name:'Apply assumptions',exact:true}).click();
  await expect(page.locator('#assumptions-dialog')).not.toBeVisible();
});
test('mobile navigation, screenshots slots, and dialog fit without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('zh-Hant/recipes/close-variance-narrative/');
  await expect(page.locator('.outline')).not.toBeVisible();
  await page.locator('#scenario-menu > summary').click();
  await expect(page.locator('[data-scenario-link]').first()).toBeVisible();
  await page.locator('#scenario-menu > summary').focus();
  await page.keyboard.press('Escape');
  await expect(page.locator('#scenario-menu')).not.toHaveAttribute('open','');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.locator('.benefit [data-open-settings]').click();
  await expect(page.locator('#assumptions-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#assumptions-dialog')).not.toBeVisible();
});
test('no-JavaScript pages retain source text, navigation, and baseline estimates', async ({ browser }) => {
  const context = await browser.newContext({javaScriptEnabled:false});
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/cowork-cookbook/zh-Hans/recipes/customer-meeting-prep/');
  await expect(page.locator('.step')).toHaveCount(5);
  await expect(page.locator('[data-benefit-total]')).toContainText('537,600');
  await expect(page.locator('.benefit [data-open-settings]')).not.toBeVisible();
  await expect(page.locator('#prompt-source')).toHaveText(recipes[1].sourcePrompt);
  await expect(page.locator('a[download]')).toHaveCount(0);
  await context.close();
});
test('prompt copying, anchor-preserving locale changes, and navigation history', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto('en/recipes/customer-meeting-prep/');
  const prompt = recipes[1].sourcePrompt;
  await page.locator('[data-copy="prompt-source"]').click();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard.replace(/\r\n/g, '\n')).toBe(prompt);
  await page.locator('a[href="#walkthrough"]').first().click();
  await page.locator('.language-links summary').click();
  await page.locator('[data-language-link][lang="zh-Hans"]').click();
  await expect(page).toHaveURL(/zh-Hans\/recipes\/customer-meeting-prep\/#walkthrough/);
  await page.goBack();
  await expect(page).toHaveURL(/en\/recipes\/customer-meeting-prep\/#walkthrough/);
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('Deliberate permission-denial test')) }, configurable: true });
  });
  await page.locator('[data-copy="prompt-source"]').click();
  await expect(page.locator('#announcement')).toContainText('Copy failed');
});
test('visual review captures for desktop, settings, and mobile', async ({ page }, testInfo) => {
  await page.goto('en/?scoutTheme=light');
  await page.screenshot({path:testInfo.outputPath('home-desktop.png'),fullPage:true});
  await page.goto('en/recipes/customer-meeting-prep/');
  await page.screenshot({path:testInfo.outputPath('recipe-desktop.png')});
  await page.locator('.prompt-block').screenshot({path:testInfo.outputPath('original-prompt.png')});
  await page.locator('.benefit [data-open-settings]').click();
  await page.screenshot({path:testInfo.outputPath('assumptions-desktop.png')});
  await page.keyboard.press('Escape');
  await page.setViewportSize({width:390,height:844});
  await page.goto('zh-Hant/recipes/close-variance-narrative/');
  await page.screenshot({path:testInfo.outputPath('recipe-mobile.png')});
  await page.locator('.benefit').scrollIntoViewIfNeeded();
  await page.screenshot({path:testInfo.outputPath('value-mobile.png')});
  await page.locator('#theme-toggle').click();
  await page.locator('.benefit').scrollIntoViewIfNeeded();
  await page.screenshot({path:testInfo.outputPath('value-mobile-dark.png')});
  await page.locator('#scenario-menu > summary').click();
  await page.screenshot({path:testInfo.outputPath('navigation-mobile.png')});
});
test('business context and value lead each localized recipe with explicit source provenance', async ({ page }) => {
  await page.setViewportSize({width:1366,height:900});
  for (const locale of locales) {
    for (const recipe of recipes) {
      await page.goto(`${locale}/recipes/${recipe.id}/?scoutTheme=light`);
      await expect(page.locator('h1')).toHaveText(recipe.hook[locale]);
      await expect(page.locator('.business-story')).toContainText(recipe.before[locale]);
      await expect(page.locator('[data-source-provenance]')).toContainText(ui(locale,'originalPromptBody'));
      await expect(page.locator('.preview-notice summary')).toHaveText(ui(locale,'previewShort'));
      const valueBox = await page.locator('[data-benefit-total]').boundingBox();
      const contextBox = await page.locator('.business-story').boundingBox();
      expect(valueBox!.y + valueBox!.height).toBeLessThan(900);
      expect(contextBox!.y).toBeLessThan(600);
      expect(valueBox!.x).toBeGreaterThan(contextBox!.x + contextBox!.width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
      expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(255, 255, 255)');
    }
    await page.setViewportSize({width:390,height:844});
    await page.goto(`${locale}/recipes/close-variance-narrative/`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.locator('[data-source-provenance]').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-source-provenance]')).toBeVisible();
    await page.setViewportSize({width:1366,height:900});
  }
});
test('visible value assumptions update together without changing the original prompt or workflow', async ({ page }) => {
  await page.goto('en/recipes/customer-meeting-prep/');
  const prompt = await page.locator('#prompt-source').textContent();
  const workflow = await page.locator('[data-source-workflow]').allTextContents();
  await expect(page.locator('[data-benefit-licensed]')).toHaveText('1,000');
  await expect(page.locator('[data-benefit-adoption]')).toHaveText('80%');
  await expect(page.locator('[data-benefit-risk]')).toHaveText('90%');
  await page.locator('.benefit [data-open-settings]').click();
  await page.locator('#input-salesUsers').fill('500');
  await page.locator('#input-activeRate').fill('50');
  await page.locator('#input-riskReduction').fill('80');
  await page.getByRole('button',{name:'Apply assumptions',exact:true}).click();
  await expect(page.locator('[data-benefit-licensed]')).toHaveText('500');
  await expect(page.locator('[data-benefit-adoption]')).toHaveText('50%');
  await expect(page.locator('[data-benefit-risk]')).toHaveText('80%');
  await expect(page.locator('[data-benefit-total]')).toContainText('336,000');
  expect(await page.locator('#prompt-source').textContent()).toBe(prompt);
  expect(await page.locator('[data-source-workflow]').allTextContents()).toEqual(workflow);
});
test('home cards explain Cowork and show live value estimates', async ({ page }) => {
  await page.goto('en/');
  await expect(page.locator('.intro-explainer h3')).toHaveCount(4);
  await expect(page.locator('.how-steps li')).toHaveCount(5);
  const salesCard = page.locator('.card-value[data-benefit="sales"] [data-benefit-total]');
  await expect(salesCard).toContainText('537,600');
  await expect(salesCard).not.toContainText('.00');
  await page.locator('.topbar [data-open-settings]').click();
  await page.locator('#input-activeRate').fill('40');
  await page.getByRole('button',{name:'Apply assumptions',exact:true}).click();
  await expect(salesCard).toContainText('268,800');
  await expect(page.locator('.card-run[data-run="sales"] [data-run-key="cost-run"]')).toContainText('5.00');
  await page.goto('en/recipes/customer-meeting-prep/');
  const run = page.locator('.run-cost');
  await expect(run.locator('[data-run-key="cost-run"]')).toContainText('5.00');
  await expect(run.locator('[data-run-key="value-run"]')).toContainText('38.89');
  await expect(run.locator('[data-run-key="cost-month"]')).toContainText('120');
  await expect(run.locator('[data-run-ratio]')).toHaveText('7.8×');
  await expect(page.locator('#input-salesCredits')).toHaveCount(0);
  await page.getByRole('link',{name:'Admin: credits per run'}).first().click();
  await expect(page).toHaveURL(/\/en\/admin\/$/);
  await expect(page.locator('[data-admin-row="sales"] [data-admin-key="cost-run"]')).toContainText('5.00');
  await page.locator('#admin-sales').fill('1000');
  await expect(page.locator('[data-admin-row="sales"] [data-admin-key="ratio"]')).toHaveText('3.9×');
  await expect(page.locator('#admin-json')).toContainText('"sales": 1000');
  const download = page.waitForEvent('download');
  await page.getByRole('button',{name:'Download credit-settings.json'}).click();
  expect((await download).suggestedFilename()).toBe('credit-settings.json');
  await page.getByRole('button',{name:'Preview on this site (this tab only)'}).click();
  await page.locator('.sidebar a[href$="/en/recipes/customer-meeting-prep/"]').first().click();
  await expect(run.locator('[data-run-key="cost-run"]')).toContainText('10.00');
  await expect(run.locator('[data-run-ratio]')).toHaveText('3.9×');
});
test('getting started shows the four Cowork access checks', async ({ page }) => {
  await page.goto('en/getting-started/');
  await expect(page.locator('.access-card')).toHaveCount(4);
  await expect(page.locator('.access-card video')).toHaveCount(2);
  for (const src of await page.locator('.access-card img, .access-card video').evaluateAll((els) => els.map((el) => (el as HTMLImageElement).src))) {
    expect((await page.request.get(src)).status()).toBe(200);
  }
  await expect(page.locator('body')).not.toContainText('Microsoft 365 Copilot license');
  await expect(page.locator('.brand-logo')).toBeVisible();
});
