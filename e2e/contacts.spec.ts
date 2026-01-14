import { test, expect } from "@playwright/test";
import { TEST_EMAIL, TEST_PASSWORD, login } from "./fixtures";

test.describe("Contacts Page", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    const success = await login(page);
    if (!success) {
      testInfo.skip(true, "Authentication not available");
    }
    // Navigate to contacts
    await page.getByRole("link", { name: /contacts/i }).click();
    await page.waitForURL(/\/contacts/);
    // Wait for loading to complete
    await page.waitForSelector('[class*="animate-spin"]', { state: "hidden", timeout: 15000 }).catch(() => {});
  });

  test("should display contacts page", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /contacts/i })
    ).toBeVisible();
  });

  test("should show add contact button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /add contact/i })
    ).toBeVisible();
  });

  test("should open add contact dialog", async ({ page }) => {
    await page.getByRole("button", { name: /add contact/i }).click();
    await expect(
      page.getByRole("heading", { name: /add contact/i })
    ).toBeVisible();
    await expect(page.getByLabel(/^name/i)).toBeVisible();
  });

  test("should create a new contact", async ({ page }) => {
    const contactName = `Test Contact ${Date.now()}`;

    // Click Add Contact button in main content
    await page.locator("main").getByRole("button", { name: /add contact/i }).click();

    // Wait for dialog to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

    // Fill in the name field using the label with exact ID
    await page.locator("#contact-name").fill(contactName);

    // Click the Add Contact button in the dialog (the second button)
    await page.locator('[role="dialog"]').getByRole("button", { name: /add contact/i }).click();

    // Wait for dialog to close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 15000 });

    // Contact should appear in the table (look for the span with the name inside a table row)
    await expect(page.locator("table span.font-medium").getByText(contactName)).toBeVisible({ timeout: 10000 });
  });

  test("should display contacts table", async ({ page }) => {
    // The contacts page always shows a table (with empty state message inside if no contacts)
    await expect(page.locator("table")).toBeVisible({ timeout: 10000 });
  });
});
