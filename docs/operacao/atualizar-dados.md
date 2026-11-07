# Atualizar os dados

Os dados vêm da API da Câmara e são coletados **no build de produção da Vercel** (o token só existe lá). Atualizar = fazer um novo build de produção com o cache de build; o coletor faz a coleta incremental sozinho (≈ 60 consultas, ≈ 2 min) e, a cada 30 dias, uma completa (≈ 384 consultas, ≈ 10 min). Se algo der errado, o build falha e o site continua com a coleta anterior.

## Automático (padrão desde 07/11/2026)

| Workflow | Quando | O que faz |
|---|---|---|
| `.github/workflows/atualizar-dados.yml` | de hora em hora (minuto 17) | Lê o manifesto. Só dispara o build de produção se a coleta publicada tiver **mais de 11 h** e o próprio workflow não tiver disparado nas **últimas 3 h**; nos outros casos termina em segundos sem fazer nada. Na prática: uma coleta a cada ~12 h, e um horário descartado pelo GitHub é recuperado na hora seguinte. Quando dispara, espera até 33 min pela nova data no manifesto; se não mudar, a execução falha (o GitHub avisa o dono por e-mail). |
| `.github/workflows/vigia-dados.yml` | 06h43, 14h43 e 22h43 (Brasília) | Lê `/dados/manifesto.json` e o `/api/health` da cópia da VPS. Abre (ou comenta) uma issue `dados-desatualizados` se a coleta tiver mais de **26 h** (duas atualizações perdidas), se houver `avisos`, se não conseguir ler, ou se a VPS estiver fora do ar ou mais de 26 h atrás. Quando tudo volta ao normal, fecha a issue. |
| `.github/workflows/deploy-vps.yml` | depois de cada `atualizar-dados` bem-sucedido e de cada push de código | Espelha os dados da Vercel na cópia da VPS. |

**Por que de hora em hora.** O GitHub atrasa ou descarta execuções agendadas quando está sob carga: a primeira execução das 18h17 de 07/11/2026 simplesmente não aconteceu. Com uma checagem barata por hora, um horário perdido não deixa os dados meio dia atrasados. A trava de 3 h impede que uma Câmara fora do ar seja consultada de hora em hora.

**Como o build é disparado.** Se o segredo `VERCEL_DEPLOY_HOOK_URL` existir no repositório, o workflow chama o deploy hook. Sem ele (situação atual), faz um commit de uma linha em `.github/atualizacao-agendada`, assinado com a identidade do dono, e a integração Git da Vercel constrói a `main`. O CI (`quality-gates`) ignora esse arquivo, então o commit não gasta execução de CI. Os dois caminhos usam o cache de build.

Para trocar para o deploy hook (recomendado, evita os commits de atualização no histórico): Vercel → projeto **acompanhe-seu-vereador** → Settings → Git → **Deploy Hooks** → nome `atualizar-dados`, branch `main` → copie a URL → GitHub → repositório → Settings → Secrets and variables → Actions → **New repository secret** `VERCEL_DEPLOY_HOOK_URL`. Nada mais muda.

**Rodar agora:** GitHub → Actions → `atualizar-dados` → **Run workflow**.

### Limites do plano gratuito (conferidos em 07/11/2026)

| Recurso | Limite Hobby (Vercel) | Uso com ~2 builds/dia |
|---|---|---|
| Deploys por dia | 100 | 2 (+ pushes de código) |
| Builds por hora | 100 | ≤ 1 |
| Duração de um build | 45 min | ≈ 2–4 min (completa ≈ 10 min) |
| Deploy hooks | 60 disparos/hora | ~2/dia (no máximo 1 a cada 3 h) |
| Transformações de imagem | 5 mil/mês | redeploy **não** invalida o cache de imagens (a chave é o hash do arquivo); só fotos novas geram transformações |
| GitHub Actions | ilimitado em repositório público | ≈ 2 × 10 min + 1 × 1 min por dia |

Fontes: [vercel.com/docs/limits](https://vercel.com/docs/limits), [vercel.com/docs/image-optimization](https://vercel.com/docs/image-optimization), [vercel.com/docs/limits/fair-use-guidelines](https://vercel.com/docs/limits/fair-use-guidelines).

Na Câmara, ≈ 120 consultas por dia, com ≥ 1 s entre elas, User-Agent identificado e parada imediata diante de desafio anti-robô — mesma política de antes, só mais frequente.

**Cuidado:** o GitHub desativa workflows agendados de repositórios públicos sem atividade por 60 dias. Os commits de atualização contam como atividade; com deploy hook, não há commit, então é bom ter algum push de código a cada dois meses (ou reativar em Actions se o GitHub avisar por e-mail).

## Pelo chat “Acompanhe seu Vereador — Atualização de dados” (T3)

Peça “atualize os dados”. O chat deve, nesta ordem:

1. Ler o manifesto publicado: `curl -s https://acompanhe-seu-vereador.vercel.app/dados/manifesto.json` e anotar `coletadoEm`, `modo`, `avisos` e `totais`. Uma requisição só; repetir em sequência rápida aciona o desafio anti-robô da Vercel.
2. Disparar o workflow: `gh workflow run atualizar-dados.yml -R vhonorato02/acompanhe-seu-vereador` e acompanhar com `gh run list --workflow atualizar-dados.yml -L 1` (sem loop rápido).
3. Quando a execução terminar: se verde, ler o manifesto de novo e informar data da coleta, modo, consultas, avisos e a diferença de totais (proposições, normas, vereadores). Se vermelha, abrir o log (`gh run view --log-failed`) e o último deploy da Vercel; o site continua no ar com a versão anterior. Não tentar de novo mais de uma vez no mesmo dia.

Regras: não consultar a API da Câmara direto, não forçar coleta completa sem motivo (`COLETA_COMPLETA=1` só se o dono pedir), nunca mostrar ou pedir o token.

## Sem chat e sem GitHub

Vercel → projeto **acompanhe-seu-vereador** → **Deployments** → no deploy de produção mais recente, **⋯ → Redeploy**, com “Use existing Build Cache” marcado. Em poucos minutos o rodapé mostra a nova data de coleta.
