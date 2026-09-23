import { products } from "../../data/products";
import { ProductCard } from "./ProductCard";

/**
 * Responsive catalog grid (product-catalog "Catalog route and responsive
 * grid"): one column on mobile, two on md, three on lg, rendering exactly
 * the validated products. An empty validated source renders a Spanish
 * empty-state message without crashing ("Empty catalog").
 */
export function CatalogGrid() {
  if (products.length === 0) {
    return (
      <p className="py-20 text-center text-lg text-ink/60">
        El catálogo está vacío por ahora. Vuelve pronto.
      </p>
    );
  }

  return (
    <div
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      data-testid="catalog-grid"
    >
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} delay={Math.min(index * 0.06, 0.3)} />
      ))}
    </div>
  );
}
