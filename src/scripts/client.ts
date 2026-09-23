import { isLocale, personas, type Locale, type Persona } from '../lib/schema';
import { ui } from '../i18n';
import { fields, defaults, calculate, validateAssumptions, money, wholeMoney, number, runEconomics, formatRun, narrative, type Assumptions } from '../lib/benefits';
import { getAssumptions, applyAssumptions, isCustom } from '../lib/assumptions-store';

let controller: AbortController | undefined;
let observer: IntersectionObserver | undefined;
let theme = document.documentElement.dataset.theme || 'light';
function getLocale(): Locale {
  const value = document.body.dataset.locale ?? '';
  if (!isLocale(value)) throw new Error('Unsupported page locale.');
  return value;
}
function getPersona(value: string | undefined): Persona {
  const found = personas.find((persona) => persona === value);
  if (!found) throw new Error('Unknown benefit persona.');
  return found;
}
function announce(message: string): void {
  const target = document.getElementById('announcement');
  if (target) target.textContent = message;
}
function renderBenefits(locale: Locale): void {
  document.querySelectorAll<HTMLElement>('[data-run]').forEach((element) => {
    const values = formatRun(runEconomics(getPersona(element.dataset.run), getAssumptions()), locale);
    element.querySelectorAll<HTMLElement>('[data-run-key]').forEach((target) => { target.textContent = values[target.dataset.runKey!] ?? ''; });
    const ratio = element.querySelector<HTMLElement>('[data-run-ratio]'); if (ratio) { ratio.textContent = values.ratio; if (ratio.parentElement) ratio.parentElement.dataset.below = values.below; }
    const runs = element.querySelector('[data-run-runs]'); if (runs) runs.textContent = values.runs;
  });
  document.querySelectorAll<HTMLElement>('[data-benefit]').forEach((element) => {
    const persona = getPersona(element.dataset.benefit);
    const assumptions = getAssumptions();
    const result = calculate(persona, assumptions);
    const values: Record<string, string> = {
      total: wholeMoney(result.total, locale), narrative: narrative(result, locale),
      status: ui(locale, isCustom() ? 'custom' : 'baseline'),
      hours: number(result.hours, locale), active: number(result.activeUsers, locale),
      hourly: money(result.hourlyCost, locale), retained: `${number(result.retained * 100, locale)}%`,
      licensed: number(assumptions[`${persona}Users`],locale),
      adoption: `${number(assumptions.activeRate,locale)}%`,
      risk: `${number(assumptions.riskReduction,locale)}%`,
    };
    for (const [key, value] of Object.entries(values)) {
      const target = element.querySelector(`[data-benefit-${key}]`);
      if (target) target.textContent = value;
    }
    const list = element.querySelector('[data-benefit-components]');
    if (list) {
      list.replaceChildren(...result.components.map((component) => {
        const li = document.createElement('li');
        const label = document.createElement('strong');
        label.textContent = `${component.label[locale]}: ${money(component.value, locale)}`;
        const expression = document.createElement('span');
        expression.className = 'formula-text';
        expression.textContent = `${component.expression} h × ${money(result.hourlyCost, locale)}/h × ${number(result.retained * 100, locale)}%`;
        li.append(label, document.createElement('br'), expression);
        return li;
      }));
    }
  });
}
function initialize(): void {
  controller?.abort();
  observer?.disconnect();
  controller = new AbortController();
  const { signal } = controller;
  const locale = getLocale();
  document.documentElement.dataset.js = '';
  document.documentElement.dataset.theme = theme;
  renderBenefits(locale);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll<HTMLVideoElement>('video[data-motion]').forEach((video) => { video.autoplay = false; video.pause(); video.controls = true; });
  }
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    theme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
  }, { signal });

  const search = document.querySelector<HTMLInputElement>('#scenario-search');
  const complexity = document.querySelector<HTMLSelectElement>('#complexity-filter');
  function filter(): void {
    const query = (search?.value ?? '').trim().toLocaleLowerCase(locale);
    const clear = document.querySelector<HTMLButtonElement>('[data-clear-search]');
    if (clear) clear.hidden = !query;
    let count = 0;
    document.querySelectorAll<HTMLElement>('[data-scenario-link]').forEach((link) => {
      link.hidden = !(link.dataset.search ?? '').toLocaleLowerCase(locale).includes(query);
      if (!link.hidden) count++;
    });
    document.querySelectorAll<HTMLDetailsElement>('[data-persona-group]').forEach((group) => {
      group.hidden = !group.querySelector('[data-scenario-link]:not([hidden])');
      if (query) group.open = true;
    });
    const status = document.getElementById('search-count');
    if (status) status.textContent = query ? `${count} ${ui(locale, 'results')}` : '';
    const noResults = document.getElementById('no-results');
    if (noResults) noResults.hidden = count !== 0;
    let cards = 0;
    document.querySelectorAll<HTMLElement>('[data-recipe-card]').forEach((card) => {
      card.hidden = !(card.dataset.search ?? '').toLocaleLowerCase(locale).includes(query) || Boolean(complexity?.value && card.dataset.complexity !== complexity.value);
      if (!card.hidden) cards++;
    });
    const empty = document.getElementById('no-cards');
    if (empty) empty.hidden = cards !== 0;
  }
  search?.addEventListener('input', filter, { signal });
  complexity?.addEventListener('change', filter, { signal });
  document.querySelector('[data-clear-search]')?.addEventListener('click', () => {
    if (search) { search.value = ''; search.focus(); filter(); }
  }, { signal });
  const menu = document.querySelector<HTMLDetailsElement>('#scenario-menu');
  const narrow = matchMedia('(max-width: 900px)');
  const main = document.querySelector<HTMLElement>('main');
  const header = document.querySelector<HTMLElement>('.topbar');
  if (main) main.inert = false;
  if (header) header.inert = false;
  document.body.style.overflow = '';
  if (menu) {
    menu.open = !narrow.matches;
    narrow.addEventListener('change', () => { menu.open = !narrow.matches; }, { signal });
    const closeMenu = () => { menu.open = false; menu.querySelector('summary')?.focus(); };
    document.querySelectorAll('[data-close-menu]').forEach((button) => button.addEventListener('click', closeMenu, { signal }));
    menu.addEventListener('toggle', () => {
      const modal = narrow.matches && menu.open;
      if (main) main.inert = modal;
      if (header) header.inert = modal;
      document.body.style.overflow = modal ? 'hidden' : '';
      if (modal) menu.querySelector<HTMLButtonElement>('.mobile-close')?.focus();
    }, { signal });
    menu.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && narrow.matches && menu.open) {
        closeMenu();
      }
      if (event.key === 'Tab' && narrow.matches && menu.open) {
        const controls = [...menu.querySelectorAll<HTMLElement>('.menu-content button, .menu-content input, .menu-content a, .menu-content summary')]
          .filter((element) => element.offsetParent !== null);
        const first = controls[0], last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }, { signal });
  }
  document.querySelectorAll<HTMLAnchorElement>('[data-language-link]').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.location.hash) link.hash = window.location.hash;
    }, { signal });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const content = document.getElementById(button.dataset.copy ?? '');
      if (!content) throw new Error('Prompt copy target is missing.');
      try {
        await navigator.clipboard.writeText(content.textContent ?? '');
        announce(ui(locale, 'copied'));
        button.textContent = ui(locale, 'copied');
      } catch (error) {
        console.error('Prompt clipboard write failed:', error);
        announce(ui(locale, 'copyFailed'));
        button.textContent = ui(locale, 'copyFailed');
      }
    }, { signal });
  });

  const dialog = document.querySelector<HTMLDialogElement>('#assumptions-dialog');
  const form = document.querySelector<HTMLFormElement>('#assumptions-form');
  const selector = document.querySelector<HTMLSelectElement>('#settings-persona');
  if (!dialog || !form || !selector) throw new Error('Settings controls are missing.');
  const editable = fields.filter((field) => !field.admin);
  const inputs = new Map(editable.map((field) => {
    const input = form.querySelector<HTMLInputElement>(`[name="${field.id}"]`);
    if (!input) throw new Error(`Missing assumption input: ${field.id}`);
    return [field.id, input] as const;
  }));
  function readDraft(): Assumptions {
    const draft = getAssumptions();
    inputs.forEach((input, key) => { draft[key] = input.value === '' ? Number.NaN : input.valueAsNumber; });
    return draft;
  }
  function fillDraft(value: Assumptions): void {
    inputs.forEach((input, key) => { input.value = String(value[key]); });
  }
  function showGroups(): void {
    form?.querySelectorAll<HTMLElement>('[data-field-group]').forEach((group) => {
      group.hidden = group.dataset.fieldGroup !== 'shared' && group.dataset.fieldGroup !== selector?.value;
    });
  }
  function preview(): ReturnType<typeof validateAssumptions> {
    const draft = readDraft();
    const issues = validateAssumptions(draft);
    for (const field of editable) {
      const input = inputs.get(field.id)!;
      const error = document.getElementById(`error-${field.id}`);
      const issue = issues.find((item) => item.field === field.id);
      input.setAttribute('aria-invalid', String(Boolean(issue)));
      if (error) { error.hidden = !issue; error.textContent = issue ? ui(locale, issue.code) : ''; }
    }
    const total = document.getElementById('draft-total');
    const derived = document.getElementById('draft-derived');
    const errorSummary = document.getElementById('settings-errors');
    if (errorSummary) errorSummary.textContent = issues.length ? issues.map((issue) => `${fields.find((field) => field.id === issue.field)!.label[locale]}: ${ui(locale, issue.code)}`).join(' ') : '';
    if (issues.length) {
      if (total) total.textContent = '—';
      if (derived) derived.textContent = '';
    } else {
      const result = calculate(getPersona(selector?.value), draft);
      if (total) total.textContent = wholeMoney(result.total, locale);
      if (derived) derived.textContent = `${ui(locale, 'active')}: ${number(result.activeUsers,locale)} · ${ui(locale, 'retained')}: ${number(result.retained*100,locale)}%`;
    }
    return issues;
  }
  document.querySelectorAll<HTMLButtonElement>('[data-open-settings]').forEach((button) => {
    button.addEventListener('click', () => {
      selector.value = getPersona(button.dataset.openSettings);
      fillDraft(getAssumptions()); showGroups(); preview();
      dialog.showModal();
    }, { signal });
  });
  document.querySelectorAll('[data-close-settings]').forEach((button) => button.addEventListener('click', () => dialog.close(), { signal }));
  selector.addEventListener('change', () => { showGroups(); preview(); }, { signal });
  form.addEventListener('input', () => preview(), { signal });
  document.getElementById('reset-draft')?.addEventListener('click', () => { fillDraft({ ...getAssumptions(), ...Object.fromEntries(editable.map((field) => [field.id, defaults[field.id]])) }); preview(); }, { signal });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const issues = preview();
    if (issues.length) {
      const first = issues[0];
      const field = fields.find((candidate) => candidate.id === first.field)!;
      if (field.group !== 'shared') selector.value = field.group;
      showGroups();
      const input = inputs.get(first.field)!;
      const disclosure = input.closest('details');
      if (disclosure) disclosure.open = true;
      input.focus();
      return;
    }
    applyAssumptions(readDraft());
    renderBenefits(locale);
    dialog.close();
    announce(ui(locale, 'applied'));
  }, { signal });

  const imageDialog = document.querySelector<HTMLDialogElement>('#image-dialog');
  document.querySelectorAll<HTMLAnchorElement>('[data-enlarge]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const image = document.querySelector<HTMLImageElement>('#large-image');
      const original = document.querySelector<HTMLAnchorElement>('#original-image');
      if (!imageDialog || !image || !original) return;
      event.preventDefault();
      image.src = link.href;
      image.alt = link.querySelector('img')?.alt ?? '';
      original.href = link.href;
      imageDialog.showModal();
    }, { signal });
  });
  document.getElementById('close-image')?.addEventListener('click', () => imageDialog?.close(), { signal });
  observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a,b) => a.boundingClientRect.top-b.boundingClientRect.top)[0];
    if (!visible) return;
    document.querySelectorAll<HTMLAnchorElement>('[data-outline-link]').forEach((link) => {
      if (link.hash === `#${visible.target.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-15% 0px -65% 0px' });
  document.querySelectorAll('[data-outline-section]').forEach((element) => observer?.observe(element));
}
document.addEventListener('astro:page-load', initialize);
document.addEventListener('astro:after-swap', () => {
  document.documentElement.dataset.js = '';
  document.documentElement.dataset.theme = theme;
});
