import { AnimatePresence, motion } from "motion/react";
import { useCart } from "../../context/CartContext";
import { cartLineKey } from "../../utils/cart";
import { CartLineItem } from "./CartLineItem";
import { CartSummary } from "./CartSummary";

/**
 * Lateral cart drawer (shopping-cart "Cart drawer presentation").
 *
 * - slides in from the right: two keyed motion children (backdrop + panel)
 *   animate in and out through AnimatePresence; reduced-motion users inherit
 *   the opacity-only variant from MotionConfig reducedMotion="user"
 * - closes via the ✕ control or a backdrop click; closing only flips the
 *   reducer's open flag and never clears the cart
 * - full viewport width on mobile, fixed 420px panel on sm+ ("Mobile width")
 * - empty cart shows a Spanish message; CartSummary renders the guarded
 *   (disabled, no-link) checkout control below it
 */
export function CartDrawer() {
  const { lines, isOpen, setOpen, increment, decrement, removeItem } = useCart();
  const close = (): void => setOpen(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="cart-backdrop"
            data-testid="cart-backdrop"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 z-50 bg-ink/40"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="cart-panel"
            data-testid="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Carrito de compras"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed right-0 top-0 z-[60] flex h-full w-full flex-col bg-paper shadow-2xl sm:w-[420px]"
          >
            <header className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
              <h2 className="text-lg font-bold text-ink">Tu carrito</h2>
              <button
                type="button"
                onClick={close}
                aria-label="Cerrar carrito"
                data-testid="cart-close"
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink"
              >
                ✕
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5">
              {lines.length === 0 ? (
                <p data-testid="cart-empty" className="py-10 text-center text-ink/60">
                  Tu carrito está vacío. Agregá productos para empezar.
                </p>
              ) : (
                <ul data-testid="cart-lines" className="divide-y divide-ink/5">
                  {lines.map((line) => (
                    <CartLineItem
                      key={cartLineKey(line)}
                      line={line}
                      onIncrement={() => increment(line.productId, line.size)}
                      onDecrement={() => decrement(line.productId, line.size)}
                      onRemove={() => removeItem(line.productId, line.size)}
                    />
                  ))}
                </ul>
              )}
            </div>

            <CartSummary lines={lines} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
