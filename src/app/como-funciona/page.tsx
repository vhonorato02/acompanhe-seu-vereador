import type { Metadata } from "next";
import Link from "next/link";
import { GLOSSARIO } from "@/lib/content/glossario";
import { dataset } from "@/lib/data/load";
import { hrefLista } from "@/lib/data/query";

export const metadata: Metadata = {
  title: "Como funciona",
  description: "A Câmara de Pindamonhangaba em poucas linhas e o que significa cada tipo de proposição.",
  alternates: { canonical: "/como-funciona" },
};

export default function ComoFunciona() {
  const d = dataset();
  const existe = new Set(d.tipos.map((t) => t.contract));
  return (
    <div className="prosa">
      <h1>Como funciona a Câmara</h1>
      <p className="soft" style={{ fontSize: "var(--step-1)" }}>
        A Câmara Municipal de Pindamonhangaba tem {d.vereadores.length} vereadores, eleitos para a legislatura 2025–2028. Eles
        propõem e votam leis municipais, fiscalizam a Prefeitura e fazem pedidos em nome da população.
      </p>
      <p>
        As sessões ordinárias acontecem às terças-feiras, a partir das 17h, segundo a própria Câmara. A Mesa Diretora (presidente,
        vice-presidentes e secretários) conduz os trabalhos.
      </p>

      <h2>Tipos de proposição</h2>
      <div className="nota">
        <p>
          Explicações simplificadas, escritas pelo Observatório. A definição oficial está no Regimento Interno da Câmara e na Lei
          Orgânica do Município.
        </p>
      </div>
      <ul className="verbetes">
        {GLOSSARIO.filter((g) => existe.has(g.contract)).map((g) => (
          <li key={g.contract} id={g.contract}>
            <h3>{d.tipos.find((t) => t.contract === g.contract)?.titulo}</h3>
            <p>{g.explicacao}</p>
            <p>
              <Link href={hrefLista("/proposicoes", { tipo: g.contract })}>Ver as desta legislatura</Link>
            </p>
          </li>
        ))}
      </ul>

      <h2>O que este portal não mostra (ainda)</h2>
      <ul>
        <li>Como cada vereador votou. A API de dados abertos da Câmara não publica votações.</li>
        <li>Presença nas sessões. Também não está na API; fica registrada nas atas, em PDF.</li>
        <li>Tramitação (em que etapa está cada projeto). Consulte o documento oficial pelo link de cada item.</li>
      </ul>
    </div>
  );
}
