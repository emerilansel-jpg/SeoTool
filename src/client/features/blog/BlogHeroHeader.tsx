import { Link } from "@tanstack/react-router";
import { Calendar, Clock, ChevronRight } from "lucide-react";

interface Props {
  title: string;
  description?: string | null;
  category: string;
  publishedAt?: string | null;
  readTimeMinutes: number;
  featuredImage?: string | null;
}

export function BlogHeroHeader({
  title,
  description,
  category,
  publishedAt,
  readTimeMinutes,
  featuredImage,
}: Props) {
  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <section className="border-b border-base-300/80 bg-base-200/50 py-10 md:py-14">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb kicker */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-base-content/60"
        >
          <Link to="/blogs" className="transition-colors hover:text-primary">
            Blogs
          </Link>
          <ChevronRight className="size-3 text-base-content/40" />
          <span className="text-primary">{category}</span>
        </nav>

        {/* Headline H1 */}
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-base-content sm:text-4xl lg:text-[42px] lg:leading-[1.18]">
          {title}
        </h1>

        {/* Subtitle / Deck */}
        {description ? (
          <p className="mt-4 max-w-4xl text-lg font-normal leading-relaxed text-base-content/75 sm:text-xl">
            {description}
          </p>
        ) : null}

        {/* Metadata bar */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-base-content/60 sm:text-sm">
          {formattedDate ? (
            <div className="flex items-center gap-1.5">
              <Calendar className="size-4 text-base-content/40" />
              <span>Published: {formattedDate}</span>
            </div>
          ) : null}
          <div className="flex items-center gap-1.5">
            <Clock className="size-4 text-base-content/40" />
            <span>Read Time: {readTimeMinutes} min read</span>
          </div>
        </div>

        {/* Featured Image if present */}
        {featuredImage ? (
          <div className="mt-8 overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-md max-w-4xl">
            <img
              src={featuredImage}
              alt={title}
              className="max-h-[480px] w-full object-cover"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
