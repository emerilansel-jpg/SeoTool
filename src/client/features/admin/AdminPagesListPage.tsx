import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  deleteAdminPage,
  listAdminPages,
} from "@/serverFunctions/admin-content";
import { Modal } from "@/client/components/Modal";
import { getStandardErrorMessage } from "@/client/lib/error-messages";

export function AdminPagesListPage() {
  const listPages = useServerFn(listAdminPages);
  const deletePage = useServerFn(deleteAdminPage);
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-pages-cms"],
    queryFn: () => listPages(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePage({ data: { id } }),
    onSuccess: () => {
      toast.success("Page deleted.");
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-pages-cms"] });
    },
    onError: (error) => {
      toast.error(getStandardErrorMessage(error, "Could not delete page."));
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-base-content/70">
          Legal pages (privacy, terms, ...) and custom pages served under
          /pages/. Fixed legal paths fall back to their static content until a
          published page exists for the slug.
        </p>
        <Link to="/admin/pages/new" className="btn btn-primary btn-sm gap-1">
          <Plus className="size-4" /> New page
        </Link>
      </div>

      <div className="card bg-base-100 border border-base-300 overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <div className="skeleton h-32 rounded-lg" />
          </div>
        ) : !data || data.length === 0 ? (
          <div className="border border-dashed border-base-300 rounded-lg m-4 p-8 text-center text-sm text-base-content/50">
            No CMS pages yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.map((page) => (
                  <tr key={page.id}>
                    <td>
                      <div className="font-medium">{page.title}</div>
                      <div className="font-mono text-xs text-base-content/50">
                        /{page.slug}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge badge-sm ${page.status === "published" ? "badge-success" : "badge-ghost"}`}
                      >
                        {page.status}
                      </span>
                    </td>
                    <td className="text-sm tabular-nums text-base-content/60">
                      {new Date(page.updatedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Link
                          to="/admin/pages/$postId"
                          params={{ postId: page.id }}
                          className="btn btn-ghost btn-xs btn-square"
                          aria-label={`Edit ${page.title}`}
                        >
                          <Pencil className="size-3.5" />
                        </Link>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs btn-square text-error"
                          aria-label={`Delete ${page.title}`}
                          onClick={() =>
                            setDeleteTarget({ id: page.id, title: page.title })
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
          labelledBy="delete-page-title"
          onClose={() => setDeleteTarget(null)}
        >
          <h3 id="delete-page-title" className="font-semibold text-base">
            Delete &quot;{deleteTarget.title}&quot;?
          </h3>
          <p className="text-sm text-base-content/60">
            The page and its public URL are removed immediately. This cannot be
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
