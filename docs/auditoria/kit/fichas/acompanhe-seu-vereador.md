# Ficha do projeto — Acompanhe seu Vereador (URGENTE, 1º da fila)

> Cole **depois** do `PROMPT-MESTRE.md`. Pistas conferidas no código em 17/11/2026 (commit `2c4ecaf`) e fatos observados de fora em 18/11/2026 (seção "Observado"). Se o código ou a produção de hoje disserem outra coisa, eles ganham.

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

## Observado em 18/11/2026 (modo leitura, por quem escreveu esta ficha)

Fatos com data, não garantias. Reconfirme.

| Fato | Como foi visto | Consequência para a auditoria |
|---|---|---|
| Produção da Vercel = commit `ac4e518` (o `main` do momento, um commit automático de dados) | API da Vercel, lista de deployments | ok naquele instante; o SHA muda duas vezes por dia sozinho |
| `/api/health` devolve só `ok`, `coletadoEm` e o total de proposições: **nem SHA nem versão** | `curl` na produção | de fora, ninguém prova qual código está no ar. Achado P2: expor SHA e versão (sem segredo) na saúde e no rodapé técnico |
| **`camara-a-vista.vercel.app` continua servindo o site inteiro** (canonical aponta para o endereço principal) | API da Vercel + `curl` | sobra de um renome que um agente fez sem pedir (ciclo 2). Está "pendente com o dono" desde 07/11. Remover no painel leva 1 minuto; além disso o nome sugere ser da Câmara (risco de parecer oficial) |
| `CAMARA_API_TOKEN` existe **só** no ambiente de produção | API da Vercel (só nomes, sem valor) | correto |
| Build de **preview** usa a amostra de `fixtures/` (52 proposições, 0 requisições à Câmara) e previews exigem login da Vercel | log do build do preview `607c61a` | empurrar ramos é seguro para a Câmara. O que coleta é o build de **produção**: merge no `main` e o gatilho horário |
| PR do Dependabot aberto: `next` 16.4.3 → 16.4.5; o GitHub aponta **2 vulnerabilidades moderadas** no `main` | lista de deployments; aviso do GitHub no push | ler os alertas, confirmar se o PR os resolve e por que não entrou; dependência vulnerável em produção é achado |
| **O CI (`quality`) está vermelho para qualquer push ou PR desde 18/11:** `npm audit --audit-level=high` falha no lockfile do próprio `main`. Causas: `next` ≤ 16.4.4 (2 moderadas, resolvidas a partir de 16.4.5) e `picomatch` (ReDoS, alta, **todas as versões publicadas**, sem correção upstream; vem pela cadeia de testes `vitest`/`vite`) | log do job `quality` do PR #2; `npm audit` local sobre o `main` | gate que fica vermelho por motivo alheio ensina todo mundo a ignorá-lo. Decidir com evidência: atualizar o `next`; para o `picomatch`, provar se chega ao código de produção (`npm audit --omit=dev`, `npm ls picomatch`) e, se for só ferramenta de teste, registrar exceção **com data de expiração e dono**, nunca afrouxar o gate em silêncio. Confirmar também se o deploy na VPS depende desse gate |
| Avisos no build: `npm warn install-scripts … esbuild` (scripts de instalação não aprovados) e `Unknown env config "cache-dir"` | log do build | investigar se o `esbuild` precisa do `postinstall` e registrar a decisão; política de scripts de instalação é cadeia de suprimentos (M6.6) |
| `zehonorato.vps.brz.dev.br` **não resolve**; `vereador.zewithane.vps.brz.dev.br` resolve, mas a conexão HTTPS foi derrubada a partir da rede deste ambiente | DNS e `curl` | `[BLOQUEADO]` daqui: conferir o espelho de outra rede antes de concluir que está fora do ar |
| Projeto `osb-pinda-camara-1s2026` na mesma conta da Vercel responde 200 em `osb-pinda-camara-1s2026.vercel.app` com a palavra "placeholder" e nada mais | API da Vercel + `curl` | sobra com o nome do OSB e da Câmara, indexável. Perguntar ao dono e remover (P3) |
| Domínios do Observatório: `osbrasil.org.br` (rede nacional, atrás de CDN) e `pindamonhangaba.sistemaosb.com.br` (plataforma do OSB) existem; não existe domínio próprio do OSB Pindamonhangaba | DNS | ver Missão C |

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

- **Cada build de produção na Vercel consulta a Câmara** (merge no `main`, deploy hook, commit em `.github/atualizacao-agendada`). Não empurre commits em série para o `main`: trabalhe em ramo (previews usam a amostra e não consultam a Câmara — reconfirme no log) e junte as mudanças em poucas publicações.
- Uma amostra de 52 proposições num preview **parece** um site real. Garanta que a amostra é sinalizada na própria interface e que nenhum preview fica público sem login.
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

Regra de nome: **nada que pareça oficial da Câmara** (sem "camara" no endereço). O portal é do Observatório e apartidário; o endereço não pode sugerir outra coisa. Uso da marca "OSB" no endereço só com autorização.

Pesquisa feita em 18/11/2026 (reconfirme: disponibilidade muda):

| Opção | Custo | Prazo | Risco de perder | Credibilidade | Situação observada |
|---|---|---|---|---|---|
| **A. Subdomínio do Observatório** sob `osbrasil.org.br` (rede nacional) ou sob a plataforma `sistemaosb.com.br` | R$ 0 | dias a semanas (depende do OSB nacional criar um CNAME) | baixo enquanto a parceria existir; o DNS é deles | **máxima** | os dois domínios existem; não há subdomínio para o portal |
| **B. Manter `acompanhe-seu-vereador.vercel.app`** (ou um `*.vercel.app` mais curto com a cidade, por exemplo `vereadores-pinda`) | R$ 0 | imediato | baixo; preso à conta e ao plano gratuito da Vercel | média | nomes curtos testados estavam livres |
| C. `eu.org` | R$ 0 | **imprevisível** (há relatos de pedidos parados por anos) | médio | baixa (aparência estrangeira) | descartar para algo urgente |
| D. Serviços de subdomínio grátis recentes (`is-a.dev` e afins) | R$ 0 | rápido | **alto** (regras de uso pessoal, serviço pode sumir, listas de bloqueio) | baixa | descartar |
| E. `.org.br` em nome do OSB Pindamonhangaba (CNPJ dele) | ~R$ 40/ano (fontes secundárias; conferir em registro.br) | 1 dia | baixo se a renovação for automática | **máxima** e independente | `acompanheseuvereador.org.br`, `vereadorespinda.org.br`, `osbpinda.org.br` e `observatoriosocialpinda.org.br` retornaram 404 no RDAP do Registro.br, ou seja, não estavam registrados. **Fora do custo zero**: só se o Observatório quiser bancar |

**Recomendação para o dono:** ficar em **B agora** (remover `camara-a-vista`; renomear o `*.vercel.app` rende pouco e custa a migração do PWA e do SEO) e pedir **A** ao Observatório já, com a mensagem pronta (o agente redige). Se o OSB nacional demorar, **E** é a saída definitiva por R$ 40/ano, decisão do Observatório, não do projeto. Trocar de `*.vercel.app` para outro `*.vercel.app` só faz sentido se o nome atual for um problema real; diga qual.

**Risco do plano gratuito da Vercel:** os termos restringem o plano Hobby a uso pessoal ou não comercial, e a política de uso justo fala em "não comercial pessoal". Um portal operado para uma associação é zona cinzenta. Vai para `07-legal-para-revisao-humana.md`, com duas saídas: confirmar com a Vercel (ou um programa de apoio a código aberto/sem fins lucrativos, se existir na data) ou tornar a VPS o canônico.

Decida também, com o dono, **para onde o endereço aponta**: Vercel (onde a coleta acontece hoje) ou VPS (hoje espelho sem indexação). Traga os prós e contras medidos: latência a partir do Brasil (a Vercel builda e serve de Washington, `iad1`), disponibilidade, limites e termos do plano gratuito, dependência do build da Vercel para coletar, e se a Câmara aceita requisições da VPS (prove com `source-probe` executado de lá; o GitHub Actions alcança a API `/jsonweb/`, então coletar no Actions e publicar na VPS é uma arquitetura possível, sem Vercel).

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

0. **Já, 1 minuto, independe da auditoria:** Vercel → projeto `acompanhe-seu-vereador` → Settings → Domains → `camara-a-vista.vercel.app` → ⋯ → Remove.
1. Escolher o endereço (Missão C) e, se for institucional, enviar o pedido ao Observatório.
2. Confirmar autorização de uso de marca, CNPJ e endereço do Observatório.
3. Search Console e atualização dos links nas redes.
4. Aceite final navegando no celular.

## Pronto quando

Gates do prompt mestre + Missão A sem divergência + lista legal entregue + endereço novo no ar com 301 do antigo + espelho da VPS no mesmo SHA e mesmos dados + documentação reescrita (um único documento de estado) + tag `v1.0.0`.
