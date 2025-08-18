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
        target: 'http://localhost:8001/api/user/register',
        target: 'http://localhost:8009/api/arms/<id>/', 
        target: 'http://localhost:8009/api/arms/', 
        target: 'http://localhost:8004/api/requisitions/', 
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
