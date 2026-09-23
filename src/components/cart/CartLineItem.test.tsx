import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { CartLine } from "../../types/product";
import { formatARS } from "../../utils/format";
import { CartLineItem } from "./CartLineItem";

const line: CartLine = {
  productId: 1,
  name: "Camiseta Argentina Local 2024",
  size: "L",
  unitPrice: 45000,
  quantity: 2,
};

type Callbacks = { onIncrement: () => void; onDecrement: () => void; onRemove: () => void };

function renderLine(overrides: Partial<Callbacks>) {
  return render(
    <ul>
      <CartLineItem
        line={line}
        onIncrement={jest.fn()}
        onDecrement={jest.fn()}
        onRemove={jest.fn()}
        {...overrides}
      />
    </ul>,
  );
}

describe("CartLineItem", () => {
  it("renders name, size badge, unit price, quantity and subtotal", () => {
    renderLine({});

    expect(screen.getByText(line.name)).toBeInTheDocument();
    expect(screen.getByText("Talle L")).toBeInTheDocument();
    expect(screen.getByTestId("line-unit-1-L")).toHaveTextContent(formatARS(line.unitPrice));
    expect(screen.getByTestId("line-qty-1-L")).toHaveTextContent("2");
    // Line subtotal = unit price × quantity, formatted with the shared formatter.
    expect(screen.getByTestId("line-subtotal-1-L")).toHaveTextContent(
      formatARS(line.unitPrice * line.quantity),
    );
  });

  it("fires the increment control with the line identity", async () => {
    const user = userEvent.setup();
    const onIncrement = jest.fn();
    renderLine({ onIncrement });

    await user.click(
      screen.getByRole("button", { name: `Aumentar cantidad de ${line.name} (${line.size})` }),
    );

    expect(onIncrement).toHaveBeenCalledWith(line.productId, line.size);
  });

  it("fires the decrement control with the line identity", async () => {
    const user = userEvent.setup();
    const onDecrement = jest.fn();
    renderLine({ onDecrement });

    await user.click(
      screen.getByRole("button", { name: `Reducir cantidad de ${line.name} (${line.size})` }),
    );

    expect(onDecrement).toHaveBeenCalledWith(line.productId, line.size);
  });

  it("fires the remove control with the line identity", async () => {
    const user = userEvent.setup();
    const onRemove = jest.fn();
    renderLine({ onRemove });

    await user.click(screen.getByRole("button", { name: `Eliminar ${line.name} (${line.size})` }));

    expect(onRemove).toHaveBeenCalledWith(line.productId, line.size);
  });
});
