import Link from "next/link";
import { dataColeta } from "@/lib/format";
import type { Dataset } from "@/lib/data/types";

/** Provenance block shown at the end of every data page. */
export function Fonte({ d }: { d: Dataset }) {
  return (
    <aside className="fonte" aria-label="Fonte dos dados">
      <p>
        Fonte: <a href={d.fonte.url}>{d.fonte.nome}</a>, coletado em {dataColeta(d.execucao.coletadoEm)}. Período: {d.escopo.descricao}.
      </p>
      <p>
        <Link href="/metodologia">Como contamos</Link>, <Link href="/dados">baixar os dados</Link> ou{" "}
        <Link href="/correcoes">avisar de um erro</Link>.
      </p>
      {d.execucao.modo === "amostra" && (
        <p className="nota aviso" style={{ marginTop: "0.75rem" }}>
          Versão de desenvolvimento com amostra dos dados, não a coleta completa.
        </p>
      )}
    </aside>
  );
}
