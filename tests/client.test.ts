import { describe, expect, it } from "vitest";
import { CamaraClient, ColetaError } from "@/lib/camara/client";

function cliente(respostas: Array<{ status: number; body: string } | Error>) {
  const urls: string[] = [];
  const pausas: number[] = [];
  const c = new CamaraClient({
    token: "SEGREDO",
    sleep: async (ms) => {
      pausas.push(ms);
    },
    fetchImpl: async (url) => {
      urls.push(url);
      const r = respostas.shift();
      if (!r) throw new Error("sem resposta");
      if (r instanceof Error) throw r;
      return { status: r.status, text: async () => r.body };
    },
  });
  return { c, urls, pausas };
}

describe("CamaraClient", () => {
  it("devolve o JSON e envia o token na query", async () => {
    const { c, urls } = cliente([{ status: 200, body: "[]" }]);
    await expect(c.get("vereadores")).resolves.toEqual([]);
    expect(urls[0]).toContain("call=vereadores");
    expect(urls[0]).toContain("keysoft=SEGREDO");
  });

  it("trata 200 com corpo vazio como erro (é assim que a API responde sem token)", async () => {
    const { c } = cliente([{ status: 200, body: "" }]);
    await expect(c.get("vereadores")).rejects.toMatchObject({ kind: "vazio" });
  });

  it("para no desafio anti-robô sem tentar de novo", async () => {
    const { c, urls } = cliente([{ status: 200, body: "<title>Bot Verification</title>" }]);
    await expect(c.get("vereadores")).rejects.toMatchObject({ kind: "bloqueio" });
    expect(urls).toHaveLength(1);
  });

  it("repete só falha de rede e 5xx, com espera crescente", async () => {
    const { c, urls } = cliente([new Error("ECONNRESET"), { status: 503, body: "x" }, { status: 200, body: "[1]" }]);
    await expect(c.get("pautas", { pagina: 1 })).resolves.toEqual([1]);
    expect(urls).toHaveLength(3);
  });

  it("não repete 4xx", async () => {
    const { c, urls } = cliente([{ status: 403, body: "no" }]);
    await expect(c.get("vereadores")).rejects.toBeInstanceOf(ColetaError);
    expect(urls).toHaveLength(1);
  });

  it("a mensagem de erro não contém o token", async () => {
    const { c } = cliente([{ status: 200, body: "" }]);
    await expect(c.get("vereadores")).rejects.toSatisfy((e: unknown) => !String((e as Error).message).includes("SEGREDO"));
  });
  it("não revela token quando a falha de rede inclui a URL no erro", async () => {
    const { c } = cliente([
      new Error("fetch https://host/?keysoft=SEGREDO failed"),
      new Error("fetch https://host/?keysoft=SEGREDO failed"),
      new Error("fetch https://host/?keysoft=SEGREDO failed"),
    ]);
    await expect(c.get("vereadores")).rejects.toSatisfy(
      (e: unknown) => e instanceof Error && !e.message.includes("SEGREDO"),
    );
  });

});
