// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import xuanLight from './src/themes/xuan-light.json' with { type: 'json' };
import xuanNight from './src/themes/xuan-night.json' with { type: 'json' };

// https://astro.build/config
export default defineConfig({
  site: 'https://yuanlx27.github.io',
  base: '/site/',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404/') })],
  // Even the small theme script must stay external (no inline JavaScript).
  vite: { build: { assetsInlineLimit: 0 } },
  markdown: {
    shikiConfig: {
      themes: {
        light: { ...xuanLight, type: 'light' },
        dark: { ...xuanNight, type: 'dark' },
      },
      defaultColor: false,
    },
  },
});
