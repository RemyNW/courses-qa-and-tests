import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      all: true,
      include: [
        "src/**/*.service.js",
        "src/shared/**/*.js",
        "src/modules/**/*.js"
      ],
      exclude: [
        "**/*.test.js",
        "src/infrastructure/db.js"
      ],
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
});
