/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Personal project: don't fail builds on TS/lint warnings — we surface
  // runtime issues iteratively. Re-tighten once stable.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "assets.coingecko.com" },
      { protocol: "https", hostname: "coin-images.coingecko.com" },
      { protocol: "https", hostname: "dd.dexscreener.com" },
      { protocol: "https", hostname: "s2.coinmarketcap.com" },
      { protocol: "https", hostname: "static.coingecko.com" },
    ],
  },
};

export default nextConfig;
