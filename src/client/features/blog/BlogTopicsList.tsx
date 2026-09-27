import { Tag } from "lucide-react";

interface Props {
  topics: string[];
}

export function BlogTopicsList({ topics }: Props) {
  if (!topics || topics.length === 0) return null;

  return (
    <div className="mt-10 border-t border-base-300/80 pt-6">
      <div className="flex items-center gap-2">
        <Tag className="size-3.5 text-base-content/40" />
        <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
          Topics in this article
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {topics.map((topic) => (
          <span
            key={topic}
            className="rounded-full border border-base-300 bg-base-200/60 px-3 py-1 text-xs font-medium text-base-content/80 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            {topic}
          </span>
        ))}
      </div>
    </div>
  );
}
