import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as {
  version: string;
};

export default defineConfig(({ command, mode }) => {
  // Deploy cleanly on GitHub Pages (/EixoVerde/), mobile Capacitor (./), and local dev (/)
  const base =
    process.env.VITE_BASE_PATH ??
    (mode === 'mobile' ? './' : command === 'build' ? '/EixoVerde/' : '/');

  return {
    base,
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version || '1.0.0'),
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'zustand',
        'lucide-react',
        'maplibre-gl',
        '@supabase/supabase-js',
      ],
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'icons/eixoverde-icon.svg',
          'icons/apple-touch-icon.png',
          'icons/icon-192.png',
          'icons/icon-512.png',
          'data/ciclomapa-df-pois.geojson',
        ],
        manifest: {
          id: 'br.com.eixoverde.app',
          name: 'EixoVerde — Navegação & Ciclovias',
          short_name: 'EixoVerde',
          description:
            'Navegação GPS inteligente, planejamento seguro em ciclovias e telemetria para patinetes elétricos, e-bikes e bicicletas.',
          theme_color: '#064e3b',
          background_color: '#0b1116',
          display: 'standalone',
          orientation: 'portrait-primary',
          lang: 'pt-BR',
          start_url: base,
          scope: base,
          icons: [
            {
              src: 'icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: 'icons/icon-1024.png',
              sizes: '1024x1024',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'icons/eixoverde-icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
          globIgnores: [
            '**/icons/icon-1024.png',
            '**/icons/icon-foreground.png',
            '**/icons/splash-1280.png',
            '**/icons/feature-graphic-1024x500.png',
            '**/data/cities/*.geojson',
          ],
          runtimeCaching: [
            {
              urlPattern: /\/(auth|rest|functions|storage|realtime)\/v1\//i,
              handler: 'NetworkOnly',
            },
            {
              urlPattern: /^https:\/\/[^/]+\.supabase\.co\//i,
              handler: 'NetworkOnly',
            },
            {
              urlPattern: /\/data\/(ciclomapa-df-|cities\/).*\.geojson$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'eixoverde-geodata-v2',
                expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
          ],
        },
      }),
    ],
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/maplibre-gl')) return 'maplibre';
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'react';
            if (id.includes('node_modules/lucide-react')) return 'icons';
            if (id.includes('node_modules/zustand')) return 'state';
            if (id.includes('node_modules/@supabase/')) return 'supabase';
          },
        },
      },
    },
  };
});
