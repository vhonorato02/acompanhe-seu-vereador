/**
 * Static quality gate for project rules (CLAUDE.md):
 * forbids `any`, compiler-suppression directives, empty `catch` blocks,
 * unfinished work markers in comments, and version drift between `package.json` and `SITE.versao`.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { SITE } from "../src/lib/site";

const ROOTS = ["src", "scripts", "tests", "e2e"];
const ALLOWED_EXT = /\.(ts|tsx|mjs)$/;

function collectFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) out.push(...collectFiles(full));
    else if (ALLOWED_EXT.test(name)) out.push(full);
  }
  return out;
}

function lineOf(source: ts.SourceFile, pos: number): number {
  return source.getLineAndCharacterOfPosition(pos).line + 1;
}

const FORBIDDEN_COMMENT = new RegExp(`@ts-${"ignore"}|@ts-${"nocheck"}|\\b(${"TO" + "DO"}|${"FIX" + "ME"})\\b`);

function checkComments(file: string, text: string, errors: string[]): void {
  const variant = file.endsWith(".tsx") ? ts.LanguageVariant.JSX : ts.LanguageVariant.Standard;
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, variant, text);
  let token = scanner.scan();
  while (token !== ts.SyntaxKind.EndOfFileToken) {
    if (token === ts.SyntaxKind.SingleLineCommentTrivia || token === ts.SyntaxKind.MultiLineCommentTrivia) {
      const raw = scanner.getTokenText();
      if (FORBIDDEN_COMMENT.test(raw)) {
        const line = text.slice(0, scanner.getTokenPos()).split("\n").length;
        errors.push(`${file}:${line}: forbidden comment marker (${raw.slice(0, 60).trim()})`);
      }
    }
    token = scanner.scan();
  }
}

function checkAst(file: string, text: string, errors: string[]): void {
  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);

  const visit = (node: ts.Node) => {
    if (node.kind === ts.SyntaxKind.AnyKeyword) {
      errors.push(`${file}:${lineOf(sf, node.getStart(sf))}: explicit \`any\` is forbidden`);
    }
    if (ts.isCatchClause(node) && node.block.statements.length === 0) {
      const inner = text.slice(node.block.getStart(sf) + 1, node.block.getEnd() - 1).trim();
      if (inner === "") {
        errors.push(`${file}:${lineOf(sf, node.getStart(sf))}: empty catch block without explanation`);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}

function main() {
  const root = process.cwd();
  const errors: string[] = [];

  const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")) as { version?: string };
  if (pkg.version !== SITE.versao) {
    errors.push(`package.json version (${pkg.version ?? "?"}) !== SITE.versao (${SITE.versao})`);
  }

  const files = ROOTS.flatMap((dir) => collectFiles(path.join(root, dir)));
  for (const abs of files) {
    const rel = path.relative(root, abs).replace(/\\/g, "/");
    const text = readFileSync(abs, "utf8");
    checkComments(rel, text, errors);
    checkAst(rel, text, errors);
  }

  if (errors.length > 0) {
    console.error(`[lint] ${errors.length} violation(s) found:\n` + errors.map((e) => `  - ${e}`).join("\n"));
    process.exit(1);
  }
  console.log(`[lint] OK (${files.length} files checked; version ${SITE.versao})`);
}

main();
