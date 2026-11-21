import { useState, type FormEvent } from "react";
import { Bug, Lightbulb, Loader2, X } from "lucide-react";
import { z } from "zod";
import { APP_VERSION } from "@/shared/appVersion";

const feedbackResponseSchema = z.object({
  displayNumber: z.number().nullable().optional(),
  email: z.string().optional(),
  error: z.string().optional(),
});

type FeedbackType = "bug" | "feature";

const PLACEHOLDERS: Record<
  FeedbackType,
  { title: string; description: string }
> = {
  bug: {
    title: "e.g. The audit button does nothing",
    description:
      "What happened? What did you expect to happen? (Any error message helps.)",
  },
  feature: {
    title: "e.g. Export rankings to Excel",
    description: "What would you like to be able to do?",
  },
};

export function FeedbackFloatingButton({
  userEmail,
}: {
  /** Signed-in user's email; empty string for anonymous visitors. */
  userEmail?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Report a Bug / Request a Feature"
        className="fixed bottom-4 right-4 z-[900] flex items-center gap-2 rounded-full border border-primary/40 bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95"
      >
        <Bug className="size-4 shrink-0" />
        <span className="hidden sm:inline">
          Report a Bug / Request a Feature
        </span>
        <span className="sm:hidden">Feedback</span>
      </button>

      {open ? (
        <FeedbackModal userEmail={userEmail} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}

function FeedbackModal({
  userEmail,
  onClose,
}: {
  userEmail?: string;
  onClose: () => void;
}) {
  const [type, setType] = useState<FeedbackType | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState(userEmail ?? "");
  const [screenshot, setScreenshot] = useState<{
    base64: string;
    name: string;
    preview: string;
  } | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    displayNumber: number;
    email: string;
  } | null>(null);

  function onScreenshotChange(file: File | undefined) {
    setError(null);
    if (!file) {
      setScreenshot(null);
      return;
    }
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Screenshots must be a JPG or PNG image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("That image is over 5 MB. Please attach a smaller screenshot.");
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      setScreenshot({
        base64: dataUrl.split(",")[1] ?? "",
        name: file.name,
        preview: dataUrl,
      });
    });
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!type || sending) return;
    setSending(true);
    setError(null);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: title.trim(),
          description: description.trim(),
          email: email.trim(),
          screenshotBase64: screenshot?.base64,
          screenshotMime: screenshot ? "image/png" : undefined,
          pageUrl:
            typeof window !== "undefined"
              ? `${window.location.pathname}${window.location.search}`
              : undefined,
          userAgent:
            typeof navigator !== "undefined" ? navigator.userAgent : undefined,
          appVersion: APP_VERSION,
        }),
      });
      const parsed = feedbackResponseSchema.safeParse(await response.json());
      const body = parsed.success
        ? parsed.data
        : { displayNumber: null, email: null, error: null };
      if (!response.ok || typeof body.displayNumber !== "number") {
        setError(body.error ?? "Could not send the report. Please try again.");
        return;
      }
      setSuccess({
        displayNumber: body.displayNumber,
        email: body.email ?? email,
      });
    } catch {
      setError("Network problem. Check your connection and try sending again.");
    } finally {
      setSending(false);
    }
  }

  const canSubmit =
    type !== null &&
    title.trim().length >= 5 &&
    description.trim().length >= 10 &&
    /.+@.+\..+/.test(email.trim());

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Send feedback"
        className="w-full max-w-lg rounded-t-2xl border border-base-300 bg-base-100 p-5 shadow-2xl sm:rounded-2xl"
      >
        {success ? (
          <div className="space-y-4 py-6 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/15 text-3xl">
              🎉
            </div>
            <h3 className="text-lg font-bold">Thanks! We got your report</h3>
            <p className="text-sm text-base-content/70">
              We got your report{" "}
              <strong className="font-mono">#{success.displayNumber}</strong>.{" "}
              We'll email you at <strong>{success.email}</strong> when it's
              fixed.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-base font-bold">Send feedback</h3>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost btn-xs btn-circle"
                aria-label="Close feedback form"
              >
                <X className="size-4" />
              </button>
            </div>

            {type === null ? (
              <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setType("bug")}
                  className="flex flex-col items-center gap-2 rounded-xl border-2 border-base-300 p-5 transition-colors hover:border-error/50 hover:bg-error/5"
                >
                  <Bug className="size-6 text-error" />
                  <span className="font-semibold">🐞 Report a Bug</span>
                  <span className="text-xs text-base-content/60">
                    Something is broken or confusing
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setType("feature")}
                  className="flex flex-col items-center gap-2 rounded-xl border-2 border-base-300 p-5 transition-colors hover:border-primary/50 hover:bg-primary/5"
                >
                  <Lightbulb className="size-6 text-primary" />
                  <span className="font-semibold">💡 Request a Feature</span>
                  <span className="text-xs text-base-content/60">
                    Tell us what would help you
                  </span>
                </button>
              </div>
            ) : (
              <form
                className="space-y-3 pt-2"
                onSubmit={(event) => void handleSubmit(event)}
              >
                <button
                  type="button"
                  className="text-xs text-base-content/50 underline underline-offset-2"
                  onClick={() => setType(null)}
                >
                  ← Change type
                </button>

                <div>
                  <label
                    htmlFor="feedback-title"
                    className="mb-1 block text-xs font-semibold"
                  >
                    Short title <span className="text-error">*</span>
                  </label>
                  <input
                    id="feedback-title"
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder={PLACEHOLDERS[type].title}
                    className="input input-bordered input-sm w-full"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="feedback-description"
                    className="mb-1 block text-xs font-semibold"
                  >
                    Description <span className="text-error">*</span>
                  </label>
                  <textarea
                    id="feedback-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder={PLACEHOLDERS[type].description}
                    rows={4}
                    className="textarea textarea-bordered w-full text-sm"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="feedback-email"
                    className="mb-1 block text-xs font-semibold"
                  >
                    Your email <span className="text-error">*</span>
                  </label>
                  <input
                    id="feedback-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@email.com"
                    className="input input-bordered input-sm w-full"
                    required
                  />
                  <p className="mt-1 text-[11px] text-base-content/50">
                    We'll email you when this is fixed.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="feedback-screenshot"
                    className="mb-1 block text-xs font-semibold"
                  >
                    Screenshot (optional, JPG/PNG, max 5 MB)
                  </label>
                  <input
                    id="feedback-screenshot"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(event) =>
                      onScreenshotChange(event.target.files?.[0])
                    }
                    className="file-input file-input-bordered file-input-sm w-full"
                  />
                  {screenshot ? (
                    <div className="mt-2 flex items-center gap-2">
                      <img
                        src={screenshot.preview}
                        alt="Screenshot preview"
                        className="size-14 rounded border border-base-300 object-cover"
                      />
                      <span className="truncate text-xs text-base-content/60">
                        {screenshot.name}
                      </span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => setScreenshot(null)}
                        aria-label="Remove screenshot"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ) : null}
                </div>

                {error ? (
                  <p role="alert" className="text-sm text-error">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  className="btn btn-primary w-full font-semibold"
                  disabled={!canSubmit || sending}
                >
                  {sending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Feedback"
                  )}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
