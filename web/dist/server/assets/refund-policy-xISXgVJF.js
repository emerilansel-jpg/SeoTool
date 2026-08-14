import { U as jsxRuntimeExports } from "./worker-entry-KJBorVTL.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
let frontmatter = {
  "title": "Refund Policy",
  "description": "Subscription cancellation and refund terms for SeoTool.im."
};
let extractedReferences = [{
  "href": "mailto:support@seotool.im"
}];
let structuredData = {
  "contents": [{
    "heading": void 0,
    "content": "Last updated: August 12, 2026"
  }, {
    "heading": "14-day-money-back-guarantee",
    "content": "We want you to be fully satisfied with SeoTool.im. We offer a 14-day, no-questions-asked refund policy for all new subscription plans. If you are not happy with the product, contact us within the first 14 days of your original purchase for a full refund."
  }, {
    "heading": "cancellations",
    "content": "You can cancel your subscription at any time through your account billing settings. Once canceled, you will retain full access to your quotas and premium features until the end of your current billing cycle."
  }, {
    "heading": "cancellations",
    "content": "We do not provide prorated refunds for mid-billing cycle cancellations."
  }, {
    "heading": "exceptions",
    "content": "API usage overages are strictly non-refundable as they incur direct costs to our infrastructure."
  }, {
    "heading": "exceptions",
    "content": "Renewals are non-refundable. We send notifications before yearly renewals process."
  }, {
    "heading": "exceptions",
    "content": "To request a refund, please email us directly at support@seotool.im with your account details."
  }],
  "headings": [{
    "id": "14-day-money-back-guarantee",
    "content": "14-Day Money-Back Guarantee"
  }, {
    "id": "cancellations",
    "content": "Cancellations"
  }, {
    "id": "exceptions",
    "content": "Exceptions"
  }]
};
const toc = [{
  depth: 2,
  url: "#14-day-money-back-guarantee",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "14-Day Money-Back Guarantee"
  })
}, {
  depth: 2,
  url: "#cancellations",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Cancellations"
  })
}, {
  depth: 2,
  url: "#exceptions",
  title: jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, {
    children: "Exceptions"
  })
}];
function _createMdxContent(props) {
  const _components = {
    a: "a",
    h2: "h2",
    li: "li",
    p: "p",
    ul: "ul",
    ...props.components
  };
  return jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
    children: [jsxRuntimeExports.jsx(_components.p, {
      children: "Last updated: August 12, 2026"
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "14-day-money-back-guarantee",
      children: "14-Day Money-Back Guarantee"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "We want you to be fully satisfied with SeoTool.im. We offer a 14-day, no-questions-asked refund policy for all new subscription plans. If you are not happy with the product, contact us within the first 14 days of your original purchase for a full refund."
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "cancellations",
      children: "Cancellations"
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "You can cancel your subscription at any time through your account billing settings. Once canceled, you will retain full access to your quotas and premium features until the end of your current billing cycle."
    }), "\n", jsxRuntimeExports.jsx(_components.p, {
      children: "We do not provide prorated refunds for mid-billing cycle cancellations."
    }), "\n", jsxRuntimeExports.jsx(_components.h2, {
      id: "exceptions",
      children: "Exceptions"
    }), "\n", jsxRuntimeExports.jsxs(_components.ul, {
      children: ["\n", jsxRuntimeExports.jsx(_components.li, {
        children: "API usage overages are strictly non-refundable as they incur direct costs to our infrastructure."
      }), "\n", jsxRuntimeExports.jsx(_components.li, {
        children: "Renewals are non-refundable. We send notifications before yearly renewals process."
      }), "\n"]
    }), "\n", jsxRuntimeExports.jsxs(_components.p, {
      children: ["To request a refund, please email us directly at ", jsxRuntimeExports.jsx(_components.a, {
        href: "mailto:support@seotool.im",
        children: "support@seotool.im"
      }), " with your account details."]
    })]
  });
}
function MDXContent(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? jsxRuntimeExports.jsx(MDXLayout, {
    ...props,
    children: jsxRuntimeExports.jsx(_createMdxContent, {
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
