import type { Metadata } from "next";
import Link from "next/link";
import { SITE, URL_REPORTAR_ERRO } from "@/lib/site";

export const metadata: Metadata = {
  title: "Correções",
  description: `Como avisar de um erro no ${SITE.nome} e como as correções são registradas.`,
  alternates: { canonical: "/correcoes" },
};

const CORRECOES = `${SITE.repositorio}/issues?q=label%3Acorre%C3%A7%C3%A3o`;

export default function Correcoes() {
  return (
    <div className="prosa">
      <h1>Viu um erro? Avise.</h1>
      <p className="lede">
        O portal pode errar: a Câmara pode corrigir um documento, uma classificação automática pode ler um texto do jeito errado ou
        um nome pode estar escrito de outro modo. Cada aviso é conferido contra o documento oficial.
      </p>

      <h2>O que ajuda a conferir</h2>
      <ul>
        <li>O endereço da página do portal onde está o erro (copie da barra do navegador).</li>
        <li>O que está errado e o que deveria aparecer.</li>
        <li>Se possível, o link do documento oficial no site da Câmara que mostra o dado certo.</li>
      </ul>

      <h2>Como avisar</h2>
      <ul>
        <li>
          <a href={URL_REPORTAR_ERRO}>Abrir um aviso no GitHub</a>. O formulário já vem com os campos acima. Exige uma conta gratuita
          no GitHub, e o aviso fica público.
        </li>
        {SITE.contatoEmail ? (
          <li>
            Sem conta no GitHub: escreva para <a href={`mailto:${SITE.contatoEmail}`}>{SITE.contatoEmail}</a>.
          </li>
        ) : (
          <li>
            Sem conta no GitHub: procure o {SITE.organizacao} pelos canais dele. Um endereço de contato direto será publicado aqui
            assim que for confirmado pelo Observatório.
          </li>
        )}
      </ul>
      <p className="nota">
        Não envie dados pessoais seus ou de terceiros além do necessário para localizar o erro.
      </p>

      <h2>O que acontece depois</h2>
      <ul>
        <li>
          <strong>Erro do portal</strong> (contagem, classificação, nome): é corrigido no código, com um teste para não voltar, e
          vale a partir da próxima atualização.
        </li>
        <li>
          <strong>Erro na fonte</strong> (dado errado no site da Câmara): o portal não altera o dado oficial. O aviso é encaminhado à
          Câmara e fica registrado.
        </li>
        <li>
          Correções não apagam o histórico: ficam na <a href={CORRECOES}>lista pública de correções</a> e no histórico do código. A{" "}
          <Link href="/metodologia">metodologia</Link> é atualizada quando a regra muda.
        </li>
      </ul>
    </div>
  );
}
