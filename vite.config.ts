import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  // relative asset paths: the build runs from any folder, e.g. GitHub Pages at /pact-loop/
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: { port: 5173 },
  build: {
    rollupOptions: {
      output: {
        // Long-lived vendor chunks, so app changes don't re-download libraries
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/node_modules\/(react|react-dom|scheduler|react-router)\//.test(id)) return 'react'
          if (id.includes('@radix-ui') || id.includes('cmdk') || id.includes('sonner')) return 'ui'
          if (id.includes('lucide-react')) return 'icons'
          if (/node_modules\/(@tiptap|prosemirror|linkifyjs|orderedmap|rope-sequence|w3c-keyname)/.test(id)) return 'editor'
          if (/node_modules\/(recharts|d3-|victory-vendor|decimal\.js-light|es-toolkit|immer|reselect|@reduxjs|react-redux|redux)/.test(id)) return 'charts'
        },
      },
    },
  },
})
