import { AppError } from "@/server/lib/errors";

interface DataForSeoTaskResponse {
  tasks: Array<{
    id: string;
    status_code: number;
    status_message: string;
  }>;
}

export class GmbGridService {
  constructor(private readonly env: any) {}

  private getAuthHeader(): string {
    const login = this.env?.DATAFORSEO_LOGIN || process.env.DATAFORSEO_LOGIN;
    const password = this.env?.DATAFORSEO_PASSWORD || process.env.DATAFORSEO_PASSWORD;
    if (!login || !password) {
      throw new AppError("INTERNAL_ERROR", "DataForSEO credentials missing");
    }
    return "Basic " + Buffer.from(`${login}:${password}`).toString("base64");
  }

  async postGridTasks(keyword: string, nodes: Array<{lat: number, lng: number, id: string}>) {
    const tasks = nodes.map(node => ({
      keyword,
      location_coordinate: `${node.lat},${node.lng}`,
      language_code: "en",
      depth: 20,
      tag: node.id
    }));

    const response = await fetch("https://api.dataforseo.com/v3/serp/google/maps/task_post", {
      method: "POST",
      headers: {
        "Authorization": this.getAuthHeader(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(tasks)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DataForSEO maps post error:", errorText);
      throw new AppError("INTERNAL_ERROR", "Failed to trigger DataForSEO Maps task");
    }

    const data = (await response.json()) as DataForSeoTaskResponse;
    return data.tasks;
  }

  async fetchGridTaskResult(taskId: string, targetBusinessName: string): Promise<number | null> {
    const response = await fetch(`https://api.dataforseo.com/v3/serp/google/maps/task_get/advanced/${taskId}`, {
      method: "GET",
      headers: {
        "Authorization": this.getAuthHeader(),
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) return null;

    const data = (await response.json()) as any;
    const task = data.tasks?.[0];
    
    if (!task || task.status_code !== 20000 || !task.result?.[0]?.items) return null;

    const items = task.result[0].items;
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const target = normalize(targetBusinessName);

    for (const item of items) {
      if (item.type === "maps_search" && item.title) {
        if (normalize(item.title) === target) {
          return item.rank_group || item.rank_absolute || null;
        }
      }
    }

    return null;
  }
}
