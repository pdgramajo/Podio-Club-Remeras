import { useCart } from "../../context/CartContext";
import { cartTotal } from "../../utils/cart";
import { formatARS } from "../../utils/format";
import { Reveal } from "../ui/Reveal";

/**
 * WhatsApp conversion CTA (podio-club-landing-ideas "7. CTA de compra por
 * WhatsApp"): the landing's closing conversion block. When the cart has
 * lines it shows the count and total and opens the cart drawer (where the
 * WhatsApp checkout lives); an empty cart points the visitor back to the
 * collection instead of producing a checkout with nothing inside.
 */
export function CTAWhatsApp() {
  const { lines, setOpen } = useCart();
  const count = lines.length;
  const total = cartTotal(lines);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 md:py-28">
      <Reveal className="rounded-3xl bg-ink px-6 py-14 text-center text-paper sm:px-12">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-podio-400">
          ¿Listo para llevarla?
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl">
          {count > 0 ? (
            <>
              {count} {count === 1 ? "producto" : "productos"} en tu carrito
            </>
          ) : (
            <>
              Encontrá tu próxima
              <br />
              camiseta.
            </>
          )}
        </h2>
        {count > 0 ? (
          <p className="mt-4 text-xl font-bold text-podio-400">{formatARS(total)}</p>
        ) : (
          <p className="mt-4 text-paper/70">Sumá al carrito lo que te gusta y paga por WhatsApp.</p>
        )}

        {count > 0 ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-podio-600 px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-podio-700"
          >
            PAGAR POR WHATSAPP →
          </button>
        ) : (
          <a
            href="#coleccion"
            className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-podio-600 px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-podio-700"
          >
            VER COLECCIÓN →
          </a>
        )}
      </Reveal>
    </section>
  );
}
