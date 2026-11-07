/**
 * Runs before `next build`. If anything looks wrong the build fails, so Vercel keeps
 * serving the previous deployment instead of publishing broken data.
 */
import path from "node:path";
import { CamaraClient } from "../src/lib/camara/client";
import { obterFotoSegura } from "../src/lib/camara/foto";
import { coletar } from "../src/lib/coleta/coletar";
import { SITE } from "../src/lib/site";

async function ultimoPublicado(): Promise<{ proposicoes: number; normas: number } | null> {
  const res = await fetch(`${SITE.url}/dados/manifesto.json`, { signal: AbortSignal.timeout(10_000), redirect: "follow" });
  if (!res.ok) return null;
  const m = (await res.json()) as { totais?: { proposicoes?: unknown; normas?: unknown }; execucao?: { modo?: unknown } };
  // A development sample is never a baseline.
  if (m.execucao?.modo === "amostra") return null;
  const { proposicoes, normas } = m.totais ?? {};
  return typeof proposicoes === "number" && typeof normas === "number" ? { proposicoes, normas } : null;
}

const token = process.env.CAMARA_API_TOKEN?.trim();
const producao = process.env.VERCEL_ENV === "production";

coletar({
  raiz: path.resolve(__dirname, ".."),
  cliente: token ? new CamaraClient({ token }) : undefined,
  producao,
  completa: process.env.COLETA_COMPLETA === "1",
  baixarFoto: (url) => obterFotoSegura(url),
  ultimoPublicado: producao ? ultimoPublicado : undefined,
}).catch((e: unknown) => {
  console.error(`[coleta] FALHOU: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
