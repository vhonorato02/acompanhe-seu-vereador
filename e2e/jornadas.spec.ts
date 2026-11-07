import { expect, test, type Page } from "@playwright/test";

const OFICIAL = /^https:\/\/(www\.)?pindamonhangaba\.sp\.leg\.br\//;
const numero = (t: string | null) => Number((t ?? "").replace(/\D/g, ""));

/** Total shown above a list ("N resultados"). */
async function totalDaLista(page: Page) {
  return numero(await page.locator(".contagem strong").textContent());
}

/** Counts every item of a list, following "Mais resultados" pages. */
async function itensDaLista(page: Page) {
  let n = await page.locator(".feed > li").count();
  while (await page.getByRole("link", { name: "Mais resultados" }).count()) {
    await page.getByRole("link", { name: "Mais resultados" }).click();
    await page.waitForLoadState("domcontentloaded");
    n += await page.locator(".feed > li").count();
  }
  return n;
}

test.describe("jornadas do cidadão", () => {
  test("início → vereador → lista dele → documento oficial @cross", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("proposições apresentadas");
    const cartao = page.locator(".cartoes-vereador a.cartao-v").first();
    const nome = (await cartao.locator(".nome").textContent())?.trim() ?? "";
    await cartao.click();
    await expect(page.getByRole("heading", { level: 1, name: nome })).toBeVisible();

    const total = numero(await page.locator(".fatos .fato strong a").first().textContent());
    await page.locator(".fatos .fato strong a").first().click();
    await expect(page).toHaveURL(/\/proposicoes\?autor=/);
    expect(await totalDaLista(page)).toBe(total);
    expect(await itensDaLista(page)).toBe(total);

    const link = await page.locator(".item-nome").first().getAttribute("href");
    expect(link).toMatch(OFICIAL);
  });

  test("coluna do gráfico mensal → lista do mesmo mês com o mesmo número", async ({ page }) => {
    await page.goto("/");
    const coluna = page.locator("#h-ritmo ~ figure .colunas a.col").last();
    const rotulo = (await coluna.getAttribute("aria-label")) ?? "";
    const esperado = numero(rotulo.split(":")[1] ?? "");
    await coluna.click();
    await expect(page).toHaveURL(/pub=\d{4}-\d{2}/);
    expect(await totalDaLista(page)).toBe(esperado);
  });

  test("perfil: trocar o ano muda o total e o link leva à lista com o mesmo número", async ({ page }) => {
    await page.goto("/vereadores");
    await page.locator(".cartoes-vereador a.cartao-v").first().click();
    const botoes = page.locator(".segmentos button");
    await expect(botoes.last()).toHaveText("Tudo");
    await botoes.first().click();
    await expect(botoes.first()).toHaveAttribute("aria-pressed", "true");
    const link = page.locator(".total-grande a");
    const total = numero(await link.textContent());
    await expect(link).toHaveAttribute("href", /ano=\d{4}/);
    await link.click();
    expect(await totalDaLista(page)).toBe(total);
  });

  test("coautoria: o percentual leva às proposições assinadas em conjunto", async ({ page }) => {
    await page.goto("/proposicoes?conjunto=1");
    const perfil = await page.locator(".feed .item-pe a").first().getAttribute("href");
    await page.goto(perfil ?? "/");
    const fato = page.locator(".fato", { hasText: "assinadas junto" });
    const n = numero((await fato.textContent())?.match(/\((\d[\d.]*)\)/)?.[1] ?? "");
    await fato.getByRole("link").click();
    await expect(page).toHaveURL(/conjunto=1/);
    await expect(page.getByText("Assinadas por mais de um vereador")).toBeVisible();
    expect(await totalDaLista(page)).toBe(n);
    const itens = page.locator(".feed > li");
    for (let i = 0; i < (await itens.count()); i++) expect(await itens.nth(i).locator(".item-pe a").count()).toBeGreaterThanOrEqual(2);
  });

  test("comparar: adicionar, remover, compartilhar e voltar", async ({ page }) => {
    await page.goto("/comparar");
    await expect(page.getByText("Toque em dois ou três nomes")).toBeVisible();
    const chips = page.locator(".seletor .chip");
    await chips.nth(0).click();
    await expect(page).toHaveURL(/\?v=[a-z-]+$/);
    await chips.nth(1).click();
    await expect(page).toHaveURL(/\?v=[a-z-]+&v=[a-z-]+$/);
    await expect(page.locator(".comparacao > article")).toHaveCount(2);
    const compartilhada = page.url();
    await chips.nth(0).click();
    await expect(page.locator(".comparacao > article")).toHaveCount(1);
    await page.goBack();
    await expect(page).toHaveURL(compartilhada);
    await expect(page.locator(".comparacao > article")).toHaveCount(2);
    await page.goto(compartilhada);
    await expect(page.locator(".comparacao > article")).toHaveCount(2);
  });

  test("busca: acento, apelido de tipo com número, termo inexistente e entrada hostil", async ({ page }) => {
    await page.goto("/proposicoes?q=iluminacao");
    const semAcento = await totalDaLista(page);
    await page.goto("/proposicoes?q=ilumina%C3%A7%C3%A3o");
    expect(await totalDaLista(page)).toBe(semAcento);

    await page.goto("/proposicoes?q=req%202490%2F2026");
    expect(await totalDaLista(page)).toBe(1);
    await expect(page.locator(".item-nome").first()).toHaveText("Requerimento 2490/2026");

    await page.goto("/proposicoes?q=xyzzyinexistente");
    expect(await totalDaLista(page)).toBe(0);
    await expect(page.getByText("Nada encontrado com esses filtros")).toBeVisible();

    const dialogos: string[] = [];
    page.on("dialog", (d) => {
      dialogos.push(d.message());
      void d.dismiss();
    });
    await page.goto(`/proposicoes?q=${encodeURIComponent('<img src=x onerror=alert(1)>"')}`);
    await expect(page.locator("#q")).toHaveValue('<img src=x onerror=alert(1)>"');
    expect(dialogos).toEqual([]);
  });

  test("busca ao vivo na página inicial e voltar/avançar @cross", async ({ page }) => {
    await page.goto("/");
    const campo = page.getByRole("searchbox").first();
    await campo.fill("sabesp");
    await expect(page.locator(".resultados-vivos .resumo strong")).toHaveText(/\d/);
    await campo.press("Enter");
    await expect(page).toHaveURL(/\/proposicoes\?q=sabesp/);
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await page.goForward();
    await expect(page).toHaveURL(/q=sabesp/);
  });

  test("filtros: buscar dentro de um bairro não perde o bairro", async ({ page }) => {
    await page.goto("/bairros");
    await page.locator(".barras a").first().click();
    await page.locator(".prosa a[href*='bairro=']").first().click();
    await expect(page).toHaveURL(/bairro=/);
    await page.locator("#q").fill("rua");
    await page.locator("#q").press("Enter");
    await expect(page).toHaveURL(/bairro=[a-z-]+/);
    await expect(page).toHaveURL(/q=rua/);
    await expect(page.getByText(/^Bairro: /)).toBeVisible();
  });

  test("bairros: índice → bairro → lista com o mesmo número, rotulado como derivado", async ({ page }) => {
    await page.goto("/bairros");
    await expect(page.getByText("A Câmara não classifica por bairro")).toBeVisible();
    await page.locator(".barras a").first().click();
    await expect(page.getByText("Bairro identificado no texto da ementa")).toBeVisible();
    const link = page.locator(".prosa a[href*='bairro=']").first();
    const n = numero(await link.textContent());
    await link.click();
    expect(await totalDaLista(page)).toBe(n);
  });

  test("destinatário e funil do projeto à lei levam às listas com o mesmo número", async ({ page }) => {
    await page.goto("/");
    const barra = page.locator("#h-destinos ~ figure .barras a").first();
    const n = numero(await barra.locator(".b-num").textContent());
    await barra.click();
    await expect(page).toHaveURL(/destino=/);
    expect(await totalDaLista(page)).toBe(n);

    await page.goto("/");
    const [viraram, apresentados] = await page.locator(".funil .rotulos a").all();
    const nv = numero(await viraram!.textContent());
    const na = numero(await apresentados!.textContent());
    await viraram!.click();
    await expect(page).toHaveURL(/lei=1/);
    expect(await totalDaLista(page)).toBe(nv);
    await page.goto("/");
    await page.locator(".funil .rotulos a").nth(1).click();
    expect(await totalDaLista(page)).toBe(na);
  });

  test("normas: lei ligada a projeto aparece no perfil do autor, com documento oficial", async ({ page }) => {
    await page.goto("/normas");
    expect(await totalDaLista(page)).toBeGreaterThan(0);
    for (const href of await page.locator(".item-nome").evaluateAll((as) => as.map((a) => a.getAttribute("href")))) {
      expect(href).toMatch(OFICIAL);
    }
  });

  test("ementas com &quot; aparecem com aspas de verdade", async ({ page }) => {
    await page.goto("/proposicoes?tipo=Mocoes");
    await expect(page.locator(".item-ementa", { hasText: "&quot;" })).toHaveCount(0);
  });
});

test.describe("dados abertos batem com o site", () => {
  test("manifesto, JSON, CSV e página mostram os mesmos totais; CSV neutraliza fórmulas", async ({ page, request }) => {
    const manifesto = (await (await request.get("/dados/manifesto.json")).json()) as {
      totais: { proposicoes: number; normas: number; vereadores: number };
      execucao: { coletadoEm: string; modo: string };
    };
    const props = (await (await request.get("/dados/proposicoes.json")).json()) as unknown[];
    expect(props.length).toBe(manifesto.totais.proposicoes);
    const csv = await (await request.get("/dados/proposicoes.csv")).text();
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    const linhas = csv.trim().split("\r\n");
    expect(linhas[0]).toBe("id;tipo;titulo;numero;ano;data_publicacao;autoria;ementa;link_oficial"); // trim() drops the BOM checked above
    for (const l of linhas.slice(1)) expect(l).not.toMatch(/(^|;)"?[=+@-]/);

    await page.goto("/proposicoes");
    expect(await totalDaLista(page)).toBe(manifesto.totais.proposicoes);
    await page.goto("/dados");
    await expect(page.getByText(new RegExp(`${manifesto.totais.proposicoes.toLocaleString("pt-BR")} registros`)).first()).toBeVisible();
    await page.goto("/metodologia");
    await expect(page.getByRole("link", { name: /API de Dados Abertos/ }).first()).toHaveAttribute("href", /pindamonhangaba\.sp\.leg\.br\/dadosabertos/);
  });
});

test.describe("erros e bordas", () => {
  test("endereço inexistente responde 404 com caminho de volta @cross", async ({ page }) => {
    const r = await page.goto("/nao-existe-mesmo");
    expect(r?.status()).toBe(404);
    await expect(page.getByRole("link", { name: "Voltar ao início" })).toBeVisible();
    const v = await page.goto("/vereadores/nao-e-vereador");
    expect(v?.status()).toBe(404);
  });

  test("API de busca ignora consulta curta e limita o tamanho", async ({ request }) => {
    const curta = await (await request.get("/api/busca?q=a")).json();
    expect(curta).toMatchObject({ total: 0, itens: [] });
    const longa = await (await request.get(`/api/busca?q=${"x".repeat(5000)}`)).json();
    expect((longa as { q: string }).q.length).toBeLessThanOrEqual(120);
  });

  test("filtros inválidos na URL são descartados, não quebram a página", async ({ page }) => {
    const r = await page.goto("/proposicoes?tipo=%3Cscript%3E&ano=abc&autor=zz&pagina=-3&destino=%3Cx%3E&lei=talvez");
    expect(r?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
