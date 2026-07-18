import { withSerwist } from "@serwist/turbopack";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

// Unlike the Webpack version, you pass the wrapper options 
// directly into the main config object under `experimental.turbopack` 
// or let the Turbopack wrapper handle your base nextConfig:
export default withSerwist(nextConfig);