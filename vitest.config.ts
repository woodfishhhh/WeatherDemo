import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    restoreMocks: true,
    clearMocks: true,
    include: ["src/**/*.{spec,test}.ts"],
    exclude: ["tests/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      reportsDirectory: "./coverage",
      include: [
        "src/config/**/*.ts",
        "src/main.ts",
        "src/router/**/*.ts",
        "src/features/locations/**/*.{ts,vue}",
        "src/features/weather/**/*.{ts,vue}",
        "src/features/workspace/**/*.{ts,vue}",
      ],
      exclude: [
        "**/*.d.ts",
        "**/__tests__/**",
        "**/*.{spec,test}.ts",
      ],
    },
  },
});
