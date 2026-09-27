import type { AuthorInfo } from "./blogMetadata";

interface Props {
  author: AuthorInfo;
}

export function BlogAuthorBio({ author }: Props) {
  return (
    <section className="mt-12 rounded-2xl border border-base-300 bg-base-100 p-6 sm:p-8 shadow-sm">
      <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50">
        About the Author
      </h3>

      <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start">
        {author.avatarUrl ? (
          <img
            src={author.avatarUrl}
            alt={author.name}
            className="size-16 shrink-0 rounded-full border border-base-300 object-cover sm:size-20"
          />
        ) : (
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xl font-bold text-primary sm:size-20">
            {author.initials}
          </div>
        )}

        <div className="space-y-2">
          <div>
            <h4 className="text-lg font-bold text-base-content">
              {author.name}
            </h4>
            <p className="text-xs font-medium text-base-content/60">
              {author.role}
            </p>
          </div>

          <p className="text-sm leading-relaxed text-base-content/80">
            {author.bio}
          </p>

          <div className="flex items-center gap-3 pt-1 text-xs">
            {author.twitter ? (
              <a
                href={author.twitter}
                target="_blank"
                rel="noreferrer noopener"
                className="font-medium text-primary hover:underline"
              >
                Follow on X
              </a>
            ) : null}
            {author.linkedin ? (
              <a
                href={author.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                className="font-medium text-primary hover:underline"
              >
                LinkedIn Profile
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
