import { USER_AGENT } from "./client";
import { origemDaCamara } from "./origem";

export const MAX_FOTO_BYTES = 5 * 1024 * 1024;
export function validarUrlFoto(url: string): URL {
  const origem = origemDaCamara(url);
  if (!origem || !/\\.(?:jpe?g|png|webp)$/i.test(origem.pathname)) {
    throw new Error("Foto fora da origem oficial permitida");
  }
  return origem;
}

function imagemValida(tipo: string, bytes: Buffer): boolean {
  if (tipo === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (tipo === "image/png") return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (tipo === "image/webp") return bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  return false;
}

/** Downloads only bounded images from the official host, without redirects or private-network requests. */
export async function obterFotoSegura(url: string, fetchImpl: typeof fetch = fetch): Promise<Buffer> {
  const origem = validarUrlFoto(url);
  const response = await fetchImpl(origem, {
    headers: { "User-Agent": USER_AGENT, Accept: "image/jpeg,image/png,image/webp" },
    redirect: "error",
    signal: AbortSignal.timeout(15_000),
  });
  if (response.status !== 200) throw new Error(`Foto HTTP ${response.status}`);
  const tipo = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ?? "";
  if (!["image/jpeg", "image/png", "image/webp"].includes(tipo)) {
    throw new Error("Tipo de imagem inesperado");
  }
  const length = Number(response.headers.get("content-length"));
  if (Number.isFinite(length) && length > MAX_FOTO_BYTES) throw new Error("Foto excede 5 MiB");
  if (!response.body) throw new Error("Foto sem corpo");
  const reader = response.body.getReader();
  const partes: Buffer[] = [];
  let tamanho = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      tamanho += value.byteLength;
      if (tamanho > MAX_FOTO_BYTES) throw new Error("Foto excede 5 MiB");
      partes.push(Buffer.from(value));
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  if (tamanho === 0) throw new Error("Foto vazia");
  const bytes = Buffer.concat(partes, tamanho);
  if (!imagemValida(tipo, bytes)) throw new Error("Assinatura de imagem incompatível");
  return bytes;
}
