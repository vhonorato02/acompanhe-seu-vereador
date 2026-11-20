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
        Este endereço não existe, mudou ou deixou de estar no ar. <Link href="/">Voltar ao início</Link>.
      </p>
      <h2>Principais seções</h2>
      <ul>
        <li><Link href="/vereadores">Vereadores em exercício</Link>: perfis individuais em ordem alfabética</li>
        <li><Link href="/proposicoes">Buscar proposições</Link>: requerimentos, indicações, moções e projetos</li>
        <li><Link href="/bairros">Pedidos por bairro</Link>: ocorrências agrupadas por localidade citada</li>
        <li><Link href="/como-funciona">Como funciona</Link>: competências do Legislativo e glossário técnico</li>
      </ul>
    </div>
  );
}
