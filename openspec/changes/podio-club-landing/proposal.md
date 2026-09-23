# Proposal: Podio Club Landing

## Intent

Build the Podio Club e-commerce landing page **from scratch** (empty directory, no existing codebase). Podio Club sells soccer jerseys through a catalog of 10 initial products. There is **no backend**: the user cannot run a server, payments are out of scope, and checkout is completed manually over WhatsApp to a preconfigured number (+5493884372397).

The business process is manual and offline-friendly: the user photographs products with an iPhone 16 Pro Max, edits a JSON file to refresh stock every 1-2 months, pushes to `main`, and GitHub Actions automatically rebuilds and deploys the site to GitHub Pages.

The page **must** be modern and highly animated (explicit user requirement), mobile-first responsive, in Spanish (UI copy), with English code identifiers and file names. SEO fundamentals (meta tags, OpenGraph, Twitter cards) are required.

## Scope

### In Scope

- React + TypeScript single-page app built with Vite, styled with Tailwind CSS only (no Bootstrap/MUI or other CSS frameworks).
- Product catalog: responsive grid of product cards (1 column mobile, 2-3 desktop) rendering the 10 initial products from a JSON data source.
- Product detail page at dynamic route `/producto/:id` (sharable URLs), with long description, image carousel with zoom, size selector, and add-to-cart button. No color variants — jerseys are chosen by size.
- Lateral cart drawer: items (name, size, price, quantity), remove item, running total, and a WhatsApp checkout button that builds a message `"Hola! Quiero comprar: [listado] Total: $X"` and opens `wa.me/5493884372397`.
- JSON product data source (`src/data/products.json`) with the agreed schema (id, nombre, descripcion_corta, descripcion_larga, tipo_tela, numero_espalda, tipo, imagenes[], precio, talles[]). User edits this file to refresh stock — no admin panel.
- GitHub Actions pipeline: automated build + deploy to GitHub Pages on push to `main`, including SPA routing fallback (404.html trick).
- SEO: per-page `title`/`description`, OpenGraph tags, Twitter cards.
- Quality tooling: Jest + React Testing Library (unit + basic integration tests), ESLint + Prettier + Husky pre-commit hook. All checks must pass in CI.
- Animations: rich, modern motion design (scroll reveals, micro-interactions, drawer/carousel transitions) produced by the frontend-design workflow.

### Out of Scope

- Backend, database, CMS, or server-side rendering.
- Authentication, payments, Stripe, or any online payment flow.
- Visual admin panel — manual JSON editing is the accepted workflow.
- Internationalization — Spanish only.
- Color variants per product.
- Real-time stock control: stock is only refreshed when the user manually updates the JSON.
- Inventory/order tracking: order fulfillment happens outside the app via WhatsApp.

## Capabilities

> Contract between proposal and specs phases. This is a from-scratch project: all capabilities are new. Each gets a full spec at `openspec/changes/podio-club-landing/specs/<name>/spec.md` and becomes `openspec/specs/<name>/spec.md` at archive.

### New Capabilities

- `product-data`: JSON data source contract (schema, validation/normalization on load, type safety via TypeScript interfaces, graceful fallback on malformed data). Defines the exact fields the user edits manually.
- `product-catalog`: catalog grid rendering, product detail page, routing (`/` and `/producto/:id`), image carousel with zoom, size selector, and add-to-cart interaction. No color variants.
- `shopping-cart`: lateral drawer cart (open/close, add item with size, quantity handling, remove item, running total in ARS format). State held client-side only (Context + reducer).
- `whatsapp-checkout`: builds the checkout message per the format `"Hola! Quiero comprar: [listado] Total: $X"` and opens the WhatsApp deep link to +5493884372397.
- `site-seo`: static and per-route meta tags — `title`, `description`, OpenGraph, Twitter cards; SPA-friendly document head management.
- `ci-deployment`: GitHub Actions workflow that lints, tests, builds, and deploys to GitHub Pages on push to `main`, including SPA 404 fallback so deep links (`/producto/:id`) work on refresh.

### Modified Capabilities

- None (no existing specs; greenfield project).

## Approach

Greenfield Vite + React + TypeScript app. Directory layout mirrors feature boundaries so the spec files map 1:1 to code areas:

```
src/
├── data/products.json        # user-edited datasource (bundled via Vite JSON import)
├── types/product.ts          # Product, ProductSize domain types
├── data/products.ts          # import + runtime validation/normalization
├── context/CartContext.tsx   # cart state (useReducer + Context)
├── components/catalog/       # ProductCard, CatalogGrid
├── components/product/       # ImageCarousel (zoom), SizeSelector
├── components/cart/          # CartDrawer, CartItem, CartSummary
├── components/ui/            # buttons, badges, shared motion wrappers
├── pages/CatalogPage.tsx     # route: /
├── pages/ProductDetailPage.tsx # route: /producto/:id
└── main.tsx / App.tsx        # router setup, SEO head management
```

Key technical decisions (recommendations for design phase):

- **Data loading**: import `products.json` as a bundled module (Vite + `resolveJsonModule`). No runtime fetch: the file ships with the bundle, and stock refresh happens via the push-to-main pipeline anyway. Validate/normalize at module load with a small runtime check so a hand-editing mistake degrades gracefully instead of crashing the app.
- **Routing**: React Router (`/` and `/producto/:id`). GitHub Pages SPA support requires copying `index.html` to `404.html` in the build output so client-side routes survive refresh.
- **Cart state**: plain React Context + `useReducer` — no extra state library. Cart is ephemeral (browser session only); persistence is out of scope by design.
- **Animations**: motion-first design. Recommend the `motion` (Framer Motion) library for the high-animation requirement (drawer slide, carousel transitions, scroll reveals, micro-interactions). It is a JS animation library, not a CSS framework, so it complies with the "Tailwind only" constraint. Fallback: pure CSS keyframes + Tailwind transitions if the design phase prefers zero extra dependencies.
- **Images**: user photos live in `public/images/products/` referenced by relative path from the JSON. Product images get `loading="lazy"` plus `width`/`height` (or a fixed-ratio container) to prevent layout shift; the JSON uses a `preview`-style first image for cards.
- **CI/CD**: GitHub Actions on `main` — install deps, run lint, run tests, build with `base: '/<repo>/'` (Vite `base` config) for GH Pages hosting, deploy artifact via `actions/upload-pages-artifact` + `actions/deploy-pages`.
- **SEO**: static tags in `index.html` (site-wide) + per-route tags for the catalog and each product detail (description and OG image from the product data) via a tiny head-manager component. No SSR available on GH Pages; keep crawler expectations realistic.
- **Testing**: Jest + RTL for cart reducer logic, WhatsApp message formatting, size selection, and catalog/detail rendering. Cover the WhatsApp message contract with exact-format assertions.

Product JSON schema (contract for `product-data`; user edits this file):

```jsonc
{
  "id": 1, // number
  "nombre": "Camiseta Argentina Local 2024",
  "descripcion_corta": "...",
  "descripcion_larga": "...",
  "tipo_tela": "...", // e.g. "dry-fit"
  "numero_espalda": true, // boolean or number: has back number
  "tipo": "jugador", // "jugador" | "hincha"
  "imagenes": ["/images/products/1-1.jpg", "/images/products/1-2.jpg"],
  "precio": 45000, // ARS, stored as number
  "talles": ["S", "M", "L", "XL", "XXL", "NIÑO-6", "NIÑO-8"], // adults + kids
}
```

## Affected Areas

| Area                              | Impact | Description                                                         |
| --------------------------------- | ------ | ------------------------------------------------------------------- |
| `.github/workflows/deploy.yml`    | New    | CI/CD: lint + test + build + deploy to GitHub Pages on push to main |
| `vite.config.ts`                  | New    | Vite build config, `base` path for GH Pages, Tailwind plugin        |
| `src/data/products.json`          | New    | User-edited datasource with the 10 initial products                 |
| `src/types/product.ts`            | New    | `Product` and size types                                            |
| `src/data/products.ts`            | New    | JSON import + runtime validation/normalization                      |
| `src/context/CartContext.tsx`     | New    | Cart reducer + context provider                                     |
| `src/components/catalog/`         | New    | ProductCard, CatalogGrid                                            |
| `src/components/product/`         | New    | ImageCarousel (zoom), SizeSelector                                  |
| `src/components/cart/`            | New    | CartDrawer, CartItem, CartSummary                                   |
| `src/components/ui/`              | New    | Shared UI + animation wrappers                                      |
| `src/pages/CatalogPage.tsx`       | New    | Catalog route `/`                                                   |
| `src/pages/ProductDetailPage.tsx` | New    | Detail route `/producto/:id`                                        |
| `index.html`                      | New    | Static SEO tags, root mount, fonts                                  |
| `public/images/products/`         | New    | User product photos (iPhone 16 Pro Max)                             |
| `package.json` + config files     | New    | Deps, scripts, ESLint/Prettier/Jest/Husky config                    |
| Tests (`src/**/*.test.ts(x)`)     | New    | Unit + integration coverage for cart, message, catalog              |

## Risks

| Risk                                                             | Likelihood | Mitigation                                                                                                                                                        |
| ---------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GH Pages 404 on deep links (`/producto/:id` refresh)             | High       | 404.html copy trick in build step; verify via CI-downloaded artifact test                                                                                         |
| iPhone photos are large → slow first load                        | Med        | Optimize/compress images before committing, `loading="lazy"`, fixed-ratio containers, card preview image                                                          |
| User hand-edits JSON with a typo → app crash or blank catalog    | Med        | Runtime validation at module load with per-field defaults + per-product fallback; keep field names stable and document the schema in the repo README              |
| No SSR on GH Pages limits SEO/crawler fidelity                   | Med        | Realistic scope: static site-wide tags + per-route meta via head manager; no SSR planned                                                                          |
| Client-side deep links invisible to some crawlers                | Low        | Accept, document; WhatsApp is the primary acquisition channel, not organic SEO                                                                                    |
| WhatsApp deep link UX varies (desktop app vs web vs mobile)      | Low        | Standard `wa.me` URL pattern works everywhere (no `text` param needed — message built as link text is not supported; use `?text=`), keep CTA visible and copyable |
| Framer Motion (if chosen) adds a dependency the user didn't list | Low        | It is a JS animation lib, not a CSS framework — within the confirmed stack; design phase may drop it for pure CSS if preferred                                    |
| Currency/format drift for ARS prices (7-digit numbers)           | Low        | Single price formatter util with `es-AR` locale; total derived from cart state only                                                                               |

## Rollback Plan

Because deployment is a pure git-driven pipeline, rollback is trivial and safe:

1. **Revert the last push**: `git revert HEAD` (or reset + force-push only if strictly necessary and authorized) and push to `main`.
2. GitHub Actions re-runs and automatically redeploys the previous green build to GitHub Pages — the site returns to the last known-good state with no manual ops.
3. The GH Pages deployment is rebuild-on-push: each deployment carries its build artifact, so the revert push restores the prior artifact.
4. If a bad change shipped in product data only (JSON), a JSON-only revert is a one-line diff and does not touch application code.

No database, external services, or irreversible migrations exist, so rollback is a git operation only.

## Dependencies

- Node.js LTS (version pinned in `package.json` engines + GitHub Actions setup-node) with npm.
- Packages: `react`, `react-dom`, `react-router-dom`, `tailwindcss` (v4), `typescript`, `vite`, `motion` (decision pending at design), `jest`/`@testing-library/react`, `eslint`, `prettier`, `husky`.
- GitHub repository with Pages enabled (source: **GitHub Actions**) and write permission for the `GITHUB_TOKEN` in the workflow.
- Product photos for the 10 initial products (user-provided, iPhone 16 Pro Max) placed under `public/images/products/` matching the JSON `imagenes` paths.
- The preconfigured WhatsApp number +5493884372397 baked into constants (single source of truth, no env needed for a static site).

## Success Criteria

- [ ] Site is deployed to GitHub Pages and reachable at the repo's Pages URL.
- [ ] Push to `main` automatically runs lint + tests + build + deploy, and a broken push is visible in CI status before deploy.
- [ ] Catalog renders exactly the products present in `products.json` (10 initially) in a responsive grid (1 col mobile, 2-3 desktop).
- [ ] Each product detail is reachable at `/producto/:id`, reloads correctly on GH Pages (404 fallback works), and shows long description, image carousel with zoom, and size selector.
- [ ] Adding a size-selected product to the cart opens the lateral drawer with name, size, price, and quantity; removing items updates the total.
- [ ] WhatsApp checkout opens `wa.me/5493884372397` with message `"Hola! Quiero comprar: [listado] Total: $X"` matching the exact order summary and total.
- [ ] Editing `products.json` (add/remove/update product), committing and pushing, updates the live site without any code changes.
- [ ] SEO: site-wide and per-product `title`/`description`, OpenGraph, and Twitter card tags present in the rendered DOM.
- [ ] Page is fully usable and polished on mobile-first viewports; animations render consistently on desktop and mobile.
- [ ] Jest + RTL suite passes (unit tests for cart reducer, WhatsApp message format, size selection; integration tests for catalog and detail rendering); ESLint + Prettier clean; Husky pre-commit hook enforces all of the above.
