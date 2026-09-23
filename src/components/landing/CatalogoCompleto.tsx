import { CatalogGrid } from "../catalog/CatalogGrid";
import { Reveal } from "../ui/Reveal";

/**
 * Catálogo Completo section: reuses the existing CatalogGrid to show all products.
 */
export function CatalogoCompleto() {
  return (
    <section className="w-full py-16 md:py-24 bg-paper" aria-labelledby="catalogo-completo-heading">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="text-center mb-12">
          <h2
            id="catalogo-completo-heading"
            className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl"
          >
            CATÁLOGO COMPLETO
          </h2>
        </Reveal>

        <CatalogGrid />

        <div className="mt-10 text-center">
          <Reveal delay={0.1}>
            <a
              href="/catalogo"
              className="inline-flex items-center gap-2 text-sm font-semibold text-podio-600 hover:text-podio-700 transition-colors"
            >
              VER EN PÁGINA DE CATÁLOGO →
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
