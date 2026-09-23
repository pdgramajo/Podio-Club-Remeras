import { products } from "../../data/products";
import { ProductCard } from "../catalog/ProductCard";
import { Reveal } from "../ui/Reveal";

/**
 * Nueva Colección section: shows first 3 products using the same ProductCard
 * pattern as CatalogGrid but limited to 3 items for the landing preview.
 */
export function NuevaColeccion() {
  const featuredProducts = products.slice(0, 3);

  if (featuredProducts.length === 0) {
    return (
      <section className="w-full py-16 md:py-24 bg-paper" aria-labelledby="nueva-coleccion-heading">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="text-center mb-12">
            <h2
              id="nueva-coleccion-heading"
              className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl"
            >
              NUEVA COLECCIÓN
            </h2>
          </Reveal>
          <p className="text-center text-lg text-ink/60">
            El catálogo está vacío por ahora. Vuelve pronto.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-16 md:py-24 bg-paper" aria-labelledby="nueva-coleccion-heading">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="text-center mb-12">
          <h2
            id="nueva-coleccion-heading"
            className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl"
          >
            NUEVA COLECCIÓN
          </h2>
        </Reveal>

        <div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          data-testid="nueva-coleccion-grid"
        >
          {featuredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} delay={Math.min(index * 0.06, 0.3)} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Reveal delay={0.2}>
            <a
              href="/catalogo"
              className="inline-flex items-center gap-2 text-sm font-semibold text-podio-600 hover:text-podio-700 transition-colors"
            >
              VER CATÁLOGO COMPLETO →
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
