import { products } from "../data/products";
import { LANDING_HEAD } from "../hooks/headData";
import { useDocumentHead } from "../hooks/useDocumentHead";
import { ProductCard } from "../components/catalog/ProductCard";
import { CatalogGrid } from "../components/catalog/CatalogGrid";
import { Reveal } from "../components/ui/Reveal";
import { Hero } from "../components/landing/Hero";
import { MarqueeBrand } from "../components/landing/MarqueeBrand";
import { EditorialIdentidad } from "../components/landing/EditorialIdentidad";
import { ProductoDestacado } from "../components/landing/ProductoDestacado";
import { CTAWhatsApp } from "../components/landing/CTAWhatsApp";
import { Footer } from "../components/landing/Footer";

/**
 * Landing route `/` (podio-club-landing-ideas): the storefront page that
 * sells the brand before the catalog. Sections follow the ideas document:
 * hero → brand marquee → new collection → editorial identity → featured
 * product → full catalog → WhatsApp conversion CTA → footer. The route
 * installs the landing head data (already defined in headData.ts) and keeps
 * the existing catalog grid untouched — this page only composes existing
 * primitives plus the new landing sections. The full catalog stays on this
 * page with the anchor id the hero CTA points to.
 */
export function LandingPage() {
  useDocumentHead(LANDING_HEAD);
  const featured = products.slice(0, 3);

  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <MarqueeBrand />

      <section
        id="coleccion"
        className="mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 md:py-24"
      >
        <Reveal>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink md:text-3xl">
            NUEVA COLECCIÓN
          </h2>
        </Reveal>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {featured.map((product, index) => (
            <ProductCard key={product.id} product={product} delay={index * 0.06} />
          ))}
        </div>
      </section>

      <EditorialIdentidad />
      <ProductoDestacado />

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <Reveal>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink md:text-3xl">
            TODAS LAS REMERAS
          </h2>
        </Reveal>
        <div className="mt-8">
          <CatalogGrid />
        </div>
      </section>

      <CTAWhatsApp />
      <Footer />
    </main>
  );
}
