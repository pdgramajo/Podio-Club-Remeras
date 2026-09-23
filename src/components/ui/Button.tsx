import { motion, type HTMLMotionProps } from "motion/react";

type ButtonVariant = "primary" | "secondary";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-podio-600 text-white hover:bg-podio-700 disabled:bg-podio-200 disabled:text-ink/40",
  secondary: "border border-ink/15 bg-transparent text-ink hover:border-ink/40 disabled:opacity-40",
};

/**
 * Shared button with a `whileTap` micro-interaction (product-catalog
 * "Catalog motion and animation"). Forwards every native button attribute
 * (`onClick`, `disabled`, `type`) so consumers keep standard semantics and
 * tests can use role/name queries; the disabled state propagates to the DOM
 * and is used by the add-to-cart and checkout guards.
 */
export function Button({
  variant = "primary",
  children,
  className = "",
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
