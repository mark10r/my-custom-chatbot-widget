import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Ensure public directory is correctly handled
    // Vite copies contents of publicDir to the root of the build output.
    // We'll put loader.js directly in public/
    // publicDir: 'public', // This is default, just for clarity

    rollupOptions: {
      output: {
        // Keep existing rules for hashed assets
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,

        // Explicitly tell Rollup/Vite to copy loader.js to the root of dist
        // This is a common pattern for static files that need a fixed path.
        // This might require a custom plugin or different strategy if Vite's default publicDir copy isn't sufficient.
        // Let's rely on publicDir for now, but be aware if it doesn't work.
      },
    },
  },
});