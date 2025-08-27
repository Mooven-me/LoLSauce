import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

export default defineConfig({
  plugins: [react()],

  root: '.',

  server: {
    port: 5173,
    https: {
      key: fs.readFileSync('./certs/tls.key'),
      cert: fs.readFileSync('./certs/tls.pem'),
    },
    origin: 'https://10.243.96.68.nip.io:5173',
    strictPort: true,
    cors: {
      origin: 'https://10.243.96.68.nip.io',
      credentials: true,
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
