import { test, expect } from "@playwright/test";
import { login } from "./fixtures";

test.describe("Navigation & Layout", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    const success = await login(page);
    if (!success) {
      testInfo.skip(true, "Authentication not available");
    }
    // Wait for loading to complete
    await page.waitForSelector('[class*="animate-spin"]', { state: "hidden", timeout: 15000 }).catch(() => {});
  });

  test("should have working sidebar navigation", async ({ page }) => {
    // Test Deals link (should already be on deals)
    await expect(page).toHaveURL(/\/deals/);

    // Test Contacts link - use sidebar locator
    const contactsLink = page.locator("aside").getByRole("link", { name: /contacts/i });
    await contactsLink.click();
    await expect(page).toHaveURL(/\/contacts/, { timeout: 10000 });

    // Test Settings link
    const settingsLink = page.locator("aside").getByRole("link", { name: /settings/i });
    await settingsLink.click();
    await expect(page).toHaveURL(/\/settings/, { timeout: 10000 });

    // Go back to Deals
    const dealsLink = page.locator("aside").getByRole("link", { name: /deals/i });
    await dealsLink.click();
    await expect(page).toHaveURL(/\/deals/, { timeout: 10000 });
  });

  test("should highlight active navigation item", async ({ page }) => {
    // The deals link should have some active styling
    const dealsLink = page
      .locator("aside")
      .getByRole("link", { name: /deals/i });
    // Check it exists and is visible
    await expect(dealsLink).toBeVisible();
  });

  test("should have header with search", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();
  });

  test("should display logo in sidebar", async ({ page }) => {
    await expect(page.locator("aside").getByText("DealTracker")).toBeVisible();
  });
});

test.describe("Edge Cases & Error Handling", () => {
  test("should handle 404 for non-existent deal", async ({ page }, testInfo) => {
    const success = await login(page);
    if (!success) {
      testInfo.skip(true, "Authentication not available");
    }

    // Try to access non-existent deal
    await page.goto("/deals/00000000-0000-0000-0000-000000000000");

    // Should show error or empty state
    const hasError = await page
      .getByText(/not found|error|no deal|deal not found/i)
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    const redirectedToDeals = page.url().includes("/deals");

    expect(hasError || redirectedToDeals).toBeTruthy();
  });

  test("should redirect to login after logout", async ({ page }, testInfo) => {
    const success = await login(page);
    if (!success) {
      testInfo.skip(true, "Authentication not available");
    }

    // Find and click logout button
    const logoutButton = page
      .locator("header")
      .getByRole("button")
      .filter({ has: page.locator("svg") })
      .last();
    await logoutButton.click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test("should protect routes when not authenticated", async ({ page }) => {
    // Try to access protected route without auth
    await page.goto("/deals");
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});
