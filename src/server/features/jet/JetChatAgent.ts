import { Think } from "@cloudflare/think";
import type {
  ChatResponseResult,
  Session,
  StepContext,
  TurnConfig,
  TurnContext,
} from "@cloudflare/think";
import { clearChatTerminal } from "agents/chat";
import type { UIMessage } from "ai";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, withPgClient } from "@/db";
import { user } from "@/db/schema";
import { openRouterCostUsd } from "@/server/lib/chatAgent";
import { JetSessionRepository } from "@/server/features/jet/JetSessionRepository";
import { JetProjectMemoryRepository } from "@/server/features/jet/JetProjectMemoryRepository";
import { ProjectRepository } from "@/server/features/projects/repositories/ProjectRepository";
import { buildJetMcpTools } from "@/server/features/jet/jetChatTools";
import { buildJetSystemPrompt } from "@/server/features/jet/jetSystemPrompt";
import {
  buildChatAgentModel,
  getChatAgentModel,
} from "@/server/lib/openrouter";
import type { LanguageModelV3 } from "@openrouter/ai-sdk-provider";
import {
  getEnvValueSync,
  getOptionalEnvValue,
  isHostedServerAuthMode,
} from "@/server/lib/runtime-env";
import {
  checkUsageCreditsDepleted,
  trackUsageCreditSpend,
} from "@/server/billing/subscription";
import { getPublicOrigin } from "@/server/mcp/public-origin";
import { MCP_SCOPE } from "@/lib/oauth-resource";
import { buildFirstPartyMcpAuthContext } from "@/server/mcp/context";

// Jet's writable context blocks, backed by sam_project_memory rows shared by
// every chat session in the project.
const MEMORY_BLOCK = "memory";
const RESEARCH_LOG_BLOCK = "research_log";

const PUBLIC_ORIGIN_KEY = "jet-public-origin";

// Derive a short session title from the first user message.
function deriveTitle(text: string): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (!trimmed) return "New chat";
  return trimmed.length > 60 ? `${trimmed.slice(0, 57)}…` : trimmed;
}

function firstUserText(messages: UIMessage[]): string {
  const firstUser = messages.find((message) => message.role === "user");
  const textPart = firstUser?.parts.find((part) => part.type === "text");
  return textPart?.text ?? "";
}

export type JetContext = {
  row: NonNullable<
    Awaited<ReturnType<typeof JetSessionRepository.getSessionById>>
  >;
  project: NonNullable<
    Awaited<ReturnType<typeof ProjectRepository.getProjectById>>
  >;
  userEmail: string;
};

export type SamContext = JetContext;

/**
 * Durable Object backing the Jet in-app agent, built on Think. One DO per chat
 * session; the DO instance name IS the session id.
 */
export class JetChatAgent extends Think {
  override workspaceBash = false;

  private jetContext: JetContext | null = null;
  private turnCostUsd = 0;
  private turnMonthlyRemaining: number | null = null;

  async fetch(request: Request): Promise<Response> {
    await Promise.all([
      this.ctx.storage.put(PUBLIC_ORIGIN_KEY, getPublicOrigin(request)),
      getOptionalEnvValue("OPENROUTER_API_KEY"),
    ]);
    return super.fetch(request);
  }

  getModel() {
    const apiKey = getEnvValueSync(this.env, "OPENROUTER_API_KEY");
    if (apiKey) {
      return buildChatAgentModel(
        apiKey,
        getEnvValueSync(this.env, "OPENROUTER_MODEL"),
        getEnvValueSync(this.env, "OPENROUTER_BASE_URL"),
      );
    }

    // Fallback: provide placeholder if sync lookup hasn't cached DB settings yet.
    // beforeTurn() resolves the true model asynchronously from getChatAgentModel().
    return buildChatAgentModel(
      "sk-pesat-placeholder",
      getEnvValueSync(this.env, "OPENROUTER_MODEL"),
      getEnvValueSync(this.env, "OPENROUTER_BASE_URL"),
    );
  }

  configureSession(session: Session): Session {
    return session
      .withContext("soul", {
        provider: { get: () => this.buildSoulPrompt() },
      })
      .withContext(MEMORY_BLOCK, {
        description:
          "Durable facts about this project: business, positioning, goals, target market, competitors, settled strategy decisions. Rewrite to fold in anything that should survive this chat.",
        maxTokens: 2000,
        provider: this.projectBlockProvider(MEMORY_BLOCK),
      })
      .withContext(RESEARCH_LOG_BLOCK, {
        description:
          'Dated one-line log of completed research, newest first: "YYYY-MM-DD — <what>: <inputs>. Verdict: <conclusion>". Append when you finish a research arc.',
        maxTokens: 2000,
        provider: this.projectBlockProvider(RESEARCH_LOG_BLOCK),
      });
  }

  private async loadJetContext(): Promise<JetContext | null> {
    if (this.jetContext) return this.jetContext;
    const row = await JetSessionRepository.getSessionById(this.name);
    if (!row) return null;
    const project = await ProjectRepository.getProjectById(row.projectId);
    if (!project) return null;
    const [creator] = await db
      .select({ email: user.email })
      .from(user)
      .where(eq(user.id, row.userId))
      .limit(1);
    if (!creator) return null;
    this.jetContext = { row, project, userEmail: creator.email };
    return this.jetContext;
  }

  private buildSoulPrompt(): Promise<string> {
    return withPgClient(async () => {
      // Warm up settings overrides cache before getModel() is called by Think
      await getOptionalEnvValue("OPENROUTER_API_KEY");
      const ctx = await this.loadJetContext();
      if (!ctx) {
        return "You are Jet, the SEO agent inside SeoTool.im. This chat session no longer exists; tell the user to start a new chat.";
      }
      const memory = await JetProjectMemoryRepository.getBlock(
        ctx.project.id,
        MEMORY_BLOCK,
      );
      return buildJetSystemPrompt(
        {
          projectId: ctx.project.id,
          projectName: ctx.project.name,
          domain: ctx.project.domain,
          locationCode: ctx.project.locationCode,
          languageCode: ctx.project.languageCode,
        },
        { memoryIsEmpty: !memory?.trim() },
      );
    });
  }

  private projectBlockProvider(label: string) {
    return {
      get: (): Promise<string | null> =>
        withPgClient(async () => {
          const ctx = await this.loadJetContext();
          if (!ctx) return null;
          return JetProjectMemoryRepository.getBlock(ctx.project.id, label);
        }),
      set: (content: string): Promise<void> =>
        withPgClient(async () => {
          const ctx = await this.loadJetContext();
          if (!ctx) return;
          await JetProjectMemoryRepository.setBlock(
            ctx.project.id,
            label,
            content,
          );
        }),
    };
  }

  private refusalTurn(text: string, model?: LanguageModelV3): TurnConfig {
    return {
      model,
      system: `Reply with exactly the following message and nothing else: ${text}`,
      messages: [{ role: "user", content: "Acknowledge." }],
      activeTools: [],
      maxSteps: 1,
      maxOutputTokens: 200,
      maxRetries: 0,
    };
  }

  async beforeTurn(_ctx: TurnContext): Promise<TurnConfig> {
    this.turnCostUsd = 0;
    this.turnMonthlyRemaining = null;
    return withPgClient(async (): Promise<TurnConfig> => {
      // ponytail: resolve model dynamically each turn so admin settings DB overrides take effect immediately
      const model = await getChatAgentModel();

      const ctx = await this.loadJetContext();
      if (!ctx) {
        return this.refusalTurn(
          "I couldn't find this chat session. Please start a new one.",
          model,
        );
      }

      const { organizationId } = ctx.project;
      if (await isHostedServerAuthMode()) {
        const { depleted, monthlyRemaining } = await checkUsageCreditsDepleted({
          userId: ctx.row.userId,
          userEmail: ctx.userEmail,
          organizationId,
          projectId: ctx.project.id,
        });
        if (depleted) {
          return this.refusalTurn(
            "You're out of credits. Top up to keep using Jet.",
            model,
          );
        }
        this.turnMonthlyRemaining = monthlyRemaining;
      }

      const baseUrl =
        (await this.ctx.storage.get<string>(PUBLIC_ORIGIN_KEY)) ??
        "https://seotool.im";
      const authContext = buildFirstPartyMcpAuthContext({
        userId: ctx.row.userId,
        userEmail: ctx.userEmail,
        organizationId,
        baseUrl,
        scopes: [MCP_SCOPE],
      });

      return {
        model,
        tools: buildJetMcpTools(authContext, {
          id: ctx.project.id,
          domain: ctx.project.domain,
        }),
        maxSteps: 48,
        maxOutputTokens: 6000,
      };
    });
  }

  onStepFinish(ctx: StepContext): void {
    this.turnCostUsd += openRouterCostUsd(ctx.providerMetadata);
  }

  async onChatResponse(result: ChatResponseResult): Promise<void> {
    await withPgClient(async () => {
      const ctx = await this.loadJetContext();
      if (!ctx) return;

      if (this.turnMonthlyRemaining !== null) {
        await trackUsageCreditSpend({
          customer: {
            userId: ctx.row.userId,
            userEmail: ctx.userEmail,
            organizationId: ctx.project.organizationId,
            projectId: ctx.project.id,
          },
          customerId: ctx.project.organizationId,
          creditFeature: "agent",
          costUsd: this.turnCostUsd,
          monthlyRemaining: this.turnMonthlyRemaining,
          properties: { provider: "openrouter" },
        });
      }

      if (ctx.row.title === "New chat") {
        const title = deriveTitle(firstUserText(this.messages));
        if (title !== "New chat") {
          await JetSessionRepository.setTitle(ctx.row.id, title);
          ctx.row.title = title;
        }
      } else {
        await JetSessionRepository.touch(ctx.row.id);
      }
    });

    if (result.status === "completed") {
      await withPgClient(() => this.session.refreshSystemPrompt()).catch(
        (error: unknown) => {
          console.error("[jet] context refresh failed", error);
        },
      );
    }
  }

  onChatError(error: unknown, ctx?: unknown): Error {
    console.error("[jet] chat turn error", error, ctx);
    return error instanceof Error ? error : new Error(String(error));
  }

  async onRequest(request: Request): Promise<Response> {
    if (
      request.method === "POST" &&
      new URL(request.url).pathname.endsWith("/rewind")
    ) {
      const body = z
        .object({ messageId: z.string().min(1) })
        .safeParse(await request.json().catch(() => null));
      if (!body.success) {
        return Response.json({ error: "messageId required" }, { status: 400 });
      }
      const { messageId } = body.data;
      this.cancelAllChats();
      await this.waitUntilStable({ timeout: 5000 });
      const index = this.messages.findIndex(
        (message) => message.id === messageId,
      );
      if (index === -1) {
        return Response.json({ error: "message not found" }, { status: 404 });
      }

      const ids = this.messages.slice(index).map((message) => message.id);
      await this.session.deleteMessages(ids);
      await clearChatTerminal(this.ctx.storage);
      return Response.json({ ok: true });
    }
    return super.onRequest(request);
  }
}

export const SamChatAgent = JetChatAgent;
