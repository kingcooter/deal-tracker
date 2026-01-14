import { chromium, FullConfig } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, "../.env.local") });

export const TEST_EMAIL = "e2e-test@dealtracker.test";
export const TEST_PASSWORD = "TestPassword123!";
export const STORAGE_STATE_PATH = path.join(__dirname, ".auth/user.json");

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;

  // Ensure auth directory exists
  const authDir = path.dirname(STORAGE_STATE_PATH);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Try to create test user using service role key (bypasses email confirmation)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceRoleKey) {
    console.log("Creating test user via admin API...");
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check if user exists, create if not
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUsers?.users?.some(
      (u) => u.email === TEST_EMAIL
    );

    if (!userExists) {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        email_confirm: true, // Auto-confirm email!
      });

      if (error) {
        console.error("Failed to create test user:", error.message);
      } else {
        console.log("Test user created with confirmed email:", data.user?.email);
      }
    } else {
      console.log("Test user already exists");
    }
  } else {
    console.log(
      "Warning: SUPABASE_SERVICE_ROLE_KEY not set. Add it to .env.local to enable auto-confirmed test users."
    );
    console.log(
      "Get it from: Supabase Dashboard → Settings → API → service_role key"
    );
  }

  // Now login via browser to get session
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(`${baseURL}/login`);
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/password/i).fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();

    try {
      await page.waitForURL(/\/deals/, { timeout: 10000 });
      console.log("Test user logged in successfully");
      await context.storageState({ path: STORAGE_STATE_PATH });
    } catch {
      console.log("Login failed - check credentials or Supabase settings");
      await context.storageState({ path: STORAGE_STATE_PATH });
    }
  } finally {
    await browser.close();
  }
}

export default globalSetup;
