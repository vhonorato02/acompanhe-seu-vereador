# ADR 0005 — Hospedagem única na Vercel

- Data: 18/11/2026
- Estado: aceita (decisão do dono; encerra a cópia espelhada na VPS)

## Contexto

Durante os ciclos 2–5, o portal manteve uma segunda cópia em Docker na VPS do mantenedor (`vereador.zewithane.vps.brz.dev.br`), sincronizada por `npm run espelhar` via workflow `deploy-vps.yml` com `ESPELHO=1` e `X-Robots-Tag: noindex, nofollow`. Embora servisse como backup operacional, mantinha Dockerfile, workflow extra, monitoramento paralelo no `vigia-dados.yml` e uma segunda superfície para operar sem demanda real do Observatório.

## Decisão

- O portal passa a rodar **exclusivamente na Vercel**, no endereço único `https://acompanhe-seu-vereador.vercel.app`.
- Foram removidos do repositório os artefatos exclusivos da cópia VPS (`Dockerfile`, `.dockerignore`, `.github/workflows/deploy-vps.yml`, `scripts/espelhar.ts`, `src/lib/espelho/espelhar.ts`, `tests/espelho.test.ts` e guardas `ESPELHO=1`).
- O workflow `vigia-dados.yml` passa a verificar apenas o `/dados/manifesto.json` e o `/api/health` do próprio endereço na Vercel.
- Os domínios/projetos antigos ainda presentes na conta Vercel do mantenedor (`camara-a-vista.vercel.app` e `osb-pinda-camara-1s2026`) devem ser removidos manualmente pelo dono via painel ou CLI (R7).

## Consequências

- Arquitetura mais enxuta, menor superfície de manutenção e zero divergência entre ambientes.
- A resiliência operacional passa a depender do último build íntegro retido pela Vercel (com rollback em 1 clique em *Deployments → Promote to Production*), já que builds com falha no coletor abortam antes de publicar.
- A verificação de elegibilidade do Observatório aos termos do plano gratuito Hobby da Vercel permanece registrada para decisão jurídica/institucional humana em `docs/auditoria/2026-11-18-profunda/07-legal-para-revisao-humana.md`.
