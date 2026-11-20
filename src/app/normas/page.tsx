import type { Metadata } from "next";
import Link from "next/link";
import { PaginaLista } from "@/components/PaginaLista";
import { dataset } from "@/lib/data/load";

export const metadata: Metadata = {
  title: "Leis e normas",
  description: "Leis, resoluções e decretos legislativos publicados pela Câmara de Pindamonhangaba nesta legislatura.",
  alternates: { canonical: "/normas" },
};

export default async function Normas({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const d = dataset();
  return (
    <PaginaLista
      d={d}
      base="/normas"
      titulo="Leis e normas"
      registros={d.normas}
      grupo="norma"
      searchParams={await searchParams}
      intro={
        <p className="soft">
          Leis ordinárias, leis complementares, resoluções e decretos legislativos publicados desde 2025. Quando a ementa menciona o projeto
          de origem (como “Projeto de Lei nº 148/2026”), o vínculo aparece também no perfil parlamentar de seus autores.{" "}
          <Link href="/metodologia#leis">Critério de vínculo</Link>.
        </p>
      }
    />
  );
}
