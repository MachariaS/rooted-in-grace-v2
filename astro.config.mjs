import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';

export default defineConfig({
  site: 'https://rootedingrace.co.ke',
  // Pages stay pre-built; only routes with `prerender = false` (checkout, payments) run on the server.
  output: 'hybrid',
  adapter: netlify(),
  integrations: [sitemap()],
});
