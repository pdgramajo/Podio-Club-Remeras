import "@testing-library/jest-dom";

/**
 * jsdom (v20) does not implement matchMedia, IntersectionObserver,
 * requestAnimationFrame or TextEncoder/TextDecoder. motion's MotionConfig
 * queries matchMedia, scroll reveals use IntersectionObserver, every
 * animation drives rAF, and react-router v7 builds stream URLs with the
 * encoders, so the test environment stubs all five APIs. The stubs are
 * inert: reduced-motion resolves to "no-preference" (animations stay
 * enabled in tests), and the IO stub never fires, which keeps whileInView
 * content rendered at its initial styles — exactly as the DOM probes in the
 * component tests expect.
 */
if (typeof globalThis.TextEncoder === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TextEncoder, TextDecoder } = require("util");
  Object.assign(globalThis, { TextEncoder, TextDecoder });
}

if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  });
}

if (typeof window !== "undefined" && !window.requestAnimationFrame) {
  window.requestAnimationFrame = (callback: FrameRequestCallback): number =>
    window.setTimeout(() => callback(Date.now()), 16);
  window.cancelAnimationFrame = (handle: number): void => window.clearTimeout(handle);
}

if (typeof window !== "undefined" && !window.IntersectionObserver) {
  class IntersectionObserverStub implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = "0px";
    readonly thresholds: ReadonlyArray<number> = [];

    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    value: IntersectionObserverStub,
  });
}
