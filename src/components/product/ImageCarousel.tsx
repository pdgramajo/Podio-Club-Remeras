import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { OptimizedImage } from "../ui/OptimizedImage";

interface ImageCarouselProps {
  /** Product image paths (authored root-relative), in display order. */
  images: string[];
  /** Accessible base name for the product being shown (Spanish copy). */
  alt?: string;
}

/** Zoom scale for each level: 0 = none, 1 = current, 2 = a bit more, 3 = strongest. */
const ZOOM_SCALES = [1, 1.6, 2.2, 3] as const;
type ZoomLevel = 0 | 1 | 2 | 3;

/** In-flight pointer drag (while panning a zoomed image). */
interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  panX: number;
  panY: number;
}

/**
 * Product image carousel (product-catalog "Image carousel with zoom").
 *
 * - first image selected initially; prev/next and thumbnails drive animated
 *   forward/back transitions (AnimatePresence cross-fade over opacity)
 * - a single-image product renders without navigation controls but keeps
 *   zoom ("Single-image product")
 * - zoom cycles through three levels — the standard scale, a closer one and
 *   the strongest — and the button shows the current level ("Zoom toggle")
 * - while zoomed, the image can be panned by dragging, clamped so the scaled
 *   image never exposes empty frame edges ("Pan while zoomed")
 * - each slot renders through OptimizedImage, so a broken asset shows the
 *   Spanish placeholder while the rest of the carousel stays usable
 */
export function ImageCarousel({ images, alt = "Producto" }: ImageCarouselProps) {
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState<ZoomLevel>(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const single = images.length === 1;

  const scale = ZOOM_SCALES[zoom];

  /* Pan always restarts centered whenever the image or zoom level changes. */
  function resetPan(): void {
    setPan({ x: 0, y: 0 });
    setDragging(false);
    dragRef.current = null;
  }

  /** Max pan offset (px) in both axes so the scaled image covers the frame. */
  function maxPan(): { x: number; y: number } {
    const frame = frameRef.current;
    if (!frame) return { x: 0, y: 0 };
    const rect = frame.getBoundingClientRect();
    return {
      x: (rect.width * (scale - 1)) / 2,
      y: (rect.height * (scale - 1)) / 2,
    };
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>): void {
    if (zoom === 0) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>): void {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const max = maxPan();
    const nextX = drag.panX + (event.clientX - drag.startX);
    const nextY = drag.panY + (event.clientY - drag.startY);
    setPan({
      x: Math.round(Math.min(max.x, Math.max(-max.x, nextX))),
      y: Math.round(Math.min(max.y, Math.max(-max.y, nextY))),
    });
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>): void {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setDragging(false);
  }

  const go = (delta: number): void => {
    resetPan();
    setSelected((index) => (index + delta + images.length) % images.length);
  };

  const cycleZoom = (): void => {
    resetPan();
    setZoom((level) => ((level + 1) % ZOOM_SCALES.length) as ZoomLevel);
  };

  const zoomLabel = (level: ZoomLevel): string => {
    if (level === 0) return "Ampliar imagen";
    if (level === ZOOM_SCALES.length - 1) return "Quitar zoom";
    return "Ampliar más";
  };

  const zoomText = (level: ZoomLevel): string => {
    if (level === 0) return "+";
    return `${ZOOM_SCALES[level]}×`;
  };

  const cursor = zoom === 0 ? "cursor-zoom-in" : dragging ? "cursor-grabbing" : "cursor-grab";

  return (
    <div data-testid="image-carousel" className="flex flex-col gap-3">
      <div
        ref={frameRef}
        data-testid="carousel-frame"
        className="relative overflow-hidden rounded-2xl bg-white"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selected}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, x: pan.x, y: pan.y, scale }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            data-zoomed={zoom > 0 || undefined}
            data-pan-x={pan.x}
            data-pan-y={pan.y}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`flex aspect-[4/5] select-none items-center justify-center overflow-hidden ${
              zoom > 0 ? "touch-none" : ""
            } ${cursor}`}
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
          onClick={cycleZoom}
          aria-label={zoomLabel(zoom)}
          aria-pressed={zoom > 0}
          className="absolute bottom-3 right-3 rounded-full bg-ink/60 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-ink/80"
        >
          {zoomText(zoom)}
        </button>
      </div>

      {!single && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => {
                resetPan();
                setSelected(index);
              }}
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
