/**
 * Collects the Câmara open-data API into data/generated/dataset.json and public/dados/.
 * Runs before `next build`. If anything looks wrong the build fails, so Vercel keeps
 * serving the previous deployment instead of publishing broken data.
 */
import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { CamaraClient, ColetaError } from "../src/lib/camara/client";
import { obterFotoSegura, validarUrlFoto } from "../src/lib/camara/foto";
import { csv } from "../src/lib/data/csv";
import {
  proposicoesResponse,
  tiposResponse,
  unknownKeys,
  vereadoresResponse,
  type ProposicaoApi,
  type TipoApi,
  type VereadorApi,
} from "../src/lib/camara/schema";
import { idDoLink, mapaVereadores, numeroAno, toNorma, toRegistro, toVereador } from "../src/lib/data/derive";
import type { Dataset, Execucao, Norma, Registro, Tipo, Vereador } from "../src/lib/data/types";

const ROOT = path.resolve(__dirname, "..");
const OUT_DATASET = path.join(ROOT, "data/generated/dataset.json");
const OUT_PUBLIC = path.join(ROOT, "public/dados");
const OUT_FOTOS = path.join(ROOT, "public/fotos");
const CACHE_DIR = path.join(ROOT, ".next/cache/acompanhe");
const CACHE_FILE = path.join(CACHE_DIR, "coleta.json");
const FIXTURE = path.join(ROOT, "fixtures/camara-amostra.json");

/** Current legislature (2025–2028). */
const ESCOPO_INICIO = "2025-01-01";
const ANO_INICIO = 2025;
/** Normative acts shown on the site; administrative publications are left to the official site. */
const NORMAS = ["Leis-Ordinarias", "Leis-Complementares", "Emendas-a-Lei-Organica", "Resolucoes", "Decretos-Legislativos"];
const FULL_REFRESH_DIAS = 30;
const SOBREPOSICAO_DIAS = 45;
const MAX_PAGINAS = 1500;

interface CacheTipo {
  itens: Record<string, ProposicaoApi>;
}
interface Cache {
  versao: 1;
  completoEm: string | null;
  proposicoes: Record<string, CacheTipo>;
  normas: Record<string, CacheTipo>;
}

const avisos: string[] = [];
const log = (msg: string) => console.log(`[coleta] ${msg}`);

function noEscopo(p: ProposicaoApi): boolean {
  const { ano } = numeroAno(p.titulo);
  return p.data.slice(0, 10) >= ESCOPO_INICIO || (ano !== null && ano >= ANO_INICIO);
}

function diasAtras(iso: string, dias: number): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - dias);
  return d.toISOString().slice(0, 10);
}

async function lerCache(): Promise<Cache | null> {
  try {
    const raw = JSON.parse(await readFile(CACHE_FILE, "utf8")) as Cache;
    return raw.versao === 1 ? raw : null;
  } catch {
    return null;
  }
}

async function coletarTipo(
  client: CamaraClient,
  call: "proposicoes" | "legislacoes",
  contract: string,
  anterior: CacheTipo | undefined,
  incremental: boolean,
): Promise<CacheTipo> {
  const itens: Record<string, ProposicaoApi> = incremental && anterior ? { ...anterior.itens } : {};
  const datasAnteriores = anterior ? Object.values(anterior.itens).map((i) => i.data) : [];
  const maisRecente = datasAnteriores.sort().at(-1);
  const corte = incremental && maisRecente ? diasAtras(maisRecente, SOBREPOSICAO_DIAS) : null;

  for (let pagina = 1; pagina <= MAX_PAGINAS; pagina++) {
    const raw = await client.get(call, { tipo: contract, pagina });
    const extras = unknownKeys("proposicao", raw);
    if (extras.length) avisos.push(`${call}/${contract}: campos novos na API: ${extras.join(", ")}`);
    const parsed = proposicoesResponse.safeParse(raw);
    if (!parsed.success) {
      throw new ColetaError(`Formato inesperado em ${call}/${contract} p.${pagina}: ${parsed.error.message.slice(0, 300)}`, "formato");
    }
    const page = parsed.data;
    if (page.length === 0) break;
    for (const p of page) {
      const id = idDoLink(p.link);
      if (id && noEscopo(p)) itens[id] = p;
    }
    if (page.every((p) => p.data.slice(0, 10) < ESCOPO_INICIO)) break;
    if (corte && page.every((p) => p.data.slice(0, 10) < corte)) break;
    if (pagina === MAX_PAGINAS) throw new ColetaError(`${contract}: limite de páginas atingido`, "plausibilidade");
  }

  const antes = anterior ? Object.keys(anterior.itens).length : 0;
  const depois = Object.keys(itens).length;
  if (!incremental && antes > 20 && depois < antes * 0.9) {
    throw new ColetaError(
      `${call}/${contract}: ${depois} registros agora contra ${antes} na coleta anterior. Queda brusca = coletor quebrado, não "menos proposições".`,
      "plausibilidade",
    );
  }
  log(`${call}/${contract}: ${depois} registros no escopo (${incremental ? "incremental" : "completo"})`);
  return { itens };
}

async function baixarFoto(v: VereadorApi, slug: string): Promise<string | null> {
  try {
    const origem = validarUrlFoto(v.imagem);
    const ext = (/\.(jpe?g|png|webp)$/i.exec(origem.pathname)?.[1] ?? "jpg").toLowerCase().replace("jpeg", "jpg");
    const nome = `${slug}.${ext}`;
    const hash = createHash("sha256").update(origem.href).digest("hex").slice(0, 16);
    const cacheFoto = path.join(CACHE_DIR, "fotos", `${slug}-${hash}.${ext}`);
    let bytes: Buffer | null = null;
    try {
      const s = await stat(cacheFoto);
      if (Date.now() - s.mtimeMs < FULL_REFRESH_DIAS * 86_400_000) bytes = await readFile(cacheFoto);
    } catch {
      bytes = null;
    }
    if (!bytes) {
      await new Promise((r) => setTimeout(r, 1100));
      bytes = await obterFotoSegura(origem.href);
      await mkdir(path.dirname(cacheFoto), { recursive: true });
      await writeFile(cacheFoto, bytes);
    }
    await writeFile(path.join(OUT_FOTOS, nome), bytes);
    return `/fotos/${nome}`;
  } catch (e) {
    avisos.push(`Foto de ${v.nome} não baixada (${String(e)}); a página mostra só o nome.`);
    return null;
  }
}

function tiposDe(raw: unknown, grupo: Tipo["grupo"]): TipoApi[] {
  const parsed = tiposResponse.safeParse(raw);
  if (!parsed.success) throw new ColetaError(`Formato inesperado em tipos (${grupo})`, "formato");
  if (parsed.data.length === 0) throw new ColetaError(`Lista de tipos (${grupo}) vazia`, "plausibilidade");
  return parsed.data;
}

async function main() {
  const inicio = Date.now();
  const token = process.env.CAMARA_API_TOKEN?.trim();
  const producao = process.env.VERCEL_ENV === "production";
  await mkdir(path.dirname(OUT_DATASET), { recursive: true });
  await mkdir(OUT_PUBLIC, { recursive: true });
  await mkdir(OUT_FOTOS, { recursive: true });

  let vereadoresApi: VereadorApi[];
  let tiposProp: TipoApi[];
  let tiposNorma: TipoApi[];
  let propPorTipo: Record<string, ProposicaoApi[]>;
  let normaPorTipo: Record<string, ProposicaoApi[]>;
  let modo: Execucao["modo"];
  let requisicoes = 0;
  const fotos = new Map<string, string | null>();

  if (!token) {
    if (producao) throw new ColetaError("CAMARA_API_TOKEN ausente no ambiente de produção.", "vazio");
    log("Sem CAMARA_API_TOKEN: usando a amostra real em fixtures/ (só para desenvolvimento).");
    const fx = JSON.parse(await readFile(FIXTURE, "utf8")) as {
      vereadores: unknown;
      proposicoes_tipos: unknown;
      legislacoes_tipos: unknown;
      proposicoes: Record<string, unknown>;
      legislacoes: Record<string, unknown>;
    };
    vereadoresApi = vereadoresResponse.parse(fx.vereadores);
    tiposProp = tiposDe(fx.proposicoes_tipos, "proposicao");
    tiposNorma = tiposDe(fx.legislacoes_tipos, "norma").filter((t) => NORMAS.includes(t.contract));
    propPorTipo = Object.fromEntries(
      Object.entries(fx.proposicoes).map(([k, v]) => [k, proposicoesResponse.parse(v).filter(noEscopo)]),
    );
    normaPorTipo = Object.fromEntries(
      Object.entries(fx.legislacoes).map(([k, v]) => [k, proposicoesResponse.parse(v).filter(noEscopo)]),
    );
    modo = "amostra";
    avisos.push("Dados de amostra: build sem token. Não usar em produção.");
  } else {
    const client = new CamaraClient({ token });
    const cache = await lerCache();
    const incremental =
      cache !== null &&
      cache.completoEm !== null &&
      Date.now() - Date.parse(cache.completoEm) < FULL_REFRESH_DIAS * 86_400_000 &&
      process.env.COLETA_COMPLETA !== "1";
    modo = incremental ? "incremental" : "completo";
    log(`Modo ${modo}${cache?.completoEm ? ` (última coleta completa: ${cache.completoEm})` : ""}.`);

    const rawVer = await client.get("vereadores");
    const extras = unknownKeys("vereador", rawVer);
    if (extras.length) avisos.push(`vereadores: campos novos na API: ${extras.join(", ")}`);
    vereadoresApi = vereadoresResponse.parse(rawVer);
    if (vereadoresApi.length < 9 || vereadoresApi.length > 21) {
      throw new ColetaError(`${vereadoresApi.length} vereadores em exercício: fora do plausível`, "plausibilidade");
    }
    tiposProp = tiposDe(await client.get("proposicoes_tipos"), "proposicao");
    tiposNorma = tiposDe(await client.get("legislacoes_tipos"), "norma").filter((t) => NORMAS.includes(t.contract));

    const novo: Cache = {
      versao: 1,
      completoEm: incremental ? (cache?.completoEm ?? null) : new Date().toISOString(),
      proposicoes: {},
      normas: {},
    };
    for (const t of tiposProp) {
      novo.proposicoes[t.contract] = await coletarTipo(client, "proposicoes", t.contract, cache?.proposicoes[t.contract], incremental);
    }
    for (const t of tiposNorma) {
      novo.normas[t.contract] = await coletarTipo(client, "legislacoes", t.contract, cache?.normas[t.contract], incremental);
    }
    requisicoes = client.requisicoes;
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(CACHE_FILE, JSON.stringify(novo));
    propPorTipo = Object.fromEntries(Object.entries(novo.proposicoes).map(([k, v]) => [k, Object.values(v.itens)]));
    normaPorTipo = Object.fromEntries(Object.entries(novo.normas).map(([k, v]) => [k, Object.values(v.itens)]));

    for (const v of vereadoresApi) {
      const slug = toVereador(v, null).slug;
      fotos.set(slug, await baixarFoto(v, slug));
    }
  }

  const vereadores: Vereador[] = vereadoresApi
    .map((v) => toVereador(v, null))
    .map((v) => ({ ...v, foto: fotos.get(v.slug) ?? null }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  const slugs = new Set(vereadores.map((v) => v.slug));
  if (slugs.size !== vereadores.length) throw new ColetaError("Dois vereadores geraram o mesmo endereço (slug).", "formato");
  const mapa = mapaVereadores(vereadores);

  const proposicoes: Registro[] = Object.entries(propPorTipo).flatMap(([tipo, itens]) =>
    itens.map((p) => toRegistro(p, tipo, mapa)),
  );
  const normas: Norma[] = Object.entries(normaPorTipo).flatMap(([tipo, itens]) =>
    itens.map((p) => toNorma(p, tipo, vereadores)),
  );
  if (proposicoes.length === 0) throw new ColetaError("Nenhuma proposição no escopo: coletor quebrado.", "plausibilidade");

  for (const v of vereadores) {
    if (!proposicoes.some((p) => p.autoresVereadores.includes(v.slug))) {
      avisos.push(`${v.nome} não tem nenhuma proposição ligada ao nome. Possível troca de nome parlamentar: revisar src/lib/content/apelidos.ts.`);
    }
  }
  const semAno = proposicoes.filter((p) => p.ano === null).length;
  if (semAno > 0) avisos.push(`${semAno} proposições sem número/ano reconhecível no título.`);

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
    execucao: {
      coletadoEm: new Date().toISOString(),
      modo,
      requisicoes,
      duracaoMs: Date.now() - inicio,
      avisos,
    },
    vereadores,
    tipos,
    proposicoes,
    normas,
  };

  await writeFile(OUT_DATASET, JSON.stringify(dataset));
  await escreverDadosAbertos(dataset);
  for (const a of avisos) log(`aviso: ${a}`);
  log(`${proposicoes.length} proposições, ${normas.length} normas, ${vereadores.length} vereadores; ${requisicoes} requisições em ${Math.round(dataset.execucao.duracaoMs / 1000)} s.`);
}

async function escreverDadosAbertos(d: Dataset) {
  const cab = ["id", "tipo", "titulo", "numero", "ano", "data_publicacao", "autoria", "ementa", "link_oficial"];
  const linha = (r: Registro) => [r.id, r.tipo, r.titulo, r.numero, r.ano, r.data, r.autoria, r.ementa, r.link];
  await writeFile(path.join(OUT_PUBLIC, "proposicoes.csv"), csv([cab, ...d.proposicoes.map(linha)]));
  await writeFile(path.join(OUT_PUBLIC, "normas.csv"), csv([cab, ...d.normas.map(linha)]));
  await writeFile(path.join(OUT_PUBLIC, "proposicoes.json"), JSON.stringify(d.proposicoes));
  await writeFile(path.join(OUT_PUBLIC, "normas.json"), JSON.stringify(d.normas));
  await writeFile(path.join(OUT_PUBLIC, "vereadores.json"), JSON.stringify(d.vereadores));
  await writeFile(
    path.join(OUT_PUBLIC, "manifesto.json"),
    JSON.stringify({ fonte: d.fonte, escopo: d.escopo, execucao: d.execucao, totais: { proposicoes: d.proposicoes.length, normas: d.normas.length, vereadores: d.vereadores.length } }, null, 2),
  );
}

main().catch((e: unknown) => {
  console.error(`[coleta] FALHOU: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
