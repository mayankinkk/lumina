import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads and shows greeting", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Lumina/);
  });

  test("navigates to library", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Library");
    await expect(page).toHaveURL(/\/library/);
  });

  test("navigates to analytics", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Analytics");
    await expect(page).toHaveURL(/\/analytics/);
  });

  test("navigates to vocabulary", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Vocabulary");
    await expect(page).toHaveURL(/\/vocabulary/);
  });

  test("navigates to notes", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Notes");
    await expect(page).toHaveURL(/\/notes/);
  });

  test("navigates to settings", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Settings");
    await expect(page).toHaveURL(/\/settings/);
  });
});

test.describe("Library page", () => {
  test("loads with empty state", async ({ page }) => {
    await page.goto("/library");
    await expect(page.locator("text=Your library is empty")).toBeVisible();
  });

  test("has upload zone", async ({ page }) => {
    await page.goto("/library");
    await expect(page.locator("text=Upload")).toBeVisible();
  });
});

test.describe("Analytics page", () => {
  test("loads with chart containers", async ({ page }) => {
    await page.goto("/analytics");
    await expect(page.locator("text=Reading Analytics")).toBeVisible();
  });
});

test.describe("Vocabulary page", () => {
  test("loads and shows tabs", async ({ page }) => {
    await page.goto("/vocabulary");
    await expect(page.locator("text=All Words")).toBeVisible();
  });
});

test.describe("Notes page", () => {
  test("loads with tabs for highlights and notes", async ({ page }) => {
    await page.goto("/notes");
    await expect(page.locator("text=Highlights")).toBeVisible();
    await expect(page.locator("text=Notes")).toBeVisible();
  });
});

test.describe("Settings page", () => {
  test("loads with tabs", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("text=Appearance")).toBeVisible();
  });
});

test.describe("Reader page", () => {
  test("shows not found for invalid book", async ({ page }) => {
    await page.goto("/reader/invalid-id-123");
    await expect(page.locator("text=Book not found")).toBeVisible();
  });
});
