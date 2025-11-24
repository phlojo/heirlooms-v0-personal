import type { Page } from "@playwright/test"

/**
 * Logs in to the application using the real login page and test credentials.
 * Uses environment variables E2E_EMAIL and E2E_PASSWORD.
 *
 * @param page - Playwright Page object
 * @throws Error if E2E credentials are not set in environment variables
 */
export async function login(page: Page): Promise<void> {
  const email = process.env.E2E_EMAIL
  const password = process.env.E2E_PASSWORD

  if (!email || !password) {
    throw new Error(
      "E2E test credentials are not set. Please set E2E_EMAIL and E2E_PASSWORD environment variables.\n" +
        "Example: E2E_EMAIL=e2e-test@heirlooms.local E2E_PASSWORD=TestUser123! pnpm test:e2e",
    )
  }

  // Navigate to the login page
  await page.goto("/login")

  // Wait for the login form to load
  await page.waitForSelector('input[type="email"]', { timeout: 10000 })

  // Fill in the email field using placeholder selector
  await page.getByPlaceholder("you@example.com").fill(email)

  // Wait a moment for the form to process
  await page.waitForTimeout(500)

  // Check if password field already exists (might default to password login)
  let passwordFieldExists = await page
    .locator('input[type="password"]')
    .isVisible({ timeout: 2000 })
    .catch(() => false)

  // If password field doesn't exist, click "Use password instead" button
  if (!passwordFieldExists) {
    const usePasswordButton = page.getByRole("button", { name: /Use password instead/i })
    if (await usePasswordButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await usePasswordButton.click()
      await page.waitForTimeout(500)
    }
  }

  // Wait for password field to appear with longer timeout
  await page.waitForSelector('input[type="password"]', { timeout: 10000 })

  // Fill in the password field
  await page.getByLabel("Password").fill(password)

  // Click the Sign In button
  const signInButton = page.getByRole("button", { name: /Sign In/i })
  await signInButton.click()

  // Wait for successful redirect - use longer timeout and more flexible URL matching
  await page.waitForURL(/\/(collections|artifacts|profile|login.*)?$/, { timeout: 30000 })

  // Wait for navigation to complete
  await page.waitForLoadState("networkidle")

  // Additional verification: ensure we're not still on the login page
  const currentUrl = page.url()
  if (currentUrl.includes("/login") && !currentUrl.includes("returnTo")) {
    throw new Error("Login failed: Still on login page after submitting credentials")
  }

  // Wait a moment for auth state to fully settle
  await page.waitForTimeout(1000)
}
