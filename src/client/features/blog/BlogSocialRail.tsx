import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { toast } from "sonner";
import type { AuthorInfo } from "./blogMetadata";

interface Props {
  author: AuthorInfo;
  url: string;
  title: string;
}

export function BlogSocialRail({ author, url, title }: Props) {
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
      <aside className="sticky top-24 hidden w-48 shrink-0 flex-col space-y-8 lg:flex xl:w-56">
        {/* Author Byline */}
        <div className="space-y-3 border-b border-base-300/80 pb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/50">
            Written by
          </span>
          <div className="flex items-center gap-3">
            {author.avatarUrl ? (
              <img
                src={author.avatarUrl}
                alt={author.name}
                className="size-12 rounded-full border border-base-300 object-cover"
              />
            ) : (
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-sm font-bold text-primary">
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
        <div className="space-y-3">
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
              className="flex size-9 items-center justify-center rounded-full border border-base-300 bg-base-100 text-base-content/70 transition-all hover:border-base-content hover:bg-base-200 hover:text-base-content"
            >
              <svg className="size-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href={shareLinks.linkedin}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Share on LinkedIn"
              className="flex size-9 items-center justify-center rounded-full border border-base-300 bg-base-100 text-base-content/70 transition-all hover:border-[#0a66c2] hover:bg-[#0a66c2]/10 hover:text-[#0a66c2]"
            >
              <svg className="size-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.62 1.62 0 1 0 0-3.24 1.62 1.62 0 0 0 0 3.24m1.4 9.74V9.89H5.06v8.61h2.8z" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href={shareLinks.facebook}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Share on Facebook"
              className="flex size-9 items-center justify-center rounded-full border border-base-300 bg-base-100 text-base-content/70 transition-all hover:border-[#1877f2] hover:bg-[#1877f2]/10 hover:text-[#1877f2]"
            >
              <svg className="size-4 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7v-3h3V9.5C10 6.46 11.82 5 14.5 5c1.28 0 2.62.23 2.62.23v2.88h-1.48c-1.5 0-1.97.93-1.97 1.89V12h3.25l-.52 3H13.67v6.8c4.56-.93 8-4.96 8-9.8z" />
              </svg>
            </a>

            {/* Copy Link */}
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy article link"
              className="flex size-9 items-center justify-center rounded-full border border-base-300 bg-base-100 text-base-content/70 transition-all hover:border-primary hover:bg-primary/10 hover:text-primary"
            >
              {copied ? (
                <Check className="size-4 text-success" />
              ) : (
                <Link2 className="size-4" />
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Horizontal Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-base-300/80 pb-6 lg:hidden">
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
    </>
  );
}
