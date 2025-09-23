import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env files based on `mode` in the current working directory.
  // This will also load environment variables from the platform (e.g., Railway).
  const env = loadEnv(mode, '', '');
  
  return {
    plugins: [react()],
    // Explicitly define environment variables to be statically replaced at build time.
    // This is a more robust approach for deployment environments.
    define: {
      'process.env.VITE_API_KEY': JSON.stringify(env.VITE_API_KEY)
    }
  }
});
