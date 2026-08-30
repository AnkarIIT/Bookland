import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const BASE_URL = 'https://bookland.app';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'Bookland — Digital Library',
        short_name: 'Bookland',
        description: 'Search millions of books, research papers, and articles from the world\'s open libraries — and read them right here.',
        theme_color: '#0071e3',
        background_color: '#f5f5f7',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/covers\.openlibrary\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'openlibrary-covers',
              expiration: { maxEntries: 500, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/www\.gutenberg\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gutenberg-covers',
              expiration: { maxEntries: 500, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/api\.bookland\.app\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 5 * 60 },
              networkTimeoutSeconds: 10,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined;
          if (/[/\\\\]node_modules[/\\\\](three([/\\\\]|$)|three-stdlib|troika-three-text|maath|@react-three[/\\\\]|@react-spring[/\\\\]|detect-gpu|@use-gesture[/\\\\]|tunnel-rat|suspend-react|its-fine|camera-controls|three-mesh-bvh|@monogrid|stats-gl|stats\.js|meshline)/.test(id)) {
            return 'three';
          }
          if (/[/\\\\]node_modules[/\\\\](react([/\\\\]|$)|react-dom[/\\\\]|react-router[/\\\\]|react-router-dom[/\\\\]|react-helmet-async|scheduler[/\\\\]|@remix-run[/\\\\]|history[/\\\\]|use-sync-external-store)/.test(id)) {
            return 'vendor';
          }
          if (/[/\\\\]node_modules[/\\\\]@tanstack[/\\\\]/.test(id)) return 'query';
          if (/[/\\\\]node_modules[/\\\\]lucide-react[/\\\\]/.test(id)) return 'ui';
          if (/[/\\\\]node_modules[/\\\\]zustand[/\\\\]/.test(id)) return 'zustand';
          return undefined;
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
})