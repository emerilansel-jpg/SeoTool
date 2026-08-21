import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { Check, Clipboard, ExternalLink, X } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/client/components/Modal";
import { copyTableToClipboard } from "@/client/lib/clipboard";
import {
  closeExportToSheetsModal,
  openGoogleSheetsTab,
  useExportToSheetsModalState,
} from "@/client/lib/exportToSheets";

export function ExportToSheetsModal() {
  const state = useExportToSheetsModalState();
  const pathname = useLocation({ select: (l) => l.pathname });
  useEffect(() => {
    closeExportToSheetsModal();
  }, [pathname]);

  if (!state.isOpen) return null;

  const { rowCount, headers, rows } = state;

  const handleCopyAgain = async () => {
    try {
      await copyTableToClipboard(headers, rows);
      toast.success("Copied again — now paste in your Google Sheet");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const handleOpenSheet = async () => {
    // Re-copy immediately before opening the tab so the clipboard item is
    // fresh. Chrome invalidates ClipboardItem when focus leaves the document,
    // so copying here (same gesture, before window.open) keeps it alive.
    try {
      await copyTableToClipboard(headers, rows);
    } catch {
      // If re-copy fails, continue — the user can use "Copy again" in the sheet
    }
    openGoogleSheetsTab();
    closeExportToSheetsModal();
  };

  return (
    <Modal
      maxWidth="max-w-md"
      onClose={closeExportToSheetsModal}
      labelledBy="export-to-sheets-title"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-success/15 text-success">
            <Check className="size-4" />
          </span>
          <h3 id="export-to-sheets-title" className="text-base font-semibold">
            {rowCount} row{rowCount === 1 ? "" : "s"} copied to clipboard
          </h3>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-xs btn-square"
          onClick={closeExportToSheetsModal}
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
      </div>

      <ol className="mt-1 list-decimal space-y-1 pl-4 text-sm text-base-content/75">
        <li>
          Click{" "}
          <span className="font-medium text-base-content">
            Open new Google Sheet
          </span>{" "}
          below.
        </li>
        <li>
          In the new sheet, press <kbd className="kbd kbd-xs">Ctrl</kbd>
          {" + "}
          <kbd className="kbd kbd-xs">V</kbd>
          {" (or "}
          <kbd className="kbd kbd-xs">⌘V</kbd>
          {") to paste the data."}
        </li>
        <li className="text-base-content/55">
          If the sheet is blank after pasting, click{" "}
          <span className="font-medium">Copy again</span> below, then paste.
        </li>
      </ol>

      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          className="btn btn-ghost btn-sm gap-1.5"
          onClick={() => void handleCopyAgain()}
        >
          <Clipboard className="size-3.5" />
          Copy again
        </button>

        <button
          type="button"
          className="btn btn-primary btn-sm gap-1.5"
          onClick={() => void handleOpenSheet()}
        >
          Open new Google Sheet
          <ExternalLink className="size-3.5" />
        </button>
      </div>
    </Modal>
  );
}
