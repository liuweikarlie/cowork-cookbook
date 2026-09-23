import type { Locale } from './schema';

export const base = '/cowork-cookbook/';
export const url = (path = '') => base + path.replace(/^\/+/, '');
export const recipeUrl = (locale: Locale, id: string) => url(`${locale}/recipes/${id}/`);
export const homeUrl = (locale: Locale) => url(`${locale}/`);
