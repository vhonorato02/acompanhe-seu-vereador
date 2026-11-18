import { dataset } from "@/lib/data/load";
import { SITE, shaPublicado } from "@/lib/site";

/** Liveness and deployment check: answers fast and says which version, SHA and collection are being served. */
export function GET() {
  const d = dataset();
  return Response.json(
    {
      ok: true,
      versao: SITE.versao,
      sha: shaPublicado(),
      coletadoEm: d.execucao.coletadoEm,
      proposicoes: d.proposicoes.length,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
