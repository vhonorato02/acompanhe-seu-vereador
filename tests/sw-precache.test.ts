import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// One missing precache file makes cache.addAll reject, so the worker never installs and the
// offline page silently disappears (it happened when /icon.svg was replaced by /icon.png).
describe("service worker: precache só com arquivos que existem", () => {
  const sw = readFileSync(path.join(process.cwd(), "public/sw.js"), "utf8");
  const lista = /const PRECACHE = \[([^\]]*)\]/.exec(sw)?.[1] ?? "";
  const caminhos = [...lista.matchAll(/"([^"]+)"/g)].map((m) => m[1] ?? "");
  if (/\bOFFLINE\b/.test(lista)) caminhos.push(/const OFFLINE = "([^"]+)"/.exec(sw)?.[1] ?? "");

  it("encontra a lista", () => {
    expect(caminhos.length).toBeGreaterThan(1);
  });

  it.each(caminhos)("%s existe em public/ ou como rota do app", (c) => {
    const nome = c.replace(/^\//, "");
    const candidatos = [
      path.join("public", nome),
      path.join("src/app", nome),
      path.join("src/app", nome, "page.tsx"),
    ];
    expect(candidatos.some((x) => existsSync(path.join(process.cwd(), x))), c).toBe(true);
  });
});
