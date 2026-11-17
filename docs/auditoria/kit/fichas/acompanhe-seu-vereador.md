# Ficha do projeto — Acompanhe seu Vereador (URGENTE, 1º da fila)

> Cole **depois** do `PROMPT-MESTRE.md`. Pistas conferidas no código em 17/11/2026, commit `2c4ecaf`. Se o código de hoje disser outra coisa, o código ganha.

## Missão desta rodada

**Finalizar o produto:** levar o portal a ESTÁVEL VALIDADO (1.0.0), com **endereço definitivo gratuito** e a cópia na VPS saudável. Tudo do prompt mestre se aplica, mais as missões A, B e C abaixo.

## Decisões do dono (valem até ele dizer o contrário)

- Só Pindamonhangaba; só o Observatório Social do Brasil – Pindamonhangaba e a Câmara Municipal.
- **Custo zero:** nenhum serviço pago, cartão ou domínio comprado. Sem IA paga.
- Não é clone do site da Câmara: mostra ementa, metadados e contexto, e linka o documento oficial.
- Sem votações e sem presença nesta versão.
- **Neutralidade:** nada de ranking, nota, selo, semáforo, "melhor/pior", "produtivo", cor de partido. Ordem alfabética.
- **Proveniência:** todo número leva à lista que o compõe; toda informação tem fonte, URL e data de coleta.
- **Nunca inventar dado.** Lacuna aparece como lacuna.
- **Nunca contornar a proteção anti-robô da Câmara** (sem trocar User-Agent, sem resolver captcha, sem proxy). User-Agent honesto, ≥ 1 s entre requisições. Apareceu "Bot Verification": parar e avisar.
- Commits em inglês (Conventional Commits), sem assinatura de IA; interface e documentação em português.

## O que o código mostra (verificar de novo)

- Next.js + React + Zod, TypeScript; Vitest (17 arquivos em `tests/`) e Playwright + axe (4 specs em `e2e/`). npm. `engines.node = 24.x`.
- 18 páginas e 3 rotas (`/api/busca`, `/api/health`, `/llms.txt`), além de `robots`, `sitemap`, `manifest`, imagem social. Sem banco, sem CMS, sem login.
- O coletor (`scripts/collect.ts`) roda no `prebuild`, **dentro do build de produção da Vercel**, onde vive o token da Câmara. O dataset fica em `data/generated`.
- Endereço canônico em `src/lib/site.ts` (`SITE.url`).
- Cópia na VPS: imagem construída no GitHub Actions a partir do espelho dos dados abertos (`npm run espelhar`), `ESPELHO=1`, com `noindex`. Workflow `deploy-vps.yml`.
- `atualizar-dados.yml` roda **de hora em hora** e, quando a coleta está velha, dispara build na Vercel por deploy hook ou por commit em `.github/atualizacao-agendada`.
- Existe `public/sw.js` e uma rota `/offline`.

## Divergências já flagradas (a documentação mente; ache as outras)

1. `CLAUDE.md` diz "0.3.0 em produção"; `package.json` e `HANDOFF.md` dizem 0.5.0. **Qual SHA e qual versão estão de fato no ar?**
2. `CLAUDE.md` descreve os ADRs como "PWA sem service worker"; há service worker em produção (ADR 0004). Há usuários com o SW antigo? O atual se atualiza sozinho?
3. O projeto proíbe comparação valorativa, mas existe a rota `/comparar`. Audite com lupa: ordem, cores, destaque, rótulos e gráficos induzem ranking?
4. **Não há lint nem formatador** (nenhum script `lint`, nenhum ESLint/Prettier/Biome nas dependências), embora as regras proíbam `any` e `catch` vazio. Quem garante?
5. A CSP usa `script-src 'unsafe-inline'`. A justificativa (páginas estáticas) precisa ser provada ou substituída por hashes.
6. `atualizar-dados.yml` tem o endereço do site fixo no `env` e permissão `contents: write`; o histórico do `main` recebe commits automáticos. `SITE.url` não é a única fonte do endereço como a documentação afirma: **busque o host em todo o repositório e nos workflows**.
7. `.claude/settings.json` libera `Bash` irrestrito e o MCP da Vercel inteiro (com negação só para compra de domínio).
8. Os últimos commits trocam e destrocam o nome do host da VPS (`zewithane` ↔ `zehonorato`). Descubra qual nome resolve hoje e se algum workflow aponta para o errado.
9. Cinco "ciclos" de auditoria em `docs/auditoria/` declaram coisas resolvidas. Reabra cada achado antigo e prove.

## Zonas de perigo

- **Cada build de produção na Vercel consulta a Câmara.** Não empurre commits em série para o `main`. Trabalhe em ramo, com `npm run collect` sem token (usa `fixtures/`), e junte as mudanças em poucas publicações. Descubra se builds de *preview* também coletam e, se sim, evite-os ou desligue a coleta neles.
- Não rode testes de carga, rastreadores ou scanners contra a Câmara nem contra a produção da Vercel além do tráfego de um visitante.
- Dataset é dado real: o teste "número = lista" precisa passar sobre o dataset de produção, não só sobre a amostra.
- Mudança de origem (domínio novo) desinstala na prática o PWA de quem instalou e zera o cache do service worker: planeje.

## Missão A — Verdade dos dados (o coração do produto)

1. Recalcule de forma independente (script à parte, sem reutilizar `src/lib/data`) todos os totais da capa e uma amostra de 30 vereador × tipo × período; compare com o site.
2. Confira 30 proposições sorteadas contra o documento oficial da Câmara, **à mão, no navegador, devagar**: autor, coautoria, tipo, número, data, ementa, link.
3. Coautoria, mesa diretora, suplentes, licenças, vereador que trocou de nome parlamentar ou partido: como aparecem? Algo induz leitura errada?
4. O que o site mostra quando a coleta falha, vem parcial, ou a API devolve 200 vazio? Force cada caso com fixtures.
5. Idade do dado visível em toda página? O vigia (`vigia-dados.yml`) realmente abre issue? Prove disparando em modo de teste.
6. Vocabulário de bairros e temas: classificações são rotuladas como classificação (derivado), nunca como fato?
7. Dados abertos (`/dados`): esquema documentado, CSV válido (aspas, acentos, separador), licença declarada.

## Missão B — Blindagem legal específica

- **Pessoas públicas:** só dados ligados ao mandato. Foto dos vereadores: de quem é o direito, de onde vem, pode republicar? Se a dúvida persistir, linkar em vez de copiar.
- **Cidadãos comuns** em honrarias, moções e requerimentos (nomes, endereços, doenças, falecimentos): varra o dataset inteiro com expressões regulares para CPF, telefone, e-mail, endereço e termos sensíveis nas ementas. O que aparecer é P0/P1.
- **Erro sobre uma pessoa pública é risco de dano moral:** página de correções, canal de contestação que **não** exija conta no GitHub, prazo declarado, registro público das correções.
- **Período eleitoral e apartidarismo:** nenhum elemento que possa ser lido como propaganda a favor ou contra. Avise o dono do que precisa de cuidado redobrado em ano de eleição.
- **Termos e privacidade × realidade:** o que Vercel e VPS registram (IP, logs), cookies, armazenamento local, service worker, fontes, requisições a terceiros. O texto bate com o tráfego observado?
- **Identidade institucional:** nome, marca, CNPJ, endereço e e-mail do Observatório publicados com autorização? `[DECLARADO]` até o dono confirmar.
- **Uso da fonte:** termos de uso do site e da API da Câmara, `robots.txt` dela, natureza do "token de cidadão". O uso é compatível? Documente.
- Licença do código, das fontes, dos ícones e do conteúdo; atribuição à Câmara como fonte.

## Missão C — Endereço definitivo gratuito 🔑

Não compre nada (a compra de domínio está negada nas permissões; mantenha). **Verifique a disponibilidade e as regras de cada opção na data**, e entregue ao dono uma tabela com no máximo três opções e uma recomendação:

| Critério | Peso |
|---|---|
| R$ 0 para sempre, sem cartão | eliminatório |
| Risco de perder o endereço (renovação, moderação, serviço encerrar) | alto |
| Credibilidade para um portal cívico apartidário | alto |
| Legível falado em voz alta e em cartaz | médio |
| Controle de DNS e HTTPS automático | médio |
| Tempo até ficar no ar | baixo |

Candidatas a investigar (não confie nesta lista: confirme):

1. **Subdomínio institucional do Observatório** (por exemplo sob o domínio que o OSB já usa). Custo zero para o projeto, a maior credibilidade; depende de um pedido do dono ao OSB e de um registro DNS (CNAME). Redija o pedido pronto para ele enviar.
2. **Subdomínio `*.vercel.app` mais curto e claro**, mantendo o antigo com redirecionamento 301. Imediato, sem risco de renovação; credibilidade média.
3. **Registro gratuito de longa data sem fins lucrativos** (tipo `eu.org`): aprovação lenta, aparência estrangeira.
4. Subdomínios gratuitos de serviços recentes ou com histórico de abuso: provavelmente **descartar**, e dizer por quê (bloqueio por filtros, sumiço do serviço).
5. Domínio `.br` (`.org.br`, `.app.br`): **pago**. Só mencionar o valor anual como alternativa caso o Observatório queira bancar; fora do escopo de custo zero.

Decida também, com o dono, **para onde o endereço aponta**: Vercel (onde a coleta acontece) ou VPS (que hoje é espelho sem indexação). Traga os prós e contras medidos (latência, disponibilidade, limites do free tier, dependência do build da Vercel para coletar, a Câmara recusa alguns datacenters — prove com `source-probe`).

Depois do "sim" do dono, a troca é uma operação só, ensaiada:

1. `SITE.url` e **todo** lugar onde o host aparece (workflows, espelho, vigia, documentação, User-Agent do coletor, `llms.txt`).
2. 301 do endereço antigo, página por página; canonical, sitemap, robots, Open Graph, JSON-LD.
3. `manifest` (`id`, `scope`, `start_url`) e service worker: origem nova = instalação nova. Página no endereço antigo avisando quem instalou.
4. HSTS e cookies revisados para o novo sufixo.
5. Espelho da VPS continua `noindex` e fora do sitemap, ou vira o canônico — nunca os dois indexáveis.
6. Monitores, Search Console (propriedade nova e sitemap; 🔑 dono), links nas redes do Observatório (🔑 dono).
7. Uma semana depois: conferir indexação e 404 do endereço antigo.

## VPS

Plataforma `vps-platform`, site `vereador`, comando `site` (ver ficha `vps-platform.md`). Regras do servidor: porta SSH 22322 intocável; nada de `docker system prune -a`; `df -h` antes de baixar imagem; nunca mexer em contêiner de outro site. Prove: imagem do SHA auditado no ar, dados idênticos aos da Vercel (compare o manifesto), `X-Robots-Tag` conforme a decisão da Missão C, saúde, rollback ensaiado.

## Momentos do dono 🔑

1. Escolher o endereço (Missão C) e, se for institucional, enviar o pedido ao Observatório.
2. Confirmar autorização de uso de marca, CNPJ e endereço do Observatório.
3. Search Console e atualização dos links nas redes.
4. Aceite final navegando no celular.

## Pronto quando

Gates do prompt mestre + Missão A sem divergência + lista legal entregue + endereço novo no ar com 301 do antigo + espelho da VPS no mesmo SHA e mesmos dados + documentação reescrita (um único documento de estado) + tag `v1.0.0`.
