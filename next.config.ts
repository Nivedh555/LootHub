import type { NextConfig } from "next";

// React's dev tooling (callstack reconstruction, fast refresh) needs eval();
// production never does, so 'unsafe-eval' is granted to dev builds only.
const isDev = process.env.NODE_ENV === "development";

const securityHeaders = [
  // Clickjacking: never allow the site to be framed.
  { key: "X-Frame-Options", value: "DENY" },
  // Never MIME-sniff responses.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Only send the origin on cross-origin navigation.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // This app needs none of these browser features.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Enforce HTTPS for 2 years (including subdomains).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // XSS containment. 'unsafe-inline' is required by Next.js inline
  // bootstrapping scripts and styled JSX; everything else is same-origin.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
