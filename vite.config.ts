// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Forces the main javascript file to be named index.js
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/index.js',
        // Forces the CSS file to be named index.css
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/index.css';
          }
          return 'assets/[name].[ext]';
        },
      },
    },
  },
})