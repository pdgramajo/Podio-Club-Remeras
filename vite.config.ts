import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// BASE_PATH is injected by the GitHub Pages deploy workflow (e.g.
// "/podio-club-landing/") so production assets resolve under the Pages
// subpath without hardcoding a repo name. Local dev keeps the default "/".
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.BASE_PATH ?? "/",
});