import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",   
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 5173 
    },
    proxy: {
      '/api/v1/users': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1\/users/, '/api/v1/users')
      },
      '/api/v1/arms': {
        target: 'http://localhost:8009',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1\/arms/, '/api/v1/arms')
      },
      '/api/v1/requisitions': {
        target: 'http://localhost:8004',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1\/requisitions/, '/api/v1/requisitions')
      }
    }
  }
})
