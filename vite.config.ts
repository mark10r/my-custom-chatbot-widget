import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Explicitly define hashed filenames for main entry and assets
        entryFileNames: `assets/[name]-[hash].js`, // For main.tsx -> index-HASH.js
        chunkFileNames: `assets/[name]-[hash].js`, // For code-split chunks
        assetFileNames: `assets/[name]-[hash].[ext]`, // For CSS and other assets
      },
    },
  },
})