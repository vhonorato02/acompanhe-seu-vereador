# Acompanhe seu Vereador — Pindamonhangaba

Portal do **Observatório Social do Brasil – Pindamonhangaba** (associação civil apartidária, CNPJ 30.197.903/0001-75) para acompanhar o que os vereadores de Pindamonhangaba apresentam na Câmara Municipal (legislatura 2025–2028). Cada número leva à lista que o compõe, e cada item leva ao documento oficial.

**Endereço:** https://acompanhe-seu-vereador.vercel.app · **Contato:** pindamonhangaba@osbrasil.org.br · **Observatório:** https://pindamonhangaba.sistemaosb.com.br

Não é o site oficial da Câmara e não republica seus documentos: mostra título, ementa, autoria e data, com link para o original. Identidade do projeto: [ADR 0001](docs/adr/0001-identidade-do-projeto.md). Termos de uso e política de privacidade (LGPD): [/termos](https://acompanhe-seu-vereador.vercel.app/termos) e [/privacidade](https://acompanhe-seu-vereador.vercel.app/privacidade).

## Como funciona

1. Antes do build, `scripts/collect.ts` (lógica em `src/lib/coleta/coletar.ts`) consulta a [API de Dados Abertos da Câmara](https://www.pindamonhangaba.sp.leg.br/dadosabertos): vereadores, proposições e normas desde 01/01/2025.
2. O coletor se identifica, espera ≥ 1 s entre consultas, respeita `Retry-After`, trata resposta vazia como erro e para diante de desafio anti-robô, formato inesperado, paginação em loop ou queda de volume (comparando com a coleta anterior e com o manifesto publicado). **Se algo der errado, o build falha e a Vercel continua servindo a versão anterior.**
3. Tudo é validado antes de escrever; os arquivos são gravados numa área temporária e só então substituem os anteriores.
4. O resultado vira `data/generated/dataset.json` (lido pelo site) e `public/dados/*.csv|json` (dados abertos).
5. Coletas seguintes são incrementais (páginas novas + 45 dias de margem), com coleta completa a cada 30 dias. O estado fica no cache de build da Vercel.

## Atualização dos dados (automática, 2x/dia)

O workflow `.github/workflows/atualizar-dados.yml` confere o manifesto de hora em hora e dispara um build de produção na Vercel quando a coleta publicada passa de 11 h (na prática, a cada ~12 h; um horário perdido pelo GitHub é recuperado na hora seguinte). O workflow `vigia-dados.yml` roda 3x/dia e abre uma issue `dados-desatualizados` se a coleta passar de 26 h, trouxer avisos ou se o portal (`/api/health` ou manifesto) responder com erro ou divergência (o GitHub avisa por e-mail). Detalhes, limites do plano gratuito e como atualizar à mão: [`docs/operacao/atualizar-dados.md`](docs/operacao/atualizar-dados.md). Hospedagem exclusivamente na Vercel ([ADR 0005](docs/adr/0005-hospedagem-unica-vercel.md)).

## Desenvolvimento

```bash
npm ci
npm run collect              # sem CAMARA_API_TOKEN usa a amostra real e rotulada de fixtures/
npm run dev
npm run lint                 # gate estático (proíbe any, catch vazio, drift de versão)
npm run typecheck
npm test                     # unitários, contratos e integração do coletor (número = lista)
npm run build
npm run test:e2e             # Playwright + axe contra o build (precisa de `npx playwright install`)
npm run auditar:heuristicas  # revisão de bairros/assuntos e sentinela LGPD sobre dados abertos
npm run auditar:cobertura    # confere 100% dos arquivos e rotas nos livros de auditoria
```

Em produção o token fica na variável `CAMARA_API_TOKEN` da Vercel (só produção). Sem ele, o build de produção falha de propósito.

## Documentação

- [`docs/GUIA-DO-OBSERVATORIO.md`](docs/GUIA-DO-OBSERVATORIO.md) — **guia humano completo** (como funciona em linguagem simples, metodologia em profundidade, operação, revisão jurídica, domínio e custos de hospedagem para ONG)
- `HANDOFF.md` — documento único de estado, operação e rollback
- `docs/auditoria/2026-11-18-profunda/` — auditoria profunda com livros de cobertura, achados, QA e lista jurídica
- `docs/adr/` — decisões de arquitetura e produto
- `docs/research/` — pesquisa da Fase 1 (fontes, API, Power BI, design, free tiers)
- `CLAUDE.md` — princípios e convenções

## Pedidos sobre dados pessoais e segurança

- Pessoa citada numa ementa ou pedido de titular (LGPD): **não abra issue** (é público). Escreva para pindamonhangaba@osbrasil.org.br (prazo de resposta: até 15 dias); o procedimento está na [política de privacidade](https://acompanhe-seu-vereador.vercel.app/privacidade#direitos) e as omissões preventivas ou a pedido ficam em `src/lib/content/omissoes.ts` (sem nomes).
- Falha de segurança: veja [`SECURITY.md`](.github/SECURITY.md).

## Licença

Código: MIT, © Observatório Social do Brasil – Pindamonhangaba. A licença não se estende ao nome e ao logotipo do Observatório Social do Brasil. Dados: públicos, da Câmara Municipal de Pindamonhangaba; cite a fonte e a data da coleta ao reutilizar.
