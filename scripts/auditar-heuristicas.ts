/**
 * Reviews the derived classifications (neighbourhoods, themes, addressees) against a
 * published snapshot. Reads the portal's own open data, never the Câmara API.
 *
 *   npm run auditar:heuristicas                 # uses the live portal
 *   npm run auditar:heuristicas -- public/dados  # uses a local folder
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { decodificarEntidades } from "../src/lib/data/derive";
import { porBairro } from "../src/lib/data/analise";
import { derivados } from "../src/lib/data/enriquecer";
import { TEMAS } from "../src/lib/data/temas";
import type { Registro } from "../src/lib/data/types";
import { SITE } from "../src/lib/site";

async function carregar(origem: string): Promise<Registro[]> {
  const bruto = origem.startsWith("http")
    ? await (await fetch(`${origem}/proposicoes.json`, { signal: AbortSignal.timeout(60_000) })).text()
    : await readFile(path.join(origem, "proposicoes.json"), "utf8");
  // Snapshots published before the entity fix still carry "&quot;".
  return (JSON.parse(bruto) as Registro[]).map((r) => ({ ...r, ementa: decodificarEntidades(r.ementa) }));
}

async function main() {
  const origem = process.argv[2] ?? `${SITE.url}/dados`;
  const props = await carregar(origem);
  const pedidos = props.filter((r) => derivados(r).grupo === "pedidos");
  const semTema = pedidos.filter((r) => derivados(r).temas.length === 0);
  const linhas: string[] = [`# Revisão das classificações automáticas`, ``, `Fonte: ${origem} (${props.length} proposições).`, ``];

  linhas.push(`## Assuntos`, ``, `${pedidos.length} pedidos, ${semTema.length} sem assunto.`, ``);
  for (const t of TEMAS) linhas.push(`- ${t.nome}: ${pedidos.filter((r) => derivados(r).temas.includes(t.slug)).length}`);
  linhas.push(``, `Amostra sem assunto (revise se falta uma palavra na regra):`, ``);
  for (const r of semTema.slice(0, 15)) linhas.push(`- ${r.titulo}: ${r.ementa.slice(0, 160).replace(/\s+/g, " ")}`);

  const bairros = porBairro(props, {}, 1);
  linhas.push(``, `## Bairros`, ``, `${props.filter((r) => derivados(r).bairros.length > 0).length} proposições citam bairro; ${bairros.filter((b) => b.n >= 3).length} bairros com 3 ou mais citações.`, ``);
  linhas.push(`Nomes com 1 ou 2 citações (possíveis grafias novas para \`src/lib/content/bairros.ts\`):`, ``);
  linhas.push(bairros.filter((b) => b.n < 3).map((b) => `${b.nome} (${b.n})`).join(", "));
  linhas.push(``, `Todos com 3 ou mais:`, ``, bairros.filter((b) => b.n >= 3).map((b) => `${b.nome} (${b.n})`).join(", "));

  const destinos = new Map<string, number>();
  for (const r of pedidos) {
    const d = derivados(r).destino ?? "nenhum";
    destinos.set(d, (destinos.get(d) ?? 0) + 1);
  }
  linhas.push(``, `## Destinatários`, ``, ...[...destinos].map(([d, n]) => `- ${d}: ${n}`));
  console.log(linhas.join("\n"));
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
