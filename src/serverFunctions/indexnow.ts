import { createServerFn } from "@tanstack/react-start";
import { IndexNowService } from "@/server/features/indexnow/services/IndexNowService";
import { IndexNowRepository } from "@/server/features/indexnow/repositories/IndexNowRepository";
import {
  indexNowActionInputSchema,
  indexNowSetupInputSchema,
  indexNowSubmitInputSchema,
  indexNowToggleInputSchema,
} from "@/types/schemas/indexnow";
import { requireProjectContext } from "@/serverFunctions/middleware";

export const getIndexNowStatus = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(indexNowActionInputSchema)
  .handler(async ({ context }) => {
    const key = await IndexNowRepository.getByProjectId(context.projectId);
    const submissions = await IndexNowRepository.listSubmissions(
      context.projectId,
      25,
    );
    return {
      key: key
        ? {
            host: key.host,
            key: key.key,
            keyLocation: `https://${key.host}/${key.key}.txt`,
            status: key.status,
            autoSubmit: key.autoSubmit,
            lastError: key.lastError,
            verifiedAt: key.verifiedAt,
            autoSubmittedAt: key.autoSubmittedAt,
          }
        : null,
      submissions: submissions.map((submission) => ({
        id: submission.id,
        urlCount: submission.urlCount,
        trigger: submission.trigger,
        status: submission.status,
        responseStatus: submission.responseStatus,
        responseSummary: submission.responseSummary,
        createdAt: submission.createdAt,
      })),
    };
  });

export const setupIndexNowKey = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(indexNowSetupInputSchema)
  .handler(async ({ data, context }) => {
    const result = await IndexNowService.ensureKey({
      projectId: context.projectId,
      organizationId: context.organizationId,
      host: data.host,
    });
    return result;
  });

export const rotateIndexNowKey = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(indexNowActionInputSchema)
  .handler(async ({ context }) => {
    const key = await IndexNowService.rotateKey(context.projectId);
    return { key };
  });

export const verifyIndexNowKey = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(indexNowActionInputSchema)
  .handler(async ({ context }) => {
    return IndexNowService.verifyKey(context.projectId);
  });

export const toggleIndexNowAutoSubmit = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(indexNowToggleInputSchema)
  .handler(async ({ data, context }) => {
    await IndexNowRepository.setAutoSubmit(context.projectId, data.autoSubmit);
    return { ok: true };
  });

export const submitIndexNowUrls = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(indexNowSubmitInputSchema)
  .handler(async ({ data, context }) => {
    const result = await IndexNowService.submitUrls({
      projectId: context.projectId,
      organizationId: context.organizationId,
      urls: data.urls,
      trigger: "manual",
    });
    return {
      status: result.status,
      submitted: result.submitted,
      rejected: result.rejected,
      responseSummary: result.responseSummary,
    };
  });
