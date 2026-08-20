import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState, useEffect, useMemo, Fragment as Fragment$1, useRef, createContext, useContext } from "react";
import { u as useComposedRefs, r as useDirection, P as Primitive, s as Presence, t as createContextScope, v as useCallbackRef, w as useLayoutEffect2, x as composeEventHandlers, y as twMerge, z as useSidebar, A as useTreeContext, B as useOnChange, E as Collapsible, F as usePathname, G as isActive, L as Link2, I as ChevronDown, J as CollapsibleTrigger, K as CollapsibleContent, N as ExternalLink, O as cva, Q as useTreePath, S as isTabActive, T as Popover, U as PopoverTrigger, V as ChevronsUpDown, W as PopoverContent, X as Check, Y as useNav, Z as Sidebar$1, _ as buttonVariants, $ as SearchToggle, a0 as getLinks, a1 as TreeContextProvider, a2 as NavProvider, a3 as BaseLinkItem, a4 as LanguageToggle, a5 as Languages, a6 as LanguageToggleText, a7 as ThemeToggle, a8 as LargeSearchToggle } from "./router-DyJXM2Bq.js";
function clamp(value, [min, max]) {
  return Math.min(max, Math.max(min, value));
}
function useStateMachine(initialState, machine) {
  return React.useReducer((state, event) => {
    const nextState = machine[state][event];
    return nextState ?? state;
  }, initialState);
}
var SCROLL_AREA_NAME = "ScrollArea";
var [createScrollAreaContext] = createContextScope(SCROLL_AREA_NAME);
var [ScrollAreaProvider, useScrollAreaContext] = createScrollAreaContext(SCROLL_AREA_NAME);
var ScrollArea$1 = React.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeScrollArea,
      type = "hover",
      dir,
      scrollHideDelay = 600,
      ...scrollAreaProps
    } = props;
    const [scrollArea, setScrollArea] = React.useState(null);
    const [viewport, setViewport] = React.useState(null);
    const [content, setContent] = React.useState(null);
    const [scrollbarX, setScrollbarX] = React.useState(null);
    const [scrollbarY, setScrollbarY] = React.useState(null);
    const [cornerWidth, setCornerWidth] = React.useState(0);
    const [cornerHeight, setCornerHeight] = React.useState(0);
    const [scrollbarXEnabled, setScrollbarXEnabled] = React.useState(false);
    const [scrollbarYEnabled, setScrollbarYEnabled] = React.useState(false);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setScrollArea(node));
    const direction = useDirection(dir);
    return /* @__PURE__ */ jsx(
      ScrollAreaProvider,
      {
        scope: __scopeScrollArea,
        type,
        dir: direction,
        scrollHideDelay,
        scrollArea,
        viewport,
        onViewportChange: setViewport,
        content,
        onContentChange: setContent,
        scrollbarX,
        onScrollbarXChange: setScrollbarX,
        scrollbarXEnabled,
        onScrollbarXEnabledChange: setScrollbarXEnabled,
        scrollbarY,
        onScrollbarYChange: setScrollbarY,
        scrollbarYEnabled,
        onScrollbarYEnabledChange: setScrollbarYEnabled,
        onCornerWidthChange: setCornerWidth,
        onCornerHeightChange: setCornerHeight,
        children: /* @__PURE__ */ jsx(
          Primitive.div,
          {
            dir: direction,
            ...scrollAreaProps,
            ref: composedRefs,
            style: {
              position: "relative",
              // Pass corner sizes as CSS vars to reduce re-renders of context consumers
              ["--radix-scroll-area-corner-width"]: cornerWidth + "px",
              ["--radix-scroll-area-corner-height"]: cornerHeight + "px",
              ...props.style
            }
          }
        )
      }
    );
  }
);
ScrollArea$1.displayName = SCROLL_AREA_NAME;
var VIEWPORT_NAME = "ScrollAreaViewport";
var ScrollAreaViewport = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeScrollArea, children, nonce, ...viewportProps } = props;
    const context = useScrollAreaContext(VIEWPORT_NAME, __scopeScrollArea);
    const ref = React.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref, context.onViewportChange);
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        "style",
        {
          dangerouslySetInnerHTML: {
            __html: `[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}`
          },
          nonce
        }
      ),
      /* @__PURE__ */ jsx(
        Primitive.div,
        {
          "data-radix-scroll-area-viewport": "",
          ...viewportProps,
          ref: composedRefs,
          style: {
            /**
             * We don't support `visible` because the intention is to have at least one scrollbar
             * if this component is used and `visible` will behave like `auto` in that case
             * https://developer.mozilla.org/en-US/docs/Web/CSS/overflow#description
             *
             * We don't handle `auto` because the intention is for the native implementation
             * to be hidden if using this component. We just want to ensure the node is scrollable
             * so could have used either `scroll` or `auto` here. We picked `scroll` to prevent
             * the browser from having to work out whether to render native scrollbars or not,
             * we tell it to with the intention of hiding them in CSS.
             */
            overflowX: context.scrollbarXEnabled ? "scroll" : "hidden",
            overflowY: context.scrollbarYEnabled ? "scroll" : "hidden",
            ...props.style
          },
          children: /* @__PURE__ */ jsx("div", { ref: context.onContentChange, style: { minWidth: "100%", display: "table" }, children })
        }
      )
    ] });
  }
);
ScrollAreaViewport.displayName = VIEWPORT_NAME;
var SCROLLBAR_NAME = "ScrollAreaScrollbar";
var ScrollAreaScrollbar = React.forwardRef(
  (props, forwardedRef) => {
    const { forceMount, ...scrollbarProps } = props;
    const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
    const { onScrollbarXEnabledChange, onScrollbarYEnabledChange } = context;
    const isHorizontal = props.orientation === "horizontal";
    React.useEffect(() => {
      isHorizontal ? onScrollbarXEnabledChange(true) : onScrollbarYEnabledChange(true);
      return () => {
        isHorizontal ? onScrollbarXEnabledChange(false) : onScrollbarYEnabledChange(false);
      };
    }, [isHorizontal, onScrollbarXEnabledChange, onScrollbarYEnabledChange]);
    return context.type === "hover" ? /* @__PURE__ */ jsx(ScrollAreaScrollbarHover, { ...scrollbarProps, ref: forwardedRef, forceMount }) : context.type === "scroll" ? /* @__PURE__ */ jsx(ScrollAreaScrollbarScroll, { ...scrollbarProps, ref: forwardedRef, forceMount }) : context.type === "auto" ? /* @__PURE__ */ jsx(ScrollAreaScrollbarAuto, { ...scrollbarProps, ref: forwardedRef, forceMount }) : context.type === "always" ? /* @__PURE__ */ jsx(ScrollAreaScrollbarVisible, { ...scrollbarProps, ref: forwardedRef }) : null;
  }
);
ScrollAreaScrollbar.displayName = SCROLLBAR_NAME;
var ScrollAreaScrollbarHover = React.forwardRef((props, forwardedRef) => {
  const { forceMount, ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const scrollArea = context.scrollArea;
    let hideTimer = 0;
    if (scrollArea) {
      const handlePointerEnter = () => {
        window.clearTimeout(hideTimer);
        setVisible(true);
      };
      const handlePointerLeave = () => {
        hideTimer = window.setTimeout(() => setVisible(false), context.scrollHideDelay);
      };
      scrollArea.addEventListener("pointerenter", handlePointerEnter);
      scrollArea.addEventListener("pointerleave", handlePointerLeave);
      return () => {
        window.clearTimeout(hideTimer);
        scrollArea.removeEventListener("pointerenter", handlePointerEnter);
        scrollArea.removeEventListener("pointerleave", handlePointerLeave);
      };
    }
  }, [context.scrollArea, context.scrollHideDelay]);
  return /* @__PURE__ */ jsx(Presence, { present: forceMount || visible, children: /* @__PURE__ */ jsx(
    ScrollAreaScrollbarAuto,
    {
      "data-state": visible ? "visible" : "hidden",
      ...scrollbarProps,
      ref: forwardedRef
    }
  ) });
});
var ScrollAreaScrollbarScroll = React.forwardRef((props, forwardedRef) => {
  const { forceMount, ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const isHorizontal = props.orientation === "horizontal";
  const debounceScrollEnd = useDebounceCallback(() => send("SCROLL_END"), 100);
  const [state, send] = useStateMachine("hidden", {
    hidden: {
      SCROLL: "scrolling"
    },
    scrolling: {
      SCROLL_END: "idle",
      POINTER_ENTER: "interacting"
    },
    interacting: {
      SCROLL: "interacting",
      POINTER_LEAVE: "idle"
    },
    idle: {
      HIDE: "hidden",
      SCROLL: "scrolling",
      POINTER_ENTER: "interacting"
    }
  });
  React.useEffect(() => {
    if (state === "idle") {
      const hideTimer = window.setTimeout(() => send("HIDE"), context.scrollHideDelay);
      return () => window.clearTimeout(hideTimer);
    }
  }, [state, context.scrollHideDelay, send]);
  React.useEffect(() => {
    const viewport = context.viewport;
    const scrollDirection = isHorizontal ? "scrollLeft" : "scrollTop";
    if (viewport) {
      let prevScrollPos = viewport[scrollDirection];
      const handleScroll = () => {
        const scrollPos = viewport[scrollDirection];
        const hasScrollInDirectionChanged = prevScrollPos !== scrollPos;
        if (hasScrollInDirectionChanged) {
          send("SCROLL");
          debounceScrollEnd();
        }
        prevScrollPos = scrollPos;
      };
      viewport.addEventListener("scroll", handleScroll);
      return () => viewport.removeEventListener("scroll", handleScroll);
    }
  }, [context.viewport, isHorizontal, send, debounceScrollEnd]);
  return /* @__PURE__ */ jsx(Presence, { present: forceMount || state !== "hidden", children: /* @__PURE__ */ jsx(
    ScrollAreaScrollbarVisible,
    {
      "data-state": state === "hidden" ? "hidden" : "visible",
      ...scrollbarProps,
      ref: forwardedRef,
      onPointerEnter: composeEventHandlers(props.onPointerEnter, () => send("POINTER_ENTER")),
      onPointerLeave: composeEventHandlers(props.onPointerLeave, () => send("POINTER_LEAVE"))
    }
  ) });
});
var ScrollAreaScrollbarAuto = React.forwardRef((props, forwardedRef) => {
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const { forceMount, ...scrollbarProps } = props;
  const [visible, setVisible] = React.useState(false);
  const isHorizontal = props.orientation === "horizontal";
  const handleResize = useDebounceCallback(() => {
    if (context.viewport) {
      const isOverflowX = context.viewport.offsetWidth < context.viewport.scrollWidth;
      const isOverflowY = context.viewport.offsetHeight < context.viewport.scrollHeight;
      setVisible(isHorizontal ? isOverflowX : isOverflowY);
    }
  }, 10);
  useResizeObserver(context.viewport, handleResize);
  useResizeObserver(context.content, handleResize);
  return /* @__PURE__ */ jsx(Presence, { present: forceMount || visible, children: /* @__PURE__ */ jsx(
    ScrollAreaScrollbarVisible,
    {
      "data-state": visible ? "visible" : "hidden",
      ...scrollbarProps,
      ref: forwardedRef
    }
  ) });
});
var ScrollAreaScrollbarVisible = React.forwardRef((props, forwardedRef) => {
  const { orientation = "vertical", ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const thumbRef = React.useRef(null);
  const pointerOffsetRef = React.useRef(0);
  const [sizes, setSizes] = React.useState({
    content: 0,
    viewport: 0,
    scrollbar: { size: 0, paddingStart: 0, paddingEnd: 0 }
  });
  const thumbRatio = getThumbRatio(sizes.viewport, sizes.content);
  const commonProps = {
    ...scrollbarProps,
    sizes,
    onSizesChange: setSizes,
    hasThumb: Boolean(thumbRatio > 0 && thumbRatio < 1),
    onThumbChange: (thumb) => thumbRef.current = thumb,
    onThumbPointerUp: () => pointerOffsetRef.current = 0,
    onThumbPointerDown: (pointerPos) => pointerOffsetRef.current = pointerPos
  };
  function getScrollPosition(pointerPos, dir) {
    return getScrollPositionFromPointer(pointerPos, pointerOffsetRef.current, sizes, dir);
  }
  if (orientation === "horizontal") {
    return /* @__PURE__ */ jsx(
      ScrollAreaScrollbarX,
      {
        ...commonProps,
        ref: forwardedRef,
        onThumbPositionChange: () => {
          if (context.viewport && thumbRef.current) {
            const scrollPos = context.viewport.scrollLeft;
            const offset = getThumbOffsetFromScroll(scrollPos, sizes, context.dir);
            thumbRef.current.style.transform = `translate3d(${offset}px, 0, 0)`;
          }
        },
        onWheelScroll: (scrollPos) => {
          if (context.viewport) context.viewport.scrollLeft = scrollPos;
        },
        onDragScroll: (pointerPos) => {
          if (context.viewport) {
            context.viewport.scrollLeft = getScrollPosition(pointerPos, context.dir);
          }
        }
      }
    );
  }
  if (orientation === "vertical") {
    return /* @__PURE__ */ jsx(
      ScrollAreaScrollbarY,
      {
        ...commonProps,
        ref: forwardedRef,
        onThumbPositionChange: () => {
          if (context.viewport && thumbRef.current) {
            const scrollPos = context.viewport.scrollTop;
            const offset = getThumbOffsetFromScroll(scrollPos, sizes);
            thumbRef.current.style.transform = `translate3d(0, ${offset}px, 0)`;
          }
        },
        onWheelScroll: (scrollPos) => {
          if (context.viewport) context.viewport.scrollTop = scrollPos;
        },
        onDragScroll: (pointerPos) => {
          if (context.viewport) context.viewport.scrollTop = getScrollPosition(pointerPos);
        }
      }
    );
  }
  return null;
});
var ScrollAreaScrollbarX = React.forwardRef((props, forwardedRef) => {
  const { sizes, onSizesChange, ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const [computedStyle, setComputedStyle] = React.useState();
  const ref = React.useRef(null);
  const composeRefs = useComposedRefs(forwardedRef, ref, context.onScrollbarXChange);
  React.useEffect(() => {
    if (ref.current) setComputedStyle(getComputedStyle(ref.current));
  }, [ref]);
  return /* @__PURE__ */ jsx(
    ScrollAreaScrollbarImpl,
    {
      "data-orientation": "horizontal",
      ...scrollbarProps,
      ref: composeRefs,
      sizes,
      style: {
        bottom: 0,
        left: context.dir === "rtl" ? "var(--radix-scroll-area-corner-width)" : 0,
        right: context.dir === "ltr" ? "var(--radix-scroll-area-corner-width)" : 0,
        ["--radix-scroll-area-thumb-width"]: getThumbSize(sizes) + "px",
        ...props.style
      },
      onThumbPointerDown: (pointerPos) => props.onThumbPointerDown(pointerPos.x),
      onDragScroll: (pointerPos) => props.onDragScroll(pointerPos.x),
      onWheelScroll: (event, maxScrollPos) => {
        if (context.viewport) {
          const scrollPos = context.viewport.scrollLeft + event.deltaX;
          props.onWheelScroll(scrollPos);
          if (isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos)) {
            event.preventDefault();
          }
        }
      },
      onResize: () => {
        if (ref.current && context.viewport && computedStyle) {
          onSizesChange({
            content: context.viewport.scrollWidth,
            viewport: context.viewport.offsetWidth,
            scrollbar: {
              size: ref.current.clientWidth,
              paddingStart: toInt(computedStyle.paddingLeft),
              paddingEnd: toInt(computedStyle.paddingRight)
            }
          });
        }
      }
    }
  );
});
var ScrollAreaScrollbarY = React.forwardRef((props, forwardedRef) => {
  const { sizes, onSizesChange, ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const [computedStyle, setComputedStyle] = React.useState();
  const ref = React.useRef(null);
  const composeRefs = useComposedRefs(forwardedRef, ref, context.onScrollbarYChange);
  React.useEffect(() => {
    if (ref.current) setComputedStyle(getComputedStyle(ref.current));
  }, [ref]);
  return /* @__PURE__ */ jsx(
    ScrollAreaScrollbarImpl,
    {
      "data-orientation": "vertical",
      ...scrollbarProps,
      ref: composeRefs,
      sizes,
      style: {
        top: 0,
        right: context.dir === "ltr" ? 0 : void 0,
        left: context.dir === "rtl" ? 0 : void 0,
        bottom: "var(--radix-scroll-area-corner-height)",
        ["--radix-scroll-area-thumb-height"]: getThumbSize(sizes) + "px",
        ...props.style
      },
      onThumbPointerDown: (pointerPos) => props.onThumbPointerDown(pointerPos.y),
      onDragScroll: (pointerPos) => props.onDragScroll(pointerPos.y),
      onWheelScroll: (event, maxScrollPos) => {
        if (context.viewport) {
          const scrollPos = context.viewport.scrollTop + event.deltaY;
          props.onWheelScroll(scrollPos);
          if (isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos)) {
            event.preventDefault();
          }
        }
      },
      onResize: () => {
        if (ref.current && context.viewport && computedStyle) {
          onSizesChange({
            content: context.viewport.scrollHeight,
            viewport: context.viewport.offsetHeight,
            scrollbar: {
              size: ref.current.clientHeight,
              paddingStart: toInt(computedStyle.paddingTop),
              paddingEnd: toInt(computedStyle.paddingBottom)
            }
          });
        }
      }
    }
  );
});
var [ScrollbarProvider, useScrollbarContext] = createScrollAreaContext(SCROLLBAR_NAME);
var ScrollAreaScrollbarImpl = React.forwardRef((props, forwardedRef) => {
  const {
    __scopeScrollArea,
    sizes,
    hasThumb,
    onThumbChange,
    onThumbPointerUp,
    onThumbPointerDown,
    onThumbPositionChange,
    onDragScroll,
    onWheelScroll,
    onResize,
    ...scrollbarProps
  } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, __scopeScrollArea);
  const [scrollbar, setScrollbar] = React.useState(null);
  const composeRefs = useComposedRefs(forwardedRef, (node) => setScrollbar(node));
  const rectRef = React.useRef(null);
  const prevWebkitUserSelectRef = React.useRef("");
  const viewport = context.viewport;
  const maxScrollPos = sizes.content - sizes.viewport;
  const handleWheelScroll = useCallbackRef(onWheelScroll);
  const handleThumbPositionChange = useCallbackRef(onThumbPositionChange);
  const handleResize = useDebounceCallback(onResize, 10);
  function handleDragScroll(event) {
    if (rectRef.current) {
      const x = event.clientX - rectRef.current.left;
      const y = event.clientY - rectRef.current.top;
      onDragScroll({ x, y });
    }
  }
  React.useEffect(() => {
    const handleWheel = (event) => {
      const element = event.target;
      const isScrollbarWheel = scrollbar?.contains(element);
      if (isScrollbarWheel) handleWheelScroll(event, maxScrollPos);
    };
    document.addEventListener("wheel", handleWheel, { passive: false });
    return () => document.removeEventListener("wheel", handleWheel, { passive: false });
  }, [viewport, scrollbar, maxScrollPos, handleWheelScroll]);
  React.useEffect(handleThumbPositionChange, [sizes, handleThumbPositionChange]);
  useResizeObserver(scrollbar, handleResize);
  useResizeObserver(context.content, handleResize);
  return /* @__PURE__ */ jsx(
    ScrollbarProvider,
    {
      scope: __scopeScrollArea,
      scrollbar,
      hasThumb,
      onThumbChange: useCallbackRef(onThumbChange),
      onThumbPointerUp: useCallbackRef(onThumbPointerUp),
      onThumbPositionChange: handleThumbPositionChange,
      onThumbPointerDown: useCallbackRef(onThumbPointerDown),
      children: /* @__PURE__ */ jsx(
        Primitive.div,
        {
          ...scrollbarProps,
          ref: composeRefs,
          style: { position: "absolute", ...scrollbarProps.style },
          onPointerDown: composeEventHandlers(props.onPointerDown, (event) => {
            const mainPointer = 0;
            if (event.button === mainPointer) {
              const element = event.target;
              element.setPointerCapture(event.pointerId);
              rectRef.current = scrollbar.getBoundingClientRect();
              prevWebkitUserSelectRef.current = document.body.style.webkitUserSelect;
              document.body.style.webkitUserSelect = "none";
              if (context.viewport) context.viewport.style.scrollBehavior = "auto";
              handleDragScroll(event);
            }
          }),
          onPointerMove: composeEventHandlers(props.onPointerMove, handleDragScroll),
          onPointerUp: composeEventHandlers(props.onPointerUp, (event) => {
            const element = event.target;
            if (element.hasPointerCapture(event.pointerId)) {
              element.releasePointerCapture(event.pointerId);
            }
            document.body.style.webkitUserSelect = prevWebkitUserSelectRef.current;
            if (context.viewport) context.viewport.style.scrollBehavior = "";
            rectRef.current = null;
          })
        }
      )
    }
  );
});
var THUMB_NAME = "ScrollAreaThumb";
var ScrollAreaThumb = React.forwardRef(
  (props, forwardedRef) => {
    const { forceMount, ...thumbProps } = props;
    const scrollbarContext = useScrollbarContext(THUMB_NAME, props.__scopeScrollArea);
    return /* @__PURE__ */ jsx(Presence, { present: forceMount || scrollbarContext.hasThumb, children: /* @__PURE__ */ jsx(ScrollAreaThumbImpl, { ref: forwardedRef, ...thumbProps }) });
  }
);
var ScrollAreaThumbImpl = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeScrollArea, style, ...thumbProps } = props;
    const scrollAreaContext = useScrollAreaContext(THUMB_NAME, __scopeScrollArea);
    const scrollbarContext = useScrollbarContext(THUMB_NAME, __scopeScrollArea);
    const { onThumbPositionChange } = scrollbarContext;
    const composedRef = useComposedRefs(
      forwardedRef,
      (node) => scrollbarContext.onThumbChange(node)
    );
    const removeUnlinkedScrollListenerRef = React.useRef(void 0);
    const debounceScrollEnd = useDebounceCallback(() => {
      if (removeUnlinkedScrollListenerRef.current) {
        removeUnlinkedScrollListenerRef.current();
        removeUnlinkedScrollListenerRef.current = void 0;
      }
    }, 100);
    React.useEffect(() => {
      const viewport = scrollAreaContext.viewport;
      if (viewport) {
        const handleScroll = () => {
          debounceScrollEnd();
          if (!removeUnlinkedScrollListenerRef.current) {
            const listener = addUnlinkedScrollListener(viewport, onThumbPositionChange);
            removeUnlinkedScrollListenerRef.current = listener;
            onThumbPositionChange();
          }
        };
        onThumbPositionChange();
        viewport.addEventListener("scroll", handleScroll);
        return () => viewport.removeEventListener("scroll", handleScroll);
      }
    }, [scrollAreaContext.viewport, debounceScrollEnd, onThumbPositionChange]);
    return /* @__PURE__ */ jsx(
      Primitive.div,
      {
        "data-state": scrollbarContext.hasThumb ? "visible" : "hidden",
        ...thumbProps,
        ref: composedRef,
        style: {
          width: "var(--radix-scroll-area-thumb-width)",
          height: "var(--radix-scroll-area-thumb-height)",
          ...style
        },
        onPointerDownCapture: composeEventHandlers(props.onPointerDownCapture, (event) => {
          const thumb = event.target;
          const thumbRect = thumb.getBoundingClientRect();
          const x = event.clientX - thumbRect.left;
          const y = event.clientY - thumbRect.top;
          scrollbarContext.onThumbPointerDown({ x, y });
        }),
        onPointerUp: composeEventHandlers(props.onPointerUp, scrollbarContext.onThumbPointerUp)
      }
    );
  }
);
ScrollAreaThumb.displayName = THUMB_NAME;
var CORNER_NAME = "ScrollAreaCorner";
var ScrollAreaCorner = React.forwardRef(
  (props, forwardedRef) => {
    const context = useScrollAreaContext(CORNER_NAME, props.__scopeScrollArea);
    const hasBothScrollbarsVisible = Boolean(context.scrollbarX && context.scrollbarY);
    const hasCorner = context.type !== "scroll" && hasBothScrollbarsVisible;
    return hasCorner ? /* @__PURE__ */ jsx(ScrollAreaCornerImpl, { ...props, ref: forwardedRef }) : null;
  }
);
ScrollAreaCorner.displayName = CORNER_NAME;
var ScrollAreaCornerImpl = React.forwardRef((props, forwardedRef) => {
  const { __scopeScrollArea, ...cornerProps } = props;
  const context = useScrollAreaContext(CORNER_NAME, __scopeScrollArea);
  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);
  const hasSize = Boolean(width && height);
  useResizeObserver(context.scrollbarX, () => {
    const height2 = context.scrollbarX?.offsetHeight || 0;
    context.onCornerHeightChange(height2);
    setHeight(height2);
  });
  useResizeObserver(context.scrollbarY, () => {
    const width2 = context.scrollbarY?.offsetWidth || 0;
    context.onCornerWidthChange(width2);
    setWidth(width2);
  });
  return hasSize ? /* @__PURE__ */ jsx(
    Primitive.div,
    {
      ...cornerProps,
      ref: forwardedRef,
      style: {
        width,
        height,
        position: "absolute",
        right: context.dir === "ltr" ? 0 : void 0,
        left: context.dir === "rtl" ? 0 : void 0,
        bottom: 0,
        ...props.style
      }
    }
  ) : null;
});
function toInt(value) {
  return value ? parseInt(value, 10) : 0;
}
function getThumbRatio(viewportSize, contentSize) {
  const ratio = viewportSize / contentSize;
  return isNaN(ratio) ? 0 : ratio;
}
function getThumbSize(sizes) {
  const ratio = getThumbRatio(sizes.viewport, sizes.content);
  const scrollbarPadding = sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd;
  const thumbSize = (sizes.scrollbar.size - scrollbarPadding) * ratio;
  return Math.max(thumbSize, 18);
}
function getScrollPositionFromPointer(pointerPos, pointerOffset, sizes, dir = "ltr") {
  const thumbSizePx = getThumbSize(sizes);
  const thumbCenter = thumbSizePx / 2;
  const offset = pointerOffset || thumbCenter;
  const thumbOffsetFromEnd = thumbSizePx - offset;
  const minPointerPos = sizes.scrollbar.paddingStart + offset;
  const maxPointerPos = sizes.scrollbar.size - sizes.scrollbar.paddingEnd - thumbOffsetFromEnd;
  const maxScrollPos = sizes.content - sizes.viewport;
  const scrollRange = dir === "ltr" ? [0, maxScrollPos] : [maxScrollPos * -1, 0];
  const interpolate = linearScale([minPointerPos, maxPointerPos], scrollRange);
  return interpolate(pointerPos);
}
function getThumbOffsetFromScroll(scrollPos, sizes, dir = "ltr") {
  const thumbSizePx = getThumbSize(sizes);
  const scrollbarPadding = sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd;
  const scrollbar = sizes.scrollbar.size - scrollbarPadding;
  const maxScrollPos = sizes.content - sizes.viewport;
  const maxThumbPos = scrollbar - thumbSizePx;
  const scrollClampRange = dir === "ltr" ? [0, maxScrollPos] : [maxScrollPos * -1, 0];
  const scrollWithoutMomentum = clamp(scrollPos, scrollClampRange);
  const interpolate = linearScale([0, maxScrollPos], [0, maxThumbPos]);
  return interpolate(scrollWithoutMomentum);
}
function linearScale(input, output) {
  return (value) => {
    if (input[0] === input[1] || output[0] === output[1]) return output[0];
    const ratio = (output[1] - output[0]) / (input[1] - input[0]);
    return output[0] + ratio * (value - input[0]);
  };
}
function isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos) {
  return scrollPos > 0 && scrollPos < maxScrollPos;
}
var addUnlinkedScrollListener = (node, handler = () => {
}) => {
  let prevPosition = { left: node.scrollLeft, top: node.scrollTop };
  let rAF = 0;
  (function loop() {
    const position = { left: node.scrollLeft, top: node.scrollTop };
    const isHorizontalScroll = prevPosition.left !== position.left;
    const isVerticalScroll = prevPosition.top !== position.top;
    if (isHorizontalScroll || isVerticalScroll) handler();
    prevPosition = position;
    rAF = window.requestAnimationFrame(loop);
  })();
  return () => window.cancelAnimationFrame(rAF);
};
function useDebounceCallback(callback, delay) {
  const handleCallback = useCallbackRef(callback);
  const debounceTimerRef = React.useRef(0);
  React.useEffect(() => () => window.clearTimeout(debounceTimerRef.current), []);
  return React.useCallback(() => {
    window.clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = window.setTimeout(handleCallback, delay);
  }, [handleCallback, delay]);
}
function useResizeObserver(element, onResize) {
  const handleResize = useCallbackRef(onResize);
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
var Root = ScrollArea$1;
var Viewport = ScrollAreaViewport;
var Scrollbar = ScrollAreaScrollbar;
var Corner = ScrollAreaCorner;
const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => jsxs(Root, { ref, type: "scroll", className: twMerge("overflow-hidden", className), ...props, children: [children, jsx(Corner, {}), jsx(ScrollBar, { orientation: "vertical" })] }));
ScrollArea.displayName = Root.displayName;
const ScrollViewport = React.forwardRef(({ className, children, ...props }, ref) => jsx(Viewport, { ref, className: twMerge("size-full rounded-[inherit]", className), ...props, children }));
ScrollViewport.displayName = Viewport.displayName;
const ScrollBar = React.forwardRef(({ className, orientation = "vertical", ...props }, ref) => jsx(Scrollbar, { ref, orientation, className: twMerge("flex select-none data-[state=hidden]:animate-fd-fade-out", orientation === "vertical" && "h-full w-1.5", orientation === "horizontal" && "h-1.5 flex-col", className), ...props, children: jsx(ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-fd-border" }) }));
ScrollBar.displayName = Scrollbar.displayName;
function useMediaQuery(query, disabled = false) {
  const [isMatch, setMatch] = useState(null);
  useEffect(() => {
    if (disabled) return;
    const mediaQueryList = window.matchMedia(query);
    const handleChange = () => {
      setMatch(mediaQueryList.matches);
    };
    handleChange();
    mediaQueryList.addEventListener("change", handleChange);
    return () => {
      mediaQueryList.removeEventListener("change", handleChange);
    };
  }, [disabled, query]);
  return isMatch;
}
const itemVariants = cva("relative flex flex-row items-center gap-2 rounded-lg p-2 ps-(--sidebar-item-offset) text-start text-fd-muted-foreground [overflow-wrap:anywhere] [&_svg]:size-4 [&_svg]:shrink-0", {
  variants: {
    active: {
      true: "bg-fd-primary/10 text-fd-primary",
      false: "transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none"
    }
  }
});
const Context = createContext(null);
const FolderContext = createContext(null);
function Sidebar({ defaultOpenLevel = 0, prefetch = true, Mobile, Content }) {
  const isMobile = useMediaQuery("(width < 768px)") ?? false;
  const context = useMemo(() => {
    return {
      defaultOpenLevel,
      prefetch,
      level: 1
    };
  }, [defaultOpenLevel, prefetch]);
  return jsx(Context.Provider, { value: context, children: isMobile && Mobile != null ? Mobile : Content });
}
function SidebarContent(props) {
  const { collapsed } = useSidebar();
  const [hover, setHover] = useState(false);
  const timerRef = useRef(0);
  const closeTimeRef = useRef(0);
  useOnChange(collapsed, () => {
    setHover(false);
    closeTimeRef.current = Date.now() + 150;
  });
  return jsx("aside", { id: "nd-sidebar", ...props, "data-collapsed": collapsed, className: twMerge("fixed left-0 rtl:left-auto rtl:right-(--removed-body-scroll-bar-size,0) flex flex-col items-end top-(--fd-sidebar-top) bottom-(--fd-sidebar-margin) z-20 bg-fd-card text-sm border-e transition-[top,opacity,translate,width] duration-200 max-md:hidden *:w-(--fd-sidebar-width)", collapsed && [
    "rounded-xl border translate-x-(--fd-sidebar-offset) rtl:-translate-x-(--fd-sidebar-offset)",
    hover ? "z-50 shadow-lg" : "opacity-0"
  ], props.className), style: {
    ...props.style,
    "--fd-sidebar-offset": hover ? "calc(var(--spacing) * 2)" : "calc(16px - 100%)",
    "--fd-sidebar-margin": collapsed ? "0.5rem" : "0px",
    "--fd-sidebar-top": `calc(var(--fd-banner-height) + var(--fd-nav-height) + var(--fd-sidebar-margin))`,
    width: collapsed ? "var(--fd-sidebar-width)" : "calc(var(--spacing) + var(--fd-sidebar-width) + var(--fd-layout-offset))"
  }, onPointerEnter: (e) => {
    if (!collapsed || e.pointerType === "touch" || closeTimeRef.current > Date.now())
      return;
    window.clearTimeout(timerRef.current);
    setHover(true);
  }, onPointerLeave: (e) => {
    if (!collapsed || e.pointerType === "touch")
      return;
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setHover(false);
      closeTimeRef.current = Date.now() + 150;
    }, Math.min(e.clientX, document.body.clientWidth - e.clientX) > 100 ? 0 : 500);
  }, children: props.children });
}
function SidebarContentMobile({ className, children, ...props }) {
  const { open, setOpen } = useSidebar();
  const state = open ? "open" : "closed";
  return jsxs(Fragment, { children: [jsx(Presence, { present: open, children: jsx("div", { "data-state": state, className: "fixed z-40 inset-0 backdrop-blur-xs data-[state=open]:animate-fd-fade-in data-[state=closed]:animate-fd-fade-out", onClick: () => setOpen(false) }) }), jsx(Presence, { present: open, children: ({ present }) => jsx("aside", { id: "nd-sidebar-mobile", ...props, "data-state": state, className: twMerge("fixed text-[15px] flex flex-col shadow-lg border-s end-0 inset-y-0 w-[85%] max-w-[380px] z-40 bg-fd-background data-[state=open]:animate-fd-sidebar-in data-[state=closed]:animate-fd-sidebar-out", !present && "invisible", className), children }) })] });
}
function SidebarHeader(props) {
  return jsx("div", { ...props, className: twMerge("flex flex-col gap-3 p-4 pb-2", props.className), children: props.children });
}
function SidebarFooter(props) {
  return jsx("div", { ...props, className: twMerge("flex flex-col border-t p-4 pt-2", props.className), children: props.children });
}
function SidebarViewport(props) {
  return jsx(ScrollArea, { ...props, className: twMerge("h-full", props.className), children: jsx(ScrollViewport, { className: "p-4 overscroll-contain", style: {
    "--sidebar-item-offset": "calc(var(--spacing) * 2)",
    maskImage: "linear-gradient(to bottom, transparent, white 12px, white calc(100% - 12px), transparent)"
  }, children: props.children }) });
}
function SidebarSeparator(props) {
  return jsx("p", { ...props, className: twMerge("inline-flex items-center gap-2 mb-1.5 px-2 ps-(--sidebar-item-offset) empty:mb-0 [&_svg]:size-4 [&_svg]:shrink-0", props.className), children: props.children });
}
function SidebarItem({ icon, ...props }) {
  const pathname = usePathname();
  const active = props.href !== void 0 && isActive(props.href, pathname, false);
  const { prefetch } = useInternalContext();
  return jsxs(Link2, { ...props, "data-active": active, className: twMerge(itemVariants({ active }), props.className), prefetch, children: [icon ?? (props.external ? jsx(ExternalLink, {}) : null), props.children] });
}
function SidebarFolder({ defaultOpen = false, ...props }) {
  const [open, setOpen] = useState(defaultOpen);
  useOnChange(defaultOpen, (v) => {
    if (v)
      setOpen(v);
  });
  return jsx(Collapsible, { open, onOpenChange: setOpen, ...props, children: jsx(FolderContext.Provider, { value: useMemo(() => ({ open, setOpen }), [open]), children: props.children }) });
}
function SidebarFolderTrigger({ className, ...props }) {
  const { open } = useFolderContext();
  return jsxs(CollapsibleTrigger, { className: twMerge(itemVariants({ active: false }), "w-full", className), ...props, children: [props.children, jsx(ChevronDown, { "data-icon": true, className: twMerge("ms-auto transition-transform", !open && "-rotate-90") })] });
}
function SidebarFolderLink(props) {
  const { open, setOpen } = useFolderContext();
  const { prefetch } = useInternalContext();
  const pathname = usePathname();
  const active = props.href !== void 0 && isActive(props.href, pathname, false);
  return jsxs(Link2, { ...props, "data-active": active, className: twMerge(itemVariants({ active }), "w-full", props.className), onClick: (e) => {
    if (e.target instanceof Element && e.target.matches("[data-icon], [data-icon] *")) {
      setOpen(!open);
      e.preventDefault();
    } else {
      setOpen(active ? !open : true);
    }
  }, prefetch, children: [props.children, jsx(ChevronDown, { "data-icon": true, className: twMerge("ms-auto transition-transform", !open && "-rotate-90") })] });
}
function SidebarFolderContent(props) {
  const { level, ...ctx } = useInternalContext();
  return jsx(CollapsibleContent, { ...props, className: twMerge("relative", level === 1 && [
    "before:content-[''] before:absolute before:w-px before:inset-y-1 before:bg-fd-border before:start-2.5",
    "**:data-[active=true]:before:content-[''] **:data-[active=true]:before:bg-fd-primary **:data-[active=true]:before:absolute **:data-[active=true]:before:w-px **:data-[active=true]:before:inset-y-2.5 **:data-[active=true]:before:start-2.5"
  ], props.className), style: {
    "--sidebar-item-offset": `calc(var(--spacing) * ${(level + 1) * 3})`,
    ...props.style
  }, children: jsx(Context.Provider, { value: useMemo(() => ({
    ...ctx,
    level: level + 1
  }), [ctx, level]), children: props.children }) });
}
function SidebarTrigger({ children, ...props }) {
  const { setOpen } = useSidebar();
  return jsx("button", { ...props, "aria-label": "Open Sidebar", onClick: () => setOpen((prev) => !prev), children });
}
function SidebarCollapseTrigger(props) {
  const { collapsed, setCollapsed } = useSidebar();
  return jsx("button", { type: "button", "aria-label": "Collapse Sidebar", "data-collapsed": collapsed, ...props, onClick: () => {
    setCollapsed((prev) => !prev);
  }, children: props.children });
}
function useFolderContext() {
  const ctx = useContext(FolderContext);
  if (!ctx)
    throw new Error("Missing sidebar folder");
  return ctx;
}
function useInternalContext() {
  const ctx = useContext(Context);
  if (!ctx)
    throw new Error("<Sidebar /> component required.");
  return ctx;
}
function SidebarPageTree(props) {
  const { root } = useTreeContext();
  return useMemo(() => {
    const { Separator, Item, Folder } = props.components ?? {};
    function renderSidebarList(items, level) {
      return items.map((item, i) => {
        if (item.type === "separator") {
          if (Separator)
            return jsx(Separator, { item }, i);
          return jsxs(SidebarSeparator, { className: twMerge(i !== 0 && "mt-6"), children: [item.icon, item.name] }, i);
        }
        if (item.type === "folder") {
          const children = renderSidebarList(item.children, level + 1);
          if (Folder)
            return jsx(Folder, { item, level, children }, i);
          return jsx(PageTreeFolder, { item, children }, i);
        }
        if (Item)
          return jsx(Item, { item }, item.url);
        return jsx(SidebarItem, { href: item.url, external: item.external, icon: item.icon, children: item.name }, item.url);
      });
    }
    return jsx(Fragment$1, { children: renderSidebarList(root.children, 1) }, root.$id);
  }, [props.components, root]);
}
function PageTreeFolder({ item, ...props }) {
  const { defaultOpenLevel, level } = useInternalContext();
  const path = useTreePath();
  return jsxs(SidebarFolder, { defaultOpen: (item.defaultOpen ?? defaultOpenLevel >= level) || path.includes(item), children: [item.index ? jsxs(SidebarFolderLink, { href: item.index.url, external: item.index.external, ...props, children: [item.icon, item.name] }) : jsxs(SidebarFolderTrigger, { ...props, children: [item.icon, item.name] }), jsx(SidebarFolderContent, { children: props.children })] });
}
function RootToggle({ options, placeholder, ...props }) {
  const [open, setOpen] = useState(false);
  const { closeOnRedirect } = useSidebar();
  const pathname = usePathname();
  const selected = useMemo(() => {
    return options.findLast((item2) => isTabActive(item2, pathname));
  }, [options, pathname]);
  const onClick = () => {
    closeOnRedirect.current = false;
    setOpen(false);
  };
  const item = selected ? jsxs(Fragment, { children: [jsx("div", { className: "size-9 shrink-0 md:size-5", children: selected.icon }), jsxs("div", { children: [jsx("p", { className: "text-sm font-medium", children: selected.title }), jsx("p", { className: "text-[13px] text-fd-muted-foreground empty:hidden md:hidden", children: selected.description })] })] }) : placeholder;
  return jsxs(Popover, { open, onOpenChange: setOpen, children: [item && jsxs(PopoverTrigger, { ...props, className: twMerge("flex items-center gap-2 rounded-lg p-2 border bg-fd-secondary/50 text-start text-fd-secondary-foreground transition-colors hover:bg-fd-accent data-[state=open]:bg-fd-accent data-[state=open]:text-fd-accent-foreground", props.className), children: [item, jsx(ChevronsUpDown, { className: "shrink-0 ms-auto size-4 text-fd-muted-foreground" })] }), jsx(PopoverContent, { className: "flex flex-col gap-1 w-(--radix-popover-trigger-width) overflow-hidden p-1", children: options.map((item2) => {
    const isActive2 = selected && item2.url === selected.url;
    if (!isActive2 && item2.unlisted)
      return;
    return jsxs(Link2, { href: item2.url, onClick, ...item2.props, className: twMerge("flex items-center gap-2 rounded-lg p-1.5 hover:bg-fd-accent hover:text-fd-accent-foreground", item2.props?.className), children: [jsx("div", { className: "shrink-0 size-9 md:mt-1 md:mb-auto md:size-5", children: item2.icon }), jsxs("div", { children: [jsx("p", { className: "text-sm font-medium", children: item2.title }), jsx("p", { className: "text-[13px] text-fd-muted-foreground empty:hidden", children: item2.description })] }), jsx(Check, { className: twMerge("shrink-0 ms-auto size-3.5 text-fd-primary", !isActive2 && "invisible") })] }, item2.url);
  }) })] });
}
function Navbar(props) {
  const { isTransparent } = useNav();
  return jsx("header", { id: "nd-subnav", ...props, className: twMerge("fixed top-(--fd-banner-height) left-0 right-(--removed-body-scroll-bar-size,0) z-30 flex items-center ps-4 pe-2.5 border-b transition-colors backdrop-blur-sm", !isTransparent && "bg-fd-background/80", props.className), children: props.children });
}
function LayoutBody(props) {
  const { collapsed } = useSidebar();
  return jsx("main", { id: "nd-docs-layout", ...props, className: twMerge("flex flex-1 flex-col pt-(--fd-nav-height) transition-[padding] fd-default-layout", !collapsed && "mx-(--fd-layout-offset)", props.className), style: {
    ...props.style,
    paddingInlineStart: collapsed ? "min(calc(100vw - var(--fd-page-width)), var(--fd-sidebar-width))" : "var(--fd-sidebar-width)"
  }, children: props.children });
}
function CollapsibleControl() {
  const { collapsed } = useSidebar();
  return jsxs("div", { className: twMerge("fixed flex shadow-lg transition-opacity rounded-xl p-0.5 border bg-fd-muted text-fd-muted-foreground z-10 max-md:hidden xl:start-4 max-xl:end-4", !collapsed && "pointer-events-none opacity-0"), style: {
    top: "calc(var(--fd-banner-height) + var(--fd-tocnav-height) + var(--spacing) * 4)"
  }, children: [jsx(SidebarCollapseTrigger, { className: twMerge(buttonVariants({
    color: "ghost",
    size: "icon-sm",
    className: "rounded-lg"
  })), children: jsx(Sidebar$1, {}) }), jsx(SearchToggle, { className: "rounded-lg", hideIfDisabled: true })] });
}
function LayoutTabs({ options, ...props }) {
  const pathname = usePathname();
  const selected = useMemo(() => {
    return options.findLast((option) => isTabActive(option, pathname));
  }, [options, pathname]);
  return jsx("div", { ...props, className: twMerge("flex flex-row items-end gap-6 overflow-auto", props.className), children: options.map((option) => jsx(LayoutTab, { selected: selected === option, option }, option.url)) });
}
function LayoutTab({ option: { title, url, unlisted, props }, selected = false }) {
  return jsx(Link2, { href: url, ...props, className: twMerge("inline-flex border-b-2 border-transparent transition-colors items-center pb-1.5 font-medium gap-2 text-fd-muted-foreground text-sm text-nowrap hover:text-fd-accent-foreground", unlisted && !selected && "hidden", selected && "border-fd-primary text-fd-primary", props?.className), children: title });
}
const defaultTransform = (option, node) => {
  if (!node.icon)
    return option;
  return {
    ...option,
    icon: jsx("div", { className: "size-full [&_svg]:size-full max-md:p-1.5 max-md:rounded-md max-md:border max-md:bg-fd-secondary", children: node.icon })
  };
};
function getSidebarTabs(tree, { transform = defaultTransform } = {}) {
  const results = [];
  function scanOptions(node, unlisted) {
    if ("root" in node && node.root) {
      const urls = getFolderUrls(node);
      if (urls.size > 0) {
        const option = {
          url: urls.values().next().value ?? "",
          title: node.name,
          icon: node.icon,
          unlisted,
          description: node.description,
          urls
        };
        const mapped = transform ? transform(option, node) : option;
        if (mapped)
          results.push(mapped);
      }
    }
    for (const child of node.children) {
      if (child.type === "folder")
        scanOptions(child, unlisted);
    }
  }
  scanOptions(tree);
  if (tree.fallback)
    scanOptions(tree.fallback, true);
  return results;
}
function getFolderUrls(folder, output = /* @__PURE__ */ new Set()) {
  if (folder.index)
    output.add(folder.index.url);
  for (const child of folder.children) {
    if (child.type === "page" && !child.external)
      output.add(child.url);
    if (child.type === "folder")
      getFolderUrls(child, output);
  }
  return output;
}
function DocsLayout({ nav: { transparentMode, ...nav } = {}, sidebar: { tabs: sidebarTabs, enabled: sidebarEnabled = true, ...sidebarProps } = {}, searchToggle = {}, themeSwitch = {}, tabMode = "auto", i18n = false, children, ...props }) {
  const tabs = useMemo(() => {
    if (Array.isArray(sidebarTabs)) {
      return sidebarTabs;
    }
    if (typeof sidebarTabs === "object") {
      return getSidebarTabs(props.tree, sidebarTabs);
    }
    if (sidebarTabs !== false) {
      return getSidebarTabs(props.tree);
    }
    return [];
  }, [sidebarTabs, props.tree]);
  const links = getLinks(props.links ?? [], props.githubUrl);
  const sidebarVariables = twMerge("md:[--fd-sidebar-width:268px] lg:[--fd-sidebar-width:286px]");
  function sidebar() {
    const { footer, banner, collapsible = true, component, components, defaultOpenLevel, prefetch, ...rest } = sidebarProps;
    if (component)
      return component;
    const iconLinks = links.filter((item) => item.type === "icon");
    const viewport = jsxs(SidebarViewport, { children: [links.filter((v) => v.type !== "icon").map((item, i, list) => jsx(SidebarLinkItem, { item, className: twMerge(i === list.length - 1 && "mb-4") }, i)), jsx(SidebarPageTree, { components })] });
    const mobile = jsxs(SidebarContentMobile, { ...rest, children: [jsxs(SidebarHeader, { children: [jsxs("div", { className: "flex text-fd-muted-foreground items-center gap-1.5", children: [jsx("div", { className: "flex flex-1", children: iconLinks.map((item, i) => jsx(BaseLinkItem, { item, className: twMerge(buttonVariants({
      size: "icon-sm",
      color: "ghost",
      className: "p-2"
    })), "aria-label": item.label, children: item.icon }, i)) }), i18n ? jsxs(LanguageToggle, { children: [jsx(Languages, { className: "size-4.5" }), jsx(LanguageToggleText, {})] }) : null, themeSwitch.enabled !== false && (themeSwitch.component ?? jsx(ThemeToggle, { className: "p-0", mode: themeSwitch.mode })), jsx(SidebarTrigger, { className: twMerge(buttonVariants({
      color: "ghost",
      size: "icon-sm",
      className: "p-2"
    })), children: jsx(Sidebar$1, {}) })] }), tabs.length > 0 && jsx(RootToggle, { options: tabs }), banner] }), viewport, jsx(SidebarFooter, { className: "empty:hidden", children: footer })] });
    const content = jsxs(SidebarContent, { ...rest, children: [jsxs(SidebarHeader, { children: [jsxs("div", { className: "flex", children: [jsx(Link2, { href: nav.url ?? "/", className: "inline-flex text-[15px] items-center gap-2.5 font-medium me-auto", children: nav.title }), nav.children, collapsible && jsx(SidebarCollapseTrigger, { className: twMerge(buttonVariants({
      color: "ghost",
      size: "icon-sm",
      className: "mb-auto text-fd-muted-foreground"
    })), children: jsx(Sidebar$1, {}) })] }), searchToggle.enabled !== false && (searchToggle.components?.lg ?? jsx(LargeSearchToggle, { hideIfDisabled: true })), tabs.length > 0 && tabMode === "auto" && jsx(RootToggle, { options: tabs }), banner] }), viewport, (i18n || iconLinks.length > 0 || themeSwitch?.enabled !== false || footer) && jsxs(SidebarFooter, { children: [jsxs("div", { className: "flex text-fd-muted-foreground items-center empty:hidden", children: [i18n && jsx(LanguageToggle, { children: jsx(Languages, { className: "size-4.5" }) }), iconLinks.map((item, i) => jsx(BaseLinkItem, { item, className: twMerge(buttonVariants({ size: "icon-sm", color: "ghost" })), "aria-label": item.label, children: item.icon }, i)), themeSwitch.enabled !== false && (themeSwitch.component ?? jsx(ThemeToggle, { className: "ms-auto p-0", mode: themeSwitch.mode }))] }), footer] })] });
    return jsx(Sidebar, { defaultOpenLevel, prefetch, Mobile: mobile, Content: jsxs(Fragment, { children: [collapsible && jsx(CollapsibleControl, {}), content] }) });
  }
  return jsx(TreeContextProvider, { tree: props.tree, children: jsxs(NavProvider, { transparentMode, children: [nav.enabled !== false && (nav.component ?? jsxs(Navbar, { className: "h-(--fd-nav-height) on-root:[--fd-nav-height:56px] md:on-root:[--fd-nav-height:0px] md:hidden", children: [jsx(Link2, { href: nav.url ?? "/", className: "inline-flex items-center gap-2.5 font-semibold", children: nav.title }), jsx("div", { className: "flex-1", children: nav.children }), searchToggle.enabled !== false && (searchToggle.components?.sm ?? jsx(SearchToggle, { className: "p-2", hideIfDisabled: true })), sidebarEnabled && jsx(SidebarTrigger, { className: twMerge(buttonVariants({
    color: "ghost",
    size: "icon-sm",
    className: "p-2"
  })), children: jsx(Sidebar$1, {}) })] })), jsxs(LayoutBody, { ...props.containerProps, className: twMerge("md:[&_#nd-page_article]:pt-12 xl:[--fd-toc-width:286px] xl:[&_#nd-page_article]:px-8", sidebarEnabled && sidebarVariables, props.containerProps?.className), children: [sidebarEnabled && sidebar(), tabMode === "top" && tabs.length > 0 && jsx(LayoutTabs, { options: tabs, className: "sticky top-[calc(var(--fd-nav-height)+var(--fd-tocnav-height))] z-10 bg-fd-background border-b px-6 pt-3 xl:px-8 max-md:hidden" }), children] })] }) });
}
function SidebarLinkItem({ item, ...props }) {
  if (item.type === "menu")
    return jsxs(SidebarFolder, { ...props, children: [item.url ? jsxs(SidebarFolderLink, { href: item.url, external: item.external, children: [item.icon, item.text] }) : jsxs(SidebarFolderTrigger, { children: [item.icon, item.text] }), jsx(SidebarFolderContent, { children: item.items.map((child, i) => jsx(SidebarLinkItem, { item: child }, i)) })] });
  if (item.type === "custom")
    return jsx("div", { ...props, children: item.children });
  return jsx(SidebarItem, { href: item.url, icon: item.icon, external: item.external, ...props, children: item.text });
}
export {
  DocsLayout as D
};
