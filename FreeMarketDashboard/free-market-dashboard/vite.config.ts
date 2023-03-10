import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {

  },
  server: {
    port: 6660,
    strictPort: true,
  }
})
