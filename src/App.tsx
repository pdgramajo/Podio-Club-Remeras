import { BrowserRouter, Route, Routes } from "react-router";
import { MotionConfig } from "motion/react";
import { AddToCartToast } from "./components/cart/AddToCartToast";
import { CartDrawer } from "./components/cart/CartDrawer";
import { Header } from "./components/layout/Header";
import { CartProvider } from "./context/CartContext";
import { BackToTop } from "./components/ui/BackToTop";
import { CatalogPage } from "./pages/CatalogPage";
import { LandingPage } from "./pages/LandingPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { BASE_URL } from "./utils/viteEnv";

/**
 * Application shell (design "Application composition"): React Router above
 * the cart provider above the motion config — the providers that every page
 * needs. The header is rendered by every route and the cart drawer overlays
 * the whole app (its own MotionConfig + AnimatePresence inherit
 * reducedMotion="user" from here); pages install their own head data
 * (site-seo "Per-route head management").
 *
 * Routes:
 * - `/` landing page (brand-first experience)
 * - `/catalogo` full catalog grid
 * - `/producto/:id` product detail
 * - `*` not-found
 *
 * The router basename comes from Vite's BASE_URL (build-time constant): the
 * local dev server serves at "/", GitHub Pages at "/<repo>/" via BASE_PATH in
 * the deploy workflow. React Router strips a trailing slash from basename, so
 * only the assets and the initial pathname stay under the deploy subpath.
 */
// React Router rejects a bare trailing-slash basename; normalize "/repo/" →
// "/repo" while keeping the dev root as "/".
const BASENAME = BASE_URL.length > 1 ? BASE_URL.replace(/\/$/, "") : BASE_URL;

function App() {
  return (
    <BrowserRouter basename={BASENAME}>
      <CartProvider>
        <MotionConfig reducedMotion="user">
          <div className="flex min-h-screen flex-col bg-paper">
            <Header />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/catalogo" element={<CatalogPage />} />
              <Route path="/producto/:id" element={<ProductDetailPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <CartDrawer />
            <AddToCartToast />
            <BackToTop />
          </div>
        </MotionConfig>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
