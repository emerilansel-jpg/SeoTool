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
  test("page hydrates: form submits and pipeline panel reacts", async ({
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

    // Manual business-name typing must not clobber the default coordinates.
    await page
      .getByPlaceholder("Type your Google Business Name...")
      .fill("Milkwood Restaurant");
    await expect(page.locator('input[name="centerLat"]')).toHaveValue(
      "32.7157",
    );
    await expect(page.locator('input[name="centerLng"]')).toHaveValue(
      "-117.1611",
    );

    await page.locator('input[name="keyword"]').fill("restaurant san diego");

    // The critical assertion: the submit handler runs at all. Without
    // hydration (e.g. an SSR/Leaflet mismatch) the click does nothing.
    await page.getByRole("button", { name: "Scan Now" }).click();

    await expect(
      page.getByText(
        /Scanning grid points|Scan failed to start|Waiting for scan|Scan complete|Scan failed/,
      ),
    ).toBeVisible({ timeout: 20_000 });

    // Hydration problems always surface as console errors. The Places API
    // hint is expected: the app intentionally runs the autocomplete without
    // the Google Maps script and falls back to manual entry.
    expect(
      consoleErrors.filter(
        (e) => !e.includes("favicon") && !e.includes("use-places-autocomplete"),
      ),
    ).toEqual([]);
  });
});
