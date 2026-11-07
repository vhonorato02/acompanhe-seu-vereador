import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { espelhar, EspelhoError } from "@/lib/espelho/espelhar";

const OFICIAL = "https://www.pindamonhangaba.sp.leg.br";
const BASE = "https://acompanhe-seu-vereador.vercel.app";
const JPG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);

const reg = (id: string) => ({
  id,
  tipo: "Requerimentos",
  titulo: `Requerimento ${id}/2026`,
  numero: Number(id),
  ano: 2026,
  ementa: "no bairro Araretama",
  autoria: "Ana Paula Goffi",
  autores: ["Ana Paula Goffi"],
  autoresVereadores: ["ana-paula-goffi"],
  data: "2026-11-06 10:00:00",
  link: `${OFICIAL}/proposicoes/0/0/0/0/${id}`,
});

function siteFalso(muda: (arquivos: Record<string, string | Buffer>) => void = () => {}) {
  const proposicoes = [reg("1"), reg("2")];
  const normas = [{ ...reg("9"), tipo: "Leis-Ordinarias", autoriaCitadaNaEmenta: [] }];
  const vereadores = [
    { slug: "ana-paula-goffi", nome: "Ana Paula Goffi", partido: "União", funcao: "Vereador", foto: "/fotos/ana-paula-goffi.jpg", fotoOrigem: `${OFICIAL}/f.jpg`, link: `${OFICIAL}/vereadores/1` },
  ];
  const arquivos: Record<string, string | Buffer> = {
    "/dados/manifesto.json": JSON.stringify({
      fonte: { nome: "API", url: `${OFICIAL}/dadosabertos`, termos: "livre" },
      escopo: { inicio: "2025-01-01", descricao: "Legislatura 2025–2028" },
      execucao: { coletadoEm: "2026-11-07T16:49:23.219Z", modo: "incremental", requisicoes: 62, duracaoMs: 1000, avisos: [] },
      totais: { proposicoes: 2, normas: 1, vereadores: 1 },
    }),
    "/dados/vereadores.json": JSON.stringify(vereadores),
    "/dados/tipos.json": JSON.stringify([{ contract: "Requerimentos", titulo: "Requerimentos", grupo: "proposicao" }]),
    "/dados/proposicoes.json": JSON.stringify(proposicoes),
    "/dados/normas.json": JSON.stringify(normas),
    "/dados/proposicoes.csv": "﻿id,tipo\n1,Requerimentos\n",
    "/dados/normas.csv": "﻿id,tipo\n9,Leis\n",
    "/fotos/ana-paula-goffi.jpg": JPG,
  };
  muda(arquivos);
  const pedidos: string[] = [];
  const fetchImpl = (async (input: URL | RequestInfo) => {
    const url = new URL(String(input));
    pedidos.push(url.pathname);
    const corpo = url.origin === BASE ? arquivos[url.pathname] : undefined;
    return corpo === undefined ? new Response("não encontrado", { status: 404 }) : new Response(typeof corpo === "string" ? corpo : new Uint8Array(corpo), { status: 200 });
  }) as typeof fetch;
  return { fetchImpl, pedidos };
}

describe("espelho dos dados abertos (cópia da VPS)", () => {
  let raiz: string;
  beforeEach(async () => {
    raiz = await mkdtemp(path.join(tmpdir(), "espelho-"));
  });
  afterEach(async () => {
    await rm(raiz, { recursive: true, force: true });
  });

  const rodar = (s: ReturnType<typeof siteFalso>) =>
    espelhar({ base: BASE, raiz, fetchImpl: s.fetchImpl, pausa: async () => {}, log: () => {} });

  it("reconstrói o dataset igual ao publicado, com dados abertos e fotos", async () => {
    const s = siteFalso();
    const d = await rodar(s);
    expect(d.proposicoes).toHaveLength(2);
    const gravado = JSON.parse(await readFile(path.join(raiz, "data/generated/dataset.json"), "utf8"));
    expect(gravado.tipos[0].contract).toBe("Requerimentos");
    expect(gravado.execucao.coletadoEm).toBe("2026-11-07T16:49:23.219Z");
    expect((await readdir(path.join(raiz, "public/dados"))).sort()).toEqual(
      ["manifesto.json", "normas.csv", "normas.json", "proposicoes.csv", "proposicoes.json", "tipos.json", "vereadores.json"],
    );
    expect(await readFile(path.join(raiz, "public/fotos/ana-paula-goffi.jpg"))).toEqual(JPG);
    expect(s.pedidos.every((p) => p.startsWith("/dados/") || p.startsWith("/fotos/"))).toBe(true);
  });

  it("recusa quando o total do manifesto não bate com o arquivo, sem gravar nada", async () => {
    const s = siteFalso((a) => {
      a["/dados/proposicoes.json"] = JSON.stringify([reg("1")]);
    });
    await expect(rodar(s)).rejects.toThrow(/manifesto diz 2, o arquivo tem 1/);
    await expect(readdir(path.join(raiz, "data"))).rejects.toThrow();
  });

  it("recusa uma origem que publica a amostra de desenvolvimento", async () => {
    const s = siteFalso((a) => {
      a["/dados/manifesto.json"] = String(a["/dados/manifesto.json"]).replace('"incremental"', '"amostra"');
    });
    await expect(rodar(s)).rejects.toThrow(EspelhoError);
  });

  it("trata HTML (desafio anti-robô) no lugar de JSON como erro", async () => {
    const s = siteFalso((a) => {
      a["/dados/normas.json"] = "<html>Bot Verification</html>";
    });
    await expect(rodar(s)).rejects.toThrow(/não é JSON/);
  });

  it("recusa link de documento fora da origem oficial da Câmara", async () => {
    const s = siteFalso((a) => {
      a["/dados/proposicoes.json"] = JSON.stringify([reg("1"), { ...reg("2"), link: "https://exemplo.com/x" }]);
    });
    await expect(rodar(s)).rejects.toThrow(/formato inesperado/);
  });

  it("recusa foto que não é imagem", async () => {
    const s = siteFalso((a) => {
      a["/fotos/ana-paula-goffi.jpg"] = "<html></html>";
    });
    await expect(rodar(s)).rejects.toThrow(/não é uma imagem válida/);
  });
});
