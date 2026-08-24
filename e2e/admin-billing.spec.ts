import { expect, test, type Page } from "@playwright/test";

async function enableAuthBypass(page: Page) {
  await page.addInitScript(() => {
    Reflect.set(window, "__E2E_BYPASS_AUTH", true);
  });
}

async function clientNavigate(page: Page, path: string) {
  if (!page.url().startsWith("http://localhost:3101/billing")) {
    await page.goto("/billing", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Billing" })).toBeVisible();
  }
  await page.evaluate((nextPath) => {
    window.history.pushState({}, "", nextPath);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, path);
  await expect(page).toHaveURL(new RegExp(`${path.replaceAll("/", "\\/")}$`));
}

test.describe("Admin and billing smoke coverage", () => {
  test.beforeEach(async ({ page }) => {
    await enableAuthBypass(page);
  });

  test("all admin sections render for a configured platform admin", async ({
    page,
  }) => {
    const runtimeErrors: string[] = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") runtimeErrors.push(message.text());
    });

    const sections = [
      {
        path: "/admin",
        marker: (target: Page) =>
          target.getByText("Platform operations", { exact: false }),
      },
      {
        path: "/admin/users",
        marker: (target: Page) =>
          target.getByPlaceholder("Search by name or email..."),
      },
      {
        path: "/admin/billing",
        marker: (target: Page) =>
          target.getByText("Recent PayPal Webhook Events", { exact: true }),
      },
      {
        path: "/admin/pricing",
        marker: (target: Page) => target.getByText("PayPal", { exact: false }),
      },
      {
        path: "/admin/blog",
        marker: (target: Page) =>
          target.getByRole("link", { name: "New post", exact: false }),
      },
      {
        path: "/admin/pages",
        marker: (target: Page) =>
          target.getByRole("link", { name: "New page", exact: false }),
      },
      {
        path: "/admin/api-keys",
        marker: (target: Page) =>
          target.getByText("Secret values are write-only", { exact: false }),
      },
    ];

    for (const section of sections) {
      await clientNavigate(page, section.path);
      await expect(
        page.getByRole("heading", { name: "Admin", exact: true }),
      ).toBeVisible();
      await expect(section.marker(page).first()).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Overview", exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "API Keys", exact: true }),
      ).toBeVisible();
      if (section.path === "/admin") {
        await expect(
          page.getByText("Total Orgs", { exact: true }),
        ).toBeVisible();
        await expect(
          page.getByText("Unable to load analytics data.", { exact: true }),
        ).toHaveCount(0);
      }
      if (section.path === "/admin/api-keys") {
        await expect(
          page.getByRole("button", { name: "Test PayPal configuration" }),
        ).toBeVisible();
      }
    }

    expect(runtimeErrors).toEqual([]);
  });

  test("billing renders its plan, usage, and top-up controls", async ({
    page,
  }) => {
    await page.goto("/billing", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "Billing" })).toBeVisible();
    await expect(page.getByText("Current Plan", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Current Usage limits", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Buy Credits" }),
    ).toBeVisible();
  });

  test("admin and billing remain usable on a mobile viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await clientNavigate(page, "/admin/pricing");
    await expect(
      page.getByRole("heading", { name: "Admin", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Pricing", exact: true }),
    ).toBeVisible();

    await page.goto("/billing", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Billing" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Buy Credits" }),
    ).toBeVisible();
  });
});
