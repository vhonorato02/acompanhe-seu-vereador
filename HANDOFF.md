# HANDOFF — Acompanhe seu Vereador

> Arquivo de continuidade entre sessões. Atualize ao fim de cada bloco de trabalho.
> Última atualização: 2026-10-24 (v1 publicada).

## Onde estamos

- **v1 em produção** na Vercel, projeto `acompanhe-seu-vereador` (id `prj_tduqr6ZAVAtyEGz5mJJ5JgbTOaZe`, team `team_43xSvVJZ9lHuy6K7NNxlMhXG`), ligado ao repositório `vhonorato02/obs-vereador`, **branch de produção `main`**.
- Por decisão do dono: trabalho direto na `main`, sem PR.
- **Endereço: https://acompanhe-seu-vereador.vercel.app** (público).
- Primeira coleta (24/10/2026): 16.822 proposições e 397 normas desde 01/01/2025, 377 consultas, build de 10 min. Coletas seguintes incrementais: ~1 min.
- Reconciliação com o Power BI: 2025 bate exatamente; confirmada a contagem de coautoria por coautor (`docs/research/power-bi.md` §9).

## Decisões do dono (24/10/2026)

1. Só Pindamonhangaba (Observatório e Câmara).
2. Só free tier: sem cartão, sem domínio comprado, sem IA paga.
3. Portal para acompanhar todos os vereadores, não clone do site da Câmara.
4. **Sem votações** (e, por consequência, sem presença) na v1.
5. **Atualização quinzenal feita pelo dono**: Vercel → Deployments → produção → ⋯ → Redeploy (com build cache).
6. Implementar e publicar direto em produção, na `main`.

## Arquitetura real da v1 (mais simples que o plano da Fase 1)

- Sem banco, sem admin, sem login. O plano previa Neon + Better Auth + GitHub Actions; com sem votações, atualização manual quinzenal e uma única fonte (API), nada disso se pagava.
- `scripts/collect.ts` roda no `prebuild` da Vercel, consulta a API com `CAMARA_API_TOKEN` (variável sensível da Vercel, só produção) e gera `data/generated/dataset.json` + `public/dados/` + `public/fotos/`.
- Coleta incremental usando `.next/cache/acompanhe/coleta.json` (cache de build da Vercel); completa a cada 30 dias ou com `COLETA_COMPLETA=1`.
- Qualquer falha (resposta vazia, anti-robô, formato, queda de volume) **falha o build** → a Vercel mantém a versão anterior no ar.
- Sem token fora de produção: usa `fixtures/camara-amostra.json` (amostra real) e mostra aviso.
- Detalhes da API: `docs/research/camara-api.md`.

## Produto (v2, 24/10/2026): experiência com os dados

- **Panorama** (`/`): sete histórias com gráficos (pedidos × projetos, ritmo mensal, assuntos, bairros, destinatários, do projeto à lei, rede de coautoria) + cartões dos 11 vereadores com faixa mensal.
- **Raio-X** (`/vereadores/[slug]`): fatos, seletor de ano, ritmo por tipo, assuntos com a proporção da Câmara como referência, bairros, rede, projetos que viraram lei.
- **Comparar** (`/comparar?v=a&v=b`): até 3, mesma escala.
- **Bairros** (`/bairros`, `/bairros/[slug]`): bairros citados ≥ 3 vezes.
- Informações derivadas (regras em `src/lib/data/temas.ts` e `extrair.ts`) são rotuladas na tela e explicadas em `/metodologia`.
- Tudo passa pelo filtro único de `src/lib/data/query.ts` (testes garantem número = lista).
- Paleta dos gráficos validada para daltonismo (claro/escuro) com a skill de dataviz.
- Crítica e pendências de design: `docs/design/critica.md`.

## Comandos

`npm install` · `npm run collect` · `npm run dev` · `npm test` · `npm run typecheck` · `npm run build`

## Auditoria 04/11/2026: ciclo 1 e publicação controlada

- **Auditoria versionada:** [docs/auditoria/2026-11-04-ciclo-1.md](docs/auditoria/2026-11-04-ciclo-1.md), com achados, riscos P1/P2, testes realizados e bloqueios não disfarçados de aprovação.
- **Baseline anterior da produção:** commit `54daed185fb7310303106b47d9a441fecab8f60b`; deployment `dpl_CkuHxDuciQ4H59XZwasrfJP6tKJn` (24/10/2026). Era o último snapshot publicado ao começar a auditoria, com 16.822 proposições e 397 normas.
- **Correções já enviadas à `main`:** commit `703c11c2f7cff3cd65494915a96107fed35f0e18`. CSV resistente à interpretação de fórmulas; fotos apenas da origem oficial com limite de 5 MiB, assinatura e timeout; links recebidos da API restritos à Câmara; erros de rede sem vazamento de URL do token; proteção contra primeira página vazia; QA do GitHub Actions e texto metodológico.
- **CI executada:** 70 testes, typecheck e build com **fixture de desenvolvimento**, aprovados na `main` ([run 41957926135](https://github.com/vhonorato02/obs-vereador/actions/runs/41957926135)). Isso não comprova coleta atual ou QA interativo real.
- **Novo deployment acionado:** `dpl_ALemJf7XU5NhA4wq34WZURUQheCo`, SHA `703c11c`, com coleta oficial completa. Verificar se ficou `READY`, a data e os totais do novo snapshot na URL pública antes de chamar o rollout de concluído. Se falhar, preservar deployment anterior.
- **Pin de runtime preparado separadamente:** `engines.node=24.x`, lockfile e CI Node 24, validados no branch `audit/2026-11-04-integridade` ([run 41958148886](https://github.com/vhonorato02/obs-vereador/actions/runs/41958148886)). Não enviar outra atualização à `main` enquanto o build completo de produção anterior estiver em andamento, para não interrompê-lo.
- **Não confundir com `stable`:** a auditoria completa de E2E/browser, WCAG, responsividade, desempenho, PWA, direitos de imagem, SEO e reconciliação completa não foi executada; sem tag stable.
- **Configuração pendente do GitHub:** repository default branch ainda aponta para `ccr-7efe4374-h0pmz6`. Alterar em Settings → General → Default branch → `main`. Branch de produção na Vercel já é `main`.
- **Arquitetura mantida:** sem banco, admin, CMS ou VPS. Coleta quinzenal manual; plataforma gratuita; neutralidade editorial.

## Próximos passos possíveis

1. Mostrar no site (metodologia) a reconciliação com o Power BI, que já está em `docs/research/power-bi.md` §9.
2. Despesas da Câmara, diárias e emendas impositivas (SIAPE GOV / TCE-SP) — exige capturar parâmetros da API do SIAPE (H8).
3. Histórico 2021–2024 (a API tem décadas de dados).
4. Presença/votações só se a Câmara publicar na API ou o dono topar enviar as atas.
5. Concluir o inventário histórico interrompido (`camara-api.md`).

## Limites de segurança (não contornar)

- Nunca contornar o anti-robô da Câmara; o coletor para se o detectar.
- O classificador bloqueia proxy de terceiros, variação de User-Agent contra o anti-robô e edição das próprias permissões.
- Token só na Vercel; nunca em commit, log ou chat.

## Identidade Git

Local ao repo: `José Victor Honorato <33707633+vhonorato02@users.noreply.github.com>`. Sem assinaturas de IA.

## Google Drive

Pasta "Acompanhe seu Vereador" (id `1gmzfL0UGzy6z1UjNQsQDHIe0y_4r6rSK`). A fonte de verdade é o repositório.
