import { test, expect } from "@playwright/test";

test.describe("Local Assistant Workflow", () => {
  test("renders maternal health assistant view", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.locator("text=Matrigluco Maternal Care")).toBeVisible();
  });
});
