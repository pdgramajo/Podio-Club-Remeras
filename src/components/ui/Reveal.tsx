import { motion } from "motion/react";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Seconds to wait before the reveal starts; used for card staggering. */
  delay?: number;
  className?: string;
}

/**
 * Scroll-reveal wrapper (product-catalog "Scroll reveal on catalog"): the
 * child fades and slides in once it enters the viewport. `viewport.once`
 * keeps the animation one-shot per element, and the whole app runs under
 * `MotionConfig reducedMotion="user"`, so users who prefer reduced motion
 * get an opacity-only transition instead (product-catalog "Reduced motion
 * preference"). Only transform/opacity are animated (compositor-friendly).
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -48px 0px" }}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
