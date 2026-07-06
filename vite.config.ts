import { defineConfig, searchForWorkspaceRoot } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    allowedHosts: [
      'conehub.org',
      'duty.conehub.org',
      'localhost',
      '127.0.0.1'
    ],
    fs: {
      strict: true,
      allow: [
        // This automatically finds your project root on ANY OS
        searchForWorkspaceRoot(process.cwd()),
      ]
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})