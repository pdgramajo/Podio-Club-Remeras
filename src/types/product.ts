/**
 * Product catalog domain model (product-data spec).
 *
 * Field names are intentionally Spanish: the JSON datasource they describe is
 * hand-edited by a Spanish-speaking owner, and this surface stays 1:1 with
 * the schema so the guard, the catalog and the cart share one vocabulary.
 */

/** Whether the jersey is a player ("jugador") or fan ("hincha") replica. */
export type ProductType = "jugador" | "hincha";

/**
 * Back number: `true` / `false` ("has a back number") or the back number
 * itself as a positive integer. Preserved as authored — never coerced.
 */
export type BackNumber = boolean | number;

export type AdultSize = "S" | "M" | "L" | "XL" | "XXL";
export type ProductSize = AdultSize | `NIÑO-${number}`;

export interface Product {
  id: number; // unique positive integer
  nombre: string; // non-empty
  descripcion_corta: string; // non-empty
  descripcion_larga: string; // non-empty
  tipo_tela: string;
  numero_espalda: BackNumber; // preserved as authored — never coerced
  tipo: ProductType;
  imagenes: string[]; // non-empty; [0] = card preview + detail default
  precio: number; // integer ARS, no decimals/symbols
  talles: ProductSize[]; // canonical format only
}

export interface CartLine {
  productId: number;
  name: string;
  size: string; // canonical format
  unitPrice: number; // ARS, from product data
  quantity: number; // positive integer
}
