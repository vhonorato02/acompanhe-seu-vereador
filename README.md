# Acompanhe seu Vereador — Pindamonhangaba

Portal cívico aberto e apartidário do **Observatório Social do Brasil – Pindamonhangaba** (associação civil sem fins lucrativos, CNPJ `30.197.903/0001-75`) para que qualquer morador acompanhe, em linguagem simples e direto do celular, o que os vereadores de Pindamonhangaba apresentam na Câmara Municipal (legislatura 2025–2028). Todo número clicável abre exatamente a lista de documentos que o compõe, e cada item leva à ficha oficial na Câmara.

- **Portal no ar:** https://acompanhe-seu-vereador.vercel.app
- **Manual humano completo (para Diretoria, voluntários, jornalistas e jurídico):** [`docs/GUIA-DO-OBSERVATORIO.md`](docs/GUIA-DO-OBSERVATORIO.md)
- **Contato institucional e LGPD:** `pindamonhangaba@osbrasil.org.br` · **Site do OSB:** https://pindamonhangaba.sistemaosb.com.br
- **Políticas:** [/como-funciona](https://acompanhe-seu-vereador.vercel.app/como-funciona) · [/metodologia](https://acompanhe-seu-vereador.vercel.app/metodologia) · [/privacidade](https://acompanhe-seu-vereador.vercel.app/privacidade) · [/termos](https://acompanhe-seu-vereador.vercel.app/termos)

Este portal **não é o site oficial da Câmara Municipal** e não republica documentos integrais: exibe ementas (os resumos oficiais), datas, autoria e classificações abertas de apoio, sempre apontando para o documento original. Os retratos oficiais dos vereadores são exibidos em cores originais, com o mesmo enquadramento circular e em ordem estritamente alfabética. Identidade: [ADR 0001](docs/adr/0001-identidade-do-projeto.md).

## Como o portal funciona (em linguagem direta)

1. **Fonte oficial (`API de Dados Abertos`):** antes de gerar o site, `scripts/collect.ts` (`src/lib/coleta/coletar.ts`) consulta a [API de Dados Abertos da Câmara](https://www.pindamonhangaba.sp.leg.br/dadosabertos) — o "balcão eletrônico" oficial que entrega os registros públicos em formato estruturado (`JSON`) mediante um token de cidadão guardado em segredo na Vercel.
2. **Travas contra erro e respeito à Câmara:** o coletor se identifica honestamente, espera pelo menos 1 segundo entre pedidos, respeita limites (`Retry-After`), trata resposta vazia como falha e aborta diante de desafio anti-robô, mudança inesperada de formato ou queda brusca de volume. **Se algo falhar, o site novo não é publicado e a edição anterior continua funcionando normalmente.**
3. **Publicação estática e dados abertos:** tudo é conferido, gravado de forma atômica em `data/generated/dataset.json` (que alimenta as páginas) e disponibilizado para download gratuito em planilhas `CSV` (para Excel) e `JSON` (para análise técnica) em `public/dados/`.
4. **Atualização contínua:** coletas diárias buscam apenas páginas novas mais 45 dias de margem; a cada 30 dias, uma coleta completa do zero captura eventuais exclusões ou retificações feitas na Câmara.

## Atualização automática (2x ao dia)

- **Coletor agendado (`.github/workflows/atualizar-dados.yml`):** verifica o manifesto publicado de hora em hora e dispara nova publicação na Vercel quando a coleta passa de 11 h (na prática, a cada ~12 h).
- **Vigia automático (`.github/workflows/vigia-dados.yml`):** confere 3x ao dia se `/dados/manifesto.json` e `/api/health` em produção estão íntegros e atualizados há menos de 26 h; se houver atraso ou divergência, abre uma issue `dados-desatualizados` e avisa por e-mail.
- Passo a passo em linguagem simples e runbook técnico completo: [`docs/operacao/atualizar-dados.md`](docs/operacao/atualizar-dados.md) · Hospedagem única na Vercel: [ADR 0005](docs/adr/0005-hospedagem-unica-vercel.md).

## Desenvolvimento e testes locais

```bash
npm ci
npm run collect              # sem CAMARA_API_TOKEN usa a amostra real rotulada de fixtures/
npm run dev                  # servidor de desenvolvimento local
npm run lint                 # gate AST (proíbe any, catch vazio e divergência de versão)
npm run typecheck            # checagem estrita de tipos TypeScript
npm test                     # 17 arquivos / 144 testes unitários e de contrato (número = lista)
npm run build                # gera o pacote final de produção
npm run test:e2e             # Playwright + axe-core WCAG 2.2 AA (precisa de navegadores instalados)
npm run auditar:heuristicas  # revisão de bairros/temas e sentinela preventiva de LGPD
npm run auditar:cobertura    # confere 100% de arquivos, rotas, fluxos e achados nos livros-razão
```

Em produção, o token oficial da Câmara fica apenas na variável `CAMARA_API_TOKEN` da Vercel. Sem ele em ambiente de produção, o build falha de propósito para nunca ir ao ar com dados de amostra.

## Documentação e auditoria

- [`docs/GUIA-DO-OBSERVATORIO.md`](docs/GUIA-DO-OBSERVATORIO.md) — **guia humano completo**: glossário sem complicação, passeio pelas telas, metodologia detalhada, passo a passo sem programação, checklist jurídico/DPO, domínio e custos de hospedagem para ONG
- [`HANDOFF.md`](HANDOFF.md) — documento único de estado técnico, decisões vigentes, rollback e próximos passos para quem assumir o projeto
- [`docs/auditoria/2026-11-18-profunda/`](docs/auditoria/2026-11-18-profunda/08-relatorio-final.md) — auditoria completa arquivo por arquivo e tela por tela (`158/158` arquivos, `25/25` rotas, QA, LGPD e achados)
- [`docs/adr/`](docs/adr/) — decisões arquiteturais registradas (identidade, atualização, PWA/service worker, hospedagem única)
- [`docs/research/`](docs/research/) — pesquisa original de fontes, API da Câmara, Power BI reverso, design cívico e limites gratuitos
- [`CLAUDE.md`](CLAUDE.md) — regras técnicas, invariantes e convenções de desenvolvimento

## Privacidade (LGPD), correções e segurança

- **Correção de dados ou pedido de sigilo (LGPD):** se envolver dados pessoais de cidadão citado em ementa ou troca de retrato de gabinete, **não abra issue pública no GitHub** (tudo lá é indexável). Envie e-mail para **`pindamonhangaba@osbrasil.org.br`** (compromisso de resposta em até **15 dias**). O procedimento está em [/privacidade#direitos](https://acompanhe-seu-vereador.vercel.app/privacidade#direitos) e as omissões ficam registradas em `src/lib/content/omissoes.ts` (sem citar nomes pessoais).
- **Falhas técnicas de segurança:** veja [`SECURITY.md`](.github/SECURITY.md).

## Licença

Código-fonte aberto sob licença MIT, © Observatório Social do Brasil – Pindamonhangaba. A licença do código não se estende ao nome nem ao logotipo do Observatório Social do Brasil. Os dados brutos são públicos da Câmara Municipal de Pindamonhangaba; cite a fonte e a data da coleta ao reutilizar.
