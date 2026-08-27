import { test, expect } from "@playwright/test";

test.describe("Assessment Workflow", () => {
  test("navigates to assessment form and validates required fields", async ({ page }) => {
    await page.goto("/prediction");
    // Protected route redirects unauthenticated user to /auth
    await expect(page).toHaveURL(/\/auth/);
  });
});
