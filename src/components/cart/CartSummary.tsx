import type { CartLine } from "../../types/product";
import { cartTotal } from "../../utils/cart";
import { formatARS } from "../../utils/format";
import { buildCheckoutMessage, buildWhatsAppUrl } from "../../utils/whatsapp";

interface CartSummaryProps {
  /** Cart lines; the summary derives total + message from them (never stored). */
  lines: CartLine[];
}

/**
 * Checkout summary card (whatsapp-checkout spec). Renders the running total
 * (es-AR, via the single shared formatter) and the WhatsApp deep link built
 * from the exact checkout message.
 *
 * Empty-cart guard: with no lines the control is a disabled button with no
 * href — no link can ever open — and the total/preview surface is hidden.
 */
export function CartSummary({ lines }: CartSummaryProps) {
  const isEmpty = lines.length === 0;
  const check = buildCheckoutMessage(lines);

  return (
    <section
      data-testid="cart-summary"
      aria-label="Resumen del pedido"
      className="border-t border-ink/10 bg-paper p-4 sm:p-5"
    >
      {isEmpty ? (
        <button
          type="button"
          disabled
          data-testid="checkout-control"
          className="w-full cursor-not-allowed rounded-xl bg-podio-200 px-5 py-3 text-sm font-semibold text-ink/40"
        >
          Completar compra por WhatsApp
        </button>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-ink/70">Total</span>
            <span data-testid="cart-total" className="text-xl font-bold text-ink">
              {formatARS(cartTotal(lines))}
            </span>
          </div>

          <a
            href={buildWhatsAppUrl(check)}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="checkout-control"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-podio-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-podio-700"
          >
            Completar compra por WhatsApp
          </a>
        </div>
      )}
    </section>
  );
}
