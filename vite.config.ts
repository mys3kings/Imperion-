import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Get the repository name from package.json homepage
const repoName = 'imperion' // Change this to your repo name

export default defineConfig({
  plugins: [react()],
  base: `/${repoName}/`,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
})
