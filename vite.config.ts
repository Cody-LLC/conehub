import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
  server: {
    host: true, // Listen on all addresses
    port: 3000, // Change if needed
    allowedHosts: [
      'conehub.org',
      'duty.conehub.org',
      'localhost',
      '127.0.0.1'
    ],
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})