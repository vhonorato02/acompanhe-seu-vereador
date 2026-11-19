import type { Metadata } from "next";
import { Fonte } from "@/components/Fonte";
import { Icon } from "@/components/Icon";
import { ListaBairros } from "@/components/ListaBairros";
import { MIN_BAIRRO } from "@/lib/data/analise";
import { panorama } from "@/lib/data/painel";

export const metadata: Metadata = {
  title: "Bairros",
  description: "O que os vereadores de Pindamonhangaba pediram para cada bairro.",
  alternates: { canonical: "/bairros" },
};

export default function Bairros() {
  const p = panorama();
  return (
    <>
      <div className="prosa">
        <h1>O que pediram para o seu bairro</h1>
        <p className="soft">
          Bairros identificados automaticamente no texto das proposições desde 2025. Toque em um bairro para ver os principais
          assuntos, quais vereadores citaram o lugar e a lista completa de documentos oficiais.
        </p>
        <p>
          <span className="rotulo-derivado">
            <Icon nome="info" tamanho={14} /> A Câmara não classifica por bairro: o portal procura “bairro …” no texto. Só aparecem bairros
            citados pelo menos {MIN_BAIRRO} vezes.
          </span>
        </p>
      </div>
      <ListaBairros bairros={p.bairros.map((b) => ({ slug: b.slug, nome: b.nome, n: b.n }))} />
      <Fonte d={p.d} />
    </>
  );
}
