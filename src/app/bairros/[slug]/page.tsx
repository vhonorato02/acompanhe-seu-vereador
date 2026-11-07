import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fonte } from "@/components/Fonte";
import { Barras, Colunas } from "@/components/graficos/Graficos";
import { Icon } from "@/components/Icon";
import { Feed } from "@/components/Item";
import { percent, porMes, porTema } from "@/lib/data/analise";
import { panorama } from "@/lib/data/painel";
import { contar, filtrar, hrefLista, ordenar } from "@/lib/data/query";
import { n } from "@/lib/format";

export function generateStaticParams() {
  return panorama().bairros.map((b) => ({ slug: b.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const b = panorama().bairros.find((x) => x.slug === slug);
  return b
    ? {
        title: b.nome,
        description: `O que os vereadores de Pindamonhangaba pediram para ${b.nome}: ${b.n} proposições citam o bairro desde 2025.`,
        alternates: { canonical: `/bairros/${b.slug}` },
      }
    : {};
}

export default async function PaginaBairro({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = panorama();
  const { d } = p;
  const b = p.bairros.find((x) => x.slug === slug);
  if (!b) notFound();
  const itens = filtrar(d.proposicoes, { bairro: slug });
  const temas = porTema(itens, { bairro: slug });
  const tema1 = temas[0];
  const porVereador = d.vereadores
    .map((v) => ({ v, c: contar(d.proposicoes, { bairro: slug, autor: v.slug }) }))
    .filter((y) => y.c > 0);
  const recentes = ordenar(itens);

  return (
    <>
      <div className="prosa">
        <p className="soft">
          <Link href="/bairros">Bairros</Link>
        </p>
        <h1>
          {b.nome}
        </h1>
        <p className="lede">
          Citado em <Link href={hrefLista("/proposicoes", { bairro: slug })}>{n(b.n)} proposições</Link> desde 2025
          {tema1 ? `, sobretudo sobre ${tema1.nome.toLowerCase()} (${percent(tema1.n, b.n)}%)` : ""}.
        </p>
        <span className="rotulo-derivado">
          <Icon nome="info" tamanho={14} /> Bairro identificado no texto da ementa
        </span>
      </div>

      <div className="section">
        <div className="duas-colunas">
          <article className="historia" aria-labelledby="h-temas">
            <h2 id="h-temas">Assuntos</h2>
            <p className="lede">Um pedido pode tratar de mais de um assunto.</p>
            <Barras
              titulo={`Assuntos em ${b.nome}`}
              itens={temas.map((t) => ({ chave: t.slug, nome: t.nome, n: t.n, href: hrefLista("/proposicoes", t.filtro) }))}
            />
          </article>
          <article className="historia" aria-labelledby="h-quem">
            <h2 id="h-quem">Quem pediu</h2>
            <p className="lede">Vereadores em ordem alfabética. Proposições assinadas em conjunto contam para cada autor.</p>
            <Barras
              titulo={`Vereadores que citaram ${b.nome}`}
              itens={porVereador.map(({ v, c }) => ({
                chave: v.slug,
                nome: v.nome,
                n: c,
                href: hrefLista("/proposicoes", { bairro: slug, autor: v.slug }),
              }))}
            />
          </article>
        </div>
        <article className="historia" aria-labelledby="h-ritmo" style={{ marginTop: "1rem" }}>
          <h2 id="h-ritmo">Ao longo do tempo</h2>
          <p className="lede">Proposições que citam {b.nome}, por mês de publicação.</p>
          <Colunas
            dados={porMes(itens, p.listaMeses)}
            empilhado
            altura={120}
            titulo={`Proposições sobre ${b.nome} por mês`}
            href={(mes) => hrefLista("/proposicoes", { bairro: slug, pub: mes })}
          />
        </article>
      </div>

      <section className="section" aria-labelledby="t-recentes">
        <div className="section-head">
          <h2 id="t-recentes">Mais recentes</h2>
          <Link href={hrefLista("/proposicoes", { bairro: slug })}>Ver as {n(itens.length)}</Link>
        </div>
        <Feed itens={recentes.slice(0, 8)} vereadores={d.vereadores} />
      </section>
      <Fonte d={d} />
    </>
  );
}
