import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import {
  createAdminPage,
  getAdminPage,
  updateAdminPage,
} from "@/serverFunctions/admin-content";
import { Markdown } from "@/client/components/Markdown";
import { getStandardErrorMessage } from "@/client/lib/error-messages";

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminPageEditorPage() {
  // strict:false so the same component serves /admin/pages/new and /$postId.
  const params = useParams({ strict: false });
  const pageId =
    typeof params.postId === "string" && params.postId !== "new"
      ? params.postId
      : null;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchPage = useServerFn(getAdminPage);
  const create = useServerFn(createAdminPage);
  const update = useServerFn(updateAdminPage);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [contentMd, setContentMd] = useState("");
  const [published, setPublished] = useState(false);
  const [preview, setPreview] = useState(false);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  const { data: page, isLoading } = useQuery({
    queryKey: ["admin-cms-page", pageId],
    // The enabled gate guarantees pageId is set when this runs.
    queryFn: () => {
      if (pageId === null) throw new Error("Page id missing");
      return fetchPage({ data: { id: pageId } });
    },
    enabled: pageId !== null,
  });

  useEffect(() => {
    if (page && loadedFor !== page.id) {
      setLoadedFor(page.id);
      setTitle(page.title);
      setSlug(page.slug);
      setSlugTouched(true);
      setContentMd(page.contentMd);
      setPublished(page.status === "published");
    }
  }, [page, loadedFor]);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        slug: slug || slugify(title),
        title,
        contentMd,
        published,
      };
      if (pageId) {
        return update({ data: { ...payload, id: pageId } });
      }
      return create({ data: payload });
    },
    onSuccess: (saved) => {
      toast.success(pageId ? "Page updated." : "Page created.");
      void queryClient.invalidateQueries({ queryKey: ["admin-pages-cms"] });
      if (!pageId && saved?.id) {
        void navigate({
          to: "/admin/pages/$postId",
          params: { postId: saved.id },
          replace: true,
        });
      } else {
        void queryClient.invalidateQueries({
          queryKey: ["admin-cms-page", pageId],
        });
      }
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Could not save page."));
    },
  });

  if (isLoading && pageId) {
    return <div className="skeleton h-96 rounded-lg" aria-busy="true" />;
  }

  const canSave =
    title.trim() !== "" && contentMd.trim() !== "" && !saveMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link to="/admin/pages" className="btn btn-ghost btn-xs gap-1">
          <ArrowLeft className="size-3.5" /> Pages
        </Link>
        <label className="label cursor-pointer gap-2 text-sm">
          <span className="label-text">Published</span>
          <input
            type="checkbox"
            className="toggle toggle-primary toggle-sm"
            checked={published}
            onChange={(event) => setPublished(event.target.checked)}
          />
        </label>
      </div>

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4 gap-3">
          <input
            type="text"
            className="input input-bordered w-full text-lg font-semibold"
            placeholder="Page title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <label className="form-control">
            <span className="label-text text-xs font-medium">
              Slug (legal slugs like privacy map to their fixed path; anything
              else serves under /pages/)
            </span>
            <input
              type="text"
              className="input input-bordered input-sm w-full font-mono"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
            />
          </label>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Content (Markdown)</span>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => setPreview((value) => !value)}
            >
              {preview ? "Edit" : "Preview"}
            </button>
          </div>
          {preview ? (
            <div className="min-h-64 rounded-lg border border-base-300 bg-base-200/30 p-4">
              <Markdown>{contentMd || "_Nothing to preview yet._"}</Markdown>
            </div>
          ) : (
            <textarea
              className="textarea textarea-bordered w-full min-h-64 font-mono text-sm leading-relaxed"
              placeholder="Write the page in Markdown..."
              value={contentMd}
              onChange={(event) => setContentMd(event.target.value)}
            />
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={!canSave}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending
                ? "Saving..."
                : pageId
                  ? "Save changes"
                  : "Create page"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
