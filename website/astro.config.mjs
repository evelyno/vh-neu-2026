// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// Production URL — update once the final domain is live.
// Used for canonical URLs, sitemap and absolute Open-Graph / JSON-LD links.
const SITE = 'https://www.vonhoegen-bauunternehmung.de';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  output: 'static',
  integrations: [
    react(),
    sitemap(),
  ],
  build: {
    inlineStylesheets: 'never',
  },
});
