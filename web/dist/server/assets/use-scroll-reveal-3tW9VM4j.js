import { useEffect } from "react";
function useScrollReveal() {
  useEffect(() => {
    const reveals = document.querySelectorAll(
      ".itc-reveal:not(.itc-reveal-in)"
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
      { rootMargin: "0px 0px -60px 0px", threshold: 0.08 }
    );
    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}
export {
  useScrollReveal as u
};
