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

  it("pans a zoomed image by dragging, clamped to the frame edges, and resets pan on zoom change", async () => {
    const user = userEvent.setup();
    render(<ImageCarousel images={singleImage} alt="Camiseta de Arquero" />);

    // Give the frame real dimensions so the clamp math works.
    const frame = screen.getByTestId("carousel-frame");
    frame.getBoundingClientRect = () =>
      ({
        width: 400,
        height: 500,
        top: 0,
        left: 0,
        right: 400,
        bottom: 500,
        x: 0,
        y: 0,
        toJSON: jest.fn(),
      }) as DOMRect;

    await user.click(screen.getByRole("button", { name: "Ampliar imagen" }));

    // Drag a zoomed (1.6×) image. Max X = 400*0.6/2 = 120, max Y = 500*0.6/2 = 150.
    const stage = screen.getByAltText("Camiseta de Arquero - foto 1");
    fireEvent.pointerDown(stage, { pointerId: 1, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(stage, { pointerId: 1, clientX: 160, clientY: 130 });
    fireEvent.pointerUp(stage, { pointerId: 1, clientX: 160, clientY: 130 });

    const staged = screen.getByAltText("Camiseta de Arquero - foto 1").closest("[data-pan-x]")!;
    expect(staged).toHaveAttribute("data-pan-x", "60");
    expect(staged).toHaveAttribute("data-pan-y", "30");

    // Overshooting clamps to the frame edge (max 120).
    fireEvent.pointerDown(stage, { pointerId: 2, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(stage, { pointerId: 2, clientX: 500, clientY: 0 });
    fireEvent.pointerUp(stage, { pointerId: 2, clientX: 500, clientY: 0 });

    expect(staged).toHaveAttribute("data-pan-x", "120");

    // Cycling zoom resets the pan to center.
    await user.click(screen.getByRole("button", { name: "Ampliar más" }));
    expect(staged).toHaveAttribute("data-pan-x", "0");
    expect(staged).toHaveAttribute("data-pan-y", "0");
  });

  it("does not start a pan while the image is not zoomed", async () => {
    const user = userEvent.setup();
    render(<ImageCarousel images={singleImage} alt="Camiseta de Arquero" />);

    const stage = screen.getByAltText("Camiseta de Arquero - foto 1");
    fireEvent.pointerDown(stage, { pointerId: 1, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(stage, { pointerId: 1, clientX: 260, clientY: 200 });
    fireEvent.pointerUp(stage, { pointerId: 1, clientX: 260, clientY: 200 });

    const staged = screen.getByAltText("Camiseta de Arquero - foto 1").closest("[data-pan-x]")!;
    expect(staged).toHaveAttribute("data-pan-x", "0");
    expect(staged).toHaveAttribute("data-pan-y", "0");
    expect(screen.queryByRole("button", { name: "Imagen anterior" })).not.toBeInTheDocument();
    // Still usable on top of a non-zoomed image.
    await user.click(screen.getByRole("button", { name: "Ampliar imagen" }));
    expect(document.querySelector("[data-zoomed]")).not.toBeNull();
  });

  it("cycles through the three zoom levels and back on a single-image product", async () => {
    const user = userEvent.setup();
    render(<ImageCarousel images={singleImage} alt="Camiseta de Arquero" />);

    expect(screen.getByAltText("Camiseta de Arquero - foto 1")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Imagen siguiente" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Imagen anterior" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Ver foto/ })).not.toBeInTheDocument();

    // Level 1: standard zoom (1.6×).
    const zoom = screen.getByRole("button", { name: "Ampliar imagen" });
    await user.click(zoom);
    expect(screen.getByRole("button", { name: "Ampliar más" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Ampliar más" })).toHaveTextContent("1.6×");
    expect(document.querySelector("[data-zoomed]")).not.toBeNull();

    // Level 2: closer zoom (2.2×).
    await user.click(screen.getByRole("button", { name: "Ampliar más" }));
    expect(screen.getByRole("button", { name: "Ampliar más" })).toHaveTextContent("2.2×");
    expect(document.querySelector("[data-zoomed]")).not.toBeNull();

    // Level 3: strongest zoom (3×).
    await user.click(screen.getByRole("button", { name: "Ampliar más" }));
    expect(screen.getByRole("button", { name: "Quitar zoom" })).toHaveTextContent("3×");
    expect(document.querySelector("[data-zoomed]")).not.toBeNull();

    // Back to normal.
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
