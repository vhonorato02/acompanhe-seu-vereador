# 06 — Segunda Auditoria Adversarial (Fase 9)

Realizada sobre o código corrigido no ramo `release/v1.0.0-rc1`, o build de produção local (`Next.js 16.4.6`) e as capturas reais geradas em `e2e-artifacts/capturas/`.

## 1. Re-verificações executadas

- **Inventário de rotas e arquivos:** todas as 17 páginas (`src/app/**/page.tsx`), 3 rotas de API/texto (`/api/busca`, `/api/health`, `/llms.txt`) e 5 metadados/erros (`/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/opengraph-image`, `/404`) — total de 25 entradas do App Router — mais todos os 158 arquivos rastreados (`git ls-files`) conferidos e cobertos nos livros via `npm run auditar:cobertura`. `[OBSERVADO]`
- **Segurança, privacidade de API e limpeza pós-correção (Rodada 3):** `npm audit` = `0` vulnerabilidades (gate elevado para `moderate` no `quality-gates.yml`); `scripts/lint.ts` = `93` arquivos; `omissoes.ts` sem nomes; `.claude/settings.json` sem `Bash` irrestrito; `/api/busca` com `Cache-Control: private, no-store` e `/api/:path*` com `X-Robots-Tag: noindex, nofollow`; domínios excedentes na Vercel (`camara-a-vista.vercel.app` e projeto `osb-pinda-camara-1s2026`) removidos e confirmados com `HTTP 404`. `[OBSERVADO]`
- **Código morto / idioma / duplicação:** removidos `scripts/icones.mjs`, `docs/environment.md`, `iconeDoTipo` em `Icon.tsx`, `leisDeProjetos` em `painel.ts` e `"pois"` duplicado em `extrair.ts`; corrigidos rodapé (`"que busca promover..."`) e concordância singular/plural em 7 arquivos. `[OBSERVADO]`
- **Resolução do `ACH-13` e busca por apelidos (`ACH-15`):** `desktop-chromium-light-comparar_v_marco_mayor_v_ana_paula_goffi.png` e `samsung-360-dark-comparar_v_marco_mayor_v_ana_paula_goffi.png` exibem rótulos *"Classificação automática pelo texto"*, mensagens explícitas de estado vazio e `"Limpar seleção"`; `vereadoresQueCasam` agora reconhece `APELIDOS` históricos (`Norbertinho`, `Felipe César Filho - FC`) e erros em `Busca.tsx` usam `role="alert"`. `[OBSERVADO]`

## 2. As 5 Contraprovas Obrigatórias (por escrito)

### 1. O que ainda faria um usuário real dizer "isso está malfeito"?
- No produto publicado na `v1.0.0`: os problemas visíveis apontados nas Rodadas 1–3 (rodapé sem verbo, plural errado em `1 proposição`, saúde sensível, cabeçalhos vazios em `/comparar`, `camara-a-vista.vercel.app`) foram corrigidos; a única limitação estrutural conhecida continua sendo a ausência de **votações nominais e presença** na API oficial da Câmara — explicada claramente em `/como-funciona` e `/metodologia`.

### 2. O que quebra amanhã, quando a fonte mudar, a cota vencer ou um texto sensível surgir?
- **Mudança na API da Câmara:** o schema Zod em `src/lib/camara/schema.ts` falha o build de propósito antes de publicar, mantendo a versão anterior no ar na Vercel e gerando alerta no `atualizar-dados.yml` e issue no `vigia-dados.yml` após 26 h; `unknownKeys` registra campos novos nos avisos do manifesto. `[OBSERVADO]`
- **Novo requerimento sensível na Câmara:** a coleta 2x/dia publica automaticamente o texto oficial da Câmara. Sem triagem automática bloqueante (que pararia o site todo), novos dados sensíveis podem surgir até execução de `npm run auditar:heuristicas` ou solicitação por e-mail. `[INFERIDO]`
- **Cron do GitHub e plano Hobby Vercel:** se o dono configurar `VERCEL_DEPLOY_HOOK_URL`, o histórico deixa de ganhar 2 commits/dia na `main`, exigindo ao menos 1 commit a cada 60 dias para o GitHub não pausar os crons; a elegibilidade não lucrativa do plano Hobby fica documentada para avaliação jurídica/diretoria (`ACH-11` e `docs/GUIA-DO-OBSERVATORIO.md` §6.3). `[OBSERVADO]`

### 3. Que risco estou ignorando porque testar dá trabalho?
- **Dispositivo físico real (iPhone Safari + Android Chrome) e leitores de tela reais (VoiceOver/TalkBack):** emulação Chromium com axe-core comprova contraste, árvore semântica, `scroll-padding-bottom`, foco e teclado básico, mas não comprova gestos de toque reais, comportamento exato de "Adicionar à Tela de Início" no iOS nem fluência de leitura no VoiceOver/TalkBack. `[BLOQUEADO]`

### 4. Se o dono abrir no celular dele agora, o que ele vê primeiro e o que ele acha?
- Ele vê apenas `https://acompanhe-seu-vereador.vercel.app` (com `camara-a-vista.vercel.app` respondendo `404`), carregamento rápido, português correto do título ao rodapé, busca instantânea inclusive por apelido histórico, navegação com sublinhado claro na aba ativa e espaçamento seguro acima da barra inferior. `[OBSERVADO]` / `[INFERIDO]`

### 5. Estou chamando de estável porque o pipeline está verde?
- Tecnicamente todos os gates automatizados locais e de limpeza na Vercel passaram (144 unitários, 6/6 mutantes na Rodada 1, 192 E2E em `--workers=2`, `npm audit = 0`, `lint`, `typecheck`, `build`, `auditar:cobertura` e Missão A nos 17.545 registros) e o release é publicado em `main` com verificação direta em produção; ainda assim ficam explicitados como pendências humanas formais o parecer jurídico (`07-legal-para-revisao-humana.md`), a formalização de marca/Hobby pela Diretoria do OSB e o teste em aparelho físico.
