import { render } from "@testing-library/react";
import { useDocumentHead, type HeadData } from "./useDocumentHead";

const ROUTE_A: HeadData = {
  title: "Catálogo — Podio Club",
  description: "Remeras de fútbol réplica. Mirá el catálogo y pedí por WhatsApp.",
};

const ROUTE_B: HeadData = {
  title: "Camiseta Argentina Local 2024",
  description: "Réplica local con cuello redondo y escudo bordado.",
  image: "http://localhost/images/products/1-1.jpg",
  url: "/producto/1",
};

function HeadHarness({ data }: { data: HeadData | null }) {
  useDocumentHead(data);
  return <div>harness</div>;
}

function meta(selector: string): HTMLMetaElement | null {
  return document.head.querySelector(selector);
}

describe("useDocumentHead", () => {
  beforeEach(() => {
    // Fresh empty head per test — owned route tags from previous tests are
    // cleaned up by the hook's unmount effect, and this makes assertions
    // independent of any earlier document state.
    document.head.innerHTML = "";
    document.title = "";
  });

  it("sets the title and description for a route", () => {
    render(<HeadHarness data={ROUTE_A} />);

    expect(document.title).toBe("Catálogo — Podio Club");
    expect(meta('meta[name="description"][data-head-route]')?.getAttribute("content")).toBe(
      "Remeras de fútbol réplica. Mirá el catálogo y pedí por WhatsApp.",
    );
  });

  it("replaces route A tags when navigating to route B — no tag from A remains", () => {
    const { rerender } = render(<HeadHarness data={ROUTE_A} />);
    rerender(<HeadHarness data={ROUTE_B} />);

    expect(document.title).toBe("Camiseta Argentina Local 2024");
    expect(meta('meta[name="description"][data-head-route]')?.getAttribute("content")).toBe(
      "Réplica local con cuello redondo y escudo bordado.",
    );

    const owned = Array.from(document.head.querySelectorAll("[data-head-route]"));
    expect(owned.every((el) => !el.outerHTML.includes("Catálogo — Podio Club"))).toBe(true);
    expect(
      meta('meta[name="description"][data-head-route]')?.getAttribute("content"),
    ).not.toContain("Mirá el catálogo");
  });

  it("emits the rich OG and Twitter families for a product route", () => {
    render(<HeadHarness data={ROUTE_B} />);

    expect(meta('meta[property="og:title"]')?.getAttribute("content")).toBe(
      "Camiseta Argentina Local 2024",
    );
    expect(meta('meta[property="og:description"]')?.getAttribute("content")).toBe(
      "Réplica local con cuello redondo y escudo bordado.",
    );
    expect(meta('meta[property="og:image"]')?.getAttribute("content")).toBe(
      "http://localhost/images/products/1-1.jpg",
    );
    expect(meta('meta[property="og:url"]')?.getAttribute("content")).toBe("/producto/1");
    expect(meta('meta[name="twitter:title"]')?.getAttribute("content")).toBe(
      "Camiseta Argentina Local 2024",
    );
    expect(meta('meta[name="twitter:description"]')?.getAttribute("content")).toBe(
      "Réplica local con cuello redondo y escudo bordado.",
    );
    expect(meta('meta[name="twitter:image"]')?.getAttribute("content")).toBe(
      "http://localhost/images/products/1-1.jpg",
    );
    // Every managed tag carries the route marker so cleanup can find it.
    const owned = Array.from(document.head.querySelectorAll("[data-head-route]"));
    expect(owned.length).toBeGreaterThanOrEqual(7);
  });

  it("removes the previous route's og:url when the next route provides none", () => {
    const { rerender } = render(<HeadHarness data={ROUTE_B} />);
    expect(meta('meta[property="og:url"]')).not.toBeNull();

    rerender(<HeadHarness data={ROUTE_A} />);

    expect(meta('meta[property="og:url"]')).toBeNull();
  });

  it("clears route tags and restores the default title when data is null", () => {
    const { rerender } = render(<HeadHarness data={ROUTE_B} />);
    rerender(<HeadHarness data={null} />);

    expect(document.head.querySelectorAll("[data-head-route]")).toHaveLength(0);
    expect(document.title).toBe("Podio Club — Remeras de fútbol");
  });

  it("restores claimed static defaults on unmount", () => {
    const staticDescription = document.createElement("meta");
    staticDescription.name = "description";
    staticDescription.content = "Default site description";
    document.head.appendChild(staticDescription);

    const { unmount } = render(<HeadHarness data={ROUTE_A} />);
    // The static default was claimed (removed) and replaced by the route tag.
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(meta('meta[name="description"][data-head-route]')).not.toBeNull();

    unmount();

    expect(meta('meta[name="description"][data-head-route]')).toBeNull();
    expect(meta('meta[name="description"]')?.getAttribute("content")).toBe(
      "Default site description",
    );
  });
});
