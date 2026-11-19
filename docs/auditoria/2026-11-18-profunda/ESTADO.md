# ESTADO — Auditoria Profunda (18/11/2026)

- **Fase atual:** Rodada 4 concluída (remoção do filtro preto e branco das fotos + reescrita humana e didática das páginas e documentação `.md`), validada e pronta para atualização final em produção na `main`.
- **Veredito atual:** **`RELEASE v1.0.0`** (sujeito apenas às revisões jurídicas/institucionais humanas documentadas em `docs/GUIA-DO-OBSERVATORIO.md` e `07-legal-para-revisao-humana.md`).
- **Decisão registrada em 18/11/2026 ([ADR 0005](../../adr/0005-hospedagem-unica-vercel.md)):** portal hospedado exclusivamente na Vercel (`https://acompanhe-seu-vereador.vercel.app`); retratos oficiais exibidos em cores originais sem `grayscale(1)` (`ACH-16`).
- **Último comando verde de cobertura:** ver registro da bateria final em [`05-qa.md`](05-qa.md) e [`08-relatorio-final.md`](08-relatorio-final.md) (`158/158 arquivos`, `25/25 rotas`, `14 fluxos`, `16 achados`).
- **Pendências humanas posteriores à publicação (Diretoria OSB / Advogado / Próxima IA):**
  1. Revisão jurídica completa de `/privacidade`, `/termos`, retratos oficiais em cores originais, autorização formal da marca/CNPJ e avaliação do plano Hobby da Vercel × alternativa em VPS econômica (`docs/GUIA-DO-OBSERVATORIO.md` §7).
  2. Opcional: criar `VERCEL_DEPLOY_HOOK_URL`, validar instalação PWA em Android/iPhone reais com TalkBack/VoiceOver, desligar contêiner antigo externo `vereador` na VPS fora do repo e confirmar bairros ambíguos (`Andrade`, `Ipê`).
- **Passagem de bastão para a próxima IA:** começar lendo [`HANDOFF.md`](../../../HANDOFF.md) e [`docs/GUIA-DO-OBSERVATORIO.md`](../../GUIA-DO-OBSERVATORIO.md).
