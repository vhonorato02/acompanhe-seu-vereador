# HANDOFF — Acompanhe seu Vereador (Pindamonhangaba)

> **Documento único de estado** entre sessões. Atualize ao fim de cada bloco de trabalho.
> **Guia humano completo (para Diretoria, voluntários, jornalistas e jurídico):** [`docs/GUIA-DO-OBSERVATORIO.md`](docs/GUIA-DO-OBSERVATORIO.md).
> Última atualização: 18/11/2026 (Rodada 3 concluída, limpeza Vercel executada, preparação de publicação `v1.0.0`).

## Onde estamos

- **Produção única (Vercel):** https://acompanhe-seu-vereador.vercel.app
  - **Domínios antigos removidos na Vercel em 18/11/2026:** `camara-a-vista.vercel.app` (removido do projeto via CLI) e projeto `osb-pinda-camara-1s2026` (deletado) retornam `HTTP 404`.
  - **Coleta base de 18/11/2026:** **17.545 proposições, 409 normas, 11 vereadores**, modo `incremental`. A publicação da `v1.0.0` em `main` gera novo build com a coleta mais recente e expõe `versao: "1.0.0"` em `/api/health`.
- **Hospedagem única na Vercel ([ADR 0005](docs/adr/0005-hospedagem-unica-vercel.md)):** por decisão do dono em `18/11/2026`, o portal roda exclusivamente na Vercel e no domínio `acompanhe-seu-vereador.vercel.app`, com descomissionamento dos artefatos de cópia/espelho em VPS.
- **Vercel:** projeto `acompanhe-seu-vereador` (`prj_tduqr6ZAVAtyEGz5mJJ5JgbTOaZe`, time `jose-victors-projects-5cc9abbe` / `team_43xSvVJZ9lHuy6K7NNxlMhXG`), Node `24.x`.
- **GitHub:** `vhonorato02/acompanhe-seu-vereador`, branch padrão `main`. **Nunca empurre commits em série na `main`:** cada push na `main` dispara build de produção na Vercel com coleta real na Câmara. Valide sempre em ramo antes.
- **Automação:** `atualizar-dados.yml` (horário, dispara com > 11 h), `vigia-dados.yml` (3x/dia, limite 26 h, confere `/dados/manifesto.json` e `/api/health` na Vercel), `quality-gates.yml` (`npm audit --audit-level=moderate`, segredos, `lint`, `typecheck`, `test`, `build`, E2E). Guia operacional em [docs/operacao/atualizar-dados.md](docs/operacao/atualizar-dados.md) e [ADR 0003](docs/adr/0003-atualizacao-automatica.md).

## O que entrou até a v1.0.0 (18/11/2026)

- **Hospedagem única (ADR 0005):** descomissionados `Dockerfile`, `.dockerignore`, `deploy-vps.yml`, `scripts/espelhar.ts`, `src/lib/espelho/espelhar.ts`, `tests/espelho.test.ts`, guardas `ESPELHO=1` e domínios duplicados na Vercel (`camara-a-vista.vercel.app` + projeto `osb-pinda-camara-1s2026`).
- **Segurança, dependências e privacidade de API (`ACH-04`, `ACH-07`, `ACH-08`, `ACH-15`):** `next` atualizado para `16.4.6` (`0` vulnerabilidades no `npm audit` moderado+, incluindo no `quality-gates.yml`); permissões de `atualizar-dados.yml` e `.claude/settings.json` restringidas; `/api/busca` com `Cache-Control: private, no-store` e `X-Robots-Tag: noindex, nofollow` em `/api/:path*`.
- **LGPD e blindagem legal (`ACH-01`, `ACH-09`, `ACH-14`):** 3 requerimentos com dados sensíveis de saúde (`Requerimentos:130774`, `132682`, `134695`) omitidos preventivamente em `src/lib/content/omissoes.ts` (sem nomes); sentinela LGPD em `scripts/auditar-heuristicas.ts`; `/privacidade` atualizada (`vigenciaPoliticas: 2026-11-18`, explicita ausência de perfilamento/art. 20 e proteção a crianças/adolescentes/art. 14); `/termos` reforça Lei Eleitoral nº 9.504/1997 e política das fotos oficiais; prazo de 15 dias em `/correcoes`.
- **UI, UX, Acessibilidade, SEO e Idioma (`ACH-02`, `ACH-03`, `ACH-05`, `ACH-06`, `ACH-13`, `ACH-14`, `ACH-15`):** correção do rodapé (`"que busca promover..."`) e concordância singular/plural pt-BR; `/comparar` corrigido para `nProjetosLei` + link `lei=1`, rótulos *"Classificação automática pelo texto"*, estados vazios e `"Limpar seleção"`; busca ao vivo casa `APELIDOS` históricos (`Norbertinho`, `Felipe César Filho - FC`) e anuncia erros com `role="alert"`; `maxLength={120}` em `/buscar` e `ListaBairros`; suporte a `forced-colors`, `@media print`, `scroll-padding-bottom` mobile, sublinhado `aria-current` e `.chip.ativo`; melhorias em `Rede.tsx` e `/404`; `/api/health` expõe `versao` (`1.0.0`) e `sha` curto; JSON-LD com `SearchAction` e `BreadcrumbList`, `openGraph` completo de perfil, `colorScheme` e `llms.txt` ampliado; lint AST em `scripts/lint.ts` e remoção de código morto (`scripts/icones.mjs`, `iconeDoTipo`, `"pois"` duplicado).
- **Documentação humana e passagem de bastão:** criado [`docs/GUIA-DO-OBSERVATORIO.md`](docs/GUIA-DO-OBSERVATORIO.md) explicando camadas, metodologia completa, operação, checklist jurídico, domínio e opções de hospedagem/custos para ONG.

## Decisões do dono (valem até nova decisão)

1. Só Pindamonhangaba (Observatório Social do Brasil – Pindamonhangaba e Câmara Municipal).
2. Custo zero nesta v1 (Vercel gratuita no endereço único `acompanhe-seu-vereador.vercel.app`, sem VPS no código). Alternativas futuras de VPS econômica para ONG documentadas em `docs/GUIA-DO-OBSERVATORIO.md`.
3. Portal apartidário para acompanhar vereadores com link oficial (não é clone da Câmara); sem votações e sem presença nesta v1.
4. Ordem alfabética, sem ranking, nota, selo ou cor de partido. Todo número leva à lista que o compõe.
5. Atualização automática 2x/dia via GitHub Actions (`ADR 0003`); PWA com service worker exclusivo para estáticos e `/offline` (`ADR 0004`).
6. Identidade centralizada em `src/lib/site.ts` (`ADR 0001`), visível como projeto do Observatório Social do Brasil – Pindamonhangaba.

## Qualidade e operação local

- **Suite unitária/contrato (`npm test`):** **17 arquivos, 144 testes** (Vitest) + `npm run lint` + `npm run typecheck` + `npm run auditar:cobertura` + `npm audit --audit-level=moderate`.
- **Playwright local (Windows):** validado em **192 testes** com `--workers=2` (`desktop-chromium`, `android-412`, `samsung-360` — 100% verdes). Se a porta `3100` estiver ocupada por outro processo, suba em porta dedicada (`npx next start -p 3197 -H 127.0.0.1`) e execute com `--workers=2`, `E2E_URL=http://127.0.0.1:3197` e `PLAYWRIGHT_BROWSERS_PATH="D:\Anglo AI - Local\Temp\ms-playwright"`. Encerre o servidor ao concluir.
- **Limites da Câmara (nunca contornar):** HTML direto recebe LiteSpeed reCAPTCHA (`Bot Verification`); o coletor usa exclusivamente `/jsonweb/web-aplicativo.php` com token em produção e ≥ 1 s entre requisições.

## Próximos passos humanos / próxima IA (pós-v1.0.0)

1. **Observatório e Jurídico (`docs/GUIA-DO-OBSERVATORIO.md` §6 e `docs/auditoria/2026-11-18-profunda/07-legal-para-revisao-humana.md`):** revisar `/termos`, `/privacidade`, fotos oficiais em P&B, formalizar autorização da marca/CNPJ/e-mail `pindamonhangaba@osbrasil.org.br` (SLA de 15 dias) e avaliar elegibilidade do plano Hobby da Vercel vs hospedagem própria (ex.: VPS simples de baixo custo ou Cloudflare Pages) caso a entidade decida migrar no futuro.
2. **Manutenção periódica (próxima IA / voluntário):** rodar `npm run auditar:heuristicas` periodicamente para revisar novos bairros citados e prevenir novos dados sensíveis em requerimentos recentes da Câmara.
3. **Opcional imediato:** configurar secret `VERCEL_DEPLOY_HOOK_URL` (em `docs/operacao/atualizar-dados.md`) para encerrar os 2 micro-commits diários no histórico Git; testar PWA e leitores de tela (VoiceOver/TalkBack) em iPhone e Android físicos; confirmar com moradores `"Andrade"` × `"Residencial Andrade"` e `"Ipê"` × `"Ipê I"` para `src/lib/content/bairros.ts`.
4. **Futuro v2:** oficiar a Câmara via LAI para abertura de votações nominais e lista de presença na API `/jsonweb/`.

## Rollback

1. **Vercel:** Vercel → `acompanhe-seu-vereador` → Deployments → último deployment íntegro → ⋯ → **Promote to Production**.
2. **Código:** `git revert <sha>` na `main` (nunca force push).

## Identidade Git

Local ao repo: `José Victor Honorato <33707633+vhonorato02@users.noreply.github.com>`. Sem assinaturas de IA.
