import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/srt-translator/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})



