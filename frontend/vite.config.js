import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  // This ensures VITE_API_URL is defined at build time even if not set in env
  define: {
    // Fallback: if VITE_API_URL is not set, use the Render URL directly
    __RENDER_URL__: JSON.stringify('https://estatexai.onrender.com')
  }
})
