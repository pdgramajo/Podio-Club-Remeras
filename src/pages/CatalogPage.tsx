import { CatalogGrid } from "../components/catalog/CatalogGrid";
import { CATALOG_HEAD } from "../hooks/headData";
import { useDocumentHead } from "../hooks/useDocumentHead";

/**
 * Catalog route `/` (product-catalog "Catalog route and responsive grid"):
 * renders the responsive product grid and installs the catalog head data.
 */
export function CatalogPage() {
  useDocumentHead(CATALOG_HEAD);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-ink md:text-3xl">Catálogo</h1>
      <CatalogGrid />
    </main>
  );
}
