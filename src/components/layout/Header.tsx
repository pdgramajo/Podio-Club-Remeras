import { Link } from "react-router";
import { useCart } from "../../context/CartContext";

/**
 * Site header: brand link to the catalog and the cart control with a
 * line-count badge driven by the cart context (design "Header"). Activating
 * the control opens the drawer — in this PR it flips the shared open flag;
 * the drawer panel itself lands in Phase 6, so the header works standalone.
 */
export function Header() {
  const { lines, setOpen } = useCart();
  const count = lines.length;

  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="text-xl font-extrabold tracking-tight text-podio-700">
          Podio Club
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir carrito"
          data-testid="cart-button"
          className="relative rounded-full p-2 text-ink transition-colors hover:bg-ink/5"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="9" cy="21" r="1.5" />
            <circle cx="18" cy="21" r="1.5" />
            <path d="M2.5 3.5h2.6l2.2 11.5a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.2l1.8-8.5H6" />
          </svg>
          {count > 0 && (
            <span
              data-testid="cart-badge"
              className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-podio-600 px-1 text-[11px] font-bold text-white"
            >
              {count}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
