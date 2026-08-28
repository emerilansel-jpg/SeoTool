import { Link } from "@tanstack/react-router";

export function KeywordResearchViewTabs({
  projectId,
  active,
}: {
  projectId: string;
  active: "discover" | "pro";
}) {
  return (
    <div
      role="tablist"
      aria-label="Keyword research mode"
      className="tabs tabs-box w-fit"
    >
      <Link
        role="tab"
        to="/p/$projectId/keywords"
        params={{ projectId }}
        search={{}}
        className={`tab ${active === "discover" ? "tab-active" : ""}`}
      >
        Discover
      </Link>
      <Link
        role="tab"
        to="/p/$projectId/keywords"
        params={{ projectId }}
        search={{ view: "pro" }}
        className={`tab ${active === "pro" ? "tab-active" : ""}`}
      >
        Pro Analysis
      </Link>
    </div>
  );
}
