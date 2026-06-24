import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 3000,
    watch: {
      usePolling: true   // REQUIRED in Docker
    },
    proxy: {
      // In Docker: backend service is reachable at http://backend:5000
      // Locally:   backend runs on http://localhost:5000
      '/api': process.env.VITE_PROXY_TARGET || 'http://localhost:5000',
    }
  }
})