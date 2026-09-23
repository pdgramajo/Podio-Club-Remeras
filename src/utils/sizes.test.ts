import { isCanonicalSize, splitSizes } from "./sizes";

describe("splitSizes", () => {
  it("splits adults and kids preserving order", () => {
    const { adults, kids } = splitSizes(["S", "M", "L", "XL", "XXL", "NIÑO-6", "NIÑO-8"]);
    expect(adults).toEqual(["S", "M", "L", "XL", "XXL"]);
    expect(kids).toEqual(["NIÑO-6", "NIÑO-8"]);
  });

  it("returns an empty kids group for an adult-only product", () => {
    const { adults, kids } = splitSizes(["M", "XL"]);
    expect(adults).toEqual(["M", "XL"]);
    expect(kids).toEqual([]);
  });

  it("returns an empty adults group for a kids-only product", () => {
    const { adults, kids } = splitSizes(["NIÑO-6", "NIÑO-8"]);
    expect(adults).toEqual([]);
    expect(kids).toEqual(["NIÑO-6", "NIÑO-8"]);
  });
});

describe("isCanonicalSize", () => {
  it.each(["S", "M", "L", "XL", "XXL", "NIÑO-6", "NIÑO-12", "NIÑO-100"])(
    "accepts the canonical size %s",
    (size) => {
      expect(isCanonicalSize(size)).toBe(true);
    },
  );

  it.each(["UNICO", "M-42", "s", "NIÑO-0", "NIÑO-", "niño-8", "", "L "])(
    "rejects the non-canonical size %s",
    (size) => {
      expect(isCanonicalSize(size)).toBe(false);
    },
  );
});
