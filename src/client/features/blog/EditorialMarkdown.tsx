import type { ComponentPropsWithoutRef, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { slugifyHeading } from "./blogMetadata";

type Props = {
  children: string;
  className?: string;
};

function getNodeText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join("");
  if (node && typeof node === "object" && "props" in node) {
    const props = (node as { props?: { children?: ReactNode } }).props;
    if (props?.children) return getNodeText(props.children);
  }
  return "";
}

function isHttpUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    if (url.username || url.password) return false;
    return true;
  } catch {
    return false;
  }
}

type AnchorProps = ComponentPropsWithoutRef<"a">;

function SafeAnchor({ href, children, ...rest }: AnchorProps) {
  // Allow internal hash links for table of contents navigation
  if (href?.startsWith("#")) {
    return (
      <a
        {...rest}
        href={href}
        className="font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary"
      >
        {children}
      </a>
    );
  }

  // Allow internal relative paths
  if (href?.startsWith("/")) {
    return (
      <a
        {...rest}
        href={href}
        className="font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary"
      >
        {children}
      </a>
    );
  }

  const safeHref = isHttpUrl(href) ? href : undefined;
  if (!safeHref) {
    return <span className="underline decoration-dotted">{children}</span>;
  }

  return (
    <a
      {...rest}
      href={safeHref}
      target="_blank"
      rel="noreferrer noopener"
      className="font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary"
    >
      {children}
    </a>
  );
}

export const EDITORIAL_MARKDOWN_COMPONENTS = {
  h1: ({ children }: { children?: ReactNode }) => (
    <h1 className="mt-10 mb-4 text-3xl font-extrabold tracking-tight text-base-content first:mt-0 sm:text-4xl">
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: ReactNode }) => {
    const text = getNodeText(children);
    const id = slugifyHeading(text);
    return (
      <h2
        id={id}
        className="mt-12 mb-4 scroll-mt-24 border-t border-base-300/60 pt-6 text-2xl font-bold tracking-tight text-base-content first:border-0 first:pt-0 sm:text-3xl"
      >
        {children}
      </h2>
    );
  },
  h3: ({ children }: { children?: ReactNode }) => {
    const text = getNodeText(children);
    const id = slugifyHeading(text);
    return (
      <h3
        id={id}
        className="mt-8 mb-3 scroll-mt-24 text-xl font-bold tracking-tight text-base-content sm:text-2xl"
      >
        {children}
      </h3>
    );
  },
  h4: ({ children }: { children?: ReactNode }) => (
    <h4 className="mt-6 mb-2 text-lg font-bold text-base-content">{children}</h4>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p className="my-5 text-[17px] font-normal leading-[1.8] text-base-content/85 sm:text-[18px]">
      {children}
    </p>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="my-5 ml-6 list-disc space-y-2 text-[17px] leading-[1.8] text-base-content/85 sm:text-[18px]">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="my-5 ml-6 list-decimal space-y-2 text-[17px] leading-[1.8] text-base-content/85 sm:text-[18px]">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: ReactNode }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  a: SafeAnchor,
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-semibold text-base-content">{children}</strong>
  ),
  em: ({ children }: { children?: ReactNode }) => (
    <em className="italic">{children}</em>
  ),
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="my-8 rounded-r-xl border-l-4 border-primary bg-primary/5 py-4 pl-6 pr-4 text-lg font-medium italic text-base-content/90 sm:text-xl">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-10 border-base-300" />,
  img: ({ src, alt }: { src?: string; alt?: string }) => (
    <figure className="my-8 overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm">
      <img
        src={src}
        alt={alt}
        className="w-full object-cover"
        loading="lazy"
      />
      {alt ? (
        <figcaption className="border-t border-base-200 bg-base-200/50 px-4 py-2.5 text-center text-xs italic text-base-content/70">
          {alt}
        </figcaption>
      ) : null}
    </figure>
  ),
  code: ({ children, className }: ComponentPropsWithoutRef<"code">) => {
    if (typeof className === "string" && className.startsWith("language-")) {
      return <code className={className}>{children}</code>;
    }
    return (
      <code className="rounded bg-base-200 px-1.5 py-0.5 font-mono text-sm font-semibold text-primary">
        {children}
      </code>
    );
  },
  pre: ({ children }: { children?: ReactNode }) => (
    <div className="my-6 overflow-hidden rounded-xl border border-base-300 bg-base-200/70 shadow-inner">
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-base-content">
        {children}
      </pre>
    </div>
  ),
  table: ({ children }: { children?: ReactNode }) => (
    <div className="my-8 overflow-x-auto rounded-xl border border-base-300 bg-base-100 shadow-sm">
      <table className="table table-md w-full border-collapse">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: { children?: ReactNode }) => (
    <thead className="bg-base-200/60 text-xs uppercase tracking-wider text-base-content/70">
      {children}
    </thead>
  ),
  tbody: ({ children }: { children?: ReactNode }) => (
    <tbody className="divide-y divide-base-200">{children}</tbody>
  ),
  tr: ({ children }: { children?: ReactNode }) => (
    <tr className="hover:bg-base-200/30 transition-colors">{children}</tr>
  ),
  th: ({ children }: { children?: ReactNode }) => (
    <th className="px-4 py-3 text-left font-bold">{children}</th>
  ),
  td: ({ children }: { children?: ReactNode }) => (
    <td className="px-4 py-3 align-top leading-relaxed">{children}</td>
  ),
};

export function EditorialMarkdown({ children, className }: Props) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={EDITORIAL_MARKDOWN_COMPONENTS}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
