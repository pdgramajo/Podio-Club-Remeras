import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BackToTop } from "./BackToTop";

describe("BackToTop", () => {
  let scrollTo: jest.Mock;

  beforeEach(() => {
    scrollTo = jest.fn();
    Object.defineProperty(window, "scrollTo", {
      value: scrollTo,
      configurable: true,
      writable: true,
    });
    // jest.setup.ts installs a writable matchMedia stub; assign per-test here.
    window.matchMedia = jest.fn().mockReturnValue({ matches: false });
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 0,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /** Sets the mocked window.scrollY and dispatches a scroll event. */
  function scrollToY(y: number): void {
    Object.defineProperty(window, "scrollY", { configurable: true, writable: true, value: y });
    fireEvent.scroll(window);
  }

  it("is hidden on first paint (no scroll yet)", () => {
    render(<BackToTop />);
    expect(screen.queryByTestId("back-to-top")).not.toBeInTheDocument();
  });

  it("appears after scrolling past the threshold and hides again near the top", async () => {
    render(<BackToTop />);

    scrollToY(100);
    expect(screen.queryByTestId("back-to-top")).not.toBeInTheDocument();

    scrollToY(600);
    expect(screen.getByTestId("back-to-top")).toBeInTheDocument();

    scrollToY(0);
    // AnimatePresence removes the node only after the exit animation finishes.
    await waitFor(() => {
      expect(screen.queryByTestId("back-to-top")).not.toBeInTheDocument();
    });
  });

  it("smooth-scrolls back to the top on click", async () => {
    const user = userEvent.setup();
    render(<BackToTop />);
    scrollToY(600);

    await user.click(screen.getByRole("button", { name: "Volver arriba" }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("scrolls instantly when the user prefers reduced motion", async () => {
    const user = userEvent.setup();
    window.matchMedia = jest.fn().mockReturnValue({ matches: true });

    render(<BackToTop />);
    scrollToY(600);

    await user.click(screen.getByRole("button", { name: "Volver arriba" }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
  });
});
