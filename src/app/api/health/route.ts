import { dataset } from "@/lib/data/load";

/** Liveness for the VPS platform: answers fast and says which collection is being served. */
export function GET() {
  const d = dataset();
  return Response.json(
    { ok: true, coletadoEm: d.execucao.coletadoEm, proposicoes: d.proposicoes.length },
    { headers: { "Cache-Control": "no-store" } },
  );
}
