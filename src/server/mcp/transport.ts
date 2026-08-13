import { createMcpHandler } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MCP_SCOPE } from "@/lib/oauth-resource";
import {
  type createWorkersOAuthMcpProps,
  MCP_AUTH_CONTEXT_PROP,
  MCP_ROUTE,
  runWithMcpToolAuthContext,
  workersOAuthMcpPropsSchema,
} from "@/server/mcp/context";
import { registerSeoToolMcpTools } from "@/server/mcp/server";

function createSeoToolMcpServer() {
  const server = new McpServer(
    {
      name: "SeoTool.im MCP",
      title: "SeoTool.im",
      version: "0.0.11",
      description:
        "SEO research tools for AI agents: keyword research and metrics, SERP and local SERP results, domain and backlink analysis, rank tracking, and Google Search Console performance.",
      websiteUrl: "https://seotool.im",
      icons: [
        {
          src: "https://seotool.im/android-chrome-512x512.png",
          mimeType: "image/png",
          sizes: ["512x512"],
        },
      ],
    },
    {
      instructions:
        "SeoTool.im research tools use credits. Proceed with normal focused research, but ask the user for confirmation before planned batches over 2,000 credits.",
    },
  );
  registerSeoToolMcpTools(server);

  return server;
}

export async function handleAuthenticatedSeoToolMcpRequest(
  request: Request,
  props: unknown,
  env: unknown,
  ctx: ExecutionContext,
): Promise<Response> {
  const result = workersOAuthMcpPropsSchema.safeParse(props);
  const scopes = result.success
    ? result.data[MCP_AUTH_CONTEXT_PROP].scopes
    : [];

  if (!result.success || !scopes.includes(MCP_SCOPE)) {
    return new Response("MCP auth context required", { status: 403 });
  }

  return handleSeoToolMcpRequest(request, result.data, env, ctx);
}

function handleSeoToolMcpRequest(
  request: Request,
  props: ReturnType<typeof createWorkersOAuthMcpProps> | undefined,
  env: unknown,
  ctx: ExecutionContext,
): Response | Promise<Response> {
  // Decline the optional standalone GET SSE stream: this server is stateless
  // (POST returns JSON) and pushes no server-initiated messages, so the stream
  // does nothing but leak memory — each GET is held open by a keepalive and
  // pins a per-request McpServer (~5MB), so a few dozen concurrent clients OOM
  // the 128MB isolate. 405 is the spec's "no stream" response; returning it
  // before building the server means a GET allocates nothing.
  if (request.method === "GET") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: {
        Allow: "POST, DELETE, OPTIONS",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  const server = createSeoToolMcpServer();
  const handler = createMcpHandler(server, {
    route: MCP_ROUTE,
    enableJsonResponse: true,
    authContext: props ? { props } : undefined,
    corsOptions: {
      headers:
        "Authorization, Content-Type, Last-Event-ID, mcp-protocol-version, mcp-session-id",
      exposeHeaders: "mcp-protocol-version, mcp-session-id",
    },
  });

  if (!props) return handler(request, env, ctx);

  return runWithMcpToolAuthContext(props[MCP_AUTH_CONTEXT_PROP], () =>
    handler(request, env, ctx),
  );
}

// Kept for backward compatibility with any caller that still references the
// self-hosted MCP path. The app is hosted-only now, so this always 404s.
export async function handleSelfHostedSeoToolMcpRequest(): Promise<Response> {
  return new Response("Not found", { status: 404 });
}
