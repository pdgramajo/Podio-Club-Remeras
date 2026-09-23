import { Link } from "react-router";
import { NOT_FOUND_HEAD } from "../hooks/headData";
import { useDocumentHead } from "../hooks/useDocumentHead";

/**
 * Not-found state (product-catalog "Unknown or invalid id", site-seo
 * "Not-found head"): Spanish copy plus a single link back to the catalog.
 * Manages its own head so it works both as the catch-all route and as the
 * fallback rendered by ProductDetailPage for unknown ids.
 */
export function NotFoundPage() {
  useDocumentHead(NOT_FOUND_HEAD);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-ink">Página no encontrada</h1>
      <p className="text-ink/60">La página que buscás no existe o fue movida.</p>
      <Link to="/" className="font-semibold text-podio-700 underline hover:text-podio-800">
        Volver al catálogo
      </Link>
    </main>
  );
}
