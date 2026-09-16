import { test, expect } from "@playwright/test";
import { getE2EProjectId } from "./e2e-helpers";
import * as path from "path";
import * as fs from "fs";

const QA_DIR = path.resolve("./test-results/qa-ai-tracking");
if (!fs.existsSync(QA_DIR)) {
  fs.mkdirSync(QA_DIR, { recursive: true });
}

test.describe("AI Visibility & Mention Tracking QA Audit", () => {
  test("Desktop: Comprehensive UI, Tab Navigation, and Form Controls", async ({ page }) => {
    test.setTimeout(120_000);
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(() => {
      (window as unknown as Record<string, boolean>).__E2E_BYPASS_AUTH = true;
    });

    const projectId = await getE2EProjectId(page);
    expect(projectId).toBeTruthy();

    // 1. Navigate to AI Tracking
    await page.goto(`/p/${projectId}/ai-tracking`, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });
    await page.waitForTimeout(1500);

    // Verify page header
    const heading = page.locator("h1");
    await expect(heading).toContainText("AI Generatif");

    // Capture initial unconfigured state
    await page.screenshot({ path: path.join(QA_DIR, "01_unconfigured_state.png") });

    // 2. Open Setup Modal & Configure Brand
    const setupBtn = page.getByRole("button", { name: /Configure AI Generatif|Setup Tracking/i }).first();
    await expect(setupBtn).toBeVisible();
    await setupBtn.click();
    await page.waitForTimeout(500);

    const modalDialog = page.locator('div[role="dialog"]');
    await expect(modalDialog).toBeVisible();
    await page.screenshot({ path: path.join(QA_DIR, "02_setup_modal_clean.png") });

    // Fill form
    await page.getByPlaceholder("e.g. Zoho", { exact: true }).fill("Acme Digital");
    await page.getByPlaceholder("e.g. zoho.com", { exact: true }).fill("acmedigital.com");
    await page.getByPlaceholder("e.g. Zoho CRM, Zoho Suite").fill("Acme, Acme SEO");

    // Submit form
    const saveBtn = page.getByRole("button", { name: "Save Configuration" });
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();
    await page.waitForTimeout(1500);

    // 3. Verify Configured Dashboard & KPI Cards
    await expect(page.getByRole("button", { name: /Settings/i })).toBeVisible();
    await page.screenshot({ path: path.join(QA_DIR, "03_configured_overview.png") });

    // 4. Test AI Models filter pills on KPI Card
    const chatgptBtn = page.getByRole("button", { name: "ChatGPT" }).first();
    if (await chatgptBtn.isVisible()) {
      await chatgptBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(QA_DIR, "04_kpi_filtered_chatgpt.png") });
      const allModelsBtn = page.getByRole("button", { name: "All", exact: true }).first();
      await allModelsBtn.click();
      await page.waitForTimeout(500);
    }

    // 5. Test Tab: AI Prompts (Discovered)
    const promptsTabBtn = page.getByRole("button", { name: /AI Prompts/i }).first();
    await expect(promptsTabBtn).toBeVisible();
    await promptsTabBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(QA_DIR, "05_tab_discovered_prompts.png") });

    // 6. Test Tab: Tracked Prompts
    const trackedTabBtn = page.getByRole("button", { name: /Tracked Prompts/i }).first();
    await expect(trackedTabBtn).toBeVisible();
    await trackedTabBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(QA_DIR, "06_tab_tracked_prompts.png") });

    // 7. Test Tab: Citations
    const citationsTabBtn = page.getByRole("button", { name: /Citations/i }).first();
    await expect(citationsTabBtn).toBeVisible();
    await citationsTabBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(QA_DIR, "07_tab_citations.png") });

    // 8. Test Tab: Pages
    const pagesTabBtn = page.getByRole("button", { name: /^Pages/i }).first();
    await expect(pagesTabBtn).toBeVisible();
    await pagesTabBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(QA_DIR, "08_tab_pages.png") });

    // 9. Test Tab: Competitors
    const compTabBtn = page.getByRole("button", { name: /Competitors/i }).first();
    await expect(compTabBtn).toBeVisible();
    await compTabBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(QA_DIR, "09_tab_competitors.png") });

    // 10. Test Tab: GSC Correlation
    const gscTabBtn = page.getByRole("button", { name: /GSC/i }).first();
    await expect(gscTabBtn).toBeVisible();
    await gscTabBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(QA_DIR, "10_tab_gsc_correlation.png") });

    // Verify zero console errors
    console.log("[QA Audit] Console errors captured:", consoleErrors);
    expect(consoleErrors.filter((e) => !e.includes("404") && !e.includes("favicon"))).toHaveLength(0);
  });

  test("Mobile: Responsive Layout & Touch Usability (390px)", async ({ page }) => {
    test.setTimeout(60_000);
    const consoleLogs: string[] = [];
    page.on("console", (msg) => consoleLogs.push(`${msg.type()}: ${msg.text()}`));

    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
      (window as unknown as Record<string, boolean>).__E2E_BYPASS_AUTH = true;
    });

    const projectId = await getE2EProjectId(page);
    expect(projectId).toBeTruthy();

    await page.goto(`/p/${projectId}/ai-tracking`, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });

    // Wait for either the configured card or the unconfigured state
    await page.waitForSelector('h1:has-text("AI Generatif")', { timeout: 30_000 });
    await page.waitForSelector('.card, button:has-text("Configure AI Generatif"), button:has-text("Settings")', { timeout: 30_000 });
    await page.waitForTimeout(1000);

    // Verify no horizontal overflow on mobile
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

    await page.screenshot({
      path: path.join(QA_DIR, "10_mobile_ai_tracking.png"),
      fullPage: false,
    });
  });
});
