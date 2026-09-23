/**
 * Single shared ARS price formatter (product-data "Single ARS price
 * formatter"): every price shown in the catalog, the product detail page,
 * the cart drawer and the WhatsApp checkout message goes through this one
 * function — no other price formatting exists anywhere else in the app.
 *
 * 45000 → "$45.000,00"   1250000 → "$1.250.000,00"
 */
const arsFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

export function formatARS(value: number): string {
  // Node's ICU (es-AR/ARS) emits a narrow no-break space between the symbol
  // and the digits ("$ 45.000,00"). The spec text is "$45.000,00" and the
  // WhatsApp message contract derives from it, so strip the spacing to keep
  // the output byte-stable across ICU versions. Thousands "." and decimals
  // "," are the only separators that remain.
  return arsFormatter.format(value).replace(/\s/g, "");
}
