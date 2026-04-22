import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/*
  Vite is the build tool that:
  1. Serves your React app in development (super fast, instant reload)
  2. Compiles/bundles everything for production

  The proxy here is important:
  When React (port 5173) calls /api/anything,
  Vite forwards it to FastAPI (port 8000).
  This means you never have to type the full backend URL
  in your frontend code — just use /api/...
*/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
