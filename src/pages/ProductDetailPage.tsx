import { useState } from "react";
import { useLocation, useParams } from "react-router";
import { ImageCarousel } from "../components/product/ImageCarousel";
import { SizeSelector } from "../components/product/SizeSelector";
import { Button } from "../components/ui/Button";
import { useCart } from "../context/CartContext";
import { getProductById } from "../data/products";
import { NOT_FOUND_HEAD, productHead } from "../hooks/headData";
import { useDocumentHead } from "../hooks/useDocumentHead";
import type { ProductSize } from "../types/product";
import { formatARS } from "../utils/format";
import { NotFoundPage } from "./NotFoundPage";

/**
 * Product detail route `/producto/:id` (product-catalog spec). A known id
 * renders the long description, image carousel, size selector with adult and
 * kids groups, the formatted price, and an add-to-cart control that stays
 * disabled with a Spanish hint until a size is selected. An unknown or
 * invalid id falls back to the not-found page — never a crash (TM-1).
 *
 * Head handling: the product head (name, short description, absolute first
 * image, current route) is installed for known ids. For unknown ids the
 * not-found head is installed here explicitly (instead of null) so it wins
 * the effects ordering against NotFoundPage's own sync — both converge on
 * the same head, installed exactly once.
 */
export function ProductDetailPage() {
  const { id } = useParams();
  const product = getProductById(Number(id));
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const { addItem, setOpen } = useCart();
  const { pathname } = useLocation();

  useDocumentHead(product !== undefined ? productHead(product, pathname) : NOT_FOUND_HEAD);

  if (product === undefined) {
    return <NotFoundPage />;
  }

  const addToCart = (): void => {
    const size = selectedSize;
    if (size === null) {
      return;
    }
    addItem(product.id, product.nombre, size, product.precio);
    setOpen(true);
  };

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <ImageCarousel images={product.imagenes} alt={product.nombre} />
        <div className="flex flex-col gap-5">
          <h1 className="text-2xl font-bold text-ink md:text-3xl">{product.nombre}</h1>
          <p className="text-2xl font-bold text-podio-700">{formatARS(product.precio)}</p>
          <p className="leading-relaxed text-ink/70">{product.descripcion_larga}</p>
          <SizeSelector
            talles={product.talles}
            selected={selectedSize}
            onSelect={setSelectedSize}
          />
          {selectedSize === null && (
            <p data-testid="size-hint" className="text-sm text-ink/60">
              Elegí un talle para añadir al carrito.
            </p>
          )}
          <Button disabled={selectedSize === null} onClick={addToCart} className="self-start">
            Añadir al carrito
          </Button>
        </div>
      </div>
    </main>
  );
}
