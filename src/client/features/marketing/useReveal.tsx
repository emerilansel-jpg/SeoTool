import * as React from "react";

/**
 * Scroll-reveal: adds `.reveal-visible` when the element enters the viewport.
 * Pairs with the `.reveal` CSS in app.css. Content stays in the DOM for
 * crawlers regardless of visibility state.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = React.useRef<T | null>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("reveal-visible");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

export function Reveal({
  children,
  className,
  delay,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: 1 | 2 | 3 | 4;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal${delay ? ` reveal-delay-${delay}` : ""}${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}
