const fs = require('fs');
let content = fs.readFileSync('src/server/services/gmb-grid.service.ts', 'utf8');

const newMethod = `
  /**
   * Fetches top organic ranked keywords for a domain via DataForSEO Labs.
   */
  async getRankedKeywordsForDomain(domain: string): Promise<string[]> {
    try {
      const url = new URL(domain);
      const host = url.hostname.replace('www.', '');

      const response = await fetch("https://api.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live", {
        method: "POST",
        headers: {
          "Authorization": this.getAuthHeader(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify([{
          target: host,
          location_code: 2840, // US (fallback default)
          language_code: "en",
          limit: 10
        }])
      });

      if (!response.ok) return [];
      
      const data = await response.json();
      const items = data.tasks?.[0]?.result?.[0]?.items || [];
      return items.map((i: any) => i.keyword_data?.keyword).filter(Boolean);
    } catch (err) {
      console.error("Failed to extract keywords for domain", err);
      return [];
    }
  }

  /**
   * Runs a live check to see if the Place ID ranks for these keywords.
   */
  async verifyMapsRankings(keywords: string[], targetPlaceId: string, lat: number, lng: number) {
    if (!keywords.length) return [];

    const tasks = keywords.map(kw => ({
      keyword: kw,
      location_coordinate: \`\${lat},\${lng}\`,
      language_code: "en",
      depth: 20
    }));

    // For instant feedback we use LIVE endpoint, this is more expensive (~$2 per 1000)
    // but required for synchronous UI feedback
    const response = await fetch("https://api.dataforseo.com/v3/serp/google/maps/live/advanced", {
      method: "POST",
      headers: {
        "Authorization": this.getAuthHeader(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(tasks)
    });

    if (!response.ok) return [];

    const data = await response.json();
    const verified = [];

    const resultTasks = data.tasks || [];
    for (let i = 0; i < resultTasks.length; i++) {
      const task = resultTasks[i];
      const items = task.result?.[0]?.items || [];
      const originalKeyword = keywords[i];
      
      for (const item of items) {
        if (item.type === "maps_search" && item.place_id === targetPlaceId) {
          verified.push({
            keyword: originalKeyword,
            rank: item.rank_group || item.rank_absolute || 1,
          });
          break;
        }
      }
    }

    return verified;
  }
`;

content = content.replace(/}$/, newMethod + '\n}');
fs.writeFileSync('src/server/services/gmb-grid.service.ts', content);
console.log("Patched service");
