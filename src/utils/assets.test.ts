import { resolveAssetPath, resolveAssetUrl } from "./assets";

describe("resolveAssetPath", () => {
  it("prefixes an explicit base URL, collapsing double slashes", () => {
    expect(resolveAssetPath("/images/products/1-1.jpg", "/podio-club-landing/")).toBe(
      "/podio-club-landing/images/products/1-1.jpg",
    );
  });

  it("normalizes a base URL without a trailing slash", () => {
    expect(resolveAssetPath("/images/products/1-1.jpg", "/podio-club-landing")).toBe(
      "/podio-club-landing/images/products/1-1.jpg",
    );
  });

  it("defaults to the deploy base (identity under the root /)", () => {
    expect(resolveAssetPath("/images/products/1-1.jpg")).toBe("/images/products/1-1.jpg");
  });
});

describe("resolveAssetUrl", () => {
  it("builds an absolute URL for og:image from an explicit absolute base", () => {
    expect(resolveAssetUrl("/images/products/1-1.jpg", "https://podio.example/repo/")).toBe(
      "https://podio.example/repo/images/products/1-1.jpg",
    );
  });

  it("builds an absolute URL from the deploy base and the current origin", () => {
    const url = resolveAssetUrl("/images/products/1-1.jpg");
    expect(url).toBe("http://localhost/images/products/1-1.jpg");
  });
});
