# Acompanhe seu Vereador — Pindamonhangaba

Portal independente do **Observatório Social do Brasil – Pindamonhangaba** para acompanhar o que os vereadores de Pindamonhangaba apresentam na Câmara Municipal (legislatura 2025–2028). Cada número leva à lista que o compõe, e cada item leva ao documento oficial.

**Endereço:** https://acompanhe-seu-vereador.vercel.app.

Não é o site oficial da Câmara e não republica seus documentos: mostra título, ementa, autoria e data, com link para o original. Identidade do projeto: [ADR 0001](docs/adr/0001-identidade-do-projeto.md).

## Como funciona

1. Antes do build, `scripts/collect.ts` (lógica em `src/lib/coleta/coletar.ts`) consulta a [API de Dados Abertos da Câmara](https://www.pindamonhangaba.sp.leg.br/dadosabertos): vereadores, proposições e normas desde 01/01/2025.
2. O coletor se identifica, espera ≥ 1 s entre consultas, respeita `Retry-After`, trata resposta vazia como erro e para diante de desafio anti-robô, formato inesperado, paginação em loop ou queda de volume (comparando com a coleta anterior e com o manifesto publicado). **Se algo der errado, o build falha e a Vercel continua servindo a versão anterior.**
3. Tudo é validado antes de escrever; os arquivos são gravados numa área temporária e só então substituem os anteriores.
4. O resultado vira `data/generated/dataset.json` (lido pelo site) e `public/dados/*.csv|json` (dados abertos).
5. Coletas seguintes são incrementais (páginas novas + 45 dias de margem), com coleta completa a cada 30 dias. O estado fica no cache de build da Vercel.

## Atualizar os dados (a cada 15 dias)

Vercel → projeto **acompanhe-seu-vereador** → **Deployments** → no deploy de produção mais recente, **⋯ → Redeploy** (deixe “Use existing Build Cache” marcado). Em cerca de 5 minutos o rodapé de cada página mostra a nova data de coleta. Se o deploy falhar, o site antigo continua no ar e o log diz o motivo.

## Desenvolvimento

```bash
npm ci
npm run collect            # sem CAMARA_API_TOKEN usa a amostra real e rotulada de fixtures/
npm run dev
npm test                   # unitários, contratos e integração do coletor (número = lista)
npm run typecheck
npm run build
npm run test:e2e           # Playwright + axe contra o build (precisa de `npx playwright install`)
npm run auditar:heuristicas  # revisão de bairros/assuntos sobre os dados abertos publicados
```

Em produção o token fica na variável `CAMARA_API_TOKEN` da Vercel (só produção). Sem ele, o build de produção falha de propósito.

## Documentação

- `HANDOFF.md` — estado atual, operação e rollback
- `docs/auditoria/` — auditorias com achados, testes e evidências
- `docs/adr/` — decisões de arquitetura e produto
- `docs/research/` — pesquisa da Fase 1 (fontes, API, Power BI, design, free tiers)
- `CLAUDE.md` — princípios e convenções

## Licença

Código: MIT. Dados: públicos, da Câmara Municipal de Pindamonhangaba; cite a fonte e a data da coleta ao reutilizar.
