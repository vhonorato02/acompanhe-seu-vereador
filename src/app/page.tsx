import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Busca } from "@/components/Busca";
import { Fonte } from "@/components/Fonte";
import { Barras, Colunas, Faisca, Proporcao, Tabela } from "@/components/graficos/Graficos";
import { Rede } from "@/components/graficos/Rede";
import { Icon } from "@/components/Icon";
import { percent, porMes, porTema } from "@/lib/data/analise";
import { panorama } from "@/lib/data/painel";
import { filtrar, hrefLista } from "@/lib/data/query";
import { SITE } from "@/lib/site";
import { dataColeta, n, nomeMes } from "@/lib/format";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Panorama() {
  const p = panorama();
  const { d } = p;
  const total = d.proposicoes.length;
  const pedidos = p.grupos.find((g) => g.slug === "pedidos")?.n ?? 0;
  const emDez = Math.round((pedidos / total) * 10);
  const pico = p.mensal.reduce((a, b) => (b.total > a.total ? b : a), p.mensal[0] ?? { mes: "", total: 0, porGrupo: { pedidos: 0, projetos: 0, homenagens: 0, camara: 0 } });
  const [picoAno, picoMes] = pico.mes.split("-");
  const tema1 = p.temasPedidos[0];
  const bairro1 = p.bairros[0];
  const fVer = p.funil.find((f) => f.autor === "vereadores");
  const fExe = p.funil.find((f) => f.autor === "executivo");
  const prefeitura = p.destinos.find((x) => x.slug === "prefeitura")?.n ?? 0;
  const totalDestinos = p.destinos.reduce((a, x) => a + x.n, 0);
  const paresTodos = p.pares.length;
  const possiveis = (d.vereadores.length * (d.vereadores.length - 1)) / 2;
  const leisDeVereador = p.viraram.filter((v) => v.projeto.autoresVereadores.length > 0 && v.lei.tipo.startsWith("Leis")).length;
  const nVereadores = d.vereadores.length;
  const unicoAutor = d.proposicoes.filter((r) => r.autoresVereadores.length === 1).length;

  return (
    <>
      <section className="hero entrada">
        <p className="soft">Câmara Municipal de Pindamonhangaba, desde janeiro de 2025</p>
        <div className="numerao">{n(total)}</div>
        <h1 style={{ fontSize: "var(--step-3)", marginTop: "0.5rem" }}>proposições apresentadas. Veja o que elas dizem.</h1>
        <p>
          Pedidos, projetos e leis dos {nVereadores} vereadores, contados direto dos dados oficiais da Câmara. {SITE.nome} é um
          projeto independente do {SITE.organizacao}.
        </p>
        <Busca />
      </section>

      <div className="section">
        <article className="historia" aria-labelledby="h-pedidos">
          <h2 id="h-pedidos">
            {emDez} em cada 10 proposições são pedidos, não projetos de lei
          </h2>
          <p className="lede">
            Indicações e requerimentos pedem providências à Prefeitura e a outros órgãos: tapar um buraco, trocar uma lâmpada, pedir
            informações. Projetos de lei, que podem mudar regras da cidade, são {n(p.grupos.find((g) => g.slug === "projetos")?.n ?? 0)}.
          </p>
          <Proporcao
            partes={p.grupos.map((g) => ({ slug: g.slug as "pedidos", nome: g.nome, n: g.n }))}
            href={(slug) => hrefLista("/proposicoes", { grupo: slug })}
          />
          <div className="rodape-historia">
            <Link href="/como-funciona">O que é cada tipo</Link>
          </div>
        </article>

        <article className="historia" aria-labelledby="h-ritmo">
          <h2 id="h-ritmo">O ritmo da Câmara, mês a mês</h2>
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
          <p className="small soft" style={{ marginTop: "0.5rem" }}>
            Pelo mês em que a Câmara publicou cada proposição.
          </p>
        </article>

        <div className="duas-colunas">
          <article className="historia" aria-labelledby="h-temas">
            <span className="rotulo-derivado">
              <Icon nome="info" tamanho={14} /> Classificação automática pelo texto
            </span>
            <h2 id="h-temas">Do que tratam os pedidos</h2>
            {tema1 && (
              <p className="lede">
                {tema1.nome} aparece em {percent(tema1.n, p.pedidos.length)}% dos {n(p.pedidos.length)} pedidos. Um pedido pode tratar de
                mais de um assunto.
              </p>
            )}
            <Barras
              titulo="Pedidos por assunto"
              visiveis={6}
              unidade=""
              itens={p.temasPedidos.map((t) => ({
                chave: t.slug,
                nome: t.nome,
                n: t.n,
                href: hrefLista("/proposicoes", t.filtro),
              }))}
            />
            <div className="rodape-historia">
              <Link href="/metodologia#temas">Como classificamos</Link>
            </div>
          </article>

          <article className="historia" aria-labelledby="h-bairros">
            <span className="rotulo-derivado">
              <Icon nome="info" tamanho={14} /> Bairros citados no texto
            </span>
            <h2 id="h-bairros">Os bairros que mais aparecem</h2>
            {bairro1 && (
              <p className="lede">
                {bairro1.nome} é citado em {n(bairro1.n)} proposições. Ao todo, {n(p.bairros.length)} bairros aparecem pelo menos três
                vezes.
              </p>
            )}
            <Barras
              titulo="Bairros mais citados"
              itens={p.bairros.slice(0, 10).map((b) => ({ chave: b.slug, nome: b.nome, n: b.n, href: `/bairros/${b.slug}` }))}
            />
            <div className="rodape-historia">
              <Link href="/bairros">Encontre o seu bairro</Link>
            </div>
          </article>
        </div>

        <div className="duas-colunas" style={{ marginTop: "1rem" }}>
          <article className="historia" aria-labelledby="h-destinos">
            <span className="rotulo-derivado">
              <Icon nome="info" tamanho={14} /> Identificado pelo início do texto
            </span>
            <h2 id="h-destinos">A quem se pede</h2>
            <p className="lede">
              {percent(prefeitura, totalDestinos)}% dos pedidos vão para a Prefeitura. O resto se divide entre concessionárias como EDP e
              Sabesp, o DER, a empresa de ônibus e a própria Mesa da Câmara.
            </p>
            <Barras
              titulo="Pedidos por destinatário"
              itens={p.destinos.map((x) => ({ chave: x.slug, nome: x.nome, n: x.n, href: hrefLista("/proposicoes", x.filtro) }))}
            />
            <div className="rodape-historia">
              <Link href="/metodologia#destinos">Como identificamos</Link>
            </div>
          </article>

          <article className="historia" aria-labelledby="h-leis">
            <span className="rotulo-derivado">
              <Icon nome="info" tamanho={14} /> Ligação feita pelo número do projeto citado na lei
            </span>
            <h2 id="h-leis">Do projeto à lei</h2>
            <p className="lede">
              {n(leisDeVereador)} leis desta legislatura citam, na ementa, um projeto de vereador em exercício. Abaixo, quantos projetos
              de cada autor já aparecem como origem de uma lei publicada.
            </p>
            {fVer && (
              <div className="funil">
                <div className="funil-linha">
                  <div className="rotulos">
                    <span>Projetos de lei de vereadores em exercício</span>
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
              Não dá para fazer a mesma conta com os{" "}
              {fExe ? <Link href={hrefLista("/proposicoes", fExe.filtroApresentados)}>{n(fExe.apresentados)} projetos do Poder Executivo</Link> : "projetos do Poder Executivo"}:
              as leis que vêm deles em geral não citam o projeto de origem na ementa. Projetos ainda em tramitação também entram no total, então a proporção é um retrato
              parcial.
            </p>
            <div className="rodape-historia">
              <Link href="/normas">Ver as leis</Link>
            </div>
          </article>
        </div>

        <article className="historia" aria-labelledby="h-rede" style={{ marginTop: "1rem" }}>
          <h2 id="h-rede">Quem assina junto com quem</h2>
          <p className="lede">
            {n(unicoAutor)} das {n(total)} proposições ({percent(unicoAutor, total)}%) têm um único vereador como autor. Ainda assim, {paresTodos === possiveis ? "todos os pares de vereadores" : `${paresTodos} dos ${possiveis} pares possíveis`}{" "}
            já assinaram pelo menos uma proposição juntos. Quanto mais grossa a linha, mais proposições em comum.
          </p>
          <Rede nos={d.vereadores.map((v) => ({ slug: v.slug, nome: v.nome, foto: v.foto }))} pares={p.pares} />
        </article>
      </div>

      <section className="section" aria-labelledby="t-vereadores">
        <div className="section-head">
          <h2 id="t-vereadores">Os {nVereadores} vereadores em exercício</h2>
          <Link href="/comparar">Comparar</Link>
        </div>
        <p className="soft" style={{ marginBottom: "1rem" }}>
          Em ordem alfabética. A faixa mostra as proposições de cada um mês a mês, na mesma escala de cada pessoa.
        </p>
        <ul className="cartoes-vereador">
          {d.vereadores.map((v) => {
            const deles = filtrar(d.proposicoes, { autor: v.slug });
            const mensal = porMes(deles, p.listaMeses).map((m) => m.total);
            const tema = porTema(filtrar(deles, { grupo: "pedidos" }), { autor: v.slug, grupo: "pedidos" })[0];
            return (
              <li key={v.slug}>
                <Link href={`/vereadores/${v.slug}`} className="cartao-v">
                  <span className="foto">{v.foto && <Image src={v.foto} alt="" width={136} height={136} />}</span>
                  <span>
                    <span className="nome">{v.nome}</span>
                    <span className="meta">
                      {" "}
                      {v.partido}, {n(deles.length)} proposições{tema ? `, mais sobre ${tema.nome.toLowerCase()}` : ""}
                    </span>
                    <Faisca valores={mensal} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="nota section">
        <strong>Quantidade não é qualidade.</strong> Um único projeto de lei pode exigir meses de trabalho; um pedido pode ser
        repetido até ser atendido. Por isso não há ranking: os números servem para encontrar os documentos, não para dar nota.
        Dados de {dataColeta(d.execucao.coletadoEm)}.
      </p>
      <Fonte d={d} />
    </>
  );
}
