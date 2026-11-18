import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false },
};

export default function NaoEncontrado() {
  return (
    <div className="prosa">
      <h1>Página não encontrada</h1>
      <p className="lede">
        Este endereço não existe ou deixou de existir no portal. <Link href="/">Voltar ao início</Link>.
      </p>
      <h2>Atalhos úteis</h2>
      <ul>
        <li><Link href="/vereadores">Vereadores em exercício</Link></li>
        <li><Link href="/proposicoes">Buscar proposições</Link></li>
        <li><Link href="/bairros">O que pediram para o seu bairro</Link></li>
      </ul>
    </div>
  );
}
