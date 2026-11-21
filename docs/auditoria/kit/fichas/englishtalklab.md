# Ficha do projeto — English TalkLab (`englishtalklab` + `english-labtalk`)

> Cole **depois** do `PROMPT-MESTRE.md`. Pistas conferidas em 17/11/2026, commits `9aff8fe` (englishtalklab) e `083964a` (english-labtalk).

## Missão

É o maior e o mais arriscado: escola de inglês com **site, portal do aluno, operação escolar e cobrança**. Dois repositórios com nomes quase iguais. Antes de auditar, descubra **o que está no ar e de onde veio**.

## O que o código mostra (verificar)

**`englishtalklab`** (805 arquivos, ativo)
- Python 3.14, Django 6.1, Wagtail 8 (CMS), allauth com MFA e login social, tarefas em banco, Postgres, gunicorn, Sentry, web push. Front sem framework: Tailwind 4, htmx, Alpine (build CSP), pdf.js.
- Apps: `accounts`, `billing`, `cms`, `core`, `integrations`, `messaging`, `pedagogy`, `portal`, `school`.
- Operação própria em `ops/` (nginx, systemd, gunicorn, scripts, chaves públicas de deploy). **Não usa a `vps-platform`**: o deploy aponta para outro host (`talklab.vps.brz.dev.br`) e para `/srv/talklab`.
- O workflow de deploy diz que, **até a virada**, só roda à mão e que o público ainda vê o conjunto legado.

**`english-labtalk`** (91 arquivos, parado desde 05/10/2026)
- Página em Astro, publicada por GitHub Actions em `englishtalklab.com` via nginx, em `/opt/talklab/site/current`. Cita um portal em `app.englishtalklab.com` "mantido separadamente".
- Raiz cheia de relatórios (`QA_REPORT`, `CRITIQUE_FINAL`, `WORKLOG`, `OPEN_ITEMS`, `SECURITY-NOTES`): depoimentos, não fatos.

## Observado em 18/11/2026 (modo leitura)

- Existe um projeto `english-talklab` na Vercel **sem deployment** (`english-talklab.vercel.app` → `DEPLOYMENT_NOT_FOUND`). Sobra a remover, depois de conferir que nada aponta para ele.

## Primeira pergunta, antes de tudo

**O que responde hoje em `englishtalklab.com` e em `app.englishtalklab.com`?** Astro antigo, Wagtail novo, o sistema v1 (removido do repositório, guardado na tag `legacy-final`)? A virada aconteceu? Em qual servidor? Com quais dados? A resposta decide o plano:

- Se o novo **ainda não entrou**: a auditoria é de pré-lançamento, e inclui o **plano de migração dos dados reais** (alunos, pagamentos, histórico) com ensaio em cópia e conciliação registro a registro.
- Se **já entrou**: é auditoria de sistema em produção com dinheiro e dados de alunos; todo teste em ambiente separado.
- Em qualquer caso: decidir o destino do `english-labtalk` (arquivar com aviso, ou manter) e do servidor antigo.

## Decisões do dono (do `AGENTS.md`, valem como regra de processo)

- Um repositório, `main`; nunca commitar com teste ou lint quebrado; commits em inglês.
- Nada de conteúdo, preço, contato ou texto legal fixo no código: Wagtail ou `core.Setting`.
- Segredos fora do Git (`.secrets/` local, `/srv/talklab/shared/env` no servidor).
- Identificadores em inglês, interface em português.
- O projeto é tocado por outro agente (T3 Code): combine o ramo de trabalho para não atropelar.

## Perguntas que a auditoria precisa responder com prova

1. **Matriz de autorização** completa: visitante, responsável, aluno, professor, secretaria, financeiro, administrador × cada recurso × cada ação. Um aluno vê a cobrança de outro? Um professor vê dados financeiros? Teste por ID trocado em toda rota e em toda resposta htmx.
2. **Cobrança:** de onde vem o valor, quem pode alterar, arredondamento, vencimento, juros e multa, fuso, idempotência de webhook, conciliação com o provedor, o que acontece em pagamento duplicado, estorno, falha no meio. Recalcule uma amostra à mão. Emissão de nota fiscal: existe, é manual, é obrigação?
3. **Integrações** (`integrations`, `messaging`): quais provedores, sandbox disponível, assinatura de webhook verificada, o que é enviado a alunos (e-mail, push, WhatsApp) e **como impedir disparo real em teste**.
4. **Contas:** cadastro, verificação, recuperação, MFA, login social, enumeração de e-mail, força bruta, sessão, troca de e-mail, exclusão de conta.
5. **Tarefas em segundo plano:** o que roda, com que frequência, o que acontece se falhar ou rodar duas vezes.
6. **Migrações Django:** reversíveis, sem bloqueio longo, coerentes com os modelos (`makemigrations --check`).
7. **`manage.py check --deploy`**, CSP (o build "CSP" do Alpine é usado de verdade, sem `unsafe-eval`?), uploads (o que alunos e professores enviam, onde é servido, pdf.js com arquivo malicioso).
8. **CSS/JS compilados versionados no Git:** o `--check` do build garante que o artefato corresponde à fonte?
9. **Servidor próprio:** tudo do M12, mais: por que fora da `vps-platform`? Backup e restauração provados? Chaves de deploy em `ops/keys` são só públicas?
10. **Sentry:** dado pessoal nos eventos? Plano gratuito? Servidor fora do Brasil.

## Ênfases por módulo

- **M5/M6:** nível mais alto de toda a carteira. ASVS nível 2.
- **M7:** contrato de prestação de serviço educacional e CDC (preço, cancelamento, arrependimento em contratação online, reajuste), LGPD com **alunos menores** (consentimento do responsável, Lei 15.211/2025), gravações de aula, material didático de terceiros (direitos autorais), marketing por e-mail/WhatsApp (opt-in e descadastro), retenção de dados fiscais × pedido de exclusão.
- **M8 (Wagtail):** papéis, fluxo de publicação, pré-visualização, rich text, imagens, o que o dono consegue editar sozinho.
- **M10:** há web push e, portanto, service worker: PWA do portal faz sentido? iOS exige instalação para push: testar ou declarar bloqueado.
- **M14:** pytest com xdist e factory-boy: cobertura por ramo de `billing` e de permissões; mutação nos cálculos de cobrança.
- **M9/M2:** site de venda de curso: proposta, prova, preço, chamada para ação; comparar com três escolas reais.

## Momentos do dono 🔑

1. Dizer (ou autorizar a descobrir no servidor) o que está no ar e se a virada aconteceu.
2. Acesso de leitura ao servidor e ao painel do provedor de pagamento em modo sandbox.
3. Aprovar o plano e a janela de migração de dados.
4. Revisão humana de contrato, política e termos.
5. Destino do repositório antigo e do servidor antigo.

## Pronto quando

Gates do prompt mestre + matriz de autorização 100% testada + cobrança conciliada em amostra + migração de dados ensaiada e conferida + restauração provada + um repositório canônico, o outro arquivado com aviso.
