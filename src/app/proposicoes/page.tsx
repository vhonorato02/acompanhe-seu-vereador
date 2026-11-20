import type { Metadata } from "next";
import Link from "next/link";
import { PaginaLista } from "@/components/PaginaLista";
import { dataset } from "@/lib/data/load";

export const metadata: Metadata = {
  title: "Proposições",
  description: "Requerimentos, indicações, moções, emendas e projetos apresentados na Câmara de Pindamonhangaba.",
  alternates: { canonical: "/proposicoes" },
};

export default async function Proposicoes({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const d = dataset();
  return (
    <PaginaLista
      d={d}
      base="/proposicoes"
      titulo="Buscar proposições"
      registros={d.proposicoes}
      grupo="proposicao"
      searchParams={await searchParams}
      intro={
        <p className="soft">
          Pesquise por palavra-chave, bairro, número com ano (ex.: 2398/2026) ou sigla do tipo (<code>req</code> para requerimento,{" "}
          <code>pl</code> para projeto de lei, <code>moção</code>). Inclui iniciativas do Executivo e de comissões.{" "}
          <Link href="/como-funciona#tipos">Tipos de proposição</Link>.
        </p>
      }
    />
  );
}
