import { dataset } from "@/lib/data/load";
import { dataColeta, dataLonga, n } from "@/lib/format";
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

Última coleta: ${dataColeta(d.execucao.coletadoEm)} (horário de Brasília). Escopo: ${d.escopo.descricao}, desde ${dataLonga(d.escopo.inicio)}. Totais: ${n(d.proposicoes.length)} proposições, ${n(d.normas.length)} leis e normas, ${n(d.vereadores.length)} vereadores em exercício.

Ao citar: os números são contagens de documentos publicados pela Câmara via API oficial de Dados Abertos (canal eletrônico oficial), não medem qualidade nem produtividade, e o portal não faz ranking. Todos os retratos oficiais são exibidos em suas cores originais e em ordem alfabética. Cite sempre o documento oficial (link em cada item) e a data da coleta. Classificações por bairro, assunto, destinatário e vínculo projeto-lei são automáticas e podem errar; todas as regras estão detalhadas na metodologia.

## Páginas principais
- [Vereadores](${u}/vereadores): os vereadores em exercício, em ordem alfabética
- [Comparar vereadores](${u}/comparar): comparação lado a lado de até três vereadores na mesma escala
- [Proposições](${u}/proposicoes): requerimentos, indicações, moções e projetos, com filtros combináveis
- [Leis e normas](${u}/normas): o que virou lei, decreto ou resolução
- [Bairros](${u}/bairros): pedidos que citam bairros de Pindamonhangaba no texto da ementa
- [Como funciona](${u}/como-funciona): papel dos vereadores × prefeito, glossário simples (incluindo API e ementa), tipos de proposição e limites
- [Metodologia](${u}/metodologia): origem na API oficial, regras de contagem, falsos positivos bloqueados e limitações
- [Dados abertos](${u}/dados): arquivos CSV (Excel) e JSON com dicionário completo e exemplos reais
- [Correções](${u}/correcoes): como apontar erros nos dados ou pedir revisão com resposta em até 15 dias

## Vereadores
${vereadores}

## Dados
- [Proposições (CSV)](${u}/dados/proposicoes.csv)
- [Proposições (JSON)](${u}/dados/proposicoes.json)
- [Leis e normas (CSV)](${u}/dados/normas.csv)
- [Leis e normas (JSON)](${u}/dados/normas.json)
- [Vereadores em exercício (JSON)](${u}/dados/vereadores.json)
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
