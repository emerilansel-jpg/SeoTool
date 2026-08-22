const fs = require('fs');
let content = fs.readFileSync('src/serverFunctions/gmb-grid.ts', 'utf8');

const importReplacement = `import { CreateGmbGridSchema, AutoScanGmbKeywordsSchema } from "@/server/features/gmb-grid/gmb-grid.schema";`;
content = content.replace('import { CreateGmbGridSchema } from "@/server/features/gmb-grid/gmb-grid.schema";', importReplacement);

const newFunction = `
export const scanGmbKeywords = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .validator(AutoScanGmbKeywordsSchema)
  .handler(async ({ data, context }) => {
    // Basic billing/quota check for scanning (can be mapped to rank tracking quota)
    await assertQuotaAvailable(context.organization.id, "rank_tracking", 10);

    const gmbService = new GmbGridService(process.env);
    
    // 1. Gather seed keywords
    const seeds = new Set<string>();
    
    // Generic fallback based on name tokens (assuming business name contains category)
    const nameTokens = data.businessName.split(" ").filter(t => t.length > 3);
    for (const token of nameTokens) {
      seeds.add(\`\${token.toLowerCase()} near me\`);
    }

    if (data.website) {
      const organicKeywords = await gmbService.getRankedKeywordsForDomain(data.website);
      organicKeywords.forEach(kw => seeds.add(kw));
    }

    const keywordList = Array.from(seeds).slice(0, 15); // Limit to 15 to save live cost
    
    // 2. Verify ranks in maps
    const verifiedRankings = await gmbService.verifyMapsRankings(keywordList, data.placeId, data.lat, data.lng);

    return verifiedRankings; // Array of { keyword, rank }
  });
`;

content = content + '\n' + newFunction;
fs.writeFileSync('src/serverFunctions/gmb-grid.ts', content);
console.log("Functions patched");
