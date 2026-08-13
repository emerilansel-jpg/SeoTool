import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { getFieldError, getFormError } from "@/client/lib/forms";
import { authClient, signOutAndRedirect } from "@/lib/auth-client";
import { HOSTED_PASSWORD_MIN_LENGTH } from "@/lib/auth-options";
import { deleteAccount } from "@/serverFunctions/account";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z
      .string()
      .min(
        HOSTED_PASSWORD_MIN_LENGTH,
        `Password must be at least ${HOSTED_PASSWORD_MIN_LENGTH} characters.`,
      ),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const deleteAccountSchema = z.object({
  // Plain string (empty allowed): users who sign in with Google have no
  // password and leave this blank. The server requires a correct password only
  // when a credential account exists.
  password: z.string(),
  confirmation: z.literal("DELETE", {
    message: "Type DELETE to confirm.",
  }),
});

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export function ProfileSection({
  name,
  email,
  isPending,
}: {
  name: string;
  email: string;
  isPending: boolean;
}) {
  const [displayName, setDisplayName] = useState(name);
  const [isSaving, setIsSaving] = useState(false);

  async function saveProfile() {
    if (displayName.trim() === name.trim()) return;
    setIsSaving(true);
    try {
      const result = await authClient.updateUser({
        name: displayName.trim(),
      });
      if (result.error) {
        toast.error("We couldn't update your name.");
        setDisplayName(name);
      } else {
        toast.success("Profile updated.");
      }
    } catch {
      toast.error("We couldn't update your name.");
      setDisplayName(name);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-base-content/50">Profile</h2>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm">Display name</label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={displayName}
            disabled={isPending || isSaving}
            onChange={(e) => setDisplayName(e.target.value)}
            onBlur={() => void saveProfile()}
            placeholder="Your name"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm">Email address</label>
          <input
            type="email"
            className="input input-bordered w-full opacity-60"
            value={email}
            disabled
            readOnly
          />
          <p className="text-xs text-base-content/50">
            Contact support to change your email address.
          </p>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Security - Change Password
// ---------------------------------------------------------------------------

export function SecuritySection() {
  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validators: { onSubmit: changePasswordSchema },
    onSubmit: async ({ formApi, value }) => {
      try {
        const result = await authClient.changePassword({
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
          revokeOtherSessions: true,
        });
        if (result.error) {
          formApi.setErrorMap({
            onSubmit: {
              form: result.error.message ?? "Could not change password.",
              fields: {},
            },
          });
          return;
        }
        toast.success("Password updated. Other sessions were signed out.");
        formApi.reset();
      } catch {
        formApi.setErrorMap({
          onSubmit: {
            form: "Could not change password. Please try again.",
            fields: {},
          },
        });
      }
    },
  });

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-base-content/50">Security</h2>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.Field name="currentPassword">
          {(field) => {
            const error = getFieldError(field.state.meta.errors);
            return (
              <div className="space-y-1.5">
                <label className="text-sm">Current password</label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  placeholder="Enter current password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  autoComplete="current-password"
                />
                {error ? <p className="text-sm text-error">{error}</p> : null}
              </div>
            );
          }}
        </form.Field>

        <form.Field name="newPassword">
          {(field) => {
            const error = getFieldError(field.state.meta.errors);
            return (
              <div className="space-y-1.5">
                <label className="text-sm">New password</label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  placeholder={`At least ${HOSTED_PASSWORD_MIN_LENGTH} characters`}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  autoComplete="new-password"
                />
                {error ? <p className="text-sm text-error">{error}</p> : null}
              </div>
            );
          }}
        </form.Field>

        <form.Field name="confirmPassword">
          {(field) => {
            const error = getFieldError(field.state.meta.errors);
            return (
              <div className="space-y-1.5">
                <label className="text-sm">Confirm new password</label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  placeholder="Re-enter new password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  autoComplete="new-password"
                />
                {error ? <p className="text-sm text-error">{error}</p> : null}
              </div>
            );
          }}
        </form.Field>

        <form.Subscribe
          selector={(state) => ({
            submitError: state.errorMap.onSubmit,
            isSubmitting: state.isSubmitting,
          })}
        >
          {({ submitError, isSubmitting }) => {
            const errorMessage = getFormError(submitError);
            return (
              <>
                {errorMessage ? (
                  <p className="text-sm text-error">{errorMessage}</p>
                ) : null}
                <button
                  type="submit"
                  className="btn btn-soft btn-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update password"}
                </button>
              </>
            );
          }}
        </form.Subscribe>
      </form>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Danger Zone - Delete Account
// ---------------------------------------------------------------------------

export function DangerZoneSection() {
  const [isConfirming, setIsConfirming] = useState(false);

  const form = useForm({
    defaultValues: { password: "", confirmation: "" },
    validators: { onSubmit: deleteAccountSchema },
    onSubmit: async ({ formApi, value }) => {
      try {
        const result = await deleteAccount({
          data: {
            password: value.password,
          },
        });
        if (!result?.success) {
          formApi.setErrorMap({
            onSubmit: {
              form: "Could not delete your account. Please try again.",
              fields: {},
            },
          });
          return;
        }
        toast.success("Your account has been deleted.");
        signOutAndRedirect();
      } catch {
        formApi.setErrorMap({
          onSubmit: {
            form: "Incorrect password, or could not delete your account.",
            fields: {},
          },
        });
      }
    },
  });

  if (!isConfirming) {
    return (
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-base-content/50">
          Danger Zone
        </h2>
        <div className="flex items-start justify-between gap-6 rounded-lg border border-error/30 bg-error/5 p-4">
          <div>
            <p className="text-sm font-medium">Delete account</p>
            <p className="mt-1 text-sm text-base-content/60">
              Permanently remove your account and all project data. This cannot
              be undone.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-error btn-sm shrink-0"
            onClick={() => setIsConfirming(true)}
          >
            Delete
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-base-content/50">Danger Zone</h2>
      <div className="rounded-lg border border-error/30 bg-error/5 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Delete account</p>
            <p className="mt-1 text-sm text-base-content/60">
              This will permanently delete your account, all projects, keywords,
              reports, and rank tracking data. This action cannot be undone.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm shrink-0"
            onClick={() => {
              setIsConfirming(false);
              form.reset();
            }}
          >
            Cancel
          </button>
        </div>

        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.Field name="confirmation">
            {(field) => {
              const error = getFieldError(field.state.meta.errors);
              return (
                <div className="space-y-1.5">
                  <label className="text-sm">
                    Type <span className="font-mono font-bold">DELETE</span> to
                    confirm
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="DELETE"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    autoComplete="off"
                  />
                  {error ? <p className="text-sm text-error">{error}</p> : null}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="password">
            {(field) => {
              const error = getFieldError(field.state.meta.errors);
              return (
                <div className="space-y-1.5">
                  <label className="text-sm">
                    Your password{" "}
                    <span className="text-base-content/40">
                      (leave blank if you sign in with Google)
                    </span>
                  </label>
                  <input
                    type="password"
                    className="input input-bordered w-full"
                    placeholder="Enter your password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    autoComplete="current-password"
                  />
                  {error ? <p className="text-sm text-error">{error}</p> : null}
                </div>
              );
            }}
          </form.Field>

          <form.Subscribe
            selector={(state) => ({
              submitError: state.errorMap.onSubmit,
              isSubmitting: state.isSubmitting,
            })}
          >
            {({ submitError, isSubmitting }) => {
              const errorMessage = getFormError(submitError);
              return (
                <>
                  {errorMessage ? (
                    <p className="text-sm text-error">{errorMessage}</p>
                  ) : null}
                  <button
                    type="submit"
                    className="btn btn-error btn-sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Deleting account..."
                      : "Permanently delete my account"}
                  </button>
                </>
              );
            }}
          </form.Subscribe>
        </form>
      </div>
    </section>
  );
}
