// Screenshot local landing page sections. Run: node .firecrawl/shoot-local.mjs [port]
import { chromium } from "@playwright/test";

const port = process.argv[2] || "3000";
const OUT = ".firecrawl";
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});

await page.goto(`http://localhost:${port}/`, {
  waitUntil: "domcontentloaded",
  timeout: 90000,
});
await page.waitForTimeout(8000);

await page.screenshot({ path: `${OUT}/local-full.png`, fullPage: true });

const height = await page.evaluate(() => document.body.scrollHeight);
console.log("page height:", height);
const step = 900;
let i = 0;
for (let y = 0; y < Math.min(height, 9000); y += step) {
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await page.waitForTimeout(900);
  await page.screenshot({
    path: `${OUT}/local-sec-${String(i).padStart(2, "0")}.png`,
  });
  i++;
  if (i >= 10) break;
}

await browser.close();
console.log("done", i, "section shots");
