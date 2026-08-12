import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { getFieldError, getFormError } from "@/client/lib/forms";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

const passwordSchema = z.object({
  password: z.string().min(1, "Enter your password."),
});

const codeSchema = z.object({
  code: z.string().min(6, "Enter the 6-digit code.").max(6),
});

function BackupCodesDisplay({
  codes,
  onDismiss,
}: {
  codes: string[];
  onDismiss: () => void;
}) {
  return (
    <div className="rounded-lg border border-success/30 bg-success/5 p-4">
      <p className="text-sm font-medium mb-2">Save your backup codes</p>
      <p className="text-xs text-base-content/60 mb-3">
        Store these codes in a safe place. Each code can only be used once if
        you lose access to your authenticator app.
      </p>
      <div className="grid grid-cols-2 gap-1 font-mono text-sm">
        {codes.map((code) => (
          <span key={code}>{code}</span>
        ))}
      </div>
      <button
        type="button"
        className="btn btn-soft btn-sm mt-4"
        onClick={onDismiss}
      >
        Done
      </button>
    </div>
  );
}

function SetupFlow({ totpUri }: { totpUri: string }) {
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpUri)}`;

  const verifyForm = useForm({
    defaultValues: { code: "" },
    validators: { onSubmit: codeSchema },
    onSubmit: async ({ formApi, value }) => {
      try {
        const result = await authClient.twoFactor.verifyTotp({
          code: value.code,
        });
        if (result.error) {
          formApi.setErrorMap({
            onSubmit: {
              form: result.error.message ?? "Invalid code.",
              fields: {},
            },
          });
          return;
        }
        toast.success("Two-factor authentication enabled.");
      } catch {
        formApi.setErrorMap({
          onSubmit: {
            form: "Could not verify code. Please try again.",
            fields: {},
          },
        });
      }
    },
  });

  if (backupCodes) {
    return (
      <BackupCodesDisplay
        codes={backupCodes}
        onDismiss={() => setBackupCodes(null)}
      />
    );
  }

  return (
    <div className="rounded-lg border border-base-300 p-4">
      <p className="text-sm font-medium mb-3">
        Scan this QR code with your authenticator app
      </p>
      <img
        src={qrUrl}
        alt="QR code for 2FA setup"
        className="mx-auto rounded-lg"
        width={200}
        height={200}
      />
      <p className="text-xs text-base-content/50 mt-2 text-center break-all">
        {totpUri}
      </p>
      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          void verifyForm.handleSubmit();
        }}
      >
        <verifyForm.Field name="code">
          {(field) => {
            const error = getFieldError(field.state.meta.errors);
            return (
              <div className="space-y-1.5">
                <label className="text-sm">Verification code</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="000000"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  maxLength={6}
                  autoComplete="one-time-code"
                />
                {error ? <p className="text-sm text-error">{error}</p> : null}
              </div>
            );
          }}
        </verifyForm.Field>
        <verifyForm.Subscribe
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
                  {isSubmitting ? "Verifying..." : "Verify and enable"}
                </button>
              </>
            );
          }}
        </verifyForm.Subscribe>
      </form>
    </div>
  );
}

function DisableFlow({ onCancel }: { onCancel: () => void }) {
  const form = useForm({
    defaultValues: { password: "" },
    validators: { onSubmit: passwordSchema },
    onSubmit: async ({ formApi, value }) => {
      try {
        const result = await authClient.twoFactor.disable({
          password: value.password,
        });
        if (result.error) {
          formApi.setErrorMap({
            onSubmit: {
              form: result.error.message ?? "Could not disable 2FA.",
              fields: {},
            },
          });
          return;
        }
        toast.success("Two-factor authentication disabled.");
        onCancel();
      } catch {
        formApi.setErrorMap({
          onSubmit: {
            form: "Could not disable 2FA. Please try again.",
            fields: {},
          },
        });
      }
    },
  });

  return (
    <div className="rounded-lg border border-error/30 bg-error/5 p-4">
      <p className="text-sm font-medium mb-3">
        Disable two-factor authentication
      </p>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.Field name="password">
          {(field) => {
            const error = getFieldError(field.state.meta.errors);
            return (
              <div className="space-y-1.5">
                <label className="text-sm">Your password</label>
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
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-error btn-sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Disabling..." : "Disable 2FA"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={onCancel}
                  >
                    Cancel
                  </button>
                </div>
              </>
            );
          }}
        </form.Subscribe>
      </form>
    </div>
  );
}

export function TwoFactorSection() {
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [isSetup, setIsSetup] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  const isEnabled = false;

  const enableForm = useForm({
    defaultValues: { password: "" },
    validators: { onSubmit: passwordSchema },
    onSubmit: async ({ formApi, value }) => {
      try {
        const result = await authClient.twoFactor.enable({
          password: value.password,
        });
        if (result.error) {
          formApi.setErrorMap({
            onSubmit: {
              form: result.error.message ?? "Could not enable 2FA.",
              fields: {},
            },
          });
          return;
        }
        if (result.data?.totpURI) {
          setTotpUri(result.data.totpURI);
          setIsSetup(true);
        }
      } catch {
        formApi.setErrorMap({
          onSubmit: {
            form: "Could not enable 2FA. Please try again.",
            fields: {},
          },
        });
      }
    },
  });

  if (isSetup && totpUri) {
    return (
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-base-content/50">
          Two-Factor Authentication
        </h2>
        <SetupFlow totpUri={totpUri} />
      </section>
    );
  }

  if (isDisabling) {
    return (
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-base-content/50">
          Two-Factor Authentication
        </h2>
        <DisableFlow onCancel={() => setIsDisabling(false)} />
      </section>
    );
  }

  if (isEnabled) {
    return (
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-base-content/50">
          Two-Factor Authentication
        </h2>
        <div className="flex items-start justify-between gap-6 rounded-lg border border-success/30 bg-success/5 p-4">
          <div>
            <p className="text-sm font-medium">2FA is enabled</p>
            <p className="mt-1 text-sm text-base-content/60">
              Your account is protected with an authenticator app.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-error btn-sm shrink-0"
            onClick={() => setIsDisabling(true)}
          >
            Disable
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-base-content/50">
        Two-Factor Authentication
      </h2>
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm">Authenticator app</p>
          <p className="mt-1 text-sm text-base-content/60">
            Add an extra layer of security to your account.
          </p>
        </div>
      </div>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          void enableForm.handleSubmit();
        }}
      >
        <enableForm.Field name="password">
          {(field) => {
            const error = getFieldError(field.state.meta.errors);
            return (
              <div className="space-y-1.5">
                <label className="text-sm">Your password</label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  placeholder="Enter your password to continue"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  autoComplete="current-password"
                />
                {error ? <p className="text-sm text-error">{error}</p> : null}
              </div>
            );
          }}
        </enableForm.Field>
        <enableForm.Subscribe
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
                  {isSubmitting ? "Setting up..." : "Set up 2FA"}
                </button>
              </>
            );
          }}
        </enableForm.Subscribe>
      </form>
    </section>
  );
}
