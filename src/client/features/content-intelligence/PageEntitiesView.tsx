import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ChevronDown } from "lucide-react";
import { getPageEntities } from "@/serverFunctions/content-intelligence";
import { extractPathname } from "@/client/features/audit/shared";

type EntityResponse = Awaited<ReturnType<typeof getPageEntities>>;
type PageEntityRow = EntityResponse["entities"][number];

const ENTITY_TYPE_COLORS: Record<string, string> = {
  person: "badge-info badge-soft",
  organization: "badge-primary badge-soft",
  product: "badge-success badge-soft",
  location: "badge-warning badge-soft",
  brand: "badge-secondary badge-soft",
  technology: "badge-accent badge-soft",
  other: "badge-ghost",
};

function EntityTypeBadge({ type }: { type: string }) {
  const tone = ENTITY_TYPE_COLORS[type] ?? ENTITY_TYPE_COLORS.other;
  return <span className={`badge badge-sm ${tone}`}>{type}</span>;
}

function RelevanceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 70 ? "bg-success" : pct >= 40 ? "bg-warning" : "bg-base-content/30";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-base-300">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-base-content/50">{pct}%</span>
    </div>
  );
}

export function PageEntitiesView({
  projectId,
  auditId,
}: {
  projectId: string;
  auditId: string;
}) {
  const query = useQuery({
    queryKey: ["page-entities", projectId, auditId],
    queryFn: () => getPageEntities({ data: { projectId, auditId } }),
  });

  const [expandedPageId, setExpandedPageId] = useState<string | null>(null);

  const rows = query.data?.entities ?? EMPTY_ROWS;

  const summary = useMemo(() => computeSummary(rows), [rows]);

  if (query.isLoading) {
    return (
      <p className="flex items-center gap-2 py-8 text-sm text-base-content/60">
        <span className="loading loading-spinner loading-sm" /> Extracting
        entities…
      </p>
    );
  }

  if (query.isError) {
    return (
      <div className="alert alert-error text-sm">
        <AlertCircle className="size-4" />
        Could not load page entities.
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-base-300 bg-base-100 px-4 py-6 text-sm text-base-content/60">
        No entity data for this audit. Entity extraction runs automatically when
        OpenRouter is configured and the audit has crawled pages with content.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          label="Pages analyzed"
          value={String(summary.totalPages)}
        />
        <SummaryCard
          label="Total entities"
          value={String(summary.totalEntities)}
        />
        <SummaryCard label="Total topics" value={String(summary.totalTopics)} />
        <SummaryCard
          label="Top entity type"
          value={summary.topEntityType ?? "—"}
        />
      </div>

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body gap-2 p-0">
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Entities</th>
                  <th>Topics</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const isOpen = expandedPageId === row.pageId;
                  return (
                    <FragmentRow
                      key={row.id}
                      row={row}
                      isOpen={isOpen}
                      onToggle={() =>
                        setExpandedPageId(isOpen ? null : row.pageId)
                      }
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const EMPTY_ROWS: PageEntityRow[] = [];

function FragmentRow({
  row,
  isOpen,
  onToggle,
}: {
  row: PageEntityRow;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr className="cursor-pointer hover" onClick={onToggle}>
        <td className="max-w-[280px]">
          <div className="truncate" title={row.url}>
            {extractPathname(row.url)}
          </div>
        </td>
        <td className="tabular-nums text-base-content/70">
          {row.entities.length}
        </td>
        <td className="tabular-nums text-base-content/70">
          {row.topics.length}
        </td>
        <td className="text-right">
          <ChevronDown
            className={`size-4 text-base-content/40 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </td>
      </tr>
      {isOpen && (
        <tr className="bg-base-200/40">
          <td colSpan={4}>
            <div className="grid gap-4 py-1 md:grid-cols-2">
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-base-content/50">
                  Entities ({row.entities.length})
                </p>
                {row.entities.length === 0 ? (
                  <p className="text-sm text-base-content/50">
                    No entities extracted.
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {row.entities.map((entity, i) => (
                      <li
                        key={`${entity.name}-${i}`}
                        className="flex items-center gap-2 text-sm"
                      >
                        <EntityTypeBadge type={entity.type} />
                        <span className="text-base-content/80">
                          {entity.name}
                        </span>
                        <RelevanceBar value={entity.relevance} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-base-content/50">
                  Topics ({row.topics.length})
                </p>
                {row.topics.length === 0 ? (
                  <p className="text-sm text-base-content/50">
                    No topics extracted.
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {row.topics.map((topic, i) => (
                      <li
                        key={`${topic.topic}-${i}`}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className="badge badge-ghost badge-sm">
                          {Math.round(topic.confidence * 100)}%
                        </span>
                        <span className="text-base-content/80">
                          {topic.topic}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-base-300 bg-base-100 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wider text-base-content/50">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function computeSummary(rows: PageEntityRow[]) {
  const totalPages = rows.length;
  let totalEntities = 0;
  let totalTopics = 0;
  const typeCounts = new Map<string, number>();
  for (const row of rows) {
    totalEntities += row.entities.length;
    totalTopics += row.topics.length;
    for (const entity of row.entities) {
      typeCounts.set(entity.type, (typeCounts.get(entity.type) ?? 0) + 1);
    }
  }
  let topEntityType: string | null = null;
  let topCount = 0;
  for (const [type, count] of typeCounts) {
    if (count > topCount) {
      topCount = count;
      topEntityType = type;
    }
  }
  return { totalPages, totalEntities, totalTopics, topEntityType };
}
