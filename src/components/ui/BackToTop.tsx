import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/** Scroll depth (px) after which the back-to-top button appears. */
const SHOW_AFTER_PX = 480;

/**
 * Back-to-top floating button (UX). Appears bottom-right after the page has
 * been scrolled past SHOW_AFTER_PX and smooth-scrolls back to the top on
 * click. Enter/exit animation inherits reducedMotion="user" from the
 * app-level MotionConfig; the scroll itself is reduced-motion-safe.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll(): void {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTop(): void {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="back-to-top"
          type="button"
          onClick={scrollToTop}
          data-testid="back-to-top"
          aria-label="Volver arriba"
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-20 right-5 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-podio-600 text-white shadow-lg transition-colors hover:bg-podio-700"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M12 19V5" />
            <path d="m5 12 7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
