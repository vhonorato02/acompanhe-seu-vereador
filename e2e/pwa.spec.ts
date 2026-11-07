import { expect, test } from "@playwright/test";

test.describe("PWA (ADR 0004)", () => {
  test("manifesto instalável com atalhos e ícone maskable", async ({ request }) => {
    const m = await (await request.get("/manifest.webmanifest")).json();
    expect(m.display).toBe("standalone");
    expect(m.id).toBe("/");
    expect(m.shortcuts.map((s: { url: string }) => s.url)).toEqual(["/vereadores", "/bairros", "/buscar"]);
    expect(m.icons.some((i: { purpose?: string }) => i.purpose === "maskable")).toBe(true);
    const sw = await request.get("/sw.js");
    expect(sw.status()).toBe(200);
    expect(sw.headers()["cache-control"]).toContain("no-cache");
  });

  test("sem internet: mostra a página offline, nunca uma cópia antiga de página ou dado", async ({ page, context }) => {
    await page.goto("/");
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    // The first visit is not controlled yet; reload so the worker serves this page.
    await page.reload();
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
    await page.goto("/vereadores");

    await context.setOffline(true);
    await page.goto("/vereadores").catch(() => undefined);
    await expect(page.getByRole("heading", { level: 1, name: "Sem conexão" })).toBeVisible();
    // Data is never served from the cache.
    const dado = await page.evaluate(async () => {
      try {
        await fetch("/dados/manifesto.json", { cache: "no-store" });
        return "respondeu";
      } catch {
        return "falhou";
      }
    });
    expect(dado).toBe("falhou");
    await context.setOffline(false);
    await page.goto("/vereadores");
    await expect(page.getByRole("heading", { level: 1 })).not.toHaveText("Sem conexão");
  });
});
