import { test, expect } from "@playwright/test";

test("debug domain overview", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));

  await page.addInitScript(() => {
    (window as any).__E2E_BYPASS_AUTH = true;
  });

  // Go to root and wait for project redirect
  await page.goto("/");
  await page.waitForURL(/\/p\/([^/]+)\/?$/, { timeout: 30000 });
  const match = page.url().match(/\/p\/([^/]+)/);
  const projectId = match![1];
  console.log("Project ID:", projectId);

  // Navigate to domain page
  await page.goto(
    `/p/${projectId}/domain?domain=primary.example.com&subdomains=true&sort=traffic&order=desc`,
  );

  // Wait for data to load
  await page.waitForTimeout(15000);

  // Log everything
  console.log("URL:", page.url());
  console.log("Errors:", JSON.stringify(errors));

  // Check if domain input is populated
  const input = page.getByPlaceholder("Enter a domain");
  const value = await input.inputValue();
  console.log("Domain input value:", value);

  // Check for any text content
  const bodyText = await page.evaluate(() =>
    document.body.innerText.substring(0, 1000),
  );
  console.log("Body text:", bodyText);

  // Check if Filters button exists
  const filtersBtn = page.getByRole("button", { name: /Filters/ });
  const filtersVisible = await filtersBtn.isVisible().catch(() => false);
  console.log("Filters visible:", filtersVisible);
});
