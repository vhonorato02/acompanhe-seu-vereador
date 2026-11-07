import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { Fonte } from "@/components/Fonte";
import { Barras, Colunas, Proporcao } from "@/components/graficos/Graficos";
import { Rede } from "@/components/graficos/Rede";
import { Icon } from "@/components/Icon";
import { Feed } from "@/components/Item";
import { PainelVereador } from "@/components/PainelVereador";
import { GLOSSARIO } from "@/lib/content/glossario";
import { CURTO } from "@/lib/content/tipos";
import { percent, percent1 } from "@/lib/data/analise";
import { dataset } from "@/lib/data/load";
import { panorama, raioX } from "@/lib/data/painel";
import { recortes } from "@/lib/data/perfil";
import { hrefLista, ordenar } from "@/lib/data/query";
import { n } from "@/lib/format";

export function generateStaticParams() {
  return dataset().vereadores.map((v) => ({ slug: v.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const v = dataset().vereadores.find((x) => x.slug === slug);
  if (!v) return {};
  return {
    title: v.nome,
    description: `O que ${v.nome} (${v.partido}) apresentou na Câmara de Pindamonhangaba desde 2025: pedidos, projetos, assuntos e bairros, com link para cada documento oficial.`,
    alternates: { canonical: `/vereadores/${v.slug}` },
    openGraph: {
      images: v.foto ? [{ url: v.foto, alt: `Foto oficial de ${v.nome} (Câmara Municipal)` }] : ["/opengraph-image"],
    },
  };
}

export default async function PaginaVereador({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = panorama();
  const { d } = p;
  const v = d.vereadores.find((x) => x.slug === slug);
  if (!v) notFound();
  const x = raioX(v.slug);
  const papel = v.funcao && v.funcao !== "Vereador" ? v.funcao : null;
  const explicacoes = Object.fromEntries(GLOSSARIO.map((g) => [g.contract, g.curto]));
  const pctPedidos = percent(x.grupos.find((g) => g.slug === "pedidos")?.n ?? 0, x.deles.length);
  const tema1 = x.temas[0];
  const bairro1 = x.bairros[0];
  const leis = x.viraram.filter((y) => y.lei.tipo.startsWith("Leis"));
  const leisDePL = x.leisDeProjetos.length;
  const parceiros = p.pares
    .filter((q) => q.a === v.slug || q.b === v.slug)
    .sort((a, b) => b.n - a.n);
  const parceiro = parceiros[0];
  const nomeDe = (s: string) => d.vereadores.find((y) => y.slug === s)?.nome ?? s;

  return (
    <>
      <header className="perfil-hero">
        <ViewTransition name={`foto-${v.slug}`}>
          {v.foto ? (
            <div className="perfil-foto">
              <Image src={v.foto} alt={`Foto oficial de ${v.nome}`} width={480} height={600} priority sizes="(min-width: 46rem) 17rem, 100vw" />
            </div>
          ) : (
            <div className="perfil-foto sem-foto" aria-hidden="true">
              {v.nome.split(/\s+/).filter((p) => /^\p{Lu}/u.test(p)).slice(0, 2).map((p) => p[0]).join("")}
            </div>
          )}
        </ViewTransition>
        <div className="entrada">
          <h1 className="perfil-nome">{v.nome}</h1>
          <div className="etiquetas">
            <span className="etiqueta">{v.partido}</span>
            {papel && <span className="etiqueta destaque">{papel}</span>}
            <span className="etiqueta">Mandato 2025–2028</span>
          </div>
          <p className="small soft" style={{ marginTop: "0.85rem" }}>
            {v.foto ? "Foto: Câmara Municipal. " : "Foto oficial indisponível nesta coleta. "}<a href={v.link.replace(/#.*$/, "")}>Perfil no site oficial</a>
            {" "}
            <Link href={`/comparar?v=${v.slug}`}>Comparar com outro vereador</Link>
          </p>
        </div>
      </header>

      <section className="section" aria-labelledby="t-resumo">
        <h2 id="t-resumo" className="sr-only">
          Em resumo
        </h2>
        <ul className="fatos">
          <li className="fato">
            <strong>
              <Link href={hrefLista("/proposicoes", { autor: v.slug })}>{n(x.deles.length)}</Link>
            </strong>
            proposições desde 2025, {pctPedidos}% delas pedidos (indicações e requerimentos)
          </li>
          <li className="fato">
            <strong>
              <Link href={hrefLista("/proposicoes", { autor: v.slug, tipo: "Projetos-de-Lei-Ordinaria" })}>{n(x.projetos.length)}</Link>
            </strong>
            projetos de lei com autoria ou coautoria; {n(leisDePL)} já citados como origem de uma lei
          </li>
          <li className="fato">
            <strong>
              <Link href={hrefLista("/proposicoes", { autor: v.slug, conjunto: true })}>{percent(x.coautoria, x.deles.length)}%</Link>
            </strong>
            ({n(x.coautoria)}) assinadas junto com outro vereador
            {parceiro ? `, com mais frequência ${nomeDe(parceiro.a === v.slug ? parceiro.b : parceiro.a)}` : ""}
          </li>
        </ul>
        {papel === "Presidente" && (
          <p className="nota" style={{ marginTop: "1rem" }}>
            Como presidente, conduz as sessões e representa a Câmara. Esse papel é contexto para ler os números.
          </p>
        )}
      </section>

      <PainelVereador slug={v.slug} nome={v.nome} recortes={recortes(d.proposicoes, v.slug)} rotulos={CURTO} explicacoes={explicacoes} />

      <div className="section">
        <article className="historia" aria-labelledby="h-ritmo">
          <h2 id="h-ritmo">Ritmo desde janeiro de 2025</h2>
          <p className="lede">Proposições publicadas por mês, separadas por tipo. Toque numa coluna para ver a lista.</p>
          <Colunas
            dados={x.mensal}
            empilhado
            altura={140}
            titulo={`Proposições de ${v.nome} por mês`}
            href={(mes) => hrefLista("/proposicoes", { autor: v.slug, pub: mes })}
          />
        </article>

        <div className="duas-colunas" style={{ marginTop: "1rem" }}>
          <article className="historia" aria-labelledby="h-temas">
            <span className="rotulo-derivado">
              <Icon nome="info" tamanho={14} /> Classificação automática pelo texto
            </span>
            <h2 id="h-temas">Do que tratam os pedidos</h2>
            {tema1 ? (
              <p className="lede">
                {tema1.nome} aparece em {percent(tema1.n, x.pedidos.length)}% dos pedidos de {v.nome}. A marca mostra a proporção na Câmara
                inteira, para comparar o perfil sem fazer ranking.
              </p>
            ) : (
              <p className="lede">Nenhum pedido classificado no período.</p>
            )}
            <Barras
              titulo="Pedidos por assunto, em porcentagem"
              unidade="%"
              max={Math.max(10, ...x.temas.map((t) => percent(t.n, x.pedidos.length)), ...[...x.refTema.values()].map(Math.round))}
              referencia
              rotuloReferencia="Proporção na Câmara inteira"
              itens={x.temas.map((t) => ({
                chave: t.slug,
                nome: t.nome,
                n: percent1(t.n, x.pedidos.length),
                nota: `${n(t.n)} pedidos`,
                ref: Math.round(x.refTema.get(t.slug) ?? 0),
                href: hrefLista("/proposicoes", t.filtro),
              }))}
            />
          </article>

          <article className="historia" aria-labelledby="h-bairros">
            <span className="rotulo-derivado">
              <Icon nome="info" tamanho={14} /> Bairros citados no texto
            </span>
            <h2 id="h-bairros">Bairros mais citados</h2>
            <p className="lede">
              {bairro1 ? `${bairro1.nome} aparece em ${n(bairro1.n)} proposições de ${v.nome}.` : "Nenhum bairro citado com frequência."}
            </p>
            <Barras
              titulo="Bairros mais citados"
              itens={x.bairros.slice(0, 8).map((b) => ({ chave: b.slug, nome: b.nome, n: b.n, href: hrefLista("/proposicoes", b.filtro) }))}
            />
          </article>
        </div>

        <div className="duas-colunas" style={{ marginTop: "1rem" }}>
          <article className="historia" aria-labelledby="h-grupos">
            <h2 id="h-grupos">Tipos de proposição</h2>
            <p className="lede">Como as proposições de {v.nome} se dividem.</p>
            <Proporcao
              partes={x.grupos.map((g) => ({ slug: g.slug as "pedidos", nome: g.nome, n: g.n }))}
              href={(s) => hrefLista("/proposicoes", { autor: v.slug, grupo: s })}
            />
          </article>

          <article className="historia" aria-labelledby="h-rede">
            <h2 id="h-rede">Com quem assina junto</h2>
            <p className="lede">
              {percent(x.coautoria, x.deles.length)}% das proposições têm mais de um vereador como autor.
            </p>
            <Rede nos={d.vereadores.map((y) => ({ slug: y.slug, nome: y.nome, foto: y.foto }))} pares={p.pares} inicial={v.slug} />
          </article>
        </div>
      </div>

      <section className="section" aria-labelledby="t-leis">
        <span className="rotulo-derivado">
          <Icon nome="info" tamanho={14} /> Ligação feita pelo número do projeto citado na lei
        </span>
        <h2 id="t-leis">Projetos que viraram lei</h2>
        <p className="soft" style={{ margin: "0.5rem 0 1rem" }}>
          Leis desta legislatura cuja ementa cita um projeto com autoria ou coautoria de {v.nome}.
        </p>
        {leis.length > 0 ? (
          <Feed itens={ordenar(leis.map((y) => y.lei))} vereadores={d.vereadores} />
        ) : (
          <p className="nota">Nenhuma lei desta legislatura cita um projeto de {v.nome} até a última atualização.</p>
        )}
      </section>

      <section className="section" aria-labelledby="t-recentes">
        <div className="section-head">
          <h2 id="t-recentes">Mais recentes</h2>
          {x.deles.length > 0 && <Link href={hrefLista("/proposicoes", { autor: v.slug })}>Ver as {n(x.deles.length)}</Link>}
        </div>
        <Feed itens={ordenar(x.deles).slice(0, 6)} vereadores={d.vereadores} />
      </section>
      <Fonte d={d} />
    </>
  );
}
