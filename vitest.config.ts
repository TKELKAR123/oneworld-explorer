import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@oneworld-explorer/core": resolve(root, "packages/core/src/index.ts"),
      "@oneworld-explorer/schedules": resolve(root, "packages/schedules/src/index.ts"),
    },
  },
  test: {
    environment: "happy-dom",
    include: [
      "packages/**/tests/**/*.test.ts",
      "tests/**/*.test.ts",
      "tests/**/*.test.tsx",
      "apps/web/**/*.test.ts",
      "apps/web/**/*.test.tsx",
    ],
    exclude: ["tests/e2e/**", "tests/smoke/**", "node_modules/**"],
  },
});
