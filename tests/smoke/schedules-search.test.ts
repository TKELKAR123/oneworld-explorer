/**
 * Smoke: POST /api/schedules/search — dormant unless SCHEDULE_LIVE=1.
 */
import { describe, expect, it } from "vitest";
import { POST } from "../../apps/web/app/api/schedules/search/route.js";

describe("smoke — POST /api/schedules/search", () => {
  it("returns disabled stub by default (zero API)", async () => {
    const req = new Request("http://test/api/schedules/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: "LHR", to: "JFK", date: "2026-09-15" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.scheduleOnly).toBe(true);
    expect(body.provider).toBe("disabled");
    expect(body.flights).toEqual([]);
    expect(body.warnings?.some((w: string) => /disabled/i.test(w))).toBe(true);
    expect(body.asOf).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("returns 400 for invalid JSON", async () => {
    const req = new Request("http://test/api/schedules/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{not-json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Invalid JSON/i);
  });
});
