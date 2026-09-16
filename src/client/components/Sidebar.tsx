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
  adminNavGroup,
  getProjectNavGroups,
} from "@/client/navigation/items";
import { ProjectSwitcher } from "@/client/features/projects/ProjectSwitcher";
import { JetSidebarPanel } from "@/client/features/jet/JetSidebarPanel";
import { useIsPlatformAdmin } from "@/client/features/admin/useIsPlatformAdmin";
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
  "group relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-150";

const navItemClass = `${navItemBaseClass} text-base-content/75 hover:bg-base-300/50 hover:text-base-content active:scale-[0.99]`;

const navItemActiveProps = {
  className:
    "bg-primary text-white font-semibold shadow-xs shadow-primary/25 hover:bg-primary/95",
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
          <Icon
            className={`h-4 w-4 shrink-0 transition-colors ${
              isActive ? "text-white" : "text-base-content/60 group-hover:text-base-content"
            }`}
          />
          <span className="truncate">{label}</span>
          {isActive ? (
            <span className="ml-auto size-1.5 rounded-full bg-white/80" />
          ) : null}
        </>
      )}
    </Link>
  );
}

export function Sidebar({ projectId, onNavigate, onClose }: SidebarProps) {
  const isAdmin = useIsPlatformAdmin();
  const navGroups = [
    ...(projectId ? getProjectNavGroups(projectId) : []),
    connectNavGroup,
    ...(isAdmin ? [adminNavGroup] : []),
  ];
  const navigate = useNavigate();
  const location = useLocation();
  const onJetRoute = location.pathname.includes("/jet");

  // PostHog-style sidebar tabs: Browse shows the regular nav, Chat shows the
  // Jet chat history. The tab is view state (switching to Browse leaves the
  // conversation open in the content panel), but the route wins: landing on
  // /jet selects Chat, navigating anywhere else flips back to Browse.
  const [view, setView] = useState<"browse" | "chat">(
    onJetRoute ? "chat" : "browse",
  );
  useEffect(() => {
    setView(onJetRoute ? "chat" : "browse");
  }, [onJetRoute]);

  const openChat = () => {
    setView("chat");
    if (!projectId) return;
    if (!onJetRoute) {
      void navigate({
        to: "/p/$projectId/jet",
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
    if (!projectId || !onJetRoute) return;
    void navigate({ to: "/p/$projectId", params: { projectId } });
    onNavigate?.();
  };

  return (
    <div className="flex h-full w-64 flex-col bg-base-200 border-r border-base-300/70">
      <div className="flex items-center justify-between px-3.5 pb-2.5 pt-3.5 border-b border-base-300/40">
        <Link
          to="/"
          onClick={onNavigate}
          className="group flex items-center gap-2.5"
        >
          <img
            src="/logo.png"
            alt="SeoTool.im"
            className="h-7 w-auto object-contain transition-transform group-hover:scale-105 dark:hidden"
          />
          <img
            src="/logo-dark.png"
            alt="SeoTool.im"
            className="h-7 w-auto object-contain transition-transform group-hover:scale-105 hidden dark:block"
          />
        </Link>
        <div className="flex items-center gap-1">
          <NotificationCenter />
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-xs btn-square rounded-lg"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="px-3 pt-2.5 pb-1">
        <ProjectSwitcher
          activeProjectId={projectId}
          onCloseDrawer={onNavigate}
        />
      </div>

      {projectId ? (
        <div className="px-3 pt-1.5 pb-1">
          <div className="flex items-center gap-1 rounded-xl bg-base-300/50 p-1 border border-base-300/60">
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
        <JetSidebarPanel projectId={projectId} onNavigate={onNavigate} />
      ) : (
        <nav className="min-h-0 flex-1 overflow-y-auto px-2.5 py-2 space-y-3.5 [scrollbar-width:thin] [scrollbar-color:var(--color-base-300)_transparent]">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-3 pt-1 text-[10px] font-bold uppercase tracking-wider text-base-content/40">
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
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-all ${
        active
          ? "bg-base-100 text-base-content font-semibold shadow-xs border border-base-300/60"
          : "text-base-content/60 hover:text-base-content"
      }`}
    >
      <Icon className={`size-3.5 ${active ? "text-primary" : ""}`} />
      <span>{label}</span>
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
