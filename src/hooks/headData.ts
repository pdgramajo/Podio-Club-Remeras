import type { Product } from "../types/product";
import { resolveAssetUrl } from "../utils/assets";
import type { HeadData } from "./useDocumentHead";

/**
 * Route head data for the three page routes (site-seo "Per-route head
 * management"). Kept in a dedicated module so page files export only
 * components (react-refresh clean) and the values are directly importable
 * by page integration tests.
 */

export const CATALOG_HEAD: HeadData = {
  title: "Catálogo — Podio Club",
  description:
    "Remeras de fútbol réplica para jugar y para alentar. Mirá el catálogo y pedí por WhatsApp.",
};

export const NOT_FOUND_HEAD: HeadData = {
  title: "Página no encontrada — Podio Club",
  description: "La página que buscás no existe o fue movida. Volvé al catálogo.",
};

/**
 * Product route head: the product name and short description as title and
 * description, the first image resolved to an absolute URL (site-seo "Rich
 * product share tags"), and the current route as og:url ("Shareable URL
 * fidelity").
 */
export function productHead(product: Product, pathname: string): HeadData {
  return {
    title: product.nombre,
    description: product.descripcion_corta,
    image: resolveAssetUrl(product.imagenes[0]),
    url: pathname,
  };
}

export const LANDING_HEAD: HeadData = {
  title: "Podio Club — Remeras con identidad",
  description:
    "Remeras de fútbol réplica para jugar y para alentar. Vestite distinto. Pedí por WhatsApp.",
};
