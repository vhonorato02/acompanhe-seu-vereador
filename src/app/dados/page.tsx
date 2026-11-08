import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { dataset } from "@/lib/data/load";
import { dataColeta, n } from "@/lib/format";
import { datasetLd } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Dados abertos",
  description: "Baixe as proposições, normas e vereadores usados pelo portal, em CSV e JSON.",
  alternates: { canonical: "/dados" },
};

export default function Dados() {
  const d = dataset();
  const arquivos = [
    { href: "/dados/proposicoes.csv", nome: "Proposições (CSV)", qtd: d.proposicoes.length },
    { href: "/dados/proposicoes.json", nome: "Proposições (JSON)", qtd: d.proposicoes.length },
    { href: "/dados/normas.csv", nome: "Leis e normas (CSV)", qtd: d.normas.length },
    { href: "/dados/normas.json", nome: "Leis e normas (JSON)", qtd: d.normas.length },
    { href: "/dados/vereadores.json", nome: "Vereadores em exercício (JSON)", qtd: d.vereadores.length },
    { href: "/dados/manifesto.json", nome: "Manifesto da coleta (data, fonte, avisos)", qtd: null },
  ];
  return (
    <div className="prosa">
      <JsonLd dados={datasetLd(d)} />
      <h1>Dados abertos</h1>
      <p>
        Os mesmos dados que o portal mostra, como foram coletados em {dataColeta(d.execucao.coletadoEm)}
        {d.execucao.modo === "amostra" ? " (amostra de desenvolvimento, não a coleta real)" : ""}. Reutilize à vontade, citando a
        fonte original (Câmara Municipal de Pindamonhangaba).
      </p>
      <ul>
        {arquivos.map((a) => (
          <li key={a.href}>
            <a href={a.href} download>
              {a.nome}
            </a>
            {a.qtd !== null && <span className="soft">, {n(a.qtd)} registros</span>}
          </li>
        ))}
      </ul>
      <h2>Dicionário</h2>
      <div style={{ overflowX: "auto" }} tabIndex={0} role="region" aria-label="Dicionário dos campos">
        <table className="tabela">
          <thead>
            <tr>
              <th scope="col">Campo</th>
              <th scope="col">Significado</th>
            </tr>
          </thead>
          <tbody>
            <tr><th scope="row">id</th><td>Número do documento no site da Câmara (vem do link oficial)</td></tr>
            <tr><th scope="row">tipo</th><td>Tipo, como a Câmara o identifica (ex.: Requerimentos)</td></tr>
            <tr><th scope="row">titulo</th><td>Título oficial, com número e ano</td></tr>
            <tr><th scope="row">numero, ano</th><td>Extraídos do título</td></tr>
            <tr><th scope="row">data_publicacao</th><td>Data e hora de publicação no site da Câmara (horário de Brasília)</td></tr>
            <tr><th scope="row">autoria</th><td>Texto de autoria como publicado; vários autores separados por “;”</td></tr>
            <tr><th scope="row">ementa</th><td>Resumo oficial do documento</td></tr>
            <tr><th scope="row">link_oficial</th><td>Página do documento no site da Câmara</td></tr>
          </tbody>
        </table>
      </div>
      <p className="soft">
        Os CSV usam “;” como separador e codificação UTF-8 com BOM, para abrir direto em planilhas configuradas em português. Textos
        que começam com =, +, - ou @ recebem um apóstrofo na frente, para a planilha não executá-los como fórmula.
      </p>
      <h2>Campos extras nos arquivos JSON</h2>
      <div style={{ overflowX: "auto" }} tabIndex={0} role="region" aria-label="Campos extras dos arquivos JSON">
        <table className="tabela">
          <thead>
            <tr>
              <th scope="col">Campo</th>
              <th scope="col">Significado</th>
            </tr>
          </thead>
          <tbody>
            <tr><th scope="row">data</th><td>Mesmo que data_publicacao: “AAAA-MM-DD hh:mm:ss”, horário de Brasília, sem fuso</td></tr>
            <tr><th scope="row">autores</th><td>Lista de autores, separada a partir de “autoria”</td></tr>
            <tr><th scope="row">autoresVereadores</th><td>Endereços (slugs) dos vereadores em exercício encontrados entre os autores</td></tr>
            <tr><th scope="row">autoriaCitadaNaEmenta</th><td>Só em normas. <em>Derivado</em>: vereadores citados na ementa com “de autoria do Vereador…”</td></tr>
            <tr><th scope="row">foto, fotoOrigem</th><td>Só em vereadores: caminho da foto no portal e endereço original no site da Câmara</td></tr>
          </tbody>
        </table>
      </div>
      <p className="soft">
        Assuntos, bairros e destinatários não estão nos arquivos: são classificações automáticas, recalculadas pelas regras públicas
        da <Link href="/metodologia#derivados">metodologia</Link>. O manifesto traz data, modo da coleta, número de consultas e
        avisos; os totais dele são os mesmos mostrados no site.
      </p>
      <h2>Licença e uso</h2>
      <p>
        Os dados são públicos, da Câmara Municipal de Pindamonhangaba. Ao reutilizar, cite a Câmara como fonte e informe a data da
        coleta. Ementas podem citar nomes de cidadãos: use com cuidado e para fins de interesse público.
      </p>
    </div>
  );
}
