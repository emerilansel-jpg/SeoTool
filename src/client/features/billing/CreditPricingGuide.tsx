import { useState } from "react";
import { CreditRateTable } from "./CreditRateTable";
import { CreditWorkloadSimulator } from "./CreditWorkloadSimulator";
import { Table, Calculator, X, Zap } from "lucide-react";

interface Props {
  initialTab?: "rate-card" | "case-studies";
  hideSimulatorHeader?: boolean;
  className?: string;
}

export function CreditPricingGuide({
  initialTab = "rate-card",
  hideSimulatorHeader = false,
  className = "",
}: Props) {
  const [tab, setTab] = useState<"rate-card" | "case-studies">(initialTab);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tab Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-xl border border-base-300 bg-base-100 p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setTab("rate-card")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              tab === "rate-card"
                ? "bg-primary text-primary-content shadow-xs"
                : "text-base-content/70 hover:text-base-content"
            }`}
          >
            <Table className="size-3.5" />
            <span>Credit Rate Card</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("case-studies")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              tab === "case-studies"
                ? "bg-primary text-primary-content shadow-xs"
                : "text-base-content/70 hover:text-base-content"
            }`}
          >
            <Calculator className="size-3.5" />
            <span>Monthly Case Studies</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {tab === "rate-card" ? (
        <CreditRateTable />
      ) : (
        <CreditWorkloadSimulator hideHeader={hideSimulatorHeader} />
      )}
    </div>
  );
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreditPricingGuideModal({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="relative flex max-h-[92vh] w-full max-w-5xl xl:max-w-6xl flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-base-200 px-6 py-4 bg-base-100">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Zap className="size-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-base-content">
                Credit System & Workload Guide
              </h3>
              <p className="text-xs text-base-content/60">
                Transparent per-action rates and real-world monthly allocations
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="btn btn-ghost btn-xs btn-circle"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <CreditPricingGuide hideSimulatorHeader={true} />
        </div>

        {/* Modal Footer */}
        <div className="border-t border-base-200 px-6 py-3 flex items-center justify-between bg-base-200/40">
          <span className="text-xs text-base-content/60">
            Unused credits roll over monthly without expiring.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary btn-sm rounded-xl px-5"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
