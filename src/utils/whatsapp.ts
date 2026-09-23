import type { CartLine } from "../types/product";
import { cartTotal } from "./cart";
import { formatARS } from "./format";

/**
 * WhatsApp checkout (whatsapp-checkout spec). Pure, side-effect-free module:
 * the exact message contract is fixed here and asserted byte-for-byte by the
 * tests, and the drawer's checkout control reuses the same functions, so the
 * displayed total and the message total can never drift (product-data
 * "Single source for totals and messages").
 */

/** Single shared source of truth for the store's WhatsApp number (no env). */
export const WHATSAPP_NUMBER = "5493884372397";

export function buildCheckoutMessage(lines: CartLine[]): string {
  if (lines.length === 0) {
    return "";
  }
  const itemLines = lines.map(
    (line) => `${line.quantity}x ${line.name} - Talle ${line.size} (${formatARS(line.unitPrice)})`,
  );
  return `Hola! Quiero comprar:\n${itemLines.join("\n")}\nTotal: ${formatARS(cartTotal(lines))}`;
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
