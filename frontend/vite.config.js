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
      '/api': 'http://localhost:9000',
    }
  }
})