import type { NextConfig } from "next";

/*
 * The site is static and loads nothing from other origins. Next.js injects inline scripts
 * for hydration, so scripts need 'unsafe-inline' (nonces would make every page dynamic);
 * everything else is locked to this origin.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // The dev server needs eval for fast refresh, so the policy only applies to production builds.
  ...(process.env.NODE_ENV === "production" ? [{ key: "Content-Security-Policy", value: csp }] : []),
];

const config: NextConfig = {
  poweredByHeader: false,
  // The dataset is read from disk by server routes; make sure it ships with them.
  outputFileTracingIncludes: { "/**": ["./data/generated/**"] },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      // The privacy section lives in /sobre.
      { source: "/privacidade", destination: "/sobre#privacidade", permanent: true },
    ];
  },
};

export default config;
