import { buildCheckoutMessage, buildWhatsAppUrl, WHATSAPP_NUMBER } from "./whatsapp";
import type { CartLine } from "../types/product";

const twoItemCart: CartLine[] = [
  { productId: 1, name: "Camiseta Argentina Local 2024", size: "L", unitPrice: 45000, quantity: 2 },
  {
    productId: 2,
    name: "Camiseta River Plate 2024",
    size: "NIÑO-8",
    unitPrice: 40000,
    quantity: 1,
  },
];

const singleItemCart: CartLine[] = [
  { productId: 3, name: "Camiseta Boca Juniors 2024", size: "XL", unitPrice: 50000, quantity: 1 },
];

describe("buildCheckoutMessage", () => {
  it("produces the byte-exact two-item message in insertion order", () => {
    const expected = [
      "Hola! Quiero comprar:",
      "2x Camiseta Argentina Local 2024 - Talle L ($45.000,00)",
      "1x Camiseta River Plate 2024 - Talle NIÑO-8 ($40.000,00)",
      "Total: $130.000,00",
    ].join("\n");

    expect(buildCheckoutMessage(twoItemCart)).toBe(expected);
  });

  it("produces the single-item message with its own total", () => {
    const message = buildCheckoutMessage(singleItemCart);

    expect(message).toContain("1x Camiseta Boca Juniors 2024 - Talle XL ($50.000,00)");
    expect(message).toContain("Total: $50.000,00");
    expect(message).not.toContain("River Plate");
  });

  it("returns the empty string for an empty cart", () => {
    expect(buildCheckoutMessage([])).toBe("");
  });
});

describe("buildWhatsAppUrl", () => {
  it("targets the single shared number constant with the URL-encoded message", () => {
    expect(WHATSAPP_NUMBER).toBe("5493884372397");

    const url = buildWhatsAppUrl("Hola! Quiero comprar:\nTotal: $130.000,00");

    expect(url).toBe(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola! Quiero comprar:\nTotal: $130.000,00")}`,
    );
  });

  it("round-trips spaces, newlines, accents and the dollar sign character-for-character", () => {
    const message = buildCheckoutMessage([
      {
        productId: 2,
        name: "Camiseta Niño ñandú 2024",
        size: "NIÑO-8",
        unitPrice: 40000,
        quantity: 1,
      },
    ]);
    const url = buildWhatsAppUrl(message);

    const encoded = url.slice(url.indexOf("?text=") + "?text=".length);
    expect(decodeURIComponent(encoded)).toBe(message);
  });
});
