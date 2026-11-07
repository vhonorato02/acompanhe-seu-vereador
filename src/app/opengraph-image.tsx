import { ImageResponse } from "next/og";
import { dataset } from "@/lib/data/load";
import { dataColeta, n } from "@/lib/format";
import { SITE } from "@/lib/site";

export const alt = `${SITE.nome}: o que os vereadores de ${SITE.cidade} apresentam na Câmara`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Share preview built from the dataset at build time: name, total and collection date. No photos, no ranking. */
export default function Imagem() {
  const d = dataset();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f3f6f2", color: "#14211b", padding: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <svg width="88" height="88" viewBox="0 0 34 34">
            <rect width="34" height="34" rx="10" fill="#1c6437" />
            <path d="M9 22c0-7 5-11.5 13-12-0.5 8-5 13-12 13z" fill="#8abf42" />
            <circle cx="19.5" cy="15.5" r="5" fill="none" stroke="#f2c230" strokeWidth="2.4" />
            <path d="m23.2 19.2 3.6 3.6" stroke="#f2c230" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: -1 }}>{SITE.nome}</div>
            <div style={{ fontSize: 28, color: "#4d5c53" }}>{`${SITE.cidade} · projeto independente`}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 120, fontWeight: 700, color: "#1c6437", letterSpacing: -3 }}>{n(d.proposicoes.length)}</div>
          <div style={{ fontSize: 40, maxWidth: 980 }}>proposições apresentadas na Câmara desde 2025, cada uma com o documento oficial</div>
        </div>
        <div style={{ fontSize: 24, color: "#4d5c53" }}>
          {`Dados da Câmara Municipal, coletados em ${dataColeta(d.execucao.coletadoEm)} · ${SITE.organizacao}`}
        </div>
      </div>
    ),
    size,
  );
}
