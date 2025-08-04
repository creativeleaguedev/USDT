import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
    'process.env': {},
    Buffer: 'Buffer'
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.coingecko.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
