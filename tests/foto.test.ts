import { describe, expect, it, vi } from "vitest";
import { MAX_FOTO_BYTES, obterFotoSegura, validarUrlFoto } from "@/lib/camara/foto";

const URL_OFICIAL = "https://www.pindamonhangaba.sp.leg.br/news/2026/11/retrato.jpeg";

describe("fotos de vereadores", () => {
  it("aceita imagens da Câmara", () => {
    expect(validarUrlFoto(URL_OFICIAL).hostname).toBe("www.pindamonhangaba.sp.leg.br");
  });

  it.each([
    "http://www.pindamonhangaba.sp.leg.br/news/x.jpg",
    "https://www.pindamonhangaba.sp.leg.br.evil.example/x.jpg",
    "https://127.0.0.1/x.jpg",
    "https://www.pindamonhangaba.sp.leg.br:8443/x.jpg",
    "https://user@www.pindamonhangaba.sp.leg.br/x.jpg",
    "file:///etc/passwd",
    "https://www.pindamonhangaba.sp.leg.br/x.svg",
  ])("bloqueia origem suspeita: %s", (url) => {
    expect(() => validarUrlFoto(url)).toThrow();
  });

  it("não consulta a rede quando a origem é inválida", async () => {
    const fetchImpl = vi.fn() as unknown as typeof fetch;
    await expect(obterFotoSegura("https://localhost/foto.jpg", fetchImpl)).rejects.toThrow();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("desabilita redirecionamentos e valida imagem JPEG recebida", async () => {
    const fetchImpl: typeof fetch = async (_url, options) => {
      expect(options?.redirect).toBe("error");
      return new Response(new Uint8Array([255, 216, 255, 0, 1]), { headers: { "content-type": "image/jpeg" } });
    };
    await expect(obterFotoSegura(URL_OFICIAL, fetchImpl)).resolves.toEqual(Buffer.from([255, 216, 255, 0, 1]));
  });

  it("rejeita tamanho declarado excessivo e conteúdo mascarado como foto", async () => {
    const grande: typeof fetch = async () => new Response("x", {
      headers: { "content-type": "image/jpeg", "content-length": String(MAX_FOTO_BYTES + 1) },
    });
    const falsa: typeof fetch = async () => new Response("<html>captcha</html>", {
      headers: { "content-type": "image/jpeg" },
    });
    await expect(obterFotoSegura(URL_OFICIAL, grande)).rejects.toThrow("5 MiB");
    await expect(obterFotoSegura(URL_OFICIAL, falsa)).rejects.toThrow("Assinatura");
  });
});
