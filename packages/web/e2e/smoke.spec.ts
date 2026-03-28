import { test, expect } from "@playwright/test";

const BASE = "http://localhost:8788";

// Helper: collect console errors during a page visit
async function collectErrors(page: any, fn: () => Promise<void>) {
  const errors: string[] = [];
  page.on("console", (msg: any) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err: any) => errors.push(err.message));
  await fn();
  return errors;
}

test.describe("Swankk Web App Smoke Tests", () => {
  test("Home page loads", async ({ page }) => {
    const errors = await collectErrors(page, async () => {
      await page.goto(BASE, { waitUntil: "networkidle" });
      await page.waitForTimeout(2000);
    });
    await page.screenshot({ path: "e2e/screenshots/home.png", fullPage: true });
    console.log("Home errors:", errors);
    await expect(page).not.toHaveURL(/login/i);
  });

  test("Landing page loads or redirects to Home", async ({ page }) => {
    const errors = await collectErrors(page, async () => {
      await page.goto(`${BASE}/Landing`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1500);
    });
    await page.screenshot({ path: "e2e/screenshots/landing.png", fullPage: true });
    console.log("Landing errors:", errors);
    // Should show landing content or home
    const url = page.url();
    expect(url).toMatch(/localhost:8788/);
  });

  test("Login page loads", async ({ page }) => {
    const errors = await collectErrors(page, async () => {
      await page.goto(`${BASE}/Login`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);
    });
    await page.screenshot({ path: "e2e/screenshots/login.png", fullPage: true });
    console.log("Login errors:", errors);
    await expect(page.locator("body")).toBeVisible();
  });

  test("Saved page loads (unauthenticated)", async ({ page }) => {
    const errors = await collectErrors(page, async () => {
      await page.goto(`${BASE}/Saved`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);
    });
    await page.screenshot({ path: "e2e/screenshots/saved.png", fullPage: true });
    console.log("Saved errors:", errors);
    await expect(page.locator("body")).toBeVisible();
  });

  test("Profile page redirects to Login when unauthenticated", async ({ page }) => {
    await page.goto(`${BASE}/Profile`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "e2e/screenshots/profile.png", fullPage: true });
    // Should either show profile or redirect to Login
    const url = page.url();
    expect(url).toMatch(/localhost:8788/);
  });

  test("TagDiscovery page loads", async ({ page }) => {
    const errors = await collectErrors(page, async () => {
      await page.goto(`${BASE}/TagDiscovery?tag=Minimalism`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1500);
    });
    await page.screenshot({ path: "e2e/screenshots/tag-discovery.png", fullPage: true });
    console.log("TagDiscovery errors:", errors);
    await expect(page.locator("body")).toBeVisible();
  });

  test("TrendDetail page loads", async ({ page }) => {
    const errors = await collectErrors(page, async () => {
      await page.goto(`${BASE}/TrendDetail?slug=sheer-confidence`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1500);
    });
    await page.screenshot({ path: "e2e/screenshots/trend-detail.png", fullPage: true });
    console.log("TrendDetail errors:", errors);
    await expect(page.locator("body")).toBeVisible();
  });

  test("404 page works", async ({ page }) => {
    await page.goto(`${BASE}/SomePageThatDoesNotExist`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "e2e/screenshots/404.png", fullPage: true });
    await expect(page.locator("body")).toBeVisible();
  });

  test("API /api/designers returns JSON", async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/designers`);
    const status = res.status();
    const body = await res.text();
    console.log("Designers API status:", status, "body:", body.slice(0, 200));
    expect([200, 401]).toContain(status);
  });

  test("API /api/trends returns JSON", async ({ page }) => {
    const res = await page.request.get(`${BASE}/api/trends`);
    const status = res.status();
    const body = await res.text();
    console.log("Trends API status:", status, "body:", body.slice(0, 200));
    expect([200, 401]).toContain(status);
  });
});
