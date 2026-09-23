// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://liuweikarlie.github.io',
  base: '/cowork-cookbook',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
