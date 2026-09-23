import { cartReducer, initialCartState } from "./cartReducer";
import { cartTotal } from "../utils/cart";

/** Helper: a validated line as produced by ADD_ITEM for product 1 / size L. */
function addLine(state = initialCartState) {
  return cartReducer(state, {
    type: "ADD_ITEM",
    payload: { productId: 1, name: "Camiseta Argentina Local 2024", size: "L", unitPrice: 45000 },
  });
}

describe("cartReducer state machine", () => {
  it("starts with zero lines and the drawer closed", () => {
    expect(initialCartState).toEqual({ lines: [], isOpen: false });
  });

  it("adds a new product+size line with quantity 1", () => {
    const state = addLine();

    expect(state.lines).toHaveLength(1);
    expect(state.lines[0]).toEqual({
      productId: 1,
      name: "Camiseta Argentina Local 2024",
      size: "L",
      unitPrice: 45000,
      quantity: 1,
    });
  });

  it("aggregates the same product+size into one line with quantity 2", () => {
    const state = addLine(addLine());

    expect(state.lines).toHaveLength(1);
    expect(state.lines[0].quantity).toBe(2);
    expect(cartTotal(state.lines)).toBe(90000);
  });

  it("creates a second line for the same product with a different size, leaving the existing line untouched", () => {
    const withL = addLine();
    const state = cartReducer(withL, {
      type: "ADD_ITEM",
      payload: { productId: 1, name: "Camiseta Argentina Local 2024", size: "M", unitPrice: 45000 },
    });

    expect(state.lines).toHaveLength(2);
    expect(state.lines[0]).toEqual(expect.objectContaining({ size: "L", quantity: 1 }));
    expect(state.lines[1]).toEqual(expect.objectContaining({ size: "M", quantity: 1 }));
  });

  it("round-trips increment then decrement back to quantity 1", () => {
    const incremented = cartReducer(addLine(), {
      type: "INCREMENT",
      payload: { productId: 1, size: "L" },
    });
    expect(incremented.lines[0].quantity).toBe(2);

    const restored = cartReducer(incremented, {
      type: "DECREMENT",
      payload: { productId: 1, size: "L" },
    });
    expect(restored.lines[0].quantity).toBe(1);
    expect(cartTotal(restored.lines)).toBe(45000);
  });

  it("removes the line when decrementing at quantity 1 (never reaches 0)", () => {
    const state = cartReducer(addLine(), {
      type: "DECREMENT",
      payload: { productId: 1, size: "L" },
    });

    expect(state.lines).toHaveLength(0);
    expect(cartTotal(state.lines)).toBe(0);
  });

  it("removes exactly the targeted line, leaving others unchanged", () => {
    const twoLines = cartReducer(addLine(), {
      type: "ADD_ITEM",
      payload: { productId: 1, name: "Camiseta Argentina Local 2024", size: "M", unitPrice: 45000 },
    });
    const state = cartReducer(twoLines, {
      type: "REMOVE_ITEM",
      payload: { productId: 1, size: "L" },
    });

    expect(state.lines).toHaveLength(1);
    expect(state.lines[0]).toEqual(expect.objectContaining({ size: "M" }));
  });

  it("keeps the cart when the drawer opens and closes (closing never clears)", () => {
    const added = addLine();
    const opened = cartReducer(added, { type: "SET_OPEN", payload: true });
    expect(opened.isOpen).toBe(true);
    expect(opened.lines).toEqual(added.lines);

    const closed = cartReducer(opened, { type: "SET_OPEN", payload: false });
    expect(closed.isOpen).toBe(false);
    expect(closed.lines).toEqual(added.lines);
  });

  it("clears every line with CLEAR without touching the open flag", () => {
    const populated = cartReducer(
      { ...addLine(), isOpen: true },
      { type: "SET_OPEN", payload: true },
    );
    const cleared = cartReducer(populated, { type: "CLEAR" });

    expect(cleared.lines).toEqual([]);
    expect(cleared.isOpen).toBe(true);
  });

  it("never stores totals in state — only lines and the open flag", () => {
    const state = addLine();

    expect(Object.keys(state).sort()).toEqual(["isOpen", "lines"]);
    expect(state.lines[0]).not.toHaveProperty("total");
  });
});
