// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://yuanlx27.github.io',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') })],
  // Even the small theme script must stay external (no inline JavaScript).
  vite: { build: { assetsInlineLimit: 0 } },
  markdown: { syntaxHighlight: false },
});
