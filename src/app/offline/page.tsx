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
        Não foi possível carregar esta página porque o seu aparelho parece estar sem internet no momento.
      </p>
      <p>
        De propósito, o portal nunca guarda números antigos no celular para fingir que estão atualizados — em acompanhamento público,
        informação desatualizada induz a erro. Assim que a conexão voltar,{" "}
        <a href="">tente recarregar a página</a>.
      </p>
    </div>
  );
}
