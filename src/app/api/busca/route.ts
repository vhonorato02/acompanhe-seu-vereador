import { buscar, interpretar, vereadoresQueCasam } from "@/lib/data/busca";
import { dataset } from "@/lib/data/load";

const CABECALHOS = { "Cache-Control": "private, no-store" } as const;

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.slice(0, 120).trim() ?? "";
  if (q.length < 2) {
    return Response.json({ q, total: 0, itens: [], vereadores: [], autores: [], normas: 0 }, { headers: CABECALHOS });
  }
  const d = dataset();
  const itens = buscar(d.proposicoes, q);
  const topo = itens.slice(0, 6);
  const slugs = new Set(topo.flatMap((r) => r.autoresVereadores));
  return Response.json(
    {
      q,
      consulta: interpretar(q),
      total: itens.length,
      itens: topo,
      vereadores: vereadoresQueCasam(q, d.vereadores).slice(0, 3),
      autores: d.vereadores.filter((v) => slugs.has(v.slug)),
      normas: buscar(d.normas, q).length,
    },
    { headers: CABECALHOS },
  );
}
