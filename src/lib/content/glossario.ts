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
    curto: "Pedido formal de informação ou providência",
    explicacao:
      "Instrumento pelo qual um ou mais vereadores cobram esclarecimentos oficiais, cópias de contratos ou providências à Prefeitura, às secretarias ou a concessionárias de serviço público (como Sabesp e EDP). Em regra, passa por despacho ou deliberação do plenário antes de seguir ao destinatário.",
  },
  {
    contract: "Indicacoes",
    curto: "Sugestão de serviço ou obra ao Executivo",
    explicacao:
      "Solicitação encaminhada ao prefeito para execução de reparos ou melhorias na cidade, como tapa-buraco, troca de luminária ou poda de árvore. Como a gestão orçamentária e as equipes de rua pertencem ao Poder Executivo, a indicação sinaliza a demanda, mas a Prefeitura não tem obrigação legal de executá-la.",
  },
  {
    contract: "Mocoes",
    curto: "Manifestação pública de aplauso, apoio, pesar ou protesto",
    explicacao:
      "Pronunciamento coletivo da Câmara sobre acontecimentos ou homenagens a cidadãos e entidades: Moção de Aplauso, de Apoio, de Pesar ou de Protesto. Não cria norma jurídica nem autoriza despesa.",
  },
  {
    contract: "Emendas",
    curto: "Proposta de alteração em projeto em análise",
    explicacao:
      "Texto apresentado para modificar, incluir ou suprimir dispositivos de um projeto antes da votação definitiva em plenário (como ajustar prazos, critérios ou dotações do orçamento). Só tramita vinculada ao projeto principal.",
  },
  {
    contract: "Projetos-de-Lei-Ordinaria",
    curto: "Proposta que cria ou altera lei municipal",
    explicacao:
      "Iniciativa destinada a instituir programas, regras urbanas, denominações de vias e normas cotidianas do município. Pode partir de vereadores ou do prefeito e exige parecer das comissões, aprovação em plenário e sanção do Executivo (ou promulgação pela Câmara em caso de derrubada de veto).",
  },
  {
    contract: "Projetos-de-Lei-Complementar",
    curto: "Proposta de lei estrutural com quórum qualificado",
    explicacao:
      "Projeto sobre matérias reservadas pela Lei Orgânica, como código tributário, zoneamento, plano diretor e estatuto dos servidores. Exige maioria absoluta de votos favoráveis dos membros da Câmara para ser aprovado.",
  },
  {
    contract: "Projetos-de-Resolucao",
    curto: "Regra de organização interna da Câmara",
    explicacao:
      "Proposta voltada ao funcionamento administrativo e legislativo da própria Casa, como reformas no Regimento Interno, criação de comissões e normas dos gabinetes.",
  },
  {
    contract: "Projetos-de-Decreto-Legislativo",
    curto: "Decisão exclusiva da Câmara com efeito externo",
    explicacao:
      "Ato de competência privativa do Legislativo que dispensa sanção do prefeito e produz efeitos externos, como concessão de títulos honoríficos e julgamento das contas anuais do Executivo após parecer do Tribunal de Contas.",
  },
  {
    contract: "Indicacoes-de-Projetos-de-Lei",
    curto: "Sugere projeto de iniciativa privativa do prefeito",
    explicacao:
      "Matérias sobre criação de cargos públicos, remuneração de servidores e abertura de crédito orçamentário só podem se tornar projeto de lei por iniciativa do prefeito. Nessas áreas, o vereador protocola uma Indicação de Projeto de Lei sugerindo o envio do texto à Câmara.",
  },
  {
    contract: "Vetos",
    curto: "Recusa total ou parcial do prefeito a projeto aprovado",
    explicacao:
      "Quando o prefeito discorda de um projeto aprovado pela Câmara por inconstitucionalidade ou contrariedade ao interesse público, devolve o texto vetado (no todo ou em parte). O plenário então vota para manter o veto ou rejeitá-lo.",
  },
  {
    contract: "Propostas-de-Emenda-a-Lei-Organica",
    curto: "Altera a norma fundamental do município",
    explicacao:
      "Proposta para modificar a Lei Orgânica de Pindamonhangaba, texto que estrutura os Poderes locais de modo equivalente a uma constituição municipal. Exige votação em dois turnos e apoio qualificado em plenário.",
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
