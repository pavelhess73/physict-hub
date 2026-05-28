import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Konfigurace optimalizovaná pro Appwrite Hosting
export default defineConfig({
  plugins: [react()],
  base: '/', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
