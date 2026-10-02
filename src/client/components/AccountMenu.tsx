import { Link } from "@tanstack/react-router";
import { CreditCard, LogOut, Settings, User } from "lucide-react";
import { ThemePreferenceMenuItems } from "@/client/components/ThemePreferenceMenuItems";
import { signOutAndRedirect, useSession } from "@/lib/auth-client";

export function AccountMenu({ className }: { className?: string }) {
  const { data: session } = useSession();
  const email = session?.user?.email;

  if (!email) return null;

  return (
    <div className={`dropdown dropdown-end ${className ?? ""}`}>
      <button
        type="button"
        className="btn btn-ghost btn-sm px-2"
        aria-label="Account menu"
        title={email}
      >
        <User className="size-4" />
      </button>
      <ul className="menu dropdown-content z-50 mt-2 w-52 rounded-box border border-base-300 bg-base-100 p-2 shadow-md">
        <li className="menu-title truncate px-4 py-2 text-xs">{email}</li>
        <li>
          <Link to="/billing">
            <CreditCard className="size-4" />
            Billing
          </Link>
        </li>
        <li>
          <Link to="/settings">
            <Settings className="size-4" />
            Settings
          </Link>
        </li>
        <ThemePreferenceMenuItems />
        <li aria-hidden className="pointer-events-none my-1 h-px bg-base-300 p-0" />
        <li>
          <button
            type="button"
            className="text-error flex items-center gap-2"
            onClick={() => signOutAndRedirect()}
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </li>
      </ul>
    </div>
  );
}
