import { useEffect } from "react";

/**
 * Reveal-on-scroll for `.itc-reveal` elements on Dark Command Center pages
 * outside the homepage (which keeps its own private copy). Elements already
 * revealed are skipped, so it is safe to call from pages that render
 * additional content later.
 */
export function useScrollReveal() {
  useEffect(() => {
    const reveals = document.querySelectorAll<HTMLElement>(
      ".itc-reveal:not(.itc-reveal-in)",
    );
    if (!reveals.length) return;

    if (typeof IntersectionObserver === "undefined") {
      reveals.forEach((el) => el.classList.add("itc-reveal-in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("itc-reveal-in");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -60px 0px", threshold: 0.08 },
    );

    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}
