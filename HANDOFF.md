# HANDOFF — Acompanhe seu Vereador (Pindamonhangaba)

> **Documento único de estado** entre sessões. Atualize ao fim de cada bloco de trabalho.
> Última atualização: 18/11/2026 (auditoria profunda v2 em `docs/auditoria/2026-11-18-profunda/` — ramo candidato `release/v1.0.0-rc1`).

## Onde estamos

- **Produção única (canônico na `main`, commit base `afddf61`):** https://acompanhe-seu-vereador.vercel.app
  - **Coleta publicada em 18/11/2026 (`2026-11-18T04:17:33.473Z`):** **17.545 proposições, 409 normas, 11 vereadores**, modo `incremental`, `62` consultas, `0` avisos.
- **Hospedagem única na Vercel ([ADR 0005](docs/adr/0005-hospedagem-unica-vercel.md)):** por decisão do dono em `18/11/2026`, o portal roda exclusivamente na Vercel e no domínio `acompanhe-seu-vereador.vercel.app`, com descomissionamento dos artefatos de cópia/espelho em VPS.
- **Ramo candidato à 1.0.0:** `release/v1.0.0-rc1` (estado **CANDIDATO** — ver [relatório final](docs/auditoria/2026-11-18-profunda/08-relatorio-final.md)). Aguarda aval final do dono para merge/push na `main`, criação da tag `v1.0.0` e remoção dos projetos/aliases excedentes na Vercel.
- **Vercel:** projeto `acompanhe-seu-vereador` (`prj_tduqr6ZAVAtyEGz5mJJ5JgbTOaZe`, time `team_43xSvVJZ9lHuy6K7NNxlMhXG`), Node `24.x`.
- **GitHub:** `vhonorato02/acompanhe-seu-vereador`, branch padrão `main`. **Nunca empurre commits em série na `main`:** cada push na `main` dispara build de produção na Vercel com coleta real na Câmara. Valide em ramo antes.
- **Automação:** `atualizar-dados.yml` (horário, dispara com > 11 h), `vigia-dados.yml` (3x/dia, limite 26 h, confere `/dados/manifesto.json` e `/api/health` na Vercel), `quality-gates.yml` (`lint`, `typecheck`, `test`, `auditar:heuristicas`, `build`, E2E). Guia em [docs/operacao/atualizar-dados.md](docs/operacao/atualizar-dados.md) e [ADR 0003](docs/adr/0003-atualizacao-automatica.md).

## Novidades da rodada 1.0.0-rc1 (18/11/2026)

- **Hospedagem única (ADR 0005):** descomissionados `Dockerfile`, `.dockerignore`, `deploy-vps.yml`, `scripts/espelhar.ts`, `src/lib/espelho/espelhar.ts`, `tests/espelho.test.ts` e guardas `ESPELHO=1`.
- **Segurança e dependências (`ACH-04`, `ACH-07`, `ACH-08`):** `next` atualizado de `16.4.3` para `16.4.6` (0 vulnerabilidades no `npm audit`); permissões de `atualizar-dados.yml` e `.claude/settings.json` restringidas.
- **LGPD e blindagem legal (`ACH-01`, `ACH-09`):** 3 requerimentos com dados sensíveis de saúde de cidadãos (`Requerimentos:130774`, `132682`, `134695`) omitidos preventivamente em `src/lib/content/omissoes.ts` (sem nomes); sentinela LGPD em `scripts/auditar-heuristicas.ts`; `/privacidade` atualizada (`vigenciaPoliticas: 2026-11-18`, explicita ausência de perfilamento/art. 20 e proteção a crianças/adolescentes/art. 14); `/termos` reforça Lei Eleitoral nº 9.504/1997 e política das fotos oficiais; prazo de 15 dias em `/correcoes`.
- **UI, UX, Acessibilidade, SEO e Meta (`ACH-02`, `ACH-03`, `ACH-05`, `ACH-06`, `ACH-13`):** `/comparar` corrigido para `nProjetosLei` + link `lei=1`, aviso de estado vazio (`ACH-13`) e botão `"Limpar seleção"`; suporte a `forced-colors`, `@media print`, `scroll-padding-bottom` mobile para `.tabbar` e indicador semântico `aria-current` com sublinhado em `globals.css`; correção de `aria-current` e Label-in-Name em `PaginaLista.tsx`; melhorias em `Rede.tsx` e `/404` (`not-found.tsx`); `/api/health` expõe `versao` (`1.0.0`) e `sha` curto; JSON-LD com `SearchAction` e `BreadcrumbList`, `openGraph` completo de perfil, `colorScheme` no viewport e `llms.txt` ampliado; lint AST em `scripts/lint.ts`; remoção do script morto `scripts/icones.mjs` e validação IHDR dos 7 PNGs.
- **Missão A (Verdade dos dados):** script independente `scripts/auditar-dados-producao.ts` conferiu os 17.545 registros reais de produção (0 divergências na capa, 30/30 recortes idênticos, 6/6 mutantes de domínio mortos pelo Vitest).

## Decisões do dono (valem até nova decisão)

1. Só Pindamonhangaba (Observatório Social do Brasil – Pindamonhangaba e Câmara Municipal).
2. Custo zero: nenhum serviço pago, cartão ou domínio comprado; sem IA paga.
3. Portal apartidário para acompanhar vereadores com link oficial (não é clone da Câmara); sem votações e sem presença nesta v1.
4. Ordem alfabética, sem ranking, nota, selo ou cor de partido. Todo número leva à lista que o compõe.
5. Atualização automática 2x/dia via GitHub Actions (`ADR 0003`); PWA com service worker exclusivo para estáticos e `/offline` (`ADR 0004`).
6. Identidade centralizada em `src/lib/site.ts` (`ADR 0001`), visível como projeto do Observatório Social do Brasil – Pindamonhangaba.

## Qualidade e operação local

- **Suite unitária/contrato (`npm test`):** 18 arquivos, **150 testes** (Vitest) + `npm run lint` + `npm run typecheck` + `npm run auditar:cobertura`.
- **Playwright local (Windows):** validado em **192 testes** (`desktop-chromium`, `android-412`, `samsung-360` — 100% verdes). Se a porta `3100` estiver ocupada por outro processo, suba em porta dedicada (`npx next start -p 3197 -H 127.0.0.1`) e execute com `E2E_URL=http://127.0.0.1:3197` e `PLAYWRIGHT_BROWSERS_PATH="D:\Anglo AI - Local\Temp\ms-playwright"`. Encerre o servidor ao concluir.
- **Limites da Câmara (nunca contornar):** HTML direto recebe LiteSpeed reCAPTCHA (`Bot Verification`); o coletor usa exclusivamente `/jsonweb/web-aplicativo.php` com token em produção e ≥ 1 s entre requisições.

## Pendências com o dono / humanas (18/11/2026)

0. **Vercel (urgente, 1 min):** remover `camara-a-vista.vercel.app` do projeto `acompanhe-seu-vereador` e apagar/pausar o projeto abandonado `osb-pinda-camara-1s2026`; na VPS externa do mantenedor (fora deste repo), desligar/remover o site antigo `vereador` quando desejar.
1. **Domínio decidido:** permanece exclusivamente `https://acompanhe-seu-vereador.vercel.app` na Vercel (sem VPS e sem subdomínio extra nesta versão).
2. **Publicação da `1.0.0`:** autorizar merge de `release/v1.0.0-rc1` → `main` e criação da tag `v1.0.0` (testando `/api/health` após o deploy na Vercel).
3. **Observatório e Jurídico:** revisar `/termos`, `/privacidade`, fotos oficiais em P&B, autorização formal de uso da marca/CNPJ/endereço, elegibilidade do plano Hobby da Vercel para associação sem fins lucrativos e monitoramento de `pindamonhangaba@osbrasil.org.br` (prazo de 15 dias).
4. **Opcional:** configurar secret `VERCEL_DEPLOY_HOOK_URL` (passo a passo em `docs/operacao/atualizar-dados.md`) para evitar 2 commits/dia na `main`; validar instalação em aparelho físico Android/iPhone com TalkBack/VoiceOver; confirmar nomes de bairros ambíguos ("Andrade" × "Residencial Andrade", "Ipê" × "Ipê I") para `src/lib/content/bairros.ts`.

## Rollback

1. **Vercel:** Vercel → `acompanhe-seu-vereador` → Deployments → último deployment íntegro → ⋯ → **Promote to Production**.
2. **Código:** `git revert <sha>` na `main` (nunca force push).

## Identidade Git

Local ao repo: `José Victor Honorato <33707633+vhonorato02@users.noreply.github.com>`. Sem assinaturas de IA.
