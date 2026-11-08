import { readFileSync } from "node:fs";
import { join } from "node:path";
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
  // The Observatório's emblem, read at build time (static file in public/).
  const emblema = `data:image/png;base64,${readFileSync(join(process.cwd(), "public/marca/emblema.png")).toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#ffffff", color: "#1d1d1f", padding: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <img src={emblema} width={99} height={96} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: -1 }}>{SITE.nome}</div>
            <div style={{ fontSize: 28, color: "#6e6e73" }}>{`${SITE.cidade} · ${SITE.organizacao}`}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 120, fontWeight: 700, color: "#4a7a1a", letterSpacing: -3 }}>{n(d.proposicoes.length)}</div>
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
