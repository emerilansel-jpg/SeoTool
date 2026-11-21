import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Ticket } from "lucide-react";
import { toast } from "sonner";
import { redeemCoupon } from "@/serverFunctions/coupons";

export function CouponRedeemCard({ onRedeemed }: { onRedeemed?: () => void }) {
  const redeem = useServerFn(redeemCoupon);
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");

  const redeemMutation = useMutation({
    mutationFn: () => redeem({ data: { code } }),
    onSuccess: (result) => {
      toast.success(
        `Coupon redeemed! ${result.credits.toLocaleString()} credits added to your workspace.`,
      );
      setCode("");
      void queryClient.invalidateQueries({ queryKey: ["credit-balance"] });
      void queryClient.invalidateQueries({ queryKey: ["quota"] });
      onRedeemed?.();
    },
    onError: (error: Error) =>
      toast.error(error.message || "Coupon could not be redeemed."),
  });

  return (
    <div className="rounded-lg border border-base-300 bg-base-100 p-4">
      <div className="flex items-center gap-2">
        <Ticket className="size-4 text-primary" />
        <span className="text-sm font-medium">Have a coupon code?</span>
      </div>
      <p className="mt-1 text-xs text-base-content/60">
        Redeem a code to add permanent credits to this workspace.
      </p>
      <div className="join mt-3 w-full">
        <input
          type="text"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          onKeyDown={(event) => {
            if (event.key === "Enter" && code.trim().length >= 4) {
              redeemMutation.mutate();
            }
          }}
          placeholder="SEO-XXXXXXXXXX"
          aria-label="Coupon code"
          className="input input-bordered input-sm join-item w-full font-mono"
        />
        <button
          type="button"
          className="btn btn-primary btn-sm join-item"
          disabled={code.trim().length < 4 || redeemMutation.isPending}
          onClick={() => redeemMutation.mutate()}
        >
          {redeemMutation.isPending ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            "Redeem"
          )}
        </button>
      </div>
    </div>
  );
}
