# 01 — Inventário do Produto, Topologia e Matriz de Módulos (Fase 1)

## 1. Produto Real

- **Nome e titularidade:** *Acompanhe seu Vereador — Pindamonhangaba*, atribuído ao **Observatório Social do Brasil – Pindamonhangaba** (CNPJ `30.197.903/0001-75`, `pindamonhangaba@osbrasil.org.br`). `[DECLARADO]` (autorização formal de marca/CNPJ aguarda confirmação do dono).
- **Função real observada no código e no ar:** portal cívico apartidário estático/ISR-like por coleta de build, sem banco de dados, sem login/CMS e sem área administrativa. Exibe 11 vereadores em exercício (ordem alfabética, fotos em P&B), **17.545** proposições e **409** normas desde 01/01/2025 (coleta de `2026-11-18T04:17:33.473Z`), com busca instantânea (`/api/busca`), gráficos de proporção/evolução/rede de coautoria, comparação lado a lado (`/comparar`), índice de bairros citados, exportação em CSV/JSON (`/dados`) e guia de metodologia/LGPD/termos. `[OBSERVADO]`
- **Não implementa (decisão explícita de v1):** votações nominais, presença em plenário e histórico de tramitação ou legislaturas anteriores. `[OBSERVADO]`

## 2. Topologia Real Observada (de fora para dentro)

| Camada | Endereço / Recurso | Estado real em 18/11/2026 | Observação |
|---|---|---|---|
| Produção canônica | `https://acompanhe-seu-vereador.vercel.app` | **200 OK** (TTFB `0,245s`, POP `gru1` → função `iad1`) `[OBSERVADO]` | Coleta executa no `prebuild` (`scripts/collect.ts`) com `CAMARA_API_TOKEN` (somente produção). Coleta de `2026-11-18T04:17:33.473Z`, `0` avisos. |
| Sobra indevida 1 | `https://camara-a-vista.vercel.app` | **200 OK** (cópia completa do portal) `[OBSERVADO]` | Sobra do ciclo 2; `vercel project ls` ainda a lista como `Latest Production URL`. Risco de parecer site oficial da Câmara e fragmentar acesso. |
| Sobra indevida 2 | `https://osb-pinda-camara-1s2026.vercel.app` | **200 OK** (`"placeholder"`, 11 bytes, indexável) `[OBSERVADO]` | Projeto antigo na mesma conta Vercel; usa sigla OSB e "camara". |
| Cópia na VPS (histórico) | `https://vereador.zewithane.vps.brz.dev.br` | **200 OK** em 18/11 (pré-descomissionamento) `[OBSERVADO]` | **Descomissionada do repositório por decisão do dono em 18/11 ([ADR 0005](../../adr/0005-hospedagem-unica-vercel.md)):** portal opera exclusivamente na Vercel (`acompanhe-seu-vereador.vercel.app`). |
| Host antigo errôneo | `vereador.zehonorato.vps.brz.dev.br` | DNS não resolve externamente `[OBSERVADO]` | Documentado como erro revertido em `2c4ecaf`. |
| Fonte oficial | `https://www.pindamonhangaba.sp.leg.br/jsonweb/web-aplicativo.php` | API `/jsonweb/` acessível na Vercel (`iac1`/`gru1`) `[OBSERVADO]` | Páginas HTML da Câmara disparam LiteSpeed reCAPTCHA (`Bot Verification`) na VPS e em IP local. |
| Automação CI/CD | `.github/workflows/*.yml` | `atualizar-dados.yml` (horário), `vigia-dados.yml` (3x/dia, checa manifesto + `/api/health` na Vercel), `quality-gates.yml` (PR/push), `source-probe.yml` `[OBSERVADO]` | `deploy-vps.yml` removido na rodada final conforme ADR 0005; `quality-gates` inclui lint AST bloqueante. |

## 3. Matriz de Aplicabilidade dos Módulos (M1–M16)

| Módulo | Decisão | Justificativa baseada em evidência |
|---|---|---|
| **M1** Produto e negócio | **Aplica** | Portal cívico público com missão explícita de transparência sem ranking; comparar com referências reais (`Chicago Councilmatic`, `OpenParliament.ca`, `TheyWorkForYou`, `Câmara dos Deputados`) |
| **M2** Design e redação | **Aplica** | Sistema visual próprio (tokens CSS em `globals.css`, modo claro/escuro, sem hex solto, gráficos acessíveis, pt-BR) |
| **M3** Acessibilidade | **Aplica** | Obrigatório pela LBI (Lei 13.146/2015, art. 63) e WCAG 2.2 AA |
| **M4** Arquitetura e código | **Aplica** | Next.js 16.4 App Router, TypeScript strict, Zod, separação coleta/domínio/UI |
| **M5** Dados e integridade | **Aplica (sem banco)** | Banco SQL é N/A (dataset estático em JSON gerado por coleta atômica); integridade `número = lista`, plausibilidade e proveniência aplicam integralmente |
| **M6** Segurança | **Aplica** | Headers (CSP/HSTS/COOP), SSRF em download de fotos, formula-injection em CSV, cadeia de suprimentos (CI/Dependabot/settings), sem login/admin |
| **M7** Legal (Brasil) | **Aplica (nível alto)** | Dados de pessoas públicas, ementas citando cidadãos comuns e pacientes (LGPD dados sensíveis de saúde), período eleitoral (Lei 9.504/1997), termos Vercel Hobby |
| **M8** CMS e editorial | **N/A** | Não existe CMS, login, painel editorial nem banco de conteúdo; todo texto vive no código versionado |
| **M9** SEO e descoberta | **Aplica** | 17 páginas + 3 APIs/texto + 5 metadados/404 (`robots`, `sitemap`, `manifest`, `opengraph-image`, `404`), JSON-LD (`NGO`, `WebSite` + `SearchAction`, `Dataset`, `Person`, `BreadcrumbList`) e `llms.txt` |
| **M10** PWA e mobile | **Aplica** | Há `manifest.ts`, `public/sw.js` e `/offline` (ADR 0004); exige validar comportamento offline honesto e tabbar mobile |
| **M11** Performance e custo | **Aplica** | Free tier Vercel Hobby; busca sobre 17.545 registros em memória e orçamento de bundle |
| **M12** Infraestrutura e deploy | **Aplica** | Hospedagem única na Vercel (`ADR 0005`), health check (`/api/health`) e rollback de deployment na Vercel |
| **M13** CI/CD e Git | **Aplica** | Workflows (`atualizar-dados`, `vigia-dados`, `quality-gates`, `source-probe`), gates bloqueantes, PR do Dependabot, proteção e commits automáticos |
| **M14** Testes sob suspeita | **Aplica** | 17 arquivos Vitest + 4 specs Playwright; exige teste de mutação no núcleo e verificação de asserções |
| **M15** Documentação e agente | **Aplica** | Consolidada após remoção de `docs/environment.md` e criação de `ADR 0005` |
| **M16** Integrações externas | **Aplica em parte** | Apenas API SoftCam da Câmara e hospedagem Vercel; e-mail transacional, pagamento e analytics são N/A (inexistentes) |
