import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { applyClosureJsonLd } from './src/closure.js'

// index.html cannot import config.js. Placeholders are filled from RENOVATION
// so the published JSON-LD stays on the same dates as the banner.
function closureJsonLd() {
  return {
    name: 'closure-jsonld',
    transformIndexHtml(html) {
      return applyClosureJsonLd(html)
    },
  }
}

export default defineConfig({
  plugins: [react(), closureJsonLd()],
  base: '/',
})
