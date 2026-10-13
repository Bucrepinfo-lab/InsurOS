import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root so stray lockfiles elsewhere on the machine
  // (e.g. a package-lock.json in the user profile) cannot break module
  // resolution under Turbopack.
  turbopack: {
    root: path.join(__dirname, "..", ".."),
  },
  // Standalone output for a minimal Docker/Fly runtime image.
  output: "standalone",
  // Monorepo: trace files from the workspace root so the standalone
  // bundle includes the @insuros/* workspace packages.
  outputFileTracingRoot: path.join(__dirname, "../../"),
  // Workspace packages ship as TypeScript source (main: src/index.ts),
  // so Next must transpile them.
  transpilePackages: [
    "@insuros/ui",
    "@insuros/services",
    "@insuros/mocks",
    "@insuros/domain",
  ],
};

export default nextConfig;
