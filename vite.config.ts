import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: process.env["GITHUB_ACTIONS"] === "true" ? pagesBasePath() : "/",
  server: { host: "0.0.0.0", port: 5173, strictPort: true },
  resolve: { tsconfigPaths: true },
  plugins: [
    tanstackStart({ spa: { enabled: true } }),
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
        navigateFallback: "_shell.html",
        navigateFallbackAllowlist: [/./],
        additionalManifestEntries: [{ url: "_shell.html", revision: Date.now().toString(36) }],
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,woff,woff2,jpg,jpeg,webp,avif,json,webmanifest,webm,mp3,ogg,wav}",
        ],
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) =>
              request.mode === "navigate" && !url.pathname.startsWith("/~oauth"),
            handler: "NetworkFirst",
            options: {
              cacheName: "minutes-in-leonida-pages",
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 20 },
            },
          },
          {
            urlPattern: ({ url }) => /\/assets\/.*\.[a-f0-9]{8,}\./.test(url.pathname),
            handler: "CacheFirst",
            options: { cacheName: "minutes-in-leonida-assets", expiration: { maxEntries: 80 } },
          },
        ],
      },
    }),
  ],
});

function pagesBasePath(): string {
  const [owner, repository] = (process.env["GITHUB_REPOSITORY"] ?? "").split("/");
  if (!repository) return "/";
  return repository.toLowerCase() === `${owner?.toLowerCase()}.github.io` ? "/" : `/${repository}/`;
}
