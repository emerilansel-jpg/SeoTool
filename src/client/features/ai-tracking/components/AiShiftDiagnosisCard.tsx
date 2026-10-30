import {
  AlertCircle,
  ArrowRight,
  Brain,
  CheckCircle2,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import type { AiShiftDiagnosis } from "@/types/schemas/ai-tracking";

interface Props {
  diagnosis?: AiShiftDiagnosis;
}

export function AiShiftDiagnosisCard({ diagnosis }: Props) {
  if (!diagnosis) return null;

  return (
    <div className="rounded-2xl border border-primary/20 bg-linear-to-b from-primary/[0.04] to-base-100 p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="flex size-7 sm:size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Brain className="size-4 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold tracking-tight text-base-content">
                Why AI Visibility Shifted
              </h3>
              <span className="badge badge-primary badge-xs sm:badge-sm font-semibold gap-1">
                <Sparkles className="size-2.5" /> AI Engine Diagnosis
              </span>
            </div>
            <p className="text-xs text-base-content/60">
              Root-cause telemetry &amp; tactical recovery action items
            </p>
          </div>
        </div>
      </div>

      {/* Headline & Summary */}
      <div className="rounded-xl border border-base-300/80 bg-base-100/90 p-3.5 sm:p-4 space-y-1.5">
        <p className="text-sm font-bold text-base-content leading-snug">
          {diagnosis.headline}
        </p>
        <p className="text-xs text-base-content/70 leading-relaxed">
          {diagnosis.summary}
        </p>
      </div>

      {/* Primary Factors (3 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {diagnosis.primaryFactors.map((factor, idx) => {
          const isPos = factor.impact === "positive";
          const isNeg = factor.impact === "negative";

          return (
            <div
              key={idx}
              className={`rounded-xl border p-3 flex flex-col justify-between transition-all ${
                isPos
                  ? "border-success/30 bg-success/[0.04]"
                  : isNeg
                    ? "border-error/30 bg-error/[0.04]"
                    : "border-base-300 bg-base-200/30"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/70">
                    {factor.factor}
                  </span>
                  {isPos ? (
                    <CheckCircle2 className="size-3.5 text-success shrink-0" />
                  ) : isNeg ? (
                    <AlertCircle className="size-3.5 text-error shrink-0" />
                  ) : (
                    <span className="size-2 rounded-full bg-base-content/40" />
                  )}
                </div>
                <p className="text-xs text-base-content/75 leading-relaxed">
                  {factor.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tactical Action Plan */}
      <div className="rounded-xl border border-warning/30 bg-warning/[0.06] p-3.5 sm:p-4 space-y-2">
        <div className="flex items-center gap-1.5 text-warning font-bold text-xs uppercase tracking-wider">
          <Lightbulb className="size-3.5" />
          <span>Recommended Next Actions</span>
        </div>
        <ul className="space-y-1.5">
          {diagnosis.actionItems.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-xs text-base-content/85 leading-relaxed"
            >
              <ArrowRight className="size-3.5 text-primary shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
