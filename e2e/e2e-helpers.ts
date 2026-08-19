import type { Page } from "@playwright/test";

/**
 * Navigate to the projects list (reachable without a paid subscription in
 * E2E mode) and extract the first E2E project id from the rendered link
 * hrefs.  The public landing lives at "/" now, so the old "wait for / →
 * /p/:id auto-redirect" pattern no longer applies.
 */
export async function getE2EProjectId(page: Page): Promise<string> {
  await page.goto("/projects");
  const projectLink = page.locator('a[href^="/p/"]').first();
  await projectLink.waitFor({ state: "visible", timeout: 30_000 });
  const href = await projectLink.getAttribute("href");
  const match = href?.match(/\/p\/([^/]+)/);
  if (!match) {
    throw new Error(`Could not read project id from ${href}`);
  }
  return match[1];
}
