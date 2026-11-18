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

describe("ícones e ativos da marca em PNG", () => {
  const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ativos: ReadonlyArray<[string, number, number]> = [
    ["public/icones/icone-192.png", 192, 192],
    ["public/icones/icone-512.png", 512, 512],
    ["public/icones/icone-maskable-512.png", 512, 512],
    ["src/app/icon.png", 64, 64],
    ["src/app/apple-icon.png", 180, 180],
    ["public/marca/emblema.png", 98, 96],
    ["public/marca/logo-osb.png", 672, 246],
  ];

  it.each(ativos)("%s existe, tem assinatura PNG e dimensões %ix%i", (arquivo, larg, alt) => {
    const bytes = readFileSync(path.join(process.cwd(), arquivo));
    expect(bytes.subarray(0, 8)).toEqual(PNG_SIG);
    expect(bytes.toString("ascii", 12, 16)).toBe("IHDR");
    expect(bytes.readUInt32BE(16)).toBe(larg);
    expect(bytes.readUInt32BE(20)).toBe(alt);
  });
});
