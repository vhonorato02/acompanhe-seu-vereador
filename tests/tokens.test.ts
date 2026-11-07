import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** Every source file under src/ that can reference a CSS custom property. */
function arquivos(dir: string): string[] {
  return readdirSync(dir).flatMap((nome) => {
    const p = path.join(dir, nome);
    return statSync(p).isDirectory() ? arquivos(p) : /\.(tsx?|css)$/.test(nome) ? [p] : [];
  });
}

describe("tokens de design", () => {
  it("todo var(--token) usado está definido (sobra de sistema visual antigo cai silenciosamente)", () => {
    const fontes = arquivos("src").map((p) => readFileSync(p, "utf8"));
    const definidos = new Set(fontes.flatMap((s) => [...s.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1])));
    // Custom properties set inline by components, e.g. style={{ ["--cols" as string]: n }}.
    for (const s of fontes) for (const m of s.matchAll(/\["(--[a-z0-9-]+)" as string\]/g)) definidos.add(m[1]);
    const usados = new Set(fontes.flatMap((s) => [...s.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1] ?? "")));
    expect([...usados].filter((t) => !definidos.has(t)).sort()).toEqual([]);
  });
});
