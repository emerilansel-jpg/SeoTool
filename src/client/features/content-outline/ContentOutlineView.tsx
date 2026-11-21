import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Download, ListTree } from "lucide-react";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import { buildContentOutline } from "@/serverFunctions/growth-tools";
import type { CompetitorHeadingMap } from "@/server/features/content-outline/services/ContentOutlineService";

type OutlineResult = {
  keyword: string;
  serpTitles: string[];
  headingMaps: CompetitorHeadingMap[];
  outline: string;
};

export function ContentOutlineView({ projectId }: { projectId: string }) {
  const [keyword, setKeyword] = useState("");
  const [locationCode, setLocationCode] = useState("2840");
  const [languageCode, setLanguageCode] = useState("en");

  const mutation = useMutation({
    mutationFn: () =>
      buildContentOutline({
        data: {
          projectId,
          keyword: keyword.trim(),
          locationCode: Number(locationCode) || 2840,
          languageCode: languageCode.trim() || "en",
        },
      }),
    onSuccess: () => toast.success("Outline ready."),
    onError: (error) =>
      toast.error(getStandardErrorMessage(error, "Failed to build outline")),
  });

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-base-300 bg-base-100 p-6">
        <div className="flex items-center gap-2">
          <ListTree className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">
            Build an outline from the SERP
          </h2>
        </div>
        <p className="mt-1 text-sm text-base-content/60">
          Scrapes the top-ranking pages for the keyword, maps their heading
          structure, and drafts an AI outline. Uses 1 SERP call + page scrapes +
          1 LLM call.
        </p>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            if (keyword.trim()) mutation.mutate();
          }}
        >
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Target keyword, e.g. plumber in austin"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <input
            type="text"
            className="input input-bordered w-28"
            title="Location code"
            value={locationCode}
            onChange={(event) => setLocationCode(event.target.value)}
          />
          <input
            type="text"
            className="input input-bordered w-24"
            title="Language code"
            value={languageCode}
            onChange={(event) => setLanguageCode(event.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={mutation.isPending || !keyword.trim()}
          >
            {mutation.isPending ? (
              <span className="loading loading-spinner loading-sm" />
            ) : null}
            Build outline
          </button>
        </form>
      </div>

      {mutation.data ? <OutlineResultView result={mutation.data} /> : null}
    </div>
  );
}

function OutlineResultView({ result }: { result: OutlineResult }) {
  const fetched = result.headingMaps.filter((map) => map.fetchOk);

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(result.outline);
    toast.success("Outline copied as markdown.");
  };

  const downloadDoc = () => {
    const html = renderOutlineHtml(result.outline);
    const blob = new Blob(
      [
        `<html><head><meta charset="utf-8"><title>${result.keyword} outline</title></head><body>${html}</body></html>`,
      ],
      { type: "application/msword" },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `outline-${result.keyword.replace(/\s+/g, "-").toLowerCase()}.doc`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded outline .doc (opens in Word/Google Docs).");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-base-300 bg-base-100 p-6">
        <h2 className="text-base font-semibold">Top-ranking pages</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          {result.serpTitles.map((title, index) => (
            <li key={`${title}-${index}`}>{title}</li>
          ))}
        </ol>
      </div>

      <div className="rounded-lg border border-base-300 bg-base-100 p-6">
        <h2 className="text-base font-semibold">
          Competitor heading map ({fetched.length} pages fetched)
        </h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {result.headingMaps.map((map) => (
            <div
              key={map.url}
              className="rounded-lg border border-base-300 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <a
                  className="link link-primary truncate text-xs"
                  href={map.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {map.url}
                </a>
                {map.fetchOk ? null : (
                  <span className="badge badge-ghost badge-sm">
                    not fetched
                  </span>
                )}
              </div>
              <ul className="mt-2 space-y-1 text-sm">
                {map.h2s.map((h2, index) => (
                  <li key={`h2-${index}`} className="font-medium">
                    {h2}
                    {map.h3s.length > 0 ? (
                      <ul className="mt-1 space-y-0.5 pl-4 text-xs font-normal text-base-content/60">
                        {map.h3s.slice(0, 8).map((h3, h3Index) => (
                          <li key={`h3-${index}-${h3Index}`}>{h3}</li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
                {map.h2s.length === 0 ? (
                  <li className="text-base-content/50">
                    No headings captured.
                  </li>
                ) : null}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-base-300 bg-base-100 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">AI outline</h2>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline gap-2"
              onClick={() => void copyMarkdown()}
            >
              <Copy className="size-4" /> Copy markdown
            </button>
            <button
              type="button"
              className="btn btn-sm btn-primary gap-2"
              onClick={downloadDoc}
            >
              <Download className="size-4" /> Download .doc
            </button>
          </div>
        </div>
        <OutlineMarkdown text={result.outline} />
      </div>
    </div>
  );
}

/** Minimal markdown-heading renderer: ## -> h3, ### -> h4, others as text. */
function OutlineMarkdown({ text }: { text: string }) {
  const blocks = useMemo(() => text.split("\n"), [text]);
  return (
    <div className="mt-3 space-y-1">
      {blocks.map((line, index) => {
        if (line.startsWith("### ")) {
          return (
            <h4 key={index} className="mt-2 font-medium">
              {line.slice(4)}
            </h4>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h3 key={index} className="mt-3 text-base font-semibold">
              {line.slice(3)}
            </h3>
          );
        }
        if (line.startsWith("# ")) {
          return (
            <h2 key={index} className="mt-3 text-lg font-bold">
              {line.slice(2)}
            </h2>
          );
        }
        if (!line.trim()) return <div key={index} className="h-1" />;
        return (
          <p key={index} className="text-sm text-base-content/70">
            {line}
          </p>
        );
      })}
    </div>
  );
}

function renderOutlineHtml(outline: string): string {
  return outline
    .split("\n")
    .map((line) => {
      const escaped = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      if (escaped.startsWith("### ")) return `<h3>${escaped.slice(4)}</h3>`;
      if (escaped.startsWith("## ")) return `<h2>${escaped.slice(3)}</h2>`;
      if (escaped.startsWith("# ")) return `<h1>${escaped.slice(2)}</h1>`;
      if (!escaped.trim()) return "";
      return `<p>${escaped}</p>`;
    })
    .join("\n");
}
