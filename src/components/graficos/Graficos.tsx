import Link from "next/link";
import type { MesConta } from "@/lib/data/analise";
import { GRUPOS, type Grupo } from "@/lib/data/extrair";
import { n, nomeMes } from "@/lib/format";

/** Fixed colour slot per group (validated palette, see globals.css). */
export const COR_GRUPO: Record<Grupo, string> = {
  pedidos: "var(--g1)",
  projetos: "var(--g2)",
  homenagens: "var(--g3)",
  camara: "var(--g4)",
};

function pct(parte: number, todo: number) {
  return todo === 0 ? 0 : (parte / todo) * 100;
}

function rotuloMes(mes: string, longo = false) {
  const [a, m] = mes.split("-");
  return `${nomeMes(Number(m), longo)}${longo ? ` de ${a}` : ""}`;
}

/** Monthly columns, optionally stacked by group. Each column links to its list. */
export function Colunas({
  dados,
  empilhado = false,
  href,
  titulo,
  anotacoes = {},
  altura = 160,
  escalaMax,
}: {
  dados: MesConta[];
  empilhado?: boolean;
  href?: (mes: string) => string;
  titulo: string;
  anotacoes?: Record<string, string>;
  altura?: number;
  /** Shared maximum so several charts use the same scale. */
  escalaMax?: number;
}) {
  const max = escalaMax ?? Math.max(1, ...dados.map((d) => d.total));
  return (
    <figure className="grafico">
      <div className="colunas" style={{ height: altura }} role="list" aria-label={titulo}>
        {dados.map((d) => {
          const rotulo = `${rotuloMes(d.mes, true)}: ${n(d.total)} proposições`;
          const conteudo = (
            <>
              <span className="col-pilha" style={{ height: `${pct(d.total, max)}%` }}>
                {empilhado
                  ? GRUPOS.map((g) =>
                      d.porGrupo[g.slug] > 0 ? (
                        <span key={g.slug} className="seg" style={{ flexGrow: d.porGrupo[g.slug], background: COR_GRUPO[g.slug] }} />
                      ) : null,
                    )
                  : <span className="seg" style={{ flexGrow: 1, background: "var(--g1)" }} />}
              </span>
              {anotacoes[d.mes] && <span className="col-nota">{anotacoes[d.mes]}</span>}
              <span className="dica" aria-hidden="true">
                <strong>{n(d.total)}</strong> em {rotuloMes(d.mes, true)}
              </span>
            </>
          );
          return href && d.total > 0 ? (
            <Link key={d.mes} href={href(d.mes)} className="col" role="listitem" aria-label={rotulo}>
              {conteudo}
            </Link>
          ) : (
            <span key={d.mes} className="col" role="listitem" aria-label={rotulo}>
              {conteudo}
            </span>
          );
        })}
      </div>
      <div className="col-eixo" aria-hidden="true">
        {dados.map((d) => {
          const m = Number(d.mes.slice(5, 7));
          return <span key={d.mes}>{m === 1 ? d.mes.slice(0, 4) : m % 3 === 1 ? nomeMes(m) : ""}</span>;
        })}
      </div>
      {empilhado && <Legenda />}
      <Tabela
        titulo={titulo}
        colunas={empilhado ? ["Mês", "Total", ...GRUPOS.map((g) => g.nome)] : ["Mês", "Total"]}
        linhas={dados.map((d) => [rotuloMes(d.mes, true), d.total, ...(empilhado ? GRUPOS.map((g) => d.porGrupo[g.slug]) : [])])}
      />
    </figure>
  );
}

export function Legenda() {
  return (
    <ul className="legenda">
      {GRUPOS.map((g) => (
        <li key={g.slug}>
          <span className="amostra" style={{ background: COR_GRUPO[g.slug] }} aria-hidden="true" />
          {g.nome}
        </li>
      ))}
    </ul>
  );
}

/** Part-to-whole bar with direct labels underneath (never colour alone). */
export function Proporcao({
  partes,
  href,
}: {
  partes: Array<{ slug: Grupo; nome: string; n: number }>;
  href?: (slug: Grupo) => string;
}) {
  const total = partes.reduce((a, p) => a + p.n, 0);
  const visiveis = partes.filter((p) => p.n > 0);
  return (
    <figure className="grafico">
      <div className="proporcao" aria-hidden="true">
        {visiveis.map((p) => (
          <span key={p.slug} style={{ flexGrow: p.n, background: COR_GRUPO[p.slug] }} />
        ))}
      </div>
      <ul className="proporcao-rotulos">
        {visiveis.map((p) => {
          const corpo = (
            <>
              <span className="amostra" style={{ background: COR_GRUPO[p.slug] }} aria-hidden="true" />
              <span className="pr-nome">{p.nome}</span>
              <span className="pr-num">
                {n(p.n)} <span className="soft">({pct(p.n, total) < 1 ? "menos de 1%" : `${Math.round(pct(p.n, total))}%`})</span>
              </span>
            </>
          );
          return <li key={p.slug}>{href ? <Link href={href(p.slug)}>{corpo}</Link> : corpo}</li>;
        })}
      </ul>
    </figure>
  );
}

/** Horizontal bars, sorted by the caller. Optional reference marker (e.g. the Câmara share). */
export function Barras({
  itens,
  titulo,
  max: maxFixo,
  unidade = "",
  referencia,
  rotuloReferencia,
  visiveis,
}: {
  itens: Array<{ chave: string; nome: string; n: number; href?: string; nota?: string; ref?: number }>;
  titulo: string;
  max?: number;
  unidade?: string;
  referencia?: boolean;
  rotuloReferencia?: string;
  /** Show this many rows; the rest open on demand. */
  visiveis?: number;
}) {
  const max = maxFixo ?? Math.max(1, ...itens.map((i) => Math.max(i.n, i.ref ?? 0)));
  return (
    <figure className="grafico">
      {(() => {
        const linha = (i: (typeof itens)[number]) => {
          const corpo = (
            <>
              <span className="b-nome">
                {i.nome}
                {i.nota && <small>{i.nota}</small>}
              </span>
              <span className="b-num">
                {n(i.n)}
                {unidade}
              </span>
              <span className="b-trilha" aria-hidden="true">
                <span className="b-valor" style={{ width: `${Math.max(1, pct(i.n, max))}%` }} />
                {referencia && i.ref !== undefined && <span className="b-ref" style={{ left: `${pct(i.ref, max)}%` }} />}
              </span>
            </>
          );
          return <li key={i.chave}>{i.href ? <Link href={i.href}>{corpo}</Link> : <div>{corpo}</div>}</li>;
        };
        const k = visiveis && itens.length > visiveis + 1 ? visiveis : itens.length;
        return (
          <>
            <ul className="barras" aria-label={titulo}>
              {itens.slice(0, k).map(linha)}
            </ul>
            {k < itens.length && (
              <details className="mais-barras">
                <summary>Mostrar mais {itens.length - k}</summary>
                <ul className="barras">{itens.slice(k).map(linha)}</ul>
              </details>
            )}
          </>
        );
      })()}
      {referencia && rotuloReferencia && (
        <p className="legenda-ref small soft">
          <span className="b-ref-amostra" aria-hidden="true" /> {rotuloReferencia}
        </p>
      )}
    </figure>
  );
}

/** Tiny monthly sparkline (columns) for cards. Decorative: the numbers are given in text. */
export function Faisca({ valores, altura = 28 }: { valores: number[]; altura?: number }) {
  const max = Math.max(1, ...valores);
  return (
    <span className="faisca" style={{ height: altura }} aria-hidden="true">
      {valores.map((v, i) => (
        <span key={i} style={{ height: `${Math.max(4, pct(v, max))}%` }} />
      ))}
    </span>
  );
}

/** Accessible table alternative for any chart. */
export function Tabela({ titulo, colunas, linhas }: { titulo: string; colunas: string[]; linhas: Array<Array<string | number>> }) {
  return (
    <details className="como-tabela">
      <summary>Ver como tabela</summary>
      {/* Focusable so keyboard users can scroll a wide table (WCAG 2.1.1). */}
      <div className="tabela-rolagem" tabIndex={0} role="region" aria-label={titulo}>
        <table className="tabela">
          <caption className="sr-only">{titulo}</caption>
          <thead>
            <tr>
              {colunas.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhas.map((l, i) => (
              <tr key={i}>
                {l.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{typeof c === "number" ? n(c) : c}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
