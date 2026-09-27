import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/cms/images/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const cleanId = params.id.replace(/\.[a-zA-Z0-9]+$/, "");
        const { CmsRepository } = await import(
          "@/server/features/admin/repositories/CmsRepository"
        );

        const row = await CmsRepository.getImageById(cleanId);
        if (!row) {
          return new Response("Image not found", { status: 404 });
        }

        const binaryString = atob(row.dataBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        return new Response(bytes, {
          headers: {
            "Content-Type": row.mimeType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
