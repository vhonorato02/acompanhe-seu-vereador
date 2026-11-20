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
          Bairros identificados automaticamente no texto das proposições apresentadas desde 2025. Selecione um bairro para consultar
          os assuntos frequentes, a autoria dos pedidos e os documentos oficiais relacionados.
        </p>
        <p>
          <span className="rotulo-derivado">
            <Icon nome="info" tamanho={14} /> A Câmara não classifica por bairro: o sistema identifica menções no texto. Listamos apenas
            bairros com pelo menos {MIN_BAIRRO} ocorrências.
          </span>
        </p>
      </div>
      <ListaBairros bairros={p.bairros.map((b) => ({ slug: b.slug, nome: b.nome, n: b.n }))} />
      <Fonte d={p.d} />
    </>
  );
}
