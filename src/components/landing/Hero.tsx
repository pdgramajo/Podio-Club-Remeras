import { motion } from "motion/react";
import { products } from "../../data/products";
import { OptimizedImage } from "../ui/OptimizedImage";

/**
 * Landing hero (podio-club-landing-ideas "1. Hero"): full-viewport brand
 * statement with staggered entrance animation and a product image that
 * settles from a light zoom. The CTA anchors to the landing collection
 * section instead of routing, keeping the one-page feel. Content order is
 * mobile-first (text above image), and the whole block runs under
 * MotionConfig reducedMotion="user", so reduced-motion users get a shorter,
 * opacity-first reveal via the config's reduce transform handling.
 */
export function Hero() {
  const heroImage = products[0]?.imagenes[0];

  return (
    <section className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-10 px-4 pb-10 pt-16 sm:px-6 md:flex-row md:items-center md:gap-16 md:pt-20">
      <div className="flex max-w-xl flex-col items-start gap-6">
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-sm font-semibold uppercase tracking-[0.3em] text-podio-600"
        >
          Podio Club
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="text-5xl font-extrabold leading-[0.95] tracking-tight text-ink sm:text-6xl md:text-7xl"
        >
          VESTITE
          <br />
          <span className="text-podio-600">DISTINTO.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          className="max-w-md text-lg leading-relaxed text-ink/70"
        >
          Remeras de fútbol réplica con identidad propia. Para jugar, para alentar y para vestirte
          distinto.
        </motion.p>
        <motion.a
          href="#coleccion"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-podio-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-podio-700"
        >
          VER COLECCIÓN →
        </motion.a>
      </div>

      {heroImage !== undefined && (
        <motion.div
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
          className="w-full max-w-sm shrink-0"
        >
          <div className="overflow-hidden rounded-3xl">
            <OptimizedImage src={heroImage} alt="Camiseta destacada Podio Club" eager />
          </div>
        </motion.div>
      )}
    </section>
  );
}
