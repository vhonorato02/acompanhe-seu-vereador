# ADR 0003 — Atualização automática dos dados, duas vezes por dia

- Data: 07/11/2026
- Estado: aceita (substitui a decisão de 24/10/2026 de atualização quinzenal manual)

## Contexto

O coletor só roda no build de produção da Vercel, onde está o token da API da Câmara. Até aqui, atualizar dependia de o dono abrir a Vercel e pedir um redeploy a cada 15 dias, ou de um chat fazer isso. Na prática os dados ficavam velhos e a atualização dependia de lembrar.

## Decisão

- `atualizar-dados.yml` (GitHub Actions) dispara um build de produção às 06h17 e 18h17 de Brasília e confirma, pelo manifesto público, que a coleta mudou.
- Gatilho: deploy hook da Vercel (segredo `VERCEL_DEPLOY_HOOK_URL`) quando existir; enquanto não existir, um commit de uma linha em `.github/atualizacao-agendada`, com a identidade do dono, ignorado pelo CI.
- `vigia-dados.yml` lê o manifesto 1x/dia e abre/atualiza/fecha uma issue `dados-desatualizados` (limite: 36 h ou qualquer aviso).

## Consequências

- Tudo dentro do plano gratuito (limites conferidos em `docs/operacao/atualizar-dados.md`): 2 builds/dia contra 100 deploys/dia; o cache de imagens não é invalidado por redeploy.
- A Câmara recebe ≈ 120 consultas/dia em vez de ≈ 60 a cada 15 dias, ainda com ≥ 1 s entre consultas e parada diante do anti-robô.
- Sem deploy hook, o histórico ganha 2 commits/dia (`chore(data): scheduled refresh`). Filtrar com `git log --invert-grep --grep="scheduled refresh"`. Criar o deploy hook elimina isso.
- Falha não derruba o site: o build falha, a Vercel mantém a versão anterior, a execução do workflow fica vermelha e o vigia abre issue.
