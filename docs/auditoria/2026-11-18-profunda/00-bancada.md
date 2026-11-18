# 00 — Bancada e Superfície de Execução (Fase 0)

> Data da verificação: 18/11/2026 (Brasília). Tudo abaixo foi testado diretamente nesta sessão, salvo quando marcado com outro rótulo.

## 1. Runtime, CLI e Ferramentas Operacionais

| Item | Versão / Estado observado | Evidência / Observação | Rótulo |
|---|---|---|---|
| Node.js local | `v26.13.1` | `node -v` (`.nvmrc` e `package.json` exigem `24.x` — gera `npm warn EBADENGINE` local; no CI o runner Linux usa `24.22.2`) | `[OBSERVADO]` |
| npm | `11.20.0` | `npm -v`; dispara `npm warn install-scripts` para `esbuild@0.28.2` (`postinstall: node install.js`, devDependency de `tsx`/`vitest`; não afeta runtime de produção) | `[OBSERVADO]` |
| Git | `2.56.0.windows.4` | `git --version`; identidade local configurada para `José Victor Honorato <33707633+vhonorato02@users.noreply.github.com>` | `[OBSERVADO]` |
| GitHub CLI (`gh`) | `2.104.0` | `gh pr list`, `gh run list`, `gh issue list` executados com sucesso em `vhonorato02/acompanhe-seu-vereador` | `[OBSERVADO]` |
| Vercel CLI (`vercel`) | `65.16.0` | `vercel whoami` → `vhonorato02-2054`; `vercel project ls` e `vercel ls acompanhe-seu-vereador` operacionais (time `jose-victors-projects-5cc9abbe`) | `[OBSERVADO]` |
| SSH na VPS (`zewithane`) | OpenSSH Windows → porta `22322` | `ssh zewithane "site lista; df -h /"` operacional (`vereador` tag `afddf618cb6f-2`, `no-ar`; disco `37%` usado, `18G` livres). **Divergência:** o alias `zewithane-vps` citado no `HANDOFF.md` não existe no `~/.ssh/config` | `[OBSERVADO]` |
| Playwright local | `@playwright/test 1.64.1`, `@axe-core/playwright 4.14.0` | Navegadores de teste instalados sob `PLAYWRIGHT_BROWSERS_PATH=D:\Anglo AI - Local\Temp\ms-playwright` (124,8 GB livres em `D:`). O caminho `Z:\Dev\.cache\ms-playwright` citado no `HANDOFF.md` não existe nesta máquina | `[OBSERVADO]` |
| `next` (framework) | `16.4.3` → **`16.4.6`** | Atualizado em `package.json`/`package-lock.json` para eliminar 2 vulnerabilidades moderadas (`GHSA-mfr8-8qww-v76h` e `GHSA-vc7v-qv4w-wrv8`). `npm audit` passou de 1 vulnerabilidade para **0** | `[OBSERVADO]` |
| `tsx` / `typescript` / `vitest` / `zod` | `4.23.15` / `5.9.3` / `5.0.5` / `4.6.7` | Operacionais em `typecheck`, `lint`, `test` e `collect` | `[OBSERVADO]` |

## 2. Segurança da Configuração de Agente (`.claude/settings.json`)

- **Achado inicial (`ACH-08`, P2):** `.claude/settings.json` autorizava `"Bash"` e `"mcp__Vercel"` de forma irrestrita na lista `allow` (embora negasse `buy_domain` e `create_or_transfer_domain`). `[OBSERVADO]`
- **Correção aplicada:** substituído por permissões granulares para comandos de leitura/teste (`Bash(npm test:*)`, `Bash(npm run:*)`, `Bash(npx playwright:*)`, `Bash(git status/log/diff:*)`) e operações somente leitura da Vercel (`mcp__Vercel__list_*`, `mcp__Vercel__get_*`), além de negação explícita para `Bash(rm -rf:*)` e `mcp__Vercel__delete_*` (commit `89fd430`). `[OBSERVADO]`
- **Observação de ambiente:** o aviso local do Next.js (`⚠ Warning: Next.js ignored package-lock.json in C:\Users\Anglo`) ocorre porque existe um lockfile solto no diretório-pai fora do repositório; não afeta o build nem o CI. `[OBSERVADO]`

## 3. Lacunas de Bancada e Limites Declarados (R13)

| Capacidade | Estado | Impacto e Rótulo |
|---|---|---|
| Aparelho físico iOS/Android e leitores de tela reais (VoiceOver/TalkBack) | Ausente nesta bancada | Testes móveis e de acessibilidade feitos via emulação Chromium (`android-412`, `samsung-360`) e `@axe-core/playwright`; instalação física iOS/Android permanece `[BLOQUEADO]` (exige aparelho do dono) |
| Navegação direta no HTML da Câmara (`pindamonhangaba.sp.leg.br/proposicoes/...`) | Bloqueada por LiteSpeed reCAPTCHA | Tanto o IP local brasileiro quanto a VPS `zewithane` receberam `<title>Bot Verification</title>` em páginas HTML (enquanto `/jsonweb/web-rss.php` respondeu `200 OK` na VPS). Conforme R8 e a ficha, não contornamos: conferência HTML direta fica `[BLOQUEADO]` |
| Google Search Console | Sem acesso nesta sessão | Indexação efetiva e erros de rastreamento no Google ficam `[BLOQUEADO]` até verificação pelo dono após definição do endereço |
| Mutação em produção (Vercel/VPS/main) | Travada aguardando R7 | Trabalhamos exclusivamente em ramo local `release/v1.0.0-rc1` até o aval do dono sobre domínio e remoção dos projetos sobressalentes |
