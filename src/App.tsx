import { BrowserRouter, Route, Routes } from "react-router";
import { MotionConfig } from "motion/react";
import { Header } from "./components/layout/Header";
import { CartProvider } from "./context/CartContext";
import { CatalogPage } from "./pages/CatalogPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";

/**
 * Application shell (design "Application composition"): React Router above
 * the cart provider above the motion config — the providers that every page
 * needs. The header is rendered by every route; pages install their own head
 * data (site-seo "Per-route head management").
 *
 * Routes: `/` catalog, `/producto/:id` product detail, `*` not-found.
 */
function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <MotionConfig reducedMotion="user">
          <div className="flex min-h-screen flex-col bg-paper">
            <Header />
            <Routes>
              <Route path="/" element={<CatalogPage />} />
              <Route path="/producto/:id" element={<ProductDetailPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </MotionConfig>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
