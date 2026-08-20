import { useParams, useRouter as useRouter$1, useLocation, Link as Link$3, createRootRoute, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, redirect, createRouter } from "@tanstack/react-router";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import React__default, { useState, useRef, useMemo, useEffect, useContext, createContext as createContext$1, lazy, forwardRef, createElement, useCallback, useLayoutEffect, Suspense, Fragment as Fragment$1 } from "react";
import { T as TSS_SERVER_FUNCTION, g as getServerFnById, c as createServerFn } from "../server.js";
import { createClientLoader } from "fumadocs-mdx/runtime/vite";
import { n as normalizeUrl, d as docs, b as blog } from "./source.generated-bSvMrmdU.js";
import * as ReactDOM from "react-dom";
import ReactDOM__default from "react-dom";
import { z as z$1 } from "zod";
const appCss = "/assets/app-30umGnZ3.css";
var M = (e2, i, s, u, m, a, l2, h) => {
  let d = document.documentElement, w = ["light", "dark"];
  function p(n2) {
    (Array.isArray(e2) ? e2 : [e2]).forEach((y) => {
      let k = y === "class", S = k && a ? m.map((f) => a[f] || f) : m;
      k ? (d.classList.remove(...S), d.classList.add(a && a[n2] ? a[n2] : n2)) : d.setAttribute(y, n2);
    }), R(n2);
  }
  function R(n2) {
    h && w.includes(n2) && (d.style.colorScheme = n2);
  }
  function c() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  if (u) p(u);
  else try {
    let n2 = localStorage.getItem(i) || s, y = l2 && n2 === "system" ? c() : n2;
    p(y);
  } catch (n2) {
  }
};
var b = ["light", "dark"], I = "(prefers-color-scheme: dark)", O = typeof window == "undefined", x = React.createContext(void 0), U = { setTheme: (e2) => {
}, themes: [] }, z = () => {
  var e2;
  return (e2 = React.useContext(x)) != null ? e2 : U;
}, J = (e2) => React.useContext(x) ? React.createElement(React.Fragment, null, e2.children) : React.createElement(V, { ...e2 }), N = ["light", "dark"], V = ({ forcedTheme: e2, disableTransitionOnChange: i = false, enableSystem: s = true, enableColorScheme: u = true, storageKey: m = "theme", themes: a = N, defaultTheme: l2 = s ? "system" : "light", attribute: h = "data-theme", value: d, children: w, nonce: p, scriptProps: R }) => {
  let [c, n2] = React.useState(() => H(m, l2)), [T, y] = React.useState(() => c === "system" ? E() : c), k = d ? Object.values(d) : a, S = React.useCallback((o2) => {
    let r2 = o2;
    if (!r2) return;
    o2 === "system" && s && (r2 = E());
    let v = d ? d[r2] : r2, C = i ? W(p) : null, P = document.documentElement, L = (g) => {
      g === "class" ? (P.classList.remove(...k), v && P.classList.add(v)) : g.startsWith("data-") && (v ? P.setAttribute(g, v) : P.removeAttribute(g));
    };
    if (Array.isArray(h) ? h.forEach(L) : L(h), u) {
      let g = b.includes(l2) ? l2 : null, D = b.includes(r2) ? r2 : g;
      P.style.colorScheme = D;
    }
    C == null || C();
  }, [p]), f = React.useCallback((o2) => {
    let r2 = typeof o2 == "function" ? o2(c) : o2;
    n2(r2);
    try {
      localStorage.setItem(m, r2);
    } catch (v) {
    }
  }, [c]), A = React.useCallback((o2) => {
    let r2 = E(o2);
    y(r2), c === "system" && s && !e2 && S("system");
  }, [c, e2]);
  React.useEffect(() => {
    let o2 = window.matchMedia(I);
    return o2.addListener(A), A(o2), () => o2.removeListener(A);
  }, [A]), React.useEffect(() => {
    let o2 = (r2) => {
      r2.key === m && (r2.newValue ? n2(r2.newValue) : f(l2));
    };
    return window.addEventListener("storage", o2), () => window.removeEventListener("storage", o2);
  }, [f]), React.useEffect(() => {
    S(e2 != null ? e2 : c);
  }, [e2, c]);
  let Q = React.useMemo(() => ({ theme: c, setTheme: f, forcedTheme: e2, resolvedTheme: c === "system" ? T : c, themes: s ? [...a, "system"] : a, systemTheme: s ? T : void 0 }), [c, f, e2, T, s, a]);
  return React.createElement(x.Provider, { value: Q }, React.createElement(_, { forcedTheme: e2, storageKey: m, attribute: h, enableSystem: s, enableColorScheme: u, defaultTheme: l2, value: d, themes: a, nonce: p, scriptProps: R }), w);
}, _ = React.memo(({ forcedTheme: e2, storageKey: i, attribute: s, enableSystem: u, enableColorScheme: m, defaultTheme: a, value: l2, themes: h, nonce: d, scriptProps: w }) => {
  let p = JSON.stringify([s, i, a, e2, h, l2, u, m]).slice(1, -1);
  return React.createElement("script", { ...w, suppressHydrationWarning: true, nonce: typeof window == "undefined" ? d : "", dangerouslySetInnerHTML: { __html: `(${M.toString()})(${p})` } });
}), H = (e2, i) => {
  if (O) return;
  let s;
  try {
    s = localStorage.getItem(e2) || void 0;
  } catch (u) {
  }
  return s || i;
}, W = (e2) => {
  let i = document.createElement("style");
  return e2 && i.setAttribute("nonce", e2), i.appendChild(document.createTextNode("*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}")), document.head.appendChild(i), () => {
    window.getComputedStyle(document.body), setTimeout(() => {
      document.head.removeChild(i);
    }, 1);
  };
}, E = (e2) => (e2 || (e2 = window.matchMedia(I)), e2.matches ? "dark" : "light");
var DirectionContext = React.createContext(void 0);
var DirectionProvider = (props) => {
  const { dir, children } = props;
  return /* @__PURE__ */ jsx(DirectionContext.Provider, { value: dir, children });
};
function useDirection(localDir) {
  const globalDir = React.useContext(DirectionContext);
  return localDir || globalDir || "ltr";
}
var notImplemented = () => {
  throw new Error(
    "You need to wrap your application inside `FrameworkProvider`."
  );
};
var FrameworkContext = createContext("FrameworkContext", {
  useParams: notImplemented,
  useRouter: notImplemented,
  usePathname: notImplemented
});
function FrameworkProvider({
  Link: Link22,
  useRouter: useRouter2,
  useParams: useParams2,
  usePathname: usePathname2,
  Image: Image2,
  children
}) {
  const framework2 = React__default.useMemo(
    () => ({
      usePathname: usePathname2,
      useRouter: useRouter2,
      Link: Link22,
      Image: Image2,
      useParams: useParams2
    }),
    [Link22, usePathname2, useRouter2, useParams2, Image2]
  );
  return /* @__PURE__ */ jsx(FrameworkContext.Provider, { value: framework2, children });
}
function usePathname() {
  return FrameworkContext.use().usePathname();
}
function useRouter() {
  return FrameworkContext.use().useRouter();
}
function Image$1(props) {
  const { Image: Image2 } = FrameworkContext.use();
  if (!Image2) {
    const { src, alt, priority, ...rest } = props;
    return /* @__PURE__ */ jsx(
      "img",
      {
        alt,
        src,
        fetchPriority: priority ? "high" : "auto",
        ...rest
      }
    );
  }
  return /* @__PURE__ */ jsx(Image2, { ...props });
}
function Link$2(props) {
  const { Link: Link22 } = FrameworkContext.use();
  if (!Link22) {
    const { href, prefetch: _2, ...rest } = props;
    return /* @__PURE__ */ jsx("a", { href, ...rest });
  }
  return /* @__PURE__ */ jsx(Link22, { ...props });
}
function createContext(name, v) {
  const Context = React__default.createContext(v);
  return {
    Provider: (props) => {
      return /* @__PURE__ */ jsx(Context.Provider, { value: props.value, children: props.children });
    },
    use: (errorMessage) => {
      const value = React__default.useContext(Context);
      if (!value)
        throw new Error(
          errorMessage ?? `Provider of ${name} is required but missing.`
        );
      return value;
    }
  };
}
function isDifferent(a, b2) {
  if (Array.isArray(a) && Array.isArray(b2)) {
    return b2.length !== a.length || a.some((v, i) => isDifferent(v, b2[i]));
  }
  return a !== b2;
}
function useOnChange(value, onChange, isUpdated = isDifferent) {
  const [prev, setPrev] = useState(value);
  if (isUpdated(prev, value)) {
    onChange(value, prev);
    setPrev(value);
  }
}
const SidebarContext = createContext("SidebarContext");
function useSidebar() {
  return SidebarContext.use();
}
function SidebarProvider({ children }) {
  const closeOnRedirect = useRef(true);
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  useOnChange(pathname, () => {
    if (closeOnRedirect.current) {
      setOpen(false);
    }
    closeOnRedirect.current = true;
  });
  return jsx(SidebarContext.Provider, { value: useMemo(() => ({
    open,
    setOpen,
    collapsed,
    setCollapsed,
    closeOnRedirect
  }), [open, collapsed]), children });
}
const SearchContext = createContext("SearchContext", {
  enabled: false,
  hotKey: [],
  setOpenSearch: () => void 0
});
function useSearchContext() {
  return SearchContext.use();
}
function MetaOrControl() {
  const [key, setKey] = useState("⌘");
  useEffect(() => {
    const isWindows = window.navigator.userAgent.includes("Windows");
    if (isWindows)
      setKey("Ctrl");
  }, []);
  return key;
}
function SearchProvider({ SearchDialog, children, preload = true, options, hotKey = [
  {
    key: (e2) => e2.metaKey || e2.ctrlKey,
    display: jsx(MetaOrControl, {})
  },
  {
    key: "k",
    display: "K"
  }
], links }) {
  const [isOpen, setIsOpen] = useState(preload ? false : void 0);
  useEffect(() => {
    const handler = (e2) => {
      if (hotKey.every((v) => typeof v.key === "string" ? e2.key === v.key : v.key(e2))) {
        setIsOpen(true);
        e2.preventDefault();
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [hotKey]);
  return jsxs(SearchContext.Provider, { value: useMemo(() => ({
    enabled: true,
    hotKey,
    setOpenSearch: setIsOpen
  }), [hotKey]), children: [isOpen !== void 0 && jsx(SearchDialog, {
    open: isOpen,
    onOpenChange: setIsOpen,
    // @ts-expect-error -- insert prop for official UIs
    links,
    ...options
  }), children] });
}
const defaultTranslations = {
  search: "Search",
  searchNoResult: "No results found",
  toc: "On this page",
  tocNoHeadings: "No Headings",
  lastUpdate: "Last updated on",
  chooseLanguage: "Choose a language",
  nextPage: "Next Page",
  previousPage: "Previous Page",
  chooseTheme: "Theme",
  editOnGithub: "Edit on GitHub"
};
const I18nContext = createContext$1({
  text: defaultTranslations
});
function I18nLabel(props) {
  const { text } = useI18n();
  return text[props.label];
}
function useI18n() {
  return useContext(I18nContext);
}
const DefaultSearchDialog = lazy(() => import("./search-default-BURscLoU.js"));
function RootProvider$1({ children, dir = "ltr", theme = {}, search, i18n }) {
  let body = children;
  if (search?.enabled !== false)
    body = jsx(SearchProvider, { SearchDialog: DefaultSearchDialog, ...search, children: body });
  if (theme?.enabled !== false)
    body = jsx(J, { attribute: "class", defaultTheme: "system", enableSystem: true, disableTransitionOnChange: true, ...theme, children: body });
  if (i18n) {
    body = jsx(I18nProvider, { ...i18n, children: body });
  }
  return jsx(DirectionProvider, { dir, children: jsx(SidebarProvider, { children: body }) });
}
function I18nProvider({ locales = [], locale, onLocaleChange, children, translations }) {
  const router2 = useRouter();
  const pathname = usePathname();
  const onChange = (value) => {
    if (onLocaleChange) {
      return onLocaleChange(value);
    }
    const segments = pathname.split("/").filter((v) => v.length > 0);
    if (segments[0] !== locale) {
      segments.unshift(value);
    } else {
      segments[0] = value;
    }
    router2.push(`/${segments.join("/")}`);
  };
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  return jsx(I18nContext.Provider, { value: useMemo(() => ({
    locale,
    locales,
    text: {
      ...defaultTranslations,
      ...translations
    },
    onChange: (v) => onChangeRef.current(v)
  }), [locale, locales, translations]), children });
}
var framework = {
  Link({ href, prefetch, ...props }) {
    return /* @__PURE__ */ jsx(Link$3, { to: href, preload: prefetch ? "intent" : false, ...props, children: props.children });
  },
  usePathname() {
    return useLocation().pathname;
  },
  useRouter() {
    const router2 = useRouter$1();
    return useMemo(
      () => ({
        push(url) {
          void router2.navigate({
            href: url
          });
        },
        refresh() {
          void router2.invalidate();
        }
      }),
      [router2]
    );
  },
  useParams() {
    return useParams({ strict: false });
  }
};
function TanstackProvider({ children }) {
  return /* @__PURE__ */ jsx(FrameworkProvider, { ...framework, children });
}
function RootProvider(props) {
  return jsx(TanstackProvider, { children: jsx(RootProvider$1, { ...props, children: props.children }) });
}
const Route$J = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8"
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png"
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png"
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png"
      },
      { rel: "manifest", href: "/site.webmanifest" }
    ]
  }),
  component: RootComponent
});
function RootComponent() {
  return /* @__PURE__ */ jsx(RootDocument, { children: /* @__PURE__ */ jsx(Outlet, {}) });
}
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", className: "dark", suppressHydrationWarning: true, children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx(HeadContent, {}),
      /* @__PURE__ */ jsx(
        "script",
        {
          dangerouslySetInnerHTML: {
            __html: "(function(){function loadAnalytics(){if(window.__seotoolAnalyticsLoaded)return;window.__seotoolAnalyticsLoaded=true;window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)};plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init({endpoint:'/api/event'});var script=document.createElement('script');script.defer=true;script.src='/js/script.js';document.head.appendChild(script)}function schedule(){if('requestIdleCallback'in window){window.requestIdleCallback(loadAnalytics,{timeout:2000});return}window.setTimeout(loadAnalytics,2000)}if(document.readyState==='complete'){schedule();return}window.addEventListener('load',schedule,{once:true})})();"
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("body", { className: "flex flex-col min-h-screen bg-fd-background text-fd-foreground", children: [
      /* @__PURE__ */ jsx(RootProvider, { search: { enabled: false }, children }),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
let frontmatter$c = {
  "title": "Terms and Conditions",
  "description": "Terms and conditions for seotool.im."
};
function _createMdxContent$c(props) {
  const _components = {
    a: "a",
    br: "br",
    em: "em",
    li: "li",
    ol: "ol",
    p: "p",
    strong: "strong",
    ...props.components
  };
  return jsxs(Fragment, {
    children: [jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "Last revised on: 6/13/2026"
      })
    }), "\n", jsxs(_components.p, {
      children: ["The website located at ", jsx(_components.a, {
        href: "https://seotool.im",
        children: "https://seotool.im"
      }), " (the “", jsx(_components.strong, {
        children: "Site"
      }), "”), including the hosted SeoTool.im services made available through the Site, is a copyrighted work belonging to Every App, Inc (“", jsx(_components.strong, {
        children: "Company"
      }), "”, “", jsx(_components.strong, {
        children: "us"
      }), "”, “", jsx(_components.strong, {
        children: "our"
      }), "”, and “", jsx(_components.strong, {
        children: "we"
      }), "”). These Terms apply to your use of the Site and the hosted SeoTool.im services made available through it. For the avoidance of doubt, these Terms do not govern any self-hosted or open-source version of SeoTool.im, which is made available separately under the MIT License. Certain features of the Site may be subject to additional guidelines, terms, or rules, which will be posted on the Site in connection with such features. All such additional terms, guidelines, and rules are incorporated by reference into these Terms."]
    }), "\n", jsxs(_components.p, {
      children: ["THESE TERMS OF USE (THESE “", jsx(_components.strong, {
        children: "TERMS"
      }), "”) SET FORTH THE LEGALLY BINDING TERMS AND CONDITIONS THAT GOVERN YOUR USE OF THE SITE. BY ACCESSING OR USING THE SITE, YOU ARE ACCEPTING THESE TERMS (ON BEHALF OF YOURSELF OR THE ENTITY THAT YOU REPRESENT), AND YOU REPRESENT AND WARRANT THAT YOU HAVE THE RIGHT, AUTHORITY, AND CAPACITY TO ENTER INTO THESE TERMS (ON BEHALF OF YOURSELF OR THE ENTITY THAT YOU REPRESENT). YOU MAY NOT ACCESS OR USE THE SITE OR ACCEPT THE TERMS IF YOU ARE NOT AT LEAST 18 YEARS OLD. IF YOU DO NOT AGREE WITH ALL OF THE PROVISIONS OF THESE TERMS, DO NOT ACCESS AND/OR USE THE SITE."]
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "PLEASE BE AWARE THAT SECTION 10.2 CONTAINS PROVISIONS GOVERNING HOW TO RESOLVE DISPUTES BETWEEN YOU AND COMPANY. AMONG OTHER THINGS, SECTION 10.2 INCLUDES AN AGREEMENT TO ARBITRATE WHICH REQUIRES, WITH LIMITED EXCEPTIONS, THAT ALL DISPUTES BETWEEN YOU AND US SHALL BE RESOLVED BY BINDING AND FINAL ARBITRATION. SECTION 10.2 ALSO CONTAINS A CLASS ACTION AND JURY TRIAL WAIVER. PLEASE READ SECTION 10.2 CAREFULLY."
      })
    }), "\n", jsx(_components.p, {
      children: jsx(_components.strong, {
        children: "UNLESS YOU OPT OUT OF THE AGREEMENT TO ARBITRATE WITHIN 30 DAYS: (1) YOU WILL ONLY BE PERMITTED TO PURSUE DISPUTES OR CLAIMS AND SEEK RELIEF AGAINST US ON AN INDIVIDUAL BASIS, NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY CLASS OR REPRESENTATIVE ACTION OR PROCEEDING AND YOU WAIVE YOUR RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION; AND (2) YOU ARE WAIVING YOUR RIGHT TO PURSUE DISPUTES OR CLAIMS AND SEEK RELIEF IN A COURT OF LAW AND TO HAVE A JURY TRIAL."
      })
    }), "\n", jsxs(_components.ol, {
      children: ["\n", jsxs(_components.li, {
        children: ["\n", jsx(_components.p, {
          children: jsx(_components.strong, {
            children: "Accounts"
          })
        }), "\n", jsxs(_components.ol, {
          children: ["\n", jsxs(_components.li, {
            children: ["\n", jsxs(_components.p, {
              children: [jsx(_components.strong, {
                children: "Account Creation."
              }), " In order to use certain features of the Site, you must register for an account (“", jsx(_components.strong, {
                children: "Account"
              }), "”) and provide certain information about yourself as prompted by the account registration form. You represent and warrant that: (a) all required registration information you submit is truthful and accurate; (b) you will maintain the accuracy of such information. You may delete your Account at any time, for any reason, by following the instructions on the Site. Company may suspend or terminate your Account in accordance with Section 8."]
            }), "\n"]
          }), "\n", jsxs(_components.li, {
            children: ["\n", jsxs(_components.p, {
              children: [jsx(_components.strong, {
                children: "Account Responsibilities."
              }), " You are responsible for maintaining the confidentiality of your Account login information and are fully responsible for all activities that occur under your Account. You agree to immediately notify Company of any unauthorized use, or suspected unauthorized use of your Account or any other breach of security. Company cannot and will not be liable for any loss or damage arising from your failure to comply with the above requirements."]
            }), "\n"]
          }), "\n"]
        }), "\n"]
      }), "\n", jsxs(_components.li, {
        children: ["\n", jsx(_components.p, {
          children: jsx(_components.strong, {
            children: "Access to the Site"
          })
        }), "\n", jsxs(_components.ol, {
          children: ["\n", jsxs(_components.li, {
            children: ["\n", jsxs(_components.p, {
              children: [jsx(_components.strong, {
                children: "License."
              }), " Subject to these Terms, Company grants you a non-transferable, non-exclusive, revocable, limited license to use and access the Site solely for your own personal, noncommercial use."]
            }), "\n"]
          }), "\n", jsxs(_components.li, {
            children: ["\n", jsxs(_components.p, {
              children: [jsx(_components.strong, {
                children: "Certain Restrictions."
              }), " The rights granted to you in these Terms are subject to the following restrictions: (a) you shall not license, sell, rent, lease, transfer, assign, distribute, host, or otherwise commercially exploit the Site, whether in whole or in part, or any content displayed on the Site; (b) you shall not modify, make derivative works of, disassemble, reverse compile or reverse engineer any part of the Site; (c) you shall not access the Site in order to build a similar or competitive website, product, or service; and (d) except as expressly stated herein, no part of the Site may be copied, reproduced, distributed, republished, downloaded, displayed, posted or transmitted in any form or by any means. Unless otherwise indicated, any future release, update, or other addition to functionality of the Site shall be subject to these Terms. All copyright and other proprietary notices on the Site (or on any content displayed on the Site) must be retained on all copies thereof."]
            }), "\n"]
          }), "\n", jsxs(_components.li, {
            children: ["\n", jsxs(_components.p, {
              children: [jsx(_components.strong, {
                children: "Modification."
              }), " Company reserves the right, at any time, to modify, suspend, or discontinue the Site (in whole or in part) with or without notice to you. You agree that Company will not be liable to you or to any third party for any modification, suspension, or discontinuation of the Site or any part thereof."]
            }), "\n"]
          }), "\n", jsxs(_components.li, {
            children: ["\n", jsxs(_components.p, {
              children: [jsx(_components.strong, {
                children: "No Support or Maintenance."
              }), " You acknowledge and agree that Company will have no obligation to provide you with any support or maintenance in connection with the Site."]
            }), "\n"]
          }), "\n", jsxs(_components.li, {
            children: ["\n", jsxs(_components.p, {
              children: [jsx(_components.strong, {
                children: "Ownership."
              }), " Excluding any User Content that you may provide (defined below), you acknowledge that all the intellectual property rights, including copyrights, patents, trade marks, and trade secrets, in the Site and its content are owned by Company or Company’s suppliers. Neither these Terms (nor your access to the Site) transfers to you or any third party any rights, title or interest in or to such intellectual property rights, except for the limited access rights expressly set forth in Section 2.1. Company and its suppliers reserve all rights not granted in these Terms. There are no implied licenses granted under these Terms."]
            }), "\n"]
          }), "\n", jsxs(_components.li, {
            children: ["\n", jsxs(_components.p, {
              children: [jsx(_components.strong, {
                children: "Feedback."
              }), " If you provide Company with any feedback or suggestions regarding the Site (“", jsx(_components.strong, {
                children: "Feedback"
              }), "”), you hereby assign to Company all rights in such Feedback and agree that Company shall have the right to use and fully exploit such Feedback and related information in any manner it deems appropriate. Company will treat any Feedback you provide to Company as non-confidential and non-proprietary. You agree that you will not submit to Company any information or ideas that you consider to be confidential or proprietary."]
            }), "\n"]
          }), "\n", jsxs(_components.li, {
            children: ["\n", jsxs(_components.p, {
              children: [jsx(_components.strong, {
                children: "Subscriptions, Fees, and Refunds."
              }), " Access to certain features of the hosted SeoTool.im service requires a paid subscription. Fees are billed in advance on a recurring basis and are non-refundable except as expressly provided in this Section or as required by applicable law. We offer a ", jsx(_components.strong, {
                children: "30-day money-back guarantee"
              }), ": if you are not satisfied with your paid subscription, you may request a full refund of your most recent subscription charge by emailing ", jsx(_components.a, {
                href: "mailto:support@seotool.im",
                children: "support@seotool.im"
              }), " within thirty (30) days of that charge. The guarantee applies to subscription fees only and does not apply to separately purchased usage or top-up credits that have been consumed. Company reserves the right, in its sole discretion, to review each refund request and to decline a refund where it reasonably suspects fraud, abuse of the guarantee (including repeated subscribe-and-refund cycles), violation of these Terms or the Acceptable Use Policy, or other misuse of the Site or the refund policy. You may cancel your subscription at any time through your billing portal; your access will continue through the end of the then-current billing period, and no further charges will be made."]
            }), "\n"]
          }), "\n"]
        }), "\n"]
      }), "\n", jsxs(_components.li, {
        children: ["\n", jsx(_components.p, {
          children: jsx(_components.strong, {
            children: "User Content"
          })
        }), "\n", jsxs(_components.ol, {
          children: ["\n", jsxs(_components.li, {
            children: ["\n", jsxs(_components.p, {
              children: [jsx(_components.strong, {
                children: "User Content."
              }), " “", jsx(_components.strong, {
                children: "User Content"
              }), "” means any and all information and content that a user submits to, or uses with, the Site (e.g., content in the user’s profile or postings). You are solely responsible for your User Content. You assume all risks associated with use of your User Content, including any reliance on its accuracy, completeness or usefulness by others, or any disclosure of your User Content that personally identifies you or any third party. You hereby represent and warrant that your User Content does not violate our Acceptable Use Policy (defined in Section 3.3). You may not represent or imply to others that your User Content is in any way provided, sponsored or endorsed by Company. Since you alone are responsible for your User Content, you may expose yourself to liability if, for example, your User Content violates the Acceptable Use Policy. Company is not obligated to backup any User Content, and your User Content may be deleted at any time without prior notice. You are solely responsible for creating and maintaining your own backup copies of your User Content if you desire."]
            }), "\n"]
          }), "\n", jsxs(_components.li, {
            children: ["\n", jsxs(_components.p, {
              children: [jsx(_components.strong, {
                children: "License."
              }), " You hereby grant (and you represent and warrant that you have the right to grant) to Company an irrevocable, nonexclusive, royalty-free and fully paid, worldwide license to reproduce, distribute, publicly display and perform, prepare derivative works of, incorporate into other works, and otherwise use and exploit your User Content, and to grant sublicenses of the foregoing rights, solely for the purposes of including your User Content in the Site. You hereby irrevocably waive (and agree to cause to be waived) any claims and assertions of moral rights or attribution with respect to your User Content."]
            }), "\n"]
          }), "\n", jsxs(_components.li, {
            children: ["\n", jsxs(_components.p, {
              children: [jsx(_components.strong, {
                children: "Acceptable Use Policy."
              }), " The following terms constitute our “", jsx(_components.strong, {
                children: "Acceptable Use Policy"
              }), "”:"]
            }), "\n", jsxs(_components.ol, {
              children: ["\n", jsxs(_components.li, {
                children: ["\n", jsx(_components.p, {
                  children: "You agree not to use the Site to collect, upload, transmit, display, or distribute any User Content (i) that violates any third-party right, including any copyright, trademark, patent, trade secret, moral right, privacy right, right of publicity, or any other intellectual property or proprietary right, (ii) that is unlawful, harassing, abusive, tortious, threatening, harmful, invasive of another’s privacy, vulgar, defamatory, false, intentionally misleading, trade libelous, pornographic, obscene, patently offensive, promotes racism, bigotry, hatred, or physical harm of any kind against any group or individual or is otherwise objectionable, (iii) that is harmful to minors in any way, or (iv) that is in violation of any law, regulation, or obligations or restrictions imposed by any third party."
                }), "\n"]
              }), "\n", jsxs(_components.li, {
                children: ["\n", jsx(_components.p, {
                  children: "In addition, you agree not to: (i) upload, transmit, or distribute to or through the Site any computer viruses, worms, or any software intended to damage or alter a computer system or data; (ii) send through the Site unsolicited or unauthorized advertising, promotional materials, junk mail, spam, chain letters, pyramid schemes, or any other form of duplicative or unsolicited messages, whether commercial or otherwise; (iii) use the Site to harvest, collect, gather or assemble information or data regarding other users, including e-mail addresses, without their consent; (iv) interfere with, disrupt, or create an undue burden on servers or networks connected to the Site, or violate the regulations, policies or procedures of such networks; (v) attempt to gain unauthorized access to the Site (or to other computer systems or networks connected to or used together with the Site), whether through password mining or any other means; (vi) harass or interfere with any other user’s use and enjoyment of the Site; or (vii) use software or automated agents or scripts to produce multiple accounts on the Site, or to generate automated searches, requests, or queries to (or to strip, scrape, or mine data from) the Site (provided, however, that we conditionally grant to the operators of public search engines revocable permission to use spiders to copy materials from the Site for the sole purpose of and solely to the extent necessary for creating publicly available searchable indices of the materials, but not caches or archives of such materials, subject to the parameters set forth in our robots.txt file)."
                }), "\n"]
              }), "\n"]
            }), "\n"]
          }), "\n", jsxs(_components.li, {
            children: ["\n", jsxs(_components.p, {
              children: [jsx(_components.strong, {
                children: "Enforcement."
              }), " We reserve the right (but have no obligation) to review, refuse and/or remove any User Content in our sole discretion, and to investigate and/or take appropriate action against you in our sole discretion if you violate the Acceptable Use Policy or any other provision of these Terms or otherwise create liability for us or any other person. Such action may include removing or modifying your User Content, terminating your Account in accordance with Section 8, and/or reporting you to law enforcement authorities."]
            }), "\n"]
          }), "\n"]
        }), "\n"]
      }), "\n", jsxs(_components.li, {
        children: ["\n", jsxs(_components.p, {
          children: [jsx(_components.strong, {
            children: "Indemnification."
          }), " You agree to indemnify and hold Company (and its officers, employees, and agents) harmless, including costs and attorneys’ fees, from any claim or demand made by any third party due to or arising out of (a) your use of the Site, (b) your violation of these Terms, (c) your violation of applicable laws or regulations or (d) your User Content. Company reserves the right, at your expense, to assume the exclusive defense and control of any matter for which you are required to indemnify us, and you agree to cooperate with our defense of these claims. You agree not to settle any matter without the prior written consent of Company. Company will use reasonable efforts to notify you of any such claim, action or proceeding upon becoming aware of it."]
        }), "\n"]
      }), "\n", jsxs(_components.li, {
        children: ["\n", jsx(_components.p, {
          children: jsx(_components.strong, {
            children: "Third-Party Links & Ads; Other Users"
          })
        }), "\n", jsxs(_components.ol, {
          children: ["\n", jsxs(_components.li, {
            children: ["\n", jsxs(_components.p, {
              children: [jsx(_components.strong, {
                children: "Third-Party Links & Ads."
              }), " The Site may contain links to third-party websites and services, and/or display advertisements for third parties (collectively, “", jsx(_components.strong, {
                children: "Third-Party Links & Ads"
              }), "”). Such Third-Party Links & Ads are not under the control of Company, and Company is not responsible for any Third-Party Links & Ads. Company provides access to these Third-Party Links & Ads only as a convenience to you, and does not review, approve, monitor, endorse, warrant, or make any representations with respect to Third-Party Links & Ads. You use all Third-Party Links & Ads at your own risk, and should apply a suitable level of caution and discretion in doing so. When you click on any of the Third-Party Links & Ads, the applicable third party’s terms and policies apply, including the third party’s privacy and data gathering practices. You should make whatever investigation you feel necessary or appropriate before proceeding with any transaction in connection with such Third-Party Links & Ads."]
            }), "\n"]
          }), "\n", jsxs(_components.li, {
            children: ["\n", jsxs(_components.p, {
              children: [jsx(_components.strong, {
                children: "Other Users."
              }), " Each Site user is solely responsible for any and all of its own User Content. Since we do not control User Content, you acknowledge and agree that we are not responsible for any User Content, whether provided by you or by others. We make no guarantees regarding the accuracy, currency, suitability, appropriateness, or quality of any User Content. Your interactions with other Site users are solely between you and such users. You agree that Company will not be responsible for any loss or damage incurred as the result of any such interactions. If there is a dispute between you and any Site user, we are under no obligation to become involved."]
            }), "\n"]
          }), "\n", jsxs(_components.li, {
            children: ["\n", jsxs(_components.p, {
              children: [jsx(_components.strong, {
                children: "Release."
              }), " You hereby release and forever discharge Company (and our officers, employees, agents, successors, and assigns) from, and hereby waive and relinquish, each and every past, present and future dispute, claim, controversy, demand, right, obligation, liability, action and cause of action of every kind and nature (including personal injuries, death, and property damage), that has arisen or arises directly or indirectly out of, or that relates directly or indirectly to, the Site (including any interactions with, or act or omission of, other Site users or any Third-Party Links & Ads). IF YOU ARE A CALIFORNIA RESIDENT, YOU HEREBY WAIVE CALIFORNIA CIVIL CODE SECTION 1542 IN CONNECTION WITH THE FOREGOING, WHICH STATES: “A GENERAL RELEASE DOES NOT EXTEND TO CLAIMS WHICH THE CREDITOR OR RELEASING PARTY DOES NOT KNOW OR SUSPECT TO EXIST IN HIS OR HER FAVOR AT THE TIME OF EXECUTING THE RELEASE, WHICH IF KNOWN BY HIM OR HER MUST HAVE MATERIALLY AFFECTED HIS OR HER SETTLEMENT WITH THE DEBTOR OR RELEASED PARTY.”"]
            }), "\n"]
          }), "\n"]
        }), "\n"]
      }), "\n", jsxs(_components.li, {
        children: ["\n", jsx(_components.p, {
          children: jsx(_components.strong, {
            children: "Disclaimers"
          })
        }), "\n"]
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: "THE SITE IS PROVIDED ON AN “AS-IS” AND “AS AVAILABLE” BASIS, AND COMPANY (AND OUR SUPPLIERS) EXPRESSLY DISCLAIM ANY AND ALL WARRANTIES AND CONDITIONS OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING ALL WARRANTIES OR CONDITIONS OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, QUIET ENJOYMENT, ACCURACY, OR NON-INFRINGEMENT. WE (AND OUR SUPPLIERS) MAKE NO WARRANTY THAT THE SITE WILL MEET YOUR REQUIREMENTS, WILL BE AVAILABLE ON AN UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE BASIS, OR WILL BE ACCURATE, RELIABLE, FREE OF VIRUSES OR OTHER HARMFUL CODE, COMPLETE, LEGAL, OR SAFE. IF APPLICABLE LAW REQUIRES ANY WARRANTIES WITH RESPECT TO THE SITE, ALL SUCH WARRANTIES ARE LIMITED IN DURATION TO 90 DAYS FROM THE DATE OF FIRST USE."
    }), "\n", jsx(_components.p, {
      children: "SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF IMPLIED WARRANTIES, SO THE ABOVE EXCLUSION MAY NOT APPLY TO YOU. SOME JURISDICTIONS DO NOT ALLOW LIMITATIONS ON HOW LONG AN IMPLIED WARRANTY LASTS, SO THE ABOVE LIMITATION MAY NOT APPLY TO YOU."
    }), "\n", jsxs(_components.ol, {
      start: "7",
      children: ["\n", jsx(_components.li, {
        children: jsx(_components.strong, {
          children: "Limitation on Liability"
        })
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: "TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL COMPANY (OR OUR SUPPLIERS) BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY LOST PROFITS, LOST DATA, COSTS OF PROCUREMENT OF SUBSTITUTE PRODUCTS, OR ANY INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL OR PUNITIVE DAMAGES ARISING FROM OR RELATING TO THESE TERMS OR YOUR USE OF, OR INABILITY TO USE, THE SITE, EVEN IF COMPANY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. ACCESS TO, AND USE OF, THE SITE IS AT YOUR OWN DISCRETION AND RISK, AND YOU WILL BE SOLELY RESPONSIBLE FOR ANY DAMAGE TO YOUR DEVICE OR COMPUTER SYSTEM, OR LOSS OF DATA RESULTING THEREFROM."
    }), "\n", jsx(_components.p, {
      children: "TO THE MAXIMUM EXTENT PERMITTED BY LAW, NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, OUR LIABILITY TO YOU FOR ANY DAMAGES ARISING FROM OR RELATED TO THESE TERMS (FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE ACTION), WILL AT ALL TIMES BE LIMITED TO A MAXIMUM OF FIFTY US DOLLARS. THE EXISTENCE OF MORE THAN ONE CLAIM WILL NOT ENLARGE THIS LIMIT. YOU AGREE THAT OUR SUPPLIERS WILL HAVE NO LIABILITY OF ANY KIND ARISING FROM OR RELATING TO THESE TERMS."
    }), "\n", jsx(_components.p, {
      children: "SOME JURISDICTIONS DO NOT ALLOW THE LIMITATION OR EXCLUSION OF LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THE ABOVE LIMITATION OR EXCLUSION MAY NOT APPLY TO YOU."
    }), "\n", jsxs(_components.ol, {
      start: "8",
      children: ["\n", jsxs(_components.li, {
        children: ["\n", jsxs(_components.p, {
          children: [jsx(_components.strong, {
            children: "Term and Termination."
          }), " Subject to this Section, these Terms will remain in full force and effect while you use the Site. We may suspend or terminate your rights to use the Site (including your Account) at any time for any reason at our sole discretion, including for any use of the Site in violation of these Terms. Upon termination of your rights under these Terms, your Account and right to access and use the Site will terminate immediately. You understand that any termination of your Account may involve deletion of your User Content associated with your Account from our live databases. Company will not have any liability whatsoever to you for any termination of your rights under these Terms, including for termination of your Account or deletion of your User Content. Even after your rights under these Terms are terminated, the following provisions of these Terms will remain in effect: Sections 2.2 through 2.6, Section 3 and Sections 4 through 10."]
        }), "\n"]
      }), "\n", jsxs(_components.li, {
        children: ["\n", jsx(_components.p, {
          children: jsx(_components.strong, {
            children: "Copyright Policy."
          })
        }), "\n"]
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: "Company respects the intellectual property of others and asks that users of our Site do the same. In connection with our Site, we have adopted and implemented a policy respecting copyright law that provides for the removal of any infringing materials and for the termination, in appropriate circumstances, of users of our online Site who are repeat infringers of intellectual property rights, including copyrights. If you believe that one of our users is, through the use of our Site, unlawfully infringing the copyright(s) in a work, and wish to have the allegedly infringing material removed, the following information in the form of a written notification (pursuant to 17 U.S.C. § 512(c)) must be provided to our designated Copyright Agent:"
    }), "\n", jsxs(_components.ol, {
      children: ["\n", jsx(_components.li, {
        children: "your physical or electronic signature;"
      }), "\n", jsx(_components.li, {
        children: "identification of the copyrighted work(s) that you claim to have been infringed;"
      }), "\n", jsx(_components.li, {
        children: "identification of the material on our services that you claim is infringing and that you request us to remove;"
      }), "\n", jsx(_components.li, {
        children: "sufficient information to permit us to locate such material;"
      }), "\n", jsx(_components.li, {
        children: "your address, telephone number, and e-mail address;"
      }), "\n", jsx(_components.li, {
        children: "a statement that you have a good faith belief that use of the objectionable material is not authorized by the copyright owner, its agent, or under the law; and"
      }), "\n", jsx(_components.li, {
        children: "a statement that the information in the notification is accurate, and under penalty of perjury, that you are either the owner of the copyright that has allegedly been infringed or that you are authorized to act on behalf of the copyright owner."
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: "Please note that, pursuant to 17 U.S.C. § 512(f), any misrepresentation of material fact (falsities) in a written notification automatically subjects the complaining party to liability for any damages, costs and attorney’s fees incurred by us in connection with the written notification and allegation of copyright infringement."
    }), "\n", jsxs(_components.p, {
      children: ["The designated Copyright Agent for Company is: Every App, Inc", jsx(_components.br, {}), "\n", "Designated Agent: Benjamin Senescu", jsx(_components.br, {}), "\n", "Address of Agent: 34 Harding Street, Cambridge, MA 02141 US", jsx(_components.br, {}), "\n", "Telephone: 4842529019", jsx(_components.br, {}), "\n", "Fax: n/a", jsx(_components.br, {}), "\n", "Email: ", jsx(_components.a, {
        href: "mailto:support@seotool.im",
        children: "support@seotool.im"
      })]
    }), "\n", jsxs(_components.ol, {
      start: "10",
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "General"
        }), "\n", jsxs(_components.ol, {
          children: ["\n", jsxs(_components.li, {
            children: ["\n", jsxs(_components.p, {
              children: [jsx(_components.strong, {
                children: "Changes."
              }), " These Terms are subject to occasional revision, and if we make any substantial changes, we may notify you by sending you an e-mail to the last e-mail address you provided to us (if any), and/or by prominently posting notice of the changes on our Site. You are responsible for providing us with your most current e-mail address. In the event that the last e-mail address that you have provided us is not valid, or for any reason is not capable of delivering to you the notice described above, our dispatch of the e-mail containing such notice will nonetheless constitute effective notice of the changes described in the notice. Continued use of our Site following notice of such changes shall indicate your acknowledgement of such changes and agreement to be bound by the terms and conditions of such changes."]
            }), "\n"]
          }), "\n", jsxs(_components.li, {
            children: ["\n", jsxs(_components.p, {
              children: [jsx(_components.strong, {
                children: "Dispute Resolution."
              }), " Please read the following arbitration agreement in this Section (the “", jsx(_components.strong, {
                children: "Arbitration Agreement"
              }), "”) carefully. It requires you to arbitrate disputes with Company, its parent companies, subsidiaries, affiliates, successors and assigns and all of their respective officers, directors, employees, agents, and representatives (collectively, the “", jsx(_components.strong, {
                children: "Company Parties"
              }), "”) and limits the manner in which you can seek relief from the Company Parties*.*"]
            }), "\n", jsxs(_components.ol, {
              children: ["\n", jsxs(_components.li, {
                children: ["\n", jsxs(_components.p, {
                  children: [jsxs(_components.em, {
                    children: [jsx(_components.em, {
                      children: "Applicability of Arbitration Agreement"
                    }), "."]
                  }), "** You agree that any dispute between you and any of the Company Parties relating in any way to the Site, the services offered on the Site (the “", jsx(_components.strong, {
                    children: "Services"
                  }), "”) or these Terms will be resolved by binding arbitration, rather than in court, except that (1) you and the Company Parties may assert individualized claims in small claims court if the claims qualify, remain in such court and advance solely on an individual, non-class basis; and (2) you or the Company Parties may seek equitable relief in court for infringement or other misuse of intellectual property rights (such as trademarks, trade dress, domain names, trade secrets, copyrights, and patents). ", jsx(_components.strong, {
                    children: "This Arbitration Agreement shall survive the expiration or termination of these Terms and shall apply, without limitation, to all claims that arose or were asserted before you agreed to these Terms (in accordance with the preamble) or any prior version of these Terms."
                  }), " This Arbitration Agreement does not preclude you from bringing issues to the attention of federal, state or local agencies. Such agencies can, if the law allows, seek relief against the Company Parties on your behalf. For purposes of this Arbitration Agreement, “", jsx(_components.strong, {
                    children: "Dispute"
                  }), "” will also include disputes that arose or involve facts occurring before the existence of this or any prior versions of the Agreement as well as claims that may arise after the termination of these Terms."]
                }), "\n"]
              }), "\n", jsxs(_components.li, {
                children: ["\n", jsxs(_components.p, {
                  children: [jsx(_components.strong, {
                    children: "Informal Dispute Resolution."
                  }), " There might be instances when a Dispute arises between you and Company. If that occurs, Company is committed to working with you to reach a reasonable resolution. You and Company agree that good faith informal efforts to resolve Disputes can result in a prompt, low‐cost and mutually beneficial outcome. You and Company therefore agree that before either party commences arbitration against the other (or initiates an action in small claims court if a party so elects), we will personally meet and confer telephonically or via videoconference, in a good faith effort to resolve informally any Dispute covered by this Arbitration Agreement (“", jsx(_components.strong, {
                    children: "Informal Dispute Resolution Conference"
                  }), "”). If you are represented by counsel, your counsel may participate in the conference, but you will also participate in the conference."]
                }), "\n"]
              }), "\n"]
            }), "\n"]
          }), "\n"]
        }), "\n"]
      }), "\n"]
    }), "\n", jsxs(_components.p, {
      children: ["The party initiating a Dispute must give notice to the other party in writing of its intent to initiate an Informal Dispute Resolution Conference (“", jsx(_components.strong, {
        children: "Notice"
      }), "”), which shall occur within 45 days after the other party receives such Notice, unless an extension is mutually agreed upon by the parties. Notice to Company that you intend to initiate an Informal Dispute Resolution Conference should be sent by email to: ", jsx(_components.a, {
        href: "mailto:support@seotool.im",
        children: "support@seotool.im"
      }), ", or by regular mail to 34 Harding Street , Cambridge, Massachusetts 02141. The Notice must include: (1) your name, telephone number, mailing address, e‐mail address associated with your account (if you have one); (2) the name, telephone number, mailing address and e‐mail address of your counsel, if any; and (3) a description of your Dispute."]
    }), "\n", jsx(_components.p, {
      children: "The Informal Dispute Resolution Conference shall be individualized such that a separate conference must be held each time either party initiates a Dispute, even if the same law firm or group of law firms represents multiple users in similar cases, unless all parties agree; multiple individuals initiating a Dispute cannot participate in the same Informal Dispute Resolution Conference unless all parties agree. In the time between a party receiving the Notice and the Informal Dispute Resolution Conference, nothing in this Arbitration Agreement shall prohibit the parties from engaging in informal communications to resolve the initiating party’s Dispute. Engaging in the Informal Dispute Resolution Conference is a condition precedent and requirement that must be fulfilled before commencing arbitration. The statute of limitations and any filing fee deadlines shall be tolled while the parties engage in the Informal Dispute Resolution Conference process required by this section."
    }), "\n", jsxs(_components.ol, {
      start: "3",
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Arbitration Rules and Forum."
        }), " These Terms evidence a transaction involving interstate commerce; and notwithstanding any other provision herein with respect to the applicable substantive law, the Federal Arbitration Act, 9 U.S.C. § 1 et seq., will govern the interpretation and enforcement of this Arbitration Agreement and any arbitration proceedings. If the Informal Dispute Resolution Process described above does not resolve satisfactorily within 60 days after receipt of your Notice, you and Company agree that either party shall have the right to finally resolve the Dispute through binding arbitration. The Federal Arbitration Act governs the interpretation and enforcement of this Arbitration Agreement. The arbitration will be conducted by JAMS, an established alternative dispute resolution provider. Disputes involving claims and counterclaims with an amount in controversy under $250,000, not inclusive of attorneys’ fees and interest, shall be subject to JAMS’ most current version of the Streamlined Arbitration Rules and procedures available at ", jsx(_components.a, {
          href: "http://www.jamsadr.com/rules-streamlined-arbitration/",
          children: "http://www.jamsadr.com/rules-streamlined-arbitration/"
        }), "; all other claims shall be subject to JAMS’s most current version of the Comprehensive Arbitration Rules and Procedures, available at ", jsx(_components.a, {
          href: "http://www.jamsadr.com/rules-comprehensive-arbitration/",
          children: "http://www.jamsadr.com/rules-comprehensive-arbitration/"
        }), ". JAMS’s rules are also available at ", jsx(_components.a, {
          href: "http://www.jamsadr.com/",
          children: "www.jamsadr.com"
        }), " or by calling JAMS at 800-352-5267. A party who wishes to initiate arbitration must provide the other party with a request for arbitration (the “", jsx(_components.strong, {
          children: "Request"
        }), "”). The Request must include: (1) the name, telephone number, mailing address, e‐mail address of the party seeking arbitration and the account username (if applicable) as well as the email address associated with any applicable account; (2) a statement of the legal claims being asserted and the factual bases of those claims; (3) a description of the remedy sought and an accurate, good‐faith calculation of the amount in controversy in United States Dollars; (4) a statement certifying completion of the Informal Dispute Resolution process as described above; and (5) evidence that the requesting party has paid any necessary filing fees in connection with such arbitration."]
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: "If the party requesting arbitration is represented by counsel, the Request shall also include counsel’s name, telephone number, mailing address, and email address. Such counsel must also sign the Request. By signing the Request, counsel certifies to the best of counsel’s knowledge, information, and belief, formed after an inquiry reasonable under the circumstances, that: (1) the Request is not being presented for any improper purpose, such as to harass, cause unnecessary delay, or needlessly increase the cost of dispute resolution; (2) the claims, defenses and other legal contentions are warranted by existing law or by a nonfrivolous argument for extending, modifying, or reversing existing law or for establishing new law; and (3) the factual and damages contentions have evidentiary support or, if specifically so identified, will likely have evidentiary support after a reasonable opportunity for further investigation or discovery."
    }), "\n", jsx(_components.p, {
      children: "Unless you and Company otherwise agree, or the Batch Arbitration process discussed in Subsection 10.2(h) is triggered, the arbitration will be conducted in the county where you reside. Subject to the JAMS Rules, the arbitrator may direct a limited and reasonable exchange of information between the parties, consistent with the expedited nature of the arbitration. If the JAMS is not available to arbitrate, the parties will select an alternative arbitral forum. Your responsibility to pay any JAMS fees and costs will be solely as set forth in the applicable JAMS Rules."
    }), "\n", jsx(_components.p, {
      children: "You and Company agree that all materials and documents exchanged during the arbitration proceedings shall be kept confidential and shall not be shared with anyone except the parties’ attorneys, accountants, or business advisors, and then subject to the condition that they agree to keep all materials and documents exchanged during the arbitration proceedings confidential."
    }), "\n", jsxs(_components.ol, {
      start: "4",
      children: ["\n", jsxs(_components.li, {
        children: ["\n", jsxs(_components.p, {
          children: [jsx(_components.strong, {
            children: "Authority of Arbitrator."
          }), " The arbitrator shall have exclusive authority to resolve all disputes subject to arbitration hereunder including, without limitation, any dispute related to the interpretation, applicability, enforceability or formation of this Arbitration Agreement or any portion of the Arbitration Agreement, except for the following: (1) all Disputes arising out of or relating to the subsection entitled “Waiver of Class or Other Non-Individualized Relief,” including any claim that all or part of the subsection entitled “Waiver of Class or Other Non-Individualized Relief” is unenforceable, illegal, void or voidable, or that such subsection entitled “Waiver of Class or Other Non-Individualized Relief” has been breached, shall be decided by a court of competent jurisdiction and not by an arbitrator; (2) except as expressly contemplated in the subsection entitled “Batch Arbitration,” all Disputes about the payment of arbitration fees shall be decided only by a court of competent jurisdiction and not by an arbitrator; (3) all Disputes about whether either party has satisfied any condition precedent to arbitration shall be decided only by a court of competent jurisdiction and not by an arbitrator; and (4) all Disputes about which version of the Arbitration Agreement applies shall be decided only by a court of competent jurisdiction and not by an arbitrator. The arbitration proceeding will not be consolidated with any other matters or joined with any other cases or parties, except as expressly provided in the subsection entitled “Batch Arbitration.” The arbitrator shall have the authority to grant motions dispositive of all or part of any claim or dispute. The arbitrator shall have the authority to award monetary damages and to grant any non-monetary remedy or relief available to an individual party under applicable law, the arbitral forum’s rules, and these Terms (including the Arbitration Agreement). The arbitrator shall issue a written award and statement of decision describing the essential findings and conclusions on which any award (or decision not to render an award) is based, including the calculation of any damages awarded. The arbitrator shall follow the applicable law. The award of the arbitrator is final and binding upon you and us. Judgment on the arbitration award may be entered in any court having jurisdiction.\n5. ", jsx(_components.strong, {
            children: "Waiver of Jury Trial."
          }), " EXCEPT AS SPECIFIED IN SECTION 10.2(A) YOU AND THE COMPANY PARTIES HEREBY WAIVE ANY CONSTITUTIONAL AND STATUTORY RIGHTS TO SUE IN COURT AND HAVE A TRIAL IN FRONT OF A JUDGE OR A JURY. You and the Company Parties are instead electing that all covered claims and disputes shall be resolved exclusively by arbitration under this Arbitration Agreement, except as specified in Section 10.2(a) above. An arbitrator can award on an individual basis the same damages and relief as a court and must follow these Terms as a court would. However, there is no judge or jury in arbitration, and court review of an arbitration award is subject to very limited review."]
        }), "\n", jsxs(_components.ol, {
          start: "6",
          children: ["\n", jsxs(_components.li, {
            children: ["\n", jsxs(_components.p, {
              children: [jsx(_components.strong, {
                children: "Waiver of Class or Other Non-Individualized Relief."
              }), " YOU AND COMPANY AGREE THAT, EXCEPT AS SPECIFIED IN SUBSECTION 10.2(H) EACH OF US MAY BRING CLAIMS AGAINST THE OTHER ONLY ON AN INDIVIDUAL BASIS AND NOT ON A CLASS, REPRESENTATIVE, OR COLLECTIVE BASIS, AND THE PARTIES HEREBY WAIVE ALL RIGHTS TO HAVE ANY DISPUTE BE BROUGHT, HEARD, ADMINISTERED, RESOLVED, OR ARBITRATED ON A CLASS, COLLECTIVE, REPRESENTATIVE, OR MASS ACTION BASIS. ONLY INDIVIDUAL RELIEF IS AVAILABLE, AND DISPUTES OF MORE THAN ONE CUSTOMER OR USER CANNOT BE ARBITRATED OR CONSOLIDATED WITH THOSE OF ANY OTHER CUSTOMER OR USER. Subject to this Arbitration Agreement, the arbitrator may award declaratory or injunctive relief only in favor of the individual party seeking relief and only to the extent necessary to provide relief warranted by the party’s individual claim. Nothing in this paragraph is intended to, nor shall it, affect the terms and conditions under the Subsection 10.2(h) entitled “Batch Arbitration.” Notwithstanding anything to the contrary in this Arbitration Agreement, if a court decides by means of a final decision, not subject to any further appeal or recourse, that the limitations of this subsection, “Waiver of Class or Other Non-Individualized Relief,” are invalid or unenforceable as to a particular claim or request for relief (such as a request for public injunctive relief), you and Company agree that that particular claim or request for relief (and only that particular claim or request for relief) shall be severed from the arbitration and may be litigated in the state or federal courts located in the State of Massachusetts. All other Disputes shall be arbitrated or litigated in small claims court. This subsection does not prevent you or Company from participating in a class-wide settlement of claims."]
            }), "\n"]
          }), "\n", jsxs(_components.li, {
            children: ["\n", jsxs(_components.p, {
              children: [jsx(_components.strong, {
                children: "Attorneys’ Fees and Costs."
              }), " The parties shall bear their own attorneys’ fees and costs in arbitration unless the arbitrator finds that either the substance of the Dispute or the relief sought in the Request was frivolous or was brought for an improper purpose (as measured by the standards set forth in Federal Rule of Civil Procedure 11(b)). If you or Company need to invoke the authority of a court of competent jurisdiction to compel arbitration, then the party that obtains an order compelling arbitration in such action shall have the right to collect from the other party its reasonable costs, necessary disbursements, and reasonable attorneys’ fees incurred in securing an order compelling arbitration. The prevailing party in any court action relating to whether either party has satisfied any condition precedent to arbitration, including the Informal Dispute Resolution Process, is entitled to recover their reasonable costs, necessary disbursements, and reasonable attorneys’ fees and costs."]
            }), "\n"]
          }), "\n", jsxs(_components.li, {
            children: ["\n", jsxs(_components.p, {
              children: [jsx(_components.strong, {
                children: "Batch Arbitration."
              }), " To increase the efficiency of administration and resolution of arbitrations, you and Company agree that in the event that there are 100 or more individual Requests of a substantially similar nature filed against Company by or with the assistance of the same law firm, group of law firms, or organizations, within a 30 day period (or as soon as possible thereafter), the JAMS shall (1) administer the arbitration demands in batches of 100 Requests per batch (plus, to the extent there are less than 100 Requests left over after the batching described above, a final batch consisting of the remaining Requests); (2) appoint one arbitrator for each batch; and (3) provide for the resolution of each batch as a single consolidated arbitration with one set of filing and administrative fees due per side per batch, one procedural calendar, one hearing (if any) in a place to be determined by the arbitrator, and one final award (“", jsx(_components.strong, {
                children: "Batch Arbitration"
              }), "”)."]
            }), "\n"]
          }), "\n"]
        }), "\n"]
      }), "\n"]
    }), "\n", jsxs(_components.p, {
      children: ["All parties agree that Requests are of a “substantially similar nature” if they arise out of or relate to the same event or factual scenario and raise the same or similar legal issues and seek the same or similar relief. To the extent the parties disagree on the application of the Batch Arbitration process, the disagreeing party shall advise the JAMS, and the JAMS shall appoint a sole standing arbitrator to determine the applicability of the Batch Arbitration process (“", jsx(_components.strong, {
        children: "Administrative Arbitrator"
      }), "”). In an effort to expedite resolution of any such dispute by the Administrative Arbitrator, the parties agree the Administrative Arbitrator may set forth such procedures as are necessary to resolve any disputes promptly. The Administrative Arbitrator’s fees shall be paid by Company."]
    }), "\n", jsx(_components.p, {
      children: "You and Company agree to cooperate in good faith with the JAMS to implement the Batch Arbitration process including the payment of single filing and administrative fees for batches of Requests, as well as any steps to minimize the time and costs of arbitration, which may include: (1) the appointment of a discovery special master to assist the arbitrator in the resolution of discovery disputes; and (2) the adoption of an expedited calendar of the arbitration proceedings."
    }), "\n", jsx(_components.p, {
      children: "This Batch Arbitration provision shall in no way be interpreted as authorizing a class, collective and/or mass arbitration or action of any kind, or arbitration involving joint or consolidated claims under any circumstances, except as expressly set forth in this provision."
    }), "\n", jsxs(_components.ol, {
      start: "9",
      children: ["\n", jsxs(_components.li, {
        children: ["\n", jsxs(_components.p, {
          children: [jsx(_components.strong, {
            children: "30-Day Right to Opt Out."
          }), " You have the right to opt out of the provisions of this Arbitration Agreement by sending a timely written notice of your decision to opt out to the following address: 34 Harding Street , Cambridge, Massachusetts 02141, or email to ", jsx(_components.a, {
            href: "mailto:support@seotool.im",
            children: "support@seotool.im"
          }), ", within 30 days after first becoming subject to this Arbitration Agreement. Your notice must include your name and address and a clear statement that you want to opt out of this Arbitration Agreement. If you opt out of this Arbitration Agreement, all other parts of these Terms will continue to apply to you. Opting out of this Arbitration Agreement has no effect on any other arbitration agreements that you may currently have with us, or may enter into in the future with us.\n10. ", jsx(_components.strong, {
            children: "Invalidity, Expiration."
          }), " Except as provided in the subsection entitled “Waiver of Class or Other Non-Individualized Relief”, if any part or parts of this Arbitration Agreement are found under the law to be invalid or unenforceable, then such specific part or parts shall be of no force and effect and shall be severed and the remainder of the Arbitration Agreement shall continue in full force and effect. You further agree that any Dispute that you have with Company as detailed in this Arbitration Agreement must be initiated via arbitration within the applicable statute of limitation for that claim or controversy, or it will be forever time barred. Likewise, you agree that all applicable statutes of limitation will apply to such arbitration in the same manner as those statutes of limitation would apply in the applicable court of competent jurisdiction.\n11. ", jsx(_components.strong, {
            children: "Modification."
          }), " Notwithstanding any provision in these Terms to the contrary, we agree that if Company makes any future material change to this Arbitration Agreement, you may reject that change within 30 days of such change becoming effective by writing Company at the following address: 34 Harding Street , Cambridge, Massachusetts 02141, or email to ", jsx(_components.a, {
            href: "mailto:support@seotool.im",
            children: "support@seotool.im"
          }), ". Unless you reject the change within 30 days of such change becoming effective by writing to Company in accordance with the foregoing, your continued use of the Site and/or Services, including the acceptance of products and services offered on the Site following the posting of changes to this Arbitration Agreement constitutes your acceptance of any such changes. Changes to this Arbitration Agreement do not provide you with a new opportunity to opt out of the Arbitration Agreement if you have previously agreed to a version of these Terms and did not validly opt out of arbitration. If you reject any change or update to this Arbitration Agreement, and you were bound by an existing agreement to arbitrate Disputes arising out of or relating in any way to your access to or use of the Services or of the Site, any communications you receive, any products sold or distributed through the Site, the Services, or these Terms, the provisions of this Arbitration Agreement as of the date you first accepted these Terms (or accepted any subsequent changes to these Terms) remain in full force and effect. Company will continue to honor any valid opt outs of the Arbitration Agreement that you made to a prior version of these Terms.\n3) ", jsx(_components.strong, {
            children: "Export."
          }), " The Site may be subject to U.S. export control laws and may be subject to export or import regulations in other countries. You agree not to export, reexport, or transfer, directly or indirectly, any U.S. technical data acquired from Company, or any products utilizing such data, in violation of the United States export laws or regulations."]
        }), "\n", jsxs(_components.ol, {
          start: "4",
          children: ["\n", jsxs(_components.li, {
            children: ["\n", jsxs(_components.p, {
              children: [jsx(_components.strong, {
                children: "Disclosures."
              }), " Company is located at the address in Section 10.8. If you are a California resident, you may report complaints to the Complaint Assistance Unit of the Division of Consumer Product of the California Department of Consumer Affairs by contacting them in writing at 400 R Street, Sacramento, CA 95814, or by telephone at (800) 952-5210."]
            }), "\n"]
          }), "\n", jsxs(_components.li, {
            children: ["\n", jsxs(_components.p, {
              children: [jsx(_components.strong, {
                children: "Electronic Communications."
              }), " The communications between you and Company use electronic means, whether you use the Site or send us emails, or whether Company posts notices on the Site or communicates with you via email. For contractual purposes, you (a) consent to receive communications from Company in an electronic form; and (b) agree that all terms and conditions, agreements, notices, disclosures, and other communications that Company provides to you electronically satisfy any legal requirement that such communications would satisfy if it were be in a hardcopy writing. The foregoing does not affect your non-waivable rights."]
            }), "\n"]
          }), "\n", jsxs(_components.li, {
            children: ["\n", jsxs(_components.p, {
              children: [jsx(_components.strong, {
                children: "Entire Terms."
              }), " These Terms constitute the entire agreement between you and us regarding the use of the Site. Our failure to exercise or enforce any right or provision of these Terms shall not operate as a waiver of such right or provision. The section titles in these Terms are for convenience only and have no legal or contractual effect. The word “including” means “including without limitation”. If any provision of these Terms is, for any reason, held to be invalid or unenforceable, the other provisions of these Terms will be unimpaired and the invalid or unenforceable provision will be deemed modified so that it is valid and enforceable to the maximum extent permitted by law. Your relationship to Company is that of an independent contractor, and neither party is an agent or partner of the other. These Terms, and your rights and obligations herein, may not be assigned, subcontracted, delegated, or otherwise transferred by you without Company’s prior written consent, and any attempted assignment, subcontract, delegation, or transfer in violation of the foregoing will be null and void. Company may freely assign these Terms. The terms and conditions set forth in these Terms shall be binding upon assignees."]
            }), "\n"]
          }), "\n", jsxs(_components.li, {
            children: ["\n", jsxs(_components.p, {
              children: [jsx(_components.strong, {
                children: "Copyright/Trademark Information."
              }), " Copyright © 2026 Every App, Inc. All rights reserved. All trademarks, logos and service marks (“", jsx(_components.strong, {
                children: "Marks"
              }), "”) displayed on the Site are our property or the property of other third parties. You are not permitted to use these Marks without our prior written consent or the consent of such third party which may own the Marks."]
            }), "\n"]
          }), "\n", jsxs(_components.li, {
            children: ["\n", jsx(_components.p, {
              children: jsx(_components.strong, {
                children: "Contact Information:"
              })
            }), "\n"]
          }), "\n"]
        }), "\n", jsx(_components.p, {
          children: "Ben Senescu"
        }), "\n", jsx(_components.p, {
          children: "Address:"
        }), "\n", jsx(_components.p, {
          children: "34 Harding Street"
        }), "\n", jsx(_components.p, {
          children: "Cambridge, Massachusetts 02141"
        }), "\n", jsx(_components.p, {
          children: "Telephone: 4842529019"
        }), "\n", jsxs(_components.p, {
          children: ["Email: ", jsx(_components.a, {
            href: "mailto:support@seotool.im",
            children: "support@seotool.im"
          })]
        }), "\n"]
      }), "\n"]
    })]
  });
}
function MDXContent$c(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$c, {
      ...props
    })
  }) : _createMdxContent$c(props);
}
const DEFAULT_SITE_URL = "https://seotool.im";
const DEFAULT_SOCIAL_IMAGE_PATH = "/social-card.png";
const DEFAULT_SOCIAL_IMAGE_ALT = "SeoTool.im product preview";
const SITE_URL = (process.env.SITE_URL ?? process.env.VITE_SITE_URL ?? DEFAULT_SITE_URL).replace(/\/+$/, "");
function toCanonicalPath(path) {
  if (!path || path === "/") return "/";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized.replace(/\/+$/, "");
}
function toCanonicalUrl(path) {
  return new URL(toCanonicalPath(path), `${SITE_URL}/`).href;
}
function buildPageSeo({
  title,
  path,
  description,
  titleSuffix,
  ogType = "website",
  imageAlt = DEFAULT_SOCIAL_IMAGE_ALT
}) {
  const fullTitle = titleSuffix ? `${title} - ${titleSuffix}` : title;
  const canonicalUrl = toCanonicalUrl(path);
  const socialImageUrl = toCanonicalUrl(DEFAULT_SOCIAL_IMAGE_PATH);
  return {
    meta: [
      { title: fullTitle },
      ...description ? [{ name: "description", content: description }] : [],
      { property: "og:site_name", content: "SeoTool.im" },
      { property: "og:type", content: ogType },
      { property: "og:title", content: fullTitle },
      ...description ? [{ property: "og:description", content: description }] : [],
      { property: "og:url", content: canonicalUrl },
      { property: "og:image", content: socialImageUrl },
      { property: "og:image:alt", content: imageAlt },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      ...description ? [{ name: "twitter:description", content: description }] : [],
      { name: "twitter:image", content: socialImageUrl },
      { name: "twitter:image:alt", content: imageAlt }
    ],
    links: [{ rel: "canonical", href: canonicalUrl }]
  };
}
const $$splitComponentImporter$C = () => import("./terms-and-conditions-CGnu_REG.js");
const Route$I = createFileRoute("/terms-and-conditions")({
  head: () => buildPageSeo({
    title: frontmatter$c.title,
    description: frontmatter$c.description,
    path: "/terms-and-conditions",
    titleSuffix: "SeoTool.im"
  }),
  component: lazyRouteComponent($$splitComponentImporter$C, "component")
});
let frontmatter$b = {
  "title": "Refund Policy",
  "description": "Subscription cancellation and refund terms for SeoTool.im."
};
[{
  depth: 2,
  url: "#14-day-money-back-guarantee",
  title: jsx(Fragment, {
    children: "14-Day Money-Back Guarantee"
  })
}, {
  depth: 2,
  url: "#cancellations",
  title: jsx(Fragment, {
    children: "Cancellations"
  })
}, {
  depth: 2,
  url: "#exceptions",
  title: jsx(Fragment, {
    children: "Exceptions"
  })
}];
function _createMdxContent$b(props) {
  const _components = {
    a: "a",
    h2: "h2",
    li: "li",
    p: "p",
    ul: "ul",
    ...props.components
  };
  return jsxs(Fragment, {
    children: [jsx(_components.p, {
      children: "Last updated: August 12, 2026"
    }), "\n", jsx(_components.h2, {
      id: "14-day-money-back-guarantee",
      children: "14-Day Money-Back Guarantee"
    }), "\n", jsx(_components.p, {
      children: "We want you to be fully satisfied with SeoTool.im. We offer a 14-day, no-questions-asked refund policy for all new subscription plans. If you are not happy with the product, contact us within the first 14 days of your original purchase for a full refund."
    }), "\n", jsx(_components.h2, {
      id: "cancellations",
      children: "Cancellations"
    }), "\n", jsx(_components.p, {
      children: "You can cancel your subscription at any time through your account billing settings. Once canceled, you will retain full access to your quotas and premium features until the end of your current billing cycle."
    }), "\n", jsx(_components.p, {
      children: "We do not provide prorated refunds for mid-billing cycle cancellations."
    }), "\n", jsx(_components.h2, {
      id: "exceptions",
      children: "Exceptions"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "API usage overages are strictly non-refundable as they incur direct costs to our infrastructure."
      }), "\n", jsx(_components.li, {
        children: "Renewals are non-refundable. We send notifications before yearly renewals process."
      }), "\n"]
    }), "\n", jsxs(_components.p, {
      children: ["To request a refund, please email us directly at ", jsx(_components.a, {
        href: "mailto:support@seotool.im",
        children: "support@seotool.im"
      }), " with your account details."]
    })]
  });
}
function MDXContent$b(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$b, {
      ...props
    })
  }) : _createMdxContent$b(props);
}
const $$splitComponentImporter$B = () => import("./refund-policy-DKnHgt5w.js");
const Route$H = createFileRoute("/refund-policy")({
  head: () => buildPageSeo({
    title: frontmatter$b.title,
    description: frontmatter$b.description,
    path: "/refund-policy",
    titleSuffix: "SeoTool.im"
  }),
  component: lazyRouteComponent($$splitComponentImporter$B, "component")
});
let frontmatter$a = {
  "title": "Privacy Policy",
  "description": "How SeoTool.im collects, uses, and stores personal data."
};
function _createMdxContent$a(props) {
  const _components = {
    a: "a",
    br: "br",
    em: "em",
    p: "p",
    strong: "strong",
    ...props.components
  };
  return jsxs(Fragment, {
    children: [jsx(_components.p, {
      children: jsx(_components.em, {
        children: "Last updated: April 28, 2026"
      })
    }), "\n", jsx(_components.p, {
      children: "Every App, Inc PRIVACY POLICY"
    }), "\n", jsx(_components.p, {
      children: "Every App, Inc (the “Company”) is committed to maintaining robust privacy protections for its users. Our Privacy Policy (“Privacy Policy”) is designed to help you understand how we collect, use and safeguard the information you provide to us and to assist you in making informed decisions when using our Service."
    }), "\n", jsxs(_components.p, {
      children: ["For purposes of this Agreement, “Site” refers to the Company’s website, which can be accessed at ", jsx(_components.a, {
        href: "https://seotool.im/",
        children: "https://seotool.im/"
      }), ".", jsx(_components.br, {}), "\n", "“Service” refers to the Company’s hosted SeoTool.im product accessed via the Site.", jsx(_components.br, {}), "\n", "The terms “we,” “us,” and “our” refer to the Company.", jsx(_components.br, {}), "\n", "“You” refers to you, as a user of our Site or our Service.", jsx(_components.br, {}), "\n", "By accessing our Site or our Service, you accept our Privacy Policy and Terms of Use (found here: ", jsx(_components.a, {
        href: "/terms-and-conditions",
        children: "Terms and Conditions"
      }), "), and you consent to our collection, storage, use and disclosure of your Personal Information as described in this Privacy Policy."]
    }), "\n", jsx(_components.p, {
      children: "If you operate or use a self-hosted deployment of SeoTool.im that is not run by Every App, Inc, the operator of that deployment controls the information processed there. This Privacy Policy applies to information collected by Every App, Inc through the Site and Every App-operated hosted services."
    }), "\n", jsxs(_components.p, {
      children: ["I. INFORMATION WE COLLECT", jsx(_components.br, {}), "\n", "We collect “Non-Personal Information” and “Personal Information.” ", jsx(_components.strong, {
        children: "Non-Personal Information"
      }), " includes aggregate or de-identified usage information such as referring/exit pages and URLs, page visits, browser type, operating system, device type, approximate location derived from IP address, and similar analytics information. ", jsx(_components.strong, {
        children: "Personal Information"
      }), " includes information such as your name, email address, password, account and session information, organization information, billing or customer identifiers, and other information that you submit to us through the Site or Service."]
    }), "\n", jsxs(_components.p, {
      children: ["1. ", jsx(_components.em, {
        children: "Information collected via Technology"
      }), jsx(_components.br, {}), "\n", "To receive marketing communications from us, you only need to submit your email address. To use the hosted version of the Service thereafter, you may need to submit further Personal Information, such as your name, email address, password, organization information, billing or customer identifiers, and other information you choose to provide through the Service. However, in an effort to improve the quality of the Service, we track information provided to us by your browser or by our software application when you view or use the Service, such as the website you came from (known as the “referring URL”), the pages you visit, the type of browser you use, the device from which you connected to the Service, your operating system, approximate location derived from IP address, the time and date of access, and other information related to how you use the Site or Service. In the authenticated hosted Service, PostHog may also collect session replay recordings to help us diagnose bugs and improve usability; form inputs and designated sensitive text are masked before recording."]
    }), "\n", jsxs(_components.p, {
      children: ["The public Site uses privacy-friendly analytics through Plausible Analytics, which is configured as cookieless analytics and proxied through our domain. In the hosted version of the Service, we may use cookies or similar technologies that are necessary to authenticate users, maintain secure sessions, and protect accounts.", jsx(_components.br, {}), "\n", "Where cookies are used in the hosted version of the Service, the Company may use both persistent and session cookies; persistent cookies remain on your computer after you close your session and until you delete them, while session cookies expire when you close your browser.", jsx(_components.br, {}), "\n", "2. ", jsx(_components.em, {
        children: "Information you provide us by registering for an account"
      }), jsx(_components.br, {}), "\n", "In addition to the information provided automatically by your browser when you visit the Site, to use the hosted version of the Service you may need to create a personal profile. You can create a profile by registering with the Service and entering your name, email address, and password. If you provide your email address to receive marketing communications from us without creating an account, we collect and use that email address for that purpose. By registering, subscribing, or otherwise providing your information, you are authorizing us to collect, store and use your information in accordance with this Privacy Policy."]
    }), "\n", jsxs(_components.p, {
      children: ["3. ", jsx(_components.em, {
        children: "Children’s Privacy"
      }), jsx(_components.br, {}), "\n", "The Site and the Service are not directed to anyone under the age of 13. As stated in our Terms of Use, you must be at least 18 years old to use the Site or Service. The Site does not knowingly collect or solicit information from anyone under the age of 13, or allow anyone under the age of 13 to sign up for the Service. In the event that we learn that we have gathered personal information from anyone under the age of 13 without the consent of a parent or guardian, we will delete that information as soon as possible. If you believe we have collected such information, please contact us at ", jsx(_components.a, {
        href: "mailto:support@seotool.im",
        children: "support@seotool.im"
      }), "."]
    }), "\n", jsxs(_components.p, {
      children: ["II. HOW WE USE AND SHARE INFORMATION", jsx(_components.br, {}), "\n", jsx(_components.em, {
        children: "Personal Information:"
      }), jsx(_components.br, {}), "\n", "Except as otherwise stated in this Privacy Policy, we do not sell, trade, rent or otherwise share for marketing purposes your Personal Information with third parties without your consent. We do share Personal Information with vendors who are performing services for the Company, such as providers that help us send email communications, operate analytics, measure advertising conversions, process billing, provide data requested through the Service, and host or support the infrastructure behind the Site and Service. These vendors may include Loops for email communications, Plausible for public-site analytics, PostHog for hosted analytics, session replay, and error monitoring, Reddit Ads for advertising conversion measurement, Autumn and Stripe for hosted billing and payment processing, Cloudflare for hosting, storage, and access controls, and DataForSEO for data requested through the Service. Those vendors use your Personal Information only at our direction and in accordance with our Privacy Policy.", jsx(_components.br, {}), "\n", "In general, the Personal Information you provide to us is used to help us communicate with you and operate the Service. For example, we use Personal Information to create and secure accounts, authenticate users, provide technical support, process billing, send administrative or transactional emails, contact users in response to questions, solicit feedback from users, and inform users about product updates and promotional offers.", jsx(_components.br, {}), "\n", "We may share Personal Information with outside parties if we have a good-faith belief that access, use, preservation or disclosure of the information is reasonably necessary to meet any applicable legal process or enforceable governmental request; to enforce applicable Terms of Service, including investigation of potential violations; address fraud, security or technical concerns; or to protect against harm to the rights, property, or safety of our users or the public as required or permitted by law."]
    }), "\n", jsxs(_components.p, {
      children: [jsx(_components.em, {
        children: "Non-Personal Information"
      }), jsx(_components.br, {}), "\n", "In general, we use Non-Personal Information to help us improve the Service and customize the user experience. We also aggregate Non-Personal Information in order to track trends and analyze use patterns on the Site. This Privacy Policy does not limit in any way our use or disclosure of Non-Personal Information, and we reserve the right to use and disclose such Non-Personal Information for lawful business purposes, including with service providers and analytics providers that help us operate and improve the Site and Service.", jsx(_components.br, {}), "\n", "In the event we undergo a business transaction such as a merger, acquisition by another company, or sale of all or a portion of our assets, your Personal Information may be among the assets transferred. You acknowledge and consent that such transfers may occur and are permitted by this Privacy Policy, and that any acquirer of our assets may continue to process your Personal Information as set forth in this Privacy Policy. If our information practices change at any time in the future, we will post the policy changes to the Site so that you may opt out of the new information practices. We suggest that you check the Site periodically if you are concerned about how your information is used."]
    }), "\n", jsxs(_components.p, {
      children: ["III. HOW WE PROTECT INFORMATION", jsx(_components.br, {}), "\n", "We implement security measures designed to protect your information from unauthorized access. Your account is protected by your account password and we urge you to take steps to keep your personal information safe by not disclosing your password and by logging out of your account after each use. We further protect your information from potential security breaches by implementing certain technological security measures including encryption, firewalls and secure socket layer technology. However, these measures do not guarantee that your information will not be accessed, disclosed, altered or destroyed by breach of such firewalls and secure server software. By using our Service, you acknowledge that you understand and agree to assume these risks. If you operate a self-hosted deployment of SeoTool.im, you are responsible for the security measures and privacy practices of that deployment."]
    }), "\n", jsxs(_components.p, {
      children: ["IV. YOUR RIGHTS REGARDING THE USE OF YOUR PERSONAL INFORMATION", jsx(_components.br, {}), "\n", "You have the right at any time to prevent us from contacting you for marketing purposes. When we send a promotional communication to a user, the user can opt out of further promotional communications by following the unsubscribe instructions provided in each promotional e-mail. You can also indicate that you do not wish to receive marketing communications from us by contacting us at ", jsx(_components.a, {
        href: "mailto:support@seotool.im",
        children: "support@seotool.im"
      }), ". Please note that notwithstanding the promotional preferences you indicate by either unsubscribing or contacting us, we may continue to send you administrative or transactional emails including, for example, account verification, password reset, billing, security, support, and periodic updates to our Privacy Policy."]
    }), "\n", jsxs(_components.p, {
      children: ["V. LINKS TO OTHER WEBSITES", jsx(_components.br, {}), "\n", "As part of the Service, we may provide links to or compatibility with other websites or applications. However, we are not responsible for the privacy practices employed by those websites or the information or content they contain. This Privacy Policy applies solely to information collected by us through the Site and the Service. Therefore, this Privacy Policy does not apply to your use of a third party website accessed by selecting a link on our Site or via our Service. To the extent that you access or use the Service through or on another website or application, then the privacy policy of that other website or application will apply to your access or use of that site or application. We encourage our users to read the privacy statements of other websites before proceeding to use them."]
    }), "\n", jsxs(_components.p, {
      children: ["VI. CHANGES TO OUR PRIVACY POLICY", jsx(_components.br, {}), "\n", "The Company reserves the right to change this policy and our Terms of Service at any time. We will notify you of significant changes to our Privacy Policy by sending a notice to the primary email address specified in your account or by placing a prominent notice on our site. Significant changes will go into effect 30 days following such notification. Non-material changes or clarifications will take effect immediately. You should periodically check the Site and this privacy page for updates."]
    }), "\n", jsxs(_components.p, {
      children: ["VII. CONTACT US", jsx(_components.br, {}), "\n", "If you have any questions regarding this Privacy Policy or the practices of this Site, please contact us by sending an email to ", jsx(_components.a, {
        href: "mailto:support@seotool.im",
        children: "support@seotool.im"
      }), ".", jsx(_components.br, {}), "\n", "Last Updated: This Privacy Policy was last updated on April 28, 2026."]
    })]
  });
}
function MDXContent$a(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$a, {
      ...props
    })
  }) : _createMdxContent$a(props);
}
const $$splitComponentImporter$A = () => import("./privacy-BbDTzC05.js");
const Route$G = createFileRoute("/privacy")({
  head: () => buildPageSeo({
    title: frontmatter$a.title,
    description: frontmatter$a.description,
    path: "/privacy",
    titleSuffix: "SeoTool.im"
  }),
  component: lazyRouteComponent($$splitComponentImporter$A, "component")
});
let frontmatter$9 = {
  "title": "Data Processing Addendum (DPA)",
  "description": "Data Processing terms for SeoTool.im B2B customers to comply with GDPR."
};
[{
  depth: 2,
  url: "#1-introduction",
  title: jsx(Fragment, {
    children: "1. Introduction"
  })
}, {
  depth: 2,
  url: "#2-definitions",
  title: jsx(Fragment, {
    children: "2. Definitions"
  })
}, {
  depth: 2,
  url: "#3-data-processing-obligations",
  title: jsx(Fragment, {
    children: "3. Data Processing Obligations"
  })
}, {
  depth: 2,
  url: "#4-security-measures",
  title: jsx(Fragment, {
    children: "4. Security Measures"
  })
}, {
  depth: 2,
  url: "#5-subprocessors",
  title: jsx(Fragment, {
    children: "5. Subprocessors"
  })
}];
function _createMdxContent$9(props) {
  const _components = {
    a: "a",
    h2: "h2",
    li: "li",
    p: "p",
    strong: "strong",
    ul: "ul",
    ...props.components
  };
  return jsxs(Fragment, {
    children: [jsx(_components.p, {
      children: "Last updated: August 12, 2026"
    }), "\n", jsx(_components.h2, {
      id: "1-introduction",
      children: "1. Introduction"
    }), "\n", jsx(_components.p, {
      children: 'This Data Processing Addendum (DPA) forms part of the Terms of Service between Every App, Inc. ("SeoTool.im") and you ("Customer"). It applies when SeoTool.im processes personal data on your behalf while providing our SaaS application.'
    }), "\n", jsx(_components.h2, {
      id: "2-definitions",
      children: "2. Definitions"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Processing"
        }), ": Any operation performed on personal data."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Subprocessor"
        }), ": A third party engaged by SeoTool.im to process data."]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "3-data-processing-obligations",
      children: "3. Data Processing Obligations"
    }), "\n", jsx(_components.p, {
      children: "SeoTool.im will only process personal data in accordance with your documented instructions and for the purpose of providing our services. We comply with all applicable data protection laws, including the GDPR."
    }), "\n", jsx(_components.h2, {
      id: "4-security-measures",
      children: "4. Security Measures"
    }), "\n", jsx(_components.p, {
      children: "We implement rigorous technical and organizational measures to protect personal data against unauthorized access, loss, or destruction. We limit access to our databases strictly to authorized personnel."
    }), "\n", jsx(_components.h2, {
      id: "5-subprocessors",
      children: "5. Subprocessors"
    }), "\n", jsx(_components.p, {
      children: "By using SeoTool.im, you authorize us to engage trusted subprocessors (such as our cloud infrastructure providers and billing partners). A list of current subprocessors is available upon request."
    }), "\n", jsxs(_components.p, {
      children: ["If you have GDPR compliance needs or require a signed copy of this DPA, please contact us at ", jsx(_components.a, {
        href: "mailto:support@seotool.im",
        children: "support@seotool.im"
      }), "."]
    })]
  });
}
function MDXContent$9(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$9, {
      ...props
    })
  }) : _createMdxContent$9(props);
}
const $$splitComponentImporter$z = () => import("./dpa-C8-2aGd_.js");
const Route$F = createFileRoute("/dpa")({
  head: () => buildPageSeo({
    title: frontmatter$9.title,
    description: frontmatter$9.description,
    path: "/dpa",
    titleSuffix: "SeoTool.im"
  }),
  component: lazyRouteComponent($$splitComponentImporter$z, "component")
});
let frontmatter$8 = {
  "title": "Cookie Policy",
  "description": "How SeoTool.im uses cookies and similar technologies."
};
[{
  depth: 2,
  url: "#overview",
  title: jsx(Fragment, {
    children: "Overview"
  })
}, {
  depth: 2,
  url: "#what-are-cookies",
  title: jsx(Fragment, {
    children: "What Are Cookies?"
  })
}, {
  depth: 2,
  url: "#types-of-cookies-we-use",
  title: jsx(Fragment, {
    children: "Types of Cookies We Use"
  })
}, {
  depth: 2,
  url: "#managing-your-preferences",
  title: jsx(Fragment, {
    children: "Managing Your Preferences"
  })
}];
function _createMdxContent$8(props) {
  const _components = {
    a: "a",
    h2: "h2",
    p: "p",
    strong: "strong",
    ...props.components
  };
  return jsxs(Fragment, {
    children: [jsx(_components.p, {
      children: "Last updated: August 12, 2026"
    }), "\n", jsx(_components.h2, {
      id: "overview",
      children: "Overview"
    }), "\n", jsx(_components.p, {
      children: 'This Cookie Policy explains how Every App, Inc. ("SeoTool.im", "we", "us", or "our") uses cookies and similar technologies when you visit our website (seotool.im) and use our SaaS application.'
    }), "\n", jsx(_components.h2, {
      id: "what-are-cookies",
      children: "What Are Cookies?"
    }), "\n", jsx(_components.p, {
      children: "Cookies are small data files placed on your computer or mobile device. We use them to make our application work, ensure security, and understand how people use our service."
    }), "\n", jsx(_components.h2, {
      id: "types-of-cookies-we-use",
      children: "Types of Cookies We Use"
    }), "\n", jsxs(_components.p, {
      children: [jsx(_components.strong, {
        children: "1. Essential Cookies"
      }), "\nWe use strictly necessary cookies to keep you signed in. These are required for the application to function securely."]
    }), "\n", jsxs(_components.p, {
      children: [jsx(_components.strong, {
        children: "2. Analytics Cookies"
      }), "\nFor our public website, we use privacy-friendly, cookieless analytics. We do not track you across the internet. For the authenticated dashboard, we use internal analytics to improve our product features, which you can opt out of in your account settings."]
    }), "\n", jsx(_components.h2, {
      id: "managing-your-preferences",
      children: "Managing Your Preferences"
    }), "\n", jsx(_components.p, {
      children: "Most browsers allow you to refuse or delete cookies. If you block essential cookies, you will not be able to sign in or use the SeoTool.im dashboard."
    }), "\n", jsxs(_components.p, {
      children: ["For questions about this policy, contact us at ", jsx(_components.a, {
        href: "mailto:support@seotool.im",
        children: "support@seotool.im"
      }), "."]
    })]
  });
}
function MDXContent$8(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$8, {
      ...props
    })
  }) : _createMdxContent$8(props);
}
const $$splitComponentImporter$y = () => import("./cookie-policy-DxBdNQrh.js");
const Route$E = createFileRoute("/cookie-policy")({
  head: () => buildPageSeo({
    title: frontmatter$8.title,
    description: frontmatter$8.description,
    path: "/cookie-policy",
    titleSuffix: "SeoTool.im"
  }),
  component: lazyRouteComponent($$splitComponentImporter$y, "component")
});
const $$splitComponentImporter$x = () => import("./_marketing-ra2LhIdG.js");
const GITHUB_REPO = "emerilansel-jpg/SeoTool";
const FALLBACK_STAR_COUNT = "2.1k";
function formatStarCount(count2) {
  if (count2 < 1e3) return String(count2);
  return `${(Math.round(count2 / 100) / 10).toString()}k`;
}
async function fetchGithubStarCount() {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`, {
      headers: {
        Accept: "application/vnd.github+json",
        // GitHub rejects requests without a User-Agent.
        "User-Agent": "seotool-landing"
      }
    });
    if (!res.ok) return FALLBACK_STAR_COUNT;
    const data = await res.json();
    return typeof data.stargazers_count === "number" ? formatStarCount(data.stargazers_count) : FALLBACK_STAR_COUNT;
  } catch {
    return FALLBACK_STAR_COUNT;
  }
}
let starCountPromise = null;
function loadGithubStarCount() {
  starCountPromise ??= fetchGithubStarCount();
  return starCountPromise;
}
const Route$D = createFileRoute("/_marketing")({
  // Runs at prerender/SSR time, so the count is baked into the static HTML that
  // Cloudflare serves from the edge, no per-viewer request for it.
  loader: async () => ({
    githubStarCount: await loadGithubStarCount()
  }),
  // The value is fixed per build; never refetch it on client navigation.
  staleTime: Infinity,
  component: lazyRouteComponent($$splitComponentImporter$x, "component")
});
const Route$C = createFileRoute("/guides/")({
  beforeLoad: () => {
    throw redirect({
      to: "/blogs",
      statusCode: 301
    });
  }
});
const docsDescription = "SeoTool.im setup and reference docs for MCP, AI clients, and workflow configuration.";
var createSsrRpc = (functionId, importer) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const getBlogPost = createServerFn({
  method: "GET"
}).inputValidator((slugs) => slugs).handler(createSsrRpc("906f4aef11f3a3712140f31a68ef316062148ae72c4f1edd99323a8b7b90fecf"));
const getBlogPosts = createServerFn({
  method: "GET"
}).handler(createSsrRpc("63d48016fb2fa4a84b0b5e81be99fc08cc06dcd5a56021771a38b2f44057f253"));
const getDocsPost = createServerFn({
  method: "GET"
}).inputValidator((slugs) => slugs).handler(createSsrRpc("bfce0f9f1e33f426128b41b1c67a32fcda26b7a67c33898a608f54bcb7af3575"));
const getDocsPosts = createServerFn({
  method: "GET"
}).handler(createSsrRpc("92f14aaa48434cc5919837b5703f5acfb6ec9942ead6a3c22e947eaef2c5ffd7"));
const getDocsPageTree = createServerFn({
  method: "GET"
}).handler(createSsrRpc("44fea4cd6f70934332d1d61921b03567fd3d377fa0fe20e8d69df99e6170ecbc"));
const $$splitComponentImporter$w = () => import("./index-D3IOjskM.js");
const Route$B = createFileRoute("/docs/")({
  head: () => buildPageSeo({
    title: "SeoTool.im Docs",
    description: docsDescription,
    path: "/docs"
  }),
  component: lazyRouteComponent($$splitComponentImporter$w, "component"),
  loader: async () => ({
    pages: await getDocsPosts(),
    pageTree: await getDocsPageTree()
  })
});
const $$splitComponentImporter$v = () => import("./index-DYuzx4je.js");
const blogIndexDescription = "SEO articles and guides from SeoTool.im.";
const Route$A = createFileRoute("/blogs/")({
  head: () => buildPageSeo({
    title: "SeoTool.im Blog",
    description: blogIndexDescription,
    path: "/blogs"
  }),
  component: lazyRouteComponent($$splitComponentImporter$v, "component"),
  loader: async () => await getBlogPosts()
});
const $$splitComponentImporter$u = () => import("./index-D49VHBPw.js");
const homeTitle = "SeoTool.im - Open Source SEO Platform";
const homeDescription = "SeoTool.im is the open source alternative to Ahrefs and Semrush. Keyword research, backlinks, rank tracking, and site audits, billed by usage instead of a $100-plus monthly subscription. Self-host it free, or connect it to your AI agents over MCP.";
const Route$z = createFileRoute("/_marketing/")({
  head: () => {
    const seo = buildPageSeo({
      title: homeTitle,
      description: homeDescription,
      path: "/",
      imageAlt: "SeoTool.im keyword research dashboard preview"
    });
    const softwareSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "SeoTool.im",
      url: "https://seotool.im/",
      description: homeDescription,
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "SEO Software",
      operatingSystem: "Web browser",
      screenshot: "https://seotool.im/social-card.png",
      featureList: ["Keyword research", "Rank tracking", "Site audits", "Backlink analysis", "AI brand visibility", "MCP server for AI agents"],
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "USD",
        lowPrice: "0",
        highPrice: "499",
        offerCount: "4"
      }
    };
    return {
      ...seo,
      meta: [...seo.meta ?? [], {
        property: "og:site_name",
        content: "SeoTool.im"
      }],
      links: [...seo.links ?? [], {
        rel: "preconnect",
        href: "https://fonts.googleapis.com"
      }, {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous"
      }, {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap"
      }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify(softwareSchema)
      }]
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$u, "component")
});
const PLAUSIBLE_SCRIPT_URL = "https://plausible.io/js/pa-f6y3kIQsae-ldmIxlnaPu.js";
const Route$y = createFileRoute("/js/script.js")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const upstreamResponse = await fetch(PLAUSIBLE_SCRIPT_URL);
          if (!upstreamResponse.ok) {
            return buildFallbackScriptResponse();
          }
          const headers = new Headers(upstreamResponse.headers);
          headers.set("cache-control", "public, max-age=86400, immutable");
          return new Response(upstreamResponse.body, {
            status: upstreamResponse.status,
            headers
          });
        } catch {
          return buildFallbackScriptResponse();
        }
      }
    }
  }
});
function buildFallbackScriptResponse() {
  return new Response(
    "window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)};",
    {
      status: 200,
      headers: {
        "content-type": "application/javascript; charset=utf-8",
        "cache-control": "public, max-age=300"
      }
    }
  );
}
const Route$x = createFileRoute("/guides/$")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/blogs/$",
      params: { _splat: params._splat },
      statusCode: 301
    });
  }
});
const concatArrays = (array1, array2) => {
  const combinedArray = new Array(array1.length + array2.length);
  for (let i = 0; i < array1.length; i++) {
    combinedArray[i] = array1[i];
  }
  for (let i = 0; i < array2.length; i++) {
    combinedArray[array1.length + i] = array2[i];
  }
  return combinedArray;
};
const createClassValidatorObject = (classGroupId, validator) => ({
  classGroupId,
  validator
});
const createClassPartObject = (nextPart = /* @__PURE__ */ new Map(), validators = null, classGroupId) => ({
  nextPart,
  validators,
  classGroupId
});
const CLASS_PART_SEPARATOR = "-";
const EMPTY_CONFLICTS = [];
const ARBITRARY_PROPERTY_PREFIX = "arbitrary..";
const createClassGroupUtils = (config) => {
  const classMap = createClassMap(config);
  const {
    conflictingClassGroups,
    conflictingClassGroupModifiers
  } = config;
  const getClassGroupId = (className) => {
    if (className.startsWith("[") && className.endsWith("]")) {
      return getGroupIdForArbitraryProperty(className);
    }
    const classParts = className.split(CLASS_PART_SEPARATOR);
    const startIndex = classParts[0] === "" && classParts.length > 1 ? 1 : 0;
    return getGroupRecursive(classParts, startIndex, classMap);
  };
  const getConflictingClassGroupIds = (classGroupId, hasPostfixModifier) => {
    if (hasPostfixModifier) {
      const modifierConflicts = conflictingClassGroupModifiers[classGroupId];
      const baseConflicts = conflictingClassGroups[classGroupId];
      if (modifierConflicts) {
        if (baseConflicts) {
          return concatArrays(baseConflicts, modifierConflicts);
        }
        return modifierConflicts;
      }
      return baseConflicts || EMPTY_CONFLICTS;
    }
    return conflictingClassGroups[classGroupId] || EMPTY_CONFLICTS;
  };
  return {
    getClassGroupId,
    getConflictingClassGroupIds
  };
};
const getGroupRecursive = (classParts, startIndex, classPartObject) => {
  const classPathsLength = classParts.length - startIndex;
  if (classPathsLength === 0) {
    return classPartObject.classGroupId;
  }
  const currentClassPart = classParts[startIndex];
  const nextClassPartObject = classPartObject.nextPart.get(currentClassPart);
  if (nextClassPartObject) {
    const result = getGroupRecursive(classParts, startIndex + 1, nextClassPartObject);
    if (result) return result;
  }
  const validators = classPartObject.validators;
  if (validators === null) {
    return void 0;
  }
  const classRest = startIndex === 0 ? classParts.join(CLASS_PART_SEPARATOR) : classParts.slice(startIndex).join(CLASS_PART_SEPARATOR);
  const validatorsLength = validators.length;
  for (let i = 0; i < validatorsLength; i++) {
    const validatorObj = validators[i];
    if (validatorObj.validator(classRest)) {
      return validatorObj.classGroupId;
    }
  }
  return void 0;
};
const getGroupIdForArbitraryProperty = (className) => className.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
  const content = className.slice(1, -1);
  const colonIndex = content.indexOf(":");
  const property = content.slice(0, colonIndex);
  return property ? ARBITRARY_PROPERTY_PREFIX + property : void 0;
})();
const createClassMap = (config) => {
  const {
    theme,
    classGroups
  } = config;
  return processClassGroups(classGroups, theme);
};
const processClassGroups = (classGroups, theme) => {
  const classMap = createClassPartObject();
  for (const classGroupId in classGroups) {
    const group = classGroups[classGroupId];
    processClassesRecursively(group, classMap, classGroupId, theme);
  }
  return classMap;
};
const processClassesRecursively = (classGroup, classPartObject, classGroupId, theme) => {
  const len = classGroup.length;
  for (let i = 0; i < len; i++) {
    const classDefinition = classGroup[i];
    processClassDefinition(classDefinition, classPartObject, classGroupId, theme);
  }
};
const processClassDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
  if (typeof classDefinition === "string") {
    processStringDefinition(classDefinition, classPartObject, classGroupId);
    return;
  }
  if (typeof classDefinition === "function") {
    processFunctionDefinition(classDefinition, classPartObject, classGroupId, theme);
    return;
  }
  processObjectDefinition(classDefinition, classPartObject, classGroupId, theme);
};
const processStringDefinition = (classDefinition, classPartObject, classGroupId) => {
  const classPartObjectToEdit = classDefinition === "" ? classPartObject : getPart(classPartObject, classDefinition);
  classPartObjectToEdit.classGroupId = classGroupId;
};
const processFunctionDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
  if (isThemeGetter(classDefinition)) {
    processClassesRecursively(classDefinition(theme), classPartObject, classGroupId, theme);
    return;
  }
  if (classPartObject.validators === null) {
    classPartObject.validators = [];
  }
  classPartObject.validators.push(createClassValidatorObject(classGroupId, classDefinition));
};
const processObjectDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
  const entries = Object.entries(classDefinition);
  const len = entries.length;
  for (let i = 0; i < len; i++) {
    const [key, value] = entries[i];
    processClassesRecursively(value, getPart(classPartObject, key), classGroupId, theme);
  }
};
const getPart = (classPartObject, path) => {
  let current = classPartObject;
  const parts = path.split(CLASS_PART_SEPARATOR);
  const len = parts.length;
  for (let i = 0; i < len; i++) {
    const part = parts[i];
    let next = current.nextPart.get(part);
    if (!next) {
      next = createClassPartObject();
      current.nextPart.set(part, next);
    }
    current = next;
  }
  return current;
};
const isThemeGetter = (func) => "isThemeGetter" in func && func.isThemeGetter === true;
const createLruCache = (maxCacheSize) => {
  if (maxCacheSize < 1) {
    return {
      get: () => void 0,
      set: () => {
      }
    };
  }
  let cacheSize = 0;
  let cache = /* @__PURE__ */ Object.create(null);
  let previousCache = /* @__PURE__ */ Object.create(null);
  const update = (key, value) => {
    cache[key] = value;
    cacheSize++;
    if (cacheSize > maxCacheSize) {
      cacheSize = 0;
      previousCache = cache;
      cache = /* @__PURE__ */ Object.create(null);
    }
  };
  return {
    get(key) {
      let value = cache[key];
      if (value !== void 0) {
        return value;
      }
      if ((value = previousCache[key]) !== void 0) {
        update(key, value);
        return value;
      }
    },
    set(key, value) {
      if (key in cache) {
        cache[key] = value;
      } else {
        update(key, value);
      }
    }
  };
};
const IMPORTANT_MODIFIER = "!";
const MODIFIER_SEPARATOR = ":";
const EMPTY_MODIFIERS = [];
const createResultObject = (modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition, isExternal) => ({
  modifiers,
  hasImportantModifier,
  baseClassName,
  maybePostfixModifierPosition,
  isExternal
});
const createParseClassName = (config) => {
  const {
    prefix,
    experimentalParseClassName
  } = config;
  let parseClassName = (className) => {
    const modifiers = [];
    let bracketDepth = 0;
    let parenDepth = 0;
    let modifierStart = 0;
    let postfixModifierPosition;
    const len = className.length;
    for (let index2 = 0; index2 < len; index2++) {
      const currentCharacter = className[index2];
      if (bracketDepth === 0 && parenDepth === 0) {
        if (currentCharacter === MODIFIER_SEPARATOR) {
          modifiers.push(className.slice(modifierStart, index2));
          modifierStart = index2 + 1;
          continue;
        }
        if (currentCharacter === "/") {
          postfixModifierPosition = index2;
          continue;
        }
      }
      if (currentCharacter === "[") bracketDepth++;
      else if (currentCharacter === "]") bracketDepth--;
      else if (currentCharacter === "(") parenDepth++;
      else if (currentCharacter === ")") parenDepth--;
    }
    const baseClassNameWithImportantModifier = modifiers.length === 0 ? className : className.slice(modifierStart);
    let baseClassName = baseClassNameWithImportantModifier;
    let hasImportantModifier = false;
    if (baseClassNameWithImportantModifier.endsWith(IMPORTANT_MODIFIER)) {
      baseClassName = baseClassNameWithImportantModifier.slice(0, -1);
      hasImportantModifier = true;
    } else if (
      /**
       * In Tailwind CSS v3 the important modifier was at the start of the base class name. This is still supported for legacy reasons.
       * @see https://github.com/dcastil/tailwind-merge/issues/513#issuecomment-2614029864
       */
      baseClassNameWithImportantModifier.startsWith(IMPORTANT_MODIFIER)
    ) {
      baseClassName = baseClassNameWithImportantModifier.slice(1);
      hasImportantModifier = true;
    }
    const maybePostfixModifierPosition = postfixModifierPosition && postfixModifierPosition > modifierStart ? postfixModifierPosition - modifierStart : void 0;
    return createResultObject(modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition);
  };
  if (prefix) {
    const fullPrefix = prefix + MODIFIER_SEPARATOR;
    const parseClassNameOriginal = parseClassName;
    parseClassName = (className) => className.startsWith(fullPrefix) ? parseClassNameOriginal(className.slice(fullPrefix.length)) : createResultObject(EMPTY_MODIFIERS, false, className, void 0, true);
  }
  if (experimentalParseClassName) {
    const parseClassNameOriginal = parseClassName;
    parseClassName = (className) => experimentalParseClassName({
      className,
      parseClassName: parseClassNameOriginal
    });
  }
  return parseClassName;
};
const createSortModifiers = (config) => {
  const modifierWeights = /* @__PURE__ */ new Map();
  config.orderSensitiveModifiers.forEach((mod, index2) => {
    modifierWeights.set(mod, 1e6 + index2);
  });
  return (modifiers) => {
    const result = [];
    let currentSegment = [];
    for (let i = 0; i < modifiers.length; i++) {
      const modifier = modifiers[i];
      const isArbitrary = modifier[0] === "[";
      const isOrderSensitive = modifierWeights.has(modifier);
      if (isArbitrary || isOrderSensitive) {
        if (currentSegment.length > 0) {
          currentSegment.sort();
          result.push(...currentSegment);
          currentSegment = [];
        }
        result.push(modifier);
      } else {
        currentSegment.push(modifier);
      }
    }
    if (currentSegment.length > 0) {
      currentSegment.sort();
      result.push(...currentSegment);
    }
    return result;
  };
};
const createConfigUtils = (config) => ({
  cache: createLruCache(config.cacheSize),
  parseClassName: createParseClassName(config),
  sortModifiers: createSortModifiers(config),
  ...createClassGroupUtils(config)
});
const SPLIT_CLASSES_REGEX = /\s+/;
const mergeClassList = (classList, configUtils) => {
  const {
    parseClassName,
    getClassGroupId,
    getConflictingClassGroupIds,
    sortModifiers
  } = configUtils;
  const classGroupsInConflict = [];
  const classNames = classList.trim().split(SPLIT_CLASSES_REGEX);
  let result = "";
  for (let index2 = classNames.length - 1; index2 >= 0; index2 -= 1) {
    const originalClassName = classNames[index2];
    const {
      isExternal,
      modifiers,
      hasImportantModifier,
      baseClassName,
      maybePostfixModifierPosition
    } = parseClassName(originalClassName);
    if (isExternal) {
      result = originalClassName + (result.length > 0 ? " " + result : result);
      continue;
    }
    let hasPostfixModifier = !!maybePostfixModifierPosition;
    let classGroupId = getClassGroupId(hasPostfixModifier ? baseClassName.substring(0, maybePostfixModifierPosition) : baseClassName);
    if (!classGroupId) {
      if (!hasPostfixModifier) {
        result = originalClassName + (result.length > 0 ? " " + result : result);
        continue;
      }
      classGroupId = getClassGroupId(baseClassName);
      if (!classGroupId) {
        result = originalClassName + (result.length > 0 ? " " + result : result);
        continue;
      }
      hasPostfixModifier = false;
    }
    const variantModifier = modifiers.length === 0 ? "" : modifiers.length === 1 ? modifiers[0] : sortModifiers(modifiers).join(":");
    const modifierId = hasImportantModifier ? variantModifier + IMPORTANT_MODIFIER : variantModifier;
    const classId = modifierId + classGroupId;
    if (classGroupsInConflict.indexOf(classId) > -1) {
      continue;
    }
    classGroupsInConflict.push(classId);
    const conflictGroups = getConflictingClassGroupIds(classGroupId, hasPostfixModifier);
    for (let i = 0; i < conflictGroups.length; ++i) {
      const group = conflictGroups[i];
      classGroupsInConflict.push(modifierId + group);
    }
    result = originalClassName + (result.length > 0 ? " " + result : result);
  }
  return result;
};
const twJoin = (...classLists) => {
  let index2 = 0;
  let argument;
  let resolvedValue;
  let string = "";
  while (index2 < classLists.length) {
    if (argument = classLists[index2++]) {
      if (resolvedValue = toValue(argument)) {
        string && (string += " ");
        string += resolvedValue;
      }
    }
  }
  return string;
};
const toValue = (mix) => {
  if (typeof mix === "string") {
    return mix;
  }
  let resolvedValue;
  let string = "";
  for (let k = 0; k < mix.length; k++) {
    if (mix[k]) {
      if (resolvedValue = toValue(mix[k])) {
        string && (string += " ");
        string += resolvedValue;
      }
    }
  }
  return string;
};
const createTailwindMerge = (createConfigFirst, ...createConfigRest) => {
  let configUtils;
  let cacheGet;
  let cacheSet;
  let functionToCall;
  const initTailwindMerge = (classList) => {
    const config = createConfigRest.reduce((previousConfig, createConfigCurrent) => createConfigCurrent(previousConfig), createConfigFirst());
    configUtils = createConfigUtils(config);
    cacheGet = configUtils.cache.get;
    cacheSet = configUtils.cache.set;
    functionToCall = tailwindMerge;
    return tailwindMerge(classList);
  };
  const tailwindMerge = (classList) => {
    const cachedResult = cacheGet(classList);
    if (cachedResult) {
      return cachedResult;
    }
    const result = mergeClassList(classList, configUtils);
    cacheSet(classList, result);
    return result;
  };
  functionToCall = initTailwindMerge;
  return (...args) => functionToCall(twJoin(...args));
};
const fallbackThemeArr = [];
const fromTheme = (key) => {
  const themeGetter = (theme) => theme[key] || fallbackThemeArr;
  themeGetter.isThemeGetter = true;
  return themeGetter;
};
const arbitraryValueRegex = /^\[(?:(\w[\w-]*):)?(.+)\]$/i;
const arbitraryVariableRegex = /^\((?:(\w[\w-]*):)?(.+)\)$/i;
const fractionRegex = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/;
const tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
const lengthUnitRegex = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/;
const colorFunctionRegex = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/;
const shadowRegex = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;
const imageRegex = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/;
const isFraction = (value) => fractionRegex.test(value);
const isNumber = (value) => !!value && !Number.isNaN(Number(value));
const isInteger = (value) => !!value && Number.isInteger(Number(value));
const isPercent = (value) => value.endsWith("%") && isNumber(value.slice(0, -1));
const isTshirtSize = (value) => tshirtUnitRegex.test(value);
const isAny = () => true;
const isLengthOnly = (value) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  lengthUnitRegex.test(value) && !colorFunctionRegex.test(value)
);
const isNever = () => false;
const isShadow = (value) => shadowRegex.test(value);
const isImage = (value) => imageRegex.test(value);
const isAnyNonArbitrary = (value) => !isArbitraryValue(value) && !isArbitraryVariable(value);
const isArbitrarySize = (value) => getIsArbitraryValue(value, isLabelSize, isNever);
const isArbitraryValue = (value) => arbitraryValueRegex.test(value);
const isArbitraryLength = (value) => getIsArbitraryValue(value, isLabelLength, isLengthOnly);
const isArbitraryNumber = (value) => getIsArbitraryValue(value, isLabelNumber, isNumber);
const isArbitraryWeight = (value) => getIsArbitraryValue(value, isLabelWeight, isAny);
const isArbitraryFamilyName = (value) => getIsArbitraryValue(value, isLabelFamilyName, isNever);
const isArbitraryPosition = (value) => getIsArbitraryValue(value, isLabelPosition, isNever);
const isArbitraryImage = (value) => getIsArbitraryValue(value, isLabelImage, isImage);
const isArbitraryShadow = (value) => getIsArbitraryValue(value, isLabelShadow, isShadow);
const isArbitraryVariable = (value) => arbitraryVariableRegex.test(value);
const isArbitraryVariableLength = (value) => getIsArbitraryVariable(value, isLabelLength);
const isArbitraryVariableFamilyName = (value) => getIsArbitraryVariable(value, isLabelFamilyName);
const isArbitraryVariablePosition = (value) => getIsArbitraryVariable(value, isLabelPosition);
const isArbitraryVariableSize = (value) => getIsArbitraryVariable(value, isLabelSize);
const isArbitraryVariableImage = (value) => getIsArbitraryVariable(value, isLabelImage);
const isArbitraryVariableShadow = (value) => getIsArbitraryVariable(value, isLabelShadow, true);
const isArbitraryVariableWeight = (value) => getIsArbitraryVariable(value, isLabelWeight, true);
const getIsArbitraryValue = (value, testLabel, testValue) => {
  const result = arbitraryValueRegex.exec(value);
  if (result) {
    if (result[1]) {
      return testLabel(result[1]);
    }
    return testValue(result[2]);
  }
  return false;
};
const getIsArbitraryVariable = (value, testLabel, shouldMatchNoLabel = false) => {
  const result = arbitraryVariableRegex.exec(value);
  if (result) {
    if (result[1]) {
      return testLabel(result[1]);
    }
    return shouldMatchNoLabel;
  }
  return false;
};
const isLabelPosition = (label) => label === "position" || label === "percentage";
const isLabelImage = (label) => label === "image" || label === "url";
const isLabelSize = (label) => label === "length" || label === "size" || label === "bg-size";
const isLabelLength = (label) => label === "length";
const isLabelNumber = (label) => label === "number";
const isLabelFamilyName = (label) => label === "family-name";
const isLabelWeight = (label) => label === "number" || label === "weight";
const isLabelShadow = (label) => label === "shadow";
const getDefaultConfig = () => {
  const themeColor = fromTheme("color");
  const themeFont = fromTheme("font");
  const themeText = fromTheme("text");
  const themeFontWeight = fromTheme("font-weight");
  const themeTracking = fromTheme("tracking");
  const themeLeading = fromTheme("leading");
  const themeBreakpoint = fromTheme("breakpoint");
  const themeContainer = fromTheme("container");
  const themeSpacing = fromTheme("spacing");
  const themeRadius = fromTheme("radius");
  const themeShadow = fromTheme("shadow");
  const themeInsetShadow = fromTheme("inset-shadow");
  const themeTextShadow = fromTheme("text-shadow");
  const themeDropShadow = fromTheme("drop-shadow");
  const themeBlur = fromTheme("blur");
  const themePerspective = fromTheme("perspective");
  const themeAspect = fromTheme("aspect");
  const themeEase = fromTheme("ease");
  const themeAnimate = fromTheme("animate");
  const scaleBreak = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"];
  const scalePosition = () => [
    "center",
    "top",
    "bottom",
    "left",
    "right",
    "top-left",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "left-top",
    "top-right",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "right-top",
    "bottom-right",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "right-bottom",
    "bottom-left",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "left-bottom"
  ];
  const scalePositionWithArbitrary = () => [...scalePosition(), isArbitraryVariable, isArbitraryValue];
  const scaleOverflow = () => ["auto", "hidden", "clip", "visible", "scroll"];
  const scaleOverscroll = () => ["auto", "contain", "none"];
  const scaleUnambiguousSpacing = () => [isArbitraryVariable, isArbitraryValue, themeSpacing];
  const scaleInset = () => [isFraction, "full", "auto", ...scaleUnambiguousSpacing()];
  const scaleGridTemplateColsRows = () => [isInteger, "none", "subgrid", isArbitraryVariable, isArbitraryValue];
  const scaleGridColRowStartAndEnd = () => ["auto", {
    span: ["full", isInteger, isArbitraryVariable, isArbitraryValue]
  }, isInteger, isArbitraryVariable, isArbitraryValue];
  const scaleGridColRowStartOrEnd = () => [isInteger, "auto", isArbitraryVariable, isArbitraryValue];
  const scaleGridAutoColsRows = () => ["auto", "min", "max", "fr", isArbitraryVariable, isArbitraryValue];
  const scaleAlignPrimaryAxis = () => ["start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"];
  const scaleAlignSecondaryAxis = () => ["start", "end", "center", "stretch", "center-safe", "end-safe"];
  const scaleMargin = () => ["auto", ...scaleUnambiguousSpacing()];
  const scaleSizing = () => [isFraction, "auto", "full", "dvw", "dvh", "lvw", "lvh", "svw", "svh", "min", "max", "fit", ...scaleUnambiguousSpacing()];
  const scaleSizingInline = () => [isFraction, "screen", "full", "dvw", "lvw", "svw", "min", "max", "fit", ...scaleUnambiguousSpacing()];
  const scaleSizingBlock = () => [isFraction, "screen", "full", "lh", "dvh", "lvh", "svh", "min", "max", "fit", ...scaleUnambiguousSpacing()];
  const scaleColor = () => [themeColor, isArbitraryVariable, isArbitraryValue];
  const scaleBgPosition = () => [...scalePosition(), isArbitraryVariablePosition, isArbitraryPosition, {
    position: [isArbitraryVariable, isArbitraryValue]
  }];
  const scaleBgRepeat = () => ["no-repeat", {
    repeat: ["", "x", "y", "space", "round"]
  }];
  const scaleBgSize = () => ["auto", "cover", "contain", isArbitraryVariableSize, isArbitrarySize, {
    size: [isArbitraryVariable, isArbitraryValue]
  }];
  const scaleGradientStopPosition = () => [isPercent, isArbitraryVariableLength, isArbitraryLength];
  const scaleRadius = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    "full",
    themeRadius,
    isArbitraryVariable,
    isArbitraryValue
  ];
  const scaleBorderWidth = () => ["", isNumber, isArbitraryVariableLength, isArbitraryLength];
  const scaleLineStyle = () => ["solid", "dashed", "dotted", "double"];
  const scaleBlendMode = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"];
  const scaleMaskImagePosition = () => [isNumber, isPercent, isArbitraryVariablePosition, isArbitraryPosition];
  const scaleBlur = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    themeBlur,
    isArbitraryVariable,
    isArbitraryValue
  ];
  const scaleRotate = () => ["none", isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleScale = () => ["none", isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleSkew = () => [isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleTranslate = () => [isFraction, "full", ...scaleUnambiguousSpacing()];
  return {
    cacheSize: 500,
    theme: {
      animate: ["spin", "ping", "pulse", "bounce"],
      aspect: ["video"],
      blur: [isTshirtSize],
      breakpoint: [isTshirtSize],
      color: [isAny],
      container: [isTshirtSize],
      "drop-shadow": [isTshirtSize],
      ease: ["in", "out", "in-out"],
      font: [isAnyNonArbitrary],
      "font-weight": ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"],
      "inset-shadow": [isTshirtSize],
      leading: ["none", "tight", "snug", "normal", "relaxed", "loose"],
      perspective: ["dramatic", "near", "normal", "midrange", "distant", "none"],
      radius: [isTshirtSize],
      shadow: [isTshirtSize],
      spacing: ["px", isNumber],
      text: [isTshirtSize],
      "text-shadow": [isTshirtSize],
      tracking: ["tighter", "tight", "normal", "wide", "wider", "widest"]
    },
    classGroups: {
      // --------------
      // --- Layout ---
      // --------------
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ["auto", "square", isFraction, isArbitraryValue, isArbitraryVariable, themeAspect]
      }],
      /**
       * Container
       * @see https://tailwindcss.com/docs/container
       * @deprecated since Tailwind CSS v4.0.0
       */
      container: ["container"],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [isNumber, isArbitraryValue, isArbitraryVariable, themeContainer]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      "break-after": [{
        "break-after": scaleBreak()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      "break-before": [{
        "break-before": scaleBreak()
      }],
      /**
       * Break Inside
       * @see https://tailwindcss.com/docs/break-inside
       */
      "break-inside": [{
        "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"]
      }],
      /**
       * Box Decoration Break
       * @see https://tailwindcss.com/docs/box-decoration-break
       */
      "box-decoration": [{
        "box-decoration": ["slice", "clone"]
      }],
      /**
       * Box Sizing
       * @see https://tailwindcss.com/docs/box-sizing
       */
      box: [{
        box: ["border", "content"]
      }],
      /**
       * Display
       * @see https://tailwindcss.com/docs/display
       */
      display: ["block", "inline-block", "inline", "flex", "inline-flex", "table", "inline-table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row-group", "table-row", "flow-root", "grid", "inline-grid", "contents", "list-item", "hidden"],
      /**
       * Screen Reader Only
       * @see https://tailwindcss.com/docs/display#screen-reader-only
       */
      sr: ["sr-only", "not-sr-only"],
      /**
       * Floats
       * @see https://tailwindcss.com/docs/float
       */
      float: [{
        float: ["right", "left", "none", "start", "end"]
      }],
      /**
       * Clear
       * @see https://tailwindcss.com/docs/clear
       */
      clear: [{
        clear: ["left", "right", "both", "none", "start", "end"]
      }],
      /**
       * Isolation
       * @see https://tailwindcss.com/docs/isolation
       */
      isolation: ["isolate", "isolation-auto"],
      /**
       * Object Fit
       * @see https://tailwindcss.com/docs/object-fit
       */
      "object-fit": [{
        object: ["contain", "cover", "fill", "none", "scale-down"]
      }],
      /**
       * Object Position
       * @see https://tailwindcss.com/docs/object-position
       */
      "object-position": [{
        object: scalePositionWithArbitrary()
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: scaleOverflow()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-x": [{
        "overflow-x": scaleOverflow()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-y": [{
        "overflow-y": scaleOverflow()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: scaleOverscroll()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": scaleOverscroll()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": scaleOverscroll()
      }],
      /**
       * Position
       * @see https://tailwindcss.com/docs/position
       */
      position: ["static", "fixed", "absolute", "relative", "sticky"],
      /**
       * Inset
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      inset: [{
        inset: scaleInset()
      }],
      /**
       * Inset Inline
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-x": [{
        "inset-x": scaleInset()
      }],
      /**
       * Inset Block
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-y": [{
        "inset-y": scaleInset()
      }],
      /**
       * Inset Inline Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-s` in next major release
       */
      start: [{
        "inset-s": scaleInset(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-s-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        start: scaleInset()
      }],
      /**
       * Inset Inline End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       * @todo class group will be renamed to `inset-e` in next major release
       */
      end: [{
        "inset-e": scaleInset(),
        /**
         * @deprecated since Tailwind CSS v4.2.0 in favor of `inset-e-*` utilities.
         * @see https://github.com/tailwindlabs/tailwindcss/pull/19613
         */
        end: scaleInset()
      }],
      /**
       * Inset Block Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-bs": [{
        "inset-bs": scaleInset()
      }],
      /**
       * Inset Block End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-be": [{
        "inset-be": scaleInset()
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: scaleInset()
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: scaleInset()
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: scaleInset()
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: scaleInset()
      }],
      /**
       * Visibility
       * @see https://tailwindcss.com/docs/visibility
       */
      visibility: ["visible", "invisible", "collapse"],
      /**
       * Z-Index
       * @see https://tailwindcss.com/docs/z-index
       */
      z: [{
        z: [isInteger, "auto", isArbitraryVariable, isArbitraryValue]
      }],
      // ------------------------
      // --- Flexbox and Grid ---
      // ------------------------
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: [isFraction, "full", "auto", themeContainer, ...scaleUnambiguousSpacing()]
      }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      "flex-direction": [{
        flex: ["row", "row-reverse", "col", "col-reverse"]
      }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      "flex-wrap": [{
        flex: ["nowrap", "wrap", "wrap-reverse"]
      }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      flex: [{
        flex: [isNumber, isFraction, "auto", "initial", "none", isArbitraryValue]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: [isInteger, "first", "last", "none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": scaleGridTemplateColsRows()
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: scaleGridColRowStartAndEnd()
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      "grid-rows": [{
        "grid-rows": scaleGridTemplateColsRows()
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: scaleGridColRowStartAndEnd()
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Auto Flow
       * @see https://tailwindcss.com/docs/grid-auto-flow
       */
      "grid-flow": [{
        "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"]
      }],
      /**
       * Grid Auto Columns
       * @see https://tailwindcss.com/docs/grid-auto-columns
       */
      "auto-cols": [{
        "auto-cols": scaleGridAutoColsRows()
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": scaleGridAutoColsRows()
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: scaleUnambiguousSpacing()
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-x": [{
        "gap-x": scaleUnambiguousSpacing()
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-y": [{
        "gap-y": scaleUnambiguousSpacing()
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      "justify-content": [{
        justify: [...scaleAlignPrimaryAxis(), "normal"]
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      "justify-items": [{
        "justify-items": [...scaleAlignSecondaryAxis(), "normal"]
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      "justify-self": [{
        "justify-self": ["auto", ...scaleAlignSecondaryAxis()]
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      "align-content": [{
        content: ["normal", ...scaleAlignPrimaryAxis()]
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      "align-items": [{
        items: [...scaleAlignSecondaryAxis(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      "align-self": [{
        self: ["auto", ...scaleAlignSecondaryAxis(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      "place-content": [{
        "place-content": scaleAlignPrimaryAxis()
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      "place-items": [{
        "place-items": [...scaleAlignSecondaryAxis(), "baseline"]
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      "place-self": [{
        "place-self": ["auto", ...scaleAlignSecondaryAxis()]
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Inline
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Block
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Inline Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Inline End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Block Start
       * @see https://tailwindcss.com/docs/padding
       */
      pbs: [{
        pbs: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Block End
       * @see https://tailwindcss.com/docs/padding
       */
      pbe: [{
        pbe: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: scaleUnambiguousSpacing()
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: scaleMargin()
      }],
      /**
       * Margin Inline
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: scaleMargin()
      }],
      /**
       * Margin Block
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: scaleMargin()
      }],
      /**
       * Margin Inline Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: scaleMargin()
      }],
      /**
       * Margin Inline End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: scaleMargin()
      }],
      /**
       * Margin Block Start
       * @see https://tailwindcss.com/docs/margin
       */
      mbs: [{
        mbs: scaleMargin()
      }],
      /**
       * Margin Block End
       * @see https://tailwindcss.com/docs/margin
       */
      mbe: [{
        mbe: scaleMargin()
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: scaleMargin()
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: scaleMargin()
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: scaleMargin()
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: scaleMargin()
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x": [{
        "space-x": scaleUnambiguousSpacing()
      }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x-reverse": ["space-x-reverse"],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-y": [{
        "space-y": scaleUnambiguousSpacing()
      }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-y-reverse": ["space-y-reverse"],
      // --------------
      // --- Sizing ---
      // --------------
      /**
       * Size
       * @see https://tailwindcss.com/docs/width#setting-both-width-and-height
       */
      size: [{
        size: scaleSizing()
      }],
      /**
       * Inline Size
       * @see https://tailwindcss.com/docs/width
       */
      "inline-size": [{
        inline: ["auto", ...scaleSizingInline()]
      }],
      /**
       * Min-Inline Size
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-inline-size": [{
        "min-inline": ["auto", ...scaleSizingInline()]
      }],
      /**
       * Max-Inline Size
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-inline-size": [{
        "max-inline": ["none", ...scaleSizingInline()]
      }],
      /**
       * Block Size
       * @see https://tailwindcss.com/docs/height
       */
      "block-size": [{
        block: ["auto", ...scaleSizingBlock()]
      }],
      /**
       * Min-Block Size
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-block-size": [{
        "min-block": ["auto", ...scaleSizingBlock()]
      }],
      /**
       * Max-Block Size
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-block-size": [{
        "max-block": ["none", ...scaleSizingBlock()]
      }],
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: [themeContainer, "screen", ...scaleSizing()]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [
          themeContainer,
          "screen",
          /** Deprecated. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "none",
          ...scaleSizing()
        ]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-w": [{
        "max-w": [
          themeContainer,
          "screen",
          "none",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "prose",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          {
            screen: [themeBreakpoint]
          },
          ...scaleSizing()
        ]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: ["screen", "lh", ...scaleSizing()]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": ["screen", "lh", "none", ...scaleSizing()]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": ["screen", "lh", ...scaleSizing()]
      }],
      // ------------------
      // --- Typography ---
      // ------------------
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", themeText, isArbitraryVariableLength, isArbitraryLength]
      }],
      /**
       * Font Smoothing
       * @see https://tailwindcss.com/docs/font-smoothing
       */
      "font-smoothing": ["antialiased", "subpixel-antialiased"],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      "font-style": ["italic", "not-italic"],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      "font-weight": [{
        font: [themeFontWeight, isArbitraryVariableWeight, isArbitraryWeight]
      }],
      /**
       * Font Stretch
       * @see https://tailwindcss.com/docs/font-stretch
       */
      "font-stretch": [{
        "font-stretch": ["ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded", isPercent, isArbitraryValue]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [isArbitraryVariableFamilyName, isArbitraryFamilyName, themeFont]
      }],
      /**
       * Font Feature Settings
       * @see https://tailwindcss.com/docs/font-feature-settings
       */
      "font-features": [{
        "font-features": [isArbitraryValue]
      }],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-normal": ["normal-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-ordinal": ["ordinal"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-slashed-zero": ["slashed-zero"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-figure": ["lining-nums", "oldstyle-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-spacing": ["proportional-nums", "tabular-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      tracking: [{
        tracking: [themeTracking, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": [isNumber, "none", isArbitraryVariable, isArbitraryNumber]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: [
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          themeLeading,
          ...scaleUnambiguousSpacing()
        ]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * List Style Position
       * @see https://tailwindcss.com/docs/list-style-position
       */
      "list-style-position": [{
        list: ["inside", "outside"]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      "list-style-type": [{
        list: ["disc", "decimal", "none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Text Alignment
       * @see https://tailwindcss.com/docs/text-align
       */
      "text-alignment": [{
        text: ["left", "center", "right", "justify", "start", "end"]
      }],
      /**
       * Placeholder Color
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://v3.tailwindcss.com/docs/placeholder-color
       */
      "placeholder-color": [{
        placeholder: scaleColor()
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      "text-color": [{
        text: scaleColor()
      }],
      /**
       * Text Decoration
       * @see https://tailwindcss.com/docs/text-decoration
       */
      "text-decoration": ["underline", "overline", "line-through", "no-underline"],
      /**
       * Text Decoration Style
       * @see https://tailwindcss.com/docs/text-decoration-style
       */
      "text-decoration-style": [{
        decoration: [...scaleLineStyle(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: [isNumber, "from-font", "auto", isArbitraryVariable, isArbitraryLength]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      "text-decoration-color": [{
        decoration: scaleColor()
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      "underline-offset": [{
        "underline-offset": [isNumber, "auto", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Text Transform
       * @see https://tailwindcss.com/docs/text-transform
       */
      "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"],
      /**
       * Text Overflow
       * @see https://tailwindcss.com/docs/text-overflow
       */
      "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
      /**
       * Text Wrap
       * @see https://tailwindcss.com/docs/text-wrap
       */
      "text-wrap": [{
        text: ["wrap", "nowrap", "balance", "pretty"]
      }],
      /**
       * Text Indent
       * @see https://tailwindcss.com/docs/text-indent
       */
      indent: [{
        indent: scaleUnambiguousSpacing()
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Whitespace
       * @see https://tailwindcss.com/docs/whitespace
       */
      whitespace: [{
        whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"]
      }],
      /**
       * Word Break
       * @see https://tailwindcss.com/docs/word-break
       */
      break: [{
        break: ["normal", "words", "all", "keep"]
      }],
      /**
       * Overflow Wrap
       * @see https://tailwindcss.com/docs/overflow-wrap
       */
      wrap: [{
        wrap: ["break-word", "anywhere", "normal"]
      }],
      /**
       * Hyphens
       * @see https://tailwindcss.com/docs/hyphens
       */
      hyphens: [{
        hyphens: ["none", "manual", "auto"]
      }],
      /**
       * Content
       * @see https://tailwindcss.com/docs/content
       */
      content: [{
        content: ["none", isArbitraryVariable, isArbitraryValue]
      }],
      // -------------------
      // --- Backgrounds ---
      // -------------------
      /**
       * Background Attachment
       * @see https://tailwindcss.com/docs/background-attachment
       */
      "bg-attachment": [{
        bg: ["fixed", "local", "scroll"]
      }],
      /**
       * Background Clip
       * @see https://tailwindcss.com/docs/background-clip
       */
      "bg-clip": [{
        "bg-clip": ["border", "padding", "content", "text"]
      }],
      /**
       * Background Origin
       * @see https://tailwindcss.com/docs/background-origin
       */
      "bg-origin": [{
        "bg-origin": ["border", "padding", "content"]
      }],
      /**
       * Background Position
       * @see https://tailwindcss.com/docs/background-position
       */
      "bg-position": [{
        bg: scaleBgPosition()
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      "bg-repeat": [{
        bg: scaleBgRepeat()
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      "bg-size": [{
        bg: scaleBgSize()
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          linear: [{
            to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
          }, isInteger, isArbitraryVariable, isArbitraryValue],
          radial: ["", isArbitraryVariable, isArbitraryValue],
          conic: [isInteger, isArbitraryVariable, isArbitraryValue]
        }, isArbitraryVariableImage, isArbitraryImage]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      "bg-color": [{
        bg: scaleColor()
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from-pos": [{
        from: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from": [{
        from: scaleColor()
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via": [{
        via: scaleColor()
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to": [{
        to: scaleColor()
      }],
      // ---------------
      // --- Borders ---
      // ---------------
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: scaleRadius()
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-s": [{
        "rounded-s": scaleRadius()
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-e": [{
        "rounded-e": scaleRadius()
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-t": [{
        "rounded-t": scaleRadius()
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-r": [{
        "rounded-r": scaleRadius()
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-b": [{
        "rounded-b": scaleRadius()
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-l": [{
        "rounded-l": scaleRadius()
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ss": [{
        "rounded-ss": scaleRadius()
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-se": [{
        "rounded-se": scaleRadius()
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ee": [{
        "rounded-ee": scaleRadius()
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-es": [{
        "rounded-es": scaleRadius()
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tl": [{
        "rounded-tl": scaleRadius()
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tr": [{
        "rounded-tr": scaleRadius()
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-br": [{
        "rounded-br": scaleRadius()
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-bl": [{
        "rounded-bl": scaleRadius()
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w": [{
        border: scaleBorderWidth()
      }],
      /**
       * Border Width Inline
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-x": [{
        "border-x": scaleBorderWidth()
      }],
      /**
       * Border Width Block
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-y": [{
        "border-y": scaleBorderWidth()
      }],
      /**
       * Border Width Inline Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-s": [{
        "border-s": scaleBorderWidth()
      }],
      /**
       * Border Width Inline End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-e": [{
        "border-e": scaleBorderWidth()
      }],
      /**
       * Border Width Block Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-bs": [{
        "border-bs": scaleBorderWidth()
      }],
      /**
       * Border Width Block End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-be": [{
        "border-be": scaleBorderWidth()
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-t": [{
        "border-t": scaleBorderWidth()
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-r": [{
        "border-r": scaleBorderWidth()
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-b": [{
        "border-b": scaleBorderWidth()
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-l": [{
        "border-l": scaleBorderWidth()
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x": [{
        "divide-x": scaleBorderWidth()
      }],
      /**
       * Divide Width X Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x-reverse": ["divide-x-reverse"],
      /**
       * Divide Width Y
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-y": [{
        "divide-y": scaleBorderWidth()
      }],
      /**
       * Divide Width Y Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-y-reverse": ["divide-y-reverse"],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      "border-style": [{
        border: [...scaleLineStyle(), "hidden", "none"]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
       */
      "divide-style": [{
        divide: [...scaleLineStyle(), "hidden", "none"]
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color": [{
        border: scaleColor()
      }],
      /**
       * Border Color Inline
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-x": [{
        "border-x": scaleColor()
      }],
      /**
       * Border Color Block
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-y": [{
        "border-y": scaleColor()
      }],
      /**
       * Border Color Inline Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-s": [{
        "border-s": scaleColor()
      }],
      /**
       * Border Color Inline End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-e": [{
        "border-e": scaleColor()
      }],
      /**
       * Border Color Block Start
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-bs": [{
        "border-bs": scaleColor()
      }],
      /**
       * Border Color Block End
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-be": [{
        "border-be": scaleColor()
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-t": [{
        "border-t": scaleColor()
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-r": [{
        "border-r": scaleColor()
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-b": [{
        "border-b": scaleColor()
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-l": [{
        "border-l": scaleColor()
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      "divide-color": [{
        divide: scaleColor()
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      "outline-style": [{
        outline: [...scaleLineStyle(), "none", "hidden"]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: ["", isNumber, isArbitraryVariableLength, isArbitraryLength]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      "outline-color": [{
        outline: scaleColor()
      }],
      // ---------------
      // --- Effects ---
      // ---------------
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      shadow: [{
        shadow: [
          // Deprecated since Tailwind CSS v4.0.0
          "",
          "none",
          themeShadow,
          isArbitraryVariableShadow,
          isArbitraryShadow
        ]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-shadow-color
       */
      "shadow-color": [{
        shadow: scaleColor()
      }],
      /**
       * Inset Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-shadow
       */
      "inset-shadow": [{
        "inset-shadow": ["none", themeInsetShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Inset Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-shadow-color
       */
      "inset-shadow-color": [{
        "inset-shadow": scaleColor()
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-a-ring
       */
      "ring-w": [{
        ring: scaleBorderWidth()
      }],
      /**
       * Ring Width Inset
       * @see https://v3.tailwindcss.com/docs/ring-width#inset-rings
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-w-inset": ["ring-inset"],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-ring-color
       */
      "ring-color": [{
        ring: scaleColor()
      }],
      /**
       * Ring Offset Width
       * @see https://v3.tailwindcss.com/docs/ring-offset-width
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-w": [{
        "ring-offset": [isNumber, isArbitraryLength]
      }],
      /**
       * Ring Offset Color
       * @see https://v3.tailwindcss.com/docs/ring-offset-color
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-color": [{
        "ring-offset": scaleColor()
      }],
      /**
       * Inset Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-ring
       */
      "inset-ring-w": [{
        "inset-ring": scaleBorderWidth()
      }],
      /**
       * Inset Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-ring-color
       */
      "inset-ring-color": [{
        "inset-ring": scaleColor()
      }],
      /**
       * Text Shadow
       * @see https://tailwindcss.com/docs/text-shadow
       */
      "text-shadow": [{
        "text-shadow": ["none", themeTextShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Text Shadow Color
       * @see https://tailwindcss.com/docs/text-shadow#setting-the-shadow-color
       */
      "text-shadow-color": [{
        "text-shadow": scaleColor()
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      "mix-blend": [{
        "mix-blend": [...scaleBlendMode(), "plus-darker", "plus-lighter"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": scaleBlendMode()
      }],
      /**
       * Mask Clip
       * @see https://tailwindcss.com/docs/mask-clip
       */
      "mask-clip": [{
        "mask-clip": ["border", "padding", "content", "fill", "stroke", "view"]
      }, "mask-no-clip"],
      /**
       * Mask Composite
       * @see https://tailwindcss.com/docs/mask-composite
       */
      "mask-composite": [{
        mask: ["add", "subtract", "intersect", "exclude"]
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      "mask-image-linear-pos": [{
        "mask-linear": [isNumber]
      }],
      "mask-image-linear-from-pos": [{
        "mask-linear-from": scaleMaskImagePosition()
      }],
      "mask-image-linear-to-pos": [{
        "mask-linear-to": scaleMaskImagePosition()
      }],
      "mask-image-linear-from-color": [{
        "mask-linear-from": scaleColor()
      }],
      "mask-image-linear-to-color": [{
        "mask-linear-to": scaleColor()
      }],
      "mask-image-t-from-pos": [{
        "mask-t-from": scaleMaskImagePosition()
      }],
      "mask-image-t-to-pos": [{
        "mask-t-to": scaleMaskImagePosition()
      }],
      "mask-image-t-from-color": [{
        "mask-t-from": scaleColor()
      }],
      "mask-image-t-to-color": [{
        "mask-t-to": scaleColor()
      }],
      "mask-image-r-from-pos": [{
        "mask-r-from": scaleMaskImagePosition()
      }],
      "mask-image-r-to-pos": [{
        "mask-r-to": scaleMaskImagePosition()
      }],
      "mask-image-r-from-color": [{
        "mask-r-from": scaleColor()
      }],
      "mask-image-r-to-color": [{
        "mask-r-to": scaleColor()
      }],
      "mask-image-b-from-pos": [{
        "mask-b-from": scaleMaskImagePosition()
      }],
      "mask-image-b-to-pos": [{
        "mask-b-to": scaleMaskImagePosition()
      }],
      "mask-image-b-from-color": [{
        "mask-b-from": scaleColor()
      }],
      "mask-image-b-to-color": [{
        "mask-b-to": scaleColor()
      }],
      "mask-image-l-from-pos": [{
        "mask-l-from": scaleMaskImagePosition()
      }],
      "mask-image-l-to-pos": [{
        "mask-l-to": scaleMaskImagePosition()
      }],
      "mask-image-l-from-color": [{
        "mask-l-from": scaleColor()
      }],
      "mask-image-l-to-color": [{
        "mask-l-to": scaleColor()
      }],
      "mask-image-x-from-pos": [{
        "mask-x-from": scaleMaskImagePosition()
      }],
      "mask-image-x-to-pos": [{
        "mask-x-to": scaleMaskImagePosition()
      }],
      "mask-image-x-from-color": [{
        "mask-x-from": scaleColor()
      }],
      "mask-image-x-to-color": [{
        "mask-x-to": scaleColor()
      }],
      "mask-image-y-from-pos": [{
        "mask-y-from": scaleMaskImagePosition()
      }],
      "mask-image-y-to-pos": [{
        "mask-y-to": scaleMaskImagePosition()
      }],
      "mask-image-y-from-color": [{
        "mask-y-from": scaleColor()
      }],
      "mask-image-y-to-color": [{
        "mask-y-to": scaleColor()
      }],
      "mask-image-radial": [{
        "mask-radial": [isArbitraryVariable, isArbitraryValue]
      }],
      "mask-image-radial-from-pos": [{
        "mask-radial-from": scaleMaskImagePosition()
      }],
      "mask-image-radial-to-pos": [{
        "mask-radial-to": scaleMaskImagePosition()
      }],
      "mask-image-radial-from-color": [{
        "mask-radial-from": scaleColor()
      }],
      "mask-image-radial-to-color": [{
        "mask-radial-to": scaleColor()
      }],
      "mask-image-radial-shape": [{
        "mask-radial": ["circle", "ellipse"]
      }],
      "mask-image-radial-size": [{
        "mask-radial": [{
          closest: ["side", "corner"],
          farthest: ["side", "corner"]
        }]
      }],
      "mask-image-radial-pos": [{
        "mask-radial-at": scalePosition()
      }],
      "mask-image-conic-pos": [{
        "mask-conic": [isNumber]
      }],
      "mask-image-conic-from-pos": [{
        "mask-conic-from": scaleMaskImagePosition()
      }],
      "mask-image-conic-to-pos": [{
        "mask-conic-to": scaleMaskImagePosition()
      }],
      "mask-image-conic-from-color": [{
        "mask-conic-from": scaleColor()
      }],
      "mask-image-conic-to-color": [{
        "mask-conic-to": scaleColor()
      }],
      /**
       * Mask Mode
       * @see https://tailwindcss.com/docs/mask-mode
       */
      "mask-mode": [{
        mask: ["alpha", "luminance", "match"]
      }],
      /**
       * Mask Origin
       * @see https://tailwindcss.com/docs/mask-origin
       */
      "mask-origin": [{
        "mask-origin": ["border", "padding", "content", "fill", "stroke", "view"]
      }],
      /**
       * Mask Position
       * @see https://tailwindcss.com/docs/mask-position
       */
      "mask-position": [{
        mask: scaleBgPosition()
      }],
      /**
       * Mask Repeat
       * @see https://tailwindcss.com/docs/mask-repeat
       */
      "mask-repeat": [{
        mask: scaleBgRepeat()
      }],
      /**
       * Mask Size
       * @see https://tailwindcss.com/docs/mask-size
       */
      "mask-size": [{
        mask: scaleBgSize()
      }],
      /**
       * Mask Type
       * @see https://tailwindcss.com/docs/mask-type
       */
      "mask-type": [{
        "mask-type": ["alpha", "luminance"]
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      "mask-image": [{
        mask: ["none", isArbitraryVariable, isArbitraryValue]
      }],
      // ---------------
      // --- Filters ---
      // ---------------
      /**
       * Filter
       * @see https://tailwindcss.com/docs/filter
       */
      filter: [{
        filter: [
          // Deprecated since Tailwind CSS v3.0.0
          "",
          "none",
          isArbitraryVariable,
          isArbitraryValue
        ]
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: scaleBlur()
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Drop Shadow
       * @see https://tailwindcss.com/docs/drop-shadow
       */
      "drop-shadow": [{
        "drop-shadow": [
          // Deprecated since Tailwind CSS v4.0.0
          "",
          "none",
          themeDropShadow,
          isArbitraryVariableShadow,
          isArbitraryShadow
        ]
      }],
      /**
       * Drop Shadow Color
       * @see https://tailwindcss.com/docs/filter-drop-shadow#setting-the-shadow-color
       */
      "drop-shadow-color": [{
        "drop-shadow": scaleColor()
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      "hue-rotate": [{
        "hue-rotate": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Filter
       * @see https://tailwindcss.com/docs/backdrop-filter
       */
      "backdrop-filter": [{
        "backdrop-filter": [
          // Deprecated since Tailwind CSS v3.0.0
          "",
          "none",
          isArbitraryVariable,
          isArbitraryValue
        ]
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      "backdrop-blur": [{
        "backdrop-blur": scaleBlur()
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      "backdrop-brightness": [{
        "backdrop-brightness": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      "backdrop-contrast": [{
        "backdrop-contrast": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      "backdrop-grayscale": [{
        "backdrop-grayscale": ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      "backdrop-hue-rotate": [{
        "backdrop-hue-rotate": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      "backdrop-invert": [{
        "backdrop-invert": ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      "backdrop-opacity": [{
        "backdrop-opacity": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      "backdrop-saturate": [{
        "backdrop-saturate": [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": ["", isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      // --------------
      // --- Tables ---
      // --------------
      /**
       * Border Collapse
       * @see https://tailwindcss.com/docs/border-collapse
       */
      "border-collapse": [{
        border: ["collapse", "separate"]
      }],
      /**
       * Border Spacing
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing": [{
        "border-spacing": scaleUnambiguousSpacing()
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-x": [{
        "border-spacing-x": scaleUnambiguousSpacing()
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-y": [{
        "border-spacing-y": scaleUnambiguousSpacing()
      }],
      /**
       * Table Layout
       * @see https://tailwindcss.com/docs/table-layout
       */
      "table-layout": [{
        table: ["auto", "fixed"]
      }],
      /**
       * Caption Side
       * @see https://tailwindcss.com/docs/caption-side
       */
      caption: [{
        caption: ["top", "bottom"]
      }],
      // ---------------------------------
      // --- Transitions and Animation ---
      // ---------------------------------
      /**
       * Transition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      transition: [{
        transition: ["", "all", "colors", "opacity", "shadow", "transform", "none", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Behavior
       * @see https://tailwindcss.com/docs/transition-behavior
       */
      "transition-behavior": [{
        transition: ["normal", "discrete"]
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: [isNumber, "initial", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ["linear", "initial", themeEase, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", themeAnimate, isArbitraryVariable, isArbitraryValue]
      }],
      // ------------------
      // --- Transforms ---
      // ------------------
      /**
       * Backface Visibility
       * @see https://tailwindcss.com/docs/backface-visibility
       */
      backface: [{
        backface: ["hidden", "visible"]
      }],
      /**
       * Perspective
       * @see https://tailwindcss.com/docs/perspective
       */
      perspective: [{
        perspective: [themePerspective, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Perspective Origin
       * @see https://tailwindcss.com/docs/perspective-origin
       */
      "perspective-origin": [{
        "perspective-origin": scalePositionWithArbitrary()
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: scaleRotate()
      }],
      /**
       * Rotate X
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-x": [{
        "rotate-x": scaleRotate()
      }],
      /**
       * Rotate Y
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-y": [{
        "rotate-y": scaleRotate()
      }],
      /**
       * Rotate Z
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-z": [{
        "rotate-z": scaleRotate()
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: scaleScale()
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": scaleScale()
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": scaleScale()
      }],
      /**
       * Scale Z
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-z": [{
        "scale-z": scaleScale()
      }],
      /**
       * Scale 3D
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-3d": ["scale-3d"],
      /**
       * Skew
       * @see https://tailwindcss.com/docs/skew
       */
      skew: [{
        skew: scaleSkew()
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": scaleSkew()
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": scaleSkew()
      }],
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: [isArbitraryVariable, isArbitraryValue, "", "none", "gpu", "cpu"]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      "transform-origin": [{
        origin: scalePositionWithArbitrary()
      }],
      /**
       * Transform Style
       * @see https://tailwindcss.com/docs/transform-style
       */
      "transform-style": [{
        transform: ["3d", "flat"]
      }],
      /**
       * Translate
       * @see https://tailwindcss.com/docs/translate
       */
      translate: [{
        translate: scaleTranslate()
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": scaleTranslate()
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": scaleTranslate()
      }],
      /**
       * Translate Z
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-z": [{
        "translate-z": scaleTranslate()
      }],
      /**
       * Translate None
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-none": ["translate-none"],
      // ---------------------
      // --- Interactivity ---
      // ---------------------
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: scaleColor()
      }],
      /**
       * Appearance
       * @see https://tailwindcss.com/docs/appearance
       */
      appearance: [{
        appearance: ["none", "auto"]
      }],
      /**
       * Caret Color
       * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
       */
      "caret-color": [{
        caret: scaleColor()
      }],
      /**
       * Color Scheme
       * @see https://tailwindcss.com/docs/color-scheme
       */
      "color-scheme": [{
        scheme: ["normal", "dark", "light", "light-dark", "only-dark", "only-light"]
      }],
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      cursor: [{
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Field Sizing
       * @see https://tailwindcss.com/docs/field-sizing
       */
      "field-sizing": [{
        "field-sizing": ["fixed", "content"]
      }],
      /**
       * Pointer Events
       * @see https://tailwindcss.com/docs/pointer-events
       */
      "pointer-events": [{
        "pointer-events": ["auto", "none"]
      }],
      /**
       * Resize
       * @see https://tailwindcss.com/docs/resize
       */
      resize: [{
        resize: ["none", "", "y", "x"]
      }],
      /**
       * Scroll Behavior
       * @see https://tailwindcss.com/docs/scroll-behavior
       */
      "scroll-behavior": [{
        scroll: ["auto", "smooth"]
      }],
      /**
       * Scroll Margin
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-m": [{
        "scroll-m": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Inline
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Block
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Inline Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Inline End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Block Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbs": [{
        "scroll-mbs": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Block End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mbe": [{
        "scroll-mbe": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Inline
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Block
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Inline Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Inline End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Block Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbs": [{
        "scroll-pbs": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Block End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pbe": [{
        "scroll-pbe": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Snap Align
       * @see https://tailwindcss.com/docs/scroll-snap-align
       */
      "snap-align": [{
        snap: ["start", "end", "center", "align-none"]
      }],
      /**
       * Scroll Snap Stop
       * @see https://tailwindcss.com/docs/scroll-snap-stop
       */
      "snap-stop": [{
        snap: ["normal", "always"]
      }],
      /**
       * Scroll Snap Type
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-type": [{
        snap: ["none", "x", "y", "both"]
      }],
      /**
       * Scroll Snap Type Strictness
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-strictness": [{
        snap: ["mandatory", "proximity"]
      }],
      /**
       * Touch Action
       * @see https://tailwindcss.com/docs/touch-action
       */
      touch: [{
        touch: ["auto", "none", "manipulation"]
      }],
      /**
       * Touch Action X
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-x": [{
        "touch-pan": ["x", "left", "right"]
      }],
      /**
       * Touch Action Y
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-y": [{
        "touch-pan": ["y", "up", "down"]
      }],
      /**
       * Touch Action Pinch Zoom
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-pz": ["touch-pinch-zoom"],
      /**
       * User Select
       * @see https://tailwindcss.com/docs/user-select
       */
      select: [{
        select: ["none", "text", "all", "auto"]
      }],
      /**
       * Will Change
       * @see https://tailwindcss.com/docs/will-change
       */
      "will-change": [{
        "will-change": ["auto", "scroll", "contents", "transform", isArbitraryVariable, isArbitraryValue]
      }],
      // -----------
      // --- SVG ---
      // -----------
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: ["none", ...scaleColor()]
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      "stroke-w": [{
        stroke: [isNumber, isArbitraryVariableLength, isArbitraryLength, isArbitraryNumber]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: ["none", ...scaleColor()]
      }],
      // ---------------------
      // --- Accessibility ---
      // ---------------------
      /**
       * Forced Color Adjust
       * @see https://tailwindcss.com/docs/forced-color-adjust
       */
      "forced-color-adjust": [{
        "forced-color-adjust": ["auto", "none"]
      }]
    },
    conflictingClassGroups: {
      overflow: ["overflow-x", "overflow-y"],
      overscroll: ["overscroll-x", "overscroll-y"],
      inset: ["inset-x", "inset-y", "inset-bs", "inset-be", "start", "end", "top", "right", "bottom", "left"],
      "inset-x": ["right", "left"],
      "inset-y": ["top", "bottom"],
      flex: ["basis", "grow", "shrink"],
      gap: ["gap-x", "gap-y"],
      p: ["px", "py", "ps", "pe", "pbs", "pbe", "pt", "pr", "pb", "pl"],
      px: ["pr", "pl"],
      py: ["pt", "pb"],
      m: ["mx", "my", "ms", "me", "mbs", "mbe", "mt", "mr", "mb", "ml"],
      mx: ["mr", "ml"],
      my: ["mt", "mb"],
      size: ["w", "h"],
      "font-size": ["leading"],
      "fvn-normal": ["fvn-ordinal", "fvn-slashed-zero", "fvn-figure", "fvn-spacing", "fvn-fraction"],
      "fvn-ordinal": ["fvn-normal"],
      "fvn-slashed-zero": ["fvn-normal"],
      "fvn-figure": ["fvn-normal"],
      "fvn-spacing": ["fvn-normal"],
      "fvn-fraction": ["fvn-normal"],
      "line-clamp": ["display", "overflow"],
      rounded: ["rounded-s", "rounded-e", "rounded-t", "rounded-r", "rounded-b", "rounded-l", "rounded-ss", "rounded-se", "rounded-ee", "rounded-es", "rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"],
      "rounded-s": ["rounded-ss", "rounded-es"],
      "rounded-e": ["rounded-se", "rounded-ee"],
      "rounded-t": ["rounded-tl", "rounded-tr"],
      "rounded-r": ["rounded-tr", "rounded-br"],
      "rounded-b": ["rounded-br", "rounded-bl"],
      "rounded-l": ["rounded-tl", "rounded-bl"],
      "border-spacing": ["border-spacing-x", "border-spacing-y"],
      "border-w": ["border-w-x", "border-w-y", "border-w-s", "border-w-e", "border-w-bs", "border-w-be", "border-w-t", "border-w-r", "border-w-b", "border-w-l"],
      "border-w-x": ["border-w-r", "border-w-l"],
      "border-w-y": ["border-w-t", "border-w-b"],
      "border-color": ["border-color-x", "border-color-y", "border-color-s", "border-color-e", "border-color-bs", "border-color-be", "border-color-t", "border-color-r", "border-color-b", "border-color-l"],
      "border-color-x": ["border-color-r", "border-color-l"],
      "border-color-y": ["border-color-t", "border-color-b"],
      translate: ["translate-x", "translate-y", "translate-none"],
      "translate-none": ["translate", "translate-x", "translate-y", "translate-z"],
      "scroll-m": ["scroll-mx", "scroll-my", "scroll-ms", "scroll-me", "scroll-mbs", "scroll-mbe", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml"],
      "scroll-mx": ["scroll-mr", "scroll-ml"],
      "scroll-my": ["scroll-mt", "scroll-mb"],
      "scroll-p": ["scroll-px", "scroll-py", "scroll-ps", "scroll-pe", "scroll-pbs", "scroll-pbe", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl"],
      "scroll-px": ["scroll-pr", "scroll-pl"],
      "scroll-py": ["scroll-pt", "scroll-pb"],
      touch: ["touch-x", "touch-y", "touch-pz"],
      "touch-x": ["touch"],
      "touch-y": ["touch"],
      "touch-pz": ["touch"]
    },
    conflictingClassGroupModifiers: {
      "font-size": ["leading"]
    },
    orderSensitiveModifiers: ["*", "**", "after", "backdrop", "before", "details-content", "file", "first-letter", "first-line", "marker", "placeholder", "selection"]
  };
};
const twMerge = /* @__PURE__ */ createTailwindMerge(getDefaultConfig);
function r$1(e2) {
  var t2, f, n2 = "";
  if ("string" == typeof e2 || "number" == typeof e2) n2 += e2;
  else if ("object" == typeof e2) if (Array.isArray(e2)) {
    var o2 = e2.length;
    for (t2 = 0; t2 < o2; t2++) e2[t2] && (f = r$1(e2[t2])) && (n2 && (n2 += " "), n2 += f);
  } else for (f in e2) e2[f] && (n2 && (n2 += " "), n2 += f);
  return n2;
}
function clsx() {
  for (var e2, t2, f = 0, n2 = "", o2 = arguments.length; f < o2; f++) (e2 = arguments[f]) && (t2 = r$1(e2)) && (n2 && (n2 += " "), n2 += t2);
  return n2;
}
const falsyToString = (value) => typeof value === "boolean" ? `${value}` : value === 0 ? "0" : value;
const cx = clsx;
const cva = (base, config) => (props) => {
  var _config_compoundVariants;
  if ((config === null || config === void 0 ? void 0 : config.variants) == null) return cx(base, props === null || props === void 0 ? void 0 : props.class, props === null || props === void 0 ? void 0 : props.className);
  const { variants: variants2, defaultVariants } = config;
  const getVariantClassNames = Object.keys(variants2).map((variant) => {
    const variantProp = props === null || props === void 0 ? void 0 : props[variant];
    const defaultVariantProp = defaultVariants === null || defaultVariants === void 0 ? void 0 : defaultVariants[variant];
    if (variantProp === null) return null;
    const variantKey = falsyToString(variantProp) || falsyToString(defaultVariantProp);
    return variants2[variant][variantKey];
  });
  const propsWithoutUndefined = props && Object.entries(props).reduce((acc, param) => {
    let [key, value] = param;
    if (value === void 0) {
      return acc;
    }
    acc[key] = value;
    return acc;
  }, {});
  const getCompoundVariantClassNames = config === null || config === void 0 ? void 0 : (_config_compoundVariants = config.compoundVariants) === null || _config_compoundVariants === void 0 ? void 0 : _config_compoundVariants.reduce((acc, param) => {
    let { class: cvClass, className: cvClassName, ...compoundVariantOptions } = param;
    return Object.entries(compoundVariantOptions).every((param2) => {
      let [key, value] = param2;
      return Array.isArray(value) ? value.includes({
        ...defaultVariants,
        ...propsWithoutUndefined
      }[key]) : {
        ...defaultVariants,
        ...propsWithoutUndefined
      }[key] === value;
    }) ? [
      ...acc,
      cvClass,
      cvClassName
    ] : acc;
  }, []);
  return cx(base, getVariantClassNames, getCompoundVariantClassNames, props === null || props === void 0 ? void 0 : props.class, props === null || props === void 0 ? void 0 : props.className);
};
const variants = {
  primary: "bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/80",
  outline: "border hover:bg-fd-accent hover:text-fd-accent-foreground",
  ghost: "hover:bg-fd-accent hover:text-fd-accent-foreground",
  secondary: "border bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent hover:text-fd-accent-foreground"
};
const buttonVariants = cva("inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors duration-100 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring", {
  variants: {
    variant: variants,
    // fumadocs use `color` instead of `variant`
    color: variants,
    size: {
      sm: "gap-1 px-2 py-1.5 text-xs",
      icon: "p-1.5 [&_svg]:size-5",
      "icon-sm": "p-1.5 [&_svg]:size-4.5",
      "icon-xs": "p-1 [&_svg]:size-4"
    }
  }
});
const defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
const createLucideIcon = (iconName, iconNode) => {
  const Component = forwardRef(({ className, size: size2 = 24, color = "currentColor", children, ...props }, ref) => {
    return jsxs("svg", { ref, ...defaultAttributes, width: size2, height: size2, stroke: color, className: twMerge("lucide", className), ...props, children: [iconNode.map(([tag, attr]) => createElement(tag, attr)), children] });
  });
  Component.displayName = iconName;
  return Component;
};
const ChevronDown = createLucideIcon("chevron-down", [
  ["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]
]);
const Languages = createLucideIcon("languages", [
  ["path", { d: "m5 8 6 6", key: "1wu5hv" }],
  ["path", { d: "m4 14 6-6 2-3", key: "1k1g8d" }],
  ["path", { d: "M2 5h12", key: "or177f" }],
  ["path", { d: "M7 2h1", key: "1t2jsx" }],
  ["path", { d: "m22 22-5-10-5 10", key: "don7ne" }],
  ["path", { d: "M14 18h6", key: "1m8k6r" }]
]);
const Sidebar = createLucideIcon("panel-left", [
  [
    "rect",
    { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }
  ],
  ["path", { d: "M9 3v18", key: "fh3hqa" }]
]);
const ChevronsUpDown = createLucideIcon("chevrons-up-down", [
  ["path", { d: "m7 15 5 5 5-5", key: "1hf1tw" }],
  ["path", { d: "m7 9 5-5 5 5", key: "sgt6xg" }]
]);
const Search = createLucideIcon("search", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
]);
const ExternalLink = createLucideIcon("external-link", [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  [
    "path",
    {
      d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
      key: "a6xqqp"
    }
  ]
]);
const Moon = createLucideIcon("moon", [
  ["path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z", key: "a7tn18" }]
]);
const Sun = createLucideIcon("sun", [
  ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }],
  ["path", { d: "M12 2v2", key: "tus03m" }],
  ["path", { d: "M12 20v2", key: "1lh1kg" }],
  ["path", { d: "m4.93 4.93 1.41 1.41", key: "149t6j" }],
  ["path", { d: "m17.66 17.66 1.41 1.41", key: "ptbguv" }],
  ["path", { d: "M2 12h2", key: "1t8f8n" }],
  ["path", { d: "M20 12h2", key: "1q8mjw" }],
  ["path", { d: "m6.34 17.66-1.41 1.41", key: "1m8zz5" }],
  ["path", { d: "m19.07 4.93-1.41 1.41", key: "1shlcs" }]
]);
const Airplay = createLucideIcon("airplay", [
  [
    "path",
    {
      d: "M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1",
      key: "ns4c3b"
    }
  ],
  ["path", { d: "m12 15 5 6H7Z", key: "14qnn2" }]
]);
createLucideIcon("menu", [
  ["line", { x1: "4", x2: "20", y1: "12", y2: "12", key: "1e0a9i" }],
  ["line", { x1: "4", x2: "20", y1: "6", y2: "6", key: "1owob3" }],
  ["line", { x1: "4", x2: "20", y1: "18", y2: "18", key: "yk5zj1" }]
]);
createLucideIcon("x", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
createLucideIcon("loader-circle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);
const CircleCheck = createLucideIcon("circle-check", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
]);
const CircleX = createLucideIcon("circle-x", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m15 9-6 6", key: "1uzhvr" }],
  ["path", { d: "m9 9 6 6", key: "z0biqf" }]
]);
const Check = createLucideIcon("check", [
  ["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]
]);
const TriangleAlert = createLucideIcon("triangle-alert", [
  [
    "path",
    {
      d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
      key: "wmoenq"
    }
  ],
  ["path", { d: "M12 9v4", key: "juzpu7" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
]);
const Info = createLucideIcon("info", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 16v-4", key: "1dtifu" }],
  ["path", { d: "M12 8h.01", key: "e9boi3" }]
]);
createLucideIcon("copy", [
  [
    "rect",
    {
      width: "14",
      height: "14",
      x: "8",
      y: "8",
      rx: "2",
      ry: "2",
      key: "17jyea"
    }
  ],
  [
    "path",
    {
      d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",
      key: "zix9uf"
    }
  ]
]);
const Clipboard = createLucideIcon("clipboard", [
  [
    "rect",
    {
      width: "8",
      height: "4",
      x: "8",
      y: "2",
      rx: "1",
      ry: "1",
      key: "1"
    }
  ],
  [
    "path",
    {
      d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",
      key: "2"
    }
  ]
]);
createLucideIcon("file-text", [
  [
    "path",
    {
      d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",
      key: "1rqfz7"
    }
  ],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "M10 9H8", key: "b1mrlr" }],
  ["path", { d: "M16 13H8", key: "t4e002" }],
  ["path", { d: "M16 17H8", key: "z1uh3a" }]
]);
const Hash = createLucideIcon("hash", [
  ["line", { x1: "4", x2: "20", y1: "9", y2: "9", key: "4lhtct" }],
  ["line", { x1: "4", x2: "20", y1: "15", y2: "15", key: "vyu0kd" }],
  ["line", { x1: "10", x2: "8", y1: "3", y2: "21", key: "1ggp8o" }],
  ["line", { x1: "16", x2: "14", y1: "3", y2: "21", key: "weycgp" }]
]);
createLucideIcon("text", [
  ["path", { d: "M15 18H3", key: "olowqp" }],
  ["path", { d: "M17 6H3", key: "16j9eg" }],
  ["path", { d: "M21 12H3", key: "2avoz0" }]
]);
createLucideIcon("file", [
  [
    "path",
    {
      d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",
      key: "1rqfz7"
    }
  ],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }]
]);
createLucideIcon("folder", [
  [
    "path",
    {
      d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
      key: "1kt360"
    }
  ]
]);
createLucideIcon("folder-open", [
  [
    "path",
    {
      d: "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",
      key: "usdka0"
    }
  ]
]);
createLucideIcon("star", [
  [
    "path",
    {
      d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
      key: "r04s7s"
    }
  ]
]);
const Link$1 = createLucideIcon("link", [
  [
    "path",
    {
      d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",
      key: "1cjeqo"
    }
  ],
  [
    "path",
    {
      d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
      key: "19qd67"
    }
  ]
]);
createLucideIcon("square-pen", [
  [
    "path",
    {
      d: "M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",
      key: "1m0v6g"
    }
  ],
  [
    "path",
    {
      d: "M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",
      key: "ohrbg2"
    }
  ]
]);
const ChevronRight = createLucideIcon("chevron-right", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
]);
createLucideIcon("chevron-left", [
  ["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]
]);
createLucideIcon("plus", [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
]);
createLucideIcon("trash-2", [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
  ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]
]);
createLucideIcon("chevron-up", [
  ["path", { d: "m18 15-6-6-6 6", key: "153udz" }]
]);
var Link2 = forwardRef(
  ({
    href = "#",
    // any protocol
    external = href.match(/^\w+:/) || // protocol relative URL
    href.startsWith("//"),
    prefetch,
    ...props
  }, ref) => {
    if (external) {
      return /* @__PURE__ */ jsx(
        "a",
        {
          ref,
          href,
          rel: "noreferrer noopener",
          target: "_blank",
          ...props,
          children: props.children
        }
      );
    }
    return /* @__PURE__ */ jsx(Link$2, { ref, href, prefetch, ...props });
  }
);
Link2.displayName = "Link";
function findPath(nodes, matcher, options = {}) {
  const { includeSeparator = true } = options;
  function run(nodes2) {
    let separator;
    for (const node of nodes2) {
      if (matcher(node)) {
        const items = [];
        if (separator) items.push(separator);
        items.push(node);
        return items;
      }
      if (node.type === "separator" && includeSeparator) {
        separator = node;
        continue;
      }
      if (node.type === "folder") {
        const items = node.index && matcher(node.index) ? [node.index] : run(node.children);
        if (items) {
          items.unshift(node);
          if (separator) items.unshift(separator);
          return items;
        }
      }
    }
  }
  return run(nodes) ?? null;
}
function searchPath(nodes, url) {
  const normalizedUrl = normalizeUrl(url);
  return findPath(
    nodes,
    (node) => node.type === "page" && node.url === normalizedUrl
  );
}
const TreeContext = createContext("TreeContext");
const PathContext = createContext("PathContext", []);
function TreeContextProvider(props) {
  const nextIdRef = useRef(0);
  const pathname = usePathname();
  const tree = useMemo(() => props.tree, [props.tree.$id ?? props.tree]);
  const path = useMemo(() => {
    let result = searchPath(tree.children, pathname);
    if (result)
      return result;
    if (tree.fallback)
      result = searchPath(tree.fallback.children, pathname);
    return result ?? [];
  }, [tree, pathname]);
  const root = path.findLast((item) => item.type === "folder" && item.root) ?? tree;
  root.$id ?? (root.$id = String(nextIdRef.current++));
  return jsx(TreeContext.Provider, { value: useMemo(() => ({ root, full: tree }), [root, tree]), children: jsx(PathContext.Provider, { value: path, children: props.children }) });
}
function useTreePath() {
  return PathContext.use();
}
function useTreeContext() {
  return TreeContext.use("You must wrap this component under <DocsLayout />");
}
createContext("StylesContext", {
  tocNav: "xl:hidden",
  toc: "max-xl:hidden"
});
const NavContext = createContext("NavContext", {
  isTransparent: false
});
function NavProvider({ transparentMode = "none", children }) {
  const [transparent, setTransparent] = useState(transparentMode !== "none");
  useEffect(() => {
    if (transparentMode !== "top")
      return;
    const listener = () => {
      setTransparent(window.scrollY < 10);
    };
    listener();
    window.addEventListener("scroll", listener);
    return () => {
      window.removeEventListener("scroll", listener);
    };
  }, [transparentMode]);
  return jsx(NavContext.Provider, { value: useMemo(() => ({ isTransparent: transparent }), [transparent]), children });
}
function useNav() {
  return NavContext.use();
}
function normalize(url) {
  if (url.length > 1 && url.endsWith("/"))
    return url.slice(0, -1);
  return url;
}
function isActive(url, pathname, nested = true) {
  url = normalize(url);
  pathname = normalize(pathname);
  return url === pathname || nested && pathname.startsWith(`${url}/`);
}
function isTabActive(tab, pathname) {
  if (tab.urls)
    return tab.urls.has(normalize(pathname));
  return isActive(tab.url, pathname, true);
}
var useEffectEvent = "useEffectEvent" in React ? { ...React }.useEffectEvent : (callback) => {
  const ref = React.useRef(callback);
  ref.current = callback;
  return React.useCallback(
    ((...params) => ref.current(...params)),
    []
  );
};
function composeEventHandlers(originalEventHandler, ourEventHandler, { checkForDefaultPrevented = true } = {}) {
  return function handleEvent(event) {
    originalEventHandler?.(event);
    if (checkForDefaultPrevented === false || !event.defaultPrevented) {
      return ourEventHandler?.(event);
    }
  };
}
function createContext2(rootComponentName, defaultContext) {
  const Context = React.createContext(defaultContext);
  const Provider = (props) => {
    const { children, ...context } = props;
    const value = React.useMemo(() => context, Object.values(context));
    return /* @__PURE__ */ jsx(Context.Provider, { value, children });
  };
  Provider.displayName = rootComponentName + "Provider";
  function useContext2(consumerName) {
    const context = React.useContext(Context);
    if (context) return context;
    if (defaultContext !== void 0) return defaultContext;
    throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
  }
  return [Provider, useContext2];
}
function createContextScope(scopeName, createContextScopeDeps = []) {
  let defaultContexts = [];
  function createContext3(rootComponentName, defaultContext) {
    const BaseContext = React.createContext(defaultContext);
    const index2 = defaultContexts.length;
    defaultContexts = [...defaultContexts, defaultContext];
    const Provider = (props) => {
      const { scope, children, ...context } = props;
      const Context = scope?.[scopeName]?.[index2] || BaseContext;
      const value = React.useMemo(() => context, Object.values(context));
      return /* @__PURE__ */ jsx(Context.Provider, { value, children });
    };
    Provider.displayName = rootComponentName + "Provider";
    function useContext2(consumerName, scope) {
      const Context = scope?.[scopeName]?.[index2] || BaseContext;
      const context = React.useContext(Context);
      if (context) return context;
      if (defaultContext !== void 0) return defaultContext;
      throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
    }
    return [Provider, useContext2];
  }
  const createScope = () => {
    const scopeContexts = defaultContexts.map((defaultContext) => {
      return React.createContext(defaultContext);
    });
    return function useScope(scope) {
      const contexts = scope?.[scopeName] || scopeContexts;
      return React.useMemo(
        () => ({ [`__scope${scopeName}`]: { ...scope, [scopeName]: contexts } }),
        [scope, contexts]
      );
    };
  };
  createScope.scopeName = scopeName;
  return [createContext3, composeContextScopes(createScope, ...createContextScopeDeps)];
}
function composeContextScopes(...scopes) {
  const baseScope = scopes[0];
  if (scopes.length === 1) return baseScope;
  const createScope = () => {
    const scopeHooks = scopes.map((createScope2) => ({
      useScope: createScope2(),
      scopeName: createScope2.scopeName
    }));
    return function useComposedScopes(overrideScopes) {
      const nextScopes = scopeHooks.reduce((nextScopes2, { useScope, scopeName }) => {
        const scopeProps = useScope(overrideScopes);
        const currentScope = scopeProps[`__scope${scopeName}`];
        return { ...nextScopes2, ...currentScope };
      }, {});
      return React.useMemo(() => ({ [`__scope${baseScope.scopeName}`]: nextScopes }), [nextScopes]);
    };
  };
  createScope.scopeName = baseScope.scopeName;
  return createScope;
}
var useLayoutEffect2 = globalThis?.document ? React.useLayoutEffect : () => {
};
var useInsertionEffect = React[" useInsertionEffect ".trim().toString()] || useLayoutEffect2;
function useControllableState({
  prop,
  defaultProp,
  onChange = () => {
  },
  caller
}) {
  const [uncontrolledProp, setUncontrolledProp, onChangeRef] = useUncontrolledState({
    defaultProp,
    onChange
  });
  const isControlled = prop !== void 0;
  const value = isControlled ? prop : uncontrolledProp;
  {
    const isControlledRef = React.useRef(prop !== void 0);
    React.useEffect(() => {
      const wasControlled = isControlledRef.current;
      if (wasControlled !== isControlled) {
        const from = wasControlled ? "controlled" : "uncontrolled";
        const to = isControlled ? "controlled" : "uncontrolled";
        console.warn(
          `${caller} is changing from ${from} to ${to}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
        );
      }
      isControlledRef.current = isControlled;
    }, [isControlled, caller]);
  }
  const setValue = React.useCallback(
    (nextValue) => {
      if (isControlled) {
        const value2 = isFunction(nextValue) ? nextValue(prop) : nextValue;
        if (value2 !== prop) {
          onChangeRef.current?.(value2);
        }
      } else {
        setUncontrolledProp(nextValue);
      }
    },
    [isControlled, prop, setUncontrolledProp, onChangeRef]
  );
  return [value, setValue];
}
function useUncontrolledState({
  defaultProp,
  onChange
}) {
  const [value, setValue] = React.useState(defaultProp);
  const prevValueRef = React.useRef(value);
  const onChangeRef = React.useRef(onChange);
  useInsertionEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  React.useEffect(() => {
    if (prevValueRef.current !== value) {
      onChangeRef.current?.(value);
      prevValueRef.current = value;
    }
  }, [value, prevValueRef]);
  return [value, setValue, onChangeRef];
}
function isFunction(value) {
  return typeof value === "function";
}
function setRef(ref, value) {
  if (typeof ref === "function") {
    return ref(value);
  } else if (ref !== null && ref !== void 0) {
    ref.current = value;
  }
}
function composeRefs(...refs) {
  return (node) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node);
      if (!hasCleanup && typeof cleanup == "function") {
        hasCleanup = true;
      }
      return cleanup;
    });
    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup == "function") {
            cleanup();
          } else {
            setRef(refs[i], null);
          }
        }
      };
    }
  };
}
function useComposedRefs(...refs) {
  return React.useCallback(composeRefs(...refs), refs);
}
// @__NO_SIDE_EFFECTS__
function createSlot(ownerName) {
  const SlotClone = /* @__PURE__ */ createSlotClone(ownerName);
  const Slot2 = React.forwardRef((props, forwardedRef) => {
    const { children, ...slotProps } = props;
    const childrenArray = React.Children.toArray(children);
    const slottable = childrenArray.find(isSlottable);
    if (slottable) {
      const newElement = slottable.props.children;
      const newChildren = childrenArray.map((child) => {
        if (child === slottable) {
          if (React.Children.count(newElement) > 1) return React.Children.only(null);
          return React.isValidElement(newElement) ? newElement.props.children : null;
        } else {
          return child;
        }
      });
      return /* @__PURE__ */ jsx(SlotClone, { ...slotProps, ref: forwardedRef, children: React.isValidElement(newElement) ? React.cloneElement(newElement, void 0, newChildren) : null });
    }
    return /* @__PURE__ */ jsx(SlotClone, { ...slotProps, ref: forwardedRef, children });
  });
  Slot2.displayName = `${ownerName}.Slot`;
  return Slot2;
}
// @__NO_SIDE_EFFECTS__
function createSlotClone(ownerName) {
  const SlotClone = React.forwardRef((props, forwardedRef) => {
    const { children, ...slotProps } = props;
    if (React.isValidElement(children)) {
      const childrenRef = getElementRef$1(children);
      const props2 = mergeProps(slotProps, children.props);
      if (children.type !== React.Fragment) {
        props2.ref = forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef;
      }
      return React.cloneElement(children, props2);
    }
    return React.Children.count(children) > 1 ? React.Children.only(null) : null;
  });
  SlotClone.displayName = `${ownerName}.SlotClone`;
  return SlotClone;
}
var SLOTTABLE_IDENTIFIER = /* @__PURE__ */ Symbol("radix.slottable");
function isSlottable(child) {
  return React.isValidElement(child) && typeof child.type === "function" && "__radixId" in child.type && child.type.__radixId === SLOTTABLE_IDENTIFIER;
}
function mergeProps(slotProps, childProps) {
  const overrideProps = { ...childProps };
  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];
    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args) => {
          const result = childPropValue(...args);
          slotPropValue(...args);
          return result;
        };
      } else if (slotPropValue) {
        overrideProps[propName] = slotPropValue;
      }
    } else if (propName === "style") {
      overrideProps[propName] = { ...slotPropValue, ...childPropValue };
    } else if (propName === "className") {
      overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
    }
  }
  return { ...slotProps, ...overrideProps };
}
function getElementRef$1(element) {
  let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.ref;
  }
  getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
  mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.props.ref;
  }
  return element.props.ref || element.ref;
}
var NODES = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "select",
  "span",
  "svg",
  "ul"
];
var Primitive = NODES.reduce((primitive, node) => {
  const Slot2 = /* @__PURE__ */ createSlot(`Primitive.${node}`);
  const Node2 = React.forwardRef((props, forwardedRef) => {
    const { asChild, ...primitiveProps } = props;
    const Comp = asChild ? Slot2 : node;
    if (typeof window !== "undefined") {
      window[/* @__PURE__ */ Symbol.for("radix-ui")] = true;
    }
    return /* @__PURE__ */ jsx(Comp, { ...primitiveProps, ref: forwardedRef });
  });
  Node2.displayName = `Primitive.${node}`;
  return { ...primitive, [node]: Node2 };
}, {});
function dispatchDiscreteCustomEvent(target, event) {
  if (target) ReactDOM.flushSync(() => target.dispatchEvent(event));
}
function useStateMachine(initialState, machine) {
  return React.useReducer((state, event) => {
    const nextState = machine[state][event];
    return nextState ?? state;
  }, initialState);
}
var Presence = (props) => {
  const { present, children } = props;
  const presence = usePresence(present);
  const child = typeof children === "function" ? children({ present: presence.isPresent }) : React.Children.only(children);
  const ref = useComposedRefs(presence.ref, getElementRef(child));
  const forceMount = typeof children === "function";
  return forceMount || presence.isPresent ? React.cloneElement(child, { ref }) : null;
};
Presence.displayName = "Presence";
function usePresence(present) {
  const [node, setNode] = React.useState();
  const stylesRef = React.useRef(null);
  const prevPresentRef = React.useRef(present);
  const prevAnimationNameRef = React.useRef("none");
  const initialState = present ? "mounted" : "unmounted";
  const [state, send] = useStateMachine(initialState, {
    mounted: {
      UNMOUNT: "unmounted",
      ANIMATION_OUT: "unmountSuspended"
    },
    unmountSuspended: {
      MOUNT: "mounted",
      ANIMATION_END: "unmounted"
    },
    unmounted: {
      MOUNT: "mounted"
    }
  });
  React.useEffect(() => {
    const currentAnimationName = getAnimationName(stylesRef.current);
    prevAnimationNameRef.current = state === "mounted" ? currentAnimationName : "none";
  }, [state]);
  useLayoutEffect2(() => {
    const styles = stylesRef.current;
    const wasPresent = prevPresentRef.current;
    const hasPresentChanged = wasPresent !== present;
    if (hasPresentChanged) {
      const prevAnimationName = prevAnimationNameRef.current;
      const currentAnimationName = getAnimationName(styles);
      if (present) {
        send("MOUNT");
      } else if (currentAnimationName === "none" || styles?.display === "none") {
        send("UNMOUNT");
      } else {
        const isAnimating = prevAnimationName !== currentAnimationName;
        if (wasPresent && isAnimating) {
          send("ANIMATION_OUT");
        } else {
          send("UNMOUNT");
        }
      }
      prevPresentRef.current = present;
    }
  }, [present, send]);
  useLayoutEffect2(() => {
    if (node) {
      let timeoutId;
      const ownerWindow = node.ownerDocument.defaultView ?? window;
      const handleAnimationEnd = (event) => {
        const currentAnimationName = getAnimationName(stylesRef.current);
        const isCurrentAnimation = currentAnimationName.includes(CSS.escape(event.animationName));
        if (event.target === node && isCurrentAnimation) {
          send("ANIMATION_END");
          if (!prevPresentRef.current) {
            const currentFillMode = node.style.animationFillMode;
            node.style.animationFillMode = "forwards";
            timeoutId = ownerWindow.setTimeout(() => {
              if (node.style.animationFillMode === "forwards") {
                node.style.animationFillMode = currentFillMode;
              }
            });
          }
        }
      };
      const handleAnimationStart = (event) => {
        if (event.target === node) {
          prevAnimationNameRef.current = getAnimationName(stylesRef.current);
        }
      };
      node.addEventListener("animationstart", handleAnimationStart);
      node.addEventListener("animationcancel", handleAnimationEnd);
      node.addEventListener("animationend", handleAnimationEnd);
      return () => {
        ownerWindow.clearTimeout(timeoutId);
        node.removeEventListener("animationstart", handleAnimationStart);
        node.removeEventListener("animationcancel", handleAnimationEnd);
        node.removeEventListener("animationend", handleAnimationEnd);
      };
    } else {
      send("ANIMATION_END");
    }
  }, [node, send]);
  return {
    isPresent: ["mounted", "unmountSuspended"].includes(state),
    ref: React.useCallback((node2) => {
      stylesRef.current = node2 ? getComputedStyle(node2) : null;
      setNode(node2);
    }, [])
  };
}
function getAnimationName(styles) {
  return styles?.animationName || "none";
}
function getElementRef(element) {
  let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.ref;
  }
  getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
  mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.props.ref;
  }
  return element.props.ref || element.ref;
}
var useReactId = React[" useId ".trim().toString()] || (() => void 0);
var count$1 = 0;
function useId(deterministicId) {
  const [id, setId] = React.useState(useReactId());
  useLayoutEffect2(() => {
    setId((reactId) => reactId ?? String(count$1++));
  }, [deterministicId]);
  return deterministicId || (id ? `radix-${id}` : "");
}
var COLLAPSIBLE_NAME = "Collapsible";
var [createCollapsibleContext] = createContextScope(COLLAPSIBLE_NAME);
var [CollapsibleProvider, useCollapsibleContext] = createCollapsibleContext(COLLAPSIBLE_NAME);
var Collapsible$1 = React.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeCollapsible,
      open: openProp,
      defaultOpen,
      disabled,
      onOpenChange,
      ...collapsibleProps
    } = props;
    const [open, setOpen] = useControllableState({
      prop: openProp,
      defaultProp: defaultOpen ?? false,
      onChange: onOpenChange,
      caller: COLLAPSIBLE_NAME
    });
    return /* @__PURE__ */ jsx(
      CollapsibleProvider,
      {
        scope: __scopeCollapsible,
        disabled,
        contentId: useId(),
        open,
        onOpenToggle: React.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
        children: /* @__PURE__ */ jsx(
          Primitive.div,
          {
            "data-state": getState$1(open),
            "data-disabled": disabled ? "" : void 0,
            ...collapsibleProps,
            ref: forwardedRef
          }
        )
      }
    );
  }
);
Collapsible$1.displayName = COLLAPSIBLE_NAME;
var TRIGGER_NAME$3 = "CollapsibleTrigger";
var CollapsibleTrigger$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeCollapsible, ...triggerProps } = props;
    const context = useCollapsibleContext(TRIGGER_NAME$3, __scopeCollapsible);
    return /* @__PURE__ */ jsx(
      Primitive.button,
      {
        type: "button",
        "aria-controls": context.contentId,
        "aria-expanded": context.open || false,
        "data-state": getState$1(context.open),
        "data-disabled": context.disabled ? "" : void 0,
        disabled: context.disabled,
        ...triggerProps,
        ref: forwardedRef,
        onClick: composeEventHandlers(props.onClick, context.onOpenToggle)
      }
    );
  }
);
CollapsibleTrigger$1.displayName = TRIGGER_NAME$3;
var CONTENT_NAME$4 = "CollapsibleContent";
var CollapsibleContent$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { forceMount, ...contentProps } = props;
    const context = useCollapsibleContext(CONTENT_NAME$4, props.__scopeCollapsible);
    return /* @__PURE__ */ jsx(Presence, { present: forceMount || context.open, children: ({ present }) => /* @__PURE__ */ jsx(CollapsibleContentImpl, { ...contentProps, ref: forwardedRef, present }) });
  }
);
CollapsibleContent$1.displayName = CONTENT_NAME$4;
var CollapsibleContentImpl = React.forwardRef((props, forwardedRef) => {
  const { __scopeCollapsible, present, children, ...contentProps } = props;
  const context = useCollapsibleContext(CONTENT_NAME$4, __scopeCollapsible);
  const [isPresent, setIsPresent] = React.useState(present);
  const ref = React.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  const heightRef = React.useRef(0);
  const height = heightRef.current;
  const widthRef = React.useRef(0);
  const width = widthRef.current;
  const isOpen = context.open || isPresent;
  const isMountAnimationPreventedRef = React.useRef(isOpen);
  const originalStylesRef = React.useRef(void 0);
  React.useEffect(() => {
    const rAF = requestAnimationFrame(() => isMountAnimationPreventedRef.current = false);
    return () => cancelAnimationFrame(rAF);
  }, []);
  useLayoutEffect2(() => {
    const node = ref.current;
    if (node) {
      originalStylesRef.current = originalStylesRef.current || {
        transitionDuration: node.style.transitionDuration,
        animationName: node.style.animationName
      };
      node.style.transitionDuration = "0s";
      node.style.animationName = "none";
      const rect = node.getBoundingClientRect();
      heightRef.current = rect.height;
      widthRef.current = rect.width;
      if (!isMountAnimationPreventedRef.current) {
        node.style.transitionDuration = originalStylesRef.current.transitionDuration;
        node.style.animationName = originalStylesRef.current.animationName;
      }
      setIsPresent(present);
    }
  }, [context.open, present]);
  return /* @__PURE__ */ jsx(
    Primitive.div,
    {
      "data-state": getState$1(context.open),
      "data-disabled": context.disabled ? "" : void 0,
      id: context.contentId,
      hidden: !isOpen,
      ...contentProps,
      ref: composedRefs,
      style: {
        [`--radix-collapsible-content-height`]: height ? `${height}px` : void 0,
        [`--radix-collapsible-content-width`]: width ? `${width}px` : void 0,
        ...props.style
      },
      children: isOpen && children
    }
  );
});
function getState$1(open) {
  return open ? "open" : "closed";
}
var Root$3 = Collapsible$1;
const Collapsible = Root$3;
const CollapsibleTrigger = CollapsibleTrigger$1;
const CollapsibleContent = forwardRef(({ children, ...props }, ref) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return jsx(CollapsibleContent$1, { ref, ...props, className: twMerge("overflow-hidden", mounted && "data-[state=closed]:animate-fd-collapsible-up data-[state=open]:animate-fd-collapsible-down", props.className), children });
});
CollapsibleContent.displayName = CollapsibleContent$1.displayName;
const t = (t2) => "object" == typeof t2 && null != t2 && 1 === t2.nodeType, e$1 = (t2, e2) => (!e2 || "hidden" !== t2) && ("visible" !== t2 && "clip" !== t2), n = (t2, n2) => {
  if (t2.clientHeight < t2.scrollHeight || t2.clientWidth < t2.scrollWidth) {
    const o2 = getComputedStyle(t2, null);
    return e$1(o2.overflowY, n2) || e$1(o2.overflowX, n2) || ((t3) => {
      const e2 = ((t4) => {
        if (!t4.ownerDocument || !t4.ownerDocument.defaultView) return null;
        try {
          return t4.ownerDocument.defaultView.frameElement;
        } catch (t5) {
          return null;
        }
      })(t3);
      return !!e2 && (e2.clientHeight < t3.scrollHeight || e2.clientWidth < t3.scrollWidth);
    })(t2);
  }
  return false;
}, o$1 = (t2, e2, n2, o2, l2, r2, i, s) => r2 < t2 && i > e2 || r2 > t2 && i < e2 ? 0 : r2 <= t2 && s <= n2 || i >= e2 && s >= n2 ? r2 - t2 - o2 : i > e2 && s < n2 || r2 < t2 && s > n2 ? i - e2 + l2 : 0, l = (t2) => {
  const e2 = t2.parentElement;
  return null == e2 ? t2.getRootNode().host || null : e2;
}, r = (e2, r2) => {
  var i, s, d, h;
  if ("undefined" == typeof document) return [];
  const { scrollMode: c, block: f, inline: u, boundary: a, skipOverflowHiddenElements: g } = r2, p = "function" == typeof a ? a : (t2) => t2 !== a;
  if (!t(e2)) throw new TypeError("Invalid target");
  const m = document.scrollingElement || document.documentElement, w = [];
  let W2 = e2;
  for (; t(W2) && p(W2); ) {
    if (W2 = l(W2), W2 === m) {
      w.push(W2);
      break;
    }
    null != W2 && W2 === document.body && n(W2) && !n(document.documentElement) || null != W2 && n(W2, g) && w.push(W2);
  }
  const b2 = null != (s = null == (i = window.visualViewport) ? void 0 : i.width) ? s : innerWidth, H2 = null != (h = null == (d = window.visualViewport) ? void 0 : d.height) ? h : innerHeight, { scrollX: y, scrollY: M2 } = window, { height: v, width: E2, top: x2, right: C, bottom: I2, left: R } = e2.getBoundingClientRect(), { top: T, right: B, bottom: F, left: V2 } = ((t2) => {
    const e3 = window.getComputedStyle(t2);
    return { top: parseFloat(e3.scrollMarginTop) || 0, right: parseFloat(e3.scrollMarginRight) || 0, bottom: parseFloat(e3.scrollMarginBottom) || 0, left: parseFloat(e3.scrollMarginLeft) || 0 };
  })(e2);
  let k = "start" === f || "nearest" === f ? x2 - T : "end" === f ? I2 + F : x2 + v / 2 - T + F, D = "center" === u ? R + E2 / 2 - V2 + B : "end" === u ? C + B : R - V2;
  const L = [];
  for (let t2 = 0; t2 < w.length; t2++) {
    const e3 = w[t2], { height: l2, width: r3, top: i2, right: s2, bottom: d2, left: h2 } = e3.getBoundingClientRect();
    if ("if-needed" === c && x2 >= 0 && R >= 0 && I2 <= H2 && C <= b2 && (e3 === m && !n(e3) || x2 >= i2 && I2 <= d2 && R >= h2 && C <= s2)) return L;
    const a2 = getComputedStyle(e3), g2 = parseInt(a2.borderLeftWidth, 10), p2 = parseInt(a2.borderTopWidth, 10), W3 = parseInt(a2.borderRightWidth, 10), T2 = parseInt(a2.borderBottomWidth, 10);
    let B2 = 0, F2 = 0;
    const V3 = "offsetWidth" in e3 ? e3.offsetWidth - e3.clientWidth - g2 - W3 : 0, S = "offsetHeight" in e3 ? e3.offsetHeight - e3.clientHeight - p2 - T2 : 0, X = "offsetWidth" in e3 ? 0 === e3.offsetWidth ? 0 : r3 / e3.offsetWidth : 0, Y = "offsetHeight" in e3 ? 0 === e3.offsetHeight ? 0 : l2 / e3.offsetHeight : 0;
    if (m === e3) B2 = "start" === f ? k : "end" === f ? k - H2 : "nearest" === f ? o$1(M2, M2 + H2, H2, p2, T2, M2 + k, M2 + k + v, v) : k - H2 / 2, F2 = "start" === u ? D : "center" === u ? D - b2 / 2 : "end" === u ? D - b2 : o$1(y, y + b2, b2, g2, W3, y + D, y + D + E2, E2), B2 = Math.max(0, B2 + M2), F2 = Math.max(0, F2 + y);
    else {
      B2 = "start" === f ? k - i2 - p2 : "end" === f ? k - d2 + T2 + S : "nearest" === f ? o$1(i2, d2, l2, p2, T2 + S, k, k + v, v) : k - (i2 + l2 / 2) + S / 2, F2 = "start" === u ? D - h2 - g2 : "center" === u ? D - (h2 + r3 / 2) + V3 / 2 : "end" === u ? D - s2 + W3 + V3 : o$1(h2, s2, r3, g2, W3 + V3, D, D + E2, E2);
      const { scrollLeft: t3, scrollTop: n2 } = e3;
      B2 = 0 === Y ? 0 : Math.max(0, Math.min(n2 + B2 / Y, e3.scrollHeight - l2 / Y + S)), F2 = 0 === X ? 0 : Math.max(0, Math.min(t3 + F2 / X, e3.scrollWidth - r3 / X + V3)), k += n2 - B2, D += t3 - F2;
    }
    L.push({ el: e3, top: B2, left: F2 });
  }
  return L;
};
const o = (t2) => false === t2 ? { block: "end", inline: "nearest" } : ((t3) => t3 === Object(t3) && 0 !== Object.keys(t3).length)(t2) ? t2 : { block: "start", inline: "nearest" };
function e(e2, r$12) {
  if (!e2.isConnected || !((t2) => {
    let o2 = t2;
    for (; o2 && o2.parentNode; ) {
      if (o2.parentNode === document) return true;
      o2 = o2.parentNode instanceof ShadowRoot ? o2.parentNode.host : o2.parentNode;
    }
    return false;
  })(e2)) return;
  const n2 = ((t2) => {
    const o2 = window.getComputedStyle(t2);
    return { top: parseFloat(o2.scrollMarginTop) || 0, right: parseFloat(o2.scrollMarginRight) || 0, bottom: parseFloat(o2.scrollMarginBottom) || 0, left: parseFloat(o2.scrollMarginLeft) || 0 };
  })(e2);
  if (((t2) => "object" == typeof t2 && "function" == typeof t2.behavior)(r$12)) return r$12.behavior(r(e2, r$12));
  const l2 = "boolean" == typeof r$12 || null == r$12 ? void 0 : r$12.behavior;
  for (const { el: a, top: i, left: s } of r(e2, o(r$12))) {
    const t2 = i - n2.top + n2.bottom, o2 = s - n2.left + n2.right;
    a.scroll({ top: t2, left: o2, behavior: l2 });
  }
}
function mergeRefs$1(...refs) {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref !== null) {
        ref.current = value;
      }
    });
  };
}
var ActiveAnchorContext = createContext$1([]);
var ScrollContext = createContext$1({
  current: null
});
function useActiveAnchors() {
  return useContext(ActiveAnchorContext);
}
var TOCItem = forwardRef(
  ({ onActiveChange, ...props }, ref) => {
    const containerRef = useContext(ScrollContext);
    const anchors = useActiveAnchors();
    const anchorRef = useRef(null);
    const mergedRef = mergeRefs$1(anchorRef, ref);
    const isActive2 = anchors.includes(props.href.slice(1));
    useOnChange(isActive2, (v) => {
      const element = anchorRef.current;
      if (!element) return;
      if (v && containerRef.current) {
        e(element, {
          behavior: "smooth",
          block: "center",
          inline: "center",
          scrollMode: "always",
          boundary: containerRef.current
        });
      }
      onActiveChange?.(v);
    });
    return /* @__PURE__ */ jsx("a", { ref: mergedRef, "data-active": isActive2, ...props, children: props.children });
  }
);
TOCItem.displayName = "TOCItem";
function mergeRefs(...refs) {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref) {
        ref.current = value;
      }
    });
  };
}
createContext$1([]);
createContext("TocPopoverContext");
const DocsBody = forwardRef((props, ref) => jsx("div", { ref, ...props, className: twMerge("prose flex-1", props.className), children: props.children }));
DocsBody.displayName = "DocsBody";
const DocsDescription = forwardRef((props, ref) => {
  if (props.children === void 0)
    return null;
  return jsx("p", { ref, ...props, className: twMerge("mb-8 text-lg text-fd-muted-foreground", props.className), children: props.children });
});
DocsDescription.displayName = "DocsDescription";
const DocsTitle = forwardRef((props, ref) => {
  return jsx("h1", { ref, ...props, className: twMerge("text-[1.75em] font-semibold", props.className), children: props.children });
});
DocsTitle.displayName = "DocsTitle";
function Cards(props) {
  return jsx("div", { ...props, className: twMerge("grid grid-cols-2 gap-3 @container", props.className), children: props.children });
}
function Card({ icon, title, description, ...props }) {
  const E2 = props.href ? Link2 : "div";
  return jsxs(E2, { ...props, "data-card": true, className: twMerge("block rounded-xl border bg-fd-card p-4 text-fd-card-foreground transition-colors @max-lg:col-span-full", props.href && "hover:bg-fd-accent/80", props.className), children: [icon ? jsx("div", { className: "not-prose mb-2 w-fit shadow-md rounded-lg border bg-fd-muted p-1.5 text-fd-muted-foreground [&_svg]:size-4", children: icon }) : null, jsx("h3", { className: "not-prose mb-1 text-sm font-medium", children: title }), description ? jsx("p", { className: "!my-0 text-sm text-fd-muted-foreground", children: description }) : null, jsx("div", { className: "text-sm text-fd-muted-foreground prose-no-margin empty:hidden", children: props.children })] });
}
const iconClass = "size-5 -me-0.5 fill-(--callout-color) text-fd-card";
const Callout = forwardRef(({ className, children, title, type = "info", icon, ...props }, ref) => {
  if (type === "warn")
    type = "warning";
  if (type === "tip")
    type = "info";
  return jsxs("div", { ref, className: twMerge("flex gap-2 my-4 rounded-xl border bg-fd-card p-3 ps-1 text-sm text-fd-card-foreground shadow-md", className), ...props, style: {
    "--callout-color": `var(--color-fd-${type}, var(--color-fd-muted))`,
    ...props.style
  }, children: [jsx("div", { role: "none", className: "w-0.5 bg-(--callout-color)/50 rounded-sm" }), icon ?? {
    info: jsx(Info, { className: iconClass }),
    warning: jsx(TriangleAlert, { className: iconClass }),
    error: jsx(CircleX, { className: iconClass }),
    success: jsx(CircleCheck, { className: iconClass })
  }[type], jsxs("div", { className: "flex flex-col gap-2 min-w-0 flex-1", children: [title && jsx("p", { className: "font-medium !my-0", children: title }), jsx("div", { className: "text-fd-muted-foreground prose-no-margin empty:hidden", children })] })] });
});
Callout.displayName = "Callout";
function Heading({ as, className, ...props }) {
  const As = as ?? "h1";
  if (!props.id)
    return jsx(As, { className, ...props });
  return jsxs(As, { className: twMerge("flex scroll-m-28 flex-row items-center gap-2", className), ...props, children: [jsx("a", { "data-card": "", href: `#${props.id}`, className: "peer", children: props.children }), jsx(Link$1, { "aria-label": "Link to section", className: "size-3.5 shrink-0 text-fd-muted-foreground opacity-0 transition-opacity peer-hover:opacity-100" })] });
}
function useCopyButton(onCopy) {
  const [checked, setChecked] = useState(false);
  const callbackRef = useRef(onCopy);
  const timeoutRef = useRef(null);
  callbackRef.current = onCopy;
  const onClick = useCallback(() => {
    if (timeoutRef.current)
      window.clearTimeout(timeoutRef.current);
    const res = Promise.resolve(callbackRef.current());
    void res.then(() => {
      setChecked(true);
      timeoutRef.current = window.setTimeout(() => {
        setChecked(false);
      }, 1500);
    });
  }, []);
  useEffect(() => {
    return () => {
      if (timeoutRef.current)
        window.clearTimeout(timeoutRef.current);
    };
  }, []);
  return [checked, onClick];
}
function createCollection(name) {
  const PROVIDER_NAME = name + "CollectionProvider";
  const [createCollectionContext, createCollectionScope2] = createContextScope(PROVIDER_NAME);
  const [CollectionProviderImpl, useCollectionContext] = createCollectionContext(
    PROVIDER_NAME,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  );
  const CollectionProvider = (props) => {
    const { scope, children } = props;
    const ref = React__default.useRef(null);
    const itemMap = React__default.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ jsx(CollectionProviderImpl, { scope, itemMap, collectionRef: ref, children });
  };
  CollectionProvider.displayName = PROVIDER_NAME;
  const COLLECTION_SLOT_NAME = name + "CollectionSlot";
  const CollectionSlotImpl = /* @__PURE__ */ createSlot(COLLECTION_SLOT_NAME);
  const CollectionSlot = React__default.forwardRef(
    (props, forwardedRef) => {
      const { scope, children } = props;
      const context = useCollectionContext(COLLECTION_SLOT_NAME, scope);
      const composedRefs = useComposedRefs(forwardedRef, context.collectionRef);
      return /* @__PURE__ */ jsx(CollectionSlotImpl, { ref: composedRefs, children });
    }
  );
  CollectionSlot.displayName = COLLECTION_SLOT_NAME;
  const ITEM_SLOT_NAME = name + "CollectionItemSlot";
  const ITEM_DATA_ATTR = "data-radix-collection-item";
  const CollectionItemSlotImpl = /* @__PURE__ */ createSlot(ITEM_SLOT_NAME);
  const CollectionItemSlot = React__default.forwardRef(
    (props, forwardedRef) => {
      const { scope, children, ...itemData } = props;
      const ref = React__default.useRef(null);
      const composedRefs = useComposedRefs(forwardedRef, ref);
      const context = useCollectionContext(ITEM_SLOT_NAME, scope);
      React__default.useEffect(() => {
        context.itemMap.set(ref, { ref, ...itemData });
        return () => void context.itemMap.delete(ref);
      });
      return /* @__PURE__ */ jsx(CollectionItemSlotImpl, { ...{ [ITEM_DATA_ATTR]: "" }, ref: composedRefs, children });
    }
  );
  CollectionItemSlot.displayName = ITEM_SLOT_NAME;
  function useCollection2(scope) {
    const context = useCollectionContext(name + "CollectionConsumer", scope);
    const getItems = React__default.useCallback(() => {
      const collectionNode = context.collectionRef.current;
      if (!collectionNode) return [];
      const orderedNodes = Array.from(collectionNode.querySelectorAll(`[${ITEM_DATA_ATTR}]`));
      const items = Array.from(context.itemMap.values());
      const orderedItems = items.sort(
        (a, b2) => orderedNodes.indexOf(a.ref.current) - orderedNodes.indexOf(b2.ref.current)
      );
      return orderedItems;
    }, [context.collectionRef, context.itemMap]);
    return getItems;
  }
  return [
    { Provider: CollectionProvider, Slot: CollectionSlot, ItemSlot: CollectionItemSlot },
    useCollection2,
    createCollectionScope2
  ];
}
function useCallbackRef$1(callback) {
  const callbackRef = React.useRef(callback);
  React.useEffect(() => {
    callbackRef.current = callback;
  });
  return React.useMemo(() => (...args) => callbackRef.current?.(...args), []);
}
var ENTRY_FOCUS = "rovingFocusGroup.onEntryFocus";
var EVENT_OPTIONS$1 = { bubbles: false, cancelable: true };
var GROUP_NAME = "RovingFocusGroup";
var [Collection$1, useCollection$1, createCollectionScope$1] = createCollection(GROUP_NAME);
var [createRovingFocusGroupContext, createRovingFocusGroupScope] = createContextScope(
  GROUP_NAME,
  [createCollectionScope$1]
);
var [RovingFocusProvider, useRovingFocusContext] = createRovingFocusGroupContext(GROUP_NAME);
var RovingFocusGroup = React.forwardRef(
  (props, forwardedRef) => {
    return /* @__PURE__ */ jsx(Collection$1.Provider, { scope: props.__scopeRovingFocusGroup, children: /* @__PURE__ */ jsx(Collection$1.Slot, { scope: props.__scopeRovingFocusGroup, children: /* @__PURE__ */ jsx(RovingFocusGroupImpl, { ...props, ref: forwardedRef }) }) });
  }
);
RovingFocusGroup.displayName = GROUP_NAME;
var RovingFocusGroupImpl = React.forwardRef((props, forwardedRef) => {
  const {
    __scopeRovingFocusGroup,
    orientation,
    loop = false,
    dir,
    currentTabStopId: currentTabStopIdProp,
    defaultCurrentTabStopId,
    onCurrentTabStopIdChange,
    onEntryFocus,
    preventScrollOnEntryFocus = false,
    ...groupProps
  } = props;
  const ref = React.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  const direction = useDirection(dir);
  const [currentTabStopId, setCurrentTabStopId] = useControllableState({
    prop: currentTabStopIdProp,
    defaultProp: defaultCurrentTabStopId ?? null,
    onChange: onCurrentTabStopIdChange,
    caller: GROUP_NAME
  });
  const [isTabbingBackOut, setIsTabbingBackOut] = React.useState(false);
  const handleEntryFocus = useCallbackRef$1(onEntryFocus);
  const getItems = useCollection$1(__scopeRovingFocusGroup);
  const isClickFocusRef = React.useRef(false);
  const [focusableItemsCount, setFocusableItemsCount] = React.useState(0);
  React.useEffect(() => {
    const node = ref.current;
    if (node) {
      node.addEventListener(ENTRY_FOCUS, handleEntryFocus);
      return () => node.removeEventListener(ENTRY_FOCUS, handleEntryFocus);
    }
  }, [handleEntryFocus]);
  return /* @__PURE__ */ jsx(
    RovingFocusProvider,
    {
      scope: __scopeRovingFocusGroup,
      orientation,
      dir: direction,
      loop,
      currentTabStopId,
      onItemFocus: React.useCallback(
        (tabStopId) => setCurrentTabStopId(tabStopId),
        [setCurrentTabStopId]
      ),
      onItemShiftTab: React.useCallback(() => setIsTabbingBackOut(true), []),
      onFocusableItemAdd: React.useCallback(
        () => setFocusableItemsCount((prevCount) => prevCount + 1),
        []
      ),
      onFocusableItemRemove: React.useCallback(
        () => setFocusableItemsCount((prevCount) => prevCount - 1),
        []
      ),
      children: /* @__PURE__ */ jsx(
        Primitive.div,
        {
          tabIndex: isTabbingBackOut || focusableItemsCount === 0 ? -1 : 0,
          "data-orientation": orientation,
          ...groupProps,
          ref: composedRefs,
          style: { outline: "none", ...props.style },
          onMouseDown: composeEventHandlers(props.onMouseDown, () => {
            isClickFocusRef.current = true;
          }),
          onFocus: composeEventHandlers(props.onFocus, (event) => {
            const isKeyboardFocus = !isClickFocusRef.current;
            if (event.target === event.currentTarget && isKeyboardFocus && !isTabbingBackOut) {
              const entryFocusEvent = new CustomEvent(ENTRY_FOCUS, EVENT_OPTIONS$1);
              event.currentTarget.dispatchEvent(entryFocusEvent);
              if (!entryFocusEvent.defaultPrevented) {
                const items = getItems().filter((item) => item.focusable);
                const activeItem = items.find((item) => item.active);
                const currentItem = items.find((item) => item.id === currentTabStopId);
                const candidateItems = [activeItem, currentItem, ...items].filter(
                  Boolean
                );
                const candidateNodes = candidateItems.map((item) => item.ref.current);
                focusFirst$2(candidateNodes, preventScrollOnEntryFocus);
              }
            }
            isClickFocusRef.current = false;
          }),
          onBlur: composeEventHandlers(props.onBlur, () => setIsTabbingBackOut(false))
        }
      )
    }
  );
});
var ITEM_NAME$1 = "RovingFocusGroupItem";
var RovingFocusGroupItem = React.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeRovingFocusGroup,
      focusable = true,
      active = false,
      tabStopId,
      children,
      ...itemProps
    } = props;
    const autoId = useId();
    const id = tabStopId || autoId;
    const context = useRovingFocusContext(ITEM_NAME$1, __scopeRovingFocusGroup);
    const isCurrentTabStop = context.currentTabStopId === id;
    const getItems = useCollection$1(__scopeRovingFocusGroup);
    const { onFocusableItemAdd, onFocusableItemRemove, currentTabStopId } = context;
    React.useEffect(() => {
      if (focusable) {
        onFocusableItemAdd();
        return () => onFocusableItemRemove();
      }
    }, [focusable, onFocusableItemAdd, onFocusableItemRemove]);
    return /* @__PURE__ */ jsx(
      Collection$1.ItemSlot,
      {
        scope: __scopeRovingFocusGroup,
        id,
        focusable,
        active,
        children: /* @__PURE__ */ jsx(
          Primitive.span,
          {
            tabIndex: isCurrentTabStop ? 0 : -1,
            "data-orientation": context.orientation,
            ...itemProps,
            ref: forwardedRef,
            onMouseDown: composeEventHandlers(props.onMouseDown, (event) => {
              if (!focusable) event.preventDefault();
              else context.onItemFocus(id);
            }),
            onFocus: composeEventHandlers(props.onFocus, () => context.onItemFocus(id)),
            onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
              if (event.key === "Tab" && event.shiftKey) {
                context.onItemShiftTab();
                return;
              }
              if (event.target !== event.currentTarget) return;
              const focusIntent = getFocusIntent(event, context.orientation, context.dir);
              if (focusIntent !== void 0) {
                if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
                event.preventDefault();
                const items = getItems().filter((item) => item.focusable);
                let candidateNodes = items.map((item) => item.ref.current);
                if (focusIntent === "last") candidateNodes.reverse();
                else if (focusIntent === "prev" || focusIntent === "next") {
                  if (focusIntent === "prev") candidateNodes.reverse();
                  const currentIndex = candidateNodes.indexOf(event.currentTarget);
                  candidateNodes = context.loop ? wrapArray(candidateNodes, currentIndex + 1) : candidateNodes.slice(currentIndex + 1);
                }
                setTimeout(() => focusFirst$2(candidateNodes));
              }
            }),
            children: typeof children === "function" ? children({ isCurrentTabStop, hasTabStop: currentTabStopId != null }) : children
          }
        )
      }
    );
  }
);
RovingFocusGroupItem.displayName = ITEM_NAME$1;
var MAP_KEY_TO_FOCUS_INTENT = {
  ArrowLeft: "prev",
  ArrowUp: "prev",
  ArrowRight: "next",
  ArrowDown: "next",
  PageUp: "first",
  Home: "first",
  PageDown: "last",
  End: "last"
};
function getDirectionAwareKey(key, dir) {
  if (dir !== "rtl") return key;
  return key === "ArrowLeft" ? "ArrowRight" : key === "ArrowRight" ? "ArrowLeft" : key;
}
function getFocusIntent(event, orientation, dir) {
  const key = getDirectionAwareKey(event.key, dir);
  if (orientation === "vertical" && ["ArrowLeft", "ArrowRight"].includes(key)) return void 0;
  if (orientation === "horizontal" && ["ArrowUp", "ArrowDown"].includes(key)) return void 0;
  return MAP_KEY_TO_FOCUS_INTENT[key];
}
function focusFirst$2(candidates, preventScroll = false) {
  const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
  for (const candidate of candidates) {
    if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
    candidate.focus({ preventScroll });
    if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
  }
}
function wrapArray(array, startIndex) {
  return array.map((_2, index2) => array[(startIndex + index2) % array.length]);
}
var Root$2 = RovingFocusGroup;
var Item = RovingFocusGroupItem;
var TABS_NAME = "Tabs";
var [createTabsContext] = createContextScope(TABS_NAME, [
  createRovingFocusGroupScope
]);
var useRovingFocusGroupScope = createRovingFocusGroupScope();
var [TabsProvider, useTabsContext] = createTabsContext(TABS_NAME);
var Tabs$1 = React.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeTabs,
      value: valueProp,
      onValueChange,
      defaultValue,
      orientation = "horizontal",
      dir,
      activationMode = "automatic",
      ...tabsProps
    } = props;
    const direction = useDirection(dir);
    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onValueChange,
      defaultProp: defaultValue ?? "",
      caller: TABS_NAME
    });
    return /* @__PURE__ */ jsx(
      TabsProvider,
      {
        scope: __scopeTabs,
        baseId: useId(),
        value,
        onValueChange: setValue,
        orientation,
        dir: direction,
        activationMode,
        children: /* @__PURE__ */ jsx(
          Primitive.div,
          {
            dir: direction,
            "data-orientation": orientation,
            ...tabsProps,
            ref: forwardedRef
          }
        )
      }
    );
  }
);
Tabs$1.displayName = TABS_NAME;
var TAB_LIST_NAME = "TabsList";
var TabsList$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTabs, loop = true, ...listProps } = props;
    const context = useTabsContext(TAB_LIST_NAME, __scopeTabs);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeTabs);
    return /* @__PURE__ */ jsx(
      Root$2,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        orientation: context.orientation,
        dir: context.dir,
        loop,
        children: /* @__PURE__ */ jsx(
          Primitive.div,
          {
            role: "tablist",
            "aria-orientation": context.orientation,
            ...listProps,
            ref: forwardedRef
          }
        )
      }
    );
  }
);
TabsList$1.displayName = TAB_LIST_NAME;
var TRIGGER_NAME$2 = "TabsTrigger";
var TabsTrigger$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTabs, value, disabled = false, ...triggerProps } = props;
    const context = useTabsContext(TRIGGER_NAME$2, __scopeTabs);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeTabs);
    const triggerId = makeTriggerId$1(context.baseId, value);
    const contentId = makeContentId$1(context.baseId, value);
    const isSelected = value === context.value;
    return /* @__PURE__ */ jsx(
      Item,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        focusable: !disabled,
        active: isSelected,
        children: /* @__PURE__ */ jsx(
          Primitive.button,
          {
            type: "button",
            role: "tab",
            "aria-selected": isSelected,
            "aria-controls": contentId,
            "data-state": isSelected ? "active" : "inactive",
            "data-disabled": disabled ? "" : void 0,
            disabled,
            id: triggerId,
            ...triggerProps,
            ref: forwardedRef,
            onMouseDown: composeEventHandlers(props.onMouseDown, (event) => {
              if (!disabled && event.button === 0 && event.ctrlKey === false) {
                context.onValueChange(value);
              } else {
                event.preventDefault();
              }
            }),
            onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
              if ([" ", "Enter"].includes(event.key)) context.onValueChange(value);
            }),
            onFocus: composeEventHandlers(props.onFocus, () => {
              const isAutomaticActivation = context.activationMode !== "manual";
              if (!isSelected && !disabled && isAutomaticActivation) {
                context.onValueChange(value);
              }
            })
          }
        )
      }
    );
  }
);
TabsTrigger$1.displayName = TRIGGER_NAME$2;
var CONTENT_NAME$3 = "TabsContent";
var TabsContent$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTabs, value, forceMount, children, ...contentProps } = props;
    const context = useTabsContext(CONTENT_NAME$3, __scopeTabs);
    const triggerId = makeTriggerId$1(context.baseId, value);
    const contentId = makeContentId$1(context.baseId, value);
    const isSelected = value === context.value;
    const isMountAnimationPreventedRef = React.useRef(isSelected);
    React.useEffect(() => {
      const rAF = requestAnimationFrame(() => isMountAnimationPreventedRef.current = false);
      return () => cancelAnimationFrame(rAF);
    }, []);
    return /* @__PURE__ */ jsx(Presence, { present: forceMount || isSelected, children: ({ present }) => /* @__PURE__ */ jsx(
      Primitive.div,
      {
        "data-state": isSelected ? "active" : "inactive",
        "data-orientation": context.orientation,
        role: "tabpanel",
        "aria-labelledby": triggerId,
        hidden: !present,
        id: contentId,
        tabIndex: 0,
        ...contentProps,
        ref: forwardedRef,
        style: {
          ...props.style,
          animationDuration: isMountAnimationPreventedRef.current ? "0s" : void 0
        },
        children: present && children
      }
    ) });
  }
);
TabsContent$1.displayName = CONTENT_NAME$3;
function makeTriggerId$1(baseId, value) {
  return `${baseId}-trigger-${value}`;
}
function makeContentId$1(baseId, value) {
  return `${baseId}-content-${value}`;
}
const listeners = /* @__PURE__ */ new Map();
function addChangeListener(id, listener) {
  const list = listeners.get(id) ?? [];
  list.push(listener);
  listeners.set(id, list);
}
function removeChangeListener(id, listener) {
  const list = listeners.get(id) ?? [];
  listeners.set(id, list.filter((item) => item !== listener));
}
const TabsContext$1 = createContext$1(null);
function useTabContext() {
  const ctx = useContext(TabsContext$1);
  if (!ctx)
    throw new Error("You must wrap your component in <Tabs>");
  return ctx;
}
const TabsList = TabsList$1;
const TabsTrigger = TabsTrigger$1;
function Tabs({ ref, groupId, persist = false, updateAnchor = false, defaultValue, value: _value, onValueChange: _onValueChange, ...props }) {
  const tabsRef = useRef(null);
  const [value, setValue] = _value === void 0 ? (
    // eslint-disable-next-line react-hooks/rules-of-hooks -- not supposed to change controlled/uncontrolled
    useState(defaultValue)
  ) : [_value, _onValueChange ?? (() => void 0)];
  const onChange = useEffectEvent((v) => setValue(v));
  const valueToIdMap = useMemo(() => /* @__PURE__ */ new Map(), []);
  useLayoutEffect(() => {
    if (!groupId)
      return;
    const previous = persist ? localStorage.getItem(groupId) : sessionStorage.getItem(groupId);
    if (previous)
      onChange(previous);
    addChangeListener(groupId, onChange);
    return () => {
      removeChangeListener(groupId, onChange);
    };
  }, [groupId, persist]);
  useLayoutEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash)
      return;
    for (const [value2, id] of valueToIdMap.entries()) {
      if (id === hash) {
        onChange(value2);
        tabsRef.current?.scrollIntoView();
        break;
      }
    }
  }, [valueToIdMap]);
  return jsx(Tabs$1, { ref: mergeRefs(ref, tabsRef), value, onValueChange: (v) => {
    if (updateAnchor) {
      const id = valueToIdMap.get(v);
      if (id) {
        window.history.replaceState(null, "", `#${id}`);
      }
    }
    if (groupId) {
      listeners.get(groupId)?.forEach((item) => {
        item(v);
      });
      if (persist)
        localStorage.setItem(groupId, v);
      else
        sessionStorage.setItem(groupId, v);
    } else {
      setValue(v);
    }
  }, ...props, children: jsx(TabsContext$1.Provider, { value: useMemo(() => ({ valueToIdMap }), [valueToIdMap]), children: props.children }) });
}
function TabsContent({ value, ...props }) {
  const { valueToIdMap } = useTabContext();
  if (props.id) {
    valueToIdMap.set(value, props.id);
  }
  return jsx(TabsContent$1, { value, ...props, children: props.children });
}
const TabsContext = createContext$1(null);
function Pre(props) {
  return jsx("pre", { ...props, className: twMerge("min-w-full w-max *:flex *:flex-col", props.className), children: props.children });
}
function CodeBlock({ ref, title, allowCopy = true, keepBackground = false, icon, viewportProps = {}, children, Actions = (props2) => jsx("div", { ...props2, className: twMerge("empty:hidden", props2.className) }), ...props }) {
  const inTab = useContext(TabsContext) !== null;
  const areaRef = useRef(null);
  return jsxs("figure", { ref, dir: "ltr", ...props, className: twMerge(inTab ? "bg-fd-secondary -mx-px -mb-px last:rounded-b-xl" : "my-4 bg-fd-card rounded-xl", keepBackground && "bg-(--shiki-light-bg) dark:bg-(--shiki-dark-bg)", "shiki relative border shadow-sm outline-none not-prose overflow-hidden text-sm", props.className), children: [title ? jsxs("div", { className: "flex text-fd-muted-foreground items-center gap-2 h-9.5 border-b px-4", children: [typeof icon === "string" ? jsx("div", { className: "[&_svg]:size-3.5", dangerouslySetInnerHTML: {
    __html: icon
  } }) : icon, jsx("figcaption", { className: "flex-1 truncate", children: title }), Actions({
    className: "-me-2",
    children: allowCopy && jsx(CopyButton, { containerRef: areaRef })
  })] }) : Actions({
    className: "absolute top-2 right-2 z-2 backdrop-blur-lg rounded-lg text-fd-muted-foreground",
    children: allowCopy && jsx(CopyButton, { containerRef: areaRef })
  }), jsx("div", { ref: areaRef, ...viewportProps, className: twMerge("text-[13px] py-3.5 overflow-auto max-h-[600px] fd-scroll-container", viewportProps.className), style: {
    // space for toolbar
    "--padding-right": !title ? "calc(var(--spacing) * 8)" : void 0,
    counterSet: props["data-line-numbers"] ? `line ${Number(props["data-line-numbers-start"] ?? 1) - 1}` : void 0,
    ...viewportProps.style
  }, children })] });
}
function CopyButton({ className, containerRef, ...props }) {
  const [checked, onClick] = useCopyButton(() => {
    const pre = containerRef.current?.getElementsByTagName("pre").item(0);
    if (!pre)
      return;
    const clone = pre.cloneNode(true);
    clone.querySelectorAll(".nd-copy-ignore").forEach((node) => {
      node.replaceWith("\n");
    });
    void navigator.clipboard.writeText(clone.textContent ?? "");
  });
  return jsx("button", { type: "button", "data-checked": checked || void 0, className: twMerge(buttonVariants({
    className: "hover:text-fd-accent-foreground data-[checked]:text-fd-accent-foreground",
    size: "icon-xs"
  }), className), "aria-label": checked ? "Copied Text" : "Copy Text", onClick, ...props, children: checked ? jsx(Check, {}) : jsx(Clipboard, {}) });
}
function CodeBlockTabs({ ref, ...props }) {
  const containerRef = useRef(null);
  const nested = useContext(TabsContext) !== null;
  return jsx(Tabs, { ref: mergeRefs(containerRef, ref), ...props, className: twMerge("bg-fd-card rounded-xl border", !nested && "my-4", props.className), children: jsx(TabsContext.Provider, { value: useMemo(() => ({
    containerRef,
    nested
  }), [nested]), children: props.children }) });
}
function CodeBlockTabsList(props) {
  return jsx(TabsList, { ...props, className: twMerge("flex flex-row px-2 overflow-x-auto text-fd-muted-foreground", props.className), children: props.children });
}
function CodeBlockTabsTrigger({ children, ...props }) {
  return jsxs(TabsTrigger, { ...props, className: twMerge("relative group inline-flex text-sm font-medium text-nowrap items-center transition-colors gap-2 px-2 py-1.5 hover:text-fd-accent-foreground data-[state=active]:text-fd-primary [&_svg]:size-3.5", props.className), children: [jsx("div", { className: "absolute inset-x-2 bottom-0 h-px group-data-[state=active]:bg-fd-primary" }), children] });
}
function CodeBlockTab(props) {
  return jsx(TabsContent, { ...props });
}
function Image(props) {
  return jsx(Image$1, { sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 900px", ...props, src: props.src, className: twMerge("rounded-lg", props.className) });
}
function Table(props) {
  return jsx("div", { className: "relative overflow-auto prose-no-margin my-6", children: jsx("table", { ...props }) });
}
const defaultMdxComponents = {
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
  pre: (props) => jsx(CodeBlock, { ...props, children: jsx(Pre, { children: props.children }) }),
  Card,
  Cards,
  a: Link2,
  img: Image,
  h1: (props) => jsx(Heading, { as: "h1", ...props }),
  h2: (props) => jsx(Heading, { as: "h2", ...props }),
  h3: (props) => jsx(Heading, { as: "h3", ...props }),
  h4: (props) => jsx(Heading, { as: "h4", ...props }),
  h5: (props) => jsx(Heading, { as: "h5", ...props }),
  h6: (props) => jsx(Heading, { as: "h6", ...props }),
  table: Table,
  Callout
};
function RunSkillCallout({ command }) {
  const slashCommand = command.startsWith("/") ? command : `/${command}`;
  return /* @__PURE__ */ jsxs("div", { className: "my-6 overflow-hidden rounded-lg border border-fd-border bg-fd-card", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 border-b border-fd-border px-4 py-2", children: [
      /* @__PURE__ */ jsx("span", { className: "size-2 rounded-full bg-fd-muted-foreground/30" }),
      /* @__PURE__ */ jsx("span", { className: "size-2 rounded-full bg-fd-muted-foreground/30" }),
      /* @__PURE__ */ jsx("span", { className: "size-2 rounded-full bg-fd-muted-foreground/30" }),
      /* @__PURE__ */ jsx("span", { className: "ml-2 text-xs font-medium text-fd-muted-foreground", children: "Run this skill in your agent" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-4", children: [
      /* @__PURE__ */ jsx("span", { className: "font-mono text-sm text-fd-muted-foreground", children: ">" }),
      /* @__PURE__ */ jsx("code", { className: "font-mono text-base font-semibold text-fd-foreground", children: slashCommand })
    ] })
  ] });
}
const mdxComponents = {
  ...defaultMdxComponents,
  RunSkillCallout
};
function ContentPost({
  backLabel,
  backTo,
  title,
  description,
  Content: Content3
}) {
  return /* @__PURE__ */ jsxs("article", { className: "mx-auto w-full min-w-0 max-w-3xl px-6 py-12 text-fd-foreground md:py-24", children: [
    /* @__PURE__ */ jsxs("header", { className: "mb-8", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxs(
        Link$3,
        {
          to: backTo,
          className: "inline-flex items-center gap-2 text-sm font-medium text-fd-muted-foreground transition-colors hover:text-fd-primary",
          children: [
            /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "←" }),
            /* @__PURE__ */ jsx("span", { children: backLabel })
          ]
        }
      ) }),
      /* @__PURE__ */ jsx("h1", { className: "mb-4 break-words text-4xl font-bold text-fd-foreground md:text-5xl", children: title }),
      description ? /* @__PURE__ */ jsx("p", { className: "max-w-2xl text-lg leading-8 text-fd-muted-foreground md:text-xl", children: description }) : null
    ] }),
    /* @__PURE__ */ jsx(Suspense, { children: /* @__PURE__ */ jsx(DocsBody, { className: "min-w-0 text-fd-foreground [&_figure]:max-w-full [&_h2]:text-fd-foreground [&_h3]:text-fd-foreground [&_li]:text-fd-foreground/90 [&_p]:text-fd-foreground/90 [&_pre]:!min-w-0 [&_pre]:!w-full [&_strong]:text-fd-foreground", children: /* @__PURE__ */ jsx(Content3, {}) }) })
  ] });
}
const clientMdxLoader$1 = createClientLoader(docs, {
  id: "docs",
  component({
    default: MDX
  }) {
    return /* @__PURE__ */ jsx(MDX, { components: mdxComponents });
  }
});
const $$splitComponentImporter$t = () => import("./_-Bl6MA2oQ.js");
const Route$w = createFileRoute("/docs/$")({
  loader: async ({
    params
  }) => {
    const slugs = params._splat?.split("/") ?? [];
    const page2 = await getDocsPost({
      data: slugs
    });
    await clientMdxLoader$1.preload(page2.path);
    return {
      ...page2,
      pageTree: await getDocsPageTree()
    };
  },
  head: ({
    loaderData
  }) => {
    const data = loaderData;
    return buildPageSeo({
      title: data?.title ?? "SeoTool.im Docs",
      description: data?.description,
      path: data?.url ?? "/docs",
      titleSuffix: "SeoTool.im"
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$t, "component")
});
const clientMdxLoader = createClientLoader(blog, {
  id: "blog",
  component({
    default: MDX
  }) {
    return /* @__PURE__ */ jsx(DocsBody, { className: "text-neutral-800 [&_a]:!text-neutral-950 [&_a]:underline [&_a]:decoration-[var(--color-brand-accent)] [&_a]:underline-offset-4 [&_h2]:text-neutral-950 [&_h2_a]:!no-underline [&_h3]:text-neutral-950 [&_h3_a]:!no-underline [&_li]:text-neutral-700 [&_p]:text-neutral-700 [&_strong]:text-neutral-950", children: /* @__PURE__ */ jsx(MDX, { components: {
      ...defaultMdxComponents,
      table: BlogTable,
      th: BlogTableHeader,
      td: BlogTableCell
    } }) });
  }
});
function BlogTable(props) {
  return /* @__PURE__ */ jsx("div", { className: "not-prose my-8 w-full max-w-full overflow-x-auto rounded-xl border border-[var(--color-border-subtle)] bg-white", children: /* @__PURE__ */ jsx("table", { ...props, className: "w-full min-w-[720px] border-collapse text-left text-sm" }) });
}
function BlogTableHeader(props) {
  return /* @__PURE__ */ jsx("th", { ...props, className: "border-b border-r border-neutral-200 bg-neutral-950 px-4 py-3 text-left text-sm font-semibold text-white last:border-r-0" });
}
function BlogTableCell(props) {
  return /* @__PURE__ */ jsx("td", { ...props, className: "border-b border-r border-neutral-200 px-4 py-3 align-top text-sm leading-6 text-neutral-700 last:border-r-0 [&_a]:font-medium [&_a]:!text-neutral-950" });
}
const $$splitComponentImporter$s = () => import("./_-BnpLAH-d.js");
const Route$v = createFileRoute("/blogs/$")({
  loader: async ({
    params
  }) => {
    const slugs = params._splat?.split("/") ?? [];
    const data = await getBlogPost({
      data: slugs
    });
    await clientMdxLoader.preload(data.path);
    return data;
  },
  head: ({
    loaderData
  }) => {
    const data = loaderData;
    const title = data?.title ?? "SeoTool.im Blog";
    const description = data?.description;
    return buildPageSeo({
      title,
      description,
      path: data?.url ?? "/blogs",
      titleSuffix: "SeoTool.im Blog",
      ogType: "article"
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$s, "component")
});
const subscribeSchema = z$1.object({
  email: z$1.string().email("Please enter a valid email address")
});
const Route$u = createFileRoute("/api/subscribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json();
        const parsed = subscribeSchema.safeParse(body);
        if (!parsed.success) {
          return new Response(
            JSON.stringify({ error: parsed.error.issues[0]?.message }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
        const loopsApiKey = process.env.LOOPS_API_KEY;
        if (!loopsApiKey) {
          console.error("Missing LOOPS_API_KEY");
          return new Response(
            JSON.stringify({ error: "Service temporarily unavailable" }),
            { status: 503, headers: { "Content-Type": "application/json" } }
          );
        }
        try {
          const loopsResponse = await fetch(
            "https://app.loops.so/api/v1/contacts/create",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${loopsApiKey}`
              },
              body: JSON.stringify({
                email: parsed.data.email,
                source: "seotool-waitlist"
              })
            }
          );
          if (loopsResponse.status === 409) {
            return new Response(JSON.stringify({ success: true }), {
              status: 200,
              headers: { "Content-Type": "application/json" }
            });
          }
          if (!loopsResponse.ok) {
            const loopsError = await loopsResponse.json().catch(() => null);
            console.error("Loops contact creation error:", loopsError);
            return new Response(
              JSON.stringify({
                error: "Failed to subscribe. Please try again."
              }),
              {
                status: 500,
                headers: { "Content-Type": "application/json" }
              }
            );
          }
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        } catch (err) {
          console.error("Subscribe endpoint error:", err);
          return new Response(
            JSON.stringify({
              error: "Failed to subscribe. Please try again."
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      }
    }
  }
});
const PLAUSIBLE_EVENT_URL = "https://plausible.io/api/event";
const Route$t = createFileRoute("/api/event")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const proxyRequest = new Request(PLAUSIBLE_EVENT_URL, request);
        proxyRequest.headers.delete("cookie");
        const upstreamResponse = await fetch(proxyRequest);
        return new Response(upstreamResponse.body, {
          status: upstreamResponse.status,
          headers: upstreamResponse.headers
        });
      }
    }
  }
});
const DFS_BASE_URL = "https://api.dataforseo.com/v3";
const REQUEST_TIMEOUT_MS = 15e3;
const CHATGPT_LOCATION_CODE = 2840;
const CHATGPT_LANGUAGE_CODE = "en";
class DfsConfigError extends Error {
  constructor() {
    super("DATAFORSEO_API_KEY is not configured");
    this.name = "DfsConfigError";
  }
}
class DfsUpstreamError extends Error {
  constructor(message) {
    super(message);
    this.name = "DfsUpstreamError";
  }
}
function getDfsApiKey() {
  const key = process.env.DATAFORSEO_API_KEY;
  return key && key.trim().length > 0 ? key.trim() : void 0;
}
async function fetchChatGptMentions(domain) {
  const apiKey = getDfsApiKey();
  if (!apiKey) {
    throw new DfsConfigError();
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(
      `${DFS_BASE_URL}/ai_optimization/llm_mentions/aggregated_metrics/live`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${apiKey}`
        },
        body: JSON.stringify([
          {
            target: [{ type: "domain", domain }],
            platform: "chat_gpt",
            location_code: CHATGPT_LOCATION_CODE,
            language_code: CHATGPT_LANGUAGE_CODE,
            internal_list_limit: 10
          }
        ]),
        signal: controller.signal
      }
    );
    if (!response.ok) {
      throw new DfsUpstreamError(
        `DataForSEO responded with HTTP ${response.status}`
      );
    }
    const payload = await response.json();
    const task = payload.tasks?.[0];
    if (payload.status_code !== 2e4 || task?.status_code !== 2e4 || !task.result?.length) {
      throw new DfsUpstreamError(
        task?.status_message ?? "DataForSEO returned no result"
      );
    }
    const chatGptRow = (task.result[0]?.total?.platform ?? []).find(
      (row) => row.key === "chat_gpt"
    );
    return {
      mentions: chatGptRow?.mentions ?? 0,
      aiSearchVolume: chatGptRow?.ai_search_volume ?? 0
    };
  } catch (error) {
    if (error instanceof DfsUpstreamError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new DfsUpstreamError("The visibility check timed out");
    }
    throw new DfsUpstreamError("Could not reach the visibility data source");
  } finally {
    clearTimeout(timeout);
  }
}
const checkSchema = z$1.object({
  domain: z$1.string().trim().min(1).max(253)
});
const CACHE_TTL_MS = 24 * 60 * 60 * 1e3;
const CACHE_MAX_ENTRIES = 2e3;
const RATE_WINDOW_MS = 15 * 60 * 1e3;
const RATE_MAX_CHECKS = 5;
const RATE_MAX_TRACKED_IPS = 5e3;
const visibilityCache = /* @__PURE__ */ new Map();
const rateHits = /* @__PURE__ */ new Map();
function json(body, status, extraHeaders) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders }
  });
}
function normalizeDomain(raw) {
  let value = raw.trim().toLowerCase();
  value = value.replace(/^https?:\/\//, "");
  value = value.split("/")[0].split("?")[0].split("#")[0];
  value = value.replace(/\/+$/, "");
  value = value.replace(/\s+/g, "");
  if (value.startsWith("www.")) value = value.slice(4);
  if (value.includes("@") || value.includes(":")) return null;
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(value)) return null;
  if (value.includes("..")) return null;
  const labels = value.split(".");
  if (labels.some((label) => label.startsWith("-") || label.endsWith("-"))) {
    return null;
  }
  if (labels[labels.length - 1].length < 2) return null;
  return value;
}
function clientIp(request) {
  return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
function takeRateSlot(ip) {
  const now = Date.now();
  const windowStart = now - RATE_WINDOW_MS;
  const timestamps = (rateHits.get(ip) ?? []).filter((t2) => t2 > windowStart);
  if (timestamps.length >= RATE_MAX_CHECKS) {
    rateHits.set(ip, timestamps);
    return false;
  }
  timestamps.push(now);
  rateHits.set(ip, timestamps);
  if (rateHits.size > RATE_MAX_TRACKED_IPS) {
    for (const [key, hits] of rateHits) {
      if (hits.every((t2) => t2 <= windowStart)) rateHits.delete(key);
    }
  }
  return true;
}
function pruneCache() {
  if (visibilityCache.size <= CACHE_MAX_ENTRIES) return;
  const now = Date.now();
  for (const [key, entry] of visibilityCache) {
    if (entry.expires <= now) visibilityCache.delete(key);
  }
}
const Route$s = createFileRoute("/api/ai-visibility")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body;
        try {
          body = await request.json();
        } catch {
          return json(
            { ok: false, code: "invalid", error: "Invalid request body" },
            400
          );
        }
        const parsed = checkSchema.safeParse(body);
        if (!parsed.success) {
          return json(
            {
              ok: false,
              code: "invalid",
              error: "Enter a domain like yourdomain.com"
            },
            400
          );
        }
        const domain = normalizeDomain(parsed.data.domain);
        if (!domain) {
          return json(
            {
              ok: false,
              code: "invalid",
              error: "Enter a valid domain like yourdomain.com"
            },
            400
          );
        }
        if (!takeRateSlot(clientIp(request))) {
          return json(
            {
              ok: false,
              code: "rate_limited",
              error: "Too many checks. Try again in a few minutes."
            },
            429,
            { "Retry-After": "300" }
          );
        }
        const cached = visibilityCache.get(domain);
        if (cached && cached.expires > Date.now()) {
          return json({ ...JSON.parse(cached.body), cached: true }, 200);
        }
        try {
          const metrics = await fetchChatGptMentions(domain);
          const result = {
            ok: true,
            cached: false,
            domain,
            platform: "chat_gpt",
            mentions: metrics.mentions,
            aiSearchVolume: metrics.aiSearchVolume,
            checkedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          visibilityCache.set(domain, {
            body: JSON.stringify(result),
            expires: Date.now() + CACHE_TTL_MS
          });
          pruneCache();
          return json(result, 200);
        } catch (error) {
          if (error instanceof DfsConfigError) {
            return json(
              {
                ok: false,
                code: "unavailable",
                error: "The checker is temporarily unavailable. Create a free account to run a full AI visibility report."
              },
              503
            );
          }
          const message = error instanceof DfsUpstreamError ? error.message : "The visibility check failed. Please try again.";
          return json({ ok: false, code: "unavailable", error: message }, 502);
        }
      }
    }
  }
});
const $$splitComponentImporter$r = () => import("./pricing-B1dgW-1-.js");
const Route$r = createFileRoute("/_marketing/pricing")({
  head: () => buildPageSeo({
    title: "Pricing",
    description: "Start free. Upgrade as you grow. Four tiers with per-feature quotas for keyword research, rank tracking, site audits, backlinks, and AI agents.",
    path: "/pricing",
    titleSuffix: "SeoTool.im"
  }),
  component: lazyRouteComponent($$splitComponentImporter$r, "component")
});
let frontmatter$7 = {
  "title": "The Future of SEO Software Is Open Source",
  "description": "Open source puts the power into the hands of the users. It forces companies to price their services fairly and act in the best interest of the community."
};
[{
  depth: 2,
  url: "#benefits-of-open-source-seo",
  title: jsx(Fragment, {
    children: "Benefits of open source SEO"
  })
}, {
  depth: 3,
  url: "#self-hosting-benefits",
  title: jsx(Fragment, {
    children: "Self-hosting benefits"
  })
}, {
  depth: 3,
  url: "#why-does-open-source-matter-even-if-youre-using-seotoolims-saas",
  title: jsx(Fragment, {
    children: "Why does open source matter even if you're using SeoTool.im's SaaS?"
  })
}, {
  depth: 4,
  url: "#open-source-products-are-higher-quality",
  title: jsx(Fragment, {
    children: "Open source products are higher quality"
  })
}, {
  depth: 4,
  url: "#open-source-puts-the-user-first",
  title: jsx(Fragment, {
    children: "Open source puts the user first"
  })
}, {
  depth: 5,
  url: "#fair-pricing",
  title: jsx(Fragment, {
    children: "Fair pricing"
  })
}, {
  depth: 5,
  url: "#transparency",
  title: jsx(Fragment, {
    children: "Transparency"
  })
}, {
  depth: 5,
  url: "#community-driven",
  title: jsx(Fragment, {
    children: "Community driven"
  })
}, {
  depth: 2,
  url: "#build-a-custom-seo-tool-on-top-of-seotoolim",
  title: jsx(Fragment, {
    children: "Build a custom SEO tool on top of SeoTool.im"
  })
}, {
  depth: 3,
  url: "#dont-re-invent-the-wheel",
  title: jsx(Fragment, {
    children: "Don't re-invent the wheel"
  })
}, {
  depth: 3,
  url: "#software-engineering-best-practices",
  title: jsx(Fragment, {
    children: "Software engineering best practices"
  })
}, {
  depth: 3,
  url: "#security",
  title: jsx(Fragment, {
    children: "Security"
  })
}, {
  depth: 2,
  url: "#does-open-source-mean-free",
  title: jsx(Fragment, {
    children: "Does open source mean free?"
  })
}, {
  depth: 2,
  url: "#where-does-seotoolim-get-its-data",
  title: jsx(Fragment, {
    children: "Where does SeoTool.im get its data?"
  })
}, {
  depth: 2,
  url: "#can-you-really-replace-your-seo-tool-with-seotoolim",
  title: jsx(Fragment, {
    children: "Can you really replace your SEO tool with SeoTool.im?"
  })
}, {
  depth: 3,
  url: "#for-beginners",
  title: jsx(Fragment, {
    children: "For beginners"
  })
}, {
  depth: 3,
  url: "#for-experts",
  title: jsx(Fragment, {
    children: "For experts"
  })
}, {
  depth: 2,
  url: "#ai-native-more-than-a-replacement-for-other-seo-tools",
  title: jsx(Fragment, {
    children: "AI native: More than a replacement for other SEO tools"
  })
}];
function _createMdxContent$7(props) {
  const _components = {
    a: "a",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    h5: "h5",
    li: "li",
    p: "p",
    ul: "ul",
    ...props.components
  };
  return jsxs(Fragment, {
    children: [jsx(_components.p, {
      children: "Open source is the future of the internet."
    }), "\n", jsx(_components.p, {
      children: "Open source means that the code for an application is freely available. Anyone can use the code how they wish."
    }), "\n", jsx(_components.p, {
      children: "Historically, SEO tools have been able to raise prices and let the user experience degrade because people had no other options. Open source forces companies to do what's best for the community. Otherwise, angry users can fork the codebase and provide a better service."
    }), "\n", jsx(_components.p, {
      children: "Open source puts the power in the hands of the users."
    }), "\n", jsx(_components.h2, {
      id: "benefits-of-open-source-seo",
      children: "Benefits of open source SEO"
    }), "\n", jsx(_components.h3, {
      id: "self-hosting-benefits",
      children: "Self-hosting benefits"
    }), "\n", jsx(_components.p, {
      children: "If you already self-host open source products, you already know the many benefits including:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: "It's fun"
      }), "\n", jsx(_components.li, {
        children: "Learning"
      }), "\n", jsx(_components.li, {
        children: "Saving money"
      }), "\n", jsx(_components.li, {
        children: "Privacy and controlling your own data"
      }), "\n"]
    }), "\n", jsx(_components.h3, {
      id: "why-does-open-source-matter-even-if-youre-using-seotoolims-saas",
      children: "Why does open source matter even if you're using SeoTool.im's SaaS?"
    }), "\n", jsx(_components.h4, {
      id: "open-source-products-are-higher-quality",
      children: "Open source products are higher quality"
    }), "\n", jsx(_components.p, {
      children: "Open source products can be much higher quality than closed source alternatives."
    }), "\n", jsx(_components.p, {
      children: 'Most apps suffer from "paper cuts", or small annoying bugs that are not worth it for the company to fix. If a user encounters one of these problems, they can fix the code themselves and contribute back to the application.'
    }), "\n", jsx(_components.h4, {
      id: "open-source-puts-the-user-first",
      children: "Open source puts the user first"
    }), "\n", jsx(_components.p, {
      children: 'A company open sourcing their code puts a flag in the sand saying, "We are going to be the best place to use this software even though users have other options." This mentality creates a healthy pressure which has lots of benefits for users.'
    }), "\n", jsx(_components.h5, {
      id: "fair-pricing",
      children: "Fair pricing"
    }), "\n", jsxs(_components.p, {
      children: ["Anyone can ", jsx(_components.a, {
        href: "https://github.com/emerilansel-jpg/SeoTool",
        children: "self-host SeoTool.im"
      }), " and use it at cost for themselves."]
    }), "\n", jsx(_components.p, {
      children: "Since our code is open source, other companies could try to provide the same service for cheaper. This is a check, so we cannot just keep charging more and more. We need to offer the hosted service at a fair price so that customers are happy to pay for it because it gives them so much value."
    }), "\n", jsx(_components.h5, {
      id: "transparency",
      children: "Transparency"
    }), "\n", jsx(_components.p, {
      children: "Anyone can read the code. This keeps the company in check to make sure it is prioritizing things like security."
    }), "\n", jsx(_components.h5, {
      id: "community-driven",
      children: "Community driven"
    }), "\n", jsx(_components.p, {
      children: "The best ideas from the community will bubble back into the application for everyone to benefit."
    }), "\n", jsx(_components.h2, {
      id: "build-a-custom-seo-tool-on-top-of-seotoolim",
      children: "Build a custom SEO tool on top of SeoTool.im"
    }), "\n", jsx(_components.p, {
      children: "Now that AI agents like Claude are making coding more accessible and inexpensive, many SEO agencies are deciding to build custom SEO tools for their companies' use cases."
    }), "\n", jsx(_components.p, {
      children: "This allows them to save money and tailor the tool to their own workflows. Many are building these from scratch."
    }), "\n", jsx(_components.p, {
      children: "I propose that they should instead build on top of SeoTool.im. Here's why:"
    }), "\n", jsx(_components.h3, {
      id: "dont-re-invent-the-wheel",
      children: "Don't re-invent the wheel"
    }), "\n", jsx(_components.p, {
      children: "There is no point in rebuilding keyword research, backlinks, or rank tracking from scratch. Even if you want to change something about our product, making those changes will be easier than starting from zero."
    }), "\n", jsx(_components.h3, {
      id: "software-engineering-best-practices",
      children: "Software engineering best practices"
    }), "\n", jsx(_components.p, {
      children: "Coding agents do best when they have good examples to reference. There are many patterns in place to make it easier to add new features. You will not need to reinvent the wheel and go through the same months of QA, tweaking, and debugging that we have."
    }), "\n", jsx(_components.p, {
      children: "We have built systems to verify that features work and are high quality, which you can benefit from."
    }), "\n", jsx(_components.h3, {
      id: "security",
      children: "Security"
    }), "\n", jsx(_components.p, {
      children: "Since we have a hosted product, we take great care to ensure every change is secure. You get to benefit from this and reference our documentation for how to self-host your custom tool securely too."
    }), "\n", jsx(_components.h2, {
      id: "does-open-source-mean-free",
      children: "Does open source mean free?"
    }), "\n", jsx(_components.p, {
      children: "In SEO, data quality is extremely important. It is very expensive to store historical data to see trends for the whole internet or to run computers all over the world to see what position a page ranks for on Google."
    }), "\n", jsx(_components.p, {
      children: "Because of this, many SEO workflows require data that costs money. Otherwise, the SEO tool would not be very useful."
    }), "\n", jsx(_components.p, {
      children: "But, since the code for the application is open source, it means that you are not locked into a single data provider. If a better, more affordable data provider comes along, the project can switch."
    }), "\n", jsx(_components.h2, {
      id: "where-does-seotoolim-get-its-data",
      children: "Where does SeoTool.im get its data?"
    }), "\n", jsxs(_components.p, {
      children: ["SeoTool.im uses ", jsx(_components.a, {
        href: "https://dataforseo.com/",
        children: "DataForSEO"
      }), " as its main data source. They have been in business for almost 10 years and are considered the gold standard for pay-by-usage SEO data. They have quality SEO data for almost every workflow and they are very reliable."]
    }), "\n", jsx(_components.p, {
      children: "There are other data providers for more specific tasks like SERP, or search engine results page, which we may support in the future, but for simplicity's sake, DataForSEO is our main provider right now."
    }), "\n", jsx(_components.h2, {
      id: "can-you-really-replace-your-seo-tool-with-seotoolim",
      children: "Can you really replace your SEO tool with SeoTool.im?"
    }), "\n", jsx(_components.p, {
      children: "It depends."
    }), "\n", jsx(_components.h3, {
      id: "for-beginners",
      children: "For beginners"
    }), "\n", jsx(_components.p, {
      children: "If you're new to SEO, SeoTool.im should definitely be the first tool you select. Good design means the tool is approachable to both beginners and experts. When you connect SeoTool.im with an AI agent, it can help coach you through the basics. SeoTool.im will grow with you."
    }), "\n", jsx(_components.h3, {
      id: "for-experts",
      children: "For experts"
    }), "\n", jsxs(_components.p, {
      children: ["If you love your current solution, you should probably just stick with that. But, if you think your current tool is bloated, poorly designed, or too expensive, SeoTool.im is striving to be an all-in-one replacement for tools like ", jsx(_components.a, {
        href: "https://www.semrush.com/",
        children: "Semrush"
      }), " and ", jsx(_components.a, {
        href: "https://ahrefs.com/",
        children: "Ahrefs"
      }), "."]
    }), "\n", jsx(_components.h2, {
      id: "ai-native-more-than-a-replacement-for-other-seo-tools",
      children: "AI native: More than a replacement for other SEO tools"
    }), "\n", jsx(_components.p, {
      children: "SeoTool.im is both open source and more affordable than alternatives. But, we do not plan for these to be the only things different about the product."
    }), "\n", jsx(_components.p, {
      children: "Many AI-native SEO tools strive to automate SEO as a job function. This is hype. SEO is about coming up with a better strategy than your competitors. If every company is using the same AI agent product, there is no edge."
    }), "\n", jsx(_components.p, {
      children: "SeoTool.im aims to be the best way to collaborate with your AI agent on SEO tasks. SeoTool.im was created after AI agents became powerful. The product is not bogged down by features and workflows that only make sense in a pre-AI world."
    }), "\n", jsxs(_components.p, {
      children: ["Right now, this means SeoTool.im has an ", jsx(_components.a, {
        href: "/docs/mcp",
        children: "MCP server"
      }), " which you can use with any other AI product like Claude, Codex, or OpenClaw. For example, you can ask your agent to do keyword research. But instead of blindly trusting its judgment, you can ask it for a link to view the data in SeoTool.im."]
    }), "\n", jsx(_components.p, {
      children: "In the future, this collaboration will get even more powerful. You will be able to ask your agent to create a custom dashboard for your business or client with the specific data that you value. Or, you will be able to create bespoke, reusable workflows for routine tasks."
    }), "\n", jsx(_components.p, {
      children: "While AI and SEO is very noisy right now, it is definitely the future. We're going to do everything we can to cut through the noise and empower SEOs and entrepreneurs with simple, powerful tools to pursue their SEO strategies."
    })]
  });
}
function MDXContent$7(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$7, {
      ...props
    })
  }) : _createMdxContent$7(props);
}
const $$splitComponentImporter$q = () => import("./open-source-seo-AzCw8Quc.js");
const Route$q = createFileRoute("/_marketing/open-source-seo")({
  head: () => buildPageSeo({
    title: frontmatter$7.title,
    description: frontmatter$7.description,
    path: "/open-source-seo",
    titleSuffix: "SeoTool.im",
    ogType: "article"
  }),
  component: lazyRouteComponent($$splitComponentImporter$q, "component")
});
const PATH$2 = "/google-search-console-mcp";
let frontmatter$6 = {
  "title": "Google Search Console MCP Server: No Google Cloud Setup",
  "description": "Connect Google Search Console to Claude, Cursor, or any MCP client — no Google Cloud project needed. Query clicks, impressions, CTR, position, and indexing."
};
[{
  depth: 2,
  url: "#setup-no-google-cloud-project",
  title: jsx(Fragment, {
    children: "Setup: no Google Cloud project"
  })
}, {
  depth: 3,
  url: "#claude-code",
  title: jsx(Fragment, {
    children: "Claude Code"
  })
}, {
  depth: 3,
  url: "#claude-desktop",
  title: jsx(Fragment, {
    children: "Claude Desktop"
  })
}, {
  depth: 3,
  url: "#cursor",
  title: jsx(Fragment, {
    children: "Cursor"
  })
}, {
  depth: 3,
  url: "#codex-cli",
  title: jsx(Fragment, {
    children: "Codex CLI"
  })
}, {
  depth: 3,
  url: "#the-diy-way-every-other-gsc-mcp",
  title: jsx(Fragment, {
    children: "The DIY way (every other GSC MCP)"
  })
}, {
  depth: 2,
  url: "#things-to-actually-ask-it",
  title: jsx(Fragment, {
    children: "Things to actually ask it"
  })
}, {
  depth: 2,
  url: "#what-your-agent-can-read",
  title: jsx(Fragment, {
    children: "What your agent can read"
  })
}, {
  depth: 2,
  url: "#what-it-costs",
  title: jsx(Fragment, {
    children: "What it costs"
  })
}, {
  depth: 2,
  url: "#seotoolim-vs-the-alternatives",
  title: jsx(Fragment, {
    children: "SeoTool.im vs. the alternatives"
  })
}, {
  depth: 2,
  url: "#faq",
  title: jsx(Fragment, {
    children: "FAQ"
  })
}, {
  depth: 3,
  url: "#what-does-it-cost",
  title: jsx(Fragment, {
    children: "What does it cost?"
  })
}, {
  depth: 3,
  url: "#is-it-open-source",
  title: jsx(Fragment, {
    children: "Is it open source?"
  })
}, {
  depth: 3,
  url: "#is-it-read-only",
  title: jsx(Fragment, {
    children: "Is it read-only?"
  })
}, {
  depth: 3,
  url: "#which-ai-clients-work",
  title: jsx(Fragment, {
    children: "Which AI clients work?"
  })
}, {
  depth: 3,
  url: "#how-fresh-is-the-data",
  title: jsx(Fragment, {
    children: "How fresh is the data?"
  })
}];
function _createMdxContent$6(props) {
  const _components = {
    a: "a",
    code: "code",
    h2: "h2",
    h3: "h3",
    li: "li",
    ol: "ol",
    p: "p",
    pre: "pre",
    span: "span",
    strong: "strong",
    ul: "ul",
    ...props.components
  }, { ComparisonTable } = _components;
  if (!ComparisonTable) _missingMdxReference("ComparisonTable");
  return jsxs(Fragment, {
    children: [jsxs(_components.p, {
      children: ["Most Google Search Console (GSC) MCP servers are open source, but they take a lot of effort to set up. You need to create a Google Cloud project, enable an API, build an OAuth client, download a ", jsx(_components.code, {
        children: "credentials.json"
      }), ", then keep a local server running. SeoTool.im handles the Google connection for you. You sign up, connect your property, and start asking."]
    }), "\n", jsx(_components.h2, {
      id: "setup-no-google-cloud-project",
      children: "Setup: no Google Cloud project"
    }), "\n", jsxs(_components.ol, {
      children: ["\n", jsx(_components.li, {
        children: "Sign up for SeoTool.im ($10/month)."
      }), "\n", jsxs(_components.li, {
        children: ["Go through the onboarding. When prompted, click ", jsx(_components.strong, {
          children: "Connect Search Console"
        }), " and pick your property."]
      }), "\n", jsx(_components.li, {
        children: "Add the SeoTool.im MCP endpoint to your client (steps below) and approve the SeoTool.im login when prompted."
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: "The hosted MCP server URL is:"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',
        children: jsx(_components.code, {
          children: jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              children: "https://seotool.im/mcp"
            })
          })
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "claude-code",
      children: "Claude Code"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "claude"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " mcp"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " add"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --transport"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " http"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --scope"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " user"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " seotool"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " https://seotool.im/mcp"
            })]
          })
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "claude-desktop",
      children: "Claude Desktop"
    }), "\n", jsxs(_components.ol, {
      children: ["\n", jsx(_components.li, {
        children: "Open Settings → Connectors."
      }), "\n", jsxs(_components.li, {
        children: ["Click ", jsx(_components.strong, {
          children: "Add custom connector"
        }), "."]
      }), "\n", jsxs(_components.li, {
        children: ["Paste ", jsx(_components.code, {
          children: "https://seotool.im/mcp"
        }), "."]
      }), "\n"]
    }), "\n", jsx(_components.h3, {
      id: "cursor",
      children: "Cursor"
    }), "\n", jsxs(_components.ol, {
      children: ["\n", jsx(_components.li, {
        children: "Open Cursor Settings → Tools & Integrations → MCP Tools."
      }), "\n", jsxs(_components.li, {
        children: ["Click ", jsx(_components.strong, {
          children: "New MCP Server"
        }), " (this opens ", jsx(_components.code, {
          children: "mcp.json"
        }), ") and add:"]
      }), "\n"]
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "{"
            })
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: '  "mcpServers"'
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ": {"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: '    "seotool"'
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ": {"
            })]
          }), "\n", jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: '      "url"'
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: ": "
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: '"https://seotool.im/mcp"'
            })]
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "    }"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "  }"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              style: {
                "--shiki-light": "#24292E",
                "--shiki-dark": "#E1E4E8"
              },
              children: "}"
            })
          })]
        })
      })
    }), "\n", jsx(_components.h3, {
      id: "codex-cli",
      children: "Codex CLI"
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',
        children: jsx(_components.code, {
          children: jsxs(_components.span, {
            className: "line",
            children: [jsx(_components.span, {
              style: {
                "--shiki-light": "#6F42C1",
                "--shiki-dark": "#B392F0"
              },
              children: "codex"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " mcp"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " add"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " seotool"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#005CC5",
                "--shiki-dark": "#79B8FF"
              },
              children: " --url"
            }), jsx(_components.span, {
              style: {
                "--shiki-light": "#032F62",
                "--shiki-dark": "#9ECBFF"
              },
              children: " https://seotool.im/mcp"
            })]
          })
        })
      })
    }), "\n", jsxs(_components.p, {
      children: ["Any other MCP client works the same way: add ", jsx(_components.code, {
        children: "https://seotool.im/mcp"
      }), " as a remote server and sign in. Full setup and troubleshooting live in the ", jsx(_components.a, {
        href: "/docs/mcp",
        children: "MCP docs"
      }), "."]
    }), "\n", jsx(_components.h3, {
      id: "the-diy-way-every-other-gsc-mcp",
      children: "The DIY way (every other GSC MCP)"
    }), "\n", jsxs(_components.ol, {
      children: ["\n", jsx(_components.li, {
        children: "Create a Google Cloud project"
      }), "\n", jsx(_components.li, {
        children: "Enable the Search Console API"
      }), "\n", jsx(_components.li, {
        children: "Configure the OAuth consent screen"
      }), "\n", jsx(_components.li, {
        children: "Create OAuth client credentials"
      }), "\n", jsxs(_components.li, {
        children: ["Download ", jsx(_components.code, {
          children: "credentials.json"
        })]
      }), "\n", jsx(_components.li, {
        children: "Install and run a local MCP server"
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "things-to-actually-ask-it",
      children: "Things to actually ask it"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsx(_components.li, {
        children: `"Which queries am I ranking on page two for that I'm close to pushing onto page one?"`
      }), "\n", jsx(_components.li, {
        children: '"Show me pages where impressions went up but clicks stayed flat — probably a title or meta problem."'
      }), "\n", jsx(_components.li, {
        children: '"Are any of my blog posts competing with each other for the same query?"'
      }), "\n", jsxs(_components.li, {
        children: ['"Is ', jsx(_components.code, {
          children: "/pricing"
        }), ` indexed? If not, what's blocking it?"`]
      }), "\n", jsx(_components.li, {
        children: '"Which queries lost the most clicks over the last 28 days?"'
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "what-your-agent-can-read",
      children: "What your agent can read"
    }), "\n", jsx(_components.p, {
      children: "Two read-only tools over the property you connect. Both pull Google's own numbers, and neither uses credits."
    }), "\n", jsxs(_components.p, {
      children: [jsx(_components.strong, {
        children: "Search performance."
      }), " Clicks, impressions, CTR, and average position for your site, sliced by query, page, country, device, and date. Pull up to 16 months of history in a single question."]
    }), "\n", jsxs(_components.p, {
      children: [jsx(_components.strong, {
        children: "URL inspection."
      }), " Whether a page is indexed and, if not, why: coverage status, last crawl, the canonical Google chose versus the one you declared, plus mobile and rich-result checks. Up to 10 URLs at a time."]
    }), "\n", jsx(_components.p, {
      children: "The agent can read and inspect. It cannot change anything in your account."
    }), "\n", jsx(_components.h2, {
      id: "what-it-costs",
      children: "What it costs"
    }), "\n", jsx(_components.p, {
      children: "The Search Console tools use zero credits — Google doesn't charge you to read your own data, so reading it through SeoTool.im never burns usage. They're included with the SeoTool.im plan ($10/month, which includes monthly usage credits for the research tools), alongside the credit-based tools (keyword research, rank tracking, backlinks) that run through the same MCP endpoint. If you'd rather not pay at all, SeoTool.im is open source and free to self-host — see the FAQ below."
    }), "\n", jsx(_components.h2, {
      id: "seotoolim-vs-the-alternatives",
      children: "SeoTool.im vs. the alternatives"
    }), "\n", jsx(ComparisonTable, {}), "\n", jsx(_components.h2, {
      id: "faq",
      children: "FAQ"
    }), "\n", jsx(_components.h3, {
      id: "what-does-it-cost",
      children: "What does it cost?"
    }), "\n", jsx(_components.p, {
      children: "The Search Console MCP tools are included with the $10/month SeoTool.im plan (which comes with a 30-day money-back guarantee) and use zero credits. SeoTool.im's other tools (keyword research, rank tracking, backlinks) use the usage credits included with the plan, through the same endpoint. Self-hosting is free."
    }), "\n", jsx(_components.h3, {
      id: "is-it-open-source",
      children: "Is it open source?"
    }), "\n", jsx(_components.p, {
      children: "Yes. SeoTool.im is open source, so you can self-host the whole thing for free, including the Search Console MCP. The one-click connection here uses SeoTool.im's hosted Google app. If you self-host, you bring your own Google OAuth client, the same Cloud-console step the hosted version saves you. Hosted means no setup; self-hosted means full control."
    }), "\n", jsx(_components.h3, {
      id: "is-it-read-only",
      children: "Is it read-only?"
    }), "\n", jsxs(_components.p, {
      children: ["Yes. SeoTool.im requests read-only access (", jsx(_components.code, {
        children: "webmasters.readonly"
      }), "). Your agent can read performance data and inspect URLs, but it can't change your account."]
    }), "\n", jsx(_components.h3, {
      id: "which-ai-clients-work",
      children: "Which AI clients work?"
    }), "\n", jsx(_components.p, {
      children: "Any MCP client, including Claude Code, Claude Desktop, Cursor, Codex, and OpenClaw. Add the SeoTool.im MCP endpoint and sign in."
    }), "\n", jsx(_components.h3, {
      id: "how-fresh-is-the-data",
      children: "How fresh is the data?"
    }), "\n", jsx(_components.p, {
      children: "It's Google's own data, so the most recent few days can be incomplete. History runs back 16 months, the same as the Search Console interface."
    })]
  });
}
function MDXContent$6(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$6, {
      ...props
    })
  }) : _createMdxContent$6(props);
}
function _missingMdxReference(id, component) {
  throw new Error("Expected component `" + id + "` to be defined: you likely forgot to import, pass, or provide it.");
}
const $$splitComponentImporter$p = () => import("./google-search-console-mcp-DEF00y5t.js");
const Route$p = createFileRoute("/_marketing/google-search-console-mcp")({
  head: () => buildPageSeo({
    title: "Google Search Console MCP Server: No Google Cloud Setup",
    description: frontmatter$6.description,
    path: PATH$2,
    titleSuffix: "SeoTool.im",
    ogType: "article"
  }),
  component: lazyRouteComponent($$splitComponentImporter$p, "component")
});
const $$splitComponentImporter$o = () => import("./contact-CEfxjSuJ.js");
const Route$o = createFileRoute("/_marketing/contact")({
  head: () => buildPageSeo({
    title: "Contact Us",
    description: "Get in touch with the SeoTool.im team for support or inquiries.",
    path: "/contact"
  }),
  component: lazyRouteComponent($$splitComponentImporter$o, "component")
});
const getChangelogs = createServerFn({
  method: "GET"
}).handler(createSsrRpc("76d8809bf016ea3360495d1d0964f396e36d61b9cf4ca99dabdae918b8ca5c91"));
const $$splitComponentImporter$n = () => import("./changelog-DrM_Fi7Q.js");
const Route$n = createFileRoute("/_marketing/changelog")({
  head: () => buildPageSeo({
    title: "Changelog",
    description: "Latest updates, improvements, and fixes for SeoTool.im.",
    path: "/changelog"
  }),
  component: lazyRouteComponent($$splitComponentImporter$n, "component"),
  loader: async () => await getChangelogs()
});
const $$splitComponentImporter$m = () => import("./careers-C6e_EG6I.js");
const Route$m = createFileRoute("/_marketing/careers")({
  head: () => buildPageSeo({
    title: "Careers at SeoTool.im",
    description: "Join our team and help build the future of open source SEO.",
    path: "/careers"
  }),
  component: lazyRouteComponent($$splitComponentImporter$m, "component")
});
const $$splitComponentImporter$l = () => import("./affiliates-UjzubRbJ.js");
const Route$l = createFileRoute("/_marketing/affiliates")({
  head: () => buildPageSeo({
    title: "Affiliate Program",
    description: "Earn recurring commissions by referring customers to SeoTool.im.",
    path: "/affiliates"
  }),
  component: lazyRouteComponent($$splitComponentImporter$l, "component")
});
const $$splitComponentImporter$k = () => import("./about-R-uZI-Z4.js");
const Route$k = createFileRoute("/_marketing/about")({
  head: () => buildPageSeo({
    title: "About SeoTool.im",
    description: "The modern SEO platform built for power users and AI agents.",
    path: "/about"
  }),
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitComponentImporter$j = () => import("./index-CtZBYg8F.js");
const Route$j = createFileRoute("/_marketing/free-tools/")({
  head: () => ({
    ...buildPageSeo({
      title: "Free SEO Tools",
      description: "Free SEO tools built on live data: check your AI visibility, backlinks, rankings, and technical health. No sign-up required.",
      path: "/free-tools",
      titleSuffix: "SeoTool.im",
      imageAlt: "SeoTool.im free SEO tools"
    }),
    links: [{
      rel: "preconnect",
      href: "https://fonts.googleapis.com"
    }, {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous"
    }, {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const $$splitComponentImporter$i = () => import("./index-B0dPKB-E.js");
const featuresDescription = "Explore SeoTool.im's open-source SEO tools for AI-agent workflows, Google Search Console MCP, keyword research, rank tracking, backlinks, site audits, competitor analysis, and AI visibility.";
const Route$i = createFileRoute("/_marketing/features/")({
  head: () => buildPageSeo({
    title: "Features",
    description: featuresDescription,
    path: "/features",
    titleSuffix: "SeoTool.im"
  }),
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const FAQS = [{
  question: "Is the AI visibility checker really free?",
  answer: "Yes. The check runs against live ChatGPT mention data and costs you nothing: no account, no email, no credit card. We cache each domain for 24 hours and limit checks per visitor to keep it fast and free."
}, {
  question: "What does the mentions number mean?",
  answer: "It counts how many tracked ChatGPT answers cite your domain as a source or recommendation. The data comes from DataForSEO's AI optimization database, which monitors real ChatGPT responses across the US market."
}, {
  question: "Why does the free check only cover ChatGPT?",
  answer: "ChatGPT is the most used AI assistant for buying research, so it is where visibility matters first. The full report inside SeoTool.im adds Google AI Overviews mentions, competitor share of voice, every citing page, and monthly trends."
}, {
  question: "How do I get mentioned by ChatGPT?",
  answer: "AI assistants cite pages that clearly answer buyer questions. Start with our guide How to appear in ChatGPT results: answer the questions your buyers ask, earn citations on pages AI models already trust, and keep your content fresh."
}, {
  question: "How is this different from rank tracking?",
  answer: "Rank tracking shows where you sit in Google's list of links. AI visibility shows whether AI assistants recommend you at all, in answers that increasingly replace those lists. Serious SEO teams track both."
}];
const $$splitComponentImporter$h = () => import("./ai-visibility-checker-COX6fR-0.js");
const faqSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer
    }
  }))
});
const Route$h = createFileRoute("/_marketing/free-tools/ai-visibility-checker")({
  head: () => ({
    ...buildPageSeo({
      title: "Free AI Visibility Checker: Is ChatGPT Mentioning You?",
      description: "Check if ChatGPT mentions your domain in the AI answers buyers read. Free instant check, no sign-up. See your mention count and how to improve it.",
      path: "/free-tools/ai-visibility-checker",
      titleSuffix: "SeoTool.im",
      imageAlt: "SeoTool.im AI Visibility Checker"
    }),
    links: [{
      rel: "preconnect",
      href: "https://fonts.googleapis.com"
    }, {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous"
    }, {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap"
    }],
    scripts: [{
      type: "application/ld+json",
      children: faqSchema
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const FEATURE_PAGE_SLUGS = {
  keywordResearch: "keyword-research",
  siteAudit: "site-audit",
  backlinkChecker: "backlink-checker",
  domainOverview: "domain-overview",
  rankTracking: "rank-tracking",
  savedKeywords: "saved-keywords",
  aiBrandVisibility: "ai-brand-visibility",
  aiSearchPrompts: "ai-search-prompts"
};
const featurePages = {
  keywordResearch: {
    slug: FEATURE_PAGE_SLUGS.keywordResearch,
    eyebrow: "Keyword Research",
    navDescription: "Find keyword ideas and SERPs.",
    title: "Keyword research tool for practical SEO planning",
    description: "Find keyword ideas, compare search volume and difficulty, inspect SERP results, and save the opportunities worth building around.",
    primaryKeyword: "keyword research tool",
    secondaryKeywords: [
      "seo keyword research tool",
      "free keyword research tool",
      "keyword research tools"
    ],
    imageAlt: "SeoTool.im keyword research dashboard",
    imageSrc: "https://imagedelivery.net/ysLOa6bzFaM49Jxok-TAlw/d77077d0-cdf4-4523-0c41-56a7b4861300/public",
    workflows: [
      {
        title: "Research seed topics",
        description: "Start with one or more seeds and expand them into keyword ideas with volume, difficulty, CPC, and intent signals."
      },
      {
        title: "Inspect the real SERP",
        description: "Open SERP results beside keyword metrics so content decisions are based on the pages ranking for that query."
      },
      {
        title: "Save and organize opportunities",
        description: "Keep useful keywords in your workspace and tag them for content planning, rank tracking, or AI-agent workflows."
      }
    ],
    metrics: [
      { label: "Search volume", value: "Demand" },
      { label: "Keyword difficulty", value: "Competition" },
      { label: "CPC", value: "Commercial signal" },
      { label: "SERP results", value: "Search context" }
    ],
    showMetrics: true,
    useCases: [
      "Build a content roadmap from real keyword data.",
      "Find lower-competition variants before writing.",
      "Group keywords for articles, landing pages, and rank tracking."
    ],
    differentiators: [
      "Open-source SEO workflows you can self-host or run in the managed app.",
      "DataForSEO-backed metrics without locking the research process into a black box.",
      "MCP access so AI agents can research and save keywords for you."
    ],
    related: [
      { label: "Keyword Clustering", href: "/docs/skills/keyword-clustering" },
      {
        label: "Keyword Research",
        href: "/docs/skills/keyword-research"
      },
      { label: "Rank Tracking", href: "/features/rank-tracking" }
    ],
    faqs: [
      {
        question: "What is SeoTool.im keyword research best for?",
        answer: "SeoTool.im is best for finding SEO keyword ideas, checking demand and difficulty, and turning those ideas into saved keywords you can revisit."
      },
      {
        question: "Can I use SeoTool.im as a free keyword research tool?",
        answer: "Not unlimited: quality keyword data costs money everywhere, which is why the big SEO suites run $100/month and up. SeoTool.im is the most affordable option; you can start for free, and paid plans start at $10/month with usage credits included. It's also open source, so you can self-host with your own DataForSEO account."
      },
      {
        question: "Does SeoTool.im show live search results?",
        answer: "Yes. Keyword research can be paired with SERP inspection so you can see ranking pages alongside the metrics."
      }
    ],
    guides: {
      title: "The Keyword Research Strategy Library",
      description: "Practitioner plays that treat keyword research as demand discovery, not a volume spreadsheet. Each guide is a full walkthrough with the copy-paste MCP prompt that runs it.",
      items: [
        {
          label: "Seed from conversation, not a volume report",
          description: "Harvest seed keywords from sales calls and support tickets.",
          href: "/library/keyword-research/seed-from-conversation"
        },
        {
          label: "What are long-tail keywords, and how to mine them",
          description: "PAA fan-out, autocomplete harvesting, and your own GSC queries.",
          href: "/library/keyword-research/long-tail-question-mining"
        },
        {
          label: "Search-intent mapping (hot / warm / cold)",
          description: "Label every keyword by buying temperature before you write.",
          href: "/library/keyword-research/search-intent-mapping"
        },
        {
          label: "Cluster keywords into topical hubs",
          description: "One page per intent, plus the keyword cannibalization fix.",
          href: "/library/keyword-research/cluster-topical-hubs"
        }
      ],
      cta: {
        label: "Browse the full Strategy Library",
        href: "/library/keyword-research"
      }
    }
  },
  siteAudit: {
    slug: FEATURE_PAGE_SLUGS.siteAudit,
    eyebrow: "Site Audit",
    navDescription: "Audit page-level SEO signals.",
    title: "SEO audit tool for finding technical issues fast",
    description: "Crawl a site, collect page-level technical signals, and optionally run Lighthouse checks for performance, SEO, accessibility, and best-practice issues.",
    primaryKeyword: "seo audit tool",
    secondaryKeywords: [
      "seo site audit",
      "free seo audit tool",
      "seo audit tools"
    ],
    imageAlt: "SeoTool.im site audit report",
    imageSrc: "https://imagedelivery.net/ysLOa6bzFaM49Jxok-TAlw/53149e87-0027-4fa8-5d13-bcaab60c7100/public",
    workflows: [
      {
        title: "Run a site crawl",
        description: "Inspect pages for status codes, titles, meta descriptions, headings, indexability signals, image alt coverage, links, response time, and optional Lighthouse findings."
      },
      {
        title: "Prioritize issues",
        description: "Review crawled pages and optional Lighthouse results so the team can focus on visible page and performance problems."
      },
      {
        title: "Drill into affected URLs",
        description: "Move into URLs with missing titles, metadata, heading and image-alt signals, status-code issues, response-time data, or optional Lighthouse findings."
      }
    ],
    metrics: [
      { label: "Crawled URLs", value: "Coverage" },
      { label: "Page fields", value: "Checks" },
      { label: "Affected pages", value: "Scope" },
      { label: "Audit history", value: "Progress" }
    ],
    showMetrics: true,
    useCases: [
      "Audit a new site before publishing SEO work.",
      "Find technical issues after a migration or redesign.",
      "Export crawled page data and Lighthouse findings for developers and content teams."
    ],
    differentiators: [
      "A practical crawler built into the same workspace as keyword and domain research.",
      "Open-source implementation for teams that want to inspect or extend the audit flow.",
      "Simple reports that expose page-level signals and optional Lighthouse findings instead of relying only on a generic score."
    ],
    related: [
      { label: "Domain Overview", href: "/features/domain-overview" },
      { label: "Backlink Checker", href: "/features/backlink-checker" },
      { label: "Keyword Research", href: "/features/keyword-research" }
    ],
    faqs: [
      {
        question: "What does the SeoTool.im site audit tool check?",
        answer: "Status codes, titles, meta descriptions, headings, indexability signals, image alt coverage, links, and response time for every crawled page. Enable Lighthouse and each page also gets performance, SEO, accessibility, and best-practice issues."
      },
      {
        question: "Is SeoTool.im a free SEO audit tool?",
        answer: "For smaller sites, yes: the free plan includes site audits up to 50 pages per crawl. Larger crawls need a paid plan, starting at $10/month. SeoTool.im is also open source and self-hostable."
      },
      {
        question: "Who should use SeoTool.im Site Audit?",
        answer: "It is useful for founders, marketers, agencies, and developers who need a shared crawl report and optional Lighthouse issue export."
      }
    ]
  },
  backlinkChecker: {
    slug: FEATURE_PAGE_SLUGS.backlinkChecker,
    eyebrow: "Backlinks",
    navDescription: "Check links and referring domains.",
    title: "Backlink checker for understanding a domain's link profile",
    description: "Analyze backlinks, referring domains, and linked pages without separating link research from the rest of your SEO workspace.",
    primaryKeyword: "backlink checker",
    secondaryKeywords: [
      "free backlink checker",
      "backlink analysis tool",
      "google backlink checker"
    ],
    imageAlt: "SeoTool.im backlinks report",
    imageSrc: "https://imagedelivery.net/ysLOa6bzFaM49Jxok-TAlw/d97206ed-bd64-447c-2b9e-1b9f07c5ec00/public",
    workflows: [
      {
        title: "Check a domain's backlinks",
        description: "Look up backlinks and referring-domain signals for your site, competitors, or pages you are evaluating."
      },
      {
        title: "Compare link quality",
        description: "Use backlink rows, referring-domain rows, rank, spam, broken, lost, and nofollow signals to inspect link quality."
      },
      {
        title: "Filter and export link data",
        description: "Export and filter backlink, referring-domain, and top-page data for your own outreach, competitor research, or cleanup review."
      }
    ],
    metrics: [
      { label: "Backlinks", value: "Links" },
      { label: "Referring domains", value: "Sources" },
      { label: "Target URLs", value: "Distribution" },
      { label: "Rank and spam signals", value: "Quality context" }
    ],
    showMetrics: true,
    useCases: [
      "See who links to a competitor.",
      "Inspect link opportunities for important pages.",
      "Understand whether a domain has real authority before investing in content."
    ],
    differentiators: [
      "Backlink analysis sits beside keyword research, domain overview, and audit data.",
      "Self-host or adapt backlink reporting for your team's workflow.",
      "MCP support lets an AI agent pull backlink context during SEO research."
    ],
    related: [
      {
        label: "Link Prospecting",
        href: "/docs/skills/link-prospecting"
      },
      { label: "Domain Overview", href: "/features/domain-overview" },
      { label: "SeoTool.im MCP", href: "/features/mcp" }
    ],
    faqs: [
      {
        question: "What is a backlink checker used for?",
        answer: "A backlink checker helps you understand which sites link to a domain or page, which links have stronger rank, spam, broken, lost, or nofollow signals, and where competitors are earning authority."
      },
      {
        question: "Can I check competitor backlinks in SeoTool.im?",
        answer: "Yes. Enter any domain, yours or a competitor's, and pull its backlinks, referring domains, and top linked pages."
      },
      {
        question: "How does backlink research connect to SEO planning?",
        answer: "Backlinks tell you whether a page ranks on content or on authority. Check them before targeting a keyword to judge whether you can realistically outrank the incumbents, and check a competitor's profile to find sites that might link to you too."
      }
    ]
  },
  domainOverview: {
    slug: FEATURE_PAGE_SLUGS.domainOverview,
    eyebrow: "Domain Overview",
    navDescription: "Analyze competitor visibility.",
    title: "Domain overview: traffic, keywords, and pages for any domain",
    description: "Get a domain overview of any website: estimated organic traffic, ranking keywords, and top organic pages, with one click into backlink and keyword research.",
    primaryKeyword: "domain overview",
    secondaryKeywords: [
      "domain analysis tool",
      "competitor keyword analysis tool",
      "website traffic checker"
    ],
    imageAlt: "SeoTool.im domain overview",
    imageSrc: "https://imagedelivery.net/ysLOa6bzFaM49Jxok-TAlw/189e22b8-fdf8-46b4-198c-e912beef2300/public",
    workflows: [
      {
        title: "Analyze a domain",
        description: "Start with a domain and get an overview of estimated organic traffic, organic keyword count, top ranking keywords, and top organic pages."
      },
      {
        title: "Find competitor keywords",
        description: "Inspect keywords a competitor already ranks for and identify topics worth building or defending."
      },
      {
        title: "Move into deeper research",
        description: "Use domain insights to open keyword research, backlink analysis, or rank tracking without starting over."
      }
    ],
    metrics: [
      { label: "Organic traffic", value: "Visibility" },
      { label: "Organic keywords", value: "Topics" },
      { label: "Top keywords", value: "Rankings" },
      { label: "Top pages", value: "Organic reach" }
    ],
    showMetrics: true,
    useCases: [
      "Research a competitor before writing a content plan.",
      "Estimate a site's organic footprint.",
      "Find keyword gaps between your site and the domains already ranking."
    ],
    differentiators: [
      "Domain research connects directly to keyword, backlink, and rank tracking workflows.",
      "Built around ranking keywords, estimated traffic, and top pages for practical competitor research.",
      "Open-source and self-hostable for teams that want control over their SEO stack."
    ],
    related: [
      {
        label: "Competitor Analysis",
        href: "/docs/skills/competitor-analysis"
      },
      { label: "Keyword Research", href: "/features/keyword-research" },
      { label: "Backlink Checker", href: "/features/backlink-checker" }
    ],
    faqs: [
      {
        question: "What is a domain overview?",
        answer: "A domain overview is a snapshot of a website's organic search footprint: estimated organic traffic, how many keywords it ranks for, its top ranking keywords, and its top organic pages. It's usually the first step in competitor research because it shows where a site earns its visibility."
      },
      {
        question: "How does this compare to Semrush Domain Overview?",
        answer: "SeoTool.im covers the core of the same report (estimated traffic, organic keywords, top keywords, and top pages) without a triple-digit monthly seat. SeoTool.im is open source, so you can self-host it, and the managed app is $10/month and includes usage credits."
      },
      {
        question: "Can SeoTool.im help with competitor keyword analysis?",
        answer: "Yes. Enter a competitor's domain and you get the keywords it ranks for and its top organic pages: the raw material for finding topics worth building or defending."
      },
      {
        question: "Is Domain Overview the same as a traffic checker?",
        answer: "Not quite. It includes an estimated-traffic metric, but the value is seeing which keywords and pages produce that traffic, which a plain traffic checker doesn't show."
      }
    ]
  },
  rankTracking: {
    slug: FEATURE_PAGE_SLUGS.rankTracking,
    eyebrow: "Rank Tracking",
    navDescription: "Monitor keyword positions.",
    title: "Rank tracker for monitoring keyword positions",
    description: "Track the keywords that matter, optionally compare desktop and mobile results, and keep ranking changes connected to your research workflow.",
    primaryKeyword: "rank tracker",
    secondaryKeywords: [
      "seo rank tracking tool",
      "keyword rank tracker",
      "google rank tracker"
    ],
    imageAlt: "SeoTool.im rank tracking table",
    imageSrc: "https://imagedelivery.net/ysLOa6bzFaM49Jxok-TAlw/4a0f8508-1527-46a8-c91c-086456f21c00/public",
    workflows: [
      {
        title: "Add tracked domains",
        description: "Create rank tracking configurations for the domains and locations you care about."
      },
      {
        title: "Track important keywords",
        description: "Add keywords manually or from ranking suggestions and monitor positions over time."
      },
      {
        title: "Compare SERP context",
        description: "Review the configured device results, ranking URLs, movement, and available SERP feature signals."
      }
    ],
    metrics: [
      { label: "Desktop rank", value: "When enabled" },
      { label: "Mobile rank", value: "When enabled" },
      { label: "SERP features", value: "Context" },
      { label: "Position change", value: "Movement" }
    ],
    showMetrics: true,
    useCases: [
      "Monitor target keywords after publishing content.",
      "Track launch, migration, and optimization impact.",
      "Keep ranking checks close to the keywords your team already researched."
    ],
    differentiators: [
      "Rank tracking is part of the same workspace as discovery, audit, and competitor research.",
      "Optional desktop and mobile tracking helps teams avoid one-dimensional rank reports.",
      "SeoTool.im can expose ranking data to AI agents through MCP."
    ],
    related: [
      { label: "Keyword Clustering", href: "/docs/skills/keyword-clustering" },
      {
        label: "Competitor Analysis",
        href: "/docs/skills/competitor-analysis"
      },
      { label: "Keyword Research", href: "/features/keyword-research" }
    ],
    faqs: [
      {
        question: "What is a rank tracker?",
        answer: "A rank tracker monitors where a domain appears for selected keywords over time so you can see whether SEO work is improving visibility."
      },
      {
        question: "Does SeoTool.im track mobile and desktop rankings?",
        answer: "Yes: mobile, desktop, or both. Each tracked domain is configured with the devices you want, and enabling both lets you compare them side by side."
      },
      {
        question: "How should I choose keywords to track?",
        answer: "Start with keywords tied to important pages, active content work, and competitor opportunities discovered in keyword research."
      }
    ]
  },
  savedKeywords: {
    slug: FEATURE_PAGE_SLUGS.savedKeywords,
    eyebrow: "Saved Keywords",
    navDescription: "Organize SEO opportunities.",
    title: "Saved keywords for turning SEO research into a plan",
    description: "Keep useful keyword ideas organized so they can inform content planning, rank tracking decisions, and AI-agent workflows.",
    primaryKeyword: "saved keywords",
    secondaryKeywords: [
      "seo keyword list",
      "keyword list tool",
      "keyword planning"
    ],
    imageAlt: "SeoTool.im saved keywords list",
    imageSrc: "https://imagedelivery.net/ysLOa6bzFaM49Jxok-TAlw/8938a529-b443-4d4f-9869-c972f3cef900/public",
    workflows: [
      {
        title: "Save promising keywords",
        description: "Collect useful ideas from keyword research instead of losing them after each search."
      },
      {
        title: "Organize by topic",
        description: "Tag keywords by page, campaign, content cluster, or priority so planning stays readable."
      },
      {
        title: "Reuse saved keywords across workflows",
        description: "Use saved keywords and tags as a planning reference for rank tracking, content planning, or MCP-powered research."
      }
    ],
    metrics: [
      { label: "Saved ideas", value: "Pipeline" },
      { label: "Tags", value: "Organization" },
      { label: "Volume", value: "Demand" },
      { label: "Difficulty", value: "Priority" }
    ],
    useCases: [
      "Tag keyword ideas into topic or page groups from keyword research.",
      "Prepare candidate keywords to add to rank tracking.",
      "Keep human and AI-agent research in the same workspace."
    ],
    differentiators: [
      "Saved keywords bridge research, tracking, and AI workflows.",
      "Saved keywords preserve available metrics like volume, CPC, difficulty, intent, and tags.",
      "The workflow stays simple enough for repeated planning sessions."
    ],
    related: [
      { label: "Keyword Research", href: "/features/keyword-research" },
      { label: "Rank Tracking", href: "/features/rank-tracking" },
      { label: "SeoTool.im MCP", href: "/features/mcp" }
    ],
    faqs: [
      {
        question: "Why save keywords in an SEO tool?",
        answer: "Saved keywords keep research organized so teams can return to the ideas that are worth writing, optimizing, or tracking."
      },
      {
        question: "Can saved keywords be used with rank tracking?",
        answer: "Yes. Saved keywords are a natural source for deciding which terms should be monitored over time."
      },
      {
        question: "How do saved keywords fit into SEO planning?",
        answer: "Research fills the list, tags group it into pages and campaigns, and the shortlist feeds rank tracking. Saved keywords are the bridge between finding an opportunity and acting on it."
      }
    ]
  },
  aiBrandVisibility: {
    slug: FEATURE_PAGE_SLUGS.aiBrandVisibility,
    eyebrow: "AI Visibility",
    navDescription: "Look up brand mentions in AI search.",
    title: "Brand lookup for ChatGPT and Google AI Overview visibility",
    description: "Look up a brand or domain and review ChatGPT and Google AI Overview mentions, cited pages, and related prompts.",
    primaryKeyword: "ai visibility tool",
    secondaryKeywords: [
      "brand visibility ai search",
      "ai search visibility",
      "answer engine optimization"
    ],
    imageAlt: "SeoTool.im AI brand visibility report",
    imageSrc: "https://imagedelivery.net/ysLOa6bzFaM49Jxok-TAlw/cde3e4f8-079f-4890-cb17-371087107400/public",
    workflows: [
      {
        title: "Look up a brand",
        description: "Search for a brand or domain and inspect how ChatGPT and Google AI Overview mention or cite it in available results."
      },
      {
        title: "Review citations and platforms",
        description: "Review the URLs, domains, and platforms contributing to brand mentions."
      },
      {
        title: "Find visibility gaps",
        description: "Use cited pages and related prompts as clues for content, reputation, or comparison coverage to investigate."
      }
    ],
    metrics: [
      { label: "Mentions", value: "Presence" },
      { label: "Citations", value: "Sources" },
      { label: "Platforms", value: "Surfaces" },
      { label: "Cited domains", value: "Sources" }
    ],
    useCases: [
      "See whether ChatGPT and Google AI Overview data mention or cite your brand or domain.",
      "Find pages and domains cited alongside brand mentions.",
      "Use cited sources and prompts to plan content experiments for answer-engine visibility."
    ],
    differentiators: [
      "AI visibility sits beside classic SEO research instead of replacing it.",
      "The workflow focuses on concrete sources and mentions, not vague AI hype.",
      "SeoTool.im helps teams connect AI mention and citation research to concrete SEO planning."
    ],
    related: [
      {
        label: "Free AI Visibility Checker",
        href: "/free-tools/ai-visibility-checker"
      },
      { label: "AI Search Prompts", href: "/features/ai-search-prompts" },
      { label: "Domain Overview", href: "/features/domain-overview" },
      { label: "SeoTool.im MCP", href: "/features/mcp" }
    ],
    faqs: [
      {
        question: "What is AI brand visibility?",
        answer: "AI brand visibility is how often your brand or domain appears in available ChatGPT and Google AI Overview mention and citation data."
      },
      {
        question: "How is AI visibility different from traditional SEO?",
        answer: "Traditional SEO focuses on rankings and pages. SeoTool.im's AI visibility workflow looks at mentions, cited pages, related prompts, and platform-level metrics from supported AI-search sources."
      },
      {
        question: "Should AI visibility replace keyword research?",
        answer: "No. It should sit beside keyword, domain, backlink, and audit data so teams can understand both search rankings and answer coverage."
      }
    ]
  },
  aiSearchPrompts: {
    slug: FEATURE_PAGE_SLUGS.aiSearchPrompts,
    eyebrow: "Prompt Explorer",
    navDescription: "Compare answers across supported models.",
    title: "AI search prompt explorer for visibility research",
    description: "Run the same prompt across supported AI models, compare the answers, and review citations when they are returned.",
    primaryKeyword: "ai search visibility",
    secondaryKeywords: [
      "chatgpt search visibility",
      "ai search prompts",
      "answer engine optimization tool"
    ],
    imageAlt: "SeoTool.im prompt explorer",
    imageSrc: "https://imagedelivery.net/ysLOa6bzFaM49Jxok-TAlw/9f3d38f2-aa97-417c-ca74-ae378654d700/public",
    workflows: [
      {
        title: "Test category prompts",
        description: "Compare answers to the questions your customers might ask AI tools."
      },
      {
        title: "Inspect web-backed answers",
        description: "When web search is enabled, inspect the pages and domains cited by model responses."
      },
      {
        title: "Check brand mentions",
        description: "Highlight a brand and see whether each model mentions it in the answer or cited sources."
      }
    ],
    metrics: [
      { label: "Prompts", value: "Questions" },
      { label: "Web context", value: "Sources" },
      { label: "Web search country", value: "Regional context" },
      { label: "Brand mentions", value: "Presence" }
    ],
    useCases: [
      "Compare how supported AI models answer the same prompt.",
      "Review which pages and domains appear in cited sources.",
      "Check whether a brand appears in AI answers and citations."
    ],
    differentiators: [
      "Prompt research lives in the same workspace as domain, keyword, and brand visibility workflows.",
      "SeoTool.im treats AI search as a research layer, not a replacement for SEO fundamentals.",
      "SeoTool.im MCP exposes keyword, SERP, domain, backlink, saved keyword, and rank-tracking tools to AI agents."
    ],
    related: [
      { label: "AI Brand Visibility", href: "/features/ai-brand-visibility" },
      { label: "Keyword Research", href: "/features/keyword-research" },
      { label: "SeoTool.im MCP", href: "/features/mcp" }
    ],
    faqs: [
      {
        question: "What is an AI search prompt explorer?",
        answer: "It lets teams run the same prompt across supported AI models, compare answers, and inspect citation URLs returned with supported model responses."
      },
      {
        question: "Why does prompt research matter for SEO?",
        answer: "Prompts are the new queries: they show the comparison, problem, and buying questions your customers now ask AI tools. The cited sources show which pages and domains those answers are built on, so you can see where your coverage is missing."
      },
      {
        question: "Can this help with answer engine optimization?",
        answer: "Yes. Prompt Explorer is a starting point for mapping prompt responses and returned citations back to source pages and possible SEO follow-up work."
      }
    ]
  }
};
const featureGroups = [
  {
    label: "Keyword workflows",
    description: "Find, organize, and monitor the keywords that matter.",
    pages: [
      featurePages.keywordResearch,
      featurePages.savedKeywords,
      featurePages.rankTracking
    ]
  },
  {
    label: "Domain research",
    description: "Understand competitors, backlinks, and technical health.",
    pages: [
      featurePages.domainOverview,
      featurePages.backlinkChecker,
      featurePages.siteAudit
    ]
  },
  {
    label: "AI visibility",
    description: "Research AI search prompts, citations, and brand visibility.",
    pages: [featurePages.aiBrandVisibility, featurePages.aiSearchPrompts]
  }
];
const page$7 = featurePages.siteAudit;
const $$splitComponentImporter$g = () => import("./site-audit-Cadvp-6P.js");
const Route$g = createFileRoute("/_marketing/features/site-audit")({
  head: () => buildPageSeo({
    title: "SEO Audit Tool",
    description: page$7.description,
    path: "/features/site-audit",
    titleSuffix: "SeoTool.im",
    imageAlt: page$7.imageAlt
  }),
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const page$6 = featurePages.savedKeywords;
const $$splitComponentImporter$f = () => import("./saved-keywords-A3ihiDrs.js");
const Route$f = createFileRoute("/_marketing/features/saved-keywords")({
  head: () => buildPageSeo({
    title: "Saved Keyword Lists",
    description: page$6.description,
    path: "/features/saved-keywords",
    titleSuffix: "SeoTool.im",
    imageAlt: page$6.imageAlt
  }),
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const page$5 = featurePages.rankTracking;
const $$splitComponentImporter$e = () => import("./rank-tracking-DCv6vSGS.js");
const Route$e = createFileRoute("/_marketing/features/rank-tracking")({
  head: () => buildPageSeo({
    title: "Rank Tracker",
    description: page$5.description,
    path: "/features/rank-tracking",
    titleSuffix: "SeoTool.im",
    imageAlt: page$5.imageAlt
  }),
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./mcp-D3Gh0iC2.js");
const mcpDescription = "Give Claude, Cursor, or any MCP client real SEO tools: keyword research, live SERPs, backlinks, rank tracking, and Search Console data via one MCP server.";
const Route$d = createFileRoute("/_marketing/features/mcp")({
  head: () => buildPageSeo({
    title: "SEO MCP Server: Keyword, SERP & Backlink Tools",
    description: mcpDescription,
    path: "/features/mcp",
    titleSuffix: "SeoTool.im"
  }),
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const page$4 = featurePages.keywordResearch;
const $$splitComponentImporter$c = () => import("./keyword-research-BHpkfIv8.js");
const Route$c = createFileRoute("/_marketing/features/keyword-research")({
  head: () => buildPageSeo({
    title: "Keyword Research Tool",
    description: page$4.description,
    path: "/features/keyword-research",
    titleSuffix: "SeoTool.im",
    imageAlt: page$4.imageAlt
  }),
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const page$3 = featurePages.domainOverview;
const $$splitComponentImporter$b = () => import("./domain-overview-Ctbnslgz.js");
const Route$b = createFileRoute("/_marketing/features/domain-overview")({
  head: () => buildPageSeo({
    title: "Domain Overview Tool: Traffic, Keywords & Top Pages",
    description: page$3.description,
    path: "/features/domain-overview",
    titleSuffix: "SeoTool.im",
    imageAlt: page$3.imageAlt
  }),
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const page$2 = featurePages.backlinkChecker;
const $$splitComponentImporter$a = () => import("./backlink-checker-CLiGi7Ge.js");
const Route$a = createFileRoute("/_marketing/features/backlink-checker")({
  head: () => buildPageSeo({
    title: "Backlink Checker",
    description: page$2.description,
    path: "/features/backlink-checker",
    titleSuffix: "SeoTool.im",
    imageAlt: page$2.imageAlt
  }),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const page$1 = featurePages.aiSearchPrompts;
const $$splitComponentImporter$9 = () => import("./ai-search-prompts-CmiEwbt2.js");
const Route$9 = createFileRoute("/_marketing/features/ai-search-prompts")({
  head: () => buildPageSeo({
    title: "AI Search Prompt Explorer",
    description: page$1.description,
    path: "/features/ai-search-prompts",
    titleSuffix: "SeoTool.im",
    imageAlt: page$1.imageAlt
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const page = featurePages.aiBrandVisibility;
const $$splitComponentImporter$8 = () => import("./ai-brand-visibility-GL8g-9JD.js");
const Route$8 = createFileRoute("/_marketing/features/ai-brand-visibility")({
  head: () => buildPageSeo({
    title: "AI Brand Visibility Tool",
    description: page.description,
    path: "/features/ai-brand-visibility",
    titleSuffix: "SeoTool.im",
    imageAlt: page.imageAlt
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./index-B36W00f7.js");
const PATH$1 = "/library/keyword-research";
const Route$7 = createFileRoute("/_marketing/library/keyword-research/")({
  head: () => buildPageSeo({
    title: "How to Do Keyword Research: The Strategy Library",
    description: "Eight practitioner plays that treat keyword research as demand discovery, sourced from real interviews with working SEOs, executable inside SeoTool.im.",
    path: PATH$1,
    titleSuffix: "SeoTool.im"
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./index-CkGityX2.js");
const PATH = "/library/ai-search-geo";
const Route$6 = createFileRoute("/_marketing/library/ai-search-geo/")({
  head: () => buildPageSeo({
    title: "AI Search Optimization: The GEO Strategy Library",
    description: "Practitioner plays for generative engine optimization: earn ChatGPT and AI Overviews citations, track AI visibility, and know what actually changed versus classic SEO.",
    path: PATH,
    titleSuffix: "SeoTool.im"
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const __img0$3 = "/assets/seed-keyword-list-validation-seotool-BsL9tMKA.png";
let frontmatter$5 = {
  "title": "Seed from conversation, not a volume report",
  "description": `Every keyword tool starts with a box that says "enter a keyword", and that first word decides everything downstream. Get it from your customers' mouths, not from a tool's suggestions.`
};
[{
  depth: 2,
  url: "#what-is-a-seed-keyword",
  title: jsx(Fragment, {
    children: "What is a seed keyword?"
  })
}, {
  depth: 2,
  url: "#why-customer-conversations-beat-keyword-tools-for-seed-keywords",
  title: jsx(Fragment, {
    children: "Why customer conversations beat keyword tools for seed keywords"
  })
}, {
  depth: 2,
  url: "#how-to-build-a-seed-keyword-list-without-a-paid-tool-5-steps",
  title: jsx(Fragment, {
    children: "How to build a seed keyword list without a paid tool (5 steps)"
  })
}, {
  depth: 2,
  url: "#seed-keyword-faq",
  title: jsx(Fragment, {
    children: "Seed keyword FAQ"
  })
}, {
  depth: 3,
  url: "#how-do-i-do-keyword-research-for-free",
  title: jsx(Fragment, {
    children: "How do I do keyword research for free?"
  })
}, {
  depth: 3,
  url: "#how-do-i-find-lsi-keywords",
  title: jsx(Fragment, {
    children: "How do I find LSI keywords?"
  })
}, {
  depth: 3,
  url: "#how-many-seed-keywords-do-i-need",
  title: jsx(Fragment, {
    children: "How many seed keywords do I need?"
  })
}];
function _createMdxContent$5(props) {
  const _components = {
    a: "a",
    code: "code",
    em: "em",
    h2: "h2",
    h3: "h3",
    img: "img",
    li: "li",
    ol: "ol",
    p: "p",
    pre: "pre",
    span: "span",
    strong: "strong",
    ...props.components
  };
  return jsxs(Fragment, {
    children: [jsx(_components.h2, {
      id: "what-is-a-seed-keyword",
      children: "What is a seed keyword?"
    }), "\n", jsx(_components.p, {
      children: "A seed keyword is the starting term you feed a research tool to generate the full set of related queries. Weak seeds (industry jargon) produce weak results. Strong seeds, the words real customers use when they describe their problem, surface keywords your competitors' tools never see."
    }), "\n", jsx(_components.h2, {
      id: "why-customer-conversations-beat-keyword-tools-for-seed-keywords",
      children: "Why customer conversations beat keyword tools for seed keywords"
    }), "\n", jsx(_components.p, {
      children: `Tools recycle each other's databases. Your sales calls, support tickets, and podcast interviews contain phrasings that have never been typed into a tool but get typed into Google every day. The searcher who says "my website doesn't show up when I google my own company" is not searching "seo services." Seed from the first phrasing and you own a lane; seed from the second and you're bidding against everyone.`
    }), "\n", jsx(_components.h2, {
      id: "how-to-build-a-seed-keyword-list-without-a-paid-tool-5-steps",
      children: "How to build a seed keyword list without a paid tool (5 steps)"
    }), "\n", jsxs(_components.ol, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Harvest verbatims."
        }), " Pull the exact problem-phrases from your last 10 sales calls, support threads, or reviews. Copy the words, not your summary of them."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Strip to the seed."
        }), ` "We can't tell if our blog is doing anything" → seeds: "is my blog working", "blog roi", "measure blog traffic".`]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Add the jargon translation."
        }), " For every customer phrase, note the industry term too. You'll need both sides of the vocabulary to catch both audiences."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Validate in SeoTool.im."
        }), " Feed each seed into ", jsx(_components.a, {
          href: "/features/keyword-research",
          children: "keyword research"
        }), ". You want ", jsx(_components.em, {
          children: "any"
        }), " measured volume plus clear intent, not big numbers. Zero-volume seeds with real intent still convert."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Keep the losers list."
        }), ' Seeds with nothing behind them go in a "watch" list. Customer language often precedes search demand by months.']
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: jsx(_components.img, {
        alt: "Validating a conversation-sourced seed keyword list in SeoTool.im's keyword research tool, showing volume and intent for each seed",
        src: __img0$3,
        placeholder: "blur"
      })
    }), "\n", jsxs(_components.p, {
      children: ["Run this play with the ", jsx(_components.a, {
        href: "/docs/mcp",
        children: "SeoTool.im MCP"
      }), ":"]
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              children: "Using the SeoTool.im MCP: here are 8 phrases my customers actually said:"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              children: "[paste verbatims]. Extract seed keywords from each, research them,"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              children: "and tell me which have measured demand vs. which go on the watch list."
            })
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "seed-keyword-faq",
      children: "Seed keyword FAQ"
    }), "\n", jsx(_components.h3, {
      id: "how-do-i-do-keyword-research-for-free",
      children: "How do I do keyword research for free?"
    }), "\n", jsx(_components.p, {
      children: "Conversations for seeds (this page), Google autocomplete + People Also Ask for expansion, Search Console for validation. SeoTool.im validates and expands what those surface; you can start for free, and paid plans start at $10/month."
    }), "\n", jsx(_components.h3, {
      id: "how-do-i-find-lsi-keywords",
      children: "How do I find LSI keywords?"
    }), "\n", jsx(_components.p, {
      children: `"LSI keywords" is tool-industry vocabulary for related phrasings. The fastest free sources are the People Also Ask box and the "related searches" footer. Better still: your customers' own synonyms, which is exactly what conversation seeding harvests.`
    }), "\n", jsx(_components.h3, {
      id: "how-many-seed-keywords-do-i-need",
      children: "How many seed keywords do I need?"
    }), "\n", jsxs(_components.p, {
      children: ["5–15 strong seeds per topic. Past that you're expanding, not seeding. Feed them into ", jsx(_components.a, {
        href: "/library/keyword-research/long-tail-question-mining",
        children: "the long-tail mining play"
      }), " next."]
    })]
  });
}
function MDXContent$5(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$5, {
      ...props
    })
  }) : _createMdxContent$5(props);
}
const $$splitComponentImporter$5 = () => import("./seed-from-conversation-Bx10KjyF.js");
const Route$5 = createFileRoute("/_marketing/library/keyword-research/seed-from-conversation")({
  head: () => buildPageSeo({
    title: "Seed Keywords from Customer Conversations (Keyword Research Without a Paid Tool)",
    description: frontmatter$5.description,
    path: "/library/keyword-research/seed-from-conversation",
    titleSuffix: "SeoTool.im Library",
    ogType: "article"
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const __img0$2 = "/assets/search-intent-mapping-seotool-C0MzRcxh.png";
let frontmatter$4 = {
  "title": "Rank for the searches that are ready to buy",
  "description": `Search intent is the "why" behind a query. Map every keyword hot, warm, or cold before you write a word, and you'll stop producing content that ranks but never converts.`
};
[{
  depth: 2,
  url: "#what-is-search-intent-in-seo",
  title: jsx(Fragment, {
    children: "What is search intent in SEO?"
  })
}, {
  depth: 2,
  url: "#the-4-types-of-search-intent",
  title: jsx(Fragment, {
    children: "The 4 types of search intent"
  })
}, {
  depth: 2,
  url: "#hot-warm-cold-the-practitioners-intent-map",
  title: jsx(Fragment, {
    children: "Hot, warm, cold: the practitioner's intent map"
  })
}, {
  depth: 2,
  url: "#search-intent-faq",
  title: jsx(Fragment, {
    children: "Search intent FAQ"
  })
}, {
  depth: 3,
  url: "#why-is-search-intent-important-for-seo",
  title: jsx(Fragment, {
    children: "Why is search intent important for SEO?"
  })
}, {
  depth: 3,
  url: "#what-are-buyer-intent-keywords",
  title: jsx(Fragment, {
    children: "What are buyer intent keywords?"
  })
}, {
  depth: 3,
  url: "#how-do-i-check-the-search-intent-of-a-keyword",
  title: jsx(Fragment, {
    children: "How do I check the search intent of a keyword?"
  })
}];
function _createMdxContent$4(props) {
  const _components = {
    a: "a",
    code: "code",
    h2: "h2",
    h3: "h3",
    img: "img",
    li: "li",
    p: "p",
    pre: "pre",
    span: "span",
    strong: "strong",
    ul: "ul",
    ...props.components
  };
  return jsxs(Fragment, {
    children: [jsx(_components.h2, {
      id: "what-is-search-intent-in-seo",
      children: "What is search intent in SEO?"
    }), "\n", jsx(_components.p, {
      children: 'Search intent is the goal a searcher has when they type a query: to learn, to compare, to find a site, or to buy. Google ranks the page that best satisfies that intent, regardless of who "deserves" it. Optimizing a page against the wrong intent is the most common reason content ranks nowhere.'
    }), "\n", jsx(_components.h2, {
      id: "the-4-types-of-search-intent",
      children: "The 4 types of search intent"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Informational:"
        }), ' "', jsx(_components.a, {
          href: "/library/keyword-research/seed-from-conversation",
          children: "what are seed keywords"
        }), '" → wants an answer']
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Commercial:"
        }), ' "', jsx(_components.a, {
          href: "/library/keyword-research/cluster-topical-hubs",
          children: "best keyword clustering tool"
        }), '" → wants a comparison']
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Transactional:"
        }), ' "seotool pricing" → wants to act']
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Navigational:"
        }), ' "google search console login" → wants a specific place']
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "hot-warm-cold-the-practitioners-intent-map",
      children: "Hot, warm, cold: the practitioner's intent map"
    }), "\n", jsx(_components.p, {
      children: "The 4-type taxonomy is fine for textbooks. For planning a content calendar, temperature is faster:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Hot: ready now."
        }), ' Transactional and high-commercial queries. Buyer intent keywords like "X vs Y", "X pricing", "best X for [niche]". Build these pages first: smallest traffic, largest revenue.']
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Warm: comparing."
        }), " Commercial-investigation queries. They know the problem, they're shortlisting solutions. Comparison pages, use-case pages, honest alternative pages."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Cold: learning."
        }), " Informational queries. Highest volume, longest payback. Their job is trust and retargeting, not conversion. Measure them accordingly."]
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: jsx(_components.img, {
        alt: "SeoTool.im keyword research results for a local SEO services seed with the intent column labeling each keyword informational or commercial",
        src: __img0$2,
        placeholder: "blur"
      })
    }), "\n", jsxs(_components.p, {
      children: ["Run this play with the ", jsx(_components.a, {
        href: "/docs/mcp",
        children: "SeoTool.im MCP"
      }), ":"]
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              children: 'Using the SeoTool.im MCP: research keywords for "[your topic]" and group'
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              children: "results into hot (transactional/commercial), warm (comparison), and"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              children: "cold (informational). Recommend which 5 hot pages to build first."
            })
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "search-intent-faq",
      children: "Search intent FAQ"
    }), "\n", jsx(_components.h3, {
      id: "why-is-search-intent-important-for-seo",
      children: "Why is search intent important for SEO?"
    }), "\n", jsx(_components.p, {
      children: "Because Google ranks pages that satisfy intent, not pages that mention keywords. A perfectly optimized page against the wrong intent can't win. Read the SERP and you'll see the intent Google has decided the query carries."
    }), "\n", jsx(_components.h3, {
      id: "what-are-buyer-intent-keywords",
      children: "What are buyer intent keywords?"
    }), "\n", jsx(_components.p, {
      children: `Queries that signal purchase readiness: "pricing", "vs", "alternative", "best X for Y", "discount". They're low volume and high competition per click, but still usually your best ROI, because the searcher arrives pre-sold.`
    }), "\n", jsx(_components.h3, {
      id: "how-do-i-check-the-search-intent-of-a-keyword",
      children: "How do I check the search intent of a keyword?"
    }), "\n", jsxs(_components.p, {
      children: ["Search it. The current top 10 is Google's answer: if it's all listicles, the intent is commercial comparison; all docs and definitions, informational. SeoTool.im also auto-labels intent on ", jsx(_components.a, {
        href: "/features/keyword-research",
        children: "researched keywords"
      }), " in most countries."]
    })]
  });
}
function MDXContent$4(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$4, {
      ...props
    })
  }) : _createMdxContent$4(props);
}
const $$splitComponentImporter$4 = () => import("./search-intent-mapping-8E5cz6EK.js");
const Route$4 = createFileRoute("/_marketing/library/keyword-research/search-intent-mapping")({
  head: () => buildPageSeo({
    title: "What Is Search Intent? Mapping Keywords Hot, Warm, and Cold",
    description: frontmatter$4.description,
    path: "/library/keyword-research/search-intent-mapping",
    titleSuffix: "SeoTool.im Library",
    ogType: "article"
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const __img0$1 = "/assets/long-tail-keyword-filter-seotool-Dsg55Yza.png";
let frontmatter$3 = {
  "title": "The queries your competitors can't see",
  "description": "Long-tail keywords are where small sites win. What they are, how to find them without paying for a suite, and how to mine the question queries Google hands you for free."
};
[{
  depth: 2,
  url: "#what-are-long-tail-keywords",
  title: jsx(Fragment, {
    children: "What are long-tail keywords?"
  })
}, {
  depth: 2,
  url: "#long-tail-vs-short-tail-keywords-why-the-tail-converts",
  title: jsx(Fragment, {
    children: "Long-tail vs short-tail keywords: why the tail converts"
  })
}, {
  depth: 2,
  url: "#long-tail-keyword-examples",
  title: jsx(Fragment, {
    children: "Long-tail keyword examples"
  })
}, {
  depth: 2,
  url: "#how-to-find-long-tail-keywords-3-free-methods",
  title: jsx(Fragment, {
    children: "How to find long-tail keywords (3 free methods)"
  })
}, {
  depth: 2,
  url: "#long-tail-keyword-faq",
  title: jsx(Fragment, {
    children: "Long-tail keyword FAQ"
  })
}, {
  depth: 3,
  url: "#what-are-long-tail-keywords-in-seo",
  title: jsx(Fragment, {
    children: "What are long-tail keywords in SEO?"
  })
}, {
  depth: 3,
  url: "#how-do-i-use-long-tail-keywords-in-content",
  title: jsx(Fragment, {
    children: "How do I use long-tail keywords in content?"
  })
}, {
  depth: 3,
  url: "#is-there-a-free-long-tail-keyword-generator",
  title: jsx(Fragment, {
    children: "Is there a free long-tail keyword generator?"
  })
}];
function _createMdxContent$3(props) {
  const _components = {
    a: "a",
    code: "code",
    h2: "h2",
    h3: "h3",
    img: "img",
    li: "li",
    ol: "ol",
    p: "p",
    pre: "pre",
    span: "span",
    strong: "strong",
    ul: "ul",
    ...props.components
  };
  return jsxs(Fragment, {
    children: [jsx(_components.h2, {
      id: "what-are-long-tail-keywords",
      children: "What are long-tail keywords?"
    }), "\n", jsx(_components.p, {
      children: `Long-tail keywords are longer, more specific search queries, usually three or more words, that individually get fewer searches but collectively make up most of Google's traffic. "Keyword research" is a head term; "how to do keyword research for a local restaurant" is long-tail. They bring lower volume, much lower competition, and clearer intent.`
    }), "\n", jsx(_components.h2, {
      id: "long-tail-vs-short-tail-keywords-why-the-tail-converts",
      children: "Long-tail vs short-tail keywords: why the tail converts"
    }), "\n", jsx(_components.p, {
      children: 'A short-tail query is an audience; a long-tail query is a person with a problem. Someone searching "crm" is browsing. Someone searching "crm for solo real estate agents under $20" is buying. The tail trades volume for intent, and intent is what converts.'
    }), "\n", jsx(_components.h2, {
      id: "long-tail-keyword-examples",
      children: "Long-tail keyword examples"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Head:"
        }), " running shoes → ", jsx(_components.strong, {
          children: "Tail:"
        }), " best running shoes for flat feet and plantar fasciitis"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Head:"
        }), " keyword research → ", jsx(_components.strong, {
          children: "Tail:"
        }), " how to do keyword research without a paid tool"]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Head:"
        }), " email marketing → ", jsx(_components.strong, {
          children: "Tail:"
        }), " email marketing laws for cold outreach in canada"]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "how-to-find-long-tail-keywords-3-free-methods",
      children: "How to find long-tail keywords (3 free methods)"
    }), "\n", jsxs(_components.ol, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Mine People Also Ask + autocomplete fan-out."
        }), " Type your head term, harvest every PAA question, then re-search each question and harvest again. Two levels deep gives you 30–50 real questions people ask."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Pull your own Search Console queries."
        }), " Your GSC data is a long-tail generator that no tool can match. Filter ", jsx(_components.a, {
          href: "/blogs/dark-queries",
          children: "queries with impressions but no clicks"
        }), ": those are tails you already half-rank for."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Expand seeds in SeoTool.im."
        }), " Feed your ", jsx(_components.a, {
          href: "/library/keyword-research/seed-from-conversation",
          children: "seed list"
        }), " into ", jsx(_components.a, {
          href: "/features/keyword-research",
          children: "keyword research"
        }), ' and keep the specific, question-form results with clear intent regardless of volume. "0 volume" queries are measured, not dead.']
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: jsx(_components.img, {
        alt: 'SeoTool.im keyword research results for the seed "running shoes for flat feet", returning long-tail variants like "best running shoes for flat feet men" with volume, difficulty, and intent columns',
        src: __img0$1,
        placeholder: "blur"
      })
    }), "\n", jsxs(_components.p, {
      children: ["Run this play with the ", jsx(_components.a, {
        href: "/docs/mcp",
        children: "SeoTool.im MCP"
      }), ":"]
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              children: 'Using the SeoTool.im MCP: research keywords for the seed "[your topic]",'
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              children: "then return only queries with 4+ words or question form (how/what/why)."
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              children: "Group them by intent and suggest one page per group."
            })
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "long-tail-keyword-faq",
      children: "Long-tail keyword FAQ"
    }), "\n", jsx(_components.h3, {
      id: "what-are-long-tail-keywords-in-seo",
      children: "What are long-tail keywords in SEO?"
    }), "\n", jsx(_components.p, {
      children: "Specific multi-word queries with lower individual volume but higher combined traffic and clearer intent than head terms. They're the fastest way for a newer site to rank, because competition concentrates on head terms."
    }), "\n", jsx(_components.h3, {
      id: "how-do-i-use-long-tail-keywords-in-content",
      children: "How do I use long-tail keywords in content?"
    }), "\n", jsxs(_components.p, {
      children: ["One intent per page. Make the long-tail query the H2 (or H1) verbatim where natural, answer it in the first paragraph, then earn depth below. Don't scatter twenty tails across one page; ", jsx(_components.a, {
        href: "/library/keyword-research/cluster-topical-hubs",
        children: "cluster related tails"
      }), ", then split by ", jsx(_components.a, {
        href: "/library/keyword-research/search-intent-mapping",
        children: "intent"
      }), "."]
    }), "\n", jsx(_components.h3, {
      id: "is-there-a-free-long-tail-keyword-generator",
      children: "Is there a free long-tail keyword generator?"
    }), "\n", jsx(_components.p, {
      children: "Google gives you two: autocomplete and People Also Ask. Your Search Console is the third and best; it's your site's actual tail. SeoTool.im connects your Search Console and expands what you find into full keyword lists. You can start for free; paid plans start at $10/month."
    })]
  });
}
function MDXContent$3(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$3, {
      ...props
    })
  }) : _createMdxContent$3(props);
}
const $$splitComponentImporter$3 = () => import("./long-tail-question-mining-Cg2NJhm3.js");
const Route$3 = createFileRoute("/_marketing/library/keyword-research/long-tail-question-mining")({
  head: () => buildPageSeo({
    title: "What Are Long-Tail Keywords? How to Find and Use Them",
    description: frontmatter$3.description,
    path: "/library/keyword-research/long-tail-question-mining",
    titleSuffix: "SeoTool.im Library",
    ogType: "article"
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const __img0 = "/assets/keyword-clustering-topical-hub-seotool-BtxQErKH.png";
let frontmatter$2 = {
  "title": "One page per intent, one hub per topic",
  "description": "A 500-row keyword list isn't a strategy. Keyword clustering turns it into a site structure and fixes the cannibalization that's splitting your rankings."
};
[{
  depth: 2,
  url: "#what-is-keyword-clustering",
  title: jsx(Fragment, {
    children: "What is keyword clustering?"
  })
}, {
  depth: 2,
  url: "#how-to-cluster-keywords-into-topical-hubs-without-a-99mo-tool",
  title: jsx(Fragment, {
    children: "How to cluster keywords into topical hubs (without a $99/mo tool)"
  })
}, {
  depth: 2,
  url: "#how-to-fix-keyword-cannibalization",
  title: jsx(Fragment, {
    children: "How to fix keyword cannibalization"
  })
}, {
  depth: 2,
  url: "#keyword-clustering-faq",
  title: jsx(Fragment, {
    children: "Keyword clustering FAQ"
  })
}, {
  depth: 3,
  url: "#whats-the-best-keyword-clustering-tool",
  title: jsx(Fragment, {
    children: "What's the best keyword clustering tool?"
  })
}, {
  depth: 3,
  url: "#is-there-a-free-keyword-clustering-tool",
  title: jsx(Fragment, {
    children: "Is there a free keyword clustering tool?"
  })
}, {
  depth: 3,
  url: "#what-is-a-keyword-mapping-template",
  title: jsx(Fragment, {
    children: "What is a keyword mapping template?"
  })
}];
function _createMdxContent$2(props) {
  const _components = {
    a: "a",
    code: "code",
    em: "em",
    h2: "h2",
    h3: "h3",
    img: "img",
    li: "li",
    ol: "ol",
    p: "p",
    pre: "pre",
    span: "span",
    strong: "strong",
    ul: "ul",
    ...props.components
  };
  return jsxs(Fragment, {
    children: [jsx(_components.h2, {
      id: "what-is-keyword-clustering",
      children: "What is keyword clustering?"
    }), "\n", jsxs(_components.p, {
      children: ["Keyword clustering is grouping keywords that deserve the ", jsx(_components.em, {
        children: "same page"
      }), ' because they share one intent. "Keyword clustering", "keyword grouping", and "cluster keywords for seo" are one cluster, so they get one page. "Best keyword clustering tool" is a different intent, so it gets a different page. The unit of SEO is the cluster, not the individual keyword.']
    }), "\n", jsx(_components.h2, {
      id: "how-to-cluster-keywords-into-topical-hubs-without-a-99mo-tool",
      children: "How to cluster keywords into topical hubs (without a $99/mo tool)"
    }), "\n", jsxs(_components.ol, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Start from your expanded list."
        }), " ", jsx(_components.a, {
          href: "/library/keyword-research/seed-from-conversation",
          children: "Seeds"
        }), " → ", jsx(_components.a, {
          href: "/library/keyword-research/long-tail-question-mining",
          children: "expansion"
        }), " → ", jsx(_components.a, {
          href: "/library/keyword-research/search-intent-mapping",
          children: "intent labels"
        }), ". You want 100+ rows before clustering is worth it."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Group by SERP overlap, not word similarity."
        }), ' Two keywords belong together when Google already ranks the same pages for both. Word-match clustering ("keyword tool" + "keyword tool io") produces false groups.']
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Name each cluster by its intent."
        }), " The name becomes the page's working title. If you can't name the intent in one line, the cluster is two."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Arrange clusters into a hub."
        }), " The head-term cluster is the pillar page; each subtopic cluster is a spoke that links up. Internal links follow intent adjacency, not chronology."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Map every cluster to one URL, and record it."
        }), " The keyword map (a simple sheet: cluster → URL → status) is the artifact that prevents future cannibalization."]
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: jsx(_components.img, {
        alt: "Keyword map table showing clusters mapped to primary keywords, intent, and one target URL each, the structure that prevents keyword cannibalization",
        src: __img0,
        placeholder: "blur"
      })
    }), "\n", jsx(_components.h2, {
      id: "how-to-fix-keyword-cannibalization",
      children: "How to fix keyword cannibalization"
    }), "\n", jsx(_components.p, {
      children: "Cannibalization is the opposite problem: two of your pages compete for one intent, Google alternates between them, and both rank worse than either would alone."
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Find it:"
        }), " in ", jsx(_components.a, {
          href: "/google-search-console-mcp",
          children: "Search Console"
        }), ", group by query + page. Any query with 2+ of your URLs swapping impressions is a candidate."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Fix it:"
        }), " merge the weaker page into the stronger (301), or re-point the weaker page at a genuinely different intent and re-title it."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Prevent it:"
        }), " the keyword map from step 5. No new page ships without checking which cluster it claims."]
      }), "\n"]
    }), "\n", jsxs(_components.p, {
      children: ["Run this play with the ", jsx(_components.a, {
        href: "/docs/mcp",
        children: "SeoTool.im MCP"
      }), ":"]
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              children: "Using the SeoTool.im MCP + Search Console: pull my queries grouped by"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              children: "query and page, flag queries where two of my URLs alternate, and"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              children: "propose merge/redirect fixes. Then cluster my researched keywords"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              children: "by shared intent and output a cluster → URL keyword map."
            })
          })]
        })
      })
    }), "\n", jsx(_components.h2, {
      id: "keyword-clustering-faq",
      children: "Keyword clustering FAQ"
    }), "\n", jsx(_components.h3, {
      id: "whats-the-best-keyword-clustering-tool",
      children: "What's the best keyword clustering tool?"
    }), "\n", jsx(_components.p, {
      children: "For SERP-overlap clustering at scale, paid tools exist, but for most sites, SeoTool.im's research + an intent-grouping pass (the MCP prompt above) covers it. Judge tools by whether they cluster on SERP overlap; word-similarity clustering is a toy."
    }), "\n", jsx(_components.h3, {
      id: "is-there-a-free-keyword-clustering-tool",
      children: "Is there a free keyword clustering tool?"
    }), "\n", jsx(_components.p, {
      children: "Not an unlimited one. The grouping step itself is free (the MCP prompt above does it), but it runs on researched keywords, and quality keyword data is the part that costs money everywhere. SeoTool.im includes the clustering pass with research, so there's no separate clustering tool to buy; you can start for free, and paid plans start at $10/month."
    }), "\n", jsx(_components.h3, {
      id: "what-is-a-keyword-mapping-template",
      children: "What is a keyword mapping template?"
    }), "\n", jsx(_components.p, {
      children: "A sheet with one row per cluster: primary keyword, supporting keywords, intent, target URL, status. The keyword map above is the working example; copy the structure."
    })]
  });
}
function MDXContent$2(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$2, {
      ...props
    })
  }) : _createMdxContent$2(props);
}
const $$splitComponentImporter$2 = () => import("./cluster-topical-hubs-kisMHlqv.js");
const Route$2 = createFileRoute("/_marketing/library/keyword-research/cluster-topical-hubs")({
  head: () => buildPageSeo({
    title: "Keyword Clustering: Turn a Keyword List into Topical Hubs (and Fix Cannibalization)",
    description: frontmatter$2.description,
    path: "/library/keyword-research/cluster-topical-hubs",
    titleSuffix: "SeoTool.im Library",
    ogType: "article"
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
let frontmatter$1 = {
  "title": "How to track your AI visibility",
  "description": "Rank tracking shows your Google position. AI visibility shows whether assistants recommend you at all. Here is what to measure, how often, and which numbers are vanity."
};
[{
  depth: 2,
  url: "#what-ai-visibility-actually-measures",
  title: jsx(Fragment, {
    children: "What AI visibility actually measures"
  })
}, {
  depth: 2,
  url: "#why-rank-tracking-doesnt-cover-this",
  title: jsx(Fragment, {
    children: "Why rank tracking doesn't cover this"
  })
}, {
  depth: 2,
  url: "#the-metrics-that-matter-and-the-vanity-ones",
  title: jsx(Fragment, {
    children: "The metrics that matter (and the vanity ones)"
  })
}, {
  depth: 2,
  url: "#build-a-tracking-routine-that-survives-busy-weeks",
  title: jsx(Fragment, {
    children: "Build a tracking routine that survives busy weeks"
  })
}, {
  depth: 2,
  url: "#free-check-versus-tracked-report",
  title: jsx(Fragment, {
    children: "Free check versus tracked report"
  })
}, {
  depth: 2,
  url: "#the-scoreboard-that-changes-decisions",
  title: jsx(Fragment, {
    children: "The scoreboard that changes decisions"
  })
}];
function _createMdxContent$1(props) {
  const _components = {
    a: "a",
    code: "code",
    h2: "h2",
    li: "li",
    ol: "ol",
    p: "p",
    pre: "pre",
    span: "span",
    strong: "strong",
    ul: "ul",
    ...props.components
  };
  return jsxs(Fragment, {
    children: [jsx(_components.h2, {
      id: "what-ai-visibility-actually-measures",
      children: "What AI visibility actually measures"
    }), "\n", jsx(_components.p, {
      children: "AI visibility is the measurement layer for GEO. Four numbers cover it:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Mentions:"
        }), " how many tracked AI answers name your brand. The baseline existence metric."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Share of voice:"
        }), " your slice of all mentions in your category versus competitors. The scoreboard metric."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Cited pages:"
        }), " which of your URLs appear inside answers. The asset metric, because it tells you what to make more of."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Trend:"
        }), " whether each of the above is rising or falling month over month. The only metric that proves your work is doing anything."]
      }), "\n"]
    }), "\n", jsxs(_components.p, {
      children: ["You can get the first one free in ten seconds with the ", jsx(_components.a, {
        href: "/free-tools/ai-visibility-checker",
        children: "AI visibility checker"
      }), ". The other three need a tracker that stores history, because single snapshots cannot show movement."]
    }), "\n", jsx(_components.h2, {
      id: "why-rank-tracking-doesnt-cover-this",
      children: "Why rank tracking doesn't cover this"
    }), "\n", jsx(_components.p, {
      children: `Google and AI assistants pick sources differently. You can hold position 3 for "best crm for agencies" and still be absent from ChatGPT's answer for the same question, because the assistant assembled its shortlist from comparison articles and community threads rather than the ranking pages. The reverse also happens. Two scoreboards, two sets of levers, and a growing share of buyers reads only the second one.`
    }), "\n", jsx(_components.h2, {
      id: "the-metrics-that-matter-and-the-vanity-ones",
      children: "The metrics that matter (and the vanity ones)"
    }), "\n", jsx(_components.p, {
      children: "Matter:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Mentions per platform."
        }), " ChatGPT and Google AI Overviews cite different sources; treat them as separate channels."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Share of voice versus named competitors."
        }), " Five mentions means little if your category leader has two hundred."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Cited page concentration."
        }), " When one page earns most citations, you have found a repeatable format. Build more of it."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Question coverage."
        }), " The share of buyer questions in your category where you appear at all."]
      }), "\n"]
    }), "\n", jsx(_components.p, {
      children: "Vanity:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Impressions without questions."
        }), " Volume numbers with no query context cannot be acted on."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "One-time snapshots."
        }), ' A single check answers "am I mentioned", never "am I growing".']
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Global counts for local businesses."
        }), " The data is market-specific; track the market you sell in."]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "build-a-tracking-routine-that-survives-busy-weeks",
      children: "Build a tracking routine that survives busy weeks"
    }), "\n", jsxs(_components.ol, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Baseline once, properly."
        }), " Run a full brand lookup across ChatGPT and AI Overviews for your domain and your three closest competitors. Save it."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Review monthly, not daily."
        }), " AI answers shift slowly between data refreshes. Daily checking adds noise and anxiety, not signal."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Watch the delta questions."
        }), " The report that matters lists questions where a competitor is mentioned and you are not. That list is your editorial calendar."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Alert on drops."
        }), " Disappearing from a category question you used to own is the AI equivalent of losing a page-one ranking; you want to know within days. Set an alert on mention movement."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Tie every content ship to a number."
        }), " Shipped a comparison page? Check whether the related question flipped to mentioning you within three weeks. Ship, measure, repeat."]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "free-check-versus-tracked-report",
      children: "Free check versus tracked report"
    }), "\n", jsxs(_components.p, {
      children: ['The free checker answers the existence question, "does ChatGPT mention me", instantly and without an account. A tracked report inside ', jsx(_components.a, {
        href: "/features/ai-brand-visibility",
        children: "AI brand visibility"
      }), ` stores history, adds AI Overviews, competitor share of voice, every cited page, and alerts, so the trend line draws itself. Use the free check to recruit your team ("look, we're at zero"), use the tracker to run the project.`]
    }), "\n", jsx(_components.h2, {
      id: "the-scoreboard-that-changes-decisions",
      children: "The scoreboard that changes decisions"
    }), "\n", jsx(_components.p, {
      children: 'The moment teams see share of voice, content debates change. Instead of arguing about topics by taste, the question becomes "which of these unanswered questions has the most volume and the weakest cited sources", and the roadmap writes itself. That is the real output of tracking: not a dashboard, a priority list.'
    }), "\n", jsxs(_components.p, {
      children: ["Run this play with the ", jsx(_components.a, {
        href: "/docs/mcp",
        children: "SeoTool.im MCP"
      }), ":"]
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              children: "Using the SeoTool.im MCP: compare my AI visibility share of voice against"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              children: "[competitor domains] for this month and last month. List questions where"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              children: "they gained mentions and I lost or never had any, sorted by search volume."
            })
          })]
        })
      })
    })]
  });
}
function MDXContent$1(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent$1, {
      ...props
    })
  }) : _createMdxContent$1(props);
}
const $$splitComponentImporter$1 = () => import("./track-ai-visibility-D-stsE-K.js");
const Route$1 = createFileRoute("/_marketing/library/ai-search-geo/track-ai-visibility")({
  head: () => buildPageSeo({
    title: "How to Track Your AI Visibility (Metrics That Matter)",
    description: frontmatter$1.description,
    path: "/library/ai-search-geo/track-ai-visibility",
    titleSuffix: "SeoTool.im Library",
    ogType: "article"
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
let frontmatter = {
  "title": "How to appear in ChatGPT results",
  "description": "ChatGPT names a shortlist of brands when buyers ask who to choose. Here is how that answer gets assembled, which pages get cited, and a checklist to get your brand into it."
};
[{
  depth: 2,
  url: "#how-chatgpt-decides-who-to-mention",
  title: jsx(Fragment, {
    children: "How ChatGPT decides who to mention"
  })
}, {
  depth: 2,
  url: "#what-gets-cited-three-patterns",
  title: jsx(Fragment, {
    children: "What gets cited: three patterns"
  })
}, {
  depth: 2,
  url: "#the-checklist-to-get-mentioned",
  title: jsx(Fragment, {
    children: "The checklist to get mentioned"
  })
}, {
  depth: 2,
  url: "#what-does-not-matter-despite-the-hype",
  title: jsx(Fragment, {
    children: "What does not matter (despite the hype)"
  })
}, {
  depth: 2,
  url: "#how-long-until-you-show-up",
  title: jsx(Fragment, {
    children: "How long until you show up"
  })
}, {
  depth: 2,
  url: "#then-keep-score",
  title: jsx(Fragment, {
    children: "Then keep score"
  })
}];
function _createMdxContent(props) {
  const _components = {
    a: "a",
    code: "code",
    h2: "h2",
    li: "li",
    ol: "ol",
    p: "p",
    pre: "pre",
    span: "span",
    strong: "strong",
    ul: "ul",
    ...props.components
  };
  return jsxs(Fragment, {
    children: [jsx(_components.h2, {
      id: "how-chatgpt-decides-who-to-mention",
      children: "How ChatGPT decides who to mention"
    }), "\n", jsx(_components.p, {
      children: `When someone asks ChatGPT "what's the best tool for X", the answer is not invented from nothing. The assistant retrieves passages from web pages it can reach, weighs sources that repeatedly agree with each other, and synthesizes a shortlist. Two things follow from that mechanics:`
    }), "\n", jsxs(_components.ol, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Being retrievable matters more than being big."
        }), " A page that states a clear answer to a specific question gets retrieved. A vague brand page does not, regardless of domain authority."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Consensus drives the shortlist."
        }), " When five comparison articles all name the same three tools, the model treats that as the consensus and repeats it. Your job is to enter the consensus, one citation at a time."]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "what-gets-cited-three-patterns",
      children: "What gets cited: three patterns"
    }), "\n", jsx(_components.p, {
      children: "Look through enough AI answers and the same patterns repeat:"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Pages that answer the exact question, conclusion first."
        }), ' "For small agencies, X covers audits and rank tracking in one plan" is quotable. A 2,000-word tour of features is not.']
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Third-party consensus pages."
        }), ' Roundups, "best of" lists, comparison tables, Reddit threads, and niche directories. These are the atoms the shortlist is built from.']
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Fresh, specific, well-structured material."
        }), " Retrieval favors recent pages, and models quote text they can lift cleanly: definitions, pros and cons, pricing, steps."]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "the-checklist-to-get-mentioned",
      children: "The checklist to get mentioned"
    }), "\n", jsxs(_components.ol, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Collect the real questions."
        }), ` Not "SEO tool", but "what's the cheapest Ahrefs alternative", "best seo tool for one person", "is X worth it". Your support inbox and sales calls already contain them.`]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Answer each one on its own page, conclusion first."
        }), " First sentence answers the question. The rest supports it. State what you are, who you are for, and what you cost, in plain sentences a model can quote."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Make your entity unambiguous."
        }), " Same brand name everywhere, an about page that says what you do in one line, consistent naming in your schema markup. Models connect facts about named things; ambiguity scatters your credit."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Enter the consensus sources."
        }), " Pitch the comparison articles and niche directories in your category. A citation in three roundups your buyers read beats fifty footer links. This is the highest-leverage step and the slowest; start it now."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Publish fresh evidence."
        }), " Original data, current pricing, updated screenshots. Stale pages lose retrieval slots to competitors who refresh."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Check your robots.txt."
        }), " GPTBot and friends must be allowed to crawl the pages you want cited. Blocking them to protect content guarantees absence from the answer."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Measure instead of guessing."
        }), " Run the ", jsx(_components.a, {
          href: "/free-tools/ai-visibility-checker",
          children: "free AI visibility checker"
        }), ", get your mention count, and re-check after each change. Guessing is how teams spend six months on work that moves nothing."]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "what-does-not-matter-despite-the-hype",
      children: "What does not matter (despite the hype)"
    }), "\n", jsxs(_components.ul, {
      children: ["\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Keyword density for AI."
        }), " Models are not matching keywords; they are assembling answers. Write for a reader who wants the point."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: "Huge word counts."
        }), " A tight 600-word answer page outperforms a padded 3,000-word one, because the quote-able sentence is easy to find."]
      }), "\n", jsxs(_components.li, {
        children: [jsx(_components.strong, {
          children: '"SEO is dead" panic.'
        }), " Crawlability, topical authority, and third-party links are still how retrieval finds you. GEO is SEO continued by other means, not a replacement."]
      }), "\n"]
    }), "\n", jsx(_components.h2, {
      id: "how-long-until-you-show-up",
      children: "How long until you show up"
    }), "\n", jsx(_components.p, {
      children: "Retrieved answers react within days to weeks when you publish something clearly better. The consensus layer is slower: earning your way into the roundups that shape shortlists takes months of pitching. Teams that start the outreach in week one and keep shipping answer pages see their first new mentions inside a quarter."
    }), "\n", jsx(_components.h2, {
      id: "then-keep-score",
      children: "Then keep score"
    }), "\n", jsxs(_components.p, {
      children: ["Getting mentioned once is luck; getting mentioned consistently is a system. The companion play, ", jsx(_components.a, {
        href: "/library/ai-search-geo/track-ai-visibility",
        children: "how to track your AI visibility"
      }), ", shows the metrics that prove the system is working: mention count, share of voice against competitors, and which of your pages get cited, tracked over time inside ", jsx(_components.a, {
        href: "/features/ai-brand-visibility",
        children: "AI brand visibility"
      }), "."]
    }), "\n", jsxs(_components.p, {
      children: ["Run this play with the ", jsx(_components.a, {
        href: "/docs/mcp",
        children: "SeoTool.im MCP"
      }), ":"]
    }), "\n", jsx(Fragment, {
      children: jsx(_components.pre, {
        className: "shiki shiki-themes github-light github-dark",
        style: {
          "--shiki-light": "#24292e",
          "--shiki-dark": "#e1e4e8",
          "--shiki-light-bg": "#fff",
          "--shiki-dark-bg": "#24292e"
        },
        tabIndex: "0",
        icon: '<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',
        children: jsxs(_components.code, {
          children: [jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              children: "Using the SeoTool.im MCP: run a brand lookup for my domain plus my top"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              children: "three competitors. List every question where they are mentioned and I am"
            })
          }), "\n", jsx(_components.span, {
            className: "line",
            children: jsx(_components.span, {
              children: "not, and draft an outline for the answer page most likely to win each one."
            })
          })]
        })
      })
    })]
  });
}
function MDXContent(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent, {
      ...props
    })
  }) : _createMdxContent(props);
}
const $$splitComponentImporter = () => import("./appear-in-chatgpt-results-Dy0s0Zx1.js");
const Route = createFileRoute("/_marketing/library/ai-search-geo/appear-in-chatgpt-results")({
  head: () => buildPageSeo({
    title: "How to Appear in ChatGPT Results (GEO Checklist)",
    description: frontmatter.description,
    path: "/library/ai-search-geo/appear-in-chatgpt-results",
    titleSuffix: "SeoTool.im Library",
    ogType: "article"
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const TermsAndConditionsRoute = Route$I.update({
  id: "/terms-and-conditions",
  path: "/terms-and-conditions",
  getParentRoute: () => Route$J
});
const RefundPolicyRoute = Route$H.update({
  id: "/refund-policy",
  path: "/refund-policy",
  getParentRoute: () => Route$J
});
const PrivacyRoute = Route$G.update({
  id: "/privacy",
  path: "/privacy",
  getParentRoute: () => Route$J
});
const DpaRoute = Route$F.update({
  id: "/dpa",
  path: "/dpa",
  getParentRoute: () => Route$J
});
const CookiePolicyRoute = Route$E.update({
  id: "/cookie-policy",
  path: "/cookie-policy",
  getParentRoute: () => Route$J
});
const MarketingRoute = Route$D.update({
  id: "/_marketing",
  getParentRoute: () => Route$J
});
const GuidesIndexRoute = Route$C.update({
  id: "/guides/",
  path: "/guides/",
  getParentRoute: () => Route$J
});
const DocsIndexRoute = Route$B.update({
  id: "/docs/",
  path: "/docs/",
  getParentRoute: () => Route$J
});
const BlogsIndexRoute = Route$A.update({
  id: "/blogs/",
  path: "/blogs/",
  getParentRoute: () => Route$J
});
const MarketingIndexRoute = Route$z.update({
  id: "/",
  path: "/",
  getParentRoute: () => MarketingRoute
});
const JsScriptDotjsRoute = Route$y.update({
  id: "/js/script.js",
  path: "/js/script.js",
  getParentRoute: () => Route$J
});
const GuidesSplatRoute = Route$x.update({
  id: "/guides/$",
  path: "/guides/$",
  getParentRoute: () => Route$J
});
const DocsSplatRoute = Route$w.update({
  id: "/docs/$",
  path: "/docs/$",
  getParentRoute: () => Route$J
});
const BlogsSplatRoute = Route$v.update({
  id: "/blogs/$",
  path: "/blogs/$",
  getParentRoute: () => Route$J
});
const ApiSubscribeRoute = Route$u.update({
  id: "/api/subscribe",
  path: "/api/subscribe",
  getParentRoute: () => Route$J
});
const ApiEventRoute = Route$t.update({
  id: "/api/event",
  path: "/api/event",
  getParentRoute: () => Route$J
});
const ApiAiVisibilityRoute = Route$s.update({
  id: "/api/ai-visibility",
  path: "/api/ai-visibility",
  getParentRoute: () => Route$J
});
const MarketingPricingRoute = Route$r.update({
  id: "/pricing",
  path: "/pricing",
  getParentRoute: () => MarketingRoute
});
const MarketingOpenSourceSeoRoute = Route$q.update({
  id: "/open-source-seo",
  path: "/open-source-seo",
  getParentRoute: () => MarketingRoute
});
const MarketingGoogleSearchConsoleMcpRoute = Route$p.update({
  id: "/google-search-console-mcp",
  path: "/google-search-console-mcp",
  getParentRoute: () => MarketingRoute
});
const MarketingContactRoute = Route$o.update({
  id: "/contact",
  path: "/contact",
  getParentRoute: () => MarketingRoute
});
const MarketingChangelogRoute = Route$n.update({
  id: "/changelog",
  path: "/changelog",
  getParentRoute: () => MarketingRoute
});
const MarketingCareersRoute = Route$m.update({
  id: "/careers",
  path: "/careers",
  getParentRoute: () => MarketingRoute
});
const MarketingAffiliatesRoute = Route$l.update({
  id: "/affiliates",
  path: "/affiliates",
  getParentRoute: () => MarketingRoute
});
const MarketingAboutRoute = Route$k.update({
  id: "/about",
  path: "/about",
  getParentRoute: () => MarketingRoute
});
const MarketingFreeToolsIndexRoute = Route$j.update({
  id: "/free-tools/",
  path: "/free-tools/",
  getParentRoute: () => MarketingRoute
});
const MarketingFeaturesIndexRoute = Route$i.update({
  id: "/features/",
  path: "/features/",
  getParentRoute: () => MarketingRoute
});
const MarketingFreeToolsAiVisibilityCheckerRoute = Route$h.update({
  id: "/free-tools/ai-visibility-checker",
  path: "/free-tools/ai-visibility-checker",
  getParentRoute: () => MarketingRoute
});
const MarketingFeaturesSiteAuditRoute = Route$g.update({
  id: "/features/site-audit",
  path: "/features/site-audit",
  getParentRoute: () => MarketingRoute
});
const MarketingFeaturesSavedKeywordsRoute = Route$f.update({
  id: "/features/saved-keywords",
  path: "/features/saved-keywords",
  getParentRoute: () => MarketingRoute
});
const MarketingFeaturesRankTrackingRoute = Route$e.update({
  id: "/features/rank-tracking",
  path: "/features/rank-tracking",
  getParentRoute: () => MarketingRoute
});
const MarketingFeaturesMcpRoute = Route$d.update({
  id: "/features/mcp",
  path: "/features/mcp",
  getParentRoute: () => MarketingRoute
});
const MarketingFeaturesKeywordResearchRoute = Route$c.update({
  id: "/features/keyword-research",
  path: "/features/keyword-research",
  getParentRoute: () => MarketingRoute
});
const MarketingFeaturesDomainOverviewRoute = Route$b.update({
  id: "/features/domain-overview",
  path: "/features/domain-overview",
  getParentRoute: () => MarketingRoute
});
const MarketingFeaturesBacklinkCheckerRoute = Route$a.update({
  id: "/features/backlink-checker",
  path: "/features/backlink-checker",
  getParentRoute: () => MarketingRoute
});
const MarketingFeaturesAiSearchPromptsRoute = Route$9.update({
  id: "/features/ai-search-prompts",
  path: "/features/ai-search-prompts",
  getParentRoute: () => MarketingRoute
});
const MarketingFeaturesAiBrandVisibilityRoute = Route$8.update({
  id: "/features/ai-brand-visibility",
  path: "/features/ai-brand-visibility",
  getParentRoute: () => MarketingRoute
});
const MarketingLibraryKeywordResearchIndexRoute = Route$7.update({
  id: "/library/keyword-research/",
  path: "/library/keyword-research/",
  getParentRoute: () => MarketingRoute
});
const MarketingLibraryAiSearchGeoIndexRoute = Route$6.update({
  id: "/library/ai-search-geo/",
  path: "/library/ai-search-geo/",
  getParentRoute: () => MarketingRoute
});
const MarketingLibraryKeywordResearchSeedFromConversationRoute = Route$5.update({
  id: "/library/keyword-research/seed-from-conversation",
  path: "/library/keyword-research/seed-from-conversation",
  getParentRoute: () => MarketingRoute
});
const MarketingLibraryKeywordResearchSearchIntentMappingRoute = Route$4.update({
  id: "/library/keyword-research/search-intent-mapping",
  path: "/library/keyword-research/search-intent-mapping",
  getParentRoute: () => MarketingRoute
});
const MarketingLibraryKeywordResearchLongTailQuestionMiningRoute = Route$3.update({
  id: "/library/keyword-research/long-tail-question-mining",
  path: "/library/keyword-research/long-tail-question-mining",
  getParentRoute: () => MarketingRoute
});
const MarketingLibraryKeywordResearchClusterTopicalHubsRoute = Route$2.update({
  id: "/library/keyword-research/cluster-topical-hubs",
  path: "/library/keyword-research/cluster-topical-hubs",
  getParentRoute: () => MarketingRoute
});
const MarketingLibraryAiSearchGeoTrackAiVisibilityRoute = Route$1.update({
  id: "/library/ai-search-geo/track-ai-visibility",
  path: "/library/ai-search-geo/track-ai-visibility",
  getParentRoute: () => MarketingRoute
});
const MarketingLibraryAiSearchGeoAppearInChatgptResultsRoute = Route.update({
  id: "/library/ai-search-geo/appear-in-chatgpt-results",
  path: "/library/ai-search-geo/appear-in-chatgpt-results",
  getParentRoute: () => MarketingRoute
});
const MarketingRouteChildren = {
  MarketingAboutRoute,
  MarketingAffiliatesRoute,
  MarketingCareersRoute,
  MarketingChangelogRoute,
  MarketingContactRoute,
  MarketingGoogleSearchConsoleMcpRoute,
  MarketingOpenSourceSeoRoute,
  MarketingPricingRoute,
  MarketingIndexRoute,
  MarketingFeaturesAiBrandVisibilityRoute,
  MarketingFeaturesAiSearchPromptsRoute,
  MarketingFeaturesBacklinkCheckerRoute,
  MarketingFeaturesDomainOverviewRoute,
  MarketingFeaturesKeywordResearchRoute,
  MarketingFeaturesMcpRoute,
  MarketingFeaturesRankTrackingRoute,
  MarketingFeaturesSavedKeywordsRoute,
  MarketingFeaturesSiteAuditRoute,
  MarketingFreeToolsAiVisibilityCheckerRoute,
  MarketingFeaturesIndexRoute,
  MarketingFreeToolsIndexRoute,
  MarketingLibraryAiSearchGeoAppearInChatgptResultsRoute,
  MarketingLibraryAiSearchGeoTrackAiVisibilityRoute,
  MarketingLibraryKeywordResearchClusterTopicalHubsRoute,
  MarketingLibraryKeywordResearchLongTailQuestionMiningRoute,
  MarketingLibraryKeywordResearchSearchIntentMappingRoute,
  MarketingLibraryKeywordResearchSeedFromConversationRoute,
  MarketingLibraryAiSearchGeoIndexRoute,
  MarketingLibraryKeywordResearchIndexRoute
};
const MarketingRouteWithChildren = MarketingRoute._addFileChildren(
  MarketingRouteChildren
);
const rootRouteChildren = {
  MarketingRoute: MarketingRouteWithChildren,
  CookiePolicyRoute,
  DpaRoute,
  PrivacyRoute,
  RefundPolicyRoute,
  TermsAndConditionsRoute,
  ApiAiVisibilityRoute,
  ApiEventRoute,
  ApiSubscribeRoute,
  BlogsSplatRoute,
  DocsSplatRoute,
  GuidesSplatRoute,
  JsScriptDotjsRoute,
  BlogsIndexRoute,
  DocsIndexRoute,
  GuidesIndexRoute
};
const routeTree = Route$J._addFileChildren(rootRouteChildren)._addFileTypes();
function BaseLinkItem({ ref, item, ...props }) {
  const pathname = usePathname();
  const activeType = item.active ?? "url";
  const active = activeType !== "none" && isActive(item.url, pathname, activeType === "nested-url");
  return jsx(Link2, { ref, href: item.url, external: item.external, ...props, "data-active": active, children: props.children });
}
function getLinks(links = [], githubUrl) {
  let result = links ?? [];
  if (githubUrl)
    result = [
      ...result,
      {
        type: "icon",
        url: githubUrl,
        text: "Github",
        label: "GitHub",
        icon: jsx("svg", { role: "img", viewBox: "0 0 24 24", fill: "currentColor", children: jsx("path", { d: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" }) }),
        external: true
      }
    ];
  return result;
}
function useEscapeKeydown(onEscapeKeyDownProp, ownerDocument = globalThis?.document) {
  const onEscapeKeyDown = useCallbackRef$1(onEscapeKeyDownProp);
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onEscapeKeyDown(event);
      }
    };
    ownerDocument.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => ownerDocument.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [onEscapeKeyDown, ownerDocument]);
}
var DISMISSABLE_LAYER_NAME = "DismissableLayer";
var CONTEXT_UPDATE = "dismissableLayer.update";
var POINTER_DOWN_OUTSIDE = "dismissableLayer.pointerDownOutside";
var FOCUS_OUTSIDE = "dismissableLayer.focusOutside";
var originalBodyPointerEvents;
var DismissableLayerContext = React.createContext({
  layers: /* @__PURE__ */ new Set(),
  layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
  branches: /* @__PURE__ */ new Set()
});
var DismissableLayer = React.forwardRef(
  (props, forwardedRef) => {
    const {
      disableOutsidePointerEvents = false,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      onDismiss,
      ...layerProps
    } = props;
    const context = React.useContext(DismissableLayerContext);
    const [node, setNode] = React.useState(null);
    const ownerDocument = node?.ownerDocument ?? globalThis?.document;
    const [, force] = React.useState({});
    const composedRefs = useComposedRefs(forwardedRef, (node2) => setNode(node2));
    const layers = Array.from(context.layers);
    const [highestLayerWithOutsidePointerEventsDisabled] = [...context.layersWithOutsidePointerEventsDisabled].slice(-1);
    const highestLayerWithOutsidePointerEventsDisabledIndex = layers.indexOf(highestLayerWithOutsidePointerEventsDisabled);
    const index2 = node ? layers.indexOf(node) : -1;
    const isBodyPointerEventsDisabled = context.layersWithOutsidePointerEventsDisabled.size > 0;
    const isPointerEventsEnabled = index2 >= highestLayerWithOutsidePointerEventsDisabledIndex;
    const pointerDownOutside = usePointerDownOutside((event) => {
      const target = event.target;
      const isPointerDownOnBranch = [...context.branches].some((branch) => branch.contains(target));
      if (!isPointerEventsEnabled || isPointerDownOnBranch) return;
      onPointerDownOutside?.(event);
      onInteractOutside?.(event);
      if (!event.defaultPrevented) onDismiss?.();
    }, ownerDocument);
    const focusOutside = useFocusOutside((event) => {
      const target = event.target;
      const isFocusInBranch = [...context.branches].some((branch) => branch.contains(target));
      if (isFocusInBranch) return;
      onFocusOutside?.(event);
      onInteractOutside?.(event);
      if (!event.defaultPrevented) onDismiss?.();
    }, ownerDocument);
    useEscapeKeydown((event) => {
      const isHighestLayer = index2 === context.layers.size - 1;
      if (!isHighestLayer) return;
      onEscapeKeyDown?.(event);
      if (!event.defaultPrevented && onDismiss) {
        event.preventDefault();
        onDismiss();
      }
    }, ownerDocument);
    React.useEffect(() => {
      if (!node) return;
      if (disableOutsidePointerEvents) {
        if (context.layersWithOutsidePointerEventsDisabled.size === 0) {
          originalBodyPointerEvents = ownerDocument.body.style.pointerEvents;
          ownerDocument.body.style.pointerEvents = "none";
        }
        context.layersWithOutsidePointerEventsDisabled.add(node);
      }
      context.layers.add(node);
      dispatchUpdate();
      return () => {
        if (disableOutsidePointerEvents && context.layersWithOutsidePointerEventsDisabled.size === 1) {
          ownerDocument.body.style.pointerEvents = originalBodyPointerEvents;
        }
      };
    }, [node, ownerDocument, disableOutsidePointerEvents, context]);
    React.useEffect(() => {
      return () => {
        if (!node) return;
        context.layers.delete(node);
        context.layersWithOutsidePointerEventsDisabled.delete(node);
        dispatchUpdate();
      };
    }, [node, context]);
    React.useEffect(() => {
      const handleUpdate = () => force({});
      document.addEventListener(CONTEXT_UPDATE, handleUpdate);
      return () => document.removeEventListener(CONTEXT_UPDATE, handleUpdate);
    }, []);
    return /* @__PURE__ */ jsx(
      Primitive.div,
      {
        ...layerProps,
        ref: composedRefs,
        style: {
          pointerEvents: isBodyPointerEventsDisabled ? isPointerEventsEnabled ? "auto" : "none" : void 0,
          ...props.style
        },
        onFocusCapture: composeEventHandlers(props.onFocusCapture, focusOutside.onFocusCapture),
        onBlurCapture: composeEventHandlers(props.onBlurCapture, focusOutside.onBlurCapture),
        onPointerDownCapture: composeEventHandlers(
          props.onPointerDownCapture,
          pointerDownOutside.onPointerDownCapture
        )
      }
    );
  }
);
DismissableLayer.displayName = DISMISSABLE_LAYER_NAME;
var BRANCH_NAME = "DismissableLayerBranch";
var DismissableLayerBranch = React.forwardRef((props, forwardedRef) => {
  const context = React.useContext(DismissableLayerContext);
  const ref = React.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  React.useEffect(() => {
    const node = ref.current;
    if (node) {
      context.branches.add(node);
      return () => {
        context.branches.delete(node);
      };
    }
  }, [context.branches]);
  return /* @__PURE__ */ jsx(Primitive.div, { ...props, ref: composedRefs });
});
DismissableLayerBranch.displayName = BRANCH_NAME;
function usePointerDownOutside(onPointerDownOutside, ownerDocument = globalThis?.document) {
  const handlePointerDownOutside = useCallbackRef$1(onPointerDownOutside);
  const isPointerInsideReactTreeRef = React.useRef(false);
  const handleClickRef = React.useRef(() => {
  });
  React.useEffect(() => {
    const handlePointerDown = (event) => {
      if (event.target && !isPointerInsideReactTreeRef.current) {
        let handleAndDispatchPointerDownOutsideEvent2 = function() {
          handleAndDispatchCustomEvent(
            POINTER_DOWN_OUTSIDE,
            handlePointerDownOutside,
            eventDetail,
            { discrete: true }
          );
        };
        const eventDetail = { originalEvent: event };
        if (event.pointerType === "touch") {
          ownerDocument.removeEventListener("click", handleClickRef.current);
          handleClickRef.current = handleAndDispatchPointerDownOutsideEvent2;
          ownerDocument.addEventListener("click", handleClickRef.current, { once: true });
        } else {
          handleAndDispatchPointerDownOutsideEvent2();
        }
      } else {
        ownerDocument.removeEventListener("click", handleClickRef.current);
      }
      isPointerInsideReactTreeRef.current = false;
    };
    const timerId = window.setTimeout(() => {
      ownerDocument.addEventListener("pointerdown", handlePointerDown);
    }, 0);
    return () => {
      window.clearTimeout(timerId);
      ownerDocument.removeEventListener("pointerdown", handlePointerDown);
      ownerDocument.removeEventListener("click", handleClickRef.current);
    };
  }, [ownerDocument, handlePointerDownOutside]);
  return {
    // ensures we check React component tree (not just DOM tree)
    onPointerDownCapture: () => isPointerInsideReactTreeRef.current = true
  };
}
function useFocusOutside(onFocusOutside, ownerDocument = globalThis?.document) {
  const handleFocusOutside = useCallbackRef$1(onFocusOutside);
  const isFocusInsideReactTreeRef = React.useRef(false);
  React.useEffect(() => {
    const handleFocus = (event) => {
      if (event.target && !isFocusInsideReactTreeRef.current) {
        const eventDetail = { originalEvent: event };
        handleAndDispatchCustomEvent(FOCUS_OUTSIDE, handleFocusOutside, eventDetail, {
          discrete: false
        });
      }
    };
    ownerDocument.addEventListener("focusin", handleFocus);
    return () => ownerDocument.removeEventListener("focusin", handleFocus);
  }, [ownerDocument, handleFocusOutside]);
  return {
    onFocusCapture: () => isFocusInsideReactTreeRef.current = true,
    onBlurCapture: () => isFocusInsideReactTreeRef.current = false
  };
}
function dispatchUpdate() {
  const event = new CustomEvent(CONTEXT_UPDATE);
  document.dispatchEvent(event);
}
function handleAndDispatchCustomEvent(name, handler, detail, { discrete }) {
  const target = detail.originalEvent.target;
  const event = new CustomEvent(name, { bubbles: false, cancelable: true, detail });
  if (handler) target.addEventListener(name, handler, { once: true });
  if (discrete) {
    dispatchDiscreteCustomEvent(target, event);
  } else {
    target.dispatchEvent(event);
  }
}
function usePrevious(value) {
  const ref = React.useRef({ value, previous: value });
  return React.useMemo(() => {
    if (ref.current.value !== value) {
      ref.current.previous = ref.current.value;
      ref.current.value = value;
    }
    return ref.current.previous;
  }, [value]);
}
var VISUALLY_HIDDEN_STYLES = Object.freeze({
  // See: https://github.com/twbs/bootstrap/blob/main/scss/mixins/_visually-hidden.scss
  position: "absolute",
  border: 0,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  wordWrap: "normal"
});
var NAME$1 = "VisuallyHidden";
var VisuallyHidden = React.forwardRef(
  (props, forwardedRef) => {
    return /* @__PURE__ */ jsx(
      Primitive.span,
      {
        ...props,
        ref: forwardedRef,
        style: { ...VISUALLY_HIDDEN_STYLES, ...props.style }
      }
    );
  }
);
VisuallyHidden.displayName = NAME$1;
var Root$1 = VisuallyHidden;
var NAVIGATION_MENU_NAME = "NavigationMenu";
var [Collection, useCollection, createCollectionScope] = createCollection(NAVIGATION_MENU_NAME);
var [FocusGroupCollection, useFocusGroupCollection, createFocusGroupCollectionScope] = createCollection(NAVIGATION_MENU_NAME);
var [createNavigationMenuContext] = createContextScope(
  NAVIGATION_MENU_NAME,
  [createCollectionScope, createFocusGroupCollectionScope]
);
var [NavigationMenuProviderImpl, useNavigationMenuContext] = createNavigationMenuContext(NAVIGATION_MENU_NAME);
var [ViewportContentProvider, useViewportContentContext] = createNavigationMenuContext(NAVIGATION_MENU_NAME);
var NavigationMenu$1 = React.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeNavigationMenu,
      value: valueProp,
      onValueChange,
      defaultValue,
      delayDuration = 200,
      skipDelayDuration = 300,
      orientation = "horizontal",
      dir,
      ...NavigationMenuProps
    } = props;
    const [navigationMenu, setNavigationMenu] = React.useState(null);
    const composedRef = useComposedRefs(forwardedRef, (node) => setNavigationMenu(node));
    const direction = useDirection(dir);
    const openTimerRef = React.useRef(0);
    const closeTimerRef = React.useRef(0);
    const skipDelayTimerRef = React.useRef(0);
    const [isOpenDelayed, setIsOpenDelayed] = React.useState(true);
    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: (value2) => {
        const isOpen = value2 !== "";
        const hasSkipDelayDuration = skipDelayDuration > 0;
        if (isOpen) {
          window.clearTimeout(skipDelayTimerRef.current);
          if (hasSkipDelayDuration) setIsOpenDelayed(false);
        } else {
          window.clearTimeout(skipDelayTimerRef.current);
          skipDelayTimerRef.current = window.setTimeout(
            () => setIsOpenDelayed(true),
            skipDelayDuration
          );
        }
        onValueChange?.(value2);
      },
      defaultProp: defaultValue ?? "",
      caller: NAVIGATION_MENU_NAME
    });
    const startCloseTimer = React.useCallback(() => {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = window.setTimeout(() => setValue(""), 150);
    }, [setValue]);
    const handleOpen = React.useCallback(
      (itemValue) => {
        window.clearTimeout(closeTimerRef.current);
        setValue(itemValue);
      },
      [setValue]
    );
    const handleDelayedOpen = React.useCallback(
      (itemValue) => {
        const isOpenItem = value === itemValue;
        if (isOpenItem) {
          window.clearTimeout(closeTimerRef.current);
        } else {
          openTimerRef.current = window.setTimeout(() => {
            window.clearTimeout(closeTimerRef.current);
            setValue(itemValue);
          }, delayDuration);
        }
      },
      [value, setValue, delayDuration]
    );
    React.useEffect(() => {
      return () => {
        window.clearTimeout(openTimerRef.current);
        window.clearTimeout(closeTimerRef.current);
        window.clearTimeout(skipDelayTimerRef.current);
      };
    }, []);
    return /* @__PURE__ */ jsx(
      NavigationMenuProvider,
      {
        scope: __scopeNavigationMenu,
        isRootMenu: true,
        value,
        dir: direction,
        orientation,
        rootNavigationMenu: navigationMenu,
        onTriggerEnter: (itemValue) => {
          window.clearTimeout(openTimerRef.current);
          if (isOpenDelayed) handleDelayedOpen(itemValue);
          else handleOpen(itemValue);
        },
        onTriggerLeave: () => {
          window.clearTimeout(openTimerRef.current);
          startCloseTimer();
        },
        onContentEnter: () => window.clearTimeout(closeTimerRef.current),
        onContentLeave: startCloseTimer,
        onItemSelect: (itemValue) => {
          setValue((prevValue) => prevValue === itemValue ? "" : itemValue);
        },
        onItemDismiss: () => setValue(""),
        children: /* @__PURE__ */ jsx(
          Primitive.nav,
          {
            "aria-label": "Main",
            "data-orientation": orientation,
            dir: direction,
            ...NavigationMenuProps,
            ref: composedRef
          }
        )
      }
    );
  }
);
NavigationMenu$1.displayName = NAVIGATION_MENU_NAME;
var SUB_NAME = "NavigationMenuSub";
var NavigationMenuSub = React.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeNavigationMenu,
      value: valueProp,
      onValueChange,
      defaultValue,
      orientation = "horizontal",
      ...subProps
    } = props;
    const context = useNavigationMenuContext(SUB_NAME, __scopeNavigationMenu);
    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onValueChange,
      defaultProp: defaultValue ?? "",
      caller: SUB_NAME
    });
    return /* @__PURE__ */ jsx(
      NavigationMenuProvider,
      {
        scope: __scopeNavigationMenu,
        isRootMenu: false,
        value,
        dir: context.dir,
        orientation,
        rootNavigationMenu: context.rootNavigationMenu,
        onTriggerEnter: (itemValue) => setValue(itemValue),
        onItemSelect: (itemValue) => setValue(itemValue),
        onItemDismiss: () => setValue(""),
        children: /* @__PURE__ */ jsx(Primitive.div, { "data-orientation": orientation, ...subProps, ref: forwardedRef })
      }
    );
  }
);
NavigationMenuSub.displayName = SUB_NAME;
var NavigationMenuProvider = (props) => {
  const {
    scope,
    isRootMenu,
    rootNavigationMenu,
    dir,
    orientation,
    children,
    value,
    onItemSelect,
    onItemDismiss,
    onTriggerEnter,
    onTriggerLeave,
    onContentEnter,
    onContentLeave
  } = props;
  const [viewport, setViewport] = React.useState(null);
  const [viewportContent, setViewportContent] = React.useState(/* @__PURE__ */ new Map());
  const [indicatorTrack, setIndicatorTrack] = React.useState(null);
  return /* @__PURE__ */ jsx(
    NavigationMenuProviderImpl,
    {
      scope,
      isRootMenu,
      rootNavigationMenu,
      value,
      previousValue: usePrevious(value),
      baseId: useId(),
      dir,
      orientation,
      viewport,
      onViewportChange: setViewport,
      indicatorTrack,
      onIndicatorTrackChange: setIndicatorTrack,
      onTriggerEnter: useCallbackRef$1(onTriggerEnter),
      onTriggerLeave: useCallbackRef$1(onTriggerLeave),
      onContentEnter: useCallbackRef$1(onContentEnter),
      onContentLeave: useCallbackRef$1(onContentLeave),
      onItemSelect: useCallbackRef$1(onItemSelect),
      onItemDismiss: useCallbackRef$1(onItemDismiss),
      onViewportContentChange: React.useCallback((contentValue, contentData) => {
        setViewportContent((prevContent) => {
          prevContent.set(contentValue, contentData);
          return new Map(prevContent);
        });
      }, []),
      onViewportContentRemove: React.useCallback((contentValue) => {
        setViewportContent((prevContent) => {
          if (!prevContent.has(contentValue)) return prevContent;
          prevContent.delete(contentValue);
          return new Map(prevContent);
        });
      }, []),
      children: /* @__PURE__ */ jsx(Collection.Provider, { scope, children: /* @__PURE__ */ jsx(ViewportContentProvider, { scope, items: viewportContent, children }) })
    }
  );
};
var LIST_NAME = "NavigationMenuList";
var NavigationMenuList$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeNavigationMenu, ...listProps } = props;
    const context = useNavigationMenuContext(LIST_NAME, __scopeNavigationMenu);
    const list = /* @__PURE__ */ jsx(Primitive.ul, { "data-orientation": context.orientation, ...listProps, ref: forwardedRef });
    return /* @__PURE__ */ jsx(Primitive.div, { style: { position: "relative" }, ref: context.onIndicatorTrackChange, children: /* @__PURE__ */ jsx(Collection.Slot, { scope: __scopeNavigationMenu, children: context.isRootMenu ? /* @__PURE__ */ jsx(FocusGroup, { asChild: true, children: list }) : list }) });
  }
);
NavigationMenuList$1.displayName = LIST_NAME;
var ITEM_NAME = "NavigationMenuItem";
var [NavigationMenuItemContextProvider, useNavigationMenuItemContext] = createNavigationMenuContext(ITEM_NAME);
var NavigationMenuItem$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeNavigationMenu, value: valueProp, ...itemProps } = props;
    const autoValue = useId();
    const value = valueProp || autoValue || "LEGACY_REACT_AUTO_VALUE";
    const contentRef = React.useRef(null);
    const triggerRef = React.useRef(null);
    const focusProxyRef = React.useRef(null);
    const restoreContentTabOrderRef = React.useRef(() => {
    });
    const wasEscapeCloseRef = React.useRef(false);
    const handleContentEntry = React.useCallback((side = "start") => {
      if (contentRef.current) {
        restoreContentTabOrderRef.current();
        const candidates = getTabbableCandidates$1(contentRef.current);
        if (candidates.length) focusFirst$1(side === "start" ? candidates : candidates.reverse());
      }
    }, []);
    const handleContentExit = React.useCallback(() => {
      if (contentRef.current) {
        const candidates = getTabbableCandidates$1(contentRef.current);
        if (candidates.length) restoreContentTabOrderRef.current = removeFromTabOrder(candidates);
      }
    }, []);
    return /* @__PURE__ */ jsx(
      NavigationMenuItemContextProvider,
      {
        scope: __scopeNavigationMenu,
        value,
        triggerRef,
        contentRef,
        focusProxyRef,
        wasEscapeCloseRef,
        onEntryKeyDown: handleContentEntry,
        onFocusProxyEnter: handleContentEntry,
        onRootContentClose: handleContentExit,
        onContentFocusOutside: handleContentExit,
        children: /* @__PURE__ */ jsx(Primitive.li, { ...itemProps, ref: forwardedRef })
      }
    );
  }
);
NavigationMenuItem$1.displayName = ITEM_NAME;
var TRIGGER_NAME$1 = "NavigationMenuTrigger";
var NavigationMenuTrigger$1 = React.forwardRef((props, forwardedRef) => {
  const { __scopeNavigationMenu, disabled, ...triggerProps } = props;
  const context = useNavigationMenuContext(TRIGGER_NAME$1, props.__scopeNavigationMenu);
  const itemContext = useNavigationMenuItemContext(TRIGGER_NAME$1, props.__scopeNavigationMenu);
  const ref = React.useRef(null);
  const composedRefs = useComposedRefs(ref, itemContext.triggerRef, forwardedRef);
  const triggerId = makeTriggerId(context.baseId, itemContext.value);
  const contentId = makeContentId(context.baseId, itemContext.value);
  const hasPointerMoveOpenedRef = React.useRef(false);
  const wasClickCloseRef = React.useRef(false);
  const open = itemContext.value === context.value;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Collection.ItemSlot, { scope: __scopeNavigationMenu, value: itemContext.value, children: /* @__PURE__ */ jsx(FocusGroupItem, { asChild: true, children: /* @__PURE__ */ jsx(
      Primitive.button,
      {
        id: triggerId,
        disabled,
        "data-disabled": disabled ? "" : void 0,
        "data-state": getOpenState(open),
        "aria-expanded": open,
        "aria-controls": contentId,
        ...triggerProps,
        ref: composedRefs,
        onPointerEnter: composeEventHandlers(props.onPointerEnter, () => {
          wasClickCloseRef.current = false;
          itemContext.wasEscapeCloseRef.current = false;
        }),
        onPointerMove: composeEventHandlers(
          props.onPointerMove,
          whenMouse(() => {
            if (disabled || wasClickCloseRef.current || itemContext.wasEscapeCloseRef.current || hasPointerMoveOpenedRef.current)
              return;
            context.onTriggerEnter(itemContext.value);
            hasPointerMoveOpenedRef.current = true;
          })
        ),
        onPointerLeave: composeEventHandlers(
          props.onPointerLeave,
          whenMouse(() => {
            if (disabled) return;
            context.onTriggerLeave();
            hasPointerMoveOpenedRef.current = false;
          })
        ),
        onClick: composeEventHandlers(props.onClick, () => {
          context.onItemSelect(itemContext.value);
          wasClickCloseRef.current = open;
        }),
        onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
          const verticalEntryKey = context.dir === "rtl" ? "ArrowLeft" : "ArrowRight";
          const entryKey = { horizontal: "ArrowDown", vertical: verticalEntryKey }[context.orientation];
          if (open && event.key === entryKey) {
            itemContext.onEntryKeyDown();
            event.preventDefault();
          }
        })
      }
    ) }) }),
    open && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        Root$1,
        {
          "aria-hidden": true,
          tabIndex: 0,
          ref: itemContext.focusProxyRef,
          onFocus: (event) => {
            const content = itemContext.contentRef.current;
            const prevFocusedElement = event.relatedTarget;
            const wasTriggerFocused = prevFocusedElement === ref.current;
            const wasFocusFromContent = content?.contains(prevFocusedElement);
            if (wasTriggerFocused || !wasFocusFromContent) {
              itemContext.onFocusProxyEnter(wasTriggerFocused ? "start" : "end");
            }
          }
        }
      ),
      context.viewport && /* @__PURE__ */ jsx("span", { "aria-owns": contentId })
    ] })
  ] });
});
NavigationMenuTrigger$1.displayName = TRIGGER_NAME$1;
var LINK_NAME = "NavigationMenuLink";
var LINK_SELECT = "navigationMenu.linkSelect";
var NavigationMenuLink$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeNavigationMenu, active, onSelect, ...linkProps } = props;
    return /* @__PURE__ */ jsx(FocusGroupItem, { asChild: true, children: /* @__PURE__ */ jsx(
      Primitive.a,
      {
        "data-active": active ? "" : void 0,
        "aria-current": active ? "page" : void 0,
        ...linkProps,
        ref: forwardedRef,
        onClick: composeEventHandlers(
          props.onClick,
          (event) => {
            const target = event.target;
            const linkSelectEvent = new CustomEvent(LINK_SELECT, {
              bubbles: true,
              cancelable: true
            });
            target.addEventListener(LINK_SELECT, (event2) => onSelect?.(event2), { once: true });
            dispatchDiscreteCustomEvent(target, linkSelectEvent);
            if (!linkSelectEvent.defaultPrevented && !event.metaKey) {
              const rootContentDismissEvent = new CustomEvent(ROOT_CONTENT_DISMISS, {
                bubbles: true,
                cancelable: true
              });
              dispatchDiscreteCustomEvent(target, rootContentDismissEvent);
            }
          },
          { checkForDefaultPrevented: false }
        )
      }
    ) });
  }
);
NavigationMenuLink$1.displayName = LINK_NAME;
var INDICATOR_NAME = "NavigationMenuIndicator";
var NavigationMenuIndicator = React.forwardRef((props, forwardedRef) => {
  const { forceMount, ...indicatorProps } = props;
  const context = useNavigationMenuContext(INDICATOR_NAME, props.__scopeNavigationMenu);
  const isVisible = Boolean(context.value);
  return context.indicatorTrack ? ReactDOM__default.createPortal(
    /* @__PURE__ */ jsx(Presence, { present: forceMount || isVisible, children: /* @__PURE__ */ jsx(NavigationMenuIndicatorImpl, { ...indicatorProps, ref: forwardedRef }) }),
    context.indicatorTrack
  ) : null;
});
NavigationMenuIndicator.displayName = INDICATOR_NAME;
var NavigationMenuIndicatorImpl = React.forwardRef((props, forwardedRef) => {
  const { __scopeNavigationMenu, ...indicatorProps } = props;
  const context = useNavigationMenuContext(INDICATOR_NAME, __scopeNavigationMenu);
  const getItems = useCollection(__scopeNavigationMenu);
  const [activeTrigger, setActiveTrigger] = React.useState(
    null
  );
  const [position, setPosition] = React.useState(null);
  const isHorizontal = context.orientation === "horizontal";
  const isVisible = Boolean(context.value);
  React.useEffect(() => {
    const items = getItems();
    const triggerNode = items.find((item) => item.value === context.value)?.ref.current;
    if (triggerNode) setActiveTrigger(triggerNode);
  }, [getItems, context.value]);
  const handlePositionChange = () => {
    if (activeTrigger) {
      setPosition({
        size: isHorizontal ? activeTrigger.offsetWidth : activeTrigger.offsetHeight,
        offset: isHorizontal ? activeTrigger.offsetLeft : activeTrigger.offsetTop
      });
    }
  };
  useResizeObserver(activeTrigger, handlePositionChange);
  useResizeObserver(context.indicatorTrack, handlePositionChange);
  return position ? /* @__PURE__ */ jsx(
    Primitive.div,
    {
      "aria-hidden": true,
      "data-state": isVisible ? "visible" : "hidden",
      "data-orientation": context.orientation,
      ...indicatorProps,
      ref: forwardedRef,
      style: {
        position: "absolute",
        ...isHorizontal ? {
          left: 0,
          width: position.size + "px",
          transform: `translateX(${position.offset}px)`
        } : {
          top: 0,
          height: position.size + "px",
          transform: `translateY(${position.offset}px)`
        },
        ...indicatorProps.style
      }
    }
  ) : null;
});
var CONTENT_NAME$2 = "NavigationMenuContent";
var NavigationMenuContent$1 = React.forwardRef((props, forwardedRef) => {
  const { forceMount, ...contentProps } = props;
  const context = useNavigationMenuContext(CONTENT_NAME$2, props.__scopeNavigationMenu);
  const itemContext = useNavigationMenuItemContext(CONTENT_NAME$2, props.__scopeNavigationMenu);
  const composedRefs = useComposedRefs(itemContext.contentRef, forwardedRef);
  const open = itemContext.value === context.value;
  const commonProps = {
    value: itemContext.value,
    triggerRef: itemContext.triggerRef,
    focusProxyRef: itemContext.focusProxyRef,
    wasEscapeCloseRef: itemContext.wasEscapeCloseRef,
    onContentFocusOutside: itemContext.onContentFocusOutside,
    onRootContentClose: itemContext.onRootContentClose,
    ...contentProps
  };
  return !context.viewport ? /* @__PURE__ */ jsx(Presence, { present: forceMount || open, children: /* @__PURE__ */ jsx(
    NavigationMenuContentImpl,
    {
      "data-state": getOpenState(open),
      ...commonProps,
      ref: composedRefs,
      onPointerEnter: composeEventHandlers(props.onPointerEnter, context.onContentEnter),
      onPointerLeave: composeEventHandlers(
        props.onPointerLeave,
        whenMouse(context.onContentLeave)
      ),
      style: {
        // Prevent interaction when animating out
        pointerEvents: !open && context.isRootMenu ? "none" : void 0,
        ...commonProps.style
      }
    }
  ) }) : /* @__PURE__ */ jsx(ViewportContentMounter, { forceMount, ...commonProps, ref: composedRefs });
});
NavigationMenuContent$1.displayName = CONTENT_NAME$2;
var ViewportContentMounter = React.forwardRef((props, forwardedRef) => {
  const context = useNavigationMenuContext(CONTENT_NAME$2, props.__scopeNavigationMenu);
  const { onViewportContentChange, onViewportContentRemove } = context;
  useLayoutEffect2(() => {
    onViewportContentChange(props.value, {
      ref: forwardedRef,
      ...props
    });
  }, [props, forwardedRef, onViewportContentChange]);
  useLayoutEffect2(() => {
    return () => onViewportContentRemove(props.value);
  }, [props.value, onViewportContentRemove]);
  return null;
});
var ROOT_CONTENT_DISMISS = "navigationMenu.rootContentDismiss";
var NavigationMenuContentImpl = React.forwardRef((props, forwardedRef) => {
  const {
    __scopeNavigationMenu,
    value,
    triggerRef,
    focusProxyRef,
    wasEscapeCloseRef,
    onRootContentClose,
    onContentFocusOutside,
    ...contentProps
  } = props;
  const context = useNavigationMenuContext(CONTENT_NAME$2, __scopeNavigationMenu);
  const ref = React.useRef(null);
  const composedRefs = useComposedRefs(ref, forwardedRef);
  const triggerId = makeTriggerId(context.baseId, value);
  const contentId = makeContentId(context.baseId, value);
  const getItems = useCollection(__scopeNavigationMenu);
  const prevMotionAttributeRef = React.useRef(null);
  const { onItemDismiss } = context;
  React.useEffect(() => {
    const content = ref.current;
    if (context.isRootMenu && content) {
      const handleClose = () => {
        onItemDismiss();
        onRootContentClose();
        if (content.contains(document.activeElement)) triggerRef.current?.focus();
      };
      content.addEventListener(ROOT_CONTENT_DISMISS, handleClose);
      return () => content.removeEventListener(ROOT_CONTENT_DISMISS, handleClose);
    }
  }, [context.isRootMenu, props.value, triggerRef, onItemDismiss, onRootContentClose]);
  const motionAttribute = React.useMemo(() => {
    const items = getItems();
    const values = items.map((item) => item.value);
    if (context.dir === "rtl") values.reverse();
    const index2 = values.indexOf(context.value);
    const prevIndex = values.indexOf(context.previousValue);
    const isSelected = value === context.value;
    const wasSelected = prevIndex === values.indexOf(value);
    if (!isSelected && !wasSelected) return prevMotionAttributeRef.current;
    const attribute = (() => {
      if (index2 !== prevIndex) {
        if (isSelected && prevIndex !== -1) return index2 > prevIndex ? "from-end" : "from-start";
        if (wasSelected && index2 !== -1) return index2 > prevIndex ? "to-start" : "to-end";
      }
      return null;
    })();
    prevMotionAttributeRef.current = attribute;
    return attribute;
  }, [context.previousValue, context.value, context.dir, getItems, value]);
  return /* @__PURE__ */ jsx(FocusGroup, { asChild: true, children: /* @__PURE__ */ jsx(
    DismissableLayer,
    {
      id: contentId,
      "aria-labelledby": triggerId,
      "data-motion": motionAttribute,
      "data-orientation": context.orientation,
      ...contentProps,
      ref: composedRefs,
      disableOutsidePointerEvents: false,
      onDismiss: () => {
        const rootContentDismissEvent = new Event(ROOT_CONTENT_DISMISS, {
          bubbles: true,
          cancelable: true
        });
        ref.current?.dispatchEvent(rootContentDismissEvent);
      },
      onFocusOutside: composeEventHandlers(props.onFocusOutside, (event) => {
        onContentFocusOutside();
        const target = event.target;
        if (context.rootNavigationMenu?.contains(target)) event.preventDefault();
      }),
      onPointerDownOutside: composeEventHandlers(props.onPointerDownOutside, (event) => {
        const target = event.target;
        const isTrigger = getItems().some((item) => item.ref.current?.contains(target));
        const isRootViewport = context.isRootMenu && context.viewport?.contains(target);
        if (isTrigger || isRootViewport || !context.isRootMenu) event.preventDefault();
      }),
      onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
        const isMetaKey = event.altKey || event.ctrlKey || event.metaKey;
        const isTabKey = event.key === "Tab" && !isMetaKey;
        if (isTabKey) {
          const candidates = getTabbableCandidates$1(event.currentTarget);
          const focusedElement = document.activeElement;
          const index2 = candidates.findIndex((candidate) => candidate === focusedElement);
          const isMovingBackwards = event.shiftKey;
          const nextCandidates = isMovingBackwards ? candidates.slice(0, index2).reverse() : candidates.slice(index2 + 1, candidates.length);
          if (focusFirst$1(nextCandidates)) {
            event.preventDefault();
          } else {
            focusProxyRef.current?.focus();
          }
        }
      }),
      onEscapeKeyDown: composeEventHandlers(props.onEscapeKeyDown, (_event) => {
        wasEscapeCloseRef.current = true;
      })
    }
  ) });
});
var VIEWPORT_NAME = "NavigationMenuViewport";
var NavigationMenuViewport$1 = React.forwardRef((props, forwardedRef) => {
  const { forceMount, ...viewportProps } = props;
  const context = useNavigationMenuContext(VIEWPORT_NAME, props.__scopeNavigationMenu);
  const open = Boolean(context.value);
  return /* @__PURE__ */ jsx(Presence, { present: forceMount || open, children: /* @__PURE__ */ jsx(NavigationMenuViewportImpl, { ...viewportProps, ref: forwardedRef }) });
});
NavigationMenuViewport$1.displayName = VIEWPORT_NAME;
var NavigationMenuViewportImpl = React.forwardRef((props, forwardedRef) => {
  const { __scopeNavigationMenu, children, ...viewportImplProps } = props;
  const context = useNavigationMenuContext(VIEWPORT_NAME, __scopeNavigationMenu);
  const composedRefs = useComposedRefs(forwardedRef, context.onViewportChange);
  const viewportContentContext = useViewportContentContext(
    CONTENT_NAME$2,
    props.__scopeNavigationMenu
  );
  const [size2, setSize] = React.useState(null);
  const [content, setContent] = React.useState(null);
  const viewportWidth = size2 ? size2?.width + "px" : void 0;
  const viewportHeight = size2 ? size2?.height + "px" : void 0;
  const open = Boolean(context.value);
  const activeContentValue = open ? context.value : context.previousValue;
  const handleSizeChange = () => {
    if (content) setSize({ width: content.offsetWidth, height: content.offsetHeight });
  };
  useResizeObserver(content, handleSizeChange);
  return /* @__PURE__ */ jsx(
    Primitive.div,
    {
      "data-state": getOpenState(open),
      "data-orientation": context.orientation,
      ...viewportImplProps,
      ref: composedRefs,
      style: {
        // Prevent interaction when animating out
        pointerEvents: !open && context.isRootMenu ? "none" : void 0,
        ["--radix-navigation-menu-viewport-width"]: viewportWidth,
        ["--radix-navigation-menu-viewport-height"]: viewportHeight,
        ...viewportImplProps.style
      },
      onPointerEnter: composeEventHandlers(props.onPointerEnter, context.onContentEnter),
      onPointerLeave: composeEventHandlers(props.onPointerLeave, whenMouse(context.onContentLeave)),
      children: Array.from(viewportContentContext.items).map(([value, { ref, forceMount, ...props2 }]) => {
        const isActive2 = activeContentValue === value;
        return /* @__PURE__ */ jsx(Presence, { present: forceMount || isActive2, children: /* @__PURE__ */ jsx(
          NavigationMenuContentImpl,
          {
            ...props2,
            ref: composeRefs(ref, (node) => {
              if (isActive2 && node) setContent(node);
            })
          }
        ) }, value);
      })
    }
  );
});
var FOCUS_GROUP_NAME = "FocusGroup";
var FocusGroup = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeNavigationMenu, ...groupProps } = props;
    const context = useNavigationMenuContext(FOCUS_GROUP_NAME, __scopeNavigationMenu);
    return /* @__PURE__ */ jsx(FocusGroupCollection.Provider, { scope: __scopeNavigationMenu, children: /* @__PURE__ */ jsx(FocusGroupCollection.Slot, { scope: __scopeNavigationMenu, children: /* @__PURE__ */ jsx(Primitive.div, { dir: context.dir, ...groupProps, ref: forwardedRef }) }) });
  }
);
var ARROW_KEYS = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];
var FOCUS_GROUP_ITEM_NAME = "FocusGroupItem";
var FocusGroupItem = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeNavigationMenu, ...groupProps } = props;
    const getItems = useFocusGroupCollection(__scopeNavigationMenu);
    const context = useNavigationMenuContext(FOCUS_GROUP_ITEM_NAME, __scopeNavigationMenu);
    return /* @__PURE__ */ jsx(FocusGroupCollection.ItemSlot, { scope: __scopeNavigationMenu, children: /* @__PURE__ */ jsx(
      Primitive.button,
      {
        ...groupProps,
        ref: forwardedRef,
        onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
          const isFocusNavigationKey = ["Home", "End", ...ARROW_KEYS].includes(event.key);
          if (isFocusNavigationKey) {
            let candidateNodes = getItems().map((item) => item.ref.current);
            const prevItemKey = context.dir === "rtl" ? "ArrowRight" : "ArrowLeft";
            const prevKeys = [prevItemKey, "ArrowUp", "End"];
            if (prevKeys.includes(event.key)) candidateNodes.reverse();
            if (ARROW_KEYS.includes(event.key)) {
              const currentIndex = candidateNodes.indexOf(event.currentTarget);
              candidateNodes = candidateNodes.slice(currentIndex + 1);
            }
            setTimeout(() => focusFirst$1(candidateNodes));
            event.preventDefault();
          }
        })
      }
    ) });
  }
);
function getTabbableCandidates$1(container) {
  const nodes = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      const isHiddenInput = node.tagName === "INPUT" && node.type === "hidden";
      if (node.disabled || node.hidden || isHiddenInput) return NodeFilter.FILTER_SKIP;
      return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}
function focusFirst$1(candidates) {
  const previouslyFocusedElement = document.activeElement;
  return candidates.some((candidate) => {
    if (candidate === previouslyFocusedElement) return true;
    candidate.focus();
    return document.activeElement !== previouslyFocusedElement;
  });
}
function removeFromTabOrder(candidates) {
  candidates.forEach((candidate) => {
    candidate.dataset.tabindex = candidate.getAttribute("tabindex") || "";
    candidate.setAttribute("tabindex", "-1");
  });
  return () => {
    candidates.forEach((candidate) => {
      const prevTabIndex = candidate.dataset.tabindex;
      candidate.setAttribute("tabindex", prevTabIndex);
    });
  };
}
function useResizeObserver(element, onResize) {
  const handleResize = useCallbackRef$1(onResize);
  useLayoutEffect2(() => {
    let rAF = 0;
    if (element) {
      const resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(rAF);
        rAF = window.requestAnimationFrame(handleResize);
      });
      resizeObserver.observe(element);
      return () => {
        window.cancelAnimationFrame(rAF);
        resizeObserver.unobserve(element);
      };
    }
  }, [element, handleResize]);
}
function getOpenState(open) {
  return open ? "open" : "closed";
}
function makeTriggerId(baseId, value) {
  return `${baseId}-trigger-${value}`;
}
function makeContentId(baseId, value) {
  return `${baseId}-content-${value}`;
}
function whenMouse(handler) {
  return (event) => event.pointerType === "mouse" ? handler(event) : void 0;
}
var Root2$2 = NavigationMenu$1;
var List = NavigationMenuList$1;
var Trigger$1 = NavigationMenuTrigger$1;
var Link = NavigationMenuLink$1;
var Content$1 = NavigationMenuContent$1;
var Viewport = NavigationMenuViewport$1;
const NavigationMenu = Root2$2;
const NavigationMenuList = List;
const NavigationMenuItem = React.forwardRef(({ className, children, ...props }, ref) => jsx(NavigationMenuItem$1, { ref, className: twMerge("list-none", className), ...props, children }));
NavigationMenuItem.displayName = NavigationMenuItem$1.displayName;
const NavigationMenuTrigger = React.forwardRef(({ className, children, ...props }, ref) => jsx(Trigger$1, { ref, className: twMerge("data-[state=open]:bg-fd-accent/50", className), ...props, children }));
NavigationMenuTrigger.displayName = Trigger$1.displayName;
const NavigationMenuContent = React.forwardRef(({ className, ...props }, ref) => jsx(Content$1, { ref, className: twMerge("absolute inset-x-0 top-0 overflow-auto fd-scroll-container max-h-[80svh] data-[motion=from-end]:animate-fd-enterFromRight data-[motion=from-start]:animate-fd-enterFromLeft data-[motion=to-end]:animate-fd-exitToRight data-[motion=to-start]:animate-fd-exitToLeft", className), ...props }));
NavigationMenuContent.displayName = Content$1.displayName;
const NavigationMenuLink = Link;
const NavigationMenuViewport = React.forwardRef(({ className, ...props }, ref) => jsx("div", { ref, className: "flex w-full justify-center", children: jsx(Viewport, { ...props, className: twMerge("relative h-(--radix-navigation-menu-viewport-height) w-full origin-[top_center] overflow-hidden transition-[width,height] duration-300 data-[state=closed]:animate-fd-nav-menu-out data-[state=open]:animate-fd-nav-menu-in", className) }) }));
NavigationMenuViewport.displayName = Viewport.displayName;
const navItemVariants = cva("inline-flex items-center gap-1 p-2 text-fd-muted-foreground transition-colors hover:text-fd-accent-foreground data-[active=true]:text-fd-primary [&_svg]:size-4");
function Navbar(props) {
  const [value, setValue] = useState("");
  const { isTransparent } = useNav();
  return jsx(NavigationMenu, { value, onValueChange: setValue, asChild: true, children: jsxs("header", { id: "nd-nav", ...props, className: twMerge("fixed top-(--fd-banner-height) z-40 left-0 right-(--removed-body-scroll-bar-size,0) backdrop-blur-lg border-b transition-colors *:mx-auto *:max-w-fd-container", value.length > 0 && "max-lg:shadow-lg max-lg:rounded-b-2xl", (!isTransparent || value.length > 0) && "bg-fd-background/80", props.className), children: [jsx(NavigationMenuList, { className: "flex h-14 w-full items-center px-4", asChild: true, children: jsx("nav", { children: props.children }) }), jsx(NavigationMenuViewport, {})] }) });
}
const NavbarMenu = NavigationMenuItem;
function NavbarMenuContent(props) {
  return jsx(NavigationMenuContent, { ...props, className: twMerge("grid grid-cols-1 gap-2 p-4 md:grid-cols-2 lg:grid-cols-3", props.className), children: props.children });
}
function NavbarMenuTrigger(props) {
  return jsx(NavigationMenuTrigger, { ...props, className: twMerge(navItemVariants(), "rounded-md", props.className), children: props.children });
}
function NavbarMenuLink(props) {
  return jsx(NavigationMenuLink, { asChild: true, children: jsx(Link2, { ...props, className: twMerge("flex flex-col gap-2 rounded-lg border bg-fd-card p-3 transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground", props.className), children: props.children }) });
}
const linkVariants = cva("", {
  variants: {
    variant: {
      main: navItemVariants(),
      button: buttonVariants({
        color: "secondary",
        className: "gap-1.5 [&_svg]:size-4"
      }),
      icon: buttonVariants({
        color: "ghost",
        size: "icon"
      })
    }
  },
  defaultVariants: {
    variant: "main"
  }
});
function NavbarLink({ item, variant, ...props }) {
  return jsx(NavigationMenuItem, { children: jsx(NavigationMenuLink, { asChild: true, children: jsx(BaseLinkItem, { ...props, item, className: twMerge(linkVariants({ variant }), props.className), children: props.children }) }) });
}
function SearchToggle({ hideIfDisabled, size: size2 = "icon-sm", color = "ghost", ...props }) {
  const { setOpenSearch, enabled } = useSearchContext();
  if (hideIfDisabled && !enabled)
    return null;
  return jsx("button", { type: "button", className: twMerge(buttonVariants({
    size: size2,
    color
  }), props.className), "data-search": "", "aria-label": "Open Search", onClick: () => {
    setOpenSearch(true);
  }, children: jsx(Search, {}) });
}
function LargeSearchToggle({ hideIfDisabled, ...props }) {
  const { enabled, hotKey, setOpenSearch } = useSearchContext();
  const { text } = useI18n();
  if (hideIfDisabled && !enabled)
    return null;
  return jsxs("button", { type: "button", "data-search-full": "", ...props, className: twMerge("inline-flex items-center gap-2 rounded-lg border bg-fd-secondary/50 p-1.5 ps-2 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground", props.className), onClick: () => {
    setOpenSearch(true);
  }, children: [jsx(Search, { className: "size-4" }), text.search, jsx("div", { className: "ms-auto inline-flex gap-0.5", children: hotKey.map((k, i) => jsx("kbd", { className: "rounded-md border bg-fd-background px-1.5", children: k.display }, i)) })] });
}
const itemVariants = cva("size-6.5 rounded-full p-1.5 text-fd-muted-foreground", {
  variants: {
    active: {
      true: "bg-fd-accent text-fd-accent-foreground",
      false: "text-fd-muted-foreground"
    }
  }
});
const full = [
  ["light", Sun],
  ["dark", Moon],
  ["system", Airplay]
];
function ThemeToggle({ className, mode = "light-dark", ...props }) {
  const { setTheme, theme, resolvedTheme } = z();
  const [mounted, setMounted] = useState(false);
  useLayoutEffect(() => {
    setMounted(true);
  }, []);
  const container = twMerge("inline-flex items-center rounded-full border p-1", className);
  if (mode === "light-dark") {
    const value2 = mounted ? resolvedTheme : null;
    return jsx("button", { className: container, "aria-label": `Toggle Theme`, onClick: () => setTheme(value2 === "light" ? "dark" : "light"), "data-theme-toggle": "", ...props, children: full.map(([key, Icon]) => {
      if (key === "system")
        return;
      return jsx(Icon, { fill: "currentColor", className: twMerge(itemVariants({ active: value2 === key })) }, key);
    }) });
  }
  const value = mounted ? theme : null;
  return jsx("div", { className: container, "data-theme-toggle": "", ...props, children: full.map(([key, Icon]) => jsx("button", { "aria-label": key, className: twMerge(itemVariants({ active: value === key })), onClick: () => setTheme(key), children: jsx(Icon, { className: "size-full", fill: "currentColor" }) }, key)) });
}
var count = 0;
function useFocusGuards() {
  React.useEffect(() => {
    const edgeGuards = document.querySelectorAll("[data-radix-focus-guard]");
    document.body.insertAdjacentElement("afterbegin", edgeGuards[0] ?? createFocusGuard());
    document.body.insertAdjacentElement("beforeend", edgeGuards[1] ?? createFocusGuard());
    count++;
    return () => {
      if (count === 1) {
        document.querySelectorAll("[data-radix-focus-guard]").forEach((node) => node.remove());
      }
      count--;
    };
  }, []);
}
function createFocusGuard() {
  const element = document.createElement("span");
  element.setAttribute("data-radix-focus-guard", "");
  element.tabIndex = 0;
  element.style.outline = "none";
  element.style.opacity = "0";
  element.style.position = "fixed";
  element.style.pointerEvents = "none";
  return element;
}
var AUTOFOCUS_ON_MOUNT = "focusScope.autoFocusOnMount";
var AUTOFOCUS_ON_UNMOUNT = "focusScope.autoFocusOnUnmount";
var EVENT_OPTIONS = { bubbles: false, cancelable: true };
var FOCUS_SCOPE_NAME = "FocusScope";
var FocusScope = React.forwardRef((props, forwardedRef) => {
  const {
    loop = false,
    trapped = false,
    onMountAutoFocus: onMountAutoFocusProp,
    onUnmountAutoFocus: onUnmountAutoFocusProp,
    ...scopeProps
  } = props;
  const [container, setContainer] = React.useState(null);
  const onMountAutoFocus = useCallbackRef$1(onMountAutoFocusProp);
  const onUnmountAutoFocus = useCallbackRef$1(onUnmountAutoFocusProp);
  const lastFocusedElementRef = React.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, (node) => setContainer(node));
  const focusScope = React.useRef({
    paused: false,
    pause() {
      this.paused = true;
    },
    resume() {
      this.paused = false;
    }
  }).current;
  React.useEffect(() => {
    if (trapped) {
      let handleFocusIn2 = function(event) {
        if (focusScope.paused || !container) return;
        const target = event.target;
        if (container.contains(target)) {
          lastFocusedElementRef.current = target;
        } else {
          focus(lastFocusedElementRef.current, { select: true });
        }
      }, handleFocusOut2 = function(event) {
        if (focusScope.paused || !container) return;
        const relatedTarget = event.relatedTarget;
        if (relatedTarget === null) return;
        if (!container.contains(relatedTarget)) {
          focus(lastFocusedElementRef.current, { select: true });
        }
      }, handleMutations2 = function(mutations) {
        const focusedElement = document.activeElement;
        if (focusedElement !== document.body) return;
        for (const mutation of mutations) {
          if (mutation.removedNodes.length > 0) focus(container);
        }
      };
      document.addEventListener("focusin", handleFocusIn2);
      document.addEventListener("focusout", handleFocusOut2);
      const mutationObserver = new MutationObserver(handleMutations2);
      if (container) mutationObserver.observe(container, { childList: true, subtree: true });
      return () => {
        document.removeEventListener("focusin", handleFocusIn2);
        document.removeEventListener("focusout", handleFocusOut2);
        mutationObserver.disconnect();
      };
    }
  }, [trapped, container, focusScope.paused]);
  React.useEffect(() => {
    if (container) {
      focusScopesStack.add(focusScope);
      const previouslyFocusedElement = document.activeElement;
      const hasFocusedCandidate = container.contains(previouslyFocusedElement);
      if (!hasFocusedCandidate) {
        const mountEvent = new CustomEvent(AUTOFOCUS_ON_MOUNT, EVENT_OPTIONS);
        container.addEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus);
        container.dispatchEvent(mountEvent);
        if (!mountEvent.defaultPrevented) {
          focusFirst(removeLinks(getTabbableCandidates(container)), { select: true });
          if (document.activeElement === previouslyFocusedElement) {
            focus(container);
          }
        }
      }
      return () => {
        container.removeEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus);
        setTimeout(() => {
          const unmountEvent = new CustomEvent(AUTOFOCUS_ON_UNMOUNT, EVENT_OPTIONS);
          container.addEventListener(AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus);
          container.dispatchEvent(unmountEvent);
          if (!unmountEvent.defaultPrevented) {
            focus(previouslyFocusedElement ?? document.body, { select: true });
          }
          container.removeEventListener(AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus);
          focusScopesStack.remove(focusScope);
        }, 0);
      };
    }
  }, [container, onMountAutoFocus, onUnmountAutoFocus, focusScope]);
  const handleKeyDown = React.useCallback(
    (event) => {
      if (!loop && !trapped) return;
      if (focusScope.paused) return;
      const isTabKey = event.key === "Tab" && !event.altKey && !event.ctrlKey && !event.metaKey;
      const focusedElement = document.activeElement;
      if (isTabKey && focusedElement) {
        const container2 = event.currentTarget;
        const [first, last] = getTabbableEdges(container2);
        const hasTabbableElementsInside = first && last;
        if (!hasTabbableElementsInside) {
          if (focusedElement === container2) event.preventDefault();
        } else {
          if (!event.shiftKey && focusedElement === last) {
            event.preventDefault();
            if (loop) focus(first, { select: true });
          } else if (event.shiftKey && focusedElement === first) {
            event.preventDefault();
            if (loop) focus(last, { select: true });
          }
        }
      }
    },
    [loop, trapped, focusScope.paused]
  );
  return /* @__PURE__ */ jsx(Primitive.div, { tabIndex: -1, ...scopeProps, ref: composedRefs, onKeyDown: handleKeyDown });
});
FocusScope.displayName = FOCUS_SCOPE_NAME;
function focusFirst(candidates, { select = false } = {}) {
  const previouslyFocusedElement = document.activeElement;
  for (const candidate of candidates) {
    focus(candidate, { select });
    if (document.activeElement !== previouslyFocusedElement) return;
  }
}
function getTabbableEdges(container) {
  const candidates = getTabbableCandidates(container);
  const first = findVisible(candidates, container);
  const last = findVisible(candidates.reverse(), container);
  return [first, last];
}
function getTabbableCandidates(container) {
  const nodes = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      const isHiddenInput = node.tagName === "INPUT" && node.type === "hidden";
      if (node.disabled || node.hidden || isHiddenInput) return NodeFilter.FILTER_SKIP;
      return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}
function findVisible(elements, container) {
  for (const element of elements) {
    if (!isHidden(element, { upTo: container })) return element;
  }
}
function isHidden(node, { upTo }) {
  if (getComputedStyle(node).visibility === "hidden") return true;
  while (node) {
    if (upTo !== void 0 && node === upTo) return false;
    if (getComputedStyle(node).display === "none") return true;
    node = node.parentElement;
  }
  return false;
}
function isSelectableInput(element) {
  return element instanceof HTMLInputElement && "select" in element;
}
function focus(element, { select = false } = {}) {
  if (element && element.focus) {
    const previouslyFocusedElement = document.activeElement;
    element.focus({ preventScroll: true });
    if (element !== previouslyFocusedElement && isSelectableInput(element) && select)
      element.select();
  }
}
var focusScopesStack = createFocusScopesStack();
function createFocusScopesStack() {
  let stack = [];
  return {
    add(focusScope) {
      const activeFocusScope = stack[0];
      if (focusScope !== activeFocusScope) {
        activeFocusScope?.pause();
      }
      stack = arrayRemove(stack, focusScope);
      stack.unshift(focusScope);
    },
    remove(focusScope) {
      stack = arrayRemove(stack, focusScope);
      stack[0]?.resume();
    }
  };
}
function arrayRemove(array, item) {
  const updatedArray = [...array];
  const index2 = updatedArray.indexOf(item);
  if (index2 !== -1) {
    updatedArray.splice(index2, 1);
  }
  return updatedArray;
}
function removeLinks(items) {
  return items.filter((item) => item.tagName !== "A");
}
const sides = ["top", "right", "bottom", "left"];
const min = Math.min;
const max = Math.max;
const round = Math.round;
const floor = Math.floor;
const createCoords = (v) => ({
  x: v,
  y: v
});
const oppositeSideMap = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
function clamp(start, value, end) {
  return max(start, min(value, end));
}
function evaluate(value, param) {
  return typeof value === "function" ? value(param) : value;
}
function getSide(placement) {
  return placement.split("-")[0];
}
function getAlignment(placement) {
  return placement.split("-")[1];
}
function getOppositeAxis(axis) {
  return axis === "x" ? "y" : "x";
}
function getAxisLength(axis) {
  return axis === "y" ? "height" : "width";
}
function getSideAxis(placement) {
  const firstChar = placement[0];
  return firstChar === "t" || firstChar === "b" ? "y" : "x";
}
function getAlignmentAxis(placement) {
  return getOppositeAxis(getSideAxis(placement));
}
function getAlignmentSides(placement, rects, rtl) {
  if (rtl === void 0) {
    rtl = false;
  }
  const alignment = getAlignment(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const length = getAxisLength(alignmentAxis);
  let mainAlignmentSide = alignmentAxis === "x" ? alignment === (rtl ? "end" : "start") ? "right" : "left" : alignment === "start" ? "bottom" : "top";
  if (rects.reference[length] > rects.floating[length]) {
    mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
  }
  return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
}
function getExpandedPlacements(placement) {
  const oppositePlacement = getOppositePlacement(placement);
  return [getOppositeAlignmentPlacement(placement), oppositePlacement, getOppositeAlignmentPlacement(oppositePlacement)];
}
function getOppositeAlignmentPlacement(placement) {
  return placement.includes("start") ? placement.replace("start", "end") : placement.replace("end", "start");
}
const lrPlacement = ["left", "right"];
const rlPlacement = ["right", "left"];
const tbPlacement = ["top", "bottom"];
const btPlacement = ["bottom", "top"];
function getSideList(side, isStart, rtl) {
  switch (side) {
    case "top":
    case "bottom":
      if (rtl) return isStart ? rlPlacement : lrPlacement;
      return isStart ? lrPlacement : rlPlacement;
    case "left":
    case "right":
      return isStart ? tbPlacement : btPlacement;
    default:
      return [];
  }
}
function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
  const alignment = getAlignment(placement);
  let list = getSideList(getSide(placement), direction === "start", rtl);
  if (alignment) {
    list = list.map((side) => side + "-" + alignment);
    if (flipAlignment) {
      list = list.concat(list.map(getOppositeAlignmentPlacement));
    }
  }
  return list;
}
function getOppositePlacement(placement) {
  const side = getSide(placement);
  return oppositeSideMap[side] + placement.slice(side.length);
}
function expandPaddingObject(padding) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...padding
  };
}
function getPaddingObject(padding) {
  return typeof padding !== "number" ? expandPaddingObject(padding) : {
    top: padding,
    right: padding,
    bottom: padding,
    left: padding
  };
}
function rectToClientRect(rect) {
  const {
    x: x2,
    y,
    width,
    height
  } = rect;
  return {
    width,
    height,
    top: y,
    left: x2,
    right: x2 + width,
    bottom: y + height,
    x: x2,
    y
  };
}
function computeCoordsFromPlacement(_ref, placement, rtl) {
  let {
    reference,
    floating
  } = _ref;
  const sideAxis = getSideAxis(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const alignLength = getAxisLength(alignmentAxis);
  const side = getSide(placement);
  const isVertical = sideAxis === "y";
  const commonX = reference.x + reference.width / 2 - floating.width / 2;
  const commonY = reference.y + reference.height / 2 - floating.height / 2;
  const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
  let coords;
  switch (side) {
    case "top":
      coords = {
        x: commonX,
        y: reference.y - floating.height
      };
      break;
    case "bottom":
      coords = {
        x: commonX,
        y: reference.y + reference.height
      };
      break;
    case "right":
      coords = {
        x: reference.x + reference.width,
        y: commonY
      };
      break;
    case "left":
      coords = {
        x: reference.x - floating.width,
        y: commonY
      };
      break;
    default:
      coords = {
        x: reference.x,
        y: reference.y
      };
  }
  switch (getAlignment(placement)) {
    case "start":
      coords[alignmentAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
      break;
    case "end":
      coords[alignmentAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
      break;
  }
  return coords;
}
async function detectOverflow(state, options) {
  var _await$platform$isEle;
  if (options === void 0) {
    options = {};
  }
  const {
    x: x2,
    y,
    platform: platform2,
    rects,
    elements,
    strategy
  } = state;
  const {
    boundary = "clippingAncestors",
    rootBoundary = "viewport",
    elementContext = "floating",
    altBoundary = false,
    padding = 0
  } = evaluate(options, state);
  const paddingObject = getPaddingObject(padding);
  const altContext = elementContext === "floating" ? "reference" : "floating";
  const element = elements[altBoundary ? altContext : elementContext];
  const clippingClientRect = rectToClientRect(await platform2.getClippingRect({
    element: ((_await$platform$isEle = await (platform2.isElement == null ? void 0 : platform2.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || await (platform2.getDocumentElement == null ? void 0 : platform2.getDocumentElement(elements.floating)),
    boundary,
    rootBoundary,
    strategy
  }));
  const rect = elementContext === "floating" ? {
    x: x2,
    y,
    width: rects.floating.width,
    height: rects.floating.height
  } : rects.reference;
  const offsetParent = await (platform2.getOffsetParent == null ? void 0 : platform2.getOffsetParent(elements.floating));
  const offsetScale = await (platform2.isElement == null ? void 0 : platform2.isElement(offsetParent)) ? await (platform2.getScale == null ? void 0 : platform2.getScale(offsetParent)) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  };
  const elementClientRect = rectToClientRect(platform2.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform2.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements,
    rect,
    offsetParent,
    strategy
  }) : rect);
  return {
    top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
    bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
    left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
    right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
  };
}
const MAX_RESET_COUNT = 50;
const computePosition$1 = async (reference, floating, config) => {
  const {
    placement = "bottom",
    strategy = "absolute",
    middleware = [],
    platform: platform2
  } = config;
  const platformWithDetectOverflow = platform2.detectOverflow ? platform2 : {
    ...platform2,
    detectOverflow
  };
  const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(floating));
  let rects = await platform2.getElementRects({
    reference,
    floating,
    strategy
  });
  let {
    x: x2,
    y
  } = computeCoordsFromPlacement(rects, placement, rtl);
  let statefulPlacement = placement;
  let resetCount = 0;
  const middlewareData = {};
  for (let i = 0; i < middleware.length; i++) {
    const currentMiddleware = middleware[i];
    if (!currentMiddleware) {
      continue;
    }
    const {
      name,
      fn
    } = currentMiddleware;
    const {
      x: nextX,
      y: nextY,
      data,
      reset
    } = await fn({
      x: x2,
      y,
      initialPlacement: placement,
      placement: statefulPlacement,
      strategy,
      middlewareData,
      rects,
      platform: platformWithDetectOverflow,
      elements: {
        reference,
        floating
      }
    });
    x2 = nextX != null ? nextX : x2;
    y = nextY != null ? nextY : y;
    middlewareData[name] = {
      ...middlewareData[name],
      ...data
    };
    if (reset && resetCount < MAX_RESET_COUNT) {
      resetCount++;
      if (typeof reset === "object") {
        if (reset.placement) {
          statefulPlacement = reset.placement;
        }
        if (reset.rects) {
          rects = reset.rects === true ? await platform2.getElementRects({
            reference,
            floating,
            strategy
          }) : reset.rects;
        }
        ({
          x: x2,
          y
        } = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
      }
      i = -1;
    }
  }
  return {
    x: x2,
    y,
    placement: statefulPlacement,
    strategy,
    middlewareData
  };
};
const arrow$3 = (options) => ({
  name: "arrow",
  options,
  async fn(state) {
    const {
      x: x2,
      y,
      placement,
      rects,
      platform: platform2,
      elements,
      middlewareData
    } = state;
    const {
      element,
      padding = 0
    } = evaluate(options, state) || {};
    if (element == null) {
      return {};
    }
    const paddingObject = getPaddingObject(padding);
    const coords = {
      x: x2,
      y
    };
    const axis = getAlignmentAxis(placement);
    const length = getAxisLength(axis);
    const arrowDimensions = await platform2.getDimensions(element);
    const isYAxis = axis === "y";
    const minProp = isYAxis ? "top" : "left";
    const maxProp = isYAxis ? "bottom" : "right";
    const clientProp = isYAxis ? "clientHeight" : "clientWidth";
    const endDiff = rects.reference[length] + rects.reference[axis] - coords[axis] - rects.floating[length];
    const startDiff = coords[axis] - rects.reference[axis];
    const arrowOffsetParent = await (platform2.getOffsetParent == null ? void 0 : platform2.getOffsetParent(element));
    let clientSize = arrowOffsetParent ? arrowOffsetParent[clientProp] : 0;
    if (!clientSize || !await (platform2.isElement == null ? void 0 : platform2.isElement(arrowOffsetParent))) {
      clientSize = elements.floating[clientProp] || rects.floating[length];
    }
    const centerToReference = endDiff / 2 - startDiff / 2;
    const largestPossiblePadding = clientSize / 2 - arrowDimensions[length] / 2 - 1;
    const minPadding = min(paddingObject[minProp], largestPossiblePadding);
    const maxPadding = min(paddingObject[maxProp], largestPossiblePadding);
    const min$1 = minPadding;
    const max2 = clientSize - arrowDimensions[length] - maxPadding;
    const center = clientSize / 2 - arrowDimensions[length] / 2 + centerToReference;
    const offset2 = clamp(min$1, center, max2);
    const shouldAddOffset = !middlewareData.arrow && getAlignment(placement) != null && center !== offset2 && rects.reference[length] / 2 - (center < min$1 ? minPadding : maxPadding) - arrowDimensions[length] / 2 < 0;
    const alignmentOffset = shouldAddOffset ? center < min$1 ? center - min$1 : center - max2 : 0;
    return {
      [axis]: coords[axis] + alignmentOffset,
      data: {
        [axis]: offset2,
        centerOffset: center - offset2 - alignmentOffset,
        ...shouldAddOffset && {
          alignmentOffset
        }
      },
      reset: shouldAddOffset
    };
  }
});
const flip$2 = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "flip",
    options,
    async fn(state) {
      var _middlewareData$arrow, _middlewareData$flip;
      const {
        placement,
        middlewareData,
        rects,
        initialPlacement,
        platform: platform2,
        elements
      } = state;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = true,
        fallbackPlacements: specifiedFallbackPlacements,
        fallbackStrategy = "bestFit",
        fallbackAxisSideDirection = "none",
        flipAlignment = true,
        ...detectOverflowOptions
      } = evaluate(options, state);
      if ((_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
        return {};
      }
      const side = getSide(placement);
      const initialSideAxis = getSideAxis(initialPlacement);
      const isBasePlacement = getSide(initialPlacement) === initialPlacement;
      const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating));
      const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
      const hasFallbackAxisSideDirection = fallbackAxisSideDirection !== "none";
      if (!specifiedFallbackPlacements && hasFallbackAxisSideDirection) {
        fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
      }
      const placements = [initialPlacement, ...fallbackPlacements];
      const overflow = await platform2.detectOverflow(state, detectOverflowOptions);
      const overflows = [];
      let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
      if (checkMainAxis) {
        overflows.push(overflow[side]);
      }
      if (checkCrossAxis) {
        const sides2 = getAlignmentSides(placement, rects, rtl);
        overflows.push(overflow[sides2[0]], overflow[sides2[1]]);
      }
      overflowsData = [...overflowsData, {
        placement,
        overflows
      }];
      if (!overflows.every((side2) => side2 <= 0)) {
        var _middlewareData$flip2, _overflowsData$filter;
        const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
        const nextPlacement = placements[nextIndex];
        if (nextPlacement) {
          const ignoreCrossAxisOverflow = checkCrossAxis === "alignment" ? initialSideAxis !== getSideAxis(nextPlacement) : false;
          if (!ignoreCrossAxisOverflow || // We leave the current main axis only if every placement on that axis
          // overflows the main axis.
          overflowsData.every((d) => getSideAxis(d.placement) === initialSideAxis ? d.overflows[0] > 0 : true)) {
            return {
              data: {
                index: nextIndex,
                overflows: overflowsData
              },
              reset: {
                placement: nextPlacement
              }
            };
          }
        }
        let resetPlacement = (_overflowsData$filter = overflowsData.filter((d) => d.overflows[0] <= 0).sort((a, b2) => a.overflows[1] - b2.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;
        if (!resetPlacement) {
          switch (fallbackStrategy) {
            case "bestFit": {
              var _overflowsData$filter2;
              const placement2 = (_overflowsData$filter2 = overflowsData.filter((d) => {
                if (hasFallbackAxisSideDirection) {
                  const currentSideAxis = getSideAxis(d.placement);
                  return currentSideAxis === initialSideAxis || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  currentSideAxis === "y";
                }
                return true;
              }).map((d) => [d.placement, d.overflows.filter((overflow2) => overflow2 > 0).reduce((acc, overflow2) => acc + overflow2, 0)]).sort((a, b2) => a[1] - b2[1])[0]) == null ? void 0 : _overflowsData$filter2[0];
              if (placement2) {
                resetPlacement = placement2;
              }
              break;
            }
            case "initialPlacement":
              resetPlacement = initialPlacement;
              break;
          }
        }
        if (placement !== resetPlacement) {
          return {
            reset: {
              placement: resetPlacement
            }
          };
        }
      }
      return {};
    }
  };
};
function getSideOffsets(overflow, rect) {
  return {
    top: overflow.top - rect.height,
    right: overflow.right - rect.width,
    bottom: overflow.bottom - rect.height,
    left: overflow.left - rect.width
  };
}
function isAnySideFullyClipped(overflow) {
  return sides.some((side) => overflow[side] >= 0);
}
const hide$2 = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "hide",
    options,
    async fn(state) {
      const {
        rects,
        platform: platform2
      } = state;
      const {
        strategy = "referenceHidden",
        ...detectOverflowOptions
      } = evaluate(options, state);
      switch (strategy) {
        case "referenceHidden": {
          const overflow = await platform2.detectOverflow(state, {
            ...detectOverflowOptions,
            elementContext: "reference"
          });
          const offsets = getSideOffsets(overflow, rects.reference);
          return {
            data: {
              referenceHiddenOffsets: offsets,
              referenceHidden: isAnySideFullyClipped(offsets)
            }
          };
        }
        case "escaped": {
          const overflow = await platform2.detectOverflow(state, {
            ...detectOverflowOptions,
            altBoundary: true
          });
          const offsets = getSideOffsets(overflow, rects.floating);
          return {
            data: {
              escapedOffsets: offsets,
              escaped: isAnySideFullyClipped(offsets)
            }
          };
        }
        default: {
          return {};
        }
      }
    }
  };
};
const originSides = /* @__PURE__ */ new Set(["left", "top"]);
async function convertValueToCoords(state, options) {
  const {
    placement,
    platform: platform2,
    elements
  } = state;
  const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating));
  const side = getSide(placement);
  const alignment = getAlignment(placement);
  const isVertical = getSideAxis(placement) === "y";
  const mainAxisMulti = originSides.has(side) ? -1 : 1;
  const crossAxisMulti = rtl && isVertical ? -1 : 1;
  const rawValue = evaluate(options, state);
  let {
    mainAxis,
    crossAxis,
    alignmentAxis
  } = typeof rawValue === "number" ? {
    mainAxis: rawValue,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: rawValue.mainAxis || 0,
    crossAxis: rawValue.crossAxis || 0,
    alignmentAxis: rawValue.alignmentAxis
  };
  if (alignment && typeof alignmentAxis === "number") {
    crossAxis = alignment === "end" ? alignmentAxis * -1 : alignmentAxis;
  }
  return isVertical ? {
    x: crossAxis * crossAxisMulti,
    y: mainAxis * mainAxisMulti
  } : {
    x: mainAxis * mainAxisMulti,
    y: crossAxis * crossAxisMulti
  };
}
const offset$2 = function(options) {
  if (options === void 0) {
    options = 0;
  }
  return {
    name: "offset",
    options,
    async fn(state) {
      var _middlewareData$offse, _middlewareData$arrow;
      const {
        x: x2,
        y,
        placement,
        middlewareData
      } = state;
      const diffCoords = await convertValueToCoords(state, options);
      if (placement === ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse.placement) && (_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
        return {};
      }
      return {
        x: x2 + diffCoords.x,
        y: y + diffCoords.y,
        data: {
          ...diffCoords,
          placement
        }
      };
    }
  };
};
const shift$2 = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "shift",
    options,
    async fn(state) {
      const {
        x: x2,
        y,
        placement,
        platform: platform2
      } = state;
      const {
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = false,
        limiter = {
          fn: (_ref) => {
            let {
              x: x3,
              y: y2
            } = _ref;
            return {
              x: x3,
              y: y2
            };
          }
        },
        ...detectOverflowOptions
      } = evaluate(options, state);
      const coords = {
        x: x2,
        y
      };
      const overflow = await platform2.detectOverflow(state, detectOverflowOptions);
      const crossAxis = getSideAxis(getSide(placement));
      const mainAxis = getOppositeAxis(crossAxis);
      let mainAxisCoord = coords[mainAxis];
      let crossAxisCoord = coords[crossAxis];
      if (checkMainAxis) {
        const minSide = mainAxis === "y" ? "top" : "left";
        const maxSide = mainAxis === "y" ? "bottom" : "right";
        const min2 = mainAxisCoord + overflow[minSide];
        const max2 = mainAxisCoord - overflow[maxSide];
        mainAxisCoord = clamp(min2, mainAxisCoord, max2);
      }
      if (checkCrossAxis) {
        const minSide = crossAxis === "y" ? "top" : "left";
        const maxSide = crossAxis === "y" ? "bottom" : "right";
        const min2 = crossAxisCoord + overflow[minSide];
        const max2 = crossAxisCoord - overflow[maxSide];
        crossAxisCoord = clamp(min2, crossAxisCoord, max2);
      }
      const limitedCoords = limiter.fn({
        ...state,
        [mainAxis]: mainAxisCoord,
        [crossAxis]: crossAxisCoord
      });
      return {
        ...limitedCoords,
        data: {
          x: limitedCoords.x - x2,
          y: limitedCoords.y - y,
          enabled: {
            [mainAxis]: checkMainAxis,
            [crossAxis]: checkCrossAxis
          }
        }
      };
    }
  };
};
const limitShift$2 = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    options,
    fn(state) {
      const {
        x: x2,
        y,
        placement,
        rects,
        middlewareData
      } = state;
      const {
        offset: offset2 = 0,
        mainAxis: checkMainAxis = true,
        crossAxis: checkCrossAxis = true
      } = evaluate(options, state);
      const coords = {
        x: x2,
        y
      };
      const crossAxis = getSideAxis(placement);
      const mainAxis = getOppositeAxis(crossAxis);
      let mainAxisCoord = coords[mainAxis];
      let crossAxisCoord = coords[crossAxis];
      const rawOffset = evaluate(offset2, state);
      const computedOffset = typeof rawOffset === "number" ? {
        mainAxis: rawOffset,
        crossAxis: 0
      } : {
        mainAxis: 0,
        crossAxis: 0,
        ...rawOffset
      };
      if (checkMainAxis) {
        const len = mainAxis === "y" ? "height" : "width";
        const limitMin = rects.reference[mainAxis] - rects.floating[len] + computedOffset.mainAxis;
        const limitMax = rects.reference[mainAxis] + rects.reference[len] - computedOffset.mainAxis;
        if (mainAxisCoord < limitMin) {
          mainAxisCoord = limitMin;
        } else if (mainAxisCoord > limitMax) {
          mainAxisCoord = limitMax;
        }
      }
      if (checkCrossAxis) {
        var _middlewareData$offse, _middlewareData$offse2;
        const len = mainAxis === "y" ? "width" : "height";
        const isOriginSide = originSides.has(getSide(placement));
        const limitMin = rects.reference[crossAxis] - rects.floating[len] + (isOriginSide ? ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse[crossAxis]) || 0 : 0) + (isOriginSide ? 0 : computedOffset.crossAxis);
        const limitMax = rects.reference[crossAxis] + rects.reference[len] + (isOriginSide ? 0 : ((_middlewareData$offse2 = middlewareData.offset) == null ? void 0 : _middlewareData$offse2[crossAxis]) || 0) - (isOriginSide ? computedOffset.crossAxis : 0);
        if (crossAxisCoord < limitMin) {
          crossAxisCoord = limitMin;
        } else if (crossAxisCoord > limitMax) {
          crossAxisCoord = limitMax;
        }
      }
      return {
        [mainAxis]: mainAxisCoord,
        [crossAxis]: crossAxisCoord
      };
    }
  };
};
const size$2 = function(options) {
  if (options === void 0) {
    options = {};
  }
  return {
    name: "size",
    options,
    async fn(state) {
      var _state$middlewareData, _state$middlewareData2;
      const {
        placement,
        rects,
        platform: platform2,
        elements
      } = state;
      const {
        apply = () => {
        },
        ...detectOverflowOptions
      } = evaluate(options, state);
      const overflow = await platform2.detectOverflow(state, detectOverflowOptions);
      const side = getSide(placement);
      const alignment = getAlignment(placement);
      const isYAxis = getSideAxis(placement) === "y";
      const {
        width,
        height
      } = rects.floating;
      let heightSide;
      let widthSide;
      if (side === "top" || side === "bottom") {
        heightSide = side;
        widthSide = alignment === (await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating)) ? "start" : "end") ? "left" : "right";
      } else {
        widthSide = side;
        heightSide = alignment === "end" ? "top" : "bottom";
      }
      const maximumClippingHeight = height - overflow.top - overflow.bottom;
      const maximumClippingWidth = width - overflow.left - overflow.right;
      const overflowAvailableHeight = min(height - overflow[heightSide], maximumClippingHeight);
      const overflowAvailableWidth = min(width - overflow[widthSide], maximumClippingWidth);
      const noShift = !state.middlewareData.shift;
      let availableHeight = overflowAvailableHeight;
      let availableWidth = overflowAvailableWidth;
      if ((_state$middlewareData = state.middlewareData.shift) != null && _state$middlewareData.enabled.x) {
        availableWidth = maximumClippingWidth;
      }
      if ((_state$middlewareData2 = state.middlewareData.shift) != null && _state$middlewareData2.enabled.y) {
        availableHeight = maximumClippingHeight;
      }
      if (noShift && !alignment) {
        const xMin = max(overflow.left, 0);
        const xMax = max(overflow.right, 0);
        const yMin = max(overflow.top, 0);
        const yMax = max(overflow.bottom, 0);
        if (isYAxis) {
          availableWidth = width - 2 * (xMin !== 0 || xMax !== 0 ? xMin + xMax : max(overflow.left, overflow.right));
        } else {
          availableHeight = height - 2 * (yMin !== 0 || yMax !== 0 ? yMin + yMax : max(overflow.top, overflow.bottom));
        }
      }
      await apply({
        ...state,
        availableWidth,
        availableHeight
      });
      const nextDimensions = await platform2.getDimensions(elements.floating);
      if (width !== nextDimensions.width || height !== nextDimensions.height) {
        return {
          reset: {
            rects: true
          }
        };
      }
      return {};
    }
  };
};
function hasWindow() {
  return typeof window !== "undefined";
}
function getNodeName(node) {
  if (isNode(node)) {
    return (node.nodeName || "").toLowerCase();
  }
  return "#document";
}
function getWindow(node) {
  var _node$ownerDocument;
  return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
}
function getDocumentElement(node) {
  var _ref;
  return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
}
function isNode(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Node || value instanceof getWindow(value).Node;
}
function isElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof Element || value instanceof getWindow(value).Element;
}
function isHTMLElement(value) {
  if (!hasWindow()) {
    return false;
  }
  return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
}
function isShadowRoot(value) {
  if (!hasWindow() || typeof ShadowRoot === "undefined") {
    return false;
  }
  return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
}
function isOverflowElement(element) {
  const {
    overflow,
    overflowX,
    overflowY,
    display
  } = getComputedStyle$1(element);
  return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && display !== "inline" && display !== "contents";
}
function isTableElement(element) {
  return /^(table|td|th)$/.test(getNodeName(element));
}
function isTopLayer(element) {
  try {
    if (element.matches(":popover-open")) {
      return true;
    }
  } catch (_e) {
  }
  try {
    return element.matches(":modal");
  } catch (_e) {
    return false;
  }
}
const willChangeRe = /transform|translate|scale|rotate|perspective|filter/;
const containRe = /paint|layout|strict|content/;
const isNotNone = (value) => !!value && value !== "none";
let isWebKitValue;
function isContainingBlock(elementOrCss) {
  const css = isElement(elementOrCss) ? getComputedStyle$1(elementOrCss) : elementOrCss;
  return isNotNone(css.transform) || isNotNone(css.translate) || isNotNone(css.scale) || isNotNone(css.rotate) || isNotNone(css.perspective) || !isWebKit() && (isNotNone(css.backdropFilter) || isNotNone(css.filter)) || willChangeRe.test(css.willChange || "") || containRe.test(css.contain || "");
}
function getContainingBlock(element) {
  let currentNode = getParentNode(element);
  while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
    if (isContainingBlock(currentNode)) {
      return currentNode;
    } else if (isTopLayer(currentNode)) {
      return null;
    }
    currentNode = getParentNode(currentNode);
  }
  return null;
}
function isWebKit() {
  if (isWebKitValue == null) {
    isWebKitValue = typeof CSS !== "undefined" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none");
  }
  return isWebKitValue;
}
function isLastTraversableNode(node) {
  return /^(html|body|#document)$/.test(getNodeName(node));
}
function getComputedStyle$1(element) {
  return getWindow(element).getComputedStyle(element);
}
function getNodeScroll(element) {
  if (isElement(element)) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }
  return {
    scrollLeft: element.scrollX,
    scrollTop: element.scrollY
  };
}
function getParentNode(node) {
  if (getNodeName(node) === "html") {
    return node;
  }
  const result = (
    // Step into the shadow DOM of the parent of a slotted node.
    node.assignedSlot || // DOM Element detected.
    node.parentNode || // ShadowRoot detected.
    isShadowRoot(node) && node.host || // Fallback.
    getDocumentElement(node)
  );
  return isShadowRoot(result) ? result.host : result;
}
function getNearestOverflowAncestor(node) {
  const parentNode = getParentNode(node);
  if (isLastTraversableNode(parentNode)) {
    return node.ownerDocument ? node.ownerDocument.body : node.body;
  }
  if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
    return parentNode;
  }
  return getNearestOverflowAncestor(parentNode);
}
function getOverflowAncestors(node, list, traverseIframes) {
  var _node$ownerDocument2;
  if (list === void 0) {
    list = [];
  }
  if (traverseIframes === void 0) {
    traverseIframes = true;
  }
  const scrollableAncestor = getNearestOverflowAncestor(node);
  const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
  const win = getWindow(scrollableAncestor);
  if (isBody) {
    const frameElement = getFrameElement(win);
    return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], frameElement && traverseIframes ? getOverflowAncestors(frameElement) : []);
  } else {
    return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
  }
}
function getFrameElement(win) {
  return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
}
function getCssDimensions(element) {
  const css = getComputedStyle$1(element);
  let width = parseFloat(css.width) || 0;
  let height = parseFloat(css.height) || 0;
  const hasOffset = isHTMLElement(element);
  const offsetWidth = hasOffset ? element.offsetWidth : width;
  const offsetHeight = hasOffset ? element.offsetHeight : height;
  const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
  if (shouldFallback) {
    width = offsetWidth;
    height = offsetHeight;
  }
  return {
    width,
    height,
    $: shouldFallback
  };
}
function unwrapElement(element) {
  return !isElement(element) ? element.contextElement : element;
}
function getScale(element) {
  const domElement = unwrapElement(element);
  if (!isHTMLElement(domElement)) {
    return createCoords(1);
  }
  const rect = domElement.getBoundingClientRect();
  const {
    width,
    height,
    $
  } = getCssDimensions(domElement);
  let x2 = ($ ? round(rect.width) : rect.width) / width;
  let y = ($ ? round(rect.height) : rect.height) / height;
  if (!x2 || !Number.isFinite(x2)) {
    x2 = 1;
  }
  if (!y || !Number.isFinite(y)) {
    y = 1;
  }
  return {
    x: x2,
    y
  };
}
const noOffsets = /* @__PURE__ */ createCoords(0);
function getVisualOffsets(element) {
  const win = getWindow(element);
  if (!isWebKit() || !win.visualViewport) {
    return noOffsets;
  }
  return {
    x: win.visualViewport.offsetLeft,
    y: win.visualViewport.offsetTop
  };
}
function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
  if (isFixed === void 0) {
    isFixed = false;
  }
  if (!floatingOffsetParent || isFixed && floatingOffsetParent !== getWindow(element)) {
    return false;
  }
  return isFixed;
}
function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
  if (includeScale === void 0) {
    includeScale = false;
  }
  if (isFixedStrategy === void 0) {
    isFixedStrategy = false;
  }
  const clientRect = element.getBoundingClientRect();
  const domElement = unwrapElement(element);
  let scale = createCoords(1);
  if (includeScale) {
    if (offsetParent) {
      if (isElement(offsetParent)) {
        scale = getScale(offsetParent);
      }
    } else {
      scale = getScale(element);
    }
  }
  const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
  let x2 = (clientRect.left + visualOffsets.x) / scale.x;
  let y = (clientRect.top + visualOffsets.y) / scale.y;
  let width = clientRect.width / scale.x;
  let height = clientRect.height / scale.y;
  if (domElement) {
    const win = getWindow(domElement);
    const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
    let currentWin = win;
    let currentIFrame = getFrameElement(currentWin);
    while (currentIFrame && offsetParent && offsetWin !== currentWin) {
      const iframeScale = getScale(currentIFrame);
      const iframeRect = currentIFrame.getBoundingClientRect();
      const css = getComputedStyle$1(currentIFrame);
      const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
      const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
      x2 *= iframeScale.x;
      y *= iframeScale.y;
      width *= iframeScale.x;
      height *= iframeScale.y;
      x2 += left;
      y += top;
      currentWin = getWindow(currentIFrame);
      currentIFrame = getFrameElement(currentWin);
    }
  }
  return rectToClientRect({
    width,
    height,
    x: x2,
    y
  });
}
function getWindowScrollBarX(element, rect) {
  const leftScroll = getNodeScroll(element).scrollLeft;
  if (!rect) {
    return getBoundingClientRect(getDocumentElement(element)).left + leftScroll;
  }
  return rect.left + leftScroll;
}
function getHTMLOffset(documentElement, scroll) {
  const htmlRect = documentElement.getBoundingClientRect();
  const x2 = htmlRect.left + scroll.scrollLeft - getWindowScrollBarX(documentElement, htmlRect);
  const y = htmlRect.top + scroll.scrollTop;
  return {
    x: x2,
    y
  };
}
function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
  let {
    elements,
    rect,
    offsetParent,
    strategy
  } = _ref;
  const isFixed = strategy === "fixed";
  const documentElement = getDocumentElement(offsetParent);
  const topLayer = elements ? isTopLayer(elements.floating) : false;
  if (offsetParent === documentElement || topLayer && isFixed) {
    return rect;
  }
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  let scale = createCoords(1);
  const offsets = createCoords(0);
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isOffsetParentAnElement) {
      const offsetRect = getBoundingClientRect(offsetParent);
      scale = getScale(offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    }
  }
  const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
  return {
    width: rect.width * scale.x,
    height: rect.height * scale.y,
    x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x + htmlOffset.x,
    y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y + htmlOffset.y
  };
}
function getClientRects(element) {
  return Array.from(element.getClientRects());
}
function getDocumentRect(element) {
  const html = getDocumentElement(element);
  const scroll = getNodeScroll(element);
  const body = element.ownerDocument.body;
  const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
  const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
  let x2 = -scroll.scrollLeft + getWindowScrollBarX(element);
  const y = -scroll.scrollTop;
  if (getComputedStyle$1(body).direction === "rtl") {
    x2 += max(html.clientWidth, body.clientWidth) - width;
  }
  return {
    width,
    height,
    x: x2,
    y
  };
}
const SCROLLBAR_MAX = 25;
function getViewportRect(element, strategy) {
  const win = getWindow(element);
  const html = getDocumentElement(element);
  const visualViewport = win.visualViewport;
  let width = html.clientWidth;
  let height = html.clientHeight;
  let x2 = 0;
  let y = 0;
  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    const visualViewportBased = isWebKit();
    if (!visualViewportBased || visualViewportBased && strategy === "fixed") {
      x2 = visualViewport.offsetLeft;
      y = visualViewport.offsetTop;
    }
  }
  const windowScrollbarX = getWindowScrollBarX(html);
  if (windowScrollbarX <= 0) {
    const doc = html.ownerDocument;
    const body = doc.body;
    const bodyStyles = getComputedStyle(body);
    const bodyMarginInline = doc.compatMode === "CSS1Compat" ? parseFloat(bodyStyles.marginLeft) + parseFloat(bodyStyles.marginRight) || 0 : 0;
    const clippingStableScrollbarWidth = Math.abs(html.clientWidth - body.clientWidth - bodyMarginInline);
    if (clippingStableScrollbarWidth <= SCROLLBAR_MAX) {
      width -= clippingStableScrollbarWidth;
    }
  } else if (windowScrollbarX <= SCROLLBAR_MAX) {
    width += windowScrollbarX;
  }
  return {
    width,
    height,
    x: x2,
    y
  };
}
function getInnerBoundingClientRect(element, strategy) {
  const clientRect = getBoundingClientRect(element, true, strategy === "fixed");
  const top = clientRect.top + element.clientTop;
  const left = clientRect.left + element.clientLeft;
  const scale = isHTMLElement(element) ? getScale(element) : createCoords(1);
  const width = element.clientWidth * scale.x;
  const height = element.clientHeight * scale.y;
  const x2 = left * scale.x;
  const y = top * scale.y;
  return {
    width,
    height,
    x: x2,
    y
  };
}
function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
  let rect;
  if (clippingAncestor === "viewport") {
    rect = getViewportRect(element, strategy);
  } else if (clippingAncestor === "document") {
    rect = getDocumentRect(getDocumentElement(element));
  } else if (isElement(clippingAncestor)) {
    rect = getInnerBoundingClientRect(clippingAncestor, strategy);
  } else {
    const visualOffsets = getVisualOffsets(element);
    rect = {
      x: clippingAncestor.x - visualOffsets.x,
      y: clippingAncestor.y - visualOffsets.y,
      width: clippingAncestor.width,
      height: clippingAncestor.height
    };
  }
  return rectToClientRect(rect);
}
function hasFixedPositionAncestor(element, stopNode) {
  const parentNode = getParentNode(element);
  if (parentNode === stopNode || !isElement(parentNode) || isLastTraversableNode(parentNode)) {
    return false;
  }
  return getComputedStyle$1(parentNode).position === "fixed" || hasFixedPositionAncestor(parentNode, stopNode);
}
function getClippingElementAncestors(element, cache) {
  const cachedResult = cache.get(element);
  if (cachedResult) {
    return cachedResult;
  }
  let result = getOverflowAncestors(element, [], false).filter((el) => isElement(el) && getNodeName(el) !== "body");
  let currentContainingBlockComputedStyle = null;
  const elementIsFixed = getComputedStyle$1(element).position === "fixed";
  let currentNode = elementIsFixed ? getParentNode(element) : element;
  while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
    const computedStyle = getComputedStyle$1(currentNode);
    const currentNodeIsContaining = isContainingBlock(currentNode);
    if (!currentNodeIsContaining && computedStyle.position === "fixed") {
      currentContainingBlockComputedStyle = null;
    }
    const shouldDropCurrentNode = elementIsFixed ? !currentNodeIsContaining && !currentContainingBlockComputedStyle : !currentNodeIsContaining && computedStyle.position === "static" && !!currentContainingBlockComputedStyle && (currentContainingBlockComputedStyle.position === "absolute" || currentContainingBlockComputedStyle.position === "fixed") || isOverflowElement(currentNode) && !currentNodeIsContaining && hasFixedPositionAncestor(element, currentNode);
    if (shouldDropCurrentNode) {
      result = result.filter((ancestor) => ancestor !== currentNode);
    } else {
      currentContainingBlockComputedStyle = computedStyle;
    }
    currentNode = getParentNode(currentNode);
  }
  cache.set(element, result);
  return result;
}
function getClippingRect(_ref) {
  let {
    element,
    boundary,
    rootBoundary,
    strategy
  } = _ref;
  const elementClippingAncestors = boundary === "clippingAncestors" ? isTopLayer(element) ? [] : getClippingElementAncestors(element, this._c) : [].concat(boundary);
  const clippingAncestors = [...elementClippingAncestors, rootBoundary];
  const firstRect = getClientRectFromClippingAncestor(element, clippingAncestors[0], strategy);
  let top = firstRect.top;
  let right = firstRect.right;
  let bottom = firstRect.bottom;
  let left = firstRect.left;
  for (let i = 1; i < clippingAncestors.length; i++) {
    const rect = getClientRectFromClippingAncestor(element, clippingAncestors[i], strategy);
    top = max(rect.top, top);
    right = min(rect.right, right);
    bottom = min(rect.bottom, bottom);
    left = max(rect.left, left);
  }
  return {
    width: right - left,
    height: bottom - top,
    x: left,
    y: top
  };
}
function getDimensions(element) {
  const {
    width,
    height
  } = getCssDimensions(element);
  return {
    width,
    height
  };
}
function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  const documentElement = getDocumentElement(offsetParent);
  const isFixed = strategy === "fixed";
  const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const offsets = createCoords(0);
  function setLeftRTLScrollbarOffset() {
    offsets.x = getWindowScrollBarX(documentElement);
  }
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isOffsetParentAnElement) {
      const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    } else if (documentElement) {
      setLeftRTLScrollbarOffset();
    }
  }
  if (isFixed && !isOffsetParentAnElement && documentElement) {
    setLeftRTLScrollbarOffset();
  }
  const htmlOffset = documentElement && !isOffsetParentAnElement && !isFixed ? getHTMLOffset(documentElement, scroll) : createCoords(0);
  const x2 = rect.left + scroll.scrollLeft - offsets.x - htmlOffset.x;
  const y = rect.top + scroll.scrollTop - offsets.y - htmlOffset.y;
  return {
    x: x2,
    y,
    width: rect.width,
    height: rect.height
  };
}
function isStaticPositioned(element) {
  return getComputedStyle$1(element).position === "static";
}
function getTrueOffsetParent(element, polyfill) {
  if (!isHTMLElement(element) || getComputedStyle$1(element).position === "fixed") {
    return null;
  }
  if (polyfill) {
    return polyfill(element);
  }
  let rawOffsetParent = element.offsetParent;
  if (getDocumentElement(element) === rawOffsetParent) {
    rawOffsetParent = rawOffsetParent.ownerDocument.body;
  }
  return rawOffsetParent;
}
function getOffsetParent(element, polyfill) {
  const win = getWindow(element);
  if (isTopLayer(element)) {
    return win;
  }
  if (!isHTMLElement(element)) {
    let svgOffsetParent = getParentNode(element);
    while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
      if (isElement(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) {
        return svgOffsetParent;
      }
      svgOffsetParent = getParentNode(svgOffsetParent);
    }
    return win;
  }
  let offsetParent = getTrueOffsetParent(element, polyfill);
  while (offsetParent && isTableElement(offsetParent) && isStaticPositioned(offsetParent)) {
    offsetParent = getTrueOffsetParent(offsetParent, polyfill);
  }
  if (offsetParent && isLastTraversableNode(offsetParent) && isStaticPositioned(offsetParent) && !isContainingBlock(offsetParent)) {
    return win;
  }
  return offsetParent || getContainingBlock(element) || win;
}
const getElementRects = async function(data) {
  const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
  const getDimensionsFn = this.getDimensions;
  const floatingDimensions = await getDimensionsFn(data.floating);
  return {
    reference: getRectRelativeToOffsetParent(data.reference, await getOffsetParentFn(data.floating), data.strategy),
    floating: {
      x: 0,
      y: 0,
      width: floatingDimensions.width,
      height: floatingDimensions.height
    }
  };
};
function isRTL(element) {
  return getComputedStyle$1(element).direction === "rtl";
}
const platform = {
  convertOffsetParentRelativeRectToViewportRelativeRect,
  getDocumentElement,
  getClippingRect,
  getOffsetParent,
  getElementRects,
  getClientRects,
  getDimensions,
  getScale,
  isElement,
  isRTL
};
function rectsAreEqual(a, b2) {
  return a.x === b2.x && a.y === b2.y && a.width === b2.width && a.height === b2.height;
}
function observeMove(element, onMove) {
  let io = null;
  let timeoutId;
  const root = getDocumentElement(element);
  function cleanup() {
    var _io;
    clearTimeout(timeoutId);
    (_io = io) == null || _io.disconnect();
    io = null;
  }
  function refresh(skip, threshold) {
    if (skip === void 0) {
      skip = false;
    }
    if (threshold === void 0) {
      threshold = 1;
    }
    cleanup();
    const elementRectForRootMargin = element.getBoundingClientRect();
    const {
      left,
      top,
      width,
      height
    } = elementRectForRootMargin;
    if (!skip) {
      onMove();
    }
    if (!width || !height) {
      return;
    }
    const insetTop = floor(top);
    const insetRight = floor(root.clientWidth - (left + width));
    const insetBottom = floor(root.clientHeight - (top + height));
    const insetLeft = floor(left);
    const rootMargin = -insetTop + "px " + -insetRight + "px " + -insetBottom + "px " + -insetLeft + "px";
    const options = {
      rootMargin,
      threshold: max(0, min(1, threshold)) || 1
    };
    let isFirstUpdate = true;
    function handleObserve(entries) {
      const ratio = entries[0].intersectionRatio;
      if (ratio !== threshold) {
        if (!isFirstUpdate) {
          return refresh();
        }
        if (!ratio) {
          timeoutId = setTimeout(() => {
            refresh(false, 1e-7);
          }, 1e3);
        } else {
          refresh(false, ratio);
        }
      }
      if (ratio === 1 && !rectsAreEqual(elementRectForRootMargin, element.getBoundingClientRect())) {
        refresh();
      }
      isFirstUpdate = false;
    }
    try {
      io = new IntersectionObserver(handleObserve, {
        ...options,
        // Handle <iframe>s
        root: root.ownerDocument
      });
    } catch (_e) {
      io = new IntersectionObserver(handleObserve, options);
    }
    io.observe(element);
  }
  refresh(true);
  return cleanup;
}
function autoUpdate(reference, floating, update, options) {
  if (options === void 0) {
    options = {};
  }
  const {
    ancestorScroll = true,
    ancestorResize = true,
    elementResize = typeof ResizeObserver === "function",
    layoutShift = typeof IntersectionObserver === "function",
    animationFrame = false
  } = options;
  const referenceEl = unwrapElement(reference);
  const ancestors = ancestorScroll || ancestorResize ? [...referenceEl ? getOverflowAncestors(referenceEl) : [], ...floating ? getOverflowAncestors(floating) : []] : [];
  ancestors.forEach((ancestor) => {
    ancestorScroll && ancestor.addEventListener("scroll", update, {
      passive: true
    });
    ancestorResize && ancestor.addEventListener("resize", update);
  });
  const cleanupIo = referenceEl && layoutShift ? observeMove(referenceEl, update) : null;
  let reobserveFrame = -1;
  let resizeObserver = null;
  if (elementResize) {
    resizeObserver = new ResizeObserver((_ref) => {
      let [firstEntry] = _ref;
      if (firstEntry && firstEntry.target === referenceEl && resizeObserver && floating) {
        resizeObserver.unobserve(floating);
        cancelAnimationFrame(reobserveFrame);
        reobserveFrame = requestAnimationFrame(() => {
          var _resizeObserver;
          (_resizeObserver = resizeObserver) == null || _resizeObserver.observe(floating);
        });
      }
      update();
    });
    if (referenceEl && !animationFrame) {
      resizeObserver.observe(referenceEl);
    }
    if (floating) {
      resizeObserver.observe(floating);
    }
  }
  let frameId;
  let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;
  if (animationFrame) {
    frameLoop();
  }
  function frameLoop() {
    const nextRefRect = getBoundingClientRect(reference);
    if (prevRefRect && !rectsAreEqual(prevRefRect, nextRefRect)) {
      update();
    }
    prevRefRect = nextRefRect;
    frameId = requestAnimationFrame(frameLoop);
  }
  update();
  return () => {
    var _resizeObserver2;
    ancestors.forEach((ancestor) => {
      ancestorScroll && ancestor.removeEventListener("scroll", update);
      ancestorResize && ancestor.removeEventListener("resize", update);
    });
    cleanupIo == null || cleanupIo();
    (_resizeObserver2 = resizeObserver) == null || _resizeObserver2.disconnect();
    resizeObserver = null;
    if (animationFrame) {
      cancelAnimationFrame(frameId);
    }
  };
}
const offset$1 = offset$2;
const shift$1 = shift$2;
const flip$1 = flip$2;
const size$1 = size$2;
const hide$1 = hide$2;
const arrow$2 = arrow$3;
const limitShift$1 = limitShift$2;
const computePosition = (reference, floating, options) => {
  const cache = /* @__PURE__ */ new Map();
  const mergedOptions = {
    platform,
    ...options
  };
  const platformWithCache = {
    ...mergedOptions.platform,
    _c: cache
  };
  return computePosition$1(reference, floating, {
    ...mergedOptions,
    platform: platformWithCache
  });
};
var isClient = typeof document !== "undefined";
var noop = function noop2() {
};
var index = isClient ? useLayoutEffect : noop;
function deepEqual(a, b2) {
  if (a === b2) {
    return true;
  }
  if (typeof a !== typeof b2) {
    return false;
  }
  if (typeof a === "function" && a.toString() === b2.toString()) {
    return true;
  }
  let length;
  let i;
  let keys;
  if (a && b2 && typeof a === "object") {
    if (Array.isArray(a)) {
      length = a.length;
      if (length !== b2.length) return false;
      for (i = length; i-- !== 0; ) {
        if (!deepEqual(a[i], b2[i])) {
          return false;
        }
      }
      return true;
    }
    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b2).length) {
      return false;
    }
    for (i = length; i-- !== 0; ) {
      if (!{}.hasOwnProperty.call(b2, keys[i])) {
        return false;
      }
    }
    for (i = length; i-- !== 0; ) {
      const key = keys[i];
      if (key === "_owner" && a.$$typeof) {
        continue;
      }
      if (!deepEqual(a[key], b2[key])) {
        return false;
      }
    }
    return true;
  }
  return a !== a && b2 !== b2;
}
function getDPR(element) {
  if (typeof window === "undefined") {
    return 1;
  }
  const win = element.ownerDocument.defaultView || window;
  return win.devicePixelRatio || 1;
}
function roundByDPR(element, value) {
  const dpr = getDPR(element);
  return Math.round(value * dpr) / dpr;
}
function useLatestRef(value) {
  const ref = React.useRef(value);
  index(() => {
    ref.current = value;
  });
  return ref;
}
function useFloating(options) {
  if (options === void 0) {
    options = {};
  }
  const {
    placement = "bottom",
    strategy = "absolute",
    middleware = [],
    platform: platform2,
    elements: {
      reference: externalReference,
      floating: externalFloating
    } = {},
    transform = true,
    whileElementsMounted,
    open
  } = options;
  const [data, setData] = React.useState({
    x: 0,
    y: 0,
    strategy,
    placement,
    middlewareData: {},
    isPositioned: false
  });
  const [latestMiddleware, setLatestMiddleware] = React.useState(middleware);
  if (!deepEqual(latestMiddleware, middleware)) {
    setLatestMiddleware(middleware);
  }
  const [_reference, _setReference] = React.useState(null);
  const [_floating, _setFloating] = React.useState(null);
  const setReference = React.useCallback((node) => {
    if (node !== referenceRef.current) {
      referenceRef.current = node;
      _setReference(node);
    }
  }, []);
  const setFloating = React.useCallback((node) => {
    if (node !== floatingRef.current) {
      floatingRef.current = node;
      _setFloating(node);
    }
  }, []);
  const referenceEl = externalReference || _reference;
  const floatingEl = externalFloating || _floating;
  const referenceRef = React.useRef(null);
  const floatingRef = React.useRef(null);
  const dataRef = React.useRef(data);
  const hasWhileElementsMounted = whileElementsMounted != null;
  const whileElementsMountedRef = useLatestRef(whileElementsMounted);
  const platformRef = useLatestRef(platform2);
  const openRef = useLatestRef(open);
  const update = React.useCallback(() => {
    if (!referenceRef.current || !floatingRef.current) {
      return;
    }
    const config = {
      placement,
      strategy,
      middleware: latestMiddleware
    };
    if (platformRef.current) {
      config.platform = platformRef.current;
    }
    computePosition(referenceRef.current, floatingRef.current, config).then((data2) => {
      const fullData = {
        ...data2,
        // The floating element's position may be recomputed while it's closed
        // but still mounted (such as when transitioning out). To ensure
        // `isPositioned` will be `false` initially on the next open, avoid
        // setting it to `true` when `open === false` (must be specified).
        isPositioned: openRef.current !== false
      };
      if (isMountedRef.current && !deepEqual(dataRef.current, fullData)) {
        dataRef.current = fullData;
        ReactDOM.flushSync(() => {
          setData(fullData);
        });
      }
    });
  }, [latestMiddleware, placement, strategy, platformRef, openRef]);
  index(() => {
    if (open === false && dataRef.current.isPositioned) {
      dataRef.current.isPositioned = false;
      setData((data2) => ({
        ...data2,
        isPositioned: false
      }));
    }
  }, [open]);
  const isMountedRef = React.useRef(false);
  index(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  index(() => {
    if (referenceEl) referenceRef.current = referenceEl;
    if (floatingEl) floatingRef.current = floatingEl;
    if (referenceEl && floatingEl) {
      if (whileElementsMountedRef.current) {
        return whileElementsMountedRef.current(referenceEl, floatingEl, update);
      }
      update();
    }
  }, [referenceEl, floatingEl, update, whileElementsMountedRef, hasWhileElementsMounted]);
  const refs = React.useMemo(() => ({
    reference: referenceRef,
    floating: floatingRef,
    setReference,
    setFloating
  }), [setReference, setFloating]);
  const elements = React.useMemo(() => ({
    reference: referenceEl,
    floating: floatingEl
  }), [referenceEl, floatingEl]);
  const floatingStyles = React.useMemo(() => {
    const initialStyles = {
      position: strategy,
      left: 0,
      top: 0
    };
    if (!elements.floating) {
      return initialStyles;
    }
    const x2 = roundByDPR(elements.floating, data.x);
    const y = roundByDPR(elements.floating, data.y);
    if (transform) {
      return {
        ...initialStyles,
        transform: "translate(" + x2 + "px, " + y + "px)",
        ...getDPR(elements.floating) >= 1.5 && {
          willChange: "transform"
        }
      };
    }
    return {
      position: strategy,
      left: x2,
      top: y
    };
  }, [strategy, transform, elements.floating, data.x, data.y]);
  return React.useMemo(() => ({
    ...data,
    update,
    refs,
    elements,
    floatingStyles
  }), [data, update, refs, elements, floatingStyles]);
}
const arrow$1 = (options) => {
  function isRef(value) {
    return {}.hasOwnProperty.call(value, "current");
  }
  return {
    name: "arrow",
    options,
    fn(state) {
      const {
        element,
        padding
      } = typeof options === "function" ? options(state) : options;
      if (element && isRef(element)) {
        if (element.current != null) {
          return arrow$2({
            element: element.current,
            padding
          }).fn(state);
        }
        return {};
      }
      if (element) {
        return arrow$2({
          element,
          padding
        }).fn(state);
      }
      return {};
    }
  };
};
const offset = (options, deps) => {
  const result = offset$1(options);
  return {
    name: result.name,
    fn: result.fn,
    options: [options, deps]
  };
};
const shift = (options, deps) => {
  const result = shift$1(options);
  return {
    name: result.name,
    fn: result.fn,
    options: [options, deps]
  };
};
const limitShift = (options, deps) => {
  const result = limitShift$1(options);
  return {
    fn: result.fn,
    options: [options, deps]
  };
};
const flip = (options, deps) => {
  const result = flip$1(options);
  return {
    name: result.name,
    fn: result.fn,
    options: [options, deps]
  };
};
const size = (options, deps) => {
  const result = size$1(options);
  return {
    name: result.name,
    fn: result.fn,
    options: [options, deps]
  };
};
const hide = (options, deps) => {
  const result = hide$1(options);
  return {
    name: result.name,
    fn: result.fn,
    options: [options, deps]
  };
};
const arrow = (options, deps) => {
  const result = arrow$1(options);
  return {
    name: result.name,
    fn: result.fn,
    options: [options, deps]
  };
};
var NAME = "Arrow";
var Arrow$1 = React.forwardRef((props, forwardedRef) => {
  const { children, width = 10, height = 5, ...arrowProps } = props;
  return /* @__PURE__ */ jsx(
    Primitive.svg,
    {
      ...arrowProps,
      ref: forwardedRef,
      width,
      height,
      viewBox: "0 0 30 10",
      preserveAspectRatio: "none",
      children: props.asChild ? children : /* @__PURE__ */ jsx("polygon", { points: "0,0 30,0 15,10" })
    }
  );
});
Arrow$1.displayName = NAME;
var Root = Arrow$1;
function useSize(element) {
  const [size2, setSize] = React.useState(void 0);
  useLayoutEffect2(() => {
    if (element) {
      setSize({ width: element.offsetWidth, height: element.offsetHeight });
      const resizeObserver = new ResizeObserver((entries) => {
        if (!Array.isArray(entries)) {
          return;
        }
        if (!entries.length) {
          return;
        }
        const entry = entries[0];
        let width;
        let height;
        if ("borderBoxSize" in entry) {
          const borderSizeEntry = entry["borderBoxSize"];
          const borderSize = Array.isArray(borderSizeEntry) ? borderSizeEntry[0] : borderSizeEntry;
          width = borderSize["inlineSize"];
          height = borderSize["blockSize"];
        } else {
          width = element.offsetWidth;
          height = element.offsetHeight;
        }
        setSize({ width, height });
      });
      resizeObserver.observe(element, { box: "border-box" });
      return () => resizeObserver.unobserve(element);
    } else {
      setSize(void 0);
    }
  }, [element]);
  return size2;
}
var POPPER_NAME = "Popper";
var [createPopperContext, createPopperScope] = createContextScope(POPPER_NAME);
var [PopperProvider, usePopperContext] = createPopperContext(POPPER_NAME);
var Popper = (props) => {
  const { __scopePopper, children } = props;
  const [anchor, setAnchor] = React.useState(null);
  return /* @__PURE__ */ jsx(PopperProvider, { scope: __scopePopper, anchor, onAnchorChange: setAnchor, children });
};
Popper.displayName = POPPER_NAME;
var ANCHOR_NAME$1 = "PopperAnchor";
var PopperAnchor = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopePopper, virtualRef, ...anchorProps } = props;
    const context = usePopperContext(ANCHOR_NAME$1, __scopePopper);
    const ref = React.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    const anchorRef = React.useRef(null);
    React.useEffect(() => {
      const previousAnchor = anchorRef.current;
      anchorRef.current = virtualRef?.current || ref.current;
      if (previousAnchor !== anchorRef.current) {
        context.onAnchorChange(anchorRef.current);
      }
    });
    return virtualRef ? null : /* @__PURE__ */ jsx(Primitive.div, { ...anchorProps, ref: composedRefs });
  }
);
PopperAnchor.displayName = ANCHOR_NAME$1;
var CONTENT_NAME$1 = "PopperContent";
var [PopperContentProvider, useContentContext] = createPopperContext(CONTENT_NAME$1);
var PopperContent = React.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopePopper,
      side = "bottom",
      sideOffset = 0,
      align = "center",
      alignOffset = 0,
      arrowPadding = 0,
      avoidCollisions = true,
      collisionBoundary = [],
      collisionPadding: collisionPaddingProp = 0,
      sticky = "partial",
      hideWhenDetached = false,
      updatePositionStrategy = "optimized",
      onPlaced,
      ...contentProps
    } = props;
    const context = usePopperContext(CONTENT_NAME$1, __scopePopper);
    const [content, setContent] = React.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setContent(node));
    const [arrow$12, setArrow] = React.useState(null);
    const arrowSize = useSize(arrow$12);
    const arrowWidth = arrowSize?.width ?? 0;
    const arrowHeight = arrowSize?.height ?? 0;
    const desiredPlacement = side + (align !== "center" ? "-" + align : "");
    const collisionPadding = typeof collisionPaddingProp === "number" ? collisionPaddingProp : { top: 0, right: 0, bottom: 0, left: 0, ...collisionPaddingProp };
    const boundary = Array.isArray(collisionBoundary) ? collisionBoundary : [collisionBoundary];
    const hasExplicitBoundaries = boundary.length > 0;
    const detectOverflowOptions = {
      padding: collisionPadding,
      boundary: boundary.filter(isNotNull),
      // with `strategy: 'fixed'`, this is the only way to get it to respect boundaries
      altBoundary: hasExplicitBoundaries
    };
    const { refs, floatingStyles, placement, isPositioned, middlewareData } = useFloating({
      // default to `fixed` strategy so users don't have to pick and we also avoid focus scroll issues
      strategy: "fixed",
      placement: desiredPlacement,
      whileElementsMounted: (...args) => {
        const cleanup = autoUpdate(...args, {
          animationFrame: updatePositionStrategy === "always"
        });
        return cleanup;
      },
      elements: {
        reference: context.anchor
      },
      middleware: [
        offset({ mainAxis: sideOffset + arrowHeight, alignmentAxis: alignOffset }),
        avoidCollisions && shift({
          mainAxis: true,
          crossAxis: false,
          limiter: sticky === "partial" ? limitShift() : void 0,
          ...detectOverflowOptions
        }),
        avoidCollisions && flip({ ...detectOverflowOptions }),
        size({
          ...detectOverflowOptions,
          apply: ({ elements, rects, availableWidth, availableHeight }) => {
            const { width: anchorWidth, height: anchorHeight } = rects.reference;
            const contentStyle = elements.floating.style;
            contentStyle.setProperty("--radix-popper-available-width", `${availableWidth}px`);
            contentStyle.setProperty("--radix-popper-available-height", `${availableHeight}px`);
            contentStyle.setProperty("--radix-popper-anchor-width", `${anchorWidth}px`);
            contentStyle.setProperty("--radix-popper-anchor-height", `${anchorHeight}px`);
          }
        }),
        arrow$12 && arrow({ element: arrow$12, padding: arrowPadding }),
        transformOrigin({ arrowWidth, arrowHeight }),
        hideWhenDetached && hide({ strategy: "referenceHidden", ...detectOverflowOptions })
      ]
    });
    const [placedSide, placedAlign] = getSideAndAlignFromPlacement(placement);
    const handlePlaced = useCallbackRef$1(onPlaced);
    useLayoutEffect2(() => {
      if (isPositioned) {
        handlePlaced?.();
      }
    }, [isPositioned, handlePlaced]);
    const arrowX = middlewareData.arrow?.x;
    const arrowY = middlewareData.arrow?.y;
    const cannotCenterArrow = middlewareData.arrow?.centerOffset !== 0;
    const [contentZIndex, setContentZIndex] = React.useState();
    useLayoutEffect2(() => {
      if (content) setContentZIndex(window.getComputedStyle(content).zIndex);
    }, [content]);
    return /* @__PURE__ */ jsx(
      "div",
      {
        ref: refs.setFloating,
        "data-radix-popper-content-wrapper": "",
        style: {
          ...floatingStyles,
          transform: isPositioned ? floatingStyles.transform : "translate(0, -200%)",
          // keep off the page when measuring
          minWidth: "max-content",
          zIndex: contentZIndex,
          ["--radix-popper-transform-origin"]: [
            middlewareData.transformOrigin?.x,
            middlewareData.transformOrigin?.y
          ].join(" "),
          // hide the content if using the hide middleware and should be hidden
          // set visibility to hidden and disable pointer events so the UI behaves
          // as if the PopperContent isn't there at all
          ...middlewareData.hide?.referenceHidden && {
            visibility: "hidden",
            pointerEvents: "none"
          }
        },
        dir: props.dir,
        children: /* @__PURE__ */ jsx(
          PopperContentProvider,
          {
            scope: __scopePopper,
            placedSide,
            onArrowChange: setArrow,
            arrowX,
            arrowY,
            shouldHideArrow: cannotCenterArrow,
            children: /* @__PURE__ */ jsx(
              Primitive.div,
              {
                "data-side": placedSide,
                "data-align": placedAlign,
                ...contentProps,
                ref: composedRefs,
                style: {
                  ...contentProps.style,
                  // if the PopperContent hasn't been placed yet (not all measurements done)
                  // we prevent animations so that users's animation don't kick in too early referring wrong sides
                  animation: !isPositioned ? "none" : void 0
                }
              }
            )
          }
        )
      }
    );
  }
);
PopperContent.displayName = CONTENT_NAME$1;
var ARROW_NAME$1 = "PopperArrow";
var OPPOSITE_SIDE = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right"
};
var PopperArrow = React.forwardRef(function PopperArrow2(props, forwardedRef) {
  const { __scopePopper, ...arrowProps } = props;
  const contentContext = useContentContext(ARROW_NAME$1, __scopePopper);
  const baseSide = OPPOSITE_SIDE[contentContext.placedSide];
  return (
    // we have to use an extra wrapper because `ResizeObserver` (used by `useSize`)
    // doesn't report size as we'd expect on SVG elements.
    // it reports their bounding box which is effectively the largest path inside the SVG.
    /* @__PURE__ */ jsx(
      "span",
      {
        ref: contentContext.onArrowChange,
        style: {
          position: "absolute",
          left: contentContext.arrowX,
          top: contentContext.arrowY,
          [baseSide]: 0,
          transformOrigin: {
            top: "",
            right: "0 0",
            bottom: "center 0",
            left: "100% 0"
          }[contentContext.placedSide],
          transform: {
            top: "translateY(100%)",
            right: "translateY(50%) rotate(90deg) translateX(-50%)",
            bottom: `rotate(180deg)`,
            left: "translateY(50%) rotate(-90deg) translateX(50%)"
          }[contentContext.placedSide],
          visibility: contentContext.shouldHideArrow ? "hidden" : void 0
        },
        children: /* @__PURE__ */ jsx(
          Root,
          {
            ...arrowProps,
            ref: forwardedRef,
            style: {
              ...arrowProps.style,
              // ensures the element can be measured correctly (mostly for if SVG)
              display: "block"
            }
          }
        )
      }
    )
  );
});
PopperArrow.displayName = ARROW_NAME$1;
function isNotNull(value) {
  return value !== null;
}
var transformOrigin = (options) => ({
  name: "transformOrigin",
  options,
  fn(data) {
    const { placement, rects, middlewareData } = data;
    const cannotCenterArrow = middlewareData.arrow?.centerOffset !== 0;
    const isArrowHidden = cannotCenterArrow;
    const arrowWidth = isArrowHidden ? 0 : options.arrowWidth;
    const arrowHeight = isArrowHidden ? 0 : options.arrowHeight;
    const [placedSide, placedAlign] = getSideAndAlignFromPlacement(placement);
    const noArrowAlign = { start: "0%", center: "50%", end: "100%" }[placedAlign];
    const arrowXCenter = (middlewareData.arrow?.x ?? 0) + arrowWidth / 2;
    const arrowYCenter = (middlewareData.arrow?.y ?? 0) + arrowHeight / 2;
    let x2 = "";
    let y = "";
    if (placedSide === "bottom") {
      x2 = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`;
      y = `${-arrowHeight}px`;
    } else if (placedSide === "top") {
      x2 = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`;
      y = `${rects.floating.height + arrowHeight}px`;
    } else if (placedSide === "right") {
      x2 = `${-arrowHeight}px`;
      y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`;
    } else if (placedSide === "left") {
      x2 = `${rects.floating.width + arrowHeight}px`;
      y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`;
    }
    return { data: { x: x2, y } };
  }
});
function getSideAndAlignFromPlacement(placement) {
  const [side, align = "center"] = placement.split("-");
  return [side, align];
}
var Root2$1 = Popper;
var Anchor = PopperAnchor;
var Content = PopperContent;
var Arrow = PopperArrow;
var PORTAL_NAME$1 = "Portal";
var Portal$1 = React.forwardRef((props, forwardedRef) => {
  const { container: containerProp, ...portalProps } = props;
  const [mounted, setMounted] = React.useState(false);
  useLayoutEffect2(() => setMounted(true), []);
  const container = containerProp || mounted && globalThis?.document?.body;
  return container ? ReactDOM__default.createPortal(/* @__PURE__ */ jsx(Primitive.div, { ...portalProps, ref: forwardedRef }), container) : null;
});
Portal$1.displayName = PORTAL_NAME$1;
var getDefaultParent = function(originalTarget) {
  if (typeof document === "undefined") {
    return null;
  }
  var sampleTarget = Array.isArray(originalTarget) ? originalTarget[0] : originalTarget;
  return sampleTarget.ownerDocument.body;
};
var counterMap = /* @__PURE__ */ new WeakMap();
var uncontrolledNodes = /* @__PURE__ */ new WeakMap();
var markerMap = {};
var lockCount = 0;
var unwrapHost = function(node) {
  return node && (node.host || unwrapHost(node.parentNode));
};
var correctTargets = function(parent, targets) {
  return targets.map(function(target) {
    if (parent.contains(target)) {
      return target;
    }
    var correctedTarget = unwrapHost(target);
    if (correctedTarget && parent.contains(correctedTarget)) {
      return correctedTarget;
    }
    console.error("aria-hidden", target, "in not contained inside", parent, ". Doing nothing");
    return null;
  }).filter(function(x2) {
    return Boolean(x2);
  });
};
var applyAttributeToOthers = function(originalTarget, parentNode, markerName, controlAttribute) {
  var targets = correctTargets(parentNode, Array.isArray(originalTarget) ? originalTarget : [originalTarget]);
  if (!markerMap[markerName]) {
    markerMap[markerName] = /* @__PURE__ */ new WeakMap();
  }
  var markerCounter = markerMap[markerName];
  var hiddenNodes = [];
  var elementsToKeep = /* @__PURE__ */ new Set();
  var elementsToStop = new Set(targets);
  var keep = function(el) {
    if (!el || elementsToKeep.has(el)) {
      return;
    }
    elementsToKeep.add(el);
    keep(el.parentNode);
  };
  targets.forEach(keep);
  var deep = function(parent) {
    if (!parent || elementsToStop.has(parent)) {
      return;
    }
    Array.prototype.forEach.call(parent.children, function(node) {
      if (elementsToKeep.has(node)) {
        deep(node);
      } else {
        try {
          var attr = node.getAttribute(controlAttribute);
          var alreadyHidden = attr !== null && attr !== "false";
          var counterValue = (counterMap.get(node) || 0) + 1;
          var markerValue = (markerCounter.get(node) || 0) + 1;
          counterMap.set(node, counterValue);
          markerCounter.set(node, markerValue);
          hiddenNodes.push(node);
          if (counterValue === 1 && alreadyHidden) {
            uncontrolledNodes.set(node, true);
          }
          if (markerValue === 1) {
            node.setAttribute(markerName, "true");
          }
          if (!alreadyHidden) {
            node.setAttribute(controlAttribute, "true");
          }
        } catch (e2) {
          console.error("aria-hidden: cannot operate on ", node, e2);
        }
      }
    });
  };
  deep(parentNode);
  elementsToKeep.clear();
  lockCount++;
  return function() {
    hiddenNodes.forEach(function(node) {
      var counterValue = counterMap.get(node) - 1;
      var markerValue = markerCounter.get(node) - 1;
      counterMap.set(node, counterValue);
      markerCounter.set(node, markerValue);
      if (!counterValue) {
        if (!uncontrolledNodes.has(node)) {
          node.removeAttribute(controlAttribute);
        }
        uncontrolledNodes.delete(node);
      }
      if (!markerValue) {
        node.removeAttribute(markerName);
      }
    });
    lockCount--;
    if (!lockCount) {
      counterMap = /* @__PURE__ */ new WeakMap();
      counterMap = /* @__PURE__ */ new WeakMap();
      uncontrolledNodes = /* @__PURE__ */ new WeakMap();
      markerMap = {};
    }
  };
};
var hideOthers = function(originalTarget, parentNode, markerName) {
  if (markerName === void 0) {
    markerName = "data-aria-hidden";
  }
  var targets = Array.from(Array.isArray(originalTarget) ? originalTarget : [originalTarget]);
  var activeParentNode = getDefaultParent(originalTarget);
  if (!activeParentNode) {
    return function() {
      return null;
    };
  }
  targets.push.apply(targets, Array.from(activeParentNode.querySelectorAll("[aria-live], script")));
  return applyAttributeToOthers(targets, activeParentNode, markerName, "aria-hidden");
};
var __assign = function() {
  __assign = Object.assign || function __assign2(t2) {
    for (var s, i = 1, n2 = arguments.length; i < n2; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t2[p] = s[p];
    }
    return t2;
  };
  return __assign.apply(this, arguments);
};
function __rest(s, e2) {
  var t2 = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0)
    t2[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t2[p[i]] = s[p[i]];
    }
  return t2;
}
function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l2 = from.length, ar; i < l2; i++) {
    if (ar || !(i in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
      ar[i] = from[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}
typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e2 = new Error(message);
  return e2.name = "SuppressedError", e2.error = error, e2.suppressed = suppressed, e2;
};
var zeroRightClassName = "right-scroll-bar-position";
var fullWidthClassName = "width-before-scroll-bar";
var noScrollbarsClassName = "with-scroll-bars-hidden";
var removedBarSizeVariable = "--removed-body-scroll-bar-size";
function assignRef(ref, value) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
  return ref;
}
function useCallbackRef(initialValue, callback) {
  var ref = useState(function() {
    return {
      // value
      value: initialValue,
      // last callback
      callback,
      // "memoized" public interface
      facade: {
        get current() {
          return ref.value;
        },
        set current(value) {
          var last = ref.value;
          if (last !== value) {
            ref.value = value;
            ref.callback(value, last);
          }
        }
      }
    };
  })[0];
  ref.callback = callback;
  return ref.facade;
}
var useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;
var currentValues = /* @__PURE__ */ new WeakMap();
function useMergeRefs(refs, defaultValue) {
  var callbackRef = useCallbackRef(null, function(newValue) {
    return refs.forEach(function(ref) {
      return assignRef(ref, newValue);
    });
  });
  useIsomorphicLayoutEffect(function() {
    var oldValue = currentValues.get(callbackRef);
    if (oldValue) {
      var prevRefs_1 = new Set(oldValue);
      var nextRefs_1 = new Set(refs);
      var current_1 = callbackRef.current;
      prevRefs_1.forEach(function(ref) {
        if (!nextRefs_1.has(ref)) {
          assignRef(ref, null);
        }
      });
      nextRefs_1.forEach(function(ref) {
        if (!prevRefs_1.has(ref)) {
          assignRef(ref, current_1);
        }
      });
    }
    currentValues.set(callbackRef, refs);
  }, [refs]);
  return callbackRef;
}
function ItoI(a) {
  return a;
}
function innerCreateMedium(defaults, middleware) {
  if (middleware === void 0) {
    middleware = ItoI;
  }
  var buffer = [];
  var assigned = false;
  var medium = {
    read: function() {
      if (assigned) {
        throw new Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");
      }
      if (buffer.length) {
        return buffer[buffer.length - 1];
      }
      return defaults;
    },
    useMedium: function(data) {
      var item = middleware(data, assigned);
      buffer.push(item);
      return function() {
        buffer = buffer.filter(function(x2) {
          return x2 !== item;
        });
      };
    },
    assignSyncMedium: function(cb) {
      assigned = true;
      while (buffer.length) {
        var cbs = buffer;
        buffer = [];
        cbs.forEach(cb);
      }
      buffer = {
        push: function(x2) {
          return cb(x2);
        },
        filter: function() {
          return buffer;
        }
      };
    },
    assignMedium: function(cb) {
      assigned = true;
      var pendingQueue = [];
      if (buffer.length) {
        var cbs = buffer;
        buffer = [];
        cbs.forEach(cb);
        pendingQueue = buffer;
      }
      var executeQueue = function() {
        var cbs2 = pendingQueue;
        pendingQueue = [];
        cbs2.forEach(cb);
      };
      var cycle = function() {
        return Promise.resolve().then(executeQueue);
      };
      cycle();
      buffer = {
        push: function(x2) {
          pendingQueue.push(x2);
          cycle();
        },
        filter: function(filter) {
          pendingQueue = pendingQueue.filter(filter);
          return buffer;
        }
      };
    }
  };
  return medium;
}
function createSidecarMedium(options) {
  if (options === void 0) {
    options = {};
  }
  var medium = innerCreateMedium(null);
  medium.options = __assign({ async: true, ssr: false }, options);
  return medium;
}
var SideCar$1 = function(_a) {
  var sideCar = _a.sideCar, rest = __rest(_a, ["sideCar"]);
  if (!sideCar) {
    throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  }
  var Target = sideCar.read();
  if (!Target) {
    throw new Error("Sidecar medium not found");
  }
  return React.createElement(Target, __assign({}, rest));
};
SideCar$1.isSideCarExport = true;
function exportSidecar(medium, exported) {
  medium.useMedium(exported);
  return SideCar$1;
}
var effectCar = createSidecarMedium();
var nothing = function() {
  return;
};
var RemoveScroll = React.forwardRef(function(props, parentRef) {
  var ref = React.useRef(null);
  var _a = React.useState({
    onScrollCapture: nothing,
    onWheelCapture: nothing,
    onTouchMoveCapture: nothing
  }), callbacks = _a[0], setCallbacks = _a[1];
  var forwardProps = props.forwardProps, children = props.children, className = props.className, removeScrollBar = props.removeScrollBar, enabled = props.enabled, shards = props.shards, sideCar = props.sideCar, noRelative = props.noRelative, noIsolation = props.noIsolation, inert = props.inert, allowPinchZoom = props.allowPinchZoom, _b = props.as, Container = _b === void 0 ? "div" : _b, gapMode = props.gapMode, rest = __rest(props, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]);
  var SideCar2 = sideCar;
  var containerRef = useMergeRefs([ref, parentRef]);
  var containerProps = __assign(__assign({}, rest), callbacks);
  return React.createElement(
    React.Fragment,
    null,
    enabled && React.createElement(SideCar2, { sideCar: effectCar, removeScrollBar, shards, noRelative, noIsolation, inert, setCallbacks, allowPinchZoom: !!allowPinchZoom, lockRef: ref, gapMode }),
    forwardProps ? React.cloneElement(React.Children.only(children), __assign(__assign({}, containerProps), { ref: containerRef })) : React.createElement(Container, __assign({}, containerProps, { className, ref: containerRef }), children)
  );
});
RemoveScroll.defaultProps = {
  enabled: true,
  removeScrollBar: true,
  inert: false
};
RemoveScroll.classNames = {
  fullWidth: fullWidthClassName,
  zeroRight: zeroRightClassName
};
var getNonce = function() {
  if (typeof __webpack_nonce__ !== "undefined") {
    return __webpack_nonce__;
  }
  return void 0;
};
function makeStyleTag() {
  if (!document)
    return null;
  var tag = document.createElement("style");
  tag.type = "text/css";
  var nonce = getNonce();
  if (nonce) {
    tag.setAttribute("nonce", nonce);
  }
  return tag;
}
function injectStyles(tag, css) {
  if (tag.styleSheet) {
    tag.styleSheet.cssText = css;
  } else {
    tag.appendChild(document.createTextNode(css));
  }
}
function insertStyleTag(tag) {
  var head = document.head || document.getElementsByTagName("head")[0];
  head.appendChild(tag);
}
var stylesheetSingleton = function() {
  var counter = 0;
  var stylesheet = null;
  return {
    add: function(style) {
      if (counter == 0) {
        if (stylesheet = makeStyleTag()) {
          injectStyles(stylesheet, style);
          insertStyleTag(stylesheet);
        }
      }
      counter++;
    },
    remove: function() {
      counter--;
      if (!counter && stylesheet) {
        stylesheet.parentNode && stylesheet.parentNode.removeChild(stylesheet);
        stylesheet = null;
      }
    }
  };
};
var styleHookSingleton = function() {
  var sheet = stylesheetSingleton();
  return function(styles, isDynamic) {
    React.useEffect(function() {
      sheet.add(styles);
      return function() {
        sheet.remove();
      };
    }, [styles && isDynamic]);
  };
};
var styleSingleton = function() {
  var useStyle = styleHookSingleton();
  var Sheet = function(_a) {
    var styles = _a.styles, dynamic = _a.dynamic;
    useStyle(styles, dynamic);
    return null;
  };
  return Sheet;
};
var zeroGap = {
  left: 0,
  top: 0,
  right: 0,
  gap: 0
};
var parse = function(x2) {
  return parseInt(x2 || "", 10) || 0;
};
var getOffset = function(gapMode) {
  var cs = window.getComputedStyle(document.body);
  var left = cs[gapMode === "padding" ? "paddingLeft" : "marginLeft"];
  var top = cs[gapMode === "padding" ? "paddingTop" : "marginTop"];
  var right = cs[gapMode === "padding" ? "paddingRight" : "marginRight"];
  return [parse(left), parse(top), parse(right)];
};
var getGapWidth = function(gapMode) {
  if (gapMode === void 0) {
    gapMode = "margin";
  }
  if (typeof window === "undefined") {
    return zeroGap;
  }
  var offsets = getOffset(gapMode);
  var documentWidth = document.documentElement.clientWidth;
  var windowWidth = window.innerWidth;
  return {
    left: offsets[0],
    top: offsets[1],
    right: offsets[2],
    gap: Math.max(0, windowWidth - documentWidth + offsets[2] - offsets[0])
  };
};
var Style = styleSingleton();
var lockAttribute = "data-scroll-locked";
var getStyles = function(_a, allowRelative, gapMode, important) {
  var left = _a.left, top = _a.top, right = _a.right, gap = _a.gap;
  if (gapMode === void 0) {
    gapMode = "margin";
  }
  return "\n  .".concat(noScrollbarsClassName, " {\n   overflow: hidden ").concat(important, ";\n   padding-right: ").concat(gap, "px ").concat(important, ";\n  }\n  body[").concat(lockAttribute, "] {\n    overflow: hidden ").concat(important, ";\n    overscroll-behavior: contain;\n    ").concat([
    allowRelative && "position: relative ".concat(important, ";"),
    gapMode === "margin" && "\n    padding-left: ".concat(left, "px;\n    padding-top: ").concat(top, "px;\n    padding-right: ").concat(right, "px;\n    margin-left:0;\n    margin-top:0;\n    margin-right: ").concat(gap, "px ").concat(important, ";\n    "),
    gapMode === "padding" && "padding-right: ".concat(gap, "px ").concat(important, ";")
  ].filter(Boolean).join(""), "\n  }\n  \n  .").concat(zeroRightClassName, " {\n    right: ").concat(gap, "px ").concat(important, ";\n  }\n  \n  .").concat(fullWidthClassName, " {\n    margin-right: ").concat(gap, "px ").concat(important, ";\n  }\n  \n  .").concat(zeroRightClassName, " .").concat(zeroRightClassName, " {\n    right: 0 ").concat(important, ";\n  }\n  \n  .").concat(fullWidthClassName, " .").concat(fullWidthClassName, " {\n    margin-right: 0 ").concat(important, ";\n  }\n  \n  body[").concat(lockAttribute, "] {\n    ").concat(removedBarSizeVariable, ": ").concat(gap, "px;\n  }\n");
};
var getCurrentUseCounter = function() {
  var counter = parseInt(document.body.getAttribute(lockAttribute) || "0", 10);
  return isFinite(counter) ? counter : 0;
};
var useLockAttribute = function() {
  React.useEffect(function() {
    document.body.setAttribute(lockAttribute, (getCurrentUseCounter() + 1).toString());
    return function() {
      var newCounter = getCurrentUseCounter() - 1;
      if (newCounter <= 0) {
        document.body.removeAttribute(lockAttribute);
      } else {
        document.body.setAttribute(lockAttribute, newCounter.toString());
      }
    };
  }, []);
};
var RemoveScrollBar = function(_a) {
  var noRelative = _a.noRelative, noImportant = _a.noImportant, _b = _a.gapMode, gapMode = _b === void 0 ? "margin" : _b;
  useLockAttribute();
  var gap = React.useMemo(function() {
    return getGapWidth(gapMode);
  }, [gapMode]);
  return React.createElement(Style, { styles: getStyles(gap, !noRelative, gapMode, !noImportant ? "!important" : "") });
};
var passiveSupported = false;
if (typeof window !== "undefined") {
  try {
    var options = Object.defineProperty({}, "passive", {
      get: function() {
        passiveSupported = true;
        return true;
      }
    });
    window.addEventListener("test", options, options);
    window.removeEventListener("test", options, options);
  } catch (err) {
    passiveSupported = false;
  }
}
var nonPassive = passiveSupported ? { passive: false } : false;
var alwaysContainsScroll = function(node) {
  return node.tagName === "TEXTAREA";
};
var elementCanBeScrolled = function(node, overflow) {
  if (!(node instanceof Element)) {
    return false;
  }
  var styles = window.getComputedStyle(node);
  return (
    // not-not-scrollable
    styles[overflow] !== "hidden" && // contains scroll inside self
    !(styles.overflowY === styles.overflowX && !alwaysContainsScroll(node) && styles[overflow] === "visible")
  );
};
var elementCouldBeVScrolled = function(node) {
  return elementCanBeScrolled(node, "overflowY");
};
var elementCouldBeHScrolled = function(node) {
  return elementCanBeScrolled(node, "overflowX");
};
var locationCouldBeScrolled = function(axis, node) {
  var ownerDocument = node.ownerDocument;
  var current = node;
  do {
    if (typeof ShadowRoot !== "undefined" && current instanceof ShadowRoot) {
      current = current.host;
    }
    var isScrollable = elementCouldBeScrolled(axis, current);
    if (isScrollable) {
      var _a = getScrollVariables(axis, current), scrollHeight = _a[1], clientHeight = _a[2];
      if (scrollHeight > clientHeight) {
        return true;
      }
    }
    current = current.parentNode;
  } while (current && current !== ownerDocument.body);
  return false;
};
var getVScrollVariables = function(_a) {
  var scrollTop = _a.scrollTop, scrollHeight = _a.scrollHeight, clientHeight = _a.clientHeight;
  return [
    scrollTop,
    scrollHeight,
    clientHeight
  ];
};
var getHScrollVariables = function(_a) {
  var scrollLeft = _a.scrollLeft, scrollWidth = _a.scrollWidth, clientWidth = _a.clientWidth;
  return [
    scrollLeft,
    scrollWidth,
    clientWidth
  ];
};
var elementCouldBeScrolled = function(axis, node) {
  return axis === "v" ? elementCouldBeVScrolled(node) : elementCouldBeHScrolled(node);
};
var getScrollVariables = function(axis, node) {
  return axis === "v" ? getVScrollVariables(node) : getHScrollVariables(node);
};
var getDirectionFactor = function(axis, direction) {
  return axis === "h" && direction === "rtl" ? -1 : 1;
};
var handleScroll = function(axis, endTarget, event, sourceDelta, noOverscroll) {
  var directionFactor = getDirectionFactor(axis, window.getComputedStyle(endTarget).direction);
  var delta = directionFactor * sourceDelta;
  var target = event.target;
  var targetInLock = endTarget.contains(target);
  var shouldCancelScroll = false;
  var isDeltaPositive = delta > 0;
  var availableScroll = 0;
  var availableScrollTop = 0;
  do {
    if (!target) {
      break;
    }
    var _a = getScrollVariables(axis, target), position = _a[0], scroll_1 = _a[1], capacity = _a[2];
    var elementScroll = scroll_1 - capacity - directionFactor * position;
    if (position || elementScroll) {
      if (elementCouldBeScrolled(axis, target)) {
        availableScroll += elementScroll;
        availableScrollTop += position;
      }
    }
    var parent_1 = target.parentNode;
    target = parent_1 && parent_1.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? parent_1.host : parent_1;
  } while (
    // portaled content
    !targetInLock && target !== document.body || // self content
    targetInLock && (endTarget.contains(target) || endTarget === target)
  );
  if (isDeltaPositive && (Math.abs(availableScroll) < 1 || false)) {
    shouldCancelScroll = true;
  } else if (!isDeltaPositive && (Math.abs(availableScrollTop) < 1 || false)) {
    shouldCancelScroll = true;
  }
  return shouldCancelScroll;
};
var getTouchXY = function(event) {
  return "changedTouches" in event ? [event.changedTouches[0].clientX, event.changedTouches[0].clientY] : [0, 0];
};
var getDeltaXY = function(event) {
  return [event.deltaX, event.deltaY];
};
var extractRef = function(ref) {
  return ref && "current" in ref ? ref.current : ref;
};
var deltaCompare = function(x2, y) {
  return x2[0] === y[0] && x2[1] === y[1];
};
var generateStyle = function(id) {
  return "\n  .block-interactivity-".concat(id, " {pointer-events: none;}\n  .allow-interactivity-").concat(id, " {pointer-events: all;}\n");
};
var idCounter = 0;
var lockStack = [];
function RemoveScrollSideCar(props) {
  var shouldPreventQueue = React.useRef([]);
  var touchStartRef = React.useRef([0, 0]);
  var activeAxis = React.useRef();
  var id = React.useState(idCounter++)[0];
  var Style2 = React.useState(styleSingleton)[0];
  var lastProps = React.useRef(props);
  React.useEffect(function() {
    lastProps.current = props;
  }, [props]);
  React.useEffect(function() {
    if (props.inert) {
      document.body.classList.add("block-interactivity-".concat(id));
      var allow_1 = __spreadArray([props.lockRef.current], (props.shards || []).map(extractRef), true).filter(Boolean);
      allow_1.forEach(function(el) {
        return el.classList.add("allow-interactivity-".concat(id));
      });
      return function() {
        document.body.classList.remove("block-interactivity-".concat(id));
        allow_1.forEach(function(el) {
          return el.classList.remove("allow-interactivity-".concat(id));
        });
      };
    }
    return;
  }, [props.inert, props.lockRef.current, props.shards]);
  var shouldCancelEvent = React.useCallback(function(event, parent) {
    if ("touches" in event && event.touches.length === 2 || event.type === "wheel" && event.ctrlKey) {
      return !lastProps.current.allowPinchZoom;
    }
    var touch = getTouchXY(event);
    var touchStart = touchStartRef.current;
    var deltaX = "deltaX" in event ? event.deltaX : touchStart[0] - touch[0];
    var deltaY = "deltaY" in event ? event.deltaY : touchStart[1] - touch[1];
    var currentAxis;
    var target = event.target;
    var moveDirection = Math.abs(deltaX) > Math.abs(deltaY) ? "h" : "v";
    if ("touches" in event && moveDirection === "h" && target.type === "range") {
      return false;
    }
    var selection = window.getSelection();
    var anchorNode = selection && selection.anchorNode;
    var isTouchingSelection = anchorNode ? anchorNode === target || anchorNode.contains(target) : false;
    if (isTouchingSelection) {
      return false;
    }
    var canBeScrolledInMainDirection = locationCouldBeScrolled(moveDirection, target);
    if (!canBeScrolledInMainDirection) {
      return true;
    }
    if (canBeScrolledInMainDirection) {
      currentAxis = moveDirection;
    } else {
      currentAxis = moveDirection === "v" ? "h" : "v";
      canBeScrolledInMainDirection = locationCouldBeScrolled(moveDirection, target);
    }
    if (!canBeScrolledInMainDirection) {
      return false;
    }
    if (!activeAxis.current && "changedTouches" in event && (deltaX || deltaY)) {
      activeAxis.current = currentAxis;
    }
    if (!currentAxis) {
      return true;
    }
    var cancelingAxis = activeAxis.current || currentAxis;
    return handleScroll(cancelingAxis, parent, event, cancelingAxis === "h" ? deltaX : deltaY);
  }, []);
  var shouldPrevent = React.useCallback(function(_event) {
    var event = _event;
    if (!lockStack.length || lockStack[lockStack.length - 1] !== Style2) {
      return;
    }
    var delta = "deltaY" in event ? getDeltaXY(event) : getTouchXY(event);
    var sourceEvent = shouldPreventQueue.current.filter(function(e2) {
      return e2.name === event.type && (e2.target === event.target || event.target === e2.shadowParent) && deltaCompare(e2.delta, delta);
    })[0];
    if (sourceEvent && sourceEvent.should) {
      if (event.cancelable) {
        event.preventDefault();
      }
      return;
    }
    if (!sourceEvent) {
      var shardNodes = (lastProps.current.shards || []).map(extractRef).filter(Boolean).filter(function(node) {
        return node.contains(event.target);
      });
      var shouldStop = shardNodes.length > 0 ? shouldCancelEvent(event, shardNodes[0]) : !lastProps.current.noIsolation;
      if (shouldStop) {
        if (event.cancelable) {
          event.preventDefault();
        }
      }
    }
  }, []);
  var shouldCancel = React.useCallback(function(name, delta, target, should) {
    var event = { name, delta, target, should, shadowParent: getOutermostShadowParent(target) };
    shouldPreventQueue.current.push(event);
    setTimeout(function() {
      shouldPreventQueue.current = shouldPreventQueue.current.filter(function(e2) {
        return e2 !== event;
      });
    }, 1);
  }, []);
  var scrollTouchStart = React.useCallback(function(event) {
    touchStartRef.current = getTouchXY(event);
    activeAxis.current = void 0;
  }, []);
  var scrollWheel = React.useCallback(function(event) {
    shouldCancel(event.type, getDeltaXY(event), event.target, shouldCancelEvent(event, props.lockRef.current));
  }, []);
  var scrollTouchMove = React.useCallback(function(event) {
    shouldCancel(event.type, getTouchXY(event), event.target, shouldCancelEvent(event, props.lockRef.current));
  }, []);
  React.useEffect(function() {
    lockStack.push(Style2);
    props.setCallbacks({
      onScrollCapture: scrollWheel,
      onWheelCapture: scrollWheel,
      onTouchMoveCapture: scrollTouchMove
    });
    document.addEventListener("wheel", shouldPrevent, nonPassive);
    document.addEventListener("touchmove", shouldPrevent, nonPassive);
    document.addEventListener("touchstart", scrollTouchStart, nonPassive);
    return function() {
      lockStack = lockStack.filter(function(inst) {
        return inst !== Style2;
      });
      document.removeEventListener("wheel", shouldPrevent, nonPassive);
      document.removeEventListener("touchmove", shouldPrevent, nonPassive);
      document.removeEventListener("touchstart", scrollTouchStart, nonPassive);
    };
  }, []);
  var removeScrollBar = props.removeScrollBar, inert = props.inert;
  return React.createElement(
    React.Fragment,
    null,
    inert ? React.createElement(Style2, { styles: generateStyle(id) }) : null,
    removeScrollBar ? React.createElement(RemoveScrollBar, { noRelative: props.noRelative, gapMode: props.gapMode }) : null
  );
}
function getOutermostShadowParent(node) {
  var shadowParent = null;
  while (node !== null) {
    if (node instanceof ShadowRoot) {
      shadowParent = node.host;
      node = node.host;
    }
    node = node.parentNode;
  }
  return shadowParent;
}
const SideCar = exportSidecar(effectCar, RemoveScrollSideCar);
var ReactRemoveScroll = React.forwardRef(function(props, ref) {
  return React.createElement(RemoveScroll, __assign({}, props, { ref, sideCar: SideCar }));
});
ReactRemoveScroll.classNames = RemoveScroll.classNames;
var POPOVER_NAME = "Popover";
var [createPopoverContext] = createContextScope(POPOVER_NAME, [
  createPopperScope
]);
var usePopperScope = createPopperScope();
var [PopoverProvider, usePopoverContext] = createPopoverContext(POPOVER_NAME);
var Popover$1 = (props) => {
  const {
    __scopePopover,
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
    modal = false
  } = props;
  const popperScope = usePopperScope(__scopePopover);
  const triggerRef = React.useRef(null);
  const [hasCustomAnchor, setHasCustomAnchor] = React.useState(false);
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
    caller: POPOVER_NAME
  });
  return /* @__PURE__ */ jsx(Root2$1, { ...popperScope, children: /* @__PURE__ */ jsx(
    PopoverProvider,
    {
      scope: __scopePopover,
      contentId: useId(),
      triggerRef,
      open,
      onOpenChange: setOpen,
      onOpenToggle: React.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
      hasCustomAnchor,
      onCustomAnchorAdd: React.useCallback(() => setHasCustomAnchor(true), []),
      onCustomAnchorRemove: React.useCallback(() => setHasCustomAnchor(false), []),
      modal,
      children
    }
  ) });
};
Popover$1.displayName = POPOVER_NAME;
var ANCHOR_NAME = "PopoverAnchor";
var PopoverAnchor = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopePopover, ...anchorProps } = props;
    const context = usePopoverContext(ANCHOR_NAME, __scopePopover);
    const popperScope = usePopperScope(__scopePopover);
    const { onCustomAnchorAdd, onCustomAnchorRemove } = context;
    React.useEffect(() => {
      onCustomAnchorAdd();
      return () => onCustomAnchorRemove();
    }, [onCustomAnchorAdd, onCustomAnchorRemove]);
    return /* @__PURE__ */ jsx(Anchor, { ...popperScope, ...anchorProps, ref: forwardedRef });
  }
);
PopoverAnchor.displayName = ANCHOR_NAME;
var TRIGGER_NAME = "PopoverTrigger";
var PopoverTrigger$1 = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopePopover, ...triggerProps } = props;
    const context = usePopoverContext(TRIGGER_NAME, __scopePopover);
    const popperScope = usePopperScope(__scopePopover);
    const composedTriggerRef = useComposedRefs(forwardedRef, context.triggerRef);
    const trigger = /* @__PURE__ */ jsx(
      Primitive.button,
      {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": context.open,
        "aria-controls": context.contentId,
        "data-state": getState(context.open),
        ...triggerProps,
        ref: composedTriggerRef,
        onClick: composeEventHandlers(props.onClick, context.onOpenToggle)
      }
    );
    return context.hasCustomAnchor ? trigger : /* @__PURE__ */ jsx(Anchor, { asChild: true, ...popperScope, children: trigger });
  }
);
PopoverTrigger$1.displayName = TRIGGER_NAME;
var PORTAL_NAME = "PopoverPortal";
var [PortalProvider, usePortalContext] = createPopoverContext(PORTAL_NAME, {
  forceMount: void 0
});
var PopoverPortal = (props) => {
  const { __scopePopover, forceMount, children, container } = props;
  const context = usePopoverContext(PORTAL_NAME, __scopePopover);
  return /* @__PURE__ */ jsx(PortalProvider, { scope: __scopePopover, forceMount, children: /* @__PURE__ */ jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsx(Portal$1, { asChild: true, container, children }) }) });
};
PopoverPortal.displayName = PORTAL_NAME;
var CONTENT_NAME = "PopoverContent";
var PopoverContent$1 = React.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME, props.__scopePopover);
    const { forceMount = portalContext.forceMount, ...contentProps } = props;
    const context = usePopoverContext(CONTENT_NAME, props.__scopePopover);
    return /* @__PURE__ */ jsx(Presence, { present: forceMount || context.open, children: context.modal ? /* @__PURE__ */ jsx(PopoverContentModal, { ...contentProps, ref: forwardedRef }) : /* @__PURE__ */ jsx(PopoverContentNonModal, { ...contentProps, ref: forwardedRef }) });
  }
);
PopoverContent$1.displayName = CONTENT_NAME;
var Slot = /* @__PURE__ */ createSlot("PopoverContent.RemoveScroll");
var PopoverContentModal = React.forwardRef(
  (props, forwardedRef) => {
    const context = usePopoverContext(CONTENT_NAME, props.__scopePopover);
    const contentRef = React.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, contentRef);
    const isRightClickOutsideRef = React.useRef(false);
    React.useEffect(() => {
      const content = contentRef.current;
      if (content) return hideOthers(content);
    }, []);
    return /* @__PURE__ */ jsx(ReactRemoveScroll, { as: Slot, allowPinchZoom: true, children: /* @__PURE__ */ jsx(
      PopoverContentImpl,
      {
        ...props,
        ref: composedRefs,
        trapFocus: context.open,
        disableOutsidePointerEvents: true,
        onCloseAutoFocus: composeEventHandlers(props.onCloseAutoFocus, (event) => {
          event.preventDefault();
          if (!isRightClickOutsideRef.current) context.triggerRef.current?.focus();
        }),
        onPointerDownOutside: composeEventHandlers(
          props.onPointerDownOutside,
          (event) => {
            const originalEvent = event.detail.originalEvent;
            const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
            const isRightClick = originalEvent.button === 2 || ctrlLeftClick;
            isRightClickOutsideRef.current = isRightClick;
          },
          { checkForDefaultPrevented: false }
        ),
        onFocusOutside: composeEventHandlers(
          props.onFocusOutside,
          (event) => event.preventDefault(),
          { checkForDefaultPrevented: false }
        )
      }
    ) });
  }
);
var PopoverContentNonModal = React.forwardRef(
  (props, forwardedRef) => {
    const context = usePopoverContext(CONTENT_NAME, props.__scopePopover);
    const hasInteractedOutsideRef = React.useRef(false);
    const hasPointerDownOutsideRef = React.useRef(false);
    return /* @__PURE__ */ jsx(
      PopoverContentImpl,
      {
        ...props,
        ref: forwardedRef,
        trapFocus: false,
        disableOutsidePointerEvents: false,
        onCloseAutoFocus: (event) => {
          props.onCloseAutoFocus?.(event);
          if (!event.defaultPrevented) {
            if (!hasInteractedOutsideRef.current) context.triggerRef.current?.focus();
            event.preventDefault();
          }
          hasInteractedOutsideRef.current = false;
          hasPointerDownOutsideRef.current = false;
        },
        onInteractOutside: (event) => {
          props.onInteractOutside?.(event);
          if (!event.defaultPrevented) {
            hasInteractedOutsideRef.current = true;
            if (event.detail.originalEvent.type === "pointerdown") {
              hasPointerDownOutsideRef.current = true;
            }
          }
          const target = event.target;
          const targetIsTrigger = context.triggerRef.current?.contains(target);
          if (targetIsTrigger) event.preventDefault();
          if (event.detail.originalEvent.type === "focusin" && hasPointerDownOutsideRef.current) {
            event.preventDefault();
          }
        }
      }
    );
  }
);
var PopoverContentImpl = React.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopePopover,
      trapFocus,
      onOpenAutoFocus,
      onCloseAutoFocus,
      disableOutsidePointerEvents,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      ...contentProps
    } = props;
    const context = usePopoverContext(CONTENT_NAME, __scopePopover);
    const popperScope = usePopperScope(__scopePopover);
    useFocusGuards();
    return /* @__PURE__ */ jsx(
      FocusScope,
      {
        asChild: true,
        loop: true,
        trapped: trapFocus,
        onMountAutoFocus: onOpenAutoFocus,
        onUnmountAutoFocus: onCloseAutoFocus,
        children: /* @__PURE__ */ jsx(
          DismissableLayer,
          {
            asChild: true,
            disableOutsidePointerEvents,
            onInteractOutside,
            onEscapeKeyDown,
            onPointerDownOutside,
            onFocusOutside,
            onDismiss: () => context.onOpenChange(false),
            children: /* @__PURE__ */ jsx(
              Content,
              {
                "data-state": getState(context.open),
                role: "dialog",
                id: context.contentId,
                ...popperScope,
                ...contentProps,
                ref: forwardedRef,
                style: {
                  ...contentProps.style,
                  // re-namespace exposed content custom properties
                  ...{
                    "--radix-popover-content-transform-origin": "var(--radix-popper-transform-origin)",
                    "--radix-popover-content-available-width": "var(--radix-popper-available-width)",
                    "--radix-popover-content-available-height": "var(--radix-popper-available-height)",
                    "--radix-popover-trigger-width": "var(--radix-popper-anchor-width)",
                    "--radix-popover-trigger-height": "var(--radix-popper-anchor-height)"
                  }
                }
              }
            )
          }
        )
      }
    );
  }
);
var CLOSE_NAME = "PopoverClose";
var PopoverClose = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopePopover, ...closeProps } = props;
    const context = usePopoverContext(CLOSE_NAME, __scopePopover);
    return /* @__PURE__ */ jsx(
      Primitive.button,
      {
        type: "button",
        ...closeProps,
        ref: forwardedRef,
        onClick: composeEventHandlers(props.onClick, () => context.onOpenChange(false))
      }
    );
  }
);
PopoverClose.displayName = CLOSE_NAME;
var ARROW_NAME = "PopoverArrow";
var PopoverArrow = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopePopover, ...arrowProps } = props;
    const popperScope = usePopperScope(__scopePopover);
    return /* @__PURE__ */ jsx(Arrow, { ...popperScope, ...arrowProps, ref: forwardedRef });
  }
);
PopoverArrow.displayName = ARROW_NAME;
function getState(open) {
  return open ? "open" : "closed";
}
var Root2 = Popover$1;
var Trigger = PopoverTrigger$1;
var Portal = PopoverPortal;
var Content2 = PopoverContent$1;
const Popover = Root2;
const PopoverTrigger = Trigger;
const PopoverContent = React.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => jsx(Portal, { children: jsx(Content2, { ref, align, sideOffset, side: "bottom", className: twMerge("z-50 origin-(--radix-popover-content-transform-origin) min-w-[240px] max-w-[98vw] rounded-xl border bg-fd-popover/60 backdrop-blur-lg p-2 text-sm text-fd-popover-foreground shadow-lg focus-visible:outline-none data-[state=closed]:animate-fd-popover-out data-[state=open]:animate-fd-popover-in", className), ...props }) }));
PopoverContent.displayName = Content2.displayName;
function LanguageToggle(props) {
  const context = useI18n();
  if (!context.locales)
    throw new Error("Missing `<I18nProvider />`");
  return jsxs(Popover, { children: [jsx(PopoverTrigger, { "aria-label": context.text.chooseLanguage, ...props, className: twMerge(buttonVariants({
    color: "ghost",
    className: "gap-1.5 p-1.5"
  }), props.className), children: props.children }), jsxs(PopoverContent, { className: "flex flex-col overflow-hidden p-0", children: [jsx("p", { className: "mb-1 p-2 text-xs font-medium text-fd-muted-foreground", children: context.text.chooseLanguage }), context.locales.map((item) => jsx("button", { type: "button", className: twMerge("p-2 text-start text-sm", item.locale === context.locale ? "bg-fd-primary/10 font-medium text-fd-primary" : "hover:bg-fd-accent hover:text-fd-accent-foreground"), onClick: () => {
    context.onChange?.(item.locale);
  }, children: item.name }, item.locale))] })] });
}
function LanguageToggleText(props) {
  const context = useI18n();
  const text = context.locales?.find((item) => item.locale === context.locale)?.name;
  return jsx("span", { ...props, children: text });
}
const menuItemVariants = cva("", {
  variants: {
    variant: {
      main: "inline-flex items-center gap-2 py-1.5 transition-colors hover:text-fd-popover-foreground/50 data-[active=true]:font-medium data-[active=true]:text-fd-primary [&_svg]:size-4",
      icon: buttonVariants({
        size: "icon",
        color: "ghost"
      }),
      button: buttonVariants({
        color: "secondary",
        className: "gap-1.5 [&_svg]:size-4"
      })
    }
  },
  defaultVariants: {
    variant: "main"
  }
});
function MenuLinkItem({ item, ...props }) {
  if (item.type === "custom")
    return jsx("div", { className: twMerge("grid", props.className), children: item.children });
  if (item.type === "menu") {
    const header = jsxs(Fragment, { children: [item.icon, item.text] });
    return jsxs("div", { className: twMerge("mb-4 flex flex-col", props.className), children: [jsx("p", { className: "mb-1 text-sm text-fd-muted-foreground", children: item.url ? jsx(NavigationMenuLink, { asChild: true, children: jsx(Link2, { href: item.url, external: item.external, children: header }) }) : header }), item.items.map((child, i) => jsx(MenuLinkItem, { item: child }, i))] });
  }
  return jsx(NavigationMenuLink, { asChild: true, children: jsxs(BaseLinkItem, { item, className: twMerge(menuItemVariants({ variant: item.type }), props.className), "aria-label": item.type === "icon" ? item.label : void 0, children: [item.icon, item.type === "icon" ? void 0 : item.text] }) });
}
const Menu = NavigationMenuItem;
function MenuTrigger({ enableHover = false, ...props }) {
  return jsx(NavigationMenuTrigger, { ...props, onPointerMove: enableHover ? void 0 : (e2) => e2.preventDefault(), children: props.children });
}
function MenuContent(props) {
  return jsx(NavigationMenuContent, { ...props, className: twMerge("flex flex-col p-4", props.className), children: props.children });
}
function HomeLayout(props) {
  const { nav = {}, links, githubUrl, i18n, themeSwitch = {}, searchToggle, ...rest } = props;
  return jsx(NavProvider, { transparentMode: nav?.transparentMode, children: jsxs("main", { id: "nd-home-layout", ...rest, className: twMerge("flex flex-1 flex-col pt-14", rest.className), children: [nav.enabled !== false && (nav.component ?? jsx(Header, { links, nav, themeSwitch, searchToggle, i18n, githubUrl })), props.children] }) });
}
function Header({ nav = {}, i18n = false, links, githubUrl, themeSwitch = {}, searchToggle = {} }) {
  const finalLinks = useMemo(() => getLinks(links, githubUrl), [links, githubUrl]);
  const navItems = finalLinks.filter((item) => ["nav", "all"].includes(item.on ?? "all"));
  const menuItems = finalLinks.filter((item) => ["menu", "all"].includes(item.on ?? "all"));
  return jsxs(Navbar, { children: [jsx(Link2, { href: nav.url ?? "/", className: "inline-flex items-center gap-2.5 font-semibold", children: nav.title }), nav.children, jsx("ul", { className: "flex flex-row items-center gap-2 px-6 max-sm:hidden", children: navItems.filter((item) => !isSecondary(item)).map((item, i) => jsx(NavbarLinkItem, { item, className: "text-sm" }, i)) }), jsxs("div", { className: "flex flex-row items-center justify-end gap-1.5 flex-1 max-lg:hidden", children: [searchToggle.enabled !== false && (searchToggle.components?.lg ?? jsx(LargeSearchToggle, { className: "w-full rounded-full ps-2.5 max-w-[240px]", hideIfDisabled: true })), themeSwitch.enabled !== false && (themeSwitch.component ?? jsx(ThemeToggle, { mode: themeSwitch?.mode })), i18n ? jsx(LanguageToggle, { children: jsx(Languages, { className: "size-5" }) }) : null, jsx("div", { className: "flex flex-row items-center empty:hidden", children: navItems.filter(isSecondary).map((item, i) => jsx(NavbarLinkItem, { item }, i)) })] }), jsxs("ul", { className: "flex flex-row items-center ms-auto -me-1.5 lg:hidden", children: [searchToggle.enabled !== false && (searchToggle.components?.sm ?? jsx(SearchToggle, { className: "p-2", hideIfDisabled: true })), jsxs(Menu, { children: [jsx(MenuTrigger, { "aria-label": "Toggle Menu", className: twMerge(buttonVariants({
    size: "icon",
    color: "ghost",
    className: "group"
  })), enableHover: nav.enableHoverToOpen, children: jsx(ChevronDown, { className: "!size-5.5 transition-transform duration-300 group-data-[state=open]:rotate-180" }) }), jsxs(MenuContent, { className: "sm:flex-row sm:items-center sm:justify-end", children: [menuItems.filter((item) => !isSecondary(item)).map((item, i) => jsx(MenuLinkItem, { item, className: "sm:hidden" }, i)), jsxs("div", { className: "-ms-1.5 flex flex-row items-center gap-1.5 max-sm:mt-2", children: [menuItems.filter(isSecondary).map((item, i) => jsx(MenuLinkItem, { item, className: "-me-1.5" }, i)), jsx("div", { role: "separator", className: "flex-1" }), i18n ? jsxs(LanguageToggle, { children: [jsx(Languages, { className: "size-5" }), jsx(LanguageToggleText, {}), jsx(ChevronDown, { className: "size-3 text-fd-muted-foreground" })] }) : null, themeSwitch.enabled !== false && (themeSwitch.component ?? jsx(ThemeToggle, { mode: themeSwitch?.mode }))] })] })] })] })] });
}
function NavbarLinkItem({ item, ...props }) {
  if (item.type === "custom")
    return jsx("div", { ...props, children: item.children });
  if (item.type === "menu") {
    const children = item.items.map((child, j) => {
      if (child.type === "custom") {
        return jsx(Fragment$1, { children: child.children }, j);
      }
      const { banner = child.icon ? jsx("div", { className: "w-fit rounded-md border bg-fd-muted p-1 [&_svg]:size-4", children: child.icon }) : null, ...rest } = child.menu ?? {};
      return jsx(NavbarMenuLink, { href: child.url, external: child.external, ...rest, children: rest.children ?? jsxs(Fragment, { children: [banner, jsx("p", { className: "text-[15px] font-medium", children: child.text }), jsx("p", { className: "text-sm text-fd-muted-foreground empty:hidden", children: child.description })] }) }, `${j}-${child.url}`);
    });
    return jsxs(NavbarMenu, { children: [jsx(NavbarMenuTrigger, { ...props, children: item.url ? jsx(Link2, { href: item.url, external: item.external, children: item.text }) : item.text }), jsx(NavbarMenuContent, { children })] });
  }
  return jsx(NavbarLink, { ...props, item, variant: item.type, "aria-label": item.type === "icon" ? item.label : void 0, children: item.type === "icon" ? item.icon : item.text });
}
function isSecondary(item) {
  if ("secondary" in item && item.secondary != null)
    return item.secondary;
  return item.type === "icon";
}
function baseOptions() {
  return {
    nav: {
      title: /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "SeoTool.im" })
    },
    searchToggle: {
      enabled: false
    },
    links: [
      {
        text: "Resources",
        url: "/blogs",
        items: [
          {
            text: "Blog",
            description: "SEO articles and guides.",
            url: "/blogs"
          },
          {
            text: "MCP",
            description: "Connect SeoTool.im to AI clients.",
            url: "/docs/mcp"
          },
          {
            text: "Skills",
            description: "Focused SeoTool.im workflows.",
            url: "/docs/skills"
          }
        ]
      },
      {
        text: "GitHub",
        url: "https://github.com/emerilansel-jpg/SeoTool",
        external: true
      }
    ]
  };
}
function NotFound() {
  return /* @__PURE__ */ jsx(HomeLayout, { ...baseOptions(), className: "text-center py-32 justify-center", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-6xl font-bold text-fd-muted-foreground", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold", children: "Page Not Found" }),
    /* @__PURE__ */ jsx("p", { className: "text-fd-muted-foreground max-w-md", children: "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable." }),
    /* @__PURE__ */ jsx(
      Link$3,
      {
        to: "/",
        className: "mt-4 px-4 py-2 rounded-lg bg-fd-primary text-fd-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity",
        children: "Back to Home"
      }
    )
  ] }) });
}
function getRouter() {
  return createRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultNotFoundComponent: NotFound
  });
}
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  SearchToggle as $,
  useTreeContext as A,
  useOnChange as B,
  ContentPost as C,
  DocsBody as D,
  Collapsible as E,
  usePathname as F,
  isActive as G,
  HomeLayout as H,
  ChevronDown as I,
  CollapsibleTrigger as J,
  CollapsibleContent as K,
  Link2 as L,
  MDXContent$c as M,
  ExternalLink as N,
  cva as O,
  Primitive as P,
  useTreePath as Q,
  Route$D as R,
  isTabActive as S,
  Popover as T,
  PopoverTrigger as U,
  ChevronsUpDown as V,
  PopoverContent as W,
  Check as X,
  useNav as Y,
  Sidebar as Z,
  buttonVariants as _,
  frontmatter$b as a,
  getLinks as a0,
  TreeContextProvider as a1,
  NavProvider as a2,
  BaseLinkItem as a3,
  LanguageToggle as a4,
  Languages as a5,
  LanguageToggleText as a6,
  ThemeToggle as a7,
  LargeSearchToggle as a8,
  Route$v as a9,
  frontmatter$1 as aA,
  MDXContent$1 as aB,
  frontmatter as aC,
  MDXContent as aD,
  useControllableState as aE,
  useId as aF,
  ReactRemoveScroll as aG,
  hideOthers as aH,
  createSlot as aI,
  useFocusGuards as aJ,
  FocusScope as aK,
  DismissableLayer as aL,
  createContext2 as aM,
  useI18n as aN,
  Search as aO,
  useRouter as aP,
  useEffectEvent as aQ,
  I18nLabel as aR,
  ChevronRight as aS,
  Hash as aT,
  e as aU,
  router as aV,
  clientMdxLoader as aa,
  frontmatter$7 as ab,
  MDXContent$7 as ac,
  frontmatter$6 as ad,
  MDXContent$6 as ae,
  SITE_URL as af,
  toCanonicalUrl as ag,
  PATH$2 as ah,
  Route$n as ai,
  FAQS as aj,
  page$7 as ak,
  page$6 as al,
  page$5 as am,
  page$4 as an,
  page$3 as ao,
  page$2 as ap,
  page$1 as aq,
  page as ar,
  frontmatter$5 as as,
  MDXContent$5 as at,
  frontmatter$4 as au,
  MDXContent$4 as av,
  frontmatter$3 as aw,
  MDXContent$3 as ax,
  frontmatter$2 as ay,
  MDXContent$2 as az,
  MDXContent$b as b,
  frontmatter$a as c,
  defaultMdxComponents as d,
  MDXContent$a as e,
  frontmatter$c as f,
  frontmatter$9 as g,
  MDXContent$9 as h,
  frontmatter$8 as i,
  MDXContent$8 as j,
  baseOptions as k,
  featureGroups as l,
  Route$B as m,
  docsDescription as n,
  Route$A as o,
  Route$w as p,
  clientMdxLoader$1 as q,
  useDirection as r,
  Presence as s,
  createContextScope as t,
  useComposedRefs as u,
  useCallbackRef$1 as v,
  useLayoutEffect2 as w,
  composeEventHandlers as x,
  twMerge as y,
  useSidebar as z
};
