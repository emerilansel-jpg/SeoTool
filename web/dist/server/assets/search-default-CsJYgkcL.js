import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry-KJBorVTL.js";
import { E as useOnChange, aB as useControllableState, aC as useId, t as Presence, P as Primitive, aD as ReactRemoveScroll, r as useComposedRefs, aE as hideOthers, y as composeEventHandlers, v as createContextScope, aF as createSlot, aG as useFocusGuards, aH as FocusScope, aI as DismissableLayer, aJ as createContext2, z as twMerge, aK as useI18n, aL as Search, a0 as buttonVariants, aM as useRouter, aN as useEffectEvent, aO as I18nLabel, aP as ChevronRight, aQ as Hash, aR as e, S as cva } from "./router-DA_5cv_p.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./source.generated-DIAsA55h.js";
function useDebounce(value, delayMs = 1e3) {
  const [debouncedValue, setDebouncedValue] = reactExports.useState(value);
  const timer = reactExports.useRef(void 0);
  if (delayMs === 0) return value;
  if (value !== debouncedValue && timer.current?.value !== value) {
    if (timer.current) clearTimeout(timer.current.handler);
    const handler = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);
    timer.current = { value, handler };
  }
  return debouncedValue;
}
function isDifferentDeep(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    return b.length !== a.length || a.some((v, i) => isDifferentDeep(v, b[i]));
  }
  if (typeof a === "object" && a && typeof b === "object" && b) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    return aKeys.length !== bKeys.length || aKeys.some(
      (key) => isDifferentDeep(a[key], b[key])
    );
  }
  return a !== b;
}
function useDocsSearch(clientOptions, _locale, _tag, _delayMs = 100, _allowEmpty = false, _key) {
  const {
    delayMs = _delayMs ?? 100,
    allowEmpty = _allowEmpty ?? false,
    ...client
  } = clientOptions;
  client.tag ??= _tag;
  client.locale ??= _locale;
  const [search, setSearch] = reactExports.useState("");
  const [results, setResults] = reactExports.useState("empty");
  const [error, setError] = reactExports.useState();
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const debouncedValue = useDebounce(search, delayMs);
  const onStart = reactExports.useRef(void 0);
  useOnChange(
    [client, debouncedValue],
    () => {
      if (onStart.current) {
        onStart.current();
        onStart.current = void 0;
      }
      setIsLoading(true);
      let interrupt = false;
      onStart.current = () => {
        interrupt = true;
      };
      async function run() {
        if (debouncedValue.length === 0 && !allowEmpty) return "empty";
        if (client.type === "fetch") {
          const { fetchDocs } = await import("./fetch-2XFMBLBA-uKSSbneq.js");
          return fetchDocs(debouncedValue, client);
        }
        if (client.type === "algolia") {
          const { searchDocs } = await import("./algolia-IZEDLPHE-ChBqEtpU.js");
          return searchDocs(debouncedValue, client);
        }
        if (client.type === "orama-cloud") {
          const { searchDocs } = await import("./orama-cloud-74FM25SB-B5oqQiwM.js");
          return searchDocs(debouncedValue, client);
        }
        if (client.type === "static") {
          const { search: search2 } = await import("./static-A2YJ5TXV-8agFmRb4.js");
          return search2(debouncedValue, client);
        }
        if (client.type === "mixedbread") {
          const { search: search2 } = await import("./mixedbread-RAHDVXGJ-C0pOVNHC.js");
          return search2(debouncedValue, client);
        }
        throw new Error("unknown search client");
      }
      void run().then((res) => {
        if (interrupt) return;
        setError(void 0);
        setResults(res);
      }).catch((err) => {
        setError(err);
      }).finally(() => {
        setIsLoading(false);
      });
    },
    isDifferentDeep
  );
  return { search, setSearch, query: { isLoading, data: results, error } };
}
var DIALOG_NAME = "Dialog";
var [createDialogContext] = createContextScope(DIALOG_NAME);
var [DialogProvider, useDialogContext] = createDialogContext(DIALOG_NAME);
var Dialog = (props) => {
  const {
    __scopeDialog,
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
    modal = true
  } = props;
  const triggerRef = reactExports.useRef(null);
  const contentRef = reactExports.useRef(null);
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
    caller: DIALOG_NAME
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DialogProvider,
    {
      scope: __scopeDialog,
      triggerRef,
      contentRef,
      contentId: useId(),
      titleId: useId(),
      descriptionId: useId(),
      open,
      onOpenChange: setOpen,
      onOpenToggle: reactExports.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
      modal,
      children
    }
  );
};
Dialog.displayName = DIALOG_NAME;
var TRIGGER_NAME = "DialogTrigger";
var DialogTrigger = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...triggerProps } = props;
    const context = useDialogContext(TRIGGER_NAME, __scopeDialog);
    const composedTriggerRef = useComposedRefs(forwardedRef, context.triggerRef);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
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
  }
);
DialogTrigger.displayName = TRIGGER_NAME;
var PORTAL_NAME = "DialogPortal";
var [PortalProvider, usePortalContext] = createDialogContext(PORTAL_NAME, {
  forceMount: void 0
});
var OVERLAY_NAME = "DialogOverlay";
var DialogOverlay = reactExports.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext(OVERLAY_NAME, props.__scopeDialog);
    const { forceMount = portalContext.forceMount, ...overlayProps } = props;
    const context = useDialogContext(OVERLAY_NAME, props.__scopeDialog);
    return context.modal ? /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogOverlayImpl, { ...overlayProps, ref: forwardedRef }) }) : null;
  }
);
DialogOverlay.displayName = OVERLAY_NAME;
var Slot = createSlot("DialogOverlay.RemoveScroll");
var DialogOverlayImpl = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...overlayProps } = props;
    const context = useDialogContext(OVERLAY_NAME, __scopeDialog);
    return (
      // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
      // ie. when `Overlay` and `Content` are siblings
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReactRemoveScroll, { as: Slot, allowPinchZoom: true, shards: [context.contentRef], children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Primitive.div,
        {
          "data-state": getState(context.open),
          ...overlayProps,
          ref: forwardedRef,
          style: { pointerEvents: "auto", ...overlayProps.style }
        }
      ) })
    );
  }
);
var CONTENT_NAME = "DialogContent";
var DialogContent = reactExports.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME, props.__scopeDialog);
    const { forceMount = portalContext.forceMount, ...contentProps } = props;
    const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: context.modal ? /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContentModal, { ...contentProps, ref: forwardedRef }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContentNonModal, { ...contentProps, ref: forwardedRef }) });
  }
);
DialogContent.displayName = CONTENT_NAME;
var DialogContentModal = reactExports.forwardRef(
  (props, forwardedRef) => {
    const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
    const contentRef = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, context.contentRef, contentRef);
    reactExports.useEffect(() => {
      const content = contentRef.current;
      if (content) return hideOthers(content);
    }, []);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      DialogContentImpl,
      {
        ...props,
        ref: composedRefs,
        trapFocus: context.open,
        disableOutsidePointerEvents: true,
        onCloseAutoFocus: composeEventHandlers(props.onCloseAutoFocus, (event) => {
          event.preventDefault();
          context.triggerRef.current?.focus();
        }),
        onPointerDownOutside: composeEventHandlers(props.onPointerDownOutside, (event) => {
          const originalEvent = event.detail.originalEvent;
          const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
          const isRightClick = originalEvent.button === 2 || ctrlLeftClick;
          if (isRightClick) event.preventDefault();
        }),
        onFocusOutside: composeEventHandlers(
          props.onFocusOutside,
          (event) => event.preventDefault()
        )
      }
    );
  }
);
var DialogContentNonModal = reactExports.forwardRef(
  (props, forwardedRef) => {
    const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
    const hasInteractedOutsideRef = reactExports.useRef(false);
    const hasPointerDownOutsideRef = reactExports.useRef(false);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      DialogContentImpl,
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
var DialogContentImpl = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, trapFocus, onOpenAutoFocus, onCloseAutoFocus, ...contentProps } = props;
    const context = useDialogContext(CONTENT_NAME, __scopeDialog);
    const contentRef = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, contentRef);
    useFocusGuards();
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        FocusScope,
        {
          asChild: true,
          loop: true,
          trapped: trapFocus,
          onMountAutoFocus: onOpenAutoFocus,
          onUnmountAutoFocus: onCloseAutoFocus,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            DismissableLayer,
            {
              role: "dialog",
              id: context.contentId,
              "aria-describedby": context.descriptionId,
              "aria-labelledby": context.titleId,
              "data-state": getState(context.open),
              ...contentProps,
              ref: composedRefs,
              onDismiss: () => context.onOpenChange(false)
            }
          )
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TitleWarning, { titleId: context.titleId }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DescriptionWarning, { contentRef, descriptionId: context.descriptionId })
      ] })
    ] });
  }
);
var TITLE_NAME = "DialogTitle";
var DialogTitle = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...titleProps } = props;
    const context = useDialogContext(TITLE_NAME, __scopeDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.h2, { id: context.titleId, ...titleProps, ref: forwardedRef });
  }
);
DialogTitle.displayName = TITLE_NAME;
var DESCRIPTION_NAME = "DialogDescription";
var DialogDescription = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...descriptionProps } = props;
    const context = useDialogContext(DESCRIPTION_NAME, __scopeDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Primitive.p, { id: context.descriptionId, ...descriptionProps, ref: forwardedRef });
  }
);
DialogDescription.displayName = DESCRIPTION_NAME;
var CLOSE_NAME = "DialogClose";
var DialogClose = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...closeProps } = props;
    const context = useDialogContext(CLOSE_NAME, __scopeDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
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
DialogClose.displayName = CLOSE_NAME;
function getState(open) {
  return open ? "open" : "closed";
}
var TITLE_WARNING_NAME = "DialogTitleWarning";
var [WarningProvider, useWarningContext] = createContext2(TITLE_WARNING_NAME, {
  contentName: CONTENT_NAME,
  titleName: TITLE_NAME,
  docsSlug: "dialog"
});
var TitleWarning = ({ titleId }) => {
  const titleWarningContext = useWarningContext(TITLE_WARNING_NAME);
  const MESSAGE = `\`${titleWarningContext.contentName}\` requires a \`${titleWarningContext.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${titleWarningContext.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${titleWarningContext.docsSlug}`;
  reactExports.useEffect(() => {
    if (titleId) {
      const hasTitle = document.getElementById(titleId);
      if (!hasTitle) console.error(MESSAGE);
    }
  }, [MESSAGE, titleId]);
  return null;
};
var DESCRIPTION_WARNING_NAME = "DialogDescriptionWarning";
var DescriptionWarning = ({ contentRef, descriptionId }) => {
  const descriptionWarningContext = useWarningContext(DESCRIPTION_WARNING_NAME);
  const MESSAGE = `Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${descriptionWarningContext.contentName}}.`;
  reactExports.useEffect(() => {
    const describedById = contentRef.current?.getAttribute("aria-describedby");
    if (descriptionId && describedById) {
      const hasDescription = document.getElementById(descriptionId);
      if (!hasDescription) console.warn(MESSAGE);
    }
  }, [MESSAGE, contentRef, descriptionId]);
  return null;
};
const Context = reactExports.createContext(null);
const ListContext = reactExports.createContext(null);
const TagsListContext = reactExports.createContext(null);
function SearchDialog({ open, onOpenChange, search, onSearchChange, isLoading = false, children }) {
  const [active, setActive] = reactExports.useState(null);
  return jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: jsxRuntimeExports.jsx(Context.Provider, { value: reactExports.useMemo(() => ({
    open,
    onOpenChange,
    search,
    onSearchChange,
    active,
    setActive,
    isLoading
  }), [active, isLoading, onOpenChange, onSearchChange, open, search]), children }) });
}
function SearchDialogHeader(props) {
  return jsxRuntimeExports.jsx("div", { ...props, className: twMerge("flex flex-row items-center gap-2 p-3", props.className) });
}
function SearchDialogInput(props) {
  const { text } = useI18n();
  const { search, onSearchChange } = useSearch();
  return jsxRuntimeExports.jsx("input", { ...props, value: search, onChange: (e2) => onSearchChange(e2.target.value), placeholder: text.search, className: "w-0 flex-1 bg-transparent text-lg placeholder:text-fd-muted-foreground focus-visible:outline-none" });
}
function SearchDialogClose({ children = "ESC", className, ...props }) {
  const { onOpenChange } = useSearch();
  return jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onOpenChange(false), className: twMerge(buttonVariants({
    color: "outline",
    size: "sm",
    className: "font-mono text-fd-muted-foreground"
  }), className), ...props, children });
}
function SearchDialogFooter(props) {
  return jsxRuntimeExports.jsx("div", { ...props, className: twMerge("bg-fd-secondary/50 p-3 empty:hidden", props.className) });
}
function SearchDialogOverlay(props) {
  return jsxRuntimeExports.jsx(DialogOverlay, { ...props, className: twMerge("fixed inset-0 z-50 backdrop-blur-xs data-[state=open]:animate-fd-fade-in data-[state=closed]:animate-fd-fade-out", props.className) });
}
function SearchDialogContent({ children, ...props }) {
  const { text } = useI18n();
  return jsxRuntimeExports.jsxs(DialogContent, { "aria-describedby": void 0, ...props, className: twMerge("fixed left-1/2 top-4 md:top-[calc(50%-250px)] z-50 w-[calc(100%-1rem)] max-w-screen-sm -translate-x-1/2 rounded-xl border bg-fd-popover text-fd-popover-foreground shadow-2xl shadow-black/50 overflow-hidden data-[state=closed]:animate-fd-dialog-out data-[state=open]:animate-fd-dialog-in", "*:border-b *:has-[+:last-child[data-empty=true]]:border-b-0 *:data-[empty=true]:border-b-0 *:last:border-b-0", props.className), children: [jsxRuntimeExports.jsx(DialogTitle, { className: "hidden", children: text.search }), children] });
}
function SearchDialogList({ items = null, Empty = () => jsxRuntimeExports.jsx("div", { className: "py-12 text-center text-sm text-fd-muted-foreground", children: jsxRuntimeExports.jsx(I18nLabel, { label: "searchNoResult" }) }), Item = (props2) => jsxRuntimeExports.jsx(SearchDialogListItem, { ...props2 }), ...props }) {
  const ref = reactExports.useRef(null);
  const [active, setActive] = reactExports.useState(() => items && items.length > 0 ? items[0].id : null);
  const { onOpenChange } = useSearch();
  const router = useRouter();
  const onOpen = (item) => {
    if (item.type === "action") {
      item.onSelect();
    } else if (item.external) {
      window.open(item.url, "_blank")?.focus();
    } else {
      router.push(item.url);
    }
    onOpenChange(false);
  };
  const onKey = useEffectEvent((e2) => {
    if (!items || e2.isComposing)
      return;
    if (e2.key === "ArrowDown" || e2.key == "ArrowUp") {
      let idx = items.findIndex((item) => item.id === active);
      if (idx === -1)
        idx = 0;
      else if (e2.key === "ArrowDown")
        idx++;
      else
        idx--;
      setActive(items.at(idx % items.length)?.id ?? null);
      e2.preventDefault();
    }
    if (e2.key === "Enter") {
      const selected = items.find((item) => item.id === active);
      if (selected)
        onOpen(selected);
      e2.preventDefault();
    }
  });
  reactExports.useEffect(() => {
    const element = ref.current;
    if (!element)
      return;
    const observer = new ResizeObserver(() => {
      const viewport2 = element.firstElementChild;
      element.style.setProperty("--fd-animated-height", `${viewport2.clientHeight}px`);
    });
    const viewport = element.firstElementChild;
    if (viewport)
      observer.observe(viewport);
    window.addEventListener("keydown", onKey);
    return () => {
      observer.disconnect();
      window.removeEventListener("keydown", onKey);
    };
  }, []);
  useOnChange(items, () => {
    if (items && items.length > 0) {
      setActive(items[0].id);
    }
  });
  return jsxRuntimeExports.jsx("div", { ...props, ref, "data-empty": items === null, className: twMerge("overflow-hidden h-(--fd-animated-height) transition-[height]", props.className), children: jsxRuntimeExports.jsx("div", { className: twMerge("w-full flex flex-col overflow-y-auto max-h-[460px] p-1", !items && "hidden"), children: jsxRuntimeExports.jsxs(ListContext.Provider, { value: reactExports.useMemo(() => ({
    active,
    setActive
  }), [active]), children: [items?.length === 0 && Empty(), items?.map((item) => jsxRuntimeExports.jsx(reactExports.Fragment, { children: Item({ item, onClick: () => onOpen(item) }) }, item.id))] }) }) });
}
function SearchDialogListItem({ item, className, children, renderHighlights: render = renderHighlights, ...props }) {
  const { active: activeId, setActive } = useSearchList();
  const active = item.id === activeId;
  if (item.type === "action") {
    children ?? (children = item.node);
  } else {
    children ?? (children = jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [jsxRuntimeExports.jsx("div", { className: "inline-flex items-center text-fd-muted-foreground text-xs empty:hidden", children: item.breadcrumbs?.map((item2, i) => jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [i > 0 && jsxRuntimeExports.jsx(ChevronRight, { className: "size-4" }), item2] }, i)) }), item.type !== "page" && jsxRuntimeExports.jsx("div", { role: "none", className: "absolute start-3 inset-y-0 w-px bg-fd-border" }), jsxRuntimeExports.jsxs("p", { className: twMerge("min-w-0 truncate", item.type !== "page" && "ps-4", item.type === "page" || item.type === "heading" ? "font-medium" : "text-fd-popover-foreground/80"), children: [item.type === "heading" && jsxRuntimeExports.jsx(Hash, { className: "inline me-1 size-4 text-fd-muted-foreground" }), item.contentWithHighlights ? render(item.contentWithHighlights) : item.content] })] }));
  }
  return jsxRuntimeExports.jsx("button", { type: "button", ref: reactExports.useCallback((element) => {
    if (active && element) {
      e(element, {
        scrollMode: "if-needed",
        block: "nearest",
        boundary: element.parentElement
      });
    }
  }, [active]), "aria-selected": active, className: twMerge("relative select-none px-2.5 py-2 text-start text-sm rounded-lg", active && "bg-fd-accent text-fd-accent-foreground", className), onPointerMove: () => setActive(item.id), ...props, children });
}
function SearchDialogIcon(props) {
  const { isLoading } = useSearch();
  return jsxRuntimeExports.jsx(Search, { ...props, className: twMerge("size-5 text-fd-muted-foreground", isLoading && "animate-pulse duration-400", props.className) });
}
const itemVariants = cva("rounded-md border px-2 py-0.5 text-xs font-medium text-fd-muted-foreground transition-colors", {
  variants: {
    active: {
      true: "bg-fd-accent text-fd-accent-foreground"
    }
  }
});
function TagsList({ tag, onTagChange, allowClear = false, ...props }) {
  return jsxRuntimeExports.jsx("div", { ...props, className: twMerge("flex items-center gap-1 flex-wrap", props.className), children: jsxRuntimeExports.jsx(TagsListContext.Provider, { value: reactExports.useMemo(() => ({
    value: tag,
    onValueChange: onTagChange,
    allowClear
  }), [allowClear, onTagChange, tag]), children: props.children }) });
}
function TagsListItem({ value, className, ...props }) {
  const { onValueChange, value: selectedValue, allowClear } = useTagsList();
  const selected = value === selectedValue;
  return jsxRuntimeExports.jsx("button", { type: "button", "data-active": selected, className: twMerge(itemVariants({ active: selected, className })), onClick: () => {
    onValueChange(selected && allowClear ? void 0 : value);
  }, tabIndex: -1, ...props, children: props.children });
}
function renderHighlights(highlights) {
  return highlights.map((node, i) => {
    if (node.styles?.highlight) {
      return jsxRuntimeExports.jsx("span", { className: "text-fd-primary underline", children: node.content }, i);
    }
    return jsxRuntimeExports.jsx(reactExports.Fragment, { children: node.content }, i);
  });
}
function useSearch() {
  const ctx = reactExports.useContext(Context);
  if (!ctx)
    throw new Error("Missing <SearchDialog />");
  return ctx;
}
function useTagsList() {
  const ctx = reactExports.useContext(TagsListContext);
  if (!ctx)
    throw new Error("Missing <TagsList />");
  return ctx;
}
function useSearchList() {
  const ctx = reactExports.useContext(ListContext);
  if (!ctx)
    throw new Error("Missing <SearchDialogList />");
  return ctx;
}
function DefaultSearchDialog({ defaultTag, tags = [], api, delayMs, type = "fetch", allowClear = false, links = [], footer, ...props }) {
  const { locale } = useI18n();
  const [tag, setTag] = reactExports.useState(defaultTag);
  const { search, setSearch, query } = useDocsSearch(type === "fetch" ? {
    type: "fetch",
    api,
    locale,
    tag,
    delayMs
  } : {
    type: "static",
    from: api,
    locale,
    tag,
    delayMs
  });
  const defaultItems = reactExports.useMemo(() => {
    if (links.length === 0)
      return null;
    return links.map(([name, link]) => ({
      type: "page",
      id: name,
      content: name,
      url: link
    }));
  }, [links]);
  useOnChange(defaultTag, (v) => {
    setTag(v);
  });
  return jsxRuntimeExports.jsxs(SearchDialog, { search, onSearchChange: setSearch, isLoading: query.isLoading, ...props, children: [jsxRuntimeExports.jsx(SearchDialogOverlay, {}), jsxRuntimeExports.jsxs(SearchDialogContent, { children: [jsxRuntimeExports.jsxs(SearchDialogHeader, { children: [jsxRuntimeExports.jsx(SearchDialogIcon, {}), jsxRuntimeExports.jsx(SearchDialogInput, {}), jsxRuntimeExports.jsx(SearchDialogClose, {})] }), jsxRuntimeExports.jsx(SearchDialogList, { items: query.data !== "empty" ? query.data : defaultItems })] }), jsxRuntimeExports.jsxs(SearchDialogFooter, { children: [tags.length > 0 && jsxRuntimeExports.jsx(TagsList, { tag, onTagChange: setTag, allowClear, children: tags.map((tag2) => jsxRuntimeExports.jsx(TagsListItem, { value: tag2.value, children: tag2.name }, tag2.value)) }), footer] })] });
}
export {
  DefaultSearchDialog as default
};
