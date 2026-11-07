import Link from "next/link";
import { Avatar } from "./Rosto";
import { APELIDOS } from "@/lib/content/apelidos";
import { legivel, nomeItem } from "@/lib/content/tipos";
import { normalizar } from "@/lib/data/derive";
import { dataCurta } from "@/lib/format";
import type { Registro, Vereador } from "@/lib/data/types";

export function Item({ r, porSlug }: { r: Registro; porSlug: ReadonlyMap<string, Vereador> }) {
  const vereadores = r.autoresVereadores.map((s) => porSlug.get(s)).filter((v): v is Vereador => v !== undefined);
  // Names already shown as a linked councillor (including older parliamentary names) are not repeated.
  const conhecidos = new Set(vereadores.flatMap((v) => [v.nome, ...(APELIDOS[v.slug] ?? [])].map(normalizar)));
  const outros = r.autores.filter((a) => !conhecidos.has(normalizar(a)));
  return (
    <article className="item">
      <div className="item-topo">
        <a className="item-nome" href={r.link}>
          {nomeItem(r.tipo, r.numero, r.ano, r.titulo)}
        </a>
        <time className="item-data" dateTime={r.data.replace(" ", "T")}>
          {dataCurta(r.data)}
        </time>
      </div>
      <p className="item-ementa">{r.ementa ? legivel(r.ementa) : <span className="soft">Sem ementa publicada.</span>}</p>
      <div className="item-pe">
        {vereadores.length > 0 && (
          <span className="avatares">
            {vereadores.slice(0, 4).map((v) => (
              <Avatar key={v.slug} v={v} />
            ))}
          </span>
        )}
        <span>
          {vereadores.map((v, i) => (
            <span key={v.slug}>
              {i > 0 && (i === vereadores.length - 1 && outros.length === 0 ? " e " : ", ")}
              <Link href={`/vereadores/${v.slug}`}>{v.nome}</Link>
            </span>
          ))}
          {outros.length > 0 && (
            <span>
              {vereadores.length > 0 && (outros.length === 1 ? " e " : ", ")}
              {outros.join(", ")}
            </span>
          )}
        </span>
      </div>
    </article>
  );
}

export function Feed({ itens, vereadores }: { itens: readonly Registro[]; vereadores: readonly Vereador[] }) {
  const porSlug = new Map(vereadores.map((v) => [v.slug, v]));
  return (
    <ul className="feed">
      {itens.map((r) => (
        <li key={`${r.tipo}-${r.id}`}>
          <Item r={r} porSlug={porSlug} />
        </li>
      ))}
    </ul>
  );
}
