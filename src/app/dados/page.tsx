import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { dataset } from "@/lib/data/load";
import { dataColeta, n } from "@/lib/format";
import { datasetLd } from "@/lib/seo/jsonld";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Dados abertos",
  description: "Download completo das tabelas em CSV e JSON usadas pelo Acompanhe seu Vereador, com dicionário de campos e critérios de citação.",
  alternates: { canonical: "/dados" },
};

export default function Dados() {
  const d = dataset();
  const arquivos = [
    {
      href: "/dados/proposicoes.csv",
      nome: "Proposições (CSV para planilhas)",
      desc: "Requerimentos, indicações, moções e projetos desde 2025 em formato tabular.",
      qtd: d.proposicoes.length,
    },
    {
      href: "/dados/proposicoes.json",
      nome: "Proposições (JSON estruturado)",
      desc: "Mesmos registros com lista de autores e slugs identificados.",
      qtd: d.proposicoes.length,
    },
    {
      href: "/dados/normas.csv",
      nome: "Leis e normas (CSV para planilhas)",
      desc: "Leis ordinárias, complementares, resoluções e decretos legislativos da legislatura.",
      qtd: d.normas.length,
    },
    {
      href: "/dados/normas.json",
      nome: "Leis e normas (JSON estruturado)",
      desc: "Inclui autores citados na ementa como origem da norma.",
      qtd: d.normas.length,
    },
    {
      href: "/dados/vereadores.json",
      nome: "Vereadores em exercício (JSON)",
      desc: "Cadastro de vereadores ativos, partido, função na Mesa e retrato oficial.",
      qtd: d.vereadores.length,
    },
    {
      href: "/dados/manifesto.json",
      nome: "Manifesto da coleta (JSON)",
      desc: "Data e hora da execução, modo de coleta, avisos e totais exatos.",
      qtd: null,
    },
  ];

  return (
    <div className="prosa">
      <JsonLd dados={datasetLd(d)} />
      <h1>Dados abertos</h1>
      <p className="lede">
        Os mesmos arquivos que alimentam todas as páginas do {SITE.nome} ficam disponíveis para download direto, permitindo auditar contagens
        e elaborar análises próprias sobre a Câmara Municipal de {SITE.cidade}.
      </p>
      <p>
        Coleta publicada em <strong>{dataColeta(d.execucao.coletadoEm)}</strong>
        {d.execucao.modo === "amostra" ? " (amostra reduzida de desenvolvimento)" : ""}.
      </p>

      <nav className="sumario" aria-label="Nesta página">
        <p className="sumario-titulo">Nesta página</p>
        <ul>
          <li><a href="#formatos">Formatos (CSV e JSON)</a></li>
          <li><a href="#baixar">Arquivos para download</a></li>
          <li><a href="#dicionario">Dicionário de campos</a></li>
          <li><a href="#json">Campos exclusivos do JSON</a></li>
          <li><a href="#reuso">Como citar a fonte</a></li>
        </ul>
      </nav>

      <h2 id="formatos">Qual formato escolher: CSV ou JSON</h2>
      <div className="quadro-duplo">
        <section className="quadro-card" aria-labelledby="f-csv">
          <h3 id="f-csv">CSV (Excel, LibreOffice e Google Planilhas)</h3>
          <p>
            Tabela delimitada por ponto e vírgula (<code>;</code>) e codificada em <strong>UTF-8 com BOM</strong> para preservar acentos no
            Microsoft Excel sem configuração prévia. Textos iniciados por <code>=</code>, <code>+</code>, <code>-</code> ou <code>@</code>{" "}
            recebem prefixo de segurança (<code>&apos;</code>) contra execução de fórmulas.
          </p>
        </section>
        <section className="quadro-card" aria-labelledby="f-json">
          <h3 id="f-json">JSON (Python, R e scripts)</h3>
          <p>
            Estrutura tipada que preserva listas sem quebra de texto, como múltiplos autores e identificadores normalizados (<code>slugs</code>
            ), acompanhada do arquivo de <strong>manifesto</strong> com metadados técnicos da execução.
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

      <h2 id="dicionario">Dicionário de campos (CSV e JSON)</h2>
      <div className="acordeoes">
        <details className="acordeao" open>
          <summary>Colunas presentes nas tabelas de proposições e normas</summary>
          <div className="acordeao-corpo">
            <div style={{ overflowX: "auto" }} tabIndex={0} role="region" aria-label="Dicionário dos campos">
              <table className="tabela">
                <thead>
                  <tr>
                    <th scope="col">Campo</th>
                    <th scope="col">Significado</th>
                    <th scope="col">Exemplo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">id</th>
                    <td>Identificador único do documento no sistema da Câmara.</td>
                    <td><code>135420</code></td>
                  </tr>
                  <tr>
                    <th scope="row">tipo</th>
                    <td>Categoria oficial retornada pela API de Dados Abertos (sem acentos).</td>
                    <td><code>Requerimentos</code></td>
                  </tr>
                  <tr>
                    <th scope="row">titulo</th>
                    <td>Identificação completa com número e ano oficiais.</td>
                    <td><code>Requerimento 2398/2026</code></td>
                  </tr>
                  <tr>
                    <th scope="row">numero, ano</th>
                    <td>Número sequencial e ano extraídos diretamente do título.</td>
                    <td><code>2398</code> / <code>2026</code></td>
                  </tr>
                  <tr>
                    <th scope="row">data_publicacao</th>
                    <td>Data e hora de publicação na Câmara no fuso de Brasília.</td>
                    <td><code>2026-08-19 14:22:00</code></td>
                  </tr>
                  <tr>
                    <th scope="row">autoria</th>
                    <td>Texto original de autoria publicado na fonte; coautorias vêm separadas por “;”.</td>
                    <td><code>Marco Mayor; Ana Paula Goffi</code></td>
                  </tr>
                  <tr>
                    <th scope="row">ementa</th>
                    <td>Resumo oficial do documento (ou nota neutra nos poucos casos omitidos por LGPD).</td>
                    <td><code>Solicita reparo na iluminação...</code></td>
                  </tr>
                  <tr>
                    <th scope="row">link_oficial</th>
                    <td>Endereço da ficha oficial no portal da Câmara Municipal.</td>
                    <td><code>https://pindamonhangaba.sp.leg.br/...</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </details>
      </div>

      <h2 id="json">Campos exclusivos dos arquivos JSON</h2>
      <div className="acordeoes">
        <details className="acordeao">
          <summary>Propriedades adicionais de autoria, slugs e fotos no JSON</summary>
          <div className="acordeao-corpo">
            <div style={{ overflowX: "auto" }} tabIndex={0} role="region" aria-label="Campos extras dos arquivos JSON">
              <table className="tabela">
                <thead>
                  <tr>
                    <th scope="col">Campo</th>
                    <th scope="col">Significado</th>
                    <th scope="col">Exemplo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">data</th>
                    <td>Mesmo carimbo de data/hora de Brasília no padrão AAAA-MM-DD HH:MM:SS.</td>
                    <td><code>2026-08-19 14:22:00</code></td>
                  </tr>
                  <tr>
                    <th scope="row">autores</th>
                    <td>Lista já separada a partir de <code>autoria</code>.</td>
                    <td><code>[&quot;Marco Mayor&quot;]</code></td>
                  </tr>
                  <tr>
                    <th scope="row">autoresVereadores</th>
                    <td>Identificadores padronizados (<em>slugs</em>) dos vereadores em exercício identificados na autoria.</td>
                    <td><code>[&quot;marco-mayor&quot;]</code></td>
                  </tr>
                  <tr>
                    <th scope="row">autoriaCitadaNaEmenta</th>
                    <td>Presente apenas em normas: vereadores citados na ementa da lei como autores do projeto de origem.</td>
                    <td><code>[&quot;carlos-moura&quot;]</code></td>
                  </tr>
                  <tr>
                    <th scope="row">foto, fotoOrigem</th>
                    <td>Em <code>vereadores.json</code>: arquivo estático servido no portal e URL original da Câmara.</td>
                    <td><code>/fotos/marco-mayor.jpg</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </details>
      </div>
      <p className="small soft">
        Assuntos, bairros e destinatários não são gravados dentro desses arquivos para preservar a separação entre dado oficial e leitura
        automática, cujas regras ficam abertas em <Link href="/metodologia#derivados">Metodologia</Link>.
      </p>

      <h2 id="reuso">Como citar e cuidados legais</h2>
      <p>
        Os dados primários são públicos e livres para pesquisa, jornalismo e aplicações cívicas. Em publicações derivadas, cite a fonte e a data
        da coleta:
      </p>
      <div className="exemplo">
        <p>
          <em>
            Fonte: Câmara Municipal de {SITE.cidade} (API de Dados Abertos), organizado por {SITE.nome} ({SITE.organizacao}), coleta de{" "}
            {dataColeta(d.execucao.coletadoEm)}.
          </em>
        </p>
      </div>
      <p className="small soft">
        Ao tratar ementas que mencionem cidadãos comuns, observe as regras descritas em <Link href="/privacidade">Privacidade</Link> e nos{" "}
        <Link href="/termos">Termos de uso</Link>.
      </p>
    </div>
  );
}
