import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { exportAccountData } from "@/serverFunctions/account";

/**
 * GDPR / data-portability export. Downloads the signed-in user's profile,
 * organizations, projects, keywords, and reports as a JSON file. Extracted to
 * its own module to keep SettingsSections.tsx under the oxlint line limit.
 */
export function DataExportSection() {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);
    try {
      const data = await exportAccountData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `seotool-account-data-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Your data export has been downloaded.");
    } catch {
      toast.error("We couldn't export your data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-base-content/50">
        Data &amp; Privacy
      </h2>
      <div className="flex items-start justify-between gap-6 rounded-lg border border-base-300 bg-base-100 p-4">
        <div>
          <p className="text-sm font-medium">Download your data</p>
          <p className="mt-1 text-sm text-base-content/60">
            Export your profile, organizations, projects, keywords, and reports
            as a JSON file.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline btn-sm shrink-0"
          disabled={isExporting}
          onClick={() => void handleExport()}
        >
          {isExporting ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Export
        </button>
      </div>
    </section>
  );
}
