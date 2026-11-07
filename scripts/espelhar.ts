/**
 * Builds the data for the VPS copy from the canonical site's open data (no Câmara requests).
 * Usage: npm run espelhar            (reads SITE.url)
 *        ESPELHO_ORIGEM=https://... npm run espelhar
 */
import path from "node:path";
import { espelhar } from "../src/lib/espelho/espelhar";
import { SITE } from "../src/lib/site";

espelhar({
  base: process.env.ESPELHO_ORIGEM?.trim() || SITE.url,
  raiz: path.resolve(__dirname, ".."),
  userAgent: `AcompanheSeuVereador-espelho/1.0 (+${SITE.repositorio})`,
}).catch((e: unknown) => {
  console.error(`[espelho] FALHOU: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
