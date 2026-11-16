# HANDOFF — Acompanhe seu Vereador (Pindamonhangaba)

> Arquivo de continuidade entre sessões. Atualize ao fim de cada bloco de trabalho.
> Última atualização: 08/11/2026, madrugada (ciclo 5: termos, privacidade/LGPD, marca do Observatório, JSON-LD e llms.txt, versão 0.5.0).

## Onde estamos

- **Produção (canônico):** https://acompanhe-seu-vereador.vercel.app — o domínio público continua na Vercel por decisão do dono (07/11).
- **Cópia na VPS zewithane:** https://vereador.zewithane.vps.brz.dev.br (site `vereador` da `vps-platform`, 256 MB, sem banco, `noindex`). Espelha os dados abertos da Vercel, validados; nunca fala com a Câmara. Workflow `deploy-vps.yml` (após cada atualização e cada push); operação: `ssh zewithane-vps 'site lista; site logs vereador 100; site rollback vereador'`.
- **Vercel:** projeto `acompanhe-seu-vereador` (id `prj_tduqr6ZAVAtyEGz5mJJ5JgbTOaZe`, time `team_43xSvVJZ9lHuy6K7NNxlMhXG`), Node 24.x, branch de produção `main`.
- **GitHub:** `vhonorato02/acompanhe-seu-vereador` (antes `obs-vereador`; o GitHub redireciona). Branch padrão: `main` (corrigida em 06/11).
- Trabalho direto na `main`, sem PR, por decisão do dono — mas cada push dispara uma coleta real na Vercel: rode `npm test`, `npm run build` e `npm run test:e2e` antes.
- Publicação desta versão, SHA, deployment e coleta: ver “Última publicação” abaixo.
- Auditorias: [ciclo 1](docs/auditoria/2026-11-04-ciclo-1.md), [ciclo 2 — continuidade](docs/auditoria/2026-11-07-auditoria-continuidade.md), [ciclo 3 — redesenho e automação](docs/auditoria/2026-11-07-ciclo-3.md), [ciclo 4 — autonomia, PWA e busca](docs/auditoria/2026-11-07-ciclo-4.md) e [ciclo 5 — jurídico, marca e SEO/GEO](docs/auditoria/2026-11-08-ciclo-5.md).
- **Dados atualizam sozinhos ~2x/dia** (checagem de hora em hora, dispara com coleta de mais de 11 h) e um vigia 3x/dia abre issue `dados-desatualizados` se a coleta passar de 26 h ou a VPS ficar fora/atrasada — [guia](docs/operacao/atualizar-dados.md), [ADR 0003](docs/adr/0003-atualizacao-automatica.md).

## Última publicação

| Item | Valor |
|---|---|
| Versão | **0.5.0** |
| Commit | `bcd346f` na `main` (CI `quality-gates` verde; local: 140 unitários, 257 E2E em 5 perfis) |
| Coleta | 08/11/2026 03h26 (Brasília), **incremental**, nenhum aviso — Vercel e VPS com o mesmo `coletadoEm` |
| Totais | **17.205 proposições, 407 normas, 11 vereadores** |
| Cópia na VPS | `deploy-vps` run 42454646265, `/api/health` ok |
| Novidades | `/privacidade` e `/termos` (LGPD), omissão de ementa a pedido (`src/lib/content/omissoes.ts`), contato `pindamonhangaba@osbrasil.org.br`, logotipo e verde do Observatório, rodapé institucional (CNPJ, endereço), JSON-LD (NGO, WebSite, Dataset, Person) e `/llms.txt` |
| Agendador | **Provado:** 1ª execução `schedule` do `atualizar-dados` em 08/11 05h56 UTC (run 42452683022). **A verificar:** `vigia-dados` ainda sem execução `schedule` |

## Decisões do dono (24/10/2026, valem até nova decisão)

1. Só Pindamonhangaba (Observatório e Câmara).
2. Só free tier: sem cartão, sem domínio comprado, sem IA paga.
3. Portal para acompanhar a Câmara e todos os vereadores, não clone do site da Câmara.
4. Sem votações e sem presença.
5. ~~Atualização quinzenal feita pelo dono~~ → (07/11/2026) **atualização automática ~2x/dia** pelo GitHub Actions (checagem de hora em hora), com vigia 3x/dia — [ADR 0003](docs/adr/0003-atualizacao-automatica.md). O redeploy manual continua valendo como reserva.
6. Implementar e publicar direto na `main`.
7. (07/11/2026) Nome **Acompanhe seu Vereador — Pindamonhangaba**, do Observatório Social do Brasil – Pindamonhangaba; endereço `acompanhe-seu-vereador.vercel.app` — [ADR 0001](docs/adr/0001-identidade-do-projeto.md).
8. (07/11/2026) Visual **minimalista, preto e branco, destaques em verde, estilo Apple**: fonte do sistema, verde só no que se toca e no estado ativo, retratos em preto e branco para todos.

## Arquitetura

- Sem banco, admin, login, CMS ou VPS. Única rota própria de API: `/api/busca` (leitura).
- `scripts/collect.ts` roda no `prebuild` e chama `src/lib/coleta/coletar.ts`: consulta a API com `CAMARA_API_TOKEN` (variável sensível da Vercel, só produção), valida tudo com Zod, compara com a coleta anterior **e com o manifesto publicado**, grava numa área temporária e só então promove `data/generated/dataset.json`, `public/dados/` e `public/fotos/`.
- Cache incremental em `.next/cache/acompanhe/coleta.json` (nome antigo mantido de propósito; validado ao ler). Coleta completa a cada 30 dias ou com `COLETA_COMPLETA=1`.
- Qualquer falha (vazio, anti-robô, 4xx/5xx, 429 persistente, formato, paginação em loop, queda de volume > 10%) **falha o build** → a Vercel mantém a versão anterior.
- Sem token fora de produção: usa `fixtures/camara-amostra.json` (amostra real, ampliada em 07/11 com registros do snapshot de produção) e mostra aviso.
- Identidade (nome, endereço, repositório, contato) em `src/lib/site.ts`.
- Filtro único em `src/lib/data/query.ts`: todo número do site é `contar()` com o mesmo filtro da lista para a qual aponta (inclusive destinatário, coautoria e “virou lei”).
- Instalável, com service worker **só para estáticos** e página `/offline`; páginas e dados nunca vêm do cache — [ADR 0004](docs/adr/0004-service-worker-sem-dados.md) (substitui a [ADR 0002](docs/adr/0002-instalavel-sem-service-worker.md)). O precache de `public/sw.js` é conferido por `tests/sw-precache.test.ts`. Push: N/A justificado.

## Qualidade

| Camada | Onde | Estado em 08/11 |
|---|---|---|
| Unitários, contratos, integração do coletor e do espelho, tokens de design | `tests/` (Vitest) | 140 testes |
| E2E, acessibilidade (axe WCAG 2.2 AA), SEO, PWA, capturas | `e2e/` (Playwright) | 257 testes em 5 perfis emulados (inclui JSON-LD e `llms.txt`) |
| CI | `.github/workflows/quality-gates.yml` | npm ci, audit, varredura de segredos, typecheck, testes, build com amostra, E2E Chromium desktop + Android, artefatos |
| Revisão das heurísticas | `npm run auditar:heuristicas` | rodar a cada trimestre |

O CI usa a amostra rotulada: **não prova a coleta real**. A coleta real só é provada pelo build de produção da Vercel.

**Porta 3100 ocupada por outro projeto** (ex.: `cmdca-main`) faz o Playwright testar o site errado. Confira com `netstat -ano | grep :3100`; se estiver ocupada, rode `npx next start -p 3197 -H 127.0.0.1` e `E2E_URL=http://127.0.0.1:3197 npm run test:e2e`, e encerre o servidor no fim.

Para rodar o E2E localmente sem encher o C:, instale os navegadores no Z: (`PLAYWRIGHT_BROWSERS_PATH=Z:\Dev\.cache\ms-playwright npx playwright install chromium firefox webkit`) e use a mesma variável ao rodar `npm run test:e2e`.

## Rollback

1. Vercel → projeto `acompanhe-seu-vereador` → Deployments → escolha o último deployment de produção íntegro → ⋯ → **Promote to Production** (ou “Instant Rollback”). Funciona no plano gratuito.
2. Referências: `dpl_ALemJf7XU5NhA4wq34WZURUQheCo` (SHA `703c11c`, coleta de 05/11, nome antigo) é o último deployment anterior a esta versão.
3. Para desfazer código: `git revert` dos commits na `main` (nunca force push).

## Pendências reais (por prioridade)

0. **Vercel (só o dono consegue):** (a) remover o domínio `camara-a-vista.vercel.app` — Vercel → acompanhe-seu-vereador → Settings → Domains → ⋯ → Remove; hoje ele serve uma cópia do site. (b) Opcional: criar o deploy hook e o segredo `VERCEL_DEPLOY_HOOK_URL` (passo a passo em `docs/operacao/atualizar-dados.md`) para a atualização automática parar de gerar 2 commits/dia.
1. **Observatório:** (a) revisar `/termos` e `/privacidade` (advogado ou coordenação), em especial o prazo de 15 dias; (b) confirmar quem lê `pindamonhangaba@osbrasil.org.br` e atende pedidos de titular. Para atender uma omissão: acrescentar `{ chave: "<tipo>:<id>", desde, referencia }` em `src/lib/content/omissoes.ts` (nunca o nome) e publicar.
2. Teste em aparelho físico (Android/One UI e iPhone) e com leitor de tela real (TalkBack/VoiceOver) — só houve emulação.
3. Confirmar com quem conhece a cidade nomes de bairro parecidos ainda separados (“Andrade” × “Residencial Andrade”, “Ipê” × “Ipê I”, “Morumbi” × “Jardim Morumbi”) e acrescentar em `src/lib/content/bairros.ts`.
4. Opcional: renomear a pasta local `Z:\Dev\projetos\obs-vereador` para `acompanhe-seu-vereador` (fora do repositório; ajustar o projeto no T3 Code junto).
5. Evoluções fora do escopo atual (exigem decisão do dono): despesas/diárias/emendas (SIAPE/TCE), histórico 2021–2024, votações e presença.

## Limites de segurança (não contornar)

- Nunca contornar o anti-robô da Câmara; o coletor para se o detectar.
- Sem proxy de terceiros, sem variar User-Agent; o coletor se identifica como `AcompanheSeuVereador/1.1`.
- Token só na Vercel; nunca em commit, log ou chat.

## Identidade Git

Local ao repo: `José Victor Honorato <33707633+vhonorato02@users.noreply.github.com>`. Sem assinaturas de IA.

## Google Drive

Pasta "Acompanhe seu Vereador" (id `1gmzfL0UGzy6z1UjNQsQDHIe0y_4r6rSK`). A fonte de verdade é o repositório.
