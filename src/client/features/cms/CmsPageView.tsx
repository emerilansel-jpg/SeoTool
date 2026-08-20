import { Markdown } from "@/client/components/Markdown";

/** Shared public renderer for CMS pages (legal + custom /pages/{slug}). */
export function CmsPageView({
  title: pageTitle,
  contentMd,
  updatedAt,
}: {
  title: string;
  contentMd: string;
  updatedAt?: string | null;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 md:px-6 md:py-20">
      <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
        {pageTitle}
      </h1>
      {updatedAt ? (
        <p className="mt-2 text-xs text-base-content/50">
          Last updated{" "}
          {new Date(updatedAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      ) : null}
      <div className="mt-8">
        <Markdown>{contentMd}</Markdown>
      </div>
    </div>
  );
}
