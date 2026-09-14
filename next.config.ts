import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  basePath: "/streamlt",
  output: "standalone",
  transpilePackages: ["@home-server/contracts", "@home-server/navigation", "@home-server/shell"],
  turbopack: { root: path.resolve(import.meta.dirname, "../..") },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
