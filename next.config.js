/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  generateEtags: false,
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/api/posts/:postId/favorites",
          destination: "/api/posts/favorites/:postId",
        },
        {
          source: "/api/feed",
          destination: "/api/home-feed",
        },
        {
          source: "/api/search",
          destination: "/api/pikcir-search",
        },
      ],
    };
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "cms.pikcir.com",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "cms.pikcir.com",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "secure.gravatar.com",
        pathname: "/avatar/**",
      },
    ],
  },
}

module.exports = nextConfig
