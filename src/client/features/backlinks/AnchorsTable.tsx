import { createColumnHelper } from "@tanstack/react-table";
import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import {
  AppDataTable,
  useAppTable,
} from "@/client/components/table/AppDataTable";
import { SortableHeader } from "@/client/components/table/SortableHeader";
import { EmptyTableState } from "./BacklinksPageEmptyTableState";
import type { AnchorRow } from "./backlinksPageTypes";
import type { AnchorsSortField } from "@/types/schemas/backlinks";
import {
  formatCompactDate,
  formatDecimal,
  formatNumber,
} from "./backlinksPageUtils";

const columnHelper = createColumnHelper<AnchorRow>();

const columns = [
  columnHelper.accessor("anchor", {
    id: "anchor" satisfies AnchorsSortField,
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label="Anchor Text"
        helpText="The clickable text used in the backlink."
      />
    ),
    cell: ({ getValue }) => {
      const anchor = getValue();
      if (!anchor) return "-";
      return (
        <span className="font-medium break-all max-w-xs inline-block">
          {anchor}
        </span>
      );
    },
  }),
  columnHelper.accessor("backlinks", {
    id: "backlinks" satisfies AnchorsSortField,
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label="Backlinks"
        helpText="Total backlinks using this anchor text."
      />
    ),
    cell: ({ getValue }) => formatNumber(getValue()),
    sortDescFirst: true,
  }),
  columnHelper.accessor("referringDomains", {
    id: "referringDomains" satisfies AnchorsSortField,
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label="Referring Domains"
        helpText="Unique domains using this anchor text."
      />
    ),
    cell: ({ getValue }) => formatNumber(getValue()),
    sortDescFirst: true,
  }),
  columnHelper.accessor("rank", {
    id: "rank" satisfies AnchorsSortField,
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label="Rank"
        helpText="Authority passed through links with this anchor."
      />
    ),
    cell: ({ getValue }) => formatNumber(getValue()),
    sortDescFirst: true,
  }),
  columnHelper.accessor("spamScore", {
    id: "spamScore" satisfies AnchorsSortField,
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label="Spam"
        helpText="Average spam score of backlinks with this anchor."
      />
    ),
    cell: ({ getValue }) => {
      const score = getValue();
      if (score == null) return "-";
      const colorClass =
        score >= 70
          ? "text-error"
          : score >= 40
            ? "text-warning"
            : "text-success";
      return <span className={colorClass}>{formatDecimal(score)}</span>;
    },
    sortDescFirst: true,
  }),
  columnHelper.accessor("firstSeen", {
    id: "firstSeen" satisfies AnchorsSortField,
    header: ({ column }) => (
      <SortableHeader
        column={column}
        label="First Seen"
        helpText="When a backlink with this anchor was first discovered."
      />
    ),
    cell: ({ getValue }) => formatCompactDate(getValue()),
    sortDescFirst: true,
  }),
];

export function AnchorsTable({
  rows,
  sorting,
  onSortingChange,
}: {
  rows: AnchorRow[];
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
}) {
  const table = useAppTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange,
    manualSorting: true,
  });

  if (rows.length === 0) {
    return (
      <EmptyTableState label="No anchor data available for this target." />
    );
  }

  return (
    <AppDataTable
      table={table}
      getCellClassName={(_, columnId) =>
        columnId === "anchor" ? "font-medium break-all" : undefined
      }
    />
  );
}
