import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // Filtered lists and the search API multiply into near-duplicate pages; the canonical pages are enough.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/buscar"] }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
