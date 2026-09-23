import { buildWhatsAppUrl } from "../../utils/whatsapp";

/**
 * Minimal landing footer (podio-club-landing-ideas "9. Final de la
 * landing"): closes the page with the brand name, a short tagline and the
 * two channel links. Social links are best-effort anchors (Instagram is a
 * conversational placeholder until a real handle exists); WhatsApp reuses
 * the store's shared number utility so the channel can never drift from the
 * checkout.
 */
export function Footer() {
  const year = new Date().getFullYear();
  const whatsappUrl = buildWhatsAppUrl("Hola! Quiero consultar por las camisetas de Podio Club.");

  return (
    <footer className="border-t border-ink/5 bg-paper">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-14 text-center sm:px-6">
        <p className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          PODIO <span className="text-podio-600">CLUB</span>
        </p>
        <p className="max-w-sm text-sm leading-relaxed text-ink/60">
          Remeras con identidad. Para jugar y para alentar.
        </p>
        <nav aria-label="Redes" className="flex items-center gap-6 text-sm font-semibold">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="text-ink/70 transition-colors hover:text-podio-700"
          >
            Instagram
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="text-ink/70 transition-colors hover:text-podio-700"
          >
            WhatsApp
          </a>
        </nav>
        <p className="text-xs text-ink/40">© {year} Podio Club</p>
      </div>
    </footer>
  );
}
