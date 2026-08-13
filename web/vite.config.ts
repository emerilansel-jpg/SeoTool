import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import mdx from "fumadocs-mdx/vite";

// DOCKER_BUILD=1 disables the Cloudflare plugin for building inside Docker
// (where the Cloudflare Workers runtime is not available). Prerendering
// still works using Vite's built-in SSR since subscribe.ts now uses
// process.env instead of cloudflare:workers.
const isDockerBuild = process.env.DOCKER_BUILD === "1";

export default defineConfig({
  server: {
    port: 4322,
  },
  ssr: {
    resolve: {
      conditions: ["worker", "import", "module", "default"],
    },
  },
  plugins: [
    mdx(await import("./source.config")),
    tailwindcss(),
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    ...(isDockerBuild
      ? []
      : [
          cloudflare({
            viteEnvironment: { name: "ssr" },
          }),
        ]),
    tanstackStart({
      prerender: {
        // Prerendering requires the Cloudflare SSR plugin. In Docker builds
        // we skip it; Caddy serves index.html for all routes and the
        // client-side router handles the rest.
        enabled: !isDockerBuild,
      },
    }),
    react(),
  ],
});
