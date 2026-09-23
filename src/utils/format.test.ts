import { formatARS } from "./format";

describe("formatARS", () => {
  it("formats a typical ARS price with es-AR separators", () => {
    expect(formatARS(45000)).toBe("$45.000,00");
  });

  it("formats a seven-digit price", () => {
    expect(formatARS(1250000)).toBe("$1.250.000,00");
  });
});
