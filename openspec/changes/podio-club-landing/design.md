# Design: Podio Club Landing

## Technical Approach

Greenfield Vite + React 19 + TypeScript SPA, styled exclusively with Tailwind CSS v4 (via the official `@tailwindcss/vite` plugin — no other CSS framework), routed with React Router v7 in declarative mode, and animated with the `motion` library (`motion/react`). The product catalog ships as a bundled JSON module (`src/data/products.json`) that the user hand-edits; a runtime validation guard normalizes it into a typed `Product[]` with per-product graceful fallback.

State flow is unidirectional: `products.json` → `validateProducts()` → `Product[]` (singleton) → pages/components → cart actions → `CartContext` (Context + `useReducer`) → drawer → WhatsApp checkout message (pure functions) → `wa.me` deep link. SEO head state is derived per route and applied by a small native head manager.

This maps the six capabilities 1:1 onto code areas:

| Capability          | Code area                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `product-data`      | `src/types/product.ts` + `src/data/products.ts` + `src/data/products.json` + `src/utils/format.ts`                       |
| `product-catalog`   | `src/components/catalog/`, `src/components/product/`, `src/pages/`, `src/utils/sizes.ts`, `src/components/ui/Reveal.tsx` |
| `shopping-cart`     | `src/state/cartReducer.ts` + `src/context/CartContext.tsx` + `src/components/cart/` + `src/utils/cart.ts`                |
| `whatsapp-checkout` | `src/utils/whatsapp.ts` (constants, message builder, deep-link builder)                                                  |
| `site-seo`          | `index.html` (site-wide) + `src/hooks/useDocumentHead.ts` (per-route)                                                    |
| `ci-deployment`     | `.github/workflows/deploy.yml` + `scripts/copy-404.mjs` + `vite.config.ts` (base path) + `src/utils/assets.ts`           |

## Architecture Decisions

### Decision: Animation engine — `motion` library

**Choice**: `motion` (v12, successor of Framer Motion; import surface `motion/react`), scoped behind three shared wrappers/surfaces: `Reveal` (scroll reveals), the cart drawer transition, and the carousel transition.

**Alternatives considered**:

- _Pure CSS (Tailwind transitions/keyframes + IntersectionObserver)_: zero dependencies, but hand-rolling exit animations for the drawer, viewport-triggered staggered reveals, carousel transitions, and consistent `prefers-reduced-motion` handling multiplies code and risk. The user requirement is explicitly "muchas animaciones" — building a mini animation framework by hand is MORE code, not less, and directly contradicts the "avoid overengineering" constraint.
- _react-spring / react-transition-group_: no advantage over `motion` for this surface; react-transition-group has no whileInView/gesture primitives.
- _CSS frameworks_: blocked by the "Tailwind only" constraint. `motion` is a JS animation library, not a CSS framework, so it complies.

**Rationale**:

- The spec requirements map 1:1 onto `motion` primitives: scroll reveal → `whileInView` + `viewport={{ once: true }}`; drawer/carousel animated transitions → `AnimatePresence` with `key`ed `motion` children (exit animations); micro-interactions → `whileHover`/`whileTap`.
- `prefers-reduced-motion` is handled structurally: wrapping the app in `<MotionConfig reducedMotion="user">` automatically disables transform/layout animations while preserving opacity/color, satisfying the "Reduced motion preference" scenario without per-component logic.
- Motion is compositor-friendly (transform/opacity), meeting the "render consistently on mobile and desktop" requirement.
- Bundle cost (~34 kB min for the `motion` component) is acceptable for a landing page; usage is confined to the ui/product/cart components so it stays contained and reviewable.

### Decision: `numero_espalda` dual-type normalization

**Choice**: Preserve the raw value **without conversion** (per product-data spec scenario). The runtime guard accepts the deterministic union `BackNumber = boolean | number`, where `boolean` may be `true` (has a back number) or `false` (no back number), and `number` must be a positive integer (`>= 1`). Any other value (strings, `0`, negatives, floats) rejects the product entry with per-product fallback. Display mapping is done at render time by a single helper, never in data.

**Alternatives considered**:

- _Coerce booleans to numbers_: rejected — the spec explicitly requires preservation without conversion.
- _Restrict to `true | number` (reject `false`)_: rejected — `false` is a legitimate boolean with clear semantics ("sin número"); the schema says "a boolean or a positive integer", and booleans include `false`.

**Rationale**: The guard is the single authority for this field; the three accepted display states (`true` → "Con número de espalda", `false` → "Sin número", `n` → "Nº n") derive deterministically from the preserved value.

### Decision: Head manager — native `useDocumentHead` hook

**Choice**: A ~50-line native head manager: `src/hooks/useDocumentHead.ts` exposing `useDocumentHead(data: HeadData | null)`. Site-wide defaults (site title, `meta[name=description]` default, `og:type=website`, `og:locale=es_AR`, `og:site_name`, `og:image`, `twitter:card=summary_large_image`, `<html lang="es">`) live statically in `index.html`; the hook manages only route-scoped tags and removes the previous route's tags on every update/unmount, so stale metadata can never leak across routes.

**Alternatives considered**:

- _`react-helmet-async`_: unmaintained (no releases since 2022), peer dependencies exclude React 19 → install friction; adds a dependency the user did not list. Rejected.
- _`react-helmet` (classic)_: unmaintained, legacy context API, not React 19-ready. Rejected.
- _`@dr.pogodin/react-helmet`_: maintained fork with React 19 support, but still a third-party head library for a surface of exactly three route states. Rejected as unnecessary.

**Rationale**: The per-route surface is tiny (catalog, product, not-found) and fully deterministic; a native manager is trivially testable in jsdom (assert `document.title` and meta tags after render and after navigation), has zero dependencies, and its tag-ownership strategy (a `data-head-route` marker on managed tags) makes the spec's MUST "no stale metadata between routes" provable in tests.

### Decision: WhatsApp checkout module — pure, side-effect-free utilities

**Choice**: Three pure functions in `src/utils/` plus one constant, with no React dependencies and no side effects:

- `src/utils/format.ts` → `formatARS(value: number): string` — the single shared formatter (`Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" })`).
- `src/utils/cart.ts` → `cartTotal(lines: CartLine[]): number` — the single total derivation (sum of `unitPrice × quantity`).
- `src/utils/whatsapp.ts` → `WHATSAPP_NUMBER = "5493884372397"`, `buildCheckoutMessage(lines: CartLine[]): string`, `buildWhatsAppUrl(message: string): string`.

`buildCheckoutMessage` computes its own total via `cartTotal`, so the drawer total and the message total are the same value _by construction_ — no drift possible (product-data "Single source for totals and messages").

**Alternatives considered**:

- _Class/service wrapper_: over-engineered for two functions.
- _Building the message inside the drawer component_: untestable exact-format contract in isolation. Rejected.
- _Node `url` module or manual string concat_: `encodeURIComponent` is sufficient and universally available.

**Rationale**: The spec demands a single exported side-effect-free function whose exact output is asserted by tests; absolute minimal surface with maximal testability.

### Decision: Image optimization (iPhone 16 Pro Max photos, no infrastructure)

**Choice**: A documented user-side export workflow + browser-side loading strategy. No image CDN, no build-time processing, no srcset in v1.

- Canonical format: **JPEG** (sRGB, quality ≈ 80, max 1600 px long edge → ~200–400 KB per file), exported once per product refresh (iPhone 16 Pro Max default photo export path; no WebP/HEIC conversion friction for the user). Documented in `README.md`.
- Single variant per image — deliberately **no `srcset`/`sizes`** in v1: `sizes` is only meaningful with multiple variants, and a multi-file-per-image manual workflow conflicts with "avoid overengineering". Layout shift is instead prevented by explicit `width`/`height` attributes plus fixed-ratio containers (`aspect-[4/5]`) in a shared `OptimizedImage` component.
- Loading strategy: all images `loading="lazy"` + `decoding="async"` except the first carousel image of the visible product (eager, `fetchPriority="high"`). Catalog cards lazily load their preview image.
- `OptimizedImage` centralizes: dimension attrs, lazy/async, error fallback → Spanish placeholder (product-catalog "Broken image asset" scenario), and is the single choke point where a `<picture>`/WebP layer can be added later without touching consumers.

**Alternatives considered**:

- _`<picture>` + WebP/AVIF variants now_: ~25–35% smaller payloads, but forces the user to produce two files per image outside iPhone workflows. Rejected for v1; the component seam keeps it easy to add.
- _Vite image plugins / build-time compression_: adds pipeline complexity and unlisted dependencies for a manual-update workflow. Rejected.

**Rationale**: The real wins for a manual workflow are (1) correctly-sized source files and (2) lazy loading + CLS prevention — both achievable with zero infrastructure.

### Decision: Component/state structure — feature folders + Context/useReducer

**Choice**: Feature-folder layout under `src/` mirroring the capability boundaries (proposal's approach), no path aliases (relative imports only — one fewer config to drift), and cart state as React Context + `useReducer` with the reducer extracted into a pure module (`src/state/cartReducer.ts`) for exhaustive unit testing, thin provider/hook in `src/context/CartContext.tsx`.

Cart state contract:

```ts
type CartState = { lines: CartLine[]; isOpen: boolean };

type CartAction =
  | {
      type: "ADD_ITEM";
      payload: { productId: number; name: string; size: string; unitPrice: number };
    }
  | { type: "INCREMENT"; payload: { productId: number; size: string } }
  | { type: "DECREMENT"; payload: { productId: number; size: string } }
  | { type: "REMOVE_ITEM"; payload: { productId: number; size: string } }
  | { type: "SET_OPEN"; payload: boolean };
```

Reducer semantics (all from shopping-cart spec):

- `ADD_ITEM`: if a line with the same `productId + size` exists → quantity +1, otherwise append with quantity 1.
- `INCREMENT` / `DECREMENT`: adjust quantity; `DECREMENT` at quantity 1 removes the line (never reaches 0).
- `REMOVE_ITEM`: removes exactly that line.
- `SET_OPEN`: drawer flag only; closing never clears the cart.
- Totals are never stored — always derived via `cartTotal(lines)`.

**Alternatives considered**:

- _Redux/Zustand_: spec pins Context + `useReducer`; no extra state library. Rejected.
- _State inside pages_: cart is cross-page (detail → drawer), needs global context. Rejected.
- _Folder-by-type (components/utils/hooks flat)_: feature folders mirror the spec files 1:1 and scale better. Chosen per proposal.

### Decision: GH Pages base path + SPA 404 fallback

**Choice**:

- **Base path**: `vite.config.ts` sets `base: process.env.BASE_PATH ?? "/"`. The deploy workflow injects `BASE_PATH: /${{ github.event.repository.name }}/`, so production assets resolve under the Pages subpath without hardcoding a repo name, while local dev keeps `base: "/"`.
- **Asset resolution**: JSON image paths keep their authored form (root-relative, leading `/`). One helper `resolveAssetPath(path)` prefixes `import.meta.env.BASE_URL` and `resolveAssetUrl(path)` builds the absolute URL — every `<img src>` and every `og:image` goes through it. This makes both the deployed site (subpath) and local dev (root) correct with a single data contract.
- **404 fallback**: `npm run build` = `tsc -b && vite build && node scripts/copy-404.mjs`, where `copy-404.mjs` copies `dist/index.html` → `dist/404.html` (throws if `index.html` is missing). Local builds are byte-identical to CI builds, and the CI verification step re-asserts equality (`cmp dist/index.html dist/404.html`) per ci-deployment "Artifact contains the fallback".
- **CI/CD**: `.github/workflows/deploy.yml` — push to `main` + `workflow_dispatch`; build job (pinned Node 22 matching `engines`, `npm ci`, lint, test, build, artifact verification) → `actions/upload-pages-artifact` → deploy job `actions/deploy-pages` with `permissions: contents: read / pages: write / id-token: write` and `environment: github-pages`.

**Alternatives considered**:

- _Hardcode `base: "/<repo>/"`_: breaks if the repo is renamed or the folder name (underscore `podio_club_landing`) differs from the GitHub repo name. Rejected.
- _`cp` in the workflow YAML_: works, but diverges local builds from CI builds and makes local fallback debugging impossible. Node script in the build pipeline chosen instead.
- _`react-router basename`_: not needed — the 404.html trick + Vite `base` make the router see clean paths. Rejected.

**Rationale**: Deterministic, reproducible builds; correct asset resolution on any repo; deep links (`/producto/:id`) survive refresh on GH Pages; first-time Pages setup is a single documented manual step (source: GitHub Actions).

## Data Flow

    products.json (user-edited, bundled via Vite JSON import)
         │
         ▼
    validateProducts() ──► Product[]   (typed singleton, per-product fallback; invalid entries dropped + console error)
         │                                ▲
         │ getProductById(id)             │ product-data
         ▼                                │
    ProductDetailPage ◄── CatalogGrid ◄───┘  (cards navigate to /producto/:id)
         │  ImageCarousel + SizeSelector
         │  dispatch ADD_ITEM {productId, name, size, unitPrice}
         ▼
    CartContext (useReducer: lines[], isOpen)
         │
         ├──► CartDrawer (slide-in via AnimatePresence)
         │        └── CartSummary ── cartTotal(lines) ──► formatARS ──► "$130.000,00"
         │              └── buildCheckoutMessage(lines) ──► exact text (preview + copyable)
         │                    └── buildWhatsAppUrl(msg) ──► https://wa.me/5493884372397?text=…
         ▼
    <a href> opens WhatsApp with the order

    Route head state:
      CatalogPage / ProductDetailPage / NotFoundPage ──► useDocumentHead(headData) ──► document.title + meta tags

## File Changes

All files are **Create** (greenfield project; nothing to modify or delete).

### Root & configuration

| File                                                       | Description                                                                                                                                                                                                           |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json`                                             | Deps (pinned), scripts (`dev`, `build` incl. copy-404, `lint`, `test`, `prepare`), `engines: "22"`, lint-staged config. CommonJS package (no `"type": "module"`) so Jest + ts-jest run in the battle-tested CJS path. |
| `vite.config.ts`                                           | `@vitejs/plugin-react` + `@tailwindcss/vite` plugins; `base: process.env.BASE_PATH ?? "/"`.                                                                                                                           |
| `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` | Vite react-ts template + `resolveJsonModule: true` for the JSON product import.                                                                                                                                       |
| `index.html`                                               | `<html lang="es">`, site title/description, site-wide OpenGraph + Twitter defaults, fonts, `#root`.                                                                                                                   |
| `src/index.css`                                            | `@import "tailwindcss";` + theme tokens (CSS variables), reduced-motion-safe base.                                                                                                                                    |
| `eslint.config.js`                                         | ESLint 9 flat config: typescript-eslint, react-hooks, react-refresh, Tailwind-friendly rules.                                                                                                                         |
| `.prettierrc.json`, `.prettierignore`                      | Prettier config.                                                                                                                                                                                                      |
| `jest.config.cjs`, `jest.setup.ts`                         | ts-jest, `jest-environment-jsdom`, `@testing-library/jest-dom`.                                                                                                                                                       |
| `.husky/pre-commit`                                        | `npx lint-staged` + `npm test` (enforces lint/format/tests before commits).                                                                                                                                           |
| `.gitignore`                                               | Node/Vite/GH Pages ignores.                                                                                                                                                                                           |
| `README.md`                                                | User-facing workflow: JSON schema documentation, photo export/compression steps, WhatsApp number, deployment notes (Pages source = GitHub Actions).                                                                   |
| `scripts/copy-404.mjs`                                     | Copies `dist/index.html` → `dist/404.html`; throws when `index.html` is missing.                                                                                                                                      |
| `.github/workflows/deploy.yml`                             | Build + verify + Pages deploy pipeline (details in Decision: GH Pages).                                                                                                                                               |
| `public/images/products/`                                  | `.gitkeep` + short placement note; user photos land here.                                                                                                                                                             |

### Application source

| File                                       | Description                                                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `src/types/product.ts`                     | `Product`, `ProductType`, `BackNumber`, `AdultSize`, `ProductSize`, `CartLine`.                              |
| `src/data/products.json`                   | User-edited datasource, 10 initial products.                                                                 |
| `src/data/products.ts`                     | Raw JSON import → `validateProducts()` runtime guard → exported `products` singleton + `getProductById(id)`. |
| `src/utils/format.ts`                      | `formatARS` (single shared formatter).                                                                       |
| `src/utils/sizes.ts`                       | `splitSizes(talles)` (adults vs kids), canonical-size predicates.                                            |
| `src/utils/cart.ts`                        | `CartLine` helpers: `cartLineKey`, `cartTotal`.                                                              |
| `src/utils/whatsapp.ts`                    | `WHATSAPP_NUMBER`, `buildCheckoutMessage`, `buildWhatsAppUrl`.                                               |
| `src/utils/assets.ts`                      | `resolveAssetPath`, `resolveAssetUrl` (BASE_URL-aware).                                                      |
| `src/hooks/useDocumentHead.ts`             | Native head manager (`useDocumentHead(data: HeadData                                                         | null)`). |
| `src/state/cartReducer.ts`                 | Pure reducer + state/action types (unit-tested exhaustively).                                                |
| `src/context/CartContext.tsx`              | `CartProvider` + `useCart()` hook (thin layer over the reducer).                                             |
| `src/components/ui/Reveal.tsx`             | Scroll-reveal motion wrapper (`whileInView`, `viewport={{ once: true }}`, optional stagger).                 |
| `src/components/ui/Button.tsx`             | Primary/secondary buttons with `whileTap` micro-interaction.                                                 |
| `src/components/ui/OptimizedImage.tsx`     | Lazy/async/dimensions/aspect-ratio + error placeholder; future WebP `<picture>` seam.                        |
| `src/components/layout/Header.tsx`         | Logo, cart control with item-count badge; opens drawer.                                                      |
| `src/components/catalog/ProductCard.tsx`   | Preview image, name, short description, formatted price; motion hover; navigates to detail.                  |
| `src/components/catalog/CatalogGrid.tsx`   | Responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) + empty state (Spanish).                       |
| `src/components/product/ImageCarousel.tsx` | Animated transitions, thumbnails/prev-next (hidden for single image), zoom toggle, broken-image placeholder. |
| `src/components/product/SizeSelector.tsx`  | Adult/kids groups (Spanish labels), single selection, highlight.                                             |
| `src/components/cart/CartDrawer.tsx`       | `AnimatePresence` slide-in drawer, backdrop, full-width mobile, close semantics.                             |
| `src/components/cart/CartLineItem.tsx`     | Name, size, unit price, quantity controls, remove.                                                           |
| `src/components/cart/CartSummary.tsx`      | Total (es-AR), WhatsApp checkout control (disabled when empty), copyable message preview.                    |
| `src/pages/CatalogPage.tsx`                | Route `/`: renders `CatalogGrid`, catalog head data.                                                         |
| `src/pages/ProductDetailPage.tsx`          | Route `/producto/:id`: product or not-found; carousel, sizes, add-to-cart; product head data.                |
| `src/pages/NotFoundPage.tsx`               | Not-found state (Spanish) + link back to catalog; not-found head data.                                       |
| `src/App.tsx`                              | `BrowserRouter` > `CartProvider` > `Routes` (with catch-all) + `MotionConfig reducedMotion="user"`.          |
| `src/main.tsx`                             | React root mount.                                                                                            |

### Tests

| File                                            | Description                                                                                                                                          |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/utils/format.test.ts`                      | `formatARS` exact outputs (`45000 → "$45.000,00"`, `1250000 → "$1.250.000,00"`).                                                                     |
| `src/utils/cart.test.ts`                        | `cartLineKey`, `cartTotal` multi-line sum.                                                                                                           |
| `src/utils/whatsapp.test.ts`                    | Exact message contract (two-item, single-item, empty), encoding round-trip with `$`/accents/newlines.                                                |
| `src/utils/sizes.test.ts`                       | Adult/kids splitting, canonical-size validation.                                                                                                     |
| `src/utils/assets.test.ts`                      | `resolveAssetPath`/`resolveAssetUrl` with explicit base URLs.                                                                                        |
| `src/data/products.test.ts`                     | Guard: valid entry, schema violations, duplicate ids, dual `numero_espalda` (true/10), non-canonical sizes, root-not-array.                          |
| `src/state/cartReducer.test.ts`                 | Full state machine: add/aggregate, distinct sizes, increment/decrement round-trip, decrement-at-1 removes, explicit removal, open flag semantics.    |
| `src/pages/CatalogPage.test.tsx`                | Renders all json products, card fields, click navigation, empty state (integration with RTL).                                                        |
| `src/pages/ProductDetailPage.test.tsx`          | Known id renders detail; unknown id → not-found + head; add without size blocked; add dispatches and opens drawer.                                   |
| `src/components/product/ImageCarousel.test.tsx` | Multi-image navigation + first selected, single-image without controls, zoom toggle, broken-image placeholder.                                       |
| `src/components/cart/CartDrawer.test.tsx`       | Open on add, close via backdrop/close without clearing, empty state message + disabled checkout, mobile width class, disabled control opens no link. |
| `src/hooks/useDocumentHead.test.tsx`            | Title/meta set per route; no stale tags across two sequential renders; null clears route tags.                                                       |

## Interfaces / Contracts

```ts
// src/types/product.ts
export type ProductType = "jugador" | "hincha";

/** Back number: boolean ("has back number") or the back number itself (positive integer). */
export type BackNumber = boolean | number;

export type AdultSize = "S" | "M" | "L" | "XL" | "XXL";
export type ProductSize = AdultSize | `NIÑO-${number}`;

export interface Product {
  id: number; // unique positive integer
  nombre: string; // non-empty
  descripcion_corta: string; // non-empty
  descripcion_larga: string; // non-empty
  tipo_tela: string;
  numero_espalda: BackNumber; // preserved as authored — never coerced
  tipo: ProductType;
  imagenes: string[]; // non-empty; [0] = card preview + detail default
  precio: number; // integer ARS, no decimals/symbols
  talles: ProductSize[]; // canonical format only
}

export interface CartLine {
  productId: number;
  name: string;
  size: string; // canonical format
  unitPrice: number; // ARS, from product data
  quantity: number; // positive integer
}
```

```ts
// src/data/products.ts — runtime guard contract
export function validateProducts(raw: unknown): Product[];
export function getProductById(id: number): Product | undefined;
// export const products: Product[]  — validated singleton, safe to consume

// Guard rules (product-data spec):
//  - root must be an array → else [] + descriptive console.error (never crash)
//  - per entry: id unique positive int (first occurrence wins on duplicates + warning);
//    nombre / descripcion_corta / descripcion_larga non-empty strings;
//    tipo_tela string; numero_espalda boolean OR positive integer;
//    tipo ∈ {"jugador","hincha"}; imagenes non-empty string[]; precio non-negative integer;
//    talles non-empty, every item matches ^(S|M|L|XL|XXL|NIÑO-[1-9]\d*)$
//  - any violation → entry dropped (per-product fallback) + descriptive console.warn
// Note: syntactically invalid JSON is caught by the Vite bundler at build time (CI fails
// before deploy — fail-fast, stronger than runtime); the guard covers semantic errors
// that CAN reach runtime (e.g. root wrapped in an object, wrong types, bad sizes).
```

```ts
// src/utils/format.ts
export function formatARS(value: number): string;
// Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" })
// 45000 → "$45.000,00"   1250000 → "$1.250.000,00"

// src/utils/sizes.ts
export function splitSizes(talles: ProductSize[]): { adults: AdultSize[]; kids: ProductSize[] };
export function isCanonicalSize(value: string): value is ProductSize;

// src/utils/cart.ts
export function cartLineKey(line: Pick<CartLine, "productId" | "size">): string; // `${productId}:${size}`
export function cartTotal(lines: CartLine[]): number; // Σ unitPrice × quantity

// src/utils/whatsapp.ts
export const WHATSAPP_NUMBER = "5493884372397"; // single source of truth; no env
export function buildCheckoutMessage(lines: CartLine[]): string;
// Exact contract ("" for empty cart; "\n"-joined):
//   Hola! Quiero comprar:
//   2x Camiseta Argentina Local 2024 - Talle L ($45.000,00)
//   1x Camiseta River Plate 2024 - Talle NIÑO-8 ($40.000,00)
//   Total: $130.000,00
export function buildWhatsAppUrl(message: string): string;
// `https://wa.me/5493884372397?text=${encodeURIComponent(message)}`

// src/utils/assets.ts
export function resolveAssetPath(path: string, baseUrl?: string): string;
// default baseUrl = import.meta.env.BASE_URL; "/images/products/1-1.jpg" + "/podio-club-landing/"
// → "/podio-club-landing/images/products/1-1.jpg"
export function resolveAssetUrl(path: string, baseUrl?: string): string; // absolute, for og:image

// src/hooks/useDocumentHead.ts
export interface HeadData {
  title: string;
  description: string;
  image?: string; // absolute URL (product first image) — emitted as og:image / twitter:image
  url?: string; // absolute URL — emitted as og:url
}
export function useDocumentHead(data: HeadData | null): void;
// Sets document.title + owned meta tags (marked data-head-route); previous route's owned
// tags are removed on every call and on unmount → no stale metadata (site-seo MUST).
```

## Testing Strategy

| Layer         | What to Test                                                                                                                                              | Approach                                                                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Unit          | `formatARS` exact es-AR output; `cartTotal`; `cartLineKey`                                                                                                | Pure-function assertions in `src/utils/*.test.ts`                                                                                          |
| Unit          | Cart reducer full state machine (add/aggregate/distinct sizes/increment/decrement/remove/open flag)                                                       | Table-driven `src/state/cartReducer.test.ts`                                                                                               |
| Unit          | WhatsApp message exact format (`Hola! Quiero comprar:…` multiline, empty cart → `""`) + `encodeURIComponent` round-trip preserving `$`, accents, newlines | Exact-string assertions in `src/utils/whatsapp.test.ts`                                                                                    |
| Unit          | Product guard: valid entry, each schema violation, duplicate ids, dual `numero_espalda` (`true` and `10` preserved), non-canonical sizes, root-not-array  | Table-driven `src/data/products.test.ts`                                                                                                   |
| Unit          | `splitSizes`, canonical-size predicates; asset resolution with explicit base URLs                                                                         | `src/utils/sizes.test.ts`, `src/utils/assets.test.ts`                                                                                      |
| Integration   | Catalog renders every JSON product; card navigate; empty state; detail for known/unknown id; add-without-size blocked; add dispatches and opens drawer    | RTL render + user-event in `src/pages/*.test.tsx`                                                                                          |
| Integration   | Carousel navigation/zoom/single-image/broken-image placeholder; drawer open/close/backdrop/empty/disabled checkout                                        | `src/components/product/ImageCarousel.test.tsx`, `src/components/cart/CartDrawer.test.tsx`                                                 |
| Integration   | Head manager: per-route title/meta, no stale tags between routes, not-found head                                                                          | jsdom assertions in `src/hooks/useDocumentHead.test.tsx`                                                                                   |
| Pipeline (CI) | Artifact verification: `dist/index.html` + `dist/404.html` present and byte-equal; assets dir non-empty; lint+test+build fail-closed before deploy        | `deploy.yml` verification step (`test -f`, `cmp`) + workflow fail-fast ordering                                                            |
| E2E           | Deep-link refresh on GH Pages (real deployment)                                                                                                           | Manual checklist post-deploy (documented in README); `vite preview` for local fallback sanity — no E2E framework (not in the agreed stack) |

## Threat Matrix

The fixed matrix rows are git-CLI-centric; the pipeline runs **no git commands** (checkout/deploy are official pinned actions, and the trigger is a GitHub push event). Every row is therefore `N/A` with a reason. The boundaries the design **does** change — client-side routing, shell command execution, and GitHub Actions process integration — are covered in the extended matrix below.

| Boundary                 | Minimum adversarial cases                                                  | Applicability                                                                                                                         | Design response | Planned RED tests |
| ------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ----------------- |
| Documentation-like paths | `requirements.txt`, `CMakeLists.txt`, executable Markdown/MDX, `README.sh` | N/A — no doc-as-executable processing; `README.md` and `index.html` are inert static content; no file is executed based on extension. | —               | —                 |
| Git repository selection | `git -C`, relative paths, absolute paths                                   | N/A — no git command is executed by the app or the pipeline; `actions/checkout@v4` (pinned official action) handles the repo.         | —               | —                 |
| Commit state             | staged, `commit -a`, empty index                                           | N/A — the pipeline creates and inspects no commits; the trigger is the push event itself.                                             | —               | —                 |
| Push state               | tracking branch, first push, explicit refspec                              | N/A — nothing pushes; GitHub fires the workflow on push.                                                                              | —               | —                 |
| PR commands              | explicit `--head`, environment prefix, composed commands                   | N/A — no PR automation exists in this design (`workflow_dispatch` is a manual trigger, not command composition).                      | —               | —                 |

### Extended matrix — boundaries the design actually changes

| Boundary                                  | Minimum adversarial cases                                                                                     | Applicability                                                                                                          | Safe behavior                                                                                                                                                                                                      | Failure behavior                                                                                                                                       | Planned RED tests                                                                                                                                                                                                                                                          |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Client-side routing + deep links          | unknown `/producto/999`; direct refresh of `/producto/:id` on GH Pages; stale route metadata after navigation | Applicable — React Router SPA + 404.html fallback + per-route head                                                     | Unknown id → `NotFoundPage` with Spanish copy + link home; refresh/deep link serves the SPA shell via `404.html` and renders the right route; each route installs only its own head tags and removes previous tags | Route renders wrong page, or blank page on refresh (no fallback), or route A metadata visible on route B                                               | RTL: detail page unknown id → not-found + not-found head; head test asserts no stale tags across route transitions; CI artifact step asserts `dist/404.html` byte-equals `dist/index.html`; manual deep-link checklist on deployed Pages                                   |
| Shell command execution                   | `BASE_PATH` env injection (untrusted), `copy-404.mjs` failing/missing `dist/index.html`                       | Applicable — `npm run build` chains `vite build` + `node scripts/copy-404.mjs`; workflow runs `npm ci/lint/test/build` | `BASE_PATH` derived only from `github.event.repository.name` (GitHub-owned); copy script explicitly invoked via `node` (never as a bare executable); missing source → script throws → `npm run build` non-zero     | Malformed base path produces broken asset URLs (caught by artifact verification/CI failing build); script throw → CI stops before deploy (fail-closed) | CI: build fails when `dist/index.html` is absent (script throw); artifact verification asserts `404.html` exists and `cmp`-equals `index.html`; `BASE_PATH` correctness covered by `npm run build` under a test `BASE_PATH=/x/` asserting asset URLs in built `index.html` |
| Subprocess / third-party action integrity | action version drift, over-permissioned `GITHUB_TOKEN`, artifact at unexpected path                           | Applicable — `deploy.yml` invokes official actions; deploy grants `permissions`                                        | Actions pinned to major versions reviewed at setup; grants exactly `contents: read`, `pages: write`, `id-token: write`; artifact uploaded from explicit `dist` path                                                | Action drift or token over-permission could deploy unverified artifacts or widen blast radius                                                          | CI assertion of `permissions` block (review-time); artifact verification step gates deploy; deploy job `needs: build` prevents deploy without green build                                                                                                                  |
| Executable-file classification            | `scripts/copy-404.mjs` executed as a file vs via interpreter                                                  | Applicable — build script is executable-through-node-only                                                              | Always invoked as `node scripts/copy-404.mjs` inside `package.json` `build`; never `chmod +x`/direct execution; no shebang dependency                                                                              | Direct execution on a system lacking node shebang support fails — irrelevant because invocation is always `node …`                                     | Config-level guarantee (package.json script + README note); CI build step re-invokes the same `npm run build` used locally                                                                                                                                                 |

Required safe/failure behavior for applicable rows is defined per row; the RED tests above propagate to `tasks.md` unchanged.

## Migration / Rollout

**No migration required** — greenfield project; no data, no existing deployment.

Rollout is git-driven: the first push to `main` runs the full pipeline and deploys the initial catalog. One-time manual setup steps for the repository owner (documented in `README.md` and the workflow header):

1. Enable Pages in repository settings with source **GitHub Actions**.
2. Place the 10 product photo sets under `public/images/products/` matching JSON `imagenes` paths (JPEG, ≤1600 px, q≈80).
3. Confirm the WhatsApp number constant (`5493884372397`) before launch.

Rollback = `git revert` of the offending push; the pipeline redeploys the previous green build automatically (no ops).

## Open Questions

No blocking questions. Operational prep items (non-blocking for implementation, required for launch):

- [ ] GitHub repository name to be created (BASE_PATH derives from it automatically at deploy time — no code change needed).
- [ ] The 10 initial products' photos must be exported/compressed per the README workflow before launch (missing files render the placeholder but would ship an incomplete catalog).

Note for `sdd-tasks`: this is a greenfield build far beyond the 400-line review budget — the tasks phase must forecast chained-PR delivery (delivery strategy: ask-on-risk).
