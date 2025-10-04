import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for GitHub Pages
  build: {
    // Output to repo-level docs/ so GitHub Pages can serve it from main
    outDir: '../docs',
    emptyOutDir: true
  },
  server: {
    port: 5183
  }
})


