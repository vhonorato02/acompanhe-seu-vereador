"use client";

import { useState } from "react";
import { Icon } from "./Icon";

/** Native share action with clipboard fallback and accessible status feedback. */
export function AcoesPagina({ titulo, texto }: { titulo: string; texto?: string }) {
  const [status, setStatus] = useState<string | null>(null);

  async function compartilhar() {
    const url = window.location.href;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: titulo, text: texto, url });
        setStatus("Compartilhado");
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        setStatus("Link copiado");
        return;
      } catch {
        setStatus("Use a barra do navegador para copiar");
        return;
      }
    }
    setStatus("Use a barra do navegador para copiar");
  }

  return (
    <div className="acoes-pagina">
      <button type="button" className="botao-pill" onClick={() => void compartilhar()}>
        <Icon nome="compartilhar" tamanho={16} />
        Compartilhar
      </button>
      {status && (
        <span className="small soft" role="status" aria-live="polite">
          {status}
        </span>
      )}
    </div>
  );
}
