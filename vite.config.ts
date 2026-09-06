import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Dev server proxies /api to the Express backend so the whole frontend is
// developable without touching src/. Buffering is left off end-to-end because
// POST /api/tenants/:id/query streams Server-Sent Events (see plan §20.3).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    // An inline (empty) config stops Vite walking *up* the filesystem looking
    // for postcss.config.js. There is a stale Tailwind v3 config in an ancestor
    // directory on some machines, and picking it up breaks the v4 pipeline.
    postcss: {},
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET ?? 'http://localhost:4500',
        changeOrigin: true,
        ws: false,
        // http-proxy streams by default; make sure nothing accumulates the
        // SSE body before it reaches the browser.
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            if (proxyRes.headers['content-type']?.includes('text/event-stream')) {
              proxyRes.headers['x-accel-buffering'] = 'no'
              delete proxyRes.headers['content-length']
            }
          })
        },
      },
    },
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler|react-router)[\\/]/.test(id)) {
            return 'vendor-react'
          }
          if (/[\\/]node_modules[\\/](react-markdown|remark-|rehype-|micromark|mdast-|hast-|unist-|unified|vfile|property-information|space-separated-tokens|comma-separated-tokens|character-entities|decode-named-character-reference|bail|is-plain-obj|trough|zwitch|longest-streak|ccount|markdown-table|escape-string-regexp|devlop|estree-|html-url-attributes)/.test(id)) {
            return 'markdown'
          }
          if (/[\\/]node_modules[\\/](@radix-ui|motion|framer-motion|lucide-react|sonner)/.test(id)) {
            return 'vendor-ui'
          }
          if (/[\\/]node_modules[\\/](@tanstack|zustand|zod|react-hook-form|@hookform)/.test(id)) {
            return 'vendor-data'
          }
          return 'vendor'
        },
      },
    },
  },
})
