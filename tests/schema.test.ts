import { describe, expect, it } from "vitest";
import { proposicaoApi, vereadorApi, tipoApi } from "@/lib/camara/schema";
import { origemDaCamara } from "@/lib/camara/origem";

const link = "https://www.pindamonhangaba.sp.leg.br/proposicoes/0/0/0/0/154351#pesquisa";
const registro = { data: "2026-10-21 16:52:51", titulo: "REQUERIMENTO N.º 1/2026", autoria: "", ementa: "", link };

describe("contratos da fonte", () => {
  it("aceita um link HTTPS da Câmara", () => {
    expect(proposicaoApi.safeParse(registro).success).toBe(true);
    expect(origemDaCamara(link)?.hostname).toBe("www.pindamonhangaba.sp.leg.br");
  });

  it.each([
    "javascript:alert(1)",
    "https://evil.example/proposicoes/123",
    "https://www.pindamonhangaba.sp.leg.br.evil.example/proposicoes/123",
    "http://www.pindamonhangaba.sp.leg.br/proposicoes/123",
    "https://127.0.0.1/proposicoes/123",
  ])("bloqueia link não oficial: %s", (linkInvalido) => {
    expect(proposicaoApi.safeParse({ ...registro, link: linkInvalido }).success).toBe(false);
    expect(vereadorApi.safeParse({ nome: "Teste", partido: "", funcao: "", imagem: "", link: linkInvalido }).success).toBe(false);
    expect(tipoApi.safeParse({ contract: "Teste", titulo: "Teste", link: linkInvalido }).success).toBe(false);
  });
});
