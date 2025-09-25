import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '', '');
  
  return {
    plugins: [react()],
    define: {
      'process.env.VITE_API_KEY': JSON.stringify(env.VITE_API_KEY)
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          'audio-visualizer': resolve(__dirname, 'audio-visualizer/index.html'),
          'youtube-seo': resolve(__dirname, 'youtube-seo/index.html'),
          'font-effects': resolve(__dirname, 'font-effects/index.html')
        }
      }
    },
    server: {
      port: 3000,
      open: true
    }
  }
});

