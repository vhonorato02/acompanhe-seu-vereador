/**
 * Project identity in one place. Renaming the portal, moving the address or adding an
 * institutional contact means editing only this file.
 */
export const SITE = {
  nome: "Acompanhe seu Vereador",
  cidade: "Pindamonhangaba",
  /** One-line promise, used in the header, metadata and share previews. */
  lema: "O que os vereadores de Pindamonhangaba apresentam na Câmara, com o documento oficial de cada item.",
  organizacao: "Observatório Social do Brasil – Pindamonhangaba",
  /** Canonical production address (free *.vercel.app subdomain, no purchased domain). */
  url: "https://acompanhe-seu-vereador.vercel.app",
  repositorio: "https://github.com/vhonorato02/acompanhe-seu-vereador",
  /**
   * Institutional e-mail for corrections. Left empty on purpose: the only address found
   * (in a 2021 OSB report) could not be confirmed as active. The owner fills it in.
   */
  contatoEmail: null as string | null,
} as const;

export const URL_REPORTAR_ERRO = `${SITE.repositorio}/issues/new?template=erro-nos-dados.yml`;

/** Honest user agent for the collector: names the project and where to reach it. */
export const USER_AGENT_COLETOR = `AcompanheSeuVereador/1.1 (Observatorio Social do Brasil - Pindamonhangaba; +${SITE.repositorio})`;
