import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    // Ensure all workspace packages resolve to the single hoisted React copy.
    // Without this, monorepo workspace packages can accidentally bundle
    // separate React instances, breaking the hooks dispatcher.
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
  },
})