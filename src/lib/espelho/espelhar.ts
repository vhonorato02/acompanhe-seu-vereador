/**
 * Mirror of the published portal, used to build the copy that runs on the owner's VPS.
 *
 * The canonical site (Vercel) is the only place that talks to the Câmara API. The mirror
 * rebuilds the same dataset from the portal's own open data (/dados/*.json and /fotos/*),
 * validates every record and checks the totals against the manifest, so the VPS shows exactly
 * the numbers of the canonical site and the Câmara receives no extra requests.
 */
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { origemDaCamara } from "../camara/origem";
import type { Dataset } from "../data/types";

const urlOficial = z.string().refine((url) => origemDaCamara(url) !== null, "Link fora da origem oficial da Câmara");

const vereador = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  nome: z.string().min(1),
  partido: z.string(),
  funcao: z.string(),
  foto: z
    .string()
    .regex(/^\/fotos\/[a-z0-9-]+\.(jpg|png|webp)$/)
    .nullable(),
  fotoOrigem: z.string(),
  link: urlOficial,
});

const tipo = z.object({
  contract: z.string().min(1),
  titulo: z.string().min(1),
  grupo: z.enum(["proposicao", "norma"]),
});

const registro = z.object({
  id: z.string().min(1),
  tipo: z.string().min(1),
  titulo: z.string().min(1),
  numero: z.number().nullable(),
  ano: z.number().nullable(),
  ementa: z.string(),
  autoria: z.string(),
  autores: z.array(z.string()),
  autoresVereadores: z.array(z.string()),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  link: urlOficial,
});

const norma = registro.extend({ autoriaCitadaNaEmenta: z.array(z.string()) });

const manifesto = z.object({
  fonte: z.object({ nome: z.string().min(1), url: z.string().url(), termos: z.string() }),
  escopo: z.object({ inicio: z.string(), descricao: z.string() }),
  execucao: z.object({
    coletadoEm: z.string().datetime(),
    modo: z.enum(["completo", "incremental"], { message: "O site de origem publica uma amostra, não uma coleta real" }),
    requisicoes: z.number(),
    duracaoMs: z.number(),
    avisos: z.array(z.string()),
  }),
  totais: z.object({ proposicoes: z.number().int().positive(), normas: z.number().int().positive(), vereadores: z.number().int().positive() }),
});

export class EspelhoError extends Error {}

export interface OpcoesEspelho {
  /** Canonical site, e.g. https://acompanhe-seu-vereador.vercel.app */
  base: string;
  /** Project root: writes data/generated, public/dados and public/fotos. */
  raiz: string;
  fetchImpl?: typeof fetch;
  /** Pause between requests; the canonical site answers rapid repeats with a bot challenge. */
  pausa?: (ms: number) => Promise<void>;
  userAgent?: string;
  log?: (msg: string) => void;
}

const MAX_FOTO_BYTES = 5 * 1024 * 1024;

function imagemValida(bytes: Buffer): boolean {
  const jpg = bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const webp = bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  return jpg || png || webp;
}

export async function espelhar(o: OpcoesEspelho): Promise<Dataset> {
  const fetchImpl = o.fetchImpl ?? fetch;
  const pausa = o.pausa ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const log = o.log ?? ((m: string) => console.log(`[espelho] ${m}`));
  const base = new URL(o.base);
  let primeira = true;

  async function baixar(caminho: string): Promise<Response> {
    if (!primeira) await pausa(1500);
    primeira = false;
    const url = new URL(caminho, base);
    if (url.origin !== base.origin) throw new EspelhoError(`Caminho fora do site de origem: ${caminho}`);
    const res = await fetchImpl(url, {
      headers: { "User-Agent": o.userAgent ?? "AcompanheSeuVereador-espelho/1.0" },
      redirect: "error",
      signal: AbortSignal.timeout(60_000),
    });
    if (res.status !== 200) throw new EspelhoError(`${url.pathname}: HTTP ${res.status}`);
    return res;
  }

  async function json<T>(caminho: string, schema: z.ZodType<T>): Promise<{ dados: T; bruto: string }> {
    const bruto = await (await baixar(caminho)).text();
    if (!bruto.trim()) throw new EspelhoError(`${caminho}: corpo vazio`);
    let valor: unknown;
    try {
      valor = JSON.parse(bruto);
    } catch {
      throw new EspelhoError(`${caminho}: não é JSON (desafio anti-robô ou página de erro?)`);
    }
    const r = schema.safeParse(valor);
    if (!r.success) throw new EspelhoError(`${caminho}: formato inesperado — ${r.error.issues.slice(0, 3).map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
    return { dados: r.data, bruto };
  }

  const m = await json("/dados/manifesto.json", manifesto);
  const vs = await json("/dados/vereadores.json", z.array(vereador));
  const ts = await json("/dados/tipos.json", z.array(tipo));
  const ps = await json("/dados/proposicoes.json", z.array(registro));
  const ns = await json("/dados/normas.json", z.array(norma));

  const t = m.dados.totais;
  const conferir = (nome: string, esperado: number, obtido: number) => {
    if (esperado !== obtido) throw new EspelhoError(`${nome}: o manifesto diz ${esperado}, o arquivo tem ${obtido}`);
  };
  conferir("proposições", t.proposicoes, ps.dados.length);
  conferir("normas", t.normas, ns.dados.length);
  conferir("vereadores", t.vereadores, vs.dados.length);

  // Copied byte for byte: Response.text() would drop the UTF-8 BOM, and without it Excel opens
  // the accents wrong. Same format as csv() in src/lib/data/csv.ts: BOM, ";" separator.
  const BOM = Buffer.from([0xef, 0xbb, 0xbf]);
  const csvs: Array<[string, Buffer]> = [];
  for (const nome of ["proposicoes.csv", "normas.csv"]) {
    const bytes = Buffer.from(await (await baixar(`/dados/${nome}`)).arrayBuffer());
    if (!bytes.subarray(0, 3).equals(BOM) || !bytes.subarray(3, 11).equals(Buffer.from("id;tipo;"))) {
      throw new EspelhoError(`/dados/${nome}: cabeçalho inesperado`);
    }
    csvs.push([nome, bytes]);
  }

  const fotos: Array<[string, Buffer]> = [];
  for (const v of vs.dados) {
    if (!v.foto) continue;
    const res = await baixar(v.foto);
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length > MAX_FOTO_BYTES || !imagemValida(bytes)) throw new EspelhoError(`${v.foto}: não é uma imagem válida`);
    fotos.push([path.basename(v.foto), bytes]);
  }

  const d: Dataset = {
    fonte: m.dados.fonte,
    escopo: m.dados.escopo,
    execucao: m.dados.execucao,
    vereadores: vs.dados,
    tipos: ts.dados,
    proposicoes: ps.dados,
    normas: ns.dados,
  };

  // Everything validated: write to a scratch area, then swap it in.
  const tmp = path.join(o.raiz, ".espelho-tmp");
  await rm(tmp, { recursive: true, force: true });
  const arquivos: Array<[string, string | Buffer]> = [
    ["data/generated/dataset.json", JSON.stringify(d)],
    ["public/dados/manifesto.json", m.bruto],
    ["public/dados/vereadores.json", vs.bruto],
    ["public/dados/tipos.json", ts.bruto],
    ["public/dados/proposicoes.json", ps.bruto],
    ["public/dados/normas.json", ns.bruto],
    ...csvs.map(([nome, bytes]): [string, Buffer] => [`public/dados/${nome}`, bytes]),
    ...fotos.map(([nome, bytes]): [string, Buffer] => [`public/fotos/${nome}`, bytes]),
  ];
  for (const dir of ["data/generated", "public/dados", "public/fotos"]) await mkdir(path.join(tmp, dir), { recursive: true });
  for (const [rel, conteudo] of arquivos) {
    const destino = path.join(tmp, rel);
    await mkdir(path.dirname(destino), { recursive: true });
    await writeFile(destino, conteudo);
  }
  for (const dir of ["data/generated", "public/dados", "public/fotos"]) {
    await rm(path.join(o.raiz, dir), { recursive: true, force: true });
    await mkdir(path.dirname(path.join(o.raiz, dir)), { recursive: true });
    await rename(path.join(tmp, dir), path.join(o.raiz, dir));
  }
  await rm(tmp, { recursive: true, force: true });

  log(
    `coleta de ${d.execucao.coletadoEm} (${d.execucao.modo}) espelhada de ${base.origin}: ` +
      `${d.proposicoes.length} proposições, ${d.normas.length} normas, ${d.vereadores.length} vereadores, ${fotos.length} fotos`,
  );
  return d;
}
