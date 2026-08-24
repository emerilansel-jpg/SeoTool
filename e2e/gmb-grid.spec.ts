// oxlint-disable @typescript-eslint/no-unsafe-type-assertion
import { expect, test, type Page } from "@playwright/test";
import { getE2EProjectId } from "./e2e-helpers";

async function setupProject(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as Record<string, boolean>).__E2E_BYPASS_AUTH = true;
  });
  return getE2EProjectId(page);
}

test.describe("GMB Grid (Local Map Rank)", () => {
  test("selects an exact profile, confirms cost, and completes a grid", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("pageerror", (err) =>
      consoleErrors.push(`pageerror: ${err.message}`),
    );
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(`console: ${msg.text()}`);
    });

    const projectId = await setupProject(page);
    await page.goto(`/p/${projectId}/gmb-grid`);

    await expect(
      page.getByRole("heading", { name: "Local Map Rank Tracker" }),
    ).toBeVisible();

    await page.getByPlaceholder("Business name and city").fill("test dental");
    await page.getByRole("button", { name: "Find" }).click();
    await page.getByRole("button", { name: /Test Dental Jakarta/ }).click();
    await page.getByPlaceholder("e.g. dentist near me").fill("dentist jakarta");
    await page.getByRole("button", { name: "Preview & start scan" }).click();

    await expect(
      page.getByRole("heading", { name: "Confirm local map scan" }),
    ).toBeVisible();
    await expect(page.getByText("49 queued Google Maps checks")).toBeVisible();
    await page.getByRole("button", { name: "Confirm & start" }).click();

    await expect(page.getByText("Scan complete", { exact: true })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText("SoLV (top 3)")).toBeVisible();

    // Hydration problems always surface as console errors.
    expect(consoleErrors.filter((e) => !e.includes("favicon"))).toEqual([]);
  });
});
