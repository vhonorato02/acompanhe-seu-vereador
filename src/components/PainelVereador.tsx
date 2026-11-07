"use client";

import Link from "next/link";
import { useState } from "react";
import { hrefLista } from "@/lib/data/query";
import type { RecorteAno } from "@/lib/data/perfil";
import { n, nomeMes } from "@/lib/format";

export function PainelVereador({
  slug,
  nome,
  recortes,
  rotulos,
  explicacoes,
}: {
  slug: string;
  nome: string;
  recortes: RecorteAno[];
  rotulos: Record<string, string>;
  explicacoes: Record<string, string>;
}) {
  const anos = recortes.filter((r) => r.ano !== null);
  const [sel, setSel] = useState<number | null>(anos.at(-1)?.ano ?? null);
  const atual = recortes.find((r) => r.ano === sel) ?? recortes[recortes.length - 1];
  if (!atual) return null;
  const f = sel === null ? { autor: slug } : { autor: slug, ano: sel };
  const maxTipo = Math.max(1, ...atual.porTipo.map((t) => t.n));
  const maxMes = Math.max(1, ...atual.porMes);

  return (
    <section aria-labelledby="painel-titulo">
      <h2 id="painel-titulo" style={{ marginBottom: "1rem" }}>
        Ano a ano
      </h2>
      <div className="segmentos" role="group" aria-label="Período">
        {anos.map((r) => (
          <button key={r.ano} type="button" aria-pressed={sel === r.ano} onClick={() => setSel(r.ano)}>
            {r.ano}
          </button>
        ))}
        <button type="button" aria-pressed={sel === null} onClick={() => setSel(null)}>
          Tudo
        </button>
      </div>

      <div className="painel-grade">
      <div className="painel">
        <div className="total-grande">
          <Link href={hrefLista("/proposicoes", f)}>{n(atual.total)}</Link>
          <span className="soft">
            {atual.total === 1 ? "proposição" : "proposições"}
            {sel === null ? " na legislatura" : ` em ${sel}`}, com autoria ou coautoria
          </span>
        </div>

        {sel === null && (
          <p className="small soft" style={{ marginTop: "0.75rem" }}>
            Escolha um ano para ver mês a mês.
          </p>
        )}
        {sel !== null && (
          <>
            <div className="meses" role="list" aria-label={`Por mês de publicação em ${sel}`}>
              {atual.porMes.map((c, i) => {
                const mes = i + 1;
                const altura = `${Math.round((c / maxMes) * 100)}%`;
                const rotulo = `${nomeMes(mes, true)}: ${n(c)} ${c === 1 ? "proposição" : "proposições"}`;
                return c > 0 ? (
                  <Link key={mes} role="listitem" className="mes" href={hrefLista("/proposicoes", { ...f, mes })} aria-label={rotulo} title={rotulo}>
                    <span className="barra" style={{ height: altura }} />
                  </Link>
                ) : (
                  <span key={mes} role="listitem" className="mes vazio" aria-label={rotulo}>
                    <span className="barra" style={{ height: "3px" }} />
                  </span>
                );
              })}
            </div>
            <div className="rotulos-meses" aria-hidden="true">
              {atual.porMes.map((_, i) => (
                <span key={i}>{nomeMes(i + 1).slice(0, 1).toUpperCase()}</span>
              ))}
            </div>
            <p className="small soft" style={{ marginTop: "0.5rem" }}>
              Por mês de publicação. Toque numa barra para ver as daquele mês.
            </p>
          </>
        )}
      </div>

      <div className="painel">
        <h3>Por tipo</h3>
        <ul className="composicao">
          {atual.porTipo.map((t) => (
            <li key={t.tipo}>
              <Link href={hrefLista("/proposicoes", { ...f, tipo: t.tipo })}>
                <span className="rotulo">
                  {rotulos[t.tipo] ?? t.tipo}
                  {explicacoes[t.tipo] && <small>{explicacoes[t.tipo]}</small>}
                </span>
                <span className="num">{n(t.n)}</span>
                <span className="trilha" aria-hidden="true">
                  <span style={{ width: `${Math.max(2, Math.round((t.n / maxTipo) * 100))}%` }} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {atual.porTipo.length === 0 && <p className="soft">Nenhuma proposição neste período.</p>}
      </div>
      </div>
    </section>
  );
}
