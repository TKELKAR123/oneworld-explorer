import { expect, test } from "@playwright/test";
import { loadClassicRoute, openHealthDrawer, openTemplatesPanel, routeHero, waitForAppReady, waitForValidation } from "./helpers/wait-for-validation";

test.describe("critical path — ship gate", () => {
  test("app loads blank then classic RTW validates with route health", async ({ page }) => {
    await page.goto("/");
    await waitForAppReady(page);
    await expect(page.getByTestId("itinerary-empty-state")).toBeVisible();
    await openTemplatesPanel(page);
    await page.getByTestId("route-starter-select").selectOption("SC-001");
    await waitForValidation(page);
    await expect(routeHero(page)).toContainText("Valid");
    await expect(page.getByTestId("segment-ledger")).toBeVisible();
    await expect(page.getByTestId("cabin-fare-tracker")).toContainText(/LONE4/i);
    await openHealthDrawer(page);
    await expect(page.getByTestId("checklist-row-shape")).toBeVisible();
  });

  test("invalid route shows issues panel", async ({ page }) => {
    await loadClassicRoute(page);
    const lastInput = page.locator('[data-testid="stop-row"] input').last();
    await lastInput.fill("LHR");
    await lastInput.blur();
    await waitForValidation(page);
    await openHealthDrawer(page);
    await expect(page.getByTestId("issues-panel")).toContainText(/R3015-/i, {
      timeout: 10_000,
    });
  });

  test("disconnected route fails continuity (SC-008)", async ({ request }) => {
    const validate = await request.post("/api/validate", {
      data: {
        travelClass: "economy",
        segments: [
          { from: "JFK", to: "LHR" },
          { from: "LHR", to: "DXB" },
          { from: "SIN", to: "SYD" },
          { from: "SYD", to: "LAX" },
          { from: "LAX", to: "JFK" },
        ],
      },
    });
    const body = await validate.json();
    expect(body.valid).toBe(false);
    expect(body.issues.some((i: { code: string }) => i.code === "R3015-itinerary-continuity")).toBe(
      true,
    );
  });

  test("API health endpoints respond", async ({ request }) => {
    const home = await request.get("/");
    expect(home.ok()).toBeTruthy();
    expect(await home.text()).toContain("oneworld Explorer");

    const validate = await request.post("/api/validate", {
      data: {
        travelClass: "economy",
        stops: ["JFK", "LHR", "DXB", "SIN", "SYD", "LAX", "JFK"],
      },
    });
    expect(validate.ok()).toBeTruthy();
    const body = await validate.json();
    expect(body.valid).toBe(true);
    expect(body.ruleEvaluations?.length).toBeGreaterThan(30);

    const search = await request.get("/api/airports/search?q=Troms");
    expect(search.ok()).toBeTruthy();
    const airports = await search.json();
    expect(airports.airports.some((a: { iata: string }) => a.iata === "TOS")).toBe(true);
  });

  test("route map renders WebGL globe canvas", async ({ page }) => {
    await loadClassicRoute(page);
    await expect(page.getByTestId("globe-canvas")).toBeVisible({ timeout: 15_000 });
  });

  test("stop card shows return to origin", async ({ page }) => {
    await loadClassicRoute(page);
    await expect(page.getByText("Returns to origin").first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("Re-check button does not crash", async ({ page }) => {
    await loadClassicRoute(page);
    await page.getByRole("button", { name: "Re-check" }).click();
    await page.getByRole("button", { name: "Re-check" }).click();
    await expect(routeHero(page)).toContainText("Valid", {
      timeout: 10_000,
    });
  });

  test("globe zoom persists after control click", async ({ page }) => {
    await loadClassicRoute(page);
    const before = await page.getByTestId("globe-zoom-controls").innerText();
    await page.getByTestId("globe-zoom-in").click();
    await page.getByTestId("globe-zoom-in").click();
    await page.waitForTimeout(300);
    const after = await page.getByTestId("globe-zoom-controls").innerText();
    expect(after).not.toBe(before);
  });
});
