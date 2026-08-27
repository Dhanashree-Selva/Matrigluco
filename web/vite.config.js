import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // rolldown (Vite 8) requires manualChunks as a function
        manualChunks(id) {
          if (id.includes('jspdf') || id.includes('jspdf-autotable')) {
            return 'vendor-pdf';
          }
          if (id.includes('framer-motion')) {
            return 'vendor-motion';
          }
          if (id.includes('recharts')) {
            return 'vendor-recharts';
          }
          if (id.includes('lucide-react')) {
            return 'vendor-lucide';
          }
          if (id.includes('react-dom') || id.includes('react-router-dom') || (id.includes('/react/') && !id.includes('node_modules/react-dom'))) {
            return 'vendor-react';
          }
        },
      },
    },
  },
})
