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
  const pico = p.mensal.reduce(
    (a, b) => (b.total > a.total ? b : a),
    p.mensal[0] ?? { mes: "", total: 0, porGrupo: { pedidos: 0, projetos: 0, homenagens: 0, camara: 0 } },
  );
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
        <h1 id="titulo">Acompanhe o que os vereadores apresentam na Câmara</h1>
        <p className="lede">
          Consulte projetos de lei, requerimentos, indicações e moções publicados desde janeiro de 2025, com ligação direta para o
          documento oficial. Dados atualizados em {dataColeta(d.execucao.coletadoEm)}.
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

        <div className="kpi-grade">
          <Link href="/proposicoes" className="kpi-card">
            <span className="kpi-num">{n(total)}</span>
            <span className="kpi-rotulo">Proposições registradas</span>
          </Link>
          <Link href={hrefLista("/proposicoes", { grupo: "projetos" })} className="kpi-card">
            <span className="kpi-num">{n(projetos)}</span>
            <span className="kpi-rotulo">Projetos e propostas normativas</span>
          </Link>
          <Link href="/normas" className="kpi-card">
            <span className="kpi-num">{n(d.normas.length)}</span>
            <span className="kpi-rotulo">Leis e normas publicadas</span>
          </Link>
        </div>
      </section>

      <section className="section" aria-labelledby="t-vereadores">
        <div className="section-head">
          <h2 id="t-vereadores">Os {nVereadores} vereadores em exercício</h2>
          <Link href="/comparar">Comparar</Link>
        </div>
        <ul className="galeria">
          {d.vereadores.map((v, i) => (
            <li key={v.slug}>
              <Rosto v={v} prioridade={i < 6} />
            </li>
          ))}
        </ul>
        <p className="small soft" style={{ marginTop: "1rem" }}>
          Ordem alfabética, sem classificação por desempenho. Retratos oficiais da Câmara Municipal.
        </p>
      </section>

      <section className="banda section" aria-labelledby="t-bairros">
        <div>
          <div className="section-head">
            <h2 id="t-bairros">Pedidos por bairro</h2>
            <Link href="/bairros">Todos os {n(p.bairros.length)}</Link>
          </div>
          <p className="lede" style={{ marginTop: "-0.35rem", marginBottom: "0.85rem" }}>
            Localidades identificadas automaticamente nas ementas (os resumos oficiais) das proposições desta legislatura.
          </p>
          <span className="rotulo-derivado">
            <Icon nome="info" tamanho={14} /> Classificação automática pelo texto da ementa
          </span>
          <Barras
            titulo="Bairros mais citados"
            duasColunas
            itens={p.bairros.slice(0, 8).map((b) => ({ chave: b.slug, nome: b.nome, n: b.n, href: `/bairros/${b.slug}` }))}
          />
        </div>
      </section>

      <section className="section" aria-labelledby="t-numeros">
        <div className="section-head">
          <h2 id="t-numeros">Visão geral da Câmara</h2>
          <Link href="/como-funciona">Como funciona</Link>
        </div>
        <p className="lede" style={{ marginTop: "-0.35rem", marginBottom: "1.25rem" }}>
          Cada número abaixo abre exatamente a lista dos documentos oficiais contabilizados.
        </p>

        <article className="historia" aria-labelledby="h-pedidos">
          <h3 id="h-pedidos">{emDez} em cada 10 proposições são pedidos ao Executivo ou a concessionárias</h3>
          <p className="lede">
            Indicações e requerimentos tratam de solicitações operacionais e pedidos de informação; projetos de lei propõem regras para o
            município e somam {n(projetos)} registros. <Link href="/como-funciona#tipos">Entenda cada tipo</Link>.
          </p>
          <Proporcao
            partes={p.grupos.map((g) => ({ slug: g.slug as "pedidos", nome: g.nome, n: g.n }))}
            href={(slug) => hrefLista("/proposicoes", { grupo: slug })}
          />
        </article>

        <article className="historia" aria-labelledby="h-ritmo">
          <h3 id="h-ritmo">Produção mês a mês</h3>
          <p className="lede">
            O mês com maior volume publicado foi {nomeMes(Number(picoMes), true)} de {picoAno}, com {n(pico.total)} documentos. Selecione uma
            coluna para consultar os itens do período.
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
            <h3 id="h-temas">Assuntos mais frequentes nos pedidos</h3>
            {tema1 && (
              <p className="lede">
                {tema1.nome} aparece em {percent(tema1.n, p.pedidos.length)}% dos {n(p.pedidos.length)} pedidos. Um mesmo documento pode
                tratar de mais de um assunto. <Link href="/metodologia#temas">Critérios de classificação</Link>.
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
              <Icon nome="info" tamanho={14} /> Classificação automática pelo vocativo
            </span>
            <h3 id="h-destinos">Destinatários dos pedidos</h3>
            <p className="lede">
              {percent(prefeitura, totalDestinos)}% dos pedidos são endereçados à Prefeitura; os demais seguem para concessionárias,
              autarquias estaduais e Mesa Diretora. <Link href="/metodologia#destinos">Ver regra aplicada</Link>.
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
              <Icon nome="info" tamanho={14} /> Vínculo pelo número do projeto citado na norma
            </span>
            <h3 id="h-leis">Projetos vinculados a leis publicadas</h3>
            <p className="lede">
              Quando a ementa de uma norma informa o número do projeto de origem, o portal associa os dois registros.{" "}
              <Link href="/normas">Consultar leis e normas</Link>.
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
                  <p className="small soft">citados expressamente como origem de norma publicada ({percent(fVer.viraramLei, fVer.apresentados)}%)</p>
                </div>
              </div>
            )}
            <p className="small soft" style={{ marginTop: "1rem" }}>
              O cálculo não se aplica diretamente aos{" "}
              {fExe ? (
                <Link href={hrefLista("/proposicoes", fExe.filtroApresentados)}>{n(fExe.apresentados)} projetos do Poder Executivo</Link>
              ) : (
                "projetos do Poder Executivo"
              )}
              , pois leis municipais de autoria da Prefeitura em regra não citam o projeto original, e propostas em tramitação permanecem no
              denominador.
            </p>
          </article>

          <article className="historia" aria-labelledby="h-rede">
            <h3 id="h-rede">Coautoria entre vereadores</h3>
            <p className="lede">
              {percent(unicoAutor, total)}% das proposições têm autoria individual. Nos demais casos,{" "}
              {paresTodos === possiveis ? "todos os pares possíveis" : `${paresTodos} dos ${possiveis} pares possíveis`} já assinaram ao menos
              um documento em conjunto.
            </p>
            <Rede nos={d.vereadores.map((v) => ({ slug: v.slug, nome: v.nome, foto: v.foto }))} pares={p.pares} />
          </article>
        </div>

        <p className="nota" style={{ marginTop: "1.25rem" }}>
          <strong>Contexto metodológico:</strong> volume de registros não mede qualidade legislativa. Projetos de lei demandam pareceres e
          votação em plenário, enquanto pedidos operacionais podem ser reiterados diversas vezes. Não elaboramos rankings ou notas
          individuais.
        </p>
      </section>
      <Fonte d={d} />
    </>
  );
}
