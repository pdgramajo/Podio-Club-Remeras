import rawProducts from "./products.json";
import type { BackNumber, Product, ProductSize, ProductType } from "../types/product";

/**
 * Runtime validation guard (product-data "Type safety for product data").
 *
 * Syntactically invalid JSON is caught by the Vite bundler at build time
 * (CI fails fast); this guard covers the semantic errors that can reach
 * runtime — a root that is not an array, wrong types, bad sizes, duplicate
 * ids. Invalid entries are dropped with a descriptive console warning and
 * the remaining valid products render normally: the catalog never crashes
 * and never goes blank because of one bad entry.
 */
const CANONICAL_SIZE_RE = /^(S|M|L|XL|XXL|NIÑO-[1-9]\d*)$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isProductType(value: unknown): value is ProductType {
  return value === "jugador" || value === "hincha";
}

function isBackNumber(value: unknown): value is BackNumber {
  if (typeof value === "boolean") {
    return true;
  }
  return typeof value === "number" && Number.isInteger(value) && value >= 1;
}

function isNonEmptyString(value: unknown): boolean {
  return typeof value === "string" && value.trim() !== "";
}

function isImageList(value: unknown): boolean {
  return (
    Array.isArray(value) && value.length > 0 && value.every((entry) => typeof entry === "string")
  );
}

function isCanonicalSizeList(value: unknown): value is ProductSize[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((size) => typeof size === "string" && CANONICAL_SIZE_RE.test(size))
  );
}

function describeRoot(raw: unknown): string {
  if (raw === null) return "null";
  if (Array.isArray(raw)) return "an array";
  return typeof raw;
}

/**
 * Validates a catalog entry and returns a typed `Product`, or `null` with
 * `seenIds` untouched when the entry violates the schema. Every rule maps
 * to one sentence in the console warning, so a hand-edited JSON file can be
 * fixed from the devtools message alone.
 */
function parseProduct(entry: unknown, seenIds: Set<number>, index: number): Product | null {
  const problems: string[] = [];

  if (!isRecord(entry)) {
    problems.push("entry is not an object");
    warnDropped(index, problems);
    return null;
  }

  const { id } = entry;
  if (typeof id !== "number" || !Number.isInteger(id) || id < 1) {
    problems.push("id must be a positive integer");
  } else if (seenIds.has(id)) {
    problems.push(`duplicate id ${id}`);
  } else {
    seenIds.add(id);
  }

  for (const field of ["nombre", "descripcion_corta", "descripcion_larga"]) {
    if (!isNonEmptyString(entry[field])) {
      problems.push(`${field} must be a non-empty string`);
    }
  }

  if (typeof entry.tipo_tela !== "string") {
    problems.push("tipo_tela must be a string");
  }

  if (!isBackNumber(entry.numero_espalda)) {
    problems.push("numero_espalda must be a boolean or a positive integer");
  }

  if (!isProductType(entry.tipo)) {
    problems.push('tipo must be "jugador" or "hincha"');
  }

  if (!isImageList(entry.imagenes)) {
    problems.push("imagenes must be a non-empty array of strings");
  }

  if (typeof entry.precio !== "number" || !Number.isInteger(entry.precio) || entry.precio < 0) {
    problems.push("precio must be a non-negative integer");
  }

  if (!isCanonicalSizeList(entry.talles)) {
    problems.push("talles must be a non-empty array of canonical sizes (S|M|L|XL|XXL|NIÑO-n)");
  }

  if (problems.length > 0) {
    warnDropped(index, problems);
    return null;
  }

  return {
    id: entry.id as number,
    nombre: entry.nombre as string,
    descripcion_corta: entry.descripcion_corta as string,
    descripcion_larga: entry.descripcion_larga as string,
    tipo_tela: entry.tipo_tela as string,
    // Preserved exactly as authored — booleans stay booleans, numbers stay
    // numbers (product-data "numero_espalda as boolean or number").
    numero_espalda: entry.numero_espalda as BackNumber,
    tipo: entry.tipo as ProductType,
    imagenes: entry.imagenes as string[],
    precio: entry.precio as number,
    talles: entry.talles as ProductSize[],
  };
}

function warnDropped(index: number, problems: string[]): void {
  console.warn(`[products] entry #${index + 1} dropped: ${problems.join("; ")}`);
}

/**
 * Validates the raw datasource root and returns the typed product list.
 * A root that is not an array yields the empty catalog with a descriptive
 * console error — never a crash (product-data "Per-product fallback").
 */
export function validateProducts(raw: unknown): Product[] {
  if (!Array.isArray(raw)) {
    console.error(
      `[products] invalid data source: expected an array of products, got ${describeRoot(raw)}. The catalog renders empty.`,
    );
    return [];
  }

  const seenIds = new Set<number>();
  const valid: Product[] = [];
  raw.forEach((entry, index) => {
    const product = parseProduct(entry, seenIds, index);
    if (product !== null) {
      valid.push(product);
    }
  });
  return valid;
}

/** Validated singleton — safe to consume everywhere (product-data). */
export const products: Product[] = validateProducts(rawProducts);

export function getProductById(id: number): Product | undefined {
  return products.find((product) => product.id === id);
}
