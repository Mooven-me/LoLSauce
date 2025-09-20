import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

export default defineConfig(({mode}) => {

  const env = loadEnv(mode, process.cwd(), '')

  return {
  plugins: [react()],

  root: '.',

  server: {
    port: 5173,
    origin: env.VITE_SERVER_NAME+':5173',
    strictPort: true,
    cors: {
      origin: env.VITE_SERVER_NAME,
      credentials: true,
    },
  },
  build: {
    outDir: 'dist',
    manifest: true,
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
}})
