// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // THIS LINE IS THE FINAL FIX — REQUIRED FOR STOMP + VITE
  define: {
    global: 'globalThis',
  },

  optimizeDeps: {
    include: ['@tanstack/react-table'],
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      // Add this proxy for WebSocket (critical!)
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})