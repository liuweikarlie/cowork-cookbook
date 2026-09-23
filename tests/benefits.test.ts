import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaults, calculate, validateAssumptions, fields, runEconomics } from '../src/lib/benefits';
import { personas } from '../src/lib/schema';
import { applyAssumptions, getAssumptions } from '../src/lib/assumptions-store';

const expected = { executive: 1280000, sales: 537600, marketing: 80000, service: 304000, finance: 160000 / 3 };
const customExpected = { executive: 960000, sales: 403200, marketing: 60000, service: 228000, finance: 40000 };
function near(actual: number, wanted: number): void { assert.ok(Math.abs(actual - wanted) < 0.00001, `${actual} != ${wanted}`); }
test('independent baseline and custom examples for all five models', () => {
  assert.deepEqual(validateAssumptions(defaults), []);
  for (const persona of personas) {
    near(calculate(persona, defaults).total, expected[persona]);
    near(calculate(persona, { ...defaults, annualCost: 120000, activeRate: 50 }).total, customExpected[persona]);
    const result = calculate(persona, defaults);
    near(result.total, result.components.reduce((sum, part) => sum + part.value, 0));
  }
});
test('risk reduction retains 10 percent, and full reduction retains zero', () => {
  for (const persona of personas) {
    near(calculate(persona, { ...defaults, riskReduction: 0 }).total, expected[persona] * 10);
    near(calculate(persona, { ...defaults, riskReduction: 100 }).total, 0);
  }
});
test('zero adoption or zero function users produces zero deployment benefit', () => {
  for (const persona of personas) {
    near(calculate(persona, { ...defaults, activeRate: 0 }).total, 0);
    near(calculate(persona, { ...defaults, [`${persona}Users`]: 0 }).total, 0);
  }
});
test('team volumes are not multiplied by headcount', () => {
  near(calculate('marketing', { ...defaults, marketingUsers: 2000 }).total, expected.marketing);
  near(calculate('finance', { ...defaults, financeUsers: 2000 }).total, expected.finance);
});
test('persona changes do not alter unrelated models', () => {
  const altered = { ...defaults, meetings: 7, prepSaving: 45 };
  for (const persona of personas.filter((p) => p !== 'sales')) near(calculate(persona, altered).total, expected[persona]);
});
test('every exposed field affects a result or the model capacity validation', () => {
  for (const field of fields) {
    const updated = { ...defaults, [field.id]: defaults[field.id] * 0.75 };
    const altered = personas.some((persona) => calculate(persona, updated).total !== calculate(persona, defaults).total || JSON.stringify(runEconomics(persona, updated)) !== JSON.stringify(runEconomics(persona, defaults)));
    assert.ok(altered || ['marketingUsers', 'financeUsers', 'handleMinutes'].includes(field.id), field.id);
  }
});
test('invalid inputs fail explicitly', () => {
  for (const value of [Number.NaN, Infinity, -1]) assert.ok(validateAssumptions({ ...defaults, annualCost: value }).length);
  assert.ok(validateAssumptions({ ...defaults, annualHours: 0 }).length);
  assert.ok(validateAssumptions({ ...defaults, salesUsers: 1.5 }).some((issue) => issue.code === 'integer'));
  assert.ok(validateAssumptions({ ...defaults, activeRate: 101 }).length);
  assert.ok(validateAssumptions({ ...defaults, sellerShare: 101 }).length);
  assert.ok(validateAssumptions({ ...defaults, minutesSaved: 26 }).length);
  assert.ok(validateAssumptions({ ...defaults, meetings: 100 }).some((issue) => issue.code === 'overload'));
  assert.ok(validateAssumptions({ ...defaults, marketingUsers: 1 }).some((issue) => issue.code === 'overload'));
});
test('zero savings, zero cost and zero workload have valid zero results', () => {
  near(calculate('sales', { ...defaults, prepSaving: 0, followupSaving: 0 }).total, 0);
  near(calculate('finance', { ...defaults, closeHours: 0 }).total, 0);
  for (const persona of personas) near(calculate(persona, { ...defaults, annualCost: 0 }).total, 0);
});
test('applied state is copied and invalid mutations cannot overwrite it', () => {
  const next = { ...defaults, annualCost: 120000 };
  applyAssumptions(next);
  next.annualCost = 2;
  assert.equal(getAssumptions().annualCost, 120000);
  const snapshot = getAssumptions();
  snapshot.annualCost = 0;
  assert.equal(getAssumptions().annualCost, 120000);
  assert.throws(() => applyAssumptions({ ...defaults, annualHours: 0 }));
  assert.equal(getAssumptions().annualCost, 120000);
  applyAssumptions({ ...defaults });
});
test('per-run cost and value use independent expected examples', () => {
  const hourly = 100000 / 1800;
  const wanted = {
    executive: { hours: 1, value: hourly * 3, cost: 3, runs: 20 },
    sales: { hours: 0.7, value: 0.7 * hourly, cost: 5, runs: 24 },
    marketing: { hours: 60, value: 60 * hourly, cost: 5, runs: 25 },
    service: { hours: 5 / 60, value: 5 / 60 * hourly, cost: 5, runs: 72 },
    finance: { hours: 1000, value: 1000 * hourly, cost: 8, runs: 1 },
  };
  for (const persona of personas) {
    const r = runEconomics(persona, defaults);
    near(r.hoursPerRun, wanted[persona].hours);
    near(r.valuePerRun, wanted[persona].value);
    near(r.costPerRun, wanted[persona].cost);
    near(r.runsPerMonth, wanted[persona].runs);
    near(r.costPerMonth, wanted[persona].cost * wanted[persona].runs);
    near(r.breakEvenMinutes * (persona === 'executive' ? hourly * 3 : hourly) / 60, wanted[persona].cost);
  }
  assert.equal(runEconomics('sales', { ...defaults, salesCredits: 0 }).ratio, Infinity);
  near(runEconomics('sales', { ...defaults, creditPrice: 0.008 }).costPerRun, 4);
  near(calculate('sales', { ...defaults, salesCredits: 5000 }).total, expected.sales);
});