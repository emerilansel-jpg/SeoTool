import { createServerFn } from "@tanstack/react-start";
import { ContentOutlineService } from "@/server/features/content-outline/services/ContentOutlineService";
import { CompetitorTrafficService } from "@/server/features/competitor-traffic/services/CompetitorTrafficService";
import {
  WebhookEmitter,
  WEBHOOK_EVENTS,
} from "@/server/features/webhooks/services/WebhookEmitter";
import { WebhooksRepository } from "@/server/features/webhooks/repositories/WebhooksRepository";
import {
  competitorTopPagesInputSchema,
  competitorTrafficInputSchema,
  contentOutlineInputSchema,
  webhookActionInputSchema,
  webhookCreateInputSchema,
  webhookUpdateInputSchema,
} from "@/types/schemas/growth-tools";
import {
  requireAuthenticatedContext,
  requireProjectContext,
} from "@/serverFunctions/middleware";

export const buildContentOutline = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(contentOutlineInputSchema)
  .handler(async ({ data, context }) => {
    return ContentOutlineService.buildContentOutline(
      {
        projectId: context.projectId,
        keyword: data.keyword,
        locationCode: data.locationCode,
        languageCode: data.languageCode,
      },
      context,
    );
  });

export const compareCompetitorTraffic = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(competitorTrafficInputSchema)
  .handler(async ({ data, context }) => {
    return CompetitorTrafficService.compareDomains(
      {
        domains: data.domains,
        locationCode: data.locationCode,
        languageCode: data.languageCode,
      },
      context,
    );
  });

export const getCompetitorTopPages = createServerFn({ method: "POST" })
  .middleware([requireProjectContext])
  .validator(competitorTopPagesInputSchema)
  .handler(async ({ data, context }) => {
    return CompetitorTrafficService.topPages(
      {
        domain: data.domain,
        locationCode: data.locationCode,
        languageCode: data.languageCode,
        limit: data.limit,
      },
      context,
    );
  });

// --- Automations webhooks (org-scoped, managed from project settings) ---

export const listWebhooks = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .handler(async ({ context }) => {
    const webhooks = await WebhooksRepository.listForOrganization(
      context.organizationId,
    );
    const deliveries = await WebhooksRepository.listDeliveries(
      context.organizationId,
      30,
    );
    return {
      webhooks: webhooks.map((webhook) => ({
        id: webhook.id,
        url: webhook.url,
        events: JSON.parse(webhook.events) as string[],
        active: webhook.active,
        projectId: webhook.projectId,
        createdAt: webhook.createdAt,
      })),
      deliveries,
      availableEvents: WEBHOOK_EVENTS,
    };
  });

export const createWebhook = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .validator(webhookCreateInputSchema)
  .handler(async ({ data, context }) => {
    return WebhookEmitter.createWebhook({
      organizationId: context.organizationId,
      projectId: data.projectId ?? null,
      url: data.url,
      events: data.events,
    });
  });

export const updateWebhook = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .validator(webhookUpdateInputSchema)
  .handler(async ({ data, context }) => {
    await WebhooksRepository.updateWebhook(
      context.organizationId,
      data.webhookId,
      { active: data.active, events: data.events },
    );
    return { ok: true };
  });

export const deleteWebhook = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .validator(webhookActionInputSchema)
  .handler(async ({ data, context }) => {
    await WebhooksRepository.deleteWebhook(
      context.organizationId,
      data.webhookId,
    );
    return { ok: true };
  });

export const sendWebhookTestPing = createServerFn({ method: "POST" })
  .middleware([requireAuthenticatedContext])
  .validator(webhookActionInputSchema)
  .handler(async ({ data, context }) => {
    return WebhookEmitter.sendTestPing({
      organizationId: context.organizationId,
      webhookId: data.webhookId,
    });
  });
