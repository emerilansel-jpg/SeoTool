import type { ReactNode } from "react";
import { ClaudeIcon } from "@/client/features/ai-mcp/AgentIcons";

export function DataForSeoLogo({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className} aria-label="DataForSEO">
      <rect width="28" height="28" rx="6" fill="#1565C0" />
      <path
        d="M8 7h7a6 6 0 0 1 6 6v2a6 6 0 0 1-6 6H8V7zm3.5 3v11H15a3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3h-3.5z"
        fill="#FFFFFF"
      />
      <circle cx="18.5" cy="14" r="1.8" fill="#00E5FF" />
    </svg>
  );
}

export function GoogleSearchConsoleLogo({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-label="Google Search Console">
      <defs>
        <linearGradient id="gsc-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="100%" stopColor="#1A73E8" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="10" fill="url(#gsc-bg)" />
      <circle cx="21" cy="21" r="9" stroke="#FFFFFF" strokeWidth="3.5" fill="none" />
      <path d="M28 28l9 9" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
      <path
        d="M17 21l3 3 5-5"
        stroke="#34A853"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="34" cy="14" r="3" fill="#EA4335" />
      <circle cx="38" cy="22" r="2.2" fill="#FBBC05" />
    </svg>
  );
}

export function Ga4Logo({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-label="Google Analytics 4">
      <path d="M19.5 4a2.5 2.5 0 0 1 2.5 2.5v14a2.5 2.5 0 0 1-5 0v-14A2.5 2.5 0 0 1 19.5 4z" fill="#F9AB00" />
      <path d="M14 10.5a2.5 2.5 0 0 1 2.5 2.5v7.5a2.5 2.5 0 0 1-5 0V13a2.5 2.5 0 0 1 2.5-2.5z" fill="#E37400" />
      <circle cx="8.5" cy="20.5" r="2.5" fill="#F9AB00" />
    </svg>
  );
}

export function ChatGptLogo({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#10A37F" className={className} aria-label="ChatGPT">
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.5045 4.5045 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.6667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.6069 1.4997-2.602-1.4997z" />
    </svg>
  );
}

export function ClaudeLogo({ className = "size-6" }: { className?: string }) {
  return <ClaudeIcon className={className} />;
}

export function GeminiLogo({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-label="Gemini">
      <defs>
        <linearGradient id="gemini-spark-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1BA1E3" />
          <stop offset="45%" stopColor="#5B68DF" />
          <stop offset="75%" stopColor="#C465DD" />
          <stop offset="100%" stopColor="#E94368" />
        </linearGradient>
      </defs>
      <path
        fill="url(#gemini-spark-grad)"
        d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12Z"
      />
    </svg>
  );
}

export function PerplexityLogo({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-label="Perplexity">
      <path
        d="M12 2v20M12 12H4.5A2.5 2.5 0 0 1 2 9.5V7a3 3 0 0 1 3-3h7v8zm0 0h7.5a2.5 2.5 0 0 0 2.5-2.5V7a3 3 0 0 0-3-3h-7v8zm0 0H4.5A2.5 2.5 0 0 0 2 14.5V17a3 3 0 0 0 3 3h7v-8zm0 0h7.5a2.5 2.5 0 0 1 2.5 2.5V17a3 3 0 0 1-3 3h-7v-8z"
        stroke="#20B2AA"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BingLogo({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-label="Bing">
      <defs>
        <linearGradient id="bing-mark-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#008373" />
          <stop offset="100%" stopColor="#00A4EF" />
        </linearGradient>
      </defs>
      <path
        fill="url(#bing-mark-grad)"
        d="M5.5 2h5.2c.4 0 .8.2 1 .5l6.3 8.3c.4.5.3 1.2-.2 1.6l-5.6 4.3-3.2 4.9c-.3.4-.8.6-1.3.5l-2.2-.5c-.4-.1-.7-.5-.7-.9V2.9c0-.5.4-.9.9-.9zm3.5 3.8v9.7l3-2.3 3.6-2.7-6.6-4.7z"
      />
    </svg>
  );
}

export function PayPalLogo({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-label="PayPal">
      <path fill="#003087" d="M6.5 2h7.2c3.1 0 5.3 1.6 4.8 4.7-.5 3.3-2.7 5.1-5.7 5.1h-2.1l-1.3 8.2h-3.4L8.5 2z" />
      <path fill="#0079C1" d="M10.2 7h5.8c2.8 0 4.8 1.4 4.3 4.2-.6 3.7-2.9 5.8-6.3 5.8h-2l-1.4 7H7.4L9.8 7.4c.1-.2.2-.4.4-.4z" />
      <path fill="#00457C" d="M10.7 17h2.5c2.4 0 4.1-1.3 4.6-3.8.3-1.6-.3-2.8-1.5-3.5l-.9 5.8c-.2 1-.9 1.5-1.9 1.5h-2.8z" />
    </svg>
  );
}

export function McpLogo({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-label="Model Context Protocol">
      <rect x="3" y="3" width="7" height="7" rx="2" stroke="#8B5CF6" strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" stroke="#00E5FF" strokeWidth="2" />
      <path
        d="M10 6.5h4a2 2 0 0 1 2 2v5.5M14 17.5h-4a2 2 0 0 1-2-2V10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="text-base-content/50"
      />
    </svg>
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
