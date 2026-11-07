import "server-only";
import { funilLeis, meses, pares, porBairro, porDestino, porGrupo, porMes, porTema, projetosQueViraramLei } from "./analise";
import { dataset } from "./load";
import { filtrar } from "./query";
import type { Dataset } from "./types";

function calcular(d: Dataset) {
  const listaMeses = meses(d.escopo.inicio, d.execucao.coletadoEm);
  const pedidos = filtrar(d.proposicoes, { grupo: "pedidos" });
  const viraram = projetosQueViraramLei(d);
  return {
    d,
    listaMeses,
    mensal: porMes(d.proposicoes, listaMeses),
    grupos: porGrupo(d.proposicoes),
    pedidos,
    temasPedidos: porTema(pedidos, { grupo: "pedidos" }),
    bairros: porBairro(d.proposicoes),
    destinos: porDestino(d.proposicoes),
    pares: pares(d.proposicoes),
    viraram,
    funil: funilLeis(d),
  };
}

export type Panorama = ReturnType<typeof calcular>;
let cache: { d: Dataset; v: Panorama } | null = null;

/** Whole-council aggregates, computed once per build. */
export function panorama(): Panorama {
  const d = dataset();
  if (cache && cache.d === d) return cache.v;
  const v = calcular(d);
  cache = { d, v };
  return v;
}

/** One councillor's slice of every aggregate, with the whole Câmara as reference. */
export function raioX(slug: string) {
  const p = panorama();
  const { d } = p;
  const deles = d.proposicoes.filter((r) => r.autoresVereadores.includes(slug));
  const pedidos = filtrar(deles, { grupo: "pedidos" });
  const temas = porTema(pedidos, { autor: slug, grupo: "pedidos" });
  const refTema = new Map(p.temasPedidos.map((t) => [t.slug, (t.n / Math.max(1, p.pedidos.length)) * 100]));
  const projetos = filtrar(deles, { tipo: "Projetos-de-Lei-Ordinaria" });
  const viraram = p.viraram.filter((v) => v.projeto.autoresVereadores.includes(slug));
  // Laws traced back to this councillor's ordinary bills (same base as `projetos`).
  const leisDeProjetos = viraram.filter((v) => v.projeto.tipo === "Projetos-de-Lei-Ordinaria");
  const coautoria = deles.filter((r) => r.autoresVereadores.length > 1).length;
  return {
    deles,
    pedidos,
    mensal: porMes(deles, p.listaMeses),
    grupos: porGrupo(deles, { autor: slug }),
    temas,
    refTema,
    bairros: porBairro(deles, { autor: slug }, 2),
    destinos: porDestino(deles),
    projetos,
    viraram,
    leisDeProjetos,
    coautoria,
  };
}
