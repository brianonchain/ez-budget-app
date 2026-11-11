import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: false,
  devIndicators: false,
  transpilePackages: ["@ezbudget/tokens", "@ezbudget/assets", "@ezbudget/utils"],
};

export default withBundleAnalyzer(nextConfig);
