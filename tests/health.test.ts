import { afterEach, describe, expect, it, vi } from "vitest";
import { SITE, shaPublicado } from "@/lib/site";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/data/load", () => ({
  dataset: () => ({
    execucao: { coletadoEm: "2026-11-18T04:17:33.473Z", modo: "incremental", requisicoes: 62, duracaoMs: 1000, avisos: [] },
    proposicoes: [{ id: "1" }, { id: "2" }],
  }),
}));

describe("saúde da aplicação (/api/health)", () => {
  const originalVercelSha = process.env.VERCEL_GIT_COMMIT_SHA;
  const originalGitSha = process.env.GIT_COMMIT_SHA;

  afterEach(() => {
    if (originalVercelSha === undefined) delete process.env.VERCEL_GIT_COMMIT_SHA;
    else process.env.VERCEL_GIT_COMMIT_SHA = originalVercelSha;
    if (originalGitSha === undefined) delete process.env.GIT_COMMIT_SHA;
    else process.env.GIT_COMMIT_SHA = originalGitSha;
  });

  it("extrai SHA curto da Vercel, do container ou fallback local", () => {
    expect(shaPublicado({ VERCEL_GIT_COMMIT_SHA: "abcdef1234567890" })).toBe("abcdef123456");
    expect(shaPublicado({ GIT_COMMIT_SHA: "9876543210abcdef" })).toBe("9876543210ab");
    expect(shaPublicado({})).toBe("local");
    expect(shaPublicado({ VERCEL_GIT_COMMIT_SHA: "   " })).toBe("local");
  });

  it("devolve ok, versao, sha, coletadoEm e total de proposições com no-store", async () => {
    process.env.VERCEL_GIT_COMMIT_SHA = "1234567890abcdef";
    const { GET } = await import("@/app/api/health/route");
    const res = GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    await expect(res.json()).resolves.toEqual({
      ok: true,
      versao: SITE.versao,
      sha: "1234567890ab",
      coletadoEm: "2026-11-18T04:17:33.473Z",
      proposicoes: 2,
    });
  });
});
