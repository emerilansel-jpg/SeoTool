import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

/**
 * Landing page for team-invitation links. The `_authenticated` layout bounces
 * unauthenticated visitors to sign-in first (preserving this URL as the
 * post-sign-in redirect), so by the time this component renders the user is
 * signed in. We then accept the invitation client-side and route into the app.
 *
 * Better Auth only lets a user accept an invitation whose email matches their
 * account, so this is safe to attempt automatically.
 */
type Search = { id: string };

export const Route = createFileRoute("/_authenticated/accept-invitation")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    id: typeof search.id === "string" ? search.id : "",
  }),
  component: AcceptInvitationPage,
});

type AcceptStatus = "loading" | "success" | "error";

function AcceptInvitationPage() {
  const { id }: Search = Route.useSearch();
  const navigate = useNavigate();
  const [status, setStatus] = useState<AcceptStatus>("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!id) {
      setStatus("error");
      setMessage("This invitation link is incomplete.");
      return;
    }

    let active = true;
    void (async () => {
      try {
        const { error } = await authClient.organization.acceptInvitation({
          invitationId: id,
        });
        if (!active) return;

        if (error) {
          setStatus("error");
          setMessage(
            error.message ??
              "We couldn't accept this invitation. It may have expired or already been used.",
          );
          return;
        }

        setStatus("success");
        // Brief confirmation, then enter the workspace.
        setTimeout(() => {
          if (active) void navigate({ to: "/", replace: true });
        }, 1500);
      } catch (err) {
        if (!active) return;
        setStatus("error");
        setMessage(
          err instanceof Error ? err.message : "Something went wrong.",
        );
      }
    })();

    return () => {
      active = false;
    };
  }, [id, navigate]);

  return (
    <div className="w-full max-w-sm space-y-4 text-center">
      <img
        src="/transparent-logo.png"
        alt="SeoTool.im"
        className="mx-auto size-10 rounded-lg"
      />

      {status === "loading" ? (
        <>
          <h1 className="text-xl font-semibold">
            Accepting your invitation&hellip;
          </h1>
          <span className="loading loading-spinner loading-md" />
        </>
      ) : null}

      {status === "success" ? (
        <>
          <CheckCircle2 className="mx-auto size-10 text-success" />
          <h1 className="text-xl font-semibold">You're in!</h1>
          <p className="text-sm text-base-content/60">
            Taking you to your dashboard&hellip;
          </p>
        </>
      ) : null}

      {status === "error" ? (
        <>
          <AlertCircle className="mx-auto size-10 text-error" />
          <h1 className="text-xl font-semibold">Invitation problem</h1>
          <p className="text-sm text-base-content/60">{message}</p>
          <Link to="/" className="btn btn-soft btn-sm mt-2">
            Go to dashboard
          </Link>
        </>
      ) : null}
    </div>
  );
}
