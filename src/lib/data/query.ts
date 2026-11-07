import { normalizar } from "./derive";
import { derivados } from "./enriquecer";
import { DESTINOS } from "./extrair";
import type { Registro } from "./types";

const DESTINOS_VALIDOS = new Set<string>([...DESTINOS.map((d) => d.slug), "outros"]);

export interface Filtro {
  tipo?: string;
  ano?: number;
  /** 1–12, month of the publication date. */
  mes?: number;
  autor?: string;
  /** Second councillor who must also sign (co-authorship pair). */
  coautor?: string;
  q?: string;
  /** Derived theme slug (see temas.ts). */
  tema?: string;
  /** Derived neighbourhood slug (see extrair.ts). */
  bairro?: string;
  /** Group of types: pedidos, projetos, homenagens, camara. */
  grupo?: string;
  /** Publication month, "YYYY-MM". */
  pub?: string;
  /** Derived addressee slug of a request (see extrair.ts). */
  destino?: string;
  /** Signed by more than one sitting councillor. */
  conjunto?: true;
  /** Who presented it: at least one sitting councillor, or the Executive (and no sitting councillor). */
  origem?: "vereadores" | "executivo";
  /** Bill cited as the origin of a published law (derived; needs `Contexto.viraramLei`). */
  lei?: true;
}

/** Dataset-wide facts that a single record cannot know about itself. */
export interface Contexto {
  /** Keys `${tipo}:${id}` of bills cited as the origin of a law. */
  viraramLei?: ReadonlySet<string>;
}

const memoTexto = new WeakMap<Registro, string>();

/**
 * Normalised text a query is matched against. Records are immutable for the life of the
 * process, so it is computed once: normalising 17k records on every keystroke cost ~0.5 s.
 */
function textoDeBusca(r: Registro): string {
  let t = memoTexto.get(r);
  if (t === undefined) {
    t = normalizar(`${r.titulo} ${r.ementa} ${r.autoria}`);
    memoTexto.set(r, t);
  }
  return t;
}

/**
 * The single filter used both for the lists and for every count shown on the site,
 * so a published number always equals the length of the list it links to.
 */
export function filtrar<T extends Registro>(registros: readonly T[], f: Filtro, ctx: Contexto = {}): T[] {
  const termos = f.q ? normalizar(f.q).split(" ").filter(Boolean) : [];
  const viraram = ctx.viraramLei;
  if (f.lei && !viraram) throw new Error("O filtro 'lei' precisa do conjunto de projetos ligados a leis (Contexto.viraramLei).");
  return registros.filter((r) => {
    if (f.tipo && r.tipo !== f.tipo) return false;
    if (f.ano !== undefined && r.ano !== f.ano) return false;
    if (f.mes !== undefined && Number(r.data.slice(5, 7)) !== f.mes) return false;
    if (f.autor && !r.autoresVereadores.includes(f.autor)) return false;
    if (f.coautor && !r.autoresVereadores.includes(f.coautor)) return false;
    if (f.pub && r.data.slice(0, 7) !== f.pub) return false;
    if (f.conjunto && r.autoresVereadores.length < 2) return false;
    if (f.origem === "vereadores" && r.autoresVereadores.length === 0) return false;
    if (f.origem === "executivo" && (r.autoresVereadores.length > 0 || !/poder executivo/i.test(r.autoria))) return false;
    if (f.lei && !viraram?.has(`${r.tipo}:${r.id}`)) return false;
    if (f.tema || f.bairro || f.grupo || f.destino) {
      const dv = derivados(r);
      if (f.tema && !dv.temas.includes(f.tema)) return false;
      if (f.bairro && !dv.bairrosSlug.includes(f.bairro)) return false;
      if (f.grupo && dv.grupo !== f.grupo) return false;
      if (f.destino && dv.destino !== f.destino) return false;
    }
    if (termos.length > 0) {
      const alvo = textoDeBusca(r);
      if (!termos.every((t) => alvo.includes(t))) return false;
    }
    return true;
  });
}

export function contar(registros: readonly Registro[], f: Filtro, ctx: Contexto = {}): number {
  return filtrar(registros, f, ctx).length;
}

/** Newest first; ties broken by number, then id, so the order is stable. */
export function ordenar<T extends Registro>(registros: readonly T[]): T[] {
  return [...registros].sort(
    (a, b) =>
      b.data.localeCompare(a.data) ||
      (b.numero ?? 0) - (a.numero ?? 0) ||
      b.id.localeCompare(a.id),
  );
}

export function paginar<T>(xs: readonly T[], pagina: number, porPagina: number) {
  const totalPaginas = Math.max(1, Math.ceil(xs.length / porPagina));
  const atual = Math.min(Math.max(1, pagina), totalPaginas);
  return {
    itens: xs.slice((atual - 1) * porPagina, atual * porPagina),
    pagina: atual,
    totalPaginas,
    total: xs.length,
  };
}

/** Query-string pairs for a filter, in a stable order (shared by links and hidden form fields). */
export function paramsDoFiltro(f: Filtro): Array<[string, string]> {
  const p: Array<[string, string]> = [];
  const por = (k: string, v: string | number | undefined) => {
    if (v !== undefined && v !== "") p.push([k, String(v)]);
  };
  por("tipo", f.tipo);
  por("ano", f.ano);
  por("mes", f.mes);
  por("autor", f.autor);
  por("coautor", f.coautor);
  por("q", f.q);
  por("tema", f.tema);
  por("bairro", f.bairro);
  por("grupo", f.grupo);
  por("pub", f.pub);
  por("destino", f.destino);
  if (f.conjunto) p.push(["conjunto", "1"]);
  por("origem", f.origem);
  if (f.lei) p.push(["lei", "1"]);
  return p;
}

export function hrefLista(base: "/proposicoes" | "/normas", f: Filtro, pagina?: number): string {
  const p = new URLSearchParams(paramsDoFiltro(f));
  if (pagina && pagina > 1) p.set("pagina", String(pagina));
  const s = p.toString();
  return s ? `${base}?${s}` : base;
}

/** Parse untrusted query-string values into a Filtro; invalid values are dropped. */
export function lerFiltro(
  sp: Record<string, string | string[] | undefined>,
  tiposValidos: ReadonlySet<string>,
  autoresValidos: ReadonlySet<string>,
): Filtro & { pagina: number } {
  const um = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const tipo = um("tipo");
  const ano = Number(um("ano"));
  const mes = Number(um("mes"));
  const autor = um("autor");
  const coautor = um("coautor");
  const q = um("q")?.slice(0, 120).trim();
  const slug = (k: string) => {
    const v = um(k);
    return v && /^[a-z0-9-]{2,80}$/.test(v) ? v : undefined;
  };
  const pagina = Number(um("pagina"));
  const destino = um("destino");
  const origem = um("origem");
  return {
    tipo: tipo && tiposValidos.has(tipo) ? tipo : undefined,
    ano: Number.isInteger(ano) && ano >= 1900 && ano <= 2100 ? ano : undefined,
    mes: Number.isInteger(mes) && mes >= 1 && mes <= 12 ? mes : undefined,
    autor: autor && autoresValidos.has(autor) ? autor : undefined,
    coautor: coautor && autoresValidos.has(coautor) ? coautor : undefined,
    q: q ? q : undefined,
    tema: slug("tema"),
    bairro: slug("bairro"),
    grupo: slug("grupo"),
    pub: /^\d{4}-\d{2}$/.test(um("pub") ?? "") ? um("pub") : undefined,
    destino: destino && DESTINOS_VALIDOS.has(destino) ? destino : undefined,
    conjunto: um("conjunto") === "1" ? true : undefined,
    origem: origem === "vereadores" || origem === "executivo" ? origem : undefined,
    lei: um("lei") === "1" ? true : undefined,
    pagina: Number.isInteger(pagina) && pagina > 0 ? pagina : 1,
  };
}
