// Full-page screenshots of the main pages at 360, 412 and 1440 px, light and dark.
// Usage: node scripts/capturas.mjs [baseURL] [outDir] [routes,comma,separated]
// Needs a running server (npm run build && npx next start -p 3100) or a deployment URL.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3100";
const out = process.argv[3] ?? "e2e-artifacts/capturas-design";
const rotas = (process.argv[4] ?? "/,/vereadores,/vereadores/{primeiro},/bairros,/buscar?q=buraco,/proposicoes,/como-funciona")
  .split(",")
  .filter(Boolean);
const larguras = [
  { nome: "360", width: 360, height: 760, mobile: true },
  { nome: "412", width: 412, height: 915, mobile: true },
  { nome: "1440", width: 1440, height: 900, mobile: false },
];
const temas = ["light", "dark"];

mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
let primeiro = null;
for (const tema of temas) {
  for (const l of larguras) {
    const ctx = await browser.newContext({
      viewport: { width: l.width, height: l.height },
      deviceScaleFactor: 1,
      isMobile: l.mobile,
      hasTouch: l.mobile,
      colorScheme: tema,
      locale: "pt-BR",
    });
    const page = await ctx.newPage();
    // A stale server on the same port serves HTML whose CSS/JS no longer exist: the screenshot
    // looks unstyled but "succeeds". Fail loudly instead.
    const quebrados = [];
    page.on("response", (res) => {
      const tipo = res.request().resourceType();
      if ((tipo === "stylesheet" || tipo === "script") && res.status() >= 400) quebrados.push(`${res.status()} ${res.url()}`);
    });
    for (const r of rotas) {
      let rota = r;
      if (rota.includes("{primeiro}")) {
        if (!primeiro) {
          await page.goto(new URL("/vereadores", base).href, { waitUntil: "networkidle" });
          primeiro = await page.locator('a[href^="/vereadores/"]').first().getAttribute("href");
        }
        rota = primeiro ?? "/vereadores";
      }
      const resposta = await page.goto(new URL(rota, base).href, { waitUntil: "networkidle" });
      if (resposta && resposta.url() !== new URL(rota, base).href) console.warn(`aviso: ${rota} redirecionou para ${resposta.url()}`);
      if (quebrados.length > 0) {
        console.error(`CSS/JS com erro em ${rota} (servidor antigo na porta?): ${quebrados.join(" | ")}`);
        process.exit(1);
      }
      const arquivo = `${out}/${l.nome}-${tema}${rota.replace(/[/?=&]+/g, "_") || "_"}.png`;
      await page.screenshot({ path: arquivo, fullPage: true });
      // Readable slices of the page (two screens each) for review.
      const altura = await page.evaluate(() => document.documentElement.scrollHeight);
      const fatia = l.height * 2;
      for (let y = 0, i = 1; y < altura && i <= 4; y += fatia, i++) {
        await page.screenshot({
          path: arquivo.replace(".png", `-p${i}.png`),
          fullPage: true,
          clip: { x: 0, y, width: l.width, height: Math.min(fatia, altura - y) },
        });
      }
      console.log(arquivo, altura);
    }
    await ctx.close();
  }
}
await browser.close();
