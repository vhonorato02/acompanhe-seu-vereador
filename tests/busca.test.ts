import { describe, expect, it } from "vitest";
import { buscar, interpretar, vereadoresQueCasam } from "@/lib/data/busca";
import { recortes } from "@/lib/data/perfil";
import { contar } from "@/lib/data/query";
import { legivel, nomeItem } from "@/lib/content/tipos";
import type { Registro, Vereador } from "@/lib/data/types";

describe("busca inteligente", () => {
  it("entende tipo, número e ano", () => {
    expect(interpretar("req 2398/2026")).toEqual({ texto: "", tipo: "Requerimentos", numero: 2398, ano: 2026 });
    expect(interpretar("Requerimento nº 2398/2026")).toMatchObject({ tipo: "Requerimentos", numero: 2398, ano: 2026 });
    expect(interpretar("PL 45")).toEqual({ texto: "", tipo: "Projetos-de-Lei-Ordinaria", numero: 45 });
  });

  it("não come pedaços de palavras comuns", () => {
    expect(interpretar("Nossa Senhora do Perpétuo Socorro").texto).toBe("nossa senhora do perpetuo socorro");
    expect(interpretar("iluminação Araretama")).toEqual({ texto: "iluminacao araretama" });
  });

  const regs: Registro[] = [
    { id: "1", tipo: "Requerimentos", titulo: "REQUERIMENTO N.º 2398/2026", numero: 2398, ano: 2026, ementa: "Sabesp", autoria: "", autores: [], autoresVereadores: ["ana"], data: "2026-10-15 09:55:00", link: "x" },
    { id: "2", tipo: "Indicacoes", titulo: "INDICAÇÃO N.º 2398/2025", numero: 2398, ano: 2025, ementa: "Buraco", autoria: "", autores: [], autoresVereadores: ["ana"], data: "2025-03-02 10:00:00", link: "y" },
    { id: "3", tipo: "Indicacoes", titulo: "INDICAÇÃO N.º 7/2026", numero: 7, ano: 2026, ementa: "Iluminação no Araretama", autoria: "", autores: [], autoresVereadores: ["beto"], data: "2026-03-20 10:00:00", link: "z" },
  ];

  it("acha pelo número e pelo texto", () => {
    expect(buscar(regs, "req 2398/2026").map((r) => r.id)).toEqual(["1"]);
    expect(buscar(regs, "2398").map((r) => r.id)).toEqual(["1", "2"]);
    expect(buscar(regs, "araretama").map((r) => r.id)).toEqual(["3"]);
  });

  it("sugere vereador pelo nome e por apelido histórico", () => {
    const vs = [
      { slug: "ana", nome: "Ana Paula Goffi", partido: "União" },
      { slug: "norberto-moraes", nome: "Norberto Moraes", partido: "PP" },
    ] as Vereador[];
    expect(vereadoresQueCasam("goffi", vs)).toHaveLength(1);
    expect(vereadoresQueCasam("norbertinho", vs).map((v) => v.slug)).toEqual(["norberto-moraes"]);
    expect(vereadoresQueCasam("go", vs)).toHaveLength(0);
  });

  it("recortes do perfil: cada número bate com o filtro da lista", () => {
    for (const r of recortes(regs, "ana")) {
      const f = r.ano === null ? { autor: "ana" } : { autor: "ana", ano: r.ano };
      expect(r.total).toBe(contar(regs, f));
      for (const t of r.porTipo) expect(t.n).toBe(contar(regs, { ...f, tipo: t.tipo }));
      r.porMes.forEach((n, i) => expect(n).toBe(contar(regs, { ...f, mes: i + 1 })));
      if (r.ano !== null) expect(r.porMes.reduce((a, b) => a + b, 0)).toBe(r.total);
    }
  });
});

describe("textos", () => {
  it("nomeia itens no singular", () => {
    expect(nomeItem("Requerimentos", 2398, 2026, "REQUERIMENTO N.º 2398/2026")).toBe("Requerimento 2398/2026");
    expect(nomeItem("Desconhecido", 1, 2026, "X N.º 1/2026")).toBe("X N.º 1/2026");
  });

  it("deixa legível ementa em caixa alta, sem mexer no resto", () => {
    expect(legivel("INSTITUI A POLÍTICA MUNICIPAL DE TRANSPARÊNCIA. DÁ OUTRAS PROVIDÊNCIAS.")).toBe(
      "Institui a política municipal de transparência. Dá outras providências.",
    );
    expect(legivel("à Sabesp, solicitando providências")).toBe("à Sabesp, solicitando providências");
  });
});
