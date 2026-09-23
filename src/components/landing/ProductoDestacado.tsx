import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router";
import { products } from "../../data/products";
import { formatARS } from "../../utils/format";
import { OptimizedImage } from "../ui/OptimizedImage";
import { Reveal } from "../ui/Reveal";

/**
 * Featured product (podio-club-landing-ideas "5. Producto destacado"): the
 * first catalog product as the section protagonist. Image thumbnails switch
 * the visible photo with a quick opacity fade (compositor-friendly), the
 * name/price/CTA stay beside it, and the whole section links to the product
 * detail page. Color-variant switching from the ideas doc maps to the
 * product's existing image list here, since each catalog color is its own
 * product in the current data model.
 */
export function ProductoDestacado() {
  const product = products[0];
  const [activeIndex, setActiveIndex] = useState(0);

  if (product === undefined) {
    return null;
  }

  const image = product.imagenes[activeIndex] ?? product.imagenes[0];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <Reveal className="relative overflow-hidden rounded-3xl">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={image}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <OptimizedImage src={image} alt={product.nombre} />
            </motion.div>
          </AnimatePresence>

          {product.imagenes.length > 1 && (
            <div className="absolute bottom-4 left-4 flex gap-2">
              {product.imagenes.map((thumb, index) => (
                <button
                  key={thumb}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Ver imagen ${index + 1} de ${product.nombre}`}
                  aria-pressed={index === activeIndex}
                  className={`h-2.5 rounded-full transition-colors ${
                    index === activeIndex ? "w-6 bg-podio-600" : "w-2.5 bg-white/70 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          )}
        </Reveal>

        <div className="flex flex-col items-start gap-4">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-podio-600">
              Producto destacado
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {product.nombre}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-md leading-relaxed text-ink/70">{product.descripcion_larga}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-2xl font-bold text-podio-700">{formatARS(product.precio)}</p>
          </Reveal>
          <Reveal delay={0.2}>
            <Link
              to={`/producto/${product.id}`}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-podio-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-podio-700"
            >
              VER PRODUCTO →
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
