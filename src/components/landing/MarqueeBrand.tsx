import { useReducedMotion, motion } from "motion/react";

const BRAND_WORD = "PODIO CLUB";

/**
 * Brand marquee (podio-club-landing-ideas "2. Marquee / transición de
 * marca"): an infinite horizontal brand scroll that bridges the hero and the
 * collection. The track holds the word twice and loops x from 0 to -50%, so
 * the seam is invisible. Reduced-motion users get a static centered word
 * instead of the infinite loop.
 */
export function MarqueeBrand() {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return (
      <section aria-label="Podio Club" className="overflow-hidden border-y border-ink/5 py-10">
        <p className="text-center text-4xl font-extrabold tracking-tight text-ink/90 sm:text-6xl">
          PODIO CLUB
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Podio Club" className="overflow-hidden border-y border-ink/5 py-8">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 18, ease: "linear", repeat: Infinity }}
      >
        {[0, 1].map((track) => (
          <span key={track} className="flex shrink-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                className="px-6 text-4xl font-extrabold tracking-tight text-ink/90 sm:text-6xl"
              >
                {BRAND_WORD} <span aria-hidden="true">/</span>
              </span>
            ))}
          </span>
        ))}
      </motion.div>
    </section>
  );
}
