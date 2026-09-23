# Product Catalog Specification

## Purpose

Defines the catalog experience: the responsive product grid on the home route (`/`), the product detail page at `/producto/:id` with image carousel with zoom, size selector, and add-to-cart interaction, plus the motion requirements for the catalog surfaces. This capability consumes validated products from `product-data` and dispatches cart actions consumed by `shopping-cart`. No color variants exist: jerseys are chosen by size only.

## Requirements

### Requirement: Catalog route and responsive grid

The system MUST render the home route `/` as a responsive grid of product cards, one card per validated product in the data source. The grid MUST show 1 column on mobile viewports, 2 columns on medium viewports, and 3 columns on desktop viewports. Each card MUST show the product preview image (first entry of `imagenes`), `nombre`, `descripcion_corta`, and the price formatted with the shared ARS formatter. Clicking a card MUST navigate to the product's detail route `/producto/:id`.

#### Scenario: Catalog with ten products

- GIVEN a validated data source with 10 products
- WHEN the user opens the home route `/`
- THEN exactly 10 product cards are rendered
- AND each card shows the preview image, name, short description, and formatted price

#### Scenario: Responsive column count

- GIVEN a catalog with at least 3 products
- WHEN the page is rendered at mobile, medium, and desktop viewport widths
- THEN the grid computes 1 column on mobile, 2 on medium, and 3 on desktop

#### Scenario: Empty catalog

- GIVEN a data source with no valid products (empty file or all entries invalid)
- WHEN the user opens the home route `/`
- THEN the grid renders no cards and shows an empty-state message in Spanish
- AND the application does not crash

#### Scenario: Card navigation

- GIVEN a catalog with a product whose `id` is `3`
- WHEN the user clicks that product's card
- THEN the application navigates to `/producto/3`

### Requirement: Product detail route

The system MUST expose the route `/producto/:id` for product detail. For a known id, the page MUST render the product's `descripcion_larga`, the image carousel over all entries of `imagenes`, the size selector over all entries of `talles` in canonical format, the formatted price, and an add-to-cart control. The id in the URL MUST match the product's numeric `id`.

#### Scenario: Known product

- GIVEN a validated product with id `1`
- WHEN the user navigates to `/producto/1`
- THEN the detail page renders the long description, carousel, size selector, price, and add-to-cart control for that product

#### Scenario: Unknown or invalid id

- GIVEN the route `/producto/999` where no product has id `999`
- WHEN the user opens the route
- THEN a not-found state is rendered with a link back to the catalog
- AND the application does not crash
- AND the document head reflects the not-found state (see site-seo)

#### Scenario: Direct load of a deep link

- GIVEN the deployed site serves the SPA at path `/producto/1` (via the 404 fallback)
- WHEN the user loads that URL directly (refresh or shared link)
- THEN the product detail page for product `1` renders correctly

### Requirement: Image carousel with zoom

The system MUST render the product images as a carousel on the detail page, letting the user navigate between images (previous/next and/or thumbnails) with smooth animated transitions. The first image MUST be initially selected. The system MUST provide a zoom interaction on the selected image: activating zoom MUST enlarge the image to a clearly useful viewing level, and zoom MUST be toggleable off. A carousel with a single image MUST render without navigation controls and MUST still support zoom.

#### Scenario: Multi-image carousel navigation

- GIVEN a product with three entries in `imagenes`
- WHEN the user navigates forward and then backward in the carousel
- THEN the displayed image changes accordingly
- AND the first image was selected on initial render
- AND the image transitions are animated

#### Scenario: Single-image product

- GIVEN a product with exactly one image
- WHEN the detail page renders
- THEN the carousel shows the image without previous/next or thumbnail controls
- AND zoom still works on the single image

#### Scenario: Zoom toggle

- GIVEN a product detail page with a selected image
- WHEN the user activates zoom and then deactivates it
- THEN the image enlarges while zoom is active
- AND it returns to its normal size when zoom is deactivated

#### Scenario: Broken image asset

- GIVEN a product whose `imagenes` entry points to a missing or unreadable file
- WHEN the detail page renders
- THEN the affected slot shows a placeholder instead of a broken-image icon
- AND the rest of the carousel remains usable

### Requirement: Size selector

The system MUST render the size selector on the detail page from the product's `talles` in canonical format, presenting adult sizes (`S`, `M`, `L`, `XL`, `XXL`) and kids sizes (`NIÑO-<n>`) as distinct groups labeled in Spanish. The user MUST select exactly one size; the selected size MUST be visually highlighted. Adding to cart MUST NOT be possible without a selected size. A product with only one size group MUST render that group only.

#### Scenario: Selecting a size

- GIVEN a product with adult and kids sizes
- WHEN the user selects a size (e.g. `L`)
- THEN that size is marked as selected
- AND no other size is selected at the same time

#### Scenario: Attempted add without a size

- GIVEN a product detail page where no size is selected
- WHEN the user attempts to add the product to the cart
- THEN the action is blocked (control disabled or a Spanish prompt to select a size)
- AND no cart action is dispatched

#### Scenario: Adult-only product

- GIVEN a product whose `talles` contains only `["S", "M", "L", "XL", "XXL"]`
- WHEN the detail page renders
- THEN the selector shows only the adult group
- AND the kids group is not rendered

### Requirement: Add to cart interaction

The system MUST dispatch an add-to-cart action carrying the product id, name, selected size, unit price, and quantity 1 when the user has selected a size and triggers the add control. On a successful add, the cart drawer MUST open showing the added line item. Aggregation of repeated adds is handled by `shopping-cart`.

#### Scenario: Adding a size-selected product

- GIVEN a detail page with size `L` selected and price `45000`
- WHEN the user triggers the add-to-cart control
- THEN a cart add action with product id, name, size `L`, unit price `45000`, and quantity 1 is dispatched
- AND the cart drawer opens showing the item

### Requirement: Catalog motion and animation

The system MUST apply fluid, modern motion to catalog surfaces: scroll-reveal animations for catalog cards as they enter the viewport, smooth animated transitions between carousel images, and micro-interactions (hover/active feedback) on cards and controls. Animation MUST use compositor-friendly properties (transform and opacity) and MUST render consistently on mobile and desktop. The system SHOULD respect the `prefers-reduced-motion` user preference by disabling non-essential motion.

#### Scenario: Scroll reveal on catalog

- GIVEN the home route with product cards
- WHEN the user scrolls the page
- THEN cards entering the viewport reveal with a smooth animated transition (fade/slide)

#### Scenario: Reduced motion preference

- GIVEN a user whose environment signals `prefers-reduced-motion: reduce`
- WHEN the catalog or detail page renders
- THEN non-essential motion is disabled or substantially reduced
- AND the page remains fully usable

### Requirement: Spanish UI copy

All user-facing copy in the catalog capability (cards, empty states, not-found page, control labels, size group labels, size-selection prompts) MUST be in Spanish. Code identifiers, file names, and comments remain in English.

#### Scenario: Empty and not-found states in Spanish

- GIVEN an empty catalog or a not-found route
- WHEN the page renders
- THEN the empty-state message, the not-found message, and all control labels are presented in Spanish
