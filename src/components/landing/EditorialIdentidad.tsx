import { products } from "../../data/products";
import { OptimizedImage } from "../ui/OptimizedImage";
import { Reveal } from "../ui/Reveal";

/**
 * Editorial identity section (podio-club-landing-ideas "4. Sección
 * editorial / identidad"): a brand pause between the collection and the
 * featured product. The manifesto lines reveal on scroll and the image
 * fades in beside them. Uses a catalog image so the section never breaks
 * when the store has products.
 */
export function EditorialIdentidad() {
  const image = products[1]?.imagenes[0] ?? products[0]?.imagenes[0];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 md:py-28">
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <div className="flex flex-col gap-4">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-podio-600">
              Podio Club
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="text-4xl font-extrabold leading-[1.02] tracking-tight text-ink sm:text-5xl">
              NO ES SOLO
              <br />
              UNA REMERA.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-md text-lg leading-relaxed text-ink/70">
              Es la forma en que elegís vestirte. Cada diseño sale de la cancha y llega a tu día a
              día, con la identidad de Podio puesta en cada costura.
            </p>
          </Reveal>
        </div>

        {image !== undefined && (
          <Reveal delay={0.15} className="overflow-hidden rounded-3xl">
            <OptimizedImage src={image} alt="Editorial Podio Club" />
          </Reveal>
        )}
      </div>
    </section>
  );
}
