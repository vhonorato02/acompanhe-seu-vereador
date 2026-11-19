# Como os dados são atualizados no dia a dia

## Em resumo, sem termos técnicos

O portal se atualiza sozinho **duas vezes por dia** (cerca de 12 em 12 horas), sem ninguém precisar baixar planilhas ou apertar botões.

1. Um robô automático gratuito no GitHub (onde fica o código público) verifica de hora em hora se a última edição no ar já passou de 11 horas. Quando passa, ele pede à **Vercel** (o serviço onde o site fica hospedado) para buscar as novidades direto na **API de Dados Abertos da Câmara** — o balcão eletrônico oficial onde o sistema da Câmara entrega os dados organizados para programas de computador.
2. Antes de colocar o site atualizado no ar, o sistema confere tudo automaticamente (formato, links, fotos, queda de volume). Se a Câmara estiver fora do ar ou responder algo estranho, **a atualização falha com segurança e os moradores continuam vendo a versão anterior funcionando normalmente**.
3. Outro robô chamado **Vigia** confere o site três vezes por dia (`06h43`, `14h43` e `22h43` no horário de Brasília). Se passar de 26 horas sem atualizar ou algo falhar, ele abre um aviso automático no GitHub, que envia um e-mail aos responsáveis.

---

## Como funciona por baixo dos panos (referência técnica)

Os dados vêm da API SoftCam da Câmara (`/jsonweb/web-aplicativo.php`) e são coletados **no build de produção da Vercel** (onde o segredo `CAMARA_API_TOKEN` fica armazenado). Atualizar significa disparar um novo build de produção aproveitando o cache de build: no dia a dia o coletor executa coleta incremental (≈ 60 consultas, ≈ 2 min) e, a cada 30 dias, refaz uma coleta completa do zero (≈ 384 consultas, ≈ 10 min) para capturar exclusões ou retificações na fonte.

### Rotinas automáticas

| Workflow | Quando | O que faz |
|---|---|---|
| `.github/workflows/atualizar-dados.yml` | de hora em hora (minuto 17 UTC) | Lê `/dados/manifesto.json`. Só dispara o build de produção se a coleta publicada tiver **mais de 11 h** e o próprio workflow não tiver disparado nas **últimas 3 h**; nos outros casos termina em segundos sem gastar cota. Na prática: uma atualização a cada ~12 h. Quando dispara, aguarda até 33 min pela nova data no manifesto; se não mudar, falha e envia aviso por e-mail. |
| `.github/workflows/vigia-dados.yml` | 06h43, 14h43 e 22h43 (Brasília) | Confere `/dados/manifesto.json` e `/api/health` na Vercel. Abre (ou comenta) uma issue `dados-desatualizados` se passar de **26 h** sem coleta, se houver `avisos` no manifesto ou se `/api/health` divergir ou responder com erro; fecha automaticamente quando normaliza. |

**Por que a verificação roda de hora em hora.** O GitHub Actions pode atrasar ou descartar agendamentos em horários de pico. Verificando de hora em hora a um custo mínimo, um horário pulado é recuperado na hora seguinte, enquanto a trava de 3 h evita consultar a Câmara sem parar caso ela esteja indisponível.

**Como o build na Vercel é disparado.** Se o segredo `VERCEL_DEPLOY_HOOK_URL` existir no GitHub, o workflow chama essa URL secreta direto na Vercel (mantendo o histórico Git limpo). Sem esse segredo (situação atual), o robô altera uma linha no arquivo marcador `.github/atualizacao-agendada` com a identidade configurada do mantenedor, fazendo a integração Git da Vercel iniciar o build da `main`. O workflow de testes (`quality-gates.yml`) ignora esse marcador para não desperdiçar minutos de CI.

> **Como ativar o Deploy Hook (recomendado pela limpeza do histórico):** acesse **Vercel** → projeto **acompanhe-seu-vereador** → **Settings** → **Git** → **Deploy Hooks** → crie o hook `atualizar-dados` apontando para a branch `main` → copie a URL gerada → no **GitHub**, vá em **Settings → Secrets and variables → Actions** → **New repository secret** com nome `VERCEL_DEPLOY_HOOK_URL`.
> **Atenção:** o GitHub pausa workflows agendados em repositórios públicos sem nenhum commit por 60 dias corridos; ao usar Deploy Hook, lembre de fazer alguma alteração simples ou reativar os workflows em **Actions** a cada ~2 meses.

### Atualizar manualmente sem saber programar (em cliques)

- **Pela Vercel (mais rápido, 1 minuto):** acesse **Vercel** → projeto **`acompanhe-seu-vereador`** → **Deployments** → no deploy `Production` do topo, clique em **`⋯`** → **Redeploy** (mantenha **"Use existing Build Cache"** marcado para aproveitar a coleta incremental). Em poucos minutos o rodapé do site exibe a nova data.
- **Pelo GitHub:** **GitHub** → aba **Actions** → selecione **`atualizar-dados`** → botão **Run workflow**.

### Limites do plano gratuito (conferidos em 07/11/2026)

| Recurso | Limite Hobby (Vercel) | Uso com ~2 builds/dia |
|---|---|---|
| Deploys por dia | 100 | 2 (+ pushes de código) |
| Builds por hora | 100 | ≤ 1 |
| Duração de um build | 45 min | ≈ 2–4 min (coleta completa ≈ 10 min) |
| Deploy hooks | 60 disparos/hora | ~2/dia (no máximo 1 a cada 3 h) |
| Transformações de imagem | 5 mil/mês | redeploy **não** invalida o cache de imagens (a chave é o hash do arquivo); só retratos novos consomem transformações |
| GitHub Actions | ilimitado em repositório público | ≈ 2 × 10 min + 1 × 1 min por dia |

Fontes oficiais: [vercel.com/docs/limits](https://vercel.com/docs/limits), [vercel.com/docs/image-optimization](https://vercel.com/docs/image-optimization), [vercel.com/docs/limits/fair-use-guidelines](https://vercel.com/docs/limits/fair-use-guidelines).

Na API da Câmara, são feitas ≈ 120 consultas por dia no modo incremental, sempre com ≥ 1 s entre requisições, `User-Agent` honesto e parada imediata diante de desafio anti-robô.

## Atualização assistida via terminal / agente (para manutenção técnica)

Caso peça em sessão assistida *"atualize os dados"*, o fluxo seguro deve seguir esta ordem:

1. Ler o manifesto publicado uma única vez: `curl -s https://acompanhe-seu-vereador.vercel.app/dados/manifesto.json` e anotar `coletadoEm`, `modo`, `avisos` e `totais` (evite múltiplas chamadas em sequência rápida para não acionar proteção da Vercel).
2. Disparar o workflow: `gh workflow run atualizar-dados.yml -R vhonorato02/acompanhe-seu-vereador` e acompanhar com `gh run list --workflow atualizar-dados.yml -L 1`.
3. Ao terminar: se verde, ler novamente o manifesto e comparar data, modo, consultas, avisos e diferença de totais; se vermelha, abrir o log (`gh run view --log-failed`) e o último deploy da Vercel (a versão anterior no ar continua intacta). Nunca force coleta completa (`COLETA_COMPLETA=1`) sem autorização expressa nem exponha `CAMARA_API_TOKEN`.
