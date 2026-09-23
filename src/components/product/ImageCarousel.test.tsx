import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImageCarousel } from "./ImageCarousel";

const threeImages = [
  "/images/products/1-1.jpg",
  "/images/products/1-2.jpg",
  "/images/products/1-3.jpg",
];
const singleImage = ["/images/products/5-1.jpg"];

describe("ImageCarousel", () => {
  it("selects the first image on initial render", () => {
    render(<ImageCarousel images={threeImages} alt="Camiseta Titular" />);

    expect(screen.getByAltText("Camiseta Titular - foto 1")).toBeInTheDocument();
  });

  it("navigates forward and backward with animated transitions", async () => {
    const user = userEvent.setup();
    render(<ImageCarousel images={threeImages} alt="Camiseta Titular" />);

    await user.click(screen.getByRole("button", { name: "Imagen siguiente" }));
    await waitFor(() =>
      expect(screen.getByAltText("Camiseta Titular - foto 2")).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "Imagen anterior" }));
    await waitFor(() =>
      expect(screen.getByAltText("Camiseta Titular - foto 1")).toBeInTheDocument(),
    );
  });

  it("jumps to an image via its thumbnail", async () => {
    const user = userEvent.setup();
    render(<ImageCarousel images={threeImages} alt="Camiseta Titular" />);

    await user.click(screen.getByRole("button", { name: "Ver foto 3" }));

    await waitFor(() =>
      expect(screen.getByAltText("Camiseta Titular - foto 3")).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: "Ver foto 3" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("renders a single-image product without navigation or thumbnails, still zoomable", async () => {
    const user = userEvent.setup();
    render(<ImageCarousel images={singleImage} alt="Camiseta de Arquero" />);

    expect(screen.getByAltText("Camiseta de Arquero - foto 1")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Imagen siguiente" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Imagen anterior" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Ver foto/ })).not.toBeInTheDocument();

    const zoom = screen.getByRole("button", { name: "Ampliar imagen" });
    await user.click(zoom);
    expect(screen.getByRole("button", { name: "Quitar zoom" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(document.querySelector("[data-zoomed]")).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Quitar zoom" }));
    expect(screen.getByRole("button", { name: "Ampliar imagen" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(document.querySelector("[data-zoomed]")).toBeNull();
  });

  it("shows the Spanish placeholder in a broken slot while the rest stays usable", async () => {
    const user = userEvent.setup();
    render(<ImageCarousel images={threeImages} alt="Camiseta Titular" />);

    const broken = screen.getByAltText("Camiseta Titular - foto 1");
    fireEvent.error(broken);

    expect(screen.getByText("Imagen no disponible")).toBeInTheDocument();

    // The other slots keep working: thumbnails still render and navigate.
    await user.click(screen.getByRole("button", { name: "Ver foto 2" }));
    await waitFor(() =>
      expect(screen.getByAltText("Camiseta Titular - foto 2")).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: "Imagen siguiente" })).toBeInTheDocument();
  });
});
