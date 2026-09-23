// SPA 404 fallback for GitHub Pages (ci-deployment "SPA 404 fallback").
// Copies dist/index.html -> dist/404.html so deep links (/producto/:id)
// serve the SPA shell on refresh instead of a GitHub 404 page.
//
// Strictly invoked as `node scripts/copy-404.mjs` from the build script —
// never chmod +x / direct execution (see design threat matrix TM-4).
// Fails closed: missing dist/index.html aborts the build with a clear error
// (TM-2 shell-boundary behavior), so CI never deploys a broken artifact.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");
const indexHtml = path.join(distDir, "index.html");
const fallbackHtml = path.join(distDir, "404.html");

let shell;
try {
  shell = readFileSync(indexHtml);
} catch {
  console.error(
    `copy-404: missing ${indexHtml}. Run "vite build" first; the 404 fallback cannot be produced.`,
  );
  process.exit(1);
}

writeFileSync(fallbackHtml, shell);
console.log(`copy-404: wrote ${fallbackHtml} (byte-identical copy of index.html)`);