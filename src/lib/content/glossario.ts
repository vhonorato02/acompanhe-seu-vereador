// Plain-language explanations written by the project, not official definitions.
// Official rules: Regimento Interno da Câmara and Lei Orgânica do Município.

export interface Verbete {
  contract: string;
  curto: string;
  explicacao: string;
}

export const GLOSSARIO: Verbete[] = [
  {
    contract: "Requerimentos",
    curto: "Pede informação oficial ou providência",
    explicacao:
      "Pedido formal de um ou mais vereadores para cobrar esclarecimentos, documentos ou providências da Prefeitura, de secretarias ou de concessionárias (como Sabesp ou EDP). Exemplo: perguntar por que uma obra atrasou ou pedir o contrato de um serviço público. Em geral precisa ser votado ou despachado para seguir ao destinatário.",
  },
  {
    contract: "Indicacoes",
    curto: "Sugestão à Prefeitura, sem força de obrigar",
    explicacao:
      "Sugestão direta do vereador ao Poder Executivo (Prefeitura) para executar uma melhoria ou serviço no dia a dia da cidade — por exemplo, tapar um buraco na rua, trocar uma lâmpada queimada por LED ou podar uma árvore em frente a uma escola. Como é o prefeito quem executa obras e administra o orçamento, a Indicação aponta o problema, mas a Prefeitura não é obrigada por lei a atendê-la.",
  },
  {
    contract: "Mocoes",
    curto: "Homenagem, apoio, pesar ou protesto",
    explicacao:
      "Manifestação pública da Câmara sobre um acontecimento ou pessoa: pode ser Moção de Aplauso (parabenizando atletas, professores ou trabalhadores), de Apoio, de Pesar (solidariedade pelo falecimento de alguém da comunidade) ou de Protesto/Repúdio diante de algo que a Câmara critica. Não cria lei nem obriga a Prefeitura a gastar recursos.",
  },
  {
    contract: "Emendas",
    curto: "Muda um projeto antes da votação final",
    explicacao:
      "Proposta apresentada para alterar, acrescentar ou retirar um trecho de outro projeto que já está tramitando (como mudar um prazo, uma regra ou um valor do orçamento antes de o projeto ir a plenário). Só existe ligada a um projeto em análise e também precisa passar por votação.",
  },
  {
    contract: "Projetos-de-Lei-Ordinaria",
    curto: "Proposta que pode virar lei municipal",
    explicacao:
      "Proposta concreta para criar, mudar ou revogar uma lei do município no dia a dia (regras da cidade, nomes de ruas, programas municipais, obrigações administrativas). Pode ser apresentada por vereadores ou pelo prefeito. Para virar lei de verdade, precisa passar pelas comissões, ser aprovada em votação pelo plenário e depois sancionada pelo prefeito (ou promulgada pela Câmara se o veto for derrubado).",
  },
  {
    contract: "Projetos-de-Lei-Complementar",
    curto: "Lei estrutural que exige mais votos para aprovar",
    explicacao:
      "Proposta de lei sobre temas considerados estruturais pela Lei Orgânica do município (como regras tributárias, zoneamento urbano, plano diretor ou estatuto dos servidores). Por mexer em regras mais profundas, exige quórum maior (voto favorável da maioria absoluta dos vereadores) para ser aprovada.",
  },
  {
    contract: "Projetos-de-Resolucao",
    curto: "Regra interna de funcionamento da Câmara",
    explicacao:
      "Proposta que regula assuntos internos da própria Câmara Municipal — como mudanças no Regimento Interno (as regras das sessões), criação de comissões parlamentares, regras de trabalho dos gabinetes ou organização administrativa do Legislativo.",
  },
  {
    contract: "Projetos-de-Decreto-Legislativo",
    curto: "Decisão da Câmara com efeito externo, como honrarias",
    explicacao:
      "Proposta sobre decisões que cabem exclusivamente à Câmara (sem depender da assinatura do prefeito), mas com efeito fora dela — principalmente a entrega de Títulos de Cidadão Pindamonhangabense, medalhas honoríficas ou a aprovação/rejeição das contas anuais do prefeito após parecer do Tribunal de Contas.",
  },
  {
    contract: "Indicacoes-de-Projetos-de-Lei",
    curto: "Sugere ao prefeito enviar um projeto que só ele pode propor",
    explicacao:
      "Pela Constituição e pela Lei Orgânica, certos temas (como criar cargos na Prefeitura, dar reajuste a servidores municipais ou abrir despesa nova no orçamento) só podem virar projeto de lei por iniciativa do prefeito. Quando um vereador quer defender uma ideia nessa área, ele apresenta uma Indicação de Projeto de Lei sugerindo que a Prefeitura mande esse texto à Câmara.",
  },
  {
    contract: "Vetos",
    curto: "Recusa do prefeito a um projeto aprovado pela Câmara",
    explicacao:
      "Depois que a Câmara aprova um projeto de lei, ele vai para o prefeito decidir se sanciona (assina) ou veta (recusa, no todo ou em parte, por considerar inconstitucional ou contrário ao interesse público). Quando há veto, o texto volta para a Câmara: os vereadores votam para manter a recusa do prefeito ou derrubar o veto e transformar o projeto em lei.",
  },
  {
    contract: "Propostas-de-Emenda-a-Lei-Organica",
    curto: "Muda a 'constituição' do município",
    explicacao:
      "Proposta para alterar a Lei Orgânica de Pindamonhangaba — o conjunto de regras fundamentais que organiza o governo municipal e a própria Câmara, equivalente à constituição da cidade. Por alterar a base das leis locais, passa por dois turnos de votação e exige apoio qualificado dos vereadores.",
  },
];

export function verbete(contract: string): Verbete | undefined {
  return GLOSSARIO.find((v) => v.contract === contract);
}

/** Order used in profiles: the most common instruments of a mandate first, laws next. */
export const ORDEM_TIPOS = [
  "Projetos-de-Lei-Ordinaria",
  "Projetos-de-Lei-Complementar",
  "Emendas",
  "Requerimentos",
  "Indicacoes",
  "Indicacoes-de-Projetos-de-Lei",
  "Mocoes",
  "Projetos-de-Resolucao",
  "Projetos-de-Decreto-Legislativo",
];
