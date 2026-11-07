import { describe, expect, it } from "vitest";
import fixture from "../fixtures/camara-amostra.json";
import { proposicoesResponse, vereadoresResponse } from "@/lib/camara/schema";
import { autoriaCitada, idDoLink, mapaVereadores, numeroAno, slugify, toRegistro, toVereador } from "@/lib/data/derive";

const vereadores = vereadoresResponse.parse(fixture.vereadores).map((v) => toVereador(v, null));

describe("derivações", () => {
  it("extrai número e ano do título oficial", () => {
    expect(numeroAno("REQUERIMENTO N.º 2490/2026")).toEqual({ numero: 2490, ano: 2026 });
    expect(numeroAno("INDICAÇÃO DE PROJETO DE LEI N.º 001/2009")).toEqual({ numero: 1, ano: 2009 });
    expect(numeroAno("LEI ORDINÁRIA N.º 7.197/2026")).toEqual({ numero: 7197, ano: 2026 });
    expect(numeroAno("Pauta da 38ª Sessão")).toEqual({ numero: null, ano: null });
  });

  it("extrai o id do link oficial", () => {
    expect(idDoLink("https://www.pindamonhangaba.sp.leg.br/proposicoes/0/0/0/0/154351#pesquisa")).toBe("154351");
  });

  it("gera slugs estáveis e sem acento", () => {
    expect(slugify("Carlos Moura - Magrão")).toBe("carlos-moura-magrao");
    expect(slugify("Rogério Ramos")).toBe("rogerio-ramos");
  });

  it("todos os vereadores da amostra têm slug único", () => {
    expect(new Set(vereadores.map((v) => v.slug)).size).toBe(vereadores.length);
  });

  it("separa coautores por ';' e liga aos vereadores em exercício", () => {
    const mapa = mapaVereadores(vereadores);
    const r = toRegistro(
      {
        data: "2026-10-21 16:52:51",
        titulo: "EMENDA N.º 1/2026",
        ementa: "x",
        autoria: "Marco Mayor; Felipinho César; Professor Everton",
        link: "https://www.pindamonhangaba.sp.leg.br/proposicoes/0/0/0/0/1#pesquisa",
      },
      "Emendas",
      mapa,
    );
    expect(r.autores).toEqual(["Marco Mayor", "Felipinho César", "Professor Everton"]);
    expect(r.autoresVereadores).toEqual(["marco-mayor", "felipinho-cesar", "professor-everton"]);
    expect(r.link).not.toContain("#");
  });

  it("não liga autores que não são vereadores em exercício", () => {
    const r = toRegistro(
      { data: "2026-10-22 15:51:38", titulo: "PROJETO DE LEI ORDINÁRIA N.º 242/2026", ementa: "", autoria: "Poder Executivo", link: "https://x.leg.br/p/242" },
      "Projetos-de-Lei-Ordinaria",
      mapaVereadores(vereadores),
    );
    expect(r.autores).toEqual(["Poder Executivo"]);
    expect(r.autoresVereadores).toEqual([]);
  });

  it("encontra a autoria citada na ementa de uma lei (informação derivada)", () => {
    const ementa =
      "INSTITUI A POLÍTICA MUNICIPAL DE TRANSPARÊNCIA... (Projeto de Lei n° 148/2026, de autoria do Vereador Professor Felipe Guimarães).";
    expect(autoriaCitada(ementa, vereadores)).toEqual(["professor-felipe-guimaraes"]);
    expect(autoriaCitada("Dispõe sobre crédito suplementar.", vereadores)).toEqual([]);
  });

  it("todas as proposições reais da amostra passam pelo schema e viram registros", () => {
    const mapa = mapaVereadores(vereadores);
    for (const [tipo, itens] of Object.entries(fixture.proposicoes)) {
      for (const p of proposicoesResponse.parse(itens)) {
        const r = toRegistro(p, tipo, mapa);
        expect(r.id).toMatch(/^\d+$/);
        expect(r.ano).not.toBeNull();
      }
    }
  });
});

describe("apelidos", () => {
  it("liga um nome antigo ao vereador em exercício", () => {
    const mapa = mapaVereadores(vereadores);
    const r = toRegistro(
      { data: "2025-03-01 10:00:00", titulo: "MOÇÃO N.º 3/2025", ementa: "x", autoria: "Norbertinho; Rogério Ramos", link: "https://x/9" },
      "Mocoes",
      mapa,
    );
    expect(r.autoresVereadores).toEqual(["norberto-moraes", "rogerio-ramos"]);
  });
});

describe("entidades HTML vindas da API", () => {
  it("converte &quot; e &#39; em caracteres na ementa, no título e na autoria", () => {
    const r = toRegistro(
      {
        data: "2026-05-01 10:00:00",
        titulo: "PROJETO DE LEI N.º 10/2026",
        ementa: "Institui o programa &quot;Farmácia Pet Solidária&quot; e o &#39;Dia D&#39; &amp; outros",
        autoria: "Marco Mayor",
        link: "https://www.pindamonhangaba.sp.leg.br/proposicoes/0/0/0/0/9#pesquisa",
      },
      "Projetos-de-Lei-Ordinaria",
      mapaVereadores(vereadores),
    );
    expect(r.ementa).toBe("Institui o programa \"Farmácia Pet Solidária\" e o 'Dia D' & outros");
  });

  it("não interpreta marcação: só troca entidades conhecidas", () => {
    expect(
      toRegistro(
        { data: "2026-05-01 10:00:00", titulo: "X N.º 1/2026", ementa: "a &lt;b&gt; &#x41; &foo;", autoria: "", link: "https://www.pindamonhangaba.sp.leg.br/proposicoes/0/0/0/0/8" },
        "Requerimentos",
        new Map(),
      ).ementa,
    ).toBe("a <b> A &foo;");
  });
});
