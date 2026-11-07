import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import type { Vereador } from "@/lib/data/types";

/** Councillor card. The photo morphs into the profile header (shared-element transition). */
export function Rosto({ v, prioridade = false }: { v: Vereador; prioridade?: boolean }) {
  const papel = v.funcao && v.funcao !== "Vereador" ? v.funcao : null;
  return (
    <Link href={`/vereadores/${v.slug}`} className="rosto">
      <ViewTransition name={`foto-${v.slug}`}>
        <div className="rosto-foto">
          {v.foto ? (
            <Image src={v.foto} alt="" fill sizes="(min-width: 52rem) 8rem, 30vw" priority={prioridade} />
          ) : null}
        </div>
      </ViewTransition>
      <div className="rosto-nome">{v.nome}</div>
      <div className="rosto-partido">
        {v.partido}
        {papel ? `, ${papel.toLowerCase()}` : ""}
      </div>
    </Link>
  );
}

export function Avatar({ v, tamanho = 28 }: { v: Pick<Vereador, "nome" | "foto">; tamanho?: number }) {
  if (!v.foto) {
    const iniciais = v.nome
      .split(/\s+/)
      .filter((p) => /^\p{Lu}/u.test(p))
      .slice(0, 2)
      .map((p) => p[0])
      .join("");
    return (
      <span className="avatar" style={{ width: tamanho, height: tamanho, display: "inline-grid", placeItems: "center", fontSize: tamanho * 0.36, fontWeight: 750 }} aria-hidden="true">
        {iniciais}
      </span>
    );
  }
  return <Image className="avatar" src={v.foto} alt="" width={tamanho} height={tamanho} style={{ width: tamanho, height: tamanho }} />;
}
