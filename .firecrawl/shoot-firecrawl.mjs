// Screenshot firecrawl.dev sections + full page at desktop viewport.
// Run from repo root: node .firecrawl/shoot-firecrawl.mjs
import { chromium } from "@playwright/test";

const OUT = ".firecrawl";
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});

await page.goto("https://www.firecrawl.dev/", {
  waitUntil: "networkidle",
  timeout: 60000,
});
await page.waitForTimeout(2500);

// Full page (tall; for overall layout mapping)
await page.screenshot({ path: `${OUT}/fc-full.png`, fullPage: true });

// Viewport captures at successive scroll positions
const height = await page.evaluate(() => document.body.scrollHeight);
console.log("page height:", height);
const step = 900;
let i = 0;
for (let y = 0; y < Math.min(height, 9000); y += step) {
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: `${OUT}/fc-sec-${String(i).padStart(2, "0")}.png`,
  });
  i++;
  if (i >= 10) break;
}

await browser.close();
console.log("done", i, "section shots");
