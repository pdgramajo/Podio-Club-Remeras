import { useState } from "react";
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
 * (es-AR, via the single shared formatter), the WhatsApp deep link built from
 * the exact checkout message, and a copyable read-only preview of that same
 * message — the fallback when the deep link does not open WhatsApp on the
 * user's device ("Message visibility as fallback").
 *
 * Empty-cart guard: with no lines the control is a disabled button with no
 * href — no link can ever open — and the total/preview/copy surface is hidden.
 */
export function CartSummary({ lines }: CartSummaryProps) {
  const [copied, setCopied] = useState(false);
  const isEmpty = lines.length === 0;
  const check = buildCheckoutMessage(lines);

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(check);
      setCopied(true);
    } catch {
      // Clipboard API unavailable — the read-only preview remains usable.
    }
  }

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

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
              Mensaje del pedido
            </span>
            <textarea
              readOnly
              rows={5}
              value={check}
              data-testid="checkout-message-preview"
              className="w-full resize-none rounded-xl border border-ink/10 bg-paper p-3 text-xs leading-relaxed text-ink/80"
            />
          </label>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleCopy}
              data-testid="copy-message"
              className="rounded-xl border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink/40"
            >
              {copied ? "¡Copiado!" : "Copiar mensaje"}
            </button>
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
        </div>
      )}
    </section>
  );
}
