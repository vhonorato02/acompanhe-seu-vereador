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
          Procure por palavra, bairro, número (2398/2026) ou tipo (req, pl, moção). Inclui também o que o Poder Executivo e as
          comissões apresentaram. <Link href="/como-funciona">O que é cada tipo</Link>
        </p>
      }
    />
  );
}
