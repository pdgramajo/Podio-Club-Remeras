/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  // NOTE: the key is setupFilesAfterEnv (the tasks.md draft wrote
  // "setupFilesAfterEach" — not a valid Jest option).
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "\\.(css|less|scss)$": "<rootDir>/test/styleMock.js",
    // src/utils/viteEnv.ts uses import.meta.env.BASE_URL (Vite-only); under
    // this CommonJS program import.meta cannot compile, so the dev default
    // is substituted with a "/" stub matching Vite's local BASE_URL.
    "^\\./viteEnv$": "<rootDir>/test/viteEnv.ts",
  },
  transform: {
    "^.+\\.[tj]sx?$": ["ts-jest", { tsconfig: "tsconfig.test.json" }],
  },
  // motion ships ESM; without this, tests importing motion components
  // (cart drawer, carousel) break under the CommonJS pipeline.
  transformIgnorePatterns: ["/node_modules/(?!(motion)/)"],
  passWithNoTests: true,
};
