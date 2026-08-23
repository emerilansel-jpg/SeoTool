import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { sortBy } from "remeda";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlySearch } from "@/types/keywords";
import { formatCompactNumber } from "../utils";
import { FloatingTooltip, useFloatingTooltip } from "./FloatingTooltip";

export type SortField =
  | "keyword"
  | "searchVolume"
  | "cpc"
  | "competition"
  | "keywordDifficulty";
export type SortDir = "asc" | "desc";

export function HeaderHelpLabel({
  label,
  helpText,
  delayMs = 150,
}: {
  label: string;
  helpText: string;
  delayMs?: number;
}) {
  const tooltip = useFloatingTooltip<HTMLSpanElement>({ delayMs });

  return (
    <span
      ref={tooltip.triggerRef}
      className="relative inline-flex items-center"
      onMouseEnter={tooltip.scheduleOpen}
      onMouseLeave={tooltip.close}
      onFocus={tooltip.scheduleOpen}
      onBlur={tooltip.close}
      onKeyDown={(e) => {
        if (e.key === "Escape") tooltip.close();
      }}
      aria-describedby={tooltip.isOpen ? tooltip.tooltipId : undefined}
    >
      <span>{label}</span>
      {tooltip.isOpen && typeof document !== "undefined"
        ? createPortal(
            <FloatingTooltip id={tooltip.tooltipId} position={tooltip.position}>
              {helpText}
            </FloatingTooltip>,
            document.body,
          )
        : null}
    </span>
  );
}

export function KeywordTrendSparkline({
  trend,
  width = 64,
  height = 20,
}: {
  trend?: MonthlySearch[];
  width?: number;
  height?: number;
}) {
  const gradientId = useId();
  const sorted = useMemo(() => {
    if (!trend || trend.length === 0) return [];
    return sortBy(trend, (item) => item.year * 100 + item.month).slice(-12);
  }, [trend]);

  if (sorted.length === 0) {
    return (
      <span className="inline-block w-14 text-center text-xs text-base-content/30">
        —
      </span>
    );
  }

  const volumes = sorted.map((d) => d.searchVolume ?? 0);
  const min = Math.min(...volumes);
  const max = Math.max(...volumes);
  const range = max - min;
  const lastVal = volumes[volumes.length - 1];

  const padX = 2;
  const padY = 2;
  const usableW = width - padX * 2;
  const usableH = height - padY * 2;

  const points = volumes.map((v, i) => {
    const x = padX + (i / Math.max(volumes.length - 1, 1)) * usableW;
    const y =
      range === 0 ? height / 2 : height - padY - ((v - min) / range) * usableH;
    return { x, y, v };
  });

  const pathD = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    const prev = arr[i - 1];
    const cpX = (prev.x + pt.x) / 2;
    return `${acc} C ${cpX.toFixed(1)} ${prev.y.toFixed(1)}, ${cpX.toFixed(1)} ${pt.y.toFixed(1)}, ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, "");

  const first = points[0];
  const last = points[points.length - 1];
  const areaD = `${pathD} L ${last.x.toFixed(1)} ${height} L ${first.x.toFixed(1)} ${height} Z`;

  const tooltipText = `12-mo: ${formatCompactNumber(min)} – ${formatCompactNumber(max)} (Latest: ${formatCompactNumber(lastVal)})`;

  return (
    <div
      className="inline-flex items-center shrink-0 cursor-default"
      title={tooltipText}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-hidden"
        aria-label={tooltipText}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-primary)"
              stopOpacity="0.3"
            />
            <stop
              offset="100%"
              stopColor="var(--color-primary)"
              stopOpacity="0.02"
            />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#${gradientId})`} />
        <path
          d={pathD}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={last.x} cy={last.y} r="1.5" fill="var(--color-primary)" />
      </svg>
    </div>
  );
}

export function AreaTrendChart({ trend }: { trend: MonthlySearch[] }) {
  const sorted = sortBy(trend, (item) => item.year * 100 + item.month);
  const last12 = sorted.slice(-12);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [chartWidth, setChartWidth] = useState(0);

  if (last12.length === 0) return null;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      setChartWidth(container.clientWidth);
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const data = last12.map((m) => ({
    month: monthLabels[m.month - 1],
    year: m.year,
    searchVolume: m.searchVolume,
    label: `${monthLabels[m.month - 1]} ${m.year}`,
  }));

  return (
    <div
      ref={containerRef}
      className="w-full h-[210px] min-w-0"
      aria-label="Search trend chart"
    >
      {chartWidth > 0 ? (
        <AreaChart
          width={chartWidth}
          height={210}
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
          accessibilityLayer
        >
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-primary)"
                stopOpacity="var(--trend-fill-start-opacity)"
              />
              <stop
                offset="100%"
                stopColor="var(--color-primary)"
                stopOpacity="var(--trend-fill-end-opacity)"
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="var(--trend-grid-color)"
            strokeDasharray="2 4"
            vertical={true}
            horizontal={true}
          />
          <XAxis
            dataKey="month"
            tick={{ fill: "var(--trend-axis-color)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(value: number | string) =>
              formatCompactNumber(Number(value))
            }
            tick={{ fill: "var(--trend-axis-color)", fontSize: 11 }}
            width={44}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--trend-tooltip-bg)",
              border: "1px solid var(--trend-tooltip-border)",
              borderRadius: "10px",
              boxShadow: "0 8px 24px var(--trend-tooltip-shadow)",
              color: "var(--color-base-content)",
            }}
          />
          <Area
            type="monotone"
            dataKey="searchVolume"
            name="Search volume"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#trendGrad)"
            isAnimationActive={false}
            dot={{ r: 3, fill: "var(--color-primary)", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "var(--color-primary)" }}
          />
        </AreaChart>
      ) : null}
    </div>
  );
}

export function SortHeader({
  label,
  helpText,
  field,
  current,
  dir,
  onToggle,
  className,
}: {
  label: string;
  helpText?: string;
  field: SortField;
  current: SortField;
  dir: SortDir;
  onToggle: (f: SortField) => void;
  className?: string;
}) {
  const isActive = field === current;
  const tooltip = useFloatingTooltip<HTMLButtonElement>({
    enabled: !!helpText,
  });

  return (
    <button
      ref={tooltip.triggerRef}
      className={`inline-flex items-center gap-0.5 hover:text-primary transition-colors cursor-pointer select-none ${className ?? ""}`}
      onClick={() => onToggle(field)}
      onMouseEnter={tooltip.scheduleOpen}
      onMouseLeave={tooltip.close}
      onFocus={tooltip.scheduleOpen}
      onBlur={tooltip.close}
      onKeyDown={(e) => {
        if (e.key === "Escape") tooltip.close();
      }}
      aria-describedby={
        tooltip.isOpen && helpText ? tooltip.tooltipId : undefined
      }
    >
      {label}
      {isActive &&
        (dir === "asc" ? (
          <ChevronUp className="size-3" />
        ) : (
          <ChevronDown className="size-3" />
        ))}
      {tooltip.isOpen && helpText && typeof document !== "undefined"
        ? createPortal(
            <FloatingTooltip id={tooltip.tooltipId} position={tooltip.position}>
              {helpText}
            </FloatingTooltip>,
            document.body,
          )
        : null}
    </button>
  );
}
