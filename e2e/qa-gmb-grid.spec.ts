// oxlint-disable typescript-eslint/no-unsafe-type-assertion
import { test, expect } from "@playwright/test";
import { getE2EProjectId } from "./e2e-helpers";
import * as path from "path";
import * as fs from "fs";

const QA_DIR = path.resolve("./test-results/qa-gmb-grid");
if (!fs.existsSync(QA_DIR)) {
  fs.mkdirSync(QA_DIR, { recursive: true });
}

test.describe("Local Map Rank Tracker (GMB Grid) QA Audit", () => {
  test("Desktop: Search, Matrix Configuration, Modal Confirmation, Execution, and Pin Inspection", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const consoleErrors: string[] = [];
    page.on("pageerror", (err) =>
      consoleErrors.push(`pageerror: ${err.message}`),
    );
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(() => {
      (window as unknown as Record<string, boolean>).__E2E_BYPASS_AUTH = true;
    });

    const projectId = await getE2EProjectId(page);
    expect(projectId).toBeTruthy();

    // 1. Navigate to GMB Grid
    await page.goto(`/p/${projectId}/gmb-grid`, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });
    await page.waitForTimeout(1000);

    const heading = page.getByRole("heading", {
      name: "Local Map Rank Tracker",
    });
    await expect(heading).toBeVisible();
    await page.screenshot({
      path: path.join(QA_DIR, "01_initial_empty_state.png"),
    });

    // 2. Validate Negative Case: Fill keyword but submit without selecting a profile
    const keywordInput = page.getByPlaceholder("e.g. dentist near me");
    await keywordInput.fill("dentist jakarta");
    const submitBtn = page.getByRole("button", {
      name: "Preview & start scan",
    });
    await submitBtn.click();
    const errorAlert = page.getByRole("alert");
    await expect(errorAlert).toContainText(
      "Select the exact Google Business Profile before scanning.",
    );
    await page.screenshot({
      path: path.join(QA_DIR, "02_validation_error.png"),
    });

    // 3. Search and Select Business Profile
    const searchInput = page.getByPlaceholder("Business name and city");
    await searchInput.fill("test dental");
    await page.getByRole("button", { name: "Find" }).click();

    const profileOption = page.getByRole("button", {
      name: /Test Dental Jakarta/,
    });
    await expect(profileOption).toBeVisible();
    await profileOption.click();

    // Verify selected profile badge is visible
    await expect(
      page.getByRole("paragraph").filter({ hasText: "Test Dental Jakarta" }),
    ).toBeVisible();
    await expect(
      page.getByText(/Verified Google Maps listing|Jakarta, Indonesia/).first(),
    ).toBeVisible();

    // 4. Configure Grid Settings (Matrix & Distance)
    // Change Matrix to 5x5 (25 pins)
    const matrixSelect = page.locator("select").filter({ hasText: /pins/ });
    await matrixSelect.selectOption("5");

    // Toggle unit to km
    await page.getByRole("button", { name: "km", exact: true }).click();
    await page.screenshot({
      path: path.join(QA_DIR, "03_profile_selected_and_configured.png"),
    });

    // 5. Open Confirmation Modal & Verify Cost Calculation
    await submitBtn.click();
    const confirmModal = page.getByRole("heading", {
      name: "Confirm local map scan",
    });
    await expect(confirmModal).toBeVisible();
    await expect(page.getByText("25 queued Google Maps checks")).toBeVisible();
    await page.screenshot({
      path: path.join(QA_DIR, "04_confirm_cost_modal.png"),
    });

    // 6. Confirm and Start Scan
    const confirmStartBtn = page.getByRole("button", {
      name: "Confirm & start",
    });
    await confirmStartBtn.click();

    // 7. Verify Completed Scan Pipeline & Metrics
    await expect(page.getByText(/Scan Completed/i)).toBeVisible({
      timeout: 25_000,
    });
    await expect(page.getByText(/SoLV \(Top 3\)/i)).toBeVisible();
    await expect(page.getByText(/Avg Rank/i)).toBeVisible();
    await expect(page.getByText(/Coverage/i)).toBeVisible();
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(QA_DIR, "05_completed_grid_map.png"),
    });

    // 8. Verify Map & Interactive Pin Inspection Modal
    // Leaflet circle markers have role or svg path elements
    const mapPins = page.locator(".leaflet-overlay-pane path");
    const pinCount = await mapPins.count();
    expect(pinCount).toBeGreaterThan(0);

    // Click on one of the grid snapshot markers
    if (pinCount > 1) {
      await mapPins.nth(2).click({ force: true });
      await page.waitForTimeout(500);
      const pinModal = page.locator("#pin-competitors-title");
      if (await pinModal.isVisible()) {
        await page.screenshot({
          path: path.join(QA_DIR, "06_pin_details_modal.png"),
        });
        // Close modal
        await page.locator('button[aria-label="Close"]').click();
      }
    }

    // Verify zero fatal console errors
    const fatalErrors = consoleErrors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("404") &&
        !e.includes("tile.openstreetmap.org"),
    );
    expect(fatalErrors).toEqual([]);
  });

  test("Mobile: Viewport Check (390px)", async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
      (window as unknown as Record<string, boolean>).__E2E_BYPASS_AUTH = true;
    });

    const projectId = await getE2EProjectId(page);
    expect(projectId).toBeTruthy();

    await page.goto(`/p/${projectId}/gmb-grid`, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });
    await expect(
      page.getByRole("heading", { name: "Local Map Rank Tracker" }),
    ).toBeVisible();
    await page.waitForTimeout(1000);

    // Check no horizontal overflow
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth,
    );
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

    await page.screenshot({
      path: path.join(QA_DIR, "07_mobile_gmb_grid.png"),
      fullPage: false,
    });
  });
});
