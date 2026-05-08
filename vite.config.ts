import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/urban-farm-year/',
  plugins: [react()],
  build: {
    outDir: 'docs',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/@tanstack/react-query')
          ) {
            return 'react';
          }
          return undefined;
        },
      },
    },
  },
});
