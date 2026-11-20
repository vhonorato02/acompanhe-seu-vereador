# 08 — Relatório Final da Auditoria (18/11/2026)

## 1. Estado Atual e Por quê

**Estado:** **`RELEASE v1.0.0`** (validado localmente nas Rodadas 1–3, com limpeza de domínios executada na Vercel e publicação na `main` + prova em produção). `[OBSERVADO]`

O código auditado passou em todas as verificações automatizadas e independentes das Rodadas 1–4 (lint AST, typecheck, `npm audit = 0`, 145 testes unitários/contrato, 6/6 mutantes mortos na Rodada 1, build `Next.js 16.4.6`, 195 testes E2E/axe com `--workers=2`, `158/158` arquivos cobertos e reconciliação de Missão A sobre os registros reais), e os endereços duplicados `camara-a-vista.vercel.app` e `osb-pinda-camara-1s2026.vercel.app` foram removidos e comprovados em `404`. Restam como ações exclusivas de governança humana e física:
1. Revisão jurídica e deliberação da Diretoria do OSB sobre `/privacidade`, `/termos`, retratos oficiais em cores originais, autorização da marca/CNPJ e estratégia de longo prazo de hospedagem/domínio (`[DECLARADO]` — detalhado em [docs/GUIA-DO-OBSERVATORIO.md](../../GUIA-DO-OBSERVATORIO.md) §7 e [07-legal-para-revisao-humana.md](07-legal-para-revisao-humana.md)).
2. Validar instalação PWA e leitura de tela em aparelhos físicos iOS/Android (`[BLOQUEADO]` nesta bancada).

---

## 2. O que o Produto é de Verdade

Portal cívico estático/ISR-like do **Observatório Social do Brasil – Pindamonhangaba** para acompanhamento das proposições e normas da Câmara Municipal de Pindamonhangaba na legislatura 2025–2028 (`17.545+` proposições, `409+` normas, `11` vereadores em exercício). `[OBSERVADO]`

Funciona sem banco de dados, sem CMS e sem login: coleta no build de produção da Vercel pela API oficial SoftCam (`/jsonweb/web-aplicativo.php`), publica dados abertos em CSV/JSON no endereço único `https://acompanhe-seu-vereador.vercel.app` (decisão do dono em `18/11/2026`, [ADR 0005](../../adr/0005-hospedagem-unica-vercel.md)), exibe todos os vereadores em ordem alfabética e fotos em cores originais com círculo uniforme (sem ranking ou cor partidária) e garante o invariante de que **todo número clicável abre a lista exata que o compõe**, com link para o documento oficial da Câmara. `[OBSERVADO]`

---

## 3. As Piores Coisas Encontradas e o que foi Feito

| # | Achado | Sev. | O que foi feito nesta auditoria |
|---|---|---|---|
| 1 | **`ACH-01` — Exposição de dados sensíveis de saúde (LGPD):** varredura sobre os 17.545 registros revelou 3 requerimentos (`130774`, `132682`, `134695`) citando nome completo de paciente, patologia rara/dieta ou prontuário médico. | **P0** | Omitidas preventivamente as 3 ementas em `src/lib/content/omissoes.ts` (sem citar nomes), atualizada `/privacidade` (`vigenciaPoliticas: 2026-11-18`) e adicionada sentinela LGPD a `scripts/auditar-heuristicas.ts`. `[OBSERVADO]` |
| 2 | **`ACH-10` — Domínio `camara-a-vista.vercel.app` e projeto `osb-pinda-camara-1s2026`:** respondiam `200 OK` na Vercel com nomes que remetem à Câmara/OSB. | **P1** | `camara-a-vista.vercel.app` removido via Vercel CLI e `osb-pinda-camara-1s2026` deletado em 18/11/2026 (`HTTP 404` comprovado em ambos). `[OBSERVADO]` |
| 3 | **`ACH-02` — Violação de "número = lista" em `/comparar`:** exibia `leisDeProjetos.length` (pares lei-projeto, inflado e sem link). | **P1** | Corrigido em `src/app/comparar/page.tsx` para usar `x.nProjetosLei` com link `lei=1`, removido `leisDeProjetos` de `painel.ts` e coberto em `e2e/jornadas.spec.ts`. `[OBSERVADO]` |
| 4 | **`ACH-04` — `next@16.4.3` vulnerável em produção:** 2 CVEs moderadas abertas (`GHSA-mfr8-8qww-v76h`, `GHSA-vc7v-qv4w-wrv8`). | **P1** | Atualizado `next` para `16.4.6` (`--save-exact`) e `version` para `1.0.0`; `npm audit` caiu para **0 vulnerabilidades**. `[OBSERVADO]` |
| 5 | **`ACH-03` — Produção não provava código no ar:** `/api/health` omitia versão e SHA. | **P2** | Adicionados `versao` (`1.0.0`) e `sha` curto em `/api/health` + testes unitário e E2E. `[OBSERVADO]` |
| 6 | **`ACH-05` — Ausência total de linter no projeto e CI:** regras contra `any` e `catch` vazio não eram checadas. | **P2** | Criado `scripts/lint.ts` via AST do TypeScript (zero dependências novas) e adicionado passo bloqueante no `quality-gates.yml`. `[OBSERVADO]` |
| 7 | **`ACH-07` / `ACH-08` — Superfície de permissão excessiva:** `atualizar-dados.yml` dava `contents: write` ao workflow inteiro; `.claude/settings.json` liberava `Bash` e `mcp__Vercel` irrestritos. | **P2** | Restringido `contents: write` só ao job `disparar`; restringidas permissões em `.claude/settings.json`; `deploy-vps.yml` descomissionado na Rodada 2 ([ADR 0005](../../adr/0005-hospedagem-unica-vercel.md)). `[OBSERVADO]` |
| 8 | **`ACH-06` — Script órfão quebrado (`scripts/icones.mjs`):** importava `sharp` (inexistente) e lia `icon.svg` apagado. | **P2** | Script removido; `tests/sw-precache.test.ts` ampliado para checar assinatura PNG e dimensões IHDR dos 7 ativos reais. `[OBSERVADO]` |
| 9 | **`ACH-09` — Lacuna de SLA:** `/correcoes` não tinha prazo explícito. | **P2** | Declarado prazo de 15 dias em `/correcoes`; guarda `ESPELHO=1` removida após descomissionamento da VPS ([ADR 0005](../../adr/0005-hospedagem-unica-vercel.md)). `[OBSERVADO]` |
| 10 | **`ACH-12` / `ACH-11` — Documentação desatualizada e risco contratual Vercel Hobby:** `CLAUDE.md` citava `0.3.0` e "sem SW"; `HANDOFF` citava `zewithane-vps`; Vercel Hobby proíbe uso institucional não-pessoal. | **P2** | Documentação consolidada (`docs/environment.md` removido, `HANDOFF.md` único, [ADR 0005](../../adr/0005-hospedagem-unica-vercel.md) publicado), risco Vercel Hobby registrado em `07-legal-para-revisao-humana.md` e opção de VPS econômica (~R$ 30/mês) explicada em [`docs/GUIA-DO-OBSERVATORIO.md`](../../GUIA-DO-OBSERVATORIO.md). `[OBSERVADO]` |
| 11 | **`ACH-13` / `ACH-14` — Rodada 2 (UI, UX, A11y, SEO, Meta, Legal e VPS off):** `/comparar` mostrava cabeçalhos vazios na amostra; faltavam `forced-colors`, `@media print`, `scroll-padding-bottom` mobile, Label-in-Name em chips, `SearchAction`, `BreadcrumbList`, menção a arts. 14/20 LGPD e Lei 9.504/1997, e havia 6 arquivos exclusivos de VPS. | **P2/P3** | `ACH-13` resolvido em `/comparar`; aplicados `forced-colors`, `@media print`, sublinhado `aria-current`, `.chip.ativo` em `PaginaLista.tsx`, `Rede.tsx` c/ iniciais e `<title>`, `/404` navegável, `colorScheme` + `BreadcrumbList` + `SearchAction` + `llms.txt` ampliado, blindagem LGPD/eleitoral e [ADR 0005](../../adr/0005-hospedagem-unica-vercel.md). `[OBSERVADO]` |
| 12 | **`ACH-15` — Rodada 3 (pt-BR, privacidade de busca, CI e Guia do Observatório):** "1 projetos" e rodapé com palavra faltante; `/api/busca` sem `private, no-store` nem `X-Robots-Tag: noindex, nofollow`; apelidos históricos ignorados em cards de vereadores; ausência de `role="alert"` na busca; `npm audit --audit-level=high`; falta de manual humano único para o Observatório. | **P2** | Concordância pt-BR no rodapé e em 6 telas/gráficos, `/api/busca` com `private, no-store` + `X-Robots-Tag: noindex, nofollow`, `APELIDOS` na busca de vereadores, `role="alert"` + teto `q=120`, CI em `audit-level=moderate` e criação de [`docs/GUIA-DO-OBSERVATORIO.md`](../../GUIA-DO-OBSERVATORIO.md). `[OBSERVADO]` |
| 13 | **`ACH-16` — Rodada 4 (Fotos coloridas + reescrita didática e humana do portal e `.md`):** fotos tinham `filter: grayscale(1)` e páginas/documentos usavam linguagem resumida e termos como `API`, `CSV` e `JSON` sem explicação cidadã. | **P2** | Removidos os 5 filtros `grayscale(1)` em `globals.css` (mantendo círculo uniforme sem ranking); reescritas profundas e didáticas de `/como-funciona`, `/metodologia`, `/dados`, `/sobre`, `/correcoes`, `/privacidade`, `/termos`, `glossario.ts`, páginas de lista e manuais `.md`; adicionado teste E2E de foto colorida. `[OBSERVADO]` |

---

## 4. O que a Documentação Antiga Dizia e Era Falso

1. `CLAUDE.md` afirmava `"0.3.0 em produção"` e `"PWA sem service worker"` — o pacote já estava em `0.5.0` e o service worker `public/sw.js` roda desde a `0.4.0`. `[OBSERVADO]`
2. `HANDOFF.md` instruía operar a VPS via `ssh zewithane-vps` e rodar Playwright em `Z:\Dev\.cache\ms-playwright` — nenhum dos dois existe no ambiente local. `[OBSERVADO]`
3. O ciclo 3 declarava `"número = lista"` totalmente resolvido após `C01`, mas `/comparar` continuava exibindo contagem sem link baseada em pares projeto-lei. `[OBSERVADO]`
4. `CLAUDE.md` prometia proibição de `any` e `catch` vazio, mas não existia nenhum linter ou verificação automatizada no repositório. `[OBSERVADO]`
5. A política de privacidade afirmava não tratar dados sensíveis e `OMISSOES` estava vazio, mas 3 requerimentos em produção exibiam prontuário/patologia de cidadãos identificados. `[OBSERVADO]`
6. O `picomatch` (`4.0.7`) não disparava vulnerabilidade no `npm audit` (apenas `next@16.4.3` falhava); já a VPS, embora operacional na abertura da auditoria (`0,136s`), foi descomissionada do repositório por decisão do dono em `18/11/2026` ([ADR 0005](../../adr/0005-hospedagem-unica-vercel.md)). `[OBSERVADO]`

---

## 5. Números de Cobertura

| Dimensão | Total | Auditados / Executados | Aprovados | Falhos | Bloqueados | N/A |
|---|---:|---:|---:|---:|---:|---:|
| Arquivos rastreados (`git ls-files`) | 158 | 158 (`100%`) | 158 | 0 | 0 | 0 |
| Rotas/entradas Next.js (`src/app/`) | 25 entradas (`17` páginas + `3` APIs + `5` meta/404) | 25 (`100%`) | 25 | 0 | 0 | 0 |
| Jornadas/fluxos (`livro-fluxos.csv`) | 14 | 12 | 12 (1 c/ ressalva) | 0 | 2 (`J13`, `J14`) | 0 |
| Testes unitários/contrato (Vitest) | 145 (17 arquivos) | 145 | 145 | 0 | 0 | 0 |
| Mutantes no núcleo de domínio (Rodada 1) | 6 | 6 | 6 mortos (`100%`) | 0 | 0 | 0 |
| Testes E2E Chromium (3 viewports + axe) | 195 | 195 | 195 | 0 | 0 | 0 |
| Missão A — recortes e amostra real | 30 recortes + 30 itens + 60 fixtures | 120 | 120 | 0 | 0 | 0 |

---

## 6. O que Mudou (Código, Infra, Git)

- **Branch principal (`main`):** publicação inicial `v1.0.0` (`7e2bc8e`) seguida da Rodada 4 (`356d558` e fechamento de QA/dossiê).
- **Rodada 1 (auditoria profunda e correções iniciais):** commits `1b1dace` (`ACH-01`), `d92f567` (`ACH-02`), `414d142` (`ACH-03`), `666cf7f` (`ACH-04`), `758b833` (`ACH-05`), `9b6502a` (`ACH-06`), `9fd1b57` (`ACH-07`), `89fd430` (`ACH-08`), `49b8d7b` (`ACH-09`), `0be0454` (Missão A) e `6976c91` (dossiê inicial).
- **Rodada 2 (hospedagem única Vercel + UI/UX/A11y/SEO/Legal/Docs):** commits `c4ba308` ([ADR 0005](../../adr/0005-hospedagem-unica-vercel.md), remoção dos 6 arquivos exclusivos da VPS), `d0e3788` (`ACH-13`, `ACH-14`) e `ea1b8e5` (atualização do dossiê).
- **Rodada 3 (limpeza Vercel, pt-BR, privacidade de busca, CI, Guia do Observatório):** limpeza via Vercel CLI (`camara-a-vista.vercel.app` removido e `osb-pinda-camara-1s2026` excluído — ambos retornando HTTP `404`), correções `ACH-15` (`954037a`), novo guia [`docs/GUIA-DO-OBSERVATORIO.md`](../../GUIA-DO-OBSERVATORIO.md) (`47161fc`), dossiê (`b7a0fb1`), merge em `main` (`7e2bc8e`) e tag `v1.0.0`.
- **Rodada 4 (fotos em cores originais + profundidade didática e clareza humana):** remoção dos 5 filtros `grayscale(1)` em `globals.css` (mantendo círculo uniforme sem ranking), reescrita didática integral das páginas institucionais/legais (`/como-funciona`, `/metodologia`, `/dados`, `/sobre`, `/correcoes`, `/privacidade`, `/termos`, `glossario.ts`), melhoria do texto da capa/perfis/listas, testes unitário e E2E de retrato colorido e aprofundamento dos documentos `.md` (`356d558`, `ACH-16`).

---

## 7. Versões Antes e Depois

- **Aplicação:** `0.5.0` → **`1.0.0`** (publicada em `main` com tag `v1.0.0` e atualizada na Rodada 4).
- **`next`:** `16.4.3` → **`16.4.6`** (`0` vulnerabilidades no `npm audit --audit-level=moderate`).
- Demais dependências travadas em `package-lock.json`: `react` `19.3.1`, `zod` `4.6.7`, `typescript` `5.9.3`, `vitest` `5.0.5`, `@playwright/test` `1.64.1`.

---

## 8. Segurança e Legal: Corrigido × Pendente de Humano

- **Corrigido tecnicamente (`[OBSERVADO]`):** 3 omissões LGPD de saúde em `omissoes.ts`, sentinela LGPD em `auditar-heuristicas.ts`, prazo de 15 dias em `/correcoes`, `/privacidade` atualizada e didática (Vercel como operadora única + arts. 14, 20 e 33 da LGPD), `/termos` atualizado (fotos em cores originais §5 e Lei nº 9.504/1997 §6), `/api/busca` com `Cache-Control: private, no-store` e `/api/*` com `X-Robots-Tag: noindex, nofollow`, atualização `next@16.4.6` + CI em `audit-level=moderate`, lint AST bloqueante e menor privilégio em `atualizar-dados.yml` e `.claude/settings.json`.
- **Pendente de humano (`[DECLARADO]` — ver `07-legal-para-revisao-humana.md` e `docs/GUIA-DO-OBSERVATORIO.md`):**
  1. Revisão por advogado/DPO de `/termos`, `/privacidade` e cópia local dos retratos oficiais em cores originais dos vereadores.
  2. Confirmação formal pelo OSB Pindamonhangaba do uso da marca, logotipo, CNPJ e leitura da caixa `pindamonhangaba@osbrasil.org.br`.
  3. Confirmação de elegibilidade do plano Hobby da Vercel junto ao suporte/termos para associação sem fins lucrativos ou migração futura para plano Pro / VPS econômica (~R$ 30/mês), detalhada em [`docs/GUIA-DO-OBSERVATORIO.md`](../../GUIA-DO-OBSERVATORIO.md) (`ACH-11`).

---

## 9. O que Não Foi Possível Provar (`[BLOQUEADO]`)

1. Conferência visual direta das 30 proposições no HTML da Câmara (`pindamonhangaba.sp.leg.br` retorna LiteSpeed reCAPTCHA `Bot Verification`).
2. Instalação real do PWA e navegação com TalkBack/VoiceOver em aparelhos físicos Android e iPhone.
3. Suíte E2E local no Firefox/WebKit (binários não instalados para Playwright `1.64.1`).
4. Google Search Console (sem acesso nesta sessão).

---

## 10. Riscos Residuais e Próximos Passos

1. **Novas ementas sensíveis publicadas pela Câmara:** janela de até 12 h ou até próxima auditoria com `npm run auditar:heuristicas` (mitigado por canal de pedido LGPD e sentinela).
2. **Bairros com nomes próximos** (`Andrade` × `Residencial Andrade`, `Ipê` × `Ipê I`): aguardam confirmação local para `src/lib/content/bairros.ts`.
3. **Desligamento externo da VPS antiga:** embora removida do repositório ([ADR 0005](../../adr/0005-hospedagem-unica-vercel.md)), o contêiner antigo `vereador` na VPS externa pode ser desligado quando o dono desejar para não servir versão congelada.

---

## 11. O que a Diretoria e o Dono Precisam Fazer (Pós-Publicação)

1. **Limpeza na Vercel (`[OBSERVADO]` concluída em 18/11/2026):** `camara-a-vista.vercel.app` foi removido de `acompanhe-seu-vereador` e `osb-pinda-camara-1s2026` foi excluído via Vercel CLI (ambos em HTTP `404`; apenas `acompanhe-seu-vereador.vercel.app` permanece).
2. **Revisão jurídica e institucional (OSB + advogado/DPO):** ler [`docs/GUIA-DO-OBSERVATORIO.md`](../../GUIA-DO-OBSERVATORIO.md) e [`07-legal-para-revisao-humana.md`](./07-legal-para-revisao-humana.md) para validar termos, privacidade, retratos oficiais em cores originais, canal `pindamonhangaba@osbrasil.org.br`, eventual domínio próprio (`.org.br`) e a escolha entre Vercel Hobby / Vercel Pro / VPS simples (~R$ 30/mês).
3. **Opcional (higiene operacional e técnica):** configurar `VERCEL_DEPLOY_HOOK_URL` (Vercel → **Settings → Git → Deploy Hooks** → criar hook `atualizar-dados` na `main` → salvar como secret no GitHub) para parar de gerar 2 commits diários no histórico; desligar o contêiner antigo `vereador` na VPS fora deste repo; testar instalação PWA e leitor de tela em aparelho físico.
