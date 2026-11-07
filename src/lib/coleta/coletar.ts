/**
 * Collects the Câmara open-data API into the dataset and the open-data files.
 * Everything is validated before anything is written, and outputs are staged and then
 * moved into place, so a failure never leaves a half-updated snapshot behind.
 */
import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { z } from "zod";
import { ColetaError } from "../camara/client";
import { validarUrlFoto } from "../camara/foto";
import {
  proposicaoApi,
  proposicoesResponse,
  tiposResponse,
  unknownKeys,
  vereadoresResponse,
  type ProposicaoApi,
  type TipoApi,
  type VereadorApi,
} from "../camara/schema";
import { csv } from "../data/csv";
import { idDoLink, mapaVereadores, numeroAno, toNorma, toRegistro, toVereador } from "../data/derive";
import type { Dataset, Execucao, Norma, Registro, Tipo, Vereador } from "../data/types";

/** Current legislature (2025–2028). */
export const ESCOPO_INICIO = "2025-01-01";
const ANO_INICIO = 2025;
/** Normative acts shown on the site; administrative publications are left to the official site. */
export const NORMAS = ["Leis-Ordinarias", "Leis-Complementares", "Emendas-a-Lei-Organica", "Resolucoes", "Decretos-Legislativos"];
export const FULL_REFRESH_DIAS = 30;
export const SOBREPOSICAO_DIAS = 45;
const MAX_PAGINAS = 1500;
/** A new collection may not shrink more than this compared with the last one. */
const QUEDA_MAXIMA = 0.1;

export interface ClienteApi {
  get(call: string, params?: Record<string, string | number>): Promise<unknown>;
  readonly requisicoes: number;
}

export interface OpcoesColeta {
  /** Project root: outputs go to data/generated, public/dados, public/fotos and .next/cache. */
  raiz: string;
  /** API client; when absent the labelled development sample in fixtures/ is used. */
  cliente?: ClienteApi;
  producao: boolean;
  /** Force a full refresh (COLETA_COMPLETA=1). */
  completa?: boolean;
  baixarFoto?: (url: string) => Promise<Buffer>;
  /** Totals of the last published collection, used to catch a silent drop when the cache is gone. */
  ultimoPublicado?: () => Promise<{ proposicoes: number; normas: number } | null>;
  agora?: () => Date;
  log?: (msg: string) => void;
  pausa?: (ms: number) => Promise<void>;
}

const tipoCache = z.object({ itens: z.record(z.string(), proposicaoApi) });
const esquemaCache = z.object({
  versao: z.literal(1),
  completoEm: z.string().nullable(),
  proposicoes: z.record(z.string(), tipoCache),
  normas: z.record(z.string(), tipoCache),
});
type Cache = z.infer<typeof esquemaCache>;
type CacheTipo = z.infer<typeof tipoCache>;

function caminhos(raiz: string) {
  // The cache folder keeps its original name so the Vercel build cache survives the rename.
  const cacheDir = path.join(raiz, ".next/cache/acompanhe");
  return {
    dataset: path.join(raiz, "data/generated/dataset.json"),
    dados: path.join(raiz, "public/dados"),
    fotos: path.join(raiz, "public/fotos"),
    cacheDir,
    cache: path.join(cacheDir, "coleta.json"),
    fixture: path.join(raiz, "fixtures/camara-amostra.json"),
  };
}

export function noEscopo(p: ProposicaoApi): boolean {
  const { ano } = numeroAno(p.titulo);
  return p.data.slice(0, 10) >= ESCOPO_INICIO || (ano !== null && ano >= ANO_INICIO);
}

function diasAtras(iso: string, dias: number): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - dias);
  return d.toISOString().slice(0, 10);
}

/** Staged writes: nothing replaces a published file until `promover` runs. */
class Escrita {
  private readonly pendentes: Array<{ temp: string; final: string }> = [];
  private n = 0;
  constructor(private readonly dirTemp: string) {}
  async escrever(final: string, conteudo: string | Buffer) {
    await mkdir(this.dirTemp, { recursive: true });
    const temp = path.join(this.dirTemp, `${this.n++}-${path.basename(final)}`);
    await writeFile(temp, conteudo);
    this.pendentes.push({ temp, final });
  }
  async promover() {
    for (const { temp, final } of this.pendentes) {
      await mkdir(path.dirname(final), { recursive: true });
      await rename(temp, final);
    }
    await this.descartar();
  }
  async descartar() {
    await rm(this.dirTemp, { recursive: true, force: true });
  }
}

export async function coletar(o: OpcoesColeta): Promise<Dataset> {
  const agora = o.agora ?? (() => new Date());
  const log = o.log ?? ((m: string) => console.log(`[coleta] ${m}`));
  const pausa = o.pausa ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const p = caminhos(o.raiz);
  const inicio = agora().getTime();
  const avisos: string[] = [];
  const escrita = new Escrita(path.join(o.raiz, `.coleta-tmp-${process.pid}-${inicio}`));

  try {
    let vereadoresApi: VereadorApi[];
    let tiposProp: TipoApi[];
    let tiposNorma: TipoApi[];
    let propPorTipo: Record<string, ProposicaoApi[]>;
    let normaPorTipo: Record<string, ProposicaoApi[]>;
    let modo: Execucao["modo"];
    let requisicoes = 0;
    const fotos = new Map<string, string | null>();

    if (!o.cliente) {
      if (o.producao) throw new ColetaError("CAMARA_API_TOKEN ausente no ambiente de produção.", "vazio");
      log("Sem CAMARA_API_TOKEN: usando a amostra real em fixtures/ (só para desenvolvimento).");
      const fx = JSON.parse(await readFile(p.fixture, "utf8")) as {
        vereadores: unknown;
        proposicoes_tipos: unknown;
        legislacoes_tipos: unknown;
        proposicoes: Record<string, unknown>;
        legislacoes: Record<string, unknown>;
      };
      vereadoresApi = vereadoresResponse.parse(fx.vereadores);
      tiposProp = tiposDe(fx.proposicoes_tipos, "proposicao");
      tiposNorma = tiposDe(fx.legislacoes_tipos, "norma").filter((t) => NORMAS.includes(t.contract));
      propPorTipo = Object.fromEntries(Object.entries(fx.proposicoes).map(([k, v]) => [k, proposicoesResponse.parse(v).filter(noEscopo)]));
      normaPorTipo = Object.fromEntries(Object.entries(fx.legislacoes).map(([k, v]) => [k, proposicoesResponse.parse(v).filter(noEscopo)]));
      modo = "amostra";
      avisos.push("Dados de amostra: build sem token. Não usar em produção.");
    } else {
      const cliente = o.cliente;
      const cache = await lerCache(p.cache, avisos);
      const incremental =
        cache !== null &&
        cache.completoEm !== null &&
        agora().getTime() - Date.parse(cache.completoEm) < FULL_REFRESH_DIAS * 86_400_000 &&
        !o.completa;
      modo = incremental ? "incremental" : "completo";
      log(`Modo ${modo}${cache?.completoEm ? ` (última coleta completa: ${cache.completoEm})` : ""}.`);

      const rawVer = await cliente.get("vereadores");
      const extras = unknownKeys("vereador", rawVer);
      if (extras.length) avisos.push(`vereadores: campos novos na API: ${extras.join(", ")}`);
      const ver = vereadoresResponse.safeParse(rawVer);
      if (!ver.success) throw new ColetaError("Formato inesperado em vereadores", "formato");
      vereadoresApi = ver.data;
      if (vereadoresApi.length < 9 || vereadoresApi.length > 21) {
        throw new ColetaError(`${vereadoresApi.length} vereadores em exercício: fora do plausível`, "plausibilidade");
      }
      tiposProp = tiposDe(await cliente.get("proposicoes_tipos"), "proposicao");
      tiposNorma = tiposDe(await cliente.get("legislacoes_tipos"), "norma").filter((t) => NORMAS.includes(t.contract));

      const novo: Cache = {
        versao: 1,
        completoEm: incremental ? (cache?.completoEm ?? null) : agora().toISOString(),
        proposicoes: {},
        normas: {},
      };
      const ctx = { cliente, incremental, avisos, log };
      for (const t of tiposProp) novo.proposicoes[t.contract] = await coletarTipo(ctx, "proposicoes", t.contract, cache?.proposicoes[t.contract]);
      for (const t of tiposNorma) novo.normas[t.contract] = await coletarTipo(ctx, "legislacoes", t.contract, cache?.normas[t.contract]);
      requisicoes = cliente.requisicoes;
      await escrita.escrever(p.cache, JSON.stringify(novo));
      propPorTipo = Object.fromEntries(Object.entries(novo.proposicoes).map(([k, v]) => [k, Object.values(v.itens)]));
      normaPorTipo = Object.fromEntries(Object.entries(novo.normas).map(([k, v]) => [k, Object.values(v.itens)]));

      for (const v of vereadoresApi) {
        const slug = toVereador(v, null).slug;
        fotos.set(slug, await obterFoto(v, slug, { ...p, escrita, baixar: o.baixarFoto, pausa, avisos, agora }));
      }
    }

    const vereadores: Vereador[] = vereadoresApi
      .map((v) => toVereador(v, null))
      .map((v) => ({ ...v, foto: fotos.get(v.slug) ?? null }))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    if (new Set(vereadores.map((v) => v.slug)).size !== vereadores.length) {
      throw new ColetaError("Dois vereadores geraram o mesmo endereço (slug).", "formato");
    }
    const mapa = mapaVereadores(vereadores);
    const proposicoes: Registro[] = Object.entries(propPorTipo)
      .flatMap(([tipo, itens]) => itens.map((it) => toRegistro(it, tipo, mapa)))
      .sort(ordemEstavel);
    const normas: Norma[] = Object.entries(normaPorTipo)
      .flatMap(([tipo, itens]) => itens.map((it) => toNorma(it, tipo, vereadores)))
      .sort(ordemEstavel);
    if (proposicoes.length === 0) throw new ColetaError("Nenhuma proposição no escopo: coletor quebrado.", "plausibilidade");

    if (modo !== "amostra" && o.ultimoPublicado) {
      const antes = await o.ultimoPublicado().catch(() => null);
      if (antes === null) avisos.push("Não foi possível ler o manifesto publicado para comparar o volume.");
      else {
        for (const [nome, atual, anterior] of [["proposições", proposicoes.length, antes.proposicoes], ["normas", normas.length, antes.normas]] as const) {
          if (anterior > 20 && atual < anterior * (1 - QUEDA_MAXIMA)) {
            throw new ColetaError(`${atual} ${nome} agora contra ${anterior} na última publicação: queda brusca = coletor quebrado.`, "plausibilidade");
          }
        }
      }
    }

    for (const v of vereadores) {
      if (!proposicoes.some((r) => r.autoresVereadores.includes(v.slug))) {
        avisos.push(`${v.nome} não tem nenhuma proposição ligada ao nome. Possível troca de nome parlamentar: revisar src/lib/content/apelidos.ts.`);
      }
    }
    const semAno = proposicoes.filter((r) => r.ano === null).length;
    if (semAno > 0) avisos.push(`${semAno} proposições sem número/ano reconhecível no título.`);
    const amanha = new Date(agora().getTime() + 86_400_000).toISOString().slice(0, 10);
    const futuras = [...proposicoes, ...normas].filter((r) => r.data.slice(0, 10) > amanha).length;
    if (futuras > 0) avisos.push(`${futuras} registros com data de publicação no futuro: conferir na fonte.`);

    const tipos: Tipo[] = [
      ...tiposProp.map((t) => ({ contract: t.contract, titulo: t.titulo, grupo: "proposicao" as const })),
      ...tiposNorma.map((t) => ({ contract: t.contract, titulo: t.titulo, grupo: "norma" as const })),
    ];
    const dataset: Dataset = {
      fonte: {
        nome: "API de Dados Abertos da Câmara Municipal de Pindamonhangaba",
        url: "https://www.pindamonhangaba.sp.leg.br/dadosabertos",
        termos:
          "Acesso livre para qualquer finalidade, respeitada a legislação. A Câmara responde pelas informações até o momento do acesso; depois da extração, a responsabilidade pelo uso é de quem usa.",
      },
      escopo: { inicio: ESCOPO_INICIO, descricao: "Legislatura 2025–2028" },
      execucao: { coletadoEm: agora().toISOString(), modo, requisicoes, duracaoMs: agora().getTime() - inicio, avisos },
      vereadores,
      tipos,
      proposicoes,
      normas,
    };

    await escrita.escrever(p.dataset, JSON.stringify(dataset));
    await escreverDadosAbertos(escrita, p.dados, dataset);
    await escrita.promover();
    for (const a of avisos) log(`aviso: ${a}`);
    log(`${proposicoes.length} proposições, ${normas.length} normas, ${vereadores.length} vereadores; ${requisicoes} requisições em ${Math.round(dataset.execucao.duracaoMs / 1000)} s.`);
    return dataset;
  } catch (e) {
    await escrita.descartar();
    throw e;
  }
}

/** Same input, same order: newest first, then type and id. Makes repeated collections byte-identical. */
function ordemEstavel(a: Registro, b: Registro): number {
  return b.data.localeCompare(a.data) || a.tipo.localeCompare(b.tipo) || Number(b.id) - Number(a.id);
}

async function lerCache(arquivo: string, avisos: string[]): Promise<Cache | null> {
  let bruto: string;
  try {
    bruto = await readFile(arquivo, "utf8");
  } catch {
    return null; // No cache yet: first collection or evicted build cache.
  }
  try {
    const r = esquemaCache.safeParse(JSON.parse(bruto));
    if (r.success) return r.data;
  } catch {
    // Unreadable JSON is handled like an invalid cache below.
  }
  avisos.push("Cache de coleta ilegível ou em formato antigo: feita coleta completa.");
  return null;
}

function tiposDe(raw: unknown, grupo: Tipo["grupo"]): TipoApi[] {
  const parsed = tiposResponse.safeParse(raw);
  if (!parsed.success) throw new ColetaError(`Formato inesperado em tipos (${grupo})`, "formato");
  if (parsed.data.length === 0) throw new ColetaError(`Lista de tipos (${grupo}) vazia`, "plausibilidade");
  return parsed.data;
}

async function coletarTipo(
  ctx: { cliente: ClienteApi; incremental: boolean; avisos: string[]; log: (m: string) => void },
  call: "proposicoes" | "legislacoes",
  contract: string,
  anterior: CacheTipo | undefined,
): Promise<CacheTipo> {
  const { cliente, incremental, avisos } = ctx;
  const itens: Record<string, ProposicaoApi> = incremental && anterior ? { ...anterior.itens } : {};
  const maisRecente = anterior ? Object.values(anterior.itens).map((i) => i.data).sort().at(-1) : undefined;
  const corte = incremental && maisRecente ? diasAtras(maisRecente, SOBREPOSICAO_DIAS) : null;
  const vistos = new Set<string>();

  for (let pagina = 1; pagina <= MAX_PAGINAS; pagina++) {
    const raw = await cliente.get(call, { tipo: contract, pagina });
    const extras = unknownKeys("proposicao", raw);
    if (extras.length) avisos.push(`${call}/${contract}: campos novos na API: ${extras.join(", ")}`);
    const parsed = proposicoesResponse.safeParse(raw);
    if (!parsed.success) {
      throw new ColetaError(`Formato inesperado em ${call}/${contract} p.${pagina}: ${parsed.error.message.slice(0, 300)}`, "formato");
    }
    const page = parsed.data;
    if (page.length === 0) {
      if (pagina === 1 && anterior && Object.keys(anterior.itens).length > 0) {
        throw new ColetaError(`${call}/${contract}: primeira página vazia apesar de registros anteriores`, "plausibilidade");
      }
      break;
    }
    let novosNaPagina = 0;
    for (const item of page) {
      const id = idDoLink(item.link);
      if (!id) {
        avisos.push(`${call}/${contract}: registro sem id numérico no link ignorado (${item.titulo.slice(0, 60)}).`);
        continue;
      }
      if (!vistos.has(id)) novosNaPagina++;
      vistos.add(id);
      // The same id twice in one collection keeps the last version seen.
      if (noEscopo(item)) itens[id] = item;
    }
    // A page that repeats only records already seen means the pagination is looping.
    if (novosNaPagina === 0 && page.length >= 5) throw new ColetaError(`${call}/${contract}: página ${pagina} só repete registros (paginação em loop).`, "plausibilidade");
    if (page.every((it) => it.data.slice(0, 10) < ESCOPO_INICIO)) break;
    if (corte && page.every((it) => it.data.slice(0, 10) < corte)) break;
    if (pagina === MAX_PAGINAS) throw new ColetaError(`${contract}: limite de páginas atingido`, "plausibilidade");
  }

  const antes = anterior ? Object.keys(anterior.itens).length : 0;
  const depois = Object.keys(itens).length;
  if (!incremental && antes > 20 && depois < antes * (1 - QUEDA_MAXIMA)) {
    throw new ColetaError(
      `${call}/${contract}: ${depois} registros agora contra ${antes} na coleta anterior. Queda brusca = coletor quebrado, não "menos proposições".`,
      "plausibilidade",
    );
  }
  ctx.log(`${call}/${contract}: ${depois} registros no escopo (${incremental ? "incremental" : "completo"})`);
  return { itens };
}

async function obterFoto(
  v: VereadorApi,
  slug: string,
  o: {
    fotos: string;
    cacheDir: string;
    escrita: Escrita;
    baixar?: (url: string) => Promise<Buffer>;
    pausa: (ms: number) => Promise<void>;
    avisos: string[];
    agora: () => Date;
  },
): Promise<string | null> {
  if (!o.baixar) return null;
  try {
    const origem = validarUrlFoto(v.imagem);
    const ext = (/\.(jpe?g|png|webp)$/i.exec(origem.pathname)?.[1] ?? "jpg").toLowerCase().replace("jpeg", "jpg");
    const nome = `${slug}.${ext}`;
    const hash = createHash("sha256").update(origem.href).digest("hex").slice(0, 16);
    const cacheFoto = path.join(o.cacheDir, "fotos", `${slug}-${hash}.${ext}`);
    let bytes: Buffer | null = null;
    try {
      const s = await stat(cacheFoto);
      if (o.agora().getTime() - s.mtimeMs < FULL_REFRESH_DIAS * 86_400_000) bytes = await readFile(cacheFoto);
    } catch {
      bytes = null; // Not cached yet.
    }
    if (!bytes) {
      await o.pausa(1100);
      bytes = await o.baixar(origem.href);
      await mkdir(path.dirname(cacheFoto), { recursive: true });
      await writeFile(cacheFoto, bytes);
    }
    await o.escrita.escrever(path.join(o.fotos, nome), bytes);
    return `/fotos/${nome}`;
  } catch (e) {
    o.avisos.push(`Foto de ${v.nome} não baixada (${e instanceof Error ? e.message : "erro desconhecido"}); a página mostra só o nome.`);
    return null;
  }
}

async function escreverDadosAbertos(escrita: Escrita, dir: string, d: Dataset) {
  const cab = ["id", "tipo", "titulo", "numero", "ano", "data_publicacao", "autoria", "ementa", "link_oficial"];
  const linha = (r: Registro) => [r.id, r.tipo, r.titulo, r.numero, r.ano, r.data, r.autoria, r.ementa, r.link];
  await escrita.escrever(path.join(dir, "proposicoes.csv"), csv([cab, ...d.proposicoes.map(linha)]));
  await escrita.escrever(path.join(dir, "normas.csv"), csv([cab, ...d.normas.map(linha)]));
  await escrita.escrever(path.join(dir, "proposicoes.json"), JSON.stringify(d.proposicoes));
  await escrita.escrever(path.join(dir, "normas.json"), JSON.stringify(d.normas));
  await escrita.escrever(path.join(dir, "vereadores.json"), JSON.stringify(d.vereadores));
  // Type catalogue: with it the open data rebuilds the whole dataset (used by the VPS mirror).
  await escrita.escrever(path.join(dir, "tipos.json"), JSON.stringify(d.tipos));
  await escrita.escrever(
    path.join(dir, "manifesto.json"),
    JSON.stringify(
      {
        fonte: d.fonte,
        escopo: d.escopo,
        execucao: d.execucao,
        totais: { proposicoes: d.proposicoes.length, normas: d.normas.length, vereadores: d.vereadores.length },
      },
      null,
      2,
    ),
  );
}
