# HANDOFF — Acompanhe seu Vereador (Pindamonhangaba)

> **Documento único de estado** entre sessões. Atualize ao fim de cada bloco de trabalho.
> Última atualização: 18/11/2026 (auditoria profunda v2 em `docs/auditoria/2026-11-18-profunda/` — ramo candidato `release/v1.0.0-rc1`).

## Onde estamos

- **Produção atual (canônico na `main`, commit `afddf61`):** https://acompanhe-seu-vereador.vercel.app
  - **Coleta publicada em 18/11/2026 (`2026-11-18T04:17:33.473Z`):** **17.545 proposições, 409 normas, 11 vereadores**, modo `incremental`, `62` consultas, `0` avisos.
- **Cópia na VPS (`zewithane`):** https://vereador.zewithane.vps.brz.dev.br (site `vereador` da `vps-platform`, 256 MB, sem banco, `X-Robots-Tag: noindex, nofollow`, `/robots.txt` fechado). Espelha os dados abertos da Vercel (`npm run espelhar`); nunca consulta a Câmara. Tag no ar: `afddf618cb6f-2` (`coletadoEm` idêntico ao da Vercel).
  - Operação via SSH: `ssh zewithane 'site lista; site logs vereador 100; site rollback vereador'` (alias no `~/.ssh/config` é `zewithane`, porta `22322`).
- **Ramo candidato à 1.0.0:** `release/v1.0.0-rc1` (estado **CANDIDATO** — ver [relatório final](docs/auditoria/2026-11-18-profunda/08-relatorio-final.md)). Aguarda decisões R7/Missão C do dono antes do merge/push para `main` e da tag `v1.0.0`.
- **Vercel:** projeto `acompanhe-seu-vereador` (`prj_tduqr6ZAVAtyEGz5mJJ5JgbTOaZe`, time `team_43xSvVJZ9lHuy6K7NNxlMhXG`), Node `24.x`.
- **GitHub:** `vhonorato02/acompanhe-seu-vereador`, branch padrão `main`. **Nunca empurre commits em série na `main`:** cada push na `main` dispara build de produção na Vercel com coleta real na Câmara. Valide em ramo antes.
- **Automação:** `atualizar-dados.yml` (horário, dispara com > 11 h), `vigia-dados.yml` (3x/dia, limite 26 h, confere Vercel e VPS), `deploy-vps.yml` (com gates `lint`/`typecheck`/`test` antes do espelho), `quality-gates.yml` (inclui `npm run lint`). Guia em [docs/operacao/atualizar-dados.md](docs/operacao/atualizar-dados.md) e [ADR 0003](docs/adr/0003-atualizacao-automatica.md).

## Novidades da rodada 1.0.0-rc1 (18/11/2026)

- **Segurança e dependências (`ACH-04`, `ACH-07`, `ACH-08`):** `next` atualizado de `16.4.3` para `16.4.6` (0 vulnerabilidades no `npm audit`); permissões de `atualizar-dados.yml` e `.claude/settings.json` restringidas; `deploy-vps.yml` agora roda `lint`, `typecheck` e `test` antes de espelhar.
- **LGPD (`ACH-01`, `ACH-09`):** 3 requerimentos com dados sensíveis de saúde de cidadãos (`Requerimentos:130774`, `132682`, `134695`) omitidos preventivamente em `src/lib/content/omissoes.ts` (sem nomes); sentinela LGPD adicionada a `scripts/auditar-heuristicas.ts`; `/privacidade` atualizada (`vigenciaPoliticas: 2026-11-18`) e prazo de 15 dias explicitado em `/correcoes`.
- **Integridade e observabilidade (`ACH-02`, `ACH-03`, `ACH-05`, `ACH-06`, `ACH-09`):** `/comparar` corrigido para exibir `nProjetosLei` com link para `lei=1` (número = lista); `/api/health` expõe `versao` (`1.0.0`) e `sha` curto; gate estático AST em `scripts/lint.ts`; `sitemap.ts` retorna vazio se `ESPELHO=1`; script morto `scripts/icones.mjs` removido e PNGs validados por assinatura e dimensões.
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

0. **Vercel (urgente, 1 min):** remover `camara-a-vista.vercel.app` do projeto `acompanhe-seu-vereador` e apagar/pausar o projeto abandonado `osb-pinda-camara-1s2026`.
1. **Missão C (endereço definitivo gratuito):** aprovar manter `acompanhe-seu-vereador.vercel.app` no lançamento `1.0.0` enquanto envia ao OSB Nacional o pedido de subdomínio institucional (mensagem pronta em `docs/auditoria/2026-11-18-profunda/07-legal-para-revisao-humana.md`), ou optar pela VPS como canônico.
2. **Publicação da `1.0.0`:** autorizar merge de `release/v1.0.0-rc1` → `main` e criação da tag `v1.0.0` após os itens 0 e 1.
3. **Observatório e Jurídico:** revisar `/termos`, `/privacidade`, fotos oficiais em P&B, autorização formal de uso da marca/CNPJ/endereço e monitoramento de `pindamonhangaba@osbrasil.org.br` (prazo de 15 dias).
4. **Opcional:** configurar secret `VERCEL_DEPLOY_HOOK_URL` (passo a passo em `docs/operacao/atualizar-dados.md`) para evitar 2 commits/dia na `main`; validar instalação em aparelho físico Android/iPhone com TalkBack/VoiceOver; confirmar nomes de bairros ambíguos ("Andrade" × "Residencial Andrade", "Ipê" × "Ipê I") para `src/lib/content/bairros.ts`.

## Rollback

1. **Vercel:** Vercel → `acompanhe-seu-vereador` → Deployments → último deployment íntegro → ⋯ → **Promote to Production**.
2. **VPS:** `ssh zewithane 'site rollback vereador'`.
3. **Código:** `git revert <sha>` na `main` (nunca force push).

## Identidade Git

Local ao repo: `José Victor Honorato <33707633+vhonorato02@users.noreply.github.com>`. Sem assinaturas de IA.
