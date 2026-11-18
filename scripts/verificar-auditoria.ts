/**
 * Coverage verifier for the hostile audit ledgers (Prompt Mestre §3).
 *
 * Verifies:
 * 1. 100% of `git ls-files` are present in `livro-arquivos.csv` with valid `lido`, `veredito` and `status`.
 * 2. 100% of Next.js App Router routes (`page.tsx`, `route.ts`, `robots.ts`, `sitemap.ts`,
 *    `manifest.ts`, `opengraph-image.tsx`, `not-found.tsx`) are present in `livro-telas.csv`.
 * 3. `livro-fluxos.csv` and `achados.csv` exist and have complete required fields.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const AUDIT_DIR = "docs/auditoria/2026-11-18-profunda";

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const clean = text.replace(/^\ufeff/, "");

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i] ?? "";
    if (inQuotes) {
      if (ch === '"' && clean[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field.trim());
      field = "";
    } else if (ch === "\r") {
      continue;
    } else if (ch === "\n") {
      row.push(field.trim());
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field.trim());
    if (row.some((cell) => cell !== "")) rows.push(row);
  }
  return rows;
}

function discoverRoutes(appDir: string): string[] {
  const routes = new Set<string>();
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      const rel = path.relative(appDir, full).replace(/\\/g, "/");
      if (rel === "page.tsx") routes.add("/");
      else if (rel.endsWith("/page.tsx")) routes.add("/" + rel.slice(0, -"/page.tsx".length));
      else if (rel.endsWith("/route.ts")) routes.add("/" + rel.slice(0, -"/route.ts".length));
      else if (rel === "robots.ts") routes.add("/robots.txt");
      else if (rel === "sitemap.ts") routes.add("/sitemap.xml");
      else if (rel === "manifest.ts") routes.add("/manifest.webmanifest");
      else if (rel === "opengraph-image.tsx") routes.add("/opengraph-image");
      else if (rel === "not-found.tsx") routes.add("/404");
    }
  };
  walk(appDir);
  return [...routes].sort();
}

function main() {
  const root = process.cwd();
  const auditAbs = path.join(root, AUDIT_DIR);
  const errors: string[] = [];

  for (const reqFile of ["livro-arquivos.csv", "livro-telas.csv", "livro-fluxos.csv", "achados.csv"]) {
    if (!existsSync(path.join(auditAbs, reqFile))) {
      errors.push(`Arquivo ausente: ${AUDIT_DIR}/${reqFile}`);
    }
  }
  if (errors.length > 0) {
    console.error("[cobertura] FALHOU:\n" + errors.join("\n"));
    process.exit(1);
  }

  // 1. Files ledger vs git ls-files
  const gitFiles = execFileSync("git", ["ls-files"], { encoding: "utf8" })
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .sort();
  const arqRows = parseCsv(readFileSync(path.join(auditAbs, "livro-arquivos.csv"), "utf8"));
  const arqHead = arqRows[0] ?? [];
  const arqBody = arqRows.slice(1);
  if (arqHead.length < 9) errors.push(`livro-arquivos.csv: esperado >= 9 colunas, obtido ${arqHead.length}`);

  const validLido = new Set(["integral", "gerado", "binário", "terceiro", "parcial-amostral"]);
  const validVeredito = new Set(["ok", "corrigir", "remover", "refatorar"]);
  const seenFiles = new Set<string>();

  for (let i = 0; i < arqBody.length; i++) {
    const r = arqBody[i]!;
    const caminho = r[0] ?? "";
    const lido = r[3] ?? "";
    const veredito = r[6] ?? "";
    const status = r[8] ?? "";
    if (!caminho) errors.push(`livro-arquivos.csv linha ${i + 2}: caminho vazio`);
    if (seenFiles.has(caminho)) errors.push(`livro-arquivos.csv: caminho duplicado ${caminho}`);
    seenFiles.add(caminho);
    if (!validLido.has(lido)) errors.push(`livro-arquivos.csv (${caminho}): valor 'lido' inválido (${lido})`);
    if (!validVeredito.has(veredito)) errors.push(`livro-arquivos.csv (${caminho}): veredito inválido (${veredito})`);
    if (!status) errors.push(`livro-arquivos.csv (${caminho}): status vazio`);
  }
  for (const f of gitFiles) {
    if (!seenFiles.has(f)) errors.push(`Arquivo rastreado fora de livro-arquivos.csv: ${f}`);
  }
  for (const f of seenFiles) {
    if (!gitFiles.includes(f)) errors.push(`Entrada em livro-arquivos.csv não está em git ls-files: ${f}`);
  }

  // 2. Screens ledger vs src/app routes
  const appRoutes = discoverRoutes(path.join(root, "src/app"));
  const telaRows = parseCsv(readFileSync(path.join(auditAbs, "livro-telas.csv"), "utf8"));
  const telaBody = telaRows.slice(1);
  const coveredRoutes = new Set<string>();
  for (let i = 0; i < telaBody.length; i++) {
    const r = telaBody[i]!;
    const rota = r[0] ?? "";
    const status = r[10] ?? "";
    if (!rota) errors.push(`livro-telas.csv linha ${i + 2}: rota vazia`);
    if (!status) errors.push(`livro-telas.csv linha ${i + 2} (${rota}): status vazio`);
    coveredRoutes.add(rota);
  }
  for (const route of appRoutes) {
    if (!coveredRoutes.has(route)) errors.push(`Rota real do app ausente em livro-telas.csv: ${route}`);
  }

  // 3. Flows and findings ledgers
  const fluxoRows = parseCsv(readFileSync(path.join(auditAbs, "livro-fluxos.csv"), "utf8")).slice(1);
  if (fluxoRows.length < 10) errors.push(`livro-fluxos.csv: cobertura insuficiente (${fluxoRows.length} linhas)`);
  for (let i = 0; i < fluxoRows.length; i++) {
    if (!fluxoRows[i]![0] || !fluxoRows[i]![fluxoRows[i]!.length - 1]) {
      errors.push(`livro-fluxos.csv linha ${i + 2}: campos obrigatórios vazios`);
    }
  }

  const achadoRows = parseCsv(readFileSync(path.join(auditAbs, "achados.csv"), "utf8")).slice(1);
  if (achadoRows.length < 9) errors.push(`achados.csv: esperado >= 9 achados, obtido ${achadoRows.length}`);
  const seenIds = new Set<string>();
  for (let i = 0; i < achadoRows.length; i++) {
    const r = achadoRows[i]!;
    const id = r[0] ?? "";
    const sev = r[7] ?? "";
    const status = r[13] ?? "";
    if (!id || seenIds.has(id)) errors.push(`achados.csv linha ${i + 2}: ID inválido ou duplicado (${id})`);
    seenIds.add(id);
    if (!["P0", "P1", "P2", "P3"].includes(sev)) errors.push(`achados.csv (${id}): severidade inválida (${sev})`);
    if (!status) errors.push(`achados.csv (${id}): status vazio`);
  }

  if (errors.length > 0) {
    console.error(`[cobertura] FALHOU com ${errors.length} erro(s):\n` + errors.map((e) => `  - ${e}`).join("\n"));
    process.exit(1);
  }

  console.log(
    `[cobertura] OK: ${gitFiles.length}/${gitFiles.length} arquivos, ${appRoutes.length}/${appRoutes.length} rotas ` +
      `(${telaBody.length} registros rota×estado×viewport), ${fluxoRows.length} fluxos, ${achadoRows.length} achados.`,
  );
}

main();
