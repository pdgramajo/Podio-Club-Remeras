import { BASE_URL } from "./viteEnv";

/**
 * BASE_URL-aware asset helpers (ci-deployment): every product image path in
 * the JSON keeps its authored root-relative form ("/images/products/1-1.jpg")
 * and is resolved through these helpers, so both the deployed site (GH Pages
 * subpath) and local dev (root) produce correct URLs with one data contract.
 * Absolute URLs (e.g. https://placehold.co/... placeholder images) pass
 * through untouched — the base is only applied to relative paths.
 */
export function resolveAssetPath(path: string, baseUrl: string = BASE_URL): string {
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(path)) {
    return path;
  }
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return `${base}${path.replace(/^\/+/, "")}`;
}

export function resolveAssetUrl(path: string, baseUrl: string = BASE_URL): string {
  const assetPath = resolveAssetPath(path, baseUrl);
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(assetPath)) {
    return assetPath;
  }
  return new URL(assetPath, window.location.href).href;
}
