/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src/app/sw',
      filename: 'sw.ts',
      registerType: 'prompt',
      injectRegister: false,
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}', 'icons/*.png', 'offline.html'],
        globIgnores: ['screenshots/**'],
      },
      devOptions: { enabled: false },
      manifest: {
        id: '/',
        name: 'Pulsefit',
        short_name: 'Pulsefit',
        description: 'Offline-first workout and diet tracker for coaches and athletes.',
        start_url: '/athlete',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0f1522',
        theme_color: '#0f1522',
        categories: ['health', 'fitness', 'lifestyle'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: '/screenshots/workout-narrow.png',
            sizes: '780x1688',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Workout player with rest timer',
          },
          {
            src: '/screenshots/progress-narrow.png',
            sizes: '780x1688',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Progress in the neon theme',
          },
          {
            src: '/screenshots/coach-wide.png',
            sizes: '1280x800',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Coach program builder',
          },
        ],
        shortcuts: [
          {
            name: 'Start workout',
            short_name: 'Workout',
            url: '/athlete/workout?start=1',
            icons: [{ src: '/icons/shortcut-workout.png', sizes: '96x96', type: 'image/png' }],
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/shared/config/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
