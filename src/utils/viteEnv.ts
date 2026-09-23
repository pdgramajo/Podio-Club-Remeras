/**
 * Vite-only module: exports the deploy base path from `import.meta.env`.
 * Vite statically replaces `import.meta.env.BASE_URL` in app builds
 * (default "/", "/repo/" on GH Pages under BASE_PATH), so this value is a
 * build-time constant. It is deliberately isolated in its own module: under
 * the jest/ts-jest program (CommonJS) `import.meta` cannot compile, so
 * jest.config.cjs maps this module to test/viteEnv.ts (a "/" stub matching
 * the local dev default). The rest of the app only ever consumes the
 * constant, never the meta-property.
 */
export const BASE_URL: string = import.meta.env.BASE_URL;
