import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Modal } from "@/client/components/Modal";
import {
  CHANGELOG,
  LATEST_CHANGELOG_VERSION,
  unseenVersionKey,
  type ChangelogItem,
} from "@/shared/changelog";

const ITEM_BADGES: Record<
  ChangelogItem["type"],
  { label: string; className: string }
> = {
  new: { label: "✨ New", className: "badge-success" },
  improved: { label: "🔧 Improved", className: "badge-info" },
  fixed: { label: "🐞 Fixed", className: "badge-warning" },
};

function markSeen() {
  try {
    localStorage.setItem(unseenVersionKey(), LATEST_CHANGELOG_VERSION);
  } catch {
    // Private mode: the badge simply reappears next visit.
  }
}

export function useHasUnseenReleaseNotes() {
  const [unseen, setUnseen] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(unseenVersionKey());
      setUnseen(seen !== LATEST_CHANGELOG_VERSION);
    } catch {
      setUnseen(false);
    }
  }, []);

  return { unseen, markSeen };
}

/** "What's New" release notes, opened from the sidebar version button. */
export function WhatsNewModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    markSeen();
  }, []);

  return (
    <Modal maxWidth="max-w-lg" onClose={onClose} labelledBy="whats-new-title">
      <div className="flex items-center justify-between pb-3 border-b border-base-200">
        <h3
          id="whats-new-title"
          className="flex items-center gap-2 text-lg font-bold"
        >
          <Sparkles className="size-5 text-primary" /> What's New
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost btn-xs btn-circle"
          aria-label="Close release notes"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto space-y-6 pt-4">
        {CHANGELOG.map((entry) => (
          <div key={entry.version}>
            <div className="flex items-baseline gap-2">
              <span className="font-mono font-bold text-primary">
                v{entry.version}
              </span>
              <span className="text-xs text-base-content/50">
                {new Date(entry.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              {entry.version === LATEST_CHANGELOG_VERSION ? (
                <span className="badge badge-primary badge-xs">Latest</span>
              ) : null}
            </div>
            <ul className="mt-2 space-y-2">
              {entry.items.map((item) => (
                <li key={item.text} className="flex items-start gap-2 text-sm">
                  <span
                    className={`badge badge-xs shrink-0 mt-0.5 ${ITEM_BADGES[item.type].className}`}
                  >
                    {ITEM_BADGES[item.type].label}
                  </span>
                  <span className="text-base-content/80 leading-relaxed">
                    {item.text}
                    {item.reportedByUsers ? (
                      <span className="ml-1 text-xs text-base-content/50">
                        (reported by users)
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Modal>
  );
}
