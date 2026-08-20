import { test, expect } from "@playwright/test";
import { getE2EProjectId } from "./e2e-helpers";
import * as path from "path";
import * as fs from "fs";

const SCREENSHOTS_DIR = path.resolve("./test-results/qa-screenshots");
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

test.describe("Full Dashboard UI/UX QA and Screenshot Capture", () => {
  test("QA all dashboard features part 1 (1-13)", async ({ page }) => {
    test.setTimeout(180_000);
    await page.addInitScript(() => {
      (window as unknown as Record<string, boolean>).__E2E_BYPASS_AUTH = true;
    });

    const projectId = await getE2EProjectId(page);
    expect(projectId).toBeTruthy();

    const features = [
      { name: "01_dashboard", path: `/p/${projectId}` },
      { name: "02_keywords", path: `/p/${projectId}/keywords` },
      { name: "03_saved_keywords", path: `/p/${projectId}/saved` },
      { name: "04_rank_tracking", path: `/p/${projectId}/rank-tracking` },
      {
        name: "05_search_performance",
        path: `/p/${projectId}/search-performance`,
      },
      { name: "06_ga4_insights", path: `/p/${projectId}/ga4-insights` },
      { name: "07_domain_overview", path: `/p/${projectId}/domain` },
      { name: "08_backlinks", path: `/p/${projectId}/backlinks` },
      { name: "09_audit", path: `/p/${projectId}/audit` },
      { name: "10_content_gap", path: `/p/${projectId}/content-gap` },
      { name: "11_strategy", path: `/p/${projectId}/strategy` },
      { name: "12_brand_lookup", path: `/p/${projectId}/brand-lookup` },
      { name: "13_prompt_explorer", path: `/p/${projectId}/prompt-explorer` },
    ];

    await page.setViewportSize({ width: 1440, height: 900 });
    for (const feat of features) {
      console.log(`[QA] Navigating to ${feat.name}: ${feat.path}`);
      await page.goto(feat.path, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      await page
        .locator("nav, aside, main")
        .first()
        .waitFor({ state: "visible", timeout: 10000 })
        .catch(() => {});
      await page.waitForTimeout(600);

      const shotPath = path.join(SCREENSHOTS_DIR, `${feat.name}.png`);
      await page.screenshot({ path: shotPath });
    }
  });

  test("QA all dashboard features part 2 (14-25)", async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(() => {
      (window as unknown as Record<string, boolean>).__E2E_BYPASS_AUTH = true;
    });

    const projectId = await getE2EProjectId(page);
    expect(projectId).toBeTruthy();

    const features = [
      { name: "14_reports", path: `/p/${projectId}/reports` },
      { name: "15_alerts", path: `/p/${projectId}/alerts` },
      {
        name: "16_sitemap_validator",
        path: `/p/${projectId}/sitemap-validator`,
      },
      { name: "17_on_page_checker", path: `/p/${projectId}/on-page-checker` },
      {
        name: "18_keyword_clustering",
        path: `/p/${projectId}/keyword-clustering`,
      },
      { name: "19_link_intersect", path: `/p/${projectId}/link-intersect` },
      { name: "20_crawl_budget", path: `/p/${projectId}/crawl-budget` },
      { name: "21_serp_volatility", path: `/p/${projectId}/serp-volatility` },
      { name: "22_sam_chat", path: `/p/${projectId}/sam` },
      { name: "23_ai_mcp", path: `/ai` },
      { name: "24_settings", path: `/settings` },
      { name: "25_billing", path: `/billing` },
    ];

    for (const feat of features) {
      console.log(`[QA] Navigating to ${feat.name}: ${feat.path}`);
      await page.goto(feat.path, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      await page
        .locator("nav, aside, main")
        .first()
        .waitFor({ state: "visible", timeout: 10000 })
        .catch(() => {});
      await page.waitForTimeout(600);

      const shotPath = path.join(SCREENSHOTS_DIR, `${feat.name}.png`);
      await page.screenshot({ path: shotPath });
    }
  });

  test("Mobile responsive QA for core navigation and dashboard", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
      (window as unknown as Record<string, boolean>).__E2E_BYPASS_AUTH = true;
    });

    const projectId = "00000000-0000-0000-0000-000000000001";

    await page.goto(`/p/${projectId}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "mobile_01_dashboard.png"),
      fullPage: true,
    });

    // Open mobile sidebar drawer
    const menuBtn = page.getByRole("button", { name: "Toggle sidebar" });
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, "mobile_02_drawer.png"),
      });
    }
  });
});
