Product photos live in this directory. File names must match the `imagenes`
paths in src/data/products.json exactly.

Workflow (iPhone 16 Pro Max export):
1. Take product photos in good daylight.
2. Export each photo as JPEG, sRGB color profile, quality ~80.
3. Resize so the longest edge is at most 1600 px (aims for ~200-400 KB per file).
4. Save with the exact file name referenced in the JSON, e.g. 1-1.jpg for
   "imagenes": ["/images/products/1-1.jpg"].
5. Commit and push to main — the Pages pipeline redeploys the catalog
   automatically.

Until a photo lands here, the app renders the Spanish placeholder
("Imagen no disponible") and the catalog stays fully functional.