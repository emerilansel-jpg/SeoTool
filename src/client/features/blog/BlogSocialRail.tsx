import { useState } from "react";
import { Link2, Check, List } from "lucide-react";
import { toast } from "sonner";
import type { AuthorInfo, HeadingItem } from "./blogMetadata";

interface Props {
  author: AuthorInfo;
  url: string;
  title: string;
  headings?: HeadingItem[];
}

export function BlogSocialRail({
  author,
  url,
  title,
  headings = [],
}: Props) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <>
      {/* Desktop Sticky Rail */}
      <aside className="sticky top-24 hidden w-56 shrink-0 flex-col space-y-6 lg:flex xl:w-64">
        {/* Author Byline */}
        <div className="space-y-2.5 border-b border-base-300/80 pb-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/50">
            Written by
          </span>
          <div className="flex items-center gap-3">
            {author.avatarUrl ? (
              <img
                src={author.avatarUrl}
                alt={author.name}
                className="size-11 rounded-full border border-base-300 object-cover"
              />
            ) : (
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-sm font-bold text-primary">
                {author.initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-base-content">
                {author.name}
              </p>
              <p className="truncate text-xs text-base-content/60">
                {author.role}
              </p>
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="space-y-2.5 border-b border-base-300/80 pb-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/50">
            Share
          </span>
          <div className="flex items-center gap-2">
            {/* X / Twitter */}
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Share on X"
              className="flex size-8 items-center justify-center rounded-full border border-base-300 bg-base-100 text-base-content/70 transition-all hover:border-base-content hover:bg-base-200 hover:text-base-content"
            >
              <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href={shareLinks.linkedin}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Share on LinkedIn"
              className="flex size-8 items-center justify-center rounded-full border border-base-300 bg-base-100 text-base-content/70 transition-all hover:border-[#0a66c2] hover:bg-[#0a66c2]/10 hover:text-[#0a66c2]"
            >
              <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.62 1.62 0 1 0 0-3.24 1.62 1.62 0 0 0 0 3.24m1.4 9.74V9.89H5.06v8.61h2.8z" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href={shareLinks.facebook}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Share on Facebook"
              className="flex size-8 items-center justify-center rounded-full border border-base-300 bg-base-100 text-base-content/70 transition-all hover:border-[#1877f2] hover:bg-[#1877f2]/10 hover:text-[#1877f2]"
            >
              <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7v-3h3V9.5C10 6.46 11.82 5 14.5 5c1.28 0 2.62.23 2.62.23v2.88h-1.48c-1.5 0-1.97.93-1.97 1.89V12h3.25l-.52 3H13.67v6.8c4.56-.93 8-4.96 8-9.8z" />
              </svg>
            </a>

            {/* Copy Link */}
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy article link"
              className="flex size-8 items-center justify-center rounded-full border border-base-300 bg-base-100 text-base-content/70 transition-all hover:border-primary hover:bg-primary/10 hover:text-primary"
            >
              {copied ? (
                <Check className="size-3.5 text-success" />
              ) : (
                <Link2 className="size-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Widget: Table of Contents */}
        {headings.length > 0 ? (
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2 border-b border-base-300/80 pb-2">
              <List className="size-3.5 text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/70">
                Table of Contents
              </span>
            </div>
            <nav className="max-h-[calc(100vh-22rem)] overflow-y-auto space-y-1 pr-1 text-xs">
              {headings.map((heading) => (
                <a
                  key={heading.id}
                  href={`#${heading.id}`}
                  className={`block rounded-md px-2 py-1 leading-snug transition-colors hover:bg-base-200 hover:text-primary ${
                    heading.level === 3
                      ? "ml-2.5 text-[11px] text-base-content/60"
                      : "font-medium text-base-content/80"
                  }`}
                >
                  {heading.text}
                </a>
              ))}
            </nav>
          </div>
        ) : null}
      </aside>

      {/* Mobile Horizontal Bar */}
      <div className="space-y-4 lg:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-base-300/80 pb-4">
          <div className="flex items-center gap-3">
            {author.avatarUrl ? (
              <img
                src={author.avatarUrl}
                alt={author.name}
                className="size-10 rounded-full border border-base-300 object-cover"
              />
            ) : (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xs font-bold text-primary">
                {author.initials}
              </div>
            )}
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-base-content/50">
                Written by
              </span>
              <span className="text-sm font-bold text-base-content">
                {author.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Share on X"
              className="flex size-8 items-center justify-center rounded-full border border-base-300 bg-base-100 text-base-content/70"
            >
              <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href={shareLinks.linkedin}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Share on LinkedIn"
              className="flex size-8 items-center justify-center rounded-full border border-base-300 bg-base-100 text-base-content/70"
            >
              <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.62 1.62 0 1 0 0-3.24 1.62 1.62 0 0 0 0 3.24m1.4 9.74V9.89H5.06v8.61h2.8z" />
              </svg>
            </a>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy link"
              className="flex size-8 items-center justify-center rounded-full border border-base-300 bg-base-100 text-base-content/70"
            >
              {copied ? (
                <Check className="size-3.5 text-success" />
              ) : (
                <Link2 className="size-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Collapsible TOC */}
        {headings.length > 0 ? (
          <details className="group rounded-xl border border-base-300 bg-base-100 p-3">
            <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-bold uppercase tracking-wider text-base-content/70">
              <div className="flex items-center gap-2">
                <List className="size-3.5 text-primary" />
                <span>Table of Contents</span>
              </div>
              <span className="text-base-content/40 transition-transform group-open:rotate-180 text-[10px]">
                ▼
              </span>
            </summary>
            <nav className="mt-2.5 space-y-1 border-t border-base-200 pt-2 text-xs">
              {headings.map((heading) => (
                <a
                  key={heading.id}
                  href={`#${heading.id}`}
                  className={`block rounded px-2 py-1 transition-colors hover:text-primary ${
                    heading.level === 3
                      ? "ml-2 text-[11px] text-base-content/60"
                      : "font-medium text-base-content/80"
                  }`}
                >
                  {heading.text}
                </a>
              ))}
            </nav>
          </details>
        ) : null}
      </div>
    </>
  );
}
