import { expect, test } from "@playwright/test";

test("busca informa espera, limpa erro e limita o termo ao contrato da API", async ({ page }) => {
  await page.route("**/api/busca?**", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.fulfill({ status: 503, body: "Indisponível" });
  });
  await page.goto("/");
  const input = page.getByRole("searchbox");
  await expect(input).toHaveAttribute("maxlength", "120");
  await input.fill("saúde");
  await expect(page.getByRole("status")).toHaveText("Buscando…");
  await expect(page.getByText("A busca não respondeu.", { exact: false })).toBeVisible();
  await input.fill("");
  await expect(page.locator(".resultados-vivos")).toHaveCount(0);
  await input.fill("ruas");
  await expect(page.getByText("A busca não respondeu.", { exact: false })).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveText("Buscando…");
});
