import type { CartLine } from "../../types/product";
import { formatARS } from "../../utils/format";

interface CartLineItemProps {
  /** A single cart line (product + size identity, unit price, quantity). */
  line: CartLine;
  /** Quantity up; wired to the cart context by the drawer. */
  onIncrement: (productId: number, size: string) => void;
  /** Quantity down; decrementing at quantity 1 removes the line (reducer). */
  onDecrement: (productId: number, size: string) => void;
  /** Remove exactly this line (product + size identity). */
  onRemove: (productId: number, size: string) => void;
}

/**
 * One cart line in the drawer (shopping-cart "Cart drawer presentation"):
 * product name, size badge, unit price, quantity controls, the line subtotal
 * (unit price × quantity) and a per-item remove control. Presentational on
 * purpose — the drawer owns the cart context and wires the callbacks, which
 * keeps this component trivially testable (same pattern as SizeSelector).
 */
export function CartLineItem({ line, onIncrement, onDecrement, onRemove }: CartLineItemProps) {
  const { productId, name, size, unitPrice, quantity } = line;
  const key = `${productId}-${size}`;

  return (
    <li data-testid={`cart-line-${key}`} className="flex flex-col gap-3 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate font-semibold text-ink">{name}</p>
          <span className="inline-flex w-fit items-center rounded-full bg-podio-100 px-2.5 py-0.5 text-xs font-semibold text-podio-800">
            Talle {size}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onRemove(productId, size)}
          aria-label={`Eliminar ${name} (${size})`}
          className="rounded-full p-1.5 text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onDecrement(productId, size)}
            aria-label={`Reducir cantidad de ${name} (${size})`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink/15 text-ink transition-colors hover:border-ink/40"
          >
            −
          </button>
          <span
            data-testid={`line-qty-${key}`}
            aria-label={`Cantidad de ${name}: ${quantity}`}
            className="w-8 text-center font-semibold text-ink"
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => onIncrement(productId, size)}
            aria-label={`Aumentar cantidad de ${name} (${size})`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink/15 text-ink transition-colors hover:border-ink/40"
          >
            +
          </button>
        </div>

        <div className="flex items-baseline gap-2">
          <span
            data-testid={`line-unit-${key}`}
            className="text-sm text-ink/70"
            aria-label={`Precio unitario de ${name}`}
          >
            {formatARS(unitPrice)}
          </span>
          <span data-testid={`line-subtotal-${key}`} className="font-bold text-ink">
            {formatARS(unitPrice * quantity)}
          </span>
        </div>
      </div>
    </li>
  );
}
