# ESTADO — Auditoria Profunda (18/11/2026)

- **Fase atual:** Rodada 2 (hospedagem única na Vercel + UI/UX/A11y/SEO/Legal/Docs) em ramo local `release/v1.0.0-rc1` (aguardando apenas aval final do dono para merge na `main`, remoção dos aliases extras na Vercel e tag `v1.0.0`).
- **Veredito atual:** **`CANDIDATO`** (`1.0.0-rc1`).
- **Decisão registrada em 18/11/2026 ([ADR 0005](../../adr/0005-hospedagem-unica-vercel.md)):** portal hospedado exclusivamente na Vercel (`https://acompanhe-seu-vereador.vercel.app`), com descomissionamento da cópia espelhada em VPS.
- **Último comando verde de cobertura:** `npm run auditar:cobertura` (`157/157 arquivos`, `25/25 rotas`, `14 fluxos`, `14 achados`), `npm run lint` (`93 arquivos`), `npm run typecheck`, `npm test` (`17 arquivos, 144 testes`), `npm audit = 0` e Playwright E2E (`192/192` em Chromium desktop/Android/Samsung) validados em `release/v1.0.0-rc1`.
- **Bloqueios externos / perguntas ao dono:**
  1. Autorizar/executar remoção de `camara-a-vista.vercel.app` e exclusão/arquivamento de `osb-pinda-camara-1s2026` (e desligar o site antigo `vereador` na VPS fora do repositório).
  2. Autorizar merge `release/v1.0.0-rc1` → `main`, publicação na Vercel com verificação final de `/api/health` (`versao: "1.0.0"`, novo `sha`) e criação da tag `v1.0.0`.
  3. Confirmar uso de marca/CNPJ/e-mail do OSB e encaminhar `07-legal-para-revisao-humana.md` para revisão jurídica (inclui elegibilidade do plano Hobby da Vercel).
- **Próximo passo exato após aval do dono:**
  ```bash
  git checkout main && git merge --no-ff release/v1.0.0-rc1 && git push origin main
  ```
  Em seguida confirmar `/api/health` (`versao: "1.0.0"`, `sha` = commit da `main`) em `https://acompanhe-seu-vereador.vercel.app/api/health` e criar `git tag v1.0.0 && git push origin v1.0.0`.
