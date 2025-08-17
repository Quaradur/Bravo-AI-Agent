import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000 // Specifichiamo la porta per il server di sviluppo
  }
})


// =============== FILE 3: /frontend/tailwind.config.js ===============
// File di configurazione per Tailwind CSS.

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  darkMode: 'class',
}