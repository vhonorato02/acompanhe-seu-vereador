import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ColetaError } from "@/lib/camara/client";
import { coletar, type ClienteApi } from "@/lib/coleta/coletar";
import type { Dataset } from "@/lib/data/types";

const OFICIAL = "https://www.pindamonhangaba.sp.leg.br";
const NOMES = ["Ana Paula Goffi", "Marco Mayor", "Renato Cebola", "Rogério Ramos", "Gilson Nagrin", "Norberto Moraes", "Gari Abençoado", "Professor Everton", "Felipinho César"];

function vereadores() {
  return NOMES.map((nome) => ({ nome, partido: "X", funcao: "Vereador", imagem: `${OFICIAL}/fotos/${nome.length}.jpg`, link: `${OFICIAL}/vereadores/${nome.length}` }));
}

interface Item { data: string; titulo: string; ementa: string; autoria: string; link: string }
const item = (id: number, data: string, autoria = "Ana Paula Goffi", ementa = "no bairro Araretama"): Item => ({
  data: `${data} 10:00:00`, titulo: `REQUERIMENTO N.º ${id}/${data.slice(0, 4)}`, ementa, autoria, link: `${OFICIAL}/proposicoes/0/0/0/0/${id}#pesquisa`,
});
const lei = (id: number, data: string): Item => ({ ...item(id, data), titulo: `LEI ORDINÁRIA N.º ${id}/${data.slice(0, 4)}`, autoria: "" });

/** Fake SoftCam API: pages of `porPagina`, newest first, like the real one. */
class ApiFalsa implements ClienteApi {
  requisicoes = 0;
  chamadas: string[] = [];
  falhar?: (call: string, params: Record<string, string | number>) => unknown;
  constructor(public props: Item[], public normas: Item[], public porPagina = 3) {}
  async get(call: string, params: Record<string, string | number> = {}): Promise<unknown> {
    this.requisicoes++;
    this.chamadas.push(`${call}:${params.tipo ?? ""}:${params.pagina ?? ""}`);
    const alterado = this.falhar?.(call, params);
    if (alterado !== undefined) {
      if (alterado instanceof Error) throw alterado;
      return alterado;
    }
    if (call === "vereadores") return vereadores();
    if (call === "proposicoes_tipos") return [{ contract: "Requerimentos", titulo: "Requerimentos", link: `${OFICIAL}/proposicoes/Requerimentos` }];
    if (call === "legislacoes_tipos") return [{ contract: "Leis-Ordinarias", titulo: "Leis Ordinárias", link: `${OFICIAL}/legislacao/Leis-Ordinarias` }];
    const fonte = call === "proposicoes" ? this.props : this.normas;
    const ordenados = [...fonte].sort((a, b) => b.data.localeCompare(a.data));
    const pagina = Number(params.pagina);
    return ordenados.slice((pagina - 1) * this.porPagina, pagina * this.porPagina);
  }
}

let raiz: string;
const DIA = (iso: string) => () => new Date(`${iso}T12:00:00Z`);
const base = (api: ClienteApi, extra: Partial<Parameters<typeof coletar>[0]> = {}) => ({
  raiz, cliente: api, producao: true, log: () => undefined, pausa: async () => undefined, agora: DIA("2026-11-05"), ...extra,
});
const ler = async (rel: string) => JSON.parse(await readFile(path.join(raiz, rel), "utf8")) as unknown;
const semExecucao = (d: Dataset) => ({ ...d, execucao: undefined });

function propsIniciais(): Item[] {
  return [
    item(10, "2026-10-01"), item(11, "2026-09-01", "Marco Mayor; Ana Paula Goffi"), item(12, "2026-06-01", "Renato Cebola"),
    item(13, "2026-02-01", "Rogério Ramos"), item(14, "2025-08-01", "Gilson Nagrin"), item(15, "2025-02-01", "Norberto Moraes"),
    item(16, "2024-11-01", "Gari Abençoado"), // out of scope: before 2025 and numbered 2024
  ];
}

beforeEach(async () => {
  raiz = await mkdtemp(path.join(tmpdir(), "coleta-"));
});
afterEach(async () => {
  await rm(raiz, { recursive: true, force: true });
});

describe("coleta completa", () => {
  it("guarda só o escopo, gera dataset, dados abertos e manifesto com os mesmos totais", async () => {
    const api = new ApiFalsa(propsIniciais(), [lei(7000, "2026-05-01")]);
    const d = await coletar(base(api));
    expect(d.execucao.modo).toBe("completo");
    expect(d.proposicoes.map((r) => r.id).sort()).toEqual(["10", "11", "12", "13", "14", "15"]);
    const manifesto = (await ler("public/dados/manifesto.json")) as { totais: { proposicoes: number; normas: number } };
    expect(manifesto.totais).toMatchObject({ proposicoes: 6, normas: 1 });
    expect(((await ler("public/dados/proposicoes.json")) as unknown[]).length).toBe(6);
    const csv = await readFile(path.join(raiz, "public/dados/proposicoes.csv"), "utf8");
    expect(csv.trim().split("\r\n")).toHaveLength(7); // header + 6
    expect(d.proposicoes.find((r) => r.id === "11")?.autoresVereadores.sort()).toEqual(["ana-paula-goffi", "marco-mayor"]);
  });

  it("é determinística: coletar o mesmo snapshot duas vezes dá o mesmo resultado, sem duplicar", async () => {
    const api = new ApiFalsa(propsIniciais(), [lei(7000, "2026-05-01")]);
    const a = await coletar(base(api, { completa: true }));
    const b = await coletar(base(new ApiFalsa(propsIniciais(), [lei(7000, "2026-05-01")]), { completa: true }));
    expect(semExecucao(b)).toEqual(semExecucao(a));
    expect(new Set(b.proposicoes.map((r) => `${r.tipo}:${r.id}`)).size).toBe(b.proposicoes.length);
  });

  it("mesmo id repetido na API vira um registro só (vale a última versão)", async () => {
    const props = [item(10, "2026-10-01"), { ...item(10, "2026-10-01"), ementa: "versão corrigida" }, item(12, "2026-06-01")];
    const d = await coletar(base(new ApiFalsa(props, [lei(7000, "2026-05-01")], 10)));
    expect(d.proposicoes.filter((r) => r.id === "10")).toHaveLength(1);
    expect(d.proposicoes.find((r) => r.id === "10")?.ementa).toBe("versão corrigida");
  });
});

describe("coleta incremental", () => {
  it("usa o cache, busca só as páginas recentes e soma registros novos", async () => {
    await coletar(base(new ApiFalsa(propsIniciais(), [lei(7000, "2026-05-01")])));
    const api = new ApiFalsa([item(20, "2026-11-04"), ...propsIniciais()], [lei(7000, "2026-05-01")]);
    const d = await coletar(base(api, { agora: DIA("2026-11-10") }));
    expect(d.execucao.modo).toBe("incremental");
    expect(d.proposicoes.map((r) => r.id)).toContain("20");
    expect(d.proposicoes).toHaveLength(7);
    // Pages older than the 45-day overlap are not requested again.
    expect(api.chamadas.filter((c) => c.startsWith("proposicoes:")).length).toBeLessThan(3);
  });

  it("dentro da margem de 45 dias, uma correção na fonte substitui a versão do cache", async () => {
    await coletar(base(new ApiFalsa(propsIniciais(), [lei(7000, "2026-05-01")])));
    const corrigidas = propsIniciais().map((p) => (p.link.endsWith("/10#pesquisa") ? { ...p, ementa: "ementa corrigida" } : p));
    const d = await coletar(base(new ApiFalsa(corrigidas, [lei(7000, "2026-05-01")]), { agora: DIA("2026-11-10") }));
    expect(d.proposicoes.find((r) => r.id === "10")?.ementa).toBe("ementa corrigida");
  });

  it("depois de 30 dias faz coleta completa e percebe registros retirados pela Câmara", async () => {
    await coletar(base(new ApiFalsa(propsIniciais(), [lei(7000, "2026-05-01")])));
    const semUm = propsIniciais().filter((p) => !p.link.endsWith("/14#pesquisa"));
    const d = await coletar(base(new ApiFalsa(semUm, [lei(7000, "2026-05-01")]), { agora: DIA("2026-12-10") }));
    expect(d.execucao.modo).toBe("completo");
    expect(d.proposicoes.map((r) => r.id)).not.toContain("14");
  });

  it("cache corrompido não quebra: vira coleta completa com aviso", async () => {
    await mkdir(path.join(raiz, ".next/cache/acompanhe"), { recursive: true });
    await writeFile(path.join(raiz, ".next/cache/acompanhe/coleta.json"), '{"versao":1,"completoEm":"2026-11-01","proposicoes":{"x":{"itens":{"1":{"data":"lixo"}}}}}');
    const d = await coletar(base(new ApiFalsa(propsIniciais(), [lei(7000, "2026-05-01")])));
    expect(d.execucao.modo).toBe("completo");
    expect(d.execucao.avisos.join(" ")).toMatch(/Cache de coleta ilegível/);
  });
});

describe("falhas nunca viram snapshot novo", () => {
  async function publicarPrimeiro() {
    await coletar(base(new ApiFalsa(propsIniciais(), [lei(7000, "2026-05-01")])));
    return {
      dataset: await readFile(path.join(raiz, "data/generated/dataset.json"), "utf8"),
      manifesto: await readFile(path.join(raiz, "public/dados/manifesto.json"), "utf8"),
    };
  }
  async function esperaFalhaPreservando(api: ApiFalsa, kind: ColetaError["kind"], extra: Partial<Parameters<typeof coletar>[0]> = {}) {
    const antes = await publicarPrimeiro();
    await expect(coletar(base(api, { agora: DIA("2026-11-10"), ...extra }))).rejects.toMatchObject({ kind });
    expect(await readFile(path.join(raiz, "data/generated/dataset.json"), "utf8")).toBe(antes.dataset);
    expect(await readFile(path.join(raiz, "public/dados/manifesto.json"), "utf8")).toBe(antes.manifesto);
    expect((await readdir(raiz)).filter((f) => f.startsWith(".coleta-tmp"))).toEqual([]);
  }

  it("token ausente em produção", async () => {
    await expect(coletar({ raiz, producao: true, log: () => undefined })).rejects.toMatchObject({ kind: "vazio" });
  });

  it("primeira página vazia quando havia registros", async () => {
    const api = new ApiFalsa(propsIniciais(), [lei(7000, "2026-05-01")]);
    api.falhar = (call, p) => (call === "proposicoes" && p.pagina === 1 ? [] : undefined);
    await esperaFalhaPreservando(api, "plausibilidade");
  });

  it("mudança de formato no meio da paginação", async () => {
    const api = new ApiFalsa(propsIniciais(), [lei(7000, "2026-05-01")]);
    api.falhar = (call, p) => (call === "proposicoes" && p.pagina === 2 ? [{ data: "05/11/2026", titulo: "x" }] : undefined);
    await esperaFalhaPreservando(api, "formato", { completa: true });
  });

  it("desafio anti-robô ou erro HTTP vindo do cliente", async () => {
    const api = new ApiFalsa(propsIniciais(), [lei(7000, "2026-05-01")]);
    api.falhar = (call) => (call === "legislacoes" ? new ColetaError("Desafio anti-robô", "bloqueio") : undefined);
    await esperaFalhaPreservando(api, "bloqueio");
  });

  it("link fora do domínio oficial", async () => {
    const api = new ApiFalsa(propsIniciais(), [lei(7000, "2026-05-01")]);
    api.falhar = (call, p) => (call === "proposicoes" && p.pagina === 1 ? [{ ...item(30, "2026-11-01"), link: "https://evil.example/1" }] : undefined);
    await esperaFalhaPreservando(api, "formato");
  });

  it("queda brusca de volume na coleta completa", async () => {
    const api = new ApiFalsa(propsIniciais().slice(0, 1), [lei(7000, "2026-05-01")]);
    const antes = await publicarPrimeiro();
    // Six records before, one now: below the 90% floor only matters above 20 records, so use the published baseline.
    await expect(
      coletar(base(api, { completa: true, ultimoPublicado: async () => ({ proposicoes: 600, normas: 1 }) })),
    ).rejects.toMatchObject({ kind: "plausibilidade" });
    expect(await readFile(path.join(raiz, "data/generated/dataset.json"), "utf8")).toBe(antes.dataset);
  });

  it("paginação em loop (a API devolve sempre a mesma página)", async () => {
    const muitos = Array.from({ length: 12 }, (_, i) => item(100 + i, `2026-0${1 + (i % 9)}-15`));
    const api = new ApiFalsa(muitos, [lei(7000, "2026-05-01")], 5);
    const primeira = [...muitos].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 5);
    api.falhar = (call, p) => (call === "proposicoes" && Number(p.pagina) > 1 ? primeira : undefined);
    await expect(coletar(base(api))).rejects.toThrow(/paginação em loop/);
    // Stops on the first repeated page instead of hammering the API up to the page limit.
    expect(api.chamadas.filter((c) => c.startsWith("proposicoes:")).length).toBe(2);
  });

  it("sem manifesto publicado para comparar, segue com aviso", async () => {
    const d = await coletar(base(new ApiFalsa(propsIniciais(), [lei(7000, "2026-05-01")]), { ultimoPublicado: async () => null }));
    expect(d.execucao.avisos.join(" ")).toMatch(/manifesto publicado/);
  });
});

describe("fotos", () => {
  it("foto inválida vira aviso e a página mostra só o nome", async () => {
    const d = await coletar(base(new ApiFalsa(propsIniciais(), [lei(7000, "2026-05-01")]), {
      baixarFoto: async () => {
        throw new Error("Assinatura de imagem incompatível");
      },
    }));
    expect(d.vereadores.every((v) => v.foto === null)).toBe(true);
    expect(d.execucao.avisos.some((a) => a.includes("Foto de"))).toBe(true);
  });

  it("foto válida é publicada em /fotos e reaproveitada do cache na coleta seguinte", async () => {
    let downloads = 0;
    const jpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);
    const baixarFoto = async () => {
      downloads++;
      return jpg;
    };
    await coletar(base(new ApiFalsa(propsIniciais(), [lei(7000, "2026-05-01")]), { baixarFoto }));
    const d = await coletar(base(new ApiFalsa(propsIniciais(), [lei(7000, "2026-05-01")]), { baixarFoto, agora: DIA("2026-11-10") }));
    expect(downloads).toBe(NOMES.length);
    expect(d.vereadores[0]?.foto).toMatch(/^\/fotos\/.+\.jpg$/);
  });
});

describe("amostra de desenvolvimento", () => {
  it("sem token fora de produção usa a amostra e marca o modo", async () => {
    await mkdir(path.join(raiz, "fixtures"), { recursive: true });
    const fx = await readFile(path.resolve(__dirname, "../fixtures/camara-amostra.json"), "utf8");
    await writeFile(path.join(raiz, "fixtures/camara-amostra.json"), fx);
    const d = await coletar({ raiz, producao: false, log: () => undefined });
    expect(d.execucao.modo).toBe("amostra");
    expect(d.execucao.avisos[0]).toMatch(/amostra/);
  });
});
