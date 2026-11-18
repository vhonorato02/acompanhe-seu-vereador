"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "./Icon";
import { n } from "@/lib/format";

function norm(s: string) {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

/** Instant filter over the neighbourhood list (all data already on the page). */
export function ListaBairros({ bairros }: { bairros: Array<{ slug: string; nome: string; n: number }> }) {
  const [q, setQ] = useState("");
  const [ordem, setOrdem] = useState<"citacoes" | "az">("citacoes");
  const max = Math.max(1, ...bairros.map((b) => b.n));
  const lista = useMemo(() => {
    const t = norm(q.trim());
    const f = t ? bairros.filter((b) => norm(b.nome).includes(t)) : bairros;
    return ordem === "az" ? [...f].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")) : f;
  }, [q, ordem, bairros]);

  return (
    <>
      <div className="busca">
        <label htmlFor="filtro-bairro" className="sr-only">
          Procurar bairro
        </label>
        <div className="busca-campo">
          <Icon nome="buscar" />
          <input id="filtro-bairro" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Digite o nome do seu bairro" autoComplete="off" maxLength={120} />
        </div>
      </div>
      <div className="etiquetas" role="group" aria-label="Ordenar">
        <button type="button" className="chip" aria-pressed={ordem === "citacoes"} onClick={() => setOrdem("citacoes")}>
          Mais citados
        </button>
        <button type="button" className="chip" aria-pressed={ordem === "az"} onClick={() => setOrdem("az")}>
          A a Z
        </button>
      </div>
      <p className="soft small" aria-live="polite" style={{ margin: "1rem 0 0.75rem" }}>
        {n(lista.length)} {lista.length === 1 ? "bairro" : "bairros"}
      </p>
      <ul className="barras">
        {lista.map((b) => (
          <li key={b.slug}>
            <Link href={`/bairros/${b.slug}`}>
              <span className="b-nome">{b.nome}</span>
              <span className="b-num">{n(b.n)}</span>
              <span className="b-trilha" aria-hidden="true">
                <span className="b-valor" style={{ width: `${Math.max(1, (b.n / max) * 100)}%` }} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {lista.length === 0 && (
        <p className="nota" style={{ marginTop: "1rem" }}>
          Nenhum bairro com esse nome aparece pelo menos três vezes. Tente a <Link href={`/proposicoes?q=${encodeURIComponent(q.trim())}`}>busca no texto</Link>.
        </p>
      )}
    </>
  );
}
