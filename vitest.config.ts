import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@commandlab/content-schema": path.resolve(__dirname, "packages/content-schema/src/index.ts"),
      "@commandlab/practice-runtime": path.resolve(
        __dirname,
        "packages/practice-runtime/src/index.ts",
      ),
      "@commandlab/ui": path.resolve(__dirname, "packages/ui/src/index.tsx"),
      "@": path.resolve(__dirname, "apps/web/src"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["packages/**/*.ts", "apps/web/src/lib/**/*.ts"],
    },
  },
});
