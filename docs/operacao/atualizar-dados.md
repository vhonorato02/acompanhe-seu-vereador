# Atualizar os dados

Os dados vêm da API da Câmara e são coletados **no build da Vercel** (o token só existe lá). Atualizar = fazer um novo deploy de produção com o cache de build; o coletor faz a coleta incremental sozinho (≈ 60 consultas, ≈ 2 min) e, a cada 30 dias, uma completa (≈ 384 consultas, ≈ 10 min).

## Pelo chat “Acompanhe seu Vereador — Atualização de dados” (T3)

Peça “atualize os dados”. O chat deve, nesta ordem:

1. Ler o manifesto publicado: `curl -s https://acompanhe-seu-vereador.vercel.app/dados/manifesto.json` e anotar `coletadoEm`, `modo`, `avisos` e `totais`. Uma requisição só; repetir em sequência rápida aciona o desafio anti-robô da Vercel.
2. Achar o último deploy de produção (Vercel MCP: `list_deployments`, projeto `prj_tduqr6ZAVAtyEGz5mJJ5JgbTOaZe`, time `team_43xSvVJZ9lHuy6K7NNxlMhXG`, `target: production`, `limit: 1`).
3. Pedir um redeploy desse deploy para produção (Vercel MCP: `create_deployment` com `deploymentId` do passo 2, `name: acompanhe-seu-vereador`, `target: production`). Não usar `forceNew` nem limpar o cache.
4. Esperar o estado `READY` ou `ERROR` (consultar `get_deployment` a cada poucos minutos; não em loop rápido).
5. Se `READY`: ler o manifesto de novo e informar data da coleta, modo, consultas, avisos e a diferença de totais (proposições, normas, vereadores).
6. Se `ERROR`: ler o log do build (`list_deployment_events`, `builds: 1`), procurar as linhas `[coleta]` e informar o motivo. O site continua no ar com a versão anterior; não tentar de novo mais de uma vez no mesmo dia.

Regras: não fazer commit para atualizar dados, não consultar a API da Câmara direto, não forçar coleta completa sem motivo (`COLETA_COMPLETA=1` só se o dono pedir), nunca mostrar ou pedir o token.

## Sem chat

Vercel → projeto **acompanhe-seu-vereador** → **Deployments** → no deploy de produção mais recente, **⋯ → Redeploy**, com “Use existing Build Cache” marcado. Em poucos minutos o rodapé mostra a nova data de coleta.

## Automático

O agendamento automático fica a cargo do projeto de manutenção (ver `HANDOFF.md`). Enquanto ele não existir, use uma das formas acima.
