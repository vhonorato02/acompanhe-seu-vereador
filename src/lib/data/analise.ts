import { slugify } from "./derive";
import { derivados } from "./enriquecer";
import { DESTINOS, GRUPOS, projetoDeOrigem, type Grupo } from "./extrair";
import { contar, type Contexto, type Filtro } from "./query";
import { TEMAS } from "./temas";
import type { Dataset, Norma, Registro } from "./types";

export const MIN_BAIRRO = 3;
const PROJETOS = ["Projetos-de-Lei-Ordinaria", "Projetos-de-Lei-Complementar"];

export interface Conta {
  slug: string;
  nome: string;
  n: number;
  filtro: Filtro;
}

export interface MesConta {
  mes: string; // YYYY-MM
  total: number;
  porGrupo: Record<Grupo, number>;
}

export interface Par {
  a: string;
  b: string;
  n: number;
}

export interface ProjetoLei {
  projeto: Registro;
  lei: Norma;
}

/** Months from the start of the scope to the collection month, inclusive. */
export function meses(inicio: string, fim: string): string[] {
  const out: string[] = [];
  let [a, m] = inicio.slice(0, 7).split("-").map(Number) as [number, number];
  const [fa, fm] = fim.slice(0, 7).split("-").map(Number) as [number, number];
  while (a < fa || (a === fa && m <= fm)) {
    out.push(`${a}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) {
      m = 1;
      a++;
    }
  }
  return out;
}

function vazioGrupo(): Record<Grupo, number> {
  return { pedidos: 0, projetos: 0, homenagens: 0, camara: 0 };
}

export function porMes(registros: readonly Registro[], lista: string[]): MesConta[] {
  const idx = new Map(lista.map((m, i) => [m, i]));
  const out = lista.map((mes) => ({ mes, total: 0, porGrupo: vazioGrupo() }));
  for (const r of registros) {
    const i = idx.get(r.data.slice(0, 7));
    if (i === undefined) continue;
    const alvo = out[i];
    if (!alvo) continue;
    alvo.total++;
    alvo.porGrupo[derivados(r).grupo]++;
  }
  return out;
}

export function porGrupo(registros: readonly Registro[], base: Filtro = {}): Conta[] {
  return GRUPOS.map((g) => ({ slug: g.slug, nome: g.nome, n: contar(registros, { ...base, grupo: g.slug }), filtro: { ...base, grupo: g.slug } }));
}

export function porTema(registros: readonly Registro[], base: Filtro = {}): Conta[] {
  return TEMAS.map((t) => ({ slug: t.slug, nome: t.nome, n: contar(registros, { ...base, tema: t.slug }), filtro: { ...base, tema: t.slug } }))
    .filter((c) => c.n > 0)
    .sort((x, y) => y.n - x.n || x.nome.localeCompare(y.nome, "pt-BR"));
}

/** Display name for a neighbourhood slug: the spelling used most often (ties: alphabetical). */
function nomeMaisUsado(grafias: Map<string, number> | undefined, slug: string): string {
  if (!grafias) return slug;
  return [...grafias.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"))[0]?.[0] ?? slug;
}

export function porBairro(registros: readonly Registro[], base: Filtro = {}, minimo = MIN_BAIRRO): Conta[] {
  const nomes = new Map<string, Map<string, number>>();
  const cont = new Map<string, number>();
  for (const r of registros) {
    const dv = derivados(r);
    dv.bairros.forEach((nome, i) => {
      const s = dv.bairrosSlug[i] ?? slugify(nome);
      const grafias = nomes.get(s) ?? new Map<string, number>();
      grafias.set(nome, (grafias.get(nome) ?? 0) + 1);
      nomes.set(s, grafias);
      cont.set(s, (cont.get(s) ?? 0) + 1);
    });
  }
  return [...cont.entries()]
    .filter(([, n]) => n >= minimo)
    .map(([slug, n]) => ({ slug, nome: nomeMaisUsado(nomes.get(slug), slug), n, filtro: { ...base, bairro: slug } }))
    .sort((x, y) => y.n - x.n || x.nome.localeCompare(y.nome, "pt-BR"));
}

export function porDestino(registros: readonly Registro[], base: Filtro = {}): Conta[] {
  return [...DESTINOS.map((d) => ({ slug: d.slug as string, nome: d.nome as string })), { slug: "outros", nome: "Outros" }]
    .map((d) => ({ ...d, filtro: { ...base, destino: d.slug } }))
    .map((d) => ({ ...d, n: contar(registros, d.filtro) }))
    .filter((d) => d.n > 0)
    // Largest first; "Outros" stays last because it is a remainder, not a recipient.
    .sort((a, b) => (a.slug === "outros" ? 1 : b.slug === "outros" ? -1 : b.n - a.n));
}

/** Co-authorship among sitting councillors: one edge per pair, weight = shared propositions. */
export function pares(registros: readonly Registro[]): Par[] {
  const cont = new Map<string, number>();
  for (const r of registros) {
    const vs = [...r.autoresVereadores].sort();
    for (let i = 0; i < vs.length; i++)
      for (let j = i + 1; j < vs.length; j++) {
        const k = `${vs[i]}|${vs[j]}`;
        cont.set(k, (cont.get(k) ?? 0) + 1);
      }
  }
  return [...cont.entries()].map(([k, n]) => {
    const [a = "", b = ""] = k.split("|");
    return { a, b, n };
  });
}

/** Bills whose number is cited in a law's summary ("Projeto de Lei n° 148/2026"). Derived. */
export function projetosQueViraramLei(d: Pick<Dataset, "proposicoes" | "normas">): ProjetoLei[] {
  const porChave = new Map(d.proposicoes.map((p) => [`${p.tipo}:${p.numero}/${p.ano}`, p]));
  const out: ProjetoLei[] = [];
  for (const lei of d.normas) {
    const o = projetoDeOrigem(lei.ementa);
    if (!o) continue;
    const projeto = porChave.get(`${o.tipo}:${o.numero}/${o.ano}`);
    if (projeto) out.push({ projeto, lei });
  }
  return out;
}

const memoViraram = new WeakMap<object, ReadonlySet<string>>();

/** Keys `${tipo}:${id}` of bills cited as the origin of a law (derived). Memoised per dataset. */
export function idsQueViraramLei(d: Pick<Dataset, "proposicoes" | "normas">): ReadonlySet<string> {
  const hit = memoViraram.get(d);
  if (hit) return hit;
  const ids = new Set(projetosQueViraramLei(d).map((v) => `${v.projeto.tipo}:${v.projeto.id}`));
  memoViraram.set(d, ids);
  return ids;
}

export function contexto(d: Pick<Dataset, "proposicoes" | "normas">): Contexto {
  return { viraramLei: idsQueViraramLei(d) };
}

export interface Funil {
  autor: "vereadores" | "executivo";
  apresentados: number;
  viraramLei: number;
  filtroApresentados: Filtro;
  filtroViraramLei: Filtro;
}

/** Ordinary bills by who presented them, and how many are already cited by a law. Same filters as the lists. */
export function funilLeis(d: Pick<Dataset, "proposicoes" | "normas">): Funil[] {
  const ctx = contexto(d);
  return (["vereadores", "executivo"] as const).map((autor) => {
    const filtroApresentados: Filtro = { tipo: "Projetos-de-Lei-Ordinaria", origem: autor };
    const filtroViraramLei: Filtro = { ...filtroApresentados, lei: true };
    return {
      autor,
      apresentados: contar(d.proposicoes, filtroApresentados, ctx),
      viraramLei: contar(d.proposicoes, filtroViraramLei, ctx),
      filtroApresentados,
      filtroViraramLei,
    };
  });
}

export function projetosDe(d: Dataset, slug: string): Registro[] {
  return d.proposicoes.filter((p) => PROJETOS.includes(p.tipo) && p.autoresVereadores.includes(slug));
}

export function percent(parte: number, todo: number): number {
  return todo === 0 ? 0 : Math.round((parte / todo) * 100);
}

/** Percentage with one decimal, for small shares in charts (0.4% instead of 0%). */
export function percent1(parte: number, todo: number): number {
  return todo === 0 ? 0 : Math.round((parte / todo) * 1000) / 10;
}
