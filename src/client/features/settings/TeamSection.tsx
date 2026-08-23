import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useSession, authClient } from "@/lib/auth-client";

interface MemberEntry {
  id: string;
  userId: string;
  role: string;
  user?: { name?: string | null; email?: string | null } | null;
}

type OrgRole = "member" | "admin" | "owner";

function isOrgRole(value: string): value is OrgRole {
  return value === "member" || value === "admin" || value === "owner";
}

export function TeamSection() {
  const { data: session } = useSession();
  const [members, setMembers] = useState<MemberEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<OrgRole>("member");
  const [isInviting, setIsInviting] = useState(false);

  const orgId = session?.session?.activeOrganizationId;

  const loadMembers = useCallback(async () => {
    if (!orgId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const result = await authClient.organization.getFullOrganization({
        query: { organizationId: orgId },
      });
      if (result?.data?.members) {
        setMembers(result.data.members as MemberEntry[]);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim() || !orgId) return;
    setIsInviting(true);
    try {
      await authClient.organization.inviteMember({
        email: inviteEmail.trim(),
        role: inviteRole,
        organizationId: orgId,
      });
      toast.success("Invitation sent.");
      setInviteEmail("");
      await loadMembers();
    } catch {
      toast.error("Could not send invitation.");
    } finally {
      setIsInviting(false);
    }
  }

  async function handleRemove(memberIdOrEmail: string) {
    try {
      await authClient.organization.removeMember({
        memberIdOrEmail,
      });
      toast.success("Member removed.");
      await loadMembers();
    } catch {
      toast.error("Could not remove member.");
    }
  }

  async function handleRoleChange(memberId: string, role: string) {
    if (!isOrgRole(role)) return;
    try {
      await authClient.organization.updateMemberRole({
        memberId,
        role: role as "member" | "admin" | "owner",
      });
      toast.success("Role updated.");
      await loadMembers();
    } catch {
      toast.error("Could not update role.");
    }
  }

  if (!orgId) {
    return (
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-base-content/50">Team</h2>
        <p className="text-sm text-base-content/60">
          Team management is not available for your account.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-base-content/50">Team</h2>

      {/* Invite form */}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void handleInvite(e);
        }}
      >
        <input
          type="email"
          className="input input-bordered flex-1"
          placeholder="Email address"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          required
        />
        <select
          className="select select-bordered w-28"
          value={inviteRole}
          onChange={(e) => {
            if (isOrgRole(e.target.value)) setInviteRole(e.target.value);
          }}
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          className="btn btn-soft btn-sm"
          disabled={isInviting || !inviteEmail.trim()}
        >
          {isInviting ? "Inviting..." : "Invite"}
        </button>
      </form>

      {/* Members list */}
      {isLoading ? (
        <p className="text-sm text-base-content/60">Loading members...</p>
      ) : members.length === 0 ? (
        <p className="text-sm text-base-content/60">No members found.</p>
      ) : (
        <div className="divide-y divide-base-300 rounded-lg border border-base-300">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between gap-4 p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {m.user?.name ?? m.user?.email ?? "Unknown"}
                </p>
                <p className="text-xs text-base-content/50">
                  {m.user?.email ?? ""}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  className="select select-bordered select-xs w-24"
                  value={m.role}
                  onChange={(e) => {
                    void handleRoleChange(m.id, e.target.value);
                  }}
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
                {m.role !== "owner" ? (
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => {
                      void handleRemove(m.userId);
                    }}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
