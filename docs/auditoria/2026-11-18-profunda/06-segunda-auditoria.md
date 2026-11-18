# 06 — Segunda Auditoria Adversarial (Fase 9)

Realizada sobre o código corrigido no ramo `release/v1.0.0-rc1`, o build de produção local (`Next.js 16.4.6`) e as capturas reais geradas em `e2e-artifacts/capturas/`.

## 1. Re-verificações executadas

- **Inventário de rotas e arquivos:** todas as 17 páginas (`src/app/**/page.tsx`), 3 rotas de API/texto (`/api/busca`, `/api/health`, `/llms.txt`) e 5 metadados/erros (`/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/opengraph-image`, `/404`) — total de 25 entradas do App Router — mais todos os arquivos rastreados (`git ls-files`) conferidos e cobertos nos livros via `npm run auditar:cobertura`. `[OBSERVADO]`
- **Segurança e limpeza pós-correção (Rodada 2):** `npm audit` = `0` vulnerabilidades; `scripts/lint.ts` = `93` arquivos sem violações; `omissoes.ts` não expõe nomes nos arquivos públicos; `.claude/settings.json` sem `Bash` irrestrito; `atualizar-dados.yml` sem `contents: write` no job de leitura; artefatos exclusivos da VPS removidos (`Dockerfile`, `deploy-vps.yml`, `espelhar.ts`, `ESPELHO=1`). `[OBSERVADO]`
- **Código morto / duplicação:** `scripts/icones.mjs`, `docs/environment.md`, `iconeDoTipo` em `Icon.tsx` e `leisDeProjetos` em `src/lib/data/painel.ts` removidos. `[OBSERVADO]`
- **Resolução do `ACH-13` (confirmada visualmente nas capturas desktop/mobile da Rodada 2):** `desktop-chromium-light-comparar_v_marco_mayor_v_ana_paula_goffi.png` e `samsung-360-dark-comparar_v_marco_mayor_v_ana_paula_goffi.png` exibem agora o rótulo *"Classificação automática pelo texto"*, mensagens explícitas de estado vazio (*"Nenhum pedido classificado neste período."* / *"Nenhum bairro citado com frequência."*) e o atalho `"Limpar seleção"`. Na captura inicial `desktop-chromium-light-inicio.png`, os nós da rede de coautoria exibem iniciais legíveis mesmo sem foto baixada. `[OBSERVADO]`

## 2. As 5 Contraprovas Obrigatórias (por escrito)

### 1. O que ainda faria um usuário real dizer "isso está malfeito"?
- **Na superfície de produção atual (antes do deploy deste ramo e ação do dono):** quem entrar por `camara-a-vista.vercel.app` vê um endereço que sugere ser órgão oficial da Câmara, e quem tentar confirmar um requerimento de saúde pode ver dados sensíveis de pacientes (`130774`, `132682`, `134695`) ainda expostos até o merge deste ramo.
- **No produto corrigido (`release/v1.0.0-rc1`):** `/comparar` não possui mais títulos órfãos (`ACH-13` resolvido) e os atalhos de filtro respeitam `aria-current` e contraste alto; a única lacuna esperada continua sendo a ausência de **votações nominais e presença** — limitação real da fonte oficial já explicada em `/como-funciona` e `/metodologia`.

### 2. O que quebra amanhã, quando a fonte mudar, a cota vencer ou um texto sensível surgir?
- **Mudança na API da Câmara:** o schema Zod em `src/lib/camara/schema.ts` falha o build de propósito antes de publicar, mantendo a versão anterior no ar na Vercel e gerando alerta no `atualizar-dados.yml` e issue no `vigia-dados.yml` após 26 h; `unknownKeys` registra campos novos nos avisos do manifesto. `[OBSERVADO]`
- **Novo requerimento sensível na Câmara:** a coleta 2x/dia publica automaticamente o texto oficial da Câmara. Sem triagem automática bloqueante (que pararia o site todo), novos dados sensíveis podem surgir até execução de `npm run auditar:heuristicas` ou solicitação por e-mail. `[INFERIDO]`
- **Cron do GitHub e plano Hobby Vercel:** se o dono configurar `VERCEL_DEPLOY_HOOK_URL`, o histórico deixa de ganhar 2 commits/dia na `main`, exigindo ao menos 1 commit a cada 60 dias para o GitHub não pausar os crons; a elegibilidade não lucrativa do plano Hobby fica para verificação formal humana (`ACH-11`). `[OBSERVADO]`

### 3. Que risco estou ignorando porque testar dá trabalho?
- **Dispositivo físico real (iPhone Safari + Android Chrome) e leitores de tela reais (VoiceOver/TalkBack):** emulação Chromium com axe-core comprova contraste, árvore semântica, `scroll-padding-bottom`, foco e teclado básico, mas não comprova gestos de toque reais, comportamento exato de "Adicionar à Tela de Início" no iOS nem fluência de leitura no VoiceOver/TalkBack. `[BLOQUEADO]`
- **Deploy real na Vercel com o novo SHA (`1.0.0`):** travado por R7 para não disparar coleta nem publicar antes do aval final do dono. `[BLOQUEADO]`

### 4. Se o dono abrir no celular dele agora, o que ele vê primeiro e o que ele acha?
- Ele vê o portal rápido, em português direto, com a proposta clara em 5 segundos (*"O que os vereadores apresentam na Câmara"* + contagem real + busca + atalhos de temas + os 11 vereadores em P&B por ordem alfabética + *"Observatório Social de Pindamonhangaba"*). A estética minimalista branco/preto com verde institucional do OSB passa seriedade e neutralidade, e a navegação atual agora traz sublinhado nítido na aba ativa e espaçamento seguro acima da barra inferior. O único incômodo visual externo remanescente ocorre se acessar o endereço antigo `camara-a-vista.vercel.app` no painel da Vercel enquanto não for removido. `[OBSERVADO]` / `[INFERIDO]`

### 5. Estou chamando de estável porque o pipeline está verde?
- **Não.** Por isso este ramo segue classificado como **`CANDIDATO`** (não `ESTÁVEL VALIDADO`). Embora os testes locais (144 unitários, 6/6 mutantes na Rodada 1, 192 E2E, `npm audit = 0`, `lint`, `typecheck`, `build` e Missão A sobre os 17.545 registros) estejam verdes, os gates de **produção publicada com SHA auditado**, **remoção de `camara-a-vista.vercel.app` / `osb-pinda-camara-1s2026`**, **revisão jurídica humana** e **teste em aparelho físico** ainda aguardam ação do dono e publicação final.
