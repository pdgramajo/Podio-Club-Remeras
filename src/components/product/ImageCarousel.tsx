import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { OptimizedImage } from "../ui/OptimizedImage";

interface ImageCarouselProps {
  /** Product image paths (authored root-relative), in display order. */
  images: string[];
  /** Accessible base name for the product being shown (Spanish copy). */
  alt?: string;
}

/**
 * Product image carousel (product-catalog "Image carousel with zoom").
 *
 * - first image selected initially; prev/next and thumbnails drive animated
 *   forward/back transitions (AnimatePresence cross-fade/slide over
 *   transform + opacity only)
 * - a single-image product renders without navigation controls but keeps
 *   zoom ("Single-image product")
 * - zoom toggles the selected image to a clearly larger scale and back
 *   ("Zoom toggle")
 * - each slot renders through OptimizedImage, so a broken asset shows the
 *   Spanish placeholder while the rest of the carousel stays usable
 */
export function ImageCarousel({ images, alt = "Producto" }: ImageCarouselProps) {
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState(false);
  const single = images.length === 1;

  const go = (delta: number): void => {
    setSelected((index) => (index + delta + images.length) % images.length);
  };

  return (
    <div data-testid="image-carousel" className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-2xl bg-white">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selected}
            initial={{ opacity: 0, x: 24 }}
            animate={zoom ? { opacity: 1, x: 0, scale: 1.6 } : { opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            data-zoomed={zoom || undefined}
            className="flex aspect-[4/5] cursor-zoom-in items-center justify-center overflow-hidden"
          >
            <OptimizedImage
              src={images[selected]}
              alt={`${alt} - foto ${selected + 1}`}
              eager={selected === 0}
            />
          </motion.div>
        </AnimatePresence>

        {!single && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Imagen anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-ink/40 p-2.5 text-lg leading-none text-white transition-colors hover:bg-ink/60"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Imagen siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-ink/40 p-2.5 text-lg leading-none text-white transition-colors hover:bg-ink/60"
            >
              ›
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => setZoom((value) => !value)}
          aria-label={zoom ? "Quitar zoom" : "Ampliar imagen"}
          aria-pressed={zoom}
          className="absolute bottom-3 right-3 rounded-full bg-ink/60 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-ink/80"
        >
          {zoom ? "−" : "+"}
        </button>
      </div>

      {!single && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setSelected(index)}
              aria-label={`Ver foto ${index + 1}`}
              aria-current={index === selected}
              className={`w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-opacity ${
                index === selected
                  ? "border-podio-600"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <OptimizedImage
                src={src}
                alt={`${alt} - miniatura ${index + 1}`}
                className="aspect-square"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
