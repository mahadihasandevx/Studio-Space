import type { NextConfig } from "next";

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:4000";
const clientUrl = process.env.BETTER_AUTH_URL?.trim() || "http://localhost:3000";
const configuredApi = new URL(configuredApiUrl);
const configuredClient = new URL(clientUrl);
const localHosts = new Set(["localhost", "127.0.0.1"]);
const apiUrl =
  configuredApi.origin === configuredClient.origin &&
  localHosts.has(configuredApi.hostname)
    ? "http://localhost:4000"
    : configuredApiUrl;

if (apiUrl !== configuredApiUrl) {
  console.warn(
    "NEXT_PUBLIC_API_URL points to the local Next.js origin; routing the Express API to http://localhost:4000 instead.",
  );
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/server/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
