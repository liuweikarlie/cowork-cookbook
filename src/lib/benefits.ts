import { text, type Locale, type Localized, type Persona } from './schema';
import credits from '../data/credit-settings.json';

export const defaults = {
  activeRate: 80, annualCost: 100000, annualHours: 1800, workingWeeks: 48, riskReduction: 90,
  executiveUsers: 1000, executiveShare: 40, executiveMultiplier: 3, executiveDailyHours: 2, executiveSaving: 50,
  salesUsers: 1000, sellerShare: 60, meetings: 6, prepHours: 0.75, followupHours: 0.5, prepSaving: 60, followupSaving: 50,
  marketingUsers: 1000, campaigns: 300, assets: 25, assetHours: 6, marketingSaving: 40,
  serviceUsers: 1000, agentShare: 95, casesDaily: 12, serviceDays: 240, handleMinutes: 25, complexShare: 30, minutesSaved: 5,
  financeUsers: 1000, closeHours: 4000, closeSaving: 25,
  creditPrice: credits.creditPrice, executiveCredits: credits.creditsPerRun.executive, salesCredits: credits.creditsPerRun.sales,
  marketingCredits: credits.creditsPerRun.marketing, serviceCredits: credits.creditsPerRun.service, financeCredits: credits.creditsPerRun.finance,
};
export type InputId = keyof typeof defaults;
export type Assumptions = Record<InputId, number>;
type Field = { id: InputId; group: 'shared' | Persona; advanced?: boolean; admin?: boolean; label: Localized; unit: string; min: number; max: number; step: number; source: 'source' | 'cookbook'; };
const field = (id: InputId, group: Field['group'], label: Localized, unit: string, max: number, options: Partial<Pick<Field, 'advanced' | 'admin' | 'min' | 'step' | 'source'>> = {}): Field =>
  ({ id, group, label, unit, min: 0, max, step: unit === 'users' ? 1 : 0.01, source: 'source', ...options });
export const fields: Field[] = [
  field('activeRate', 'shared', text('Active user rate', '活躍使用者比例', '活跃用户比例'), '%', 100),
  field('annualCost', 'shared', text('Annual employee cost (salary and benefits)', '年度員工成本（薪資與福利）', '年度员工成本（薪资与福利）'), 'USD', 10000000),
  field('annualHours', 'shared', text('Working hours per year', '每年工作時數', '每年工作小时数'), 'h/year', 8760, { min: 1 }),
  field('workingWeeks', 'shared', text('Working weeks per year', '每年工作週數', '每年工作周数'), 'weeks/year', 52, { min: 1 }),
  field('creditPrice', 'shared', text('Price per Copilot Credit (pay-as-you-go)', '每個 Copilot Credit 價格（隨用隨付）', '每个 Copilot Credit 价格（按需付费）'), 'USD/credit', 1, { step: 0.001, admin: true, source: 'cookbook' }),
  field('riskReduction', 'shared', text('Risk adjustment: reduction', '風險調整：扣減比例', '风险调整：扣减比例'), '%', 100),
  field('executiveUsers', 'executive', text('People in the executive office', '主管辦公室人數', '管理层办公室人数'), 'users', 1000000),
  field('executiveShare', 'executive', text('Executive share of active users', '主管佔活躍使用者比例', '主管占活跃用户比例'), '%', 100),
  field('executiveMultiplier', 'executive', text('Executive cost multiplier', '主管成本倍數', '主管成本倍数'), '×', 20),
  field('executiveDailyHours', 'executive', text('Administrative hours per working day', '每日行政工作時數', '每日行政工作小时数'), 'h/day', 24),
  field('executiveCredits', 'executive', text('Copilot Credits per Cowork run (estimate)', '每次 Cowork 執行的 Copilot Credits（估計）', '每次 Cowork 执行的 Copilot Credits（估计）'), 'credits/run', 100000, { step: 1, admin: true, source: 'cookbook' }),
  field('executiveSaving', 'executive', text('Administrative time reduction', '行政工時減少比例', '行政工时减少比例'), '%', 100, { advanced: true, source: 'cookbook' }),
  field('salesUsers', 'sales', text('People in Sales', '銷售團隊人數', '销售团队人数'), 'users', 1000000),
  field('sellerShare', 'sales', text('Seller share of active users', '銷售人員佔活躍使用者比例', '销售人员占活跃用户比例'), '%', 100),
  field('meetings', 'sales', text('Meetings per seller per week', '每位銷售人員每週會議數', '每位销售人员每周会议数'), 'meetings/week', 100),
  field('prepHours', 'sales', text('Preparation hours per meeting', '每次會議準備時數', '每次会议准备小时数'), 'h/meeting', 40),
  field('followupHours', 'sales', text('Follow-up hours per meeting', '每次會議跟進時數', '每次会议跟进小时数'), 'h/meeting', 40),
  field('salesCredits', 'sales', text('Copilot Credits per Cowork run (estimate)', '每次 Cowork 執行的 Copilot Credits（估計）', '每次 Cowork 执行的 Copilot Credits（估计）'), 'credits/run', 100000, { step: 1, admin: true, source: 'cookbook' }),
  field('prepSaving', 'sales', text('Preparation time reduction', '準備工時減少比例', '准备工时减少比例'), '%', 100, { advanced: true, source: 'cookbook' }),
  field('followupSaving', 'sales', text('Follow-up time reduction', '跟進工時減少比例', '跟进工时减少比例'), '%', 100, { advanced: true, source: 'cookbook' }),
  field('marketingUsers', 'marketing', text('People in Marketing', '行銷團隊人數', '市场营销团队人数'), 'users', 1000000),
  field('campaigns', 'marketing', text('Team campaigns per year', '團隊每年活動數', '团队每年活动数'), 'campaigns/year', 100000),
  field('assets', 'marketing', text('Assets per campaign', '每次活動素材數', '每次活动素材数'), 'assets/campaign', 10000),
  field('assetHours', 'marketing', text('Hours per asset', '每項素材工時', '每项素材工时'), 'h/asset', 1000),
  field('marketingCredits', 'marketing', text('Copilot Credits per Cowork run (estimate)', '每次 Cowork 執行的 Copilot Credits（估計）', '每次 Cowork 执行的 Copilot Credits（估计）'), 'credits/run', 100000, { step: 1, admin: true, source: 'cookbook' }),
  field('marketingSaving', 'marketing', text('Asset production time reduction', '素材製作工時減少比例', '素材制作工时减少比例'), '%', 100, { advanced: true, source: 'cookbook' }),
  field('serviceUsers', 'service', text('People in Customer Service', '客戶服務團隊人數', '客户服务团队人数'), 'users', 1000000),
  field('agentShare', 'service', text('Agent share of active users', '客服人員佔活躍使用者比例', '客服人员占活跃用户比例'), '%', 100),
  field('casesDaily', 'service', text('Cases per agent per service day', '每位客服每日案件數', '每位客服每日案件数'), 'cases/day', 500),
  field('serviceDays', 'service', text('Service days per year', '每年服務天數', '每年服务天数'), 'days/year', 366, { min: 1 }),
  field('handleMinutes', 'service', text('Baseline handling minutes per case', '每宗案件基準處理分鐘數', '每宗案件基准处理分钟数'), 'min/case', 480),
  field('serviceCredits', 'service', text('Copilot Credits per Cowork run (estimate)', '每次 Cowork 執行的 Copilot Credits（估計）', '每次 Cowork 执行的 Copilot Credits（估计）'), 'credits/run', 100000, { step: 1, admin: true, source: 'cookbook' }),
  field('complexShare', 'service', text('Cases covered by this workflow', '此流程涵蓋案件比例', '此流程覆盖案件比例'), '%', 100, { advanced: true, source: 'cookbook' }),
  field('minutesSaved', 'service', text('Minutes saved per covered case', '每宗涵蓋案件節省分鐘數', '每宗覆盖案件节省分钟数'), 'min/case', 480, { advanced: true, source: 'cookbook' }),
  field('financeUsers', 'finance', text('People in Finance & Operations', '財務與營運團隊人數', '财务与运营团队人数'), 'users', 1000000),
  field('closeHours', 'finance', text('Whole-team close hours per month', '整個團隊每月結帳工時', '整个团队每月结账工时'), 'h/month', 10000000),
  field('financeCredits', 'finance', text('Copilot Credits per Cowork run (estimate)', '每次 Cowork 執行的 Copilot Credits（估計）', '每次 Cowork 执行的 Copilot Credits（估计）'), 'credits/run', 100000, { step: 1, admin: true, source: 'cookbook' }),
  field('closeSaving', 'finance', text('Close preparation time reduction', '結帳準備工時減少比例', '结账准备工时减少比例'), '%', 100, { advanced: true, source: 'cookbook' }),
];
export type ValidationIssue = { field: InputId; code: 'invalid' | 'integer' | 'overload' };
export type Component = { label: Localized; hours: number; value: number; expression: string };
export type Benefit = { persona: Persona; total: number; hours: number; activeUsers: number; hourlyCost: number; retained: number; components: Component[] };
export function calculate(persona: Persona, a: Assumptions): Benefit {
  const adoption = a.activeRate / 100;
  const users = a[`${persona}Users`];
  const activeUsers = users * adoption;
  const hourly = a.annualCost / a.annualHours;
  const rate = 1 - a.riskReduction / 100;
  const participation = activeUsers > 0 ? adoption : 0;
  const parts: { label: Localized; hours: number; expression: string }[] = [];
  let cost = hourly;
  if (persona === 'executive') {
    const count = activeUsers * a.executiveShare / 100;
    cost *= a.executiveMultiplier;
    parts.push({ label: text('Executive administration', '主管行政工作', '主管行政工作'),
      hours: count * a.workingWeeks * 5 * a.executiveDailyHours * a.executiveSaving / 100,
      expression: `${count} × ${a.workingWeeks} × 5 × ${a.executiveDailyHours} × ${a.executiveSaving}%` });
  } else if (persona === 'sales') {
    const meetings = activeUsers * a.sellerShare / 100 * a.meetings * a.workingWeeks;
    parts.push({ label: text('Meeting preparation', '會議準備', '会议准备'), hours: meetings * a.prepHours * a.prepSaving / 100, expression: `${meetings} × ${a.prepHours} × ${a.prepSaving}%` });
    parts.push({ label: text('Meeting follow-up', '會議跟進', '会议跟进'), hours: meetings * a.followupHours * a.followupSaving / 100, expression: `${meetings} × ${a.followupHours} × ${a.followupSaving}%` });
  } else if (persona === 'marketing') {
    parts.push({ label: text('Campaign asset production', '活動素材製作', '活动素材制作'),
      hours: a.campaigns * a.assets * a.assetHours * participation * a.marketingSaving / 100,
      expression: `${a.campaigns} × ${a.assets} × ${a.assetHours} × ${participation} × ${a.marketingSaving}%` });
  } else if (persona === 'service') {
    const cases = activeUsers * a.agentShare / 100 * a.casesDaily * a.serviceDays;
    parts.push({ label: text('Complex case intake', '複雜案件受理', '复杂案件受理'),
      hours: cases * a.complexShare / 100 * a.minutesSaved / 60,
      expression: `${cases} × ${a.complexShare}% × ${a.minutesSaved} ÷ 60` });
  } else {
    parts.push({ label: text('Close preparation', '結帳準備', '结账准备'),
      hours: a.closeHours * 12 * participation * a.closeSaving / 100,
      expression: `${a.closeHours} × 12 × ${participation} × ${a.closeSaving}%` });
  }
  const components = parts.map((part) => ({ ...part, value: part.hours * cost * rate }));
  return { persona, total: components.reduce((sum, part) => sum + part.value, 0), hours: parts.reduce((sum, part) => sum + part.hours, 0), activeUsers, hourlyCost: cost, retained: rate, components };
}
export type RunEconomics = { persona: Persona; hoursPerRun: number; valuePerRun: number; costPerRun: number; runsPerMonth: number; valuePerMonth: number; costPerMonth: number; ratio: number; breakEvenMinutes: number; retained: number; scope: 'person' | 'team' };
export function runEconomics(persona: Persona, a: Assumptions): RunEconomics {
  const hourly = a.annualCost / a.annualHours;
  let rate = hourly;
  let hoursPerRun = 0;
  let runsPerMonth = 0;
  let scope: RunEconomics['scope'] = 'person';
  if (persona === 'executive') {
    rate *= a.executiveMultiplier;
    hoursPerRun = a.executiveDailyHours * a.executiveSaving / 100;
    runsPerMonth = a.workingWeeks * 5 / 12;
  } else if (persona === 'sales') {
    hoursPerRun = a.prepHours * a.prepSaving / 100 + a.followupHours * a.followupSaving / 100;
    runsPerMonth = a.meetings * a.workingWeeks / 12;
  } else if (persona === 'marketing') {
    hoursPerRun = a.assets * a.assetHours * a.marketingSaving / 100;
    runsPerMonth = a.campaigns / 12;
    scope = 'team';
  } else if (persona === 'service') {
    hoursPerRun = a.minutesSaved / 60;
    runsPerMonth = a.casesDaily * a.serviceDays / 12 * a.complexShare / 100;
  } else {
    hoursPerRun = a.closeHours * a.closeSaving / 100;
    runsPerMonth = 1;
    scope = 'team';
  }
  const valuePerRun = hoursPerRun * rate;
  const costPerRun = a[`${persona}Credits`] * a.creditPrice;
  return { persona, hoursPerRun, valuePerRun, costPerRun, runsPerMonth, valuePerMonth: valuePerRun * runsPerMonth, costPerMonth: costPerRun * runsPerMonth,
    ratio: costPerRun > 0 ? valuePerRun / costPerRun : Infinity, breakEvenMinutes: rate > 0 ? costPerRun / rate * 60 : Infinity, retained: 1 - a.riskReduction / 100, scope };
}
export function validateAssumptions(a: Assumptions): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const f of fields) {
    const n = a[f.id];
    if (!Number.isFinite(n) || n < f.min || n > f.max) issues.push({ field: f.id, code: 'invalid' });
    else if (f.unit === 'users' && !Number.isInteger(n)) issues.push({ field: f.id, code: 'integer' });
  }
  if (issues.length) return issues;
  if (a.minutesSaved > a.handleMinutes) issues.push({ field: 'minutesSaved', code: 'invalid' });
  if (a.executiveUsers > 0 && a.activeRate > 0 && a.executiveShare > 0 && a.workingWeeks * 5 * a.executiveDailyHours > a.annualHours) issues.push({ field: 'executiveDailyHours', code: 'overload' });
  if (a.salesUsers > 0 && a.activeRate > 0 && a.sellerShare > 0 && a.meetings * a.workingWeeks * (a.prepHours + a.followupHours) > a.annualHours) issues.push({ field: 'meetings', code: 'overload' });
  if (a.marketingUsers > 0 && a.activeRate > 0 && a.campaigns * a.assets * a.assetHours > a.marketingUsers * a.annualHours) issues.push({ field: 'campaigns', code: 'overload' });
  if (a.serviceUsers > 0 && a.activeRate > 0 && a.agentShare > 0 && a.casesDaily * a.serviceDays * a.handleMinutes / 60 > a.annualHours) issues.push({ field: 'casesDaily', code: 'overload' });
  if (a.financeUsers > 0 && a.activeRate > 0 && a.closeHours * 12 > a.financeUsers * a.annualHours) issues.push({ field: 'closeHours', code: 'overload' });
  return issues;
}
export const money = (n: number, locale: Locale) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', currencyDisplay: 'code', maximumFractionDigits: 2 }).format(n);
export const wholeMoney = (n: number, locale: Locale) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', currencyDisplay: 'code', maximumFractionDigits: 0 }).format(n);
export const number = (n: number, locale: Locale) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(n);
export function narrative(result: Benefit, locale: Locale): string {
  return text(
    `Under these assumptions, ${number(result.hours, locale)} annual hours of capacity are valued at ${money(result.total, locale)} after a ${number((1 - result.retained) * 100, locale)}% risk reduction. This is not a promise of cash savings.`,
    `依此假設，每年 ${number(result.hours, locale)} 小時的產能，在扣減 ${number((1 - result.retained) * 100, locale)}% 風險後，估值為 ${money(result.total, locale)}。這並非現金節省承諾。`,
    `依此假设，每年 ${number(result.hours, locale)} 小时的产能，在扣减 ${number((1 - result.retained) * 100, locale)}% 风险后，估值为 ${money(result.total, locale)}。这并非现金节省承诺。`,
  )[locale];
}

export function formatRun(r: RunEconomics, locale: Locale): Record<string, string> {
  const units = locale === 'en' ? ['min', 'h'] : locale === 'zh-Hant' ? ['分鐘', '小時'] : ['分钟', '小时'];
  const hours = (h: number) => h < 1 ? `${number(h * 60, locale)} ${units[0]}` : `${number(h, locale)} ${units[1]}`;
  const ratio = (v: number) => Number.isFinite(v) ? `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(v)}×` : '—';
  return {
    'hours-run': hours(r.hoursPerRun), 'hours-month': hours(r.hoursPerRun * r.runsPerMonth),
    'value-run': money(r.valuePerRun, locale), 'value-month': wholeMoney(r.valuePerMonth, locale),
    'cost-run': money(r.costPerRun, locale), 'cost-month': wholeMoney(r.costPerMonth, locale),
    'net-month': wholeMoney(r.valuePerMonth - r.costPerMonth, locale),
    ratio: ratio(r.ratio), below: r.ratio < 1 ? 'true' : 'false', runs: number(r.runsPerMonth, locale),
    'break-even': Number.isFinite(r.breakEvenMinutes) ? number(r.breakEvenMinutes, locale) : '—',
    'value-cautious': money(r.valuePerRun * r.retained, locale), retained: `${number(r.retained * 100, locale)}%`,
  };
}