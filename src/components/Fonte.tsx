import Link from "next/link";
import { dataColeta } from "@/lib/format";
import type { Dataset } from "@/lib/data/types";

/** Provenance block shown at the end of every data page. */
export function Fonte({ d }: { d: Dataset }) {
  return (
    <aside className="fonte" aria-label="Fonte dos dados">
      <p>
        Dados públicos obtidos da <a href={d.fonte.url}>{d.fonte.nome}</a>, coletados em {dataColeta(d.execucao.coletadoEm)} ({d.escopo.descricao}).
      </p>
      <p>
        <Link href="/como-funciona">O que significa cada tipo</Link>, <Link href="/metodologia">como contamos</Link>,{" "}
        <Link href="/dados">baixar tabelas abertas</Link> ou <Link href="/correcoes">avisar de um erro</Link>.
      </p>
      {d.execucao.modo === "amostra" && (
        <p className="nota aviso" style={{ marginTop: "0.75rem" }}>
          Versão de desenvolvimento com amostra dos dados, não a coleta completa.
        </p>
      )}
    </aside>
  );
}
