import { redirect } from "next/navigation";

/** The Buscar tab is the proposition list with the search field on top. */
export default async function Buscar({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (typeof v === "string") p.set(k, k === "q" ? v.slice(0, 120) : v);
  const s = p.toString();
  redirect(s ? `/proposicoes?${s}` : "/proposicoes");
}
