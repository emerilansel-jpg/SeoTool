import { readFileSync } from "node:fs";
import { fetchPaaQuestions } from "@/server/lib/dataforseo/bulk";

const key = readFileSync(".env", "utf8").match(/^DATAFORSEO_API_KEY=(.*)$/m)?.[1]?.trim();
if (!key) {
  console.log("NO DATAFORSEO KEY");
  process.exit(0);
}
process.env.DATAFORSEO_API_KEY = key;
const r = await fetchPaaQuestions({ keyword: "how to do seo", locationCode: 2840, languageCode: "en" });
console.log("billing:", JSON.stringify(r.billing));
console.log("questions:", JSON.stringify(r.data.questions.slice(0, 5)));
process.exit(0);
