import { test, expect } from "@playwright/test";

test.describe("Health Tracking Workflow", () => {
  test("protects tracking route from unauthenticated access", async ({ page }) => {
    await page.goto("/track");
    await expect(page).toHaveURL(/\/auth/);
  });
});
