import { test, expect } from "@playwright/test";
import { TEST_EMAIL, TEST_PASSWORD, login } from "./fixtures";

test.describe("Deals Page", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    const success = await login(page);
    if (!success) {
      testInfo.skip(true, "Authentication not available");
    }
  });

  test("should display deals page with sidebar and header", async ({
    page,
  }) => {
    await expect(page.getByText("DealTracker")).toBeVisible();
    await expect(page.getByRole("link", { name: /deals/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /contacts/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /settings/i })).toBeVisible();
  });

  test("should show new deal button", async ({ page }) => {
    // Look for the New Deal button in the main content area (not sidebar)
    await expect(page.locator("main").getByRole("button", { name: /new deal/i })).toBeVisible();
  });

  test("should open create deal dialog when clicking new deal", async ({
    page,
  }) => {
    // Click the New Deal button in main content
    await page.locator("main").getByRole("button", { name: /new deal/i }).click();
    await expect(
      page.getByRole("heading", { name: /new deal/i })
    ).toBeVisible();
    await expect(page.getByLabel(/deal name/i)).toBeVisible();
  });

  test("should require deal name to create deal", async ({ page }) => {
    await page.locator("main").getByRole("button", { name: /new deal/i }).click();
    // The create button should be disabled when name is empty
    const createButton = page.getByRole("button", { name: /create deal/i });
    await expect(createButton).toBeDisabled();
  });

  test("should create a new deal successfully", async ({ page }) => {
    const dealName = `Test Deal ${Date.now()}`;

    await page.locator("main").getByRole("button", { name: /new deal/i }).click();

    // Wait for dialog to be visible
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    await page.getByLabel(/deal name/i).fill(dealName);

    // Wait for button to be enabled then click
    const createButton = page.getByRole("button", { name: /create deal/i });
    await expect(createButton).toBeEnabled();
    await createButton.click();

    // Wait for dialog to close (increase timeout for API call)
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 15000 });

    // Deal card should appear in the grid (look for the heading within the card)
    await expect(page.locator("h3").getByText(dealName)).toBeVisible({ timeout: 10000 });
  });

  test("should be able to logout", async ({ page }) => {
    // Find logout button (last button with icon in header)
    const logoutButton = page
      .locator("header")
      .getByRole("button")
      .filter({ has: page.locator("svg") })
      .last();
    await logoutButton.click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});
