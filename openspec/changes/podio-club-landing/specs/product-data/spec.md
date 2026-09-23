# Product Data Specification

## Purpose

Defines the contract for the product catalog data source (`src/data/products.json`), the canonical formats for the fields the user edits by hand (sizes, prices, images), the runtime validation applied when data loads, and the graceful per-product fallback behavior when hand-editing introduces errors. This capability is the single source of truth for how product data is structured and validated; catalog, cart, and checkout capabilities consume only validated products.

## Requirements

### Requirement: Product data source format

The system MUST load the product catalog from a single JSON data source at `src/data/products.json` containing an array of product objects. Each product object MUST conform to the following schema:

- `id`: a unique positive integer
- `nombre`: a non-empty string (product name)
- `descripcion_corta`: a non-empty string (short description)
- `descripcion_larga`: a non-empty string (long description)
- `tipo_tela`: a string (fabric type, e.g. "dry-fit")
- `numero_espalda`: a boolean or a positive integer (whether the jersey has a back number, or the back number itself)
- `tipo`: exactly one of `"jugador"` or `"hincha"`
- `imagenes`: a non-empty array of strings, each a relative path to an image file; the first image is the card preview (and the detail default)
- `precio`: a non-negative integer number of ARS pesos (no decimals, no currency symbols)
- `talles`: a non-empty array of strings in the canonical size format (see Requirement: Canonical size format)

The data source MUST be bundled with the application (no runtime network fetch); the file ships with the build and stock refresh happens through the push-to-main deployment pipeline.

#### Scenario: Fully valid product entry

- GIVEN a catalog entry with every field present and valid according to the schema
- WHEN the data source is loaded
- THEN the entry is accepted as a valid product
- AND all fields are available to the application in their declared types

#### Scenario: Schema violations in a single entry

- GIVEN a catalog entry that violates the schema (e.g. negative `precio`, empty `imagenes`, missing `nombre`, or `tipo` other than "jugador"/"hincha")
- WHEN the data source is loaded
- THEN the entry is rejected as invalid
- AND the application proceeds without it (see Requirement: Per-product fallback on invalid entries)

#### Scenario: `numero_espalda` as boolean or number

- GIVEN an entry where `numero_espalda` is `true` and another where it is `10`
- WHEN the data source is loaded
- THEN both entries are accepted
- AND each value is preserved without conversion

#### Scenario: Duplicate product ids

- GIVEN two entries with the same `id`
- WHEN the data source is loaded
- THEN the first occurrence is kept
- AND the duplicate entry is rejected with a descriptive console warning

### Requirement: Canonical size format

The system MUST use exactly one canonical format for sizes across validation, the size selector, the cart, and the WhatsApp checkout message:

- Adult sizes: uppercase strings from the exact set `S`, `M`, `L`, `XL`, `XXL`
- Kids sizes: the pattern `NIÑO-<n>` where `<n>` is a positive integer (e.g. `NIÑO-6`, `NIÑO-8`)

Any size string in `talles` that does not match one of these forms MUST be treated as invalid for the purposes of validation.

#### Scenario: Valid adult and kids sizes

- GIVEN a product whose `talles` contains `["S", "M", "L", "XL", "XXL", "NIÑO-6", "NIÑO-8"]`
- WHEN the data source is loaded
- THEN the product passes validation with all seven sizes preserved in order

#### Scenario: Non-canonical size string

- GIVEN a product whose `talles` contains a size outside the canonical format (e.g. `"UNICO"`, `"M-42"`, or lowercase `"s"`)
- WHEN the data source is loaded
- THEN the product is rejected as invalid
- AND the per-product fallback is applied

### Requirement: Type safety for product data

The system MUST define TypeScript interfaces that mirror the product schema (a `Product` type and a product-size type), and MUST validate the loaded data against those interfaces with a runtime guard at load time, so a hand-edited JSON file cannot inject values that silently violate the assumed types.

#### Scenario: Type mismatch at runtime

- GIVEN a catalog entry where a field has the wrong type (e.g. `precio` as the string `"45000"` or `id` as a string)
- WHEN the data source is loaded
- THEN the entry is rejected by the runtime guard
- AND the per-product fallback is applied instead of a runtime crash

### Requirement: Per-product fallback on invalid entries

The system MUST NOT crash, blank the catalog, or block the page when a product entry or the whole data source fails validation. Invalid individual entries MUST be excluded from the catalog, the product detail route, and the cart; the remaining valid products MUST render normally. A malformed data source (invalid JSON syntax or a root that is not an array) MUST result in the empty catalog state with a descriptive error logged to the console — never in an application crash.

#### Scenario: One invalid product among valid ones

- GIVEN a data source with 10 entries where 1 fails validation
- WHEN the data source is loaded
- THEN the catalog renders 9 products
- AND the invalid product is not reachable on its detail route
- AND a descriptive error is logged to the console

#### Scenario: Malformed JSON syntax

- GIVEN a data source file whose content is not valid JSON
- WHEN the data source is loaded
- THEN the application renders the empty catalog state
- AND a descriptive parse error is logged to the console
- AND the application does not crash

### Requirement: ARS price representation

The system MUST store and treat `precio` as an integer number of ARS pesos with no decimals, currency symbols, or thousand separators in the JSON. Formatting MUST be applied only at render time by the single shared formatter (see Requirement: Single ARS price formatter); the stored value MUST never be rewritten or converted during load.

#### Scenario: Stored price is a plain integer

- GIVEN a product with `"precio": 45000`
- WHEN the product is rendered on any surface (card, detail, cart, checkout message)
- THEN the value used for computation remains the integer `45000`
- AND each surface applies only display formatting on top of it

### Requirement: Single ARS price formatter

The system MUST expose exactly one shared currency formatter for prices, implemented with `Intl.NumberFormat` using locale `es-AR` and currency `ARS`, rendering prices with the thousands separator `.` and decimals `,` (e.g. integer `45000` renders as `$45.000,00`). Every price displayed in the catalog, the product detail page, the cart drawer, and the WhatsApp checkout message MUST be produced by this single formatter.

#### Scenario: Formatting a typical ARS price

- GIVEN an integer price of `45000`
- WHEN the shared formatter is applied
- THEN the output is `$45.000,00` (ARS symbol, `.` thousands separator, `,` decimals)

#### Scenario: Seven-digit price

- GIVEN an integer price of `1250000`
- WHEN the shared formatter is applied
- THEN the output uses the `.` thousands separator correctly (`$1.250.000,00`)

#### Scenario: Single source for totals and messages

- GIVEN a non-empty cart
- WHEN the cart total and the WhatsApp checkout total are rendered
- THEN both values come from the same formatter
- AND there is no currency or scale drift between them
