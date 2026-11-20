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
        Não foi possível carregar esta página porque o dispositivo está sem acesso à internet.
      </p>
      <p>
        Por decisão editorial, o portal não exibe cópias antigas em cache como se fossem a coleta atual. Assim que a conexão for
        restabelecida, <a href="">recarregue a página</a>.
      </p>
    </div>
  );
}
