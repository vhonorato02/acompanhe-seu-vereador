import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { Fonte } from "@/components/Fonte";
import { Barras } from "@/components/graficos/Graficos";
import { Icon } from "@/components/Icon";
import { Feed } from "@/components/Item";
import { PainelVereador } from "@/components/PainelVereador";
import { Avatar } from "@/components/Rosto";
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

/** Laws shown before the rest fold away; keeps the profile short on a phone. */
const LEIS_VISIVEIS = 3;

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
  const leis = ordenar(x.viraram.filter((y) => y.lei.tipo.startsWith("Leis")).map((y) => y.lei));
  const parceiros = p.pares.filter((q) => q.a === v.slug || q.b === v.slug).sort((a, b) => b.n - a.n);
  const parceiro = parceiros[0];
  const nomeDe = (s: string) => d.vereadores.find((y) => y.slug === s)?.nome ?? s;

  return (
    <>
      <Link href="/vereadores" className="voltar">
        Vereadores
      </Link>
      <header className="perfil-hero">
        <ViewTransition name={`foto-${v.slug}`}>
          {v.foto ? (
            <div className="perfil-foto">
              <Image src={v.foto} alt={`Foto oficial de ${v.nome}`} width={288} height={288} priority sizes="(min-width: 46rem) 9rem, 5.5rem" />
            </div>
          ) : (
            <div className="perfil-foto sem-foto" aria-hidden="true">
              {v.nome
                .split(/\s+/)
                .filter((p) => /^\p{Lu}/u.test(p))
                .slice(0, 2)
                .map((p) => p[0])
                .join("")}
            </div>
          )}
        </ViewTransition>
        <div>
          <h1 className="perfil-nome">{v.nome}</h1>
          <p className="perfil-meta">
            {v.partido}
            {papel ? `, ${papel.toLowerCase()}` : ""}. Mandato 2025–2028.
          </p>
          <p className="perfil-links">
            <a href={v.link.replace(/#.*$/, "")}>Perfil no site oficial</a>
            <Link href={`/comparar?v=${v.slug}`}>Comparar</Link>
          </p>
        </div>
      </header>

      <section aria-labelledby="t-resumo" style={{ marginTop: "2rem" }}>
        <h2 id="t-resumo" className="sr-only">
          Em resumo
        </h2>
        <ul className="fatos">
          <li className="fato">
            <strong>
              <Link href={hrefLista("/proposicoes", { autor: v.slug })}>{n(x.deles.length)}</Link>
            </strong>
            <span>proposições desde 2025, {pctPedidos}% delas pedidos</span>
          </li>
          <li className="fato">
            <strong>
              <Link href={hrefLista("/proposicoes", { autor: v.slug, tipo: "Projetos-de-Lei-Ordinaria" })}>{n(x.projetos.length)}</Link>
            </strong>
            <span>
              projetos de lei com autoria ou coautoria;{" "}
              <Link href={hrefLista("/proposicoes", x.filtroProjetosLei)}>{n(x.nProjetosLei)}</Link> já citados como origem de
              uma lei
            </span>
          </li>
          <li className="fato">
            <strong>
              <Link href={hrefLista("/proposicoes", { autor: v.slug, conjunto: true })}>{n(x.coautoria)}</Link>
            </strong>
            <span>
              assinadas junto com outro vereador ({percent(x.coautoria, x.deles.length)}% do total)
              {parceiro ? `, com mais frequência ${nomeDe(parceiro.a === v.slug ? parceiro.b : parceiro.a)}` : ""}
            </span>
          </li>
        </ul>
        {papel === "Presidente" && (
          <p className="nota" style={{ marginTop: "1rem" }}>
            Como presidente, conduz as sessões e representa a Câmara. Esse papel é contexto para ler os números.
          </p>
        )}
      </section>

      <div className="section">
        <PainelVereador slug={v.slug} nome={v.nome} recortes={recortes(d.proposicoes, v.slug)} rotulos={CURTO} explicacoes={explicacoes} />
      </div>

      <div className="duas-colunas section">
        <article className="historia" aria-labelledby="h-temas">
          <span className="rotulo-derivado">
            <Icon nome="info" tamanho={14} /> Classificação automática pelo texto
          </span>
          <h2 id="h-temas">Do que tratam os pedidos</h2>
          {tema1 ? (
            <p className="lede">
              {tema1.nome} aparece em {percent(tema1.n, x.pedidos.length)}% dos pedidos. O traço cinza marca a proporção na Câmara inteira,
              para comparar o perfil sem fazer ranking.
            </p>
          ) : (
            <p className="lede">Nenhum pedido classificado no período.</p>
          )}
          <Barras
            titulo="Pedidos por assunto, em porcentagem"
            unidade="%"
            visiveis={6}
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
          <p className="lede">{bairro1 ? `${bairro1.nome} aparece em ${n(bairro1.n)} proposições.` : "Nenhum bairro citado com frequência."}</p>
          <Barras
            titulo="Bairros mais citados"
            visiveis={6}
            itens={x.bairros.slice(0, 12).map((b) => ({ chave: b.slug, nome: b.nome, n: b.n, href: hrefLista("/proposicoes", b.filtro) }))}
          />
        </article>
      </div>

      <div className="duas-colunas">
        <article className="historia" aria-labelledby="h-rede">
          <h2 id="h-rede">Com quem assina junto</h2>
          <p className="lede">Os vereadores com quem {v.nome} mais divide a autoria. Cada número abre as proposições em comum.</p>
          {parceiros.length > 0 ? (
            <ul className="parceiros">
              {parceiros.slice(0, 5).map((q) => {
                const outro = q.a === v.slug ? q.b : q.a;
                const ov = d.vereadores.find((y) => y.slug === outro);
                return (
                  <li key={outro}>
                    <Link href={hrefLista("/proposicoes", { autor: v.slug, coautor: outro })}>
                      {ov ? <Avatar v={ov} tamanho={32} /> : <span />}
                      <span className="p-nome">{nomeDe(outro)}</span>
                      <span className="p-num">{n(q.n)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="soft">Nenhuma proposição assinada em conjunto.</p>
          )}
        </article>

        <article className="historia" aria-labelledby="t-leis">
          <span className="rotulo-derivado">
            <Icon nome="info" tamanho={14} /> Ligação feita pelo número do projeto citado na lei
          </span>
          <h2 id="t-leis">Projetos que viraram lei</h2>
          <p className="lede">
            {leis.length > 0
              ? `${n(leis.length)} ${leis.length === 1 ? "lei desta legislatura cita" : "leis desta legislatura citam"} na ementa um projeto com autoria ou coautoria de ${v.nome}.`
              : `Nenhuma lei desta legislatura cita um projeto de ${v.nome} até a última atualização.`}
          </p>
          {leis.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <Feed itens={leis.slice(0, LEIS_VISIVEIS)} vereadores={d.vereadores} />
              {leis.length > LEIS_VISIVEIS && (
                <details className="mais-barras">
                  <summary>Mostrar as outras {n(leis.length - LEIS_VISIVEIS)}</summary>
                  <Feed itens={leis.slice(LEIS_VISIVEIS)} vereadores={d.vereadores} />
                </details>
              )}
            </div>
          )}
        </article>
      </div>

      <section className="historia" aria-labelledby="t-recentes">
        <div className="section-head">
          <h2 id="t-recentes">Mais recentes</h2>
          {x.deles.length > 0 && <Link href={hrefLista("/proposicoes", { autor: v.slug })}>Ver as {n(x.deles.length)}</Link>}
        </div>
        <Feed itens={ordenar(x.deles).slice(0, 5)} vereadores={d.vereadores} />
      </section>
      <p className="small soft" style={{ marginTop: "1rem" }}>
        {v.foto ? "Foto: Câmara Municipal." : "Foto oficial indisponível nesta coleta."}
      </p>
      <Fonte d={d} />
    </>
  );
}
