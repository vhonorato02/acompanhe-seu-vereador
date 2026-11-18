# ESTADO — Auditoria Profunda (18/11/2026)

- **Fase atual:** Fase 9/10 concluídas em ramo local `release/v1.0.0-rc1` (aguardando apenas aval R7 / Missão C do dono para Fase 8 de publicação na `main` e tag `v1.0.0`).
- **Veredito atual:** **`CANDIDATO`** (`1.0.0-rc1`).
- **Último comando verde de cobertura:** `npm run auditar:cobertura` (`162/162 arquivos`, `25/25 rotas`, `14 fluxos`, `13 achados`), `npm run lint`, `npm run typecheck`, `npm test` (verificados no último commit em `release/v1.0.0-rc1`).
- **Bloqueios externos / perguntas ao dono:**
  1. Autorizar remoção de `camara-a-vista.vercel.app` e exclusão/arquivamento de `osb-pinda-camara-1s2026`.
  2. Escolher estratégia de endereço definitivo gratuito (Missão C) e hospedagem canônica (Vercel vs VPS).
  3. Autorizar merge `release/v1.0.0-rc1` → `main`, publicação na Vercel/VPS, ensaio de rollback na VPS e criação da tag `v1.0.0`.
  4. Confirmar uso de marca/CNPJ/e-mail do OSB e encaminhar `07-legal-para-revisao-humana.md` para revisão jurídica.
- **Próximo passo exato após resposta do dono:**
  ```bash
  git checkout main && git merge --no-ff release/v1.0.0-rc1 && git push origin main
  ```
  Em seguida confirmar `/api/health` (`versao: "1.0.0"`, `sha` = commit da `main`) na Vercel e na VPS, ensaiar `ssh zewithane 'site rollback vereador'` e retornar à imagem nova, e só então `git tag v1.0.0 && git push origin v1.0.0`.
