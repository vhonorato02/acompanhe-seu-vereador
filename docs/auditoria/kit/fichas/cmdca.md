# Ficha do projeto — CMDCA Pindamonhangaba

> Cole **depois** do `PROMPT-MESTRE.md`. Pistas conferidas em 17/11/2026, commit `ae40eb6`.

## Missão

Auditar e estabilizar o site do Conselho Municipal dos Direitos da Criança e do Adolescente. É órgão público que trata de **crianças e adolescentes**: o módulo legal (M7) e o CMS (M8) pesam mais do que em qualquer outro projeto.

## O que o código mostra (verificar)

- Next.js + Payload CMS 3 no mesmo app, Postgres, Lexical, Leaflet (mapa), nodemailer. pnpm 11, Node 24. `package.json` versão 2.5.0.
- Coleções: `Depoimentos`, `Destaques`, `Editais`, `Entidades`, `Faq`, `Media`, `Noticias`, `Paginas`, `RedeProtecao`, `Resoluções`, `Reunioes`, `Users`.
- Workflows: `quality`, `deploy` (todo push no `main` vai para produção na VPS depois da bateria), `e2e-producao`, `lighthouse`, `uptime`.
- `AGENTS.md` só contém o aviso gerado pelo Next ("leia os docs em `node_modules/next/dist/docs`"): **obedeça**, a versão instalada é mais nova que a sua memória.
- Scripts de carga de conteúdo (`seed`, `apply:confirmados`, `apply:content-pack`) rodam contra o banco.

## Observado em 18/11/2026 (modo leitura)

- Existe um projeto `cmdca` na Vercel, **pausado** (`DEPLOYMENT_PAUSED`). Descobrir se algum link, QR code, material impresso ou cadastro em órgão público ainda aponta para `cmdca.vercel.app`; se sim, redirecionar com 301 em vez de deixar 503. Se não, remover o projeto.

## Perguntas que a auditoria precisa responder com prova

1. **Todo push no `main` publica.** Os gates do `quality.yml` bloqueiam de verdade? Um E2E "em produção" escreve algo no banco real?
2. **Scripts de seed e de "content pack":** podem sobrescrever conteúdo editado pelo conselho? São idempotentes? Estão protegidos contra rodar em produção por engano?
3. **Migrações:** existem para todas as mudanças de coleção? Aplicam no deploy? O que o rollback faz com o banco?
4. **Conteúdo é verdadeiro?** `CONTEUDO.md` e os packs trazem textos, nomes, datas, endereços e telefones. De onde veio cada um? Marque o que não tem fonte; nada inventado pode ficar no ar em site de órgão público.
5. **Depoimentos:** de quem? Com autorização? De menor de idade? Sem prova de consentimento, ocultar.
6. **Imagens:** há criança ou adolescente identificável em qualquer mídia? Autorização dos responsáveis? Legendas com nome completo? Trate como P0 até provar.
7. **Rede de proteção e mapa:** endereços de abrigos ou serviços sigilosos não podem aparecer. Confira item por item com o conselho. O Leaflet carrega blocos de mapa de terceiro: privacidade, termos de uso e atribuição.
8. **Canal de denúncia:** o site orienta corretamente (Conselho Tutelar, Disque 100, emergência)? Há formulário? Se há, para onde vai, quem lê, é confidencial, fica registrado onde, por quanto tempo? Um formulário de denúncia mal feito é pior que nenhum.
9. **Publicidade de atos:** resoluções, editais, atas e reuniões têm data, número, documento original acessível (PDF com texto, não imagem) e histórico? Edital com prazo vencido aparece como vencido?
10. **Painel:** quem são os usuários reais, quais papéis, quem ainda devia ter acesso? Admin exposto na internet: força bruta, recuperação de senha, e-mail de saída funcionando.
11. **Transição de endereço:** o site está só no endereço provisório da VPS? Há domínio oficial previsto? Ambientes não oficiais com `noindex`.

## Ênfases por módulo

- **M3:** site público de conselho: WCAG 2.2 AA é obrigação. PDFs também.
- **M7:** ECA e Lei 15.211/2025, LGPD para dados de menores, Lei de Acesso à Informação, LBI, período eleitoral (órgão público não faz promoção pessoal de agente).
- **M8:** ciclo completo com um usuário de cada papel; editor leigo; tentar quebrar o site pelo painel.
- **M9:** busca local ("conselho tutelar pindamonhangaba", "CMDCA edital"): as páginas respondem à intenção?
- **M10:** provavelmente N/A; se houver manifest ou service worker, justificar ou remover.

## VPS

Plataforma `vps-platform`, site `cmdca`. Regras do servidor na ficha `vps-platform.md`. Backup do banco e da mídia restaurado como prova.

## Momentos do dono 🔑

1. Confirmar fonte e autorização de depoimentos, fotos e dados de entidades.
2. Lista de quem deve ter acesso ao painel.
3. Domínio oficial e data de virada.
4. Aceite no celular.

## Pronto quando

Gates do prompt mestre + todo conteúdo com fonte ou oculto + zero menor identificável sem autorização + ciclo editorial provado por papel + backup restaurado.
