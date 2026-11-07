import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * Installable app. The service worker (public/sw.js, ADR 0004) caches only static assets; pages
 * and data always come from the network, so an old collection is never shown as current.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${SITE.nome} · ${SITE.cidade}`,
    // Fits under the icon on a phone home screen (about 12 characters).
    short_name: "Vereadores",
    description: SITE.lema,
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    categories: ["government", "news"],
    background_color: "#ffffff",
    theme_color: "#ffffff",
    shortcuts: [
      { name: "Vereadores", url: "/vereadores", icons: [{ src: "/icones/icone-192.png", sizes: "192x192" }] },
      { name: "O seu bairro", url: "/bairros", icons: [{ src: "/icones/icone-192.png", sizes: "192x192" }] },
      { name: "Buscar", url: "/buscar", icons: [{ src: "/icones/icone-192.png", sizes: "192x192" }] },
    ],
    icons: [
      { src: "/icones/icone-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icones/icone-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icones/icone-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
