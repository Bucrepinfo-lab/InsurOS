import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so stray lockfiles elsewhere on the machine
  // (e.g. a package-lock.json in the user profile) cannot break module
  // resolution under Turbopack.
  turbopack: {
    root: path.join(__dirname, "..", "..")
  }
};

export default nextConfig;
