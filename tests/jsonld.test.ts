import { describe, expect, it } from "vitest";
import type { Dataset, Vereador } from "@/lib/data/types";
import { breadcrumbLd, datasetLd, organizacaoLd, serializarLd, vereadorLd, websiteLd } from "@/lib/seo/jsonld";
import { SITE } from "@/lib/site";

const vereador: Vereador = {
  slug: "ana", nome: "Ana", partido: "X", funcao: "Presidente", foto: "/fotos/ana.jpg", fotoOrigem: "", link: "https://www.pindamonhangaba.sp.leg.br/v/1",
};
const d = {
  fonte: { nome: "API", url: "https://www.pindamonhangaba.sp.leg.br/dadosabertos", termos: "" },
  escopo: { inicio: "2025-01-01", descricao: "Legislatura 2025–2028" },
  execucao: { coletadoEm: "2026-11-08T03:00:00.000Z", modo: "incremental", requisicoes: 1, duracaoMs: 1, avisos: [] },
  vereadores: [vereador], tipos: [], proposicoes: [], normas: [],
} satisfies Dataset;

describe("dados estruturados (schema.org)", () => {
  it("organização: CNPJ, endereço e contato vêm de site.ts", () => {
    const o = organizacaoLd();
    expect(o["@type"]).toBe("NGO");
    expect(o.taxID).toBe(SITE.cnpj);
    expect(o.email).toBe(SITE.contatoEmail);
    expect(JSON.stringify(o.address)).toContain("Pindamonhangaba");
    const ws = websiteLd();
    expect(ws.publisher).toEqual({ "@id": o["@id"] });
    expect(ws.potentialAction).toMatchObject({
      "@type": "SearchAction",
      target: `${SITE.url}/proposicoes?q={search_term_string}`,
    });
  });

  it("breadcrumb: monta trilha hierárquica com URLs absolutas", () => {
    const b = breadcrumbLd([
      { nome: "Início", url: "/" },
      { nome: "Vereadores", url: "/vereadores" },
      { nome: "Ana", url: "/vereadores/ana" },
    ]);
    expect(b["@type"]).toBe("BreadcrumbList");
    const itens = b.itemListElement as Array<{ position: number; name: string; item: string }>;
    expect(itens).toEqual([
      { "@type": "ListItem", position: 1, name: "Início", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Vereadores", item: `${SITE.url}/vereadores` },
      { "@type": "ListItem", position: 3, name: "Ana", item: `${SITE.url}/vereadores/ana` },
    ]);
  });

  it("dataset: um download por arquivo publicado e data da coleta", () => {
    const ld = datasetLd(d);
    expect(ld.dateModified).toBe(d.execucao.coletadoEm);
    const urls = (ld.distribution as Array<{ contentUrl: string }>).map((x) => x.contentUrl);
    expect(urls).toContain(`${SITE.url}/dados/proposicoes.csv`);
    expect(urls.every((x) => x.startsWith(`${SITE.url}/dados/`))).toBe(true);
  });

  it("vereador: fato institucional, sem partido nem avaliação", () => {
    const v = vereador;
    const ld = vereadorLd(v);
    expect(ld.jobTitle).toBe("Vereador (Presidente da Mesa Diretora)");
    expect(ld.image).toBe(`${SITE.url}/fotos/ana.jpg`);
    expect(ld.name).toBe(v.nome);
    expect(ld.sameAs).toEqual([v.link]);
    const texto = JSON.stringify(ld);
    expect(texto).not.toMatch(/rating|review|award|affiliation/i);
  });

  it("a serialização não deixa texto fechar a tag <script>", () => {
    expect(serializarLd({ x: "</script><script>alert(1)</script>" })).not.toContain("</script>");
  });
});
