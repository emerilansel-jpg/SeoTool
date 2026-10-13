# Site Audit Crawl Troubleshooting

When running a site audit in SeoTool.im, you might encounter an alert stating:

> **Site audit couldn't fully crawl this website.**  
> This is usually caused by firewall/anti-bot protection or robots.txt restrictions blocking our crawler.

This guide explains why crawls stop early (crawling 0 or 1 page) and how to configure your website or firewall to allow full audits.

---

## 1. How the Crawler Identifies Itself

SeoTool.im uses an in-house HTTP crawler that runs from cloud worker nodes:

- **User-Agent Header:** `SeoTool.im-Audit/1.0`
- **Behavior:** Fetches `robots.txt`, detects XML sitemaps, downloads raw HTML, parses internal same-origin links, and follows them iteratively.
- **JavaScript Rendering:** The crawler performs fast standard HTTP requests without executing JavaScript.

---

## 2. Common Causes of Incomplete Crawls

### A. Web Application Firewall (WAF) or Bot Management

Security providers such as Cloudflare, AWS WAF, Wordfence, or Sucuri block automated requests originating from cloud and datacenter IP addresses. If the security layer detects an unknown User-Agent or challenges the request with a CAPTCHA (HTTP 403, 429, or 503 challenge), the crawler cannot proceed.

### B. `robots.txt` Disallow Rules

Before fetching pages, the crawler reads `/robots.txt`. If your `robots.txt` contains a generic `Disallow: /` rule for all robots (`User-agent: *`), SeoTool.im honors the directive and halts crawling immediately.

### C. Client-Side Rendered Applications (SPA)

If your site is built with pure client-side React, Vue, Angular, or similar frameworks where navigation links `<a href="...">` are injected solely via client-side JavaScript, the static HTML parser sees no links on the homepage. As a result, the crawl completes after visiting only 1 page.

### D. Canonical and Redirect Mismatches

If the start URL redirects to another domain, subdomain (such as `www` to non-`www`), or protocol (`http://` to `https://`), ensure you provide the final destination URL as the audit start URL.

---

## 3. How to Resolve Crawl Blocking

### Resolution 1: Cloudflare WAF Allow Rule (Recommended)

If your website uses Cloudflare:

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and select your domain.
2. Navigate to **Security** > **WAF** > **Custom rules**.
3. Click **Create rule**.
4. Configure the rule:
   - **Rule name:** `Allow SeoTool.im Crawler`
   - **Field:** `User Agent`
   - **Operator:** `contains`
   - **Value:** `SeoTool.im-Audit`
   - **Action:** `Skip`
   - Check all applicable features to skip:
     - _All remaining custom rules_
     - _Rate limiting rules_
     - _Managed rules_
     - _Browser Integrity Check_
     - _Bot Fight Mode / Super Bot Fight Mode_
5. Click **Deploy**.
6. Return to SeoTool.im and rerun the site audit.

---

### Resolution 2: WordPress and Security Plugins

#### Wordfence

1. In WordPress Admin, navigate to **Wordfence** > **All Options**.
2. Scroll to **Rate Limiting** or **Whitelisted Services**.
3. Under **Whitelisted User-Agents**, add `SeoTool.im-Audit/1.0`.
4. Save changes.

#### Sucuri / iThemes

- In the plugin settings, exempt requests whose `User-Agent` contains `SeoTool.im-Audit`.

---

### Resolution 3: Update `robots.txt`

Check your site's `robots.txt` file (for example, `https://yourdomain.com/robots.txt`).

If you have rules restricting general crawlers, add an explicit exemption rule for SeoTool.im:

```txt
User-agent: SeoTool.im-Audit
Allow: /
```

Place this rule above any restrictive general directives.

---

### Resolution 4: Provide an XML Sitemap for SPAs

If your website relies on JavaScript to render content and internal links:

1. Generate an XML sitemap (for example, at `https://yourdomain.com/sitemap.xml`).
2. Reference the sitemap inside your `robots.txt`:
   ```txt
   Sitemap: https://yourdomain.com/sitemap.xml
   ```
3. When SeoTool.im starts an audit, it automatically discovers and parses your sitemap, queuing all page URLs even if internal HTML links are not statically present.

---

### Resolution 5: Verify the Start URL Format

- Always input the canonical URL matching your SSL certificate and subdomain format (for example, `https://example.com/` instead of `http://example.com`).
- Avoid entering a staging URL protected by basic authentication (`htpasswd`).

---

## 4. Need Further Assistance?

If your site audit continues to encounter difficulties after following these steps:

- Visit [Help & Support](https://seotool.im/support)
- Contact our engineering team directly at **support@seotool.im**
