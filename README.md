# Podio Club Landing

Landing page for Podio Club replica football jerseys with a WhatsApp checkout. Built with
Vite + React 19 + TypeScript, styled with Tailwind CSS v4, deployed to GitHub Pages.

The product catalog is a hand-edited JSON file (`src/data/products.json`). You update stock
by editing that file and pushing to `main` — the Pages pipeline rebuilds and redeploys the
site automatically.

## Requirements

- Node.js 22 (the project pins `engines: "22"`, and CI uses the same version).

## Commands

| Command          | What it does                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------- |
| `npm install`    | Install dependencies (same as `npm ci` locally).                                            |
| `npm run dev`    | Start the local dev server (http://localhost:5173).                                         |
| `npm test`       | Run the Jest test suite.                                                                    |
| `npm run lint`   | Run ESLint.                                                                                 |
| `npm run format` | Format all files with Prettier.                                                             |
| `npm run build`  | Type-check, build with Vite, then copy `dist/index.html` to `dist/404.html` (SPA fallback). |

A pre-commit hook runs lint-staged (ESLint + Prettier on staged files) and the full test
suite, so a broken commit never lands.

## Project structure

```
├── index.html                 # SPA shell: site-wide SEO metadata (lang, title, OpenGraph defaults)
├── public/images/products/    # Product photos (see "Adding or changing product photos")
├── scripts/copy-404.mjs       # Build step that produces the SPA 404 fallback
├── .github/workflows/deploy.yml   # Pages pipeline: lint → test → build → verify → deploy
└── src/
    ├── data/products.json     # ← the product catalog you edit
    ├── data/products.ts       # Runtime guard: validates the JSON into typed products
    ├── types/product.ts       # Product / CartLine types
    ├── context/CartContext.tsx    # Cart state (Context + useReducer)
    ├── state/cartReducer.ts       # Pure cart reducer (unit-tested)
    ├── hooks/useDocumentHead.ts   # Per-route title/meta manager (SEO)
    ├── utils/                 # Formatting, sizes, cart totals, WhatsApp message, asset paths
    ├── components/            # UI: layout, catalog, product detail, cart drawer
    └── pages/                 # Catalog, product detail, and not-found routes
```

## Editing the product catalog

Edit `src/data/products.json`. Every product is an object with these fields:

| Field               | Type                     | Notes                                                                                    |
| ------------------- | ------------------------ | ---------------------------------------------------------------------------------------- |
| `id`                | positive integer         | Unique. The catalog links `/producto/{id}` to this value.                                |
| `nombre`            | string                   | Product name (also used as the share title).                                             |
| `descripcion_corta` | string                   | Short description (also used as the share description).                                  |
| `descripcion_larga` | string                   | Full description shown on the product page.                                              |
| `tipo_tela`         | string                   | Fabric label (e.g. `"dry-fit"`).                                                         |
| `numero_espalda`    | `true` / `false` / int   | `true` = has a back number, `false` = none, or the number itself (e.g. `10`).            |
| `tipo`              | `"jugador"` / `"hincha"` | Player (jugador) or fan (hincha) version.                                                |
| `imagenes`          | non-empty string array   | Paths starting with `/images/products/`; the first entry is the card preview.            |
| `precio`            | integer (ARS)            | Plain number, no decimals, symbols, or separators (e.g. `45000` = $45.000,00).           |
| `talles`            | non-empty string array   | Canonical sizes only: `S`, `M`, `L`, `XL`, `XXL` and/or `NIÑO-<number>` (e.g. `NIÑO-8`). |

Rules:

- An invalid entry (wrong type, empty image list, non-canonical size, duplicate `id`, …) is
  **dropped at runtime** with a warning in the console — the rest of the catalog keeps
  working, but the product simply won't appear. Fix the JSON to bring it back.
- The first image in `imagenes` is the catalog card preview and the share image.
- `precio` is integer Argentine pesos — the app formats it (`$45.000,00`), do not write
  the symbol or thousand separators.
- Size names are case-sensitive (`S`, not `s`; `NIÑO-8`, not `nino-8`).

### Update workflow

1. Edit `src/data/products.json` (and add photos — see below).
2. `npm test` and `npm run build` locally if you want to check first.
3. Commit and push to `main`. The Pages pipeline rebuilds and redeploys automatically.

## Adding or changing product photos

Photos live in `public/images/products/` and the file names must match the `imagenes`
paths in the JSON exactly (e.g. `/images/products/1-1.jpg` → `public/images/products/1-1.jpg`).

Workflow (iPhone 16 Pro Max export):

1. Take product photos in good daylight.
2. Export each photo as **JPEG**, **sRGB** color profile, quality ~80.
3. Resize so the longest edge is at most **1600 px** (aims for ~200–400 KB per file).
4. Save with the exact file name referenced in the JSON.
5. Commit and push to `main` — the pipeline redeploys the catalog.

Until a photo lands, the app renders the Spanish placeholder ("Imagen no disponible") and
the catalog stays fully functional.

## WhatsApp number

The checkout deep link is built from a single constant in `src/utils/whatsapp.ts`:

```ts
export const WHATSAPP_NUMBER = "5493884372397"; // single source of truth; no env
```

Change it there if the number ever changes — the message preview and the `wa.me` link
update everywhere at once.

## Deployment (GitHub Pages)

### One-time setup

1. Create the GitHub repository for this project and push `main`.
2. In the repository: **Settings → Pages → Source: "GitHub Actions"**.
3. The first push to `main` runs the pipeline and deploys the site.

### How it works

- The workflow `.github/workflows/deploy.yml` runs on every push to `main` (and on manual
  "workflow_dispatch" runs): `npm ci` → lint → test → build → artifact verification →
  deploy. Any failing step stops the job — a broken build never reaches Pages.
- The asset base path is derived from the repository name (`BASE_PATH=/<repo>/`), so all
  scripts, styles, and images resolve under the Pages subpath automatically.
- A `404.html` copy of the SPA shell is shipped with every build, so product deep links
  (`/producto/1`) keep working on refresh instead of showing a GitHub 404.

### After first deploy

- The site-level `og:image` in `index.html` is a placeholder (`/og-cover.svg`). Replace
  its `content` (and `twitter:image`) with the absolute URL
  `https://<owner>.github.io/<repo>/og-cover.svg` once the site is live — product-level
  share images are already absolute.

### Post-deploy deep-link checklist

After the first deploy, open each of these in an **incognito window**:

1. `https://<owner>.github.io/<repo>/` — the catalog renders.
2. `https://<owner>.github.io/<repo>/producto/1` — the product detail page renders
   directly (no GitHub 404), including on refresh.
3. Share a product link on WhatsApp — the preview shows the product name, short
   description, and image (OpenGraph tags).

## Rollback

Rollback is a plain `git revert` of the offending push: push the revert to `main` and the
pipeline redeploys the previous green build automatically. No other action needed.

## Build verification (local equivalent of the CI gate)

Two checks mirror what CI does before deploying; both were used to validate this project:

1. **Asset base path**: `BASE_PATH=/x/ npm run build`, then confirm every loadable asset
   reference in `dist/index.html` (script `src`, link `href`) starts with `/x/` and that
   `dist/404.html` is byte-identical to `dist/index.html`.
2. **Fail-closed copy step**: `rm dist/index.html && node scripts/copy-404.mjs` exits
   non-zero with a clear message — the build chain stops if the SPA shell is missing.
   (Note: a full `npm run build` regenerates `dist/index.html`, so the fail-closed
   guarantee lives in the copy step itself, which `npm run build` runs last.)
