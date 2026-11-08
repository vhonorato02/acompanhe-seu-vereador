import { describe, expect, it } from "vitest";
import { OMISSOES, TEXTO_OMITIDO } from "@/lib/content/omissoes";
import { toNorma, toRegistro } from "@/lib/data/derive";

const OFICIAL = "https://www.pindamonhangaba.sp.leg.br";
const vereadores = [{ slug: "renato-cebola", nome: "Renato Cebola", partido: "União", funcao: "Vereador", foto: null, fotoOrigem: "", link: `${OFICIAL}/v/1` }];
const homenagem = {
  data: "2026-11-06 10:00:00",
  titulo: "DECRETO LEGISLATIVO N.º 12/2026",
  ementa: "Concede o título de cidadão ao Sr. Fulano de Tal (Projeto de Decreto Legislativo n° 8/2026, de autoria do Vereador Renato Cebola).",
  autoria: "Renato Cebola",
  link: `${OFICIAL}/normas/0/0/0/0/777#x`,
};

describe("omissão de ementa a pedido de pessoa citada (LGPD)", () => {
  it("troca só a ementa: o registro, a autoria e o link oficial continuam", () => {
    const r = toRegistro(homenagem, "Decretos-Legislativos", new Map([["renato cebola", "renato-cebola"]]), new Set(["Decretos-Legislativos:777"]));
    expect(r.ementa).toBe(TEXTO_OMITIDO);
    expect(r.ementa).not.toContain("Fulano");
    expect(r.autoresVereadores).toEqual(["renato-cebola"]);
    expect(r.link).toBe(`${OFICIAL}/normas/0/0/0/0/777`);
    expect(r.numero).toBe(12);
  });

  it("numa norma, a autoria do vereador citada na ementa original continua ligada ao perfil", () => {
    const n = toNorma(homenagem, "Decretos-Legislativos", vereadores, new Set(["Decretos-Legislativos:777"]));
    expect(n.ementa).toBe(TEXTO_OMITIDO);
    expect(n.autoriaCitadaNaEmenta).toEqual(["renato-cebola"]);
  });

  it("sem pedido, a ementa aparece como publicada", () => {
    expect(toRegistro(homenagem, "Decretos-Legislativos", new Map(), new Set()).ementa).toContain("Fulano");
  });

  it("a lista pública só tem chaves válidas, data e referência — nunca um nome", () => {
    for (const o of OMISSOES) {
      expect(o.chave).toMatch(/^[A-Za-z-]+:\d+$/);
      expect(o.desde).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(o.referencia).toMatch(/^[\w#.-]+$/);
    }
  });
});
