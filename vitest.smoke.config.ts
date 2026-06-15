import { defineConfig } from "vitest/config";

/** Smoke tests spawn `next start` — run only after `npm run build`. */
export default defineConfig({
  test: {
    include: ["tests/smoke/**/*.test.ts"],
  },
});
