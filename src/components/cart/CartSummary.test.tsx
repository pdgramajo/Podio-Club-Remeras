import { render, screen } from "@testing-library/react";
import type { CartLine } from "../../types/product";
import { buildCheckoutMessage, buildWhatsAppUrl } from "../../utils/whatsapp";
import { CartSummary } from "./CartSummary";

const lines: CartLine[] = [
  {
    productId: 1,
    name: "Camiseta Argentina Local 2024",
    size: "L",
    unitPrice: 45000,
    quantity: 2,
  },
  {
    productId: 2,
    name: "Camiseta River Plate 2024",
    size: "NIÑO-8",
    unitPrice: 40000,
    quantity: 1,
  },
];

describe("CartSummary", () => {
  it("shows the running total and the WhatsApp deep link", () => {
    render(<CartSummary lines={lines} />);

    // Multi-line total: 2 × 45000 + 1 × 40000 → "$130.000,00" (es-AR).
    expect(screen.getByTestId("cart-total")).toHaveTextContent("$130.000,00");

    const message = buildCheckoutMessage(lines);
    const link = screen.getByRole("link", { name: "Completar compra por WhatsApp" });
    expect(link).toHaveAttribute("href", buildWhatsAppUrl(message));
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders a disabled checkout control with no link when the cart is empty", () => {
    render(<CartSummary lines={[]} />);

    const control = screen.getByTestId("checkout-control");
    expect(control).toBeDisabled();
    expect(screen.queryByRole("link", { name: /WhatsApp/ })).not.toBeInTheDocument();
    expect(screen.queryByTestId("cart-total")).not.toBeInTheDocument();
  });
});
