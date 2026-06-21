import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/** Smoke tests spawn `next start` — run only after `npm run build`. */
export default defineConfig({
  resolve: {
    alias: {
      "@oneworld-explorer/schedules": resolve(
        dirname(fileURLToPath(import.meta.url)),
        "packages/schedules/src/index.ts",
      ),
    },
  },
  test: {
    include: ["tests/smoke/**/*.test.ts"],
  },
});
