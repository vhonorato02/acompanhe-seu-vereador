import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const ROTAS = [
  "/", "/vereadores", "/vereadores/marco-mayor", "/comparar?v=marco-mayor&v=ana-paula-goffi", "/bairros", "/proposicoes",
  "/proposicoes?q=sabesp", "/normas", "/metodologia", "/como-funciona", "/dados", "/correcoes", "/sobre",
];

test.describe("acessibilidade (axe, WCAG 2.2 A/AA)", () => {
  for (const rota of ROTAS) {
    for (const esquema of ["light", "dark"] as const) {
      test(`${rota} em tema ${esquema} @cross`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: esquema });
        await page.goto(rota);
        // Open collapsed regions so their content is checked too.
        for (const d of await page.locator("details").all()) await d.evaluate((el) => ((el as HTMLDetailsElement).open = true));
        const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
        const resumo = r.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
        expect(resumo, resumo.join("\n")).toEqual([]);
      });
    }
  }

  test("teclado: o link de pular vai para o conteúdo e o foco é visível", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const pular = page.getByRole("link", { name: "Pular para o conteúdo" });
    await expect(pular).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#conteudo")).toBeFocused();
    await page.keyboard.press("Tab");
    // The ring is on the element itself or, for the search input, on its field wrapper.
    const outline = await page.evaluate(() => {
      const el = document.activeElement as Element;
      return getComputedStyle(el.closest(".busca-campo") ?? el).outlineStyle;
    });
    expect(outline).not.toBe("none");
  });

  test("um único h1 por página e títulos sem saltos", async ({ page }) => {
    for (const rota of ROTAS) {
      await page.goto(rota);
      await expect(page.locator("h1"), rota).toHaveCount(1);
      const niveis = await page.locator("main h1, main h2, main h3, main h4").evaluateAll((hs) => hs.map((h) => Number(h.tagName[1])));
      for (let i = 1; i < niveis.length; i++) expect(niveis[i]! - niveis[i - 1]!, `${rota}: ${niveis.join(",")}`).toBeLessThanOrEqual(1);
    }
  });

  test("zoom de 200%: sem rolagem horizontal", async ({ page }) => {
    for (const rota of ["/", "/vereadores/marco-mayor", "/proposicoes", "/comparar?v=marco-mayor&v=ana-paula-goffi"]) {
      await page.goto(rota);
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
      const sobra = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(sobra, rota).toBeLessThanOrEqual(1);
    }
  });
});

test.describe("SEO, compartilhamento e cabeçalhos", () => {
  test("metadados por rota, canonical absoluto e imagem de compartilhamento", async ({ page, request }) => {
    const titulos = new Set<string>();
    for (const rota of ["/", "/vereadores", "/vereadores/marco-mayor", "/bairros", "/metodologia", "/dados"]) {
      await page.goto(rota);
      const titulo = await page.title();
      expect(titulo).toContain("Acompanhe seu Vereador");
      titulos.add(titulo);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(canonical, rota).toBe(`https://acompanhe-seu-vereador.vercel.app${rota === "/" ? "" : rota}`);
      expect(await page.locator('meta[name="description"]').getAttribute("content")).toBeTruthy();
      expect(await page.locator('meta[property="og:image"]').first().getAttribute("content")).toMatch(/^https:\/\//);
    }
    expect(titulos.size).toBe(6);
    const og = await request.get("/opengraph-image");
    expect(og.headers()["content-type"]).toContain("image/png");
  });

  test("robots, sitemap e manifest", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Sitemap: https://acompanhe-seu-vereador.vercel.app/sitemap.xml");
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("<loc>https://acompanhe-seu-vereador.vercel.app/vereadores/marco-mayor</loc>");
    expect(sitemap).not.toContain("/api/");
    const manifest = (await (await request.get("/manifest.webmanifest")).json()) as { name: string; icons: Array<{ src: string; purpose?: string }> };
    expect(manifest.name).toContain("Acompanhe seu Vereador");
    for (const i of manifest.icons) expect((await request.get(i.src)).status(), i.src).toBe(200);
    expect(manifest.icons.some((i) => i.purpose === "maskable")).toBe(true);
  });

  test("cabeçalhos de segurança e página sem erros no console @cross", async ({ page }) => {
    const erros: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") erros.push(m.text());
    });
    page.on("pageerror", (e) => erros.push(e.message));
    const r = await page.goto("/vereadores/marco-mayor");
    const h = r!.headers();
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["strict-transport-security"]).toContain("max-age");
    expect(h["x-powered-by"]).toBeUndefined();
    await page.goto("/");
    await page.getByRole("searchbox").first().fill("rua");
    await page.waitForTimeout(600);
    expect(erros).toEqual([]);
  });
});

test.describe("capturas por viewport", () => {
  for (const rota of ["/", "/vereadores/marco-mayor", "/comparar?v=marco-mayor&v=ana-paula-goffi", "/bairros", "/proposicoes?bairro=araretama", "/metodologia"]) {
    test(`captura ${rota}`, async ({ page }, info) => {
      for (const esquema of ["light", "dark"] as const) {
        await page.emulateMedia({ colorScheme: esquema, reducedMotion: "reduce" });
        await page.goto(rota);
        await page.waitForLoadState("networkidle");
        const sobra = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(sobra, `${rota} transborda na horizontal`).toBeLessThanOrEqual(1);
        const nome = `${info.project.name}-${esquema}-${rota.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "inicio"}.png`;
        await page.screenshot({ path: `e2e-artifacts/capturas/${nome}`, fullPage: true });
      }
    });
  }
});
