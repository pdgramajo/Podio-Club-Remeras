import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { CartProvider, useCart } from "../../context/CartContext";
import { Header } from "./Header";

const ITEM = {
  productId: 1,
  name: "Camiseta Argentina Local 2024",
  size: "L",
  unitPrice: 45000,
};

/** Dispatches real cart adds so the header badge reflects actual state. */
function HeaderHarness() {
  const { addItem } = useCart();
  return (
    <div>
      <Header />
      <button
        type="button"
        onClick={() => addItem(ITEM.productId, ITEM.name, ITEM.size, ITEM.unitPrice)}
      >
        Agregar item
      </button>
    </div>
  );
}

function renderHeader() {
  return render(
    <MemoryRouter>
      <CartProvider>
        <HeaderHarness />
      </CartProvider>
    </MemoryRouter>,
  );
}

describe("Header (integration)", () => {
  it("renders an Inicio link pointing to the home route", () => {
    renderHeader();

    expect(screen.getByRole("link", { name: "Inicio" })).toHaveAttribute("href", "/");
  });

  it("hides the badge on an empty cart and shows the count after adding", async () => {
    const user = userEvent.setup();
    renderHeader();

    expect(screen.queryByTestId("cart-badge")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Agregar item" }));

    expect(screen.getByTestId("cart-badge")).toHaveTextContent("1");
  });
});
