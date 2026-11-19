import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Fonte } from "@/components/Fonte";
import { Icon } from "@/components/Icon";
import { Barras, Colunas, Proporcao } from "@/components/graficos/Graficos";
import { percent, percent1 } from "@/lib/data/analise";
import { panorama, raioX } from "@/lib/data/painel";
import { hrefLista } from "@/lib/data/query";
import { n } from "@/lib/format";

export const metadata: Metadata = {
  title: "Comparar vereadores",
  description: "Compare lado a lado o que até três vereadores de Pindamonhangaba apresentaram, na mesma escala.",
  alternates: { canonical: "/comparar" },
};

const MAX = 3;

export default async function Comparar({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const p = panorama();
  const { d } = p;
  const pedidos = ([] as string[]).concat(sp.v ?? []);
  const validos = new Set(d.vereadores.map((v) => v.slug));
  const sel = [...new Set(pedidos.filter((s) => validos.has(s)))].slice(0, MAX);
  const href = (lista: string[]) => (lista.length ? `/comparar?${lista.map((s) => `v=${s}`).join("&")}` : "/comparar");
  const dados = sel.map((slug) => ({ v: d.vereadores.find((v) => v.slug === slug)!, x: raioX(slug) }));
  const maxMes = Math.max(1, ...dados.flatMap((y) => y.x.mensal.map((m) => m.total)));
  const maxTemaPct = Math.max(10, ...dados.flatMap((y) => y.x.temas.map((t) => percent(t.n, y.x.pedidos.length))));

  return (
    <>
      <div className="prosa">
        <h1>Comparar vereadores</h1>
        <p className="soft">
          Escolha até {MAX} vereadores para enxergar todos os gráficos na mesma escala — assim a comparação visual fica justa. Lembre:
          volume de pedidos não mede qualidade, e quem preside a Câmara exerce atribuições regimentais próprias.
        </p>
      </div>

      <nav className="seletor section" aria-label="Escolher vereadores" style={{ marginTop: "1.25rem" }}>
        {d.vereadores.map((v) => {
          const ativo = sel.includes(v.slug);
          const prox = ativo ? sel.filter((s) => s !== v.slug) : [...sel, v.slug].slice(-MAX);
          return (
            <Link key={v.slug} className="chip" href={href(prox)} aria-current={ativo ? "true" : undefined} scroll={false}>
              {v.foto && <Image className="avatar" src={v.foto} alt="" width={24} height={24} style={{ width: 24, height: 24 }} />}
              {v.nome}
            </Link>
          );
        })}
        {sel.length > 0 && (
          <Link className="chip" href="/comparar" scroll={false}>
            Limpar seleção
          </Link>
        )}
      </nav>

      {dados.length === 0 && (
        <p className="nota section">Toque em dois ou três nomes acima para começar.</p>
      )}
      {dados.length === 1 && (
        <p className="small soft" style={{ marginTop: "0.75rem" }}>
          Toque em mais um ou dois nomes acima para comparar lado a lado.
        </p>
      )}

      {dados.length > 0 && (
        <div className="comparacao section" style={{ ["--cols" as string]: dados.length }}>
          {dados.map(({ v, x }) => (
            <article key={v.slug} className="historia" aria-labelledby={`c-${v.slug}`}>
              <h2 className="sr-only" id={`c-${v.slug}`}>
                {v.nome}
              </h2>
              <Link href={`/vereadores/${v.slug}`} className="cartao-v" style={{ border: 0, padding: 0 }}>
                <span className="foto">{v.foto && <Image src={v.foto} alt="" width={136} height={136} />}</span>
                <span>
                  <span className="nome">{v.nome}</span>
                  <span className="meta"> {v.partido}{v.funcao && v.funcao !== "Vereador" ? `, ${v.funcao.toLowerCase()}` : ""}</span>
                </span>
              </Link>
              <ul className="fatos">
                <li className="fato">
                  <strong>
                    <Link href={hrefLista("/proposicoes", { autor: v.slug })}>{n(x.deles.length)}</Link>
                  </strong>
                  <span>{x.deles.length === 1 ? "proposição" : "proposições"} desde 2025</span>
                </li>
                <li className="fato">
                  <strong>
                    <Link href={hrefLista("/proposicoes", { autor: v.slug, tipo: "Projetos-de-Lei-Ordinaria" })}>{n(x.projetos.length)}</Link>
                  </strong>
                  <span>
                    {x.projetos.length === 1 ? "projeto de lei" : "projetos de lei"};{" "}
                    <Link href={hrefLista("/proposicoes", x.filtroProjetosLei)}>{n(x.nProjetosLei)}</Link>{" "}
                    {x.nProjetosLei === 1 ? "já citado" : "já citados"} como origem de uma lei
                  </span>
                </li>
              </ul>
              <h3>Por mês</h3>
              <Colunas
                dados={x.mensal.map((m) => ({ ...m, total: m.total }))}
                altura={90}
                titulo={`Proposições de ${v.nome} por mês`}
                href={(mes) => hrefLista("/proposicoes", { autor: v.slug, pub: mes })}
                escalaMax={maxMes}
              />
              <h3>Tipos</h3>
              <Proporcao partes={x.grupos.map((g) => ({ slug: g.slug as "pedidos", nome: g.nome, n: g.n }))} />
              <span className="rotulo-derivado" style={{ marginTop: "1.75rem", marginBottom: 0 }}>
                <Icon nome="info" tamanho={14} /> Classificação automática pelo texto
              </span>
              <h3 style={{ marginTop: "0.35rem" }}>Assuntos dos pedidos (%)</h3>
              {x.temas.length > 0 ? (
                <Barras
                  titulo={`Assuntos de ${v.nome}`}
                  unidade="%"
                  max={maxTemaPct}
                  itens={x.temas.slice(0, 5).map((t) => ({
                    chave: t.slug,
                    nome: t.nome,
                    n: percent1(t.n, x.pedidos.length),
                    href: hrefLista("/proposicoes", t.filtro),
                  }))}
                />
              ) : (
                <p className="small soft">Nenhum pedido classificado neste período.</p>
              )}
              <span className="rotulo-derivado" style={{ marginTop: "1.75rem", marginBottom: 0 }}>
                <Icon nome="info" tamanho={14} /> Classificação automática pelo texto
              </span>
              <h3 style={{ marginTop: "0.35rem" }}>Bairros mais citados</h3>
              {x.bairros.length > 0 ? (
                <Barras
                  titulo={`Bairros de ${v.nome}`}
                  itens={x.bairros.slice(0, 5).map((b) => ({ chave: b.slug, nome: b.nome, n: b.n, href: hrefLista("/proposicoes", b.filtro) }))}
                />
              ) : (
                <p className="small soft">Nenhum bairro citado com frequência.</p>
              )}
            </article>
          ))}
        </div>
      )}
      <Fonte d={d} />
    </>
  );
}
