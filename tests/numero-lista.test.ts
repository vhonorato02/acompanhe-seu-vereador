import { describe, expect, it } from "vitest";
import { funilLeis, idsQueViraramLei, porDestino, projetosQueViraramLei } from "@/lib/data/analise";
import { buscar } from "@/lib/data/busca";
import { contar, filtrar, hrefLista, lerFiltro } from "@/lib/data/query";
import type { Dataset, Norma, Registro } from "@/lib/data/types";

let seq = 0;
function reg(p: Partial<Registro>): Registro {
  seq++;
  return {
    id: String(seq), tipo: "Requerimentos", titulo: `REQUERIMENTO N.º ${seq}/2026`, numero: seq, ano: 2026, ementa: "",
    autoria: "", autores: [], autoresVereadores: [], data: "2026-03-10 10:00:00", link: `https://x/${seq}`, ...p,
  };
}
const lei = (ementa: string): Norma => ({ ...reg({ tipo: "Leis-Ordinarias", ementa }), autoriaCitadaNaEmenta: [] });

const pl1 = reg({ tipo: "Projetos-de-Lei-Ordinaria", numero: 10, ano: 2026, autoresVereadores: ["ana"] });
const pl2 = reg({ tipo: "Projetos-de-Lei-Ordinaria", numero: 11, ano: 2026, autoresVereadores: ["ana", "beto"] });
const pl3 = reg({ tipo: "Projetos-de-Lei-Ordinaria", numero: 12, ano: 2026, autoria: "Poder Executivo" });
const d = {
  proposicoes: [
    pl1, pl2, pl3,
    reg({ ementa: "À Sabesp, solicitando reparo", autoresVereadores: ["ana"] }),
    reg({ tipo: "Indicacoes", ementa: "Ao Executivo Municipal, roçada", autoresVereadores: ["ana", "beto"] }),
    reg({ ementa: "À Mesa Diretora, solicitando", autoresVereadores: ["beto"] }),
  ],
  // Two laws cite the same bill: the bill still counts once.
  normas: [lei("(Projeto de Lei n° 10/2026, de autoria...)"), lei("Altera a Lei... (Projeto de Lei nº 10/2026)"), lei("(Projeto de Lei n° 12/2026)")],
} as unknown as Dataset;

describe("número = lista também para destinatário, coautoria e 'virou lei'", () => {
  const ctx = { viraramLei: idsQueViraramLei(d) };

  it("cada destinatário tem lista com o mesmo total", () => {
    for (const x of porDestino(d.proposicoes)) expect(x.n).toBe(contar(d.proposicoes, x.filtro, ctx));
    expect(porDestino(d.proposicoes).find((x) => x.slug === "sabesp")?.n).toBe(1);
  });

  it("assinadas por mais de um vereador", () => {
    expect(contar(d.proposicoes, { autor: "ana", conjunto: true })).toBe(2);
  });

  it("funil: apresentados e citados em lei batem com as listas", () => {
    const f = funilLeis(d).find((x) => x.autor === "vereadores")!;
    expect(f.apresentados).toBe(contar(d.proposicoes, f.filtroApresentados, ctx));
    expect(f.viraramLei).toBe(contar(d.proposicoes, f.filtroViraramLei, ctx));
    expect(f).toMatchObject({ apresentados: 2, viraramLei: 1 });
    const e = funilLeis(d).find((x) => x.autor === "executivo")!;
    expect(e.apresentados).toBe(contar(d.proposicoes, e.filtroApresentados, ctx));
    expect(e).toMatchObject({ apresentados: 1 });
  });

  it("o filtro 'lei' sem o conjunto de projetos é erro de programação, não lista vazia", () => {
    expect(() => filtrar(d.proposicoes, { lei: true })).toThrow();
  });

  it("busca aceita o mesmo contexto", () => {
    expect(buscar(d.proposicoes, "", { lei: true }, ctx).map((r) => r.id)).toEqual([pl3.id, pl1.id]);
  });
});

describe("filtros novos na URL", () => {
  const tipos = new Set(["Requerimentos"]);
  const autores = new Set(["ana"]);
  it("lê e reconstrói destino, conjunto, origem e lei", () => {
    const f = lerFiltro({ destino: "sabesp", conjunto: "1", origem: "executivo", lei: "1" }, tipos, autores);
    expect(f).toMatchObject({ destino: "sabesp", conjunto: true, origem: "executivo", lei: true });
    expect(hrefLista("/proposicoes", f)).toBe("/proposicoes?destino=sabesp&conjunto=1&origem=executivo&lei=1");
  });
  it("descarta destino desconhecido e flags com outro valor", () => {
    expect(lerFiltro({ destino: "<x>", conjunto: "sim", lei: "0", origem: "camara" }, tipos, autores)).toMatchObject({
      destino: undefined, conjunto: undefined, lei: undefined, origem: undefined,
    });
  });
});

describe("formulários preservam os filtros ativos", () => {
  it("paramsDoFiltro devolve os mesmos pares que o href, sem a página", async () => {
    const { paramsDoFiltro } = await import("@/lib/data/query");
    const f = { bairro: "araretama", tema: "saude", pub: "2026-03", mes: 3, coautor: "beto", grupo: "pedidos", destino: "sabesp", conjunto: true as const };
    const pares = paramsDoFiltro(f);
    expect(`/proposicoes?${new URLSearchParams(pares).toString()}`).toBe(hrefLista("/proposicoes", f));
    expect(pares.map(([k]) => k)).toEqual(expect.arrayContaining(["bairro", "tema", "pub", "mes", "coautor", "grupo", "destino", "conjunto"]));
  });
});
