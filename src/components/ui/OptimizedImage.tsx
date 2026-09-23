import { useState } from "react";
import { resolveAssetPath } from "../../utils/assets";

interface OptimizedImageProps {
  /** Authored root-relative image path from the JSON datasource. */
  src: string;
  alt: string;
  /**
   * First carousel image of the visible product: eager load with high fetch
   * priority (design "Image optimization"); everything else stays lazy.
   */
  eager?: boolean;
  className?: string;
}

/**
 * Single choke point for every product image (design "Image optimization").
 *
 * - explicit width/height + `aspect-[4/5]` container prevent layout shift
 * - all images are `loading="lazy"` + `decoding="async"` except the first
 *   carousel image (`eager`, high priority)
 * - a failed load swaps the slot for the Spanish placeholder instead of the
 *   native broken-image icon (product-catalog "Broken image asset")
 * - this is the seam where a `<picture>`/WebP layer can be added later
 *   without touching any consumer
 */
export function OptimizedImage({ src, alt, eager = false, className = "" }: OptimizedImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex aspect-[4/5] items-center justify-center bg-paper p-6 text-center ${className}`}
      >
        <span className="text-sm text-ink/50">Imagen no disponible</span>
      </div>
    );
  }

  return (
    <img
      src={resolveAssetPath(src)}
      alt={alt}
      width={800}
      height={1000}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : "auto"}
      onError={() => setFailed(true)}
      className={`aspect-[4/5] w-full object-cover ${className}`}
    />
  );
}
