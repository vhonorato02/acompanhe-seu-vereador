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

/**
 * ESPELHO=1 builds the copy that runs on the owner's VPS: standalone server, and a noindex
 * header so search engines keep only the canonical address (SITE.url, on Vercel).
 */
const espelho = process.env.ESPELHO === "1";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // The dev server needs eval for fast refresh, so the policy only applies to production builds.
  ...(process.env.NODE_ENV === "production" ? [{ key: "Content-Security-Policy", value: csp }] : []),
  ...(espelho ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] : []),
];

const config: NextConfig = {
  poweredByHeader: false,
  ...(espelho ? { output: "standalone" as const } : {}),
  // The dataset is read from disk by server routes; make sure it ships with them.
  outputFileTracingIncludes: { "/**": ["./data/generated/**"] },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // The service worker must always be revalidated, or a fix to it could take days to arrive.
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, max-age=0, must-revalidate" }] },
    ];
  },
  async redirects() {
    return [
      // The privacy section lives in /sobre.
      { source: "/privacidade", destination: "/sobre#privacidade", permanent: true },
    ];
  },
};

export default config;
