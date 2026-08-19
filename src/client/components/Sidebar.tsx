import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import type { LinkOptions } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType } from "react";
import {
  CircleHelp,
  CreditCard,
  LayoutGrid,
  LogOut,
  MessageCircle,
  Settings,
  X,
} from "lucide-react";
import {
  connectNavGroup,
  getProjectNavGroups,
} from "@/client/navigation/items";
import { ProjectSwitcher } from "@/client/features/projects/ProjectSwitcher";
import { SamSidebarPanel } from "@/client/features/sam/SamSidebarPanel";
import { NotificationCenter } from "@/client/features/notifications/NotificationCenter";
import { ThemePreferenceMenuItems } from "@/client/components/ThemePreferenceMenuItems";
import { closeDropdown } from "@/client/lib/dropdown";
import { signOutAndRedirect, useSession } from "@/lib/auth-client";
import { isHostedClientAuthMode } from "@/lib/auth-mode";
import { BILLING_ROUTE } from "@/shared/billing";

interface SidebarProps {
  projectId: string | null;
  onNavigate?: () => void;
  onClose?: () => void;
}

const navItemBaseClass =
  "relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-base-content/70 transition-all duration-150";

const navItemClass = `${navItemBaseClass} hover:bg-base-300/50 hover:text-base-content`;

const navItemActiveProps = {
  className:
    "bg-primary/10 hover:bg-primary/15 font-semibold text-primary shadow-sm",
};

function SidebarNavLink({
  icon: Icon,
  label,
  onNavigate,
  linkProps,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onNavigate?: () => void;
  linkProps: LinkOptions;
}) {
  return (
    <Link
      onClick={onNavigate}
      activeOptions={{ exact: false, includeSearch: false }}
      {...linkProps}
      className={navItemClass}
      activeProps={navItemActiveProps}
    >
      {({ isActive }: { isActive: boolean }) => (
        <>
          {isActive ? (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-primary" />
          ) : null}
          <Icon
            className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-base-content/60"}`}
          />
          <span className="truncate">{label}</span>
        </>
      )}
    </Link>
  );
}

export function Sidebar({ projectId, onNavigate, onClose }: SidebarProps) {
  const navGroups = [
    ...(projectId ? getProjectNavGroups(projectId) : []),
    connectNavGroup,
  ];
  const navigate = useNavigate();
  const location = useLocation();
  const onSamRoute = location.pathname.includes("/sam");

  // PostHog-style sidebar tabs: Browse shows the regular nav, Chat shows the
  // SAM chat history. The tab is view state (switching to Browse leaves the
  // conversation open in the content panel), but the route wins: landing on
  // /sam selects Chat, navigating anywhere else flips back to Browse.
  const [view, setView] = useState<"browse" | "chat">(
    onSamRoute ? "chat" : "browse",
  );
  useEffect(() => {
    setView(onSamRoute ? "chat" : "browse");
  }, [onSamRoute]);

  const openChat = () => {
    setView("chat");
    if (!projectId) return;
    if (!onSamRoute) {
      void navigate({
        to: "/p/$projectId/sam",
        params: { projectId },
        search: {},
      });
      onNavigate?.();
    }
  };

  // Coming back from Chat, land on the dashboard rather than leaving the
  // conversation filling the content panel next to a Browse nav.
  const openBrowse = () => {
    setView("browse");
    if (!projectId || !onSamRoute) return;
    void navigate({ to: "/p/$projectId", params: { projectId } });
    onNavigate?.();
  };

  return (
    <div className="flex h-full w-60 flex-col bg-base-200 border-r border-base-300/60">
      <div className="flex items-center justify-between px-3.5 pb-2 pt-3.5">
        <Link
          to="/"
          onClick={onNavigate}
          className="group flex items-center gap-2"
        >
          <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-indigo-600 to-cyan-400 text-xs font-black text-white shadow-sm shadow-primary/30 transition-transform group-hover:scale-105">
            S
          </div>
          <span className="text-base font-bold tracking-tight text-base-content">
            SeoTool<span className="text-primary font-black">.im</span>
          </span>
        </Link>
        <div className="flex items-center gap-0.5">
          <NotificationCenter />
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-xs btn-square"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="px-3 pb-1">
        <ProjectSwitcher
          activeProjectId={projectId}
          onCloseDrawer={onNavigate}
        />
      </div>

      {projectId ? (
        // Same underline tab idiom as the in-page tab strips (e.g. Domain
        // Overview's Top Keywords / Top Pages).
        <div className="px-3 pb-1">
          <div role="tablist" className="tabs tabs-border w-full">
            <SidebarViewTab
              icon={LayoutGrid}
              label="Browse"
              active={view === "browse"}
              onClick={openBrowse}
            />
            <SidebarViewTab
              icon={MessageCircle}
              label="Chat"
              active={view === "chat"}
              onClick={openChat}
            />
          </div>
        </div>
      ) : null}

      {view === "chat" && projectId ? (
        <SamSidebarPanel projectId={projectId} onNavigate={onNavigate} />
      ) : (
        <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-2 space-y-3">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-base-content/45">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const { icon, label, ...linkProps } = item;
                  return (
                    <SidebarNavLink
                      key={linkProps.to}
                      icon={icon}
                      label={label}
                      onNavigate={onNavigate}
                      linkProps={linkProps}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      )}

      <SidebarFooter onNavigate={onNavigate} />
    </div>
  );
}

function SidebarViewTab({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`tab flex-1 gap-1.5 text-xs font-semibold ${active ? "tab-active" : ""}`}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}

function SidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  const { data: session } = useSession();
  const isHostedMode = isHostedClientAuthMode();
  const email = session?.user?.email;
  const initial = email ? email.charAt(0).toUpperCase() : "U";

  const closeMenu = () => {
    closeDropdown();
    onNavigate?.();
  };

  return (
    <div className="shrink-0 border-t border-base-300 px-2 py-2 pb-safe space-y-1">
      <SidebarNavLink
        icon={CircleHelp}
        label="Help & Community"
        onNavigate={onNavigate}
        linkProps={{ to: "/support" }}
      />

      {email ? (
        <div className="dropdown dropdown-top w-full">
          <button
            type="button"
            tabIndex={0}
            className={`${navItemClass} w-full justify-between`}
            aria-label="Open account menu"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                {initial}
              </div>
              <span className="truncate text-xs" data-ph-mask>
                {email}
              </span>
            </div>
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content z-30 menu mb-1 w-56 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
          >
            <li>
              <Link to="/settings" onClick={closeMenu}>
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </li>
            {isHostedMode ? (
              <li>
                <Link to={BILLING_ROUTE} onClick={closeMenu}>
                  <CreditCard className="h-4 w-4" />
                  Billing
                </Link>
              </li>
            ) : null}
            <ThemePreferenceMenuItems />
            {isHostedMode ? (
              <>
                <li
                  aria-hidden
                  className="pointer-events-none my-1 h-px bg-base-300 p-0"
                />
                <li>
                  <button
                    type="button"
                    className="text-error"
                    onClick={() => signOutAndRedirect()}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </li>
              </>
            ) : null}
          </ul>
        </div>
      ) : (
        <SidebarNavLink
          icon={Settings}
          label="Settings"
          onNavigate={onNavigate}
          linkProps={{ to: "/settings" }}
        />
      )}
    </div>
  );
}
