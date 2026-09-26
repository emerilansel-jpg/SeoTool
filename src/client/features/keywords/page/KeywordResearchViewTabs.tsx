import { Link } from "@tanstack/react-router";
import { Search, Sparkles } from "lucide-react";

export function KeywordResearchViewTabs({
  projectId,
  active,
}: {
  projectId: string;
  active: "discover" | "pro";
}) {
  return (
    <div className="border-b border-base-300/80 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar">
      <div className="flex flex-nowrap gap-1 -mb-px min-w-max pb-0.5">
        <Link
          to="/p/$projectId/keywords"
          params={{ projectId }}
          search={{ view: "discover" }}
          className={`inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 whitespace-nowrap ${
            active === "discover"
              ? "border-primary text-primary bg-primary/[0.04] rounded-t-lg"
              : "border-transparent text-base-content/60 hover:text-base-content hover:border-base-300"
          }`}
        >
          <Search className="size-3.5" />
          <span>Discover</span>
        </Link>
        <Link
          to="/p/$projectId/keywords"
          params={{ projectId }}
          search={{ view: "pro" }}
          className={`inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all shrink-0 whitespace-nowrap ${
            active === "pro"
              ? "border-primary text-primary bg-primary/[0.04] rounded-t-lg"
              : "border-transparent text-base-content/60 hover:text-base-content hover:border-base-300"
          }`}
        >
          <Sparkles className="size-3.5" />
          <span>Pro Analysis</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
              active === "pro"
                ? "bg-primary/15 text-primary"
                : "bg-base-200 text-base-content/60"
            }`}
          >
            KGR
          </span>
        </Link>
      </div>
    </div>
  );
}
