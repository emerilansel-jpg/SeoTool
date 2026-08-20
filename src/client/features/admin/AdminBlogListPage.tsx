import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  deleteAdminPost,
  listAdminPosts,
} from "@/serverFunctions/admin-content";
import { Modal } from "@/client/components/Modal";
import { getStandardErrorMessage } from "@/client/lib/error-messages";

export function AdminBlogListPage() {
  const listPosts = useServerFn(listAdminPosts);
  const deletePost = useServerFn(deleteAdminPost);
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: () => listPosts(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePost({ data: { id } }),
    onSuccess: () => {
      toast.success("Post deleted.");
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Could not delete post."));
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-base-content/70">
          Published posts appear instantly on the public /blogs pages.
        </p>
        <Link to="/admin/blog/new" className="btn btn-primary btn-sm gap-1">
          <Plus className="size-4" /> New post
        </Link>
      </div>

      <div className="card bg-base-100 border border-base-300 overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <div className="skeleton h-32 rounded-lg" />
          </div>
        ) : !data || data.length === 0 ? (
          <div className="border border-dashed border-base-300 rounded-lg m-4 p-8 text-center text-sm text-base-content/50">
            No posts yet. Create the first one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Published</th>
                  <th>Updated</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <div className="font-medium">{post.title}</div>
                      <div className="font-mono text-xs text-base-content/50">
                        /blogs/{post.slug}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge badge-sm ${post.status === "published" ? "badge-success" : "badge-ghost"}`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="text-sm tabular-nums text-base-content/60">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="text-sm tabular-nums text-base-content/60">
                      {new Date(post.updatedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Link
                          to="/admin/blog/$postId"
                          params={{ postId: post.id }}
                          className="btn btn-ghost btn-xs btn-square"
                          aria-label={`Edit ${post.title}`}
                        >
                          <Pencil className="size-3.5" />
                        </Link>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs btn-square text-error"
                          aria-label={`Delete ${post.title}`}
                          onClick={() =>
                            setDeleteTarget({ id: post.id, title: post.title })
                          }
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteTarget ? (
        <Modal
          labelledBy="delete-post-title"
          onClose={() => setDeleteTarget(null)}
        >
          <h3 id="delete-post-title" className="font-semibold text-base">
            Delete &quot;{deleteTarget.title}&quot;?
          </h3>
          <p className="text-sm text-base-content/60">
            The post and its public URL are removed immediately. This cannot be
            undone.
          </p>
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-error btn-sm"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(deleteTarget.id)}
            >
              Delete
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
