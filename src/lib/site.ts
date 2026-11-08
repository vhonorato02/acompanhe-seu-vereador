/**
 * Project identity in one place. The portal belongs to the Observatório Social do Brasil –
 * Pindamonhangaba: its name, contact and institutional data are edited only here.
 * Sources (07/11/2026): the Observatório's official site (pindamonhangaba.sistemaosb.com.br)
 * and its registration data.
 */
export const SITE = {
  nome: "Acompanhe seu Vereador",
  cidade: "Pindamonhangaba",
  /** One-line promise, used in the header, metadata and share previews. */
  lema: "O que os vereadores de Pindamonhangaba apresentam na Câmara, com o documento oficial de cada item.",
  organizacao: "Observatório Social do Brasil – Pindamonhangaba",
  /** Short form for tight spaces (header, small screens). */
  organizacaoCurta: "Observatório Social de Pindamonhangaba",
  /** Canonical production address. */
  url: "https://acompanhe-seu-vereador.vercel.app",
  repositorio: "https://github.com/vhonorato02/acompanhe-seu-vereador",
  /** Institutional e-mail, published on the Observatório's official site. */
  contatoEmail: "pindamonhangaba@osbrasil.org.br",
  cnpj: "30.197.903/0001-75",
  razaoSocial: "Observatório Social do Brasil – Pindamonhangaba/SP",
  endereco: "Rua Deputado Claro César, 44, sobreloja, Centro, Pindamonhangaba-SP, CEP 12400-220",
  /** Mission as stated by the Observatório. */
  missao: "promover a transparência pública, a eficiência da gestão e o fortalecimento da cidadania ativa",
  osb: {
    site: "https://pindamonhangaba.sistemaosb.com.br",
    doacao: "https://pindamonhangaba.sistemaosb.com.br/doe/",
    privacidade: "https://pindamonhangaba.sistemaosb.com.br/politica-de-privacidade-2/",
    instagram: "https://www.instagram.com/observatoriosocial_pinda/",
    facebook: "https://www.facebook.com/observatoriosocialdepinda/",
    youtube: "https://www.youtube.com/@Observat%C3%B3rioSocialPinda",
    rede: "https://www.osbrasil.org.br",
  },
  /** Date the current terms and privacy policy took effect (ISO). Bump when either changes. */
  vigenciaPoliticas: "2026-11-08",
} as const;

export const URL_REPORTAR_ERRO = `${SITE.repositorio}/issues/new?template=erro-nos-dados.yml`;

/** Honest user agent for the collector: names the project and where to reach it. */
export const USER_AGENT_COLETOR = `AcompanheSeuVereador/1.1 (Observatorio Social do Brasil - Pindamonhangaba; ${SITE.contatoEmail}; +${SITE.repositorio})`;
