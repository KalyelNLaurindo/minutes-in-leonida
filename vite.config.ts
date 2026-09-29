import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: { host: "0.0.0.0", port: 5173, strictPort: true },
  resolve: { tsconfigPaths: true },
  plugins: [
    tanstackStart(),
    nitro(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null,
      manifest: false,
      outDir: ".output/public",
      devOptions: { enabled: false },
      workbox: {
        navigateFallback: null,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,jpg,jpeg,json,webmanifest,webm}"],
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) =>
              request.mode === "navigate" && !url.pathname.startsWith("/~oauth"),
            handler: "NetworkFirst",
            options: {
              cacheName: "leonida-pages",
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 20 },
            },
          },
          {
            urlPattern: ({ url }) => /\/assets\/.*\.[a-f0-9]{8,}\./.test(url.pathname),
            handler: "CacheFirst",
            options: { cacheName: "leonida-assets", expiration: { maxEntries: 80 } },
          },
        ],
      },
    }),
  ],
});
