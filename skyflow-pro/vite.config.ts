/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/cities': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/flights': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/chat': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/bookings': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
