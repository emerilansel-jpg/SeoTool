import { expect, test, type Page } from "@playwright/test";
import { getE2EProjectId } from "./e2e-helpers";

async function projectId(page: Page) {
  await page.addInitScript(() => {
    Reflect.set(window, "__E2E_BYPASS_AUTH", true);
  });
  return getE2EProjectId(page);
}

test.describe("Keyword and backlink research modes", () => {
  test("All Access checkout renders the current cohort and referral input", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Reflect.set(window, "__E2E_BYPASS_AUTH", true);
    });
    await page.goto("/subscribe?ref=friend123");

    await expect(
      page.getByRole("heading", { name: "All Access", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("LIFETIME PRICE LOCK")).toBeVisible();
    await expect(page.getByPlaceholder("Friend's code")).toHaveValue(
      "FRIEND123",
    );
    await expect(
      page.getByRole("button", { name: "Continue with PayPal" }),
    ).toBeDisabled();
    await expect(
      page.getByText(/PayPal plans are not configured yet/),
    ).toBeVisible();
  });

  test("Keyword Research contains Pro Analysis and the legacy route redirects", async ({
    page,
  }) => {
    const id = await projectId(page);
    await page.goto(`/p/${id}/keywords`);

    const modeTabs = page.getByRole("tablist", {
      name: "Keyword research mode",
    });
    await expect(modeTabs.getByRole("tab", { name: "Discover" })).toBeVisible();
    await modeTabs.getByRole("tab", { name: "Pro Analysis" }).click();
    await expect
      .poll(() => new URL(page.url()).searchParams.get("view"))
      .toBe("pro");
    await expect(
      page.getByRole("textbox", { name: /^Keywords \(up to 25\)$/ }),
    ).toBeVisible();
    await expect(page.getByText("Full + backlinks")).toBeVisible();

    await page.goto(`/p/${id}/keyword-research-pro`);
    await expect
      .poll(() => new URL(page.url()).pathname)
      .toBe(`/p/${id}/keywords`);
    await expect
      .poll(() => new URL(page.url()).searchParams.get("view"))
      .toBe("pro");
  });

  test("Backlinks separates Basic and Live with Standard or BYOK billing", async ({
    page,
  }) => {
    const id = await projectId(page);
    await page.goto(`/p/${id}/backlinks`);

    await expect(
      page.getByRole("button", { name: "Basic snapshot" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Live detailed" }).click();
    await expect
      .poll(() => new URL(page.url()).searchParams.get("provider"))
      .toBe("live");
    await expect(page.getByRole("button", { name: /Standard/ })).toBeVisible();
    await page.getByRole("button", { name: /BYOK/ }).click();
    await expect(
      page.getByPlaceholder("DataForSEO login:password or Base64 credential"),
    ).toBeVisible();
    await page.getByRole("button", { name: "Basic snapshot" }).click();
    await expect
      .poll(() => new URL(page.url()).searchParams.get("provider"))
      .toBe(null);
  });
});
