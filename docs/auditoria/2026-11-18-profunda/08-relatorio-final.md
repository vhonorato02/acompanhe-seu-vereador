# 08 — Relatório Final da Auditoria (18/11/2026)

## 1. Estado Atual e Por quê

**Estado:** **`CANDIDATO`** à versão **`1.0.0`** (no ramo local `release/v1.0.0-rc1`). `[OBSERVADO]`

O código auditado passou em **100% das verificações automatizadas e independentes locais** (lint AST, typecheck, `npm audit = 0`, 150 testes unitários/contrato, 6/6 mutantes mortos, build `Next.js 16.4.6`, 192 testes E2E/axe e reconciliação independente de Missão A sobre os 17.545 registros de produção), mas **não recebe o carimbo `ESTÁVEL VALIDADO` ainda** porque dependem do dono (R7 / Missão C):
1. Remover o domínio indevido `camara-a-vista.vercel.app` e decidir o destino de `osb-pinda-camara-1s2026.vercel.app` (`[OBSERVADO]` ativos em produção).
2. Aprovar a estratégia de endereço definitivo (Missão C) e confirmar autorizações institucionais do Observatório Social de Pindamonhangaba (`[DECLARADO]` pendente).
3. Autorizar o merge para `main`, o deploy na Vercel/VPS com o novo SHA (`1.0.0` em `/api/health`) e o ensaio final em produção + rollback.
4. Validar instalação PWA e leitura de tela em aparelhos físicos iOS/Android (`[BLOQUEADO]` nesta bancada).

---

## 2. O que o Produto é de Verdade

Portal cívico estático/ISR-like do **Observatório Social do Brasil – Pindamonhangaba** para acompanhamento das proposições e normas da Câmara Municipal de Pindamonhangaba na legislatura 2025–2028 (`17.545` proposições, `409` normas, `11` vereadores em exercício na coleta de `18/11/2026`). `[OBSERVADO]`

Funciona sem banco de dados, sem CMS e sem login: coleta no build de produção da Vercel pela API oficial SoftCam (`/jsonweb/web-aplicativo.php`), publica dados abertos em CSV/JSON, espelha esses dados validados na VPS `zewithane` com `noindex`, exibe todos os vereadores em ordem alfabética e fotos em P&B (sem ranking ou cor partidária) e garante o invariante de que **todo número clicável abre a lista exata que o compõe**, com link para o documento oficial da Câmara. `[OBSERVADO]`

---

## 3. As Piores Coisas Encontradas e o que foi Feito

| # | Achado | Sev. | O que foi feito nesta auditoria |
|---|---|---|---|
| 1 | **`ACH-01` — Exposição de dados sensíveis de saúde (LGPD):** varredura sobre os 17.545 registros revelou 3 requerimentos (`130774`, `132682`, `134695`) citando nome completo de paciente, patologia rara/dieta ou prontuário médico. | **P0** | Omitidas preventivamente as 3 ementas em `src/lib/content/omissoes.ts` (sem citar nomes), atualizada `/privacidade` (`vigenciaPoliticas: 2026-11-18`) e adicionada sentinela LGPD a `scripts/auditar-heuristicas.ts`. `[OBSERVADO]` |
| 2 | **`ACH-10` — Domínio `camara-a-vista.vercel.app` e sobra `osb-pinda-camara-1s2026` no ar:** ambos respondem `200 OK` na Vercel com nomes que remetem à Câmara/OSB. | **P1** | Confirmado via `curl` e `vercel project ls`; mantido intacto por R7 e colocado como pedido nº 1 ao dono com remoção em 1 clique/comando. `[OBSERVADO]` |
| 3 | **`ACH-02` — Violação de "número = lista" em `/comparar`:** exibia `leisDeProjetos.length` (pares lei-projeto, inflado e sem link). | **P1** | Corrigido em `src/app/comparar/page.tsx` para usar `x.nProjetosLei` com link `lei=1`, removido `leisDeProjetos` de `painel.ts` e coberto em `e2e/jornadas.spec.ts`. `[OBSERVADO]` |
| 4 | **`ACH-04` — `next@16.4.3` vulnerável em produção:** 2 CVEs moderadas abertas (`GHSA-mfr8-8qww-v76h`, `GHSA-vc7v-qv4w-wrv8`). | **P1** | Atualizado `next` para `16.4.6` (`--save-exact`) e `version` para `1.0.0`; `npm audit` caiu para **0 vulnerabilidades**. `[OBSERVADO]` |
| 5 | **`ACH-03` — Produção não provava código no ar:** `/api/health` omitia versão e SHA. | **P2** | Adicionados `versao` (`1.0.0`) e `sha` curto em `/api/health`, com propagação de `GIT_COMMIT_SHA` no `Dockerfile` e `deploy-vps.yml` + testes unitário e E2E. `[OBSERVADO]` |
| 6 | **`ACH-05` — Ausência total de linter no projeto e CI:** regras contra `any` e `catch` vazio não eram checadas. | **P2** | Criado `scripts/lint.ts` via AST do TypeScript (zero dependências novas) e adicionado passo bloqueante no `quality-gates.yml`. `[OBSERVADO]` |
| 7 | **`ACH-07` / `ACH-08` — Superfície de permissão excessiva:** `atualizar-dados.yml` dava `contents: write` ao workflow inteiro; `deploy-vps.yml` não rodava testes; `.claude/settings.json` liberava `Bash` e `mcp__Vercel` irrestritos. | **P2** | Restringido `contents: write` só ao job `disparar`; adicionados `lint`/`typecheck`/`test` no `deploy-vps.yml`; restringidas permissões em `.claude/settings.json`. `[OBSERVADO]` |
| 8 | **`ACH-06` — Script órfão quebrado (`scripts/icones.mjs`):** importava `sharp` (inexistente) e lia `icon.svg` apagado. | **P2** | Script removido; `tests/sw-precache.test.ts` ampliado para checar assinatura PNG e dimensões IHDR dos 7 ativos reais. `[OBSERVADO]` |
| 9 | **`ACH-09` — Lacuna de SLA e sitemap no espelho:** `/correcoes` não tinha prazo; `sitemap.ts` não checava `ESPELHO=1`. | **P2** | Declarado prazo de 15 dias em `/correcoes` e retorno `[]` em `sitemap.ts` com `ESPELHO=1`. `[OBSERVADO]` |
| 10 | **`ACH-12` / `ACH-11` — Documentação mentirosa e risco contratual Vercel Hobby:** `CLAUDE.md` citava `0.3.0` e "sem SW"; `HANDOFF` citava `zewithane-vps` (inexistente); Vercel Hobby proíbe uso institucional não-pessoal. | **P2** | Documentação consolidada (`docs/environment.md` removido, `HANDOFF.md` único) e risco Vercel Hobby documentado com Plano B operacional na VPS (`0,136s`). `[OBSERVADO]` |

---

## 4. O que a Documentação Antiga Dizia e Era Falso

1. `CLAUDE.md` afirmava `"0.3.0 em produção"` e `"PWA sem service worker"` — o pacote já estava em `0.5.0` e o service worker `public/sw.js` roda desde a `0.4.0`. `[OBSERVADO]`
2. `HANDOFF.md` instruía operar a VPS via `ssh zewithane-vps` e rodar Playwright em `Z:\Dev\.cache\ms-playwright` — nenhum dos dois existe no ambiente local (`ssh zewithane` é o alias real). `[OBSERVADO]`
3. O ciclo 3 declarava `"número = lista"` totalmente resolvido após `C01`, mas `/comparar` continuava exibindo contagem sem link baseada em pares projeto-lei. `[OBSERVADO]`
4. `CLAUDE.md` prometia proibição de `any` e `catch` vazio, mas não existia nenhum linter ou verificação automatizada no repositório. `[OBSERVADO]`
5. A política de privacidade afirmava não tratar dados sensíveis e `OMISSOES` estava vazio, mas 3 requerimentos em produção exibiam prontuário/patologia de cidadãos identificados. `[OBSERVADO]`
6. A ficha de `18/11` temia que a VPS `vereador.zewithane.vps.brz.dev.br` estivesse fora e o `picomatch` quebrando o CI — em `18/11` nesta rede, a VPS respondeu `200 OK` em `0,136s` perfeitamente sincronizada com a Vercel e o `picomatch` estava em `4.0.7` sem vulnerabilidade (apenas `next@16.4.3` falhava o audit). `[OBSERVADO]`

---

## 5. Números de Cobertura

| Dimensão | Total | Auditados / Executados | Aprovados | Falhos | Bloqueados | N/A |
|---|---:|---:|---:|---:|---:|---:|
| Arquivos rastreados (`git ls-files`) | 162 | 162 (`100%`) | 162 | 0 | 0 | 0 |
| Rotas/entradas Next.js (`src/app/`) | 25 entradas (`17` páginas + `3` APIs + `5` meta/404) | 25 (`100%`) | 25 | 0 | 0 | 0 |
| Jornadas/fluxos (`livro-fluxos.csv`) | 14 | 12 | 12 (1 c/ ressalva) | 0 | 2 (`J13`, `J14`) | 0 |
| Testes unitários/contrato (Vitest) | 150 (18 arquivos) | 150 | 150 | 0 | 0 | 0 |
| Mutantes no núcleo de domínio | 6 | 6 | 6 mortos (`100%`) | 0 | 0 | 0 |
| Testes E2E Chromium (3 viewports + axe) | 192 | 192 | 192 | 0 | 0 | 0 |
| Missão A — recortes e amostra real | 30 recortes + 30 itens + 60 fixtures | 120 | 120 | 0 | 0 | 0 |

---

## 6. O que Mudou (Código, Infra, Git)

- **Branch de trabalho:** `release/v1.0.0-rc1` (a partir da `main` em `afddf61`; `main` e produção **não** foram alteradas por respeito à R7/zonas de perigo).
- **Commits executados na rodada:**
  - `1b1dace` (`ACH-01`): omissões LGPD preventivas, privacidade e sentinela.
  - `d92f567` (`ACH-02`): paridade número = lista em `/comparar`.
  - `414d142` (`ACH-03`): versão e SHA curto em `/api/health`, `Dockerfile` e `deploy-vps.yml`.
  - `666cf7f` (`ACH-04`): atualização `next@16.4.6` e bump para `1.0.0`.
  - `758b833` (`ACH-05`): `scripts/lint.ts` via AST e gate no `quality-gates.yml`.
  - `9b6502a` (`ACH-06`): remoção de `scripts/icones.mjs` e validação binária de PNGs.
  - `9fd1b57` (`ACH-07`): escopo mínimo em `atualizar-dados.yml` e gates pré-espelho em `deploy-vps.yml`.
  - `89fd430` (`ACH-08`): restrição de permissões em `.claude/settings.json`.
  - `49b8d7b` (`ACH-09`): prazo de 15 dias em `/correcoes` e bloqueio de `sitemap.ts` em `ESPELHO=1`.
  - `0be0454` (Missão A): `scripts/auditar-dados-producao.ts`.
  - Commit final de documentação/evidência: consolidação `CLAUDE.md`/`HANDOFF.md`/`README.md`, remoção de `docs/environment.md`, `scripts/verificar-auditoria.ts` e `docs/auditoria/2026-11-18-profunda/`.

---

## 7. Versões Antes e Depois

- **Aplicação:** `0.5.0` → **`1.0.0-rc1`** (pronta para tag `v1.0.0` após publicação na `main`).
- **`next`:** `16.4.3` → **`16.4.6`** (`0` vulnerabilidades no `npm audit`).
- Demais dependências travadas em `package-lock.json`: `react` `19.3.1`, `zod` `4.6.7`, `typescript` `5.9.3`, `vitest` `5.0.5`, `@playwright/test` `1.64.1`.

---

## 8. Segurança e Legal: Corrigido × Pendente de Humano

- **Corrigido tecnicamente (`[OBSERVADO]`):** 3 omissões LGPD de saúde em `omissoes.ts`, sentinela LGPD em `auditar-heuristicas.ts`, prazo de 15 dias em `/correcoes`, `/privacidade` atualizada para refletir Vercel + servidor no Brasil, atualização `next@16.4.6`, lint AST bloqueante, menor privilégio em `atualizar-dados.yml` e `.claude/settings.json`, `sitemap.ts` fechado para espelho.
- **Pendente de humano (`[DECLARADO]` — ver `07-legal-para-revisao-humana.md`):**
  1. Revisão por advogado/DPO de `/termos`, `/privacidade` e cópia local em P&B das fotos dos vereadores.
  2. Confirmação formal pelo OSB Pindamonhangaba do uso da marca, logotipo, CNPJ e leitura da caixa `pindamonhangaba@osbrasil.org.br`.
  3. Decisão sobre risco contratual da Vercel Hobby vs hospedagem canônica na VPS.

---

## 9. O que Não Foi Possível Provar (`[BLOQUEADO]`)

1. Conferência visual direta das 30 proposições no HTML da Câmara (`pindamonhangaba.sp.leg.br` retorna LiteSpeed reCAPTCHA `Bot Verification`).
2. Instalação real do PWA e navegação com TalkBack/VoiceOver em aparelhos físicos Android e iPhone.
3. Suíte E2E local no Firefox/WebKit (binários não instalados para Playwright `1.64.1`).
4. Build/deploy real em produção do ramo `release/v1.0.0-rc1` (aguarda aval R7 do dono para não disparar coleta nem alterar produção antes da decisão de domínio).
5. Google Search Console (sem acesso nesta sessão).

---

## 10. Riscos Residuais e Próximos Passos

1. **Novas ementas sensíveis publicadas pela Câmara:** janela de até 12 h ou até próxima auditoria com `npm run auditar:heuristicas` (mitigado por canal de pedido LGPD e sentinela).
2. **Estado vazio em `/comparar` (`ACH-13`, P3):** quando um vereador não tem pedidos classificados (ocorre na amostra reduzida), os dois títulos inferiores ficam sem texto explicativo; corrigir após `1.0.0`.
3. **Bairros com nomes próximos** (`Andrade` × `Residencial Andrade`, `Ipê` × `Ipê I`): aguardam confirmação local para `src/lib/content/bairros.ts`.

---

## 11. O que o Dono Precisa Fazer (com Cliques)

1. **Remover domínios extras na Vercel (1 min):**
   - Acesse **Vercel** → projeto **`acompanhe-seu-vereador`** → **Settings** → **Domains** → em `camara-a-vista.vercel.app`, clique em **`⋯`** → **Remove** (ou autorize o agente a rodar `vercel domains rm` via CLI).
   - Em **Vercel** → projeto **`osb-pinda-camara-1s2026`** → **Settings** → **General** → **Delete Project** (ou Pause/Remove).
2. **Decidir Missão C (endereço definitivo gratuito):**
   - **Recomendação:** manter `https://acompanhe-seu-vereador.vercel.app` no lançamento `1.0.0` (sem perder histórico nem quebrar PWA) e enviar ao OSB Nacional a mensagem pronta em `07-legal-para-revisao-humana.md` pedindo o subdomínio gratuito (`vereadores.pindamonhangaba.osbrasil.org.br` ou similar). Informar também se prefere manter Vercel ou tornar a **VPS (`0,136s`)** o endereço canônico futuro.
3. **Autorizar publicação da `1.0.0`:** confirmar merge de `release/v1.0.0-rc1` → `main` e tag `v1.0.0` (disparará o build real na Vercel e o espelho atualizado na VPS com verificação final de `/api/health` e ensaio de rollback).
4. **Opcional (recomendado):** configurar `VERCEL_DEPLOY_HOOK_URL` (Vercel → **Settings → Git → Deploy Hooks** → criar hook `atualizar-dados` na `main` → salvar como secret no GitHub) para parar de gerar 2 commits diários no histórico.
