import { test, expect } from "@playwright/test";

test.describe("Authentication Workflow", () => {
  test("loads auth screen with maternal branding and toggle", async ({ page }) => {
    await page.goto("/auth");
    await expect(page).toHaveTitle(/Matrigluco/i);
    await expect(page.locator("text=Matrigluco Maternal Care")).toBeVisible();
  });
});
