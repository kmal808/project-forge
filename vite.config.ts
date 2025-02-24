import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: true,
    strictPort: true,
    port: 5173
  },
  preview: {
    host: true,
    strictPort: true,
    port: 5173
  },
  build: {
    sourcemap: true
  }
});