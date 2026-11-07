import { defineConfig } from "vitest/config";

// Unit + contract tests for the pure domain and the service layer.
// DB-backed persistence tests are gated on DATABASE_URL inside the test files.
export default defineConfig({
  test: {
    include: ["packages/*/test/**/*.test.ts"],
    environment: "node",
    pool: "forks"
  }
});
