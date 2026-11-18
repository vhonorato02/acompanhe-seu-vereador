# ESTADO — Auditoria Profunda (18/11/2026)

- **Fase atual:** Rodada 3 + limpeza na Vercel concluídas (`camara-a-vista.vercel.app` removido e `osb-pinda-camara-1s2026` excluído — ambos retornam `HTTP 404`), pronto para publicação na `main` e tag `v1.0.0`.
- **Veredito atual:** **`RELEASE v1.0.0`** (sujeito apenas às revisões jurídicas/institucionais humanas documentadas em `docs/GUIA-DO-OBSERVATORIO.md` e `07-legal-para-revisao-humana.md`).
- **Decisão registrada em 18/11/2026 ([ADR 0005](../../adr/0005-hospedagem-unica-vercel.md)):** portal hospedado exclusivamente na Vercel (`https://acompanhe-seu-vereador.vercel.app`).
- **Último comando verde de cobertura:** `npm run auditar:cobertura` (`158/158 arquivos`, `25/25 rotas`, `14 fluxos`, `15 achados`), `npm run lint` (`93 arquivos`), `npm run typecheck`, `npm test` (`17 arquivos, 144 testes`), `npm audit = 0` e Playwright E2E (`192/192` com `--workers=2`) em `release/v1.0.0-rc1`.
- **Pendências humanas posteriores à publicação (Diretoria OSB / Advogado / Próxima IA):**
  1. Revisão jurídica completa de `/privacidade`, `/termos`, fotos oficiais em P&B, autorização formal da marca/CNPJ e avaliação do plano Hobby da Vercel × alternativa em VPS econômica (`docs/GUIA-DO-OBSERVATORIO.md` §6).
  2. Opcional: criar `VERCEL_DEPLOY_HOOK_URL`, validar instalação PWA em Android/iPhone reais com TalkBack/VoiceOver, desligar contêiner antigo externo `vereador` na VPS fora do repo e confirmar bairros ambíguos (`Andrade`, `Ipê`).
- **Passagem de bastão para a próxima IA:** começar lendo [`HANDOFF.md`](../../../HANDOFF.md) e [`docs/GUIA-DO-OBSERVATORIO.md`](../../GUIA-DO-OBSERVATORIO.md).
