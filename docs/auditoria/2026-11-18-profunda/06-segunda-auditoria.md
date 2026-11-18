# 06 — Segunda Auditoria Adversarial (Fase 9)

Realizada sobre o código corrigido no ramo `release/v1.0.0-rc1`, o build de produção local (`Next.js 16.4.6`) e as capturas reais geradas em `e2e-artifacts/capturas/`.

## 1. Re-verificações executadas

- **Inventário de rotas e arquivos:** todas as 17 páginas (`src/app/**/page.tsx`), 3 rotas de API/texto (`/api/busca`, `/api/health`, `/llms.txt`) e 5 metadados/erros (`/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/opengraph-image`, `/404`) — total de 25 entradas do App Router — mais todos os 162 arquivos rastreados (`git ls-files`) conferidos e cobertos nos livros via `npm run auditar:cobertura`. `[OBSERVADO]`
- **Segurança pós-correção:** `npm audit` = `0` vulnerabilidades; `scripts/lint.ts` = `96` arquivos sem violações; `omissoes.ts` não expõe nomes nos arquivos públicos; `sitemap.ts` retorna vazio se `ESPELHO=1`; `.claude/settings.json` sem `Bash` irrestrito; `atualizar-dados.yml` sem `contents: write` no job de leitura. `[OBSERVADO]`
- **Código morto / duplicação:** `scripts/icones.mjs` e `docs/environment.md` removidos; `leisDeProjetos` removido de `src/lib/data/painel.ts`. `[OBSERVADO]`
- **Achado novo durante inspeção visual das capturas (`ACH-13`, P3):** ao abrir `desktop-chromium-light-comparar_v_marco_mayor_v_ana_paula_goffi.png` e `samsung-360-dark-comparar_v_marco_mayor_v_ana_paula_goffi.png`, quando um vereador na amostra não tem pedidos classificados (`temas.length === 0`) nem bairros (`bairros.length === 0`), `/comparar` renderiza os títulos `Assuntos dos pedidos (%)` e `Bairros mais citados` sem mensagem de estado vazio abaixo (diferente do perfil individual, que exibe `"Nenhum pedido classificado..."`). No dataset real de produção todos os 11 vereadores possuem temas e bairros, mas fica registrado como P3 para acabamento pós-1.0.0. `[OBSERVADO]`

## 2. As 5 Contraprovas Obrigatórias (por escrito)

### 1. O que ainda faria um usuário real dizer "isso está malfeito"?
- **Na superfície de produção atual (antes do deploy deste ramo e ação do dono):** quem entrar por `camara-a-vista.vercel.app` vê um endereço que sugere ser órgão oficial da Câmara, e quem tentar confirmar um requerimento de saúde pode ver dados sensíveis de pacientes (`130774`, `132682`, `134695`) ainda expostos até o merge deste ramo.
- **No produto corrigido (`release/v1.0.0-rc1`):** um usuário de leitura em tela pequena no `/comparar` quando não há dados em um sub-bloco vê dois cabeçalhos vazios (`ACH-13`, P3), e o cidadão comum ainda pode sentir falta de **votações nominais e presença** — limitação real da fonte oficial já explicada com honestidade em `/como-funciona` e `/metodologia`.

### 2. O que quebra amanhã, quando a fonte mudar, o disco encher, o certificado vencer, o editor colar um texto estranho?
- **Mudança na API da Câmara:** o schema Zod em `src/lib/camara/schema.ts` falha o build de propósito antes de sobrescrever `dataset.json`, mantendo a versão anterior no ar e gerando alerta no `atualizar-dados.yml` e issue no `vigia-dados.yml` após 26 h; `unknownKeys` registra campos novos nos avisos do manifesto. `[OBSERVADO]`
- **Novo requerimento sensível na Câmara:** a coleta 2x/dia publica automaticamente o texto oficial da Câmara. Sem triagem automática bloqueante (inviável porque pararia o site todo), novos dados sensíveis podem surgir até execução de `npm run auditar:heuristicas` ou solicitação por e-mail. `[INFERIDO]`
- **Disco na VPS:** `df -h /` mostra `37%` usado (`18 GB` livres de `30 GB`) — há folga, mas a política da VPS proíbe `docker system prune -a` automático e depende de limpeza periódica segura caso dezenas de imagens antigas se acumulem ao longo de meses. `[OBSERVADO]`
- **Certificado TLS e cron do GitHub:** Vercel e Caddy renovam certificados automaticamente; o `atualizar-dados.yml` hoje cria 2 commits/dia na `main`, o que evita a pausa de 60 dias do GitHub, mas se o dono configurar `VERCEL_DEPLOY_HOOK_URL`, será necessário algum commit a cada 60 dias ou reativação manual caso o GitHub desative os crons. `[OBSERVADO]`

### 3. Que risco estou ignorando porque testar dá trabalho?
- **Dispositivo físico real (iPhone Safari + Android Chrome) e leitores de tela reais (VoiceOver/TalkBack):** emulação Chromium com axe-core comprova contraste, árvore semântica, foco e teclado básico, mas não comprova gestos de toque reais, comportamento exato de "Adicionar à Tela de Início" no iOS nem fluência de leitura no VoiceOver/TalkBack. `[BLOQUEADO]`
- **Build Docker completo local + push em produção real:** o `Dockerfile` e a propagação de `GIT_COMMIT_SHA` não foram executados em build Docker local nem publicados ainda na VPS/Vercel (travados corretamente por R7 para não queimar builds de coleta na Câmara nem publicar antes das decisões do dono). `[BLOQUEADO]`
- **Troca de endereço definitivo (Missão C):** redirecionamento 301 e comportamento do Search Console dependem da escolha do dono e da resposta do OSB Nacional. `[BLOQUEADO]`

### 4. Se o dono abrir no celular dele agora, o que ele vê primeiro e o que ele acha?
- Ele vê o portal rápido, em português direto, com a proposta clara em 5 segundos (*"O que os vereadores apresentam na Câmara"* + contagem real + busca + atalhos de temas + os 11 vereadores em P&B por ordem alfabética + *"Observatório Social de Pindamonhangaba"*). A estética minimalista branco/preto com verde institucional do OSB passa seriedade e neutralidade, sem cheiro de template genérico. O ponto que incomodaria se ele olhar a URL no painel da Vercel é ainda enxergar `camara-a-vista.vercel.app` ativo como domínio do projeto. `[OBSERVADO]` / `[INFERIDO]`

### 5. Estou chamando de estável porque o pipeline está verde?
- **Não.** Por isso este ramo é explicitamente classificado como **`CANDIDATO`** (não `ESTÁVEL VALIDADO`). Embora todos os testes locais (150 unitários, 6/6 mutantes, 192 E2E, `npm audit = 0`, `lint`, `typecheck`, `build` e Missão A sobre os 17.545 registros) estejam verdes, os gates de **produção publicada com SHA auditado**, **remoção de `camara-a-vista.vercel.app`**, **definição de endereço da Missão C**, **revisão jurídica humana** e **teste em aparelho físico** ainda aguardam ação do dono e publicação final.
