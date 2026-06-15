import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "packages/**/tests/**/*.test.ts",
      "tests/**/*.test.ts",
    ],
    exclude: ["tests/e2e/**", "tests/smoke/**", "node_modules/**"],
  },
});
