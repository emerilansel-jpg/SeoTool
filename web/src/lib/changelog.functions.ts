import { createServerFn } from "@tanstack/react-start";
import { marked } from "marked";

export type ChangelogEntry = {
  version: string;
  html: string;
  raw: string;
};

export const getChangelogs = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      // Vite statically analyzes this glob and inlines file contents at build
      // time. eager + query raw returns Record<string, string> directly.
      const files = import.meta.glob("../../content/release-notes/*.md", {
        query: "raw",
        import: "default",
        eager: true,
      }) as Record<string, string>;

      const logs: ChangelogEntry[] = [];

      for (const [filePath, content] of Object.entries(files)) {
        if (filePath.includes("README.md")) continue;

        const fileName = filePath.split("/").pop() ?? "";
        const version = fileName.replace(".md", "");
        const html = await marked.parse(content);

        logs.push({ version, html, raw: content });
      }

      // Sort reverse chronological so newest versions appear first.
      return logs.sort((a, b) => {
        const aParts = a.version.replace("v", "").split(".").map(Number);
        const bParts = b.version.replace("v", "").split(".").map(Number);

        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
          const aVal = aParts[i] ?? 0;
          const bVal = bParts[i] ?? 0;
          if (aVal !== bVal) return bVal - aVal;
        }
        return 0;
      });
    } catch {
      // During prerender, the glob might not resolve. Return empty.
      return [];
    }
  },
);
