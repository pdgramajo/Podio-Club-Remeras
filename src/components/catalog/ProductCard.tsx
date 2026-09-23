import { Link } from "react-router";
import type { Product } from "../../types/product";
import { formatARS } from "../../utils/format";
import { OptimizedImage } from "../ui/OptimizedImage";
import { Reveal } from "../ui/Reveal";

interface ProductCardProps {
  product: Product;
  /** Stagger delay (seconds) applied by the grid to the reveal animation. */
  delay?: number;
}

/**
 * Catalog card (product-catalog "Catalog route and responsive grid"): preview
 * image (imagenes[0]), name, short description and the shared-formatted
 * price. The whole card is a Link to /producto/:id ("Card navigation"), and
 * it reveals on scroll inside a subtle hover zoom of the image.
 */
export function ProductCard({ product, delay = 0 }: ProductCardProps) {
  return (
    <Reveal delay={delay} className="h-full">
      <Link
        to={`/producto/${product.id}`}
        data-testid="product-card"
        className="group block h-full overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-sm transition-shadow hover:shadow-lg"
      >
        <OptimizedImage
          src={product.imagenes[0]}
          alt={product.nombre}
          className="transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
        <div className="flex flex-col gap-1 p-4">
          <h3 className="font-semibold leading-snug text-ink">{product.nombre}</h3>
          <p className="line-clamp-2 text-sm text-ink/60">{product.descripcion_corta}</p>
          <p className="mt-2 text-lg font-bold text-podio-700">{formatARS(product.precio)}</p>
        </div>
      </Link>
    </Reveal>
  );
}
