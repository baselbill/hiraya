import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
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

// GitHub Pages serves menu/index.html for /menu and /menu/. This redirect
// makes the same path work in `vite` and `vite preview` without a trailing slash.
function menuSlash() {
  const redirect = (req, res, next) => {
    const url = req.url || ''
    if (url === '/menu' || url.startsWith('/menu?')) {
      res.writeHead(302, { Location: '/menu/' + url.slice('/menu'.length) })
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
  plugins: [react(), closureJsonLd(), menuSlash()],
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve('index.html'),
        menu: resolve('menu/index.html'),
      },
    },
  },
})
