import { SITE } from "@/lib/site";

/** The Observatório's private contact channel (e-mail), with the subject filled in. */
export function Contato({ assunto }: { assunto: string }) {
  return <a href={`mailto:${SITE.contatoEmail}?subject=${encodeURIComponent(assunto)}`}>{SITE.contatoEmail}</a>;
}
