import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['logo.jpg'],
        manifest: {
          name: 'ፍሬ ሃይማኖት ሰ/ት/ቤት አቴንዳንስ',
          short_name: 'ፍሬ ሃይማኖት አቴንዳንስ',
          description: 'Sunday School Attendance Management System',
          theme_color: '#5A5A40',
          background_color: '#f5f5f0',
          display: 'standalone',
          orientation: 'portrait-primary',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/logo.jpg',
              sizes: '192x192',
              type: 'image/jpeg',
              purpose: 'any maskable'
            },
            {
              src: '/logo.jpg',
              sizes: '512x512',
              type: 'image/jpeg',
              purpose: 'any maskable'
            }
          ],
          categories: ['education', 'productivity'],
          lang: 'am',
          dir: 'ltr'
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: true
    },
  };
});
