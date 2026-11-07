import { normalizar } from "./derive";
import { filtrar, ordenar, type Contexto, type Filtro } from "./query";
import type { Registro, Vereador } from "./types";

/** Words people type for each type of document. */
const APELIDOS_TIPO: Array<[RegExp, string]> = [
  [/^(req|reqs|requerimentos?)$/, "Requerimentos"],
  [/^(ind|indicacao|indicacoes)$/, "Indicacoes"],
  [/^(mocao|mocoes|moc)$/, "Mocoes"],
  [/^(emenda|emendas)$/, "Emendas"],
  [/^(pl|plo|projeto|projetos)$/, "Projetos-de-Lei-Ordinaria"],
  [/^plc$/, "Projetos-de-Lei-Complementar"],
  [/^pr$/, "Projetos-de-Resolucao"],
  [/^pdl$/, "Projetos-de-Decreto-Legislativo"],
  [/^(veto|vetos)$/, "Vetos"],
];

export interface Consulta {
  texto: string;
  tipo?: string;
  numero?: number;
  ano?: number;
}

/** "req 2398/2026" -> { tipo: Requerimentos, numero: 2398, ano: 2026, texto: "" } */
export function interpretar(q: string): Consulta {
  let resto = normalizar(q).replace(/\bn\s*[.º°]+\s*/g, " ");
  const out: Consulta = { texto: "" };
  const num = /\b(\d{1,5})\s*\/\s*(\d{4})\b/.exec(resto);
  if (num?.[1] && num[2]) {
    out.numero = Number(num[1]);
    out.ano = Number(num[2]);
    resto = resto.replace(num[0], " ");
  }
  const sobra: string[] = [];
  for (const p of resto.split(" ").filter(Boolean)) {
    const t = APELIDOS_TIPO.find(([re]) => re.test(p));
    if (t && out.tipo === undefined) out.tipo = t[1];
    else if (/^\d{1,5}$/.test(p) && out.numero === undefined) out.numero = Number(p);
    else sobra.push(p);
  }
  out.texto = sobra.join(" ");
  return out;
}

export function vereadoresQueCasam(q: string, vereadores: readonly Vereador[]): Vereador[] {
  const n = normalizar(q);
  if (n.length < 3) return [];
  return vereadores.filter((v) => normalizar(`${v.nome} ${v.partido}`).includes(n) || n.includes(normalizar(v.nome)));
}

export function buscar<T extends Registro>(registros: readonly T[], q: string, extra: Filtro = {}, ctx: Contexto = {}): T[] {
  const c = interpretar(q);
  const base = filtrar(registros, { ...extra, tipo: extra.tipo ?? c.tipo, q: c.texto || undefined }, ctx);
  const porNumero =
    c.numero !== undefined
      ? base.filter((r) => r.numero === c.numero && (c.ano === undefined || r.ano === c.ano))
      : base;
  return ordenar(porNumero);
}
