import {
  parseAccessLogLines,
  filterBotTraffic,
  analyzeCrawlBudget,
} from "@/server/lib/log-parser/accessLogParser";
import type { CrawlBudgetReport } from "@/server/lib/log-parser/logParserTypes";

export function analyzeFromLogs(logText: string): CrawlBudgetReport {
  const lines = logText.split("\n");
  const entries = parseAccessLogLines(lines);
  const botEntries = filterBotTraffic(entries);
  return analyzeCrawlBudget(botEntries, entries);
}
