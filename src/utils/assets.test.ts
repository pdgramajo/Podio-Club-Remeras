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

  it("passes an absolute URL through untouched (placeholder images)", () => {
    expect(
      resolveAssetPath(
        "https://placehold.co/800x1000/A5811E/FAF9F6?text=Podio+Club",
        "/podio-club-landing/",
      ),
    ).toBe("https://placehold.co/800x1000/A5811E/FAF9F6?text=Podio+Club");
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

  it("keeps an absolute input untouched as an absolute URL", () => {
    expect(resolveAssetUrl("https://placehold.co/800x1000/A5811E/FAF9F6?text=Podio+Club")).toBe(
      "https://placehold.co/800x1000/A5811E/FAF9F6?text=Podio+Club",
    );
  });
});
