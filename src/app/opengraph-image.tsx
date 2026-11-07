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
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#ffffff", color: "#1d1d1f", padding: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <svg width="88" height="88" viewBox="0 0 34 34">
            <rect width="34" height="34" rx="8" fill="#1d1d1f" />
            <circle cx="15" cy="15" r="6.5" fill="none" stroke="#ffffff" strokeWidth="2.6" />
            <path d="m20 20 5.5 5.5" stroke="#30d158" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: -1 }}>{SITE.nome}</div>
            <div style={{ fontSize: 28, color: "#6e6e73" }}>{`${SITE.cidade} · ${SITE.organizacao}`}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 120, fontWeight: 700, color: "#0a7d33", letterSpacing: -3 }}>{n(d.proposicoes.length)}</div>
          <div style={{ fontSize: 40, maxWidth: 980 }}>proposições apresentadas na Câmara desde 2025, cada uma com o documento oficial</div>
        </div>
        <div style={{ fontSize: 24, color: "#6e6e73" }}>
          {`Dados da Câmara Municipal de ${SITE.cidade}, coletados em ${dataColeta(d.execucao.coletadoEm)}`}
        </div>
      </div>
    ),
    size,
  );
}
