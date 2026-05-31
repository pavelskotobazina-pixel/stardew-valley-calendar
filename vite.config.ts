import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/stardew-valley-calendar/',
  plugins: [react()],
})
