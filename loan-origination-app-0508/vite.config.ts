import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths so the bundle works at any subdirectory.
  // (Local dev still serves at root via vite dev server.)
  base: './',
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      path: 'path-browserify',
    },
  },
  optimizeDeps: {
    include: ['@uipath/uipath-typescript'],
  },
})
