import { jsx, jsxs, Fragment } from "react/jsx-runtime";
let frontmatter = {
  "title": "Data Processing Addendum (DPA)",
  "description": "Data Processing terms for SeoTool.im B2B customers to comply with GDPR."
};
let extractedReferences = [{
  "href": "mailto:support@seotool.im"
}];
let structuredData = {
  "contents": [{
    "heading": void 0,
    "content": "Last updated: August 12, 2026"
  }, {
    "heading": "1-introduction",
    "content": 'This Data Processing Addendum (DPA) forms part of the Terms of Service between Every App, Inc. ("SeoTool.im") and you ("Customer"). It applies when SeoTool.im processes personal data on your behalf while providing our SaaS application.'
  }, {
    "heading": "2-definitions",
    "content": "Processing: Any operation performed on personal data."
  }, {
    "heading": "2-definitions",
    "content": "Subprocessor: A third party engaged by SeoTool.im to process data."
  }, {
    "heading": "3-data-processing-obligations",
    "content": "SeoTool.im will only process personal data in accordance with your documented instructions and for the purpose of providing our services. We comply with all applicable data protection laws, including the GDPR."
  }, {
    "heading": "4-security-measures",
    "content": "We implement rigorous technical and organizational measures to protect personal data against unauthorized access, loss, or destruction. We limit access to our databases strictly to authorized personnel."
  }, {
    "heading": "5-subprocessors",
    "content": "By using SeoTool.im, you authorize us to engage trusted subprocessors (such as our cloud infrastructure providers and billing partners). A list of current subprocessors is available upon request."
  }, {
    "heading": "5-subprocessors",
    "content": "If you have GDPR compliance needs or require a signed copy of this DPA, please contact us at support@seotool.im."
  }],
  "headings": [{
    "id": "1-introduction",
    "content": "1. Introduction"
  }, {
    "id": "2-definitions",
    "content": "2. Definitions"
  }, {
    "id": "3-data-processing-obligations",
    "content": "3. Data Processing Obligations"
  }, {
    "id": "4-security-measures",
    "content": "4. Security Measures"
  }, {
    "id": "5-subprocessors",
    "content": "5. Subprocessors"
  }]
};
const toc = [{
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
function _createMdxContent(props) {
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
