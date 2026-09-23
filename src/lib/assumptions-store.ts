import { defaults, validateAssumptions, type Assumptions } from './benefits';

let current: Assumptions = { ...defaults };
export function getAssumptions(): Assumptions { return { ...current }; }
export function isCustom(): boolean {
  return Object.keys(defaults).some((key) => current[key as keyof Assumptions] !== defaults[key as keyof Assumptions]);
}
export function applyAssumptions(next: Assumptions): void {
  if (validateAssumptions(next).length) throw new Error('Cannot apply invalid assumptions.');
  current = { ...next };
}
