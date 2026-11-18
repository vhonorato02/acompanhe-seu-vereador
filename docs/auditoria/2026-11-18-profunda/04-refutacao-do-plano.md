# 04 — Refutação do Plano (Ataque Adversarial antes da Execução)

## 1. Estou tratando sintoma em vez de causa-raiz?

- **Omissão LGPD (`ACH-01`):** omitir apenas 3 registros específicos trataria só o sintoma se amanhã um vereador protocolar outro requerimento citando paciente e prontuário. **Contramedida adotada:** além da omissão imediata dos 3 registros encontrados, adicionamos uma **sentinela automática LGPD** em `scripts/auditar-heuristicas.ts` e ampliamos `privacidade/page.tsx` para refletir o processo preventivo real. Limite aceito: como a coleta automática roda no build da Vercel sem revisão humana prévia a cada 12 horas, novos pedidos sensíveis publicados pela Câmara podem aparecer entre uma auditoria e outra até o próximo ciclo ou pedido de titular (risco residual documentado em `07-legal-para-revisao-humana.md`).
- **Lint (`ACH-05`):** um regex simples em cima do texto fonte produziria falsos positivos em comentários e strings (de fato, durante o desenvolvimento, uma menção em comentário JSDoc acionou o próprio lint). **Contramedida adotada:** usar o próprio scanner léxico e AST de `typescript` (`ts.createSourceFile` + `ts.createScanner`) para separar sintaxe de comentários, eliminando falsos positivos sem adicionar dezenas de pacotes de terceiros ao lockfile.

## 2. Esqueci alguma rota, estado, perfil ou integração?

- **Route Handler `/api/health` e cache estático do Next.js:** `GET()` sem argumentos em Route Handler pode ser estaticamente cacheado em build-time pelo Next.js dependendo das heurísticas de rota. Ao verificar no build (`npm run build` com Next `16.4.6`), observou-se que `/api/health` foi compilado como `ƒ (Dynamic)` porque lê `process.env` e o disco. Na VPS, `GIT_COMMIT_SHA` é injetado tanto no `ARG`/`ENV` do estágio `build` quanto no estágio `run` do `Dockerfile`, cobrindo ambos os cenários.
- **Portas e processos na máquina local (Windows):** o `HANDOFF.md` alertava para conflito na porta `3100`. Decisão: usar porta dedicada (`3197`) com encerramento garantido em bloco `try/finally` ao rodar o Playwright.
- **CI vs `tests/health.test.ts`:** no `quality-gates.yml`, `npm test` roda **antes** de `npm run build` (portanto antes de `scripts/collect.ts` gerar `data/generated/dataset.json`). Se `tests/health.test.ts` importasse `@/app/api/health/route` sem mockar `@/lib/data/load` e `server-only`, quebraria no CI! **Contramedida:** mock explícito de `server-only` e `@/lib/data/load` no teste unitário + validação ponta a ponta contra o servidor compilado real no Playwright (`e2e/qualidade.spec.ts`).

## 3. O que este plano pode quebrar em produção?

- **Nenhuma quebra direta em produção durante esta sessão**, pois trabalhamos em ramo local (`release/v1.0.0-rc1`) sem push para `main`, evitando disparar builds e coletas desnecessárias na Câmara e aguardando a decisão do dono sobre `camara-a-vista.vercel.app`, `osb-pinda-camara-1s2026` e endereço definitivo (Missão C).
- **Risco na atualização `next@16.4.3 → 16.4.6`:** poderia alterar assinatura de metadados, `ImageResponse` ou `ViewTransition`. Mitigado executando `typecheck`, 150 testes unitários, `npm run build` completo e suíte Playwright inteira sobre o build gerado.

## 4. Veredito da Refutação

Plano aprovado com as salvaguardas incorporadas; riscos residuais (janela entre coletas automáticas na Câmara para novos textos sensíveis, dependência do aval do dono para remoção de aliases Vercel e escolha de domínio) registrados explicitamente para o dono.
