# Ficha do projeto — Quarau

> Cole **depois** do `PROMPT-MESTRE.md`. Pistas conferidas em 17/11/2026, commit `af945b9`.

## Missão

Site institucional de consultoria socioambiental, educativa e cultural, ainda em **homologação**. A auditoria decide se está pronto para ir a `quarau.com.br` e prepara a virada.

## Decisões do dono

- **Fatos só das fontes** (site antigo raspado, redes, seed revisado, respostas do dono). Faltou: marcar `[CONFIRMAR]` e **ocultar** o campo. Nunca inventar número, cliente, ano, cargo, endereço ou depoimento.
- **Todo texto visível vem do CMS.**
- **Domínio `quarau.com.br`, DNS e WordPress antigo: não tocar** até o dono dizer "aprovado". `noindex` fora da produção.
- Só `main`, sem PR (se o seu ambiente obrigar outro ramo, avise o dono em vez de escolher sozinho).
- O dono usa Windows, sem Docker; banco de desenvolvimento na nuvem.
- Segredos nunca na conversa nem impressos; nunca usar token ou chave colados em conversa antiga (**e a auditoria deve conferir se esses segredos antigos foram de fato revogados**).

## O que o código mostra (verificar)

- Monorepo pnpm 10 + Turborepo: `apps/web` (Next.js + Payload CMS 3), `packages/ui`, `packages/emails`, `packages/config`. Lighthouse CI, CodeQL, Renovate. `engines.node >= 22.12` no pacote e Node 24 no CI.
- Coleções em `apps/web/src/cms/collections/` (`Leads`, `Media`, `News`, `Pages`, `Partners`, `Projects`, `Services`, …).
- Workflows: `ci` (publica imagem no GHCR em push no `main`), `codeql`, `jobs`.
- `.claude/hooks/` com `handoff-guard.mjs` e `format.mjs`: código que roda sozinho no agente. Leia antes de confiar.

## Divergências já flagradas

1. O "mapa do código" do `CLAUDE.md` aponta `src/collections|globals|blocks`; o código real está em `src/cms/…`. O mapa está velho: quanto mais está?
2. O `CLAUDE.md` ainda fala em `[locale]` "que sai na S02" e em sessões S00–S14 de um plano. Em que sessão o projeto está **de verdade**? Reconstrua pelo código e pelo que está no ar, não pelo `PROGRESSO.md`.
3. Node mínimo declarado (22.12) × Node do CI (24) × Node da imagem: qual roda em produção?
4. Existe `apps/web/vercel.json` embora a Vercel "não seja mais usada". Observado em 18/11/2026: o projeto `quarau` ainda existe na Vercel e `quarau.vercel.app` responde 404 com `noindex` e `Disallow: /` (não indexável, mas vivo). Decidir: remover o projeto e o `vercel.json`, ou manter de propósito e documentar por quê.
5. "Sexta rodada de design" segundo o último commit de documentação: seis rodadas e ainda em homologação. Descubra o que emperra o aceite.

## Perguntas que a auditoria precisa responder com prova

1. **Cada fato do site tem fonte?** Para cada número, cliente, parceiro, projeto, ano, cargo, depoimento e foto: aponte o arquivo de origem em `content/`. Sem fonte: ocultar e listar para o dono. É a auditoria mais importante deste projeto.
2. **Parceiros e clientes:** uso de logotipo e nome autorizado? Projetos com comunidades, escolas ou crianças: imagens com autorização?
3. **`Leads`:** formulário de contato grava dado pessoal. Quem lê, onde fica, por quanto tempo, a API anônima lista leads? Spam? E-mail de aviso chega de verdade?
4. **Texto fixo:** a regra de lint `jsx-no-literals` e o `check:texts` pegam tudo? Procure texto em `alt`, `aria-label`, metadados, e-mails, páginas de erro e imagem social.
5. **Fila de tarefas:** "um processo só roda a fila por banco". O que garante isso? O que acontece se dois rodarem?
6. **Virada para o domínio oficial:** inventário de URLs do WordPress antigo com tráfego e 301 para cada uma; e-mail do domínio (MX, SPF, DKIM, DMARC) intacto depois da troca de DNS; plano de volta. **Ensaiar sem tocar no DNS.**
7. **Renovate + deploy automático:** uma atualização de dependência pode chegar à produção sem olho humano?

## Ênfases por módulo

- **M1/M2 (máxima):** site de consultoria vive de credibilidade. Compare com três consultorias reais do setor. Seis rodadas de design pedem um diagnóstico franco: o problema é visual, de conteúdo, ou de falta de material real (fotos, casos, números)?
- **M8:** o dono, leigo, edita cada texto sozinho? Pré-visualização fiel? Consegue quebrar a página?
- **M7:** LGPD no formulário, direito de imagem, direitos autorais de fotos e textos de projetos, uso de marcas de clientes, termos e privacidade.
- **M9:** intenção de busca por serviço; redirecionamentos do site antigo; `noindex` na homologação **e** na Vercel esquecida.
- **M10:** provavelmente N/A.
- **M15:** o `CLAUDE.md` está inchado de estado volátil; reescrever curto e verdadeiro.

## VPS

Plataforma `vps-platform`, site `quarau`; publicar com `site deploy quarau <sha>` depois do CI verde. Regras do servidor na ficha `vps-platform.md`.

## Momentos do dono 🔑

1. Responder a lista de `[CONFIRMAR]` (fatos sem fonte).
2. Confirmar autorizações de logotipos e imagens.
3. Aceite ("aprovado") navegando no celular e no computador.
4. Só então: DNS, Search Console, destino do WordPress antigo.

## Pronto quando

Gates do prompt mestre + todo fato com fonte ou oculto + ensaio de virada completo + aceite do dono. A virada de DNS é uma etapa separada, depois do "aprovado".
