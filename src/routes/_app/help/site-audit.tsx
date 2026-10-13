import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Shield,
  AlertTriangle,
  FileCode2,
  Globe,
} from "lucide-react";
import {
  CRAWLER_USER_AGENT,
  SUPPORT_EMAIL,
} from "@/client/features/audit/shared";

export const Route = createFileRoute("/_app/help/site-audit")({
  component: SiteAuditHelpPage,
});

function SiteAuditHelpPage() {
  return (
    <div className="px-4 py-4 md:px-6 md:py-6 pb-24 md:pb-8 overflow-auto">
      <div className="mx-auto max-w-3xl space-y-4">
        <div>
          <Link to="/support" className="btn btn-ghost btn-xs gap-1 mb-2">
            <ArrowLeft className="size-3.5" />
            Back to Help & Support
          </Link>
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Site Audit Crawl Troubleshooting
              </h1>
              <p className="text-sm text-base-content/70">
                Fix crawls that stop early (crawling 0 or 1 page). Most
                incomplete crawls are caused by bot protection firewalls or
                robots.txt rules blocking our crawler.
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300">
          <div className="card-body gap-3">
            <h2 className="card-title text-base flex items-center gap-2">
              <Shield className="size-4 text-primary" />
              Crawler Identity
            </h2>
            <p className="text-sm text-base-content/80">
              SeoTool.im uses an in-house crawler to inspect pages. It
              identifies itself via this User-Agent header:
            </p>
            <pre className="p-3 rounded bg-base-200 border border-base-300 font-mono text-xs overflow-x-auto text-primary">
              <code>{CRAWLER_USER_AGENT}</code>
            </pre>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300">
          <div className="card-body gap-4">
            <h2 className="card-title text-base flex items-center gap-2">
              <CheckCircle2 className="size-4 text-success" />
              Solution 1: Allowlist on Cloudflare or WAF (Recommended)
            </h2>
            <p className="text-sm text-base-content/80">
              If your domain is behind Cloudflare or another Web Application
              Firewall:
            </p>
            <ol className="list-decimal pl-5 text-sm space-y-2 text-base-content/80">
              <li>
                Log in to your Cloudflare dashboard and choose your domain.
              </li>
              <li>
                Navigate to <strong>Security</strong> &gt; <strong>WAF</strong>{" "}
                &gt; <strong>Custom rules</strong>.
              </li>
              <li>
                Click <strong>Create rule</strong> with these settings:
                <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
                  <li>
                    <strong>Field:</strong> User Agent
                  </li>
                  <li>
                    <strong>Operator:</strong> contains
                  </li>
                  <li>
                    <strong>Value:</strong>{" "}
                    <code className="font-mono bg-base-200 px-1 py-0.5 rounded">
                      SeoTool.im-Audit
                    </code>
                  </li>
                  <li>
                    <strong>Action:</strong> Skip
                  </li>
                  <li>
                    <strong>Skip components:</strong> All remaining custom
                    rules, Rate limiting rules, Managed rules, Bot Fight Mode.
                  </li>
                </ul>
              </li>
              <li>
                Click <strong>Deploy</strong> and rerun your audit.
              </li>
            </ol>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300">
          <div className="card-body gap-3">
            <h2 className="card-title text-base flex items-center gap-2">
              <FileCode2 className="size-4 text-warning" />
              Solution 2: Check robots.txt
            </h2>
            <p className="text-sm text-base-content/80">
              Verify your <code className="font-mono">robots.txt</code> does not
              disallow the crawler. To explicitly permit SeoTool.im, add this
              block:
            </p>
            <pre className="p-3 rounded bg-base-200 border border-base-300 font-mono text-xs overflow-x-auto">
              <code>{`User-agent: SeoTool.im-Audit\nAllow: /`}</code>
            </pre>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300">
          <div className="card-body gap-3">
            <h2 className="card-title text-base flex items-center gap-2">
              <Globe className="size-4 text-info" />
              Solution 3: XML Sitemap for JavaScript / Single Page Apps
            </h2>
            <p className="text-sm text-base-content/80">
              If your site is built with client-side React, Vue, or Next.js
              without SSR, internal links are rendered via JavaScript and cannot
              be seen by standard HTML parsers.
            </p>
            <p className="text-sm text-base-content/80">
              Ensure your sitemap is located at{" "}
              <code className="font-mono">/sitemap.xml</code> or listed in your{" "}
              <code className="font-mono">robots.txt</code>. The crawler
              automatically ingests sitemaps to discover all pages.
            </p>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300">
          <div className="card-body gap-3">
            <h2 className="card-title text-base flex items-center gap-2">
              <AlertTriangle className="size-4 text-secondary" />
              Solution 4: Start URL &amp; Redirects
            </h2>
            <p className="text-sm text-base-content/80">
              Always enter the final canonical URL with the correct protocol and
              subdomain (for example{" "}
              <code className="font-mono">https://example.com/</code> instead of{" "}
              <code className="font-mono">http://www.example.com</code>) to
              prevent protocol redirect traps.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-base-300 p-4 text-sm text-base-content/70">
          Need extra help? Email our engineering team at{" "}
          <a
            className="link link-primary font-medium"
            href={`mailto:${SUPPORT_EMAIL}`}
          >
            {SUPPORT_EMAIL}
          </a>{" "}
          or reach out through{" "}
          <Link to="/support" className="link link-primary font-medium">
            Support
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
