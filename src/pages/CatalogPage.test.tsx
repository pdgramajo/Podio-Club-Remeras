import { jest } from "@jest/globals";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { CartProvider } from "../context/CartContext";
import * as productData from "../data/products";
import { CatalogPage } from "../pages/CatalogPage";
import { ProductDetailPage } from "../pages/ProductDetailPage";
import type { Product } from "../types/product";
import { formatARS } from "../utils/format";

/**
 * The catalog modules read the validated singleton at import time, so the
 * empty-state scenario needs a module mock: this replaces ../data/products
 * with a live-getter wrapper over a mutable array. Tests reset the contents
 * per case; the app code reads `.products` and `getProductById` exactly like
 * the real module.
 */
jest.mock("../data/products", () => {
  const actual = jest.requireActual<typeof import("../data/products")>("../data/products");
  const raw: unknown = jest.requireActual("../data/products.json");
  const mock = { products: actual.validateProducts(raw) };

  return {
    get products(): Product[] {
      return mock.products;
    },
    getProductById: (id: number): Product | undefined =>
      mock.products.find((product) => product.id === id),
    __setProducts: (items: Product[]): void => {
      mock.products = items;
    },
  };
});

const mockProducts = productData as typeof productData & {
  __setProducts: (items: Product[]) => void;
};

/** The validated 10-product catalog as authored — captured before any mutation. */
const realCatalog: Product[] = productData.products;

function renderCatalogRoute() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <CartProvider>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/producto/:id" element={<ProductDetailPage />} />
        </Routes>
      </CartProvider>
    </MemoryRouter>,
  );
}

describe("CatalogPage (integration)", () => {
  beforeEach(() => {
    mockProducts.__setProducts([...realCatalog]);
  });

  it("renders every product from the datasource with its card fields", () => {
    renderCatalogRoute();

    const cards = screen.getAllByTestId("product-card");
    expect(cards).toHaveLength(10);
    expect(realCatalog).toHaveLength(10);

    for (const product of realCatalog) {
      const card = cards[realCatalog.indexOf(product)];
      expect(within(card).getByAltText(product.nombre)).toBeInTheDocument();
      expect(within(card).getByText(product.nombre)).toBeInTheDocument();
      expect(within(card).getByText(product.descripcion_corta)).toBeInTheDocument();
      expect(within(card).getByText(formatARS(product.precio))).toBeInTheDocument();
    }
  });

  it("navigates to the product detail route when a card is clicked", async () => {
    const user = userEvent.setup();
    renderCatalogRoute();

    const thirdCard = screen.getAllByTestId("product-card")[2];
    const thirdProduct = realCatalog[2];
    expect(thirdProduct.id).toBe(3);

    await user.click(thirdCard);

    expect(await screen.findByRole("heading", { name: thirdProduct.nombre })).toBeInTheDocument();
    expect(screen.getByText(thirdProduct.descripcion_larga)).toBeInTheDocument();
    expect(document.title).toBe(thirdProduct.nombre);
  });

  it("shows the Spanish empty state when the products module yields no products", () => {
    mockProducts.__setProducts([]);
    renderCatalogRoute();

    expect(
      screen.getByText("El catálogo está vacío por ahora. Vuelve pronto."),
    ).toBeInTheDocument();
    expect(screen.queryAllByTestId("product-card")).toHaveLength(0);
    expect(screen.getByRole("heading", { name: "Catálogo" })).toBeInTheDocument();
  });
});
