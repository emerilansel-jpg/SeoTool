import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import {
  createAdminPost,
  getAdminPost,
  updateAdminPost,
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

export function AdminBlogEditorPage() {
  // strict:false so the same component serves /admin/blog/new and /$postId.
  const params = useParams({ strict: false });
  // The /admin/blog/new route renders this component without a post id.
  const postId =
    typeof params.postId === "string" && params.postId !== "new"
      ? params.postId
      : null;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchPost = useServerFn(getAdminPost);
  const create = useServerFn(createAdminPost);
  const update = useServerFn(updateAdminPost);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [contentMd, setContentMd] = useState("");
  const [published, setPublished] = useState(false);
  const [preview, setPreview] = useState(false);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  const { data: post, isLoading } = useQuery({
    queryKey: ["admin-post", postId],
    // The enabled gate guarantees postId is set when this runs.
    queryFn: () => {
      if (postId === null) throw new Error("Post id missing");
      return fetchPost({ data: { id: postId } });
    },
    enabled: postId !== null,
  });

  useEffect(() => {
    if (post && loadedFor !== post.id) {
      setLoadedFor(post.id);
      setTitle(post.title);
      setSlug(post.slug);
      setSlugTouched(true);
      setDescription(post.description ?? "");
      setContentMd(post.contentMd);
      setPublished(post.status === "published");
    }
  }, [post, loadedFor]);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        slug: slug || slugify(title),
        title,
        description: description || undefined,
        contentMd,
        published,
      };
      if (postId) {
        return update({ data: { ...payload, id: postId } });
      }
      return create({ data: payload });
    },
    onSuccess: (saved) => {
      toast.success(postId ? "Post updated." : "Post created.");
      void queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      if (!postId && saved?.id) {
        void navigate({
          to: "/admin/blog/$postId",
          params: { postId: saved.id },
          replace: true,
        });
      } else {
        void queryClient.invalidateQueries({
          queryKey: ["admin-post", postId],
        });
      }
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Could not save post."));
    },
  });

  if (isLoading && postId) {
    return <div className="skeleton h-96 rounded-lg" aria-busy="true" />;
  }

  const canSave =
    title.trim() !== "" && contentMd.trim() !== "" && !saveMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link to="/admin/blog" className="btn btn-ghost btn-xs gap-1">
          <ArrowLeft className="size-3.5" /> Blog
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
            placeholder="Post title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="form-control">
              <span className="label-text text-xs font-medium">
                Slug (/blogs/...)
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
            <label className="form-control">
              <span className="label-text text-xs font-medium">
                Description (meta)
              </span>
              <input
                type="text"
                className="input input-bordered input-sm w-full"
                placeholder="Short summary for search results"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>
          </div>

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
              placeholder="Write the post in Markdown..."
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
                : postId
                  ? "Save changes"
                  : "Create post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
