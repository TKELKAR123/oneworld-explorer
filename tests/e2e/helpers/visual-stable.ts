import { expect, type Page } from "@playwright/test";

/** Disable CSS animations/transitions for stable screenshots. */
export async function disableAnimations(page: Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        caret-color: transparent !important;
      }
    `,
  });
}

/** Wait for app shell + route hero (or health panel) to settle. */
export async function waitForVisualStable(page: Page) {
  await expect(page.getByRole("heading", { name: "oneworld Explorer" })).toBeVisible();
  await expect(page.getByTestId("globe-explorer")).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(300);
}

export async function waitForValidationOutcome(page: Page) {
  await expect(page.getByTestId("route-hero")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("route-hero")).not.toContainText(/Checking route/i, {
    timeout: 20_000,
  });
}

/** Mask volatile elements (loading pulses, timestamps). */
export function visualMaskLocators(page: Page) {
  return [
    page.getByTestId("loading-pulse"),
    page.getByTestId("route-pending"),
  ];
}
