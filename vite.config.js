import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'logo192.jpeg', 'logo512.jpeg'],
      manifest: {
        short_name: "EcoGrid",
        name: "EcoGrid CRM Command Center",
        description: "Enterprise CRM and Project Command Center for EcoGrid Infra",
        theme_color: "#3f7abe",
        background_color: "#f8fafc",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "favicon.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable"
          },
          {
            src: "logo192.jpeg",
            type: "image/jpeg",
            sizes: "192x192"
          },
          {
            src: "logo512.jpeg",
            type: "image/jpeg",
            sizes: "512x512"
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpeg,jpg,json}'],
        navigateFallback: '/index.html'
      }
    })
  ]
});
