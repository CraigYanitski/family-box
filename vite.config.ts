import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// During `npm run dev`, requests to /api are forwarded to the Go backend so
// the browser never has to deal with cross-origin requests on your LAN.
// Change the target below to match wherever your Go server actually runs.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // listen on 0.0.0.0 so other devices on your LAN can reach the dev server
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
