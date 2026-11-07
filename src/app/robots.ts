import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // The VPS copy (ESPELHO=1) is not meant to be indexed; the canonical address is SITE.url.
  if (process.env.ESPELHO === "1") return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    // Filtered lists and the search API multiply into near-duplicate pages; the canonical pages are enough.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/buscar"] }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
