import { defineCollection } from 'astro:content';
import { recipes } from './data/recipes';
import { recipeSchema } from './lib/schema';

export const collections = {
  recipes: defineCollection({
    loader: async () => recipes,
    schema: recipeSchema,
  }),
};
