// oxlint-disable max-lines, max-lines-per-function
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Trash2,
  Globe,
  Search,
  Code,
  Check,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import {
  createAdminPost,
  getAdminPost,
  updateAdminPost,
  uploadCmsImage,
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
  const params = useParams({ strict: false });
  const postId =
    typeof params.postId === "string" && params.postId !== "new"
      ? params.postId
      : null;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPost = useServerFn(getAdminPost);
  const create = useServerFn(createAdminPost);
  const update = useServerFn(updateAdminPost);
  const uploadImageFn = useServerFn(uploadCmsImage);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [contentMd, setContentMd] = useState("");
  const [published, setPublished] = useState(false);
  const [preview, setPreview] = useState(false);

  // Advanced SEO & Media State
  const [featuredImage, setFeaturedImage] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [schemaJson, setSchemaJson] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "seo" | "schema">(
    "editor",
  );

  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  const { data: post, isLoading } = useQuery({
    queryKey: ["admin-post", postId],
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
      setFeaturedImage(post.featuredImage ?? "");
      setMetaTitle(post.metaTitle ?? "");
      setMetaDescription(post.metaDescription ?? "");
      setSchemaJson(post.schemaJson ?? "");
    }
  }, [post, loadedFor]);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 7 * 1024 * 1024) {
      toast.error("Image file must be under 7MB.");
      return;
    }

    if (!/^image\/(png|jpeg|jpg|webp|gif|svg\+xml)$/i.test(file.type)) {
      toast.error(
        "Please select a valid image format (PNG, JPG, WebP, GIF, or SVG).",
      );
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.addEventListener("load", async () => {
      try {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        if (!base64) throw new Error("Could not parse image base64 data.");

        const uploaded = await uploadImageFn({
          data: {
            filename: file.name,
            mimeType: file.type,
            base64,
          },
        });

        setFeaturedImage(uploaded.url);
        toast.success("Featured image uploaded successfully.");
      } catch (err) {
        toast.error(getStandardErrorMessage(err, "Failed to upload image."));
      } finally {
        setIsUploading(false);
      }
    });
    reader.addEventListener("error", () => {
      toast.error("Failed to read image file.");
      setIsUploading(false);
    });
    reader.readAsDataURL(file);
  };

  const isSchemaValid = (() => {
    if (!schemaJson.trim()) return null;
    try {
      JSON.parse(schemaJson);
      return true;
    } catch {
      return false;
    }
  })();

  const handleGenerateArticleSchema = () => {
    const schemaObj = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: metaTitle.trim() || title.trim() || "Post Title",
      description:
        metaDescription.trim() ||
        description.trim() ||
        "Post Description Summary",
      image: featuredImage.trim() || "https://seotool.im/logo.png",
      author: {
        "@type": "Organization",
        name: "SeoTool.im Team",
        url: "https://seotool.im",
      },
      publisher: {
        "@type": "Organization",
        name: "SeoTool.im",
        logo: {
          "@type": "ImageObject",
          url: "https://seotool.im/logo.png",
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://seotool.im/blogs/${slug || "post-slug"}`,
      },
    };
    setSchemaJson(JSON.stringify(schemaObj, null, 2));
    toast.success("Article JSON-LD schema template generated.");
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        slug: slug || slugify(title),
        title,
        description: description || undefined,
        contentMd,
        published,
        featuredImage: featuredImage || undefined,
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        schemaJson: schemaJson || undefined,
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
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/admin/blog" className="btn btn-ghost btn-xs gap-1.5">
          <ArrowLeft className="size-3.5" /> Back to Blog List
        </Link>
        <div className="flex items-center gap-4">
          <label className="label cursor-pointer gap-2 text-sm font-medium">
            <span className="label-text">Publish Status:</span>
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm"
              checked={published}
              onChange={(event) => setPublished(event.target.checked)}
            />
            <span
              className={`text-xs font-bold ${
                published ? "text-success" : "text-base-content/50"
              }`}
            >
              {published ? "Published" : "Draft"}
            </span>
          </label>

          <button
            type="button"
            className="btn btn-primary btn-sm px-5"
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

      {/* Main Tabs Navigation */}
      <div className="tabs tabs-box bg-base-200/60 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab("editor")}
          className={`tab tab-sm gap-2 font-semibold transition-all ${
            activeTab === "editor" ? "tab-active bg-base-100 shadow-sm" : ""
          }`}
        >
          <ImageIcon className="size-3.5" />
          <span>Post Content & Media</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("seo")}
          className={`tab tab-sm gap-2 font-semibold transition-all ${
            activeTab === "seo" ? "tab-active bg-base-100 shadow-sm" : ""
          }`}
        >
          <Globe className="size-3.5" />
          <span>SEO, Meta & URL Slug</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("schema")}
          className={`tab tab-sm gap-2 font-semibold transition-all ${
            activeTab === "schema" ? "tab-active bg-base-100 shadow-sm" : ""
          }`}
        >
          <Code className="size-3.5" />
          <span>Structured Data (JSON-LD)</span>
        </button>
      </div>

      {/* TAB 1: Editor & Featured Image */}
      {activeTab === "editor" ? (
        <div className="space-y-5">
          {/* Post Title & Quick Summary */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-5 gap-4">
              <label className="form-control">
                <span className="label-text text-xs font-bold uppercase tracking-wider text-base-content/70">
                  Post Title *
                </span>
                <input
                  type="text"
                  className="input input-bordered w-full text-lg font-bold mt-1"
                  placeholder="e.g. The Dark Query Problem: Why Search Console Hides Searches"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>

              <label className="form-control">
                <span className="label-text text-xs font-bold uppercase tracking-wider text-base-content/70">
                  Article Summary / Excerpt
                </span>
                <input
                  type="text"
                  className="input input-bordered input-sm w-full mt-1"
                  placeholder="Short engaging hook displayed on blog index and social cards"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </label>
            </div>
          </div>

          {/* Featured Image Upload & URL Card */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-5 gap-4">
              <div className="flex items-center justify-between border-b border-base-200 pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="size-4 text-primary" />
                  <span className="text-sm font-bold text-base-content">
                    Featured Image
                  </span>
                </div>
                {featuredImage ? (
                  <button
                    type="button"
                    onClick={() => setFeaturedImage("")}
                    className="btn btn-ghost btn-xs text-error gap-1 hover:bg-error/10"
                  >
                    <Trash2 className="size-3.5" /> Remove Image
                  </button>
                ) : null}
              </div>

              {featuredImage ? (
                <div className="space-y-3">
                  <div className="relative overflow-hidden rounded-xl border border-base-300 bg-base-200/50 max-h-72 flex items-center justify-center">
                    <img
                      src={featuredImage}
                      alt="Featured Preview"
                      className="max-h-72 w-auto object-contain rounded-lg"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs text-base-content/70">
                    <span className="truncate font-mono">{featuredImage}</span>
                    <a
                      href={featuredImage}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-ghost btn-xs gap-1"
                    >
                      <ExternalLink className="size-3" /> View
                    </a>
                  </div>
                </div>
              ) : null}

              {/* Upload Input & External URL */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer border-2 border-dashed border-base-300 hover:border-primary/60 rounded-xl p-5 text-center transition-colors bg-base-200/30 flex flex-col items-center justify-center gap-2"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                    className="hidden"
                    onChange={handleImageFileChange}
                    disabled={isUploading}
                  />
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Upload className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-base-content">
                      {isUploading
                        ? "Uploading image..."
                        : "Click to upload image"}
                    </p>
                    <p className="text-[11px] text-base-content/50">
                      PNG, JPG, WebP, SVG up to 7MB
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-2 rounded-xl border border-base-300 bg-base-200/20 p-4">
                  <label className="form-control">
                    <span className="label-text text-xs font-semibold">
                      Or paste Image URL
                    </span>
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full font-mono text-xs mt-1"
                      placeholder="https://... or /blog/..."
                      value={featuredImage}
                      onChange={(e) => setFeaturedImage(e.target.value)}
                    />
                  </label>
                  <p className="text-[11px] text-base-content/50 leading-relaxed">
                    Used for blog hero banner, index thumbnails, OpenGraph
                    social cards, and Article schema.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Markdown Content Editor */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-5 gap-3">
              <div className="flex items-center justify-between border-b border-base-200 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                  Article Body (Markdown) *
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs font-semibold"
                  onClick={() => setPreview((value) => !value)}
                >
                  {preview ? "Switch to Edit" : "Live Markdown Preview"}
                </button>
              </div>

              {preview ? (
                <div className="min-h-96 rounded-xl border border-base-300 bg-base-100 p-6">
                  <Markdown>
                    {contentMd || "_Nothing to preview yet. Start typing!_"}
                  </Markdown>
                </div>
              ) : (
                <textarea
                  className="textarea textarea-bordered w-full min-h-96 font-mono text-sm leading-relaxed p-4"
                  placeholder="Write the article in Markdown format (use ## for subheadings, - for lists, > for quotes)..."
                  value={contentMd}
                  onChange={(event) => setContentMd(event.target.value)}
                />
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* TAB 2: SEO, Meta & URL Slug */}
      {activeTab === "seo" ? (
        <div className="space-y-5">
          {/* URL Slug & Permalink */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-5 gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                  Permalink / URL Slug
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setSlugTouched(true);
                    setSlug(slugify(title));
                  }}
                  className="btn btn-ghost btn-xs text-primary gap-1"
                >
                  <Sparkles className="size-3" /> Auto-generate from title
                </button>
              </div>

              <div className="flex rounded-xl border border-base-300 bg-base-200/50 overflow-hidden items-center focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                <span className="px-3.5 py-2 text-xs font-mono text-base-content/50 border-r border-base-300 bg-base-200">
                  https://seotool.im/blogs/
                </span>
                <input
                  type="text"
                  className="input input-ghost input-sm flex-1 font-mono text-xs focus:outline-none"
                  placeholder="article-slug"
                  value={slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setSlug(event.target.value);
                  }}
                />
              </div>
              <p className="text-[11px] text-base-content/50">
                Lowercase alphanumeric characters and hyphens only.
              </p>
            </div>
          </div>

          {/* Meta Title & Meta Description */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-5 gap-4">
              <h3 className="text-sm font-bold text-base-content flex items-center gap-2 border-b border-base-200 pb-3">
                <Search className="size-4 text-primary" /> Search Engine
                Metadata
              </h3>

              {/* Meta Title */}
              <label className="form-control">
                <div className="flex justify-between items-center">
                  <span className="label-text text-xs font-bold uppercase tracking-wider text-base-content/70">
                    SEO Meta Title
                  </span>
                  <span
                    className={`text-[11px] font-semibold ${
                      metaTitle.length >= 45 && metaTitle.length <= 60
                        ? "text-success"
                        : metaTitle.length > 60
                          ? "text-warning"
                          : "text-base-content/50"
                    }`}
                  >
                    {metaTitle.length || title.length} / 60 characters
                  </span>
                </div>
                <input
                  type="text"
                  className="input input-bordered input-sm w-full mt-1"
                  placeholder={title || "SEO Title displayed in Google Search"}
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                />
                <span className="text-[11px] text-base-content/50 mt-1">
                  Leave blank to use the standard post title automatically.
                </span>
              </label>

              {/* Meta Description */}
              <label className="form-control">
                <div className="flex justify-between items-center">
                  <span className="label-text text-xs font-bold uppercase tracking-wider text-base-content/70">
                    SEO Meta Description
                  </span>
                  <span
                    className={`text-[11px] font-semibold ${
                      metaDescription.length >= 140 &&
                      metaDescription.length <= 160
                        ? "text-success"
                        : metaDescription.length > 160
                          ? "text-warning"
                          : "text-base-content/50"
                    }`}
                  >
                    {metaDescription.length || description.length} / 160
                    characters
                  </span>
                </div>
                <textarea
                  className="textarea textarea-bordered textarea-sm w-full mt-1 min-h-20"
                  placeholder={
                    description ||
                    "Enter a compelling meta description to maximize organic click-through rate (CTR)..."
                  }
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                />
                <span className="text-[11px] text-base-content/50 mt-1">
                  Leave blank to use the article summary automatically.
                </span>
              </label>
            </div>
          </div>

          {/* Live Google Search Preview Card */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-5 gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                Live Google Search Snippet Preview
              </span>

              <div className="rounded-xl border border-base-200 bg-white p-5 shadow-sm text-slate-900 font-sans space-y-1">
                {/* Site & Breadcrumb */}
                <div className="flex items-center gap-2 text-xs text-neutral-600">
                  <div className="size-4 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold">
                    S
                  </div>
                  <span className="font-semibold text-slate-800">
                    seotool.im
                  </span>
                  <span className="text-slate-400">›</span>
                  <span className="truncate">blogs › {slug || "post-slug"}</span>
                </div>

                {/* Title Link */}
                <h4 className="text-lg font-medium text-blue-700 hover:underline leading-snug cursor-pointer pt-0.5">
                  {metaTitle.trim() || title.trim() || "Post Title Goes Here"}{" "}
                  - SeoTool.im Blog
                </h4>

                {/* Snippet Description */}
                <p className="text-xs leading-relaxed text-neutral-600 line-clamp-2">
                  {metaDescription.trim() ||
                    description.trim() ||
                    "This is an accurate preview of how your article snippet, meta title, and description will look on Google desktop search results."}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* TAB 3: Structured Data / Schema */}
      {activeTab === "schema" ? (
        <div className="space-y-5">
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-5 gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-200 pb-3">
                <div className="flex items-center gap-2">
                  <Code className="size-4 text-primary" />
                  <span className="text-sm font-bold text-base-content">
                    Custom Schema.org (JSON-LD)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isSchemaValid === true ? (
                    <span className="badge badge-success badge-sm gap-1 font-semibold text-white">
                      <Check className="size-3" /> Valid JSON
                    </span>
                  ) : isSchemaValid === false ? (
                    <span className="badge badge-error badge-sm gap-1 font-semibold text-white">
                      <AlertCircle className="size-3" /> Invalid JSON Syntax
                    </span>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleGenerateArticleSchema}
                    className="btn btn-outline btn-xs gap-1"
                  >
                    <Sparkles className="size-3" /> Load Article Template
                  </button>
                </div>
              </div>

              <p className="text-xs text-base-content/70 leading-relaxed">
                Add custom structured data to enhance rich results on Google
                (e.g. Article, FAQPage, HowTo, or Speakable). If empty, standard
                Article schema will be generated automatically.
              </p>

              <textarea
                className="textarea textarea-bordered w-full min-h-80 font-mono text-xs leading-relaxed p-4"
                placeholder='{\n  "@context": "https://schema.org",\n  "@type": "Article",\n  "headline": "..."\n}'
                value={schemaJson}
                onChange={(e) => setSchemaJson(e.target.value)}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
