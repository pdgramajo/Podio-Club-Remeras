import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { CartProvider, useCart } from "../context/CartContext";
import { products } from "../data/products";
import { NOT_FOUND_HEAD } from "../hooks/headData";
import { ProductDetailPage } from "../pages/ProductDetailPage";
import { resolveAssetUrl } from "../utils/assets";
import { formatARS } from "../utils/format";
import { splitSizes } from "../utils/sizes";

/** Renders the real cart state into the DOM so tests can assert dispatches. */
function CartProbe() {
  const { lines, isOpen } = useCart();
  return (
    <div data-testid="cart-probe">
      <span data-testid="probe-lines">{JSON.stringify(lines)}</span>
      <span data-testid="probe-open">{String(isOpen)}</span>
    </div>
  );
}

function renderDetail(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <CartProvider>
        <CartProbe />
        <Routes>
          <Route path="/producto/:id" element={<ProductDetailPage />} />
        </Routes>
      </CartProvider>
    </MemoryRouter>,
  );
}

describe("ProductDetailPage (integration)", () => {
  const product = products.find((entry) => entry.id === 1);
  if (product === undefined) {
    throw new Error("test fixture: product id 1 must exist in products.json");
  }
  const { adults, kids } = splitSizes(product.talles);

  it("renders the full detail for a known id", () => {
    renderDetail("/producto/1");

    expect(screen.getByRole("heading", { name: product.nombre })).toBeInTheDocument();
    expect(screen.getByText(formatARS(product.precio))).toBeInTheDocument();
    expect(screen.getByText(product.descripcion_larga)).toBeInTheDocument();
    expect(screen.getByTestId("image-carousel")).toBeInTheDocument();

    if (adults.length > 0) {
      expect(screen.getByText("Adulto")).toBeInTheDocument();
    }
    if (kids.length > 0) {
      expect(screen.getByText("Niño")).toBeInTheDocument();
    }

    const addControl = screen.getByRole("button", { name: "Añadir al carrito" });
    expect(addControl).toBeDisabled();
    expect(screen.getByTestId("size-hint")).toHaveTextContent("Elegí un talle");

    // Rich product head (site-seo "Rich product share tags"): both the og:
    // and twitter: families are present in the rendered DOM, derived from
    // the product — title = nombre, description = descripcion_corta, image =
    // first image resolved to an absolute URL via resolveAssetUrl, url = the
    // /producto/:id route.
    expect(document.title).toBe(product.nombre);
    const metaContent = (selector: string): string | null | undefined =>
      document.head.querySelector(selector)?.getAttribute("content");
    const firstImage = resolveAssetUrl(product.imagenes[0]);

    expect(metaContent('meta[property="og:title"]')).toBe(product.nombre);
    expect(metaContent('meta[property="og:description"]')).toBe(product.descripcion_corta);
    expect(metaContent('meta[property="og:image"]')).toBe(firstImage);
    expect(metaContent('meta[property="og:url"]')).toBe("/producto/1");

    expect(metaContent('meta[name="twitter:title"]')).toBe(product.nombre);
    expect(metaContent('meta[name="twitter:description"]')).toBe(product.descripcion_corta);
    expect(metaContent('meta[name="twitter:image"]')).toBe(firstImage);
  });

  it("falls back to the not-found page with its own head for an unknown id", () => {
    renderDetail("/producto/999");

    expect(screen.getByRole("heading", { name: "Página no encontrada" })).toBeInTheDocument();
    const backLink = screen.getByRole("link", { name: "Volver al catálogo" });
    expect(backLink).toHaveAttribute("href", "/");

    expect(document.title).toBe(NOT_FOUND_HEAD.title);
    const description = document.head.querySelector('meta[name="description"]');
    expect(description?.getAttribute("content")).toBe(NOT_FOUND_HEAD.description);
  });

  it("blocks adding to cart until a size is selected", async () => {
    const user = userEvent.setup();
    renderDetail("/producto/1");

    const addControl = screen.getByRole("button", { name: "Añadir al carrito" });
    expect(addControl).toBeDisabled();

    await user.click(addControl);

    expect(screen.getByTestId("probe-lines").textContent).toBe("[]");
    expect(screen.getByTestId("probe-open").textContent).toBe("false");
    expect(screen.getByTestId("size-hint")).toBeInTheDocument();
  });

  it("adds the product with the selected size and opens the cart", async () => {
    const user = userEvent.setup();
    renderDetail("/producto/1");

    const addControl = screen.getByRole("button", { name: "Añadir al carrito" });
    await user.click(screen.getByRole("button", { name: "L" }));

    expect(addControl).toBeEnabled();
    expect(screen.queryByTestId("size-hint")).not.toBeInTheDocument();

    await user.click(addControl);

    const expectedLine = {
      productId: 1,
      name: product.nombre,
      size: "L",
      unitPrice: product.precio,
      quantity: 1,
    };
    expect(screen.getByTestId("probe-lines").textContent).toBe(JSON.stringify([expectedLine]));
    expect(screen.getByTestId("probe-open").textContent).toBe("true");
  });
});
