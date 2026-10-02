import { AccountMenu } from "@/client/components/AccountMenu";

export function OnboardingAccountMenu({
  email: _email,
}: {
  email: string | undefined;
}) {
  return <AccountMenu className="fixed top-4 right-4 z-50" />;
}
