import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import {
  copyTableToClipboard,
  GOOGLE_SHEETS_NEW_URL,
} from "@/client/lib/clipboard";
import type { CsvValue } from "@/client/lib/csv";
import { getStandardErrorMessage } from "@/client/lib/error-messages";
import { captureClientEvent } from "@/client/lib/posthog";

type ModalState =
  | { isOpen: false }
  | { isOpen: true; rowCount: number; headers: string[]; rows: CsvValue[][] };

const listeners = new Set<() => void>();
let state: ModalState = { isOpen: false };

function emit() {
  for (const listener of listeners) listener();
}

function setState(next: ModalState) {
  state = next;
  emit();
}

export function useExportToSheetsModalState(): ModalState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => state,
  );
}

export function closeExportToSheetsModal() {
  setState({ isOpen: false });
}

export function openGoogleSheetsTab() {
  window.open(GOOGLE_SHEETS_NEW_URL, "_blank", "noopener,noreferrer");
}

/**
 * Copy a table to the clipboard and open the "paste into a new Google Sheet"
 * modal. Headers and rows are stored in modal state so the modal can re-copy
 * when needed (Chrome invalidates ClipboardItem on focus loss).
 */
export async function exportTableToSheets(args: {
  headers: string[];
  rows: CsvValue[][];
  feature: string;
}) {
  const { headers, rows, feature } = args;
  if (rows.length === 0) {
    toast.error("No data to export");
    return;
  }
  try {
    await copyTableToClipboard(headers, rows);
    captureClientEvent("data:export_sheets", {
      source_feature: feature,
      result_count: rows.length,
    });
    setState({ isOpen: true, rowCount: rows.length, headers, rows });
  } catch (error) {
    toast.error(getStandardErrorMessage(error, "Could not copy to clipboard"));
  }
}
