// vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // REMOVED: build.rollupOptions.input, build.rollupOptions.output, import { resolve } from 'path';
  // Vite's defaults are sufficient for our current embedding strategy.
})