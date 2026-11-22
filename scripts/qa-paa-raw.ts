import { readFileSync } from "node:fs";
import { serpApi } from "@/server/lib/dataforseo/core";
import { SerpGoogleOrganicLiveAdvancedRequestInfo } from "dataforseo-client";

const key = readFileSync(".env", "utf8")
  .match(/^DATAFORSEO_API_KEY=(.*)$/m)?.[1]
  ?.trim();
process.env.DATAFORSEO_API_KEY = key;

const response = await serpApi().googleOrganicLiveAdvanced([
  new SerpGoogleOrganicLiveAdvancedRequestInfo({
    keyword: "how to do seo",
    location_code: 2840,
    language_code: "en",
    device: "desktop",
    os: "windows",
    depth: 10,
  }),
]);
if (!response) {
  console.log("NO RESPONSE");
  process.exit(0);
}
const items = response.tasks?.[0]?.result?.[0]?.items ?? [];
console.log("item count:", items.length);
console.log(
  "types:",
  JSON.stringify([...new Set(items.map((i: { type?: string }) => i.type))]),
);
const paa = items.find((i: { type?: string }) => i.type === "people_also_ask");
if (paa) {
  console.log("PAA element keys:", JSON.stringify(Object.keys(paa)));
  console.log("PAA sample:", JSON.stringify(paa).slice(0, 600));
} else {
  console.log("NO people_also_ask element at depth 2");
}
process.exit(0);
