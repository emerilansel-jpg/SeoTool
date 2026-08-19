import { createCsrfMiddleware, createStart } from "@tanstack/react-start";
import { globalServerFunctionMiddleware } from "@/serverFunctions/middleware";
import { unauthenticatedRedirectMiddleware } from "@/middleware/unauthenticated-redirect";

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [unauthenticatedRedirectMiddleware, csrfMiddleware],
  functionMiddleware: globalServerFunctionMiddleware,
}));
