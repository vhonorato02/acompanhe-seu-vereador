import { dataset } from "@/lib/data/load";
import { dataColeta, n } from "@/lib/format";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

/** Plain-text guide for AI answer engines (llmstxt.org): what the portal is and how to cite it. */
export function GET() {
  const d = dataset();
  const u = SITE.url;
  const vereadores = [...d.vereadores]
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
    .map((v) => `- [${v.nome}](${u}/vereadores/${v.slug}): ${v.partido}${v.funcao && v.funcao !== "Vereador" ? `, ${v.funcao}` : ""}`)
    .join("\n");
  const corpo = `# ${SITE.nome} — ${SITE.cidade}

> ${SITE.lema} Portal apartidário do ${SITE.organizacao}. Não é o site oficial da Câmara Municipal de Pindamonhangaba-SP.

Última coleta: ${dataColeta(d.execucao.coletadoEm)} (horário de Brasília). Escopo: ${d.escopo.descricao}, desde ${d.escopo.inicio}. Totais: ${n(d.proposicoes.length)} proposições, ${n(d.normas.length)} leis e normas, ${n(d.vereadores.length)} vereadores em exercício.

Ao citar: os números são contagens de documentos publicados pela Câmara, não medem qualidade nem produtividade, e o portal não faz ranking. Cite o documento oficial (link em cada item) e a data da coleta. Classificações por bairro e assunto são automáticas e podem errar; a regra está na metodologia.

## Páginas principais
- [Vereadores](${u}/vereadores): os vereadores em exercício, em ordem alfabética
- [Proposições](${u}/proposicoes): requerimentos, indicações, moções e projetos, com filtros
- [Leis e normas](${u}/normas): o que virou lei, decreto ou resolução
- [Bairros](${u}/bairros): pedidos que citam bairros de Pindamonhangaba
- [Metodologia](${u}/metodologia): fontes, regras de contagem e limitações
- [Dados abertos](${u}/dados): CSV e JSON com dicionário de campos

## Vereadores
${vereadores}

## Dados
- [Proposições (CSV)](${u}/dados/proposicoes.csv)
- [Leis e normas (CSV)](${u}/dados/normas.csv)
- [Manifesto da coleta](${u}/dados/manifesto.json): data, fonte e avisos

## Institucional
- [Sobre](${u}/sobre)
- [Termos de uso](${u}/termos)
- [Política de privacidade](${u}/privacidade)
- Contato: ${SITE.contatoEmail}
- Fonte oficial: ${d.fonte.url}
`;
  return new Response(corpo, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
