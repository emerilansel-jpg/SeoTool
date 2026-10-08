import type { ReactNode } from "react";

export function DataForSeoLogo({
  className = "size-7",
}: {
  className?: string;
}) {
  return (
    <img
      src="/integrations/dataforseo.png"
      alt="DataForSEO"
      className={`${className} object-contain`}
      loading="lazy"
    />
  );
}

export function GoogleSearchConsoleLogo({
  className = "size-7",
}: {
  className?: string;
}) {
  return (
    <img
      src="/integrations/gsc.png"
      alt="Google Search Console"
      className={`${className} object-contain`}
      loading="lazy"
    />
  );
}

export function Ga4Logo({ className = "size-7" }: { className?: string }) {
  return (
    <img
      src="/integrations/ga4.webp"
      alt="Google Analytics 4"
      className={`${className} object-contain`}
      loading="lazy"
    />
  );
}

export function ChatGptLogo({ className = "size-7" }: { className?: string }) {
  return (
    <img
      src="/integrations/chatgpt.webp"
      alt="ChatGPT"
      className={`${className} object-contain`}
      loading="lazy"
    />
  );
}

export function ClaudeLogo({ className = "size-7" }: { className?: string }) {
  return (
    <img
      src="/integrations/claude.png"
      alt="Claude"
      className={`${className} object-contain`}
      loading="lazy"
    />
  );
}

export function GeminiLogo({ className = "size-7" }: { className?: string }) {
  return (
    <img
      src="/integrations/gemini.webp"
      alt="Gemini"
      className={`${className} object-contain`}
      loading="lazy"
    />
  );
}

export function PerplexityLogo({
  className = "size-7",
}: {
  className?: string;
}) {
  return (
    <img
      src="/integrations/perplexity.png"
      alt="Perplexity"
      className={`${className} object-contain`}
      loading="lazy"
    />
  );
}

export function BingLogo({ className = "size-7" }: { className?: string }) {
  return (
    <img
      src="/integrations/bing.jpg"
      alt="Bing"
      className={`${className} object-contain rounded-xs`}
      loading="lazy"
    />
  );
}

export function PayPalLogo({ className = "size-7" }: { className?: string }) {
  return (
    <img
      src="/integrations/paypal.svg"
      alt="PayPal"
      className={`${className} object-contain`}
      loading="lazy"
    />
  );
}

export function McpLogo({ className = "size-7" }: { className?: string }) {
  return (
    <img
      src="/integrations/mcp.webp"
      alt="Model Context Protocol"
      className={`${className} object-contain`}
      loading="lazy"
    />
  );
}

export type IntegrationItem = {
  name: string;
  logo: (props: { className?: string }) => ReactNode;
};

export const INTEGRATION_LIST: IntegrationItem[] = [
  { name: "DataForSEO", logo: DataForSeoLogo },
  { name: "Google Search Console", logo: GoogleSearchConsoleLogo },
  { name: "GA4", logo: Ga4Logo },
  { name: "ChatGPT", logo: ChatGptLogo },
  { name: "Claude", logo: ClaudeLogo },
  { name: "Gemini", logo: GeminiLogo },
  { name: "Perplexity", logo: PerplexityLogo },
  { name: "Bing", logo: BingLogo },
  { name: "PayPal", logo: PayPalLogo },
  { name: "MCP", logo: McpLogo },
];
