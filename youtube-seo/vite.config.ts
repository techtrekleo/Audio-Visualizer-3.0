import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env files based on `mode` in the current working directory.
  // This will also load environment variables from the platform (e.g., Railway).
  const env = loadEnv(mode, '', '');
  
  return {
    plugins: [react()],
    base: '/youtube-seo/', // 設置正確的基礎路徑
    // Explicitly define environment variables to be statically replaced at build time.
    // This is a more robust approach for deployment environments.
    define: {
      'import.meta.env.VITE_API_KEY': JSON.stringify(env.GEMINI_API_KEY || 'AIzaSyBvOkBw7iTmtJd5iTmtJd5iTmtJd5iTmtJd5')
    },
    server: {
      port: 5173,
      open: true
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          // 使用固定文件名，避免哈希變化
          entryFileNames: 'assets/index.js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]'
        }
      }
    }
  }
})








