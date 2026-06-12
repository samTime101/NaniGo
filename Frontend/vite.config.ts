import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  // HTTPS is required so the camera (getUserMedia) works on phones over LAN.
  // basicSsl issues a self-signed cert — phones will show a one-time warning.
  plugins: [react(), tailwindcss(), basicSsl()],
  server: {
    // Bind to 0.0.0.0 so phones/tablets on the same Wi-Fi can reach the app.
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      // The FastAPI backend serves all routes under /api. Vite forwards these
      // server-side, so LAN devices hitting the dev server work automatically.
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port: 4173,
  },
})
