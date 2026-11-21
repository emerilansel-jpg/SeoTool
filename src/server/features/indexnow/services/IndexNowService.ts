import { randomBytes } from "node:crypto";
import {
  IndexNowRepository,
  type IndexNowSubmission,
} from "../repositories/IndexNowRepository";
import { AppError } from "@/server/lib/errors";

// api.indexnow.org fans out to every participating engine (Bing, Yandex,
// Seznam, Naver, Yep). Limits per the IndexNow spec: 10,000 URLs / 20 MB.
const SUBMIT_ENDPOINT = "https://api.indexnow.org/IndexNow.json";
const MAX_URLS_PER_SUBMISSION = 10_000;
const AUTO_SUBMIT_CAP = 500;

export function normalizeHost(host: string): string {
  return host
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

function normalizeUrl(url: string, host: string): string | null {
  const trimmed = url.trim();
  if (!trimmed || trimmed.length > 2000) return null;
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (normalizeHost(parsed.hostname) !== host) return null;
      return parsed.toString();
    } catch {
      return null;
    }
  }
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `https://${host}${path}`;
}

function newKey(): string {
  return randomBytes(16).toString("hex");
}

async function ensureKey(input: {
  projectId: string;
  organizationId: string;
  host: string;
}): Promise<{ host: string; key: string; status: string }> {
  const host = normalizeHost(input.host);
  if (!host) {
    throw new AppError("VALIDATION_ERROR", "A site host is required.");
  }
  const existing = await IndexNowRepository.getByProjectId(input.projectId);
  // Reuse the existing key when the host is unchanged — a fresh key would
  // orphan the key file the user already uploaded.
  const key = existing && existing.host === host ? existing.key : newKey();
  const row = await IndexNowRepository.upsertKey({
    projectId: input.projectId,
    organizationId: input.organizationId,
    host,
    key,
  });
  return { host: row.host, key: row.key, status: row.status };
}

async function rotateKey(projectId: string): Promise<string> {
  const existing = await IndexNowRepository.getByProjectId(projectId);
  if (!existing) throw new AppError("NOT_FOUND", "Set up IndexNow first.");
  const key = newKey();
  await IndexNowRepository.upsertKey({
    projectId,
    organizationId: existing.organizationId,
    host: existing.host,
    key,
  });
  await IndexNowRepository.markVerified(
    projectId,
    false,
    "Key rotated; upload the new key file.",
  );
  return key;
}

/** Verify the key file is live at https://{host}/{key}.txt with exact content. */
async function verifyKey(
  projectId: string,
): Promise<{ verified: boolean; error?: string }> {
  const existing = await IndexNowRepository.getByProjectId(projectId);
  if (!existing) throw new AppError("NOT_FOUND", "Set up IndexNow first.");

  try {
    const response = await fetch(
      `https://${existing.host}/${existing.key}.txt`,
      {
        redirect: "follow",
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!response.ok) {
      const error = `Key file returned HTTP ${response.status}`;
      await IndexNowRepository.markVerified(projectId, false, error);
      return { verified: false, error };
    }
    const body = (await response.text()).trim();
    if (body !== existing.key) {
      const error = "Key file content does not match the generated key";
      await IndexNowRepository.markVerified(projectId, false, error);
      return { verified: false, error };
    }
    await IndexNowRepository.markVerified(projectId, true, null);
    return { verified: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Key file fetch failed";
    await IndexNowRepository.markVerified(projectId, false, message);
    return { verified: false, error: message };
  }
}

export type SubmitResult = {
  status: "success" | "partial" | "failed" | "skipped";
  submitted: number;
  rejected: number;
  responseStatus: number | null;
  responseSummary: string | null;
  submission: IndexNowSubmission;
};

async function submitUrls(input: {
  projectId: string;
  organizationId: string;
  urls: string[];
  trigger: "manual" | "auto_audit";
}): Promise<SubmitResult> {
  const existing = await IndexNowRepository.getByProjectId(input.projectId);
  if (!existing) {
    throw new AppError("NOT_FOUND", "Set up IndexNow first.");
  }
  if (existing.status !== "verified") {
    const skipped = await IndexNowRepository.recordSubmission({
      projectId: input.projectId,
      organizationId: input.organizationId,
      host: existing.host,
      urls: [],
      trigger: input.trigger,
      status: "skipped",
      responseStatus: null,
      responseSummary: "Key not verified",
    });
    return {
      status: "skipped",
      submitted: 0,
      rejected: input.urls.length,
      responseStatus: null,
      responseSummary: "Key not verified",
      submission: skipped,
    };
  }

  const urls = [...new Set(input.urls)]
    .slice(0, MAX_URLS_PER_SUBMISSION)
    .map((url) => normalizeUrl(url, existing.host))
    .filter((url): url is string => url !== null);
  const rejected = input.urls.length - urls.length;

  if (urls.length === 0) {
    throw new AppError(
      "VALIDATION_ERROR",
      "No valid URLs to submit. URLs must be on the configured host.",
    );
  }

  let responseStatus: number | null = null;
  let responseSummary: string | null = null;
  let status: SubmitResult["status"] = "failed";

  try {
    const response = await fetch(SUBMIT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: existing.host,
        key: existing.key,
        urlList: urls,
      }),
      signal: AbortSignal.timeout(30_000),
    });
    responseStatus = response.status;
    // 200/202 = accepted; 4xx = payload/key problem; 5xx = retry later.
    if (response.status === 200 || response.status === 202) {
      status = "success";
      responseSummary = "Accepted by IndexNow";
    } else {
      status = "failed";
      responseSummary = `HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`;
    }
  } catch (error) {
    status = "failed";
    responseSummary =
      error instanceof Error ? error.message : "Submission request failed";
  }

  const submission = await IndexNowRepository.recordSubmission({
    projectId: input.projectId,
    organizationId: input.organizationId,
    host: existing.host,
    urls,
    trigger: input.trigger,
    status,
    responseStatus,
    responseSummary,
  });

  return {
    status,
    submitted: status === "success" ? urls.length : 0,
    rejected,
    responseStatus,
    responseSummary,
    submission,
  };
}

/** Audit-completion hook: submit new or content-changed URLs from a finished
 *  audit, capped to keep the IndexNow batch (and our history rows) sane. */
async function autoSubmitFromAudit(input: {
  projectId: string;
  auditId: string;
}): Promise<{ submitted: boolean; urlCount: number } | null> {
  const keyRow = await IndexNowRepository.getByProjectId(input.projectId);
  if (!keyRow || !keyRow.autoSubmit || keyRow.status !== "verified")
    return null;

  const { AuditRepository } =
    await import("@/server/features/audit/repositories/AuditRepository");
  const changedUrls =
    await AuditRepository.getNewOrChangedUrlsSincePreviousAudit(input.auditId);
  const urls = changedUrls.slice(0, AUTO_SUBMIT_CAP);
  if (urls.length === 0) return { submitted: false, urlCount: 0 };

  await submitUrls({
    projectId: input.projectId,
    organizationId: keyRow.organizationId,
    urls,
    trigger: "auto_audit",
  });
  await IndexNowRepository.touchAutoSubmittedAt(input.projectId);
  return { submitted: true, urlCount: urls.length };
}

export const IndexNowService = {
  ensureKey,
  rotateKey,
  verifyKey,
  submitUrls,
  autoSubmitFromAudit,
  normalizeHost,
  AUTO_SUBMIT_CAP,
};
