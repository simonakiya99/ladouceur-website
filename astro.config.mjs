import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://sb-bakery.netlify.app',
  integrations: [react(), sitemap()],
})
