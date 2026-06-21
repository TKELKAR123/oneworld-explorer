/**
 * Smoke: GET /api/geography/atlas
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { GET } from "../../apps/web/app/api/geography/atlas/route.js";

const atlasPath = join(process.cwd(), "data/geography-atlas.generated.json");

describe("smoke — GET /api/geography/atlas", () => {
  it("returns geography atlas when built", async () => {
    if (!existsSync(atlasPath)) {
      console.warn("Skip: run npm run build:geography-atlas first");
      return;
    }
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.countries.length).toBeGreaterThan(100);
    expect(body.rulesVersion).toBeTruthy();
    expect(Array.isArray(body.unmapped)).toBe(true);
  });
});
