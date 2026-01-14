import { test, expect } from "@playwright/test";

// Generate unique test email to avoid conflicts
const testEmail = `test-${Date.now()}@example.com`;
const testPassword = "TestPassword123!";

test.describe("Authentication", () => {
  test("should show login page by default for unauthenticated users", async ({
    page,
  }) => {
    await page.goto("/deals");
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });

  test("should display login form with all fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /sign up/i })).toBeVisible();
  });

  test("should display signup form with all fields", async ({ page }) => {
    await page.goto("/signup");
    await expect(
      page.getByRole("heading", { name: "Create account" })
    ).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder("Create a password")).toBeVisible();
    await expect(page.getByPlaceholder("Confirm your password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /create account/i })
    ).toBeVisible();
  });

  test("should show error for invalid login credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("invalid@example.com");
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();

    // Should show error message
    await expect(page.getByText(/invalid/i)).toBeVisible({ timeout: 10000 });
  });

  test("should show error for mismatched passwords on signup", async ({
    page,
  }) => {
    await page.goto("/signup");
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByPlaceholder("Create a password").fill(testPassword);
    await page.getByPlaceholder("Confirm your password").fill("DifferentPass!");
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });

  test("should show error for short password on signup", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByPlaceholder("Create a password").fill("12345");
    await page.getByPlaceholder("Confirm your password").fill("12345");
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.getByText(/at least 6 characters/i)).toBeVisible();
  });

  test("should navigate between login and signup pages", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /sign up/i }).click();
    await expect(page).toHaveURL(/\/signup/);

    await page.getByRole("link", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
