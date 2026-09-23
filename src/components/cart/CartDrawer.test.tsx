import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartProvider, useCart } from "../../context/CartContext";
import { CartDrawer } from "./CartDrawer";

const ITEM_L = {
  productId: 1,
  name: "Camiseta Argentina Local 2024",
  size: "L",
  unitPrice: 45000,
};
const ITEM_M = { ...ITEM_L, size: "M" };

/** Renders the real cart state so tests can assert dispatches (close keeps lines). */
function CartProbe() {
  const { lines, isOpen } = useCart();
  return (
    <div>
      <span data-testid="probe-lines">{JSON.stringify(lines)}</span>
      <span data-testid="probe-open">{String(isOpen)}</span>
    </div>
  );
}

function DrawerHarness() {
  const { addItem, setOpen } = useCart();
  // Mirrors the real add-to-cart flow (ProductDetailPage): add the item, then
  // open the drawer via the shared open flag.
  const addAndOpen = (productId: number, name: string, size: string, unitPrice: number): void => {
    addItem(productId, name, size, unitPrice);
    setOpen(true);
  };

  return (
    <div>
      <CartProbe />
      <button
        type="button"
        onClick={() => addAndOpen(ITEM_L.productId, ITEM_L.name, ITEM_L.size, ITEM_L.unitPrice)}
      >
        Agregar talle L
      </button>
      <button
        type="button"
        onClick={() => addAndOpen(ITEM_M.productId, ITEM_M.name, ITEM_M.size, ITEM_M.unitPrice)}
      >
        Agregar talle M
      </button>
      <button type="button" onClick={() => setOpen(true)}>
        Abrir carrito
      </button>
    </div>
  );
}

function renderDrawer() {
  return render(
    <CartProvider>
      <DrawerHarness />
      <CartDrawer />
    </CartProvider>,
  );
}

const addL = "Agregar talle L";
const addM = "Agregar talle M";
const open = "Abrir carrito";

describe("CartDrawer (integration)", () => {
  it("opens on add-to-cart listing the item with name, size, price and quantity", async () => {
    const user = userEvent.setup();
    renderDrawer();

    await user.click(screen.getByRole("button", { name: addL }));

    const drawer = screen.getByRole("dialog", { name: "Carrito de compras" });
    const line = within(drawer).getByTestId("cart-line-1-L");
    expect(within(line).getByText(ITEM_L.name)).toBeInTheDocument();
    expect(within(line).getByText("Talle L")).toBeInTheDocument();
    expect(within(line).getByTestId("line-unit-1-L")).toHaveTextContent("$45.000,00");
    expect(within(line).getByTestId("line-qty-1-L")).toHaveTextContent("1");
    expect(screen.getByTestId("probe-open")).toHaveTextContent("true");
    expect(screen.getByTestId("cart-total")).toHaveTextContent("$45.000,00");
  });

  it("recomputes quantity and running total when incrementing from the drawer", async () => {
    const user = userEvent.setup();
    renderDrawer();

    await user.click(screen.getByRole("button", { name: addL }));
    await user.click(
      screen.getByRole("button", {
        name: `Aumentar cantidad de ${ITEM_L.name} (${ITEM_L.size})`,
      }),
    );

    expect(screen.getByTestId("line-qty-1-L")).toHaveTextContent("2");
    expect(screen.getByTestId("line-subtotal-1-L")).toHaveTextContent("$90.000,00");
    expect(screen.getByTestId("cart-total")).toHaveTextContent("$90.000,00");
  });

  it("closes via the backdrop without clearing the cart", async () => {
    const user = userEvent.setup();
    renderDrawer();
    await user.click(screen.getByRole("button", { name: addL }));
    await user.click(screen.getByRole("button", { name: addM }));

    await user.click(screen.getByTestId("cart-backdrop"));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    expect(screen.getByTestId("probe-open")).toHaveTextContent("false");
    expect(screen.getByTestId("probe-lines").textContent).toBe(
      JSON.stringify([
        { ...ITEM_L, quantity: 1 },
        { ...ITEM_M, quantity: 1 },
      ]),
    );

    // Reopening shows the same two lines and total — close never cleared them.
    await user.click(screen.getByRole("button", { name: open }));
    expect(screen.getByTestId("cart-lines").children).toHaveLength(2);
    expect(screen.getByTestId("cart-total")).toHaveTextContent("$90.000,00");
  });

  it("closes via the close control without clearing the cart", async () => {
    const user = userEvent.setup();
    renderDrawer();
    await user.click(screen.getByRole("button", { name: addL }));
    await user.click(screen.getByRole("button", { name: addM }));

    await user.click(screen.getByRole("button", { name: "Cerrar carrito" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    expect(screen.getByTestId("probe-open")).toHaveTextContent("false");
    expect(screen.getByTestId("probe-lines").textContent).toBe(
      JSON.stringify([
        { ...ITEM_L, quantity: 1 },
        { ...ITEM_M, quantity: 1 },
      ]),
    );

    await user.click(screen.getByRole("button", { name: open }));
    expect(screen.getByTestId("cart-lines").children).toHaveLength(2);
  });

  it("removes only the targeted line and recomputes the total", async () => {
    const user = userEvent.setup();
    renderDrawer();
    await user.click(screen.getByRole("button", { name: addL }));
    await user.click(screen.getByRole("button", { name: addM }));

    await user.click(screen.getByRole("button", { name: `Eliminar ${ITEM_L.name} (L)` }));

    expect(screen.queryByTestId("cart-line-1-L")).not.toBeInTheDocument();
    expect(screen.getByTestId("cart-line-1-M")).toBeInTheDocument();
    expect(screen.getByTestId("cart-total")).toHaveTextContent("$45.000,00");
  });

  it("shows the Spanish empty state with a disabled checkout that opens no link", async () => {
    const user = userEvent.setup();
    renderDrawer();

    await user.click(screen.getByRole("button", { name: open }));

    expect(screen.getByTestId("cart-empty")).toHaveTextContent(
      "Tu carrito está vacío. Agregá productos para empezar.",
    );
    const control = screen.getByTestId("checkout-control");
    expect(control).toBeDisabled();
    expect(screen.queryByRole("link", { name: /WhatsApp/ })).not.toBeInTheDocument();

    // Activating the disabled control opens no link and keeps the drawer open.
    await user.click(control);
    expect(control).toBeDisabled();
    expect(screen.queryByRole("link", { name: /WhatsApp/ })).not.toBeInTheDocument();
    expect(screen.getByTestId("probe-open")).toHaveTextContent("true");
  });

  it("spans the full width on mobile and a fixed panel on sm+ (class contract)", async () => {
    const user = userEvent.setup();
    renderDrawer();

    await user.click(screen.getByRole("button", { name: open }));

    // jsdom applies no CSS media queries: the Tailwind class contract IS the
    // assertion — w-full (mobile) + sm:w-[420px] (desktop panel).
    const drawer = screen.getByTestId("cart-drawer");
    expect(drawer).toHaveClass("w-full");
    expect(drawer).toHaveClass("sm:w-[420px]");
  });
});
