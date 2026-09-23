import { getProductById, products, validateProducts } from "./products";

/** Minimal fully-valid catalog entry; tests override one field at a time. */
const baseEntry = {
  id: 1,
  nombre: "Camiseta Titular Celeste 2024",
  descripcion_corta: "Réplica local con cuello redondo.",
  descripcion_larga: "Descripción larga de la camiseta titular.",
  tipo_tela: "dry-fit",
  numero_espalda: true,
  tipo: "jugador",
  imagenes: ["/images/products/1-1.jpg", "/images/products/1-2.jpg"],
  precio: 45000,
  talles: ["S", "M", "L", "XL", "XXL"],
} as const;

function makeEntry(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return { ...baseEntry, ...overrides };
}

describe("validateProducts", () => {
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("accepts a fully valid entry with every field in its declared type", () => {
    const [product] = validateProducts([
      makeEntry({ numero_espalda: 10, talles: ["S", "M", "L", "XL", "XXL", "NIÑO-6", "NIÑO-8"] }),
    ]);

    expect(product).toMatchObject({
      id: 1,
      nombre: "Camiseta Titular Celeste 2024",
      descripcion_corta: expect.any(String),
      descripcion_larga: expect.any(String),
      tipo_tela: "dry-fit",
      tipo: "jugador",
      imagenes: ["/images/products/1-1.jpg", "/images/products/1-2.jpg"],
      precio: 45000,
      talles: ["S", "M", "L", "XL", "XXL", "NIÑO-6", "NIÑO-8"],
    });
    expect(product.numero_espalda).toBe(10);
    expect(typeof product.numero_espalda).toBe("number");
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it.each([
    ["a negative precio", makeEntry({ precio: -1 })],
    ["an empty imagenes array", makeEntry({ imagenes: [] })],
    ["a missing nombre", makeEntry({ nombre: undefined })],
    ["a missing descripcion_larga", makeEntry({ descripcion_larga: "" })],
    ["a tipo outside the set", makeEntry({ tipo: "arquero" })],
    ["a precio as string", makeEntry({ precio: "45000" })],
    ["an id as string", makeEntry({ id: "1" })],
    ["an id of zero", makeEntry({ id: 0 })],
    ["an empty talles array", makeEntry({ talles: [] })],
    ["a numero_espalda as string", makeEntry({ numero_espalda: "10" })],
    ["a numero_espalda of zero", makeEntry({ numero_espalda: 0 })],
  ])("drops an entry with %s and warns without crashing", (_label, entry) => {
    const result = validateProducts([entry]);

    expect(result).toHaveLength(0);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("keeps the first occurrence of a duplicate id and warns about the second", () => {
    const result = validateProducts([
      makeEntry({ id: 5, nombre: "Primera" }),
      makeEntry({ id: 5, nombre: "Duplicada" }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].nombre).toBe("Primera");
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it("accepts true and a positive integer for numero_espalda, preserving each without conversion", () => {
    const result = validateProducts([
      makeEntry({ id: 1, numero_espalda: true }),
      makeEntry({ id: 2, numero_espalda: 10 }),
    ]);

    expect(result).toHaveLength(2);
    expect(result[0].numero_espalda).toBe(true);
    expect(typeof result[0].numero_espalda).toBe("boolean");
    expect(result[1].numero_espalda).toBe(10);
    expect(typeof result[1].numero_espalda).toBe("number");
  });

  it.each(["UNICO", "M-42", "s"])(
    "rejects a product whose talles contains the non-canonical size %s",
    (size) => {
      const result = validateProducts([makeEntry({ talles: ["M", size] })]);

      expect(result).toHaveLength(0);
      expect(warnSpy).toHaveBeenCalledTimes(1);
    },
  );

  it.each([{}, "not-an-array", 42, null])(
    "returns the empty catalog with a descriptive error when the root is not an array",
    (root) => {
      const result = validateProducts(root);

      expect(result).toEqual([]);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).not.toHaveBeenCalled();
    },
  );

  it("returns 9 valid products when 1 of 10 entries is invalid", () => {
    const ten = Array.from({ length: 10 }, (_, i) =>
      makeEntry({ id: i + 1, numero_espalda: i === 3 ? -5 : true }),
    );

    const result = validateProducts(ten);

    expect(result).toHaveLength(9);
    expect(result.some((p) => p.id === 4)).toBe(false);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});

describe("the bundled products datasource", () => {
  it("exposes all 10 seeded products with unique ids", () => {
    expect(products).toHaveLength(10);
    const ids = products.map((p) => p.id);
    expect(new Set(ids).size).toBe(10);
    for (const product of products) {
      expect(product.nombre.length).toBeGreaterThan(0);
      expect(product.imagenes.length).toBeGreaterThan(0);
    }
  });

  it("resolves known ids and returns undefined for unknown ids", () => {
    expect(getProductById(3)?.id).toBe(3);
    expect(getProductById(999)).toBeUndefined();
  });
});
