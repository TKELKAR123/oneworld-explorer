import { expect, type Page } from "@playwright/test";

/** App shell loaded (blank itinerary is OK). */
export async function waitForAppReady(page: Page) {
  await expect(page.getByRole("heading", { name: "oneworld Explorer" })).toBeVisible();
  await expect(page.getByTestId("explore-column")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("route-hero")).toContainText(/Start here|Pick origin/i, {
    timeout: 15_000,
  });
}

/** Globe geography atlas fetched and WebGL shell ready. */
export async function waitForGlobeAtlas(page: Page) {
  await expect(page.getByTestId("globe-atlas-ready")).toBeVisible({ timeout: 90_000 });
}

/** Wait until auto-validation finishes and route hero shows an outcome. */
export async function waitForValidation(page: Page) {
  await expect(page.getByTestId("route-hero")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("route-hero")).toContainText(
    /Valid|Invalid|Draft|Needs return|Ready to quote|Needs fixes|Ready with caveats|Checking/i,
    { timeout: 30_000 },
  );
}

/** Wait until validation + route network loading overlay clears. */
export async function waitForRouteSettled(page: Page, timeout = 60_000) {
  const pending = page.getByTestId("route-pending");
  if ((await pending.count()) === 0) return;
  await expect(pending).toBeHidden({ timeout });
}

/** Wait until the outcome chip settles (ignores absent loading overlay). */
export async function waitForOutcomeChip(
  page: Page,
  pattern: RegExp,
  timeout = 30_000,
) {
  const chip = page.getByTestId("outcome-chip");
  await expect(chip).toBeVisible({ timeout: 15_000 });
  const pending = page.getByTestId("route-pending");
  if (await pending.isVisible().catch(() => false)) {
    await expect(pending).toBeHidden({ timeout });
  }
  await expect(chip).toContainText(pattern, { timeout });
  await expect(chip).not.toContainText(/^Checking/i, { timeout: 5_000 });
}

/** Promote building-phase routes to ticket-ready Valid (hero chip requires this). */
export async function recheckForValidRoute(page: Page) {
  await page.getByRole("button", { name: "Re-check" }).click();
  await waitForValidation(page);
  await waitForOutcomeChip(page, /Valid/i);
}

/** Hero strip (outcome, fare basis, segment ledger). */
export function routeHero(page: Page) {
  return page.getByTestId("route-hero");
}

/** Expand health drawer to access checklist and issues. */
export async function openHealthDrawer(page: Page) {
  await expect(page.getByTestId("health-drawer-strip")).toBeVisible({
    timeout: 15_000,
  });
  await page.getByTestId("health-drawer-open").click();
  await expect(page.getByTestId("validation-checklist")).toBeVisible({
    timeout: 10_000,
  });
}

/** Open collapsed Templates panel in the build column. */
export async function openTemplatesPanel(page: Page) {
  const panel = page.getByTestId("templates-panel");
  await expect(panel).toBeVisible();
  const open = await panel.evaluate((el: HTMLDetailsElement) => el.open);
  if (!open) {
    await panel.locator("summary").click();
  }
  await expect(page.getByTestId("route-starter-select")).toBeVisible();
}

/** Load the classic eastbound RTW template (SC-001) for tests that need a full route. */
export async function loadClassicRoute(page: Page) {
  await page.goto("/");
  await waitForAppReady(page);
  await openTemplatesPanel(page);
  await page.getByTestId("route-starter-select").selectOption("SC-001");
  await expect(page.getByTestId("route-chain")).toContainText(/JFK/i, {
    timeout: 15_000,
  });
  await waitForValidation(page);
  await waitForRouteSettled(page);
}
