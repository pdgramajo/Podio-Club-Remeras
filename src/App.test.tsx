import { render, screen } from "@testing-library/react";
import App from "./App";

/**
 * App shell integration (design "Application composition"): the router must
 * honor Vite's BASE_URL as basename so GitHub Pages deploys under
 * "/<repo>/" resolve the same routes as local dev at "/". Regression: a
 * subpath deployment without basename sent every request to NotFoundPage.
 *
 * The real app never mounts in a browser here (jsdom); the route assertions
 * pin the shell behavior that the live browser depends on.
 */
jest.mock("./utils/viteEnv", () => ({ BASE_URL: "/Podio-Club-Remeras/" }));

describe("App (route shell)", () => {
  it("renders the landing at the deploy subpath root, not the not-found page", () => {
    window.history.pushState({}, "", "/Podio-Club-Remeras/");
    render(<App />);

    expect(screen.getByText("VESTITE")).toBeInTheDocument();
    expect(screen.queryByText(/La página que buscás no existe/)).not.toBeInTheDocument();
  });

  it("lands the not-found page on an unknown route", () => {
    window.history.pushState({}, "", "/Podio-Club-Remeras/ruta-inexistente");
    render(<App />);

    expect(screen.getByText(/La página que buscás no existe/)).toBeInTheDocument();
  });
});
