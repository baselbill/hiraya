import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { applyClosureJsonLd } from './src/closure.js'

// Unlisted till preview. Not linked from the site. PR #42 is not on main.
const KASSE_DIR = 'kasse-7a6466ec'

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

// GitHub Pages serves menu/index.html for /menu and /menu/. This redirect
// makes the same path work in `vite` and `vite preview` without a trailing slash.
function kasseMenuJson() {
  const id = '\0kasse-menu-json'
  return {
    name: 'kasse-menu-json',
    resolveId(source) {
      if (source === 'kasse:menu') return id
    },
    load(source) {
      if (source !== id) return
      return `export default ${readFileSync('src/data/menu.json', 'utf8')}`
    },
  }
}

function menuSlash() {
  const paths = ['/menu', `/${KASSE_DIR}`]
  const redirect = (req, res, next) => {
    const url = req.url || ''
    const hit = paths.find(p => url === p || url.startsWith(p + '?'))
    if (hit) {
      res.writeHead(302, { Location: hit + '/' + url.slice(hit.length) })
      res.end()
      return
    }
    next()
  }
  return {
    name: 'menu-slash',
    configureServer(server) { server.middlewares.use(redirect) },
    configurePreviewServer(server) { server.middlewares.use(redirect) },
  }
}

export default defineConfig({
  plugins: [react(), closureJsonLd(), kasseMenuJson(), menuSlash()],
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve('index.html'),
        menu: resolve('menu/index.html'),
        kasse: resolve(`${KASSE_DIR}/index.html`),
      },
      output: {
        entryFileNames: (chunk) => chunk.name === 'kasse'
          ? `${KASSE_DIR}/assets/[name]-[hash].js`
          : 'assets/[name]-[hash].js',
        chunkFileNames: (chunk) => {
          const ids = Object.keys(chunk.modules || {})
          const kasse = ids.some(id => id.includes('/src/kasse/') || id.includes('\0kasse-menu-json'))
          return kasse ? `${KASSE_DIR}/assets/[name]-[hash].js` : 'assets/[name]-[hash].js'
        },
        assetFileNames: (asset) => {
          const name = asset.names?.[0] || asset.name || ''
          return name.includes('kasse')
            ? `${KASSE_DIR}/assets/[name]-[hash][extname]`
            : 'assets/[name]-[hash][extname]'
        },
      },
    },
  },
})
