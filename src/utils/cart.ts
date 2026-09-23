import type { CartLine } from "../types/product";

/**
 * Cart line helpers (shopping-cart "Running total").
 *
 * `cartLineKey` is the stable identity of a line: one line per product +
 * size combination, so the reducer aggregates and mutates exactly one line.
 * `cartTotal` is the single derivation of the running total (Σ unitPrice ×
 * quantity) shared by the drawer and the WhatsApp checkout message — both
 * totals are the same value by construction (product-data "Single source
 * for totals and messages").
 */
export function cartLineKey(line: Pick<CartLine, "productId" | "size">): string {
  return `${line.productId}:${line.size}`;
}

export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
}
