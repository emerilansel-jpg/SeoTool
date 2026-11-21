import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Ticket } from "lucide-react";
import { toast } from "sonner";
import { createAdminCoupon, listAdminCoupons } from "@/serverFunctions/coupons";

type CouponRow = {
  id: string;
  code: string;
  credits: number;
  maxRedemptions: number | null;
  redeemedCount: number;
  expiresAt: string | null;
  note: string | null;
  isActive: boolean;
  createdAt: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "no expiry";
  return new Date(value).toLocaleDateString();
}

export function AdminCouponCodesCard() {
  const listCoupons = useServerFn(listAdminCoupons);
  const createCoupon = useServerFn(createAdminCoupon);
  const queryClient = useQueryClient();

  const [credits, setCredits] = useState("100000");
  const [maxRedemptions, setMaxRedemptions] = useState("10");
  const [expiresAt, setExpiresAt] = useState("");
  const [note, setNote] = useState("");
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const couponsQuery = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: () => listCoupons({ data: { limit: 50 } }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createCoupon({
        data: {
          credits: Number(credits),
          maxRedemptions: maxRedemptions ? Number(maxRedemptions) : undefined,
          expiresAt: expiresAt || undefined,
          note: note || undefined,
        },
      }),
    onSuccess: (result) => {
      setCreatedCode(result.coupon.code);
      toast.success(`Coupon ${result.coupon.code} created.`);
      void queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not create coupon."),
  });

  const coupons = (couponsQuery.data ?? []) as CouponRow[];

  return (
    <div className="card bg-base-100 border border-base-300 overflow-hidden">
      <div className="border-b border-base-300 bg-base-200 p-4">
        <h2 className="flex items-center gap-2 font-medium">
          <Ticket className="size-4 text-primary" /> Coupon Codes
        </h2>
        <p className="mt-1 text-xs text-base-content/50">
          Generate codes that grant permanent top-up credits. One redemption per
          workspace. Credits only convert into provider cost when actually
          spent.
        </p>
      </div>

      <div className="p-4 border-b border-base-300">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          <label className="form-control">
            <span className="label-text text-xs">Credits</span>
            <input
              type="number"
              min={1}
              className="input input-bordered input-sm w-full"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
            />
          </label>
          <label className="form-control">
            <span className="label-text text-xs">Max redemptions</span>
            <input
              type="number"
              min={1}
              placeholder="unlimited"
              className="input input-bordered input-sm w-full"
              value={maxRedemptions}
              onChange={(e) => setMaxRedemptions(e.target.value)}
            />
          </label>
          <label className="form-control">
            <span className="label-text text-xs">Expires (YYYY-MM-DD)</span>
            <input
              type="date"
              className="input input-bordered input-sm w-full"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </label>
          <label className="form-control">
            <span className="label-text text-xs">Note</span>
            <input
              type="text"
              placeholder="e.g. Launch partner"
              className="input input-bordered input-sm w-full"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <div className="form-control justify-end">
            <button
              type="button"
              className="btn btn-primary btn-sm w-full"
              disabled={createMutation.isPending || !credits}
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Create coupon"
              )}
            </button>
          </div>
        </div>
        {createdCode ? (
          <p className="mt-2 rounded-lg border border-success/30 bg-success/10 p-2 font-mono text-sm">
            New code: <strong>{createdCode}</strong>
          </p>
        ) : null}
      </div>

      {coupons.length === 0 ? (
        <p className="p-6 text-center text-sm text-base-content/50">
          No coupon codes yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Code</th>
                <th>Credits</th>
                <th>Redeemed</th>
                <th>Expires</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="font-mono text-xs font-bold">{coupon.code}</td>
                  <td className="tabular-nums">
                    {coupon.credits.toLocaleString()}
                  </td>
                  <td className="tabular-nums">
                    {coupon.redeemedCount}
                    {coupon.maxRedemptions ? ` / ${coupon.maxRedemptions}` : ""}
                    {!coupon.isActive ? (
                      <span className="badge badge-error badge-xs ml-1">
                        disabled
                      </span>
                    ) : null}
                  </td>
                  <td className="text-xs text-base-content/60">
                    {formatDate(coupon.expiresAt)}
                  </td>
                  <td className="max-w-[200px] truncate text-xs text-base-content/60">
                    {coupon.note ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
