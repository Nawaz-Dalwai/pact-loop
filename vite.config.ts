import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: { port: 5173 },
  build: {
    rollupOptions: {
      output: {
        // Long-lived vendor chunks; page code is split per route in src/app/router.tsx
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/node_modules\/(react|react-dom|scheduler|react-router)\//.test(id)) return 'react'
          if (id.includes('@radix-ui') || id.includes('cmdk') || id.includes('sonner')) return 'ui'
          if (id.includes('lucide-react')) return 'icons'
        },
      },
    },
  },
})
