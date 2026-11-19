import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { dataset } from "@/lib/data/load";
import { dataColeta, n } from "@/lib/format";
import { datasetLd } from "@/lib/seo/jsonld";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Dados abertos",
  description:
    "Baixe todos os dados usados pelo portal em planilhas CSV (Excel) ou JSON, entenda cada coluna com exemplos reais e veja como citar.",
  alternates: { canonical: "/dados" },
};

export default function Dados() {
  const d = dataset();
  const arquivos = [
    {
      href: "/dados/proposicoes.csv",
      nome: "Proposições (CSV — para Excel e planilhas)",
      desc: "Tabela pronta com requerimentos, indicações, moções e projetos desde 2025.",
      qtd: d.proposicoes.length,
    },
    {
      href: "/dados/proposicoes.json",
      nome: "Proposições (JSON — para programação)",
      desc: "Mesma lista com autores separados e lista de vereadores identificados.",
      qtd: d.proposicoes.length,
    },
    {
      href: "/dados/normas.csv",
      nome: "Leis e normas (CSV — para Excel e planilhas)",
      desc: "Leis ordinárias, complementares, resoluções e decretos legislativos da legislatura.",
      qtd: d.normas.length,
    },
    {
      href: "/dados/normas.json",
      nome: "Leis e normas (JSON — para programação)",
      desc: "Inclui quais vereadores são citados na ementa da lei como autores do projeto.",
      qtd: d.normas.length,
    },
    {
      href: "/dados/vereadores.json",
      nome: "Vereadores em exercício (JSON)",
      desc: "Cadastro oficial dos parlamentares ativos, partido, cargo na Mesa e link da foto.",
      qtd: d.vereadores.length,
    },
    {
      href: "/dados/manifesto.json",
      nome: "Manifesto da coleta (JSON — ficha técnica)",
      desc: "Data e hora da coleta, modo (incremental ou completa), avisos e totais exatos.",
      qtd: null,
    },
  ];

  return (
    <div className="prosa">
      <JsonLd dados={datasetLd(d)} />
      <h1>Dados abertos</h1>
      <p className="lede">
        Aqui você não precisa acreditar na palavra de ninguém: qualquer morador, jornalista, estudante ou pesquisador pode baixar os
        mesmos arquivos que alimentam todas as páginas do {SITE.nome} e refazer qualquer conta por conta própria.
      </p>
      <p>
        Coleta atual de <strong>{dataColeta(d.execucao.coletadoEm)}</strong>
        {d.execucao.modo === "amostra" ? " (versão de desenvolvimento com amostra reduzida, não a coleta completa)" : ""}. Tudo tem
        origem pública na Câmara Municipal de {SITE.cidade}.
      </p>

      <nav className="sumario" aria-label="Nesta página">
        <p className="sumario-titulo">Nesta página</p>
        <ul>
          <li><a href="#formatos">Qual arquivo baixar (CSV x JSON)</a></li>
          <li><a href="#baixar">Arquivos para download</a></li>
          <li><a href="#dicionario">O que significa cada coluna</a></li>
          <li><a href="#json">Campos extras do JSON</a></li>
          <li><a href="#reuso">Como citar e cuidados</a></li>
        </ul>
      </nav>

      <h2 id="formatos">Qual formato escolher: CSV ou JSON?</h2>
      <p>
        Os dados são oferecidos em dois formatos abertos universais porque atendem públicos diferentes:
      </p>
      <div className="quadro-duplo">
        <section className="quadro-card" aria-labelledby="f-csv">
          <h3 id="f-csv">CSV (para Excel, LibreOffice e Google Planilhas)</h3>
          <p>
            <strong>O que é:</strong> uma tabela de texto simples, separada por ponto e vírgula (<code>;</code>) e gravada com{" "}
            <strong>UTF-8 com BOM</strong> — um marcador técnico que garante que acentos do português (<code>ç</code>,{" "}
            <code>ã</code>, <code>é</code>) abram corretamente ao clicar duas vezes no Microsoft Excel no Brasil.
          </p>
          <p className="small soft">
            Segurança: textos vindos da Câmara que comecem com <code>=</code>, <code>+</code>, <code>-</code> ou <code>@</code>{" "}
            recebem um apóstrofo (<code>&apos;</code>) antes para impedir que o Excel tente executá-los como fórmula.
          </p>
        </section>
        <section className="quadro-card" aria-labelledby="f-json">
          <h3 id="f-json">JSON (para programação, análise de dados e scripts)</h3>
          <p>
            <strong>O que é:</strong> um formato estruturado pensado para linguagens como Python, R e JavaScript, preservando listas
            (como múltiplos autores) sem precisar separar texto manualmente. Inclui também o <strong>manifesto</strong> (a ficha
            técnica com data, origem e total de itens da coleta).
          </p>
        </section>
      </div>

      <h2 id="baixar">Arquivos desta coleta</h2>
      <ul className="verbetes">
        {arquivos.map((a) => (
          <li key={a.href}>
            <h3>
              <a href={a.href} download>
                {a.nome}
              </a>
            </h3>
            <p>
              {a.desc}
              {a.qtd !== null && <span className="soft"> ({n(a.qtd)} registros)</span>}
            </p>
          </li>
        ))}
      </ul>

      <h2 id="dicionario">Dicionário dos campos (o que significa cada coluna)</h2>
      <p>Todas as colunas abaixo aparecem tanto nos arquivos CSV quanto nos arquivos JSON de proposições e normas:</p>
      <div style={{ overflowX: "auto" }} tabIndex={0} role="region" aria-label="Dicionário dos campos">
        <table className="tabela">
          <thead>
            <tr>
              <th scope="col">Campo</th>
              <th scope="col">Significado</th>
              <th scope="col">Exemplo real</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">id</th>
              <td>Número interno único do documento no sistema da Câmara (extraído do endereço oficial).</td>
              <td><code>135420</code></td>
            </tr>
            <tr>
              <th scope="row">tipo</th>
              <td>Categoria oficial devolvida pela API de Dados Abertos da Câmara (sem acentos).</td>
              <td><code>Requerimentos</code></td>
            </tr>
            <tr>
              <th scope="row">titulo</th>
              <td>Título completo do ato oficial com número e ano.</td>
              <td><code>Requerimento 2398/2026</code></td>
            </tr>
            <tr>
              <th scope="row">numero, ano</th>
              <td>Número sequencial e ano do documento extraídos diretamente do título oficial.</td>
              <td><code>2398</code> / <code>2026</code></td>
            </tr>
            <tr>
              <th scope="row">data_publicacao</th>
              <td>Data e hora da publicação na Câmara, no horário oficial de Brasília.</td>
              <td><code>2026-08-19 14:22:00</code></td>
            </tr>
            <tr>
              <th scope="row">autoria</th>
              <td>Texto bruto de autoria como a Câmara publica; múltiplos autores aparecem separados por “;”.</td>
              <td><code>Marco Mayor; Ana Paula Goffi</code></td>
            </tr>
            <tr>
              <th scope="row">ementa</th>
              <td>Resumo oficial do pedido ou projeto (substituído por nota neutra nos poucos casos omitidos por LGPD).</td>
              <td><code>Solicita reparo na iluminação...</code></td>
            </tr>
            <tr>
              <th scope="row">link_oficial</th>
              <td>Endereço direto da ficha oficial do documento no portal da Câmara Municipal.</td>
              <td><code>https://pindamonhangaba.sp.leg.br/...</code></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="json">Campos extras exclusivos dos arquivos JSON</h2>
      <div style={{ overflowX: "auto" }} tabIndex={0} role="region" aria-label="Campos extras dos arquivos JSON">
        <table className="tabela">
          <thead>
            <tr>
              <th scope="col">Campo</th>
              <th scope="col">Significado em português simples</th>
              <th scope="col">Exemplo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">data</th>
              <td>Mesmo valor de <code>data_publicacao</code>: data e hora de Brasília no padrão AAAA-MM-DD.</td>
              <td><code>2026-08-19 14:22:00</code></td>
            </tr>
            <tr>
              <th scope="row">autores</th>
              <td>Lista já quebrada a partir de <code>autoria</code> para evitar erros com ponto e vírgula.</td>
              <td><code>[&quot;Marco Mayor&quot;]</code></td>
            </tr>
            <tr>
              <th scope="row">autoresVereadores</th>
              <td>
                Identificadores de endereço (chamados de <em>slugs</em> — nomes padronizados sem acentos nem espaços) dos vereadores
                em exercício encontrados entre os autores.
              </td>
              <td><code>[&quot;marco-mayor&quot;]</code></td>
            </tr>
            <tr>
              <th scope="row">autoriaCitadaNaEmenta</th>
              <td>
                Apenas em normas. <em>Campo derivado</em>: vereadores cujo nome aparece no texto oficial da lei com a fórmula “de
                autoria do Vereador…”.
              </td>
              <td><code>[&quot;carlos-moura&quot;]</code></td>
            </tr>
            <tr>
              <th scope="row">foto, fotoOrigem</th>
              <td>Apenas em <code>vereadores.json</code>: arquivo de imagem salvo neste portal e link original na Câmara.</td>
              <td><code>/fotos/marco-mayor.jpg</code></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="small soft">
        <strong>Onde ficam assuntos, bairros e destinatários?</strong> Eles não são salvos dentro dos arquivos para não misturar fato
        oficial com leitura automática. O portal recalcula essas classificações em tempo real usando as regras abertas documentadas em{" "}
        <Link href="/metodologia#derivados">Metodologia</Link>.
      </p>

      <h2 id="reuso">Como citar a fonte e cuidados legais</h2>
      <p>
        Os dados brutos pertencem à esfera pública (Câmara Municipal de {SITE.cidade}) e podem ser reutilizados livremente, inclusive
        para pesquisas acadêmicas, reportagens jornalísticas ou outros aplicativos cívicos. Ao publicar qualquer trabalho com eles:
      </p>
      <div className="exemplo">
        <p>
          <strong>Sugestão pronta de crédito:</strong>{" "}
          <em>
            Fonte: Câmara Municipal de {SITE.cidade} (API de Dados Abertos), organizado por {SITE.nome} ({SITE.organizacao}), coleta de{" "}
            {dataColeta(d.execucao.coletadoEm)}.
          </em>
        </p>
      </div>
      <p className="small soft">
        Atenção à <Link href="/privacidade">LGPD</Link>: ementas de homenagem ou requerimento podem citar nomes de moradores comuns.
        Use com ética, sem tirar o resumo de contexto e respeitando a <Link href="/termos">neutralidade descrita nos termos de uso</Link>.
      </p>
    </div>
  );
}
