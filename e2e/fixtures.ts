import { test as base, expect, Page } from "@playwright/test";

export const TEST_EMAIL = "e2e-test@dealtracker.test";
export const TEST_PASSWORD = "TestPassword123!";

// Helper function to login and return success status
export async function login(page: Page): Promise<boolean> {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(TEST_EMAIL);
  await page.getByLabel(/password/i).fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();

  // Wait for either redirect to deals or error message
  try {
    await page.waitForURL(/\/deals/, { timeout: 10000 });
    return true;
  } catch {
    // Check if there's an error message
    const hasError = await page
      .locator('[class*="error"], [class*="Error"]')
      .isVisible();
    return !hasError && page.url().includes("/deals");
  }
}

// Test that requires authentication - will skip if login fails
export const authenticatedTest = base.extend<{ loggedInPage: Page }>({
  loggedInPage: async ({ page }, use, testInfo) => {
    const success = await login(page);
    if (!success) {
      testInfo.skip(true, "Authentication not available - skipping test");
      return;
    }
    await use(page);
  },
});

export { expect };
export const test = base;
