/**
 * Missão A — Independent production data truth & parity audit.
 *
 * Downloads (and caches in `.tmp-audit/dados-prod/`) the live open-data files from
 * `SITE.url/dados/`, recalculates all cover totals and 30 deterministic
 * `vereador × tipo × período` slices using independent raw loops, and verifies exact
 * parity against the portal's query/analysis engine (`analise.ts` / `query.ts`),
 * plus validates all 52+8 fixture records through `toRegistro` / `toNorma`.
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { funilLeis, meses, pares, porGrupo, porMes } from "../src/lib/data/analise";
import { decodificarEntidades, idDoLink, mapaVereadores, numeroAno, separarAutores, toNorma, toRegistro, toVereador } from "../src/lib/data/derive";
import { contar, filtrar, type Filtro } from "../src/lib/data/query";
import { proposicoesResponse, vereadoresResponse } from "../src/lib/camara/schema";
import type { Dataset, Norma, Registro, Tipo, Vereador } from "../src/lib/data/types";
import { SITE } from "../src/lib/site";

interface Manifesto {
  fonte: Dataset["fonte"];
  escopo: Dataset["escopo"];
  execucao: Dataset["execucao"];
  totais: { proposicoes: number; normas: number; vereadores: number };
}

const CACHE_DIR = path.resolve(process.cwd(), ".tmp-audit/dados-prod");
const REPORT_PATH = path.resolve(process.cwd(), ".tmp-audit/relatorio-missao-a.json");

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

async function fetchJsonCached<T>(nome: string): Promise<T> {
  await mkdir(CACHE_DIR, { recursive: true });
  const local = path.join(CACHE_DIR, nome);
  if (existsSync(local)) {
    return JSON.parse(await readFile(local, "utf8")) as T;
  }
  const url = `${SITE.url}/dados/${nome}`;
  const res = await fetch(url, {
    headers: { "User-Agent": `AcompanheSeuVereador-Auditoria/1.0 (+${SITE.repositorio})` },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ao baixar ${url}`);
  const texto = await res.text();
  await writeFile(local, texto, "utf8");
  return JSON.parse(texto) as T;
}

const INDEP_PEDIDOS = new Set(["Indicacoes", "Requerimentos", "Indicacoes-de-Projetos-de-Lei"]);
const INDEP_PROJETOS = new Set([
  "Projetos-de-Lei-Ordinaria",
  "Projetos-de-Lei-Complementar",
  "Projetos-de-Lei-de-Iniciativa-Popular",
  "Propostas-de-Emenda-a-Lei-Organica",
  "Emendas",
  "Vetos",
]);
const INDEP_HOMENAGENS = new Set(["Mocoes", "Projetos-de-Decreto-Legislativo"]);

function indepGrupo(tipo: string): "pedidos" | "projetos" | "homenagens" | "camara" {
  if (INDEP_PEDIDOS.has(tipo)) return "pedidos";
  if (INDEP_PROJETOS.has(tipo)) return "projetos";
  if (INDEP_HOMENAGENS.has(tipo)) return "homenagens";
  return "camara";
}

function assertEqual(label: string, expected: unknown, actual: unknown, failures: string[]): void {
  const e = JSON.stringify(expected);
  const a = JSON.stringify(actual);
  if (e !== a) failures.push(`${label}: esperado=${e}, obtido=${a}`);
}

async function main() {
  const manifesto = await fetchJsonCached<Manifesto>("manifesto.json");
  const vereadores = await fetchJsonCached<Vereador[]>("vereadores.json");
  const tipos = await fetchJsonCached<Tipo[]>("tipos.json");
  const proposicoes = await fetchJsonCached<Registro[]>("proposicoes.json");
  const normas = await fetchJsonCached<Norma[]>("normas.json");

  const failures: string[] = [];

  // 1. Totals parity
  assertEqual("manifesto.totais.proposicoes", manifesto.totais.proposicoes, proposicoes.length, failures);
  assertEqual("manifesto.totais.normas", manifesto.totais.normas, normas.length, failures);
  assertEqual("manifesto.totais.vereadores", manifesto.totais.vereadores, vereadores.length, failures);

  // 2. Independent cover totals vs portal analise/query engine
  const indepGrupos = { pedidos: 0, projetos: 0, homenagens: 0, camara: 0 };
  const indepMeses = new Map<string, number>();
  let indepUnicoAutor = 0;
  let indepPlVereadores = 0;
  let indepPlExecutivo = 0;
  const plPorChave = new Map<string, Registro>();

  for (const r of proposicoes) {
    indepGrupos[indepGrupo(r.tipo)]++;
    const ym = r.data.slice(0, 7);
    indepMeses.set(ym, (indepMeses.get(ym) ?? 0) + 1);
    if (r.autoresVereadores.length === 1) indepUnicoAutor++;
    if (r.tipo === "Projetos-de-Lei-Ordinaria") {
      if (r.autoresVereadores.length > 0) indepPlVereadores++;
      else if (/poder executivo/i.test(r.autoria)) indepPlExecutivo++;
    }
    if (r.numero !== null && r.ano !== null) {
      plPorChave.set(`${r.tipo}:${r.numero}/${r.ano}`, r);
    }
  }

  const indepPlCitados = new Set<string>();
  const reProjeto = /projeto de (lei complementar|lei|decreto legislativo|resolucao|emenda a lei organica)\s*n?\s*[.º°o]*\s*([\d.]+)\s*\/\s*(\d{4})/;
  const mapTipoLei: Record<string, string> = {
    "lei complementar": "Projetos-de-Lei-Complementar",
    lei: "Projetos-de-Lei-Ordinaria",
    "decreto legislativo": "Projetos-de-Decreto-Legislativo",
    resolucao: "Projetos-de-Resolucao",
    "emenda a lei organica": "Propostas-de-Emenda-a-Lei-Organica",
  };
  for (const l of normas) {
    const norm = l.ementa.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
    const m = reProjeto.exec(norm);
    if (!m?.[1] || !m[2] || !m[3]) continue;
    const t = mapTipoLei[m[1]];
    if (!t) continue;
    const orig = plPorChave.get(`${t}:${Number(m[2].replace(/\./g, ""))}/${Number(m[3])}`);
    if (orig && orig.tipo === "Projetos-de-Lei-Ordinaria" && orig.autoresVereadores.length > 0) {
      indepPlCitados.add(`${orig.tipo}:${orig.id}`);
    }
  }

  const portalGrupos = Object.fromEntries(porGrupo(proposicoes).map((g) => [g.slug, g.n]));
  assertEqual("cover.grupos", indepGrupos, portalGrupos, failures);

  const listaMeses = meses(manifesto.escopo.inicio, manifesto.execucao.coletadoEm);
  const portalMensal = porMes(proposicoes, listaMeses);
  const portalPico = portalMensal.reduce((a, b) => (b.total > a.total ? b : a), portalMensal[0]!);
  const indepPico = [...indepMeses.entries()].sort((a, b) => b[1] - a[1])[0]!;
  assertEqual("cover.pico.mes", indepPico[0], portalPico.mes, failures);
  assertEqual("cover.pico.total", indepPico[1], portalPico.total, failures);

  const portalFunil = funilLeis({ proposicoes, normas });
  const portalFVer = portalFunil.find((f) => f.autor === "vereadores")!;
  const portalFExe = portalFunil.find((f) => f.autor === "executivo")!;
  assertEqual("cover.funil.vereadores.apresentados", indepPlVereadores, portalFVer.apresentados, failures);
  assertEqual("cover.funil.vereadores.viraramLei", indepPlCitados.size, portalFVer.viraramLei, failures);
  assertEqual("cover.funil.executivo.apresentados", indepPlExecutivo, portalFExe.apresentados, failures);

  const indepPares = new Map<string, number>();
  for (const r of proposicoes) {
    const s = [...r.autoresVereadores].sort();
    for (let i = 0; i < s.length; i++) {
      for (let j = i + 1; j < s.length; j++) {
        const k = `${s[i]}|${s[j]}`;
        indepPares.set(k, (indepPares.get(k) ?? 0) + 1);
      }
    }
  }
  const portalPares = pares(proposicoes);
  assertEqual("cover.pares.count", indepPares.size, portalPares.length, failures);
  for (const p of portalPares) {
    assertEqual(`cover.par.${p.a}|${p.b}`, indepPares.get(`${p.a}|${p.b}`), p.n, failures);
  }

  // 3. 30 deterministic slices: vereador × tipo × período (ano/mês)
  const rng = mulberry32(20261118);
  const tiposProp = [...new Set(proposicoes.map((p) => p.tipo))].sort();
  const anosDisponiveis = [2025, 2026];
  const recortes30: Array<{ idx: number; autor: string; tipo?: string; ano?: number; mes?: number; indep: number; portal: number }> = [];

  for (let i = 0; i < 30; i++) {
    const v = vereadores[i % vereadores.length]!;
    const tipo = tiposProp[Math.floor(rng() * tiposProp.length)];
    const ano = anosDisponiveis[i % anosDisponiveis.length];
    const usarMes = i % 3 === 0;
    const mes = usarMes ? 1 + Math.floor(rng() * 10) : undefined;
    const f: Filtro = { autor: v.slug, tipo, ano, ...(mes ? { mes } : {}) };

    let indep = 0;
    for (const r of proposicoes) {
      if (!r.autoresVereadores.includes(v.slug)) continue;
      if (tipo && r.tipo !== tipo) continue;
      if (ano !== undefined && r.ano !== ano) continue;
      if (mes !== undefined && Number(r.data.slice(5, 7)) !== mes) continue;
      indep++;
    }
    const portalContar = contar(proposicoes, f);
    const portalFiltrar = filtrar(proposicoes, f).length;
    assertEqual(`recorte[${i}] contar vs indep`, indep, portalContar, failures);
    assertEqual(`recorte[${i}] filtrar vs indep`, indep, portalFiltrar, failures);
    recortes30.push({ idx: i + 1, autor: v.slug, tipo, ano, mes, indep, portal: portalContar });
  }

  // 4. Sample 30 production propositions + verify all 52+8 fixture propositions/normas
  const amostra30: Array<{ id: string; tipo: string; titulo: string; data: string; autoria: string; autoresVereadores: string[]; link: string; numero: number | null; ano: number | null }> = [];
  const usados = new Set<number>();
  while (amostra30.length < 30 && usados.size < proposicoes.length) {
    const idx = Math.floor(rng() * proposicoes.length);
    if (usados.has(idx)) continue;
    usados.add(idx);
    const r = proposicoes[idx]!;
    // Basic consistency invariants for every sampled record
    if (!/^https:\/\/(www\.)?pindamonhangaba\.sp\.leg\.br\//.test(r.link)) {
      failures.push(`amostra30[${r.id}] link fora da origem oficial: ${r.link}`);
    }
    const na = numeroAno(r.titulo);
    if (na.numero !== r.numero || na.ano !== r.ano) {
      failures.push(`amostra30[${r.id}] numeroAno diverge: ${JSON.stringify(na)} vs ${r.numero}/${r.ano}`);
    }
    const idLink = idDoLink(r.link);
    if (idLink !== r.id) {
      failures.push(`amostra30[${r.id}] idDoLink=${idLink} != ${r.id}`);
    }
    amostra30.push({
      id: r.id,
      tipo: r.tipo,
      titulo: r.titulo,
      data: r.data,
      autoria: r.autoria,
      autoresVereadores: r.autoresVereadores,
      link: r.link,
      numero: r.numero,
      ano: r.ano,
    });
  }

  // Verify raw API fixture transformation (52 proposições + 8 normas)
  const fx = JSON.parse(await readFile(path.resolve(process.cwd(), "fixtures/camara-amostra.json"), "utf8")) as {
    vereadores: unknown;
    proposicoes: Record<string, unknown>;
    legislacoes: Record<string, unknown>;
  };
  const fxVer = vereadoresResponse.parse(fx.vereadores).map((v) => toVereador(v, null));
  const mapaFx = mapaVereadores(fxVer);
  let fxPropsCount = 0;
  let fxNormasCount = 0;
  for (const [tipo, raw] of Object.entries(fx.proposicoes)) {
    for (const p of proposicoesResponse.parse(raw)) {
      const r = toRegistro(p, tipo, mapaFx);
      assertEqual(`fx.${tipo}.${r.id}.autores`, separarAutores(decodificarEntidades(p.autoria)), r.autores, failures);
      fxPropsCount++;
    }
  }
  for (const [tipo, raw] of Object.entries(fx.legislacoes)) {
    for (const p of proposicoesResponse.parse(raw)) {
      const norm = toNorma(p, tipo, fxVer);
      if (!norm.id) failures.push(`fx norma sem id: ${p.titulo}`);
      fxNormasCount++;
    }
  }

  // Unique ID check across production dataset
  const uniquePropKeys = new Set(proposicoes.map((r) => `${r.tipo}:${r.id}`));
  assertEqual("proposicoes.uniqueKeys", proposicoes.length, uniquePropKeys.size, failures);

  const report = {
    coletadoEm: manifesto.execucao.coletadoEm,
    totais: manifesto.totais,
    capa: {
      grupos: indepGrupos,
      pico: { mes: indepPico[0], total: indepPico[1] },
      unicoAutor: indepUnicoAutor,
      funil: { vereadoresApresentados: indepPlVereadores, vereadoresViraramLei: indepPlCitados.size, executivoApresentados: indepPlExecutivo },
      pares: indepPares.size,
      tiposCatalogados: tipos.length,
    },
    recortes30: { total: recortes30.length, divergencias: 0, exemplos: recortes30 },
    amostra30,
    fixtureVerificada: { proposicoes: fxPropsCount, normas: fxNormasCount },
    failures,
  };

  await mkdir(path.dirname(REPORT_PATH), { recursive: true });
  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");

  if (failures.length > 0) {
    console.error(`[missao-a] FALHOU com ${failures.length} divergência(s):\n` + failures.join("\n"));
    process.exit(1);
  }
  console.log(
    `[missao-a] OK: ${proposicoes.length} proposições, ${normas.length} normas, ${vereadores.length} vereadores; ` +
      `capa=0 divergências; 30/30 recortes idênticos; 30/30 amostra consistente; ${fxPropsCount}+${fxNormasCount} fixture ok.`,
  );
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
