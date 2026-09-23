import { z } from 'zod';

export const locales = ['en', 'zh-Hant', 'zh-Hans'] as const;
export type Locale = typeof locales[number];
export const localized = z.object({
  en: z.string().trim().min(1),
  'zh-Hant': z.string().trim().min(1),
  'zh-Hans': z.string().trim().min(1),
});
export type Localized = z.infer<typeof localized>;
export function text(en: string, hant: string, hans: string): Localized {
  return { en, 'zh-Hant': hant, 'zh-Hans': hans };
}
export const personas = ['executive', 'sales', 'marketing', 'service', 'finance'] as const;
export type Persona = typeof personas[number];
export const evidenceSchema = z.object({
  file: z.string().regex(/^[a-z0-9][a-z0-9./-]+\.(png|jpg|webp)$/),
  caption: localized,
  alt: localized,
  capturedAt: z.iso.date(),
  platform: z.string().min(1),
  redacted: z.literal(true),
  reviewed: z.literal(true),
});
export const recipeSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]+$/),
  order: z.number().int().positive(),
  persona: z.enum(personas),
  slides: z.tuple([z.number().int(), z.number().int()]),
  complexity: z.enum(['low-medium', 'medium', 'high']),
  verified: z.boolean(),
  translationsReviewed: z.boolean(),
  title: localized,
  hook: localized,
  before: localized,
  after: localized,
  artifacts: z.array(localized).min(2),
  summary: localized,
  challenge: localized,
  why: localized,
  benefits: localized,
  pillars: z.array(z.enum(['capacity', 'revenue', 'risk', 'innovation'])).min(1),
  prerequisites: localized,
  sources: localized,
  goal: localized,
  sourcePrompt: z.string().trim().min(1),
  worksIn: z.array(z.string().min(1)).min(1),
  thesis: localized,
  measures: localized,
  deckHeadline: z.string().regex(/^USD [\d.]+[KM]$/),
  reviewGate: localized,
  steps: z.array(z.object({
    id: z.string().regex(/^[a-z][a-z0-9-]+$/),
    title: localized,
    evidence: z.array(evidenceSchema),
  })).min(4),
  outputs: localized,
  outputEvidence: z.array(z.object({
    file: z.string().regex(/^[a-z0-9][a-z0-9-]*\.zip$/),
    description: localized,
    reviewed: z.literal(true),
  })).optional(),
});
export type Recipe = z.infer<typeof recipeSchema>;
export const isLocale = (value: string): value is Locale =>
  locales.some((locale) => locale === value);
