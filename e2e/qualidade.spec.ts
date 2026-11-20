import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const ROTAS = [
  "/", "/vereadores", "/vereadores/marco-mayor", "/comparar?v=marco-mayor&v=ana-paula-goffi", "/bairros", "/proposicoes",
  "/proposicoes?q=sabesp", "/normas", "/metodologia", "/como-funciona", "/dados", "/correcoes", "/sobre", "/privacidade", "/termos",
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

  test("fotos oficiais dos vereadores são exibidas em cores originais (sem filtro cinza)", async ({ page, request }) => {
    await page.goto("/");
    const folhas = await page.locator('link[rel="stylesheet"]').evaluateAll((els) =>
      els.map((e) => e.getAttribute("href")).filter((h): h is string => Boolean(h)),
    );
    expect(folhas.length).toBeGreaterThan(0);
    for (const href of folhas) {
      const css = await (await request.get(href)).text();
      expect(css).not.toMatch(/grayscale\s*\(/i);
    }
    const imgsHome = page.locator(".rosto-foto img");
    if ((await imgsHome.count()) > 0) {
      expect(await imgsHome.first().evaluate((img) => getComputedStyle(img).filter)).toBe("none");
    }
    await page.goto("/vereadores/marco-mayor");
    const imgsPerfil = page.locator(".perfil-foto img");
    if ((await imgsPerfil.count()) > 0) {
      expect(await imgsPerfil.first().evaluate((img) => getComputedStyle(img).filter)).toBe("none");
    }
  });

  test("menu do aplicativo configura tema (Claro, Escuro, Automático) com contraste AA e fecha com Esc @cross", async ({ page }, info) => {
    await page.goto("/");
    const abrirMenu = async () => {
      const mobileBtn = page.getByRole("button", { name: "Mais" });
      if (await mobileBtn.isVisible()) {
        await mobileBtn.click();
      } else {
        await page.getByRole("button", { name: "Menu" }).click();
      }
      await expect(page.locator("dialog.sheet[open]")).toBeVisible();
    };

    await abrirMenu();
    const dlg = page.locator("dialog.sheet");
    await expect(dlg.getByRole("link", { name: "Comparar vereadores" })).toHaveAttribute("href", "/comparar");
    await expect(dlg.getByRole("link", { name: "Leis e normas" })).toHaveAttribute("href", "/normas");
    await expect(dlg.getByRole("link", { name: "Metodologia e limites" })).toHaveAttribute("href", "/metodologia");

    await dlg.getByRole("button", { name: "Escuro" }).click();
    await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute("content", "dark");
    expect(await page.evaluate(() => localStorage.getItem("asv-tema"))).toBe("dark");
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(11, 14, 10)");
    await page.waitForTimeout(280);
    await page.screenshot({ path: `e2e-artifacts/capturas/${info.project.name}-menu-dark.png` });
    const axeDark = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    expect(axeDark.violations, axeDark.violations.map((v) => v.id).join(", ")).toEqual([]);

    await page.reload();
    await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute("content", "dark");
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(11, 14, 10)");

    await abrirMenu();
    await dlg.getByRole("button", { name: "Claro" }).click();
    await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute("content", "light");
    expect(await page.evaluate(() => localStorage.getItem("asv-tema"))).toBe("light");
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(246, 247, 243)");
    await page.waitForTimeout(280);
    await page.screenshot({ path: `e2e-artifacts/capturas/${info.project.name}-menu-light.png` });
    const axeLight = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    expect(axeLight.violations, axeLight.violations.map((v) => v.id).join(", ")).toEqual([]);

    await dlg.getByRole("button", { name: "Automático" }).click();
    await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute("content", "light dark");
    expect(await page.evaluate(() => localStorage.getItem("asv-tema"))).toBeNull();

    await page.keyboard.press("Escape");
    await expect(page.locator("dialog.sheet[open]")).toHaveCount(0);
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
    expect(await page.locator('meta[name="color-scheme"]').getAttribute("content")).toBe("light dark");
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

  test("dados estruturados (JSON-LD) e llms.txt", async ({ page, request }) => {
    const blocosDe = async (rota: string) => {
      await page.goto(rota);
      const blocos = await page.locator('script[type="application/ld+json"]').allTextContents();
      return blocos.flatMap((b) => [JSON.parse(b)].flat() as Array<Record<string, unknown>>);
    };
    const tipos = async (rota: string) => (await blocosDe(rota)).map((x) => String(x["@type"] ?? ""));
    const inicio = await blocosDe("/");
    expect(inicio.map((x) => x["@type"])).toEqual(expect.arrayContaining(["NGO", "WebSite"]));
    const site = inicio.find((x) => x["@type"] === "WebSite");
    expect(site?.potentialAction).toMatchObject({ "@type": "SearchAction" });
    expect(await tipos("/dados")).toContain("Dataset");
    expect(await tipos("/vereadores/marco-mayor")).toEqual(expect.arrayContaining(["Person", "BreadcrumbList"]));
    expect(await tipos("/bairros/araretama")).toContain("BreadcrumbList");
    const llms = await request.get("/llms.txt");
    expect(llms.status()).toBe(200);
    const texto = await llms.text();
    expect(texto).toContain("# Acompanhe seu Vereador");
    expect(texto).toContain("/vereadores/marco-mayor");
    expect(texto).toMatch(/não faz ranking/);
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

  test("endpoints de API expõem noindex e política de cache sem segredos", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    expect(res.headers()["cache-control"]).toContain("no-store");
    expect(res.headers()["x-robots-tag"]).toBe("noindex, nofollow");
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.ok).toBe(true);
    expect(typeof body.versao).toBe("string");
    expect(typeof body.sha).toBe("string");
    expect(String(body.sha).length).toBeGreaterThan(0);
    expect(typeof body.coletadoEm).toBe("string");
    expect(Number(body.proposicoes)).toBeGreaterThan(0);

    const busca = await request.get("/api/busca?q=rua");
    expect(busca.status()).toBe(200);
    expect(busca.headers()["cache-control"]).toContain("no-store");
    expect(busca.headers()["x-robots-tag"]).toBe("noindex, nofollow");
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
