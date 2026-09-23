import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "../../context/CartContext";

/** How long the confirmation toast stays up before auto-dismissing. */
const TOAST_DURATION_MS = 1800;

/**
 * Add-to-cart confirmation toast (UX). Adding a product no longer opens the
 * drawer — this small pill confirms the add in place, centered at the top
 * under the sticky header, and auto-dismisses after TOAST_DURATION_MS. Its
 * enter/exit animation inherits reducedMotion="user" from the app-level
 * MotionConfig.
 */
export function AddToCartToast() {
  const { lastAdded, dismissAdded } = useCart();

  useEffect(() => {
    if (lastAdded === null) {
      return undefined;
    }
    const timer = window.setTimeout(dismissAdded, TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [lastAdded, dismissAdded]);

  return (
    <AnimatePresence>
      {lastAdded !== null && (
        <motion.div
          key="add-toast"
          data-testid="add-toast"
          role="status"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed left-1/2 top-20 z-[70] -translate-x-1/2 rounded-full bg-ink/90 px-4 py-2 text-sm text-paper shadow-lg"
        >
          Agregado al carrito
        </motion.div>
      )}
    </AnimatePresence>
  );
}
