# Site SEO Specification

## Purpose

Defines the search-engine and social-sharing metadata contract: site-wide defaults in the document shell, per-route dynamic head updates for the catalog and product detail pages, and OpenGraph/Twitter card output. The site is a client-rendered SPA on GitHub Pages with no SSR, so crawler fidelity expectations are scoped to what the rendered document can provide.

## Requirements

### Requirement: Site-wide default metadata

The application shell MUST declare site-wide metadata present before and independent of any route: `<html lang="es">`, a site-level `<title>`, a site-level `<meta name="description">`, default OpenGraph tags (`og:type` = `website`, `og:locale` = `es_AR`, `og:site_name`, and a site-level `og:image`), and a default Twitter card tag (`twitter:card` = `summary_large_image`). These MUST be present in the initial HTML document served by the deployed site.

#### Scenario: Initial document metadata

- GIVEN the deployed site's initial HTML document
- WHEN the document is inspected
- THEN the root element declares `lang="es"`
- AND the document has a site title, a description meta, the default OpenGraph tags, and the Twitter card tag

### Requirement: Per-route head management

The system MUST update the document head on client-side navigation so each route declares its own `title` and `description`:

- Catalog route `/`: catalog title and catalog description.
- Product detail route `/producto/:id`: `title` = product `nombre`, `description` = product `descripcion_corta`.
- Not-found route: a not-found title and description.

Head updates MUST run on every route change, both on direct load and on SPA navigation, and MUST replace stale tags from the previous route so no route shows another route's metadata.

#### Scenario: Product detail metadata

- GIVEN a product with `nombre` "Camiseta Argentina Local 2024" and a short description
- WHEN the user navigates to `/producto/1`
- THEN the document title equals the product name
- AND the description meta equals the product's short description

#### Scenario: No stale metadata between routes

- GIVEN the user navigated from `/producto/1` to `/producto/2`
- WHEN the detail page for product `2` mounts
- THEN the `title` and `description` tags reflect product `2`
- AND no tag from product `1` remains in the head

#### Scenario: Not-found head

- GIVEN a route for an unknown product id
- WHEN the not-found page renders
- THEN the title and description reflect the not-found state in Spanish

### Requirement: Product-level OpenGraph and Twitter tags

For each product detail route, the system MUST emit OpenGraph tags derived from the product: `og:title` (product name), `og:description` (short description), `og:image` (first entry of `imagenes`), `og:url` (the shareable route URL), plus matching Twitter tags (`twitter:title`, `twitter:description`, `twitter:image`). Both tag families MUST be present in the rendered DOM for the route. `og:image` values SHOULD be absolute URLs when the site base URL is configured, falling back to the relative image path otherwise.

#### Scenario: Rich product share tags

- GIVEN a product with name, short description, and `imagenes` whose first entry is `/images/products/1-1.jpg`
- WHEN the detail route renders
- THEN the head contains `og:title` and `twitter:title` with the product name
- AND `og:description` and `twitter:description` with the short description
- AND `og:image` and `twitter:image` pointing at the first image
- AND `og:url` equals the `/producto/1` route URL

### Requirement: Shareable URL fidelity

The system MUST ensure the shareable URL (`/producto/:id`) used in OpenGraph matches the route the SPA actually serves, and that the same URL resolves on direct load through the SPA 404 fallback (see ci-deployment), so shared links and crawlers reach the same page.

#### Scenario: Shared link resolves to the product

- GIVEN an `og:url` for `/producto/1`
- WHEN that URL is opened directly in a browser
- THEN the SPA serves the product detail page for product `1` without a server error
