# Tasks: Podio Club Landing

Change: `podio-club-landing` — greenfield Vite + React 19 + TypeScript SPA (GitHub Pages, WhatsApp checkout, hand-edited JSON catalog, motion-first UI).

Inputs consumed: `openspec/changes/podio-club-landing/proposal.md`, all 6 delta specs (`product-data`, `product-catalog`, `shopping-cart`, `whatsapp-checkout`, `site-seo`, `ci-deployment`), `design.md`. Every file below is **Create** (empty directory; nothing to modify or delete).

Threat matrix note (per design): the 5 fixed git-CLI rows are all `N/A` with documented reasons and are **omitted**. The 4 extended rows (client-side routing + deep links, shell command execution, third-party action integrity, executable-file classification) are applicable and are carried into explicit RED-test tasks, tagged `[TM-1]` … `[TM-4]`.

Each task names a work unit `[WU1]`…`[WU4]` — tasks in the same WU land in the same chained PR. Tasks are commit-sized (one logical unit each) so the user can push small commits per task.

## Review Workload Forecast

| Field                   | Value                                                                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Estimated changed lines | ≈ 4,200 – 4,800 (≈ 56 files, all new: ~30 app files, ~12 test files, ~10 config/tooling, workflow, docs, image placeholder)                     |
| 400-line budget risk    | High                                                                                                                                            |
| Chained PRs recommended | Yes                                                                                                                                             |
| Suggested split         | PR 1 (bootstrap + data) → PR 2 (cart state + catalog UI + pages) → PR 3 (cart drawer + WhatsApp checkout UI) → PR 4 (SEO verify + CI/CD + docs) |
| Delivery strategy       | ask-on-risk                                                                                                                                     |
| Chain strategy          | pending (see decision below)                                                                                                                    |

```
Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High
```

**Decision needed before apply**: delivery strategy is `ask-on-risk` and the estimated workload is far above the 400-line budget, so the orchestrator MUST ask the user before `sdd-apply` — and specifically which chain strategy to use:

- **Stacked-to-main** (recommended for this project: git-driven Pages deploy on `main`, rollback is `git revert`, and the user wants small commits generating GitHub activity) — each PR merges to `main` in order.
- **Feature-branch-chain** — PR #1 targets a feature/tracker branch; PR #2 base = PR #1 branch; PR #3 base = PR #2 branch; PR #4 base = PR #3 branch; only the tracker merges to `main`.
- **size:exception** — single oversized PR with maintainer approval (not recommended here).

### Suggested Work Units

| Unit | Tasks     | Goal                                                                       | Likely PR | Focused test command                                                                                                 | Runtime harness                                                                                                                                                     | Rollback boundary                                                                          |
| ---- | --------- | -------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| WU1  | Phase 1–2 | Bootstrap + tooling + data layer; production build green with 404 fallback | PR 1      | `npm test -- src/utils src/data`                                                                                     | `npm run build` then `cmp dist/index.html dist/404.html`; `npm run dev` shows placeholder home                                                                      | Revert PR 1 commits — nothing deployed yet (`deploy.yml` lands in PR 4), git-only rollback |
| WU2  | Phase 3–5 | Pure cart/checkout logic + catalog & detail UI + pages + head hook         | PR 2      | `npm test -- src/state src/utils/cart.test.ts src/utils/whatsapp.test.ts src/hooks src/pages src/components/product` | `npm run dev`: browse `/`, open `/producto/1`, select talla, "Agregar" → cart badge updates and drawer flag opens (visible panel arrives in PR 3)                   | Revert PR 2 commits — Pages deployment still not wired, git-only rollback                  |
| WU3  | Phase 6   | Cart drawer UI + WhatsApp checkout UI (deep link + copyable message)       | PR 3      | `npm test -- src/components/cart`                                                                                    | `npm run dev`: add items, drawer slides in, total updates, `wa.me` link opens with exact message, copy control works                                                | Revert PR 3 commits — deploy still not wired, git-only rollback                            |
| WU4  | Phase 7   | SEO spec verification + GitHub Actions deploy pipeline + docs + final gate | PR 4      | `npm test` (full suite) + `BASE_PATH=/x/ npm run build` asset-prefix check + `cmp dist/index.html dist/404.html`     | Push to `main` → GH Actions runs lint/test/build/verify/deploy → Pages URL; deep-link refresh (`/producto/1`) on the deployed site; manual checklist in `README.md` | Revert the push; pipeline redeploys previous green build automatically                     |

Capability → phase mapping: `product-data` → Phase 2 · `shopping-cart` + `whatsapp-checkout` (logic) → Phase 3 · `product-catalog` → Phases 4–5 · `site-seo` → Phases 1, 5 (hook), 7 (verification) · `ci-deployment` → Phases 1 (copy-404/build), 7 (workflow). Tests travel with their module (RED → GREEN pairs for exact-contract modules: format, guard, reducer, whatsapp, head hook).

---

## Phase 1: Bootstrap & Tooling `[WU1]`

The full dev loop (lint/test/build) must pass end-to-end before any feature code. No task here depends on later phases (Phase 1 → 2 in sequence).

- [x] 1.1 Create `package.json` — CommonJS package (NO `"type": "module"` so Jest + ts-jest run the battle-tested CJS path). Pinned deps: `react@^19`, `react-dom@^19`, `react-router-dom@^7`, `motion@^12`, `tailwindcss@^4` + `@tailwindcss/vite@^4`, `vite@^6`, `@vitejs/plugin-react`, `typescript@^5`; dev: `jest@^29`, `ts-jest`, `jest-environment-jsdom`, `@testing-library/react@^16`, `@testing-library/dom`, `@testing-library/user-event`, `@testing-library/jest-dom`, `@types/jest`, `@types/react`, `@types/react-dom`, `@types/node`, `eslint@^9`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `prettier`, `husky`, `lint-staged`. `engines: { "node": "22" }` (matches CI pin, ci-deployment "Pinned runtime"). Scripts: `dev` (vite), `build` = `tsc -b && vite build && node scripts/copy-404.mjs`, `lint`, `test` (jest), `prepare` = `husky`. `lint-staged` config: `eslint --fix` + `prettier --write` on staged `*.{ts,tsx,json,css,md}`.
      Acceptance: `npm ci` resolves cleanly on Node 22; `npm run build` fails until 1.9 exists (expected at this point).
- [x] 1.2 Create `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` — Vite react-ts template references; `strict: true`; `resolveJsonModule: true` in the app config (JSON product import).
      Acceptance: `npx tsc -b` passes on the Phase 1 skeleton.
- [x] 1.3 Create `vite.config.ts` — plugins `[react(), tailwindcss()]` (official `@tailwindcss/vite`); `base: process.env.BASE_PATH ?? "/"` (deploy flow injects `/{{repo}}/`; local dev stays `/`).
      Acceptance: `npm run dev` serves on root; config loads without warnings.
- [x] 1.4 Create `index.html` — `<html lang="es">`; site-wide defaults per site-seo "Initial document metadata": site `<title>`, `<meta name="description">`, `og:type=website`, `og:locale=es_AR`, `og:site_name`, site-level `og:image`, `twitter:card=summary_large_image`; font preconnect + link; `<div id="root">`; module script → `/src/main.tsx`.
      Acceptance: fields listed exist in the source document; verified again against the deployed document in 7.1.
- [x] 1.5 Create `src/index.css` — `@import "tailwindcss";` + design tokens (CSS variables: brand colors, spacing, typography), reduced-motion-safe base, body defaults.
      Acceptance: Tailwind v4 compiles; utility classes render in later components.
- [x] 1.6 Create `eslint.config.js` (ESLint 9 flat config: `typescript-eslint` recommended, `react-hooks`, `react-refresh`, jest globals for test files), `.prettierrc.json`, `.prettierignore`.
      Acceptance: `npm run lint` passes on the skeleton; `npx prettier --check .` passes.
- [x] 1.7 Create `jest.config.cjs` + `jest.setup.ts` — `ts-jest` preset, `jest-environment-jsdom`, `setupFilesAfterEach: <rootDir>/jest.setup.ts` importing `@testing-library/jest-dom`; `moduleNameMapper` stubbing `^.+\\.css$`; `transformIgnorePatterns` allowing the `motion` package to be transformed by ts-jest (motion ships ESM; without this the drawer/carousel tests break); `passWithNoTests: true` for the bootstrap commit.
      Acceptance: `npm test` exits 0 with zero tests at bootstrap (goes real in Phase 2).
- [x] 1.8 Create `.husky/pre-commit` (`npx lint-staged` + `npm test`) + `.gitignore` (`node_modules`, `dist`, `coverage`, `.DS_Store`, `.env*`).
      Acceptance: a test commit triggers the hook and runs lint-staged + jest.
- [x] 1.9 Create `scripts/copy-404.mjs` — reads `dist/index.html`, throws a descriptive error when it is missing, writes `dist/404.html`. Strictly invoked as `node scripts/copy-404.mjs` from the `build` script (never `chmod +x`/direct execution) `[TM-4]`.
      Acceptance: with `dist/index.html` present, `dist/404.html` is byte-identical; with it removed, the script exits non-zero with a clear message (fail-closed, `[TM-2]` shell-boundary behavior).
- [x] 1.10 Create minimal `src/main.tsx` + `src/App.tsx` — React root mount + placeholder home (brand text + a Spanish paragraph; router/providers wired in 5.6).
      Acceptance: `npm run dev` renders the placeholder at `/`; `npm run build` completes.
- [x] 1.11 WU1 pipeline gate — run `npm ci && npm run lint && npm test && npm run build`; then `cmp dist/index.html dist/404.html` (read-only) asserts byte-equality (preview of `[TM-1]` 404-fallback guarantee; enforced again in CI, 7.3).
      Acceptance: all four commands exit 0; `cmp` exits 0.

## Phase 2: Data Layer `[WU1]`

Consumes: Phase 1 (types compile via tsconfig; tests run via Jest). Produces the guarded product singleton consumed by every later phase.

- [x] 2.1 Create `src/types/product.ts` — `ProductType = "jugador" | "hincha"`; `BackNumber = boolean | number` (preserved, never coerced); `AdultSize = "S" | "M" | "L" | "XL" | "XXL"`; `ProductSize = AdultSize | \`NIÑO-${number}\``; `Product`interface mirroring the schema (id unique positive int, non-empty`nombre`/`descripcion_corta`/`descripcion_larga`, `tipo_tela`, `numero_espalda: BackNumber`, `tipo`, non-empty `imagenes`with`[0]`as preview, integer`precio`, canonical `talles`); `CartLine`.
Acceptance: compiles under `tsc -b`; mirrors product-data schema 1:1.
- [x] 2.2 RED `src/utils/format.test.ts` — asserts `formatARS(45000) === "$45.000,00"` and `formatARS(1250000) === "$1.250.000,00"` (product-data "Formatting a typical ARS price" / "Seven-digit price"). Fails to compile until 2.3 merges (RED).
- [x] 2.3 GREEN `src/utils/format.ts` — `formatARS(value: number): string` via `Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" })`. The single shared formatter for catalog, detail, cart drawer, and WhatsApp message (product-data "Single ARS price formatter" — no other price formatting anywhere).
      Acceptance: 2.2 goes green; exact outputs match the spec examples (if the local ICU build differs in spacing, align the test to the spec text and note the divergence).
- [x] 2.4 RED `src/utils/sizes.test.ts` — `splitSizes(["S","M","L","XL","XXL","NIÑO-6","NIÑO-8"])` → 5 adults + 2 kids, order preserved; `isCanonicalSize` true for `S..XXL` and `NIÑO-6`, false for `"UNICO"`, `"M-42"`, lowercase `"s"` (product-data "Canonical size format").
- [x] 2.5 GREEN `src/utils/sizes.ts` — `splitSizes(talles)`, `isCanonicalSize(value)` matching `^(S|M|L|XL|XXL|NIÑO-[1-9]\d*)$`.
      Acceptance: 2.4 green.
- [x] 2.6 RED `src/utils/assets.test.ts` — `resolveAssetPath("/images/products/1-1.jpg", "/podio-club-landing/")` → `"/podio-club-landing/images/products/1-1.jpg"`; default base (no second arg) identity under `/`; `resolveAssetUrl` produces an absolute URL (for `og:image`).
- [x] 2.7 GREEN `src/utils/assets.ts` — `resolveAssetPath(path, baseUrl = import.meta.env.BASE_URL)` (correct double-slash handling) and `resolveAssetUrl(path, baseUrl?)` (absolute, used by `og:image`/`og:url`).
      Acceptance: 2.6 green.
- [x] 2.8 Create `src/data/products.json` — the user-edited datasource: 10 initial products, each conforming to the proposal schema (`id`, `nombre`, `descripcion_corta`, `descripcion_larga`, `tipo_tela`, `numero_espalda` as boolean or positive int, `tipo`, `imagenes` with distinct relative paths starting `/images/products/`, integer `precio`, canonical `talles` incl. `NIÑO-*`). Field names are Spanish and stable — the user edits this file every 1–2 months; document them in `README.md` (7.5).
      Acceptance: parses as JSON; every entry passes the guard contract as proven by 2.10's tests.
- [x] 2.9 RED `src/data/products.test.ts` — table-driven guard tests against `src/data/products.ts` (read-only) and `src/data/products.json` (read-only): fully valid entry accepted with all fields typed; each schema violation (negative `precio`, empty `imagenes`, missing `nombre`, `tipo` outside the set, `precio` string, `id` string) → entry dropped + `console.warn`; duplicate ids → first kept + warn; `numero_espalda` `true` and `10` both accepted and preserved without conversion; `talles` containing `"UNICO"`/`"M-42"`/`"s"` → product rejected; root-not-array → `[]` + descriptive `console.error`, no crash; one-invalid-among-10 → 9 valid + warn (product-data "One invalid product among valid ones").
- [x] 2.10 GREEN `src/data/products.ts` — `validateProducts(raw: unknown): Product[]` implementing the full guard contract with per-product fallback and descriptive console messages; exported `products` singleton + `getProductById(id)`. Syntactically invalid JSON is caught by the Vite bundler at build time (CI fail-fast); the guard covers semantic errors that reach runtime.
      Acceptance: 2.9 green.
- [x] 2.11 Create `public/images/products/.gitkeep` + `public/images/products/README.txt` — placement note: JPEG sRGB, q≈80, max 1600 px long edge (iPhone 16 Pro Max export); file names must match the JSON `imagenes` paths.
      Acceptance: directory is tracked; the photo workflow is documented for the user (expanded in 7.5).

## Phase 3: Cart State & Checkout Logic `[WU2]`

Pure logic — no UI. Everything here is exhaustively unit-tested so Phases 4–6 stay thin. Consumes: Phase 2 (`Product`, `CartLine`, `formatARS`, `splitSizes`).

- [x] 3.1 RED `src/utils/cart.test.ts` — `cartLineKey({ productId: 1, size: "L" }) === "1:L"`; `cartTotal` of `2 × 45000 + 1 × 40000` = `130000`; empty cart → `0`.
- [x] 3.2 GREEN `src/utils/cart.ts` — `cartLineKey` (`${productId}:${size}`) and `cartTotal` (Σ `unitPrice × quantity`). Single source for all totals (shopping-cart "Running total"; no drift with the message total by construction, product-data "Single source for totals and messages").
      Acceptance: 3.1 green.
- [x] 3.3 RED `src/state/cartReducer.test.ts` — full state machine, table-driven: initial `{ lines: [], isOpen: false }`; `ADD_ITEM` new line qty 1; same product+size twice → single line qty 2, line total `90000`; same product different size → second line, existing untouched; `INCREMENT`/`DECREMENT` round-trip returns to 1; `DECREMENT` at qty 1 removes the line (never 0); `REMOVE_ITEM` removes exactly that line, others unchanged; `SET_OPEN` never mutates lines; totals are never stored in state.
- [x] 3.4 GREEN `src/state/cartReducer.ts` — reducer + `CartState`/`CartAction` exactly per the design contract (`ADD_ITEM` | `INCREMENT` | `DECREMENT` | `REMOVE_ITEM` | `SET_OPEN`, payloads keyed by `productId + size`).
      Acceptance: 3.3 green.
      Note: `CLEAR` action added beyond the design contract per PR 2 dispatch instruction (explicit cart reset; never closes the drawer).
- [x] 3.5 Create `src/context/CartContext.tsx` — `CartProvider` (thin `useReducer` wrapper) + `useCart()` exposing `lines`, `isOpen`, `addItem`, `increment`, `decrement`, `removeItem`, `setOpen`; `useCart` must throw when used outside the provider. Consumed later by `Header` (4.8), `ProductDetailPage` (5.5), and the drawer (Phase 6).
      Acceptance: compiles; behavior proven through page (5.8) and drawer (6.4) integration tests.
- [x] 3.6 RED `src/utils/whatsapp.test.ts` — exact contract assertions: two-item cart → the byte-exact multiline string (`2x Camiseta Argentina Local 2024 - Talle L ($45.000,00)` / `1x Camiseta River Plate 2024 - Talle NIÑO-8 ($40.000,00)` / `Total: $130.000,00`, lines in insertion order, header `Hola! Quiero comprar:`); single-item cart; empty cart → `""`; `buildWhatsAppUrl` → `https://wa.me/5493884372397?text=` + `encodeURIComponent(message)`; decode round-trip preserves `$`, accents (`ñ`), and newlines (whatsapp-checkout "URL-encoding round-trip").
- [x] 3.7 GREEN `src/utils/whatsapp.ts` — `WHATSAPP_NUMBER = "5493884372397"` (single shared constant, no env); `buildCheckoutMessage(lines)` — pure, side-effect-free, computes its own total via `cartTotal` (drawer total and message total identical by construction); `buildWhatsAppUrl(message)`.
      Acceptance: 3.6 green; the exact-format contract the drawer's checkout control will reuse.

## Phase 4: Catalog & Product Detail UI `[WU2]`

Consumes: Phase 2 (types, utils), Phase 3 (context/reducer for badge + add), motion library. All motion confined to these components (translucency/opacity + transform only).

- [x] 4.1 Create `src/components/ui/Reveal.tsx` — motion scroll-reveal wrapper (`whileInView`, `viewport={{ once: true }}`, optional `delay`/`stagger`). Inherits `MotionConfig reducedMotion="user"` so reduced-motion users get opacity-only (product-catalog "Reduced motion preference").
      Acceptance: cards wrapped in 4.4 reveal on scroll without layout shift.
- [x] 4.2 Create `src/components/ui/Button.tsx` — primary/secondary variants with `whileTap` micro-interaction; forwards `onClick`/`disabled`/`type`; refs for RTL testing.
      Acceptance: hover/tap feedback; disabled state propagates (used by the add-to-cart guard and checkout guard).
- [x] 4.3 Create `src/components/ui/OptimizedImage.tsx` — single choke point for every product image: explicit `width`/`height` + fixed-ratio `aspect-[4/5]` container (CLS prevention); `loading="lazy"` + `decoding="async"` except the eager first carousel image (`fetchPriority="high"`); `onError` → Spanish placeholder ("Imagen no disponible"); component seam for a future `<picture>`/WebP layer (product-catalog "Broken image asset").
      Acceptance: broken src renders the placeholder, never the native broken-image icon.
- [x] 4.4 Create `src/components/catalog/ProductCard.tsx` — preview image (`imagenes[0]` via `OptimizedImage`), `nombre`, `descripcion_corta`, `formatARS(precio)`; wrapped in `Reveal`; motion hover; whole card is a `Link` → `/producto/${id}` (product-catalog "Card navigation").
- [x] 4.5 Create `src/components/catalog/CatalogGrid.tsx` — maps `products`; `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3` (1/2/3 columns, product-catalog "Responsive column count"); empty state in Spanish when `products.length === 0` (product-catalog "Empty catalog").
      Acceptance: renders exactly the validated products; empty list shows the Spanish message without crashing.
- [x] 4.6 Create `src/components/product/ImageCarousel.tsx` — `AnimatePresence`-animated transitions; `selectedIndex = 0` initially; prev/next + thumbnail controls hidden when `imagenes.length === 1`; zoom toggle that enlarges the selected image to a clearly useful level and toggles back off (product-catalog "Multi-image carousel navigation", "Single-image product", "Zoom toggle").
- [x] 4.7 Create `src/components/product/SizeSelector.tsx` — `splitSizes` groups labeled in Spanish ("Adulto" / "Niño"); exactly one selectable size, visually highlighted; product with a single group renders only that group (product-catalog "Selecting a size", "Adult-only product"); notifies parent with the canonical size.
- [x] 4.8 Create `src/components/layout/Header.tsx` — brand, cart control with line-count badge driven by `useCart()` (Phase 3), activates `setOpen(true)`. The drawer panel itself renders in Phase 6; in this PR the control flips the state flag, so pages stay composed.
      Acceptance: badge reflects cart line count after adds (verified in 5.8).
- [x] 4.9 RED/integration `src/components/product/ImageCarousel.test.tsx` — three images: forward/back navigation changes the image, first selected on initial render; single image: no nav controls, zoom still works; zoom toggle enlarges then restores; broken asset in one slot → placeholder in that slot while the rest of the carousel stays usable (product-catalog "Broken image asset").

## Phase 5: Pages, Routing & Head `[WU2]`

Consumes: Phases 2–4. Wires the app together; head hook included here because page integration tests assert head behavior (design's testing strategy), and pages depend on it.

- [x] 5.1 RED `src/hooks/useDocumentHead.test.tsx` — jsdom assertions: route A renders → title/meta reflect A; navigate to route B → title/meta reflect B and **no tag from A remains** (owned-tag `data-head-route` cleanup, site-seo "No stale metadata between routes"); `null` clears route tags; rich product data emits `og:title`/`og:description`/`og:image`/`og:url` + `twitter:title`/`twitter:description`/`twitter:image` (site-seo "Rich product share tags"). Fails to compile until 5.2 (RED).
- [x] 5.2 GREEN `src/hooks/useDocumentHead.ts` — `HeadData { title; description; image?; url? }`; sets `document.title`, `meta[description]`, the OG + Twitter families (both `og:` and `twitter:` derived from the same `HeadData`); manages only route-scoped tags marked `data-head-route`; removes previous route's owned tags on every call and on unmount — stale metadata between routes is impossible.
      Acceptance: 5.1 green.
- [x] 5.3 Create `src/pages/CatalogPage.tsx` — route `/`; renders `CatalogGrid`; installs catalog head data via `useDocumentHead` (catalog title/description, site-seo "Per-route head management").
- [x] 5.4 Create `src/pages/NotFoundPage.tsx` — Spanish not-found copy ("Página no encontrada") + link "Volver al catálogo"; not-found head data (product-catalog "Unknown or invalid id", site-seo "Not-found head").
- [x] 5.5 Create `src/pages/ProductDetailPage.tsx` — route `/producto/:id`; `getProductById(Number(id))`; known id → `descripcion_larga`, `ImageCarousel(imagenes)`, `SizeSelector(talles)`, `formatARS(precio)`, add-to-cart blocked (disabled + Spanish hint) until a size is selected, on add dispatches `addItem(productId, nombre, size, precio)` then `setOpen(true)` (product-catalog "Adding a size-selected product"); head = `title: nombre`, `description: descripcion_corta`, `image: resolveAssetUrl(imagenes[0])`, `url: <route>`; unknown id → renders `NotFoundPage` (`[TM-1]` safe behavior: never a crash, always the fallback + its own head).
- [x] 5.6 Create `src/App.tsx` (final) — `BrowserRouter` > `CartProvider` > `MotionConfig reducedMotion="user"` > `Header` + `Routes`: `/` → `CatalogPage`, `/producto/:id` → `ProductDetailPage`, `*` → `NotFoundPage`. Update `src/main.tsx` only if needed (mount `App`, `index.css` import already in Phase 1).
      Acceptance: SPA navigation works across all routes; `prefers-reduced-motion: reduce` disables non-essential motion via `MotionConfig` (product-catalog "Reduced motion preference").
- [x] 5.7 Integration `src/pages/CatalogPage.test.tsx` (RTL + user-event, wrapped in `MemoryRouter` + `CartProvider`) — renders every product from `src/data/products.json` (read-only) (10 cards at launch); each card shows preview image, name, short description, formatted price; clicking card 3 navigates to `/producto/3`; empty state appears (Spanish) when the products module yields `[]` (mock the module) (product-catalog "Catalog with ten products", "Empty catalog").
- [x] 5.8 Integration `src/pages/ProductDetailPage.test.tsx` (RTL, `MemoryRouter` with initial entry `/producto/1`) — known id renders long description, carousel, size groups, price, add control; unknown id `/producto/999` → not-found copy + link + not-found head (`[TM-1]` RED); add without size blocked (control disabled, no dispatch); with `L` selected, add dispatches `ADD_ITEM {productId, name, "L", price, qty 1}` and `SET_OPEN(true)` — assert via a probe context or the badge in `Header` (drawer panel itself arrives in Phase 6).

## Phase 6: Cart Drawer & WhatsApp Checkout UI `[WU3]`

Consumes: Phase 3 (context, cart/whatsapp utils), Phase 5 (App composition). Completes the shopping-cart and whatsapp-checkout capabilities end-to-end.

- [ ] 6.1 Create `src/components/cart/CartLineItem.tsx` — name, size badge, unit price (`formatARS`), increment/decrement quantity controls, remove control; decrement at qty 1 removes the line (shopping-cart "Quantity adjustment and removal").
- [ ] 6.2 Create `src/components/cart/CartSummary.tsx` — running total `formatARS(cartTotal(lines))`; WhatsApp checkout control as an anchor `buildWhatsAppUrl(buildCheckoutMessage(lines))` — `disabled` when empty (no `href`, never opens a link, whatsapp-checkout "Empty-cart checkout guard"); Spanish empty-cart message; copyable message preview (read-only textarea or clipboard copy via `navigator.clipboard`) with the exact `buildCheckoutMessage` output (whatsapp-checkout "Message visibility as fallback").
- [ ] 6.3 Create `src/components/cart/CartDrawer.tsx` — `AnimatePresence` slide-in from the side; backdrop overlay click and close control call `setOpen(false)` and never clear lines (shopping-cart "Close via backdrop without clearing"); full width on mobile (`w-full sm:w-[420px]`-style, shopping-cart "Mobile width"); renders `CartLineItem` list + `CartSummary`; empty state in Spanish + disabled checkout (shopping-cart "Empty drawer state"). Mounted in `src/App.tsx` (edit 5.6) inside `CartProvider`.
- [ ] 6.4 Integration `src/components/cart/CartDrawer.test.tsx` — open on add (item listed with name/size/price/qty); close via backdrop and via close control keeps the two lines and the total; empty cart → Spanish message + disabled checkout and activating the disabled control opens no link; mobile viewport → full-width class present (shopping-cart "Open on add-to-cart", "Fill-in" scenarios + whatsapp-checkout "Guarded checkout with empty cart").

## Phase 7: SEO Verification, CI/CD & Docs `[WU4]`

Consumes: everything. Makes the change shippable: proves the SEO spec scenarios, wires the Pages pipeline (the only PR that deploys), documents the user's operation manual, and runs the final gate.

- [ ] 7.1 SEO verification — inspect the built `dist/index.html` (read-only) after `npm run build` and confirm every site-seo "Initial document metadata" field: `<html lang="es">`, site title, description meta, `og:type=website`, `og:locale=es_AR`, `og:site_name`, site-level `og:image`, `twitter:card=summary_large_image`. Patch `index.html` if any field is missing.
      Acceptance: deployed document carries all fields (listed fields verified against the artifact).
- [ ] 7.2 SEO rich-tag verification — confirm the product route DOM contains `og:title`/`twitter:title` = product name, `og:description`/`twitter:description` = short description, `og:image`/`twitter:image` = first image resolved absolute (via `resolveAssetUrl`), `og:url` = the `/producto/:id` route (site-seo "Rich product share tags", "Shareable URL fidelity"). Extend `src/hooks/useDocumentHead.test.tsx` (edit 5.1) if any assertion is missing; `resolveAssetUrl` must be used by `ProductDetailPage` (5.5 sets `image` from it).
      Acceptance: spec scenarios covered by green tests; no gaps found.
- [ ] 7.3 Create `.github/workflows/deploy.yml` — triggers: push to `main` + `workflow_dispatch`. Build job: `actions/checkout@v4`, `actions/setup-node@v4` pinned 22 (matches `engine` in `package.json`, ci-deployment "Pinned runtime"), `npm ci`, `npm run lint`, `npm test`, `npm run build` (any failure stops the job before deploy — ci-deployment "Failing lint blocks deploy"/"Failing tests block deploy"), then artifact verification: `test -f dist/index.html && test -f dist/404.html && cmp -s dist/index.html dist/404.html && test -d dist/assets && test -n "$(ls -A dist/assets)"` (fail-closed, `[TM-1]`+`[TM-2]` RED; ci-deployment "Broken artifact fails before deploy"), then `actions/upload-pages-artifact@v3` (path `dist`). Deploy job: `needs: build`, `permissions: contents: read / pages: write / id-token: write` (`[TM-3]` minimal grant, verified at review-time), `environment: github-pages`, `actions/deploy-pages@v4`. Header comment documenting the one-time manual step: repo Settings → Pages → Source "GitHub Actions"; `BASE_PATH` derives from `github.event.repository.name` (design anti-hardcode decision).
      Acceptance: workflow file self-contained; `BASE_PATH: /${{ github.event.repository.name }}/` injected in the build step's `env`.
- [ ] 7.4 Shell/asset-boundary verification `[TM-2]` — locally: `BASE_PATH=/x/ npm run build` (writes `dist/`) then assert built asset URLs in `dist/index.html` (read-only) start with `/x/`; delete `dist/index.html` (read-only-adjacent generated artifact) and confirm `npm run build` fails non-zero (copy-404 throw). Document both checks in `README.md`.
      Acceptance: prefixed assets under an injected base; missing shell file fails the build — same behavior CI relies on.
- [ ] 7.5 Create `README.md` — user-facing operation manual: `products.json` schema (every field, canonical sizes, image path rules) + the edit→commit→push→Pages auto-rebuild workflow; iPhone 16 Pro Max photo export/compression steps (JPEG sRGB q≈80 ≤1600 px); WhatsApp number constant note (`src/utils/whatsapp.ts`); GH Pages one-time setup; manual deep-link checklist post-deploy (open `/producto/1` directly in an incognito window — must render the detail page, `[TM-1]` E2E row); rollback = `git revert` (pipeline redeploys previous green build). English document, Spanish UI quotes where needed.
      Acceptance: a non-technical owner can refresh stock and deploy from the README alone.
- [ ] 7.6 Final gate (WU4) — from a clean `npm ci`, run `npm run lint && npm test && npm run build`; assert `dist/index.html` + `dist/404.html` byte-equal and `dist/assets` non-empty (`cmp` on (read-only) outputs). This mirrors the CI sequence exactly (ci-deployment "Green push deploys").
      Acceptance: full suite green; artifact complete; ready for the first push to `main`.

---

## Notes for the orchestrator

- **Decision required before apply**: ask the user which chain strategy (recommended: stacked-to-main) per the Review Workload Forecast above.
- `openspec/config.yaml` does not exist in this repo; no `rules.tasks` or test-command overrides applied. Consider `sdd-init` to create it before apply (non-blocking).
- Design note: product images for the 10 initial products are user-supplied; until they land in `public/images/products/`, `OptimizedImage` shows the Spanish placeholder — catalog remains fully functional (documented).
