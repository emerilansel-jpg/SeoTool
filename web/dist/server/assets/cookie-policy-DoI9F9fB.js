import { jsx, jsxs, Fragment } from "react/jsx-runtime";
let frontmatter = {
  "title": "Cookie Policy",
  "description": "How SeoTool.im uses cookies and similar technologies."
};
let extractedReferences = [{
  "href": "mailto:support@seotool.im"
}];
let structuredData = {
  "contents": [{
    "heading": void 0,
    "content": "Last updated: August 12, 2026"
  }, {
    "heading": "overview",
    "content": 'This Cookie Policy explains how Every App, Inc. ("SeoTool.im", "we", "us", or "our") uses cookies and similar technologies when you visit our website (seotool.im) and use our SaaS application.'
  }, {
    "heading": "what-are-cookies",
    "content": "Cookies are small data files placed on your computer or mobile device. We use them to make our application work, ensure security, and understand how people use our service."
  }, {
    "heading": "types-of-cookies-we-use",
    "content": "1. Essential Cookies\nWe use strictly necessary cookies to keep you signed in. These are required for the application to function securely."
  }, {
    "heading": "types-of-cookies-we-use",
    "content": "2. Analytics Cookies\nFor our public website, we use privacy-friendly, cookieless analytics. We do not track you across the internet. For the authenticated dashboard, we use internal analytics to improve our product features, which you can opt out of in your account settings."
  }, {
    "heading": "managing-your-preferences",
    "content": "Most browsers allow you to refuse or delete cookies. If you block essential cookies, you will not be able to sign in or use the SeoTool.im dashboard."
  }, {
    "heading": "managing-your-preferences",
    "content": "For questions about this policy, contact us at support@seotool.im."
  }],
  "headings": [{
    "id": "overview",
    "content": "Overview"
  }, {
    "id": "what-are-cookies",
    "content": "What Are Cookies?"
  }, {
    "id": "types-of-cookies-we-use",
    "content": "Types of Cookies We Use"
  }, {
    "id": "managing-your-preferences",
    "content": "Managing Your Preferences"
  }]
};
const toc = [{
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
function _createMdxContent(props) {
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
function MDXContent(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsx(MDXLayout, {
    ...props,
    children: jsx(_createMdxContent, {
      ...props
    })
  }) : _createMdxContent(props);
}
export {
  MDXContent as default,
  extractedReferences,
  frontmatter,
  structuredData,
  toc
};
