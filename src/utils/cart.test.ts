import { cartLineKey, cartTotal } from "./cart";

describe("cartLineKey", () => {
  it("builds the identity from product id and canonical size", () => {
    expect(cartLineKey({ productId: 1, size: "L" })).toBe("1:L");
  });

  it("distinguishes different sizes of the same product", () => {
    expect(cartLineKey({ productId: 1, size: "L" })).not.toBe(
      cartLineKey({ productId: 1, size: "M" }),
    );
  });
});

describe("cartTotal", () => {
  it("sums unit price × quantity across multiple lines", () => {
    const lines = [
      { productId: 1, name: "Camiseta A", size: "L", unitPrice: 45000, quantity: 2 },
      { productId: 2, name: "Camiseta B", size: "NIÑO-8", unitPrice: 40000, quantity: 1 },
    ];

    expect(cartTotal(lines)).toBe(130000);
  });

  it("returns zero for an empty cart", () => {
    expect(cartTotal([])).toBe(0);
  });

  it("scales with quantity, not line count", () => {
    const lines = [
      { productId: 1, name: "Camiseta A", size: "XL", unitPrice: 45000, quantity: 3 },
      { productId: 2, name: "Camiseta B", size: "S", unitPrice: 45000, quantity: 1 },
    ];

    expect(cartTotal(lines)).toBe(180000);
  });
});
