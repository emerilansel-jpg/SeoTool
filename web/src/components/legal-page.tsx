import { HomeLayout } from "fumadocs-ui/layouts/home";
import { DocsBody } from "fumadocs-ui/page";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { baseOptions } from "@/lib/layout.shared";

type LegalPageProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function LegalPage({ title, description, children }: LegalPageProps) {
  return (
    <HomeLayout {...baseOptions()}>
      <article className="mx-auto max-w-3xl px-6 py-12 text-[var(--color-brand)] md:py-20">
        <header className="mb-10 border-b border-[var(--color-border-subtle)] pb-8">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-[var(--color-brand)] md:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="text-lg leading-8 text-[var(--color-brand-muted)]">
              {description}
            </p>
          ) : null}
        </header>

        <DocsBody className="text-[var(--color-brand)] [&_a]:text-[var(--color-brand-accent)] [&_a]:underline [&_a]:underline-offset-4 [&_h2]:text-[var(--color-brand)] [&_h2]:font-bold [&_h3]:text-[var(--color-brand)] [&_h3]:font-bold [&_li]:text-[var(--color-brand-muted)] [&_p]:text-[var(--color-brand-muted)] [&_strong]:text-[var(--color-brand)]">
          {children}
        </DocsBody>

        <div className="mt-16 border-t border-[var(--color-border-subtle)] pt-8">
          <SiteFooter className="text-xs text-[var(--color-brand-muted)] [&_a]:transition-colors [&_a]:hover:text-white" />
        </div>
      </article>
    </HomeLayout>
  );
}
