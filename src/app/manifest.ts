import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * Installable shortcut only. There is deliberately no service worker: an offline copy could
 * show an old collection as if it were current. Every visit reads the deployed snapshot.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.nome} · ${SITE.cidade}`,
    short_name: SITE.nome,
    description: SITE.lema,
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f3f6f2",
    theme_color: "#1c6437",
    icons: [
      { src: "/icones/icone-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icones/icone-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icones/icone-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
