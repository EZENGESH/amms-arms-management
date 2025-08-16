// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,        // Port for the Vite development server
    proxy: {
      '/api': {
        target: 'http://localhost:8001/api/user/register', // Proxy API requests to the backend
        target: 'http://localhost:8009/arms/<id>/', 
        target: 'http://localhost:8009/arms/', 
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
