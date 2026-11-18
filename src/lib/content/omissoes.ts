/**
 * Summaries withheld at the request of a private person named in them (LGPD, art. 18).
 *
 * The record stays listed (type, number, date, authorship and the link to the official
 * document), so counts and provenance do not change; only the summary text is replaced on the
 * site, in the open data and in the VPS copy. Public agents acting in office are not withheld.
 *
 * Each entry: `chave` = "<tipo>:<id>" (id = number in the official link), the date the request was
 * accepted and an internal reference (e-mail or ticket id). Never write the person's name here:
 * this file is public.
 */
export interface Omissao {
  chave: string;
  desde: string;
  referencia: string;
}

export const OMISSOES: readonly Omissao[] = [
  { chave: "Requerimentos:130774", desde: "2026-11-18", referencia: "auditoria-lgpd-saude" },
  { chave: "Requerimentos:132682", desde: "2026-11-18", referencia: "auditoria-lgpd-saude" },
  { chave: "Requerimentos:134695", desde: "2026-11-18", referencia: "auditoria-lgpd-saude" },
];

export const TEXTO_OMITIDO =
  "Ementa omitida neste portal para proteção de dados pessoais (LGPD). O documento oficial continua disponível no site da Câmara.";

export const CHAVES_OMITIDAS: ReadonlySet<string> = new Set(OMISSOES.map((o) => o.chave));
