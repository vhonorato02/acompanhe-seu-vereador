import type { MetadataRoute } from "next";
import { dataset } from "@/lib/data/load";
import { panorama } from "@/lib/data/painel";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const d = dataset();
  const coleta = new Date(d.execucao.coletadoEm);
  const fixas = ["/", "/vereadores", "/bairros", "/proposicoes", "/normas", "/comparar", "/metodologia", "/como-funciona", "/dados", "/correcoes", "/sobre"];
  return [
    ...fixas.map((p) => ({ url: `${SITE.url}${p === "/" ? "" : p}`, lastModified: coleta })),
    ...d.vereadores.map((v) => ({ url: `${SITE.url}/vereadores/${v.slug}`, lastModified: coleta })),
    ...panorama().bairros.map((b) => ({ url: `${SITE.url}/bairros/${b.slug}`, lastModified: coleta })),
  ];
}
