import { defineConfig } from "vitest/config";

// Keep unit tests isolated from the app's Start/Nitro and PWA build plugins.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    restoreMocks: true,
  },
});
