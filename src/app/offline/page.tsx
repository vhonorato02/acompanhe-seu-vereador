import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sem conexão",
  robots: { index: false },
};

/**
 * Shown by the service worker when a page cannot be fetched. It deliberately shows no data:
 * the portal never displays a stored copy as if it were the current collection (ADR 0004).
 */
export default function Offline() {
  return (
    <div className="prosa">
      <h1>Sem conexão</h1>
      <p className="lede">
        Não foi possível carregar esta página. O portal só mostra dados buscados na hora, para nunca exibir uma coleta antiga como
        se fosse atual.
      </p>
      <p>
        Confira a internet do aparelho e <a href="">tente de novo</a>.
      </p>
    </div>
  );
}
