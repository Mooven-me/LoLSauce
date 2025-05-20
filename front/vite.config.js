import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: '../symfony/public/build',
    emptyOutDir: true,
    manifest: true
  },
  server: {
    port: 5173,
    origin: 'http://localhost:5173',
    strictPort: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})