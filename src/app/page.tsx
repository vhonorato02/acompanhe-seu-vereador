import type { Metadata } from "next";
import Link from "next/link";
import { Busca } from "@/components/Busca";
import { Fonte } from "@/components/Fonte";
import { Barras, Colunas, Proporcao } from "@/components/graficos/Graficos";
import { Rede } from "@/components/graficos/Rede";
import { Icon } from "@/components/Icon";
import { Rosto } from "@/components/Rosto";
import { percent } from "@/lib/data/analise";
import { panorama } from "@/lib/data/painel";
import { hrefLista } from "@/lib/data/query";
import { SITE } from "@/lib/site";
import { dataColeta, n, nomeMes } from "@/lib/format";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Inicio() {
  const p = panorama();
  const { d } = p;
  const total = d.proposicoes.length;
  const pedidos = p.grupos.find((g) => g.slug === "pedidos")?.n ?? 0;
  const projetos = p.grupos.find((g) => g.slug === "projetos")?.n ?? 0;
  const emDez = Math.round((pedidos / total) * 10);
  const pico = p.mensal.reduce((a, b) => (b.total > a.total ? b : a), p.mensal[0] ?? { mes: "", total: 0, porGrupo: { pedidos: 0, projetos: 0, homenagens: 0, camara: 0 } });
  const [picoAno, picoMes] = pico.mes.split("-");
  const tema1 = p.temasPedidos[0];
  const fVer = p.funil.find((f) => f.autor === "vereadores");
  const fExe = p.funil.find((f) => f.autor === "executivo");
  const prefeitura = p.destinos.find((x) => x.slug === "prefeitura")?.n ?? 0;
  const totalDestinos = p.destinos.reduce((a, x) => a + x.n, 0);
  const paresTodos = p.pares.length;
  const possiveis = (d.vereadores.length * (d.vereadores.length - 1)) / 2;
  const nVereadores = d.vereadores.length;
  const unicoAutor = d.proposicoes.filter((r) => r.autoresVereadores.length === 1).length;

  return (
    <>
      <section className="hero" aria-labelledby="titulo">
        <h1 id="titulo">O que os vereadores apresentam na Câmara.</h1>
        <p className="lede">
          <Link href="/proposicoes">{n(total)} proposições</Link> na Câmara Municipal de {SITE.cidade} desde janeiro de 2025, cada uma
          com o documento oficial. Dados de{" "}
          {dataColeta(d.execucao.coletadoEm)}.
        </p>
        <Busca />
        <nav aria-label="Assuntos mais pedidos">
          <ul className="atalhos">
            {p.temasPedidos.slice(0, 6).map((t) => (
              <li key={t.slug}>
                <Link className="chip" href={hrefLista("/proposicoes", t.filtro)}>
                  {t.nome} <span className="conta">{n(t.n)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      <section className="section" aria-labelledby="t-vereadores">
        <div className="section-head">
          <h2 id="t-vereadores">Os {nVereadores} vereadores</h2>
          <Link href="/comparar">Comparar</Link>
        </div>
        <ul className="galeria">
          {d.vereadores.map((v, i) => (
            <li key={v.slug}>
              <Rosto v={v} prioridade={i < 6} />
            </li>
          ))}
        </ul>
        <p className="small soft" style={{ marginTop: "1.25rem" }}>
          Em ordem alfabética, legislatura 2025–2028. Fotos oficiais da Câmara Municipal.
        </p>
      </section>

      <section className="banda section" aria-labelledby="t-bairros">
        <div>
          <div className="section-head">
            <h2 id="t-bairros">O seu bairro</h2>
            <Link href="/bairros">Todos os {n(p.bairros.length)}</Link>
          </div>
          <p className="lede" style={{ marginTop: "-0.5rem", marginBottom: "1rem" }}>
            Bairros citados no texto das proposições. Os que mais aparecem:
          </p>
          <span className="rotulo-derivado">
            <Icon nome="info" tamanho={14} /> Identificado no texto da ementa
          </span>
          <Barras
            titulo="Bairros mais citados"
            duasColunas
            itens={p.bairros.slice(0, 8).map((b) => ({ chave: b.slug, nome: b.nome, n: b.n, href: `/bairros/${b.slug}` }))}
          />
        </div>
      </section>

      <div className="section">
        <h2>A Câmara em números</h2>
        <p className="lede">Cada número abre a lista de documentos que ele conta.</p>
      </div>

      <article className="historia" aria-labelledby="h-pedidos" style={{ marginTop: "1.5rem" }}>
        <h3 id="h-pedidos">{emDez} em cada 10 proposições são pedidos, não projetos de lei</h3>
        <p className="lede">
          Indicações e requerimentos pedem providências à Prefeitura e a outros órgãos: tapar um buraco, trocar uma lâmpada, pedir
          informações. Projetos de lei, que podem mudar regras da cidade, são {n(projetos)}.{" "}
          <Link href="/como-funciona">O que é cada tipo</Link>
        </p>
        <Proporcao
          partes={p.grupos.map((g) => ({ slug: g.slug as "pedidos", nome: g.nome, n: g.n }))}
          href={(slug) => hrefLista("/proposicoes", { grupo: slug })}
        />
      </article>

      <article className="historia" aria-labelledby="h-ritmo">
        <h3 id="h-ritmo">Mês a mês</h3>
        <p className="lede">
          O mês com mais proposições publicadas foi {nomeMes(Number(picoMes), true)} de {picoAno}, com {n(pico.total)}. Toque numa
          coluna para ver o que foi apresentado naquele mês.
        </p>
        <Colunas
          dados={p.mensal}
          empilhado
          titulo="Proposições publicadas por mês"
          href={(mes) => hrefLista("/proposicoes", { pub: mes })}
        />
      </article>

      <div className="duas-colunas">
        <article className="historia" aria-labelledby="h-temas">
          <span className="rotulo-derivado">
            <Icon nome="info" tamanho={14} /> Classificação automática pelo texto
          </span>
          <h3 id="h-temas">Do que tratam os pedidos</h3>
          {tema1 && (
            <p className="lede">
              {tema1.nome} aparece em {percent(tema1.n, p.pedidos.length)}% dos {n(p.pedidos.length)} pedidos. Um pedido pode tratar de
              mais de um assunto. <Link href="/metodologia#temas">Como classificamos</Link>
            </p>
          )}
          <Barras
            titulo="Pedidos por assunto"
            visiveis={6}
            itens={p.temasPedidos.map((t) => ({
              chave: t.slug,
              nome: t.nome,
              n: t.n,
              href: hrefLista("/proposicoes", t.filtro),
            }))}
          />
        </article>

        <article className="historia" aria-labelledby="h-destinos">
          <span className="rotulo-derivado">
            <Icon nome="info" tamanho={14} /> Identificado pelo início do texto
          </span>
          <h3 id="h-destinos">A quem se pede</h3>
          <p className="lede">
            {percent(prefeitura, totalDestinos)}% dos pedidos vão para a Prefeitura. O resto se divide entre concessionárias como EDP e
            Sabesp, o DER, a empresa de ônibus e a própria Mesa da Câmara. <Link href="/metodologia#destinos">Como identificamos</Link>
          </p>
          <Barras
            titulo="Pedidos por destinatário"
            itens={p.destinos.map((x) => ({ chave: x.slug, nome: x.nome, n: x.n, href: hrefLista("/proposicoes", x.filtro) }))}
          />
        </article>
      </div>

      <div className="duas-colunas">
        <article className="historia" aria-labelledby="h-leis">
          <span className="rotulo-derivado">
            <Icon nome="info" tamanho={14} /> Ligação feita pelo número do projeto citado na lei
          </span>
          <h3 id="h-leis">Do projeto à lei</h3>
          <p className="lede">
            Quando a ementa de uma lei cita o número do projeto que a originou, o portal liga os dois e mostra a lei no perfil de quem
            assinou o projeto. <Link href="/normas">Ver as leis</Link>
          </p>
          {fVer && (
            <div className="funil">
              <div className="funil-linha">
                <div className="rotulos">
                  <span>Projetos de lei de vereadores</span>
                  <span>
                    <Link href={hrefLista("/proposicoes", fVer.filtroViraramLei)}>{n(fVer.viraramLei)}</Link> de{" "}
                    <Link href={hrefLista("/proposicoes", fVer.filtroApresentados)}>{n(fVer.apresentados)}</Link>
                  </span>
                </div>
                <div className="funil-barra" aria-hidden="true">
                  <span style={{ width: `${Math.max(1, percent(fVer.viraramLei, fVer.apresentados))}%` }} />
                </div>
                <p className="small soft">já citados como origem de uma lei publicada ({percent(fVer.viraramLei, fVer.apresentados)}%)</p>
              </div>
            </div>
          )}
          <p className="small soft" style={{ marginTop: "1rem" }}>
            A mesma conta não vale para os{" "}
            {fExe ? <Link href={hrefLista("/proposicoes", fExe.filtroApresentados)}>{n(fExe.apresentados)} projetos do Poder Executivo</Link> : "projetos do Poder Executivo"}:
            as leis que vêm deles em geral não citam o projeto de origem. Projetos ainda em tramitação entram no total, então a proporção
            é um retrato parcial.
          </p>
        </article>

        <article className="historia" aria-labelledby="h-rede">
          <h3 id="h-rede">Quem assina junto com quem</h3>
          <p className="lede">
            {percent(unicoAutor, total)}% das proposições têm um único vereador como autor. Ainda assim,{" "}
            {paresTodos === possiveis ? "todos os pares de vereadores" : `${paresTodos} dos ${possiveis} pares possíveis`} já assinaram
            alguma juntos. Linha mais grossa, mais proposições em comum.
          </p>
          <Rede nos={d.vereadores.map((v) => ({ slug: v.slug, nome: v.nome, foto: v.foto }))} pares={p.pares} />
        </article>
      </div>

      <p className="nota section">
        <strong>Quantidade não é qualidade.</strong> Um projeto de lei pode exigir meses de trabalho; um pedido pode ser repetido até ser
        atendido. Por isso não há ranking: os números servem para encontrar os documentos, não para dar nota.
      </p>
      <Fonte d={d} />
    </>
  );
}
