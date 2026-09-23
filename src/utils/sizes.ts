import type { AdultSize, ProductSize } from "../types/product";

/**
 * Canonical size vocabulary (product-data "Canonical size format"): adult
 * sizes are exactly S/M/L/XL/XXL, kids sizes match `NIÑO-<n>` with a
 * positive integer. The guard, the size selector, the cart and the WhatsApp
 * message all share this single vocabulary.
 */
const ADULT_SIZES: readonly AdultSize[] = ["S", "M", "L", "XL", "XXL"];

const KID_SIZE_RE = /^NIÑO-([1-9]\d*)$/;

export function isCanonicalSize(value: string): value is ProductSize {
  return (ADULT_SIZES as readonly string[]).includes(value) || KID_SIZE_RE.test(value);
}

export function splitSizes(talles: ProductSize[]): {
  adults: AdultSize[];
  kids: ProductSize[];
} {
  const adults: AdultSize[] = [];
  const kids: ProductSize[] = [];
  for (const size of talles) {
    if ((ADULT_SIZES as readonly string[]).includes(size)) {
      adults.push(size as AdultSize);
    } else {
      kids.push(size);
    }
  }
  return { adults, kids };
}
