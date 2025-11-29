import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import symfonyPlugin from 'vite-plugin-symfony';
import path from 'path'

export default defineConfig(({mode}) => {

  const env = loadEnv(mode, process.cwd(), '')

  return {
  plugins: [
      react(),
      symfonyPlugin({
          refresh: true,
      })
  ],

  root: '.',

  server: {
    port: 5173,
    origin: env.VITE_SERVER_NAME+':5173',
    strictPort: true,
    cors: {
      origin: env.VITE_SERVER_NAME,
      credentials: true,
    },
    watch: {
      usePolling: true,
    }
  },
  build: {
    outDir: 'dist',
    manifest: true,
    emptyOutDir: true,
    assetsDir: '',
    rollupOptions: {
      input: {
        app: './src/main.jsx'
      }
    }
  },
  base: '/build/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
}})
