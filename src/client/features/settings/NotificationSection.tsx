import { useState } from "react";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";

export function NotificationSection() {
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);

  const productUpdates = session?.user?.emailProductUpdates !== false;
  const alertNotifications = session?.user?.emailAlertNotifications !== false;

  async function toggle(field: string, enabled: boolean) {
    setIsSaving(true);
    try {
      const result = await authClient.updateUser({ [field]: enabled });
      if (result.error) {
        toast.error("Could not update notification preference.");
      } else {
        toast.success(
          enabled ? "Notifications enabled" : "Notifications disabled",
        );
      }
    } catch {
      toast.error("Could not update notification preference.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-base-content/50">
        Notifications
      </h2>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-sm">Product updates</p>
            <p className="mt-1 text-sm text-base-content/60">
              New features, improvements, and tips.
            </p>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={productUpdates}
            disabled={isSaving}
            onChange={(e) => {
              void toggle("emailProductUpdates", e.currentTarget.checked);
            }}
            aria-label="Product update emails"
          />
        </div>
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-sm">Alert notifications</p>
            <p className="mt-1 text-sm text-base-content/60">
              Rank changes, audit results, and monitoring alerts.
            </p>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={alertNotifications}
            disabled={isSaving}
            onChange={(e) => {
              void toggle("emailAlertNotifications", e.currentTarget.checked);
            }}
            aria-label="Alert notification emails"
          />
        </div>
      </div>
    </section>
  );
}
