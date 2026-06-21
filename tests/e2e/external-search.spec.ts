import { expect, test } from "@playwright/test";
import { loadClassicRoute } from "./helpers/wait-for-validation";

test.describe("External flight search", () => {
  test("network API returns direct carriers", async ({ request }) => {
    const res = await request.get("/api/routes/network?from=LHR&to=JFK");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.hasDirect).toBe(true);
    expect(body.directCarriers.length).toBeGreaterThan(0);
  });

  test("schedule search is disabled by default", async ({ request }) => {
    const res = await request.post("/api/schedules/search", {
      data: { from: "LHR", to: "JFK", date: "2026-09-15" },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.provider).toBe("disabled");
    expect(body.flights).toEqual([]);
  });

  test("search on leg card and RTW book CTA render", async ({ page }) => {
    await loadClassicRoute(page);
    await expect(page.getByTestId("leg-card-0")).toBeVisible();
    await expect(page.getByTestId("leg-search-flights-0")).toBeVisible();
    await expect(page.getByTestId("rtw-book-cta")).toBeVisible();
  });

  test("feasibility banner on first leg", async ({ page }) => {
    await loadClassicRoute(page);
    await expect(page.getByTestId("leg-feasibility-0")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("leg-feasibility-0")).toContainText(
      /Route index|Observed alliance|Published alliance route/i,
    );
  });
});
