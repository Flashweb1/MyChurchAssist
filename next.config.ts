import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

// Only wrap with Sentry when DSN is configured (avoids compile overhead in dev)
const hasSentryDsn = !!process.env.NEXT_PUBLIC_SENTRY_DSN;

if (hasSentryDsn) {
  const { withSentryConfig } = require("@sentry/nextjs");
  const sentryConfig = {
    org: process.env.SENTRY_ORG,
    project: "church-assist",
    widenClientFileUpload: true,
    hideSourceMaps: true,
    silent: true,
    // Suppress warnings about missing files when DSN is not set
    disableServerWebpackPlugin: false,
    disableClientWebpackPlugin: false,
  };
  module.exports = withSentryConfig(nextConfig, sentryConfig);
} else {
  module.exports = nextConfig;
}
